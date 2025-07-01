import { Injectable } from '@angular/core';

import { CallApiService } from '../../shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class SsoLoginService {

  constructor(private _CallApiService:CallApiService) { }
  private ssoLoginUlr:string = constants.single_signOn_url;
  sso_login(userData: any){
    return this._CallApiService.post_enc(userData,this.ssoLoginUlr);
  }  

  private employeeSSOLogin_url:string = constants.employeeSSOLogin_url;
  employeeSSOLogin(userData :any){
    return this._CallApiService.post_enc(userData,this.employeeSSOLogin_url);
  }
}
