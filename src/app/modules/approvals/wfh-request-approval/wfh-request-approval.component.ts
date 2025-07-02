import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { dongleState, grooveState } from 'src/app/app.animation';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AttendanceService } from '../../attendance/attendance.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { LeaveMgmtService } from '../../leave-mgmt/leave-mgmt.service';
import moment from 'moment';
import { EmployeeLoginService } from '../../employee-login/employee-login.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { Validators } from 'ngx-editor';
declare var $: any;
@Component({
  selector: 'app-wfh-request-approval',
  templateUrl: './wfh-request-approval.component.html',
  styleUrls: ['./wfh-request-approval.component.css'],
  animations: [grooveState, dongleState],
})
export class WfhRequestApprovalComponent {

  showSidebar: boolean = false;
  statusFilter: any = 'All';
  tp_account_id: any;
  tot_approved: any = 0;
  tot_rejected: any = 0;
  tot_pending: any = 0;
  selected_val: string = '1';
  decoded_token: any;
  showDocumentPopup: boolean = false;
  document_url: any = '';
  innerPanelData: any = [];
  showCommentsPopup: boolean = false;
  commentsData: any = [];
  approveRejectForm: FormGroup;
  showApproveRejectPopup: boolean = false;
  approve_reject_title: any = '';
  mark_approval_status: any = '';
  invKey: any;
  product_type: any;
  wfhRequests: any[] = [];
  orgList: any[];
  emp_wfhData: any;

  constructor(
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private _formBuilder: FormBuilder,
    private _employeeLoginService: EmployeeLoginService,
    private _businesessSettingsService: BusinesSettingsService,
    private _encrypterService: EncrypterService,
  ) { }

  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.approveRejectForm = this._formBuilder.group({
      remark: ['', Validators.required]
    });

    this.get_geo_fencing_list();
    this.getWFHRequestByAccount();

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

      this.getWFHRequestByAccount();

    }, 100);

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changeStatusFilter() {
    this.getWFHRequestByAccount();
  }

  filterFromToDateRequests(fromDateId: string, toDateId: string) {
    // this.isWfhFormValid = true;
    let fromDate = $(`#${fromDateId}`).val();
    let toDate = $(`#${toDateId}`).val();

    // Check if both dates have values
    if (!fromDate || !toDate) {
      console.log('One of the dates is missing, skipping validation');
      return;
    }

    let formatted_fromDate = moment(fromDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    let formatted_toDate = moment(toDate, 'DD-MM-YYYY').format('YYYY-MM-DD');

    // Get the current month's start and end dates
    const currentMonthStart = moment().startOf('month').format('YYYY-MM-DD');
    const currentMonthEnd = moment().endOf('month').format('YYYY-MM-DD');
    const errMsgStart = moment().startOf('month').format('DD-MM-YYYY');
    const errMsgEnd = moment().endOf('month').format('DD-MM-YYYY');

    // Validate that the dates are within the current month's range
    if (new Date(formatted_fromDate) < new Date(currentMonthStart) || new Date(formatted_fromDate) > new Date(currentMonthEnd)) {
      this.toastr.error(`From date must be between ${errMsgStart} and ${errMsgEnd}`, 'Oops!');
      // this.isWfhFormValid = false;
      return;
    }

    if (new Date(formatted_toDate) < new Date(currentMonthStart) || new Date(formatted_toDate) > new Date(currentMonthEnd)) {
      this.toastr.error(`To date must be between ${errMsgStart} and ${errMsgEnd}`, 'Oops!');
      // this.isWfhFormValid = false;
      return;
    }

    if (new Date(formatted_toDate) >= new Date(formatted_fromDate)) {
      this.getWFHRequestByAccount();
    } else {
      this.toastr.error("From date should be less than or equal to the To date", 'Oops!');
      // this.isWfhFormValid = false;
      return;
    }

  }


  openDocumentPopup(url: any) {
    this.showDocumentPopup = true;
    this.document_url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closeDocumentPopup() {
    this.showDocumentPopup = false;
    this.document_url = '';
  }

  openCommentsPopup(data: any) {
    this.showCommentsPopup = true;
    this.commentsData = !data ? [] : data.split('<br><br>')
      .map(line => `&#9679; ${line.trim()}`) // Prepend black circle
      .filter(line => line);
  }

  closeCommentsPopup() {
    this.showCommentsPopup = false;
    this.commentsData = [];
  }

  openApproveRejectPopup(status: any, data: any) {
    this.emp_wfhData = data
    this.showApproveRejectPopup = true;
    this.approve_reject_title = status;
    let remark = '';

    if (status == 'Approve') {
      this.mark_approval_status = 'Approved';

    } else if (status == 'Reject') {
      this.mark_approval_status = 'Rejected';

    }

  }

  closeApproveRejectPopup() {
    this.showApproveRejectPopup = false;
    this.approve_reject_title = '';
    this.mark_approval_status = '';
    this.approveRejectForm.value.remark = '';
  }

  // GET WFH Requests By Account
  getWFHRequestByAccount() {

    this.tot_approved = 0;
    this.tot_pending = 0;
    this.tot_rejected = 0;

    let obj = {
      action: "get_wfh_appl_by_account",
      accountid: this.tp_account_id.toString(),
      // emp_id: this.emp_id,
      fromdate: $('#FromDate').val(),
      todate: $('#ToDate').val(),
      approval_status: this.statusFilter,
      isEmployer:this.decoded_token.isEmployer,
      sub_userid: this.decoded_token?.sub_userid
    }

    this._employeeLoginService.manageWFHRequest(obj).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.wfhRequests = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          console.log(this.wfhRequests);

          this.wfhRequests.map((emp_wfh: any) => {
            if (emp_wfh.approval_status == 'Pending') {
              this.tot_pending += 1;
            } else if (emp_wfh.approval_status == 'Approved') {
              this.tot_approved += 1;
            } else if (emp_wfh.approval_status == 'Rejected') {
              this.tot_rejected += 1;
            }
          });

        } else {
          this.wfhRequests = [];
          console.log(resData.message);
        }
      }
    })
  }

  // Approve/Reject WFH Request 
  approveRejectWFHByApplyId() {

    if (this.approveRejectForm.invalid){
      this.approveRejectForm.markAllAsTouched();
      this.toastr.error("Remark is required!");
      return;
  }

    let createdby = '';
    if (this.decoded_token.isEmployer == '0') {
      createdby = !this.decoded_token?.sub_userid ? this.tp_account_id : this.decoded_token.sub_userid;
    } else {
      createdby = this.tp_account_id;
    }


    let obj = {
      'action': "approved_wfh_appl_by_applid",
      'accountid': this.tp_account_id.toString(),
      'emp_id': this.emp_wfhData?.emp_id?.toString(),
      'wfhAppliedId': this.emp_wfhData?.wfh_applid?.toString(),
      'approval_status': this.mark_approval_status,
      'user_by': createdby?.toString(),
      'remark': this.approveRejectForm.value.remark,
      'createdby': createdby?.toString(),
      'isEmployer': this.decoded_token.isEmployer,
      'sub_userid': this.decoded_token?.sub_userid?.toString()
    }

    this._employeeLoginService.manageWFHRequest(obj).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          if (obj.approval_status == 'Approved') {
            this.toastr.success("WFH Application Approved!")
          } else if (obj.approval_status == 'Rejected') {
            this.toastr.error("WFH Application Rejected!")
          }
          this.getWFHRequestByAccount();
          this.closeApproveRejectPopup();

        } else {
          console.log(resData.message);
        }
      }
    })
  }


  routeToDetails(emp_id: any) {
    // console.log(emp_id);
    this.router.navigate(['/leave-mgmt/leave-details'], { state: { emp_id: emp_id } });

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

}
