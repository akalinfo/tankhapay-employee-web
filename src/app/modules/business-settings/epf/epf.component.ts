import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
declare var $: any;
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ApprovalsService } from '../../approvals/approvals.service';
import { BusinesSettingsService } from '../business-settings.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';

@Component({
  selector: 'app-epf',
  templateUrl: './epf.component.html',
  styleUrls: ['./epf.component.css']
})
export class EpfComponent {

  showSidebar: boolean = true;
  EPF_Form:FormGroup;
  EPF_data:any=[];
  token: any = '';
  EPF :any;
  tp_account_id: any;
  product_type:any;
  data:any=[];
  epf_challan_generated:any;
  employee_contribution:any;
  employer_contribution:any;
  deduction_cycle:any;

  constructor(private fb: FormBuilder,
    private _BusinesSettingsService: BusinesSettingsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    private router: Router, private _alertservice: AlertService
  ) { }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.EPF_Form = this.fb.group({
      EPF_Number: ['', [Validators.required, Validators.pattern(GlobalConstants.EPFRegex)]],
      employer_contribution:[{value:'',disabled: true}],
      employee_contribution:[{value:'',disabled: true}],
      deduction_cycle:[{value:'',disabled: true}],
    });

    this.GetEmployer_SocialSecurity_Details();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }


  UpdateEmployer_Epf_Details() {
     this.EPF = this.EPF_Form.get('EPF_Number')?.value;
    // const EPF_regex = /^[A-Z]{2}[\s\/]?[A-Z]{3}[\s\/]?[0-9]{7}[\s\/]?[0-9]{3}[\s\/]?[0-9]{7}$/;
    const EPF_regex = /^[A-Z]{2}[\s\/]?[A-Z]{3}[\s\/]?[0-9]{7}[\s\/]?[0-9]{3}$/;

     if (this.EPF == '' ) {
      // this.toastr.error('Please Enter EPF Number', 'Oops!');
      this._alertservice.error('Please Enter EPF Number.', GlobalConstants.alert_options_autoClose);
      return;
    }

    else if(EPF_regex.test(this.EPF)== false){
      // this.toastr.error('Please Enter  Valid EPF Number', 'Oops!');
      this._alertservice.error('Please Enter  Valid EPF Number.', GlobalConstants.alert_options_autoClose);
      return;
    }

    else{
      this._BusinesSettingsService.UpdateEmployerEpfDetails({
        "epfRegistrationNumber": this.EPF,
        "customerAccountId": this.tp_account_id.toString(),
        "modifiedByIp": "::1",
        "modifiedBy": this.tp_account_id.toString(),
      }).subscribe((resData: any) => {
        console.log(resData);
        if (resData.statusCode) {
          this.EPF_data = resData.commonData;

          this.toastr.success(resData.message);
        } else {
          this.EPF_data = [];
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      });
    } 
  }

  GetEmployer_SocialSecurity_Details(){

    this._BusinesSettingsService.GetEmployerSocialSecurityDetails({
      "customerAccountId":this.tp_account_id.toString(),
      "socialSecurityType":"EPF",

    }).subscribe((resData: any) => {
      console.log(resData);
      if (resData.statusCode) {
        this.data = resData.commonData;

        this.EPF=resData.commonData?.epf_registration_number;
        this.employer_contribution=resData.commonData?.employer_contribution;
        this.employee_contribution=resData.commonData?.employee_contribution;
        this.deduction_cycle=resData.commonData?.deduction_cycle;
        this.epf_challan_generated = resData.commonData?.epf_challan_generated;

        this.EPF_Form.patchValue({
          EPF_Number:this.EPF,
          employer_contribution:this.employer_contribution,
          employee_contribution:this.employee_contribution,
          deduction_cycle:this.deduction_cycle
        })

        // this.toastr.success(resData.message);
      } else {
        this.data = [];
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }
  // GetEmployerSocialSecurityDetails
}
