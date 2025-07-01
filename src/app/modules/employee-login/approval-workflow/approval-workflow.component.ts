import { Component, Input } from '@angular/core';
import { dongleState, grooveState } from 'src/app/app.animation';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { EmployeeLoginService } from '../employee-login.service';
import { ChangeDetectorRef } from '@angular/core';
import { ApprovalsService } from '../../approvals/approvals.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

declare var $: any;


// --- ADDED: Interfaces for the clearance form data ---
interface ClearanceItem {
  remarks: string;
  deducation_amount: number;
  id: number;
  asset_item: string;
  is_cleared: string;
  department_name: string;
  originalIndex?: number;
}
interface EmployeeDetailsForForm {
  emp_name: string;
  orgempcode: string;
  posting_department: string;
  current_designation: string;
  dateofjoining: string;
  dateofresignation: string;
  hodRo: string;
  last_working_day_at_the_organization: string;
}

interface FullFinalEmployee {
  is_feedback_link_status: boolean;
  emp_code: number;
  emp_name: string;
  orgempcode?: string;
  tpcode?: string;
  exit_status: string;
  post_offered: string;
  posting_department: string;
}

@Component({
  selector: 'app-approval-workflow',
  templateUrl: './approval-workflow.component.html',
  styleUrls: ['./approval-workflow.component.css', '../../employee-management/empl-approval-workflow/empl-approval-workflow.component.css'],
  animations: [dongleState, grooveState],
})
export class ApprovalWorkflowComponent {

  @Input() empDataFromParent: any;
  showAddApprovalModal: boolean = false;
  token: any;
  tp_account_id: any;
  payout_method: any;
  product_type: string;
  approvalList: any = [];
  approvalDataByActionType: any = [];
  activeEmp: any = '';
  remarks: string = '';
  expense_amount: string = '';
  addRemarks: boolean = false;
  activeLeaveType: any = '';
  leaveStatus: any = 'P';
  isShowEmpDetails: boolean = false;
  isShowEmployeeDetails: boolean = false;
  empDetails: any = '';
  fromDate: any = '';
  toDate: any = '';
  approvalType: any = '';
  approvedAmount: any = '0';
  modalHeadText: any = '';
  isTicketFile: boolean = false;
  isHotelBill: boolean = false;
  compoff_leaves: any;
  compoff_leaves_flag: string;
  expenseAmountError: boolean = false;

  employeesInFullFinal: FullFinalEmployee[] = [];
  ouIds: any;
  fullAndFinal: boolean = false;

   // --- ADDED: Properties to manage the Exit Clearance Form directly in this component ---
  showExitClearanceModal: boolean = false;
  clearanceForm!: FormGroup;
  isLoadingAccess = true;
  canAccessForm = false;
  is_submitted = false;
  clearanceFormEmployeeDetails: EmployeeDetailsForForm;
  allClearanceItems: ClearanceItem[] = [];
  groupedItems: { [key: string]: ClearanceItem[] } = {};
  departmentKeys: string[] = [];
  showEmployeeInfo = true;
  showTable = true;
  showSignature = true;

  constructor(
    private _employeeMgmtService: EmployeeManagementService,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private toastr: ToastrService,
    private _employeeLoginService: EmployeeLoginService,
    private cdr: ChangeDetectorRef,
    private _approvalsService: ApprovalsService,

      // --- ADDED: FormBuilder for the clearance form ---
    private fb: FormBuilder
  ) {
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.payout_method = this.token.payout_mode_type;
    this.product_type = localStorage.getItem('product_type');
    this.ouIds = this.token.ouIds;
    this.getMasterList()
  }

  ngAfterViewInit() {

    let startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', startDate);

      $('#ToDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', tomorrow);

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });

    }, 100);
    // .datepicker('setDate', new Date());
    this.getMasterList();

  }

  getMasterList() {

    this._employeeMgmtService.getMasterListingOfApproval({
      customerAccountId: this.tp_account_id.toString(),
      empCode: this.empDataFromParent.emp_code,
      productTypeId: this.product_type,
      approvalId: '',
      // fromDt: this.fromDate.split('-').reverse().join('-'),
      // toDt : this.toDate.split('-').reverse().join('-'),
      fromDt: this.fromDate || "",
      toDt: this.toDate || "",
      statusFilter: this.leaveStatus
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.approvalList = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        // this.approvalList = this.approvalList.filter((item)=> item.approvalactiontype != "get_imprest_req_app");
        // console.log("approvalList", this.approvalList)
      } else {
        this.approvalList = [];
      }
    })
  }

  getDateWiseData() {
    this.fromDate = $('#FromDate').val();
    this.toDate = $('#ToDate').val();

    if (this.fromDate && this.toDate) {
      this.getMasterList();
    }
  }

  getLeaveByStatus(status: any) {
    this.leaveStatus = status;
    this.getMasterList();
  }

  openAddApprovalModal(approval: any) {
    if (approval.approvalcount == 0) {
      return;
    }

    this.showAddApprovalModal = true;
    this.activeLeaveType = approval;

    this.approvalType = approval.approvaltype;

    // console.log("Approval Type --", this.approvalType)
    let body = document.querySelector('body');
    if (body) {
      body.classList.add('modal-open');
    }

    this._employeeMgmtService.getApprovalRequestByActionType({
      customerAccountId: this.tp_account_id.toString(),
      empCode: this.empDataFromParent.emp_code,
      productTypeId: this.product_type,
      approvalId: '',
      fromDt: this.fromDate || "",
      toDt: this.toDate || "",
      statusFilter: this.leaveStatus,
      actionType: approval.approvalactiontype
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.approvalDataByActionType = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        // console.log("DATA FROM API --", this.approvalDataByActionType)
      } else {
        this.approvalDataByActionType = []
      }
    })
  }
  //added for exit process
  openAddApprovalModalForExit(approval: any) {
    this.fullAndFinal = true;
    this.showAddApprovalModal = true;
    this.activeLeaveType = approval;
    this.approvalType = "Exit Employee List";

    let body = document.querySelector('body');
    if (body) {
      body.classList.add('modal-open');
    }

    // Call Full and Final Employee Data API
    const payload = {
      customerAccountId: this.tp_account_id,
      empCode: this.empDataFromParent.emp_code,  // use same empCode as above
      ouIds: "",
      postOffered: "",
      postingDepartment: "",
      unitParameterName: "",
      status: "FNFPending",
      actionType: "GetExitEmployeeByReportingMgr"
    };
    console.log("payload", payload);
    this._employeeMgmtService.getFullAndFinalDetail(payload).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res?.statusCode === true && res?.commonData) {
          console.log(res);
          try {
            const decryptedData = JSON.parse(this._encrypterService.aesDecrypt(res.commonData));
            console.log("decrepted data", decryptedData);
            this.employeesInFullFinal = Array.isArray(decryptedData) ? decryptedData : [];
            console.log("Employee Full & Final Data:", this.employeesInFullFinal);
          } catch (error) {
            // console.error('Error parsing Full & Final decrypted data:', error);
            this.employeesInFullFinal = [];
          }
        }

      },
      error: (err: any) => {
        // console.error('Error fetching Full and Final employees:', err);
        this.employeesInFullFinal = [];

      }
    });
  }
  //end

  closeAddApprovalModal() {
    this.fullAndFinal = false;
    this.showAddApprovalModal = false;
    this.activeLeaveType = '';
    this.approvalDataByActionType = []
    let body = document.querySelector('body');
    if (body) {
      body.classList.remove('modal-open');
    }
  }

  isShowActionButton(empData: any): boolean {
    let isActionTypeVisible = false;

    if (this.leaveStatus == 'P') {

      if ((empData.is_workflow_applied == 'N') || (empData.is_workflow_applied_req == 'N') || (empData.is_workflow_applied_exp == 'N')) {
        isActionTypeVisible = true;
      } else {
        if (empData.template_mode == 'strict') {
          if (empData.wf_approval_cur_level == empData.user_approval_level
            || (empData.wf_approval_cur_level_req == empData.user_approval_level)
            || (empData.wf_approval_cur_level_exp == empData.user_approval_level)
          ) {
            isActionTypeVisible = true;
          }
        } else {
          if (empData.max_reporting_level == empData.user_approval_level) {
            isActionTypeVisible = true;
          } else {
            if ((empData.wf_approval_cur_level <= empData.max_reporting_level)
              || (empData.wf_approval_cur_level_req <= empData.max_reporting_level)
              || (empData.wf_approval_cur_level_exp <= empData.max_reporting_level)
            ) {
              isActionTypeVisible = true;
            }
          }
        }
      }

    }
    return isActionTypeVisible;
  }

 openExitClearanceModal(employee: any) {
    this.activeEmp = employee;
    this.showExitClearanceModal = true;
    // Trigger the data loading for the form
    this.initializeEmptyForm(); 
    this.loadDataAndBuildForm();
  }
  initializeEmptyForm(): void {
    this.clearanceForm = this.fb.group({
      employeeName: [{ value: '', disabled: true }],
      employeeCode: [{ value: '', disabled: true }],
      designation: [{ value: '', disabled: true }],
      department: [{ value: '', disabled: true }],
      dateOfJoining: [{ value: '', disabled: true }],
      hodRo: [{ value: '', disabled: true }],
      dateOfResignation: [{ value: '', disabled: true }],
      lastWorkingDay: [{ value: '', disabled: true }],
      clearanceItems: this.fb.array([]),
      // approvalRemark: ['']
    });
  }
  
  closeExitClearanceModal() {
    this.showExitClearanceModal = false;
    this.activeEmp = null;
    // Reset form state to ensure it's fresh next time
    this.clearanceForm = null;
    this.isLoadingAccess = true;
    this.canAccessForm = false;
  }

  // --- ADDED: All methods required to manage the clearance form ---

  get clearanceItemsArray(): FormArray {
    return this.clearanceForm.get('clearanceItems') as FormArray;
  }

  loadDataAndBuildForm(): void {
    if (!this.activeEmp?.emp_code) {
      this.toastr.error("Employee data not provided. Cannot load form.");
      this.isLoadingAccess = false;
      this.canAccessForm = false;
      return;
    }

    this.isLoadingAccess = true;
    const payload = {
      customerAccountId: this.tp_account_id,
      empCode: this.activeEmp.emp_code, // Use the emp_code from the selected employee
      productTypeId: this.product_type,
      actionType: 'Get_MST_CLEARANCE_FORM',
    };

    // Use the service that gets the form details
    this._employeeLoginService.getExitFormDetails(payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true && res?.commonData) {
          const data = JSON.parse(this._encrypterService.aesDecrypt(res.commonData));
          this.canAccessForm = true;
          console.log(data);
          this.clearanceFormEmployeeDetails = data[0]?.employeedetails?.[0] || {};
          this.allClearanceItems = data[0]?.exit_master_reason || [];
          this.is_submitted = data[0]?.submit_status || false;

          this.groupItemsByDepartment(this.allClearanceItems);
          this.populateClearanceForm(this.clearanceFormEmployeeDetails, this.allClearanceItems);

        } else {
          this.toastr.error(res?.message || "Could not load clearance form data.");
          this.canAccessForm = false;
        }
        this.isLoadingAccess = false;
      },
      error: (err) => {
        // console.error('Error loading clearance data:', err);
        this.toastr.error("An error occurred while fetching form data.");
        this.canAccessForm = false;
        this.isLoadingAccess = false;
      },
    });
  }

populateClearanceForm(details: EmployeeDetailsForForm, items: ClearanceItem[]): void {
    this.clearanceForm.patchValue({
      employeeName: details.emp_name,
      employeeCode: details.orgempcode,
      designation: details.current_designation,
      department: details.posting_department,
      dateOfJoining: details.dateofjoining,
      hodRo: details.hodRo,
      dateOfResignation: details.dateofresignation,
      lastWorkingDay: details.last_working_day_at_the_organization,
      employeeDate: new Date().toISOString().split('T')[0] 
    });

    this.clearanceItemsArray.clear();
    items.forEach(item => {
      this.clearanceItemsArray.push(this.fb.group({
        id: [item.id], 
        asset_item: [{ value: item.asset_item, disabled: true }],
        status: [item.is_cleared || 'N/A'],
        remarks: [item.remarks || ''], 
        deducation_amount:[{value:item.deducation_amount || 0 , disabled: true}],
      }));
    });
  }


  // createClearanceItemControls(): FormGroup[] {
  //   return this.allClearanceItems.map(item => this.fb.group({
  //     id: [item.id],
  //     status: [item.is_cleared || '', Validators.required],
  //   }));
  // }


  groupItemsByDepartment(items: ClearanceItem[]): void {
    this.groupedItems = items.reduce((acc, item, index) => {
      const dept = item.department_name;
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push({ ...item, originalIndex: index });
      return acc;
    }, {} as { [key: string]: ClearanceItem[] });

    this.departmentKeys = Object.keys(this.groupedItems);
  }
  
  submitClearanceForm() {
    if (this.clearanceForm.invalid) {
      this.toastr.error('Please fill all required fields before submitting.');
      this.clearanceForm.markAllAsTouched();
      return;
    }

    const formData = this.clearanceForm.getRawValue();
    const send_payload = {
      empCode: this.activeEmp.emp_code,
      customerAccountId: this.tp_account_id,
      createdBy: this.empDataFromParent.emp_code, // Approver's code
      createdIp: "::1",
      clearanceData: JSON.stringify(formData.clearanceItems.map(item => ({
        clearance_master_id: item.id,
        is_cleared: item.status,
        remarks: item.remarks || "",
        deducation_amount:item.deducation_amount || 0,
        verified_by: this.empDataFromParent.emp_code // Approver is verifying
      }))),
      actionType: "employer" // Specify the action is by an approver
    };

    // Use the service that saves the form data
    this._employeeLoginService.saveCleranceForm(send_payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true || res?.status === 'success') {
          this.toastr.success(res?.message || 'Clearance form submitted successfully!');
          this.closeExitClearanceModal();
          // Refresh the list of employees
          this.openAddApprovalModalForExit(this.activeLeaveType);
        } else {
          this.toastr.error(res.message || 'Submission failed. Please try again.');
        }
      },
      error: (err) => {
        
        this.toastr.error(err.message || 'An error occurred during submission.');
      }
    });
  }

  // --- ADDED: UI Toggle Functions for the form sections ---
  toggleEmployeeInfo() { this.showEmployeeInfo = !this.showEmployeeInfo; }
  toggleTable() { this.showTable = !this.showTable; }

  // --- All your other existing methods remain below ---


  hideEmpDetailModal() {
    this.isShowEmpDetails = false;
    this.isShowEmployeeDetails = false;
    this.addRemarks = false;
    this.approvedAmount = 0;
    this.remarks = '';
    this.compoff_leaves = null;
  }

  openAddremark(action: string, employee: any, type: string) {
    this.isShowEmpDetails = true;
    this.addRemarks = true;
    this.compoff_leaves_flag = action;
    this.empDetails = employee;

    if (this.activeLeaveType.approvaltype == 'Leave') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Leave Request`
    } else if (this.activeLeaveType.approvaltype == 'On Duty') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} On Duty`
    } else if (this.activeLeaveType.approvaltype == 'Comp-Off Request') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Comp-Off Request`
      this.compoff_leaves = this.empDetails?.comp_off_days;
    } else if (this.activeLeaveType.approvaltype == 'WFH Request') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} WFH Request`
    } else if (this.activeLeaveType.approvaltype == 'Imprest Request') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Imprest Request`
    } else if (this.activeLeaveType.approvaltype == 'Travel Request') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Travel Request`
    } else if (this.activeLeaveType.approvaltype == 'Travel Expense') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Travel Expense`
    } else if (this.activeLeaveType.approvaltype == 'Missed Punch') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Missed Punch`
    }
    if (employee.docment_file) {
      this.isTicketFile = employee.docment_file.filter(doc => doc.doc_type == 'Ticket').length > 0;
      this.isHotelBill = employee.docment_file.filter(doc => doc.doc_type == 'Hotel Bill').length > 0;
    }

    setTimeout(() => {
      this.cdr.detectChanges(); // Ensures Angular updates the view safely
    });
    this.activeEmp = { ...employee, action: action, type: type };
  }
  openAddremarkExit(action: string, employee: any, type: string) {
    this.isShowEmployeeDetails = true;
    this.addRemarks = true;
    this.compoff_leaves_flag = action;
    this.empDetails = employee;

    if (this.activeLeaveType.approvaltype == 'Leave') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Leave Request`
    } else if (this.activeLeaveType.approvaltype == 'On Duty') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} On Duty`
    } else if (this.activeLeaveType.approvaltype == 'Comp-Off Request') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Comp-Off Request`
      this.compoff_leaves = this.empDetails?.comp_off_days;
    } else if (this.activeLeaveType.approvaltype == 'WFH Request') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} WFH Request`
    } else if (this.activeLeaveType.approvaltype == 'Imprest Request') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Imprest Request`
    } else if (this.activeLeaveType.approvaltype == 'Travel Request') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Travel Request`
    } else if (this.activeLeaveType.approvaltype == 'Travel Expense') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Travel Expense`
    } else if (this.activeLeaveType.approvaltype == 'Missed Punch') {
      this.modalHeadText = `${action == 'A' ? 'Approve' : 'Reject'} Missed Punch`
    }
    if (employee.docment_file) {
      this.isTicketFile = employee.docment_file.filter(doc => doc.doc_type == 'Ticket').length > 0;
      this.isHotelBill = employee.docment_file.filter(doc => doc.doc_type == 'Hotel Bill').length > 0;
    }

    setTimeout(() => {
      this.cdr.detectChanges(); // Ensures Angular updates the view safely
    });
    this.activeEmp = { ...employee, action: action, type: type };
  }
  requestAction() {
    // console.log(this.approvalType);
    // console.log(this.activeEmp);
    let applId = '';
    if (this.approvalType == 'On Duty') {
      applId = this.activeEmp?.od_applid;
    } else if (this.approvalType == 'WFH Request') {
      applId = this.activeEmp?.wfh_applid;
    } else if (this.approvalType == 'Comp-Off Request') {
      applId = this.activeEmp?.comp_applid;
    } else {
      applId = this.activeEmp?.leave_applid;
    }

    let postData = {
      customerAccountId: this.tp_account_id.toString(),
      empId: this.activeEmp?.emp_id,
      empCode: this.activeEmp?.emp_code,
      productTypeId: this.product_type,
      approvalId: applId,
      travelId: this.activeEmp?.travel_id,
      travelStatus: this.activeEmp.action,
      approvalStatus: this.activeEmp.action,
      submittedBy: this.empDataFromParent.emp_code,
      remark: this.remarks,
      travelRemarks: this.remarks,
      comp_off_days: this.compoff_leaves?.toString(),
      approvedAmount: this.approvedAmount,
      createdByIp: "::1"
    }

    if (this.activeEmp.type.includes('Leave')) {
      this._employeeMgmtService.approveRejectLeave(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.remarks = '';
          this.addRemarks = false;
          this.openAddApprovalModal(this.activeLeaveType);
          this.hideEmpDetailModal();
          this.toastr.success(resData.message);
        } else {
          this.toastr.error(resData.message);
        }
      })
    } else if (this.activeEmp.type.includes('On Duty')) {
      this._employeeLoginService.approveRejectOnDuty(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.remarks = '';
          this.addRemarks = false;
          this.openAddApprovalModal(this.activeLeaveType);
          this.hideEmpDetailModal();
          this.toastr.success(resData.message);
        } else {
          this.toastr.error(resData.message);
        }
      })
    } else if (this.activeEmp.type.includes('Comp-Off Request')) {
      if (!this.compoff_leaves) return;
      this._employeeLoginService.approveRejectCompOffRequest(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.remarks = '';
          this.compoff_leaves = null;
          this.addRemarks = false;
          this.openAddApprovalModal(this.activeLeaveType);
          this.hideEmpDetailModal();
          this.toastr.success(resData.message);
        } else {
          this.toastr.error(resData.message);
        }
      })
    } else if (this.activeEmp.type.includes('WFH Request')) {
      this._employeeLoginService.approveRejectWFHRequest(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.remarks = '';
          this.addRemarks = false;
          this.openAddApprovalModal(this.activeLeaveType);
          this.hideEmpDetailModal();
          this.toastr.success(resData.message);
        } else {
          this.toastr.error(resData.message);
        }
      })
    } else if (this.activeEmp.type.includes('Imprest Request')) {

      if (!this.expense_amount && this.activeEmp.action == 'A') {
        this.toastr.error("Expense Amount is required!");
        return;
      }

      if (this.activeEmp.action == 'A' && parseFloat(this.expense_amount) > parseFloat(this.activeEmp.amount_spent)) {
        this.toastr.error("Invalid amount entered!", 'Oops!');
        return;
      }

      if (!this.remarks) {
        this.toastr.error("Remarks are required!");
        return;
      }

      let obj = {
        customeraccountid: this.tp_account_id.toString(),
        action: "approved_ir_mobile_app",
        emp_id: this.activeEmp?.emp_id,
        approval_status: this.activeEmp.action, // (A, P or R)
        subuser_id: this.token?.subuser_id?.toString(),
        isemployer: this.token?.isEmployer?.toString(),
        user_name: this.activeEmp.emp_name,
        submittedby: this.empDataFromParent.emp_code,
        remark: this.remarks,
        // amount_spent: this.activeEmp?.amount_spent,
        amount_spent: this.expense_amount,
        appliedid: this.activeEmp?.ir_applid,
      }

      let date = new Date();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      let createdby = '';
      if (this.token.isEmployer == '0') {
        createdby = !this.token?.sub_userid ? this.tp_account_id : this.token.sub_userid;
      } else {
        createdby = this.tp_account_id;
      }

      let voucher_obj = {
        "voucherYear": year,
        "voucherMonth": month,
        "empCode": this.activeEmp?.mobile + 'CJHUB' + this.activeEmp?.emp_code + 'CJHUB' + this.activeEmp?.dateofbirth,
        "amount": this.expense_amount.toString(),
        "transactionType": "Credit",
        "ledgerType": "Reimbursement",
        "deductionId": this.activeEmp?.expense_category_id?.toString(),
        "subLedgerName": this.activeEmp?.expense_category_name,
        "isTaxableFlag": "N",
        "IsBillableFlag": "N",
        "createdBy": createdby?.toString(),
        "productTypeId": this.product_type.toString(),
        "customerAccountId": this.tp_account_id.toString(),
      }

      // console.log("ACTIVE USER", this.activeEmp);
      // console.log("OBJJ", obj);
      // return

      this._employeeLoginService.approveRejectImprestRequest(obj).subscribe((resData: any) => {
        if (resData.statusCode) {
          if (resData.checkflag == 'A' && this.activeEmp.action == 'A') {
            this.saveVoucher(voucher_obj);
          }
          this.remarks = '';
          this.expense_amount = '';
          this.addRemarks = false;
          this.openAddApprovalModal(this.activeLeaveType);
          this.hideEmpDetailModal();
          this.toastr.success(resData.message);
        } else {
          this.toastr.error(resData.message);
        }
      })
    } else if (this.activeEmp.type.includes('Request')) {
      this._employeeLoginService.approveTravelRequest(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.remarks = '';
          this.addRemarks = false;
          this.openAddApprovalModal(this.activeLeaveType);
          this.hideEmpDetailModal();
          this.toastr.success(resData.message);
        } else {
          this.toastr.error(resData.message);
        }
      })
    } else if (this.activeEmp.type.includes('Expense')) {
      this._employeeLoginService.approveRejectTravelExpense(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.remarks = '';
          this.addRemarks = false;
          this.openAddApprovalModal(this.activeLeaveType);
          this.hideEmpDetailModal();
          this.toastr.success(resData.message);
        } else {
          this.toastr.error(resData.message);
        }
      })
    } else if (this.activeEmp.type.includes('Missed Punch')) {
      let obj = {
        action: "ApproveMissedPunch",
        // approvalId: this.activeEmp?.leave_applid,
        approvalId: this.activeEmp?.row_id,
        customerAccountId: this._encrypterService.aesEncrypt(this.tp_account_id.toString()),
        empCode: this._encrypterService.aesEncrypt(this.activeEmp?.emp_code),
        attDate: this.activeEmp?.att_date.replace(/\//g, '-'),
        attStatus: this.activeEmp?.action,
        "modifiedByUser": this.empDataFromParent?.emp_code,
        "modifiedByIp": "::2",
        "productTypeId": this._encrypterService.aesEncrypt(this.product_type),
        "isEmployer": this.token?.isEmployer,
        "subUserId": "0",
        remarks: this.remarks
      }


      this._employeeLoginService.approveRejectMissedPunch(obj).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.remarks = '';
          this.addRemarks = false;
          this.openAddApprovalModal(this.activeLeaveType);
          this.hideEmpDetailModal();
          this.toastr.success(resData.message);
        } else {
          this.toastr.error(resData.message);
        }
      })
    }
  }

  showEmpDetailsModal(empData: any) {
    this.isShowEmpDetails = true;
    this.empDetails = empData;
    console.log(this.empDetails);
    if (empData.docment_file) {
      this.isTicketFile = empData.docment_file.filter(doc => doc.doc_type == 'Ticket').length > 0;
      this.isHotelBill = empData.docment_file.filter(doc => doc.doc_type == 'Hotel Bill').length > 0;
    }

    if (this.activeLeaveType.approvaltype == 'Leave') {
      this.modalHeadText = 'View Leave Request'
    } else if (this.activeLeaveType.approvaltype == 'On Duty') {
      this.modalHeadText = 'View On Duty'
    } else if (this.activeLeaveType.approvaltype == 'Comp-Off Request') {
      this.modalHeadText = 'View Comp-Off Request'
    } else if (this.activeLeaveType.approvaltype == 'WFH Request') {
      this.modalHeadText = 'View WFH Request'
    } else if (this.activeLeaveType.approvaltype == 'Travel Request') {
      this.modalHeadText = 'View Travel Request'
    } else if (this.activeLeaveType.approvaltype == 'Travel Expense') {
      this.modalHeadText = 'View Travel Expense'
    } else if (this.activeLeaveType.approvaltype == 'Missed Punch') {
      this.modalHeadText = 'View Missed Punch'
    }

  }
  showExitEmployeeDetails(empData: any) {
    this.isShowEmployeeDetails = true;
    this.empDetails = empData;
    console.log(this.empDetails);

  }

  //  Utility Functions --
  formatDate(dateStr: string): string {
    return dateStr?.replace(/\//g, '-') || '';
  }

  onInputLimit(event: any) {
    const max = this.empDetails?.max_leaves_per_compoff;
    const value = parseFloat(event.target.value);

    if (value > max) {
      event.target.value = max;
      this.compoff_leaves = max;
    }
    if (value < 0) {
      event.target.value = 0;
      this.compoff_leaves = 0;
    }
  }

  validateExpenseAmount() {
    if (this.expense_amount != null && this.empDetails?.amount_spent != null) {
      this.expenseAmountError = +this.expense_amount > +this.empDetails.amount_spent;
    } else {
      this.expenseAmountError = false;
    }
  }


  saveVoucher(obj: any) {
    this._approvalsService.SaveVoucher(obj).subscribe((resData: any) => {
      // console.log(resData,"Arpit");
      // return;
      if (resData.statusCode) {

      } else {

      }
    });

  }



}
