import { Component } from '@angular/core';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { LeaveMgmtService } from '../leave-mgmt.service';


@Component({
  selector: 'app-leave-settings',
  templateUrl: './leave-settings.component.html',
  styleUrls: ['./leave-settings.component.css'],
  animations: [grooveState, dongleState,]
})
export class LeaveSettingsComponent {

  showSidebar: boolean = true;
  decoded_token: any;
  tp_account_id: any;
  leave_template_data: any = [];
  default_template_id: any;
  product_type: any;
  showRemoveTemplatePopup: boolean = false;
  showUpdateTemplatePopup: boolean = false;
  leaveTemplateForm: FormGroup;
  showAssistantBtn: boolean = false;

  constructor(
    private _leaveMgmtService: LeaveMgmtService,
    private _EncrypterService: EncrypterService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private router: Router,
    private _formBuilder: FormBuilder,
  ) {
    // let assistant_status = localStorage.getItem('assistant_status');
    // if (assistant_status != null && assistant_status == 'Y') {
    //   this.showAssistantBtn = true;
    //   // this.showSidebar = false;
    // }

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

    this.get_tp_leave_temeplate();

    this.leaveTemplateForm = this._formBuilder.group({
      templateid: [''],
      templatedesc: [''],
      leave_type: [''],
      leaves_calender: [''],
      weekly_off_days: [''],
      weekly_off_days_name: [''],
      absent_is_equal_to_loss_of_pay: [''],
      attendance_approval_required_for_payout: [''],

    })

    // console.log(this.leaveTemplateForm.controls)
  }

  get ltf() {
    return this.leaveTemplateForm.controls;
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_tp_leave_temeplate() {
    this._leaveMgmtService.get_tp_leave_temeplate({
      "customeraccountid": this.tp_account_id.toString(),
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {

          this.leave_template_data = resData.commonData.data;
          for (let i = 0; i < this.leave_template_data.length; i++) {
            if (this.leave_template_data[i].default_template == true) {
              this.default_template_id = this.leave_template_data[i].templateid;
              break;
            }
          }
          // console.log(this.leave_template_data)
          // location.reload();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  addNewLeaveTemplate() {
    this.router.navigateByUrl('/leave-mgmt/add-new-template', { state: { default_templateId: this.default_template_id } });
  }

  set_default_template(data: any) {
    let templateid = data.templateid;
    let default_template_data = data;

    if (default_template_data.hasOwnProperty('is_used')) {
      delete default_template_data['is_used'];
    }

    // HUB Api Call
    this._leaveMgmtService.manageCustomerLeaveTemplate_hub({
      "action": "UpdateLeaveTemplateText",
      "customerAccountId": this.tp_account_id.toString(),
      "default_template_data": default_template_data,
      "productId": this.product_type.toString(),

    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {

          // CRM Api Call
          this._leaveMgmtService.getLeaveTemplate({
            "action": "set_default_template",
            "customeraccountid": this.tp_account_id.toString(),
            "default_templateId": templateid.toString(),
          }).subscribe((resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              this.get_tp_leave_temeplate();
            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          })

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      })

  }


  // Remove Leave Template
  openRemoveTemplatePopup(data: any) {
    // console.log(data);
    let leave_details = data.leave_details;

    this.showRemoveTemplatePopup = true;
    this.leaveTemplateForm.patchValue({
      templateid: data.templateid,
      templatedesc: data.templatedesc,
      leave_type: leave_details.leave_type,
      leaves_calender: leave_details.leaves_calender,
      weekly_off_days: leave_details.weekly_off_days,
      weekly_off_days_name: leave_details.weekly_off_days_name,
      absent_is_equal_to_loss_of_pay: leave_details.absent_is_equal_to_loss_of_pay,
      attendance_approval_required_for_payout: leave_details.attendance_approval_required_for_payout,

    });
  }

  closeRemoveTemplatePopup() {
    this.showRemoveTemplatePopup = false;
    this.leaveTemplateForm.patchValue({
      templateid: '',
      templatedesc: '',
      leave_type: [],
      leaves_calender: '',
      weekly_off_days: '',
      weekly_off_days_name: '',
      absent_is_equal_to_loss_of_pay: '',
      attendance_approval_required_for_payout: '',

    });
  }

  remove_template_by_id() {
    this._leaveMgmtService.getLeaveTemplate({
      "action": "remove_template_by_id",
      "customeraccountid": this.tp_account_id.toString(),
      "default_templateId": this.ltf.templateid.value.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (resData.commonData.data[0].msgcd == true) {
          this.toastr.success(resData.commonData.data[0].msg, 'Success');
          this.get_tp_leave_temeplate();
          this.closeRemoveTemplatePopup();
        } else {
          this.toastr.error(resData.commonData.data[0].msg, 'Oops!');
        }
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })

  }
  // Remove Leave Template


  // Update Leave Template
  update_leave_template_by_id(templateid: any) {

    this.router.navigateByUrl('/leave-mgmt/add-new-template', { state: { templateid: templateid, default_templateId: this.default_template_id } });

    // this._leaveMgmtService.check_template_is_editable({
    //   'accountId': this.tp_account_id.toString(),
    //   'template_id': templateid,
    // })
    // .subscribe((resData:any) => {
    //   if (resData.statusCode) {
    //     if (resData.commonData.msgcd == '0') {
    //       this.router.navigateByUrl('/leave-mgmt/add-new-template', { state: {templateid: templateid, default_templateId: this.default_template_id  } });
    //     } else {
    //       this.toastr.error(resData.message, 'Oops!');
    //     }

    //   } else {
    //     this.toastr.error(resData.message, 'Oops!');
    //   }
    // })

  }

  routeToAddEmp() {
    this.router.navigate(['/dashboard/compliance'], { state: { 'page': 'welcome' } });
  }

  routeToBulkLeave() {
    this.router.navigate(['/leave-mgmt/bulk-leave']);
  }

  display_week_off(data:any) {
    // console.log(data);
    if (!data) {
      return '';
    }
    let string = '';
    data.map((el:any) => {
      if (el.week_no.split(',').length == 5) {
        string += el.week_name + " (All), ";
      } else {
        string += el.week_name + " (" + (el.week_no) + "), ";
      }
    })

    return string.replace(/,\s*$/, '');;
  }
}
