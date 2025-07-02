import { Component } from '@angular/core';
import { LeaveMgmtService } from '../leave-mgmt.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { dongleState, grooveState } from 'src/app/app.animation';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AttendanceService } from '../../attendance/attendance.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
declare var $: any;
@Component({
  selector: 'app-leave-applications',
  templateUrl: './leave-applications.component.html',
  styleUrls: ['./leave-applications.component.css'],
  animations: [grooveState, dongleState],
})
export class LeaveApplicationsComponent {

  showSidebar: boolean = false;
  filter_fromdate: any;
  filter_todate: any;
  statusFilter: any = 'All';
  tp_account_id: any;
  leave_appl_list_data: any = [];
  tot_approved: any = 0;
  tot_rejected: any = 0;
  tot_pending: any = 0;
  selected_val: string = '1';
  decoded_token: any;
  showDocumentPopup: boolean = false;
  document_url: any = '';
  innerPanelData: any = [];
  showGatePassModal: boolean = false;
  gatePassModalData: any = [];
  showCommentsPopup: boolean = false;
  commentsData: any = [];
  approveRejectForm: FormGroup;
  showApproveRejectPopup: boolean = false;
  approve_reject_title: any = '';
  mark_approval_status: any = '';
  fromDate!: Date | null;
  toDate!: Date | null;
  change_sidebar_filter_flag: boolean = false;
  startDate: any;
  endDate: any;
  invKey: any;

  invKey_copy: any = '';
  startDate_copy: any;
  endDate_copy: any;
  statusFilter_copy: any = 'All';
  daywisefilter: any = '';
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

  constructor(
    private _leaveMgmtService: LeaveMgmtService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private _attendanceService: AttendanceService,
    private _businesessSettingsService: BusinesSettingsService
  ) { }

  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // console.log(decoded_token);

    // let date = new Date();
    // this.filter_fromdate = this.formatDate(date);
    // this.filter_todate = this.formatDate(date);


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

    this.approveRejectForm = this._formBuilder.group({
      accountid: [''],
      approval_remarks: [''],
      approval_status: [''],
      approvedon: [''],
      attachemnt_url: [''],
      createdby: [''],
      createdon: [''],
      emp_id: [''],
      fromdate: [''],
      leave_applid: [''],
      leave_description: [''],
      leave_subject: [''],
      leavetemplateid: [''],
      leavetypecode: [''],
      leavetypename: [''],
      rejected_on: [''],
      rejected_remarks: [''],
      todate: [''],
      remark: [''],
      leave_days: [''],

      action_comment_txt: [''],
      user_approval_level: [''],
      mobile: [''],
      is_whatsappsms: [''],

    })
    this.get_geo_fencing_list();
    this.getDepartmentData();
    this.getDesignationData();
    this.get_Leave_appl_by_account();

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get ar() {
    return this.approveRejectForm.controls;
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
    // console.log(this.filter_todate);

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

    console.log("From Date:", this.startDate);
    console.log("To Date:", this.endDate);

    this.get_Leave_appl_by_account();
  }

  changeStatusFilter(val: any) {
    this.statusFilter = val;
    this.get_Leave_appl_by_account();
  }

  get_Leave_appl_by_account() {
    this.tot_pending = 0;
    this.tot_approved = 0;
    this.tot_pending = 0;
    this.tot_rejected = 0;
    console.log(this.statusFilter);
    console.log(this.startDate);
    console.log(this.endDate);

    this._leaveMgmtService.get_Leave_appl_by_account_empid({
      'action': 'get_Leave_appl_by_account',
      'accountId': this.tp_account_id.toString(),
      'fromdate': this.startDate,
      'todate': this.endDate,
      'approval_status': this.statusFilter,
      'p_geofenceid': this.decoded_token.geo_location_id?.toString(),
      'ouIds': this.decoded_token.ouIds?.toString(),
      'postOffered': this.desgName,
      'postingDepartment': this.deptName,
      'unitParameterName': this.orgName,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leave_appl_list_data = resData.commonData;

          this.leave_appl_list_data.map((el: any) => {
            if (el.approval_status == 'Pending') {
              this.tot_pending += 1;
            } else if (el.approval_status == 'Approved') {
              this.tot_approved += 1;
            } else if (el.approval_status == 'Rejected') {
              this.tot_rejected += 1;
            }
          })

          // console.log("leave_appl_list_data", this.leave_appl_list_data);

        } else {
          this.leave_appl_list_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.leave_appl_list_data = [];
        console.log(e);
      }
    })
  }

  // getDate(dt: any) {
  //   let dt_array = dt.split('-');
  //   const date = new Date(dt_array[0], dt_array[1], dt_array[2]);
  //   let month = date.toLocaleString('default', { month: 'short' });

  //   return dt_array[0] + '-' + month + '-' + dt_array[2];
  // }

  routeToDetails(emp_id: any) {
    console.log(emp_id);
    this.router.navigate(['/leave-mgmt/leave-details'], { state: { emp_id: emp_id } });

  }

  openDocumentPopup(url: any) {
    this.showDocumentPopup = true;
    this.document_url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closeDocumentPopup() {
    this.showDocumentPopup = false;
    this.document_url = '';
  }

  openPanel(i: number, emp_data: any) {
    this.innerPanelData = emp_data;

    const targetElement = document.getElementById(`collapseOne${i}`);

    // Check if the clicked panel is already open
    const isOpen = targetElement.classList.contains('in');

    // Close all previously opened panels (if needed)
    const previouslyOpened = document.querySelectorAll('.in.panel-collapse.collapse');

    previouslyOpened.forEach(panel => {
      if (panel !== targetElement) {
        panel.classList.remove('in');
      }
    });

    // Toggle visibility of the clicked panel (considering its state)
    if (!isOpen) {
      targetElement.classList.add('in'); // Open if not already open
    } else {
      targetElement.classList.remove('in'); // Close if already open
    }
  }

  openGatePassModal(applied_dt: any) {
    this.showGatePassModal = false;
    this.gatePassModalData = [];

    this._leaveMgmtService.get_gatepass_data({
      action: 'get_gatepass_data',
      accountId: this.innerPanelData.accountid.toString(),
      emp_id: this.innerPanelData.emp_id.toString(),
      fromdate: applied_dt,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.showGatePassModal = true;
          this.gatePassModalData = resData.commonData[0];
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  closeGatePassModal() {
    this.showGatePassModal = false;
    this.gatePassModalData = [];
  }

  // onPrint(divName) {
  //   var w = window.open();
  //   const printContents = document.getElementById(divName).innerHTML;
  //   const originalContents = document.body.innerHTML;
  //   w.document.body.innerHTML = printContents;
  //   w.window.print();
  //   w.document.body.innerHTML = originalContents;
  //   w.window.close();

  // }

  onPrint(divName) {
    // Open a new window
    const w = window.open('', '_blank');

    // Get the contents to print
    const printContents = document.getElementById(divName).innerHTML;

    // Copy the styles from the parent document to the new window
    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map(style => style.outerHTML)
      .join('');

    // Write the contents and styles to the new window's document
    w.document.open();
    w.document.write(`
      <html>
        <head>
          <title>Print</title>
          ${styles}
        </head>
        <body>
          ${printContents}
          <script>
            function printAndClose() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }

            // Print after 2 seconds regardless of image load status
            setTimeout(printAndClose, 2000);
          </script>
        </body>
      </html>
    `);
    w.document.close();
  }



  openCommentsPopup(data: any) {
    this.showCommentsPopup = true;
    this.commentsData = !data ? [] : data.split('<br><br>')
      .map(line => `&#9679; ${line.trim()}`) // Prepend black circle
      .filter(line => line);

    // console.log(this.commentsData)

  }

  closeCommentsPopup() {
    this.showCommentsPopup = false;
    this.commentsData = [];
  }




  closeApproveRejectPopup() {
    this.showApproveRejectPopup = false;
    this.approve_reject_title = '';
    this.mark_approval_status = '';

    this.approveRejectForm.patchValue({
      accountid: '',
      approval_remarks: '',
      approval_status: '',
      approvedon: '',
      attachemnt_url: '',
      createdby: '',
      createdon: '',
      emp_id: '',
      fromdate: '',
      leave_applid: '',
      leave_description: '',
      leave_subject: '',
      leavetemplateid: '',
      leavetypecode: '',
      leavetypename: '',
      rejected_on: '',
      rejected_remarks: '',
      todate: '',
      remark: '',
      leave_days: '',

      action_comment_txt: '',
      user_approval_level: '',
      mobile: '',
      is_whatsappsms: '',
    })
  }
  get_geo_fencing_list() {
    this._businesessSettingsService.GetGeoFencing_List({
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
          console.log(this.deptList);

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
  openApproveRejectPopup(status: any, data: any) {
    // console.log(data);
    this.showApproveRejectPopup = true;
    this.approve_reject_title = status;
    let remark = '';

    if (status == 'Approve') {
      this.mark_approval_status = 'Approved';

    } else if (status == 'Reject') {
      this.mark_approval_status = 'Rejected';

    } else {
      if (data.approval_status == 'Approved') {
        remark = data.approval_remarks;
        // console.log('h111',remark);
      } else if (data.approval_status == 'Rejected') {
        remark = data.rejected_remarks;
      }
    }

    // console.log(data);

    this.approveRejectForm.patchValue({
      accountid: data.accountid,
      approval_remarks: data.approval_remarks,
      approval_status: data.approval_status,
      approvedon: data.approvedon,
      attachemnt_url: data.attachemnt_url,
      createdby: data.createdby,
      createdon: data.createdon,
      emp_id: data.emp_id,
      fromdate: data.fromdate,
      leave_applid: data.leave_applid,
      leave_description: data.leave_description,
      leave_subject: data.leave_subject,
      leavetemplateid: data.leave_templateid,
      leavetypecode: data.leavetypecode,
      leavetypename: data.leavetypename,
      rejected_on: data.rejected_on,
      rejected_remarks: data.rejected_remarks,
      todate: data.todate,
      leave_days: data.leave_days,
      remark: remark,

      action_comment_txt: !data.action_comment_txt ? '' : data.action_comment_txt,
      user_approval_level: data.user_approval_level == 0 ? 0 : !data.user_approval_level ? '' : data.user_approval_level,
      mobile: data.mobile,
      is_whatsappsms: data.is_whatsappsms,
    })

    // console.log(this.approveRejectForm.value);
  }

  approved_leave_appl_by_applid() {
    let data = this.approveRejectForm.value;
    // console.log(this.mark_approval_status, data);
    // console.log(data.is_whatsappsms && data.is_whatsappsms == 'Y');
    // console.log(this.mark_approval_status == 'Approved');
    // return;

    this._leaveMgmtService.approved_leave_appl_by_applid({
      action: 'approved_leave_appl_by_applid',
      accountId: data.accountid.toString(),
      empid: data.emp_id.toString(),
      approval_status: this.mark_approval_status,
      row_id: data.leave_applid.toString(),
      remark: data.remark,
      isemployer: this.decoded_token.isEmployer,
      subuser_id: this.decoded_token.sub_userid,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          if (data.is_whatsappsms && data.is_whatsappsms == 'Y') {
            if (this.mark_approval_status == 'Approved') {
              this.leaveApplicationApproval(data);

            } else if (this.mark_approval_status == 'Rejected') {
              this.leaveApplicationRejection(data);
            }
          }
          this.toastr.success(resData.message, 'Success');
          this.closeApproveRejectPopup();
          this.get_Leave_appl_by_account();


        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
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

  leaveApplicationApproval(data: any) {
    this._leaveMgmtService.leaveApplicationApproval({
      "recipient_mobile": data.mobile,
      "from_date": data.fromdate,
      "to_date": data.todate,
      "cancelledBy": this.decoded_token.name,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          console.log('Success :', resData.message);
        } else {
          console.log('Failed :', resData.message);
        }
      }, error: (e) => {
        console.log('Error :', e);
      }
    })
  }

  leaveApplicationRejection(data: any) {
    this._leaveMgmtService.leaveApplicationRejection({
      "recipient_mobile": data.mobile,
      "from_date": data.fromdate,
      "to_date": data.todate,
      "cancelledBy": this.decoded_token.name,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          console.log('Success :', resData.message);
        } else {
          console.log('Failed :', resData.message);
        }
      }, error: (e) => {
        console.log('Error :', e);
      }
    })
  }
  filterByDate(): void {
    const formatDate = (date: any) => {
      return date ? new Date(date).toLocaleDateString('en-GB') : ''; // 'en-GB' se format dd/MM/yyyy aayega
    };

    this.filter_fromdate = formatDate(this.fromDate);
    this.filter_todate = formatDate(this.toDate);

    if (this.filter_fromdate && this.filter_todate && this.toDate < this.fromDate) {
      this.toastr.error('To Date cannot be earlier than From Date.', 'Invalid Date Range');
      return;
    }

    if (this.filter_fromdate && this.filter_todate) {
      this.get_Leave_appl_by_account();
    }
  }

  resetDateFilter(): void {
    let today = new Date();

    // Formatted string for 'dd-MM-yyyy'
    let formattedDateStr = today.toLocaleDateString('en-GB').split('/').join('-');

    // Date object for this.fromDate and this.toDate
    this.fromDate = today;
    this.toDate = today;

    // String values for API payload
    this.filter_fromdate = formattedDateStr;
    this.filter_todate = formattedDateStr;

    this.get_Leave_appl_by_account();
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

    this.get_Leave_appl_by_account();
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
    console.log(this.daywisefilter);

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
