import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })

export class ServiceURL{


    kLiveTrackingContentType="application/json";


    kBaseURL="https://tpaywfmstagapi.azurewebsites.net";
    
    
    kgetEmpLiveTrackingMethod="/api/TpLiveTrackingApi/GetEmployeeEventLiveTrackingDetails";

   
   
    kgetEmpLiveTrackingURL= this.kBaseURL+ this.kgetEmpLiveTrackingMethod;
    kgetEmpLatLngListURL = "https://crmemployer.azurewebsites.net/api/livetrack/get_live_tracking_data_mobile";


}


