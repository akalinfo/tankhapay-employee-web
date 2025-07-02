import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import * as XLSX from 'xlsx';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { FilterField } from '../common-filter/filter.model';

@Component({
  selector: 'app-annual-report',
  templateUrl: './annual-report.component.html',
  styleUrls: ['./annual-report.component.css']
})
export class AnnualReportComponent {
  @ViewChild('reportTable', { static: false }) reportTable!: ElementRef;
  isShowRoundedVal: boolean = false;
  tpcode: any;
  showSidebar: boolean = true;
  month: any;
  days_count: any;
  employer_profile: any = [];
  Emp: any;
  p: number = 0;
  employer_name: any = '';
  invKey: any = '';
  data: any = [];
  currentDate: any;
  currentDateString: any;
  Emp_code: any;
  filteredEmployees: any = [];
  year: any;
  cur_payout_day: string = '';
  selected_date: any;
  loading: boolean = false;
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
  selectedUnitId: any = [];
  selectedDepartmentId: any = [];
  selectedDesignationId: any = [];
  dropdownSettings: any = {};
  dropdownSettings_department: any = {};
  dropdownSettings_designation: any = {};
  sidebarWidth: string = '0';
  showfields: any;

  fieldarray: any = [
    { name: 'S.No', value: 'S_No' },
    { name: 'Disbursement Mode', value: 'disbursementmode' },
    { name: 'Month', value: 'mon' },
    { name: 'Father/Husband Name', value: 'fathername' },
    { name: 'Designation', value: 'designation' },
    { name: 'Department', value: 'posting_department' },
    { name: 'JobType', value: 'jobtype' },
    { name: 'Unit Parameter Name', value: 'unitparametername' },
    { name: 'Subunit', value: 'subunit' },
    { name: 'Date of Joining', value: 'dateofjoining' },
    { name: 'Date of Birth', value: 'dateofbirth' },
    { name: 'ESI Number', value: 'esinumber' },
    { name: 'Pan Number', value: 'pan_number' },
    { name: 'UAN', value: 'uannumber' },
    { name: 'Email ID', value: 'email' },
    { name: 'Date of Leaving', value: 'dateofleaving' },
    { name: 'Arrear Days', value: 'arrear_days' },
    { name: 'Loss of Pay', value: 'loss_off_pay' },
    { name: 'Total Paid Days', value: 'total_paid_days' },
    { name: 'Rate Basic', value: 'ratebasic' },
    { name: 'Rate HRA', value: 'ratehra' },
    { name: 'Rate CONV', value: 'rateconv' },
    { name: 'Rate Medical', value: 'ratemedical' },

    { name: 'Rate salary Bonus', value: 'ratesalarybonus' },
    { name: 'Rate Commission', value: 'ratecommission' },
    { name: 'Rate Transport Allowance', value: 'ratetransport_allowance' },
    { name: 'Rate Travelling Allowance', value: 'ratetravelling_allowance' },
    { name: 'Rate Leave Encashment', value: 'rateleave_encashment' },
    { name: 'Rate Overtime Allowance', value: 'rateovertime_allowance' },
    { name: 'Rate Notice Pay', value: 'ratenotice_pay' },
    { name: 'Rate Hold Salary Non Taxable', value: 'ratehold_salary_non_taxable' },
    { name: 'Rate Children Education Allowance', value: 'ratechildren_education_allowance' },
    { name: 'Rate Gratuity Inhand', value: 'rategratuityinhand' },

    { name: 'Rate Special Allowance', value: 'ratespecialallowance' },
    { name: 'Fixed Allowances Total Rate', value: 'fixedallowancestotalrate' },
    { name: 'Basic', value: 'basic' },
    { name: 'HRA', value: 'hra' },
    { name: 'CONV', value: 'conv' },
    { name: 'Medical', value: 'medical' },

    { name: 'Salary Bonus', value: 'salarybonus' },
    { name: 'Commission', value: 'commission' },
    { name: 'Transport Allowance', value: 'transport_allowance' },
    { name: 'Travelling Allowance', value: 'travelling_allowance' },
    { name: 'Leave Encashment', value: 'leave_encashment' },
    { name: 'Overtime Allowance', value: 'overtime_allowance' },
    { name: 'Notice Pay', value: 'notice_pay' },
    { name: 'Hold Salary Non Taxable', value: 'hold_salary_non_taxable' },
    { name: 'Children Education Allowance', value: 'children_education_allowance' },
    { name: 'Gratuity Inhand', value: 'gratuityinhand' },

    { name: 'Special Allowance', value: 'specialallowance' },
    { name: 'Arr Basic', value: 'arr_basic' },
    { name: 'Arr Hra', value: 'arr_hra' },
    { name: 'Arr CONV', value: 'arr_conv' },
    { name: 'Arr Medical', value: 'arr_medical' },
    { name: 'Arr Special Allowance', value: 'arr_specialallowance' },
    { name: 'Incentive', value: 'incentive' },
    { name: 'Refund', value: 'refund' },
    { name: 'Monthly Bonus', value: 'monthly_bonus' },
    { name: 'EPF', value: 'epf' },
    { name: 'VPF', value: 'vpf' },
    { name: 'ESI', value: 'esi' },
    { name: 'TDS', value: 'tds' },
    { name: 'LWF', value: 'lwf' },
    { name: 'Insurance', value: 'insurance' },
    { name: 'Mobile', value: 'mobile' },
    { name: 'Other', value: 'other' },
    { name: 'Loan', value: 'loan' },

    { name: 'Loan Recovery', value: 'loanrecovery' },

    { name: ' Advance', value: 'advance' },
    { name: 'Advance Recovery', value: 'advancerecovery' },
    { name: 'Professional Tax', value: 'professionaltax' },
    // start - new param
    { name: 'Charity Contribution', value: 'charity_contribution' },
    // end - new param
    { name: 'A/c  No.1', value: 'ac_1' },
    { name: 'A/c  No.10', value: 'ac_10' },
    { name: 'A/c  No.2', value: 'ac_2' },
    { name: 'A/c  No.21', value: 'ac21' },
    { name: 'Employer ESI Contr', value: 'employer_esi_contr' },
    { name: 'Employer LWF', value: 'lwf_employer' },
    { name: 'Employer Insurance', value: 'employerinsuranceamount' },
    { name: 'Salary Status', value: 'salarystatus' },
    { name: 'Arrear Months', value: 'arearaddedmonths' },
    { name: 'Total Arrear', value: 'totalarear' },
    { name: 'Voucher Amount', value: 'voucher_amount' },
    { name: 'EWS', value: 'ews' },
    { name: ' Gratuity', value: 'gratuity' },
    { name: 'Bonus', value: 'bonus' },
    { name: 'Employee NPS', value: 'employeenps' },
    { name: 'Other Ledger Arrears', value: 'otherledgerarear' },
    { name: 'Other Ledger Deductions', value: 'otherledgerdeductions' },
    { name: 'Other Variables', value: 'othervariables' },
    { name: 'Other Ledger Arrear Without ESI', value: 'otherledgerarearwithoutesi' },
    { name: 'Other Bonus With ESI', value: 'otherbonuswithesi' },
    { name: 'Insurance Excluded From CTC', value: 'insurancetype' },
    { name: 'Mode of Attendance', value: 'attendancemode' },
    { name: 'Biometric Id', value: 'biometricid' },
    { name: 'Tea Allowance', value: 'tea_allowance' },
  ];
  yearsArray: any = [];
  geo_fencing_list_data_count: any;
  geo_fencing_list_data: any;
  product_type: any;
  payout_date: any;
  tp_account_id: any = '';
  includeEmployeeDetails: boolean = false;
  token: any = '';
  liability_data: any = [];
  liability_json_data: any = [];
  show_label: boolean = true;
  unit_master_list_data: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];
  dynamic_column_data: { reportcolumnname: string, reportcomponentname: string }[] = [];

  // Filters=======
  filters: FilterField[] = [];
  isSideBar: boolean = true;
  selectedDynmicColumnValues: any[] = [];
  financialYears = [];
  monthYear = [];
  filterAnnualForm: FormGroup;
  fromMonthYear: any = '';
  toMonthYear: any = '';

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _BusinesSettingsService: BusinesSettingsService,
    private _ReportService: ReportService,
    private _alertservice: AlertService,
    private _EncrypterService: EncrypterService
  ) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.employer_name = this.token.name;
    this.product_type = localStorage.getItem('product_type');
    const date = new Date();
    let currentMonth = date.getMonth() + 1;
    let currentYear = date.getFullYear();
    this.intialize_show_fields();

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'unitid',
      textField: 'unitname',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      allowSearchFilter: true,
      enableCheckAll: true,
      itemsShowLimit: 5,
    };
    this.dropdownSettings_department = {
      singleSelection: false,
      idField: 'posting_department',
      textField: 'posting_department',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      allowSearchFilter: true,
      enableCheckAll: true,
      itemsShowLimit: 5,
    };
    this.dropdownSettings_designation = {
      singleSelection: false,         // Allow multiple selections
      idField: 'post_offered',        // Field to bind as the ID
      textField: 'post_offered',      // Field to bind as the display text
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 5,              // Limit items displayed in the UI
      allowSearchFilter: true,
      enableCheckAll: true,
    };

    this.filterAnnualForm = this._formBuilder.group({
      fromMonYr: ['', [Validators.required]],
      toMonYr: [''],
      ouIds: [''],
      departmentId: [''],
      financialYear: [''],
      designation: ['']
    })

    this.generateFinancialYears();
    this.selected_date = localStorage.getItem('selected_date') || null;

    if (this.selected_date) {
      this.days_count = this.selected_date.split('-')[0];
      this.month = this.selected_date.split('-')[1];
      this.year = this.selected_date.split('-')[2];
    } else {
      this.month = currentMonth.toString();
      this.year = currentYear.toString();
    }
    /* var checkboxes = document.querySelectorAll(
       '.dropdown-item input[type="checkbox"]'
     );
     checkboxes.forEach(function (checkbox) {
       checkbox.addEventListener('click', function (event) {
         event.stopPropagation(); // Prevent click event from propagating to parent elements
       });
     });*/
    this.GetReport_Fields();
    this.get_geo_fencing_list();
    this.get_att_dept_master_list();
    this.get_att_role_master_list();
    this.getColumnValues();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  openSidebar() {
    this.sidebarWidth = '400px';
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
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    let firstYr = currentYear;
    let lastYr = currentYear;
    if ((new Date().getMonth() + 1) < 4) {
      firstYr = currentYear - 1;
    }
    lastYr = firstYr + 1;
    this.fromMonthYear = 'Apr-' + firstYr;
    this.toMonthYear = 'Mar-' + lastYr;

    this.filterAnnualForm.patchValue({
      'financialYear': this.financialYears[(this.financialYears.length) - 1]
    })
    this.financialYearFun(this.filterAnnualForm.value.financialYear);
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
    this.filterAnnualForm.patchValue({
      'fromMonYr': this.fromMonthYear,
      'toMonYr': this.toMonthYear
    })
    this.LiabilityReport();
  }


  // Method to close the sidebar
  closeSidebar() {
    this.selectedUnitId = [];
    this.selectedDesignationId = [];
    this.selectedDepartmentId = [];
    this.sidebarWidth = '0';
  }
  reset() {
    this.selectedUnitId = [];
    this.selectedDesignationId = [];
    this.selectedDepartmentId = [];
    this.invKey = '';
  }
  Apply_new_filter() {
    this.LiabilityReport();
    this.sidebarWidth = '0';
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

  }

  fieldshowdata(name: any) {
    return this.showfields[name] ? 'checked' : null;
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

search(key: any) {
  // console.log('liability_data:', this.liability_data);  // Check its value
  this.invKey = key;
  this.p = 0;

  if (Array.isArray(this.liability_data)) {
    this.filteredEmployees = this.liability_data.filter(function (element: any) {
      return (
        element.employee_name.toLowerCase().includes(key.toLowerCase()) ||
        element.emp_code.toString().toLowerCase().includes(key.toLowerCase()) ||
        element.orgempcode?.toString().toLowerCase().includes(key.toLowerCase()) ||
        element.tpcode.toString().toLowerCase().includes(key.toLowerCase())
      );
    });
  } else {
    console.error('liability_data is not an array:', this.liability_data);
  }
}


  isValueGreaterThanZero(key: string): boolean {
    return this.filteredEmployees.some(report => report[key] > 0);
  }
  get_geo_fencing_list() {
    this._BusinesSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllOUsForCustomer",
      "searchKeyword": ''
    }).subscribe((resData: any) => {
      this.geo_fencing_list_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          this.toastr.info('No data found', '');
          this.geo_fencing_list_data = [];
          return;
        }
        this.geo_fencing_list_data = resData.commonData;
        for (let index = 0; index < this.geo_fencing_list_data.length; index++) {
          const element = this.geo_fencing_list_data[index];
          if (element.emp_codes) {
            this.geo_fencing_list_data[index].emp_codes = element.emp_codes ? element.emp_codes.replace(/}/g, '').replace(/{/g, '') : '';
          }
        }
        this.geo_fencing_list_data_count = this.geo_fencing_list_data.length;

        // Update unit_master_list_data with the org_unit_name for the dropdown
        this.unit_master_list_data = this.geo_fencing_list_data.map(item => ({
          unitname: item.org_unit_name,  // Use org_unit_name for unitname
          unitid: item.id                // Keep the ID for later use if needed
        }));
      } else {
        this.geo_fencing_list_data_count = 0;
      }
    }, (error: any) => {
      this.geo_fencing_list_data_count = 0;
    });
  }


  get_att_dept_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetPostingDepartments",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.department_master_list_data = resData.commonData.map(department => ({
          posting_department: department.posting_department
        }));

        // Add 'All' if not already present
        if (!this.department_master_list_data.some(dept => dept.posting_department === 'All')) {
          // this.department_master_list_data.unshift({ posting_department: 'All' });
        }
      } else {
        this.department_master_list_data = [];
      }
    });
  }

  get_att_role_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetMasterPostOffered",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.role_master_list_data = resData.commonData.map(role => ({
          post_offered: role.post_offered
        }));

        // Add "All" option if it doesn't already exist
        if (!this.role_master_list_data.some(role => role.post_offered === 'All')) {
          // this.role_master_list_data.unshift({ post_offered: 'All' });
        }
      } else {
        this.role_master_list_data = [];
      }
    });
  }
  GetReport_Fields() {
    this._ReportService.GetReportFields({
      "reportName": "Liability",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.dynamic_column_data = resData.commonData;
      } else {
        this.dynamic_column_data = [];
      }
    });
  }
  LiabilityReport() {
    this.loading = true;
    //const unitIds = this.selectedUnitId.length === this.unit_master_list_data.length ? this.unit_master_list_data.map(unit => unit.unitid).join(',') : this.selectedUnitId.map(unit => unit.unitid).join(',');
    let unitMasterSelected = this.filterAnnualForm.value.ouIds;
    let unitIdsString = '';
    if (unitMasterSelected != '') {
      unitIdsString = unitMasterSelected.map(unit => unit.unitid).join(',');
      unitIdsString = this._EncrypterService.aesEncrypt(unitIdsString.toString())
    }
    let ouIds = ''
    if (this.token.ouIds != '' && this.token.ouIds != null) {
      ouIds = this._EncrypterService.aesEncrypt((this.token.ouIds).toString());
    }

    let departmentIdSelected = this.filterAnnualForm.value.departmentId;
    let departmentIdString = '';
    if (departmentIdSelected != '') {
      departmentIdString = departmentIdSelected.map(unit => unit.posting_department).join(',');
      departmentIdString = this._EncrypterService.aesEncrypt(departmentIdString.toString())
    }

    let designationSelected = this.filterAnnualForm.value.designation;
    let designationString = '';
    if (designationSelected != '') {
      designationString = designationSelected.map(unit => unit.post_offered).join(',');
      designationString = this._EncrypterService.aesEncrypt(designationString.toString())
    }

    let startDate = this.filterAnnualForm.value.fromMonYr;
    let endDate = this.filterAnnualForm.value.toMonYr;

    this._ReportService.getAnnualReport({
      "startPeriod": startDate,
      "endPeriod": endDate,
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
      "postOffered": designationString,
      "postingDepartment": departmentIdString,
      "unitParameterName": unitIdsString,
      "ouIds": ouIds
    }).subscribe((resData: any) => {
      this.loading = false;
      if (resData.statusCode) {
        this.liability_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.filteredEmployees = (this.liability_data);

        setTimeout(() => {
          this.search(this.invKey);
        },0)
      } else {
        this.filteredEmployees = [];
        this.show_label = false;
        this.loading = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    }, error => {
      this.loading = false;
      let msg = error.message;
      if (error.error.message != 'undefined' && error.error.message != undefined) {
        msg = error.error.message;
      }
      this._alertservice.error(msg, GlobalConstants.alert_options_autoClose);
    });
  }

  DetailedLiabilityReportByEmpCode(Emp_code: any, orgempcode: any) {
    this.Emp = Emp_code;
    this.tpcode = orgempcode;
    this._ReportService.GetDetailedLiabilityReportByEmpCode({
      "year": this.year,
      "month": this.month,
      "empCode": this.Emp?.toString(),
      "customerAccountId": this.tp_account_id.toString(),
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = (resData.commonData);
      } else {
        this.data = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  exportToExcel() {
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

    this._ReportService.LiabilityReportApi({
      "year": this.year,
      "month": this.month,
      "individualSearch": "",
      "contractIdSearch": "",
      "customerAccountId": this.tp_account_id.toString(),
      "GeoFenceId": this.token.geo_location_id,
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.liability_data = resData.commonData;
        let exportData = [];
        let days = {};
        let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          // + resData.commonData[i].dayname;
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

              'Gross Earning': this.filteredEmployees[idx].grossearning === null || this.filteredEmployees[idx].grossearning === undefined || this.filteredEmployees[idx].grossearning === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),

              'Gross Deduction': this.filteredEmployees[idx].grossdeduction === null || this.filteredEmployees[idx].grossdeduction === undefined || this.filteredEmployees[idx].grossdeduction === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].grossdeduction) : this.getRoundedVal(this.filteredEmployees[idx].grossdeduction)),

              'Net Pay': this.filteredEmployees[idx].netpay === null || this.filteredEmployees[idx].netpay === undefined || this.filteredEmployees[idx].netpay === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay)),

            }

            exportFields.forEach(field => {
              obj[field.name] = this.filteredEmployees[idx][field.value];
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
              'Disbursementmode': this.filteredEmployees[idx].disbursementmode,
              'Month': this.filteredEmployees[idx].mon,
              'TP / Org Emp Code': tpOrgEmpCode,
              'Employee Name': this.filteredEmployees[idx].emp_name,
              'Father Name': this.filteredEmployees[idx].fathername,
              'Designation': this.filteredEmployees[idx].designation,
              'Department': this.filteredEmployees[idx].posting_department?.split('#')[0],
              'Job Type': this.filteredEmployees[idx].jobtype,
              'Unit Parameter Name': this.filteredEmployees[idx].unitparametername,
              'Subunit': this.filteredEmployees[idx].subunit,
              'Date of Joining': this.filteredEmployees[idx].dateofjoining,
              'Date of Birth': this.filteredEmployees[idx].dateofbirth,
              'ESI Number': this.filteredEmployees[idx].esinumber,
              'PAN Number': this.filteredEmployees[idx].pan_number,
              'UAN Number': this.filteredEmployees[idx].uannumber,
              'Email': this.filteredEmployees[idx].email,
              'Date of Leaving': this.filteredEmployees[idx].dateofleaving,
              'Arrear Days': this.filteredEmployees[idx].arrear_days,

              'Loss Off Pay': this.filteredEmployees[idx].loss_off_pay === null || this.filteredEmployees[idx].loss_off_pay === undefined || this.filteredEmployees[idx].loss_off_pay === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].loss_off_pay) : this.getRoundedVal(this.filteredEmployees[idx].loss_off_pay)),

              'Total Paid Days': this.filteredEmployees[idx].total_paid_days === null || this.filteredEmployees[idx].total_paid_days === undefined || this.filteredEmployees[idx].total_paid_days === '' ? 0 : parseFloat(this.filteredEmployees[idx].total_paid_days),

              [this.dynamic_column_data[1]?.reportcomponentname || 'Rate Basic']: this.filteredEmployees[idx].ratebasic === null || this.filteredEmployees[idx].ratebasic === undefined || this.filteredEmployees[idx].ratebasic === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ratebasic) : this.getRoundedVal(this.filteredEmployees[idx].ratebasic)),

              [this.dynamic_column_data[3]?.reportcomponentname || 'Rate HRA']: this.filteredEmployees[idx].ratehra === null || this.filteredEmployees[idx].ratehra === undefined || this.filteredEmployees[idx].ratehra === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ratehra) : this.getRoundedVal(this.filteredEmployees[idx].ratehra)),

              [this.dynamic_column_data[7]?.reportcomponentname || 'Rate CONV']: this.filteredEmployees[idx].rateconv === null || this.filteredEmployees[idx].rateconv === undefined || this.filteredEmployees[idx].rateconv === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].rateconv) : this.getRoundedVal(this.filteredEmployees[idx].rateconv)),

              [this.dynamic_column_data[9]?.reportcomponentname || 'Rate Medical']: this.filteredEmployees[idx].ratemedical === null || this.filteredEmployees[idx].ratemedical === undefined || this.filteredEmployees[idx].ratemedical === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ratemedical) : this.getRoundedVal(this.filteredEmployees[idx].ratemedical)),

              ...(this.isValueGreaterThanZero('ratesalarybonus') && { [this.dynamic_column_data[11]?.reportcomponentname || 'Rate Salary Bonus']: this.filteredEmployees[idx].ratesalarybonus }),

              ...(this.isValueGreaterThanZero('ratecommission') && { [this.dynamic_column_data[13]?.reportcomponentname || 'Rate Commission']: this.filteredEmployees[idx].ratecommission }),

              ...(this.isValueGreaterThanZero('ratetransport_allowance') && { [this.dynamic_column_data[15]?.reportcomponentname || 'Rate Transport Allowance']: this.filteredEmployees[idx]?.ratetransport_allowance }),

              ...(this.isValueGreaterThanZero('ratetravelling_allowance') && { [this.dynamic_column_data[17]?.reportcomponentname || 'Rate Travelling Allowance']: this.filteredEmployees[idx].ratetravelling_allowance }),

              ...(this.isValueGreaterThanZero('rateleave_encashment') && { [this.dynamic_column_data[19]?.reportcomponentname || 'Rate Leave Encashment']: this.filteredEmployees[idx].rateleave_encashment }),

              ...(this.isValueGreaterThanZero('overtime_allowance') && { [this.dynamic_column_data[23]?.reportcomponentname || 'Rate Overtime Allowance']: (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].rateovertime_allowance) : this.getRoundedVal(this.filteredEmployees[idx].rateovertime_allowance)) }),

              ...(this.isValueGreaterThanZero('ratenotice_pay') && { [this.dynamic_column_data[25]?.reportcomponentname || 'Rate Notice Pay']: this.filteredEmployees[idx].ratenotice_pay }),

              ...(this.isValueGreaterThanZero('ratehold_salary_non_taxable') && { [this.dynamic_column_data[27]?.reportcomponentname || 'Rate Hold Salary Non Taxable']: this.filteredEmployees[idx].ratehold_salary_non_taxable }),

              ...(this.isValueGreaterThanZero('ratechildren_education_allowance') && { [this.dynamic_column_data[29]?.reportcomponentname || 'Rate Children Education Allowance']: this.filteredEmployees[idx].ratechildren_education_allowance }),

              ...(this.isValueGreaterThanZero('rategratuityinhand') && { [this.dynamic_column_data[21]?.reportcomponentname || 'Rate Gratuity Inhand']: this.filteredEmployees[idx].rategratuityinhand }),

              [this.dynamic_column_data[5]?.reportcomponentname || 'Rate Special Allowance']: this.filteredEmployees[idx].ratespecialallowance === null || this.filteredEmployees[idx].ratespecialallowance === undefined || this.filteredEmployees[idx].ratespecialallowance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ratespecialallowance) : this.getRoundedVal(this.filteredEmployees[idx].ratespecialallowance)),

              'Fixed Allowances Total Rate': this.filteredEmployees[idx].fixedallowancestotalrate === null || this.filteredEmployees[idx].fixedallowancestotalrate === undefined || this.filteredEmployees[idx].fixedallowancestotalrate === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].fixedallowancestotalrate) : this.getRoundedVal(this.filteredEmployees[idx].fixedallowancestotalrate)),

              [this.dynamic_column_data[0]?.reportcomponentname || 'Basic']: this.filteredEmployees[idx].basic === null || this.filteredEmployees[idx].basic === undefined || this.filteredEmployees[idx].basic === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].basic) : this.getRoundedVal(this.filteredEmployees[idx].basic)),

              [this.dynamic_column_data[2]?.reportcomponentname || 'HRA']: this.filteredEmployees[idx].hra === null || this.filteredEmployees[idx].hra === undefined || this.filteredEmployees[idx].hra === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].hra) : this.getRoundedVal(this.filteredEmployees[idx].hra)),

              [this.dynamic_column_data[6]?.reportcomponentname || 'CONV']: this.filteredEmployees[idx].conv === null || this.filteredEmployees[idx].conv === undefined || this.filteredEmployees[idx].conv === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].conv) : this.getRoundedVal(this.filteredEmployees[idx].conv)),

              [this.dynamic_column_data[8]?.reportcomponentname || 'Medical']: this.filteredEmployees[idx].medical === null || this.filteredEmployees[idx].medical === undefined || this.filteredEmployees[idx].medical === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].medical) : this.getRoundedVal(this.filteredEmployees[idx].medical)),

              ...(this.isValueGreaterThanZero('ratesalarybonus') && { [this.dynamic_column_data[10]?.reportcomponentname || 'Salary Bonus']: this.filteredEmployees[idx].salarybonus }),

              ...(this.isValueGreaterThanZero('ratecommission') && { [this.dynamic_column_data[12]?.reportcomponentname || 'Commission']: this.filteredEmployees[idx].commission }),

              ...(this.isValueGreaterThanZero('ratetransport_allowance') && { [this.dynamic_column_data[14]?.reportcomponentname || 'Transport Allowance']: this.filteredEmployees[idx].transport_allowance }),

              ...(this.isValueGreaterThanZero('ratetravelling_allowance') && { [this.dynamic_column_data[16]?.reportcomponentname || 'Travelling Allowance']: this.filteredEmployees[idx].travelling_allowance }),

              ...(this.isValueGreaterThanZero('rateleave_encashment') && { [this.dynamic_column_data[18]?.reportcomponentname || 'Leave Encashment']: this.filteredEmployees[idx].leave_encashment }),

              ...(this.isValueGreaterThanZero('overtime_allowance') && { [this.dynamic_column_data[22]?.reportcomponentname || 'Overtime Allowance']: this.filteredEmployees[idx].overtime_allowance }),

              ...(this.isValueGreaterThanZero('ratenotice_pay') && { [this.dynamic_column_data[24]?.reportcomponentname || 'Notice Pay']: this.filteredEmployees[idx].notice_pay }),

              ...(this.isValueGreaterThanZero('ratehold_salary_non_taxable') && { [this.dynamic_column_data[26]?.reportcomponentname || 'Hold Salary Non Taxable']: this.filteredEmployees[idx].hold_salary_non_taxable }),

              ...(this.isValueGreaterThanZero('ratechildren_education_allowance') && { [this.dynamic_column_data[28]?.reportcomponentname || 'Children Education Allowance']: this.filteredEmployees[idx].children_education_allowance }),

              ...(this.isValueGreaterThanZero('rategratuityinhand') && { [this.dynamic_column_data[20]?.reportcomponentname || 'Gratuity Inhand']: this.filteredEmployees[idx].gratuityinhand }),

              [this.dynamic_column_data[4]?.reportcomponentname || 'Special Allowance']: this.filteredEmployees[idx].specialallowance === null || this.filteredEmployees[idx].specialallowance === undefined || this.filteredEmployees[idx].specialallowance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].specialallowance) : this.getRoundedVal(this.filteredEmployees[idx].specialallowance)),

              'Arr Basic': this.filteredEmployees[idx].arr_basic === null || this.filteredEmployees[idx].arr_basic === undefined || this.filteredEmployees[idx].arr_basic === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].arr_basic) : this.getRoundedVal(this.filteredEmployees[idx].arr_basic)),

              'Arr HRA': this.filteredEmployees[idx].arr_hra === null || this.filteredEmployees[idx].arr_hra === undefined || this.filteredEmployees[idx].arr_hra === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].arr_hra) : this.getRoundedVal(this.filteredEmployees[idx].arr_hra)),

              'Arr CONV': this.filteredEmployees[idx].arr_conv === null || this.filteredEmployees[idx].arr_conv === undefined || this.filteredEmployees[idx].arr_conv === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].arr_conv) : this.getRoundedVal(this.filteredEmployees[idx].arr_conv)),

              'Arr Medical': this.filteredEmployees[idx].arr_medical === null || this.filteredEmployees[idx].arr_medical === undefined || this.filteredEmployees[idx].arr_medical === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].arr_medical) : this.getRoundedVal(this.filteredEmployees[idx].arr_medical)),

              'Arr Special Allowance': this.filteredEmployees[idx].arr_specialallowance === null || this.filteredEmployees[idx].arr_specialallowance === undefined || this.filteredEmployees[idx].arr_specialallowance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].arr_specialallowance) : this.getRoundedVal(this.filteredEmployees[idx].arr_specialallowance)),

              'Incentive': this.filteredEmployees[idx].incentive === null || this.filteredEmployees[idx].incentive === undefined || this.filteredEmployees[idx].incentive === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].incentive) : this.getRoundedVal(this.filteredEmployees[idx].incentive)),

              'Refund': this.filteredEmployees[idx].refund === null || this.filteredEmployees[idx].refund === undefined || this.filteredEmployees[idx].refund === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].refund) : this.getRoundedVal(this.filteredEmployees[idx].refund)),

              'Monthly Bonus': this.filteredEmployees[idx].monthly_bonus === null || this.filteredEmployees[idx].monthly_bonus === undefined || this.filteredEmployees[idx].monthly_bonus === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].monthly_bonus) : this.getRoundedVal(this.filteredEmployees[idx].monthly_bonus)),

              'Overtime Allowance': this.filteredEmployees[idx].overtime_allowance === null || this.filteredEmployees[idx].overtime_allowance === undefined || this.filteredEmployees[idx].overtime_allowance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].overtime_allowance) : this.getRoundedVal(this.filteredEmployees[idx].overtime_allowance)),

              'Gross Earning': this.filteredEmployees[idx].grossearning === null || this.filteredEmployees[idx].grossearning === undefined || this.filteredEmployees[idx].grossearning === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),

              'EPF': this.filteredEmployees[idx].epf === null || this.filteredEmployees[idx].epf === undefined || this.filteredEmployees[idx].epf === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].epf) : this.getRoundedVal(this.filteredEmployees[idx].epf)),

              'VPF': this.filteredEmployees[idx].vpf === null || this.filteredEmployees[idx].vpf === undefined || this.filteredEmployees[idx].vpf === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].vpf) : this.getRoundedVal(this.filteredEmployees[idx].vpf)),

              'ESI': this.filteredEmployees[idx].esi === null || this.filteredEmployees[idx].esi === undefined || this.filteredEmployees[idx].esi === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].esi) : this.getRoundedVal(this.filteredEmployees[idx].esi)),

              'TDS': this.filteredEmployees[idx].tds === null || this.filteredEmployees[idx].tds === undefined || this.filteredEmployees[idx].tds === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].tds) : this.getRoundedVal(this.filteredEmployees[idx].tds)),

              'LWF': this.filteredEmployees[idx].lwf === null || this.filteredEmployees[idx].lwf === undefined || this.filteredEmployees[idx].lwf === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].lwf) : this.getRoundedVal(this.filteredEmployees[idx].lwf)),

              'Insurance': this.filteredEmployees[idx].insurance === null || this.filteredEmployees[idx].insurance === undefined || this.filteredEmployees[idx].insurance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].insurance) : this.getRoundedVal(this.filteredEmployees[idx].insurance)),

              'Mobile': this.filteredEmployees[idx].mobile === null || this.filteredEmployees[idx].mobile === undefined || this.filteredEmployees[idx].mobile === '' ? 0 : parseFloat(this.filteredEmployees[idx].mobile),

              'Other': this.filteredEmployees[idx].other === null || this.filteredEmployees[idx].other === undefined || this.filteredEmployees[idx].other === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].other) : this.getRoundedVal(this.filteredEmployees[idx].other)),

              'Loan': this.filteredEmployees[idx].loan === null || this.filteredEmployees[idx].loan === undefined || this.filteredEmployees[idx].loan === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].loan) : this.getRoundedVal(this.filteredEmployees[idx].loan)),

              'Advance': this.filteredEmployees[idx].advance === null || this.filteredEmployees[idx].advance === undefined || this.filteredEmployees[idx].advance === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].advance) : this.getRoundedVal(this.filteredEmployees[idx].advance)),

              'Professional Tax': this.filteredEmployees[idx].professionaltax === null || this.filteredEmployees[idx].professionaltax === undefined || this.filteredEmployees[idx].professionaltax === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].professionaltax) : this.getRoundedVal(this.filteredEmployees[idx].professionaltax)),

              'Charity Contribution': this.filteredEmployees[idx].charity_contribution === null || this.filteredEmployees[idx].charity_contribution === undefined || this.filteredEmployees[idx].charity_contribution === '' ? 0 : this.truncateToTwoDecimals(this.filteredEmployees[idx].charity_contribution),

              'Gross Deduction': this.filteredEmployees[idx].grossdeduction === null || this.filteredEmployees[idx].grossdeduction === undefined || this.filteredEmployees[idx].grossdeduction === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].grossdeduction) : this.getRoundedVal(this.filteredEmployees[idx].grossdeduction)),

              'Net Pay': this.filteredEmployees[idx].netpay === null || this.filteredEmployees[idx].netpay === undefined || this.filteredEmployees[idx].netpay === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay)),

              'A/C No.1': this.filteredEmployees[idx].ac_1 === null || this.filteredEmployees[idx].ac_1 === undefined || this.filteredEmployees[idx].ac_1 === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac_1) : this.getRoundedVal(this.filteredEmployees[idx].ac_1)),

              'A/C No.10': this.filteredEmployees[idx].ac_10 === null || this.filteredEmployees[idx].ac_10 === undefined || this.filteredEmployees[idx].ac_10 === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac_10) : this.getRoundedVal(this.filteredEmployees[idx].ac_10)),

              'A/C No.2': this.filteredEmployees[idx].ac_2 === null || this.filteredEmployees[idx].ac_2 === undefined || this.filteredEmployees[idx].ac_2 === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac_2) : this.getRoundedVal(this.filteredEmployees[idx].ac_2)),

              'A/C No.21': this.filteredEmployees[idx].ac21 === null || this.filteredEmployees[idx].ac21 === undefined || this.filteredEmployees[idx].ac21 === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ac21) : this.getRoundedVal(this.filteredEmployees[idx].ac21)),

              'Employer ESI Contr': this.filteredEmployees[idx].employer_esi_contr === null || this.filteredEmployees[idx].employer_esi_contr === undefined || this.filteredEmployees[idx].employer_esi_contr === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].employer_esi_contr) : this.getRoundedVal(this.filteredEmployees[idx].employer_esi_contr)),

              'LWF Employer': this.filteredEmployees[idx].lwf_employer === null || this.filteredEmployees[idx].lwf_employer === undefined || this.filteredEmployees[idx].lwf_employer === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].lwf_employer) : this.getRoundedVal(this.filteredEmployees[idx].lwf_employer)),

              'Employer Insurance':
                (!this.isShowRoundedVal ? this.filteredEmployees[idx].employerinsuranceamount : this.getRoundedVal(this.filteredEmployees[idx].employerinsuranceamount)),

              'Salary Status': this.filteredEmployees[idx].salarystatus,

              'Arrear Months': this.filteredEmployees[idx].arearaddedmonths,

              'Total Arrear':
                (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].totalarear) : this.getRoundedVal(this.filteredEmployees[idx].totalarear)),

              'Voucher Amount': this.filteredEmployees[idx].voucher_amount === null || this.filteredEmployees[idx].voucher_amount === undefined || this.filteredEmployees[idx].voucher_amount === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].voucher_amount) : this.getRoundedVal(this.filteredEmployees[idx].voucher_amount)),

              'EWS': this.filteredEmployees[idx].ews === null || this.filteredEmployees[idx].ews === undefined || this.filteredEmployees[idx].ews === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].ews) : this.getRoundedVal(this.filteredEmployees[idx].ews)),

              'Gratuity': this.filteredEmployees[idx].gratuity === null || this.filteredEmployees[idx].gratuity === undefined || this.filteredEmployees[idx].gratuity === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].gratuity) : this.getRoundedVal(this.filteredEmployees[idx].gratuity)),

              'Bonus': this.filteredEmployees[idx].bonus === null || this.filteredEmployees[idx].bonus === undefined || this.filteredEmployees[idx].bonus === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].bonus) : this.getRoundedVal(this.filteredEmployees[idx].bonus)),

              'Date of Relieveing': this.filteredEmployees[idx].dateofrelieveing,

              'Employee NPS': this.filteredEmployees[idx].employeenps === null || this.filteredEmployees[idx].employeenps === undefined || this.filteredEmployees[idx].employeenps === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].employeenps) : this.getRoundedVal(this.filteredEmployees[idx].employeenps)),

              'Other Ledger Arrears': this.filteredEmployees[idx].otherledgerarears === null || this.filteredEmployees[idx].otherledgerarears === undefined || this.filteredEmployees[idx].otherledgerarears === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].otherledgerarears) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerarears)),

              'Other Ledger Deductions': this.filteredEmployees[idx].otherledgerdeductions === null || this.filteredEmployees[idx].otherledgerdeductions === undefined || this.filteredEmployees[idx].otherledgerdeductions === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].otherledgerdeductions) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerdeductions)),

              'Other Variables': this.filteredEmployees[idx].otherledgerdeductions === null || this.filteredEmployees[idx].otherledgerdeductions === undefined || this.filteredEmployees[idx].otherledgerdeductions === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].otherledgerdeductions) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerdeductions)),

              'Other Ledger Arrear Without ESI': this.filteredEmployees[idx].otherledgerarearwithoutesi === null || this.filteredEmployees[idx].otherledgerarearwithoutesi === undefined || this.filteredEmployees[idx].otherledgerarearwithoutesi === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].otherledgerarearwithoutesi) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerarearwithoutesi)),

              'Other Bonus With ESI': this.filteredEmployees[idx].otherbonuswithesi === null || this.filteredEmployees[idx].otherbonuswithesi === undefined || this.filteredEmployees[idx].otherbonuswithesi === '' ? 0 : (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].otherbonuswithesi) : this.getRoundedVal(this.filteredEmployees[idx].otherbonuswithesi)),

              // this.liability_data[idx].otherbonuswithesi,

              'Insurance Type': this.filteredEmployees[idx].insurancetype,

              'Attendance Mode': this.filteredEmployees[idx].attendancemode,
              // 'Contract No.': this.liability_data[idx].contractno1,
              'Biometric Id': this.filteredEmployees[idx].biometricid,
              ...(this.isValueGreaterThanZero('tea_allowance') && { 'Tea Allowance': this.filteredEmployees[idx].tea_allowance }),

              'CTC': (!this.isShowRoundedVal ? this.truncateToTwoDecimals(this.filteredEmployees[idx].monthctc) : this.getRoundedVal(this.filteredEmployees[idx].monthctc)),
            }
            exportData.push(obj);
          }
        }
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = 'Annual_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
      }
    })
  }
  SaveColumnValues() {
    if (this.selectedDynmicColumnValues.length > 0) {
      this._ReportService.manage_report_columns_wfm({
        "action": "save_report_columns",
        "report_name": "annualReport",
        "accountid": this.tp_account_id.toString(),
        "report_description": "Annual Reports",
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

    this._ReportService.manage_report_columns_wfm({
      "action": "get_report_columns",
      "report_name": "annualReport",
      "accountid": this.tp_account_id.toString(),
      "productTypeId": this.product_type
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.selectedDynmicColumnValues = JSON.parse(resData.commonData[0]?.report_column_text);
        this.selectedDynmicColumnValues.forEach((el: any) => {
          this.showfields[el] = true
        })
      }
    });
  }

  intialize_show_fields() {
    this.showfields = {
      disbursementmode: false,
      S_No: false,
      dateofbirth: false,
      pan_number: false,
      uannumber: false,
      ratehra: false,
      ratemedical: false,
      jobtype: false,
      unitparametername: false,
      epf: false,
      mobile: false,
      mon: false,
      lossofpay: false,
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
      employerinsuranceamount: false,
      vpf: false,
      tds: false,
      attendancemode: false,
      loan: false,
      lwf: false,
      insurance: false,
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
      posting_department: false,
      subunit: false,
      dateofleaving: false,
      arrear_days: false,
      loss_off_pay: false,
      rateconv: false,
      ratespecialallowance: false,
      basic: false,
      hra: false,
      conv: false,
      medical: false,
      specialallowance: false,
      arr_basic: false,
      arr_hra: false,
      arr_conv: false,
      arr_medical: false,
      arr_specialallowance: false,
      monthly_bonus: false,
      esi: false,
      loanrecovery: false,
      employer_esi_contr: false,
      advance: false,
      advancerecovery: false,
      other: false,
      lwf_employer: false,
      salarystatus: false,
      arearaddedmonths: false,
      totalarear: false,
      gratuity: false,
      otherledgerdeductions: false,
      otherbonuswithesi: false,
      insurancetype: false,
      // contractno1:false,
      ratesalarybonus: false,
      salarybonus: false,
      ratecommission: false,
      commission: false,
      ratetransport_allowance: false,
      transport_allowance: false,
      ratetravelling_allowance: false,
      travelling_allowance: false,
      rateleave_encashment: false,
      leave_encashment: false,
      rateovertime_allowance: false,
      overtime_allowance: false,
      ratenotice_pay: false,
      notice_pay: false,
      ratehold_salary_non_taxable: false,
      hold_salary_non_taxable: false,
      ratechildren_education_allowance: false,
      children_education_allowance: false,
      rategratuityinhand: false,
      gratuityinhand: false,
      biometricid: false,
      tea_allowance: false
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
