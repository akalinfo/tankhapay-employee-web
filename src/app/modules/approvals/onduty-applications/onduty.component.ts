import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ApprovalsService } from '../approvals.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { AttendanceService } from '../../attendance/attendance.service';
declare var $: any;

@Component({
  selector: 'app-onduty',
  templateUrl: './onduty.component.html',
  styleUrls: ['./onduty.component.css'],
  animations: [grooveState, dongleState],
})
export class OndutyComponent {
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

  invKey_copy: any = '';
  startDate_copy: any;
  endDate_copy: any;
  statusFilter_copy: any = 'All';
  dropdownSettings: any = {};
  deptDropdownSettings: {};
  desgDropdownSettings: {};
  deptList: any = [];
  desgList: any = [];
  orgList: any = [];
  orgName: any = [];
  deptName: any = [];
  desgName: any = [];
  orgName_copy: any = [];
  deptName_copy: any = [];
  desgName_copy: any = [];
  product_type: any;
  startDate: any;
  endDate: any;
  change_sidebar_filter_flag: boolean = false;
  invKey: any;
  daywisefilter: any = '';
  constructor(
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _approvalService: ApprovalsService,
    private _encrypterService: EncrypterService,
    private _businessSettingsService: BusinesSettingsService,
    private _attendanceService: AttendanceService
  ) { }

  ngOnInit() {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    this.startDate = this.formatDate(firstDayOfMonth);
    this.endDate = this.formatDate(lastDayOfMonth);

    // console.log(this.filter_todate);
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'org_unit_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
    };
    this.deptDropdownSettings = {
      singleSelection: false,
      idField: 'posting_department',
      textField: 'posting_department',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };
    this.desgDropdownSettings = {
      singleSelection: false,
      idField: 'post_offered',
      textField: 'post_offered',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // console.log(decoded_token);

    // let date = new Date();
    // this.filter_fromdate = this.formatDate(date);
    // this.filter_todate = this.formatDate(date);
    // console.log(this.filter_todate);

    // this.get_Leave_appl_by_account();
    this.get_geo_fencing_list();
    this.getDepartmentData();
    this.getDesignationData();
    this.get_od_appl_by_account();

    // if (this.decoded_token.isEmployer=='0' && this.decoded_token.sub_userid) {
    //   this.get_leave_approval_level_by_user_id(this.decoded_token.sub_userid);

    // }

  }
  get_geo_fencing_list() {
    this._businessSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllOUsForCustomer"
    }).subscribe((resData: any) => {
      this.orgList = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          this.toastr.info('No data found', 'Oops!');
          return;
        }

        this.orgList = resData.commonData;

      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }
  getDepartmentData() {
    this.deptList = [];

    this._attendanceService.getMaster({
      'actionType': 'GetPostingDepartments',
      'customerAccountId': this.tp_account_id,
      'productTypeId': this.product_type,
    }).subscribe({
      next: (resData: any) => {
        console.log(resData);

        if (resData.statusCode) {
          this.deptList = (resData.commonData);
          // console.log(this.deptList);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  getDesignationData() {
    this.desgList = [];

    this._attendanceService.getMaster({
      'actionType': 'GetMasterPostOffered',
      'customerAccountId': this.tp_account_id,
      'productTypeId': this.product_type,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.desgList = (resData.commonData);
          // console.log(this.desgList);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
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

    // switch (val) {
    //   case '1':
    //     fromDate = today;
    //     break;
    //   case '2':
    //     fromDate = new Date(today.setDate(today.getDate() - 1));
    //     break;
    //   case '3':
    //     const sunday = new Date(today.setDate(today.getDate() - today.getDay()));
    //     fromDate = sunday;
    //     break;
    //   case '4':
    //     fromDate = new Date(today.setDate(today.getDate() - 7));
    //     break;
    //   case '5':
    //     fromDate = new Date(today.setDate(today.getDate() - 30));
    //     break;
    //   case '6':
    //     fromDate = new Date(today.setDate(today.getDate() - 90));
    //     break;
    //   case '7':
    //     fromDate = new Date(today.setFullYear(today.getFullYear() - 1));
    //     break;
    // }
    // this.selected_val = val;
    // this.filter_fromdate = this.formatDate(fromDate);


    switch (val) {
      case '1':
        fromDate = new Date();
        break;
      case '2':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 1);
        break;
      case '3':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - today.getDay());
        break;
      case '4':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 7);
        break;
      case '5':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 30);
        break;
      case '6':
        fromDate = new Date();
        fromDate.setDate(today.getDate() - 90);
        break;
      case '7':
        fromDate = new Date();
        fromDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    this.selected_val = val;
    this.startDate = this.formatDate(fromDate);
    this.endDate = this.formatDate(today);
    $('#FromDate').val(this.startDate);
    $('#ToDate').val(this.endDate);

    // console.log("From Date:", this.startDate);
    // console.log("To Date:", this.endDate);
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

    this._approvalService.get_od_appl_by_account({
      action: 'get_od_appl_by_account',
      accountId: this.tp_account_id.toString(),
      fromdate: this.startDate,
      todate: this.endDate,
      approval_status: this.statusFilter,
      'postOffered': this.desgName,
      'postingDepartment': this.deptName,
      'unitParameterName': this.orgName,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.onduty_appli_list_data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          // console.log(this.onduty_appli_list_data);
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
          this.onduty_appli_list_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.onduty_appli_list_data = [];
        // console.log(e);
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
  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;

    this.startDate = this.startDate_copy;
    this.endDate = this.endDate_copy;
    this.invKey = this.invKey_copy;
    this.statusFilter = this.statusFilter_copy;

    this.desgName = this.desgName_copy;
    this.orgName = this.orgName_copy;
    this.deptName = this.deptName_copy;

    this.startDate = $('#FromDate').val();
    this.endDate = $('#ToDate').val();

    this.get_od_appl_by_account();
  }
  filterFromToDateLeads() {

    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    if (todt >= fromdt) {
      this.startDate_copy = $('#FromDate').val();
      this.endDate_copy = $('#ToDate').val();
    }
    else {
      $('#FromDate').val(this.startDate_copy);
      $('#ToDate').val(this.endDate_copy);
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }
  }
  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }

  /**Sidebar Filter**/
  resetFilter() {
    this.invKey_copy = '';
    this.statusFilter_copy = 'All';
    this.daywisefilter = '';
    this.deptName_copy = [];
    this.desgName_copy = [];
    this.orgName_copy = [];

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    this.startDate_copy = this.formatDate(firstDayOfMonth);
    this.endDate_copy = this.formatDate(lastDayOfMonth);

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.startDate_copy); // Set current date as default

      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.endDate_copy); // Set current date as default

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });


    }, 100);

  }
  openSidebar() {
    this.change_sidebar_filter_flag = true;

    this.invKey_copy = this.invKey;
    this.statusFilter_copy = this.statusFilter;

    this.orgName_copy = this.deepCopyArray(this.orgName);
    this.desgName_copy = this.deepCopyArray(this.desgName);
    this.deptName_copy = this.deepCopyArray(this.deptName);
    console.log(this.deptName_copy);

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.startDate); // Set current date as default

      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.endDate); // Set current date as default

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });


      this.startDate_copy = this.startDate;
      this.endDate_copy = this.endDate;
    }, 1500);

    document.getElementById("sidebar").style.width = "380px";

  }
  deepCopyArray(arr) {
    const copy = [];

    arr.forEach(item => {
      if (Array.isArray(item)) {
        copy.push(this.deepCopyArray(item)); // Recursively copy arrays
      } else if (typeof item === 'object' && item !== null) {
        copy.push(this.deepCopyObject(item)); // Recursively copy objects
      } else {
        copy.push(item); // Copy primitive values
      }
    });

    return copy;
  }
  deepCopyObject(obj) {
    const copy = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          copy[key] = this.deepCopyArray(obj[key]); // Recursively copy arrays
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          copy[key] = this.deepCopyObject(obj[key]); // Recursively copy objects
        } else {
          copy[key] = obj[key]; // Copy primitive values
        }
      }
    }

    return copy;
  }

}
