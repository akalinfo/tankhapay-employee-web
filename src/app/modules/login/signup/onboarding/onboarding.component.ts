import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { LoginService } from '../../login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { dongleState, grooveState } from 'src/app/app.animation';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css'],
  animations: [grooveState, dongleState],
})
export class OnboardingComponent {

  product_type: any = '';
  product_type_name: any = '';
  product_type_master: any = [];
  state_master: any = [];
  district_master: any = [];
  agreement_master: any = [];
  RegistrationForm: FormGroup;
  companyForm: FormGroup;
  companySubmitted: boolean = false;
  selected_product_data: any;
  EPF_ESI_form: FormGroup;
  payrollsubmitted: boolean = false;
  signup_flag: any = '';
  emp_mobile: any;
  employer_id: any;
  show_gst_verify: boolean = true;
  tp_account_id: any;
  agreementForm: FormGroup;
  showAgreementPopup: boolean = false;
  starting_pay_amt: any = '';

  constructor(
    private _LoginService: LoginService,
    private toastr: ToastrService,
    private _EncrypterService: EncrypterService,
    private _formBuilder: FormBuilder,
    private router: Router,
    private _SessionService: SessionService,
    private _alertservice: AlertService

  ) {
    if (this.router.getCurrentNavigation().extras.state != null || this.router.getCurrentNavigation().extras.state != undefined) {
      this.emp_mobile = this.router.getCurrentNavigation().extras.state.mobile;
      // console.log(this.emp_mobile);
    }
  }


  ngOnInit(): void {

    let isLoggedIn = this._SessionService.check_user_session();

    if (isLoggedIn) {
      this.companyForm = this._formBuilder.group({
        company_name: ['', [Validators.required]],
        acGstinNo: [''],
        gstinNoIsVerify_y_n: ['N', [Validators.required]],
        company_address: ['', [Validators.required]],
        company_state: ['', [Validators.required]],
        company_town_city: ['', [Validators.required]],
        company_pincode: ['', [Validators.required]],

      })

      this.EPF_ESI_form = this._formBuilder.group({
        is_epf_registered: ['Y', [Validators.required]],
        epf_registration_number: [''],
        is_esi_registered: ['Y', [Validators.required]],
        esi_registration_number: ['']
      });

      this.agreementForm = this._formBuilder.group({
        accept_onboarded_akal_y_n: [true],
        accept_additional_charges_y_n: [true],
        accept_pf_esic_y_n: [true],
        accept_term_conditions_y_n: [false],
      })

      let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
      let token: any = decode(session_obj_d.token);
      this.signup_flag = token.signup_flag;

      if (this.signup_flag == 'SU') {
        // this.router.navigate(['/login/signup'], { state: { mobile: this.emp_mobile } });
        this.router.navigate(['login']);
        return;

      } else if (this.signup_flag == 'BI') {
        this.router.navigate(['login/registration-approved']);
        return;
      }
      this.get_All_state();
    } else {
      localStorage.clear();
      this.router.navigate(['/login']);
      return;
    }
  }

  get cf() {
    return this.companyForm.controls;
  }

  get eps() {
    return this.EPF_ESI_form.controls;
  }

  get_All_state() {
    this._LoginService.getAll_state({})
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            let product_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.productType));
            this.state_master = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

            this.product_type_master = product_data.filter((el: any) => {
              if (el.product_id != '1') {
                return el;
              }
            });

            // console.log(this.product_type_master)

            this.getEmployer_status();
          } else {
            // this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);

          }
        }, error: (e) => {
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);

        }
      })
  }

  getAll_district(state_code: any) {

    this._LoginService.getAll_district({
      'state_code': state_code,
      'tpAccountId': this.tp_account_id,
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.district_master = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          } else {
            //this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);

          }
        }, error: (e) => {
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);

        }
      })
  }

  getEmployer_status() {
    this._LoginService.getEmployer_status({
      'employer_mobile': this.emp_mobile
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          let data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.signup_flag = data.signup_flag;
          this.employer_id = data.employer_id;
          this.tp_account_id = data.tp_account_id;

          // console.log(data);

          if (this.signup_flag == 'AV') {

          } else if (this.signup_flag == 'PT') {
            this.patch_product_type(data);

          } else if (this.signup_flag == 'CD' || this.signup_flag == 'EA' || this.signup_flag == 'SPI') {
            this.patch_product_type(data);
            this.patch_company_details(data);
            this.get_employer_aggreement();

          }
          // else if (this.signup_flag == 'EA' || this.signup_flag =='SPI') {
          //   this.patch_product_type(data);
          //   this.patch_company_details(data);
          //   this.get_employer_aggreement();
          // }

          if (this.signup_flag == 'EA' || this.signup_flag == 'SPI') {
            this.employerStartingPaymentset();
          }

        } else {
          // this.toastr.error(resData.message, 'Oops!');
          this._alertservice.error(resData.message, GlobalConstants.alert_options);


        }
      }, error: (e) => {
        // this.toastr.error(e.error.message, 'Oops!');
        this._alertservice.error(e.error.message, GlobalConstants.alert_options);

      }
    })
  }

  patch_product_type(data: any) {
    console.log(data.product_type[0]);
    let product_id = data.product_type[0].product_id;
    this.product_type = product_id;
    this.product_type_name = data.product_type[0].product_name;
    this.selected_product_data = this.product_type_master.find((el: any) => {
      if (el.product_id == product_id) {
        return el;
      }
    })

    if (this.product_type == '2') {
      this.EPF_ESI_form.patchValue({
        is_epf_registered: data.is_epf_registered,
        epf_registration_number: data.epf_registration_number,
        is_esi_registered: data.is_esi_registered,
        esi_registration_number: data.esi_registration_number,
      });
    }
  }

  patch_company_details(data: any) {
    this.companyForm.patchValue({
      gstinNoIsVerify_y_n: data.gstin_no_isverify_y_n,
      acGstinNo: data.gstin_no,
      company_name: data.company_name,
      company_address: data.gst_principal_address,
      company_state: data.state,
      company_town_city: data.city,
      company_pincode: data.pincode,
    });

    let state_obj = this.state_master.find((el: any) => el.state == data.state);
    // this.getAll_district(state_obj.id);

    if (data.gstin_no_isverify_y_n == 'Y') {
      this.show_gst_verify = false;
    }

  }


  /****Product Type****/
  changeProductType(e: any) {
    this.product_type = e.target.value;
    this.payrollsubmitted = false;
    // localStorage.setItem('product_type', this.product_type); //??
    // this.get_All_state();

    this.selected_product_data = this.product_type_master.find((el: any) => {
      if (el.product_id == this.product_type) {
        return el;
      }
    })

    if (this.product_type == '') {
      this.selected_product_data = '';
    }

    // console.log(this.selected_product_data);
  }

  update_ProductType() {
    let data = {};
    data['employer_mobile'] = this.emp_mobile;
    data['product_type'] = this.product_type;
    data['device_type'] = 'web';

    data['is_epf_registered'] = 'N';
    data['epf_registration_number'] = '';
    data['is_esi_registered'] = 'N';
    data['esi_registration_number'] = '';

    if (this.product_type == '') {
      // this.toastr.error('Please select a product type', 'Oops!');
      this._alertservice.error('Please select a product type', GlobalConstants.alert_options);
      return;
    } else if (this.product_type == '2' && !this.EPF_ESI_form.valid) {
      // this.toastr.error('Please fill all the required fields', 'Oops!');
      this._alertservice.error('Please fill all the required fields', GlobalConstants.alert_options);


      return;

    } else if (this.product_type == '2') {
      let epf_esi_data = this.EPF_ESI_form.value;
      this.payrollsubmitted = true;

      if (epf_esi_data.is_epf_registered == 'Y' && epf_esi_data.epf_registration_number == '') {
        // this.toastr.error('Please fill all the required fields', 'Oops!');
        this._alertservice.error('Please fill all the required fields', GlobalConstants.alert_options);
        return;
      }
      if (epf_esi_data.is_esi_registered == 'Y' && epf_esi_data.esi_registration_number == '') {
        // this.toastr.error('Please fill all the required fields', 'Oops!');
        this._alertservice.error('Please fill all the required fields', GlobalConstants.alert_options);

        return;
      }

      data['is_epf_registered'] = epf_esi_data.is_epf_registered;
      data['epf_registration_number'] = epf_esi_data.epf_registration_number;
      data['is_esi_registered'] = epf_esi_data.is_esi_registered;
      data['esi_registration_number'] = epf_esi_data.esi_registration_number;

    }

    this._LoginService.updateProductType(data)
      .subscribe({
        next: (resData: any) => {
          // console.log(resData);
          if (resData.statusCode) {
            this.getEmployer_status();
            // this.toastr.success(resData.message, 'Success');
            this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);

            // this.router.navigate(['login/onboarding'], { state: { mobile: this.emp_mobile } });
          } else {
            // this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);

          }
        },
        error: (e) => {
          // console.log(e);
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);

        }
      })

  }


  /****Company Details****/
  gst_verify_without_otp() {
    if (this.cf.acGstinNo.value == '') {
      // this.toastr.error('Please enter GST number', 'Oops!');
      this._alertservice.error('Please enter GST number', GlobalConstants.alert_options);

      return;
    }

    this._LoginService.gst_verify_without_otp({
      "id_number": this.cf.acGstinNo.value,
      "employer_id": this.employer_id,
      "employer_mobile": this.emp_mobile,
    })
      .subscribe({
        next: (resData: any) => {

          if (resData.statusCode) {
            let data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
            // this.toastr.success(resData.message, 'Success');
            this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
            this.companyForm.patchValue({
              company_name: data.company_name,
              company_address: data.address,
              gstinNoIsVerify_y_n: 'Y',
              company_state: data.state,
              company_pincode: data.pinCode,
            });

            this.show_gst_verify = false;
            // let obj:any = this.state_master.find((ob1:any) => ob1.state.toUpperCase() == data.state.toUpperCase())
            // this.getAll_district(obj.id);

          } else {

            // this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);


          }

        }, error: (e) => {
          this.companyForm.patchValue({
            company_state: '',
            company_pincode: ''
          });
          console.log(e);
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);

        }
      })
  }

  change_GST() {
    this.companyForm.patchValue({
      company_name: '',
      company_address: '',
      gstinNoIsVerify_y_n: 'N',
    });

    this.show_gst_verify = true;
  }

  change_state(e: any) {
    let obj = JSON.parse(e.target.value);
    // console.log(obj.id);
    // return;

    this.companyForm.patchValue({
      company_state: obj.state,
      company_town_city: '',
    })

    // this.getAll_district(obj.id);
  }

  change_district(e: any) {
    let obj = JSON.parse(e.target.value);

    this.companyForm.patchValue({
      company_town_city: obj.district,
    })
  }

  updateEmployerBillingCompany() {

    this.companySubmitted = true;
    let data = this.companyForm.value;
    data['action'] = "UPDATECD";
    data['employer_mobile'] = this.emp_mobile;
    data['website_app_link'] = 'Akal.com';
    data['device_type'] = 'web'

    if (data.acGstinNo != '') {
      if (data.gstinNoIsVerify_y_n != 'Y') {
        // this.toastr.error('Please verify GSTIN number', 'Oops!');
        this._alertservice.error('Please verify GSTIN number', GlobalConstants.alert_options);

        return;
      }
    }

    // console.log(data);
    // return;

    if (this.companyForm.valid) {
      this._LoginService.updateEmployerBillingCompany(data)
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.companySubmitted = false;
              // this.toastr.success(resData.message, 'Success');
              this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);

              this.getEmployer_status();
            } else {
              // this.toastr.error(resData.message, 'Oops!');
              this._alertservice.error(resData.message, GlobalConstants.alert_options);

            }

          }, error: (e) => {
            // this.toastr.error(e.error.message, 'Oops!');
            this._alertservice.error(e.error.message, GlobalConstants.alert_options);

          }
        })

    } else {
      // this.toastr.error('Please fill all the required fields', 'Oops!');
      this._alertservice.error('Please fill all the required fields', GlobalConstants.alert_options);

    }

  }

  /****Terms & Agreement****/
  get_employer_aggreement() {
    this._LoginService.get_employer_aggreement({
      "productTypeId": this.product_type,
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.agreement_master = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))[0].employer_aggreement_desc;
          }
        }, error: (e) => {
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);

        }
      })
  }

  openAgreementPopup() {
    this.showAgreementPopup = true;
  }

  closeAgreementPopup() {
    this.showAgreementPopup = false;
  }


  accept_terms_conditions() {
    let data = this.agreementForm.value;
    // console.log(data);

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (data[key] == false) {
          this._alertservice.error('Please accept all the Terms and Conditions', GlobalConstants.alert_options);
          // this.toastr.error('Please accept all the Terms and Conditions', 'Oops!');
          return;
        }
      }
    }

    this._LoginService.employer_register({
      "accept_onboarded_akal_y_n": "Y", "accept_additional_charges_y_n": "Y",
      "accept_pf_esic_y_n": "Y", "accept_term_conditions_y_n": "Y", "flag": "EA",
      "employer_mobile": this.emp_mobile, "device_type": "web", "user_ip": "1",
      "productTypeId": this.product_type
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            // this.toastr.success(resData.message, 'Success');
            this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);

            this.getEmployer_status();

          } else {
            // this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);

          }
        }, error: (e) => {
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);

        }
      })
  }

  /****Starting Balance****/
  employerStartingPaymentset() {
    this._LoginService.employerStartingPaymentset({
      "employer_id": this.employer_id,
      "productTypeId": this.product_type,
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.signup_flag = 'SPI';
            let data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
            // console.log(data);

            this.starting_pay_amt = data.starting_pay_amt;

          } else {
            // this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);

          }
        }, error: (e) => {
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);

        }
      })
  }

  pay_starting_balance() {
    this.router.navigate(['/login/starting-balance'], {
      state: {
        product_type: this.product_type,
        starting_pay_amt: this.starting_pay_amt,
        mobile: this.emp_mobile
      }
    })
  }


}
