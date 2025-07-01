import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../../../shared/helpers/constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralSettingService {

   private GeneralSettingTabData_url=constants.GeneralSettingTabData_url;
   private GetMasterList_url=constants.GetMasterList_url;
   private createUpdateGeneralSetting_url=constants.createUpdateGeneralSetting_url;
   private feedbackCategeory_url=constants.feedbackCategeory_url;

   constructor(private _CallApiService: CallApiService) { }

  getTabData(obj:any){
    return this._CallApiService.post_enc(obj,this.GeneralSettingTabData_url);
   }

   createUpdateConfigData(obj:any){
    return this._CallApiService.post_enc(obj,this.createUpdateGeneralSetting_url);
   }
 
   getDepartmentList(obj:any):Observable<any> {
    return this._CallApiService.post_enc(obj,this.GetMasterList_url)
   } 
 
   ///////////////////////////////////////// Kra /////////////////////////////

   saveKraSettings(obj:any){
    return this._CallApiService.post_enc(obj,this.createUpdateGeneralSetting_url)
   }

   getKraSettings(obj:any){
    return this._CallApiService.post_enc(obj,this.GeneralSettingTabData_url)
   }

   saveFeedbackCategeory(obj:any){
    return this._CallApiService.post_enc(obj,this.feedbackCategeory_url)
   }


}