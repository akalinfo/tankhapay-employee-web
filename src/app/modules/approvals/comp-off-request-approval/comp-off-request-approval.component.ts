import { Component, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ApprovalsService } from '../approvals.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { EmployeeLoginService } from '../../employee-login/employee-login.service';

import { DatePipe } from '@angular/common';
import { PopoverDirective } from 'ngx-bootstrap/popover';



declare var $: any

@Component({
  selector: 'app-comp-off-request-approval',
  templateUrl: './comp-off-request-approval.component.html',
  styleUrls: ['./comp-off-request-approval.component.css'],
  animations: [grooveState, dongleState],
  providers: [DatePipe]

})
export class CompOffRequestApprovalComponent {

  showSidebar: boolean = false;
  filter_fromdate: any;
  filter_todate: any;
  statusFilter: any = 'All';
  tp_account_id: any;
  onduty_appli_list_data: any = [];
  tot_approved: any = 0;
  tot_rejected: any = 0;
  tot_pending: any = 0;
  selected_val: string = '1';
  decoded_token: any;
  showDocumentPopup: boolean = false;
  document_url: any = '';

  approve_reject_title: any = '';
  onDutyDetailsPopup: boolean = false;
  selected_index: any = '';
  selected_title: any = '';
  approval_level_by_user_id_data: any = {};
  remarks_modal: any = '';
  show_remarks_modal: boolean = false;
  action_comment_txt: any = '';

  addCompOffForm: FormGroup;
  isViewCompOff: boolean = false;

  @ViewChild('popoverStart') popoverStart!: PopoverDirective;  // Correct type
  @ViewChild('popoverEnd') popoverEnd!: PopoverDirective;  // Correct type

  startTime: any;
  endTime: any;
  comp_off_title: any = '';
  emp_id: any;
  product_type: any;
  showCommentsPopup: boolean = false;
  commentsData:any = [];

  constructor(
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _approvalService: ApprovalsService,
    private _encrypterService: EncrypterService,
    private _businessSettingsService: BusinesSettingsService,
    private _employeeLoginService: EmployeeLoginService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
  ) { }

  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    // console.log(decoded_token);

    let date = new Date();
    this.filter_fromdate = this.formatDate(date);
    this.filter_todate = this.formatDate(date);
    // console.log(this.filter_todate);

    this.addCompOffForm = this.fb.group({
      comp_applid: [''],
      date_worked: [''],
      reason: ['', Validators.required],
      status: ['Pending'], // Initial status

      timeOption: ['specificTime', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      working_hours: ['', [Validators.required, Validators.pattern(/^[0-9]+:[0-5][0-9]$/)]],
      remarks: [''],
      comp_off_days: [''],
      max_leaves_per_compoff: [''],

      data: [''],
      name: [''],
      attachment_url: [''],

    });

    // this.get_Leave_appl_by_account();

    // this.get_od_appl_by_account();

    // if (this.decoded_token.isEmployer=='0' && this.decoded_token.sub_userid) {
    //   this.get_leave_approval_level_by_user_id(this.decoded_token.sub_userid);

    // }

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}/${mm}/${yy}`;
  }

  changeDateFilter(val: any) {
    let today = new Date();
    let fromDate: any;

    switch (val) {
      case '1':
        fromDate = today;
        break;
      case '2':
        fromDate = new Date(today.setDate(today.getDate() - 1));
        break;
      case '3':
        const sunday = new Date(today.setDate(today.getDate() - today.getDay()));
        fromDate = sunday;
        break;
      case '4':
        fromDate = new Date(today.setDate(today.getDate() - 7));
        break;
      case '5':
        fromDate = new Date(today.setDate(today.getDate() - 30));
        break;
      case '6':
        fromDate = new Date(today.setDate(today.getDate() - 90));
        break;
      case '7':
        fromDate = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
    }
    this.selected_val = val;
    this.filter_fromdate = this.formatDate(fromDate);
    // console.log(this.filter_todate);

    // this.get_Leave_appl_by_account();
    this.get_od_appl_by_account();
  }

  changeStatusFilter(val: any) {
    this.statusFilter = val;
    // this.get_Leave_appl_by_account();
    this.get_od_appl_by_account();
  }


  // getDate(dt: any) {
  //   let dt_array = dt.split('-');
  //   const date = new Date(dt_array[0], dt_array[1], dt_array[2]);
  //   let month = date.toLocaleString('default', { month: 'short' });

  //   return dt_array[0] + '-' + month + '-' + dt_array[2];
  // }

  get_od_appl_by_account() {
    this.tot_approved = 0;
    this.tot_pending = 0;
    this.tot_rejected = 0;

    this.onduty_appli_list_data = [];

    this._employeeLoginService.getCompOffRequest({
      action: 'get_compoff_appl_by_account',
      accountid: this.tp_account_id.toString(),
      // 'emp_id': this.emp_id,
      fromdate: this.filter_fromdate,
      todate: this.filter_todate,
      approval_status: this.statusFilter,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.onduty_appli_list_data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          this.tot_pending = 0;
          this.tot_approved = 0;
          this.tot_rejected = 0;
          this.onduty_appli_list_data.map((el: any) => {
            if (el.approval_status == 'Pending') {
              this.tot_pending += 1;
            } else if (el.approval_status == 'Approved') {
              this.tot_approved += 1;
            } else if (el.approval_status == 'Rejected') {
              this.tot_rejected += 1;
            }
          })
        } else {
          this.toastr.error(resData.message, 'Error');
        }
      }
    })

  }


  approved_od_appl_by_applid(approval_status: any) {
    // console.log(this.remarks_modal);
    // return;
    this._approvalService.approved_od_appl_by_applid({
      action: 'approved_od_appl_by_applid',
      accountId: this.onduty_appli_list_data[this.selected_index].accountid.toString(),
      emp_id: this.onduty_appli_list_data[this.selected_index].emp_id.toString(),
      row_id: this.onduty_appli_list_data[this.selected_index].od_applid.toString(),
      approval_status: approval_status,
      remarks: this.remarks_modal,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.closeonDutyDetailsPopup();
          this.get_od_appl_by_account();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  openApprovePopup(index: any) {
    this.selected_title = 'Approve';
    this.onDutyDetailsPopup = true;
    this.selected_index = index;
    this.remarks_modal = '';
    this.show_remarks_modal = true;
    this.action_comment_txt = !this.onduty_appli_list_data[this.selected_index]?.action_comment_txt ? '' : this.onduty_appli_list_data[this.selected_index].action_comment_txt;

  }

  openRejectPopup(index: any) {
    this.selected_title = 'Reject';
    this.onDutyDetailsPopup = true;
    this.selected_index = index;
    this.remarks_modal = '';
    this.show_remarks_modal = true;
    this.action_comment_txt = !this.onduty_appli_list_data[this.selected_index]?.action_comment_txt ? '' : this.onduty_appli_list_data[this.selected_index].action_comment_txt;

  }


  openonDutyDetailsPopup(index: any) {
    this.selected_title = 'On Duty Details';
    this.onDutyDetailsPopup = true;
    this.selected_index = index;
    this.show_remarks_modal = false;

    this.action_comment_txt = !this.onduty_appli_list_data[this.selected_index]?.action_comment_txt ? '' : this.onduty_appli_list_data[this.selected_index].action_comment_txt;

    let approval_status = this.onduty_appli_list_data[this.selected_index].approval_status;
    if (approval_status == 'Approved') {
      this.remarks_modal = this.onduty_appli_list_data[this.selected_index].approval_remarks;

    } else if (approval_status == 'Rejected') {
      this.remarks_modal = this.onduty_appli_list_data[this.selected_index].rejected_remarks;

    } else {
      this.remarks_modal = '';

    }
  }
  closeonDutyDetailsPopup() {
    this.selected_title = '';
    this.onDutyDetailsPopup = false;
    this.selected_index = '';
    this.remarks_modal = '';
    this.show_remarks_modal = false;
    this.action_comment_txt = '';
  }

  get_leave_approval_level_by_user_id(subuserid: any) {
    this._businessSettingsService.manage_approval_master({
      'action': 'get_approval_level_by_user_id',
      'accountid': this.tp_account_id.toString(),
      'user_by': subuserid,
      'approval_module_id': '2',

    }).subscribe({
      next: (resData: any) => {
        if (resData.status) {
          this.approval_level_by_user_id_data = resData.commonData[0];
        } else {
          this.approval_level_by_user_id_data = {};
        }
      }
    })
  }

  check_level_cdn(data: any) {
    let application_level = data.wf_approval_cur_level;
    let user_approval_level = data.user_approval_level;
    // console.log(application_level, user_approval_level, data.template_mode);
    if (data.is_workflow_applied == 'Y') {
      if (data.template_mode == 'strict') {
        if (application_level == user_approval_level) {
          return true;
        } else {
          return false;
        }

      } else if (data.template_mode == 'flexible') {
        // if (user_approval_level >= application_level) {
        return true;
        // } else {
        //   return false;
        // }

      } else {
        return false;
      }
    } else {
      return true;
    }
  }








  ngAfterViewInit() {

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date());

      $('#ToDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date());

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });

      this.get_od_appl_by_account();

    }, 100);
  }

  filterFromToDateLeads() {
    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    // console.log(todt-fromdt);

    if (todt >= fromdt) {
      // this.startDate = $('#FromDate').val();
      // this.endDate = $('#ToDate').val();

      this.get_od_appl_by_account();
    }
    else {
      // $('#FromDate').val(this.startDate);
      // $('#ToDate').val(this.endDate);
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }

    // console.log(this.startDate, this.endDate);
  }

  getCurrentTime(): Date {
    const now = new Date();
    return new Date(0, 0, 0, now.getHours(), now.getMinutes());
  }


  /*****add*****/
  openAddCompOffRequestModal() {
    this.isViewCompOff = false; // Ensure it's in add mode
    this.addCompOffForm.reset(); // Clear the form
    this.comp_off_title = 'Add';

    this.intialize_date_worked('');


    // this.emp_id = data.emp_id;


    if (this.isViewCompOff) {
      this.addCompOffForm.get('timeOption')?.disable();
    } else {
      this.addCompOffForm.get('timeOption')?.enable();
    }

    this.startTime = this.getCurrentTime();
    this.endTime = this.getCurrentTime();

    // ... (Show the modal - implementation depends on your modal library) ...
    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.add("show"); // Add these two lines.
    modal.style.display = "block";


  }


  /*****update*****/
  openUpdateCompOffRequestModal(data: any) {
    this.isViewCompOff = false;
    // this.addCompOffForm.reset();
    this.comp_off_title = 'Update';

    this.intialize_date_worked(data.comp_off_applied_date);
    this.action_comment_txt = !data.action_comment_txt ? '' : data.action_comment_txt;


    this.emp_id = data.emp_id;

    if (this.isViewCompOff) {
      this.addCompOffForm.get('timeOption')?.disable();
    } else {
      this.addCompOffForm.get('timeOption')?.enable();
    }

    // console.log(data);

    let attachment_url = !data.attachemnt_url ? '' : data.attachemnt_url;
    let working_hours = !data.working_hours ? '' : data.working_hours;
    let timeOption;

    if (!working_hours) {
      timeOption = 'specificTime';
    } else {
      timeOption = 'workingHours';

    }

    // let split_dt = data.comp_off_applied_date.split('-');

    this.addCompOffForm.patchValue({
      comp_applid: data.comp_applid,
      attachment_url: attachment_url,
      // date_worked: split_dt[2] + '-' + split_dt[1] + '-' + split_dt[0],
      reason: data.compoff_description,
      status: data.approval_status,
      timeOption: timeOption,
      start_time: data?.working_start_time,
      end_time: data.working_end_time,
      working_hours: working_hours,
      comp_off_days: data.comp_off_days,
      max_leaves_per_compoff: data.max_leaves_per_compoff,
      remarks: !data.remarks ? '' : data.remarks,

      data: '',
      name: '',
    })

    // console.log(this.addCompOffForm.value);

    // this.startTime = this.getCurrentTime();
    // this.endTime = this.getCurrentTime();

    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.add("show");
    modal.style.display = "block";
  }

  openRejectCompOffRequestModal(data: any) {
    this.isViewCompOff = true;
    this.comp_off_title = 'Reject';

    this.intialize_date_worked(data.comp_off_applied_date);
    this.action_comment_txt = !data.action_comment_txt ? '' : data.action_comment_txt;


    this.emp_id = data.emp_id;


    if (this.isViewCompOff) {
      this.addCompOffForm.get('timeOption')?.disable();
    } else {
      this.addCompOffForm.get('timeOption')?.enable();
    }

    let attachment_url = !data.attachemnt_url ? '' : data.attachemnt_url;
    let working_hours = !data.working_hours ? '' : data.working_hours;
    let timeOption;

    if (!working_hours) {
      timeOption = 'specificTime';
    } else {
      timeOption = 'workingHours';

    }

    // let split_dt = data.comp_off_applied_date.split('-');

    this.addCompOffForm.patchValue({
      comp_applid: data.comp_applid,
      attachment_url: attachment_url,
      // date_worked: split_dt[2] + '-' + split_dt[1] + '-' + split_dt[0],
      reason: data.compoff_description,
      status: data.approval_status,
      timeOption: timeOption,
      start_time: data?.working_start_time,
      end_time: data.working_end_time,
      working_hours: working_hours,
      comp_off_days: data.comp_off_days,
      max_leaves_per_compoff: data.max_leaves_per_compoff,
      remarks: '',

      data: '',
      name: '',
    })

    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.add("show");
    modal.style.display = "block";

  }
  openApproveCompOffRequestModal(data: any) {
    this.isViewCompOff = true;
    this.comp_off_title = 'Approve';

    this.emp_id = data.emp_id;
    this.action_comment_txt = !data.action_comment_txt ? '' : data.action_comment_txt;


    this.intialize_date_worked(data.comp_off_applied_date);

    if (this.isViewCompOff) {
      this.addCompOffForm.get('timeOption')?.disable();
    } else {
      this.addCompOffForm.get('timeOption')?.enable();
    }

    let attachment_url = !data.attachemnt_url ? '' : data.attachemnt_url;
    let working_hours = !data.working_hours ? '' : data.working_hours;
    let timeOption;

    if (!working_hours) {
      timeOption = 'specificTime';
    } else {
      timeOption = 'workingHours';

    }

    // let split_dt = data.comp_off_applied_date.split('-');

    this.addCompOffForm.patchValue({
      comp_applid: data.comp_applid,
      attachment_url: attachment_url,
      // date_worked: split_dt[2] + '-' + split_dt[1] + '-' + split_dt[0],
      reason: data.compoff_description,
      status: data.approval_status,
      timeOption: timeOption,
      start_time: data?.working_start_time,
      end_time: data.working_end_time,
      working_hours: working_hours,
      comp_off_days: data.comp_off_days,
      max_leaves_per_compoff: data.max_leaves_per_compoff,
      remarks: '',

      data: '',
      name: '',
    })

    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.add("show");
    modal.style.display = "block";

  }

  hideAddCompOffRequestModal() {
    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.remove("show"); // Add these two lines.
    modal.style.display = "none";
    this.addCompOffForm.patchValue({
      attachment_url: '',
    })
    this.addCompOffForm.reset();

  }

  /***View****/
  viewCompOffRequest(data: any) {
    this.isViewCompOff = true;

    this.comp_off_title = 'View';
    this.intialize_date_worked(data.comp_off_applied_date);
    this.action_comment_txt = !data.action_comment_txt ? '' : data.action_comment_txt;


    if (this.isViewCompOff) {
      this.addCompOffForm.get('timeOption')?.disable();
    } else {
      this.addCompOffForm.get('timeOption')?.enable();
    }

    let attachment_url = !data.attachemnt_url ? '' : data.attachemnt_url;
    let working_hours = !data.working_hours ? '' : data.working_hours;
    let timeOption;

    if (!working_hours) {
      timeOption = 'specificTime';
    } else {
      timeOption = 'workingHours';

    }

    // let split_dt = data.comp_off_applied_date.split('-');

    this.addCompOffForm.patchValue({
      comp_applid: data.comp_applid,
      attachment_url: attachment_url,
      // date_worked: split_dt[2] + '-' + split_dt[1] + '-' + split_dt[0],
      reason: data.compoff_description,
      status: data.approval_status,
      timeOption: timeOption,
      start_time: data?.working_start_time,
      end_time: data.working_end_time,
      working_hours: working_hours,
      comp_off_days: data.comp_off_days,
      max_leaves_per_compoff: data.max_leaves_per_compoff,
      remarks: !data.remarks ? '' : data.remarks,

      data: '',
      name: '',
    })

    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.add("show");
    modal.style.display = "block";
  }


  // saveCompOffRequest() {
  //   // if (this.addCompOffForm.invalid) {
  //   //   return; // Handle form validation errors
  //   // }

  //   const newCompOffRequest = this.addCompOffForm.value;
  //   console.log(this.addCompOffForm.value);

  //   this.compOffRequests.push(newCompOffRequest); // Add to your data array
  //   this.hideAddCompOffRequestModal();
  //   // this.addCompOffForm.reset(); // Reset after submit
  // }

  togglePopover(popover: any) {
    if (popover.isOpen) {
      popover.hide();
    } else {
      popover.show();
    }
  }

  onStartTimeChange(newTime: Date) {
    this.startTime = newTime;  // Update startTime
    const formatted = this.datePipe.transform(newTime, 'HH:mm');
    this.addCompOffForm.get('start_time')?.setValue(formatted);
    // this.popoverStart.hide(); //Added this to hide popover on selecting time
  }

  onEndTimeChange(newTime: Date) {
    this.endTime = newTime;  // Update endTime
    const formatted = this.datePipe.transform(newTime, 'HH:mm');
    this.addCompOffForm.get('end_time')?.setValue(formatted);
    // this.popoverEnd.hide();//Added this to hide popover on selecting time

  }

  onTimeOptionChange() {
    const timeOption = this.addCompOffForm.get('timeOption')?.value;

    if (timeOption === 'specificTime') {
      this.addCompOffForm.get('start_time')?.setValidators([Validators.required]);
      this.addCompOffForm.get('end_time')?.setValidators([Validators.required]);
      this.addCompOffForm.get('working_hours')?.clearValidators();
    } else { // timeOption === 'workingHours'
      this.addCompOffForm.get('working_hours')?.setValidators([Validators.required, Validators.pattern(/^[0-9]+:[0-5][0-9]$/)]);
      this.addCompOffForm.get('start_time')?.clearValidators();
      this.addCompOffForm.get('end_time')?.clearValidators();
    }


    this.addCompOffForm.get('start_time')?.updateValueAndValidity();
    this.addCompOffForm.get('end_time')?.updateValueAndValidity();
    this.addCompOffForm.get('working_hours')?.updateValueAndValidity();
  }


  readFile(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // this.fileName = file.name;
      let fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.addCompOffForm.patchValue({
          name: fileName,
          data: reader.result.toString().split(',')[1]
        })
      };

      reader.readAsDataURL(file);
    }
  }

  saveCompOffRequest() {

    this.onTimeOptionChange();

    if (this.addCompOffForm.invalid) {
      for (const controlName in this.addCompOffForm.controls) {
        const control = this.addCompOffForm.get(controlName);
        if (control?.invalid) {
          // console.log(`First invalid control: ${controlName}`. Errors:, control.errors);

          // if (controlName == 'date_worked') {
          //   this.toastr.error('Please select date worked', 'Oops!');
          // } else
          if (controlName == 'reason') {
            this.toastr.error('Please enter description/remarks', 'Oops');
          } else if (controlName == 'timeOption' || controlName == 'start_time' || controlName == 'end_time' || controlName == 'working_hours') {
            this.toastr.error('Please enter valid working hours', 'Oops!');
          }

          return;
        }
      }
    }

    // console.log(this.addCompOffForm.value);
    let data = this.addCompOffForm.value;


    // if (isNaN(data.working_hours)) {
    //   this.toastr.error('Please enter valid working hours', 'Oops!');
    //   return;
    // }

    // let split_dt_worked = data.date_worked.split('-');
    // let date_worked = split_dt_worked[2] + '-' + split_dt_worked[1] + '-' + split_dt_worked[0];
    let date_worked = $('#date_worked').val();
    if (!date_worked) {
      this.toastr.error('Please select date worked', 'Oops!');
      return;
    }

    if (!data.comp_off_days || isNaN(data.comp_off_days)) {
      this.toastr.info('Please Enter Approved Comp-Off Leave in days', 'Oops!');
      return;
    }

    if (!data.remarks) {
      this.toastr.error('Please enter remarks', 'Oops!');
      return;
    }
    if (data.comp_off_days > data.max_leaves_per_compoff) {
      //Maximum allowed approved Comp-Off leave: ${data.max_leaves_per_compoff} days.
      this.toastr.error(`Maximum allowed approved Comp-Off leave: ${data.max_leaves_per_compoff} days `, 'Oops!');
      return;
    }

    // return;

    let action = '';
    let approval_status = '';
    let reason = '';

    if (this.comp_off_title == 'Add') {
      action = 'apply_compoff_appl';
      reason = data.reason
    } else if (this.comp_off_title == 'Update') {
      action = 'edit_compoff_appl';
      reason = data.reason;
    } else if (this.comp_off_title == 'Reject') {
      action = 'approved_compoff_appl_by_applid';
      reason = this.decoded_token.name;
      approval_status = 'Rejected';
    } else if (this.comp_off_title == 'Approve') {
      action = 'approved_compoff_appl_by_applid'
      approval_status = 'Approved';
      reason = this.decoded_token.name;
    }


    let working_hours = '';
    let start_time = '';
    let end_time = '';

    if (data.timeOption == 'workingHours') {
      working_hours = data.working_hours;
    } else if (data.timeOption == 'specificTime') {
      start_time = data.start_time;
      end_time = data.end_time;
    }


    let createdby = '';
    if (this.decoded_token.isEmployer == '0') {
      createdby = !this.decoded_token?.sub_userid ? this.tp_account_id : this.decoded_token.sub_userid;
    } else {
      createdby = this.tp_account_id;
    }

    this._employeeLoginService.manageCompOffRequest({
      'action': action,
      'accountid': this.tp_account_id.toString(),
      'comp_applid': data.comp_applid,
      'emp_id': this.emp_id,
      'comp_off_applied_date': date_worked,
      'working_start_time': start_time,
      'working_end_time': end_time,
      'working_hours': working_hours,
      'comp_off_days': data.comp_off_days,
      'compoff_description': reason,
      'remarks': data.remarks,
      'attachment_url': data.attachment_url,
      'approval_status': approval_status,
      'createdby':createdby,
      'isEmployer':this.decoded_token.isEmployer,
      'sub_userid': this.decoded_token?.sub_userid

    }).subscribe({
      next: (resData: any) => {
        if (resData.msgcd == '1') {
          this.addCompOffForm.reset();
          this.hideAddCompOffRequestModal();
          this.get_od_appl_by_account();
          this.addCompOffForm.patchValue({
            attachment_url: '',
          })
          this.toastr.success(resData.message || resData.msg, 'Success');
        } else {
          this.toastr.error(resData.message || resData.msg, 'Error');
        }
      }
    })
  }
  uploadCompOffDocument() {
    let formData = this.addCompOffForm.value;
    console.log(formData);

    if (!formData.data) {
      this.saveCompOffRequest();
      return;
    }

    this._employeeLoginService.uploadCompOffDocument({
      'data': formData.data,
      'name': formData.name,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.addCompOffForm.patchValue({
            attachment_url: resData.filePath
          })
          this.saveCompOffRequest();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  intialize_date_worked(date: any) {
    // console.log(date);
    let setDate = new Date();
    if (date) {
      let split_dt = date.split('-');
      let split_dt_final = split_dt[2] + '-' + split_dt[1] + '-' + split_dt[0];
      setDate = new Date(split_dt_final);
    }

    setTimeout(() => {
      $('#date_worked').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', setDate);
    }, 100)
  }



  openCommentsPopup(data: any) {
    this.showCommentsPopup = true;
    this.commentsData = !data ? [] : data.split('<br><br>')
        .map(line => line.trim())
        .filter(line => line !== '')
        .map(line => `&#9679; ${line}`);

    // console.log(this.commentsData);
}


  closeCommentsPopup() {
    this.showCommentsPopup = false;
    this.commentsData = [];
  }

}
