import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { SessionService } from './session.service';
import decode from 'jwt-decode';


@Injectable({
  providedIn: 'root'
})
export class FlagCheckService {

  constructor(private _sessionService: SessionService,
    private router: Router) { };

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    let session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    let token:any = decode(session_obj_d.token);
    let flag = token.signup_flag

    if (flag == 'SP' || flag == 'KYC_PAN' || flag == 'KYC_AADHAR'
    || flag == 'KYC_GST' || flag == 'CD' || flag == 'RJ' || flag == 'Training') {
      return true;
    } else {
      localStorage.clear();
      this.router.navigate(['/login']);
      return false;
    }

  }
}
