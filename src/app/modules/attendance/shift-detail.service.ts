import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShiftDetailService {


  private GetShiftDetails_Url: string = constants.GetShiftDetail_url;
  private CreateNewShift_url: string = constants.CreateNewShift_url;
  private GetMasterList_url: string = constants.GetMasterList_url;
  private UpdateShiftStatus_url: string = constants.UpdateShiftStatus_url;

  constructor(private _CallApiService: CallApiService
  ) { }

  getShiftDetails(body:any){
    return this._CallApiService.post_enc(body,this.GetShiftDetails_Url);
   }
 
   saveShiftDetails(obj:any){
    return this._CallApiService.post_enc(obj,this.CreateNewShift_url)
   }

   getDepartmentList(obj:any):Observable<any> {
    return this._CallApiService.post_enc(obj,this.GetMasterList_url)
   } 

   isFromTimeLessThanToTime(fromTime: string, toTime: string): string {
    const fromParts = fromTime.split(':').map(part => parseInt(part, 10));
    const toParts = toTime.split(':').map(part => parseInt(part, 10));
  
    // Compare hours
    if (fromParts[0] < toParts[0]) {
      return '';
    }
    // If hours are equal, compare minutes
    if (fromParts[0] === toParts[0] && fromParts[1] < toParts[1]) {
      return '';
    }
    // Otherwise, fromTime is not less than toTime
    return 'From time should be less than to time';
  }


  deleteShiftDetails(obj:any){
    return this._CallApiService.post_enc(obj,this.UpdateShiftStatus_url)
  }
  

  
}