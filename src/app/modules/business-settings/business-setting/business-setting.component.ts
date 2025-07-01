import { Component, ElementRef, ViewChild } from '@angular/core';
import { BusinesSettingsService } from '../business-settings.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { Router } from '@angular/router';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';


@Component({
  selector: 'app-business-setting',
  templateUrl: './business-setting.component.html',
  styleUrls: ['./business-setting.component.css']
})
export class BusinessSettingComponent {
  employerLogoForm: FormGroup;
  decoded_token: any;
  showSidebar: boolean = true;
  employer_profile: any = [];
  business_detail: FormGroup;
  payout_date_form: FormGroup;
  showAssistantBtn: boolean = false;
  tp_account_id: any;
  product_type: any = '';
  payout_days_arr: any = [];
  cur_payout_day: string = '';
  show_update_mobile_no: boolean = false;
  show_mobile_otp: boolean = false;
  show_email_otp: boolean = false;
  input_update_mobile_no: any = '';
  input_otp1: any = '';
  input_otp2: any = '';
  input_otp3: any = '';
  input_otp4: any = '';
  input_otp11: any = '';
  input_otp22: any = '';
  input_otp33: any = '';
  input_otp44: any = '';
  companyBillingAddress:any='';
  selectedAddressAccountID:any='';
  comformationAlertStatus:boolean=false;
  @ViewChild('otp1') otp1: ElementRef;
  @ViewChild('otp2') otp2: ElementRef;
  @ViewChild('otp3') otp3: ElementRef;
  @ViewChild('otp4') otp4: ElementRef;
  @ViewChild('otp11') otp11: ElementRef;
  @ViewChild('otp22') otp22: ElementRef;
  @ViewChild('otp33') otp33: ElementRef;
  @ViewChild('otp44') otp44: ElementRef;
  show_update_email: boolean = false;
  input_update_email: any = '';
  sanitizedFileName:any;
  logoData:any;

  constructor(private _BusinesSettingsService: BusinesSettingsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    private _formBuilder: FormBuilder,
    private _alertservice: AlertService,
    private router: Router) {

    if (this.router.getCurrentNavigation().extras.state != undefined && this.router.getCurrentNavigation().extras.state.page != undefined) {
      this.showAssistantBtn = true;
    }
  }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // localStorage.setItem('activeTab', 'id_Business-settings');
    
    for (let i = 1; i <= 31; i++) {
      this.payout_days_arr.push(i);

    };

    this.employerLogoForm = this._formBuilder.group({
      data: ['', [Validators.required]],
      name: ['', [Validators.required]],
      logo_url: [''],

      employerLogoSubmitted: false,
    });
    this.business_detail = this._formBuilder.group({
      employer_name: [''],
      user_type: [''],
      employer_mobile: [''],
      employer_email: [''],
      registered_address: [''],
      billing_address: [''],
      payout_date: ['']
    });
    this.payout_date_form = this._formBuilder.group({
      payout_date: ['']
    });
    this.get_employer_profile();
    this.getCompanyBillingAddress();
  }
  get el() {
    return this.employerLogoForm.controls;
  }
  // Employer logo save api
  empLogoSelect(event: any): void {
    const fileInput = event.target as HTMLInputElement;
  
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const fileName = file.name;
      const idxDot = fileName.lastIndexOf('.') + 1;
      const ext = fileName.substring(idxDot).toLowerCase();
  
      if (ext !== 'jpg' && ext !== 'jpeg' && ext !== 'png') {
        this.toastr.error('File should be in jpg, jpeg, or png format', 'Oops!');
        fileInput.value = ''; // Reset file input
        return;
      }
  
      const minSizeInBytes = 5 * 1024; // 50 KB
      const maxSizeInBytes = 500 * 1024; // 500 KB
      if (file.size < minSizeInBytes || file.size > maxSizeInBytes) {
        this.toastr.error(
          `Image file size should be between 5 KB and 500 KB. Current size: ${(file.size / 1024).toFixed(2)} KB`,
          'Oops!'
        );
        fileInput.value = ''; // Reset file input
        return;
      }
  
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const width = img.width;
          const height = img.height;
  
          const minWidth = 50;
          const maxWidth = 1000;
          const minHeight = 50;
          const maxHeight = 1000;
  
          if (width < minWidth || width > maxWidth || height < minHeight || height > maxHeight) {
            this.toastr.error(
              `Image dimensions should be between ${minWidth}x${minHeight} and ${maxWidth}x${maxHeight} pixels.`,
              'Oops!'
            );
            fileInput.value = ''; // Reset file input
            return;
          }
  
          // Valid File: Process and Update
          this.logoData = e.target.result;
          this.employerLogoForm.patchValue({
            data: this.logoData,
            name: file.name,
          });
  
          // console.log('Logo Data:', this.logoData);
          // console.log('Form Data:', this.employerLogoForm.value);
        };
      };
      reader.readAsDataURL(file);
    } else {
      this.toastr.error('Please choose a file.', 'Oops!');
    }
  }
  
  removeLogoPreview(): void {
    this.logoData = '';
    this.employerLogoForm.patchValue({
      data: '',
      name: '',
    });
    const fileInput = document.getElementById('empLogoId') as HTMLInputElement;
    fileInput.value = ''; // Reset file input
  }
  
  saveEmpLogo() {
    this.employerLogoForm.patchValue({
      employerLogoSubmitted: true,
    });
  
    // Fetch values for data and name
    const { data, name } = this.employerLogoForm.value;
  
    if (!data || !name) {
      this.toastr.error('kindly attach the Company Logo.', 'Oops!');
      return;
    }
  
    let payload = {
      ...this.employerLogoForm.value,
      accountid: this.tp_account_id.toString(), // Add account ID
    };
  
    if (this.employerLogoForm.valid) {
      this._BusinesSettingsService.update_employer_logo_path(payload).subscribe(
        (resData: any) => {
          if (resData.status) {
            this.toastr.success(resData.msg, 'Success');
            this.get_employer_profile();
            this.removeLogoPreview();
          } else {
            this.toastr.error(resData.msg, 'Oops!');
          }
        },
        (error) => {
          this.toastr.error('Form is invalid. Please check the fields.', 'Error');
        }
      );
    } else {
      this.toastr.error('Form is invalid. Please check the fields.', 'Error');
    }
  }
  
  get_employer_profile() {
    this._BusinesSettingsService
      .getEmployerProfile({
        customeraccountid: (this.tp_account_id),
        productTypeId: this.product_type,
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.employer_profile = resData.commonData;
          this.cur_payout_day = this.employer_profile.payout_frequency_dt;

          let subtext = 'th';
          if (this.cur_payout_day == '2' || this.cur_payout_day == '22') {
            subtext = 'nd';
          }
          if (this.cur_payout_day == '1' || this.cur_payout_day == '21' || this.cur_payout_day == '31') {
            subtext = 'st';
          }
          if (this.cur_payout_day == '3' || this.cur_payout_day == '23') {
            subtext = 'rd';
          }



          this.business_detail.patchValue(
            {
              employer_name: this.employer_profile.full_name,
              user_type: this.employer_profile.user_type,
              employer_mobile: this.employer_profile.employer_mobile,
              employer_email: this.employer_profile.employer_email,
              registered_address: (this.employer_profile.company_address + ' ' + this.employer_profile.company_town_city
                + ' ' + this.employer_profile.company_pincode + '  ' + this.employer_profile.company_state
              ).trim(),
              billing_address: this.employer_profile.bill_address + '  ' + this.employer_profile.bill_city + '  ' + this.employer_profile.bill_pincode + '  ' + this.employer_profile.bill_state,
              payout_date: this.employer_profile.payout_frequency_dt + subtext + ' of every month',
            }
          );

          this.payout_date_form.patchValue({ payout_date: this.employer_profile.payout_frequency_dt });

        } else {
          this.employer_profile = [];
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      });
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  SetPayoutForm() {

    //console.log( this.payout_date_form.controls['payout_date'].value );
    // this._BusinesSettingsService.saveLeaveTemplate(
    //   {
    //     action: 'PayoutDateSet',
    //     customeraccountid: JSON.stringify(this.tp_account_id),
    //     productTypeId: this.product_type,
    //     payout_frequency_dt: this.payout_date_form.controls['payout_date'].value
    //   }
    // ).subscribe((resDatatop: any) => {
    //   if (resDatatop.statusCode) {
    // this.toastr.success(resDatatop.message, 'Success!');

    this._BusinesSettingsService
      .updateEmployerProfile({
        action: 'PayoutDateSet',
        customeraccountid: JSON.stringify(this.tp_account_id),
        productTypeId: this.product_type,
        payout_frequency_dt: this.payout_date_form.controls['payout_date'].value
      })
      .subscribe((resData: any) => {
        //console.log(resData);
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.get_employer_profile();
        } else {
          this.employer_profile = [];
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        };
        //     });
        // } else {
        //   this.toastr.error(resDatatop.message, 'Oops!');
        // }
      });
  }

  routeToPayout() {
    this.router.navigate(['/business-settings/payout'], { state: { 'page': 'welcome' } });
  }

  /*****Update Mobile Number****/
  open_update_mobile_no() {
    this.show_update_mobile_no = true;
    this.input_update_mobile_no = this.business_detail.value.employer_mobile;
  }

  close_update_mobile_no() {
    this.show_update_mobile_no = false;
    this.input_update_mobile_no = '';
  }

  open_mobile_otp() {

    this._BusinesSettingsService.otp_send_mobile_email_update({
      action: 'otp_send_sms_update_mobile',
      employer_mobile: this.input_update_mobile_no.toString(),
      employer_email: '',
      customeraccountid: this.tp_account_id.toString(),

    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message, 'Success');

        this.show_mobile_otp = true;
        this.input_otp1 = '';
        this.input_otp2 = '';
        this.input_otp3 = '';
        this.input_otp4 = '';
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })

  }

  close_mobile_otp() {
    this.show_mobile_otp = false;
    this.input_otp1 = '';
    this.input_otp2 = '';
    this.input_otp3 = '';
    this.input_otp4 = '';
    // this.close_update_mobile_no();
  }

  otp_verify_mobile() {
    let email = !this.business_detail.value.employer_email ? '' : this.business_detail.value.employer_email;

    this._BusinesSettingsService.otp_verify_mobile_email_update({
      action: 'OTP_VERIFIY',
      employer_mobile: this.input_update_mobile_no,
      employer_email: email,
      otp: this.input_otp1 + this.input_otp2 + this.input_otp3 + this.input_otp4,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message, 'Success');
        this.update_employer_mobile();
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }

  update_employer_mobile() {
    let email = !this.business_detail.value.employer_email ? '' : this.business_detail.value.employer_email;

    this._BusinesSettingsService.update_employer_mobile_email({
      account_id: this.tp_account_id.toString(),
      employer_mobile: this.input_update_mobile_no,
      employer_email: email,
      action: 'usp_mob_email',
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.update_employer_mobile_email_hub('UpdateMobile', this.input_update_mobile_no);
        // this.close_mobile_otp();
        // this.close_update_mobile_no();
        // this.get_employer_profile();
        // this.toastr.success(resData.message, 'Success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }

  resend_mobile_otp() {
    this.input_otp1 = '';
    this.input_otp2 = '';
    this.input_otp3 = '';
    this.input_otp4 = '';
  }

  moveFocus(e: any, nextElement: any, prevElement: any) {
    // console.log(e.inputType);
    if (e.inputType == 'insertText') {
      if (nextElement) {
        nextElement.focus();
      }
      return;
    } else if (e.inputType == 'deleteContentBackward') {
      if (prevElement) {
        prevElement.focus();
      }
    }
  }
  /*****Update Mobile Number****/


  /*****Update Email ID******/
  open_update_email() {
    this.show_update_email = true;
    let email = !this.business_detail.value.employer_email ? '' : this.business_detail.value.employer_email;
    this.input_update_email = email;
  }
  close_update_email() {
    this.show_update_email = false;
    this.input_update_email = '';
  }

  open_email_otp() {
    this._BusinesSettingsService.otp_send_mobile_email_update({
      action: 'otp_send_sms_update_email',
      employer_mobile: this.business_detail.value.employer_mobile,
      employer_email: this.input_update_email,
      customeraccountid: this.tp_account_id.toString(),

    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message, 'Success');

        this.show_email_otp = true;
        this.input_otp11 = '';
        this.input_otp22 = '';
        this.input_otp33 = '';
        this.input_otp44 = '';
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })

  }

  close_email_otp() {
    this.show_email_otp = false;
    this.input_otp11 = '';
    this.input_otp22 = '';
    this.input_otp33 = '';
    this.input_otp44 = '';
    // this.close_update_mobile_no();
  }

  otp_verify_email() {
    this._BusinesSettingsService.otp_verify_mobile_email_update({
      action: 'OTP_VERIFIY_EMAIL',
      employer_mobile: this.business_detail.value.employer_mobile,
      employer_email: this.input_update_email,
      otp: this.input_otp11 + this.input_otp22 + this.input_otp33 + this.input_otp44,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message, 'Success');
        this.update_employer_email();
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }

  update_employer_email() {
    if (!this.input_update_email ) {
      this.toastr.error('Please enter an Email Id', 'Oops!');
      return;
    }
    this._BusinesSettingsService.update_employer_mobile_email({
      account_id: this.tp_account_id.toString(),
      employer_mobile: this.business_detail.value.employer_mobile,
      employer_email: this.input_update_email,
      action: 'usp_mob_email',
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.update_employer_mobile_email_hub('UpdateEmail', this.input_update_email);
        // this.close_email_otp();
        // this.close_update_email();
        // this.get_employer_profile();
        // this.toastr.success(resData.message, 'Success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }

  resend_email_otp() {
    this.input_otp11 = '';
    this.input_otp22 = '';
    this.input_otp33 = '';
    this.input_otp44 = '';
  }
  /*****Update Email ID******/

  update_employer_mobile_email_hub(action: any, accountField: any) {
    this._BusinesSettingsService.update_employer_mobile_email_hub({
      action: action,
      customerAccountId: this.tp_account_id.toString(),
      accountField: accountField,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          if (action == 'UpdateMobile') {
            this.close_mobile_otp();
            this.close_update_mobile_no();
          } else if (action == 'UpdateEmail') {
            this.close_email_otp();
            this.close_update_email();
          }
          this.get_employer_profile();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  getCompanyBillingAddress(){
    this._BusinesSettingsService.getCompanyBillingAddress({
      customeraccountid: this.tp_account_id.toString(),
      product_type: this.product_type,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode == true) {
          this.companyBillingAddress = resData.commonData;
        } else {
          this.companyBillingAddress = '';
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.companyBillingAddress = '';
        this.toastr.error(e.message, 'Oops!');
      }
    })

  }

  setBillingAddress(selectAccountId:any){
    this.selectedAddressAccountID = selectAccountId;
    this.comformationAlertStatus = true;
  }
  closeConfirmationAlert(){
    this.selectedAddressAccountID = '';
    this.comformationAlertStatus = false;
  }
  setDefaultBillingAddress(){
    this._BusinesSettingsService.setDefaultBillingAddress({
      customerAccountId: this.selectedAddressAccountID.toString()
    }).subscribe({
      next: (resData: any) => {
        this.comformationAlertStatus = false;
        if (resData.statusCode == true) {
          this.toastr.success(resData.message, 'Oops!');
        } else {
          this.selectedAddressAccountID = '';
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.selectedAddressAccountID = '';
        this.toastr.error(e.message, 'Oops!');
      }
    })
  }

}
