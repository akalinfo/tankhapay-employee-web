import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { LoginService } from '../login.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})


export class ForgotPasswordComponent {
  val_data: any = [];
  status: any;
  mobileNumber: any;
  email: any;
  message: any;
  employer_name: any;
  employer_id: any;
  url: any;
  pincode: any;
  msgcd:any;
  data: any = [];
  submitted = false;
  otp: any;
  selected_date: any;
  addRemoveHide: boolean = false;
  token: any = '';
  ForgotForm: FormGroup;
  ValidationForm: FormGroup;
  tp_account_id: any;
  product_type: any = '';
  @Input('appEmailMobileValidator') type: string;

  constructor(
    private _LoginService: LoginService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    private _formBuilder: FormBuilder,
    private router: Router,
    private AlertService: AlertService
  ) { }


  ngOnInit() {

    this.ForgotForm = this._formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          // Validators.pattern('^[6-9]{1}[0-9]{9}$'),

        ]],

    });

  }

  get f() {
    return this.ForgotForm.controls;
  }

  isValidEmail(email: string) {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isEmail(control) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(control.value) ? null : { invalidEmail: true };
  }

  isMobile(control) {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(control.value) ? null : { invalidMobile: true };
  }

  onInputTypeChange() {
    const usernameControl = this.ForgotForm.get('username');

    if (this.isEmailType()) {
      usernameControl.setValidators([Validators.required, this.isEmail]);
    } else if (this.isMobileType()) {
      usernameControl.setValidators([Validators.required, this.isMobile]);
    }

    usernameControl.updateValueAndValidity();
  }

  isEmailType() {
    return this.ForgotForm.get('email')?.value.includes('@');
  }

  isMobileType() {
    const value = this.ForgotForm.get('email')?.value;
    return /^[0-9]{10}$/.test(value);
  }


  keyPress(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  goBack() {
    this.router.navigate(['/login']);
  }

  Reset_Password() {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const alphabet = /[a-z]/i;
    const mobilePattern = /^[0-9]{10}$/;
    const number_regex = /^\d+$/;
    this.email = this.ForgotForm.get('email')?.value;

    if (!this.ForgotForm.valid) {
      // this.toastr.error('Please Enter a valid Email Address', 'Error');
       this.AlertService.error('Please Enter a valid Email Address', GlobalConstants.alert_options);

      // this.toastr.error('Mobile or Email is required ', 'Error');
      return;
    }

    // console.log(number_regex);
    // if (number_regex.test(this.email)) {
    //   this.toastr.error('Please Enter a valid Email Address', 'Error');
    //   return;
    // }
    if (alphabet.test(this.email) == true && number_regex.test(this.email) == false && !this.email.includes('@')) {
      // this.toastr.error('Please Enter a valid Mobile Number or Email', 'Error');
      // this.toastr.error('Please Enter a valid Email Address', 'Error');
      this.AlertService.error('Please Enter a valid Email Address', GlobalConstants.alert_options);
      return;
    }

    if (this.email.includes('@')) {
      if (emailPattern.test(this.email) == false) {
        // this.toastr.error('Please Enter a valid Email', 'Error');
        this.AlertService.error('Please Enter a valid Email', GlobalConstants.alert_options);
        return;
      }
    }
    else if ( number_regex.test(this.email) && mobilePattern.test(this.email)==false) {
      // this.toastr.error('Please Enter a valid Mobile Number', 'Error');
      this.AlertService.error('Please Enter a valid Mobile Number', GlobalConstants.alert_options);
      return;
    }

    else if (number_regex.test(this.email) == false && this.email.includes('@')) {
      // this.toastr.error('Please Enter a valid Mobile Number or Email', 'Error');
      // this.toastr.error('Please Enter a valid Email Address', 'Error');
      this.AlertService.error('Please Enter a valid Email Address', GlobalConstants.alert_options);
      return;
    }

    if (this.ForgotForm.valid && emailPattern.test(this.email) == true && this.email.includes('@')) {
      this._LoginService.forgot_password({
        "action": "forgotpassword",
        "email": this.email,
        "user_ip": "::1"
      }).subscribe(
        (resData: any) => {
          this.status = resData.status;
          if (resData.commonData && resData.commonData.length > 0) {
            this.message = JSON.parse(resData.commonData[0].usp_manage_business_login);
            this.employer_id = JSON.parse(resData.commonData[0]?.usp_manage_business_login)?.employer_id;
            this.employer_name = JSON.parse(resData.commonData[0]?.usp_manage_business_login)?.employer_name;
            this.url = JSON.parse(resData.commonData[0]?.usp_manage_business_login)?.url;
            if (this.status && this.message.msgcd == '1') {
              // this.toastr.success(this.message.msg, 'Success');
              this.AlertService.success(this.message.msg, GlobalConstants.alert_options_autoClose);
            }
            else if (this.status && this.message.msgcd == '0') {
              // this.toastr.error(this.message.msg, 'Oops!');
              this.AlertService.error(this.message.msg, GlobalConstants.alert_options);
            }
          }
          else {
            // this.toastr.error(resData.message, 'Oops!');
            this.AlertService.error(resData.message, GlobalConstants.alert_options);
          }
        });
    } else {
      if (this.ForgotForm.valid && number_regex.test(this.email) == true && mobilePattern.test(this.email) == true) {
        this._LoginService.forgotpassword_send_sms({
          "action": "forgotpassword_send_sms",
          "mobile": this.email,
          "user_ip": "::5"
        }).subscribe(
          (resData: any) => {
           
            console.log(resData);
            this.status = resData.statusCode;   
            console.log(this.data);
             if (this.status) {          
              this.data=JSON.parse(resData.commonData);
              this.msgcd=JSON.parse(this.data[0].usp_manage_business_login)?.msgcd;
              this.message=JSON.parse(this.data[0].usp_manage_business_login)?.msg;
               this.employer_id = JSON.parse(this.data[0].usp_manage_business_login)?.employer_id;
              this.employer_name = JSON.parse(this.data[0].usp_manage_business_login)?.employer_name;
              this.url = JSON.parse(this.data[0].usp_manage_business_login)?.url;
             if (this.status && this.msgcd == '1') {
                // this.toastr.success(this.message, 'Success');
                this.AlertService.success(this.message, GlobalConstants.alert_options_autoClose);
              }
              else if (this.status && this.msgcd == '0') {
                // this.toastr.error(this.message, 'Oops!');
                this.AlertService.error(this.message, GlobalConstants.alert_options);
            }
          }
            else {
            //  this.toastr.error(resData.message, 'Oops!');
              this.AlertService.error(resData.message, GlobalConstants.alert_options);
            }
          });
      }
    }
  }

  validateMobileNumber(mobile: string): boolean {
    const mobilePattern = /^[0-9]{10}$/;
    return mobilePattern.test(mobile);
  }



}
