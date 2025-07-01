import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeaveMgmtService } from '../leave-mgmt.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { DatePipe } from '@angular/common';
import { PopoverDirective } from 'ngx-bootstrap/popover';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.css'],
  providers: [DatePipe]
})
export class GeneralSettingsComponent {

  // @ViewChild('popoverFrom') popoverFrom: PopoverDirective;
  // @ViewChild('popoverContentFrom') popoverContentFrom: ElementRef<HTMLElement>;
  // @ViewChild('popoverTo') popoverTo: PopoverDirective;
  // @ViewChild('popoverContentTo') popoverContentTo: ElementRef<HTMLElement>;

  showSidebar: boolean = false;
  generalForm: FormGroup;
  decoded_token: any;
  tp_account_id: any;
  leave_type_master_data: any = [];

  lbl_show_ho_msg : string = '(i.e) 1 day(s) x 1 = 1 day(s)';
  lbl_show_wk_msg : string = '(i.e) 1 day(s) x 1 = 1 day(s)';

  dropdownSettings: any = {
    singleSelection: false,
    idField: 'typecode',
    textField: 'typename',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    // itemsShowLimit: 3,
    allowSearchFilter: true,
    width: 20
  };

  // dropdownSettings: any = {
  //   singleSelection: false,
  //   idField: 'typecode',
  //   textField: 'typename',
  //   selectAllText: 'Select All',
  //   unSelectAllText: 'UnSelect All',
  //   itemsShowLimit: 3,
  //   allowSearchFilter: true,
  //   width: 20
  // };
  // selectedLeaveTypes: any[] = [];
  submitted: boolean = false;
  halfDayTime: Date;
  fullDayTime: Date;


  constructor(
    private _formBuilder: FormBuilder,
    private _leaveMgmtService: LeaveMgmtService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private _sessionService: SessionService,
  ) { }

  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    this.generalForm = this._formBuilder.group({
      leave_count_for_ho_wk: [''],
      applicable_leave_types: [''],
      comp_request_mode_entry: ['monthly', Validators.required],
      comp_request_for_future_dt_yn: ['N'],
      credited_leave_expires_after_type: ['days'],
      max_leaves_per_compoff : ['1'],
      // min_halfday_hrs: [''],
      // min_fullday_hrs: ['',],
      units_allowed: [''],
      durations_allowed: [''],
      time_input_yn: ['N'],
      make_reason_mandatory_yn: ['N'],
      lrp_unpaid_leave_to_be_marked_as_lop_yn: ['Y'],
      lrp_unpaid_leave_lop_max_allowed_days: ['', [Validators.max(31)]],
      allow_leave_requests_until_the_next_no_of_yr: [''],
      lcs_past_leaves_within_current_pay_period: [''],
      lcs_current_day_upcoming_leave_requests: [''],
      lcs_allow_partial_leave_cancellation_yn: ['N'],
      lcs_is_leave_cancellation_reason_mandatory_yn: ['N'],

      is_comp_off_applicable: [''],
      leave_credit_count_for_wk: ['1.0'],
      leave_credit_count_for_ho: ['1.0'],
      per_month_max_comp_off: [''],
      credited_leave_expires_after: ['0'],
      comp_off_applicable_type: [''],
      comp_off_applicable_type_dayname: [''],

      // resource_report: [''],
      // leavedisplayformat: [''],
    });

    this.getLeaveTemplate();
    this.get_leave_general_settings();
  }

  // Start -Time Picker

  // togglePopover(popover:any) {
  //   if (popover.isOpen) {
  //      popover.hide();
  //   } else {
  //      popover.show();
  //   }
  // }

  // formatTime(time: any, controlName: string) {
  //   const formattedTime = this.datePipe.transform(time, 'HH:mm') || '';
  //   this.generalForm.controls[controlName].setValue(formattedTime);
  // }

  // End -Time Picker

  get gf() {
    return this.generalForm.controls;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
//
  getLeaveTemplate() {
        this._leaveMgmtService.get_leave_types_by_account({
      'customeraccountid': this.tp_account_id.toString(),
      'action': 'get_leave_type'
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.leave_type_master_data = resData.commonData;
          this.get_leave_general_settings();

        } else {
          this.leave_type_master_data = [];
          //this.toastr.error(resData.message, 'Oops!');
        }
      })
    // this._leaveMgmtService.getLeaveTemplate({
    //   'customeraccountid': this.tp_account_id.toString(),
    //   'action': 'get_lead_type'
    // })
    //   .subscribe((resData: any) => {
    //     if (resData.statusCode) {
    //       this.leave_type_master_data = resData.commonData.data;
    //       this.get_leave_general_settings();

    //     } else {
    //       this.leave_type_master_data = [];
    //       this.toastr.error(resData.message, 'Oops!');
    //     }
    //   })
  }

  change_comp_request_for_future_dt_yn(val: any) {
    // console.log(val);
    this.generalForm.patchValue({
      comp_request_for_future_dt_yn: val,
    })
  }

  change_unit_allowed(val: any) {
    if (val == 'hour') {
      this.generalForm.patchValue({
        durations_allowed: '',
      })
    }
  }

  change_durations(val: any, check: any) {
    // console.log(val, check);
    let arr = !this.gf.durations_allowed.value ? [] : this.gf.durations_allowed.value.split(',');
    let value_arr = [];
    // console.log(arr);

    if (check) {
      value_arr = [...arr];
      value_arr.push(val);
    } else {
      value_arr = arr.filter(el => el != val);
    }

    this.generalForm.patchValue({
      durations_allowed: value_arr.join(','),
    })
    // console.log(this.gf.durations_allowed.value);
  }
  isDurationChecked(val: string): boolean {
    const allowedDurations = this.gf.durations_allowed.value ? this.gf.durations_allowed.value.split(',') : [];
    return allowedDurations.includes(val);
  }

  change_time_input_yn(val: any) {
    this.generalForm.patchValue({
      time_input_yn: val,
    })
  }

  change_make_reason_mandatory_yn(check: any) {
    let val = check ? 'Y' : 'N';
    this.generalForm.patchValue({
      make_reason_mandatory_yn: val,
    })
  }


  change_lrp_unpaid_leave_to_be_marked_as_lop_yn() {
    let lrp_unpaid_leave_to_be_marked_as_lop_yn = this.gf.lrp_unpaid_leave_to_be_marked_as_lop_yn.value;
    let val = lrp_unpaid_leave_to_be_marked_as_lop_yn == 'Y' ? 'N' : 'Y';
    this.generalForm.patchValue({
      lrp_unpaid_leave_to_be_marked_as_lop_yn: val,
      lrp_unpaid_leave_lop_max_allowed_days: '',
    })
  }


  change_lcs_past_leaves_within_current_pay_period(val: any, check: any) {
    let arr = !this.gf.lcs_past_leaves_within_current_pay_period.value ? [] : this.gf.lcs_past_leaves_within_current_pay_period.value.split(',');
    let value_arr = [];
    // console.log(arr);

    if (check) {
      value_arr = [...arr];
      value_arr.push(val);
    } else {
      value_arr = arr.filter(el => el != val);
    }

    this.generalForm.patchValue({
      lcs_past_leaves_within_current_pay_period: value_arr.join(','),
    })
  }
  is_lcs_past_leaves_within_current_pay_period_Checked(val: string): boolean {
    const lcs_past_leaves_within_current_pay_period = this.gf.lcs_past_leaves_within_current_pay_period.value ? this.gf.lcs_past_leaves_within_current_pay_period.value.split(',') : [];
    return lcs_past_leaves_within_current_pay_period.includes(val);
  }


  change_lcs_current_day_upcoming_leave_requests(val: any, check: any) {

    let arr = !this.gf.lcs_current_day_upcoming_leave_requests.value ? [] : this.gf.lcs_current_day_upcoming_leave_requests.value.split(',');
    let value_arr = [];
    // console.log(arr);

    if (check) {
      value_arr = [...arr];
      value_arr.push(val);
    } else {
      value_arr = arr.filter(el => el != val);
    }

    this.generalForm.patchValue({
      lcs_current_day_upcoming_leave_requests: value_arr.join(','),
    })
  }
  is_lcs_current_day_upcoming_leave_requests_Checked(val: string): boolean {
    const lcs_current_day_upcoming_leave_requests = this.gf.lcs_current_day_upcoming_leave_requests.value ? this.gf.lcs_current_day_upcoming_leave_requests.value.split(',') : [];
    return lcs_current_day_upcoming_leave_requests.includes(val);
  }


  change_lcs_allow_partial_leave_cancellation_yn(check: any) {
    let val = check ? 'Y' : 'N';
    this.generalForm.patchValue({
      lcs_allow_partial_leave_cancellation_yn: val,
    })
  }
  change_lcs_is_leave_cancellation_reason_mandatory_yn(check: any) {
    let val = check ? 'Y' : 'N';
    this.generalForm.patchValue({
      lcs_is_leave_cancellation_reason_mandatory_yn: val,
    })
  }

  onItemSelect(e: any) {
    // let arr: any = [];
    // if (this.gf.applicable_leave_types.value) {
    //   arr = this.gf.applicable_leave_types.value.split(',');
    // }
    // // arr.push(e.leavetype);
    // arr.push(e.typecode);
    // this.generalForm.patchValue({
    //   applicable_leave_types: arr.join(','),
    // })
    // // console.log(e);
    // // console.log(this.gf.applicable_leave_types.value);
  }
  onSelectAll(e: any) {
    // // console.log(e);
    // let arr = [];
    // this.leave_type_master_data.map((el: any) => {
    //   arr.push(el.typecode);
    //   // arr.push(el.leavetype);
    // })
    // this.generalForm.patchValue({
    //   applicable_leave_types: arr.join(','),
    // })
  }
  onUnselectAll(e: any) {
    // this.generalForm.patchValue({
    //   applicable_leave_types: '',
    // })
  }
  onItemUnselect(e: any) {
    // let arr: any = this.gf.applicable_leave_types.value.split(',');
    // // let index = arr.indexOf(e.leavetype);
    // let index = arr.indexOf(e.typecode);

    // if (index != -1) {
    //   arr.splice(index, 1);
    //   this.generalForm.patchValue({
    //     applicable_leave_types: arr.join(','),
    //   })
    // }
    // // console.log(e);
  }

  upsert_leave_general_settings() {
    if (!this.gf.leave_credit_count_for_wk.value) {
      this.generalForm.patchValue({
        leave_credit_count_for_wk: '1.0',
      });
    }
    if (!this.gf.leave_credit_count_for_ho.value) {
      this.generalForm.patchValue({
        leave_credit_count_for_ho: '1.0',
      });
    }

    let data = this.generalForm.value;
    this.submitted = true;
    // console.log(data);
    // return;

    if (!this.gf.lrp_unpaid_leave_lop_max_allowed_days.valid) {
      console.log(this.gf.lrp_unpaid_leave_lop_max_allowed_days.errors);
      this.toastr.error('Maximum LOP count allowed is 31', 'Oops!');
      return;
    }
    if (this.gf.per_month_max_comp_off.value && this.gf.per_month_max_comp_off.value > 30) {
      this.toastr.error('Maximum Comp Off per month allowed is 30', 'Oops!');
      return;
    }

    let obj = {
      accountId: this.tp_account_id.toString(),
      applicable_leave_types: JSON.stringify(data.applicable_leave_types),
      leave_count_for_ho_wk: data.leave_count_for_ho_wk,
      comp_request_mode_entry: data.comp_request_mode_entry,
      comp_request_for_future_dt_yn: data.comp_request_for_future_dt_yn,

      credited_leave_expires_after_type: data.credited_leave_expires_after_type,
      units_allowed: data.units_allowed,
      durations_allowed: data.durations_allowed,
      time_input_yn: data.time_input_yn,
      make_reason_mandatory_yn: data.make_reason_mandatory_yn,
      max_leaves_per_compoff: data?.max_leaves_per_compoff,
      // min_halfday_hrs: data?.min_halfday_hrs,
      // min_fullday_hrs: data?.min_fullday_hrs,
      lrp_unpaid_leave_to_be_marked_as_lop_yn: data.lrp_unpaid_leave_to_be_marked_as_lop_yn,
      lrp_unpaid_leave_lop_max_allowed_days: data.lrp_unpaid_leave_lop_max_allowed_days,
      allow_leave_requests_until_the_next_no_of_yr: data.allow_leave_requests_until_the_next_no_of_yr,
      lcs_past_leaves_within_current_pay_period: data.lcs_past_leaves_within_current_pay_period,
      lcs_current_day_upcoming_leave_requests: data.lcs_current_day_upcoming_leave_requests,
      lcs_allow_partial_leave_cancellation_yn: data.lcs_allow_partial_leave_cancellation_yn,
      lcs_is_leave_cancellation_reason_mandatory_yn: data.lcs_is_leave_cancellation_reason_mandatory_yn,

      is_comp_off_applicable: data.is_comp_off_applicable,
      leave_credit_count_for_wk: data.leave_credit_count_for_wk,
      leave_credit_count_for_ho: data.leave_credit_count_for_ho,
      per_month_max_comp_off: data.per_month_max_comp_off,
      credited_leave_expires_after: data.credited_leave_expires_after,
      comp_off_applicable_type: data.comp_off_applicable_type,
      comp_off_applicable_type_dayname: data.comp_off_applicable_type_dayname,

    }

    this._leaveMgmtService.upsert_leave_general_settings(obj).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, "Success");
          this.get_leave_general_settings();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  get_leave_general_settings() {
    // this.selectedLeaveTypes = [];
    this.submitted = false;

    this._leaveMgmtService.get_leave_general_settings({
      accountId: this.tp_account_id.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          let data = resData.commonData[0];
          this.generalForm.patchValue({
            applicable_leave_types: JSON.parse(data.applicable_leave_types),
            leave_count_for_ho_wk: data.leave_count_for_ho_wk,
            comp_request_mode_entry: data.comp_request_mode_entry,
            comp_request_for_future_dt_yn: data.comp_request_for_future_dt_yn,
            credited_leave_expires_after_type: data.credited_leave_expires_after_type,
            units_allowed: data.units_allowed,
            durations_allowed: data.durations_allowed,
            time_input_yn: data.time_input_yn,
            make_reason_mandatory_yn: data.make_reason_mandatory_yn,
            max_leaves_per_compoff: data.max_leaves_per_compoff,
            // min_halfday_hrs: data.min_halfday_hrs,
            // min_fullday_hrs: data.min_fullday_hrs,
            lrp_unpaid_leave_to_be_marked_as_lop_yn: !data.lrp_unpaid_leave_to_be_marked_as_lop_yn ? 'Y' : data.lrp_unpaid_leave_to_be_marked_as_lop_yn,
            lrp_unpaid_leave_lop_max_allowed_days: data.lrp_unpaid_leave_lop_max_allowed_days,
            allow_leave_requests_until_the_next_no_of_yr: data.allow_leave_requests_until_the_next_no_of_yr,
            lcs_past_leaves_within_current_pay_period: data.lcs_past_leaves_within_current_pay_period,
            lcs_current_day_upcoming_leave_requests: data.lcs_current_day_upcoming_leave_requests,
            lcs_allow_partial_leave_cancellation_yn: data.lcs_allow_partial_leave_cancellation_yn,
            lcs_is_leave_cancellation_reason_mandatory_yn: data.lcs_is_leave_cancellation_reason_mandatory_yn,

            is_comp_off_applicable: data.is_comp_off_applicable,
            leave_credit_count_for_wk: data.leave_credit_count_for_wk,
            leave_credit_count_for_ho: data.leave_credit_count_for_ho,
            per_month_max_comp_off: data.per_month_max_comp_off,
            credited_leave_expires_after: data.credited_leave_expires_after,
            comp_off_applicable_type: data.comp_off_applicable_type,
            comp_off_applicable_type_dayname: data.comp_off_applicable_dayname,

          })

          // this.selectedLeaveTypes = !data.applicable_leave_types? []: data.applicable_leave_types.split(',');
          // data.applicable_leave_types.split(',').map((el:any) => {
          //   this.selectedLeaveTypes.push(el);
          // })
          // console.log(this.selectedLeaveTypes);
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  get_show_wk_msg(day:any) {
    // lbl_show_wk_msg
    if (!day) {
      day = 1.0;
    } else if (day==0) {
      return `(i.e) Weekends cannot be marked as Comp off`;
    }

    return `(i.e) 1 day(s) x ${day} = ${day} day(s)`;
  }

  get_show_ho_msg(day:any) {
    // lbl_show_ho_msg
    if (!day) {
      day = 1.0;
    } else if (day==0) {
      return `(i.e) Holidays cannot be marked as Comp off`;
    }

    return `(i.e) 1 day(s) x ${day} = ${day} day(s)`
  }

  /*****Comp-Off*****/
  change_is_comp_off_applicable(val: any) {
    this.generalForm.patchValue({
      is_comp_off_applicable: val,
    })
  }
  change_comp_off_applicable_type(val: any) {
    this.generalForm.patchValue({
      comp_off_applicable_type: val,
    })

    if (val=='All') {
      this.generalForm.patchValue({
        comp_off_applicable_type_dayname: '',
      })
    }
  }

  is_comp_off_applicable_type_dayname_Checked(val: string): boolean {
    const comp_off_applicable_type_dayname_arr = this.gf.comp_off_applicable_type_dayname.value ? this.gf.comp_off_applicable_type_dayname.value.split(',') : [];
    return comp_off_applicable_type_dayname_arr.includes(val);
  }


  change_comp_off_applicable_type_dayname(val: any, check: any) {

    let arr = !this.gf.comp_off_applicable_type_dayname.value ? [] : this.gf.comp_off_applicable_type_dayname.value.split(',');
    let value_arr = [];
    // console.log(arr);

    if (check) {
      value_arr = [...arr];
      value_arr.push(val);
    } else {
      value_arr = arr.filter(el => el != val);
    }

    this.generalForm.patchValue({
      comp_off_applicable_type_dayname: value_arr.join(','),
    })
  }

}
