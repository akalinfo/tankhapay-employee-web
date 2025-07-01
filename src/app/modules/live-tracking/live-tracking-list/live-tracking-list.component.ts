import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LiveTrackingService } from '../live-tracking.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { Router } from '@angular/router';
import { GeofencingService } from '../../business-settings/geofences/geofencing.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-live-tracking-list',
  templateUrl: './live-tracking-list.component.html',
  styleUrls: ['./live-tracking-list.component.css']
})
export class LiveTrackingListComponent {
  showSidebar: boolean = true;
  decoded_token: any;
  tp_account_id: any;
  userid: any;
  sso_admin_id: any;
  liveTracking_list_data: any = [];
  product_type: string;
  liveTracking_list_data_count: any;



  constructor(
    private _formBuilder: FormBuilder,
    private liveTrackingService: LiveTrackingService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _EncrypterService: EncrypterService,
    private router: Router,
    private geofenceService: GeofencingService,
    private _alertservice: AlertService) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.userid = this.decoded_token.userid;
    this.product_type = localStorage.getItem('product_type');
    this.sso_admin_id = this.decoded_token.sso_admin_id

    this.get_liveTrackingList();



  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_liveTrackingList() {
    this.liveTrackingService.GetEmpEventLiveTrackingDetails({
      "productTypeId": (this.product_type).toString(),
      "customerAccountId": (this.tp_account_id).toString(),
      "actionType": "CustomerLiveTrackingEnabledEmployees",
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.liveTracking_list_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));        
        this.liveTracking_list_data_count = this.liveTracking_list_data.length;
        // console.log(this.campaign_detail__data);
      } else {
        this.liveTracking_list_data = [];
        this.liveTracking_list_data_count = 0;
        this.toastr.error(resData.message);
      }
    });
  }

  liveTrackingParticularId(emp_code: any) {
    this.router.navigate(['/live-tracking-list/view/', this._EncrypterService.aesEncrypt(emp_code.toString())]);
  }
}
