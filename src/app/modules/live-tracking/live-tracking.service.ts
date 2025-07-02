import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class LiveTrackingService {

  constructor(private _EncrypterService: EncrypterService,
    private _CallApiService: CallApiService) {
     }
  private GetEmployeeEventLiveTrackingDetails_url: string = constants.GetEmployeeEventLiveTrackingDetails_url;

  GetEmpEventLiveTrackingDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetEmployeeEventLiveTrackingDetails_url);
  }
}
