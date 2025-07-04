import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EmployeeLoginService } from '../employee-login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
// import { formatDate } from '@angular/common';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
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
  organizationName: string = 'NeGD';
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
    console.log(this.token);
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
          this.basic_details = data[0]?.basic_details || " "
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


      remarks: [this.basic_details.remarks || '']
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



  // public generatePdf(): void {
  //   // Ensure form data is available
  //   if (!this.questionnaireForm) {
  //     console.error('Form not initialized.');
  //     return;
  //   }
  //   const formValue = this.questionnaireForm.getRawValue();

  //   const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

  //   // Helper to create a row in the main info table
  //   const createInfoRow = (label: string, value: any): [string, any] => {
  //     return [label, value || 'N/A'];
  //   };

  //   // ========================= UPDATED TO MATCH THE IMAGE =========================
  //   // Helper to build the "Reasons" section as a 4-column table
  //   const buildReasonsChecklist = () => {
  //     // Use [X] and [ ] to perfectly match the image's style
  //     const checkedBox = '[X]';
  //     const uncheckedBox = '[ ]';
  //     const otherReasonIdentifier = 'any other reason';

  //     const allReasonItems = this.resignationReasons.map((reason: any, index: number) => {
  //       const control = formValue.reasonsControls[index];
  //       const isSelected = control ? control.selected : false;
  //       let reasonText = reason.reason_resignation_name || 'Unknown Reason';

  //       // Handle the "Other" reason text and state
  //       if (reasonText.toLowerCase().includes(otherReasonIdentifier)) {
  //         if (formValue.reasonOtherSpecify) {
  //           return { state: checkedBox, text: `${reasonText}: ${formValue.reasonOtherSpecify}` };
  //         } else {
  //           return { state: uncheckedBox, text: reasonText };
  //         }
  //       }
  //       // For all standard reasons
  //       return { state: isSelected ? checkedBox : uncheckedBox, text: reasonText };
  //     });

  //     const tableBody: any[][] = [];
  //     const midPoint = Math.ceil(allReasonItems.length / 2);

  //     for (let i = 0; i < midPoint; i++) {
  //       const leftItem = allReasonItems[i];
  //       const rightItem = allReasonItems[i + midPoint];

  //       const row = [
  //         // Left Column
  //         { text: leftItem.state, alignment: 'center' },
  //         leftItem.text,
  //         // Right Column (check if it exists)
  //         rightItem ? { text: rightItem.state, alignment: 'center' } : '',
  //         rightItem ? rightItem.text : ''
  //       ];
  //       tableBody.push(row);
  //     }

  //     return {
  //       table: {
  //         widths: ['auto', '*', 'auto', '*'], // [ ] | Text | [ ] | Text
  //         body: tableBody
  //       },
  //       // Default layout provides the full borders shown in the image
  //     };
  //   };

  //   // ========================= UPDATED TO MATCH THE IMAGE =========================
  //   // Helper to build the "Ranks" section as a single 4-column table
  //   const buildRankingsTable = () => {
  //     const rankings = formValue.rankingsControls.map((control: any, index: number) => ({
  //       name: this.rankingAspects[index]?.aspect_name || 'Unknown Aspect',
  //       rank: control.rank_assigned || '',
  //     }));

  //     const tableBody: any[][] = [];
  //     const midPoint = Math.ceil(rankings.length / 2);
  //     const rankingsLeft = rankings.slice(0, midPoint);
  //     const rankingsRight = rankings.slice(midPoint);

  //     // Add the header row that matches the image
  //     const header = [
  //       {}, // Empty cell for the first aspect column header
  //       { text: 'Rank', style: 'tableHeader' },
  //       {}, // Empty cell for the second aspect column header
  //       { text: 'Rank', style: 'tableHeader' }
  //     ];
  //     tableBody.push(header);

  //     // Build the data rows with 4 cells each
  //     for (let i = 0; i < midPoint; i++) {
  //       const row = [
  //         // Left column data
  //         rankingsLeft[i].name,
  //         { text: rankingsLeft[i].rank, alignment: 'center' },
  //         // Right column data (check if it exists)
  //         rankingsRight[i] ? rankingsRight[i].name : '',
  //         rankingsRight[i] ? { text: rankingsRight[i].rank, alignment: 'center' } : ''
  //       ];
  //       tableBody.push(row);
  //     }

  //     return {
  //       table: {
  //         widths: ['*', 50, '*', 50], // Aspect | Rank | Aspect | Rank
  //         body: tableBody,
  //       },
  //       // Default layout provides the full borders shown in the image
  //     };
  //   };

  //   // Helper to create the dynamic question & answer blocks
  //   const buildFeedbackBlocks = () => {
  //     return formValue.additionalFeedback.flatMap((feedback: any) => [
  //       { text: feedback.label || 'Unnamed Question', style: 'question' },
  //       { text: feedback.questionnaire_response || '__________________________________________________________________________________', style: 'answer' },
  //     ]);
  //   };

  //   // =================================================================
  //   // PDF DOCUMENT DEFINITION (No changes needed here)
  //   // =================================================================
  //   const docDefinition: any = {
  //     pageSize: 'A4',
  //     pageMargins: [40, 60, 40, 60],
  //     content: [
  //       { text: 'Exit Interview Questionnaire', style: 'header' },
  //       {
  //         style: 'infoTable',
  //         table: {
  //           widths: ['auto', '*'],
  //           body: [ /* ... info rows ... */ ],
  //         },
  //         layout: 'compactTableBorder',
  //       },
  //       { text: 'The exit interview feedback will be maintained strictly confidential...', style: 'paragraph' },

  //       { text: 'i. Reason(s) for resignation:', style: 'subHeader' },
  //       buildReasonsChecklist(), // Renders the new 4-column table

  //       { text: 'ii. Kindly assign ranks to the following aspects of your experience in working with us:', style: 'subHeader' },
  //       { text: 'Use ranks from 1 to 10; where 10 indicates “The Best” and 1 indicates “The Worst”...', style: 'paragraph', italics: true },
  //       buildRankingsTable(), // Renders the new 4-column ranks table

  //       { text: '', pageBreak: 'before' },
  //       ...buildFeedbackBlocks(),

  //       // ... Rest of the document definition is the same ...
  //     ],
  //     styles: { /* ... styles ... */ },
  //     layouts: { /* ... layouts ... */ }
  //   };

  //   // Fill in the dynamic parts that were omitted for brevity
  //   (docDefinition.content[1] as any).table.body = [
  //       createInfoRow('Name of Employee:', formValue.employeeName),
  //       createInfoRow('Employee ID:', formValue.employeeId),
  //       createInfoRow('Function/ Department/ Project:', formValue.department),
  //       createInfoRow('Current Designation:', formValue.designation),
  //       createInfoRow('Current Annual Salary:', formValue.annualSalary),
  //       createInfoRow('Date of Joining:', formValue.dateOfJoining),
  //       createInfoRow('Designation at the time of Joining:', formValue.designationAtJoining),
  //       createInfoRow('Salary at the time of joining:', formValue.salaryAtJoining),
  //       createInfoRow('Payroll (NISG/BSN/DIC etc.):', formValue.payroll),
  //       createInfoRow('Last working day at the organization:', formValue.lastWorkingDay),
  //       createInfoRow('Contact Address, Phone No. & Email Id:', `${formValue.contactAddress}\n${formValue.phoneNo}\n${formValue.emailId}`),
  //   ];

  //   const certificationIndex = docDefinition.content.findIndex((item: any) => item.pageBreak === 'before') + 2;
  //   docDefinition.content.splice(certificationIndex, 0, 
  //     {
  //       text: [
  //         'I certify that I am joining ',
  //         { text: formValue.newOrganizationDetails.neworganizationname || '____________________', bold: true },
  //         ' (organization name) as ',
  //         { text: formValue.newOrganizationDetails.newdesignation || '____________________', bold: true },
  //         ' (designation) [Optional]'
  //       ],
  //       style: 'paragraph', margin: [0, 20, 0, 20]
  //     },
  //     { text: 'Thank you very much for taking the time to complete this questionnaire.\nWe wish you all the best in your future endeavor!', style: 'paragraph' },
  //     {
  //       columns: [
  //         { stack: [{ text: 'Exiting Employee', bold: true }, '\n\n\n\n', 'Signature: ________________', { text: `Date: ${today}`, margin: [0, 5, 0, 0] }] },
  //         { stack: [{ text: 'NeGD HR Representative', bold: true }, '\n\n\n\n', 'Signature: ________________', { text: 'Date: ________________', margin: [0, 5, 0, 0] }] }
  //       ],
  //       margin: [0, 40, 0, 0]
  //     }
  //   );

  //   docDefinition.styles = {
  //       header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
  //       subHeader: { fontSize: 12, bold: true, margin: [0, 15, 0, 5] },
  //       paragraph: { fontSize: 10, margin: [0, 5, 0, 15] },
  //       infoTable: { margin: [0, 5, 0, 15], fontSize: 10 },
  //       tableHeader: { bold: true, fontSize: 11, color: 'black', alignment: 'center' },
  //       question: { fontSize: 10, bold: true, margin: [0, 15, 0, 5] },
  //       answer: { fontSize: 10, italics: true, color: '#444', margin: [0, 0, 0, 10] },
  //   };

  //   docDefinition.layouts = {
  //       compactTableBorder: {
  //         hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0 : 1,
  //         vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length) ? 1 : 0,
  //         hLineColor: () => 'black', vLineColor: () => 'black',
  //         paddingLeft: () => 5, paddingRight: () => 5,
  //         paddingTop: () => 5, paddingBottom: () => 5,
  //       }
  //   };


  //   const fileName = `Exit-Interview-${formValue.employeeId || 'Employee'}.pdf`;
  //   pdfMake.createPdf(docDefinition).download(fileName);
  // }

  // In your component.ts


  // In your-component.ts

  // Make sure you have the correct imports at the top of your file


  public generatePdf(): void {
    // Ensure form data is available
    if (!this.questionnaireForm) {
      console.error('Form not initialized.');
      return;
    }
    const formValue = this.questionnaireForm.getRawValue();

    const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

    // Helper function to create a row in the main info table
    const createInfoRow = (label: string, value: any): [string, any] => {
      return [label, value || 'N/A'];
    };

    // Helper to build the "Reasons" section as a 4-column table
    const buildReasonsChecklist = () => {
      // const checkedBox = '[X]';
      // const uncheckedBox = '[ ]';
      // const checkedBox = '\u25A0';  
      // const uncheckedBox = '\u25A1';
      const checkedBox = '■';     // Filled square
const uncheckedBox = '□'; 
     
      const otherReasonIdentifier = 'any other reason';

      const allReasonItems = this.resignationReasons.map((reason: any, index: number) => {
        const control = formValue.reasonsControls[index];
        const isSelected = control ? control.selected : false;
        let reasonText = reason.reason_resignation_name || 'Unknown Reason';

        if (reasonText.toLowerCase().includes(otherReasonIdentifier)) {
          if (formValue.reasonOtherSpecify) {
            return { state: checkedBox, text: `${reasonText}: ${formValue.reasonOtherSpecify}` };
          } else {
            return { state: uncheckedBox, text: reasonText };
          }
        }
        return { state: isSelected ? checkedBox : uncheckedBox, text: reasonText };
      });

      const tableBody: any[][] = [];
      const midPoint = Math.ceil(allReasonItems.length / 2);

      for (let i = 0; i < midPoint; i++) {
        const leftItem = allReasonItems[i];
        const rightItem = allReasonItems[i + midPoint];
        const row = [
          { text: leftItem.state, alignment: 'center' }, leftItem.text,
          rightItem ? { text: rightItem.state, alignment: 'center' } : '', rightItem ? rightItem.text : ''
        ];
        tableBody.push(row);
      }
      return {
        table: {
          widths: ['auto', '*', 'auto', '*'],
          body: tableBody
        },
      };
    };

    // Helper to build the "Ranks" section as a single 4-column table
    const buildRankingsTable = () => {
      const rankings = formValue.rankingsControls.map((control: any, index: number) => ({
        name: this.rankingAspects[index]?.aspect_name || 'Unknown Aspect',
        rank: control.rank_assigned || '',
      }));

      const tableBody: any[][] = [];
      const midPoint = Math.ceil(rankings.length / 2);
      const rankingsLeft = rankings.slice(0, midPoint);
      const rankingsRight = rankings.slice(midPoint);

      const header = [
        { text: 'Aspect', style: 'tableHeader' }, { text: 'Rank', style: 'tableHeader' },
        { text: 'Aspect', style: 'tableHeader' }, { text: 'Rank', style: 'tableHeader' }
      ];
      tableBody.push(header);

      for (let i = 0; i < midPoint; i++) {
        const row = [
          rankingsLeft[i].name, { text: rankingsLeft[i].rank, alignment: 'center' },
          rankingsRight[i] ? rankingsRight[i].name : '', rankingsRight[i] ? { text: rankingsRight[i].rank, alignment: 'center' } : ''
        ];
        tableBody.push(row);
      }
      return {
        table: {
          widths: ['*', 50, '*', 50],
          body: tableBody,
        },
      };
    };

    // Helper to create the dynamic question & answer blocks
    const buildFeedbackBlocks = () => {
      return formValue.additionalFeedback.flatMap((feedback: any) => [
        { text: feedback.label || 'Unnamed Question', style: 'question' },
        { text: feedback.questionnaire_response || '__________________________________________________________________________________', style: 'answer' },
      ]);
    };

    // =================================================================
    // PDF DOCUMENT DEFINITION - BUILT DECLARATIVELY
    // =================================================================
    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        // ---------- PAGE 1 ----------
        { text: 'Exit Interview Questionnaire', style: 'header' },
        {
          style: 'infoTable',
          table: {
            widths: ['auto', '*'],
            body: [
              createInfoRow('Name of Employee:', formValue.employeeName),
              createInfoRow('Employee ID:', formValue.employeeId),
              createInfoRow('Function/ Department/ Project:', formValue.department),
              createInfoRow('Current Designation:', formValue.designation),
              createInfoRow('Current Annual Salary:', formValue.annualSalary),
              createInfoRow('Date of Joining:', formValue.dateOfJoining),
              createInfoRow('Designation at the time of Joining:', formValue.designationAtJoining),
              createInfoRow('Salary at the time of joining:', formValue.salaryAtJoining),
              createInfoRow('Payroll (NISG/BSN/DIC etc.):', formValue.payroll),
              createInfoRow('Last working day at the organization:', formValue.lastWorkingDay),
              createInfoRow('Contact Address, Phone No. & Email Id:', `${formValue.contactAddress}\n${formValue.phoneNo}\n${formValue.emailId}`),
            ],
          },
          layout: 'compactTableBorder',
        },
        { text: `The exit interview feedback will be maintained strictly confidential and will be shared only with the Senior Management of ${this.organizationName} / DIC. The information so gathered will help us change or improve the organization as relevant and necessary. In your feedback, please also include areas / items that may not have been covered in the questionnaire.`, style: 'paragraph' },
        { text: 'i. Reason(s) for resignation:', style: 'subHeader' },
        buildReasonsChecklist(),
        { text: 'ii. Kindly assign ranks to the following aspects of your experience in working with us:', style: 'subHeader' },
        { text: `Use ranks from 1 to 10; where 10 indicates “The Best” and 1 indicates “The Worst” aspects of your experience in the work environment at ${this.organizationName}/SeMT:`, style: 'paragraph', italics: true },
        buildRankingsTable(),

        // ---------- PAGE 2 ----------
        { text: '', pageBreak: 'before' },
        ...buildFeedbackBlocks(),

        // --- Certification & Signature Block at the end ---
        {
          text: [
            'I certify that I am joining ',
            { text: formValue.newOrganizationDetails.neworganizationname || '____________________', bold: true },
            ' (organization name) as ',
            { text: formValue.newOrganizationDetails.newdesignation || '____________________', bold: true },
            ' (designation) [Optional]'
          ],
          style: 'paragraph', margin: [0, 20, 0, 20]
        },
        { text: 'Thank you very much for taking the time to complete this questionnaire.\nWe wish you all the best in your future endeavor!', style: 'paragraph' },
        {
          columns: [
            { stack: [{ text: 'Exiting Employee', bold: true }, '\n\n\n\n', 'Signature: ________________', { text: `Date: ${today}`, margin: [0, 5, 0, 0] }] },
            { stack: [{ text: `${this.organizationName} HR Representative`, bold: true }, '\n\n\n\n', 'Signature: ________________', { text: 'Date: ________________', margin: [0, 5, 0, 0] }] }
          ],
          margin: [0, 40, 0, 0]
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
        subHeader: { fontSize: 12, bold: true, margin: [0, 15, 0, 5] },
        paragraph: { fontSize: 10, margin: [0, 5, 0, 15] },
        infoTable: { margin: [0, 5, 0, 15], fontSize: 10 },
        tableHeader: { bold: true, fontSize: 11, color: 'black', alignment: 'center' },
        question: { fontSize: 10, bold: true, margin: [0, 15, 0, 5] },
        answer: { fontSize: 10, italics: true, color: '#444', margin: [0, 0, 0, 10] },
      },
      layouts: {
        compactTableBorder: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0 : 1,
          vLineWidth: (i: number, node: any) => (i === 0 || i === node.table.widths.length) ? 1 : 0,
          hLineColor: () => 'black', vLineColor: () => 'black',
          paddingLeft: () => 5, paddingRight: () => 5,
          paddingTop: () => 5, paddingBottom: () => 5,
        }
      }
    };

    const fileName = `Exit-Interview-${formValue.employeeId || 'Employee'}.pdf`;
    pdfMake.createPdf(docDefinition).open();
  }

}

