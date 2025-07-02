import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import decode from 'jwt-decode';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as XLSX from 'xlsx';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
import { FilterField } from '../common-filter/filter.model';
declare var $: any;
@Component({
  selector: 'app-salary-verification',
  templateUrl: './salary-verification.component.html',
  styleUrls: ['./salary-verification.component.css']
})
export class SalaryVerificationComponent {
  @ViewChild('reportTable', { static: false }) reportTable!: ElementRef;
  isShowRoundedVal: boolean = false;
  showSidebar: boolean = true;
  product_type: any;
  selected_date: any;
  tp_account_id: any = '';
  payout_date: any;
  cur_payout_day: string = '';
  currentDate: any;
  currentDateString: any;
  employer_name: any = '';
  token: any = '';
  includeEmployeeDetails: boolean = false;
  report_data: any = [];
  month: any;
  filteredEmployees: any[] = [];
  p: number = 0;
  invKey: any = '';
  year: any;
  days_count: any;
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
    { name: 'Salary Verified On', value: 'salary_verifiedon' },
    { name: 'Designation', value: 'post_offered' },
    { name: 'Department', value: 'posting_department' },
    { name: 'Job Type', value: 'jobtype' },
    { name: 'Unit Parameter Name', value: 'unitparametername' },
    { name: 'Employee Address', value: 'emp_address' },
    { name: 'Email', value: 'email' },
    { name: 'Mobile Number', value: 'mobilenum' },
    { name: 'PAN Card', value: 'pancard' },
    { name: 'Gender', value: 'gender' },
    { name: 'Date of Joining', value: 'dateofjoining' },
    { name: 'Date of Birth', value: 'dateofbirth' },
    { name: 'Father Name', value: 'fathername' },
    { name: 'Residential Address', value: 'residential_address' },
    { name: 'PF Number', value: 'pfnumber' },
    { name: 'ESI Number', value: 'esinumber' },
    { name: 'UAN Number', value: 'uannumber' },
    { name: 'Bank Account Number', value: 'bankaccountno' },
    { name: 'IFSC', value: 'ifsccode' },
    { name: 'Rate Basic', value: 'ratebasic' },
    { name: 'Rate HRA', value: 'ratehra' },
    { name: 'Rate Special Allowance', value: 'ratespecialallowance' },
    { name: 'Gross Rate', value: 'fixedallowancestotalrate' },

    { name: 'EPF', value: 'epf' },
    { name: 'VPF', value: 'vpf' },
    { name: 'Employee ESI', value: 'employeeesirate' },
    { name: 'TDS', value: 'tds' },

    { name: 'Loan', value: 'loan' },
    { name: 'LWF', value: 'lwf' },
    { name: 'Insurance', value: 'insurance' },

    { name: 'EWF', value: 'ews' },
    { name: 'Gratuity', value: 'gratuity' },
    { name: 'Employer Gratuity', value: 'employergratuity' },
    // start - new param
    { name: 'Charity Contribution', value: 'charity_contribution' },
    //end - new param
    { name: 'Gross Deduction', value: 'grossdeduction' },
    { name: 'A/c No.1', value: 'ac_1' },
    { name: 'A/c No.10', value: 'ac_10' },
    { name: 'A/c No.2', value: 'ac_2' },
    { name: 'A/c No.21', value: 'ac21' },
    { name: 'Employer ESI', value: 'employeresirate' },

    { name: 'Salary  Days', value: 'salarydays' },
    { name: 'Client Name', value: 'customeraccountname' },
    { name: 'Contract Number', value: 'contractno' },
    { name: 'Date of Relieving', value: 'dateofrelieveing' },
    { name: 'Professional Tax Applied', value: 'is_professional_tax_applied' },
    { name: 'Professional Tax State', value: 'professional_tax_state' },
    { name: 'Professional Tax', value: 'professionaltax' },
    { name: 'LWF Applied', value: 'is_lwf_applied' },
    { name: 'LWF State', value: 'lwf_state' },
    { name: 'Variable', value: 'Variable' },
    { name: 'CTC', value: 'ctc' },
    { name: 'Biometric Id', value: 'biometricid' },
  ];
  yearsArray: any = [];
  show_label: boolean = true;
  dynamic_column_data: { reportcolumnname: string, reportcomponentname: string }[] = [];

  filters: FilterField[] = [];
  isSideBar: boolean = true;
  selectedUnitId: any = [];
  selectedDepartmentId: any = [];
  selectedDesignationId: any = [];
  unit_master_list_data: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];
  selectedDynmicColumnValues: any[] = [];

  deductionKeys: string[] = [];
  parsedReports: any[] = [];
  arrear_earnings_allowances_cols: any[];
  rate_cols: any[];


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
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    this.employer_name = this.token.name;

    this.intialize_show_fields();

    var checkboxes = document.querySelectorAll(
      '.dropdown-item input[type="checkbox"]'
    );
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    });
    // added by prabhat dated. 18.02.2025
    $('.filter_by').css('visibility', 'hidden');
    // end
    this.GetReport_Fields()
    this.salaryVerification();
    this.getColumnValues();
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

  // add by akchhaya 17-02-2025 start
  applyFilters(filters: any) {
    this.month = filters.month;
    this.year = filters.year;
    this.invKey = filters.invKey,
      this.selectedUnitId = filters.unitId,
      this.selectedDepartmentId = filters.departmentId,
      this.selectedDesignationId = filters.designationId
    this.salaryVerification();
  }
  // add by akchhaya 17-02-2025 end

  search(key: any) {
    this.invKey = key;
    this.p = 0;
    this.filteredEmployees = this.filteredEmployees.filter(function (element: any) {
      return (element.emp_name.toLowerCase().includes(key.toLowerCase())
        || element.emp_code.toString().toLowerCase().includes(key.toLowerCase()) ||
        element.orgempcode?.toString().toLowerCase().includes(key.toLowerCase()) ||
        element.tpcode.toString().toLowerCase().includes(key.toLowerCase())
      )
    });
  }

  GetReport_Fields() {
    this._ReportService.GetReportFields({
      "reportName": "Payment Advice",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {

        this.dynamic_column_data = resData.commonData;
        // console.log("Original - dynamic_column_data", this.dynamic_column_data);

        const rateItems = [];
        const arrearItems = [];
        const earningItems = [];
        const allowanceItems = [];

        this.dynamic_column_data.forEach(item => {
          const column = item.reportcolumnname?.toLowerCase() || '';
          const component = item.reportcomponentname?.toLowerCase() || '';

          if (column.includes('arear')) {
            arrearItems.push(item);
          } else if (column.includes('rate')) {
            rateItems.push(item);
          } else if (component.includes('allowance') || column.includes('commission')) {
            allowanceItems.push(item);
          } else {
            earningItems.push(item); // default is earning
          }
        });

        this.rate_cols = [
          ...rateItems
        ];

        // console.log("rate_cols", this.rate_cols);

      

        this.arrear_earnings_allowances_cols = [ 
          ...earningItems,
          ...arrearItems,
          ...allowanceItems
        ] 
      
      
      
      
      
      } else {
        this.dynamic_column_data = [];
        console.log(resData.message);
      }
    });
  }

  salaryVerification() {
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
    this._ReportService.SalaryVerificationViewApi({
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type?.toString(),
      "GeoFenceId": this.token.geo_location_id,
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment
    }).subscribe((resData: any) => {

      if (resData.statusCode) {
        this.report_data = resData.commonData;
        this.filteredEmployees = this.report_data;

        // Start - variable data split - sidharth kaul 19.06.2025
        const keySet = new Set<string>();

        this.filteredEmployees = this.report_data.map(report => {
          const parsed = this.parseDeductionDetails(report.deductiondtls || '');
          // Object.keys(parsed).forEach(k => keySet.add(k));
          Object.keys(parsed).forEach(k => keySet.add(k.trim()));
          return { ...report, parsedDeductions: parsed };
        });

        this.deductionKeys = Array.from(keySet);
        // console.log("filteredEmployees - parsedDeductions", this.filteredEmployees[6]?.parsedDeductions);
        // End - variable data split

        this.search(this.invKey);

      } else {
        this.filteredEmployees = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  isValueGreaterThanZero(key: string): boolean {
    return this.filteredEmployees.some(report => report[key] > 0);
  }

  exportToExcel() {

    this._ReportService.SalaryVerificationViewApi({
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type?.toString(),
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.report_data = resData.commonData;
        // console.log(this.report_data);
        let exportData = [];
        let days = {};
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          ////// + resData.commonData[i].dayname;
          days = {
            ...days, [head]: ''
          }
        }

        if (!this.includeEmployeeDetails) {

          for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
            const orgEmpCode = this.filteredEmployees[idx]?.orgempcode;
            const tpcode = this.filteredEmployees[idx]?.tpcode;
            const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
            let obj = {
              'Employee': this.filteredEmployees[idx].emp_name,
              'TP / Org Emp Code': tpOrgEmpCode,
              'Gross Pay': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),
              'Net Pay': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay))
            }

            let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
            exportFields.forEach(field => {
              const rawValue = this.filteredEmployees[idx][field.value];

              // Treat UAN and similar fields as text
              if (['uan', 'aadhaar', 'pan', 'employee_id'].includes(field.value.toLowerCase())) {
                obj[field.name] = rawValue ? `'${rawValue}` : '';
              } else {
                const numericValue = parseFloat(rawValue);
                obj[field.name] = !isNaN(numericValue) && isFinite(numericValue)
                  ? (this.isShowRoundedVal
                    ? this.getRoundedVal(numericValue)
                    : this.truncateToTwoDecimals(numericValue))
                  : '';
              }
            });

            exportData.push(obj);
          }
        }

        else {

          for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
            const orgEmpCode = this.filteredEmployees[idx]?.orgempcode;
            const tpcode = this.filteredEmployees[idx]?.tpcode;
            const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
            let obj = {
              'Employee Name': this.filteredEmployees[idx].emp_name,
              'TP / Org Emp Code': tpOrgEmpCode,
              'Job Type': this.filteredEmployees[idx].jobtype,
              'Salary Verified On': this.filteredEmployees[idx].salary_verifiedon,
              'Designation': this.filteredEmployees[idx].post_offered,
              'Department': this.filteredEmployees[idx].posting_department,
              'Unit Parameter Name': this.filteredEmployees[idx].unitparametername,
              'Organization Unit': this.filteredEmployees[idx].assigned_org_units,
              'Employee Address': this.filteredEmployees[idx].emp_address,
              'Email': this.filteredEmployees[idx].email,
              'Mobile': this.filteredEmployees[idx].mobilenum,
              'PAN Card': this.filteredEmployees[idx].pancard,
              'Gender': this.filteredEmployees[idx].gender,
              'Date of Joining': this.filteredEmployees[idx].dateofjoining,
              'Date of Birth': this.filteredEmployees[idx].dateofbirth,
              'Father Name': this.filteredEmployees[idx].fathername,
              'Residential Address': this.filteredEmployees[idx].residential_address,
              'PF Number': this.filteredEmployees[idx].pfnumber,
              'ESI Number': this.filteredEmployees[idx].esinumber,
              'UAN Number': this.filteredEmployees[idx].uannumber,
              'Bank Account No': this.filteredEmployees[idx].bankaccountno,

              'IFSC Code': this.filteredEmployees[idx].ifsccode,

              'Rate Basic': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ratebasic) : this.getRoundedVal(this.filteredEmployees[idx].ratebasic)),

              'Rate HRA': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ratehra) : this.getRoundedVal(this.filteredEmployees[idx].ratehra)),

              'Rate Special Allowance': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ratespecialallowance) : this.getRoundedVal(this.filteredEmployees[idx].ratespecialallowance)),

              ...(this.isValueGreaterThanZero('salarybonus') && { [this.dynamic_column_data[10]?.reportcomponentname || 'Salary Bonus']: (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].salarybonus) : this.getRoundedVal(this.filteredEmployees[idx].salarybonus)) }),

              ...(this.isValueGreaterThanZero('commission') && { [this.dynamic_column_data[12]?.reportcomponentname || 'Commission']: this.filteredEmployees[idx].commission }),
              ...(this.isValueGreaterThanZero('transport_allowance') && { [this.dynamic_column_data[14]?.reportcomponentname || ' Transport Allowance']: this.filteredEmployees[idx].transport_allowance }),
              ...(this.isValueGreaterThanZero('travelling_allowance') && { [this.dynamic_column_data[16]?.reportcomponentname || 'Travelling Allowance']: this.filteredEmployees[idx].travelling_allowance }),
              ...(this.isValueGreaterThanZero('leave_encashment') && { [this.dynamic_column_data[18]?.reportcomponentname || 'Leave Encashment']: this.filteredEmployees[idx].leave_encashment }),

              ...(this.isValueGreaterThanZero('gratuityinhand') && { [this.dynamic_column_data[20]?.reportcomponentname || 'Gratuity Inhand']: (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].gratuityinhand) : this.getRoundedVal(this.filteredEmployees[idx].gratuityinhand)) }),

              ...(this.isValueGreaterThanZero('overtime_allowance') && { [this.dynamic_column_data[22]?.reportcomponentname || 'Overtime Allowance']: this.filteredEmployees[idx].overtime_allowance }),
              ...(this.isValueGreaterThanZero('notice_pay') && { [this.dynamic_column_data[24]?.reportcomponentname || 'Notice Pay']: this.filteredEmployees[idx].notice_pay }),
              ...(this.isValueGreaterThanZero('hold_salary_non_taxable') && { [this.dynamic_column_data[26]?.reportcomponentname || 'Hold Salary Non Taxable']: this.filteredEmployees[idx].hold_salary_non_taxable }),
              ...(this.isValueGreaterThanZero('children_education_allowance') && { [this.dynamic_column_data[28]?.reportcomponentname || 'Children Education Allowance']: this.filteredEmployees[idx].children_education_allowance }),

              'Fixed Allowances Total Rate': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].fixedallowancestotalrate) : this.getRoundedVal(this.filteredEmployees[idx].fixedallowancestotalrate)),

              'Basic': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].basic) : this.getRoundedVal(this.filteredEmployees[idx].basic)),

              'HRA': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].hra) : this.getRoundedVal(this.filteredEmployees[idx].hra)),

              'CONV': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].conv) : this.getRoundedVal(this.filteredEmployees[idx].conv)),

              'Medical': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].medical) : this.getRoundedVal(this.filteredEmployees[idx].medical)),

              'Special Allowance': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].specialallowance) : this.getRoundedVal(this.filteredEmployees[idx].specialallowance)),

              'Fixed Allowances Total': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].FixedAllowancesTotal) : this.getRoundedVal(this.filteredEmployees[idx].FixedAllowancesTotal)),

              'Incentive': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].incentive) : this.getRoundedVal(this.filteredEmployees[idx].incentive)),

              'Refund': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].refund) : this.getRoundedVal(this.filteredEmployees[idx].refund)),

              'Gross Salary': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),

              'EPF': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].epf) : this.getRoundedVal(this.filteredEmployees[idx].epf)),

              'VPF': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].vpf) : this.getRoundedVal(this.filteredEmployees[idx].vpf)),

              'Employee ESI Rate': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].employeeesirate) : this.getRoundedVal(this.filteredEmployees[idx].employeeesirate)),

              'TDS': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].tds) : this.getRoundedVal(this.filteredEmployees[idx].tds)),

              'Loan': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].loan) : this.getRoundedVal(this.filteredEmployees[idx].loan)),

              'LWF': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].lwf) : this.getRoundedVal(this.filteredEmployees[idx].lwf)),

              'Insurance': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].insurance) : this.getRoundedVal(this.filteredEmployees[idx].insurance)),

              'Advance': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].advance) : this.getRoundedVal(this.filteredEmployees[idx].advance)),

              'EWS': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ews) : this.getRoundedVal(this.filteredEmployees[idx].ews)),

              'Gratuity': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].gratuity) : this.getRoundedVal(this.filteredEmployees[idx].gratuity)),

              'Employer Gratuity': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].employergratuity) : this.getRoundedVal(this.filteredEmployees[idx].employergratuity)),
              // added by vinod dated. 15.05.2025
              'Charity Contribution': this.filteredEmployees[idx].charity_contribution,

              'Gross Deduction': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].grossdeduction) : this.getRoundedVal(this.filteredEmployees[idx].grossdeduction)),

              'Net Pay': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay)),

              'A/c No.1': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac_1) : this.getRoundedVal(this.filteredEmployees[idx].ac_1)),

              'A/c No.10': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac_10) : this.getRoundedVal(this.filteredEmployees[idx].ac_10)),

              'A/c No.2': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac_2) : this.getRoundedVal(this.filteredEmployees[idx].ac_2)),

              'A/c No.21': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac21) : this.getRoundedVal(this.filteredEmployees[idx].ac21)),

              'Employer ESI Rate': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].employeresirate) : this.getRoundedVal(this.filteredEmployees[idx].employeresirate)),

              'Salary Days': this.filteredEmployees[idx].salarydays,
              'Customer Account Name': this.filteredEmployees[idx].customeraccountname,
              'Contract No.': this.filteredEmployees[idx].contractno,
              'Date of Relieveing': this.filteredEmployees[idx].dateofrelieveing,
              'Professional Tax Applied': this.filteredEmployees[idx].is_professional_tax_applied,
              'Professional Tax State': this.filteredEmployees[idx].professional_tax_state,
              'Professional Tax': this.filteredEmployees[idx].professionaltax,
              'LWF Applied': this.filteredEmployees[idx].is_lwf_applied,
              'LWF State': this.filteredEmployees[idx].lwf_state,

              'Variable': this.filteredEmployees[idx].deductiondtls?.replace(/<br\s*\/?>/gi, ', ') || '',

              'CTC': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ctc) : this.getRoundedVal(this.filteredEmployees[idx].ctc)),

              'Biometric Id': this.filteredEmployees[idx].biometricid

            }
            exportData.push(obj);
          }
        }
        // console.log(exportData);

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        worksheet['A1'].s = {
          alignment: { wrapText: true }
        };
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = 'CTC_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
      }
    })
  }


  SaveColumnValues() {
    if (this.selectedDynmicColumnValues.length > 0) {
      this._ReportService.manage_report_columns_wfm({
        "action": "save_report_columns",
        "report_name": "ctc",
        "accountid": this.tp_account_id.toString(),
        "report_description": "CTC Reports",
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
      "report_name": "ctc",
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
      jobtype: false,
      S_No: false,
      emp_address: false,
      dateofbirth: false,
      uannumber: false,
      ratehra: false,
      fixedallowancestotalrate: false,
      salary_verifiedon: false,
      post_offered: false,
      posting_department: false,
      unitparametername: false,
      email: false,
      eps_wages: false,
      mobilenum: false,
      ifsccode: false,
      fathername: false,
      uan: false,
      employeeesirate: false,
      pancard: false,
      gender: false,
      dateofjoining: false,
      epf_eps_diff_remitted: false,
      ncp_days: false,
      refund_of_advances: false,
      residential_address: false,
      pfnumber: false,
      esinumber: false,
      ratebasic: false,
      RateMedical: false,
      bankaccountno: false,
      grossearning: false,
      epf: false,
      employeresirate: false,
      vpf: false,
      tds: false,
      ctc: false,
      loan: false,
      lwf: false,
      insurance: false,
      professionaltax: false,
      ews: false,
      gratuity: false,
      employergratuity: false,
      charity_contribution: false,
      grossdeduction: false,
      ac_1: false,
      ac_10: false,
      ac_2: false,
      ac21: false,
      contractno: false,
      ratespecialallowance: false,
      salarydays: false,
      customeraccountname: false,
      dateofrelieveing: false,
      biometricid: false,
      is_professional_tax_applied: false,
      professional_tax_state: false,
      is_lwf_applied: false,
      lwf_state: false,
      Variable: false,
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
  truncateToTwoDecimals(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }

    const numericValue = Number(value);
    return (Math.floor(numericValue * 100) / 100).toFixed(2);
  }

  exportTableToExcel() {
    if (this.reportTable) {
      // Clone the table to avoid modifying the DOM
      const tableElement = this.reportTable.nativeElement.cloneNode(true) as HTMLTableElement;

      // Convert table to worksheet
      const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(tableElement, { raw: true });

      // Define columns to keep as string (case-insensitive match)
      const stringCols = [ 'date of joining', 'date of birth', 'date of relieving',
        'mobile number', 'pf number', 'esi number', 'bank account no.', 'bank account no', 'ifsc', 'uan number'
      ];

      // Get header row and map column indices for stringCols
      const headerRow = tableElement.querySelector('thead tr') as HTMLTableRowElement;
      const headerCells = Array.from(headerRow.cells).map(cell => cell.textContent?.trim().toLowerCase() || '');
      const stringColIndices = headerCells.reduce((acc: number[], col, idx) => {
        if (stringCols.includes(col)) acc.push(idx);
        return acc;
      }, []);

      // console.log(headerCells);

      // Post-process worksheet to convert numeric strings to numbers (except stringCols)
      const range = XLSX.utils.decode_range(worksheet['!ref'] || '');
      for (let R = range.s.r + 1; R <= range.e.r; ++R) { // skip header row
        for (let C = range.s.c; C <= range.e.c; ++C) {
          if (!stringColIndices.includes(C)) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellAddress];
            if (cell && typeof cell.v === 'string' && cell.v.trim() !== '' && !isNaN(Number(cell.v))) {
              cell.v = Number(cell.v);
              cell.t = 'n'; // set type to number
            }
          }
        }
      }

      // Create workbook and export
      let fileName = 'CTC_Report_' + this.employer_name.replaceAll(' ', '').trim() + "" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
      XLSX.writeFile(workbook, fileName);
    }
  }

  // Sidharth Kaul variable key - value pair logic 19.06.2025
  // parseDeductionDetails(detail: string): { [key: string]: string } {
  //   const map: { [key: string]: string } = {};

  //   if (detail) {
  //     detail.split('<br/>').forEach(entry => {
  //       const [key, value] = entry.split(':');
  //       if (key && value !== undefined) {
  //         map[key.trim()] = value.trim();
  //       }
  //     });
  //   }

  //   return map;
  // }

  parseDeductionDetails(detail: string): { [key: string]: string } {
  const map: { [key: string]: string } = {};

  if (detail) {
    detail.split('<br/>').forEach(entry => {
      const [key, value] = entry.split(':');
      if (key && value !== undefined) {
        const cleanKey = key.trim();
        map[cleanKey] = value.trim();
      }
    });
  }

  return map;
}






}