import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import decode from 'jwt-decode';

@Component({
  selector: 'app-view-investment-declaration',
  templateUrl: './view-investment-declaration.component.html',
  styleUrls: ['./view-investment-declaration.component.css']
})
export class ViewInvestmentDeclarationComponent {
   [x: string]: any;
     orgempCode: any;
     @Input() empDataFromParent: any;
     currentDate: any;
     currentDateString: any;
     employer_name: any = '';
     month: any;
     finYear: any;
     year: any;
     selected_date: any;
     product_type: any;
     tp_account_id: any = '';
     token: any = '';
     data: any = [];
     tax_data: any = [];
     Inv_data: any = [];
     Verify_Inv_data = [];
     taxByMonth_data: any = [];
     taxprojection_data: any = [];
     totalincome_data: any = [];
     check: boolean = false;
     totalsaving_data: any = [];
     declaration_or_proof: any;
     financialYear: number = 1;
     chaptersixcomp_data: any = [];
     us80ccomp_data: any = [];
     flexiallowancecomp_data: any = [];
    
     emp_code: any;
     current_year: any = [];
     regimetype: any;
     
   
   
     viewFinYear = this.getCurrentFinancialYear();
   
     tenureOptions = [
       { value: '1', label: 'Monthly' },
       { value: '2', label: 'Quarterly' },
       { value: '3', label: 'Half-Yearly' },
       { value: '4', label: 'Yearly' }
     ];
     constructor(
       public toastr: ToastrService,
       private _sessionService: SessionService,
       private _formBuilder: FormBuilder,
       private _EncrypterService: EncrypterService,
       private _ReportService: ReportService,
      ) {
       this.currentDate = new Date();
       this.currentDateString = this.currentDate.toString().slice(0, -30);
     }
     ngOnInit() {
        let session_obj_d: any = JSON.parse(
        this._sessionService.get_user_session());
        this.token = decode(session_obj_d.token);
        this.tp_account_id = this.token.tp_account_id;
        this.employer_name = this.token.name;
        this.product_type = localStorage.getItem('product_type');
        this.selected_date = localStorage.getItem('selected_date');
        this.month = this.selected_date?.split('-')[1];
        this.year = this.selected_date?.split('-')[2];
        //this.FinancialYears();
        const now = new Date();
        const current_month = now.getMonth() + 1;
        this.current_year =
        current_month >= 4 ? `${now.getFullYear()}-${(now.getFullYear() + 1)}` : `${now.getFullYear() - 1}-${now.getFullYear()}`;
        this.exportToPDF(this.empDataFromParent?.emp_code.toString());
    }


  exportToPDF(empCode: any) {
  this._ReportService.GetTaxProjectionApi({
    "customerAccountId": this.tp_account_id.toString(),
    "financial_year": this.viewFinYear,
    "empCode": empCode?.toString(),
    "GeoFenceId": this.token.geo_location_id
  }).subscribe((resData: any) => {
    if (resData.statusCode) {
      this.tax_data = resData.commonData;
      this.taxByMonth_data = this.tax_data?.taxByMonth || {};
      if (this.taxByMonth_data?.fields) {
        this.taxByMonth_data["fields"] = this.taxByMonth_data["fields"].replaceAll('"', '');
      }
      this.taxprojection_data = this.tax_data?.taxprojection;
      this.totalincome_data = this.tax_data?.totalincome;
      this.totalsaving_data = this.tax_data?.totalsaving;
      this.chaptersixcomp_data = this.tax_data?.chaptersixcomp;
      this.us80ccomp_data = this.tax_data?.us80ccomp;
      this.flexiallowancecomp_data = this.tax_data?.flexiAllowances;

      // Define variables
      const viewFinYear = this.viewFinYear || "";
      const employeeName = this.tax_data.taxByMonth.emp_name || "NA";
      const orgEmpCode = this.tax_data.taxByMonth?.orgempcode || '';
      const regimeType = this.taxprojection_data?.regimetype || "";
      const panCard = this.taxprojection_data?.pancard || "";
      const startYear = this.start || "";
      const endYear = this.end || "";
      const declarationOrProof = this.declaration_or_proof || "D";
      const tpAccountId = this.tp_account_id || "";

      // Define CSS styles
      let htmlBody = `
        <style>
          .table {
            border: 1px solid black;
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 10px;
            font-size: 12px;
          }
          .table th, .table td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          .table th {
            background-color: #26A69A; /* Teal */
            color: white;
            font-weight: bold;
          }
          .table tbody tr {
            background-color: #E0F7FA; /* Light blue */
          }
          h4 {
            text-align: center;
            margin: 10px 0;
            font-size: 14px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .declaration, .note {
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-bottom: 10px;
            font-size: 12px;
          }
          .declaration div, .note div {
            padding: 10px;
            border-top: 1px solid #ccc;
          }
          .declaration div:first-child, .note div:first-child {
            background-color: #26A69A; /* Teal */
            color: white;
            font-weight: bold;
          }
        </style>
      `;

      // Header section
      htmlBody += `
        <div class="header">
          <h2>Tax Declaration For Financial Year ${viewFinYear}</h2>
          <h4>Name: ${employeeName} (${orgEmpCode})</h4>
          <h4>Regime Type: ${regimeType}</h4>
          <h4>Pan Card: ${panCard}</h4>
        </div>
      `;

      // Tax By Month table 5.64 
     /* htmlBody += `
        <h4>Tax By Month</h4>
        <table class="table" style="width:100%;font-size:10px;">
          <thead>
            <tr>
              <th style="width:19%;">Fields</th>
              <th style="width:6%;">Apr</th>
              <th style="width:6%;">May</th>
              <th style="width:6%;">Jun</th>
              <th style="width:6%;">Jul</th>
              <th style="width:6%;">Aug</th>
              <th style="width:6%;">Sep</th>
              <th style="width:6%;">Oct</th>
              <th style="width:6%;">Nov</th>
              <th style="width:6%;">Dec</th>
              <th style="width:6%;">Jan</th>
              <th style="width:6%;">Feb</th>
              <th style="width:6%;">Mar</th>
              <th style="width:9%;">Cumulative</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.taxByMonth_data && this.taxByMonth_data.fields) {
        const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];
        htmlBody += `
          <tr>
            <td style="width:19%;">${this.taxByMonth_data.fields}</td>
            ${months.map(month => `<td style="width:6%;">${this.taxByMonth_data[month] || '0'}</td>`).join('')}
            <td style="width:9%;">${this.taxByMonth_data.totalgrossearning || '0'}</td>
          </tr>
        `;
      } else {
        htmlBody += `<tr><td colspan="14">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;
      */

      // Tax Projection table
   
      /*  htmlBody += `
        <h4>Tax Projection</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Total Income</th>
              <th>Total Savings</th>
              <th>Taxable Income</th>
              <th>Net Payable Tax</th>
              <th>Tax Deducted</th>
              <th>Balance Tax</th>
              <th>Tax Slab</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${this.taxprojection_data?.totalincome || '0'}</td>
              <td>${this.taxprojection_data?.totalsavings || '0'}</td>
              <td>${this.taxprojection_data?.taxableincome || '0'}</td>
              <td>${this.taxprojection_data?.netpayabletax || '0'}</td>
              <td>${this.taxprojection_data?.taxdeducted || '0'}</td>
              <td>${this.taxprojection_data?.balancetax || '0'}</td>
              <td>${this.taxprojection_data?.taxslab || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      `; */
      // Total Income table
      htmlBody += `
        <h4>Total Income</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Income Head</th>
              <th>Income</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.totalincome_data && this.totalincome_data.length > 0) {
        this.totalincome_data.forEach((income: any) => {
          htmlBody += `
            <tr>
              <td>${income.incomehead || 'N/A'}</td>
              <td>${income.income || '0'}</td>
            </tr>
          `;
        });
      } else {
        htmlBody += `<tr><td colspan="2">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;


      // Flexi Allowance Components table
      htmlBody += `
        <h4>Flexi Allowance Components</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Component Name</th>
              <th>Max Limit</th>
              <th>Component Value (Declaration)</th>
              <th>Component Value (Proof)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.flexiallowancecomp_data && this.flexiallowancecomp_data.length > 0) {
        this.flexiallowancecomp_data.forEach((comp: any) => {
          htmlBody += `
            <tr>
              <td>${comp.componentname || 'N/A'}</td>
              <td>${comp.max_limit || '0'}</td>
              <td>${comp.declr_amount || '0'}</td>
              <td>${comp.componentvalue || '0'}</td>
              <td>${comp.approval_status || 'N/A'}</td>
            </tr>
          `;
        });
      } else {
        htmlBody += `<tr><td colspan="5">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;

      // Declaration section (if applicable)
      if (declarationOrProof === 'D' && ['981', '6148', '3088'].includes(tpAccountId)) {
        htmlBody += `<div style="page-break-before: always;break-before: page; "></div>
          <div class="declaration">
            <div>Declaration</div>
            <div>
              I hereby declare that the particulars given on pre-page/above are correct and complete in all respect. I may be allowed appropriate tax rebate while calculating my tax liability of Financial Year ${viewFinYear} (Assessment Year ${startYear} - ${endYear}).
            </div>
            <div>
              <b>The self-attested documentary proof for claiming the benefits of various savings / investments already made or likely to be made, will be submitted by 15th January ${startYear} failing which the tax may be recovered from me by nullifying the savings / investments stated in declaration form.</b>
            </div>
            <div>
              I hereby state that the claim of deduction shown above is in my name and if it is in joint account then it is declared herewith that the other claimant will not claim it in his/her ITR.
            </div>
            <div>
              In case of payment/ contribution/ investments, I will produce the original document for verification, whenever it will be asked for.
            </div>
          </div>
        `;
      }


      // Total Saving table
      htmlBody += `<div style="page-break-before: always;break-before: page; "></div>
        <h4>Total Saving</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Saving Head</th>
              <th>Saving</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.totalsaving_data && this.totalsaving_data.length > 0) {
        this.totalsaving_data.forEach((saving: any) => {
          htmlBody += `
            <tr>
              <td>${saving.savinghead || 'N/A'}</td>
              <td>${saving.saving || '0'}</td>
              <td>${saving.approval_status || 'N/A'}</td>
            </tr>
          `;
        });
      } else {
        htmlBody += `<tr><td colspan="3">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;

      // Chapter VI Components table
      htmlBody += `<div style="page-break-before: always;break-before: page; "></div>
        <h4>Chapter VI Components</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Component Name</th>
              <th>Max Limit</th>
              <th>Component Value (Declaration)</th>
              <th>Component Value (Proof)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.chaptersixcomp_data && this.chaptersixcomp_data.length > 0) {
        this.chaptersixcomp_data.forEach((comp: any) => {
          if (this.shouldDisplay(comp)) { // Assuming shouldDisplay is defined
            htmlBody += `
              <tr>
                <td>${comp.componentname || 'N/A'}</td>
                <td>${comp.max_limit || '0'}</td>
                <td>${comp.declr_amount || '0'}</td>
                <td>${comp.componentvalue || '0'}</td>
                <td>${comp.approval_status || 'N/A'}</td>
              </tr>
            `;
          }
        });
      } else {
        htmlBody += `<tr><td colspan="5">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;

      // U/S 80C Components table
      htmlBody += `<div style="page-break-before: always;break-before: page; "></div>
        <h4>U/S 80C Components</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Component Name</th>
              <th>Max Limit</th>
              <th>Component Value (Declaration)</th>
              <th>Component Value (Proof)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.us80ccomp_data && this.us80ccomp_data.length > 0) {
        this.us80ccomp_data.forEach((comp: any) => {
          htmlBody += `
            <tr>
              <td>${comp.componentname || 'N/A'}</td>
              <td>${comp.max_limit || '0'}</td>
              <td>${comp.declr_amount || '0'}</td>
              <td>${comp.componentvalue || '0'}</td>
              <td>${comp.approval_status || 'N/A'}</td>
            </tr>
          `;
        });
      } else {
        htmlBody += `<tr><td colspan="5">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;

      

      // Notes table
      htmlBody += `<div style="page-break-before: always;break-before: page; "></div>
        <h4>Note</h4>
        <table class="table">
          <thead>
            <tr>
              <th colspan="2">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px;">1</td>
              <td style="padding: 8px;">All employees are requested to keep the bills/Tax Invoice etc. on a monthly basis at their end to avail exemption under Flexi Allowances.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">2</td>
              <td style="padding: 8px;">In case of Uniform Allowance, exemption is limited to the purchase of formal clothes by the employee for himself/herself only.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">3</td>
              <td style="padding: 8px;">For claiming exemption under Driver/Fuel allowance, the vehicle should be in the name of the employee.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">4</td>
              <td style="padding: 8px;">If purchases are made online, then the bills/invoices must be supported by a delivery challan.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">5</td>
              <td style="padding: 8px;">No COD transactions will be accepted. Further, any purchases made in cash exceeding Rs. 10,000/- will not be considered.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">6</td>
              <td style="padding: 8px;">Only Bills/Invoices depicting proper particulars of items purchased will be accepted. Particulars mentioning only codes will not be accepted for exemption.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">7</td>
              <td style="padding: 8px;">All POS transactions should be supported by proper receipts. It is further requested that photocopies of such invoices be kept beforehand.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">8</td>
              <td style="padding: 8px;">LTA exemption is restricted to two times in a block of four years. The current block is 2022-2025.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">9</td>
              <td style="padding: 8px;">The LTA Form should be supported by the original boarding pass if the journey is undertaken by Air.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">10</td>
              <td style="padding: 8px;">While purchasing, please ensure to collect Tax invoices and proof of payment.</td>
            </tr>
          </tbody>
        </table>
      `;

      // Call the PDF generation service
      this._ReportService.generatePdfByCode({
        "htmlBody": htmlBody
      }).subscribe((pdfRes: any) => {
      if (pdfRes.statusCode) {
        const byteCharacters = atob(pdfRes.commonData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const file = new Blob([byteArray], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        

        

        // ✅ Set the iframe's src instead of downloading
        const iframe = document.getElementById('pdfViewer') as HTMLIFrameElement;
        if (iframe) {
          iframe.src = fileURL;
        } else {
          console.error('iframe with id="pdfViewer" not found');
        }

      } else {
        console.error('PDF generation failed:', pdfRes.message);
      }

      //this.closeTaxProjection();

    }, (error: any) => {
      console.error('PDF generation error:', error);
    });
    } else {
      console.error('Failed to fetch tax projection data:', resData.message);
    }
  });
  }

  shouldDisplay(income: any): boolean {
    const investment_id = income?.investment_id;
    const declr_amount = income?.declr_amount;
  
    // Check if the counterpart is declared (used for hiding logic)
    const hasDeclared = (id: number) =>
      this.chaptersixcomp_data?.some((comp: any) => comp.investment_id === id && comp.declr_amount > 0);
  
    // Mutual exclusion based on declared amount
    if (investment_id === 2 && hasDeclared(3)) return false;
    if (investment_id === 3 && hasDeclared(2)) return false;
  
    if (investment_id === 7 && hasDeclared(8)) return false;
    if (investment_id === 8 && hasDeclared(7)) return false;
  
    if (investment_id === 17 && hasDeclared(18)) return false;
    if (investment_id === 18 && hasDeclared(17)) return false;
  
    // Always show if this component has any declared amount
    if (declr_amount && declr_amount > 0) return true;
  
    // Parent Senior Citizen
    if (this.parentSeniorCitizenChecked && investment_id === 3) return true;
    if (!this.parentSeniorCitizenChecked && investment_id === 2) return true;
  
    // Disability More Than 80%
    if (this.disabilityMoreThan80Checked && investment_id === 8) return true;
    if (!this.disabilityMoreThan80Checked && investment_id === 7) return true;
  
    // Employee With Severe Disability
    if (this.employeeWithSevereDisabilityChecked && investment_id === 18) return true;
    if (!this.employeeWithSevereDisabilityChecked && investment_id === 17) return true;
  
    // Unaffected IDs
    if (![2, 3, 7, 8, 17, 18].includes(investment_id)) return true;
  
    // Default: hide
    return false;
  }

   getCurrentFinancialYear(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // getMonth() returns 0–11

    if (month >= 4) {
      // April or later: current FY is current year - next year
      return `${year}-${year + 1}`;
    } else {
      // Jan–Mar: FY started last year
      return `${year - 1}-${year}`;
    }
  }

}
