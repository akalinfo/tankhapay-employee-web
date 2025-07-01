import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { SessionService } from '../services/session.service';
import decode from 'jwt-decode';

@Injectable()
export class RoleAuthGuard implements CanActivate {
  //constructor(private authService: AuthService, private router: Router) {}
  constructor(
    private router: Router,    
    private _SessionService:SessionService,
  
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if(this._SessionService.check_user_session()){
        const moduleName = route.data.moduleName;
        // let session_obj:any = JSON.parse(this._SessionService.get_user_session());
        let session_obj:any = this._SessionService.get_user_session();
        const tokenPayload:any = decode(session_obj.token);
        const role_id = tokenPayload.role;
        switch(moduleName) { 
          case "superAdmin": { 
            if(role_id == '1' || role_id == '2'){ return true ; } 
            this.router.navigate(['/logout']);
            return false;
            break; 
          } 
          default: { 
            return true; 
            break;              
          } 
        }

        
      }
      this.router.navigate(['/logout']);
    return false;
  }
}