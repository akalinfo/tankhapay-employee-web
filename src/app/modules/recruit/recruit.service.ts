import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';


@Injectable({
  providedIn: 'root'
})
export class RecruitService {

  private templateList_url: string = constants.templateList_url;
  private templateFieldName_url: string = constants.templateFieldName_url;
  private templateField_url: string = constants.templateField_url;
  private templateType_url: string = constants.templateType_url;
  private templateActions_url: string = constants.templateActions_url;

  private candidateList_url: string = constants.candidateList_url;
  private candidateActions_url: string = constants.candidateActions_url;
  private saveEmailJson_url: string = constants.saveEmailJson_url;
  private offerLetterActions_url: string = constants.offerLetterActions_url;

  private GetMasterList_url=constants.GetMasterList_url
  private mapTPCode_url=constants.mapTPCode_url
  private letterTEmplateById_url=constants.letterTEmplateById_url

  


  constructor(
    private _CallApiService: CallApiService
  ) { }

  getAlltemplateList(obj:any){
    return this._CallApiService.post_enc(obj, this.templateList_url)
  }

  getAllTemplateFieldName(obj:any){
    return this._CallApiService.post_enc(obj, this.templateFieldName_url)
  }

  getAllTemplateFields(obj:any){
    return this._CallApiService.post_enc(obj, this.templateField_url)
  }

  getAllTemplateTypes(obj:any){
    return this._CallApiService.post_enc(obj, this.templateType_url)
  }

  submitTemplateAction(obj:any){
    return this._CallApiService.post_enc(obj, this.templateActions_url)
  }

  // 
  getAllCandidateList(obj:any){
    return this._CallApiService.post_enc(obj, this.candidateList_url)
  }

  submitCandidateAction(obj:any){
    return this._CallApiService.post_enc(obj, this.candidateActions_url)
  }

  saveEmailJson(obj:any){
    return this._CallApiService.post_enc(obj, this.saveEmailJson_url)
  }


  // 
  callOfferLetterAction(obj:any){
    return this._CallApiService.post_enc(obj, this.offerLetterActions_url)
  }

  getMasterList(id:any){
    return this._CallApiService.post_enc(id,this.GetMasterList_url);
   }

   mapTPCode(data:any){
    return this._CallApiService.post_enc(data,this.mapTPCode_url);
   }
   
   letterTEmplateById(data:any){
    return this._CallApiService.post_enc(data,this.letterTEmplateById_url);
   }


   private SaveDepartment_url = constants.SaveDepartment_url;
   SaveDepartment(data:any){
    return this._CallApiService.post_enc(data,this.SaveDepartment_url);
   }

}
