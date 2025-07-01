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

@Component({
  selector: 'app-disbursement-report',
  templateUrl: './disbursement-report.component.html',
  styleUrls: ['./disbursement-report.component.css']
})
export class DisbursementReportComponent {
  isShowRoundedVal: boolean = false;
  @ViewChild('reportTable', { static: false }) reportTable!: ElementRef;
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

  showfields: any;

  fieldarray: any = [

    { name: 'S.No', value: 'S_No' },
    { name: 'Month', value: 'mon' },

    // Arrears
    { name: 'Arr Basic', value: 'arr_basic' },
    { name: 'Arr HRA', value: 'arr_hra' },
    // { name: 'Arr CONV', value: 'arr_conv' },
    // { name: 'Arr Medical', value: 'arr_medical' },
    { name: 'Arr Special Allowance', value: 'arr_specialallowance' },
    { name: 'Total Arrear', value: 'totalarear' },
    
    // Earnings & Allowances
    { name: 'Basic', value: 'basic' },
    { name: 'HRA', value: 'hra' },
    { name: 'Special Allowance', value: 'specialallowance' },
    { name: 'Incentive', value: 'incentive' },
    { name: 'Refund', value: 'refund' },
    { name: 'Voucher Amount', value: 'voucher_amount' },
    { name: 'Tea Allowance', value: 'tea_allowance' },
    { name: 'Monthly Bonus', value: 'monthly_bonus' },
    { name: 'Bonus', value: 'bonus' },
    { name: 'Employer ESI Contr', value: 'employer_esi_contr' },
    { name: 'Employer LWF', value: 'lwf_employer' },
    { name: 'Gratuity', value: 'gratuity' },
    { name: 'Insurance Excluded From CTC', value: 'insurancetype' },
    
    // Deductions
    { name: 'EPF', value: 'epf' },
    { name: 'VPF', value: 'vpf' },
    { name: 'ESI', value: 'esi' },
    { name: 'TDS', value: 'tds' },
    { name: 'LWF', value: 'lwf' },
    { name: 'Insurance', value: 'insurance' },
    // { name: 'Mobile', value: 'mobile' },
    { name: 'Other', value: 'other' },
    { name: 'Loan', value: 'loan' },
    { name: 'Loan Recovery', value: 'loanrecovery' },
    { name: 'Advance', value: 'advance' },
    { name: 'Advance Recovery', value: 'advancerecovery' },
    { name: 'Professional Tax', value: 'professionaltax' },
    { name: 'Charity Contribution', value: 'charity_contribution' },
    { name: 'A/c No.1', value: 'ac_1' },
    { name: 'A/c No.10', value: 'ac_10' },
    { name: 'A/c No.2', value: 'ac_2' },
    { name: 'A/c No.21', value: 'ac21' },
    { name: 'EWS', value: 'ews' },
    { name: 'Employee NPS', value: 'employeenps' }
   
  ];

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

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _ReportService: ReportService,
    private _alertservice: AlertService) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);

    this.addOnFilters.push(
      {
        key: 'report', label: '', type: 'radio', options: [
          { label: 'Summary', value: 'DisbursementSummary', id: 'summary' },
          { label: 'Details', value: 'DisbursementDetails', id: 'details' },
        ]
      }
    )
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    this.employer_name = this.token.name;
    for (let i = 2022; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);

    };
    this.selected_date = localStorage.getItem('selected_date');
    this.days_count = this.selected_date.split('-')[0];
    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];

    this.intialize_show_fields();

    var checkboxes = document.querySelectorAll(
      '.dropdown-item input[type="checkbox"]'
    );
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener('click', function (event) {
        event.stopPropagation(); // Prevent click event from propagating to parent elements
      });
    });


    this.summary = false;
    this.radio_button_value = "DisbursementDetails";
    this.Summary_Report("DisbursementDetails");
    this.getColumnValues();
  }
  isValueGreaterThanZero(key: string): boolean {
    return this.filteredEmployees.some(report => report[key] > 0);
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
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

  // hideshowfields(e: any, data: any) {
  //   if (e.target.checked) {
  //     this.showfields[data.value] = true;
  //   } else {
  //     this.showfields[data.value] = false;
  //   }
  // }
  // add by ak start
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
    console.log(this.selectedDynmicColumnValues, 'this.selectedDynmicColumnValues')
  }

  fieldshowdata(name: any) {
    return this.showfields[name] ? 'checked' : null;
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

  }

  changeYear(e: any) {
    this.year = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

  }
  search(key: any) {
    this.invKey = key;
    this.p = 0;
    this.filteredEmployees = this.data_summary.filter(function (element: any) {

      return (element.empname.toLowerCase().includes(key.toLowerCase())
        || element.employeecode.toString().toLowerCase().includes(key.toLowerCase()) ||
        element.orgempcode?.toString().toLowerCase().includes(key.toLowerCase()) ||
        element.tpcode.toString().toLowerCase().includes(key.toLowerCase())
      )
    });
  }

  onRadioChange(filter: any) {
    this.radio_button_value = filter;
    console.log(this.radio_button_value);

    if (this.radio_button_value == 'DisbursementSummary') {
      // Add this line to uncheck all the checkbox in showfield for DisbursementSummary done on 28/02/2024
      Object.keys(this.showfields).forEach(key => this.showfields[key] = false);
      this.Summary_Report(this.radio_button_value);
      this.isSideBar = false;
    }
    else {
      this.isSideBar = true;
      this.Summary_Report(this.radio_button_value);
    }

  }

  searchOnFilters(filters: any) {
    this.month = filters.month;
    this.year = filters.year;
    this.invKey = filters.invKey;
    this.selectedUnitId = filters.unitId,
      this.selectedDepartmentId = filters.departmentId,
      this.selectedDesignationId = filters.designationId,
      this.onRadioChange(filters.radioBtnVal);
  }

  Summary_Report(Action: any) {
    // add by ak 17-02-2025 start
    const unitIds = this.selectedUnitId.length === this.unit_master_list_data.length
      ? this.unit_master_list_data.map(unit => unit.unitid).join(',')
      : this.selectedUnitId.map(unit => unit.unitid).join(',');

    // Handle postingDepartment
    const postingDepartment = this.selectedDepartmentId.length === this.department_master_list_data.length
      ? this.department_master_list_data.map(dept => dept.posting_department).join(',')
      : this.selectedDepartmentId.map(dept => dept.posting_department).join(',');

    const postOffered = this.selectedDesignationId.length === this.role_master_list_data.length
      ? this.role_master_list_data.map(dept => dept.post_offered).join(',')
      : this.selectedDesignationId.map(dept => dept.post_offered).join(',');
    // add by ak 17-02-2025 end
    this.action = Action;
    this._ReportService.DisbursmentReportApi({
      "year": this.year,
      "month": this.month,
      "individualSearch": "-9999",
      "contractIdSearch": "",
      "customerAccountId": this.tp_account_id.toString(),
      "action": this.action,
      "GeoFenceId": this.token.geo_location_id,
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment
    }).subscribe((resData: any) => {
      console.log(resData);
      if (resData.statusCode) {
        this.data_summary = resData.commonData;
        this.filteredEmployees = this.data_summary;
        this.search(this.invKey);
        //this.toastr.success(resData.message, 'Success');
      } else {
        this.filteredEmployees = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        // this.toastr.error(resData.message, 'Error');
      }
    });
  }

  // Detail_Report() {
  //   this.summary = false;
  //   this._ReportService.DisbursmentReportApi({
  //     "year": this.year,
  //     "month": this.month,
  //     "individualSearch": "-9999",
  //     "contractIdSearch": "",
  //     "customerAccountId": this.tp_account_id.toString(),
  //     "action": "DisbursementDetails"
  //   }).subscribe((resData: any) => {
  //     // console.log(resData);
  //     if (resData.statusCode) {
  //       this.data = resData.commonData;
  //       //this.toastr.success(resData.message, 'Success');
  //     } else {
  //       this.data = [];
  //       this.show_label = false;
  //       this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
  //       // this.toastr.error(resData.message, 'Error');
  //     }
  //   });
  // }

  // Updated excel logic - Pankaj 03.06.2025
  // exportToExcel() {

  //       this._ReportService.DisbursmentReportApi({
  //         "year": this.year,
  //         "month": this.month,
  //         "individualSearch": "-9999",
  //         "contractIdSearch": "",
  //         "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : '',
  //         "action": this.radio_button_value == "DisbursementSummary" ? "DisbursementSummary" : "DisbursementDetails",
  //         "customerAccountId": this.tp_account_id.toString()
  //       }).subscribe((resData: any) => {
  //         if (resData.statusCode) {
  //           this.data = resData.commonData;
  //           // console.log(this.data);
  //           let exportData = [];
  //           let days = {};
  //           for (let i = 0; i < resData.commonData.length; i++) {
  //             let head = resData.commonData[i].w_date_d
  //             // + resData.commonData[i].dayname;
  //             days = {
  //               ...days, [head]: ''
  //             }
  //           }

  //           if ((!this.includeEmployeeDetails && this.radio_button_value == "DisbursementSummary") || (this.includeEmployeeDetails && this.radio_button_value == "DisbursementSummary")) {

  //             for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
  //               let obj = {
  //                 'Month': this.filteredEmployees[idx].mon,
  //                 'Advance': this.filteredEmployees[idx].advance === null || this.filteredEmployees[idx].advance === undefined || this.filteredEmployees[idx].advance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].advance) : this.getRoundedVal(this.filteredEmployees[idx].advance)),
  //                 'Advance Recovery': this.filteredEmployees[idx].advancerecovery === null || this.filteredEmployees[idx].advancerecovery === undefined || this.filteredEmployees[idx].advancerecovery === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].advancerecovery) : this.getRoundedVal(this.filteredEmployees[idx].advancerecovery)),
  //                 'Gross Salary': this.filteredEmployees[idx].gross_earning === null || this.filteredEmployees[idx].gross_earning === undefined || this.filteredEmployees[idx].gross_earning === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].gross_earning) : this.getRoundedVal(this.filteredEmployees[idx].gross_earning)),
  //                 'Gross Deduction': this.filteredEmployees[idx].gross_deduction === null || this.filteredEmployees[idx].gross_deduction === undefined || this.filteredEmployees[idx].gross_deduction === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].gross_deduction) : this.getRoundedVal(this.filteredEmployees[idx].gross_deduction)),
  //                 'NetPay': this.filteredEmployees[idx].netpay === null || this.filteredEmployees[idx].netpay === undefined || this.filteredEmployees[idx].netpay === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay)),
  //               }

  //               let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
  //               exportFields.forEach(field => {
  //                 obj[field.name] = this.filteredEmployees[idx][field.value];
  //               });

  //               exportData.push(obj);
  //             }
  //           }

  //           else if (!this.includeEmployeeDetails && this.radio_button_value == "DisbursementDetails") {

  //             for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
  //               const orgEmpCode = this.filteredEmployees[idx]?.orgempcode;
  //               const tpcode = this.filteredEmployees[idx]?.tpcode;
  //               const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
  //               let obj = {
  //                 'TP / Org Emp Code': tpOrgEmpCode,
  //                 'Employee Name': this.filteredEmployees[idx].empname,
  //                 'Gross Salary': this.filteredEmployees[idx].gross_earning === null || this.filteredEmployees[idx].gross_earning === undefined || this.filteredEmployees[idx].gross_earning === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].gross_earning) : this.getRoundedVal(this.filteredEmployees[idx].gross_earning)),
  //                 'Gross Deduction': this.filteredEmployees[idx].gross_deduction === null || this.filteredEmployees[idx].gross_deduction === undefined || this.filteredEmployees[idx].gross_deduction === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].gross_deduction) : this.getRoundedVal(this.filteredEmployees[idx].gross_deduction)),
  //                 'NetPay': this.filteredEmployees[idx].netpay === null || this.filteredEmployees[idx].netpay === undefined || this.filteredEmployees[idx].netpay === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay)),
  //                 'Bank Account': this.filteredEmployees[idx].bankaccountno,
  //                 'IFSC Code': this.filteredEmployees[idx].ifsccode,
  //                 'Bank Name': this.filteredEmployees[idx].bankname,
  //                 'Branch': this.filteredEmployees[idx].bankbranch,
  //               }

  //               let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
  //               exportFields.forEach(field => {
  //                 obj[field.name] = this.filteredEmployees[idx][field.value];
  //               });

  //               exportData.push(obj);
  //             }
  //           }

  //           else if (this.includeEmployeeDetails && this.radio_button_value == "DisbursementDetails") {

  //             for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
  //               const orgEmpCode = this.filteredEmployees[idx]?.orgempcode;
  //               const tpcode = this.filteredEmployees[idx]?.tpcode;
  //               const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
  //               let obj = {
  //                 // { name: 'Department', value: 'posting_department' },
  //                 // { name: 'Designation', value: 'designation' },
  //                 //   { name: 'JobType', value: 'jobtype' },
  //                 //   { name: 'Unit Parameter Name', value: 'unitparametername' },
  //                 'Month': this.filteredEmployees[idx].mon,
  //                 'TP / Org Emp Code': tpOrgEmpCode,
  //                 'Employee Name': this.filteredEmployees[idx].empname,
  //                 'Father Name': this.filteredEmployees[idx].fathername,
  //                 'Department': this.filteredEmployees[idx].posting_department,
  //                 'Designation': this.filteredEmployees[idx].designation,
  //                 'Job Type': this.filteredEmployees[idx].jobtype,
  //                 'Unit Parameter Name': this.filteredEmployees[idx].unitparametername,
  //                 'Date Of Joining': this.filteredEmployees[idx].dateofjoining,
  //                 'Date Of Birth': this.filteredEmployees[idx].dateofbirth,
  //                 'ESI Number': this.filteredEmployees[idx].esinumber,
  //                 'PAN Number': this.filteredEmployees[idx].pan_number,
  //                 'UAN Number': this.filteredEmployees[idx].uannumber,
  //                 'Email': this.filteredEmployees[idx].email,
  //                 'Date Of Leaving': this.filteredEmployees[idx].dateofleaving,
  //                 'Arrear Days': this.filteredEmployees[idx].arrear_days,
  //                 'Loss Off Pay': this.filteredEmployees[idx].loss_off_pay === null || this.filteredEmployees[idx].loss_off_pay === undefined || this.filteredEmployees[idx].loss_off_pay === '' ? 0 : parseFloat(this.filteredEmployees[idx].loss_off_pay),
  //                 'Total Paid Days': this.filteredEmployees[idx].total_paid_days === null || this.filteredEmployees[idx].total_paid_days === undefined || this.filteredEmployees[idx].total_paid_days === '' ? 0 : parseFloat(this.filteredEmployees[idx].total_paid_days),
  //                 'Rate Basic': this.filteredEmployees[idx].ratebasic === null || this.filteredEmployees[idx].ratebasic === undefined || this.filteredEmployees[idx].ratebasic === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ratebasic) : this.getRoundedVal(this.filteredEmployees[idx].ratebasic)),
  //                 'Rate HRA': this.filteredEmployees[idx].ratehra === null || this.filteredEmployees[idx].ratehra === undefined || this.filteredEmployees[idx].ratehra === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ratehra) : this.getRoundedVal(this.filteredEmployees[idx].ratehra)),
  //                 'Rate Special Allowance': this.filteredEmployees[idx].ratespecial_allowance === null || this.filteredEmployees[idx].ratespecial_allowance === undefined || this.filteredEmployees[idx].ratespecial_allowance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ratespecial_allowance) : this.getRoundedVal(this.filteredEmployees[idx].ratespecial_allowance)),
  //                 'Fixed Allowances Total Rate': this.filteredEmployees[idx].fixedallowancestotalrate === null || this.filteredEmployees[idx].fixedallowancestotalrate === undefined || this.filteredEmployees[idx].fixedallowancestotalrate === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].fixedallowancestotalrate) : this.getRoundedVal(this.filteredEmployees[idx].fixedallowancestotalrate)),
  //                 'Basic': this.filteredEmployees[idx].basic === null || this.filteredEmployees[idx].basic === undefined || this.filteredEmployees[idx].basic === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].basic) : this.getRoundedVal(this.filteredEmployees[idx].basic)),
  //                 'HRA': this.filteredEmployees[idx].hra === null || this.filteredEmployees[idx].hra === undefined || this.filteredEmployees[idx].hra === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].hra) : this.getRoundedVal(this.filteredEmployees[idx].hra)),
  //                 'Special Allowance': this.filteredEmployees[idx].specialallowance === null || this.filteredEmployees[idx].specialallowance === undefined || this.filteredEmployees[idx].specialallowance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].specialallowance) : this.getRoundedVal(this.filteredEmployees[idx].specialallowance)),
  //                 'Arr Basic': this.filteredEmployees[idx].arr_basic === null || this.filteredEmployees[idx].arr_basic === undefined || this.filteredEmployees[idx].arr_basic === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].arr_basic) : this.getRoundedVal(this.filteredEmployees[idx].arr_basic)),
  //                 'Arr HRA': this.filteredEmployees[idx].arr_hra === null || this.filteredEmployees[idx].arr_hra === undefined || this.filteredEmployees[idx].arr_hra === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].arr_hra) : this.getRoundedVal(this.filteredEmployees[idx].arr_hra)),
  //                 // 'Arr CONV': this.data[idx].arr_conv,
  //                 // 'Arr Medical': this.data[idx].arr_medical,
  //                 // rateconv_arr
  //                 'Arr Special Allowance': this.filteredEmployees[idx].arr_specialallowance === null || this.filteredEmployees[idx].arr_specialallowance === undefined || this.filteredEmployees[idx].arr_specialallowance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].arr_specialallowance) : this.getRoundedVal(this.filteredEmployees[idx].arr_specialallowance)),
  //                 'Incentive': this.filteredEmployees[idx].incentive === null || this.filteredEmployees[idx].incentive === undefined || this.filteredEmployees[idx].incentive === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].incentive) : this.getRoundedVal(this.filteredEmployees[idx].incentive)),
  //                 'Refund': this.filteredEmployees[idx].refund === null || this.filteredEmployees[idx].refund === undefined || this.filteredEmployees[idx].refund === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].refund) : this.getRoundedVal(this.filteredEmployees[idx].refund)),
  //                 'Monthly Bonus': this.filteredEmployees[idx].monthly_bonus === null || this.filteredEmployees[idx].monthly_bonus === undefined || this.filteredEmployees[idx].monthly_bonus === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].monthly_bonus) : this.getRoundedVal(this.filteredEmployees[idx].monthly_bonus)),
  //                 'Gross Earning': this.filteredEmployees[idx].gross_earning === null || this.filteredEmployees[idx].gross_earning === undefined || this.filteredEmployees[idx].gross_earning === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].gross_earning) : this.getRoundedVal(this.filteredEmployees[idx].gross_earning)),
  //                 'EPF': this.filteredEmployees[idx].epf === null || this.filteredEmployees[idx].epf === undefined || this.filteredEmployees[idx].epf === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].epf) : this.getRoundedVal(this.filteredEmployees[idx].epf)),
  //                 'VPF': this.filteredEmployees[idx].vpf === null || this.filteredEmployees[idx].vpf === undefined || this.filteredEmployees[idx].vpf === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].vpf) : this.getRoundedVal(this.filteredEmployees[idx].vpf)),
  //                 'ESI': this.filteredEmployees[idx].esi === null || this.filteredEmployees[idx].esi === undefined || this.filteredEmployees[idx].esi === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].esi) : this.getRoundedVal(this.filteredEmployees[idx].esi)),
  //                 'TDS': this.filteredEmployees[idx].tds === null || this.filteredEmployees[idx].tds === undefined || this.filteredEmployees[idx].tds === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].tds) : this.getRoundedVal(this.filteredEmployees[idx].tds)),
  //                 'LWF': this.filteredEmployees[idx].lwf === null || this.filteredEmployees[idx].lwf === undefined || this.filteredEmployees[idx].lwf === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].lwf) : this.getRoundedVal(this.filteredEmployees[idx].lwf)),
  //                 'Insurance': this.filteredEmployees[idx].insurance === null || this.filteredEmployees[idx].insurance === undefined || this.filteredEmployees[idx].insurance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].insurance) : this.getRoundedVal(this.filteredEmployees[idx].insurance)),
  //                 'Other': this.filteredEmployees[idx].other === null || this.filteredEmployees[idx].other === undefined || this.filteredEmployees[idx].other === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].other) : this.getRoundedVal(this.filteredEmployees[idx].other)),
  //                 'Loan': this.filteredEmployees[idx].loan === null || this.filteredEmployees[idx].loan === undefined || this.filteredEmployees[idx].loan === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].loan) : this.getRoundedVal(this.filteredEmployees[idx].loan)),
  //                 'Loan Recovery': this.filteredEmployees[idx].loanrecovery === null || this.filteredEmployees[idx].loanrecovery === undefined || this.filteredEmployees[idx].loanrecovery === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].loanrecovery) : this.getRoundedVal(this.filteredEmployees[idx].loanrecovery)),
  //                 'Advance': this.filteredEmployees[idx].advance === null || this.filteredEmployees[idx].advance === undefined || this.filteredEmployees[idx].advance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].advance) : this.getRoundedVal(this.filteredEmployees[idx].advance)),
  //                 'Professionaltax': this.filteredEmployees[idx].professionaltax === null || this.filteredEmployees[idx].professionaltax === undefined || this.filteredEmployees[idx].professionaltax === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].professionaltax) : this.getRoundedVal(this.filteredEmployees[idx].professionaltax)),
  //                 'Charity Contribution': this.filteredEmployees[idx].charity_contribution === null || this.filteredEmployees[idx].charity_contribution === undefined || this.filteredEmployees[idx].charity_contribution === '' ? 0 : this.truncateToTwoDecimals(this.filteredEmployees[idx].charity_contribution),
  //                 'Gross Deduction': this.filteredEmployees[idx].gross_deduction === null || this.filteredEmployees[idx].gross_deduction === undefined || this.filteredEmployees[idx].gross_deduction === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].gross_deduction) : this.getRoundedVal(this.filteredEmployees[idx].gross_deduction)),
  //                 'Net Pay': this.filteredEmployees[idx].netpay === null || this.filteredEmployees[idx].netpay === undefined || this.filteredEmployees[idx].netpay === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay)),
  //                 'Bank Account': this.filteredEmployees[idx].bankaccountno,
  //                 'IFSC Code': this.filteredEmployees[idx].ifsccode,
  //                 'Bank Name': this.filteredEmployees[idx].bankname,
  //                 'Branch': this.filteredEmployees[idx].bankbranch,
  //                 'A/C No.1': this.filteredEmployees[idx].ac_1 === null || this.filteredEmployees[idx].ac_1 === undefined || this.filteredEmployees[idx].ac_1 === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac_1) : this.getRoundedVal(this.filteredEmployees[idx].ac_1)),
  //                 'A/C No.10': this.filteredEmployees[idx].ac_10 === null || this.filteredEmployees[idx].ac_10 === undefined || this.filteredEmployees[idx].ac_10 === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac_10) : this.getRoundedVal(this.filteredEmployees[idx].ac_10)),
  //                 'A/C No.2': this.filteredEmployees[idx].ac_2 === null || this.filteredEmployees[idx].ac_2 === undefined || this.filteredEmployees[idx].ac_2 === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac_2) : this.getRoundedVal(this.filteredEmployees[idx].ac_2)),
  //                 'A/C No.21': this.filteredEmployees[idx].ac21 === null || this.filteredEmployees[idx].ac21 === undefined || this.filteredEmployees[idx].ac21 === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac21) : this.getRoundedVal(this.filteredEmployees[idx].ac21)),
  //                 'Employer ESI Contr': this.filteredEmployees[idx].employer_esi_contr === null || this.filteredEmployees[idx].employer_esi_contr === undefined || this.filteredEmployees[idx].employer_esi_contr === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].employer_esi_contr) : this.getRoundedVal(this.filteredEmployees[idx].employer_esi_contr)),
  //                 'LWF Employer': this.filteredEmployees[idx].lwf_employer === null || this.filteredEmployees[idx].lwf_employer === undefined || this.filteredEmployees[idx].lwf_employer === '' ? 0 : !this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].lwf_employer) : this.getRoundedVal(this.filteredEmployees[idx].lwf_employer),
  //                 'Salary Status': this.filteredEmployees[idx].salarystatus,
  //                 'Arrear Added Months': this.filteredEmployees[idx].arearaddedmonths,
  //                 'Total Arrear': this.filteredEmployees[idx].totalarear === null || this.filteredEmployees[idx].totalarear === undefined || this.filteredEmployees[idx].totalarear === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].totalarear) : this.getRoundedVal(this.filteredEmployees[idx].totalarear)),
  //                 'Voucher Amount': this.filteredEmployees[idx].voucher_amount === null || this.filteredEmployees[idx].voucher_amount === undefined || this.filteredEmployees[idx].voucher_amount === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].voucher_amount) : this.getRoundedVal(this.filteredEmployees[idx].voucher_amount)),
  //                 'EWS': this.filteredEmployees[idx].ews === null || this.filteredEmployees[idx].ews === undefined || this.filteredEmployees[idx].ews === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ews) : this.getRoundedVal(this.filteredEmployees[idx].ews)),
  //                 'Gratuity': this.filteredEmployees[idx].gratuity === null || this.filteredEmployees[idx].gratuity === undefined || this.filteredEmployees[idx].gratuity === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].gratuity) : this.getRoundedVal(this.filteredEmployees[idx].gratuity)),
  //                 'Bonus': this.filteredEmployees[idx].bonus === null || this.filteredEmployees[idx].bonus === undefined || this.filteredEmployees[idx].bonus === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].bonus) : this.getRoundedVal(this.filteredEmployees[idx].bonus)),
  //                 'Employee NPS': this.filteredEmployees[idx].employeenps === null || this.filteredEmployees[idx].employeenps === undefined || this.filteredEmployees[idx].employeenps === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].employeenps) : this.getRoundedVal(this.filteredEmployees[idx].employeenps)),
  //                 'Insurance Excluded From CTC': this.filteredEmployees[idx].insurancetype,
  //                 ...(this.isValueGreaterThanZero('tea_allowance') && { 'Tea Allowance': this.filteredEmployees[idx].tea_allowance }),
  //                 'CTC': !this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].monthctc) : this.getRoundedVal(this.filteredEmployees[idx].monthctc),
  //               }

  //               exportData.push(obj);

  //             }
  //           }

  //           console.log(exportData);
  //           const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  //           const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  //           const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //           const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //           const downloadLink: any = document.createElement('a');
  //           downloadLink.href = window.URL.createObjectURL(data);
  //           let date = new Date()
  //           downloadLink.download = 'Disbursement_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
  //           downloadLink.click();

  //         }
  //       })

  // }
  //end


  // start - new export excel updated logic - sidharth kaul dated. 04.06.2025
  exportToExcelTable() {
    const table = document.getElementById('reportTable');
    if (!table) {
      console.error('Table not found!');
      return;
    }

    const clonedTable = table.cloneNode(true) as HTMLTableElement;

    // Removed logic that was deleting the first column
    // const headerRow = clonedTable.querySelector('thead tr') as HTMLTableRowElement;
    // if (headerRow) headerRow.deleteCell(0);
    // clonedTable.querySelectorAll('tbody tr').forEach(row => (row as HTMLTableRowElement).deleteCell(0));

    // Identify columns
    const headerRow = clonedTable.querySelector('thead tr') as HTMLTableRowElement;
    const headerCells = Array.from(headerRow.cells).map(cell => cell.textContent?.trim().toLowerCase() || '');
    const monthColIndex = headerCells.findIndex(h => h === 'month');
    const dateCols = ['date of birth', 'date of joining', 'date of leaving']; // Add more if needed
    const dateColIndices = headerCells.reduce((acc: number[], col, idx) => {
      if (dateCols.includes(col)) acc.push(idx);
      return acc;
    }, []);

    // Go through body rows and format content
    const bodyRows = clonedTable.querySelectorAll('tbody tr');
    bodyRows.forEach(row => {
      const rowEl = row as HTMLTableRowElement;

      // Fix Month column
      if (monthColIndex > -1) {
        const cell = rowEl.cells[monthColIndex];
        if (cell) {
          const value = cell.textContent?.trim();
          if (value) {
            cell.innerText = value;
          }
        }
      }

      // Format Date columns
      dateColIndices.forEach(index => {
        const cell = rowEl.cells[index];
        if (cell) {
          const rawValue = cell.textContent?.trim();
          if (rawValue && rawValue !== '-') {
            const formatted = this.formatToUIDate(rawValue); // Assumes this method exists
            cell.innerText = formatted;
          }
        }
      });
    });

    // Convert to Excel
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(clonedTable, { raw: true });
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(
      workbook,
      'Disbursement_Report_' +
      this.employer_name.replaceAll(' ', '').trim() +
      this.currentDateString.trim().replaceAll(' ', '_') +
      '.xlsx'
    );
  }

  formatToUIDate(value: string): string {
    // Check if value is in ISO format YYYY-MM-DD
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDatePattern.test(value)) {
      const dateObj = new Date(value);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = dateObj.toLocaleString('default', { month: 'short' }); // 'Jun'
      const year = String(dateObj.getFullYear()).slice(-2); // '01'
      return `${day}-${month}-${year}`;
    }
    return value; // Already in UI format
  }
  // end - new export excel updated logic 

  // exportToExcel() {
    //   const table = document.getElementById('reportTable');
    //   if (!table) {
    //     console.error('Table not found!');
    //     return;
    //   }
  
    //   const clonedTable = table.cloneNode(true) as HTMLTableElement;
  
    //   // Remove the first column from the header
    //   const headerRow = clonedTable.querySelector('thead tr');
    //   if (headerRow) {
    //     (headerRow as HTMLTableRowElement).deleteCell(0);
    //   }
  
    //   // Remove the first column from each body row
    //   const bodyRows = clonedTable.querySelectorAll('tbody tr');
    //   bodyRows.forEach(row => {
    //     (row as HTMLTableRowElement).deleteCell(0);
    //   });
  
    //   const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(clonedTable);
    //   const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    //   XLSX.writeFile(workbook, 'Payment_Advice_Report_' + this.employer_name.replaceAll(' ', '').trim() + "" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx');
  // }


  SaveColumnValues() {
    if (this.selectedDynmicColumnValues.length > 0) {
      this._ReportService.manage_report_columns_wfm({
        "action": "save_report_columns",
        "report_name": "disbursement",
        "accountid": this.tp_account_id.toString(),
        "report_description": "Disbursement Reports",
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
      "report_name": "disbursement",
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
      epf: false,
      esi: false,
      disbursementmode: false,
      S_No: false,
      mon: false,
      lossofpay: false,
      ratespecial_allowance: false,
      fixedallowancestotalrate: false,
      email: false,
      eps_wages: false,
      total_paid_days: false,
      ifsccode: false,
      uan: false,
      pancard: false,
      gender: false,
      dateofjoining: false,
      epf_eps_diff_remitted: false,
      ncp_days: false,
      refund_of_advances: false,
      residential_address: false,
      designation: false,
      esinumber: false,
      ratebasic: false,
      RateMedical: false,
      fathername: false,
      grossearning: false,
      employeenps: false,
      employeresirate: false,
      vpf: false,
      tds: false,
      attendancemode: false,
      loan: false,
      loanrecovery: false,
      lwf: false,
      insurance: false,
      advancerecovery: false,
      professionaltax: false,
      charity_contribution: false,
      ews: false,
      otherledgerarearwithoutesi: false,
      othervariables: false,
      ac_1: false,
      ac_10: false,
      ac_2: false,
      ac21: false,
      paiddays: false,
      totalleavetaken: false,
      voucher_amount: false,
      gross: false,
      incentive: false,
      refund: false,
      otherledgerarear: false,
      bonus: false,
      security_amt: false,
      insurancetype: false,
      arr_basic: false,
      arr_hra: false,
      // arr_conv:false,
      // arr_medical:false,
      basic: false,
      hra: false,
      // conv:false,
      // medical:false,
      specialallowance: false,
      monthly_bonus: false,
      arr_specialallowance: false,
      employer_esi_contr: false,
      lwf_employer: false,
      advance: false,
      other: false,
      mobile: false,
      totalarear: false,
      gratuity: false,
      tea_allowance: false
      // bonus:false
    };
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

  // New code - Pankaj 03.06.2025 =>

  truncateToTwoDecimals(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }

    const numericValue = Number(value);
    return (Math.floor(numericValue * 100) / 100).toFixed(2);
  }
  // end



}
