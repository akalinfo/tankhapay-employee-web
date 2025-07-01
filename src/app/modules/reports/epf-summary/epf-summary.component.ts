import { Component } from '@angular/core';
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
  selector: 'app-epf-summary',
  templateUrl: './epf-summary.component.html',
  styleUrls: ['./epf-summary.component.css']
})
export class EpfSummaryComponent {
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
  showfields: any;

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
  selectedDynmicColumnValues: any[] = [];


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

    this.intialize_show_fields();

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
    this.getColumnValues();
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  hideshowfields(e: any, field: any) {
    this.showfields[field.value] = e.target.checked;
    if (e.target.checked) {
      // Add field value if checked
      if (!this.selectedDynmicColumnValues.includes(field.value)) {
        this.selectedDynmicColumnValues.push(field.value);
      }
    } else {
      // Remove field value if unchecked
      this.selectedDynmicColumnValues = this.selectedDynmicColumnValues.filter(val => val !== field.value);
    }
    // console.log(this.selectedDynmicColumnValues, 'this.selectedDynmicColumnValues')
  }

  fieldshowdata(name: any) {
    return this.showfields[name] ? 'checked' : null;
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

    this.selectedDynmicColumnValues = [];

  }

  search() {
    let search_term = this.invKey.toLowerCase();
    this.p = 0;
    this.filteredEmployees = this.data.filter(function (element: any) {
      return (element.emp_code.toString()?.toLowerCase().includes(search_term) ||
        element?.member_name?.toLowerCase()?.includes(search_term) ||
        element?.orgempcode?.toLowerCase()?.includes(search_term) ||
        element?.tpcode?.toLowerCase()?.includes(search_term)
      )
    });
  }

  Displayepfecr() {
    this._ReportService.DisplayepfecrreportMonthWiseApi({
      "year": this.year,
      "month": this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "ReportType": "ND",
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      console.log(resData);
      console.log(resData.commonData);
      if (resData.statusCode) {
        this.data = resData.commonData;
        this.filteredEmployees = JSON.parse(JSON.stringify(this.data));
        this.apiSuccess = true;
        this.invKey = '';
        // console.log(this.data);
        // this.toastr.success(resData.message, 'Success');
      } else {
        this.filteredEmployees = [];
        this.apiSuccess = false;
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }
  confirmation() {
    this.message = window.confirm('Are you sure you want to process Report?.');
    // console.log(this.message);

    if (this.message) {
      this.DownloadCompilance_Report();
    }
    else {
      window.close();
    }
  }

  DownloadCompilance_Report() {
    // alert('Are you sure you want to process Report?.');

    this._ReportService.DownloadCompilanceReport({
      "year": this.year,
      "month": this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "userId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "compliancesFlag": "EPF",
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.ESIC_Challan = resData.commonData;
        // console.log(this.ESIC_Challan);
        let exportData = [];
        let days = {};
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          // + resData.commonData[i].dayname;
          days = {
            ...days, [head]: ''
          }
        }
        for (let idx = 0; idx < this.ESIC_Challan.length; idx++) {
          let obj = {
            'Emp Code': this.ESIC_Challan[idx].emp_code,
            'UAN': this.ESIC_Challan[idx].uan,
            'MEMEBER NAME': this.ESIC_Challan[idx].member_name,
            'GROSS WAGES': this.ESIC_Challan[idx].grossearning,
            'EPF WAGES': this.ESIC_Challan[idx].epf_wages,
            'EPF CONTRI REMITTED': this.ESIC_Challan[idx].epf_contri_remitted,
            'EPS CONTRI REMITTED': this.ESIC_Challan[idx].eps_contri_remitted,
            'EPF EPS CONTRI REMITTED': this.ESIC_Challan[idx].epf_eps_diff_remitted,
            'NCP DAYS': this.ESIC_Challan[idx].ncp_days,
            'REFUND OF ADVANCES': this.ESIC_Challan[idx].refund_of_advances,
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
        downloadLink.download = 'EPF_Summary_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
        this.Displayepfecr();
      }
    })
  }

  exportToExcel() {
    let exportData = [];
    /*this._ReportService.DisplayepfecrreportMonthWiseApi({
      "year": this.year,
      "month": this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "ReportType": "ND",
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
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
*/
    this.data = this.filteredEmployees;
    if (!this.includeEmployeeDetails) {

      for (let idx = 0; idx < this.data.length; idx++) {
        const orgEmpCode = this.data[idx]?.orgempcode;
        const tpcode = this.data[idx]?.tpcode;
        const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
        let obj = {
          'TP / Org Emp Code': tpOrgEmpCode,

          'Gross Wages': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),

          'EPF Wages': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].epf_wages) : this.getRoundedVal(this.filteredEmployees[idx].epf_wages)),

          'EPS Wages': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].eps_wages) : this.getRoundedVal(this.filteredEmployees[idx].eps_wages)),

          'VPF': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].vpf) : this.getRoundedVal(this.filteredEmployees[idx].vpf)),

          'EDLI Wages': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].edli_wages) : this.getRoundedVal(this.filteredEmployees[idx].edli_wages)),

          'EPF Contri Remitted': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].epf_contri_remitted) : this.getRoundedVal(this.filteredEmployees[idx].epf_contri_remitted)),

          'EPS Contri Remitted': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].eps_contri_remitted) : this.getRoundedVal(this.filteredEmployees[idx].eps_contri_remitted)),

        }
        let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
        exportFields.forEach(field => {
          obj[field.name] = this.data[idx][field.value];
        });

        exportData.push(obj);
      }
    }

    else {

      for (let idx = 0; idx < this.data.length; idx++) {
        const orgEmpCode = this.data[idx]?.orgempcode;
        const tpcode = this.data[idx]?.tpcode;
        const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
        let obj = {

          'TP / Org Emp Code': tpOrgEmpCode,
          'UAN': this.data[idx].uan,
          'Member Name': this.data[idx].member_name,

          'Gross Wage': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),

          'EPF Wages': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].epf_wages) : this.getRoundedVal(this.filteredEmployees[idx].epf_wages)),

          'EPS Wages': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].eps_wages) : this.getRoundedVal(this.filteredEmployees[idx].eps_wages)),

          'EDLI Wages': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].edli_wages) : this.getRoundedVal(this.filteredEmployees[idx].edli_wages)),

          'EPF Contri Remitted': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].epf_contri_remitted) : this.getRoundedVal(this.filteredEmployees[idx].epf_contri_remitted)),

          'EPS Contri Remitted': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].eps_contri_remitted) : this.getRoundedVal(this.filteredEmployees[idx].eps_contri_remitted)),

          'EPF EPS Diff Remitted': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].epf_eps_diff_remitted) : this.getRoundedVal(this.filteredEmployees[idx].epf_eps_diff_remitted)),

          'NCP Days': this.data[idx].ncp_days,
          'Refund of Advances': this.data[idx].refund_of_advances,
          'Salary Status': this.data[idx].wagestatus,
          'VPF': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].vpf) : this.getRoundedVal(this.filteredEmployees[idx].vpf)),
          'Downloaded Batch': this.data[idx].downloadedon,
          'Downloaded By': this.data[idx].downloadedby

        }
        exportData.push(obj);
      }
    }
    // console.log(exportData);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    let date = new Date()
    downloadLink.download = 'EPF_Summary_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
    downloadLink.click();
    //   }
    // })
  }

  exportToExcel_as_csv() {
    this._ReportService.DisplayepfecrreportMonthWiseApi({
      "year": this.year,
      "month": this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "ReportType": "ND",
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = resData.commonData;
        let exportData = [];

        if (!this.includeEmployeeDetails) {
          for (let idx = 0; idx < this.data.length; idx++) {
            let obj = [
              // this.data[idx].emp_code,

              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),


              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].epf_wages) : this.getRoundedVal(this.filteredEmployees[idx].epf_wages)),


              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].eps_wages) : this.getRoundedVal(this.filteredEmployees[idx].eps_wages)),


              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].vpf) : this.getRoundedVal(this.filteredEmployees[idx].vpf)),


              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].edli_wages) : this.getRoundedVal(this.filteredEmployees[idx].edli_wages)),


              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].epf_contri_remitted) : this.getRoundedVal(this.filteredEmployees[idx].epf_contri_remitted)),

              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].eps_contri_remitted) : this.getRoundedVal(this.filteredEmployees[idx].eps_contri_remitted)),

            ];
            exportData.push(obj.join('#~#'));
          }
        } else {
          for (let idx = 0; idx < this.data.length; idx++) {
            let obj = [
              // this.data[idx].emp_code,
              this.data[idx].uan,
              this.data[idx].member_name,

              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),

              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].epf_wages) : this.getRoundedVal(this.filteredEmployees[idx].epf_wages)),

              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].eps_wages) : this.getRoundedVal(this.filteredEmployees[idx].eps_wages)),

              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].edli_wages) : this.getRoundedVal(this.filteredEmployees[idx].edli_wages)),


              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].epf_contri_remitted) : this.getRoundedVal(this.filteredEmployees[idx].epf_contri_remitted)),

              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].eps_contri_remitted) : this.getRoundedVal(this.filteredEmployees[idx].eps_contri_remitted)),

              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].epf_eps_diff_remitted) : this.getRoundedVal(this.filteredEmployees[idx].epf_eps_diff_remitted)),

              this.data[idx].ncp_days,

              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].refund_of_advances) : this.getRoundedVal(this.filteredEmployees[idx].refund_of_advances)),


              // this.data[idx].wagestatus,


              (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.data[idx].vpf) : this.getRoundedVal(this.filteredEmployees[idx].vpf)),

              // this.data[idx].downloadedon,
              // this.data[idx].downloadedby
            ];
            exportData.push(obj.join('#~#'));
          }
        }

        const csvData = exportData.map(row => row.replace(/#~#$/, '')).join('\n');
        const blob = new Blob([csvData], { type: 'text/csv' });
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        let date = new Date();
        downloadLink.download = 'EPF_Summary_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.csv';
        downloadLink.click();
      }
    });
  }


  applyFilters(filters: any) {
    this.month = filters.month;
    this.year = filters.year;
    this.Displayepfecr();
  }

  SaveColumnValues() {
    if (this.selectedDynmicColumnValues.length > 0) {
      this._ReportService.manage_report_columns_wfm({
        "action": "save_report_columns",
        "report_name": "epf summary",
        "accountid": this.tp_account_id.toString(),
        "report_description": "EPF Summary Reports",
        "report_column_text": this.selectedDynmicColumnValues,
        "productTypeId": this.product_type
      }).subscribe((resData: any) => {
        // if (resData.statusCode) {
        this.toastr.success(resData.commonData.msg);
        this.getColumnValues();

      });
    }
    else {
      this.toastr.info('Please select  column to display');
    }

  }

  getColumnValues() {
    this.selectedDynmicColumnValues = [];
    this.intialize_show_fields();

    // console.log('getColumnValues');
    // if (this.selectedDynmicColumnValues.length > 0) {
    this._ReportService.manage_report_columns_wfm({
      "action": "get_report_columns",
      "report_name": "epf summary",
      "accountid": this.tp_account_id.toString(),
      "productTypeId": this.product_type
    }).subscribe((resData: any) => {
      // if (resData.statusCode) {
      // this.toastr.success(resData.msg);
      if (resData.statusCode) {
        this.selectedDynmicColumnValues = JSON.parse(resData.commonData[0]?.report_column_text);

        this.selectedDynmicColumnValues.forEach((el: any) => {
          this.showfields[el] = true
        })
      }

      console.log(this.selectedDynmicColumnValues, this.showfields);

    });


  }

  intialize_show_fields() {
    this.showfields = {
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
