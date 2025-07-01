import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { MasterServiceService } from './master-service.service';
import decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService {

  constructor(private _sessionService: SessionService,
    private _masterService : MasterServiceService,
    private router: Router) { };

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
      
    let isLoggedIn = this._sessionService.check_user_session();
    let token;
    if(isLoggedIn){
    let session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    token = decode(session_obj_d.token);
    }
    let url :any='';
    const searchParams = new URLSearchParams(window.location.search);
    const session_id = searchParams.get('p1');
    if(session_id)
      url = window.location.pathname;
    else 
      url = state.url;
    
    let count=0;
    
    for (let i = 0; i < url.length; i++) {
      if (url[i] === '/') {
        count++;
      }

      if (count == 2) {
        url=url.substring(0,i);
        break;
      }
    }
  // return true;
    let isUrlAccessed = this._masterService.routeAccessRights(url);

    if(((state.url.startsWith('/dashboard') || (isUrlAccessed && isUrlAccessed.View)) && isLoggedIn) || token.isEmployer=='1'|| state.url.startsWith('/profile')){
        return true;
    } else {
      console.log("isUrlAccessed");
      localStorage.clear();
      this.router.navigate(['/login']);
      return false;
    }
    // if (isLoggedIn ) {
    //   return true;
    // } else {
    //   localStorage.clear();
    //   this.router.navigate(['/login']);
    //   return false;
    // }

  }
}
