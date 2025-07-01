import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EmployeeLoginService } from '../employee-login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-exit-questionnaire',
  templateUrl: './exit-interview-questionnaire.component.html',
  styleUrls: ['./exit-interview-questionnaire.component.css'],
})
export class ExitInterviewQuestionnaireComponent implements OnInit {
  showSidebar: boolean = false;
  questionnaireForm!: FormGroup;
  token: any;
  tp_account_id: any;
  product_type: any;
  emp_code: any;
  emp_id: any;
  isLoadingAccess = true;
  canAccessForm = false;
  is_submitted = false;


  resignationReasons: any[] = [];
  rankingAspects: any[] = [];
  additionalFeedbackQuestions: any[] = [];
  employee: any = {};
  contactAddressParsed: any = {};

  @Input() empDataFromParent: any;
  // Add in class
  showEmployeeInfo = false;
  showReasons = false;
  showRankings = false;
  showFeedback = false;
  showNewOrgDetails = false;
  showRemarks = false;
  employeename: string;
  neworgDetails: any;
  basic_details: any;
  toggleEmployeeInfo() {
    this.showEmployeeInfo = !this.showEmployeeInfo;
  }
  toggleReasons() {
    this.showReasons = !this.showReasons;
  }
  toggleRankings() {
    this.showRankings = !this.showRankings;
  }
  toggleFeedback() {
    this.showFeedback = !this.showFeedback;
  }
  toggleNewOrgDetails() {
    this.showNewOrgDetails = !this.showNewOrgDetails;
  }
  toggleRemarks() {
    this.showRemarks = !this.showRemarks;
  }
scores = Array.from({ length: 11 }, (_, i) => i); // [0, 1, 2, ..., 10]

  constructor(
    private fb: FormBuilder,
    private exitFormService: EmployeeLoginService,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private _toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    const session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);

    const empLocalData = localStorage.getItem("empDataFromParent");
    this.emp_code = empLocalData ? JSON.parse(empLocalData).emp_code : null;

    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;
    this.emp_id = this.token.id;
    this.loadInitialDataAndBuildForm();
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

  toggle(): void {
    this.showSidebar = !this.showSidebar;
  }




  loadInitialDataAndBuildForm(): void {
    this.isLoadingAccess = true;
    const payload = {
      customerAccountId: this.tp_account_id,
      empCode: this.emp_code,
      productTypeId: this.product_type,
      actionType: 'GetMasters',
    };

    this.exitFormService.getExitFormDetails(payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true && res?.commonData) {
          const encrypted_data = res.commonData;
          const data = JSON.parse(this._encrypterService.aesDecrypt(encrypted_data));
          const employeeData = data[0].employeedetails[0];

          this.resignationReasons = data[0].exit_master_reason || [];
          this.rankingAspects = data[0].master_feedback_aspects || [];
          this.additionalFeedbackQuestions = data[0].questionnaire || [];
          this.neworgDetails = data?.[0]?.neworganization?.[0] || {
            neworganizationname: '',
            newdesignation: '',
            exiting_employee_signature: '',
            exiting_employee_submissiondate: '',
            hr_representative_signature: '',
            hr_representative_approval_date: ''
          };
          this.employee = employeeData || {};
          this.is_submitted = data[0].submit_status || false;
          this.canAccessForm = data[0].is_feedback_link_status || false;
          this.basic_details=data[0]?.basic_details || " "
          // this.canAccessForm =true;
          if (this.canAccessForm) {
            this.contactAddressParsed = employeeData?.contact_address ? JSON.parse(employeeData.contact_address) : {};
            this.employeename = this.employee.emp_name;
            this.buildForm();
            if (this.is_submitted) {
              this.questionnaireForm.disable();
            }
          } else {
            // this._toastrService.warning("You are not authorized to view this form.");
          }
        } else {
          this.canAccessForm = false;
        }
        this.isLoadingAccess = false;
      },
      error: (err) => {
        console.error('Error loading questionnaire data:', err);
        this.canAccessForm = false;
        this.isLoadingAccess = false;
      },
    });
  }


  buildForm(): void {
    this.questionnaireForm = this.fb.group({
      employeeName: [{ value: this.employee.emp_name || ' ', disabled: true }],
      employeeId: [{ value: this.emp_id || ' ', disabled: true }],
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

      reasonsControls: this.fb.array(
        this.resignationReasons.map(reason =>
          this.fb.group({
            reason_masterid: [reason.masterreasoinid],
            selected: [reason.reasonselectstatus == 'Y']
            // selected: [reason.reasonselectstatus == 'N']
          })
        ),

      ),
      reasonOtherSpecify: [this.basic_details.reason_other_if || ''],

      rankingsControls: this.fb.array(
        this.rankingAspects.map(aspect =>
          this.fb.group({
            aspect_masterid: [aspect.masteraspectid],
            rank_assigned: [aspect.rank_assigned || '', [Validators.min(0), Validators.max(10)]]
            // rank_assigned:['5' , [Validators.min(1), Validators.max(10)]]
          })
        ),
        { validators: this.atLeastOneRankAssigned() }
      ),

      additionalFeedback: this.fb.array(
        this.additionalFeedbackQuestions.map((q, i) =>
          this.fb.group({
            label: [q.questionnaire_text],
            masterquestionareid: [q.masterquestionareid],
            questionnaire_response: [q.questionnaire_response || " "] //Validators.required
            // questionnaire_response: ["test"] //Validators.required
          })
        ),
        { validators: this.atLeastOneResponseFilled() }
      ),
      newOrganizationDetails: this.fb.group({
        neworganizationname: [this.neworgDetails.neworganizationname || ''],
        newdesignation: [this.neworgDetails.newdesignation || ''],
        exiting_employee_signature: [this.neworgDetails.exiting_employee_signature || ''],
        exiting_employee_submissiondate: [this.neworgDetails.exiting_employee_submissiondate || new Date().toISOString().split('T')[0]]
      }),


      remarks: [this.basic_details.remarks ||'']
    }, {
      validators: this.atLeastOneReasonValidator()
    });
  }


  formatDate(controlName: string) {
    const control = this.questionnaireForm.get(controlName);
    const value = control?.value;
    if (value) {
      const formatted = this.convertToDDMMYYYY(value);
      control?.setValue(formatted, { emitEvent: false });
    }
  }
  convertToDDMMYYYY(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  atLeastOneRankAssigned(): ValidatorFn {
    return (formArray: AbstractControl): { [key: string]: any } | null => {
      const array = formArray as FormArray;
      const hasAtLeastOne = array.controls.some(ctrl => {
        const value = ctrl.get('rank_assigned')?.value;
        return value !== null && value !== '' && value >= 1 && value <= 10;
      });
      return hasAtLeastOne ? null : { atLeastOneRequired: true };
    };
  }

  // atLeastOneCheckboxChecked(): ValidatorFn {
  //   return (formArray: AbstractControl): { [key: string]: any } | null => {
  //     const array = formArray as FormArray;
  //     const hasOneChecked = array.controls.some(ctrl => ctrl.get('selected')?.value === true);
  //     return hasOneChecked ? null : { atLeastOneRequired: true };
  //   };
  // }
  atLeastOneReasonValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const reasonsArray = formGroup.get('reasonsControls') as FormArray;
      const otherReason = formGroup.get('reasonOtherSpecify')?.value;

      const hasOneChecked = reasonsArray.controls.some(ctrl => ctrl.get('selected')?.value === true);
      const hasOtherFilled = otherReason && otherReason.trim().length > 0;

      return hasOneChecked || hasOtherFilled ? null : { atLeastOneReasonRequired: true };
    };
  }

  atLeastOneResponseFilled(): ValidatorFn {
    return (formArray: AbstractControl): { [key: string]: any } | null => {
      const array = formArray as FormArray;
      const hasOneResponse = array.controls.some(ctrl => {
        const value = ctrl.get('questionnaire_response')?.value;
        return value && value.trim() !== ''; // Check non-empty
      });
      return hasOneResponse ? null : { atLeastOneResponseRequired: true };
    };
  }
toggleRank(group: AbstractControl, score: number): void {
  // Find the 'rank_assigned' control within the provided group
  const rankControl = group.get('rank_assigned');

  if (rankControl) {
    // Check if the clicked score is the same as the current value
    if (rankControl.value === score) {
      // If it is, unselect it by setting the value to null
      rankControl.setValue(null);
    } else {
      // Otherwise, set the new score as the value
      rankControl.setValue(score);
    }
    // Mark the control as touched to trigger validation messages if needed
    rankControl.markAsTouched(); 
  }
}

  onSubmit(): void {
    //   for (const controlName in this.questionnaireForm.controls) {
    // const control = this.questionnaireForm.get(controlName);

    // if (control && control.invalid) {
    //   if(controlName!=="newOrganizationDetails"){
    //       this._toastrService.error('Please fill alteast one field in each section');
    //   }

    // }
    // }


    if (this.questionnaireForm.invalid) {
      this.questionnaireForm.markAllAsTouched();
      this._toastrService.error('Please fill out all required fields correctly.');
      return;
    }

    const formValue = this.questionnaireForm.getRawValue();

    const selectedReasons = formValue.reasonsControls
      .filter((item: any) => item.selected)
      .map((item: any) => ({
        reason_masterid: String(item.reason_masterid)
      }));

    const rankedAspects = formValue.rankingsControls.map((item: any) => ({
      aspect_masterid: String(item.aspect_masterid),
      rank_assigned: String(item.rank_assigned)
    }));

    const questionnaireResponses = formValue.additionalFeedback.map((item: any, i: number) => ({
      questionnaireid: String(this.additionalFeedbackQuestions[i].masterquestionareid),
      questionnaire_response: item.questionnaire_response
    }));
    let date = formValue.newOrganizationDetails.exiting_employee_submissiondate;
    date = this.convertToDDMMYYYY(date);
    formValue.newOrganizationDetails.exiting_employee_submissiondate = date;
    const newOrgData = [formValue.newOrganizationDetails];

    const send_payload = {
      empCode: Number(this.emp_code),
      customerAccountId: String(this.tp_account_id),
      exitMasterReason: JSON.stringify(selectedReasons),
      masterFeedbackAspects: JSON.stringify(rankedAspects),
      questionnaire: JSON.stringify(questionnaireResponses),
      newOrganization: JSON.stringify(newOrgData),
      action: "SaveQuestionnaire",
      createdBy: this.emp_code,
      otherRemark: formValue.reasonOtherSpecify,
      createdByUsername: this.employee.emp_name + "#" + this.employee.phone,
      remarks: formValue.remarks
    };
    console.log(send_payload);

    this.exitFormService.saveExitFormDetail(send_payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true || res?.status === 'success') {
          this.is_submitted = true;
          this.questionnaireForm.disable(); // disables all controls
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
}
