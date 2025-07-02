import { formatDate } from '@angular/common';
import { Component, Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CryptoService } from '../services/crypto.services';
import { ServiceKeys } from '../services/serviceKey';
import { ServiceBody } from '../services/serviceBody.services';
import { LiveTrackingResponseBlock, ServiceMethod } from '../services/serviceMethod';
import { DataService } from '../data.service';
import { liveTrackingEmployee } from 'src/app/shared/modal/livetrackingInterface';
import { GetEmployeeEventLiveTrackingDetails_url } from 'src/app/shared/helpers/constants';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { GoogleMapsLoaderService } from '../services/googleMapsLoaderService';


@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-live-tracking',
  templateUrl: './live-tracking.component.html',
  styleUrls: ['./live-tracking.component.css']
})
export class LiveTrackingComponent  {

  constructor(
    private router: Router,
    private cryptoService: CryptoService, 
    private serviceBody: ServiceBody, 
    private serviceConstant: ServiceKeys, 
    private serviceMethod: ServiceMethod,
    private toastr: ToastrService,
    private dataService: DataService, 
    private _sessionService: SessionService,
    private mapsLoader: GoogleMapsLoaderService
  ) {  }

    // NEW: map state
    mapReady = false;
    zoom = 16;
    center: google.maps.LatLngLiteral = { lat: 28.5146880527728, lng: 77.18994260348937 }; 
    markers: { position: google.maps.LatLngLiteral, title: string, index: number,options:any,label:any }[] = [];
    isLoading: boolean = false;
    selectedDate: Date = new Date();
    pickedDate: string = formatDate(this.selectedDate, 'dd/MM/yyyy', 'en-GB') //23/04/2025
    allCount: number = 0;
    deactiveCount: number = 0;
    activeCount: number = 0;
    completeEmployeeData: liveTrackingEmployee[] = [];
    decoded_token:any;
    encoded_token:any;
    product_type: any = '';
    ticket_id:any;
    tp_account_id: any;
    showSidebar: boolean = true;
    intervalId: any;

    ngOnInit(){
      this.mapsLoader.load()
      .then(() => {
        this.mapReady = true;
        this.loadGoogleMaps();
      })
      .catch(err => {
       // console.error('Could not load Google Maps', err);
        this.toastr.error('Unable to load map.');
      });
         
    }
      // ✅ Stop interval when navigating away
  ngOnDestroy() {

    try
    {
      if(this.intervalId) 
      {
        clearInterval(this.intervalId);
        //console.log('Live tracking interval cleared.');
      }
    }catch(ex)
    {
    }
  }
  loadGoogleMaps()
  {
   let session_obj = this._sessionService.get_user_session();
   let token = JSON.parse(session_obj).token;
   this.encoded_token = token;
   this.decoded_token = jwtDecode(token);
   this.tp_account_id = this.decoded_token.tp_account_id.toString();
   //console.log("token is ::",this.encoded_token);
   //console.log("custaccid is ::",this.tp_account_id);
   this.isLoading = true;
   this.getEmployeeLiveTrackingEnable();
   try
    {
      this.intervalId = setInterval(() => 
      {
        this.isLoading = true;                      
        this.getEmployeeLiveTrackingEnable();
      },  2 * 60 * 1000);
    }
    catch(ex)
    {

    }
      
  }

  getEmployeeLiveTrackingEnable() {
    this.isLoading = true;
     // 🧹 Reset state before each fetch
    this.activeCount  = 0;
    this.deactiveCount= 0;
    this.markers      = []; 
    const encryptedData = this.serviceBody.getEmpLiveTrackingBody(this.serviceConstant.productTypeId,this.tp_account_id,this.serviceConstant.actionTypeForEmpLiveTrackingEnable,'',this.pickedDate,'',''); //'23/04/2025'//this.pickedDate
    //console.log("Recived customeraccountid from trackcomponent is::",this.tp_account_id);
    const callbacks: LiveTrackingResponseBlock<any> ={
      successBlock: (response: any) =>{
        this.isLoading = false;
        //console.log('API response:', response);
  
        const datatype=response.commonData
        const decryptedData = this.cryptoService.getDecryptedData(datatype);
        
        if(decryptedData.length>0)
        {
             const objList = JSON.parse(decryptedData) as any[]; // Assuming decryptedData is a JSON string
              //console.log("Decrypted Livetracking data",objList);
              this.allCount = objList.length;
              //console.log("All employee",this.allCount);
              if (objList.length > 0) {
                  this.completeEmployeeData = objList
                
                objList.forEach((obj,index) => {
                  const events = obj.event_details;
                  const hue = this.generateColorHue(index, objList.length);
                  if (Array.isArray(events) && events.length > 0) {
                    const lastEvent = events[events.length - 1];
                    const offset = 0.00001 * index; 
                      this.markers.push({
                      position: {
                        lat: Number(lastEvent.check_in_latitude) + offset,
                        lng: Number(lastEvent.check_in_longitude) +offset,
                      },
                      title: obj.emp_name,
                      index: index, 
                      options: 
                      {
                        icon: this.makePinIcon(hue)
                      },
                      label:{
                      text: obj.emp_name,
                      color: '#000',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      //className: 'custom-label-box'  
                      }
                      
                    });
                     this.activeCount++;
                    if (this.markers.length > 0) {
                      this.center = this.markers[0].position;
                    }
                    //console.log("Markers →", this.markers);
                    //console.log(`Last event for ${obj.emp_code}:`, lastEvent);
                  
                  } else {
                    
                    this.deactiveCount++;
                    //console.log("deactive employee",this.deactiveCount);
                   // console.warn(`No event_details found for ${obj.emp_code}`);
                   // this.toastr.error("Employee's Location not found for livetracking");
                  }
                    
                });
              } else{
                
                this.toastr.info("Employee's Location not found for livetracking");  //27-06-2025
              }
        }
      },
      failureBlock: (err: any) => {
        this.isLoading = false;
        //console.error('Failed to fetch Employee Data', err);
        this.toastr.info(err.message); //27-06-2025
 
      }
    };
    this.serviceMethod.postDataServiceRequest(encryptedData,GetEmployeeEventLiveTrackingDetails_url,this.encoded_token,callbacks);
   
  }

  onMarkerClick(empIdx: number) {
    const empData = this.completeEmployeeData[empIdx];
    const completeempList = this.completeEmployeeData;
    const customerAccountidForTimeline = this.tp_account_id;
    this.router.navigate(['/live/time-line'], );
  
      this.dataService.setData({
        eventData: empData,
        customeraccountid: customerAccountidForTimeline,
        completeEmpData: completeempList,
        actionType: 'liveTracking'
      });
    //console.log('Data going to timeline →',empData , 'custaccid',customerAccountidForTimeline);

  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
 
  generateColorHue(index: number, total: number): string {
    const hue = (index / total) * 360;
    return `hsl(${hue}, 75%, 50%)`;
  }

 makePinIcon(hue: string,): google.maps.Symbol {
  return {
    // Standard Google Maps pin path:
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
    fillColor: hue,
    fillOpacity: 1,
    strokeColor: '#333',
    strokeWeight: 1,
    scale: 2,  
    anchor: new google.maps.Point(12, 24), 
  };
 }
}
