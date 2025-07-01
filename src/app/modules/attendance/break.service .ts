import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class BreakService {


   private GetBreakDetails_url=constants.GetBreakDetails_url
   private CreateBreakDetails_url=constants.CreateBreakDetails_url
   constructor(private _CallApiService: CallApiService) { }

  getBreakDetails(id:any){
    return this._CallApiService.post_enc(id,this.GetBreakDetails_url);
   }
 

   saveBreakDetails(obj:any){
    return this._CallApiService.post_enc(obj,this.CreateBreakDetails_url)
   }

   calculateTotalTime(fromTime: string, toTime: string): string {
    const fromTimeParts = fromTime.split(':').map(part => parseInt(part, 10));
    const toTimeParts = toTime.split(':').map(part => parseInt(part, 10));

    const fromTotalMinutes = fromTimeParts[0] * 60 + fromTimeParts[1];
    const toTotalMinutes = toTimeParts[0] * 60 + toTimeParts[1];

    let totalTimeDifference = toTotalMinutes - fromTotalMinutes;

    if (totalTimeDifference < 0) {
      totalTimeDifference += 24 * 60;
    }

    const totalHours = Math.floor(totalTimeDifference / 60);
    const totalMinutes = totalTimeDifference % 60;

    return `${totalHours}:${totalMinutes.toString().padStart(2, '0')}`;
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
    return 'Start time should be less than end time';
  }
  



}