import { Component, ElementRef, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import decode from 'jwt-decode';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
@Component({
  selector: 'app-loan-outstanding-report',
  templateUrl: './loan-outstanding-report.component.html',
  styleUrls: ['./loan-outstanding-report.component.css']
})
export class LoanOutstandingReportComponent {
  @ViewChild('reportTable', { static: false }) reportTable!: ElementRef;
  isShowRoundedVal: boolean = false;
  tp_account_id: any = '';
  filteredEmployees: any = [];
  data: any = [];
  p: number = 0;
  invKey: any;
  token: any = '';
  showSidebar: boolean = true;
  employer_name: any = '';
  currentDate: any;
  product_type: any;
  currentDateString: any;
  loan_data: any = [];
  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private _alertservice: AlertService
  ) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
    // console.log(this.currentDateString);
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.employer_name = this.token.name;
    this.tp_account_id = this.token.tp_account_id;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');

    this.GetLoan_Report();
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  search(key: any) {
    this.invKey = key.target.value;
    this.p = 0;
    this.filteredEmployees = this.loan_data.filter(function (element: any) {
      return (element.orgempcode.toLowerCase().includes(key.target.value.toLowerCase())
        || element.cjcode.toLowerCase().includes(key.target.value.toLowerCase()) || element.emp_name.toLowerCase().includes(key.target.value.toLowerCase()) || element.loan_number.toLowerCase().includes(key.target.value.toLowerCase()) || element.loan_amount.toLowerCase().includes(key.target.value.toLowerCase())
      )
    });
  }
  // GetLoanReport
  GetLoan_Report() {
    this._ReportService.GetLoanReport({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.loan_data = resData.commonData;
          this.filteredEmployees = this.loan_data;
          // console.log(this.loan_data);
          // this.toastr.success(resData.message, 'Success');
        } else {
          // console.log(resData.message);
          this.filteredEmployees = [];
          this.loan_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  exportToExcel() {
    this._ReportService.GetLoanReport({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = resData.commonData;
        // console.log(this.data);
        let exportData = [];
        let days = {};
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          // + resData.commonData[i].dayname;
          days = {
            ...days, [head]: ''
          }
        }


        for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
          const orgEmpCode = this.filteredEmployees[idx]?.orgempcode;
          const tpcode = this.filteredEmployees[idx]?.cjcode;
          const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
          let obj = {
            'TP / Org Emp Code': tpOrgEmpCode,
            'Employee Name': this.filteredEmployees[idx].emp_name,
            'Loan Number': this.filteredEmployees[idx].loan_number,
            'Loan Amount': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].loan_amount) : this.getRoundedVal(this.filteredEmployees[idx].loan_amount)),

            'Opening Balance Amount':
              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].opening_balance_amount) : this.getRoundedVal(this.filteredEmployees[idx].opening_balance_amount)),

            'Installment Amount':
              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].installment_amount) : this.getRoundedVal(this.filteredEmployees[idx].installment_amount)),

            'Principal Paid':
              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].principal_paid) : this.getRoundedVal(this.filteredEmployees[idx].principal_paid)),

            'Paid In Period': this.filteredEmployees[idx].paid_in_period,

            'Principal Balance':
              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].principal_balance) : this.getRoundedVal(this.filteredEmployees[idx].principal_balance)),

            'Pending Installments': this.filteredEmployees[idx].pending_installments,
            'Disbursement Date': this.filteredEmployees[idx].disbursment_date,
            'Loan Sanction Date': this.filteredEmployees[idx].loan_sanction_date,
            'Start Date': this.filteredEmployees[idx].start_date,
            'End Date': this.filteredEmployees[idx].end_date,
            'Recent Payment Date': this.filteredEmployees[idx].recent_payment_date,

          }
          exportData.push(obj);
        }
        // console.log(exportData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = 'Loan_Outstanding_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
      }
    })
  }

  exportToPdf(pdfName, title) {
    //pre-attendace-table
    if (this.reportTable) {
      //const tableHtml = this.preAttendaceRef.nativeElement.outerHTML;
      const tableElement = this.reportTable.nativeElement.cloneNode(true) as HTMLElement;
      this.removeComments(tableElement);
      let tableHtml = `<style>.table {
  border: 1px solid black;
  border-collapse: collapse;
}
.table th, 
.table td {
  border: 1px solid black;
  padding: 8px;
}</style>`;
      tableHtml += '<p style="text-align:center;"><b>' + title + '</b></p>';
      tableHtml += tableElement.outerHTML;
      this._ReportService.generatePdfByCode({
        "htmlBody": tableHtml
      }).subscribe((resData: any) => {
        if (resData.statusCode == true) {
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
          a.download = pdfName;
          a.click();
          URL.revokeObjectURL(fileURL);
        }
      })
      console.log('Clean Table HTML:', tableHtml);


    }


  }

  private removeComments(element: HTMLElement) {
    const iterator = document.createNodeIterator(element, NodeFilter.SHOW_COMMENT, null);
    let commentNode;
    while ((commentNode = iterator.nextNode())) {
      commentNode.parentNode?.removeChild(commentNode);
    }
  }
  getRoundedVal(val: any) {
    return (val ? Math.round(val) : '0');
  }
  truncateToTwoDecimals(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }

    const numericValue = Number(value);
    return (Math.floor(numericValue * 100) / 100).toFixed(2);
  }
}
