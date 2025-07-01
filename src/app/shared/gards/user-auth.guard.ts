import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { SessionService } from '../services/session.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class UserAuthGuard implements CanActivate {
  //constructor(private authService: AuthService, private router: Router) {}
  constructor(
    private router: Router,    
    private _SessionService:SessionService,
  
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      if(this._SessionService.check_user_session()){
        
        return true;
      }
      this.router.navigate(['/logout']);
    return false;
  }
}