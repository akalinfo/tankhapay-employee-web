import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { LoginService } from '../../login/login.service';
import { EncrypterService } from '../../../shared/services/encrypter.service'
import { EmployeeService } from '../../employee/employee.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode'
import { Router } from '@angular/router';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';

@Component({
  selector: 'app-compliance',
  templateUrl: './compliance.component.html',
  styleUrls: ['./compliance.component.css']
})
export class ComplianceComponent {

  showSidebar: boolean = false;
  showNext: boolean = false;
  accountid: any;
  EPF_Form: FormGroup;
  decoded_token: any;
  product_type: any;
  EPF_data: any = [];
  ESI_Form: FormGroup;
  esi_challan_generated: any;
  epf_challan_generated: any;
  showAssistantBtn: boolean = false;
  tdsForm: FormGroup;
  activeTab: string = 'PF';
  complianceMessage: string;
  grpInsuranceForm : FormGroup

  constructor(
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _BusinesSettingsService: BusinesSettingsService,
  ) {
    if (this.router.getCurrentNavigation().extras.state != undefined && this.router.getCurrentNavigation().extras.state.page != undefined) {
      this.showAssistantBtn = true;
    }
  }

  ngOnInit() {

    let session_obj = JSON.parse(this._sessionService.get_user_session());
    let decoded_token: any = jwtDecode(session_obj.token);
    this.accountid = decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.EPF_Form = this._formBuilder.group({
      EPF_Number: ['', [Validators.required, Validators.pattern(GlobalConstants.EPFRegex)]],
      employer_contribution: [{ value: '', disabled: true }],
      employee_contribution: [{ value: '', disabled: true }],
      deduction_cycle: [{ value: '', disabled: true }],
      is_epf_registered: [''],
      // added on dated. 18.09.2024
      employerpfincludeinctc: [''],
      edli_adminchargesincludeinctc: [''],
      pfonbasiconly: [''],
      pfcapapplied: ['']
      // end
    });

    this.ESI_Form = this._formBuilder.group({
      ESI_Number: ['', [Validators.required, Validators.pattern(GlobalConstants.ESIRegex)]],
      employer_contribution: [{ value: '', disabled: true }],
      employee_contribution: [{ value: '', disabled: true }],
      deduction_cycle: [{ value: '', disabled: true }],
      is_esi_registered: [''],
    });

    this.tdsForm = this._formBuilder.group({
      is_salary_tds_payments: [''],
    });

    this.grpInsuranceForm = this._formBuilder.group({
      is_group_insurance:  ['']
    })

    this.GetEmployer_SocialSecurity_Details('ESI');
    this.GetEmployer_SocialSecurity_Details('EPF');
    this.GetEmployer_SocialSecurity_Details('TDS');
    this.GetEmployer_SocialSecurity_Details('GROUPINSURANCE');

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get epf() {
    return this.EPF_Form.controls;
  }

  get esif() {
    return this.ESI_Form.controls;
  }

  get tf() {
    return this.tdsForm.controls;
  }

  get grpIns(){
    return this.grpInsuranceForm.controls;
  }

  nextPage() {
    this.router.navigate(['/employees'], { state: { 'page': 'welcome' } });
  }



  /***********Updated Design & Code*******************/


  GetEmployer_SocialSecurity_Details(action: any) {

    this._BusinesSettingsService.GetEmployerSocialSecurityDetails({
      "customerAccountId": this.accountid.toString(),
      "socialSecurityType": action,

    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {

        if (action == 'EPF') {
          this.EPF_Form.patchValue({
            EPF_Number: resData.commonData?.epf_registration_number,
            employer_contribution: resData.commonData?.employer_contribution,
            employee_contribution: resData.commonData?.employee_contribution,
            deduction_cycle: resData.commonData?.deduction_cycle,
            is_epf_registered: resData.commonData?.is_epf_registered,
            edli_adminchargesincludeinctc: resData.commonData?.edli_adminchargesincludeinctc,
            employerpfincludeinctc: resData.commonData?.employerpfincludeinctc,
            pfcapapplied: resData.commonData?.pfcapapplied,
            pfonbasiconly: resData.commonData?.pfonbasiconly

          })
          this.epf_challan_generated = resData.commonData?.epf_challan_generated;

        }

        if (action == 'ESI') {
          this.ESI_Form.patchValue({
            ESI_Number: resData.commonData?.esi_registration_number,
            employer_contribution: resData.commonData?.employer_contribution,
            employee_contribution: resData.commonData?.employee_contribution,
            deduction_cycle: resData.commonData?.deduction_cycle,
            is_esi_registered: resData.commonData?.is_esi_registered,
          })
          this.esi_challan_generated = resData.commonData?.esi_challan_generated;

        }

        if (action == 'TDS') {
          let is_salary_tds_payments_val = !resData.commonData.tds_enablestatus ? '' : resData.commonData.tds_enablestatus;
          this.tdsForm.patchValue({
            is_salary_tds_payments: is_salary_tds_payments_val,
          })
        }

        if(action=='GROUPINSURANCE'){
          this.grpInsuranceForm.patchValue({
            is_group_insurance :  resData.commonData?.groupinsurance_enablestatus
          })
        }

        // this.toastr.success(resData.message);
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    });
  }
  // added on dated. 18.09.2024
  change_employerpfincludeinctc(check: any) {
    let value = check ? 'Y' : 'N';
    this.EPF_Form.patchValue({
      employerpfincludeinctc: value,
    });
  }

  change_edli_adminchargesincludeinctc(check: any) {
    let value = check ? 'Y' : 'N';
    this.EPF_Form.patchValue({
      edli_adminchargesincludeinctc: value,
    });
  }

  change_pfonbasiconly(check: any) {
    let value = check ? 'Y' : 'N';
    this.EPF_Form.patchValue({
      pfonbasiconly: value,
    });
  }

  change_pfcapapplied(check: any) {
    let value = check ? 'Y' : 'N';
    this.EPF_Form.patchValue({
      pfcapapplied: value,
    });
  }
  // added on date 18.09.2024
  UpdateEmployer_Epf_Details() {
    let EPF = this.EPF_Form.get('EPF_Number')?.value;
    //GNGGN3174172000
    const EPF_regex = /^[A-Z]{2}[\s\/]?[A-Z]{3}[\s\/]?[0-9]{7}[\s\/]?[0-9]{3}$/;

    ///^[A-Z]{2}[\s\/]?[A-Z]{3}[\s\/]?[0-9]{7}[\s\/]?[0-9]{3}[\s\/]?[0-9]{7}$/;

    //let EPF_regex= GlobalConstants.EPFRegex
    if (EPF == '') {
      this.toastr.error('Please Enter EPF Number', 'Oops!');
      return;
    }

    else if (EPF_regex.test(EPF) == false) {
      this.toastr.error('Please Enter Valid EPF Number', 'Oops!');
      return;
    }

    else {
      this._BusinesSettingsService.UpdateEmployerEpfDetails({
        "epfRegistrationNumber": EPF,
        "customerAccountId": this.accountid.toString(),
        "modifiedByIp": "::1",
        "modifiedBy": this.accountid.toString(),
        "employerpfincludeinctc": this.EPF_Form.get('employerpfincludeinctc')?.value,           
        "edli_adminchargesincludeinctc": this.EPF_Form.get('edli_adminchargesincludeinctc')?.value,
        "pfonbasiconly": this.EPF_Form.get('pfonbasiconly')?.value,
        "pfcapapplied": this.EPF_Form.get('pfcapapplied')?.value,
      }).subscribe((resData: any) => {
        console.log(resData);
        if (resData.statusCode) {
          //this.EPF_data = resData.commonData;

          // update the code to payrolling db dadded on dated. 18.09.2024
          // console.log({
          //   "employerpfincludeinctc": this.EPF_Form.get('employerpfincludeinctc')?.value,
          //   "customerAccountId": this.accountid.toString(),
          //   "edli_adminchargesincludeinctc": this.EPF_Form.get('edli_adminchargesincludeinctc')?.value,
          //   "pfonbasiconly": this.EPF_Form.get('pfonbasiconly')?.value,
          //   "pfcapapplied": this.EPF_Form.get('pfcapapplied')?.value,
          // });
          // return;

          // this._BusinesSettingsService.save_business_compliance({
          //   'action': 'manage_save_update_compliance',
          //   "account_id": this.accountid.toString(),
          //   "employerpfincludeinctc": this.EPF_Form.get('employerpfincludeinctc')?.value,           
          //   "edli_adminchargesincludeinctc": this.EPF_Form.get('edli_adminchargesincludeinctc')?.value,
          //   "pfonbasiconly": this.EPF_Form.get('pfonbasiconly')?.value,
          //   "pfcapapplied": this.EPF_Form.get('pfcapapplied')?.value,
          // })
          //   .subscribe((resData2: any) => {
          //     console.log(resData2);
          //     if (resData2.statusCode) {
          //       this.EPF_data = resData2.commonData;
          //       this.toastr.success(resData2.message);
          //     } else {
          //       this.EPF_data = [];
          //       this.toastr.error(resData2.message, 'Oops!');
          //     }
          //   });
          this.toastr.success(resData.message);
          this.refreshMaterializedViewByApi('tpay-business-account');
        } else {
          this.EPF_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      });




      // end 

    }
  }

  UpdateEmployer_Esi_Details() {
    //69000986040000910
    let ESI = this.ESI_Form.get('ESI_Number')?.value;
    //  console.log(this.ESI);

    const ESI_regex = /^(\d{2})[--\s]?(\d{2})[--\s]?(\d{1,6})[--\s]?(\d{3})[--\s]?(\d{4})$/
    //  /^(\d{2})[-–\s]?(\d{2})[-–\s]?(\d{1,6})[-–\s]?(\d{3})[-–\s]?(\d{4})$/;

    // valid ESI number => 31–00–123456–000–0001 <=
    // const ESI_regex=/^[A-Z]{2}-\d{7}-\d{7}$/

    if (ESI == '') {
      this.toastr.error('Please Enter ESI Number', 'Oops!');
      return;
    }

    else if (ESI_regex.test(ESI) == false) {
      this.toastr.error('Please Enter Valid ESI Number', 'Oops!');
      return;
    }

    else {
      this._BusinesSettingsService.UpdateEmployerEsiDetails({
        "esiRegistrationNumber": ESI,
        "customerAccountId": this.accountid.toString(),
        "modifiedByIp": "::1",
        "modifiedBy": this.accountid.toString(),
      }).subscribe((resData: any) => {
        console.log(resData);
        if (resData.statusCode) {
          this.toastr.success(resData.message);
          this.refreshMaterializedViewByApi('tpay-business-account');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      });
    }
  }

  DisableStatutoryCompliance(action: any) {
    this._BusinesSettingsService.DisableStatutoryCompliance({
      'action': action,
      'customerAccountId': this.accountid.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.refreshMaterializedViewByApi('tpay-business-account');

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e)
      }
    })
  }

  //**********TDS Form***************/
  updateEmployer_TDS_Details(action: any) {
    let data = this.tdsForm.value;

    if (!data.is_salary_tds_payments) {
      this.toastr.error('Please enable/disable Salary Payment Status', 'Oops!');
      return;
    }

    this._BusinesSettingsService.DisableStatutoryCompliance({
      'action': action,
      'customerAccountId': this.accountid.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })

  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.updateMessage(tab);
  }

  updateMessage(tab: string): void {
    if (tab === 'PF' || tab === 'ESIC') {
      this.complianceMessage = 'To provide ESI and PF to your employees, enable these options and add your PF and ESI numbers.';
    } else if (tab === 'TDS') {
      this.complianceMessage = "Please note that disabling TDS payment does not prevent the deduction from your employee's payslips.";
    } else {
      this.complianceMessage = '';
    }
  }

  
  refreshMaterializedViewByApi(action: any) {

    this._BusinesSettingsService.RefreshMaterializedViewByApi({
      'action': action
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          // this.toastr.success(resData.message, 'Success');
          console.log('Refresh Success');

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e)
      }
    })
  }

}
