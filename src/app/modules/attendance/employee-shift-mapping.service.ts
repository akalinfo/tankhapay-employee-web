import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class EmployeeShiftMappingService {


   private CreateEmployeeShift_url=constants.CreateEmployeeShift_url
   private GetMasterShift_url=constants.GetMasterShift_url
   constructor(private _CallApiService: CallApiService) { }


   getEmployeeShiftMapping(obj:any){
    return this._CallApiService.post_enc(obj,this.GetMasterShift_url) 

  }

  saveShiftMapping(obj:any){
    return this._CallApiService.post_enc(obj,this.CreateEmployeeShift_url) 

  }


}