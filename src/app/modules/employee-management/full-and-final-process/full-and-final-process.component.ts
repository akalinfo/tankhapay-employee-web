import { Component, OnInit } from '@angular/core';
import { EmployeeManagementService } from '../employee-management.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

// --- INTERFACES for Type Safety ---

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

interface ClearanceItem {
  remarks: string;
  deducation_amount: number;
  id: number;
  asset_item: string;
  department_name: string;
  is_cleared?: string;
  originalIndex?: number; // Used to link the view to the form array
}

interface EmployeeDetails {
  emp_name: string;
  orgempcode: string;
  posting_department: string;
  current_designation: string;
  dateofjoining: string;
  dateofresignation: string;
  hodRo: string;
  last_working_day_at_the_organization: string;
}


@Component({
  selector: 'app-full-and-final-process',
  templateUrl: './full-and-final-process.component.html',
  styleUrls: ['./full-and-final-process.component.css']
})
export class FullAndFinalProcessComponent implements OnInit {
  showSidebar: boolean = false;
  employeesInFullFinal: FullFinalEmployee[] = [];
  isLoading: boolean = false;
  selectedStatus: string = 'FNFPending';
  questionnaireForm!: FormGroup;
  // --- Form & Modal Properties ---
  clearanceForm!: FormGroup;
  groupedItems: { [key: string]: ClearanceItem[] } = {};
  departmentKeys: string[] = [];
  showApproveModal: boolean = false;
  selectedEmployeeForApproval: FullFinalEmployee | null = null;
  isFormLoading: boolean = false; // To show a loader inside the modal
  selectedForm: 'clearance' | 'interview' | null = null;
  hasClearanceError: boolean = false;
  hasInterviewError: boolean = false;
  // by employer
  is_submitted: boolean = false;
  is_clearance_submitted: boolean = false;
  //by employee
  clearanceForm_submitted: boolean = false;
  basic_details: any;
  interviewForm_submitted: boolean = false;

  clearance_form_id: any;
  questionnaire_form_id: any;
  showEmployee: boolean;
  confirmationModalVisible: boolean;
  selectedEmployee: FullFinalEmployee | null = null;

  selectForm(formType: 'clearance' | 'interview') {
    this.selectedForm = formType;
  }

  goBackToCards() {
    this.selectedForm = null;
  }

  // --- Accordion Toggles ---
  showEmployeeInfo: boolean;
  showTable: boolean;
  showSignature: boolean;
  showEmployeeDetail: boolean;
  showReasons: boolean;
  showRankings: boolean;
  showFeedback: boolean;
  showNewOrgDetails: boolean;
  showRemarks: boolean;
  showSettlement: boolean;

  // Properties for the tracking modal
  showTrackingModal: boolean = false;
  selectedEmployeeForTracking: FullFinalEmployee | null = null;

  // Properties for API payload
  token: any = '';
  tp_account_id: any;
  ouIds: any;
  emp_code: any; 
  product_type: any;

  resignationReasons: any[] = [];
  rankingAspects: any[] = [];
  additionalFeedbackQuestions: any[] = [];
  employee: any = {};
  contactAddressParsed: any = {};
scores = Array.from({ length: 11 }, (_, i) => i); // [0, 1, 2, ..., 10]
  constructor(
    private fb: FormBuilder,
    private employeeManagementService: EmployeeManagementService,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private _toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    const session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    this.token = decode(session_obj_d?.token);
    this.tp_account_id = this.token.tp_account_id;
    this.ouIds = this.token.ouIds;
    this.emp_code = this.token.emp_code;
    this.product_type = this.token.product_type;
    this.initializeEmptyForm(); 
    this.onStatusChange();     
  }


  get reasonsControlsArray(): FormArray {
    return this.questionnaireForm.get('reasonsControls') as FormArray;
  }

  get rankingsControlsArray(): FormArray {
    return this.questionnaireForm.get('rankingsControls') as FormArray;
  }

  get additionalFeedbackArray(): FormArray {
    return this.questionnaireForm.get('additionalFeedback') as FormArray;
  }

  // Helper getter for easy access to the clearanceItems FormArray in the template


  // Helper to initialize an empty form structure. This will be populated later.
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

  get clearanceItemsArray(): FormArray {
    return this.clearanceForm.get('clearanceItems') as FormArray;
  }

  onStatusChange(): void {
    this.fetchFullAndFinalEmployees();
  }

  fetchFullAndFinalEmployees(): void {
    this.isLoading = true;
    this.employeesInFullFinal = [];

    const payload = {
      customerAccountId: this.tp_account_id,
      empCode: this.emp_code,
      ouIds: this.ouIds,
      postOffered: "",
      postingDepartment: "",
      unitParameterName: "",
      status: this.selectedStatus,
      actionType: "GetExitEmployeeData"
    };

    this.employeeManagementService.getFullAndFinalDetail(payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true && res?.commonData) {
          try {
            const decryptedData = JSON.parse(this._encrypterService.aesDecrypt(res.commonData));
            this.employeesInFullFinal = Array.isArray(decryptedData) ? decryptedData : [];
          } catch (error) {
            console.error('Error parsing decrypted data:', error);
            this.employeesInFullFinal = [];
          }
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error fetching Full and Final employees:', err);
        this.employeesInFullFinal = [];
        this.isLoading = false;
      }
    });
  }
  openConfirmModal(employee: any): void {
    this.selectedEmployee = employee;
    this.confirmationModalVisible = true;
  }

  closeConfirmModal(): void {
    this.selectedEmployee = null;
    this.confirmationModalVisible = false;
  }
  sendForm() {
    const employee = this.selectedEmployee;
    this.closeConfirmModal();
    this.sendExitFormToEmployee(employee);
    // this.sendFormReminderToEmployee(employee);
  }
  sendExitFormToEmployee(employee: FullFinalEmployee): void {
    const exitPayload = {
      customerAccountId: this.tp_account_id,
      empCode: employee.emp_code,
      createdBy: this.emp_code || this.token.id,
      createdIp: "::1",
      employerId: this.token.id,
    };
    this.employeeManagementService.markExitFormSent(exitPayload).subscribe({
      next: (res: any) => {
        if (res?.statusCode) {
          this._toastrService.success(res.message || 'Forms sent successfully!');
          employee.is_feedback_link_status = true;
        } else {
          this._toastrService.error(res.message || 'Failed to send exit forms.');
        }
      },
      error: (err) => {
        // console.error('Error sending form :', err);
        this._toastrService.error('Something went wrong while sending the forms.');
      }
    });
  }
  sendFormReminderToEmployee(employee: FullFinalEmployee): void {
    const payload = {
      employeeEmail: "rekha.beniwal@akalinfo.com", // Make sure this field exists
      employeeName: "test",
      formLink: `http://localhost:4200/employee-mgmt/full-and-final` // or whatever form link logic
    };

    this.employeeManagementService.sendFormReminder(payload).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this._toastrService.success(res.message || 'Reminder sent successfully!');
        } else {
          this._toastrService.error(res.message || 'Failed to send reminder.');
        }
      },
      error: (err) => {
        console.error('Error sending form reminder:', err);
        this._toastrService.error('Something went wrong while sending the reminder.');
      }
    });
  }


  // --- Tracking Modal Methods ---
  // trackEmployeeProcess(employee: FullFinalEmployee): void {
  //   this.selectedEmployeeForTracking = employee;
  //   this.showTrackingModal = true;
  // }

  // closeTrackingModal(): void {
  //   this.showTrackingModal = false;
  //   this.selectedEmployeeForTracking = null;
  // }

  openApproveModal(employee: FullFinalEmployee): void {
    this.selectedEmployeeForApproval = employee;
    this.showApproveModal = true;
    this.isFormLoading = true;
    this.selectedForm = null;
    this.hasClearanceError = false;
    this.hasInterviewError = false;
    this.clearanceForm.reset();
    this.clearanceItemsArray.clear();
    this.groupedItems = {};
    this.departmentKeys = [];
    this.loadInitialDataAndBuildForm(employee);
    this.loadCleranceForm(employee);
  }

  loadCleranceForm(employee: FullFinalEmployee): void {
    const payload = {
      customerAccountId: this.tp_account_id,
      empCode: employee.emp_code,
      productTypeId: this.product_type,
      actionType: 'Get_MST_CLEARANCE_FORM',
    };

    this.employeeManagementService.getExitFormDetails(payload).subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        if (res?.statusCode === true && res?.commonData) {
          const data = JSON.parse(this._encrypterService.aesDecrypt(res.commonData));
          console.log(data);
          const employeeDetails: EmployeeDetails = data[0]?.employeedetails?.[0];
          const clearanceItems: ClearanceItem[] = data[0]?.exit_master_reason || [];
          this.clearanceForm_submitted = data[0]?.submit_status || false;
          // if (this.clearanceForm_submitted) {
            if (employeeDetails && clearanceItems.length > 0) {
              this.groupItemsByDepartment(clearanceItems);
              this.populateClearanceForm(employeeDetails, clearanceItems);
            } else {
              this.hasClearanceError = true;
            }
          }
      },
      error: () => {
        this.isFormLoading = false;
        this.hasClearanceError = true;
      }
    });
  }

  populateClearanceForm(details: EmployeeDetails, items: ClearanceItem[]): void {
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
        deducation_amount:[item.deducation_amount || 0 , Validators.required],
      }));
    });
  }

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


  loadInitialDataAndBuildForm(employee: FullFinalEmployee): void {
    const payload = {
      customerAccountId: this.tp_account_id,
      empCode: employee.emp_code,
      productTypeId: this.product_type,
      actionType: 'GetMasters',
    };
    this.employeeManagementService.getExitFormDetails(payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true && res?.commonData) {
          const encrypted_data = res.commonData;
          const data = JSON.parse(this._encrypterService.aesDecrypt(encrypted_data));
          const employeeData = data[0].employeedetails[0];
          this.interviewForm_submitted = data[0]?.submit_status;
          this.basic_details = data[0].basic_details;
          this.questionnaire_form_id = this.basic_details?.id;

          this.resignationReasons = data[0].exit_master_reason || [];
          this.rankingAspects = data[0].master_feedback_aspects || [];
          this.additionalFeedbackQuestions = data[0].questionnaire || [];
          this.employee = employeeData || {};

          const submittedStatuses = ['Approved'];
          this.is_submitted = submittedStatuses.includes(this.basic_details?.approval_status);
          this.contactAddressParsed = employeeData?.contact_address ? JSON.parse(employeeData.contact_address) : {};
          this.buildForm();
          if (this.is_submitted) {
            this.questionnaireForm.disable();
          }

        }
      },
      error: (err) => {
        console.error('Error loading questionnaire data:', err);
        // this.canAccessForm = false;
        // this.isLoadingAccess = false;
      },
    });
  }
  buildForm(): void {
    this.questionnaireForm = this.fb.group({
      employeeName: [{ value: this.employee.emp_name || ' ', disabled: true }],
      employeeId: [{ value: this.employee.emp_code || ' ', disabled: true }],
      department: [{ value: this.employee.posting_department || ' ', disabled: true }],
      designation: [{ value: this.employee.current_designation || ' ', disabled: true }],
      annualSalary: [{ value: this.employee.current_annual_salary || ' ', disabled: true }],
      dateOfJoining: [{ value: this.employee.dateofjoining || ' ', disabled: true }],
      designationAtJoining: [{ value: this.employee.designation_at_the_time_of_joining || ' ', disabled: true }],
      salaryAtJoining: [{ value: this.employee.salary_at_the_time_of_joining || ' ', disabled: true }],
      payroll: [{ value: this.employee.payroll || ' ', disabled: true }],
      lastWorkingDay: [{ value: this.employee.last_working_day_at_the_organization || ' ', disabled: true }],
      contactAddress: [{ value: this.contactAddressParsed.country || ' ', disabled: true }],
      phoneNo: [{ value: this.employee.phone || ' ', disabled: true }],
      emailId: [{ value: this.employee.emailid || ' ', disabled: true }],

      // Resignation reasons (disabled checkboxes)
      reasonsControls: this.fb.array(
        this.resignationReasons.map((reason: any) =>
          this.fb.group({
            reason_masterid: [reason.masterreasoinid],
            reason_name: [reason.reason_resignation_name],
            selected: [{ value: reason.reasonselectstatus === 'Y', disabled: true }]
          })
        )
      ),
      reasonOtherSpecify: [{ value: this.basic_details?.reason_other_if || '', disabled: true }],

      // Rankings
      rankingsControls: this.fb.array(
        this.rankingAspects.map((aspect: any) =>
          this.fb.group({
            aspect_masterid: [aspect.masteraspectid],
            aspect_name: [aspect.aspect_name],
            rank_assigned: [{ value: aspect.rank_assigned || '', disabled: true }]
          })
        )
      ),

      // Feedback
      additionalFeedback: this.fb.array(
        this.additionalFeedbackQuestions.map((q: any) =>
          this.fb.group({
            label: [q.questionnaire_text],
            questionnaire_response: [{ value: q.questionnaire_response || '', disabled: true }]
          })
        )
      ),
      newOrganizationDetails: this.fb.group({
        neworganizationname: [{ value: '', disabled: true }],
        newdesignation: [{ value: '', disabled: true }],
        // exiting_employee_signature: ['', Validators.required],
        // exiting_employee_submissiondate: ['', Validators.required],
        // hr_representative_signature: [''],
        // hr_representative_approval_date: [''],
      }),
      remarks: [{ value: this.basic_details?.remarks || '', disabled: true }],
      // HR Approval Section (enabled)
      approver_remarks: [''],
      hr_signature: ['', Validators.required],
      hr_approval_date: ['', Validators.required],
      hr_remarks: ['']
    });
  }

  closeApproveModal(): void {
    this.showApproveModal = false;
    this.selectedEmployeeForApproval = null;
  }

  submitApproval(): void {
    if (this.clearanceForm.invalid) {
      this._toastrService.error('Please fill all required fields before submitting.');
      this.clearanceForm.markAllAsTouched(); // Mark fields to show validation errors
      return;
    }

    // Use getRawValue() to include values from disabled controls if needed
    const formData = this.clearanceForm.getRawValue();
    const send_payload = {
      empCode: this.selectedEmployeeForApproval.emp_code, // The employee being cleared
      customerAccountId: this.tp_account_id,
      createdBy: this.token.id, // The logged-in user submitting the form
      createdIp: "::1", // You might want a dynamic IP service here
      clearanceData: JSON.stringify(formData.clearanceItems.map(item => ({
        clearance_master_id: item.id,
        is_cleared: item.status, // e.g., 'Yes', 'No', 'N/A'
        remarks: item.remarks || "",
        deducation_amount:item.deducation_amount || 0,
        verified_by: this.emp_code 
      }))),
      actionType: "employer" // Or a more specific action like 'SaveClearance'
    };

    // console.log('Submitting Payload:', JSON.stringify(send_payload, null, 2));

    this.employeeManagementService.saveCleranceForm(send_payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true || res?.status === 'success') {
          this._toastrService.success(res?.message || 'Clearance form submitted successfully!');
          this.closeApproveModal();
          this.fetchFullAndFinalEmployees(); // Refresh the main list
        } else {
          this._toastrService.error(res?.message || 'Submission failed. Please try again.');
        }
      },
      error: (err) => {
        console.error('Save error:', err);
        this._toastrService.error('An API error occurred while saving the form.');
      }
    });
  }

  approveExitFeedback(): void {
    const formValue = this.questionnaireForm.getRawValue();
    const approvalPayload = {
      empCode:this.selectedEmployeeForApproval.emp_code,
      customerAccountId: this.tp_account_id,
      action: 'approva_or_reject_questionnaire',
      rowId: this.questionnaire_form_id,
      updatedIp: '::1',
      approvalById: this.token.id,
      approvalByMobNum: this.token.mobile,
      approvalStatus: 'Approved',
      approvalRemarks: formValue.approver_remarks || " ",
    };

    this.employeeManagementService.approvalFeedbackForm(approvalPayload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === 1 || res?.statusCode === 0 || res?.status === 'success') {
          this.is_submitted = true;
          this.questionnaireForm.disable();
          this._toastrService.success(res?.message);
        } else {
          this._toastrService.error(`${res.message}`);
        }
      },
      error: (err) => {
        console.error('Save error:', err);
        this._toastrService.error(err.message);
      }
    });
  };

  // --- UI Toggle Functions ---
  toggle(): void {
    this.showSidebar = !this.showSidebar;
  }
  toggleEmployeeDetail() { this.showEmployeeDetail = !this.showEmployeeDetail; }
  toggleReasons() { this.showReasons = !this.showReasons; }
  toggleRankings() { this.showRankings = !this.showRankings; }
  toggleFeedback() { this.showFeedback = !this.showFeedback; }
  toggleNewOrgDetails() { this.showNewOrgDetails = !this.showNewOrgDetails; }
  toggleRemarks() { this.showRemarks = !this.showRemarks; }
  toggleEmployeeInfo() { this.showEmployeeInfo = !this.showEmployeeInfo; }
  toggleTable() { this.showTable = !this.showTable; }
  toggleSignature() { this.showSignature = !this.showSignature; }
  togglesettlement(){this.showSettlement = !this.showSettlement ;}

}