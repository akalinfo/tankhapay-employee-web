import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import * as XLSX from 'xlsx';
import { grooveState, dongleState } from 'src/app/app.animation';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { TdsReportService } from './tds-report.service';
declare var $: any;

import { Observable, of } from 'rxjs';

// Inline interfaces
interface TdsReport {
  deducteeName: string;
  pan: string;
  amount: number;
  tdsDeducted: number;
  section: string;
  date: string;
}

interface ReportType {
  value: string;
  label: string;
}

interface ReportPeriod {
  value: string;
  label: string;
}

@Component({
  selector: 'app-tds-report',
  templateUrl: './tds-report.component.html',
  styleUrls: ['./tds-report.component.css'],
  animations: [grooveState, dongleState]
})
export class TdsReportComponent {
  @ViewChild('reportTable', { static: false }) reportTable!: ElementRef;

  showSidebar: boolean = true;
  token: any;
  employer_name: any;
  tp_account_id: any;
  product_type: string;
  tdsData : any = [];

  reportTypes: ReportType[] = [
    { value: 'Monthly', label: 'Monthly Report' },
    { value: 'Quarterly', label: 'Quarterly Report' },
    { value: 'Annually', label: 'Annually Report' }
  ];
  periods: ReportPeriod[] = [];
  reportData$: Observable<TdsReport[]> = of([]);
  displayedColumns: string[] = ['deducteeName', 'pan', 'amount', 'tdsDeducted', 'section', 'date'];
  form: FormGroup;
  financialYears: string[] = [];

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private fb: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private _alertservice: AlertService,
    private sanitizer: DomSanitizer,
    private tdsReportService: TdsReportService) {
       this.form = this.fb.group({
      reportType: ['Monthly'],
      period: [''],
      financialYears:['']
    });
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.employer_name = this.token.name;
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.updatePeriods();
    this.form.get('reportType')?.valueChanges.subscribe(() => {
      this.updatePeriods();
      this.form.get('period')?.setValue('');
    });
    this.generateFinancialYears();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

 private updatePeriods(): void {
    const reportType = this.form.get('reportType')?.value;
    if (reportType === 'Monthly') {
      this.periods = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' }
      ];
    } else {
      this.periods = [
        { value: '1', label: 'Quarter 1 (Apr-Jun)' },
        { value: '2', label: 'Quarter 2 (Jul-Sep)' },
        { value: '3', label: 'Quarter 3 (Oct-Dec)' },
        { value: '4', label: 'Quarter 4 (Jan-Mar)' }
      ];
    }
  }

  generateReport() {
    let post = this.form.value;

    if (!post.reportType) {
      this.toastr.error('Please select Report Type', 'Validation Error');
      return;
    }
    if (!post.period && (post.reportType).toString() != 'Annually') {
      this.toastr.error('Please select Period', 'Validation Error');
      return;
    }
    if (!post.financialYears) {
      this.toastr.error('Please select Financial Year', 'Validation Error');
      return;
    }

    const payload = {
      financialYear: (post.financialYears).toString(),
      reportType: (post.reportType).toString(),
      period: ((post.reportType).toString() != 'Annually')?(post.period).toString():'0',
      customerAccountId: (this.tp_account_id).toString() // This can also be dynamic if needed
    };

    this.getTdsReportData(payload);
  }

  downloadReport(format: 'pdf' | 'excel'): void {
    const { reportType, period } = this.form.value;
    this.tdsReportService.downloadReport(reportType, period, format).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tds-report-${reportType}-${period}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  getTdsReportData(payload){
    this.tdsData = [];
    this._ReportService.getTdsReportData(payload).subscribe((resData: any) => {
      if(resData.statusCode == true){
        this.tdsData = this._EncrypterService.aesDecrypt(resData.commonData); 
        this.tdsData = JSON.parse(this.tdsData);
      }
    });
  }

  generateFinancialYears() {
    const startYear = 2020;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // January is 0

    const endYear = currentMonth >= 4 ? currentYear : currentYear - 1;

    this.financialYears = []; // clear existing array if needed

    for (let year = endYear; year >= startYear; year--) {
      this.financialYears.push(`${year}-${year + 1}`);
    }
  }


  exportToPdf(pdfName, title) {
    if (this.reportTable) {
      const clonedTable = this.reportTable.nativeElement.cloneNode(true) as HTMLElement;
      this.removeComments(clonedTable); // Keep your existing comment removal logic

      // Remove the first column from the header
      const headerRow = clonedTable.querySelector('thead tr');
      if (headerRow) {
        (headerRow as HTMLTableRowElement).deleteCell(0);
      }

      // Remove the first column from each body row
      const bodyRows = clonedTable.querySelectorAll('tbody tr');
      bodyRows.forEach(row => {
        (row as HTMLTableRowElement).deleteCell(0);
      });


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
      tableHtml += clonedTable.outerHTML;  // Use the cloned table here

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
      });
      // console.log('Clean Table HTML:', tableHtml);

    }
  }

  private removeComments(element: HTMLElement) {
    const iterator = document.createNodeIterator(element, NodeFilter.SHOW_COMMENT, null);
    let commentNode;
    while ((commentNode = iterator.nextNode())) {
      commentNode.parentNode?.removeChild(commentNode);
    }
  }

  exportToExcelTable() {
        let table = document.getElementById('reportTable');
        if (!table) {
          console.error('Table not found!');
          return;
        }
        // Convert table to a worksheet
    
        let worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
    
    
        // Create a new workbook and add the worksheet
        let workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        // Save the Excel file
        XLSX.writeFile(workbook, 'TDS_Report'+'.xlsx');
  }

}