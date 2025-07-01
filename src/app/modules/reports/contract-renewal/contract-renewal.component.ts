import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as XLSX from 'xlsx';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { FilterField } from '../common-filter/filter.model';
import { LoginService } from '../../login/login.service';
import { UserMgmtService } from '../../user-mgmt/user-mgmt.service';

@Component({
  selector: 'app-contract-renewal',
  templateUrl: './contract-renewal.component.html',
  styleUrls: ['./contract-renewal.component.css']
})
export class ContractRenewalComponent {
  confirmationModal: boolean = false;
  viewtrack: boolean = false;
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

  get_desc: any[]= [];


  selectedOption: string = 'summary';
  summary: boolean = false;
  showDetail: boolean = false;

  show_label: boolean = true;
  isSideBar: boolean = true;
  addOnFilters: FilterField[] = [];

  selectedUnitId: any = [];
  selectedDepartmentId: any = [];
  selectedDesignationId: any = [];
  unit_master_list_data: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];

  selectedDynmicColumnValues: any[] = [];
  get_employee_list_data: any;

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _ReportService: ReportService,
    private _alertservice: AlertService, private _loginService: LoginService, private _userMgmtService: UserMgmtService,) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);


  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    console.log(this.token);

    this.tp_account_id = this.token.tp_account_id;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    this.employer_name = this.token.name;

    this.get_employee_list();
  }

  get_employee_list() {
    this._loginService.get_tpay_dashboard_data({
      "action": "get_contract_renewal_emplist",
      "accountId": this.tp_account_id.toString(),
      "geo_location_id": this.token.geo_location_id,
      "ouIds": this.token.ouIds
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            // console.log(resData.commonData);

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
  sendforrenewal() {
    if (this.selectedEmployee) {
      console.log("Sending to:", this.selectedEmployee);
      const randomFiveDigit = Math.floor(10000 + Math.random() * 90000);
      let postData = {
        p_action_for_contract: 'save_contractrenewal_transaction',
        customeraccountid: this.tp_account_id.toString(),
        userby: this.token.emp_code || this.token.id,
        emp_id: this.selectedEmployee.emp_id.toString(),
        renewal_of_emp_code: this.selectedEmployee.emp_code.toString(),
        status: 'senttouser',
        p_category: 'C-' + randomFiveDigit
        // roleName: this.designationForm.value.designationName,
        // id: this.designationForm.value.id.toString(),

      }

      this._userMgmtService.contractrenewal(postData).subscribe((resData: any): any => {
        if (resData.statusCode) {
          this.get_employee_list();
          this.toastr.success('Sent');
          this.confirmationModal = false;
        } else {
          return this.toastr.error('Something went wrong')
        }
      })


    }
  }

  viewt(employee: any) {
    this.viewtrack = true;
    console.log(employee);

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
              console.log(resData.commonData);

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
    
    console.log(employeeRemark)
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
          border: 1px solid #000;
          border-collapse: collapse;
          width: 100%;
        }
        .table th, .table td {
          border: 1px solid #000;
          padding: 6px 10px;
          text-align: left;
          vertical-align: middle;
          font-size: 11px;
        }
        .table th {
          font-weight: bold;
          background-color: #e0e0e0;
          width: 30%;
        }
        .table td {
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
          <table class="table" border="1" cellpadding="3" cellspacing="0" width="98%">
            <tbody>
              <tr><th>Employee Name</th><td>${reportData.empnameforrenewal ? reportData.empnameforrenewal : ''}</td></tr>
              <tr><th>Employee Code</th><td>${reportData.emp_code ? reportData.emp_code : ''}</td></tr>
              <tr><th>Designation</th><td>${reportData.post_offered ? reportData.post_offered : ''} </td></tr>
              <tr><th>Date of Joining</th><td>${dateOfJoining ? dateOfJoining : ''}</td></tr>
              <tr><th>Contract End Date</th><td>${endOfContractDate ? endOfContractDate : ''}</td></tr>
              <tr><th>Head of Department (HOD) / Reporting Officer</th><td>${reportData.reportingmanagername ? reportData.reportingmanagername : ''}</td></tr>
            </tbody>
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
            <tbody>
              <tr><th>&nbsp;&nbsp; ${reportingRemarks ?  reportingRemarks : ' No comments provided.'}</th></tr>
            </tbody>
          </table>

          <p class="label">&nbsp;&nbsp; Head of Department (HoD)/ Reporting officer Recommendations::</p>
          ${reportData.is_contract_renewal ? `<div class="checkbox checked">&nbsp;&nbsp; Contract Renewal: ${reportData.is_contract_renewal === 'Y' ? 'Yes' : 'No'}</div>` : ''}
          ${reportData.is_promotion ? `<div class="checkbox checked">&nbsp;&nbsp; Promotion: ${reportData.is_promotion === 'Y' ? 'Yes' : 'No'}</div>` : ''}
          ${reportData.is_role_change ? `<div class="checkbox checked">&nbsp;&nbsp; Role Change: ${reportData.is_role_change === 'Y' ? 'Yes' : 'No'}</div>` : ''}
          ${reportData.is_role_change === 'Y' ? `
            <p class="label">&nbsp;&nbsp; Brief of New Role and Responsibility:</p>
            <table cellpadding="3" cellspacing="0" width="98%" style="border-collapse: collapse; font-size: 12px;">
            <tbody>
              <tr><th>&nbsp;&nbsp; ${reportData.role_brief ?  reportData.role_brief : ' No comments provided.'}</th></tr>
            </tbody>
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
          a.download = `contract-renewal-form-${reportData.emp_code}.pdf`;
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
