import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { EmployeeLoginService } from '../employee-login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';

// Define interfaces for better type safety
interface ClearanceItem {
  id: number;
  asset_item: string;
  is_cleared: string;
  department_name: string;
  originalIndex?: number; // We'll add this to link the view to the form array
}

interface EmployeeDetails {
  emp_name: string;
  orgempcode: string; // Corrected from your log: 'orgempcode'
  posting_department: string;
  current_designation: string;
  dateofjoining: string;
  dateofresignation: string;
  hodRo: string; // Assuming this key exists
  last_working_day_at_the_organization: string;
}

@Component({
  selector: 'app-exit-clearance-form',
  templateUrl: './exit-clearance-form.component.html',
  styleUrls: ['./exit-clearance-form.component.css']
})
export class ExitClearanceFormComponent implements OnInit {
  // --- Component State ---
  clearanceForm!: FormGroup;
  isLoadingAccess = true;
  canAccessForm = false;

  // --- Data Properties ---
  employee: EmployeeDetails;
  allClearanceItems: ClearanceItem[] = [];
  groupedItems: { [key: string]: ClearanceItem[] } = {}; // For the view grouping
  departmentKeys: string[] = []; // For easier iteration in the template

  // --- Accordion Toggles ---
  showSidebar: boolean = false;
  showEmployeeInfo = true;
  showTable = true;
  showSignature = true;
  is_submitted = false;

  // --- Session/Token Info ---
  private token: any;
  private tp_account_id: any;
  private product_type: any;
  private emp_code: any;


  constructor(
    private fb: FormBuilder,
    private exitFormService: EmployeeLoginService,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private _toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    // 1. Get user and employee info from session/storage
    const session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    const empLocalData = localStorage.getItem("empDataFromParent");

    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;
    this.emp_code = empLocalData ? JSON.parse(empLocalData).emp_code : null;

    // 2. Load all necessary data and then build the form
    this.loadDataAndBuildForm();
  }

  // --- Getter for easy template access to the FormArray ---
  get clearanceItemsArray(): FormArray {
    return this.clearanceForm.get('clearanceItems') as FormArray;
  }

  loadDataAndBuildForm(): void {
    if (!this.emp_code) {
      this._toastrService.error("Employee code not found. Cannot load form.");
      this.isLoadingAccess = false;
      this.canAccessForm = false;
      return;
    }

    this.isLoadingAccess = true;
    const payload = {
      customerAccountId: this.tp_account_id,
      empCode: this.emp_code,
      productTypeId: this.product_type,
      actionType: 'Get_MST_CLEARANCE_FORM',
    };

    this.exitFormService.getExitFormDetails(payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true && res?.commonData) {
          const data = JSON.parse(this._encrypterService.aesDecrypt(res.commonData));
         
          this.employee = data[0]?.employeedetails?.[0] || {};
          this.allClearanceItems = data[0]?.exit_master_reason || [];
          this.is_submitted = data[0]?.submit_status || false;
          this.canAccessForm = data[0].is_feedback_link_status || false;
          if (this.canAccessForm) {
            this.employee = data[0]?.employeedetails?.[0] || {};
            this.allClearanceItems = data[0]?.exit_master_reason || [];
            this.is_submitted = data[0]?.submit_status || false;

            this.groupItemsByDepartment(this.allClearanceItems);
            this.buildForm();

            if (this.is_submitted) {
              this.clearanceForm.disable();
            }
          } else {
            // this._toastrService.warning("You are not authorized to view this form.");
          }

        } else {
          this._toastrService.error("Could not load clearance form data.");
          this.canAccessForm = false;
        }
        this.isLoadingAccess = false;
      },
      error: (err) => {
        console.error('Error loading clearance data:', err);
        this._toastrService.error("An error occurred while fetching form data.");
        this.canAccessForm = false;
        this.isLoadingAccess = false;
      },
    });
  }

  buildForm(): void {
    this.clearanceForm = this.fb.group({
      // Static employee details
      employeeName: [{ value: this.employee.emp_name || '', disabled: true }],
      employeeCode: [{ value: this.employee.orgempcode || '', disabled: true }],
      department: [{ value: this.employee.posting_department || '', disabled: true }],
      designation: [{ value: this.employee.current_designation || '', disabled: true }],
      dateOfJoining: [{ value: this.employee.dateofjoining || '', disabled: true }],
      dateOfResignation: [{ value: this.employee.dateofresignation || '', disabled: true }],
      hodRo: [{ value: this.employee.hodRo || '', disabled: true }],
      lastWorkingDay: [{ value: this.employee.last_working_day_at_the_organization || '', disabled: true }],

      clearanceItems: this.fb.array(this.createClearanceItemControls()),
    });
  }

  createClearanceItemControls(): FormGroup[] {
    return this.allClearanceItems.map(item => this.fb.group({
      id: [item.id], 
      status: [item.is_cleared || '', Validators.required], 
      
    }));
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

  onSubmit() {
    if (this.clearanceForm.invalid) {
      this._toastrService.error('Please fill all required fields before submitting.');
      this.clearanceForm.markAllAsTouched();
      return;
    }


    const formData = this.clearanceForm.getRawValue(); 
    const send_payload = {
      empCode: this.emp_code,
      customerAccountId: this.tp_account_id,
      createdBy: this.emp_code,
      createdIp: "::1",
      clearanceData: JSON.stringify(formData.clearanceItems.map(item => ({
        clearance_master_id: item.id,
        is_cleared: item.status,
        remarks: "",
        verified_by: ""
      }))),
      actionType: "employee"
    };
    this.exitFormService.saveCleranceForm(send_payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true || res?.status === 'success') {
          this.is_submitted = true;
          this.clearanceForm.disable(); 
          this._toastrService.success(res?.message);
        } else {
          this._toastrService.error(`${res.message || 'Please try again.'}`);
        }
      },
      error: (err) => {
        console.error('Save error:', err);
        this._toastrService.error(err.message);

      }
    });

  }

  // --- UI Toggle Functions ---
  toggle() { this.showSidebar = !this.showSidebar; }
  toggleEmployeeInfo() { this.showEmployeeInfo = !this.showEmployeeInfo; }
  toggleTable() { this.showTable = !this.showTable; }
  toggleSignature() { this.showSignature = !this.showSignature; }
}