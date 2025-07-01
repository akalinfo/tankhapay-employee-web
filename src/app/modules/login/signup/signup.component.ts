import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
declare var $: any;
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../login.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {

  showSidebar: boolean = true;
  month: any;
  reg_data: any;
  val_data: any = [];
  fullName: any;
  mobileNumber: any;
  email: any;
  pincode: any;
  validate_status: any;
  submitted = false;
  otp: any;
  selected_date: any;
  addRemoveHide: boolean = false;
  token: any = '';
  RegistrationForm: FormGroup;
  ValidationForm: FormGroup;
  tp_account_id: any;
  product_type: any = '';
  registationSubmitted: boolean = false;


  constructor(
    private _LoginService: LoginService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private router: Router,
    private _alertservice: AlertService

  ) {
    if (this.router.getCurrentNavigation().extras.state != null || this.router.getCurrentNavigation().extras.state != undefined) {
      this.mobileNumber = this.router.getCurrentNavigation().extras.state.mobile;
      this.reg_data = true;
      this.resend_otp();
      // console.log(this.emp_mobile);
    }
  }


  ngOnInit() {


    this.RegistrationForm = this._formBuilder.group({
      full_name: ['', [Validators.required, Validators.pattern(GlobalConstants.nameRegex)]],
      employer_email: ['', [Validators.required, Validators.pattern(GlobalConstants.emailRegex)]],
      employer_mobile: ['', [Validators.required, Validators.pattern(GlobalConstants.mobileRegex)]],
      employer_pincode: ['', [Validators.required, Validators.pattern(GlobalConstants.pincodeRegex)]],

    });

    this.ValidationForm = this._formBuilder.group({
      mobile_otp: ['', [Validators.required, Validators.pattern('^[0-9]{4}$'), Validators.minLength(4), Validators.maxLength(4)]],
    });

  }
  get r() {
    return this.RegistrationForm.controls;
  }

  isValidEmail(email: string) {
    // You can use a regular expression or any other validation logic here
    // For simplicity, this example checks for a basic email format
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

  // Register or Signup
  register() {
    this.registationSubmitted = true;

    let data = this.RegistrationForm.value;
    data["flag"] = "SU";
    data["user_ip"] = "ip";
    data["device_type"] = "web";

    console.log(this.RegistrationForm.value);

    if (this.RegistrationForm.valid) {
      this._LoginService.employer_register(data).subscribe({
        next: (resData: any) => {
          this.reg_data = resData.statusCode;

          if (resData.statusCode) {
            // this.toastr.success(resData.message, 'Success');
            this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
            // this.resend_otp();
            this.mobileNumber = data['employer_mobile'];
          } else {
            //this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);
          }
        },
        error: (e) => {
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);
        }
      }
      );

    } else {
      this._alertservice.error('Please fill all the required fields correctly', GlobalConstants.alert_options);
      // this.toastr.error('Please fill all the required fields correctly', 'Oops!');
    }

  }

  // Validate OTP
  validate() {
    let otp = this.ValidationForm.get('mobile_otp').value;

    if (this.otp == '') {
      // this.toastr.error('Please enter OTP first', 'Oops!');
      this._alertservice.error('Please enter OTP first', GlobalConstants.alert_options);
      return;
    }

    if (this.ValidationForm.valid) {
      this._LoginService.screendetails({
        "otp": otp,
        "employer_mobile": this.mobileNumber,
        "user_ip": "1",

      }).subscribe({
        next: (resData: any) => {
          this.validate_status = resData.statusCode;

          if (resData.statusCode) {
            // this.toastr.success(resData.message, 'Success');
            this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);

            this._LoginService.employer_register({
              "user_type": "Business",
              "gst_in_y_n": "N",
              "area_of_work": "35",
              "no_of_employee": "1",
              "flag": "BI",
              "employer_mobile": this.mobileNumber,
              "device_type": "web",
              "user_ip": "1",
            }).subscribe({
              next: (resData2: any) => {
                if (resData2.statusCode) {
                  this._LoginService.sendWelcomeEmail({ 'mobileNo': this.mobileNumber }).subscribe({
                    next: (resDatamail: any) => {
                      console.log(resDatamail);
                    }
                  });
                  this.router.navigate(['/login/registration-approved'], { state: { mobile: this.mobileNumber } });

                } else {
                  // this.toastr.error(resData2.message, 'Oops!');
                  this._alertservice.error(resData2.message, GlobalConstants.alert_options);
                }
              }, error: (e) => {
                // this.toastr.error(e.error.message, 'Oops!');
                this._alertservice.error(e.error.message, GlobalConstants.alert_options);
              }
            })

          } else {
            // this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);
          }
        }, error: (e) => {
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);
        }
      }
      );

    } else {
      //this.toastr.error('Please enter a valid OTP', 'Oops!');
      this._alertservice.error('Please enter a valid OTP', GlobalConstants.alert_options);
    }
  }

  // Send OTP
  resend_otp() {
    // employer_login_otp_send

    this._LoginService.employer_login_otp_send({
      "employer_mobile": this.mobileNumber,
      "user_ip": "1",
    }).subscribe(
      (resData: any) => {
        console.log(resData);
        if (resData.statusCode) {
          //this.toastr.success(resData.message, 'Success');
          this._alertservice.success(resData.message, GlobalConstants.alert_options);
          //this.router.navigate(['/login/registration-approved']);
        }
        else {
          // this.toastr.error(resData.message, 'Oops!');
          this._alertservice.error(resData.message, GlobalConstants.alert_options);

        }
      });

  }
}
