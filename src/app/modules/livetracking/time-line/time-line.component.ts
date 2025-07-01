import { Component, ElementRef, HostListener, Injectable, ViewChild } from '@angular/core';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { CryptoService } from '../services/crypto.services';
import { ServiceBody } from '../services/serviceBody.services';
import { LiveTrackingResponseBlock, ServiceMethod } from '../services/serviceMethod';
import { DataService } from '../data.service';
import { GetEmployeeDetail, liveTrackingEmployee } from 'src/app/shared/modal/livetrackingInterface';
import { getEmpListURL, GetEmployeeEventLiveTrackingDetails_url } from 'src/app/shared/helpers/constants';
import { SessionService } from 'src/app/shared/services/session.service';
import { ServiceKeys } from '../services/serviceKey';
import { Router } from '@angular/router';
import { GoogleMap } from '@angular/google-maps';



@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-time-line',
  templateUrl: './time-line.component.html',
  styleUrls: ['./time-line.component.css']
})


export class TimeLineComponent {
 
  constructor(
    private router: Router,
    private cryptoService: CryptoService, 
    private serviceBody: ServiceBody, 
    private serviceMethod: ServiceMethod,
    private toastr: ToastrService, 
    private dataService: DataService,
    private _sessionService: SessionService,
    private serviceConstant: ServiceKeys
  ){

  }  
  
  @ViewChild('dateInput') dateInput!: ElementRef;
  @ViewChild('modalContainer') modalContainer: ElementRef;
  @ViewChild('dropdown') dropdownRef!: ElementRef;
  @ViewChild('modalMap', { static: false })
  modalMap!: GoogleMap;
  // NEW: map state
  zoom = 17;
  center: google.maps.LatLngLiteral = { lat: 20.5937, lng: 78.9629 }; 
  markers: { position: google.maps.LatLngLiteral,icon: any }[] = [];
  polylines: any[] = [];
  isLoading: boolean = false;
  getEmployeeData: GetEmployeeDetail[] = [];
  totalTravelledDistance: number = 0;
  liveTrackingEmpDetail!: liveTrackingEmployee;
  listEmployeeDetail!: liveTrackingEmployee;
  selectedDate: string;
  customerAccountId:string = '';
  encoded_token:any;
  dropdownVisible: boolean = false;
  selectedDropdownValue: string = '';
  selectedEmpCode = '';
  //dropdownOptions: liveTrackingEmployee[] = [];
  dropdownOptions: any = [];
  selectedEmpName: string = '';
  eventDetails: any[] = [];
 // eventDetails: any = {};
  hasCheckedOut: any;
  isInteractingInsideDropdown = false;

  filteredLocations : any[] = [];
  matchingEventRecords: any[] = [];
  showSidebar: boolean = true;
  intervalId: any;
  finalTimelineDataUI: any[] = [];
  showModal: boolean = false;
  groupedByEventId: { [eventId: string]: GetEmployeeDetail[] } = {};
  selectedEventId:    string | null = null;
  selectedLocations:  GetEmployeeDetail[] = [];
  selectedSummary: any;
  modalMarkers: { position: google.maps.LatLngLiteral }[] = [];
  modalPolylines: any[] = [];
  modalCenter!: google.maps.LatLngLiteral;
  activeTab = 'addressreport'; // default tab


  //for testing ---start (17-05-2025)
  //    locationList = [
  //   {
  //     batteryPercentage: "50",
  //     customerAccountId: "981",
  //     dateTime: "2025-05-16T07:52:51.065Z",
  //     deviceType: "Android",
  //     empCode: "6471",
  //     latitude: "00.00000",
  //     longitude: "00.00000",
  //     locationStatus: "off"
  //   },
  //   {
  //     batteryPercentage: "60",
  //     customerAccountId: "981",
  //     dateTime: "2025-05-16T07:52:51.065Z",
  //     deviceType: "Android",
  //     empCode: "6471",
  //     latitude: "28.5680625",
  //     longitude: "77.1922841", 
  //     locationStatus: "on"
  //   },
  //     {
  //     batteryPercentage: "40",
  //     customerAccountId: "981",
  //     dateTime: "2025-05-16T07:52:51.065Z",
  //     deviceType: "Android",
  //     empCode: "6471",
  //     latitude: "00.0000",
  //     longitude: "00.0000", 
  //     locationStatus: "off"
  //   },
  //    {
  //     batteryPercentage: "40",
  //     customerAccountId: "981",
  //     dateTime: "2025-05-16T07:52:51.065Z",
  //     deviceType: "Android",
  //     empCode: "6471",
  //     latitude: "28.659924",  
  //     longitude: "77.188126", 
  //     locationStatus: "on"
  //   },
  //   {
  //     batteryPercentage: "60",
  //     customerAccountId: "981",
  //     dateTime: "2025-05-16T07:52:51.065Z",
  //     deviceType: "Android",
  //     empCode: "6471",
  //     latitude: "28.734652855968704",  
  //     longitude: "77.25186260287036", 
  //     locationStatus: "on"
  //   },
  // ];
  //for testing ----end (17-05-2025)


    

 ngOnInit() {
   try{
   const today = new Date();
   // Format as yyyy-MM-dd
   this.selectedDate = today.toISOString().split('T')[0];
   let session_obj = this._sessionService.get_user_session();
   let token = JSON.parse(session_obj).token;
   this.encoded_token = token;
   this.isLoading = true;
   const state = this.dataService.getData();
    if (state && state.actionType) {
      //console.log("Navigation Source: ", state.actionType); 
     
      if (state && state.actionType === 'liveTracking') {
        this.liveTrackingEmpDetail = state.eventData;
        this.dropdownOptions = state.completeEmpData;
        this.customerAccountId = state.customeraccountid;
        this.selectedEmpName = this.liveTrackingEmpDetail.emp_name;
        this.eventDetails = this.liveTrackingEmpDetail.event_details;
        this.selectedDropdownValue = this.liveTrackingEmpDetail.emp_name;
        this.selectedEmpCode=this.liveTrackingEmpDetail.emp_code;

        // console.log("Completeemployee List from livetracking", this.dropdownOptions);
        // console.log("received the timelinecustomerid from livetracking",this.customerAccountId);
        // console.log('received data on timeline from liveTracking →', this.liveTrackingEmpDetail);
        // console.log('recieved empcode from livetracking::',this.liveTrackingEmpDetail.emp_code);
        
        this.getEmployeeLiveTrackingData(this.liveTrackingEmpDetail.emp_code);

      } else if (state.actionType === 'listEmployee') {
        this.listEmployeeDetail = state.eventData;
      this.dropdownOptions = state.completeEmployeeData;
       //this.dropdownOptions = this.locationList;
        this.customerAccountId = state.customeraccountid;
        this.selectedEmpName = this.listEmployeeDetail.emp_name;
        this.eventDetails = this.listEmployeeDetail.event_details;
        this.selectedDropdownValue = this.listEmployeeDetail.emp_name;
        this.selectedEmpCode = this.listEmployeeDetail.emp_code;
        
     
        // console.log("SelecytedEmpcodefromListEmployee",this.selectedEmpCode);
        // console.log("Completeemployee List", this.dropdownOptions);
        // console.log("Dropdownempcode",this.dropdownOptions[0]['emp_code']);
        // console.log("Name is ::", this.selectedEmpName);
        // console.log("EventDetails::", this.eventDetails);
        // console.log('received data on timeline from listEmployee →', this.listEmployeeDetail);
        // console.log('recieved empcode from listemployee::',this.listEmployeeDetail.emp_code);
        // console.log('received timeline customeracccountid::',this.customerAccountId)
        
        this.getEmployeeLiveTrackingData(this.listEmployeeDetail.emp_code);

      }
    } else
      {
        //console.warn('No navigation state found.');
      }
    if (state?.eventData) 
    {
      this.liveTrackingEmpDetail = state.eventData;
      this.customerAccountId = state.customeraccountid;
    }
    this.intervalId = setInterval(() => 
      {
        this.isLoading = true;                      
      
        this.getEmployeeLiveTrackingEnable();
      },  5 * 60 * 1000);  //30-06-2025
   }catch(e){
   console.error("Error occurred in ngOnInit:", e);
   } finally{
    this.isLoading = false;
   }
  }

  //Stop interval when navigating away
  ngOnDestroy() {
   try{
     if (this.intervalId) {
      clearInterval(this.intervalId);
      //console.log('Live tracking timeline interval cleared.');
    }
   }
   catch(e){
   // console.log("Error to stop timer",e);
   }
  }

  get pickedDate(): string {
     if (!this.selectedDate) {
    return formatDate(new Date(), 'yyyy/MM/dd', 'en-GB'); 
    }
    return formatDate(this.selectedDate, 'yyyy/MM/dd', 'en-GB');
  }

  get pickedDateForListEmployee(): string {
      if (!this.selectedDate) {
    return formatDate(new Date(), 'yyyy/MM/dd', 'en-GB'); 
    }
   return formatDate(this.selectedDate, 'dd/MM/yyyy', 'en-GB');  //23/04/2025
  }
  openDatePicker() {
    this.dateInput.nativeElement.showPicker(); // opens the native date picker
  }
   onDateChange(newVal: string) {
    this.selectedDate = newVal;
   // console.log('picked date after date formatting →', this.pickedDate);
  }
  //getLocation API ------start(08-05-2025)
  getEmployeeLiveTrackingData(selectedEmpCode: string) {

    this.isLoading = true;

    const encryptedData = this.serviceBody.getEmpLatLngListBody(this.customerAccountId,selectedEmpCode,this.pickedDate); //'2025/05/13', this.pickedDate
   
    //console.log("encrypted::",encryptedData);
    // Define the callbacks for success and failure
    const callbacks: LiveTrackingResponseBlock<any> = {
      successBlock: (response: any) => {
        this.isLoading = false;

        const datatype=response.commonData
        const decryptedData = this.cryptoService.getDecryptedData(datatype);
        //console.log('API response:', response);

        if(decryptedData.length >0){
          const objList = JSON.parse(decryptedData) as any[]; // Assuming decryptedData is a JSON string
          //console.log("Decrypted data for getemployeeAPI",objList);
           
          if(objList.length > 0){
            this.groupedByEventId = {};  //30-06-2025
            this.processEventWiseData(this.eventDetails, objList);
            this.filteredLocations = objList.filter((location:GetEmployeeDetail)=>{
            return Number(location.latitude) !== 0 && Number(location.longitude) !== 0 
            });
           // console.log("Filtered locations:",this.filteredLocations);
            this.filteredLocations.forEach((location: GetEmployeeDetail) => {
            const eventId = location.eventid; 
            if (!this.groupedByEventId[eventId]) {
              this.groupedByEventId[eventId] = [];
            }
            this.groupedByEventId[eventId].push(location);  //filterout lat,lng on the basis of eventid
           // console.log("Data with eventid",this.groupedByEventId);
            });
            //console.log("Filtered locations:",this.filteredLocations);
            //this.getEmployeeDataForTable(objList);  //23-05-2025
            this.markers = this.filteredLocations.map((location:GetEmployeeDetail,index: number) => {
              const isLast = index === this.filteredLocations.length - 1;
              const lastEvent = this.eventDetails?.[this.eventDetails.length -1];  //26-06-2025
              this.hasCheckedOut = !!lastEvent?.check_in_time && !!lastEvent?.check_out_time;
              //this.hasCheckedOut = this.eventDetails[this.eventDetails.length -1].check_in_time !== null && this.eventDetails[this.eventDetails.length -1].check_out_time !== ''; //26-06-2025
              let icon: google.maps.Icon | undefined;
              //console.log("CheckOutData",this.hasCheckedOut);
              if (isLast && !this.hasCheckedOut) {
                icon = {
                  url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                  scaledSize: new google.maps.Size(40, 40),
                };
              }
             return  {
                position: {
                  lat: Number(location.latitude),
                  lng: Number(location.longitude),
                },
               icon: icon,
              }
            });
           // console.log("Markers →", this.markers);
      
            // Set the first marker at center
            if (this.markers.length > 0) {
              this.center = this.markers[0].position;
             
            }
            const polylinePath = this.markers.map(marker => marker.position);
            const newPolylines = [];
            if (this.hasCheckedOut) {  //26-06-2025
              this.polylines = [{
                path: polylinePath,
                strokeColor: '#FF0000',   // all red
                strokeOpacity: 1.0,
                strokeWeight: 4,
              }];
            } else{
            // Red polyline for all except the last segment
              const redPath = polylinePath.slice(0, -1);
              const greenPath = polylinePath.slice(-2); // last two points
              
              if (redPath.length > 1 ) {
                newPolylines.push({
                  path: redPath,
                  strokeColor: '#FF0000', // Red
                  strokeOpacity: 1.0,
                  strokeWeight: 4,
                });
              }

              // Green line for last segment
              if (greenPath.length === 2 ) {
                newPolylines.push({
                  path: greenPath,
                  strokeColor:  this.hasCheckedOut ? '#FF0000' : '#00FF00', // Green
                  strokeOpacity: 1.0,
                  strokeWeight: 4,
                });
              }
              this.polylines = newPolylines;
             // console.log("Polylines →", this.polylines);
           }
           
          }  else {
           // console.error('No data found');
            //this.toastr.error('Data not found for this employee'); //26-06-2025
            this.markers =[];
            this.polylines = [];
            this.getEmployeeData = [];      //26-06-2025
            this.finalTimelineDataUI = [];  //26-06-2025
          }
          //this.toastr.success('Success', response.message);
        }
      },
      failureBlock: (err: any) => {
        this.isLoading = false;
    
       // console.error('Failed to fetch Employee Data for timeline', err);
         // 🧹 Clear map and table
          this.markers = [];
          this.polylines = [];
          this.getEmployeeData = [];
          this.finalTimelineDataUI = [];     //28-05-2025 

          // 📢 Show toaster message
          this.toastr.info('Data not found for selected date'); //27-06-2025

      }
    };
    // Call the API with the request body and service URL
    this.serviceMethod.postDataServiceRequest(encryptedData,getEmpListURL,this.encoded_token,callbacks);

  }
    //getLocation API ------end(08-05-2025)
    //getDataForTable -----------------start(23-05-2025)
    // getEmployeeDataForTable(objList: any[]) {
  
    //   this.getEmployeeData = objList.map((item: any) => ({
    //     customerAccountId: item.customeraccountid,
    //     empCode: item.empcode,
    //     latitude: item.latitude,
    //     longitude: item.longitude,
    //     locationStatus: item.locationstatus,
    //     batteryPercentage: item.batterypercentage,
    //     deviceType: item.devicetype,
    //     dateTime: item.datetime
    //     }));
      
    //     console.log("employeetable",this.getEmployeeData); 
    //     console.log("lastdevice", this.getEmployeeData[this.getEmployeeData.length - 1].deviceType);
    //     this.totalTravelledDistance = this.calculateTotalDistance();
    // }
    //getDataForTable -----------------end(23-05-2025)
    //ListEmployee API ----start (15-05-2025)
  getEmployeeLiveTrackingEnable(){
      this.isLoading = true; 
      const encryptedData = this.serviceBody.getEmpLiveTrackingBody(this.serviceConstant.productTypeId,this.customerAccountId,this.serviceConstant.actionTypeForEmpLiveTrackingEnable,'',this.pickedDateForListEmployee,'',''); //'23/04/2025' //2025/05/08 //this.pickedDate
      const callbacks: LiveTrackingResponseBlock<any> ={
        successBlock: (response: any) =>{
          this.isLoading = false;
          //console.log('API response:', response);
          const datatype=response.commonData
          const decryptedData = this.cryptoService.getDecryptedData(datatype);
          if(decryptedData.length>0)
          {
            const objList = JSON.parse(decryptedData) as any[]; 
            //console.log("Decrypted data",objList);
            if(objList.length >0){
              const _selectedEmpCode = this.selectedEmpCode;
              const matchedEmployee = objList.find(emp =>( emp.emp_code === _selectedEmpCode ));
              if (matchedEmployee) {
                  //console.log("Matched Employee:", matchedEmployee);
                  this.eventDetails = matchedEmployee.event_details;
                  this.selectedEmpName = matchedEmployee.emp_name
                  //this.isLoading = true;
                  this.getEmployeeLiveTrackingData(matchedEmployee.emp_code);  
              }
              else {
              //console.warn("Selected employee not found in API response.");
              }
            } else{
              //console.warn("objList is empty");
            }    
          }
        },
        failureBlock: (err: any) => {
          this.isLoading = false;
          //console.error('Failed to fetch Employee Data', err);
          this.toastr.info(err.message); //27-06-2026
        }
      };
      this.serviceMethod.postDataServiceRequest(encryptedData,GetEmployeeEventLiveTrackingDetails_url,this.encoded_token,callbacks);
      //console.log("listURL", GetEmployeeEventLiveTrackingDetails_url);
     
   }
    //ListEmployee API ----end (15-05-2025)

  processEventWiseData(checkInArray: any[], locationAray: any[]) {
    try{

      const eventIdMap = new Map<string, any[]>();

      // Step 1: Group all location records by eventid
      for (let record of locationAray) {
        const eventid = record.eventid;
        if (!eventIdMap.has(eventid)) {
          eventIdMap.set(eventid, []);
        }
        eventIdMap.get(eventid)!.push(record);
      }

      this.finalTimelineDataUI = [];
             
      for (let i = 0; i < checkInArray?.length; i++) {   //26-06-2025
        const checkInItem = checkInArray[i];
        const eventId = checkInItem.event_id;
        const matchingRecords = eventIdMap.get(eventId);
        // If eventId is "0", process all eventid === "0" records directly
        const zeroEventRecords = locationAray.filter(r => r.eventid === "0") ;
    
        if (matchingRecords && matchingRecords.length > 0) {
          const batteryStatus: string[] = [];
          const gpsStatus: string[] = [];
          const deviceInformation: string[] = [];
          let totalDistance = 0;
          //console.log("Matching records:", matchingRecords);
          const finalData = matchingRecords.filter((location:GetEmployeeDetail)=>{
            return Number(location.latitude) !== 0 && Number(location.longitude) !== 0 
            });
            //console.log("Matching final records:", finalData);
          for (let j = 1; j < finalData.length; j++) {
            const prev = finalData[j - 1];
            const curr = finalData[j];

            const sourcelat = parseFloat(prev.latitude);
            const sourcelng = parseFloat(prev.longitude);
            const destinationlat = parseFloat(curr.latitude);
            const destinationlng = parseFloat(curr.longitude);

            // console.log("show the first latitude::",sourcelat);
            // console.log("show the first longitude::",sourcelng);
            // console.log("show the second latitude::",destinationlat);
            // console.log("show the second longitude::",destinationlng);

            totalDistance += this.getDistanceFromLatLonInKm(sourcelat, sourcelng, destinationlat, destinationlng);
            //console.log("show total Distance",totalDistance);
          }

          // Collect battery and GPS status
          for (let loc of matchingRecords) {
            batteryStatus.push(loc.batterypercentage || 'NA');
            gpsStatus.push(loc.locationstatus || 'NA');
            deviceInformation.push(loc.devicetype || 'NA');
          }

          this.finalTimelineDataUI.push({
            checkin_time: checkInItem.check_in_time,
            checkout_time: checkInItem.check_out_time,
            checkin_location: checkInItem.check_in_location,
            checkout_location: checkInItem.check_out_location,
            total_distance: totalDistance.toFixed(2),
            battery_status: batteryStatus[batteryStatus.length - 1],
            gps_status: gpsStatus[0],
            event_id : eventId,
            device_Information: deviceInformation[deviceInformation.length - 1]
          });
        } else if(zeroEventRecords && zeroEventRecords.length >0){
          const batteryStatus: string[] = [];
          const gpsStatus: string[] = [];
          const deviceInformation: string[] = [];
          let totalDistance = 0;
          //console.log("Matching zero event records:", zeroEventRecords);
          const finalzeroEventData = zeroEventRecords.filter((location:GetEmployeeDetail)=>{
            return Number(location.latitude) !== 0 && Number(location.longitude) !== 0 
            });
          //console.log("Matching final records:", finalzeroEventData);
          for (let j = 1; j < finalzeroEventData.length; j++) {
            const prev = finalzeroEventData[j - 1];
            const curr = finalzeroEventData[j];

            const sourcelat = parseFloat(prev.latitude);
            const sourcelng = parseFloat(prev.longitude);
            const destinationlat = parseFloat(curr.latitude);
            const destinationlng = parseFloat(curr.longitude);

            totalDistance += this.getDistanceFromLatLonInKm(sourcelat, sourcelng, destinationlat, destinationlng);
           // console.log(" show Total Distance",totalDistance);
          }

          // Collect battery and GPS status
          for (let loc of zeroEventRecords) {
            batteryStatus.push(loc.batterypercentage || 'NA');
            gpsStatus.push(loc.locationstatus || 'NA');
            deviceInformation.push(loc.devicetype || 'NA');
          }

          this.finalTimelineDataUI.push({
            checkin_time: checkInItem.check_in_time,
            checkout_time: checkInItem.check_out_time,
            checkin_location: checkInItem.check_in_location,
            checkout_location: checkInItem.check_out_location,
            total_distance: totalDistance.toFixed(2),
            battery_status: batteryStatus[batteryStatus.length - 1],
            gps_status: gpsStatus[0],
            device_Information: deviceInformation[deviceInformation.length - 1]
          });
        }
      }

     // console.log("Final Combined Data →", this.finalTimelineDataUI);
      return this.finalTimelineDataUI;

    } catch(e){
      //console.error("Error in processEventWiseDistances:", e);
      return [];
    }
  }
 
 getDistanceFromLatLonInKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
  ): number 
  {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    //console.log("Total Distance in km",d);
    return d;
 }

 deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
 }
  

 //27-06-2025--start
  //  toggleDropdown() {
  //   this.dropdownVisible = !this.dropdownVisible; // Toggle dropdown visibility
  // }
  // selectDropdownOption(emp: liveTrackingEmployee,event?: MouseEvent) {
  //   if (event) event.stopPropagation();
  //   this.dropdownVisible = !this.dropdownVisible;
  //   this.selectedDropdownValue = emp.emp_name;
  //   this.selectedEmpCode=emp.emp_code;
  //    this.dropdownVisible = false;
  //   console.log("show the selected employee code::",this.selectedEmpCode, "show the selected employee::", this.selectedDropdownValue);
  // }
  //27-06-2025--end

  //27-06-2025 ----start
  onDropdownChange(event: Event) {
    const selectedName = (event.target as HTMLSelectElement).value;
    const selectedEmp = this.dropdownOptions.find(opt => opt.emp_name === selectedName);
    this.selectedEmpCode = selectedEmp?.emp_code || '';
    //console.log('Selected:', selectedName, 'Emp Code:', this.selectedEmpCode);
  }
  //27-06-2025 ----end
  onSearchBtnClick(){
    this.getEmployeeLiveTrackingEnable();
  }

// @HostListener('document:click', ['$event'])
//   handleClickOutside(event: MouseEvent) {
//     const clickedElement = event.target as HTMLElement;
//     const dropdownBtn = clickedElement.closest('.custom-dropdown-display');
//     if (!dropdownBtn ) {
//       this.dropdownVisible = false;
//     }
//   }



  formatTime(input: string): string {
    if (!input) return '';
    // Split on space: if it’s “18:12:48” you get [“18:12:48”], 
    // if it’s “23/04/2025 18:12:48” you get [“23/04/2025”, “18:12:48”]
    const part = input.split(' ')[1] || input.split(' ')[0];
    // Take only HH:mm
    return part.substring(0, 5);
  }

  onBackBtnClick() {
    const state = this.dataService.getData();
    if (state.actionType === 'listEmployee') {
      this.router.navigate(['/live/list-employees']);
    } else if (state.actionType === 'liveTracking') {
      this.router.navigate(['/live/live-tracking']);
    } else {
      this.router.navigate(['/']); // fallback to home
    }
  }
  toggleSideBar() {
    this.showSidebar = !this.showSidebar;
  }

  onViewLocationReport(eventId: string) {
    this.selectedEventId   = eventId;
    this.selectedLocations = this.groupedByEventId[eventId] || [];
    this.selectedSummary   = this.finalTimelineDataUI.find(r => r.event_id === eventId)!;
    //console.log(`Selected Locations for eventid ${this.selectedEventId}`,this.selectedLocations );
   // Delay scroll until UI updates
    setTimeout(() => {
      if (this.modalContainer && this.modalContainer.nativeElement) {
        this.modalContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); //behavior: 'auto' 
      }
    }, 0);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedEventId = null;
    this.selectedLocations = [];
    this.modalMarkers = [];
    this.modalPolylines = [];
    this.activeTab = 'addressreport';
  }

  formatTimeToIST(timeUtc: string): string {
    const d = new Date(timeUtc); 
    // toLocaleTimeString with en-GB gives 24-hour format
    return d.toLocaleTimeString('en-GB', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
  }
  viewMapsReport(){
  // build modalMarkers
    try{
     this.modalMarkers = this.selectedLocations.map(loc => 
      ({
          position: {
           lat: +loc.latitude,  //+ is a shorthand for converting string to a number
           lng: +loc.longitude
          }
      }));

      // center on the first point
      if (this.modalMarkers.length) {
          this.modalCenter = this.modalMarkers[0].position;
      }
      const path = this.modalMarkers.map(m => m.position);
      this.modalPolylines = [];
        if (path.length > 1) {
          this.modalPolylines.push({
            path,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 4
          });
       }
        this.activeTab = 'map';
    }catch(e){
      //console.log("Failure::",e);
    }
  }
}