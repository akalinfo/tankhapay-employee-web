import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControlName } from '@angular/forms';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../../shared/services/session.service';
import { SsoLoginService } from './../sso-login.service';
import { EncrypterService } from '../../../shared/services/encrypter.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { AppInitializerService } from 'src/app/shared/services/app-intializer.service';
@Component({
  selector: 'app-employee-sso',
  templateUrl: './employee-sso.component.html',
  styleUrls: ['./employee-sso.component.css']
})
export class EmployeeSsoComponent {
  accountid: any;
  employeessoid: any;
  constructor(
    private _masterService: MasterServiceService,
    private toastr: ToastrService,
    private _ssoLoginService:SsoLoginService,
    private route: ActivatedRoute,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private router: Router,
    private _appInitializerService: AppInitializerService
  ) {

  }
  ngOnInit() {
    const paramsCount = Object.keys(this.route.snapshot.params).length;
    this.accountid = this.route.snapshot.paramMap.get('accountid')!;
    this.employeessoid = this.route.snapshot.paramMap.get('employeessoid')!;
    this.employeeSSOLogin();
  }

  employeeSSOLogin() {
    this._ssoLoginService.employeeSSOLogin({
      'customerAccountId': this.accountid.toString(),
      'urlSegment': this.employeessoid.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          localStorage.setItem('activeUser', JSON.stringify(resData));
          let token: any = decode(resData.token);
          
          localStorage.setItem('product_type', token.product_type);
          localStorage.setItem('show_bus_setting_page', token.show_bus_setting_page);
          let isEmployer_flag = token.isEmployer;
          let empcode_mob =
            !localStorage.getItem('empcode_mob')? []: this._encrypterService.aesDecrypt(localStorage.getItem('empcode_mob'));

          const promises: Promise<any>[] = [];

          if (empcode_mob.length == 0 && isEmployer_flag == '0') {
            //promises.push(this.getEmpCodeFromMobileNumber(token));
          }

          if (localStorage.getItem('activeUser')) {
            //promises.push(this.get_url_access_right_global(token));
            // console.log('this.get_url_access_right_global(token)');
            //promises.push(this.getKRaSettings(token));
          }

          // Wait for both promises to resolve
          Promise.all(promises)
            .then(() => {
              localStorage.setItem('employeeSSO', 'true');
              console.log('Both tasks completed successfully.');
              this._appInitializerService.setSession();
              //this.router.navigate(['/profile/investments?type=mobile']);  
              this.router.navigate(['/profile/investments'], { queryParams: { type: 'mobile' } });
            })
            .catch((error) => {
              console.error('Error in one of the tasks:', error);
              //this.handleInvalidSession();
            });
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

}
