import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormControlName } from '@angular/forms';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from '../../shared/services/session.service';
import { SsoLoginService } from './sso-login.service';
import { EncrypterService } from '../../shared/services/encrypter.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { AppInitializerService } from 'src/app/shared/services/app-intializer.service';

@Component({
  selector: 'app-sso-login',
  templateUrl: './sso-login.component.html',
  styleUrls: ['./sso-login.component.css']
})
export class SsoLoginComponent implements OnInit {

  loginForm: FormGroup;
  postData: any;
  postDataEnc: any;
  resetPostData: any;
  errorMsg: string;
  submitted = false;
  forgetPasswordModal: boolean = false;
  resetErrorMsg: string;
  default_url = '';
  siteKey: string = '';
  is_captcha_enable: boolean = false;
  // captcha onfiguration
  captchaStatus: any = null;
  captchaConfig: any = {
    length: 6,
    cssClass: 'custom',
    back: {
      stroke: "#2F9688",
      solid: "#f2efd2"
    },
    font: {
      color: "#000000",
      size: "35px"
    }
  };
  otp: string;
  showOtpComponent: boolean = true;
  @ViewChild("ngOtpInput", { static: false }) ngOtpInput: any;
  config = {
    allowNumbersOnly: true,
    length: 4,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: "*",
    inputStyles: { width: "50px", height: "50px", },
  };
  sso_login_id: any;
  sso_login_id_org: any;

  ssouid: any = '';
  emplyrssoid: any = '';

  showmessage: any;
  user_type: any;
  get_show_bus_setting_page: any='';
  constructor(
    public toastr: ToastrService,
    private router: Router,
    private _formBuilder: FormBuilder,
    private _SessionService: SessionService,
    private _SsoService: SsoLoginService,
    private route: ActivatedRoute,
    private _masterService:MasterServiceService,
    private _EncrypterService: EncrypterService,
    private _appInitializerService: AppInitializerService
  ) { }

  ngOnInit(): void {

    // console.log("node");
    if (this._SessionService.check_user_session()) {
      this._SessionService.destroy_user_session();
      localStorage.clear();
    }
    this.route.params.subscribe(params => {
      this.ssouid = params.ssouid;
      this.emplyrssoid = params.emplyrssoid;
      // console.log(params);

    });
    this.loginForm = this._formBuilder.group({
      ssouid: [this.ssouid, [Validators.required]],
      emplyrssoid: [this.emplyrssoid, [Validators.required]]

    });
    this._SsoService.sso_login({
      'ssouid': this.loginForm.controls.ssouid.value,
      'emplyrssoid': this.loginForm.controls.emplyrssoid.value,
    }).subscribe((resData: any) => {
      
      if (resData.status == 'True') {
        localStorage.setItem('activeUser', JSON.stringify(resData));
 
        let token: any = decode(resData.token);     

        localStorage.setItem('product_type', token.product_type);
        localStorage.setItem('show_bus_setting_page', token.show_bus_setting_page);
        this.get_show_bus_setting_page= token.show_bus_setting_page;
        if (resData.token) {
          this._appInitializerService.setSession();
          this._masterService.get_url_access_right_global({ roleid: token.role }).subscribe((resData1: any) => {
            if (resData1.statusCode) {
              let access_data = (this._EncrypterService.aesDecrypt(resData1.commonData));
              localStorage.setItem('access_rights', access_data);
              // console.log(access_data);
            }
          if (this.get_show_bus_setting_page == 'Y') {
            this.router.navigate(['/dashboard/welcome']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        })
          // this.router.navigate(['/dashboard']);
         
        }
      } else {
        this.toastr.error(resData.msg, 'Error');
      }
    })

  }
}
