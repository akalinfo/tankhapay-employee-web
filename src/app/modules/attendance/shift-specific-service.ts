import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class ShiftSpecificService {

  constructor(private _CallApiService: CallApiService) { }

  private CreateShiftSpecificSettings_url: string = constants.CreateShiftSpecificSettings_url;
  private GetShiftSpecificSettings_url: string = constants.GetShiftSpecificSettings_url;
  private GetShiftDetails_Url: string = constants.GetShiftDetail_url;
  private Employer_details_url: string = constants.employer_details_url;


  getSpecificSettingsDetails(id:any){
    return this._CallApiService.post_enc(id,this.GetShiftSpecificSettings_url);
   }
 
   saveSpecificSettings(obj:any){
    return this._CallApiService.post_enc(obj,this.CreateShiftSpecificSettings_url)
   }

   getUserList(obj:any){
    return this._CallApiService.post_enc(obj,this.Employer_details_url)
   }


   getShiftDetails(body:any){
    return this._CallApiService.post_enc(body,this.GetShiftDetails_Url);
   }
 
 
}