import { Component, ElementRef, ViewChild } from '@angular/core';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { AlertService } from 'src/app/shared/_alert';;
import { LoginService } from '../../login/login.service';
import { UserMgmtService } from '../../user-mgmt/user-mgmt.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { ReportService } from '../../reports/report.service';

@Component({
  selector: 'app-emp-contract-renewal',
  templateUrl: './emp-contract-renewal.component.html',
  styleUrls: ['./emp-contract-renewal.component.css']
})
export class EmpContractRenewalComponent {
  viewtrack: boolean = false;
  get_desc: any[]= [];
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
    height: '200px',
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
      description: ['']
    });
  }

  get_employee_list() {
    //console.log(this.token);

    this._loginService.get_tpay_dashboard_data({
      "action": "get_contract_renewal_fromemp",
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
    if(this.myForm.value.description.replace(/<[^>]+>/g, '') == '' || this.myForm.value.description.replace(/<[^>]+>/g, '') == null){
       this.toastr.error('Please enter description');
       return;
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
      // console.log(postData);

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
    if (employee.category != null) {
      this._loginService.get_tpay_dashboard_data({
        "action": "get_contract_renewal_desc",
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
    // console.log(reportData)
    const dateOfJoining = this.getFormatDateToDDMMYYYY(reportData?.dateofjoining);
    const endOfContractDate = this.getFormatDateToDDMMYYYY(reportData?.end_of_contract_date);
    const today = new Date();
    const formattedToday = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const employeeRemark = this.sanitizeHtmlForPdf(reportData?.user_remarks);
    const reportingRemarks = this.sanitizeHtmlForPdf(reportData?.remoprting_remarks);
    
   // console.log(employeeRemark)
    let htmlContent = `
      <style>
        .para {
          margin-bottom: 12px;
        }
        .content {
          margin-left: 40px; /* 👈 Adds left margin */
          margin-right: 30px;
        }
        .form-container {
          font-family: 'Times New Roman', Times, serif;
          width: 794px; /* A4 width at 96 DPI */
          height: 1123px; /* A4 height at 96 DPI */
          margin: 0 auto;
          padding: 20px;
          background-color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }
        .header {
          color: #000;
          text-align: center;
          text-decoration: underline;
          font-size: 16px;
          font-weight: bold;
          padding: 5px;
          margin-bottom: 10px;
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
          margin-bottom: 5px;
        }
        .table {
          border: 1px solid black;
          border-collapse: collapse;
        }
        .table th,
        .table td {
          border: 1px solid black;
          padding: 8px;
        }
        .label {
          font-weight: bold;
          font-size: 12px;
          color: #000;
          margin-bottom: 5px;
        }
        .signature {
          margin-top: 8px;
          font-size: 11px;
          color: #000;
          font-weight: bold;
          display: flex;
          align-items: center;
        }
        .signature-line {
          border-bottom: 1px solid #000;
          width: 200px;
          margin-left: 10px;
        }
        .comments {
          border: 1px solid #ccc;
          background-color: #f9f9f9;
          margin-top: 5px;
          border-radius: 4px;
          min-height: 40px;
          padding: 8px;
          font-size: 11px;
          line-height: 1.2;
          color: #000;
          text-align: left;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #666;
          margin-top: 12px;
          border-top: 1px solid #ccc;
          padding-top: 6px;
        }
        .checkbox {
          font-size: 11px;
          margin: 3px 0;
          padding-left: 15px;
        }
        .checkbox.checked::before {
          content: '[X] ';
          font-weight: bold;
        }
        .checkbox::before {
          content: '[ ] ';
          display: inline-block;
          width: 15px;
        }
        .date {
          text-align: right;
          font-size: 11px;
          margin-bottom: 10px;
        }
      </style>
      <div class="form-container">
        <div class="header"><br><br>Contract Renewal Approval Form</div>
        <p class="secondary-header">
          <span class="employername">${reportData.employername ? reportData.employername : ''} </span> <br>
          <span class="address">${reportData.address_html ? reportData.address_html : ''}</span>
        </p>
        <p class="date">Dated: ${formattedToday}</p>

        <div class="section">
          <table class="table" style="border: 1px solid black; border-collapse: collapse; width: 100%;">
            <tr>
              <th style="border-top: 2px solid #000; border-left: 2px solid #000;">Employee Name</th>
              <td style="border-top: 2x solid #000;">${reportData.empnameforrenewal || ''}</td>
            </tr>
            <tr>
              <th style="border: 1px solid black; border-left: 1px solid black;">Emp. Code</th>
              <td style="border: 1px solid black;">${reportData.orgempcode || ''}</td>
            </tr>
            <tr>
              <th style="border: 1px solid black; border-left: 1px solid black;">Designation</th>
              <td style="border: 1px solid black;">${reportData.post_offered || ''}</td>
            </tr>
            <tr>
              <th style="border: 1px solid black; border-left: 1px solid black;">Date of Joining</th>
              <td style="border: 1px solid black;">${dateOfJoining || ''}</td>
            </tr>
            <tr>
              <th style="border: 1px solid black; border-left: 1px solid black;">Contract End Date</th>
              <td style="border: 1px solid black;">${endOfContractDate || ''}</td>
            </tr>
            <tr>
              <th style="border: 1px solid black; border-left: 1px solid black;">Head of Department (HOD) / Reporting Officer</th>
              <td style="border: 1px solid black;">${reportData.reportingmanagername || ''}</td>
            </tr>
          </table>
          
          <p class="label">&nbsp;&nbsp; Key accomplishments and exceptional achievements:</p>
          <table width="98%" style="border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="padding: 118px 110px; text-align: left; font-weight: normal;">
                ${employeeRemark ? employeeRemark : 'No Remark provided.'}
              </td>
            </tr>
          </table>

          <p class="label">&nbsp;&nbsp; Recommendation of regarding Contract Renewal:</p>
          <p class="label">&nbsp;&nbsp; Comments of Reporting Head:</p>
          <table cellpadding="3" cellspacing="0" width="98%" style="border-collapse: collapse; font-size: 12px;">
              <tr><th>&nbsp;&nbsp; ${reportingRemarks ?  reportingRemarks : ' No comments provided.'}</th></tr>
          </table>

          <p class="label">&nbsp;&nbsp; Head of Department (HoD)/ Reporting officer Recommendations::</p>
          ${reportData.is_contract_renewal ? `<div class="checkbox checked">&nbsp;&nbsp; Contract Renewal: ${reportData.is_contract_renewal === 'Y' ? 'Yes' : 'No'}</div>` : ''}
          ${reportData.is_promotion ? `<div class="checkbox checked">&nbsp;&nbsp; Promotion: ${reportData.is_promotion === 'Y' ? 'Yes' : 'No'}</div>` : ''}
          ${reportData.is_role_change ? `<div class="checkbox checked">&nbsp;&nbsp; Role Change: ${reportData.is_role_change === 'Y' ? 'Yes' : 'No'}</div>` : ''}
          ${reportData.is_role_change === 'Y' ? `
            <p class="label">&nbsp;&nbsp; Brief of New Role and Responsibility:</p>
            <table cellpadding="3" cellspacing="0" width="98%" style="border-collapse: collapse; font-size: 12px;">
              <tr><th>&nbsp;&nbsp; ${reportData.role_brief ?  reportData.role_brief : ' No comments provided.'}</th></tr>
          </table>
          ` : ''}
          
          <p class="signature">&nbsp;&nbsp; Head of Department (HoD)/Reporting Officer: <span class="signature-line">${reportData.reportingmanagername ? reportData.reportingmanagername : ''}</span></p>
          <p class="signature">&nbsp;&nbsp; Date: <span class="signature-line"></span></p>
        </div>

        <div class="footer"></div>
      </div>
    `;

    // Generate PDF using ReportService
    this._ReportService.getPdfBtyeCodePortrait({ htmlBody: htmlContent }).subscribe(
      (resData: any) => {
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
          a.download = `contract-renewal-form-${reportData.orgempcode}.pdf`;
          a.click();
          URL.revokeObjectURL(fileURL);
        }
      },
      (error) => {
        console.error('Error generating PDF:', error);
      }
    );

  }
}
