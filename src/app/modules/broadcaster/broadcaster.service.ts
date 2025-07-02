import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as constants from '../../shared/helpers/constants';
@Injectable({
  providedIn: 'root'
})
export class BroadcasterService {

  constructor(private _EncrypterService: EncrypterService,
    private _CallApiService: CallApiService) {
     }
    //  GetAudienceList_url
    private GetAudienceList_url:string = constants.GetAudienceList_url;
    private GetCampaignsDetails_url:string = constants.GetCampaignsDetails_url;
    private AddEditPushNotifications_url : string = constants.AddEditPushNotifications_url;
    private ChangeApprovalStatusForCampaign_url: string = constants.ChangeApprovalStatusForCampaign_url;
    private GetUniqueCampaignDetails_url: string = constants.GetUniqueCampaignDetails_url;
    private GetTargetAudience_url : string = constants.GetTargetAudience_url;
    private Tpnotify_url : string = constants.Tpnotify_url;

    GetCampaignsDetails(userData:any){
      return this._CallApiService.post_enc(userData, this.GetCampaignsDetails_url);
    }
    GetAudienceList(userData:any){
      return this._CallApiService.post_enc(userData, this.GetAudienceList_url);
    }

    GetFilteredAudienceList(userData: any) { // New method
      // Assuming GetAudienceList_url can handle optional filter parameters
      return this._CallApiService.post_enc(userData, this.GetAudienceList_url);
    }

    AddEditPushNotifications(userData:any){
      return this._CallApiService.post_enc(userData, this.AddEditPushNotifications_url);
    }
    ChangeApprovalStatusForCampaign(userData:any){
      return this._CallApiService.post_enc(userData, this.ChangeApprovalStatusForCampaign_url)
    }
    GetUniqueCampaignDetails(userData:any){
      return this._CallApiService.post_enc(userData, this.GetUniqueCampaignDetails_url)
    }
    GetTargetAudience(userData:any){
      return this._CallApiService.post_enc(userData, this.GetTargetAudience_url)
    }
    Send_Tpnotify(userData:any){
      return this._CallApiService.post_enc(userData, this.Tpnotify_url)
    }
}
