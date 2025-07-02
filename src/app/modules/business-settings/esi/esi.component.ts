import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
declare var $: any;
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { BusinesSettingsService } from '../business-settings.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';

@Component({
  selector: 'app-esi',
  templateUrl: './esi.component.html',
  styleUrls: ['./esi.component.css']
})
export class EsiComponent {

  showSidebar: boolean = true;
  ESI_Form:FormGroup;
  ESI_data:any=[];
  token: any = '';
  ESI :any;
  tp_account_id: any;
  data:any=[];
  employee_contribution:any;
  employer_contribution:any;
  esi_challan_generated:any;
  deduction_cycle:any;
  product_type:any;

  constructor(private fb: FormBuilder,
    private _BusinesSettingsService: BusinesSettingsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _alertservice: AlertService,
    private router: Router,
  ) { }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.ESI_Form = this.fb.group({
      ESI_Number: ['', [Validators.required, Validators.pattern(GlobalConstants.ESIRegex)]],
      employer_contribution:[{value:'',disabled: true}],
      employee_contribution:[{value:'',disabled: true}],
      deduction_cycle:[{value:'',disabled: true}],
    });

  

    this.GetEmployer_SocialSecurity_Details();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }


  UpdateEmployer_Esi_Details() {
     this.ESI = this.ESI_Form.get('ESI_Number')?.value;
    //  console.log(this.ESI);
     
     const ESI_regex = /^(\d{2})[-–\s]?(\d{2})[-–\s]?(\d{1,6})[-–\s]?(\d{3})[-–\s]?(\d{4})$/;
    // valid ESI number => 31–00–123456–000–0001 <=
    // const ESI_regex=/^[A-Z]{2}-\d{7}-\d{7}$/

     if (this.ESI == '' ) {
      // this.toastr.error('Please Enter ESI Number', 'Oops!');
      this._alertservice.error('Please Enter ESI Number.', GlobalConstants.alert_options_autoClose);
      return;
    }

    else if(ESI_regex.test(this.ESI)== false){
      // this.toastr.error('Please Enter  Valid ESI Number', 'Oops!');
      this._alertservice.error('Please Enter  Valid ESI Number.', GlobalConstants.alert_options_autoClose);
      return;
    }

    else{
      this._BusinesSettingsService.UpdateEmployerEsiDetails({
        "esiRegistrationNumber": this.ESI,
        "customerAccountId": this.tp_account_id.toString(),
        "modifiedByIp": "::1",
        "modifiedBy": this.tp_account_id.toString(),
      }).subscribe((resData: any) => {
        console.log(resData);
        if (resData.statusCode) {
          this.ESI_data = resData.commonData;
          this.toastr.success(resData.message);
        } else {
          this.ESI_data = [];
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      });
    } 
  }

  GetEmployer_SocialSecurity_Details(){
    this._BusinesSettingsService.GetEmployerSocialSecurityDetails({
      "customerAccountId":this.tp_account_id.toString(),
      "socialSecurityType":"ESI",

    }).subscribe((resData: any) => {
      console.log(resData);
      if (resData.statusCode) {
        this.data = resData.commonData;
        this.ESI=resData.commonData?.esi_registration_number;
        this.employer_contribution=resData.commonData?.employer_contribution;
        this.employee_contribution=resData.commonData?.employee_contribution;
        this.deduction_cycle=resData.commonData?.deduction_cycle;
        this.esi_challan_generated = resData.commonData?.esi_challan_generated;

        this.ESI_Form.patchValue({
          ESI_Number:this.ESI,
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

}
