import { Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CryptoService } from '../services/crypto.services';
import { ServiceKeys } from '../services/serviceKey';
import { ServiceBody } from '../services/serviceBody.services';
import { LiveTrackingResponseBlock, ServiceMethod } from '../services/serviceMethod';
import { DataService } from '../data.service';
import { GetEmployeeDetail, liveTrackingEmployee } from 'src/app/shared/modal/livetrackingInterface';
import {  getEmpListURL, GetEmployeeEventLiveTrackingDetails_url } from 'src/app/shared/helpers/constants';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { GoogleMapsLoaderService } from '../services/googleMapsLoaderService';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-list-employees',
  templateUrl: './list-employees.component.html',
  styleUrls: ['./list-employees.component.css']
})
export class ListEmployeesComponent {
 
  constructor(private router: Router,
    private cryptoService: CryptoService, 
    private serviceBody: ServiceBody, 
    private serviceConstant: ServiceKeys, 
    private serviceMethod: ServiceMethod,
    private toastr: ToastrService, 
    private dataService: DataService, 
    private _sessionService: SessionService,
    private mapsLoader: GoogleMapsLoaderService
  ) {}

 @ViewChild('modalContainer') modalContainer: ElementRef;
  employeeListForTable: liveTrackingEmployee[] = [];
  getEmployeeDataTable: GetEmployeeDetail[] = [];
  searchText: string = ''; 
  isLoading: boolean = false;
  selectedDate: Date = new Date();
  showModal: boolean = false;
  liveTrackingData: any[] = [];
  checkInOutDetails: any[] = [];
  completeListEmployeeData: liveTrackingEmployee[] = [];
  decoded_token:any;
  encoded_token:any;
  ticket_id:any;
  tp_account_id: any;
  selectedEmployee?: liveTrackingEmployee
  showSidebar: boolean = true;
  mapReady = false;
  intervalId: any;
  
  ngOnInit(){
    this.mapsLoader.load().then(() => {
      this.mapReady = true;
      this.loadGoogleMaps();
      }).catch(err => {
        //console.error('Google Maps failed to load:', err);
    });
    
  }

   ngOnDestroy() {

    try
    {
      if(this.intervalId) 
      {
        clearInterval(this.intervalId);
        //console.log('List employee interval cleared.');
      }
    }catch(ex)
    {
    }
  }
   
  loadGoogleMaps(){
        let session_obj = this._sessionService.get_user_session();
        let token = JSON.parse(session_obj).token;
        this.encoded_token = token;
        this.decoded_token = jwtDecode(token);
        //console.log("custaccid",this.decoded_token);
        this.tp_account_id = this.decoded_token.tp_account_id.toString();
        //console.log("token is ::",this.encoded_token);
       // console.log("custaccid is ::",this.tp_account_id);
        this.isLoading = true;
        this.getEmployeeLiveTrackingEnable()
      try
      {
          this.intervalId = setInterval(() => 
          {
            this.isLoading = true;                      
            this.getEmployeeLiveTrackingEnable();
          }, 5 * 60 * 1000);
      }
      catch(ex)
      {

      }
  }
  get pickedDate(): string {
    return formatDate(this.selectedDate, 'dd/MM/yyyy', 'en-GB');  //23/04/2025
  }
  get pickedDateForLiveTrackingData(): string {
    return formatDate(this.selectedDate, 'yyyy/MM/dd', 'en-GB');  
  }

  getEmployeeLiveTrackingEnable() {
    this.isLoading = true; 
    const encryptedData = this.serviceBody.getEmpLiveTrackingBody(this.serviceConstant.productTypeId,this.tp_account_id,this.serviceConstant.actionTypeForEmpLiveTrackingEnable,'',this.pickedDate,'',''); //'23/04/2025' //2025/05/08 //this.pickedDate
    const callbacks: LiveTrackingResponseBlock<any> ={
      successBlock: (response: any) =>{
        this.isLoading = false;
        //console.log('API response:', response);
        const datatype=response.commonData
        const decryptedData = this.cryptoService.getDecryptedData(datatype);
        
        if(decryptedData.length>0)
        {
          const objList = JSON.parse(decryptedData) as any[]; // Assuming decryptedData is a JSON string
          //console.log("Decrypted data",objList);

          const filteredData=[];
        if(objList.length >0){
          this.completeListEmployeeData = objList;
          for (let item of objList) {

            //if (item.live_tracking_opted === "Y") {
              filteredData.push(item);
              this.checkInOutDetails = item.event_details;

              //console.log("eventDetails::",this.checkInOutDetails) ;
              //console.log("filtereddatais",filteredData)
            //}
          }
         // console.log("filtereddataisss",filteredData)
          this.listOfEmployeesDataUI(filteredData); //List of emplyees in table
          this.getEmployeeLiveTrackingData();
        } else{
        }    
        }
      },
      failureBlock: (err: any) => {
        this.isLoading = false;
        //console.error('Failed to fetch Employee Data', err);
        this.toastr.info(err.message);  //27-06-2025
      }
    };
    this.serviceMethod.postDataServiceRequest(encryptedData,GetEmployeeEventLiveTrackingDetails_url,this.encoded_token,callbacks);
  //console.log("listURL", GetEmployeeEventLiveTrackingDetails_url);
  }

  getEmployeeLiveTrackingData() {
    this.isLoading = true;
    const encryptedData = this.serviceBody.getEmpLatLngListBody(this.tp_account_id,'',this.pickedDateForLiveTrackingData); //
    //console.log("encrypted::",encryptedData);
    //console.log("ListEmployeeCustomerAccountid", this.tp_account_id);
    // Define the callbacks for success and failure
    const callbacks: LiveTrackingResponseBlock<any> = {
      successBlock: (response: any) => {
        this.isLoading = false;   //07-05-2025
        const datatype=response.commonData
        const decryptedData = this.cryptoService.getDecryptedData(datatype);
        
          if(decryptedData.length > 0){
           // console.log('TimeLine API response:', decryptedData);
            this.liveTrackingData = JSON.parse(decryptedData) as any[];; 
          this.mergeBatteryStatus();
            if(this.liveTrackingData.length > 0){
              this.getEmployeeDataForTable(this.liveTrackingData);
              
            }  else {
             // console.error('No data found');
              this.toastr.info('Data not found for this employee');
              
            }
          }
      },
      failureBlock: (err: any) => {
        this.isLoading = false;
          // 📢 Show toaster message
          this.toastr.info('Data not found '); //27-06-2025
         // console.error('Failed to fetch employee', err);
      }
    };

    // Call the API with the request body and service URL
  this.serviceMethod.postDataServiceRequest(encryptedData,getEmpListURL,this.encoded_token,callbacks);
  }

  listOfEmployeesDataUI(objList: any[]) {
    this.employeeListForTable = objList.map((item: any) => {
      const processedEvents = (item.event_details || []).map((event: any) => ({
        ...event,
        check_in_time: this.formatTime(event.check_in_time),
        check_out_time: this.formatTime(event.check_out_time),
      }));

      return {
        emp_name: item.emp_name,
        mobile:item.mobile,
        emp_code:item.emp_code,
        customeraccountid:item.customerAccountId,
        orgempcode:item.orgempcode,
        emp_checkIn:processedEvents.at(-1)?.check_in_time || '',
        emp_checkOut:processedEvents.at(-1)?.check_out_time || '',
        emp_status:item.status,
        emp_batteryStatus:item.emp_batteryStatus,
        emp_gpsStatus:item.emp_gpsStatus,
        emp_checkInLocation:item.check_in_location,
        emp_checkOutLocation:item.check_out_location,
        event_details: processedEvents
      }
      });
      //console.log("employeetable",this.employeeListForTable); 
  }

  // Method to filter employees based on the search text
  filteredEmployeeList() {
  //console.log('Search text:', this.searchText); // Check input
  //console.log("Full list before filter:",this.employeeListForTable); 
  if (!this.searchText) {
    //console.log('No search text, returning full list:', this.employeeListForTable);
    return this.employeeListForTable;
  }
  const lowerSearch = this.searchText.toLowerCase();
  const filtered = this.employeeListForTable.filter(employee =>
    employee.emp_name.toLowerCase().includes(lowerSearch)
  );
 // console.log('Filtered result:', filtered); // Check filtered result
  return filtered;
  }
  onLocationBtnClick(empData: any) {
    const empCompleteDetails= this.completeListEmployeeData;
    const customerAccountidForTimeline = this.tp_account_id;
    this.isLoading = true;
    this.router.navigate(['/live/time-line']);
    this.dataService.setData({
      eventData: empData,
      customeraccountid: customerAccountidForTimeline,
      completeEmployeeData: empCompleteDetails,
      actionType: 'listEmployee'
    });
    //console.log('Data going to timeline  from listemployee  →',empData , 'custaccid',customerAccountidForTimeline);
  }

  mergeBatteryStatus() {
      // for each live record, find matching employee and update batteryStatus/deviceType
      for (const live of this.liveTrackingData) {
        const emp = this.employeeListForTable.find(e => e.emp_code === live.empcode);
        if (emp) {
          emp.emp_batteryStatus = live.batterypercentage;     // coming from second API
          emp.emp_gpsStatus     = live.locationstatus;         
        }
        //console.log("employeedata is ::", live.batterypercentage)
      }
  }

  getEmployeeDataForTable(objList: any[]) {
      this.getEmployeeDataTable = objList.map((item: any) => ({
        customerAccountId: item.customeraccountid,
        empCode: item.empcode,
        latitude: item.latitude,
        longitude: item.longitude,
        locationStatus: item.locationstatus,
        batteryPercentage: item.batterypercentage,
        deviceType: item.devicetype,
        eventid:item.eventid,    //26-05-2025
        dateTime: item.datetime
        }));
       // console.log("employeetable",this.getEmployeeDataTable); 
       // console.log("lastdevice for 6581", this.getEmployeeDataTable[this.getEmployeeDataTable.length - 1].batteryPercentage);
  }

  viewTracking(employee: liveTrackingEmployee) {
    this.selectedEmployee = employee;
    // Delay scroll until DOM updates
    setTimeout(() => {
      if (this.modalContainer && this.modalContainer.nativeElement) {
        this.modalContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });  //behavior: 'auto' 
      }
    }, 0);

    this.showModal = true;
  }
    
  closeModal() {
    this.showModal = false;
  }

  
    // Utility function to extract HH:mm from datetime string
  formatTime(datetime: string): string {
    if (!datetime) return '';
    const timePart = datetime.split(' ')[1];
    return timePart ? timePart.slice(0, 5) : '';
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  // onReportBtnClick() {
  //   this.router.navigate(['/live/livetracking-report']);
    
  //   //console.log("Navigate to report")
  // }
}
