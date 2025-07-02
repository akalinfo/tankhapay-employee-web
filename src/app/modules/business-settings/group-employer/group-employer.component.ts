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
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-group-employer',
  templateUrl: './group-employer.component.html',
  styleUrls: ['./group-employer.component.css']
})
export class GroupEmployerComponent {
  
  decoded_token: any;
  showSidebar: boolean = true;
  employer_profile: any = [];
  business_detail: FormGroup;
  showAssistantBtn: boolean = false;
  tp_account_id: any;
  product_type: any = '';
  selectedAddressAccountID:any='';
  comformationAlertStatus:boolean=false;
  cur_payout_day: any;
  business_login_url: string;
  user_id: any;
  employerProfiles: any;

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
    console.log("TOKEN -", this.decoded_token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.user_id = this.decoded_token?.id;
    this.business_login_url = environment.business_sso_route_url;
    this.getSwitchEmployerProfileData();
  }
  

  getSwitchEmployerProfileData(){
   
    let obj = {
      action: 'account_switch_details_allAddress',
      customeraccountid: this.tp_account_id.toString()
    }

    this._BusinesSettingsService.getSwitchEmployerProfileData(obj).subscribe({
      next: (resData: any) => {
        if (resData.statusCode == true) {
          this.employerProfiles = resData.commonData;
          console.log("employerProfiles ----", this.employerProfiles)
        } else {
          this.employerProfiles = '';
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.employerProfiles = '';
        this.toastr.error(e.message, 'Oops!');
      }
    })

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  setBillingAddress(selectAccountId:any){
    this.selectedAddressAccountID = selectAccountId;
    this.comformationAlertStatus = true;
  }
  closeConfirmationAlert(){
    this.selectedAddressAccountID = '';
    this.comformationAlertStatus = false;
  }

  // Employee-SSO Login - new tab 
  // routeToBusinessLogin(mobile_no: any) {
  //   alert(this.business_login_url + '/' + this.user_id + '/' + mobile_no);
  //   window.open(this.business_login_url + '/' + this.user_id + '/' + mobile_no, '_blank');
  // }

  // Employee-SSO Login - same tab
  routeToBusinessLogin(employer: any): void {
    if(employer?.tp_account_id != this.tp_account_id){
    const fullUrl = `${this.business_login_url}/${employer?.business_login_id}/${employer?.sso_employer_mobile}`;
    // alert(fullUrl);
    window.location.href = fullUrl;
    } else {
      this.toastr.info("User Already Logged In!");
    }
  }

  getInitials(name: string): string {
    if (!name) return '';
    
    // Remove anything in brackets and trim
    const cleanName = name.replace(/\[.*?\]/g, '').trim();
    if (!cleanName) return '';
    
    // Split into parts and get initials
    const nameParts = cleanName.split(/\s+/);
    const initials = nameParts
        .map(part => part.charAt(0).toUpperCase())
        .join('');
    
    return initials;
}
  


}
