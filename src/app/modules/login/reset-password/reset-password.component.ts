import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
// import { EncrypterService } from 'src/app/shared/services/encrypter.service';
// import { SessionService } from 'src/app/shared/services/session.service';
import { LoginService } from '../login.service';
import { Md5 } from 'ts-md5/dist/esm/md5';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  val_data:any=[];
  status:any;
  mobileNumber:any;
  link_status:boolean=false;
  email:any;
  postData: any;
  pincode:any;
  submitted = false;
  otp: any;
  url_status:any;
  selected_date: any;
  addRemoveHide: boolean = false;
  token: any = '';
  resetForm: FormGroup;
  ValidationForm:FormGroup;
  tp_account_id: any;
  product_type: any = '';
  id:any;
  url:any;

  constructor(
    private _LoginService: LoginService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private Router: Router,
    private AlertService: AlertService

  ) { 
    this.router.params.subscribe((params: any) => {
      this.id = params['id'];      
      this.url=window.location.href;
      // console.log(this.url);
      
      });
  }


  ngOnInit() {
 
      this.resetForm = this._formBuilder.group({
        newpassword: ['',[Validators.required,Validators.minLength(6) ]],
        confirmpassword: ['',[Validators.required ]]
      });

      this.url_validity_check();
  }

  get f() {
    return this.resetForm.controls;
  }

  isValidEmail(email: string) {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  keyPress(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  Reset_Password() {
    this.postData = this.resetForm.value;

    if (this.postData.newpassword == '') {
      // this.toastr.error('Please enter your new password', 'Oops');
      this.AlertService.error('Please enter your new password', GlobalConstants.alert_options_autoClose);
      return;
    }

    if (this.postData.confirmpassword == '') {
      // this.toastr.error('Please enter your Confirm password', 'Oops');
      this.AlertService.error('Please enter your Confirm password', GlobalConstants.alert_options_autoClose);
      return;
    }

    if (this.postData.newpassword != this.postData.confirmpassword) {
      // this.toastr.error('New password and confirm password do not match', 'Oops');
      this.AlertService.error('New password and confirm password do not match', GlobalConstants.alert_options_autoClose);
      return;
    }

    if(this.resetForm.invalid){
      this.AlertService.error('Password length too short.', GlobalConstants.alert_options_autoClose);
      return;
    }

    this._LoginService.reset_password({
      "action": "employer_password_change",
      "password": this.resetForm.get('confirmpassword')?.value,
      "p_employer_id": this.id,
      'url': window.location.pathname,
      "user_ip": "::1"
    }).subscribe(
      (resData: any) => {

        this.status = resData.statusCode;

        console.log(resData);
        // console.log(resData);

        if (resData.statusCode) {
          // this.toastr.success(resData.message, 'Success');
          this.AlertService.success(resData.message, GlobalConstants.alert_options_autoClose);
    
        }
        else {
          // this.toastr.error(resData.message, 'Oops !');
          this.AlertService.error(resData.message, GlobalConstants.alert_options_autoClose);
     
        }
      });
  }

  goBack() {
    this.Router.navigate(['/login']);
  }

  url_validity_check() {

    {
      this._LoginService.is_url_expired({ "url": this.url }).subscribe((resData: any) => {
        // console.log(resData);
        this.url_status = resData.statusCode;

        if (this.url_status) {
          this.link_status = (JSON.parse(resData.commonData))[0]?.is_url_expired;
          console.log(this.link_status);
        }
      });
    }
  }


}
