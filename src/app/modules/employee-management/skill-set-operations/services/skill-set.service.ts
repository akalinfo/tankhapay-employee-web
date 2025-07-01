import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../../../shared/helpers/constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SkillSetService {

   private CreateUpdateSkillSet_url=constants.CreateUpdateSkillSet_url;
   private GetMasterList_url=constants.GetMasterList_url;
   private GetKraCatlogue_url=constants.GetKraCatlogue_url;
   private tagSkillSet_url=constants.tagSkillSet_url;
   private filePmsUpload_url=constants.filePmsUpload_url;

   constructor(private _CallApiService: CallApiService) { }

  getSkillSet(id:any){
    return this._CallApiService.post_enc(id,this.GetKraCatlogue_url);
   }
 
   createSkillSet(obj:any){
    return this._CallApiService.post_enc(obj,this.CreateUpdateSkillSet_url)
   }

   deleteSkillSet(obj:any){
    return this._CallApiService.post_enc(obj,this.CreateUpdateSkillSet_url)
   }

   getDepartmentList(obj:any):Observable<any> {
    return this._CallApiService.post_enc(obj,this.GetMasterList_url)
   } 

   tagSkillSet(obj:any){
    return this._CallApiService.post_enc(obj,this.tagSkillSet_url)
   }

   getSkillSetTag(obj:any){
    return this._CallApiService.post_enc(obj,this.GetKraCatlogue_url)
   }

   deleteTagSkillSet(obj:any){
    return this._CallApiService.post_enc(obj,this.tagSkillSet_url)
   }

   fileUpload(obj:any){
    return this._CallApiService.post_enc(obj, this.filePmsUpload_url)
  }


 


}