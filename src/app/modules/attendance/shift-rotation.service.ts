import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class ShiftRotationService {


   private GetMasterShift_url=constants.GetMasterShift_url
   private CreateShiftRotation_url=constants.CreateShiftRotation_url
   constructor(private _CallApiService: CallApiService) { }

   getShiftRotationDetails(id:any){
    return this._CallApiService.post_enc(id,this.GetMasterShift_url);
   }

 

   saveShiftRotationDetails(obj:any){
    return this._CallApiService.post_enc(obj,this.CreateShiftRotation_url)
   }
 
}