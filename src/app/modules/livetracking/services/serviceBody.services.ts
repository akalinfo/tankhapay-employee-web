import { Injectable } from "@angular/core";
import { CryptoService } from "./crypto.services";

@Injectable({
    providedIn: 'root'
  })

export class ServiceBody{

    constructor( private cryptoService: CryptoService) {}


    getEmpLiveTrackingBody(
        productTypeId: string,
        customerAccountId: string,
        actionType: string,
        empCode:string,
        timelineDate: string,
        eventId: string, 
        orgUnitId: string) : Record<string, any> {
        const body = {
        productTypeId,
        customerAccountId,
        actionType,
        empCode,
        timelineDate,
        eventId,
        orgUnitId
        };
        console.log("Request::",body);
        return this.cryptoService.getEncrypted_MapBody(body);
    }
    getEmpAttListBody(
        fromDate: string,
        toDate: string,
        customerAccountId: string,
        productTypeId: string,
        flag: string,
        GeoFenceId: string,
        checkInOutMarkedType: string
      ): Record<string, any> {
        const body = {
          fromDate: fromDate,
          toDate: toDate,
          customerAccountId: customerAccountId,
          productTypeId: productTypeId,
          flag: flag,
          GeoFenceId: GeoFenceId,
          checkInOutMarkedType: checkInOutMarkedType
        };
      
        return this.cryptoService.getEncrypted_MapBody(body);
      }
//empcode optional because get the location data behalf of customeraccountid when user arrive from the employeelist
//empcode is mandatory when user arrive from the livetracking.
      getEmpLatLngListBody(
        customeraccountid: string,
        empcode: string,    
        date: string,
      ): Record<string, any> {
        const body = {
            customeraccountid: customeraccountid,
            empcode: empcode,
            date: date
        };
    
        return this.cryptoService.getEncrypted_MapBody(body);
      }
      
    

}

      
    

    
    
 
    