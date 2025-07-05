import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { LoginService } from './login.service';
import { Md5 } from 'ts-md5/dist/esm/md5';
import { ToastrService } from 'ngx-toastr';
import { GlobalConstants } from 'src/app/shared/global-constants'
// import { ReCaptchaV3Service } from 'ng-recaptcha';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { AlertService } from 'src/app/shared/_alert';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { AppInitializerService } from 'src/app/shared/services/app-intializer.service';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';

declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  @ViewChild('inputElement', { static: true })
  inputElement!: ElementRef;
  otpForm!: FormGroup;
  isShown = false;
  isEmailLogin: boolean = false;
  loginForm_Email!: FormGroup;
  loginForm_otp!: FormGroup;
  resetForm!: FormGroup;
  interval: number = 0;
  seconds: number = 0;
  showMobileForm: boolean = false;
  showEmailForm: boolean = false;
  isButtonDisabled: boolean = false;
  eleArray: any = [];
  // mobileNumber: string = '';
  showOTPInput: boolean = false;
  isActiveButton: string = ''; // Initially, no button is active
  submitted = false;
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
  @ViewChild('langInput', { static: false }) langInput!: ElementRef;

  remaining: number = 0;
  timerId: any;
  formattedTime: string = '';

  pass_type: string = 'password';
  pass_title: string = "Show";

  progressData: any;
  get_show_bus_setting_page: string = '';
  is_show_client_logo = false;
  is_show_client_path = '';
  //https://www.tankhapay.com/images/logo-01.png

  constructor(private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _LoginService: LoginService,
    private router: Router,
    public toastr: ToastrService,
    // private recaptchaV3Service: ReCaptchaV3Service,

    private _SessionService: SessionService,
    private _alertservice: AlertService,
    private _masterService: MasterServiceService,
    private _AppinitalizerService: AppInitializerService,
    private route: ActivatedRoute,
    private activityLogsService: ActivityLogsService) {
    // this.siteKey = '6LcyWEwbAAAAAPs41kLFehvsT6iziJsJjQB4Tinr';
    // this.siteKey = '6Lf6gucoAAAAAMAOByUl96jlBP8vGmzl35CDvITv';
    // this.siteKey = '6LfY2wgpAAAAAKL7RrbdqdIfF77hZ2pO7UmsyTHE';
  }

  ngOnInit() {
    // loginForm_otp
    //  // Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$'),
    const queryParamValue = this.route.snapshot.queryParamMap.get('frombd');
    console.log(queryParamValue);


    if (queryParamValue != '' && queryParamValue !== undefined && queryParamValue != null) {

      // console.log(JSON.parse(this._EncrypterService.aesDecrypt(decodeURIComponent(queryParamValue))));
      // console.log(queryParamValue);
      let domainOfCustomer = this._EncrypterService.aesDecrypt(atob(decodeURIComponent(queryParamValue)));

      // console.log(domainOfCustomer);
      this._LoginService.get_branding_logo_path({ 'domainOfCustomer': domainOfCustomer }).subscribe((data: any) => {
        if (data.statusCode == true) {

          let decryptedData: any = this._EncrypterService.aesDecrypt(data.commonData);
          let decryptedDataObj = JSON.parse(decryptedData)[0];
          // console.log(decryptedDataObj.logo);
         if (decryptedDataObj.is_enable_branding == 'Y') {
            this.is_show_client_path = decryptedDataObj.logo;
            // this.is_show_client_logo = true;
            // hide it for all case
            this.is_show_client_logo = false;
            // en d
          } else {
            this.is_show_client_path = 'https://www.tankhapay.com/images/logo-01.png';
            this.is_show_client_logo = false;
          }

        }
        else {
          //this.router.navigate(['/careers/error']);
          //this.toastr.error('OOPS! Something went wrong', 'Error');
          this.is_show_client_path = 'https://www.tankhapay.com/images/logo-01.png';
          this.is_show_client_logo = false;
        }
      });




    }
    else {

      this.is_show_client_path = 'https://www.tankhapay.com/images/logo-01.png';
      this.is_show_client_logo = false;
    }

    if (this._SessionService.check_user_session()) {
      this._SessionService.destroy_user_session();
      localStorage.clear();
    }

    this.loginForm_Email = this._formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          // Validators.pattern('^[6-9]{1}[0-9]{9}$'), Validators.minLength(10),
          // Validators.maxLength(10)
        ]],
      password: ['', Validators.required],
      // recaptcha: [''],
      //,Validators.required
    });

    this.loginForm_otp = this._formBuilder.group({
      mobile: ['', [Validators.required,
      Validators.pattern('^[6-9]{1}[0-9]{9}$'), Validators.minLength(10),
      Validators.maxLength(10)]],
      mobile_otp: ['', [Validators.minLength(4), Validators.maxLength(4)]],
      // recaptcha: [''],
    });
    localStorage.setItem('default_url', '/dashboard');
  }

  get g() {
    return this.loginForm_otp.controls;
  }

  setActiveButton(buttonName: string): void {
    this.isActiveButton = buttonName;
  }
  disableButton() {
    this.isButtonDisabled = true;
  }

  sanitizeInput() {
    if (this.formattedTime != '') {
      this.stopTimer();
      this.showOTPInput = !this.showOTPInput;

    }
  }

  toggleLoginMethod() {
    this.isEmailLogin = !this.isEmailLogin;
  }

  toggleOTPInput() {
    this.showOTPInput = !this.showOTPInput;
  }

  // login() {
  //   this.submitted = true;
  //   if (this.loginForm_Email.invalid) {
  //     return;
  //   }
  //   let mobilepattern = /^[6-9]{1}[0-9]{9}/;
  //   let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   if (!this.loginForm_Email.controls.email.value.match(mobilepattern) && !this.loginForm_Email.controls.email.value.match(emailRegex)) {
  //     return this._alertservice.error('Invalid Username', GlobalConstants.alert_options_autoClose);
  //   }

  //   let action = '';
  //   if (this.loginForm_Email.controls.email.value.match(mobilepattern)) {
  //     action = 'check_login_by_emailid';
  //   } else if (this.loginForm_Email.controls.email.value.match(emailRegex)) {
  //     action = 'check_login_by_emailid1';
  //   }

  //   let postData = this.loginForm_Email.value;
  //   let password = postData.password;
  //   let password_enc = Md5.hashStr(password);
  //   let localhost = window.location.hostname == 'localhost' || window.location.hostname == 'tankhapaystag.z13.web.core.windows.net' ? true : false;

  //   if (localhost) {
  //     this.login_code(postData.email, password_enc, '', localhost, action);
  //   } else {
  //     this.recaptchaV3Service.execute('tpayRecaptcha')
  //       .subscribe((recaptchaToken: string) => {
  //         this.login_code(postData.email, password_enc, recaptchaToken, localhost, action);
  //       });
  //   }

  // }

  // login_code(email: any, password_enc: any, recaptchaToken: any, localhost: any, action: any) {
  //   this._LoginService.user_login({
  //     'email': email, 'password': password_enc,
  //     'recaptchaToken': recaptchaToken, 'localhost': localhost,
  //     'action': action
  //   }).subscribe(
  //     (resData: any):any => {
  //       // console.log(resData);
  //       if (resData.status == 'True') {
  //         localStorage.setItem('activeUser', JSON.stringify(resData));
  //         if (resData.token) {
  //           const badgeElement = document.querySelector('.grecaptcha-badge') as HTMLInputElement;
  //           if (badgeElement) {
  //             badgeElement.style.display = 'none';
  //           }

  //           // let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
  //           let token: any = decode(resData.token);
  //           let signup_flag = token.signup_flag;
  //           let gstin_no_isverify_y_n = token.gstin_no_isverify_y_n;
  //           let user_type = token.user_type;
  //           localStorage.setItem('product_type', token.product_type);

  //           // Activity Log
  //           this.activityLogsService.insertActivityLog(token,'Login',this.router?.url);

  //           this.get_show_bus_setting_page = token.show_bus_setting_page;

  //           localStorage.setItem('show_bus_setting_page', token.show_bus_setting_page);
  //           this._AppinitalizerService.setSession();
  //           this._masterService.get_url_access_right_global({ roleid: token.role }).subscribe((resData1: any) => {
  //             if (resData1.statusCode) {
  //               let access_data = (this._EncrypterService.aesDecrypt(resData1.commonData));
  //               localStorage.setItem('access_rights', access_data);
  //               // console.log(access_data);
  //             }

  //             // console.log(signup_flag);

  //             if (signup_flag == 'SU') {
  //               this.router.navigate(['/login/signup'], { state: { mobile: token.mobile } });

  //             } else if (signup_flag == 'BI') {
  //               this.router.navigate(['/login/registration-approved']);

  //             } else if (signup_flag == 'AV' || signup_flag == 'PT' || signup_flag == 'CD' || signup_flag == 'EA' || signup_flag == 'SPI') {
  //               this.router.navigate(['/login/onboarding'], { state: { mobile: token.mobile } });

  //             } else if (signup_flag == 'SP') {
  //               if (user_type == 'Business') {

  //                 // let get_show_bus_setting_page = (localStorage.getItem('show_bus_setting_page') == null
  //                 //   || localStorage.getItem('show_bus_setting_page') == null) ? 'N' : localStorage.getItem('show_bus_setting_page').toString();

  //                 if (this.get_show_bus_setting_page == 'Y') {
  //                   this.router.navigate(['/dashboard/welcome']);
  //                 } else {
  //                   this.router.navigate(['/dashboard']);
  //                 }

  //                 // localStorage.setItem('default_url', '/dashboard');

  //                 /*   this.get_dashboard_status(token.tp_account_id).then((result: boolean) => {
  //                     if (result) {
  //                       // localStorage.setItem('assistant_status', 'N');
  //                       localStorage.setItem('default_url', '/dashboard');
  //                       this.router.navigate(['/dashboard']);
  //                     } else {
  //                       // localStorage.setItem('assistant_status', 'Y');
  //                       localStorage.setItem('default_url', '/dashboard/welcome');
  //                       this.router.navigate(['/dashboard/welcome']);
  //                     }
  //                   }).catch((error: any) => {
  //                     console.error('Error: ', error);
  //                   });
  //                   */

  //               } else if (user_type == 'Individual') { // For user-type Individual direct to Dashboard.
  //                 localStorage.setItem('default_url', '/dashboard');
  //                 this.router.navigate(['/dashboard']);
  //               }

  //             } else if (signup_flag == 'KYC_PAN' || signup_flag == 'KYC_AADHAR'
  //               || signup_flag == 'KYC_GST' || signup_flag == 'CD' || signup_flag == 'RJ' || signup_flag == 'Training') {
  //               // this.router.navigate(['/dashboard']);

  //               if (user_type == 'Business') {

  //                 if (this.get_show_bus_setting_page == 'Y') {
  //                   this.router.navigate(['/dashboard/welcome']);
  //                 } else {
  //                   this.router.navigate(['/dashboard']);
  //                 }

  //                 // this.get_dashboard_status(token.tp_account_id).then((result: boolean) => {
  //                 //   if (result) {
  //                 //     // localStorage.setItem('assistant_status', 'N');
  //                 //     localStorage.setItem('default_url', '/dashboard');
  //                 //     this.router.navigate(['/dashboard']);

  //                 //   } else {
  //                 //     // localStorage.setItem('assistant_status', 'Y');
  //                 //     localStorage.setItem('default_url', '/dashboard/welcome');
  //                 //     this.router.navigate(['/dashboard/welcome']);
  //                 //   }
  //                 // }).catch((error: any) => {
  //                 //   console.error('Error: ', error);
  //                 // });

  //               } else if (user_type == 'Individual') { // For user-type Individual direct to Dashboard.
  //                 localStorage.setItem('default_url', '/dashboard');
  //                 this.router.navigate(['/dashboard']);
  //               }
  //             }

  //           })

  //         }
  //       } else {
  //         //  console.log(resData);
  //         localStorage.clear();

  //         // this.toastr.error(resData.msg, 'Oops!');
  //         this._alertservice.error(resData.msg, GlobalConstants.alert_options);
  //         // this.toastr.error('Invalid login credentials. please try again', 'Oops!');
  //       }
  //     });
  // }


  keyPress(event: any) {
    const pattern = /[0-9]/;

    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }
  Otp_Sent() {
    // 6127959974
    if (this.loginForm_otp.get('mobile')?.value == '') {
      // this.toastr.error('Please Enter Registered Mobile Number', 'Erorr');
      this._alertservice.error('Please Enter Registered Mobile Number', GlobalConstants.alert_options);
      this.showOTPInput = false;
      return;
    }

    // let postData = this.loginForm_otp.value;

    // Harsh commented on - 02-Jul-25
    // this._LoginService.send_OTP({
    this._LoginService.send_employee_otp({
      "encrypted": this._EncrypterService.aesEncrypt(
        JSON.stringify({
          "employer_mobile": this.loginForm_otp.get('mobile')?.value,
          "user_ip": "1",
        })
      )
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.resetStartTimer(60);
        // this.toastr.success(resData.message, 'Success');
        if(resData.employer_type=='Employee'){
          localStorage.setItem('employer_type',"Employee");
        }
        this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
        this.showOTPInput = true;
      } else {
        // this.toastr.error(resData.message, 'Error');
        this._alertservice.error(resData.message, GlobalConstants.alert_options);
        this.showOTPInput = false;
      }
    })
  }
  get f() {
    return this.loginForm_Email.controls;
  }

  get motp() {
    return this.loginForm_otp.controls;
  }

  Verify_OTP() {
    // console.log(this.motp['mobile_otp'].value);
    if (this.motp['mobile_otp'].value == '') {
      // this.toastr.error('Please Enter 4 Digit OTP', 'Error');
      this._alertservice.error('Please Enter 4 Digit OTP', GlobalConstants.alert_options);
      return;
    }

    // Harsh commented on - 02-Jul-25
    // this._LoginService.verify_OTP({
    this._LoginService.verify_employee_otp({
      "encrypted": this._EncrypterService.aesEncrypt(
        JSON.stringify({
          "employer_mobile": this.loginForm_otp.get('mobile')?.value,
          "otp": this.motp['mobile_otp'].value,
          "user_ip": "1",
        })
      ),
      "mobile": this.loginForm_otp.get('mobile')?.value,
    }).subscribe((resData: any):any => {

      if (resData.status == 'True') {
        localStorage.setItem('activeUser', JSON.stringify(resData));
        if (resData.token) {
          let token: any = decode(resData.token);
          let signup_flag = token.signup_flag;
          let gstin_no_isverify_y_n = token.gstin_no_isverify_y_n;
          let user_type = token.user_type;

          localStorage.setItem('product_type', token.product_type);
          this.get_show_bus_setting_page = token.show_bus_setting_page;

          localStorage.setItem('show_bus_setting_page', token.show_bus_setting_page);
          this._AppinitalizerService.setSession();
          if(resData.employer_type=='Employee'){
             this.router.navigate(['/profile/employee-detail']);
             localStorage.setItem('login_type','Employee');
             return

            }else{
              localStorage.setItem('login_type','Employer');
            }

          this._masterService.get_url_access_right_global({ roleid: token.role }).subscribe((resData1: any):any => {
            if (resData1.statusCode) {
              let access_data = (this._EncrypterService.aesDecrypt(resData1.commonData));
              localStorage.setItem('access_rights', access_data);
              // console.log(access_data);
            }
            if(localStorage.getItem('employer_type')=='Employee'){
              return this.router.navigate(['/profile']);
            }
          })
        }
      } else {
        // this.toastr.error(resData.msg, 'Error');
        this._alertservice.error(resData.msg, GlobalConstants.alert_options);
      }
    })
  }

  /**OTP timer**/
  timerTick() {
    this.remaining -= 1;
    if (this.remaining < 0) {
      // Timeout logic here
      this.stopTimer();

    } else {
      // Format the remaining time in "mm:ss" format
      const minutes = Math.floor(this.remaining / 60);
      const seconds = this.remaining % 60;
      // this.formattedTime = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      this.formattedTime = `${seconds < 10 ? '0' : ''}${seconds} seconds.`;

      // Update the timer display
      this.timerId = setTimeout(() => {
        this.timerTick();
      }, 1000);
    }
  }


  resetStartTimer(newRemaining: number) {
    // Clear the existing timer, if any
    clearTimeout(this.timerId);

    // Set the new remaining time
    this.remaining = newRemaining;

    // Start the timer
    this.timerTick();
  }

  stopTimer() {
    clearTimeout(this.timerId);
    this.remaining = 0;
    this.formattedTime = '';
  }
  /**OTP timer**/


  // Captcha
  handleReset() { }
  handleExpire() { }
  handleLoad() { }
  handleSuccess(event: any) {
    // console.log(event);
  }

  viewpass() {
    if (this.pass_type != "password") {
      this.pass_type = "password";
      this.pass_title = "Show"
    } else {
      this.pass_type = "text";
      this.pass_title = "Hide"
    }
  }

  handleToken(e: any) {

  }
  async get_dashboard_status(account_id: any) {
    return new Promise<boolean>((resolve, reject) => {
      this._LoginService.get_dashboard_status({
        'account_id': account_id
      })
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.progressData = resData.commonData?.onboarding_assistant;
              let check = true;
              for (let key in this.progressData) {
                if (this.progressData.hasOwnProperty(key)) {
                  if (this.progressData[key] == 'N') {
                    check = false;
                    break;
                  }
                }
              }
              if (check == true) {
                resolve(true); // at true pass to dashboard
              } else if (check == false) {
                resolve(false); // at false pass to welcome
              }
            } else {
              reject('Error occurred in response handling');
              this.progressData = {};
              this.toastr.error(resData.message, 'Oops!');
            }
          }, error: (e: any) => {
            reject('Error occurred during API call');
            this.progressData = {};
          }
        })
    })
  }

  checkUsername(key: any) {
    const numericPattern = /^[0-9]+$/;
    let ele: any = document.getElementById('email');

    if (numericPattern.test(this.loginForm_Email.controls.email.value) && this.loginForm_Email.controls.email.value.length > 5) {
      ele.setAttribute('maxLength', 10);
      this.loginForm_Email.controls.email.setValidators([Validators.maxLength(10)]);
      this.loginForm_Email.controls.email.updateValueAndValidity();
    } else {
      ele.removeAttribute('maxLength');
      this.loginForm_Email.controls.email.removeValidators([Validators.minLength(100)]);
      this.loginForm_Email.controls.email.setValidators([Validators.maxLength(100)]);
      this.loginForm_Email.controls.email.updateValueAndValidity();

      this.loginForm_Email.controls.email.updateValueAndValidity();
    }
  }


}

