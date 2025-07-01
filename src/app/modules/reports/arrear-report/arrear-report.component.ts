import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { HelpAndSupportService } from '../../help-and-support/help-and-support.service';
import { AttendanceService } from '../../attendance/attendance.service';
import { dongleState, grooveState } from 'src/app/app.animation';

@Component({
  selector: 'app-arrear-report',
  templateUrl: './arrear-report.component.html',
  styleUrls: ['./arrear-report.component.css']
})
export class ArrearReportComponent {
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
  selectAll: boolean = false;
  showSelectionCheckboxes: boolean = true;

  fieldarray: any = [
    { name: 'S.No', value: 'S_No' },
    { name: 'Month', value: 'mon' },
    { name: 'Email ID', value: 'email' },
    { name: 'Father/Husband Name', value: 'fathername' },
    { name: 'Date of Birth', value: 'dateofbirth' },
    { name: 'Date of Joining', value: 'dateofjoining' },
    { name: 'Date of Leaving', value: 'dateofleaving' },
    { name: 'Unit Parameter Name', value: 'unitparametername' },
    { name: 'Subunit', value: 'subunit' },
    { name: 'Department', value: 'posting_department' },
    { name: 'Designation', value: 'designation' },
    { name: 'JobType', value: 'jobtype' },
    { name: 'Pan Number', value: 'pan_number' },
    { name: 'UAN', value: 'uannumber' },
    { name: 'ESI Number', value: 'esinumber' },

    { name: 'Total Paid Days', value: 'total_paid_days' },
    { name: 'Loss of Pay', value: 'loss_off_pay' },
    // Missing - Total Leaves

    { name: 'Rate Basic', value: 'ratebasic' },
    { name: 'Rate HRA', value: 'ratehra' },
    { name: 'Rate Special Allowance', value: 'ratespecialallowance' },
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

    { name: 'Rate Employer Insurance Amount', value: 'rate_employerinsuranceamount' },
    { name: 'Rate Employer LWF', value: 'rate_employerlwf' },
    { name: 'Rate Employer EPF', value: 'rate_employerepf' },
    { name: 'Rate Employer ESI', value: 'rate_employeresi' },

    { name: 'Fixed Allowances Total Rate', value: 'fixedallowancestotalrate' },
    // Missing -  Rate Gross
    // Missing -  Employer EPF
    // Missing -  Employer ESIC
    { name: 'Employer EPF', value: 'employerepf' }, // new employerepf
    { name: 'Employer Insurance', value: 'employerinsuranceamount' },

    { name: 'Arr Basic', value: 'arr_basic' },
    { name: 'Arr Hra', value: 'arr_hra' },
    { name: 'Arr CONV', value: 'arr_conv' },
    { name: 'Arr Medical', value: 'arr_medical' },
    { name: 'Arr Special Allowance', value: 'arr_specialallowance' },
    { name: 'Arrear Days', value: 'arrear_days' },
    { name: 'Arrear Months', value: 'arearaddedmonths' },
    { name: 'Arrear EPF', value: 'epf_arear' },
    { name: 'Total Arrear', value: 'totalarear' },
    { name: 'Other Ledger Arrears', value: 'otherledgerarear' },
    { name: 'Other Ledger Arrear Without ESI', value: 'otherledgerarearwithoutesi' },

    // Earnings
    { name: 'Basic', value: 'basic' },
    { name: 'HRA', value: 'hra' },
    { name: 'Special Allowance', value: 'specialallowance' },
    { name: 'CONV', value: 'conv' },
    { name: 'Medical', value: 'medical' },
    { name: 'Commission', value: 'commission' },
    { name: 'Transport Allowance', value: 'transport_allowance' },
    { name: 'Travelling Allowance', value: 'travelling_allowance' },
    { name: 'Salary Bonus', value: 'salarybonus' },
    { name: 'Leave Encashment', value: 'leave_encashment' },
    { name: 'Overtime Allowance', value: 'overtime_allowance' },
    { name: 'Notice Pay', value: 'notice_pay' },
    { name: 'Hold Salary Non Taxable', value: 'hold_salary_non_taxable' },
    { name: 'Children Education Allowance', value: 'children_education_allowance' },
    { name: 'Gratuity Inhand', value: 'gratuityinhand' },
    { name: 'Incentive', value: 'incentive' },
    { name: 'Refund', value: 'refund' },
    { name: 'Monthly Bonus', value: 'monthly_bonus' },
    { name: 'Other Bonus With ESI', value: 'otherbonuswithesi' },
    { name: 'Tea Allowance', value: 'tea_allowance' },
    { name: 'Voucher Amount', value: 'voucher_amount' },
    { name: 'EWS', value: 'ews' },
    { name: 'Gratuity', value: 'gratuity' },
    { name: 'Bonus', value: 'bonus' },
    { name: 'Employee NPS', value: 'employeenps' },
    { name: 'Salary Status', value: 'salarystatus' },
    { name: 'Insurance Excluded From CTC', value: 'insurancetype' },

    // Deductions
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
    { name: 'Advance Recovery', value: 'advancerecovery' },
    { name: 'Professional Tax', value: 'professionaltax' },
    { name: 'A/c  No.1', value: 'ac_1' },
    { name: 'A/c  No.10', value: 'ac_10' },
    { name: 'A/c  No.2', value: 'ac_2' },
    { name: 'A/c  No.21', value: 'ac21' },
    { name: 'Employer ESI Contr', value: 'employer_esi_contr' },
    { name: 'Employer LWF', value: 'lwf_employer' },
    { name: 'Other Ledger Deductions', value: 'otherledgerdeductions' },
    { name: 'Other Variables', value: 'othervariables' },

    // Others
    { name: 'Advance', value: 'advance' },
    { name: 'Mode of Attendance', value: 'attendancemode' },
    { name: 'Biometric Id', value: 'biometricid' },
    { name: 'Disbursement Mode', value: 'disbursementmode' },
    { name: 'Vendor Name', value: 'vendor_name' },
    { name: 'Project Name', value: 'project_name' },
    { name: 'Salary Book Project', value: 'salary_book_project' }

    // { name: 'Contract No.', value: 'contractno1' },
    //  { name: 'Contract Start Date ', value: 'contractstartdate' },
    //  { name: 'Contract End Date', value: 'contractenddate' },



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

  notificationForm: FormGroup;
  showNotificationPopup: boolean = false;
  roles_master_data: any = [];
  user_by_role_id_data: any = [];
  showTicketsTable: boolean = false;
  ticketStatusMaster: any = [];
  ticketsDetails: any = [];
  filtered_ticket_status: any;
  update_ticket_data: any = [];
  Create_Ticket_Form: FormGroup;
  ticket_id: any;
  emp_name: any;
  emp_code: any;
  status: any;
  ticket_trail_data: any = [];
  ticketMasterData: any = [];
  unread_query_cnt_data: any = [];
  deleteLiabilityForm: FormGroup;
  arrear_earnings_allowances_cols: any[];
  rate_cols: any[];

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _BusinesSettingsService: BusinesSettingsService,
    private _ReportService: ReportService,
    private _alertservice: AlertService,
    private helpAndSupportService: HelpAndSupportService,
    private _attendanceService: AttendanceService,
  ) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    // this.product_type = token.product_type;
    this.employer_name = this.token.name;
    this.product_type = localStorage.getItem('product_type');
    const date = new Date();
    let currentMonth = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
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
    this.selected_date = localStorage.getItem('selected_date') || null;

    if (this.selected_date) {
      this.days_count = this.selected_date.split('-')[0];
      this.month = this.selected_date.split('-')[1];
      this.year = this.selected_date.split('-')[2];
      // console.log("A",this.month,this.year);
    } else {
      this.month = currentMonth.toString();
      this.year = currentYear.toString();
      // console.log("B",this.month,this.year);
    }
    var checkboxes = document.querySelectorAll(
      '.dropdown-item input[type="checkbox"]'
    );
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener('click', function (event) {
        event.stopPropagation(); // Prevent click event from propagating to parent elements
      });
    });

    this.Create_Ticket_Form = this._formBuilder.group({
      ticketComment: ['', [Validators.required]],
    });

    this.notificationForm = this._formBuilder.group({
      team: [''],
      user_id: [''],
      message: [''],
      emp_code: [''],
      query_comment: [''],
      subject_id: [''],
      subject_desc: [''],
    })

    this.deleteLiabilityForm = this._formBuilder.group({
      reason: ["", Validators.required]
    })

    this.GetReport_Fields();
    this.get_geo_fencing_list();
    // this.get_att_unit_master_list();
    this.get_att_dept_master_list();
    this.get_att_role_master_list();
    this.LiabilityReport();
    this.getColumnValues();


    //For Ticket notifications
    // this.get_roles_master();
    // this.getTicketMaster();
    // this.get_ticket_status_master();
    // this.Get_Unread_Tickets();

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  openSidebar() {
    this.sidebarWidth = '400px';
  }

  applyFilters(filters: any) {
    // console.log(filters);
    this.month = filters.month;
    this.year = filters.year;
    this.invKey = filters.invKey,
      this.selectedUnitId = filters.unitId,
      this.selectedDepartmentId = filters.departmentId,
      this.selectedDesignationId = filters.designationId,

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
    // console.log(this.selectedDynmicColumnValues, 'this.selectedDynmicColumnValues')
  }

  fieldshowdata(name: any) {
    return this.showfields[name] ? 'checked' : null;
  }

  changeMonth(e: any) {
    // console.log(e.target.value);
    this.month = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    this.loading = true;
    this.LiabilityReport();
  }

  changeYear(e: any) {
    // console.log(this.year);
    this.year = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    this.loading = true;
    this.LiabilityReport();
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
    this.invKey = key;
    this.p = 0;
    // console.log(this.liability_data, key);

    this.filteredEmployees = this.liability_data.filter(function (element: any) {
      return (element.employee_name.toLowerCase().includes(key.toLowerCase())
        || element.emp_code.toString().toLowerCase().includes(key.toLowerCase()) ||
        element.orgempcode?.toString().toLowerCase().includes(key.toLowerCase()) ||
        element.tpcode.toString().toLowerCase().includes(key.toLowerCase())
      )
    });

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
  // get_att_unit_master_list() {
  //   this._ReportService.GetMaster_Dropdown({
  //     "actionType": "GetMasterUnitNames",
  //     "productTypeId": this.product_type,
  //     "customerAccountId": this.tp_account_id.toString(),
  //   }).subscribe((resData: any) => {
  //     if (resData.statusCode) {
  //       // Ensure commonData is an array, or fallback to an empty array
  //       this.unit_master_list_data = Array.isArray(resData.commonData) ? resData.commonData : [];
  //       if (!this.unit_master_list_data.some((unit: any) => unit.unitname === this.selectedUnitId)) {
  //         this.selectedUnitId = 'All';  // Reset if the previously selected unit no longer exists
  //       }
  //     } else {
  //       this.unit_master_list_data = [];
  //       console.log(resData.message);
  //     }
  //   });
  // }

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
        console.log(resData.message);
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
        console.log(resData.message);
      }
    });
  }

  GetReport_Fields() {
    this._ReportService.GetReportFields({
      "reportName": "Liability",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.dynamic_column_data = resData.commonData;
        // console.log("original - dynamic_column_data", this.dynamic_column_data);

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
          } else if (component.includes('allowance')) {
            allowanceItems.push(item);
          } else {
            earningItems.push(item); // default is earning
          }
        });

        this.rate_cols = [
          ...rateItems
        ];
        //  console.log("Earning Items", earningItems);
        // console.log("Rate Columns", this.rate_cols);
       
        // console.log("Arrear Items", arrearItems);
        this.arrear_earnings_allowances_cols = [
          ...earningItems,
          ...arrearItems,
          ...allowanceItems
        ]

        // Now use orderedData wherever needed
        // console.log("Updated - dynamic_column_data",this.dynamic_column_data);

      } else {
        this.dynamic_column_data = [];
        console.log(resData.message);
      }
    });
  }

  LiabilityReport() {
    this.loading = true;
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

    this._ReportService.DisbursmentReportApi({
      "action": "ArrearDisbursementDetails",
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
      this.loading = false;
      //console.log(resData);
      if (resData.statusCode) {
        this.liability_data = resData.commonData;
        // this.filteredEmployees = this.liability_data;
        this.filteredEmployees = this.liability_data.map(item => ({ ...item, selected: false }));
        // console.log("filteredEmployees", this.filteredEmployees);
        this.search(this.invKey);
      } else {
        this.filteredEmployees = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  DetailedLiabilityReportByEmpCode(Emp_code: any, orgempcode: any) {
    this.Emp = Emp_code;
    this.tpcode = orgempcode;
    // console.log(this.Emp);
    this._ReportService.GetDetailedLiabilityReportByEmpCode({
      "year": this.year,
      "month": this.month,
      "empCode": this.Emp?.toString(),
      "customerAccountId": this.tp_account_id.toString(),
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.data = (resData.commonData);
      } else {
        this.data = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  // added on dated. 12.03.2025 by prabhat
  /*********For Ticket Notifications********** */
  // exportToExcelTable() {
  //   const table = document.getElementById('preAttendaceTable');
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
  //   XLSX.writeFile(workbook, 'Liability_Report_' + this.employer_name.replaceAll(' ', '').trim() + "" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx');
  // }

  // start - new export excel updated logic - sidharth kaul dated. 04.06.2025
  exportToExcelTable() {
    const table = document.getElementById('preAttendaceTable');
    if (!table) {
      console.error('Table not found!');
      return;
    }

    const clonedTable = table.cloneNode(true) as HTMLTableElement;

    // Remove first column
    const headerRow = clonedTable.querySelector('thead tr') as HTMLTableRowElement;
    if (headerRow) headerRow.deleteCell(0);
    clonedTable.querySelectorAll('tbody tr').forEach(row => (row as HTMLTableRowElement).deleteCell(0));

    // Identify columns
    const headerCells = Array.from(headerRow.cells).map(cell => cell.textContent?.trim().toLowerCase() || '');
    console.log(headerCells);
    const monthColIndex = headerCells.findIndex(h => h === 'month');
    const dateCols = ['date of birth', 'date of joining', 'date of leaving']; // Add more if needed
    const dateColIndices = headerCells.reduce((acc: number[], col, idx) => {
      if (dateCols.includes(col)) acc.push(idx);
      return acc;
    }, []);

    // Columns to keep as string (do not convert to number)
    const stringCols = [
      'mobile', 'pf number', 'esi number', 'bank account no', 'ifsc', 'uan'
    ];
    const stringColIndices = headerCells.reduce((acc: number[], col, idx) => {
      if (stringCols.includes(col)) acc.push(idx);
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

    // Post-process worksheet to convert numeric strings to numbers (except date columns)
    const range = XLSX.utils.decode_range(worksheet['!ref'] || '');
    for (let R = range.s.r + 1; R <= range.e.r; ++R) { // skip header row
      for (let C = range.s.c; C <= range.e.c; ++C) {
        if (!dateColIndices.includes(C) && !stringColIndices.includes(C)) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];
          if (cell && typeof cell.v === 'string' && cell.v.trim() !== '' && !isNaN(Number(cell.v))) {
            cell.v = Number(cell.v);
            cell.t = 'n'; // set type to number
          }
        }
      }
    }

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(
      workbook,
      'Arrear_Report_' +
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
  //   const unitIds = this.selectedUnitId.length === this.unit_master_list_data.length
  //     ? this.unit_master_list_data.map(unit => unit.unitid).join(',')
  //     : this.selectedUnitId.map(unit => unit.unitid).join(',');

  //   // Handle postingDepartment
  //   const postingDepartment = this.selectedDepartmentId.length === this.department_master_list_data.length
  //     ? this.department_master_list_data.map(dept => dept.posting_department).join(',')
  //     : this.selectedDepartmentId.map(dept => dept.posting_department).join(',');

  //   const postOffered = this.selectedDesignationId.length === this.role_master_list_data.length
  //     ? this.role_master_list_data.map(dept => dept.post_offered).join(',')
  //     : this.selectedDesignationId.map(dept => dept.post_offered).join(',');

  //   this._ReportService.LiabilityReportApi({
  //     "year": this.year,
  //     "month": this.month,
  //     "individualSearch": "",
  //     "contractIdSearch": "",
  //     "customerAccountId": this.tp_account_id.toString(),
  //     "GeoFenceId": this.token.geo_location_id,
  //     "unitParameterName": unitIds,
  //     "postOffered": postOffered,
  //     "postingDepartment": postingDepartment
  //   }).subscribe((resData: any) => {
  //     if (resData.statusCode) {
  //       this.liability_data = resData.commonData;
  //       // console.log(this.liability_data);
  //       let exportData = [];
  //       let days = {};
  //       let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
  //       for (let i = 0; i < resData.commonData.length; i++) {
  //         let head = resData.commonData[i].w_date_d
  //         // + resData.commonData[i].dayname;
  //         days = {
  //           ...days, [head]: ''
  //         }
  //       }

  //       if (!this.includeEmployeeDetails) {

  //         for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
  //           const orgEmpCode = this.filteredEmployees[idx]?.orgempcode;
  //           const tpcode = this.filteredEmployees[idx]?.tpcode;
  //           const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;

  //           let obj = {
  //             'Employee': this.filteredEmployees[idx].emp_name,
  //             'TP / Org Emp Code': tpOrgEmpCode,
  //             'Gross Earning': this.filteredEmployees[idx].grossearning === null || this.filteredEmployees[idx].grossearning === undefined || this.filteredEmployees[idx].grossearning === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),
  //             'Gross Deduction': this.filteredEmployees[idx].grossdeduction === null || this.filteredEmployees[idx].grossdeduction === undefined || this.filteredEmployees[idx].grossdeduction === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].grossdeduction) : this.getRoundedVal(this.filteredEmployees[idx].grossdeduction)),
  //             'Net Pay': this.filteredEmployees[idx].netpay === null || this.filteredEmployees[idx].netpay === undefined || this.filteredEmployees[idx].netpay === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay)),
  //           }

  //           exportFields.forEach(field => {
  //             obj[field.name] = this.filteredEmployees[idx][field.value];
  //           });
  //           exportData.push(obj);
  //         }
  //       }

  //       else {

  //         for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
  //           const orgEmpCode = this.filteredEmployees[idx]?.orgempcode;
  //           const tpcode = this.filteredEmployees[idx]?.tpcode;
  //           const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
  //           let obj = {
  //             'Disbursementmode': this.filteredEmployees[idx].disbursementmode,
  //             'Month': this.filteredEmployees[idx].mon,
  //             'TP / Org Emp Code': tpOrgEmpCode,
  //             'Employee Name': this.filteredEmployees[idx].emp_name,
  //             'Father Name': this.filteredEmployees[idx].fathername,
  //             'Designation': this.filteredEmployees[idx].designation,
  //             'Department': this.filteredEmployees[idx].posting_department?.split('#')[0],
  //             'Job Type': this.filteredEmployees[idx].jobtype,
  //             'Unit Parameter Name': this.filteredEmployees[idx].unitparametername,
  //             'Subunit': this.filteredEmployees[idx].subunit,
  //             'Date of Joining': this.filteredEmployees[idx].dateofjoining,
  //             'Date of Birth': this.filteredEmployees[idx].dateofbirth,
  //             'ESI Number': this.filteredEmployees[idx].esinumber,
  //             'PAN Number': this.filteredEmployees[idx].pan_number,
  //             'UAN Number': this.filteredEmployees[idx].uannumber,
  //             'Email': this.filteredEmployees[idx].email,
  //             'Date of Leaving': this.filteredEmployees[idx].dateofleaving,
  //             'Arrear Days': this.filteredEmployees[idx].arrear_days,
  //             'Loss Off Pay': this.filteredEmployees[idx].loss_off_pay === null || this.filteredEmployees[idx].loss_off_pay === undefined || this.filteredEmployees[idx].loss_off_pay === '' ? 0 : parseFloat(this.filteredEmployees[idx].loss_off_pay),
  //             'Total Paid Days': this.filteredEmployees[idx].total_paid_days === null || this.filteredEmployees[idx].total_paid_days === undefined || this.filteredEmployees[idx].total_paid_days === '' ? 0 : parseFloat(this.filteredEmployees[idx].total_paid_days),
  //             [this.dynamic_column_data[1]?.reportcomponentname || 'Rate Basic']: this.filteredEmployees[idx].ratebasic === null || this.filteredEmployees[idx].ratebasic === undefined || this.filteredEmployees[idx].ratebasic === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ratebasic) : this.getRoundedVal(this.filteredEmployees[idx].ratebasic)),

  //             [this.dynamic_column_data[3]?.reportcomponentname || 'Rate HRA']: this.filteredEmployees[idx].ratehra === null || this.filteredEmployees[idx].ratehra === undefined || this.filteredEmployees[idx].ratehra === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ratehra) : this.getRoundedVal(this.filteredEmployees[idx].ratehra)),

  //             [this.dynamic_column_data[7]?.reportcomponentname || 'Rate CONV']: this.filteredEmployees[idx].rateconv === null || this.filteredEmployees[idx].rateconv === undefined || this.filteredEmployees[idx].rateconv === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].rateconv) : this.getRoundedVal(this.filteredEmployees[idx].rateconv)),

  //             [this.dynamic_column_data[9]?.reportcomponentname || 'Rate Medical']: this.filteredEmployees[idx].ratemedical === null || this.filteredEmployees[idx].ratemedical === undefined || this.filteredEmployees[idx].ratemedical === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ratemedical) : this.getRoundedVal(this.filteredEmployees[idx].ratemedical)),

  //             ...(this.isValueGreaterThanZero('ratesalarybonus') && { [this.dynamic_column_data[11]?.reportcomponentname || 'Rate Salary Bonus']: this.filteredEmployees[idx].ratesalarybonus }),

  //             ...(this.isValueGreaterThanZero('ratecommission') && { [this.dynamic_column_data[13]?.reportcomponentname || 'Rate Commission']: this.filteredEmployees[idx].ratecommission }),

  //             ...(this.isValueGreaterThanZero('ratetransport_allowance') && { [this.dynamic_column_data[15]?.reportcomponentname || 'Rate Transport Allowance']: this.filteredEmployees[idx]?.ratetransport_allowance }),

  //             ...(this.isValueGreaterThanZero('ratetravelling_allowance') && { [this.dynamic_column_data[17]?.reportcomponentname || 'Rate Travelling Allowance']: this.filteredEmployees[idx].ratetravelling_allowance }),

  //             ...(this.isValueGreaterThanZero('rateleave_encashment') && { [this.dynamic_column_data[19]?.reportcomponentname || 'Rate Leave Encashment']: this.filteredEmployees[idx].rateleave_encashment }),

  //             ...(this.isValueGreaterThanZero('overtime_allowance') && { [this.dynamic_column_data[23]?.reportcomponentname || 'Rate Overtime Allowance']: this.filteredEmployees[idx].rateovertime_allowance }),

  //             ...(this.isValueGreaterThanZero('ratenotice_pay') && { [this.dynamic_column_data[25]?.reportcomponentname || 'Rate Notice Pay']: this.filteredEmployees[idx].ratenotice_pay }),

  //             ...(this.isValueGreaterThanZero('ratehold_salary_non_taxable') && { [this.dynamic_column_data[27]?.reportcomponentname || 'Rate Hold Salary Non Taxable']: this.filteredEmployees[idx].ratehold_salary_non_taxable }),

  //             ...(this.isValueGreaterThanZero('ratechildren_education_allowance') && { [this.dynamic_column_data[29]?.reportcomponentname || 'Rate Children Education Allowance']: this.filteredEmployees[idx].ratechildren_education_allowance }),

  //             ...(this.isValueGreaterThanZero('rategratuityinhand') && { [this.dynamic_column_data[21]?.reportcomponentname || 'Rate Gratuity Inhand']: this.filteredEmployees[idx].rategratuityinhand }),

  //             [this.dynamic_column_data[5]?.reportcomponentname || 'Rate Special Allowance']: this.filteredEmployees[idx].ratespecialallowance === null || this.filteredEmployees[idx].ratespecialallowance === undefined || this.filteredEmployees[idx].ratespecialallowance === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ratespecialallowance) : this.getRoundedVal(this.filteredEmployees[idx].ratespecialallowance)),

  //             'Fixed Allowances Total Rate': this.filteredEmployees[idx].fixedallowancestotalrate === null || this.filteredEmployees[idx].fixedallowancestotalrate === undefined || this.filteredEmployees[idx].fixedallowancestotalrate === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].fixedallowancestotalrate) : this.getRoundedVal(this.filteredEmployees[idx].fixedallowancestotalrate)),

  //             [this.dynamic_column_data[0]?.reportcomponentname || 'Basic']: this.filteredEmployees[idx].basic === null || this.filteredEmployees[idx].basic === undefined || this.filteredEmployees[idx].basic === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].basic) : this.getRoundedVal(this.filteredEmployees[idx].basic)),

  //             [this.dynamic_column_data[2]?.reportcomponentname || 'HRA']: this.filteredEmployees[idx].hra === null || this.filteredEmployees[idx].hra === undefined || this.filteredEmployees[idx].hra === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].hra) : this.getRoundedVal(this.filteredEmployees[idx].hra)),

  //             [this.dynamic_column_data[6]?.reportcomponentname || 'CONV']: this.filteredEmployees[idx].conv === null || this.filteredEmployees[idx].conv === undefined || this.filteredEmployees[idx].conv === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].conv) : this.getRoundedVal(this.filteredEmployees[idx].conv)),

  //             [this.dynamic_column_data[8]?.reportcomponentname || 'Medical']: this.filteredEmployees[idx].medical === null || this.filteredEmployees[idx].medical === undefined || this.filteredEmployees[idx].medical === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].medical) : this.getRoundedVal(this.filteredEmployees[idx].medical)),

  //             ...(this.isValueGreaterThanZero('ratesalarybonus') && { [this.dynamic_column_data[10]?.reportcomponentname || 'Salary Bonus']: this.filteredEmployees[idx].salarybonus }),

  //             ...(this.isValueGreaterThanZero('ratecommission') && { [this.dynamic_column_data[12]?.reportcomponentname || 'Commission']: this.filteredEmployees[idx].commission }),

  //             ...(this.isValueGreaterThanZero('ratetransport_allowance') && { [this.dynamic_column_data[14]?.reportcomponentname || 'Transport Allowance']: this.filteredEmployees[idx].transport_allowance }),

  //             ...(this.isValueGreaterThanZero('ratetravelling_allowance') && { [this.dynamic_column_data[16]?.reportcomponentname || 'Travelling Allowance']: this.filteredEmployees[idx].travelling_allowance }),

  //             ...(this.isValueGreaterThanZero('rateleave_encashment') && { [this.dynamic_column_data[18]?.reportcomponentname || 'Leave Encashment']: this.filteredEmployees[idx].leave_encashment }),

  //             ...(this.isValueGreaterThanZero('overtime_allowance') && { [this.dynamic_column_data[22]?.reportcomponentname || 'Overtime Allowance']: this.filteredEmployees[idx].overtime_allowance }),

  //             ...(this.isValueGreaterThanZero('ratenotice_pay') && { [this.dynamic_column_data[24]?.reportcomponentname || 'Notice Pay']: this.filteredEmployees[idx].notice_pay }),

  //             ...(this.isValueGreaterThanZero('ratehold_salary_non_taxable') && { [this.dynamic_column_data[26]?.reportcomponentname || 'Hold Salary Non Taxable']: this.filteredEmployees[idx].hold_salary_non_taxable }),

  //             ...(this.isValueGreaterThanZero('ratechildren_education_allowance') && { [this.dynamic_column_data[28]?.reportcomponentname || 'Children Education Allowance']: this.filteredEmployees[idx].children_education_allowance }),

  //             ...(this.isValueGreaterThanZero('rategratuityinhand') && { [this.dynamic_column_data[20]?.reportcomponentname || 'Gratuity Inhand']: this.filteredEmployees[idx].gratuityinhand }),

  //             [this.dynamic_column_data[4]?.reportcomponentname || 'Special Allowance']: this.filteredEmployees[idx].specialallowance === null || this.filteredEmployees[idx].specialallowance === undefined || this.filteredEmployees[idx].specialallowance === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].specialallowance) : this.getRoundedVal(this.filteredEmployees[idx].specialallowance)),

  //             'Arr Basic': this.filteredEmployees[idx].arr_basic === null || this.filteredEmployees[idx].arr_basic === undefined || this.filteredEmployees[idx].arr_basic === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].arr_basic) : this.getRoundedVal(this.filteredEmployees[idx].arr_basic)),

  //             'Arr HRA': this.filteredEmployees[idx].arr_hra === null || this.filteredEmployees[idx].arr_hra === undefined || this.filteredEmployees[idx].arr_hra === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].arr_hra) : this.getRoundedVal(this.filteredEmployees[idx].arr_hra)),

  //             'Arr CONV': this.filteredEmployees[idx].arr_conv === null || this.filteredEmployees[idx].arr_conv === undefined || this.filteredEmployees[idx].arr_conv === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].arr_conv) : this.getRoundedVal(this.filteredEmployees[idx].arr_conv)),

  //             'Arr Medical': this.filteredEmployees[idx].arr_medical === null || this.filteredEmployees[idx].arr_medical === undefined || this.filteredEmployees[idx].arr_medical === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].arr_medical) : this.getRoundedVal(this.filteredEmployees[idx].arr_medical)),

  //             'Arr Special Allowance': this.filteredEmployees[idx].arr_specialallowance === null || this.filteredEmployees[idx].arr_specialallowance === undefined || this.filteredEmployees[idx].arr_specialallowance === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].arr_specialallowance) : this.getRoundedVal(this.filteredEmployees[idx].arr_specialallowance)),

  //             'Incentive': this.filteredEmployees[idx].incentive === null || this.filteredEmployees[idx].incentive === undefined || this.filteredEmployees[idx].incentive === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].incentive) : this.getRoundedVal(this.filteredEmployees[idx].incentive)),

  //             'Refund': this.filteredEmployees[idx].refund === null || this.filteredEmployees[idx].refund === undefined || this.filteredEmployees[idx].refund === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].refund) : this.getRoundedVal(this.filteredEmployees[idx].refund)),

  //             'Monthly Bonus': this.filteredEmployees[idx].monthly_bonus === null || this.filteredEmployees[idx].monthly_bonus === undefined || this.filteredEmployees[idx].monthly_bonus === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].monthly_bonus) : this.getRoundedVal(this.filteredEmployees[idx].monthly_bonus)),

  //             'Overtime Allowance': this.filteredEmployees[idx].overtime_allowance === null || this.filteredEmployees[idx].overtime_allowance === undefined || this.filteredEmployees[idx].overtime_allowance === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].overtime_allowance) : this.getRoundedVal(this.filteredEmployees[idx].overtime_allowance)),

  //             'Gross Earning': this.filteredEmployees[idx].grossearning === null || this.filteredEmployees[idx].grossearning === undefined || this.filteredEmployees[idx].grossearning === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),

  //             'EPF': this.filteredEmployees[idx].epf === null || this.filteredEmployees[idx].epf === undefined || this.filteredEmployees[idx].epf === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].epf) : this.getRoundedVal(this.filteredEmployees[idx].epf)),

  //             'VPF': this.filteredEmployees[idx].vpf === null || this.filteredEmployees[idx].vpf === undefined || this.filteredEmployees[idx].vpf === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].vpf) : this.getRoundedVal(this.filteredEmployees[idx].vpf)),

  //             'ESI': this.filteredEmployees[idx].esi === null || this.filteredEmployees[idx].esi === undefined || this.filteredEmployees[idx].esi === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].esi) : this.getRoundedVal(this.filteredEmployees[idx].esi)),

  //             'TDS': this.filteredEmployees[idx].tds === null || this.filteredEmployees[idx].tds === undefined || this.filteredEmployees[idx].tds === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].tds) : this.getRoundedVal(this.filteredEmployees[idx].tds)),

  //             'LWF': this.filteredEmployees[idx].lwf === null || this.filteredEmployees[idx].lwf === undefined || this.filteredEmployees[idx].lwf === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].lwf) : this.getRoundedVal(this.filteredEmployees[idx].lwf)),

  //             'Insurance': this.filteredEmployees[idx].insurance === null || this.filteredEmployees[idx].insurance === undefined || this.filteredEmployees[idx].insurance === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].insurance) : this.getRoundedVal(this.filteredEmployees[idx].insurance)),

  //             'Mobile': this.filteredEmployees[idx].mobile === null || this.filteredEmployees[idx].mobile === undefined || this.filteredEmployees[idx].mobile === '' ? 0 : parseFloat(this.filteredEmployees[idx].mobile),
  //             'Other': this.filteredEmployees[idx].other === null || this.filteredEmployees[idx].other === undefined || this.filteredEmployees[idx].other === '' ? 0 : parseFloat(this.filteredEmployees[idx].other),

  //             'Loan': this.filteredEmployees[idx].loan === null || this.filteredEmployees[idx].loan === undefined || this.filteredEmployees[idx].loan === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].loan) : this.getRoundedVal(this.filteredEmployees[idx].loan)),

  //             'Advance': this.filteredEmployees[idx].advance === null || this.filteredEmployees[idx].advance === undefined || this.filteredEmployees[idx].advance === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].advance) : this.getRoundedVal(this.filteredEmployees[idx].advance)),

  //             'Professional Tax': this.filteredEmployees[idx].professionaltax === null || this.filteredEmployees[idx].professionaltax === undefined || this.filteredEmployees[idx].professionaltax === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].professionaltax) : this.getRoundedVal(this.filteredEmployees[idx].professionaltax)),

  //             'Gross Deduction': this.filteredEmployees[idx].grossdeduction === null || this.filteredEmployees[idx].grossdeduction === undefined || this.filteredEmployees[idx].grossdeduction === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].grossdeduction) : this.getRoundedVal(this.filteredEmployees[idx].grossdeduction)),

  //             'Net Pay': this.filteredEmployees[idx].netpay === null || this.filteredEmployees[idx].netpay === undefined || this.filteredEmployees[idx].netpay === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay)),

  //             'A/C No.1': this.filteredEmployees[idx].ac_1 === null || this.filteredEmployees[idx].ac_1 === undefined || this.filteredEmployees[idx].ac_1 === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ac_1) : this.getRoundedVal(this.filteredEmployees[idx].ac_1)),

  //             'A/C No.10': this.filteredEmployees[idx].ac_10 === null || this.filteredEmployees[idx].ac_10 === undefined || this.filteredEmployees[idx].ac_10 === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ac_10) : this.getRoundedVal(this.filteredEmployees[idx].ac_10)),

  //             'A/C No.2': this.filteredEmployees[idx].ac_2 === null || this.filteredEmployees[idx].ac_2 === undefined || this.filteredEmployees[idx].ac_2 === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ac_2) : this.getRoundedVal(this.filteredEmployees[idx].ac_2)),

  //             'A/C No.21': this.filteredEmployees[idx].ac21 === null || this.filteredEmployees[idx].ac21 === undefined || this.filteredEmployees[idx].ac21 === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ac21) : this.getRoundedVal(this.filteredEmployees[idx].ac21)),

  //             'Employer ESI Contr': this.filteredEmployees[idx].employer_esi_contr === null || this.filteredEmployees[idx].employer_esi_contr === undefined || this.filteredEmployees[idx].employer_esi_contr === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].employer_esi_contr) : this.getRoundedVal(this.filteredEmployees[idx].employer_esi_contr)),

  //             'LWF Employer': this.filteredEmployees[idx].lwf_employer === null || this.filteredEmployees[idx].lwf_employer === undefined || this.filteredEmployees[idx].lwf_employer === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].lwf_employer) : this.getRoundedVal(this.filteredEmployees[idx].lwf_employer)),

  //             'Employer Insurance': this.filteredEmployees[idx].employerinsuranceamount,
  //             'Salary Status': this.filteredEmployees[idx].salarystatus,
  //             'Arrear Months': this.filteredEmployees[idx].arearaddedmonths,
  //             'Total Arrear': this.filteredEmployees[idx].totalarear,

  //             'Voucher Amount': this.filteredEmployees[idx].voucher_amount === null || this.filteredEmployees[idx].voucher_amount === undefined || this.filteredEmployees[idx].voucher_amount === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].voucher_amount) : this.getRoundedVal(this.filteredEmployees[idx].voucher_amount)),

  //             'EWS': this.filteredEmployees[idx].ews === null || this.filteredEmployees[idx].ews === undefined || this.filteredEmployees[idx].ews === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ews) : this.getRoundedVal(this.filteredEmployees[idx].ews)),

  //             'Gratuity': this.filteredEmployees[idx].gratuity === null || this.filteredEmployees[idx].gratuity === undefined || this.filteredEmployees[idx].gratuity === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].gratuity) : this.getRoundedVal(this.filteredEmployees[idx].gratuity)),

  //             'Bonus': this.filteredEmployees[idx].bonus === null || this.filteredEmployees[idx].bonus === undefined || this.filteredEmployees[idx].bonus === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].bonus) : this.getRoundedVal(this.filteredEmployees[idx].bonus)),

  //             'Date of Relieveing': this.filteredEmployees[idx].dateofrelieveing,

  //             'Employee NPS': this.filteredEmployees[idx].employeenps === null || this.filteredEmployees[idx].employeenps === undefined || this.filteredEmployees[idx].employeenps === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].employeenps) : this.getRoundedVal(this.filteredEmployees[idx].employeenps)),

  //             'Other Ledger Arrears': this.filteredEmployees[idx].otherledgerarears === null || this.filteredEmployees[idx].otherledgerarears === undefined || this.filteredEmployees[idx].otherledgerarears === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].otherledgerarears) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerarears)),

  //             'Other Ledger Deductions': this.filteredEmployees[idx].otherledgerdeductions === null || this.filteredEmployees[idx].otherledgerdeductions === undefined || this.filteredEmployees[idx].otherledgerdeductions === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].otherledgerdeductions) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerdeductions)),

  //             'Other Variables': this.filteredEmployees[idx].otherledgerdeductions === null || this.filteredEmployees[idx].otherledgerdeductions === undefined || this.filteredEmployees[idx].otherledgerdeductions === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].otherledgerdeductions) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerdeductions)),

  //             'Other Ledger Arrear Without ESI': this.filteredEmployees[idx].otherledgerarearwithoutesi === null || this.filteredEmployees[idx].otherledgerarearwithoutesi === undefined || this.filteredEmployees[idx].otherledgerarearwithoutesi === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].otherledgerarearwithoutesi) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerarearwithoutesi)),

  //             'Other Bonus With ESI': this.filteredEmployees[idx].otherbonuswithesi === null || this.filteredEmployees[idx].otherbonuswithesi === undefined || this.filteredEmployees[idx].otherbonuswithesi === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].otherbonuswithesi) : this.getRoundedVal(this.filteredEmployees[idx].otherbonuswithesi)),
  //             // this.liability_data[idx].otherbonuswithesi,

  //             'Insurance Type': this.filteredEmployees[idx].insurancetype,
  //             'Attendance Mode': this.filteredEmployees[idx].attendancemode,
  //             // 'Contract No.': this.liability_data[idx].contractno1,
  //             'Biometric Id': this.filteredEmployees[idx].biometricid,
  //             ...(this.isValueGreaterThanZero('tea_allowance') && { 'Tea Allowance': this.filteredEmployees[idx].tea_allowance }),
  //             'CTC': (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].monthctc) : this.getRoundedVal(this.filteredEmployees[idx].monthctc)),
  //           }
  //           exportData.push(obj);
  //         }
  //       }
  //       // console.log(exportData);
  //       const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  //       const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  //       const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //       const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //       const downloadLink: any = document.createElement('a');
  //       downloadLink.href = window.URL.createObjectURL(data);
  //       let date = new Date()
  //       downloadLink.download = 'Liability_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
  //       downloadLink.click();
  //     }
  //   })
  // }


  SaveColumnValues() {
    if (this.selectedDynmicColumnValues.length > 0) {
      this._ReportService.manage_report_columns_wfm({
        "action": "save_report_columns",
        "report_name": "liability",
        "accountid": this.tp_account_id.toString(),
        "report_description": "Liability Reports",
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
      "report_name": "liability",
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

      // console.log(this.selectedDynmicColumnValues, this.showfields);

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
      employerepf: false, // new employerepf
      employerepf_arear: false, // new employerepf_arear
      mobile: false,
      mon: false,
      lossofpay: false,
      rate_employerinsuranceamount: false,
      rate_employerlwf: false,
      rate_employerepf: false,
      rate_employeresi: false,
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
      //  overtime_allowance: false,
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
      charity_contribution: false,
      ratenotice_pay: false,
      notice_pay: false,
      ratehold_salary_non_taxable: false,
      hold_salary_non_taxable: false,
      ratechildren_education_allowance: false,
      children_education_allowance: false,
      rategratuityinhand: false,
      gratuityinhand: false,
      biometricid: false,
      tea_allowance: false,

      vendor_name: false,
      project_name: false,
      salary_book_project: false,
    };
  }

  /*********For Ticket Notifications********** */

  openSendNotificationPopup() {
    this.showNotificationPopup = true;
  }
  closeSendNotificationPopup() {
    this.showNotificationPopup = false;
    this.user_by_role_id_data = [];
    this.notificationForm.patchValue({
      team: [''],
      user_id: [''],
      message: [''],

      emp_code: [''],
      query_comment: [''],
      // subject_id: [''],
      subject_desc: [''],
    })
    this.Get_Unread_Tickets();
  }
  createSupportRequest() {
    let data = this.notificationForm.value;

    let subject_desc = this.ticketMasterData.find((el: any) => el.id == data.subject_id).tickettypename;

    let user_data = this.user_by_role_id_data.find((el: any) => el.user_id == data.user_id)

    let emp_code = user_data.emp_code;

    // console.log(data)
    // console.log(subject_desc)
    // console.log(emp_code);

    // return;

    this._attendanceService.createSupportRequest({
      'emp_code': emp_code,
      'productTypeId': this.product_type,
      'query_comment': data.query_comment,
      'subject_id': data.subject_id,
      'subject_desc': subject_desc,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeSendNotificationPopup();


        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }


  createTicket() {
    let data = this.notificationForm.value;

    let subject_desc = this.ticketMasterData.find((el: any) => el.id == data.subject_id).tickettypename;

    let user_data = this.user_by_role_id_data.find((el: any) => el.user_id == data.user_id)

    // let emp_code = user_data.user_mobile + 'CJHUB' + user_data.emp_code + 'CJHUB' + user_data.dateofbirth

    this._attendanceService.createTicket({
      'empCode': user_data.emp_code,
      'productTypeId': this.product_type,
      'customerAccountId': this.tp_account_id,
      'ticketTypeId': data.subject_id,
      'ticketTypeSubject': subject_desc,
      'ticketComment': data.query_comment,
      'departmentId': data.team,
      'createdByRole': data.team,
      'createdBy': data.user_id,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeSendNotificationPopup();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  get_roles_master() {
    this.roles_master_data = [];
    this.user_by_role_id_data = [];

    this._attendanceService.manage_payout_ticketing_workflow({
      'action': 'get_roles_master',
      'account_id': this.tp_account_id.toString(),
      'reporting_module': 'Payroll Team',
      'user_role_id': '',
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.roles_master_data = resData.commonData;

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }
  getTicketMaster() {
    this.ticketMasterData = [];

    this._attendanceService.getTicketMaster({
      'action': 'PayrollProcessTypes',
      'productTypeId': this.product_type,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.ticketMasterData = resData.commonData.filter(
            (item: any) => item.tickettypename === 'Payroll'
          );

          // Set first value as default (if data exists)
          if (this.ticketMasterData.length > 0) {
            this.notificationForm.patchValue({
              subject_id: this.ticketMasterData[0].id,
            });
          }

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  get_ticket_status_master() {
    this.filtered_ticket_status = [];

    this._attendanceService.getTicketMaster({
      'action': 'GetTicketsStatus',
      'productTypeId': this.product_type,
      'customerAccountId': this.tp_account_id,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.filtered_ticket_status = resData.commonData.filter((status: any) => status.Description !== 'All'
            &&
            (status.Description == 'Open' || status.Description == 'Closed'))

        } else {
          // this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  get_users_master() {
    let data = this.notificationForm.value.team;
    // console.log(data);
    // return;

    this.user_by_role_id_data = [];
    this._attendanceService.manage_payout_ticketing_workflow({
      'action': 'get_user_by_role_id',
      'account_id': this.tp_account_id.toString(),
      'reporting_module': 'Payroll Team',
      'user_role_id': data,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.user_by_role_id_data = resData.commonData;

        } else {
          this.toastr.error(resData.message, "Oops!");
        }
      }
    })
  }


  closeTicketsTable() {
    this.showTicketsTable = false;
    this.Get_Unread_Tickets();
  }

  Get_Tickets() {
    const lastDate = this.formatDate(new Date(this.year, this.month, 0));
    // let month = this.month <= 9 ? '0' + this.month : this.month;

    let fromdate = '01/' + '01' + '/' + '2025';

    const currentDate = new Date();
    const day = currentDate.getDate() <= 9 ? '0' + currentDate.getDate() : currentDate.getDate();
    const month = currentDate.getMonth() + 1 <= 9 ? '0' + (currentDate.getMonth() + 1) : currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const current_date = `${day}/${month}/${year}`;

    this.helpAndSupportService.getAllQueriesTickets({
      // "fromDate": '01/' + month + '/' + this.year,
      'action': 'GetQueries',
      "fromDate": fromdate,
      "toDate": current_date,
      "ticketStatus": 'all',
      "orgUnitId": this.token.geo_location_id?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    })
      .subscribe((resData: any) => {
        // console.log(resData);
        if (resData.statusCode) {
          // if (this.ticketStatusMaster.length == 0) {

          //   this.ticketStatusMaster = resData.commonData.ticketStatusMaster;
          // }
          // this.filtered_ticket_status = resData.commonData.ticketStatusMaster.filter((status: any) => status.Description !== 'All')
          // this.ticketsDetails = resData.commonData.ticketsDetails;
          // if (this.ticketsDetails == "" || this.ticketsDetails == "undefined" || this.ticketsDetails == null) {
          //   this.toastr.error('No Record Found', 'Oops!');
          //   return;
          // }

          this.ticketsDetails = resData.commonData;
          this.showTicketsTable = true;


        } else {
          this.toastr.error('No record found', 'Oops!');
          this.ticketStatusMaster = [];
          this.ticketsDetails = [];
          this.toastr.error(resData.message);
        }
      });

  }

  Get_Unread_Tickets() {
    this.unread_query_cnt_data = [];
    const lastDate = this.formatDate(new Date(this.year, this.month, 0));
    // let month = this.month <= 9 ? '0' + this.month : this.month;

    let fromdate = '01/' + '01' + '/' + '2025';

    const currentDate = new Date();
    const day = currentDate.getDate() <= 9 ? '0' + currentDate.getDate() : currentDate.getDate();
    const month = currentDate.getMonth() + 1 <= 9 ? '0' + (currentDate.getMonth() + 1) : currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const current_date = `${day}/${month}/${year}`;

    this.helpAndSupportService.getAllQueriesTickets({
      // "fromDate": '01/' + month + '/' + this.year,
      'action': 'UnreadQueryCount',
      "fromDate": fromdate,
      "toDate": current_date,
      "ticketStatus": 'all',
      "orgUnitId": this.token.geo_location_id?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    })
      .subscribe((resData: any) => {
        // console.log(resData);
        if (resData.statusCode) {
          this.unread_query_cnt_data = resData.commonData[0];
          // console.log(resData.commonData);

        } else {
          this.toastr.error('No record found', 'Oops!');

        }
      });

  }

  UpdateTicketstatus(ticket_json: any, status: any) {
    const Ticket_Id = ticket_json?.ticket_id;
    const Emp_Code = ticket_json?.emp_code;
    const status_code = status?.shortCode
    if (ticket_json?.status != 'Closed') {
      this.helpAndSupportService.UpdateTicketstatus({
        "ticketId": Ticket_Id,
        "productTypeId": this.product_type,
        "customerAccountId": this.tp_account_id?.toString(),
        "empCode": Emp_Code,
        "ticketStatus": status_code,
        "updatedBy": this.tp_account_id?.toString()
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.update_ticket_data = resData.commonData;
          this.Get_Tickets()
          // console.log(this.update_ticket_data);
          this.toastr.success(resData.message);
          this.readTicketInternalDepartment();

        } else {
          this.update_ticket_data = [];
          this.toastr.error(resData.message);
        }
      });
    }
  }

  removeImage() {

  }

  onClose() {
    this.Create_Ticket_Form.reset();
    this.removeImage();
  }

  CreateTicket_Trail() {
    // console.log(this.base64Data,this.documentName,this.documentType);
    // if (!this.base64Data || !this.documentName || !this.documentType) {
    //   this.base64Data = "";
    //   this.documentName = "";
    //   this.documentType = "";
    // }

    this.helpAndSupportService.CreateTicketTrail({
      "ticketId": this.ticket_id,
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "empCode": this.emp_code,
      "ticketStatus": "Open",
      "ticketComment": this.Create_Ticket_Form.get('ticketComment')?.value || "",
      "createdBy": this.tp_account_id?.toString(),
      // "document": this.base64Data || "",
      // "documentName": this.documentName || "",
      // "documentType": this.documentType || ""
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.create_ticket_data = resData.commonData;
        this.GetTicket_Trail()
        this.onClose();
        // console.log(this.ticket_trail_data);
        this.toastr.success(resData.message);

      } else {
        this.create_ticket_data = [];
        this.toastr.error(resData.message);
      }

      // this.documentName = "";
      // this.documentType = "";
    });

  }
  create_ticket_data: any = [];


  help_support_popup(ticket_json: any) {
    this.ticket_id = ticket_json?.ticket_id;
    this.emp_name = ticket_json?.emp_name;
    this.emp_code = ticket_json?.emp_code;
    this.status = ticket_json?.status;
    this.GetTicket_Trail();
  }

  GetTicket_Trail() {
    this.helpAndSupportService.GetTicketTrail({
      "ticketId": this.ticket_id,
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.ticket_trail_data = resData.commonData;
        // console.log(this.ticket_trail_data);

        this.readTicketInternalDepartment();

      } else {
        this.ticket_trail_data = [];
        this.toastr.error(resData.message);
      }
    });

  }

  readTicketInternalDepartment() {
    this._attendanceService.readTicketInternalDepartment({
      'customerAccountId': this.tp_account_id,
      'productTypeId': this.product_type,
      'ticketId': this.ticket_id,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          // console.log('Success',resData.message);
        } else {
          // this.toastr.error(resData.message, 'Oops!');
          // console.log('Error',resData.message);
        }
      }
    })
  }

  getIconForDocumentType(document_type: string): string {
    if (document_type === 'pdf') {
      return 'fa fa-file-pdf-o text-danger';
    } else {
      return 'fa fa-file-image-o';
    }
  }

  formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}/${mm}/${yy}`;
  }
  /*********For Ticket Notifications********** */

  onEmployeeCheckboxChange() {
    const selectableEmployees = this.filteredEmployees.filter(emp => !(this.filteredEmployees.length - 1 && emp.emp_name === 'Grand Total'));
    this.selectAll = selectableEmployees.length > 0 && selectableEmployees.every(emp => emp.selected); // Updated logic
  }

  toggleSelectAll() {
    // console.log(this.filteredEmployees);
    this.filteredEmployees.forEach(report => {
      if (report.emp_name != 'Grand Total') { // Prevent selecting the Grand Total row
        report.selected = this.selectAll;
      }
    });
  }

  get selectedEmployees() {
    return this.filteredEmployees.filter(emp => emp.selected);
  }

  deleteLiability() {
    if (this.deleteLiabilityForm.invalid) {
      this.deleteLiabilityForm.markAllAsTouched();
      return;
    }

    let success = 0, error = 0;
    const total = this.selectedEmployees.length;

    for (let emp of this.selectedEmployees) {
      const obj = {
        action: "Unlock",
        customerAccountId: this.tp_account_id?.toString(),
        month: this.month,
        year: this.year,
        // productTypeId: 2,
        empCode: emp?.emp_code?.toString(),
        rejectReason: this.deleteLiabilityForm.get('reason')?.value,
        createdBy: this.tp_account_id?.toString(),
      };

      this._ReportService.deleteLiabilityReportApi(obj).subscribe({
        next: (res: any) => res?.statusCode ? success++ : error++,
        error: () => error++,
        complete: () => {
          if (success + error === total) {
            if (success) this.toastr.success(`Liability for ${success} employee(s) rejected successfully`);
            if (error) {
              this.toastr.error(`Liability for ${error} employee(s) failed to reject`);
              this.deleteLiabilityForm.get('reason').setValue('');
            }
            if (success) this.LiabilityReport();
          }
        }
      });
    }
  }

  cancelForm() {
    this.deleteLiabilityForm.reset();
    this.selectAll = false;
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
