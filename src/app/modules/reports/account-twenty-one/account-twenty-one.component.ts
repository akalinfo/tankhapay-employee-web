import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import * as XLSX from 'xlsx';
import { ReportService } from '../report.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { FilterField } from '../common-filter/filter.model';

@Component({
  selector: 'app-account-twenty-one',
  templateUrl: './account-twenty-one.component.html',
  styleUrls: ['./account-twenty-one.component.css']
})
export class AccountTwentyOneComponent {
  @ViewChild('reportTable', { static: false }) reportTable!: ElementRef;
  isShowRoundedVal: boolean = false;
  currentDate: any;
  currentDateString: any;
  payout_date: any;
  cur_payout_day: string = '';
  employer_profile: any = [];
  employer_name: any = '';
  showSidebar: boolean = true;
  product_type: any;
  data: any = [];
  ESIC_Challan: any = [];
  apiSuccess: boolean = false;
  includeEmployeeDetails: boolean = false;
  month: any;
  days_count: any;
  p: number = 0;
  invKey: any;
  filteredEmployees: any = [];
  year: any;
  selected_date: any;
  monthsArray: any = [
    {
      'id': '1',
      'month': 'January',
    },
    {
      'id': '2',
      'month': 'February',
    },
    {
      'id': '3',
      'month': 'March',
    },
    {
      'id': '4',
      'month': 'April',
    },
    {
      'id': '5',
      'month': 'May',
    },
    {
      'id': '6',
      'month': 'June',
    },
    {
      'id': '7',
      'month': 'July',
    },
    {
      'id': '8',
      'month': 'August',
    },
    {
      'id': '9',
      'month': 'September',
    },
    {
      'id': '10',
      'month': 'October',
    },
    {
      'id': '11',
      'month': 'November',
    },
    {
      'id': '12',
      'month': 'December',
    }
  ];
  message: any;
  showfields: any = {
    // grossearning: false,
    member_name: false,
    S_No: false,
    //  gross_esi_income: false,
    //  eps_contri_remitted: false,
    //  lastworkingday: false,
    eps_wages: false,
    //  edli_wages: false,
    wagestatus: false,
    uan: false,
    //  epf_wages: false,
    //  esinumber:false,
    //  epf_contri_remitted: false,
    epf_eps_diff_remitted: false,
    ncp_days: false,
    refund_of_advances: false,
    //  vpf: false,
    downloadedon: false,
    downloadedby: false,

  };
  fieldarray: any = [
    { name: 'S No.', value: 'S_No' },
    { name: 'UAN', value: 'uan' },
    // { name: 'Epf wages', value: 'epf_wages' },
    // { name: 'gross esi income', value: 'gross_esi_income' },
    // { name: 'eps contri remitted', value: 'eps_contri_remitted' },
    // { name: 'Lastworkingday', value: 'lastworkingday' },
    { name: 'Member Name', value: 'member_name' },
    //  { name: 'Grossearning', value: 'grossearning' },
    //  { name: 'Uan', value: 'uan' },
    { name: 'Downloaded On', value: 'downloadedon' },
    //  { name: 'Vpf', value: 'vpf' },
    { name: 'Wage Status', value: 'wagestatus' },
    //  { name: 'Edli wages', value: 'edli_wages' },
    //  { name: 'Esinumber', value: 'esinumber' },
    //  { name: 'Epf_contri_remitted', value: 'epf_contri_remitted' },
    { name: 'EPF EPS Diff Remitted', value: 'epf_eps_diff_remitted' },
    { name: 'NCP Days', value: 'ncp_days' },
    { name: 'Refund of Advances', value: 'refund_of_advances' },
    { name: 'Downloaded By', value: 'downloadedby' }
  ];
  yearsArray: any = [];
  show_label: boolean = true;
  tp_account_id: any = '';
  token: any = '';
  isSideBar: boolean = false;
  filters: FilterField[] = [];

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private _alertservice: AlertService) {
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
    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    for (let i = 2021; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);
    };

    this.selected_date = localStorage.getItem('selected_date');
    this.days_count = this.selected_date.split('-')[0];

    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];
    var checkboxes = document.querySelectorAll(
      '.dropdown-item input[type="checkbox"]'
    );
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener('click', function (event) {
        event.stopPropagation(); // Prevent click event from propagating to parent elements
      });
    });

    this.Displayepfecr();
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    // this.LiabilityReport();
  }

  changeYear(e: any) {
    this.year = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    // this.LiabilityReport();
  }

  toggleShowFields() {
    if (!this.includeEmployeeDetails) {
      // If "Include Employee Details" checkbox is checked, check all the showfields checkboxes
      Object.keys(this.showfields).forEach(key => this.showfields[key] = true);
    } else {
      // If "Include Employee Details" checkbox is unchecked, uncheck all the showfields checkboxes
      Object.keys(this.showfields).forEach(key => this.showfields[key] = false);
    }
  }

  search() {
    let search_term = this.invKey.toLowerCase();
    this.p = 0;
    this.filteredEmployees = this.data.filter(function (element: any) {
      return (element.emp_code.toString()?.toLowerCase().includes(search_term) ||
        element?.emp_name?.toLowerCase()?.includes(search_term) ||
        element?.orgempcode?.toLowerCase()?.includes(search_term) ||
        element?.tpcode?.toLowerCase()?.includes(search_term)
      )
    });
  }

  Displayepfecr() {
    this._ReportService.getAc21Report({
      "year": this.year,
      "month": this.month,
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      "productTypeId": this._EncrypterService.aesEncrypt((this.product_type).toString()),
      "action": "qr+ry+xv8EZKLRtQBfYLJw=="
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.filteredEmployees = this.data
        this.apiSuccess = true;
        this.invKey = '';
      } else {
        this.filteredEmployees = [];
        this.apiSuccess = false;
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }




  exportToExcel() {
    this.data = this.filteredEmployees;
    let exportData = [];

    for (let idx = 0; idx < this.data.length; idx++) {
      const orgEmpCode = this.data[idx]?.orgempcode;
      const tpcode = this.data[idx]?.tpcode;
      const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
      let obj = {
        'S.No': idx + 1,
        'TP / Org Emp Code': tpOrgEmpCode,
        'Member Name': this.data[idx].emp_name,
        'Account-2': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].ac2) : this.getRoundedVal(this.filteredEmployees[idx].ac2)),
        'Account-21': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].ac21) : this.getRoundedVal(this.filteredEmployees[idx].ac21)),
        'Total Admin Charges': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].total) : this.getRoundedVal(this.filteredEmployees[idx].total))
      }
      let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
      exportFields.forEach(field => {
        obj[field.name] = this.data[idx][field.value];
      });

      exportData.push(obj);
    }
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    let date = new Date()
    downloadLink.download = 'Account21_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
    downloadLink.click();
  }


  applyFilters(filters: any) {
    this.month = filters.month;
    this.year = filters.year;
    this.Displayepfecr();
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
      tableHtml += `<p style="text-align:center;"><b>${title} (${this.month}-${this.year})</b></p>`;
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
