import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class GeneralSettingService {
  

   private GetBreakDetails_url=constants.GetBreakDetails_url
   private CreateGeneralSettings_url=constants.CreateGeneralSettings_url
   private GetRoles_url=constants.getRoles_url
   private GetShiftDetails_Url: string = constants.GetShiftDetail_url;
   constructor(private _CallApiService: CallApiService) { }   
  getGeneralSettings(id:any){
    return this._CallApiService.post_enc(id,this.GetShiftDetails_Url);
   }
 

   saveGeneralSetting(obj:any){
    return this._CallApiService.post_enc(obj,this.CreateGeneralSettings_url)
   }
   getAllRoles(obj:any){
    return this._CallApiService.post_enc(obj,this.GetRoles_url)
   }
 
}