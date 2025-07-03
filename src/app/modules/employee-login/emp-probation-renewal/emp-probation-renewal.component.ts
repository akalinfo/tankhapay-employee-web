import { Component, ElementRef, ViewChild } from '@angular/core';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { AlertService } from 'src/app/shared/_alert';;
import { LoginService } from '../../login/login.service';
import { UserMgmtService } from '../../user-mgmt/user-mgmt.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ReportService } from '../../reports/report.service';

@Component({
  selector: 'app-emp-probation-renewal',
  templateUrl: './emp-probation-renewal.component.html',
  styleUrls: ['./emp-probation-renewal.component.css']
})
export class EmpProbationRenewalComponent {
  confirmationModal: boolean = false;
  showSidebar: boolean = true;
  month: any;
  includeEmployeeDetails: boolean = false;
  days_count: any;
  radio_button_value: any;
  action: any;
  year: any;
  p: number = 0;
  invKey: any = '';
  filteredEmployees: any = [];
  selected_date: any;
  yearsArray: any = [];
  data_summary: any = [];
  product_type: any;
  employer_name: any = '';
  tp_account_id: any = '';
  currentDate: any;
  currentDateString: any;
  payout_date: any;
  cur_payout_day: string = '';
  employer_profile: any = [];
  token: any = '';
  selectedReport: string = 'summary';
  data: any = [];


  myForm: FormGroup

  selectedOption: string = 'summary';
  summary: boolean = false;
  showDetail: boolean = false;

  show_label: boolean = true;
  isSideBar: boolean = true;

  selectedUnitId: any = [];
  selectedDepartmentId: any = [];
  selectedDesignationId: any = [];
  unit_master_list_data: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];

  selectedDynmicColumnValues: any[] = [];
  get_employee_list_data: any[] = [];
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '150px',
    minHeight: '0',
    maxHeight: '700px',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',


    toolbarHiddenButtons: [
      ['bold', 'italic'],
      ['fontSize'],
      [
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
    ],
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image'
  };

  viewtrack: boolean = false;
  get_desc: any[]=[];

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _ReportService: ReportService,
    private _alertservice: AlertService, private _loginService: LoginService, private _userMgmtService: UserMgmtService, private _formBuilder: FormBuilder) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);


  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    this.employer_name = this.token.name;

    this.get_employee_list();
    this.myForm = this._formBuilder.group({
      description: ['', Validators.required]
    });
  }

  get_employee_list() {
    // console.log(this.token);

    this._loginService.get_tpay_dashboard_data({
      "action": "get_probation_fromemp",
      "accountId": this.tp_account_id,
      "geo_location_id": this.token.geo_location_id,
      "ouIds": this.token.ouIds,
      "emp_code": this.token.employee_flag.emp_id,
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_employee_list_data = resData.commonData;
          } else {
            this.get_employee_list_data = [];
          }
        }, error: (e) => {
          this.get_employee_list_data = [];
          console.log(e);
        }
      })
  }


  isValueGreaterThanZero(key: string): boolean {
    return this.filteredEmployees.some(report => report[key] > 0);
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  closeConfirmModal() {
    this.confirmationModal = false;
  }
  selectedEmployee: any = null;
  alertsendforrenewal(employee: any) {
    this.selectedEmployee = employee;
    this.confirmationModal = true;
  }
  sendtoreporting() {
    const descriptionControl = this.myForm.get('description');
    if (descriptionControl?.invalid) {
      if (descriptionControl.hasError('required')) {
        this.toastr.error('Description is required.');
        return;
      }
    }
    if (this.selectedEmployee) {
      let postData = {
        p_action_for_contract: 'save_contractrenewal_transaction',
        customeraccountid: this.tp_account_id.toString(),
        userby: this.selectedEmployee.emp_id.toString(),
        emp_id: this.selectedEmployee.reportingmanager_emp_id.toString(),
        renewal_of_emp_code: this.selectedEmployee.emp_code.toString(),
        status: 'senttoreporting',
        description: this.myForm.get('description').value,
        p_category: this.selectedEmployee.category?.toString()

      }

      this._userMgmtService.contractrenewal(postData).subscribe((resData: any): any => {
        if (resData.statusCode) {
          this.get_employee_list();
          this.toastr.success('Submitted successfully');
          this.confirmationModal = false;
          this.myForm.reset();
        } else {
          return this.toastr.error('Something went wrong')
        }
      })
    }
  }


  viewDesc(employee: any) {
    this.viewtrack = true;
    // console.log(employee);

    if (employee.category != null) {
      this._loginService.get_tpay_dashboard_data({
        "action": "get_probation_renewal_desc",
        "accountId": this.tp_account_id,
        "geo_location_id": this.token.geo_location_id,
        "ouIds": this.token.ouIds,
        "p_category": employee.category,
      })
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {

              this.get_desc = resData.commonData;
            } else {
              this.get_desc = [];
            }
          }, error: (e) => {
            this.get_desc = [];
            console.log(e);
          }
        })
    }
  }
  closetrackModal() {
    this.viewtrack = false;
    this.get_desc = [];
  }

  getFormatDateToDDMMYYYY(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  }
  
  sanitizeHtmlForPdf(html: string | null | undefined): string {
    if (!html) return ''; // Check if null, undefined, or empty

    return html
      .replace(/&nbsp;/g, ' ')
      .replace(/\r?\n|\r/g, '')
      .replace(/<p>/g, '<div class="para">')
      .replace(/<\/p>/g, '</div>')
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .replace(/<br\s*\/?>/gi, '<br>')
      .trim();
  }

  generateApprovalPdf(reportData: any) {
    //console.log(reportData)
    const approvalStatusDate = this.getFormatDateToDDMMYYYY(reportData.approval_status_dt);
    const dateOfJoining = this.getFormatDateToDDMMYYYY(reportData.dateofjoining);
    const today = new Date();
    const formattedToday = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const employeeRemark = this.sanitizeHtmlForPdf(reportData?.user_remarks);
    const reportingRemarks = this.sanitizeHtmlForPdf(reportData?.remoprting_remarks);
    
    let htmlContent = `
      <style>
        .form-container {
          font-family: 'Times New Roman', Times, serif;
          width: 794px;              /* A4 width at 96 DPI */
          height: 1123px;            /* A4 height at 96 DPI */
          margin: 0 auto;
          padding: 30px;
          background-color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .header {
          color: #000;
          text-align: center;
          text-decoration: underline;
          font-size: 14px;
          font-weight: bold;
          padding: 10px;
          margin-bottom: 20px;
        }

        .secondary-header {
          color: #000;
          text-align: center;
        }
        .address{
          color: #000;
          text-align: center;
          font-size: 12px;
        }
        .employername{
          color: #000;
          text-align: center;
          font-weight: bold;
          font-size: 14px; /* Retained line spacing */
        }
        .section {
          margin-bottom: 15px; /* Retained for tight spacing */
        }
        .table {
          border: 1px solid #000;
          border-collapse: collapse;
          width: 100%;
        }
        .table th, .table td {
          border: 1px solid #000;
          padding-left: 18px;
          padding-right: 18px;
          text-align: left;
          vertical-align: top;
          font-size: 12px;

        }
        .table th {
          border: 1px solid #000;
          font-weight: bold;
          width: 30%;
        }
        .table td {
          border: 1px solid #000;
          width: 70%;
        }
        .table tbody tr:nth-child(odd) {
          background-color: #F5F5F5;
        }
        .table tbody tr:nth-child(even) {
          background-color: #FFFFFF;
        }
        .label {
          font-weight: bold;
          font-size: 14px;
          color: #000;
          margin-bottom: 5px; /* Retained for spacing */
        }
        .signature {
          margin-top: 15px; /* Retained for tight spacing */
          font-size: 12px;
          color: #000;
          padding-bottom: 5px;
          font-weight: bold;
        }
        .description {
          border: 1px solid #ccc;      /* A softer border color */
          background-color: #f9f9f9;  
          // padding: 5px;             
          margin-top: 5px;          
          border-radius: 5px;        
          min-height: 80px;          
          margin-left: 30px;
          margin-right: 30px;
          padding-left: 30px;
          padding-right: 30px;
          /* User-specified styles */
          font-size: 12px;
          line-height: 1.5;
          color: #000;
          text-align: left;    
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #666;
          margin-top: 15px; /* Retained for tight spacing */
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        .checkbox {
          font-size: 12px;
          margin: 3px 0; /* Retained for tight spacing */
          padding-left: 20px;
        }
        .checkbox.checked::before {
          content: '[X] ';
          font-weight: bold;
        }
        .checkbox::before {
          content: '[ ] ';
          display: inline-block;
          width: 20px;
        }
        .date{
          text-align: right;
        }
      </style>
    `;

    // Page 1
    htmlContent += `
      <div class="form-container">
        <div class="header"><br><br>Probation Completion Approval Form</div>
        <p class="secondary-header">
          <span class="employername">${reportData.employername ? reportData.employername : ''} </span> <br>
          <span class="address">${reportData.address_html ? reportData.address_html : ''}</span>
        </p>
        <p class="date">Dated :  ${formattedToday}</p>

        <div class="section">
          <table class="table" border="1" cellpadding="6" cellspacing="0" width="98%" style="border-collapse: collapse; font-size: 12px;">
              <tr><th style="border-top: 2px solid #000; border-left: 2px solid #000;">Name of the Employee :</th><td style="border-top: 2px solid #000;">${reportData.empnameforrenewal ? reportData.empnameforrenewal : ''}</td></tr>
              <tr><th>Designation :</th><td>${reportData.post_offered ? reportData.post_offered : ''}</td></tr>
              <tr><th>Division / Department :</th><td>${reportData.posting_department ? reportData.posting_department : ''}</td></tr>
              <tr><th>Employee Code :</th><td>${reportData.orgempcode ? reportData.orgempcode : ''}</td></tr>
              <tr><th>Date of Joining :</th><td>${dateOfJoining ? dateOfJoining : ''}</td></tr>
              <tr><th>Name of Reporting Officer :</th><td>${reportData.reportingmanagername ? reportData.reportingmanagername : ''}</td></tr>
              <tr><th>Brief Work Report :</th><td>${employeeRemark || 'No report provided.'} </td></tr>
          </table>
        </div>

        <div class="section">
          <p class="label">&nbsp;&nbsp; HR Division :</p>
          <p >&nbsp;&nbsp; Please provide feedback regarding the completion of the above-mentioned employee's probationary period and 
          <br>&nbsp;&nbsp; the contract to be extended till ${reportData.end_of_contract_date ? reportData.end_of_contract_date : ''}.</p>
          <p class="signature date">&nbsp;&nbsp; HR Signature with date</p>
        </div>

      </div>
    `;

    // Page 2
    htmlContent += `
      <div class="form-container">
        <div class="section">
          <p class="label">&nbsp;&nbsp; To be filled by the Reporting Officer :</p>
          ${
            reportData.approval_status === 'Approved'
              ? `<div class="checkbox checked">&nbsp;&nbsp; Completion of probation:  Approved </div>`
              : reportData.approval_status === 'Extend'
              ? `<div class="checkbox checked">&nbsp;&nbsp; Completion of probation: Extend the Probation period</div>`
              : reportData.approval_status === 'Not Approved'
              ? `<div class="checkbox checked">&nbsp;&nbsp; Completion of probation: Not Approved (Discharge)</div>`
              : `<div class="checkbox">&nbsp;&nbsp; No recommendation selected</div>`
          }
          <p>&nbsp;&nbsp; Date : ${approvalStatusDate ?  approvalStatusDate : ' '}</p>
          <p class="label" >&nbsp;&nbsp; Comments :</p>
          <table cellpadding="6" cellspacing="0" width="98%" style="border-collapse: collapse; font-size: 12px;">
              <tr><th>${reportingRemarks ?  reportingRemarks : ' No comments provided.'}</th></tr>
          </table>
        </div>

        <div class="section">
          <p class="signature">&nbsp;&nbsp; Reporting Officer's </p>
          <p>&nbsp;&nbsp; <strong>Signature with date </strong></p>
          <p class="signature">&nbsp;&nbsp; Director's / Head of Department's </p>
          <p>&nbsp;&nbsp; <strong>Signature with date</strong></p>
        </div>

        <div class="footer"></div>
      </div>
    `;

    // Generate PDF
    this._ReportService.getPdfBtyeCodePortrait({
      htmlBody: htmlContent,
    }).subscribe((resData: any) => {
      if (resData.statusCode === true) {
        const byteCharacters = atob(resData.commonData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new Blob([byteArray], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = `probation-completion-form-${reportData.orgempcode}.pdf`;
        a.click();
        URL.revokeObjectURL(fileURL);
      }
    });
  }
  
}