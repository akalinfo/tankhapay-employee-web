import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { VisitorService } from '../../visitor/visitor.service';
import { ReportService } from '../report.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import decode from 'jwt-decode';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-expenses-report',
  templateUrl: './expenses-report.component.html',
  styleUrls: ['./expenses-report.component.css']
})
export class ExpensesReportComponent {
  @ViewChild('reportTable', { static: false }) reportTable!: ElementRef;
  isShowRoundedVal: boolean = false;
  showSidebar: boolean = false;
  isSideActive = false;
  financialYears = [];
  monthYear = [];
  token: any = '';
  tp_account_id: any = '';
  ouUnits: any = [];
  selectedUnitId: any = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'unitid',
    textField: 'unitname',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    allowSearchFilter: true,
    enableCheckAll: true,
    itemsShowLimit: 5,
  };

  fromMonthYear = '';
  toMonthYear = '';
  expenseSearchForm: FormGroup;
  productType: any = '';
  expenseDetails: any = '';
  ouNames: any = "";

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _ReportService: ReportService,
    private _BusinesSettingsService: BusinesSettingsService,
    private _EncrypterService: EncrypterService,) {

  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.productType = this.token.product_type;
    this.expenseSearchForm = this._formBuilder.group({
      fromMonYr: ['', [Validators.required]],
      toMonYr: [''],
      ouIds: [''],
      financialYear: ['']
    })

    this.generateFinancialYears();
    this.get_geo_fencing_list();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  toggleSidebar() {
    this.isSideActive = !this.isSideActive;
  }

  generateFinancialYears() {
    const startYear = 2022;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // January = 0

    let endYear = currentYear;
    if (currentMonth <= 3) {
      endYear = currentYear - 1;
    }

    for (let year = startYear; year <= endYear; year++) {
      this.financialYears.push(`${year}-${year + 1}`);
    }

    //this.fromMonthYear = postData.fromMonYr;
    //this.toMonthYear = postData.toMonYr;

    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    let firstYr = currentYear;
    let lastYr = currentYear;
    if ((new Date().getMonth() + 1) < 4) {
      firstYr = currentYear - 1;
    }
    lastYr = firstYr + 1;
    /*if(month == '01'){
      this.fromMonthYear='Jan-'+lastYr;
    }
    if(month == '02'){
      console.log(month)
      this.fromMonthYear='Feb-'+lastYr;
    }
    if(month == '03'){
      this.fromMonthYear='Mar-'+lastYr;
    }
    if(month == '04'){
      this.fromMonthYear='Apr-'+firstYr;
    }
    if(month == '05'){
      this.fromMonthYear='May-'+firstYr;
    }
    if(month == '06'){
      this.fromMonthYear='Jun-'+firstYr;
    }
    if(month == '07'){
      this.fromMonthYear='Jul-'+firstYr;
    }
    if(month == '08'){
      this.fromMonthYear='Aug-'+firstYr;
    }
    if(month == '09'){
      this.fromMonthYear='Sep-'+firstYr;
    }
    if(month == '10'){
      this.fromMonthYear='Oct-'+firstYr;
    }
    if(month == '11'){
      this.fromMonthYear='Nov-'+firstYr;
    }
    if(month == '12'){
      this.fromMonthYear='Dec-'+firstYr;
    }*/

    this.fromMonthYear = 'Apr-' + firstYr;
    this.toMonthYear = 'Mar-' + lastYr;

    this.expenseSearchForm.patchValue({
      'financialYear': this.financialYears[(this.financialYears.length) - 1]
    })
    this.financialYearFun(this.expenseSearchForm.value.financialYear);
  }

  changeFinancialYear($event) {
    let selectFinancialYear = $event.target.value;
    selectFinancialYear = selectFinancialYear.split('-');
    if (selectFinancialYear.length > 1) {
      this.monthYear = [
        {
          "key": "",
          "name": "Please Select Month"
        },
        {
          "key": "Apr-" + selectFinancialYear[0],
          "name": "April-" + selectFinancialYear[0]
        },
        {
          "key": "May-" + selectFinancialYear[0],
          "name": "May-" + selectFinancialYear[0]
        },
        {
          "key": "Jun-" + selectFinancialYear[0],
          "name": "June-" + selectFinancialYear[0]
        },
        {
          "key": "Jul-" + selectFinancialYear[0],
          "name": "July-" + selectFinancialYear[0]
        },
        {
          "key": "Aug-" + selectFinancialYear[0],
          "name": "August-" + selectFinancialYear[0]
        },
        {
          "key": "Sep-" + selectFinancialYear[0],
          "name": "September-" + selectFinancialYear[0]
        },
        {
          "key": "Oct-" + selectFinancialYear[0],
          "name": "October-" + selectFinancialYear[0]
        },
        {
          "key": "Nov-" + selectFinancialYear[0],
          "name": "November-" + selectFinancialYear[0]
        },
        {
          "key": "Dec-" + selectFinancialYear[0],
          "name": "December-" + selectFinancialYear[0]
        },
        {
          "key": "Jan-" + selectFinancialYear[1],
          "name": "January-" + selectFinancialYear[1]
        },
        {
          "key": "Feb-" + selectFinancialYear[1],
          "name": "February-" + selectFinancialYear[1]
        },
        {
          "key": "Mar-" + selectFinancialYear[1],
          "name": "March-" + selectFinancialYear[1]
        }
      ]
    }
  }

  financialYearFun(value1) {
    let selectFinancialYear = value1;
    selectFinancialYear = selectFinancialYear.split('-');
    if (selectFinancialYear.length > 1) {
      this.monthYear = [
        {
          "key": "",
          "name": "Please Select Month"
        },
        {
          "key": "Apr-" + selectFinancialYear[0],
          "name": "April-" + selectFinancialYear[0]
        },
        {
          "key": "May-" + selectFinancialYear[0],
          "name": "May-" + selectFinancialYear[0]
        },
        {
          "key": "Jun-" + selectFinancialYear[0],
          "name": "June-" + selectFinancialYear[0]
        },
        {
          "key": "Jul-" + selectFinancialYear[0],
          "name": "July-" + selectFinancialYear[0]
        },
        {
          "key": "Aug-" + selectFinancialYear[0],
          "name": "August-" + selectFinancialYear[0]
        },
        {
          "key": "Sep-" + selectFinancialYear[0],
          "name": "September-" + selectFinancialYear[0]
        },
        {
          "key": "Oct-" + selectFinancialYear[0],
          "name": "October-" + selectFinancialYear[0]
        },
        {
          "key": "Nov-" + selectFinancialYear[0],
          "name": "November-" + selectFinancialYear[0]
        },
        {
          "key": "Dec-" + selectFinancialYear[0],
          "name": "December-" + selectFinancialYear[0]
        },
        {
          "key": "Jan-" + selectFinancialYear[1],
          "name": "January-" + selectFinancialYear[1]
        },
        {
          "key": "Feb-" + selectFinancialYear[1],
          "name": "February-" + selectFinancialYear[1]
        },
        {
          "key": "Mar-" + selectFinancialYear[1],
          "name": "March-" + selectFinancialYear[1]
        }
      ]
    }
    this.expenseSearchForm.patchValue({
      'fromMonYr': this.fromMonthYear,
      'toMonYr': this.toMonthYear
    })
    this.filterExpenseReport();
  }


  get_geo_fencing_list() {
    this._BusinesSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllOUsForCustomer",
      "searchKeyword": ''
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        this.ouUnits = resData.commonData;
        this.ouUnits = this.ouUnits.map(item => ({
          unitname: item.org_unit_name,  // Use org_unit_name for unitname
          unitid: item.id                // Keep the ID for later use if needed
        }));
      }

    }, (error: any) => {
      this.ouUnits = [];
    });
  }

  filterExpenseReport() {

    let postData = this.expenseSearchForm.value;
    this.fromMonthYear = postData.fromMonYr;
    // console.log(postData)
    this.toMonthYear = postData.toMonYr;
    this.ouNames = postData.ouIds
    let unitName = '';
    if (this.ouNames && this.ouNames.length > 0) {
      unitName = this.ouNames.map(unit => unit.unitname).join(",");
    }
    this.ouNames = unitName;
    this.getExpenseReport();
  }

  getExpenseReport() {
    this._BusinesSettingsService.getExpenseReport(
      ({
        "startPeriod": this.fromMonthYear,
        "endPeriod": this.toMonthYear,
        "customerAccountId": this._EncrypterService.aesEncrypt((this.tp_account_id).toString()),
        "productTypeId": this._EncrypterService.aesEncrypt((this.productType).toString()),
        "ouNames": this.ouNames
      })
    ).subscribe(
      (resData: any) => {
        if (resData.statusCode == true) {
          this.isSideActive = false;
          this.expenseDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        }
        else {
          this.toastr.error(resData.message, 'Oops!');
          this.expenseDetails = [];
        }
      }, (error: any) => {
        this.toastr.error(error.error.message, 'Oops!');
        this.expenseDetails = [];
      })
  }

  exportToExcel() {
    let exportData = [];
    for (let i = 0; i < this.expenseDetails.length; i++) {
      let obj = {
        'Expense ID': i + 1,
        "Date": this.expenseDetails[i].expansedate,
        'Category': this.expenseDetails[i].category,
        'OU': this.expenseDetails[i].ou,
        'Amount (₹)':
          (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.expenseDetails[i].amount) : this.getRoundedVal(this.expenseDetails[i].amount)),
      }
      exportData.push(obj);
    }

    exportData.push({
      'Expense ID': '',
      'Date': '',
      'Category': '',
      'OU': 'Total',
      'Amount (₹)':
        (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.getTotalAmount()) : this.getRoundedVal(this.getTotalAmount())),
    });


    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    downloadLink.download = `expense_report_${day}-${month}-${year}.xlsx`;
    downloadLink.click();

  }

  reloadPage() {
    window.location.reload();
  }

  getTotalAmount(): number {
    return this.expenseDetails.reduce((total, exp) => total + Number(exp.amount), 0);
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
