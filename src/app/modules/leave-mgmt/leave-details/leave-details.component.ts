import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LeaveMgmtService } from '../leave-mgmt.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { EmployeeService } from '../../employee/employee.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';

@Component({
  selector: 'app-leave-details',
  templateUrl: './leave-details.component.html',
  styleUrls: ['./leave-details.component.css'],
  animations: [grooveState, dongleState],
})
export class LeaveDetailsComponent {

  showSidebar: boolean = false;
  emp_id: any;
  tp_account_id: any;
  statusFilter: any = 'All';
  leave_appl_empid_list_data: any = [];
  leave_balance_data: any = [];
  showApproveRejectPopup: boolean = false;
  approveRejectForm: FormGroup;
  approve_reject_title: any = '';
  mark_approval_status: any = '';
  product_type: any = '';
  decoded_token: any;
  employee_data: any = [];
  settings: any = {};
  showDocumentPopup: boolean = false;
  document_url: any = '';
  innerPanelData: any = [];
  showGatePassModal = false;
  gatePassModalData: any = [];
  approval_level_by_user_id_data: any = {};
  panelStates: any = {};
  constructor(
    private router: Router,
    private _leaveMgmtService: LeaveMgmtService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private _EmployeeService: EmployeeService,
    private sanitizer: DomSanitizer,
    private _businessSettingsService: BusinesSettingsService,
  ) {
    if (this.router.getCurrentNavigation().extras.state != undefined && this.router.getCurrentNavigation().extras.state.emp_id != undefined) {
      this.emp_id = this.router.getCurrentNavigation().extras.state.emp_id;
    }
  }

  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    // console.log(this.decoded_token);// sub-employer

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

    // this.settings = {
    //   singleSelection: true,
    //   primaryKey: "id",
    //   labelKey: "account_contact_name",
    //   text: "Select Name",
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   enableSearchFilter: true,
    //   classes: "myclass custom-class",
    //   lazyLoading: true,
    //   // disabled:this.date_of_relieving_flag,
    //   position: 'bottom',
    //   autoPosition: true
    // }

    this.get_Leave_appl_all_by_empid();
    this.get_employee_leave_balance();
    this.employer_details();

    // if (this.decoded_token.isEmployer=='0' && this.decoded_token.sub_userid) {
    //   this.get_leave_approval_level_by_user_id(this.decoded_token.sub_userid);

    // }
  }

  get ar() {
    return this.approveRejectForm.controls;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changeStatusFilter(val: any) {
    this.statusFilter = val;
    this.get_Leave_appl_all_by_empid();
  }

  get_Leave_appl_all_by_empid() {
    this._leaveMgmtService.get_Leave_appl_by_account_empid({
      'action': 'get_Leave_appl_all_by_empid',
      'accountId': this.tp_account_id.toString(),
      'empid': this.emp_id.toString(),
      'approval_status': this.statusFilter,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leave_appl_empid_list_data = resData.commonData;

        } else {
          this.leave_appl_empid_list_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.leave_appl_empid_list_data = [];
        console.log(e);
      }
    })
  }

  get_employee_leave_balance() {
    this._leaveMgmtService.get_employee_leave_balance({
      'accountId': this.tp_account_id.toString(),
      'empid': this.emp_id.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leave_balance_data = resData.commonData[0];
        } else {
          this.leave_balance_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
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

    console.log(data);

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
          this.get_Leave_appl_all_by_empid();
          this.get_employee_leave_balance();


        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
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

  employer_details() {

    this._EmployeeService
      .employer_details({
        customeraccountid: this.tp_account_id.toString(),
        productTypeId: this.product_type,
        GeoFenceId: this.decoded_token.geo_location_id
      })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            if (resData.statusCode) {
              this.employee_data = resData.commonData;
            } else {
              this.employee_data = [];
            }
          } else {
            this.toastr.error(resData.message, 'Oops!');
          }
        }
      });
  }

  changeEmp(val: any) {
    console.log(val);
    this.emp_id = val;
    this.get_Leave_appl_all_by_empid();
    this.get_employee_leave_balance();
  }

  openDocumentPopup(url: any) {
    this.showDocumentPopup = true;
    this.document_url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closeDocumentPopup() {
    this.showDocumentPopup = false;
    this.document_url = '';
  }

  openPanel(i: number, emp_data: any): void {
    this.innerPanelData = emp_data;

    const targetElement = document.getElementById(`collapseOne${i}`);

    const isOpen = targetElement.classList.contains('in');

    Object.keys(this.panelStates).forEach((key) => {
      this.panelStates[+key] = false;
      const otherElement = document.getElementById(`collapseOne${key}`);
      if (otherElement) {
        otherElement.classList.remove('in');
      }
    });

    if (!isOpen) {
      targetElement.classList.add('in');
      this.panelStates[i] = true;
    } else {
      targetElement.classList.remove('in');
      this.panelStates[i] = false;
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


  get_leave_approval_level_by_user_id(subuserid: any) {
    this._businessSettingsService.manage_approval_master({
      'action': 'get_approval_level_by_user_id',
      'accountid': this.tp_account_id.toString(),
      'user_by': subuserid,
      'approval_module_id': '1',

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
    } else
    {
      return true;
    }
  }


  leaveApplicationApproval(data:any) {
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
      }, error : (e) => {
        console.log('Error :', e);
      }
    })
  }

  leaveApplicationRejection(data:any) {
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
      }, error : (e) => {
        console.log('Error :', e);
      }
    })
  }


}
