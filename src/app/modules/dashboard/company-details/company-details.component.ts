import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { LoginService } from '../../login/login.service';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.css']
})
export class CompanyDetailsComponent {

  showSidebar: boolean = false;
  show_GST_details: boolean = false;
  companyDetailsForm: FormGroup;
  gstin_number: any = '';
  employer_id: any;
  emp_mobile: any;
  companySubmitted: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _LoginService: LoginService,
    private toastr: ToastrService,
    private _EncrypterService: EncrypterService,
    private _sessionService: SessionService,
    private router: Router,
  ) {
    // let assistant_status = localStorage.getItem('assistant_status');
    // if (assistant_status != null && assistant_status == 'Y') {
    //   // this.showSidebar = true;
    // }
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    let token: any = decode(session_obj_d.token);
    this.emp_mobile = token.mobile;
    this.employer_id = token.id;

    this.companyDetailsForm = this._formBuilder.group({
      acGstinNo: ['', [Validators.required, Validators.pattern(GlobalConstants.gstnoRegex)]],
      company_name: ['', [Validators.required]],
      company_address: ['', [Validators.required]],
      company_state: ['', [Validators.required]],
      company_town_city: ['', [Validators.required]],
      company_pincode: ['', [Validators.required]],
      gstinNoIsVerify_y_n: ['N', [Validators.required]],
    })
  }

  get cd () {
    return this.companyDetailsForm.controls;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  open_gst_details() {
    if (this.gstin_number == '') {
      this.toastr.error('Please enter GST number', 'Oops!');
      return;
    }
    // console.log(this.gstin_number);
    const gst_regEx = new RegExp(GlobalConstants.gstnoRegex);
    if (gst_regEx.test(this.gstin_number) == false) {

      this.toastr.error('Please enter a valid GSTIN number', 'Oops!');
      return;
    }



    this._LoginService.gst_verify_without_otp({
      "id_number": this.gstin_number,
      "employer_id": this.employer_id,
      "employer_mobile": this.emp_mobile,
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            let data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
            this.toastr.success(resData.message, 'Success');

            this.companyDetailsForm.patchValue({
              company_name: data.company_name,
              company_address: data.address,
              acGstinNo: this.gstin_number,
              gstinNoIsVerify_y_n: 'Y',
              company_state: data.state,
              company_pincode: data.pinCode,
            });

            // this.getEmployer_status();
            this.show_GST_details = true;

          } else {
            this.toastr.error(resData.message, 'Oops!');
          }

        }, error: (e) => {
          this.toastr.error(e.error.message, 'Oops!');
        }
      })
  }

  back_to_gstin() {
    this.show_GST_details = false;
    this.companySubmitted = false;

    this.companyDetailsForm.patchValue({
      company_name: '',
      company_address: '',
      acGstinNo: '',
      gstinNoIsVerify_y_n: 'N',
      company_state: '',
      company_town_city: '',
      company_pincode: '',
    });

  }

  getEmployer_status() {
    this._LoginService.getEmployer_status({
      'employer_mobile': this.emp_mobile
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          let data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          // let signup_flag = data.signup_flag;
          // this.employer_id = data.employer_id;
          // this.tp_account_id = data.tp_account_id;

          // console.log(data);

          this.companyDetailsForm.patchValue({
            company_state: data.state,
            company_town_city: data.city,
            company_pincode: data.pincode,
          });

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.toastr.error(e.error.message, 'Oops!');
      }
    })
  }

  updateEmployerBillingCompany() {
    this.companySubmitted = true;

    let data = this.companyDetailsForm.value;
    data["website_app_link"] = "";
    data["device_type"] = "web";
    data["action"] = "UPDATE_SP_CD";
    data["employer_mobile"] = this.emp_mobile;

    if (this.companyDetailsForm.valid) {
      this._LoginService.updateEmployerBillingCompany(data).subscribe({
        next: (resData:any) => {
          if (resData.statusCode) {
            this.toastr.success(resData.message, 'Success');
            // this.router.navigate(['/dashboard']);
            this.router.navigate(['/business-settings/payout'], {state: {'page': 'welcome'}});
          } else {
            this.toastr.error(resData.message, 'Oops!');
          }
        }
      })

    } else {
      this.toastr.error('Some parameter missing', 'Oops!');
    }
  }

}
