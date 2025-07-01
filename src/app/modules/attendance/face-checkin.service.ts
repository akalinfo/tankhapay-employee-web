import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class FaceCheckinService {

  constructor(
    private _CallApiService: CallApiService
  ) { }


  private getemployeelistFace_url: string = constants.getemployeelistFace_url;
  private getemployeelistHubFace_url: string = constants.getemployeelistHubFace_url;
  

  private registerFace_url: string = constants.registerFace_url;
  private markAttendance_url: string = constants.markAttendance_url;
  

  getemployeeList(userData: any) {
    return this._CallApiService.post_enc(userData, this.getemployeelistFace_url);
  }

  getemployeeHubList(userData: any) {
    return this._CallApiService.post_enc(userData, this.getemployeelistHubFace_url);
  }

  registerFace(userData: any) {
    return this._CallApiService.post_enc(userData, this.registerFace_url);
  }

  markAttendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.markAttendance_url);
  }


}
