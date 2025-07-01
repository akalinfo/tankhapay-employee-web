import { Injectable } from "@angular/core";




@Injectable({
    providedIn: 'root'
  })

export class ServiceKeys{
  
    
    //customerAccountId : string = '981';
    productTypeId : string = '2';
    actionTypeForEmpLiveTrackingEnable : string = 'CustomerLiveTrackingEnabledEmployees';
    actionTypeForLiveTrackingData : string = 'EmployeeEventDetails';
    actionTypeForEmpLiveTrackingLatLng : string = 'EmployeeEventTrackingDetails';
   
  

}