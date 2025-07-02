import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { LeaveMgmtService } from '../leave-mgmt.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';

@Component({
  selector: 'app-leave-type',
  templateUrl: './leave-type.component.html',
  styleUrls: ['./leave-type.component.css'],
  animations: [dongleState, grooveState],
})
export class LeaveTypeComponent {

  showSidebar: boolean = true;
  tp_account_id: any;
  leave_type_master_data: any = [];
  decoded_token: any;
  showLeaveTypePopup: boolean = false;
  leaveTypeForm: FormGroup;
  leavePopupTitle: any = '';

  constructor(
    private _leaveMgmtService: LeaveMgmtService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    // this.product_type = localStorage.getItem('product_type');

    this.leaveTypeForm = this._formBuilder.group({
      action: [''],
      leavecode: ['', [Validators.required]],
      leavetypename: ['', [Validators.required]],
      leavetypeid: [''],
      leave_ctg : [''],
      leave_days: [''],
      isHalfDayLeave: ['N'],
      gender: [''],
    })

    this.getLeaveTemplate();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getLeaveTemplate() {
    this._leaveMgmtService.getLeaveTemplate({
      'customeraccountid': this.tp_account_id.toString(),
      'action': 'get_lead_type'
    }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.leave_type_master_data = resData.commonData.data;

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  get_color_class(index: any) {
    const color_class: any = ['CL5', 'CL2', 'CL10', 'CL5', 'CL9', 'CL3'];
    return color_class[index % color_class.length];

  }

  addNewLeaveType() {
    this.leavePopupTitle = 'Add New';
    this.showLeaveTypePopup = true;
    this.leaveTypeForm.controls['leavecode'].enable({ emitEvent: false });

    this.leaveTypeForm.patchValue({
      action: 'add_leave_type',
    })
  }

  updateLeaveType(data: any) {

    // console.log("data object:",data);
    this.leavePopupTitle = 'Update';
    this.showLeaveTypePopup = true;
    this.leaveTypeForm.controls['leavecode'].disable({ emitEvent: false });

    this.leaveTypeForm.patchValue({
      action: 'update_leave_type',
      leavetypeid: data.type_rowid,
      leavetypename: data.leavetypename,
      leavecode: data.leavetype,
      leave_ctg: data.leave_ctg,
      leave_days: !data.leave_days ? '' : data.leave_days,
      isHalfDayLeave: data?.is_halfday_leave, // patching new param
      gender: !data.t_gender ? '' : data.t_gender,
    })
    // console.log(this.leaveTypeForm.value);
    // console.log('After disable:', this.leaveTypeForm.getRawValue());
    
  }

  closeLeaveTypePopup() {
    this.showLeaveTypePopup = false;
    this.leaveTypeForm.patchValue({
      action: '',
      leavetypeid: '',
      leavecode: '',
      leavetypename: '',
      leave_ctg: '',
      leave_days: '',
      isHalfDayLeave: '',
      gender: '',
    })
  }

  add_update_leave_type() {
    let data = this.leaveTypeForm.getRawValue();

    let gender = '';
    if (!data.leave_days) {
      gender = '';
    } else {
      gender = data.gender;
    }

    let obj = {
      customeraccountid: this.tp_account_id,
      action: data.action,
      leavetypeid: data.leavetypeid,
      leavecode: data.leavecode,
      leavetypename: data.leavetypename,
      leave_ctg: data.leave_ctg,
      leave_days: !data.leave_days ? 0 : data.leave_days,
      is_halfday_leave: data.isHalfDayLeave || 'N', // new param addition
      gender: gender
    };

    this._leaveMgmtService.add_update_leave_type(obj).subscribe({
      next: (resData: any) => {

        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.getLeaveTemplate();
          this.closeLeaveTypePopup();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }

      }, error: (e) => {
        console.log(e);
      }
    })
  }

  check_is_enable(val:any) {
    let ans = val == 'Y' ? true : false;
    return ans;
  }

  change_enable_disable(check:any, data:any) {
    let action:any;
    if (check) {
      action = 'add_leave_type_enable';
    } else {
      action = 'add_leave_type_desable';
    }

    this._leaveMgmtService.leave_type_enable_desable({
      action: action,
      customeraccountid: data.type_account_id,
      leavetypeid: data.type_rowid,
    }).subscribe({
      next: (resData:any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.getLeaveTemplate();
        } else {
          this.getLeaveTemplate();
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.getLeaveTemplate();
        console.log(e);
      }
    })
  }

  check_digits(event: any) {
    const input = event.target as HTMLInputElement;
    const regex = /^(?:([1-9]?[0-9]|[12][0-9]{2}|300)?(\.\d{0,2})?)?$/;


    if (!regex.test(input.value)) {
      this.leaveTypeForm.patchValue({
        leave_days: '',
      });
    } else {
      this.leaveTypeForm.patchValue({
        leave_days: input.value,
      });
    }
  }

  // Start - half day leave setting sidharth kaul dated. 14.05.2025
  get antctrl() {
    return this.leaveTypeForm.controls;
  }

  change_isHalfDayLeave(check: any) {
    // console.log("CHECK-------", check)
    let value = check ? 'Y' : 'N';
    this.leaveTypeForm.patchValue({
      isHalfDayLeave: value,
    })
  }
  
  isHalfDayLeave(val: any) {
    let isHalfDayLeave = !this.antctrl.isHalfDayLeave.value ? '' : this.antctrl.isHalfDayLeave.value;
    return isHalfDayLeave.includes(val);
  }
  // End - half day leave setting


}
