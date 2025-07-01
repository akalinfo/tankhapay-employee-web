import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MasterServiceService } from './master-service.service';
import { EncrypterService } from './encrypter.service';
import { SessionService } from './session.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import decode from 'jwt-decode';


@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  constructor(
    private router: Router,
    private _masterService: MasterServiceService,
    private _encrypterService: EncrypterService,
    private _sessionService: SessionService,
  ) { }

  // Make sure to return a Promise or Observable here to tell Angular to wait
  initialize(): Promise<any> {
    const searchParams = new URLSearchParams(window.location.search);
    const session_id = searchParams.get('p1');
    const accountid = searchParams.get('p2');



    // console.log("Search Params:", searchParams);

    return new Promise((resolve, reject) => {
      let session_obj = this._sessionService.get_user_session();
      if (session_obj && !session_id) {
        resolve(true);
      } else {
        //  console.log("session_id",session_id);

        if (session_id && accountid) {
          const decryptedAccountId = this._encrypterService.aesDecrypt(accountid);

          this._masterService
            .useSession({
              action: 'get_login_seession',
              customerAccountId: decryptedAccountId,
              session_id: session_id,
            })
            .pipe(
              catchError((error) => {
                console.error('Session validation error:', error);
                this.handleInvalidSession();
                return of(null); // Return null observable in case of error
              })
            )
            .subscribe(
              (resData: any) => {
                if (resData && resData.statusCode) {

                  const sessionObjDecrypted = JSON.parse(
                    this._encrypterService.aesDecrypt(resData.commonData)
                  );
                  this._sessionService.set_user_session(sessionObjDecrypted);

                  localStorage.setItem('sessionid', session_id)
                  let session_obj = JSON.parse(this._sessionService.get_user_session());
                  let token: any = decode(session_obj.token);
                  localStorage.setItem('product_type', token.product_type);
                  localStorage.setItem('show_bus_setting_page', token.show_bus_setting_page);
                  this._masterService.get_url_access_right_global({ roleid: token.role }).subscribe((resData1: any) => {
                    if (resData1.statusCode) {
                      let access_data = (this._encrypterService.aesDecrypt(resData1.commonData));
                      localStorage.setItem('access_rights', access_data);
                      console.log('Session set successfully.');
                      resolve(true);
                      // console.log(access_data);
                    }
                  })
                  // Resolve the promise when session is set
                } else {

                  this.handleInvalidSession();
                  resolve(false); // Reject if session is invalid
                }
              },
              (error) => {

                this.handleInvalidSession();
                resolve(false); // Reject if there's an error while subscribing
              }
            );
        } else {
          // console.log("here",window.location.pathname);
          let isSSoLogin = (window.location.pathname.includes('/sso-login') || window.location.pathname.includes('login') || window.location.pathname.includes('employee-sso') )
           ? true : false;
          // If no session id or account id found, reject the promise
          if (!isSSoLogin)
            this.handleInvalidSession();
          resolve(true);
        }
      }
    });

  }

  private handleInvalidSession(): void {
    localStorage.clear();
    // this.router.navigate(['/login']);
    const searchParams = new URLSearchParams(window.location.search);
    const branding_query = searchParams.get('frombd');
    if (branding_query == null || branding_query == undefined) {
      this.router.navigate(['/login']);
    }

  }

  setSession() {
    // console.log("herer");

    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session()
    );
    const token: any = decode(session_obj_d.token);
    let employerType = token.sso_admin_id != '' && token.isEmployer == '1' ? 'SSO-Employer' :
      token.sso_admin_id == '' && token.isEmployer == '1' ? 'Employer' : 'Sub User';
    this._masterService.useSession({
      activeuser: localStorage.getItem('activeUSer'), 'customerAccountId': token.tp_account_id.toString(),
      action: 'insert_login_token', activeUser: this._encrypterService.aesEncrypt(localStorage.getItem('activeUser')), userType: employerType
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let sessionid = resData.commonData;
        localStorage.setItem('sessionid', sessionid)
        // console.log(localStorage.getItem(sessionid));

      }
    })
  }

}
