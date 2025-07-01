import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { FilterField } from '../common-filter/filter.model';
import { filter } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HelpAndSupportService } from '../../help-and-support/help-and-support.service';
import { AttendanceService } from '../../attendance/attendance.service';
import { grooveState, dongleState } from 'src/app/app.animation';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';


@Component({
  selector: 'app-pre-attendance',
  templateUrl: './pre-attendance.component.html',
  styleUrls: ['./pre-attendance.component.css'],
  animations: [dongleState, grooveState]
})
export class PreAttendanceComponent {
  @ViewChild('preAttendaceTable', { static: false }) preAttendaceRef!: ElementRef;
  sidebarWidth: string = '0';
  selectedFilter: string = 'All';
  showSidebar: boolean = true;
  month: any;
  includeEmployeeDetails: boolean = false;
  selectedColumns: string[] = [];
  days_count: any;
  year: any;
  selected_date: any;
  employer_name: any = '';
  currentDate: any;
  currentDateString: any;
  yearsArray: any = [];
  data: any = [];
  payout_date: any;
  cur_payout_day: string = '';
  employer_profile: any = [];
  product_type: any;
  p: number = 0;
  invKey: any = '';
  applyNetPayFilter: boolean = false;
  filteredEmployees: any = [];
  tp_account_id: any = '';
  token: any = '';
  geo_fencing_list_data: any;
  selectedReport: string = 'summary';
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
  alertModalStatus: boolean = false;
  showfields: any = {
    orgempcode: false,
    S_No: false,
    mon: false,
    lossofpay: false,
    arrear_days: false,
    post_offered: false,
    posting_department: false,
    jobtype: false,
    unitparametername: false,
    rateconv: false,
    employerinsuranceamount: false,
    eps_wages: false,
    conv: false,
    ifsccode: false,
    uan: false,
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
    fathername: false,
    grossearning: false,
    loanrecovery: false,
    employeresirate: false,
    vpf: false,
    tds: false,
    dateofbirth: false,
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
    monthdays: false,
    gross: false,
    incentive: false,
    refund: false,
    otherledgerarears: false,
    bonus: false,
    ratemedical: false,
    medical: false,
    security_amt: false,
    charity_contribution: false,
    dateofleaving: false,
    uannumber: false,
    ratespecialallowance: false,
    employeeesirate: false,
    mobile: false,
    advancerecovery: false,
    advance: false,
    other: false,
    otherledgerdeductions: false,
    Security_amt: false,
    ratehra: false,
    rategross: false,
    rate_employerinsuranceamount: false,
    rate_employerlwf: false,
    rate_employerepf: false,
    basic: false,
    hra: false,
    specialallowance: false,
    epf: false,
    lwf_employer: false,
    otherdeductions: false,
    otherdeductionswithesi: false,
    lwf_employee: false,
    customtaxablecomponents: false,
    customnontaxablecomponents: false,
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
    masterctc: false, // new param master ctc
    rate_employergratuity: false, // new param rate employer gratuity
    employergratuity: false, // new param employer gratuity

    // start new params
    epf_arear: false,
    vpf_arear: false,
    totalarear: false,
    tds_arear: false,
    employeeesirate_arear: false,
    ac_1_arear: false,
    ac_10_arear: false,
    ac_2_arear: false,
    ac21_arear: false,
    paiddays_arear: false,
    lwf_employee_arear: false,
    lwf_employer_arear: false,
    // end new param

    biometricid: false,
    tea_allowance: false,

    basic_arear: false, // add from here by ak
    ratebasic_arear: false,
    hra_arear: false,
    ratehra_arear: false,
    specialallowance_arear: false,
    ratespecialallowance_arear: false,
    conv_arear: false,
    rateconv_arear: false,
    medical_arear: false,
    ratemedical_arear: false,
    salarybonus_arear: false,
    ratesalarybonus_arear: false,
    commission_arear: false,
    ratecommission_arear: false,
    transport_allowance_arear: false,
    ratetransport_allowance_arear: false,
    travelling_allowance_arear: false,
    ratetravelling_allowance_arear: false,
    leave_encashment_arear: false,
    rateleave_encashment_arear: false,
    gratuityinhand_arear: false,
    rategratuityinhand_arear: false,
    overtime_allowance_arear: false,
    rateovertime_allowance_arear: false,
    notice_pay_arear: false,
    ratenotice_pay_arear: false,
    hold_salary_non_taxable_arear: false,
    ratehold_salary_non_taxable_arear: false,
    children_education_allowance_arear: false,
    ratechildren_education_allowance_arear: false,

    email: false,
    vendor_name: false,
    project_name: false,
    salary_book_project: false,
    assigned_ou_names: false
  };
  unit_master_list_data: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];
  geo_fencing_list_data_count: any;

  fieldarray: any = [

    { name: 'S.No', value: 'S_No' },
    { name: 'Month', value: 'mon' },
    { name: 'Email', value: 'email' },
    { name: 'Father Name', value: 'fathername' },
    { name: 'Date of Birth', value: 'dateofbirth' },
    { name: 'Date of Joining', value: 'dateofjoining' },
    { name: 'Date of Leaving', value: 'dateofleaving' },
    { name: 'Organization Unit', value: 'unitparametername' },
    { name: 'Department', value: 'posting_department' },
    { name: 'Designation', value: 'post_offered' },
    { name: 'Job Type', value: 'jobtype' },
    { name: 'PAN Card', value: 'pancard' },
    { name: 'PF Number', value: 'pfnumber' },
    { name: 'UAN Number', value: 'uannumber' },
    { name: 'ESI Number', value: 'esinumber' },
    { name: 'IFSC', value: 'ifsccode' },
    { name: 'Month Days', value: 'monthdays' },
    { name: 'Paid Days', value: 'paiddays' },
    { name: 'Arrear Days', value: 'arrear_days' },
    { name: 'Loss of Pay', value: 'lossofpay' },
    { name: 'Total Leave Taken', value: 'totalleavetaken' },

    // { name: 'Salary Verifiedon', value: 'salary_verifiedon' },

    { name: 'Rate Basic', value: 'ratebasic' },
    { name: 'Rate HRA', value: 'ratehra' },
    { name: 'Rate Special Allowance', value: 'ratespecialallowance' },
    { name: 'Rate Conveyance', value: 'rateconv' },
    { name: 'Rate Medical', value: 'ratemedical' },
    { name: 'Rate Salary Bonus', value: 'ratesalarybonus' },
    { name: 'Rate Commission', value: 'ratecommission' },
    { name: 'Rate Transport Allowance', value: 'ratetransport_allowance' },
    { name: 'Rate Travelling Allowance', value: 'ratetravelling_allowance' },

    // Extras
    { name: 'Rate Leave Encashment', value: 'rateleave_encashment' },
    { name: 'Rate Overtime Allowance', value: 'rateovertime_allowance' },
    { name: 'Rate Notice Pay', value: 'ratenotice_pay' },
    { name: 'Rate Hold Salary Non Taxable', value: 'ratehold_salary_non_taxable' },
    { name: 'Rate Children Education Allowance', value: 'ratechildren_education_allowance' },
    { name: 'Rate Gratuity Inhand', value: 'rategratuityinhand' },
    // Extras

    // Missing - Rate Other earning allowance
    { name: 'Rate Gross', value: 'rategross' },
    { name: 'Employer Insurance Amount', value: 'rate_employerinsuranceamount' },
    { name: 'Rate Employer LWF', value: 'rate_employerlwf' },
    { name: 'Rate Employer EPF', value: 'rate_employerepf' },
    { name: 'Employer EPF', value: 'employerepf' }, // new employerepf
    { name: 'Employer Insurance', value: 'employerinsuranceamount' }, // assuming Employer Group Insurance
    // Missing - Employer ESIC
    { name: 'Master CTC', value: 'masterctc' },  // new param master ctc
    { name: 'Rate Employer Gratuity', value: 'rate_employergratuity' },  // new param Rate Employer Gratuity
    { name: 'Employer Gratuity', value: 'employergratuity' },  // new param Employer Gratuity
    // Missing - CTC

    // Start -------------------- Arrears ---------------------------
    { name: 'Arrear BASIC SALARY', value: 'basic_arear' }, //add from here by ak
    { name: 'Arrear Rate BASIC SALARY', value: 'ratebasic_arear' },
    { name: 'Arrear HRA', value: 'hra_arear' },
    { name: 'Arrear Rate HRA', value: 'ratehra_arear' },
    { name: 'Arrear Special Allowance', value: 'specialallowance_arear' },
    { name: 'Arrear Rate Special Allowance', value: 'ratespecialallowance_arear' },
    { name: 'Arrear Conveyance', value: 'conv_arear' },
    { name: 'Arrear Rate Conveyance', value: 'rateconv_arear' },
    { name: 'Arrear Medical Expenses', value: 'medical_arear' },
    { name: 'Arrear Rate Medical Expenses', value: 'ratemedical_arear' },
    { name: 'Arrear Salary Bonus', value: 'salarybonus_arear' },
    { name: 'Arrear Rate Salary Bonus', value: 'ratesalarybonus_arear' },
    { name: 'Arrear Commission', value: 'commission_arear' },
    { name: 'Arrear Rate Commission', value: 'ratecommission_arear' },
    { name: 'Arrear Transport Allowance', value: 'transport_allowance_arear' },
    { name: 'Arrear Rate Transport Allowance', value: 'ratetransport_allowance_arear' },
    { name: 'Arrear Travelling Allowance', value: 'travelling_allowance_arear' },
    { name: 'Arrear Rate Travelling Allowance', value: 'ratetravelling_allowance_arear' },
    { name: 'Arrear Leave Encashment', value: 'leave_encashment_arear' },
    { name: 'Arrear Rate Leave Encashment', value: 'rateleave_encashment_arear' },
    { name: 'Arrear Gratuity In Hand', value: 'gratuityinhand_arear' },
    { name: 'Arrear Rate Gratuity In Hand', value: 'rategratuityinhand_arear' },
    { name: 'Arrear Overtime Allowance', value: 'overtime_allowance_arear' },
    { name: 'Arrear Rate Overtime Allowance', value: 'rateovertime_allowance_arear' },
    { name: 'Arrear Notice Pay', value: 'notice_pay_arear' },
    { name: 'Arrear Rate Notice Pay', value: 'ratenotice_pay_arear' },
    { name: 'Arrear Hold Salary (Non Taxable)', value: 'hold_salary_non_taxable_arear' },
    { name: 'Arrear Rate Hold Salary (Non Taxable)', value: 'ratehold_salary_non_taxable_arear' },
    { name: 'Arrear Children Education Allowance', value: 'children_education_allowance_arear' },
    { name: 'Arrear Rate Children Education Allowance', value: 'ratechildren_education_allowance_arear' },
    // start - new params sidharth kaul dated. 14.05.2025
    { name: 'Arrear EPF', value: 'epf_arear' },
    { name: 'Total Arrear', value: 'totalarear' },
    { name: 'Arrear VPF', value: 'vpf_arear' },
    { name: 'Arrear TDS', value: 'tds_arear' },
    { name: 'Arrear Employee ESI Rate', value: 'employeeesirate_arear' },
    { name: 'Arrear AC 1', value: 'ac_1_arear' },
    { name: 'Arrear AC 10', value: 'ac_10_arear' },
    { name: 'Arrear AC 2', value: 'ac_2_arear' },
    { name: 'Arrear AC 21', value: 'ac21_arear' },
    { name: 'Arrear Paid Days', value: 'paiddays_arear' },
    { name: 'Arrear LWF Employee', value: 'lwf_employee_arear' },
    { name: 'Arrear LWF Employer', value: 'lwf_employer_arear' },
    { name: 'Arrear EPF Employer', value: 'employerepf_arear' },  // new employerepf_arear
    // end - new params
    { name: 'Other Ledger Arrear', value: 'otherledgerarears' },
    { name: 'Other Ledger Arrear Without ESI', value: 'otherledgerarearwithoutesi' },
    // End ---------------- Arrear --------------------------

    { name: 'Basic', value: 'basic' },
    { name: 'HRA', value: 'hra' },
    { name: 'Special Allowance', value: 'specialallowance' },
    { name: 'Commission', value: 'commission' },
    { name: 'Transport Allowance', value: 'transport_allowance' },

    //Extras
    { name: 'Salary Bonus', value: 'salarybonus' },
    { name: 'Travelling Allowance', value: 'travelling_allowance' },
    { name: 'Leave Encashment', value: 'leave_encashment' },
    { name: 'Overtime Allowance', value: 'overtime_allowance' },
    { name: 'Notice Pay', value: 'notice_pay' },
    { name: 'Hold Salary Non Taxable', value: 'hold_salary_non_taxable' },
    { name: 'Children Education Allowance', value: 'children_education_allowance' },
    { name: 'Gratuity Inhand', value: 'gratuityinhand' },
    { name: 'Conveyance', value: 'conv' },
    { name: 'Medical', value: 'medical' },
    { name: 'Incentive', value: 'incentive' },
    { name: 'Refund', value: 'refund' },
    { name: 'Bonus', value: 'bonus' },
    { name: 'Tea Allowance', value: 'tea_allowance' },

    { name: 'Other Allowances With ESI', value: 'otherdeductionswithesi' },
    // Extras

    { name: 'Gross', value: 'gross' },
    { name: 'gratuity', value: 'gratuity' },
    { name: 'EPF', value: 'epf' },
    { name: 'VPF', value: 'vpf' },
    // Missing - ESIC
    // Missing - Employee Group Insurance
    { name: 'TDS', value: 'tds' },
    { name: 'Other Deductions', value: 'otherdeductions' },
    { name: 'Other Ledger Deductions', value: 'otherledgerdeductions' },
    { name: 'Other Variables', value: 'othervariables' }, // added to deductions for now.
    { name: 'Security Amount', value: 'security_amt' },
    // Missing - Total Deduction // Gross Deduction
    // Missing - Netpay


    { name: 'Employee ESI Rate', value: 'employeeesirate' },

    { name: 'Loan', value: 'loan' },
    { name: 'Loan Recovery', value: 'loanrecovery' },
    // { name: 'LWF', value: 'lwf' },
    { name: 'Insurance', value: 'insurance' },
    { name: 'Mobile', value: 'mobile' },
    { name: 'Advance', value: 'advance' },
    { name: 'Advance Recovery', value: 'advancerecovery' },
    { name: 'Other', value: 'other' },

    { name: 'LWF Employee', value: 'lwf_employee' },
    { name: 'Professional Tax', value: 'professionaltax' },


    // // start - new param
    { name: 'Charity Contribution', value: 'charity_contribution' },
    // // end

    { name: 'A/c No.1', value: 'ac_1' },
    { name: 'A/c No.10', value: 'ac_10' },
    { name: 'A/c No.2', value: 'ac_2' },
    { name: 'A/c No.21', value: 'ac21' },
    { name: 'Employer ESI Rate', value: 'employeresirate' },
    { name: 'Fixed Allowances Total Rate', value: 'fixedallowancestotalrate' },
    { name: 'LWF Employer', value: 'lwf_employer' },


    { name: 'ORG Emp Code', value: 'orgempcode' },
    { name: 'Custom Taxable Components ', value: 'customtaxablecomponents' },
    { name: 'Custom Non Taxable Components', value: 'customnontaxablecomponents' },
    { name: 'Biometric Id', value: 'biometricid' },

    { name: 'Vendor Name', value: 'vendor_name' },
    { name: 'Project Name', value: 'project_name' },
    { name: 'Salary Book Project', value: 'salary_book_project' },
    // { name: 'OU Name', value: 'assigned_ou_names' }
  ];

  dropdownSettings: any = {};
  dropdownSettings_department: any = {};
  dropdownSettings_designation: any = {};
  show_label: boolean = true;
  loading: boolean = false;
  selectedUnitId: any = [];
  selectedDepartmentId: any = [];
  selectedDesignationId: any = [];
  dynamic_column_data: { reportcolumnname: string, reportcomponentname: string }[] = [];
  isShowRoundedVal: boolean = false;
  addOnFilters: FilterField[] = [];
  isSideBar: boolean = true;

  selectedDynmicColumnValues: any[] = [];  // add by ak

  tableData: any = '';

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


  selectAll: boolean = false;
  showSelectionCheckboxes: boolean = true; // To control the visibility of checkboxes
  earnings_allowances_cols: any[];
  rate_cols: any[];
  arrear_rate_arrear_amt_cols: any[];


  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _BusinesSettingsService: BusinesSettingsService,
    private _ReportService: ReportService,
    private _alertservice: AlertService,
    private _formBuilder: FormBuilder,
    private helpAndSupportService: HelpAndSupportService,
    private _attendanceService: AttendanceService,
    private confirmationDialogService: ConfirmationDialogService) {

    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
    this.addOnFilters.push({
      key: '',       // Unique identifier for the filter
      label: '',      // Label to display
      type: 'select', // Type of filter
      options: [{ label: 'All', value: 'All' },
      { label: 'Approved', 'value': 'Approved' },
      { label: 'Hold', value: 'Hold' }],  // For dropdowns
      placeholder: ''
    })
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
    const date = new Date();
    let currentMonth = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    let currentYear = date.getFullYear();

    for (let i = 2022; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);
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

      isAdviceLockedForPayoutFlag: ['N'],
      attendanceLockedMsg: [''],
    })


    this.GetReport_Fields();
    // this.get_att_unit_master_list();
    this.get_geo_fencing_list();
    this.get_att_dept_master_list();
    this.get_att_role_master_list();
    this.Attendance_Report();

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
    this.selectedFilter = 'All';
  }
  Apply_new_filter() {
    this.Attendance_Report();
    this.sidebarWidth = '0';
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
  }

  isColumnVisible(reportcolumnname: string): boolean {
    //console.log(reportcolumnname,'test')

    return reportcolumnname && this.selectedDynmicColumnValues.includes(reportcolumnname);
  }
  SaveColumnValues() {
    if (this.selectedDynmicColumnValues.length > 0) {
      this._ReportService.manage_report_columns_wfm({
        "action": "save_report_columns",
        "report_name": "payment advice",
        "accountid": this.tp_account_id.toString(),
        "report_description": "Payment Advoice Reports",
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
    this.showfields = {
      orgempcode: false,
      S_No: false,
      mon: false,
      lossofpay: false,
      post_offered: false,
      posting_department: false,
      jobtype: false,
      unitparametername: false,
      rateconv: false,
      employerinsuranceamount: false,
      eps_wages: false,
      conv: false,
      ifsccode: false,
      uan: false,
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
      fathername: false,
      grossearning: false,
      loanrecovery: false,
      employeresirate: false,
      fixedallowancestotalrate: false,
      vpf: false,
      tds: false,
      dateofbirth: false,
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
      monthdays: false,
      gross: false,
      incentive: false,
      refund: false,
      otherledgerarears: false,
      bonus: false,
      ratemedical: false,
      medical: false,
      security_amt: false,
      dateofleaving: false,
      uannumber: false,
      ratespecialallowance: false,
      employeeesirate: false,
      mobile: false,
      advancerecovery: false,
      advance: false,
      other: false,
      otherledgerdeductions: false,
      Security_amt: false,
      ratehra: false,
      rategross: false,
      basic: false,
      hra: false,
      specialallowance: false,
      epf: false,
      employerepf: false, // new employerepf
      lwf_employer: false,
      employerepf_arear: false, // new employerepf_arear

      otherdeductions: false,
      otherdeductionswithesi: false,
      lwf_employee: false,
      customtaxablecomponents: false,
      customnontaxablecomponents: false,
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
      tea_allowance: false,
      gratuity: false,

      basic_arear: false, // add from here by ak
      ratebasic_arear: false,
      hra_arear: false,
      ratehra_arear: false,
      specialallowance_arear: false,
      ratespecialallowance_arear: false,
      conv_arear: false,
      rateconv_arear: false,
      medical_arear: false,
      ratemedical_arear: false,
      salarybonus_arear: false,
      ratesalarybonus_arear: false,
      commission_arear: false,
      ratecommission_arear: false,
      transport_allowance_arear: false,
      ratetransport_allowance_arear: false,
      travelling_allowance_arear: false,
      ratetravelling_allowance_arear: false,
      leave_encashment_arear: false,
      rateleave_encashment_arear: false,
      gratuityinhand_arear: false,
      rategratuityinhand_arear: false,
      overtime_allowance_arear: false,
      rateovertime_allowance_arear: false,
      notice_pay_arear: false,
      ratenotice_pay_arear: false,
      hold_salary_non_taxable_arear: false,
      ratehold_salary_non_taxable_arear: false,
      children_education_allowance_arear: false,
      ratechildren_education_allowance_arear: false,

      email: false,
      vendor_name: false,
      project_name: false,
      salary_book_project: false
      // ,
      // assigned_ou_names: false
    };

    // console.log('getColumnValues');
    // if (this.selectedDynmicColumnValues.length > 0) {
    if (this.product_type == '2') {
      this._ReportService.manage_report_columns_wfm({
        "action": "get_report_columns",
        "report_name": "payment advice",
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


  }
  // add by ak end

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
    this.filteredEmployees = this.data.filter(function (element: any) {
      return (element.emp_name.toLowerCase().includes(key.toLowerCase())
        || element.emp_code.toLowerCase().includes(key.toLowerCase()) ||
        element.orgempcode?.toString().toLowerCase().includes(key.toLowerCase()) ||
        element.tpcode.toString().toLowerCase().includes(key.toLowerCase())
      )
    });
    // console.log(this.filteredEmployees);
  }

  applyFilters() {
    if (this.applyNetPayFilter) {
      this.filteredEmployees = this.data.filter((employee: any) => (employee.netpay > 0.0 || employee.netpay < 0.0));
    } else {
      this.filteredEmployees = this.data;
    }
  }

  searchOnFilters(filters: any) {
    this.month = filters.month;
    this.year = filters.year;
    this.invKey = filters.invKey;
    this.selectedUnitId = filters.unitId;
    this.selectedDepartmentId = filters.departmentId;
    this.selectedDesignationId = filters.designationId;
    this.selectedFilter = filters.selectedStatus;

    this.Attendance_Report();
  }

  isLastRow(index: number): boolean {
    return index === this.filteredEmployees.length - 1;
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
        // console.log(this.geo_fencing_list_data);

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
        //console.log(resData.message);
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
        //console.log(resData.message);
      }
    });
  }

  Attendance_Report() {
    this.applyNetPayFilter = false;
    this.loading = true;

    // const unitParameterName = this.selectedUnitId.length === this.unit_master_list_data.length
    //   ? this.unit_master_list_data.map(unit => unit.unitname).join(',')
    //   : this.selectedUnitId.map(unit => unit.unitname).join(',');
    // Handle unit IDs (organization units)
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

    this._ReportService.PrepayoutReportApi({
      "year": this.year,
      "month": this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "GeoFenceId": this.token.geo_location_id,
      "statusFilter": this.selectedFilter,
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment
    }).subscribe((resData: any) => {
      this.loading = false;
      if (resData.statusCode) {
        this.data = resData.commonData;
        this.filteredEmployees = this.data;
        this.search(this.invKey);
        // console.log("filteredEmployees-----------", this.filteredEmployees);
      } else {
        this.filteredEmployees = [];
        this.data = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }


  isValueGreaterThanZero(key: string): boolean {
    return this.filteredEmployees.some(report => report[key] > 0);
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
        const arrearRateItems = [];
        const earningItems = [];
        const allowanceItems = [];

        this.dynamic_column_data.forEach(item => {
          const column = item?.reportcolumnname?.toLowerCase() || '';
          const component = item?.reportcomponentname?.toLowerCase() || '';

          if (column.includes('arear') && column.includes('rate')) {
            arrearRateItems.push(item);
          } else if (column.includes('arear')) {
            arrearItems.push(item);
          } else if (column.includes('rate')) {
            rateItems.push(item);
          } else if (component.includes('allowance') || column.includes('commission')) {
            allowanceItems.push(item);
          } else {
            earningItems.push(item); // default is earning
          }
        });


        // pull hra and special allowance from allowances
        const hra_col = allowanceItems.shift();
        const special_allow_col = allowanceItems.shift();

        // push to earnings after basic
        earningItems.splice(1, 0, hra_col, special_allow_col);


        const item1 = arrearItems.splice(10, 1)[0]; //pop arrear hra
        const item0 = arrearItems.splice(9, 1)[0]; // pop arrear basic

        arrearItems.unshift(item1); // push arrear hra
        arrearItems.unshift(item0); // push arrear basic



        this.rate_cols = [
          ...rateItems
        ];

        this.earnings_allowances_cols = [
          ...earningItems,
          ...allowanceItems
        ]

        this.arrear_rate_arrear_amt_cols = [
          ...arrearRateItems,
          ...arrearItems
        ]

        // Now use orderedData wherever needed
        // console.log("Updated - dynamic_column_data",this.dynamic_column_data);

      } else {
        this.dynamic_column_data = [];
        //console.log(resData.message);
      }
    });
  }
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

  //   this._ReportService.PrepayoutReportApi({
  //     "year": this.year,
  //     "month": this.month,
  //     "customerAccountId": this.tp_account_id.toString(),
  //     "GeoFenceId": this.token.geo_location_id,
  //     "statusFilter": this.selectedFilter,
  //     "unitParameterName": unitIds,
  //     "postOffered": postOffered,
  //     "postingDepartment": postingDepartment
  //   }).subscribe((resData: any) => {
  //     if (resData.statusCode) {
  //       this.data = resData.commonData;
  //       let exportData = [];
  //       let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);

  //       // Apply netpay filter if checked
  //       if (this.applyNetPayFilter) {
  //         this.filteredEmployees = this.filteredEmployees.filter((employee: any) => employee.netpay > 0);
  //       }

  //       for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
  //         let obj = {};
  //         const empCode = this.filteredEmployees[idx].emp_code;
  //         const orgEmpCode = this.filteredEmployees[idx].orgempcode;
  //         const tpcode = this.filteredEmployees[idx].tpcode;
  //         const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;

  //         if (!this.includeEmployeeDetails) {
  //           obj = {
  //             'TP / Org Emp Code': tpOrgEmpCode,
  //             'Employee Name': this.filteredEmployees[idx].emp_name,
  //             'Bank Account No.': this.filteredEmployees[idx].bankaccountno,
  //             // +(this.filteredEmployees[idx].is_account_verified === '0' ? ' (N/A)' : ''),
  //             'Bank Name': this.filteredEmployees[idx].bankname,
  //             'Bank Branch': this.filteredEmployees[idx].bankbranch,
  //             'Gross Earning': this.filteredEmployees[idx].grossearning === null || this.filteredEmployees[idx].grossearning === undefined || this.filteredEmployees[idx].grossearning === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),
  //             'Gross Deduction': this.filteredEmployees[idx].grossdeduction === null || this.filteredEmployees[idx].grossdeduction === undefined || this.filteredEmployees[idx].grossdeduction === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].grossdeduction) : this.getRoundedVal(this.filteredEmployees[idx].grossdeduction)),
  //             'Net Pay': this.filteredEmployees[idx].netpay === null || this.filteredEmployees[idx].netpay === undefined || this.filteredEmployees[idx].netpay === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay)),
  //             // 'IFSC': this.filteredEmployees[idx].ifsccode
  //           };
  //           exportFields.forEach(field => {
  //             obj[field.name] = this.filteredEmployees[idx][field.value];
  //           });

  //         } else {
  //           // console.log(this.isShowRoundedVal)
  //           obj = {
  //             'Month': this.filteredEmployees[idx].mon,
  //             'TP / Org Emp Code': tpOrgEmpCode,
  //             'Employee name': this.filteredEmployees[idx].emp_name,
  //             'Father Name': this.filteredEmployees[idx].fathername,
  //             'Date of Joining': this.filteredEmployees[idx].dateofjoining,
  //             'Date of Birth': this.filteredEmployees[idx].dateofbirth,
  //             'ESI Number': this.filteredEmployees[idx].esinumber,
  //             'Date of Leaving': this.filteredEmployees[idx].dateofleaving,
  //             'Designation': this.filteredEmployees[idx].post_offered,
  //             'Department': this.filteredEmployees[idx].posting_department?.split('#')[0],
  //             'Job Type': this.filteredEmployees[idx].jobtype,
  //             'Unit Parameter Name': this.filteredEmployees[idx].unitparametername,
  //             'PAN Card': this.filteredEmployees[idx].pancard,
  //             'PF Number': this.filteredEmployees[idx].pfnumber,
  //             'Bank Account No': this.filteredEmployees[idx].bankaccountno,
  //             // +(this.filteredEmployees[idx].is_account_verified === '0' ? ' (N/A)' : ''),
  //             'IFSC': this.filteredEmployees[idx].ifsccode,
  //             'Bank Name': this.filteredEmployees[idx].bankname,
  //             'Bank Branch': this.filteredEmployees[idx].bankbranch,
  //             'UAN Number': this.filteredEmployees[idx].uannumber,
  //             'Loss of Pay': this.filteredEmployees[idx].lossofpay === null || this.filteredEmployees[idx].lossofpay === undefined || this.filteredEmployees[idx].lossofpay === '' ? 0 : parseFloat(this.filteredEmployees[idx].lossofpay),
  //             'Paid Days': this.filteredEmployees[idx].paiddays === null || this.filteredEmployees[idx].paiddays === undefined || this.filteredEmployees[idx].paiddays === '' ? 0 : parseFloat(this.filteredEmployees[idx].paiddays),
  //             'Total Leave Taken': this.filteredEmployees[idx].totalleavetaken,
  //             'Month Days': this.filteredEmployees[idx].monthdays === null || this.filteredEmployees[idx].monthdays === undefined || this.filteredEmployees[idx].monthdays === '' ? 0 : parseFloat(this.filteredEmployees[idx].monthdays),
  //             [this.dynamic_column_data[1]?.reportcomponentname || 'Rate Basic']: this.filteredEmployees[idx].ratebasic === null || this.filteredEmployees[idx].ratebasic === undefined || this.filteredEmployees[idx].ratebasic === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ratebasic) : this.getRoundedVal(this.filteredEmployees[idx].ratebasic)),
  //             [this.dynamic_column_data[3]?.reportcomponentname || 'Rate HRA']: this.filteredEmployees[idx].ratehra === null || this.filteredEmployees[idx].ratehra === undefined || this.filteredEmployees[idx].ratehra === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ratehra) : this.getRoundedVal(this.filteredEmployees[idx].ratehra)),
  //             [this.dynamic_column_data[5]?.reportcomponentname || 'Rate Special Allowance']: this.filteredEmployees[idx].ratespecialallowance === null || this.filteredEmployees[idx].ratespecialallowance === undefined || this.filteredEmployees[idx].ratespecialallowance === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ratespecialallowance) : this.getRoundedVal(this.filteredEmployees[idx].ratespecialallowance)),
  //             [this.dynamic_column_data[7]?.reportcomponentname || 'Rate Conveyance']: this.filteredEmployees[idx].rateconv === null || this.filteredEmployees[idx].rateconv === undefined || this.filteredEmployees[idx].rateconv === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].rateconv) : this.getRoundedVal(this.filteredEmployees[idx].rateconv)),
  //             [this.dynamic_column_data[9]?.reportcomponentname || 'Rate Medical']: this.filteredEmployees[idx].ratemedical === null || this.filteredEmployees[idx].ratemedical === undefined || this.filteredEmployees[idx].ratemedical === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ratemedical) : this.getRoundedVal(this.filteredEmployees[idx].ratemedical)),

  //             // ...(this.isValueGreaterThanZero('rateSalaryBonus') && {'Rate Salary Bonus': this.data[idx].ratesalarybonus}),
  //             // ...(this.isValueGreaterThanZero('rateCommission') && {'Rate Commission': this.data[idx].ratecommission}),
  //             // ...(this.isValueGreaterThanZero('rateTransportAllowance') && {'Rate Transport Allowance': this.data[idx].ratetransport_allowance}),
  //             ...(this.isValueGreaterThanZero('ratesalarybonus') && { [this.dynamic_column_data[11]?.reportcomponentname || 'Rate Salary Bonus']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].ratesalarybonus : this.getRoundedVal(this.filteredEmployees[idx].ratesalarybonus)) }),
  //             ...(this.isValueGreaterThanZero('ratecommission') && { [this.dynamic_column_data[13]?.reportcomponentname || 'Rate Commission']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].ratecommission : this.getRoundedVal(this.filteredEmployees[idx].ratecommission)) }),
  //             ...(this.isValueGreaterThanZero('ratetransport_allowance') && { [this.dynamic_column_data[15]?.reportcomponentname || 'Rate Transport Allowance']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].ratetransport_allowance : this.getRoundedVal(this.filteredEmployees[idx].ratetransport_allowance)) }),
  //             ...(this.isValueGreaterThanZero('ratetravelling_allowance') && { [this.dynamic_column_data[17]?.reportcomponentname || 'Rate Travelling Allowance']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].ratetravelling_allowance : this.getRoundedVal(this.filteredEmployees[idx].ratetravelling_allowance)) }),
  //             ...(this.isValueGreaterThanZero('rateleave_encashment') && { [this.dynamic_column_data[19]?.reportcomponentname || 'Rate Leave Encashment']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].rateleave_encashment : this.getRoundedVal(this.filteredEmployees[idx].rateleave_encashment)) }),
  //             ...(this.isValueGreaterThanZero('overtime_allowance') && { [this.dynamic_column_data[23]?.reportcomponentname || 'Rate Overtime Allowance']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].rateovertime_allowance : this.getRoundedVal(this.filteredEmployees[idx].rateovertime_allowance)) }),
  //             ...(this.isValueGreaterThanZero('ratenotice_pay') && { [this.dynamic_column_data[25]?.reportcomponentname || 'Rate Notice Pay']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].ratenotice_pay : this.getRoundedVal(this.filteredEmployees[idx].ratenotice_pay)) }),
  //             ...(this.isValueGreaterThanZero('ratehold_salary_non_taxable') && { [this.dynamic_column_data[27]?.reportcomponentname || 'Rate Hold Salary Non Taxable']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].ratehold_salary_non_taxable : this.getRoundedVal(this.filteredEmployees[idx].ratehold_salary_non_taxable)) }),
  //             ...(this.isValueGreaterThanZero('ratechildren_education_allowance') && { [this.dynamic_column_data[29]?.reportcomponentname || 'Rate Children Education Allowance']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].ratechildren_education_allowance : this.getRoundedVal(this.filteredEmployees[idx].ratechildren_education_allowance)) }),
  //             ...(this.isValueGreaterThanZero('rategratuityinhand') && { [this.dynamic_column_data[21]?.reportcomponentname || 'Rate Gratuity Inhand']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].rategratuityinhand : this.getRoundedVal(this.filteredEmployees[idx].rategratuityinhand)) }),

  //             'Rate Gross': this.filteredEmployees[idx].rategross === null || this.filteredEmployees[idx].rategross === undefined || this.filteredEmployees[idx].rategross === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].rategross) : this.getRoundedVal(this.filteredEmployees[idx].rategross)),
  //             [this.dynamic_column_data[0]?.reportcomponentname || 'Basic']: this.filteredEmployees[idx].basic === null || this.filteredEmployees[idx].basic === undefined || this.filteredEmployees[idx].basic === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].basic) : this.getRoundedVal(this.filteredEmployees[idx].basic)),
  //             [this.dynamic_column_data[2]?.reportcomponentname || 'HRA']: this.filteredEmployees[idx].hra === null || this.filteredEmployees[idx].hra === undefined || this.filteredEmployees[idx].hra === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].hra) : this.getRoundedVal(this.filteredEmployees[idx].hra)),
  //             [this.dynamic_column_data[4]?.reportcomponentname || 'Special Allowance']: this.filteredEmployees[idx].specialallowance === null || this.filteredEmployees[idx].specialallowance === undefined || this.filteredEmployees[idx].specialallowance === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].specialallowance) : this.getRoundedVal(this.filteredEmployees[idx].specialallowance)),
  //             [this.dynamic_column_data[6]?.reportcomponentname || 'Conveyance']: this.filteredEmployees[idx].conv === null || this.filteredEmployees[idx].conv === undefined || this.filteredEmployees[idx].conv === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].conv) : this.getRoundedVal(this.filteredEmployees[idx].conv)),
  //             [this.dynamic_column_data[8]?.reportcomponentname || 'Medical']: this.filteredEmployees[idx].medical === null || this.filteredEmployees[idx].medical === undefined || this.filteredEmployees[idx].medical === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].medical) : this.getRoundedVal(this.filteredEmployees[idx].medical)),

  //             ...(this.isValueGreaterThanZero('ratesalarybonus') && { [this.dynamic_column_data[10]?.reportcomponentname || 'Salary Bonus']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].salarybonus : this.getRoundedVal(this.filteredEmployees[idx].salarybonus)) }),
  //             ...(this.isValueGreaterThanZero('ratecommission') && { [this.dynamic_column_data[12]?.reportcomponentname || 'Commission']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].commission : this.getRoundedVal(this.filteredEmployees[idx].commission)) }),
  //             ...(this.isValueGreaterThanZero('ratetransport_allowance') && { [this.dynamic_column_data[14]?.reportcomponentname || 'Transport Allowance']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].transport_allowance : this.getRoundedVal(this.filteredEmployees[idx].transport_allowance)) }),
  //             ...(this.isValueGreaterThanZero('ratetravelling_allowance') && { [this.dynamic_column_data[16]?.reportcomponentname || 'Travelling Allowance']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].travelling_allowance : this.getRoundedVal(this.filteredEmployees[idx].travelling_allowance)) }),
  //             ...(this.isValueGreaterThanZero('rateleave_encashment') && { [this.dynamic_column_data[18]?.reportcomponentname || 'Leave Encashment']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].leave_encashment : this.getRoundedVal(this.filteredEmployees[idx].leave_encashment)) }),
  //             ...(this.isValueGreaterThanZero('overtime_allowance') && { [this.dynamic_column_data[22]?.reportcomponentname || 'Overtime Allowance']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].overtime_allowance : this.getRoundedVal(this.filteredEmployees[idx].overtime_allowance)) }),
  //             ...(this.isValueGreaterThanZero('ratenotice_pay') && { [this.dynamic_column_data[24]?.reportcomponentname || 'Notice Pay']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].notice_pay : this.getRoundedVal(this.filteredEmployees[idx].notice_pay)) }),
  //             ...(this.isValueGreaterThanZero('ratehold_salary_non_taxable') && { [this.dynamic_column_data[26]?.reportcomponentname || 'Hold Salary Non Taxable']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].hold_salary_non_taxable : this.getRoundedVal(this.filteredEmployees[idx].hold_salary_non_taxable)) }),
  //             ...(this.isValueGreaterThanZero('ratechildren_education_allowance') && { [this.dynamic_column_data[28]?.reportcomponentname || 'Children Education Allowance']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].children_education_allowance : this.getRoundedVal(this.filteredEmployees[idx].children_education_allowance)) }),
  //             ...(this.isValueGreaterThanZero('rategratuityinhand') && { [this.dynamic_column_data[20]?.reportcomponentname || 'Gratuity Inhand']: (!this.isShowRoundedVal ? this.filteredEmployees[idx].gratuityinhand : this.getRoundedVal(this.filteredEmployees[idx].gratuityinhand)) }),

  //             'Gross': this.filteredEmployees[idx].gross === null || this.filteredEmployees[idx].gross === undefined || this.filteredEmployees[idx].gross === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].gross) : this.getRoundedVal(this.filteredEmployees[idx].gross)),
  //             'Incentive': this.filteredEmployees[idx].incentive === null || this.filteredEmployees[idx].incentive === undefined || this.filteredEmployees[idx].incentive === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].incentive) : this.getRoundedVal(this.filteredEmployees[idx].incentive)),
  //             'Refund': this.filteredEmployees[idx].refund === null || this.filteredEmployees[idx].refund === undefined || this.filteredEmployees[idx].refund === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].refund) : this.getRoundedVal(this.filteredEmployees[idx].refund)),
  //             'Other Ledger Arrears': this.filteredEmployees[idx].otherledgerarears === null || this.filteredEmployees[idx].otherledgerarears === undefined || this.filteredEmployees[idx].otherledgerarears === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].otherledgerarears) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerarears)),
  //             'Other Ledger Arrear Without ESI': (this.filteredEmployees[idx].otherledgerarearwithoutesi) === null || (this.filteredEmployees[idx].otherledgerarearwithoutesi === undefined) || this.filteredEmployees[idx].otherledgerarearwithoutesi === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].otherledgerarearwithoutesi) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerarearwithoutesi)),
  //             //'Other Ledger Arear Without ESI':!(this.data[idx].otherledgerarearwithoutesi)=== null || !(this.data[idx].otherledgerarears === undefined)||this.data[idx].otherledgerarears === '' ? parseFloat(this.data[idx].otherledgerarearwithoutesi): 0,
  //             'Bonus': this.filteredEmployees[idx].bonus === null || this.filteredEmployees[idx].bonus === undefined || this.filteredEmployees[idx].bonus === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].bonus) : this.getRoundedVal(this.filteredEmployees[idx].bonus)),
  //             'Other Variables': this.filteredEmployees[idx].othervariables === null || this.filteredEmployees[idx].othervariables === undefined || this.filteredEmployees[idx].othervariables === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].othervariables) : this.getRoundedVal(this.filteredEmployees[idx].othervariables)),
  //             'Gross Earning': this.filteredEmployees[idx].grossearning === null || this.filteredEmployees[idx].grossearning === undefined || this.filteredEmployees[idx].grossearning === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].grossearning) : this.getRoundedVal(this.filteredEmployees[idx].grossearning)),
  //             'EPF': this.filteredEmployees[idx].epf === null || this.filteredEmployees[idx].epf === undefined || this.filteredEmployees[idx].epf === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].epf) : this.getRoundedVal(this.filteredEmployees[idx].epf)),
  //             'VPF': this.filteredEmployees[idx].vpf === null || this.filteredEmployees[idx].vpf === undefined || this.filteredEmployees[idx].vpf === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].vpf) : this.getRoundedVal(this.filteredEmployees[idx].vpf)),
  //             'Employee ESI': this.filteredEmployees[idx].employeeesirate === null || this.filteredEmployees[idx].employeeesirate === undefined || this.filteredEmployees[idx].employeeesirate === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].employeeesirate) : this.getRoundedVal(this.filteredEmployees[idx].employeeesirate)),

  //             'TDS': this.filteredEmployees[idx].tds === null || this.filteredEmployees[idx].tds === undefined || this.filteredEmployees[idx].tds === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].tds) : this.getRoundedVal(this.filteredEmployees[idx].tds)),
  //             'Loan': this.filteredEmployees[idx].loan === null || this.filteredEmployees[idx].loan === undefined || this.filteredEmployees[idx].loan === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].loan) : this.getRoundedVal(this.filteredEmployees[idx].loan)),
  //             'Loan Recovery': this.filteredEmployees[idx].loanrecovery === null || this.filteredEmployees[idx].loanrecovery === undefined || this.filteredEmployees[idx].loanrecovery === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].loanrecovery) : this.getRoundedVal(this.filteredEmployees[idx].loanrecovery)),
  //             // 'LWF':this.data[idx].lwf === null || this.data[idx].lwf === undefined ||this.data[idx].lwf === '' ? 0: parseFloat(this.data[idx].lwf),
  //             'Insurance': this.filteredEmployees[idx].insurance === null || this.filteredEmployees[idx].insurance === undefined || this.filteredEmployees[idx].insurance === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].insurance) : this.getRoundedVal(this.filteredEmployees[idx].insurance)),
  //             'Mobile': this.filteredEmployees[idx].mobile === null || this.filteredEmployees[idx].mobile === undefined || this.filteredEmployees[idx].mobile === '' ? 0 : this.filteredEmployees[idx].mobile,
  //             'Advance': this.filteredEmployees[idx].advance === null || this.filteredEmployees[idx].advance === undefined || this.filteredEmployees[idx].advance === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].advance) : this.getRoundedVal(this.filteredEmployees[idx].advance)),
  //             'Advance Recovery': this.filteredEmployees[idx].advancerecovery === null || this.filteredEmployees[idx].advancerecovery === undefined || this.filteredEmployees[idx].advancerecovery === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].advancerecovery) : this.getRoundedVal(this.filteredEmployees[idx].advancerecovery)),
  //             'Other': this.filteredEmployees[idx].other === null || this.filteredEmployees[idx].other === undefined || this.filteredEmployees[idx].other === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].other) : this.getRoundedVal(this.filteredEmployees[idx].other)),
  //             'Other Ledger Deductions': this.filteredEmployees[idx].otherledgerdeductions === null || this.filteredEmployees[idx].otherledgerdeductions === undefined || this.filteredEmployees[idx].otherledgerdeductions === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].otherledgerdeductions) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerdeductions)),
  //             'Other Deductions': this.filteredEmployees[idx].otherdeductions === null || this.filteredEmployees[idx].otherdeductions === undefined || this.filteredEmployees[idx].otherdeductions === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].otherdeductions) : this.getRoundedVal(this.filteredEmployees[idx].otherdeductions)),
  //             'Other Allowances With ESI': this.filteredEmployees[idx].otherledgerdeductionswithesi === null || this.filteredEmployees[idx].otherledgerdeductionswithesi === undefined || this.filteredEmployees[idx].otherledgerdeductionswithesi === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].otherledgerdeductionswithesi) : this.getRoundedVal(this.filteredEmployees[idx].otherledgerdeductionswithesi)),
  //             'LWF Employee': this.filteredEmployees[idx].lwf_employee === null || this.filteredEmployees[idx].lwf_employee === undefined || this.filteredEmployees[idx].lwf_employee === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].lwf_employee) : this.getRoundedVal(this.filteredEmployees[idx].lwf_employee)),
  //             'Professional Tax': this.filteredEmployees[idx].professionaltax === null || this.filteredEmployees[idx].professionaltax === undefined || this.filteredEmployees[idx].professionaltax === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].professionaltax) : this.getRoundedVal(this.filteredEmployees[idx].professionaltax)),
  //             'Security Amout': this.filteredEmployees[idx].security_amt === null || this.filteredEmployees[idx].security_amt === undefined || this.filteredEmployees[idx].security_amt === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].security_amt) : this.getRoundedVal(this.filteredEmployees[idx].security_amt)),
  //             // 'Charity Contribution':this.filteredEmployees[idx].charity_contribution === null || this.filteredEmployees[idx].charity_contribution === undefined ||this.filteredEmployees[idx].charity_contribution === '' ? 0: parseFloat(this.filteredEmployees[idx].charity_contribution),
  //             'Gross Deduction': this.filteredEmployees[idx].grossdeduction === null || this.filteredEmployees[idx].grossdeduction === undefined || this.filteredEmployees[idx].grossdeduction === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].grossdeduction) : this.getRoundedVal(this.filteredEmployees[idx].grossdeduction)),
  //             'Net Pay': this.filteredEmployees[idx].netpay === null || this.filteredEmployees[idx].netpay === undefined || this.filteredEmployees[idx].netpay === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].netpay) : this.getRoundedVal(this.filteredEmployees[idx].netpay)),
  //             'A/c No.1': this.filteredEmployees[idx].ac_1 === null || this.filteredEmployees[idx].ac_1 === undefined || this.filteredEmployees[idx].ac_1 === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ac_1) : this.getRoundedVal(this.filteredEmployees[idx].ac_1)),
  //             'A/C No.10': this.filteredEmployees[idx].ac_10 === null || this.filteredEmployees[idx].ac_10 === undefined || this.filteredEmployees[idx].ac_10 === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ac_10) : this.getRoundedVal(this.filteredEmployees[idx].ac_10)),
  //             'A/c No.2': this.filteredEmployees[idx].ac_2 === null || this.filteredEmployees[idx].ac_2 === undefined || this.filteredEmployees[idx].ac_2 === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ac_2) : this.getRoundedVal(this.filteredEmployees[idx].ac_2)),
  //             'A/c No.21': this.filteredEmployees[idx].ac21 === null || this.filteredEmployees[idx].ac21 === undefined || this.filteredEmployees[idx].ac21 === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].ac21) : this.getRoundedVal(this.filteredEmployees[idx].ac21)),
  //             'Employer ESI Rate': this.filteredEmployees[idx].employeresirate === null || this.filteredEmployees[idx].employeresirate === undefined || this.filteredEmployees[idx].employeresirate === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].employeresirate) : this.getRoundedVal(this.filteredEmployees[idx].employeresirate)),
  //             'LWF Employer': this.filteredEmployees[idx].lwf_employer === null || this.filteredEmployees[idx].lwf_employer === undefined || this.filteredEmployees[idx].lwf_employer === '' ? 0 : (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].lwf_employer) : this.getRoundedVal(this.filteredEmployees[idx].lwf_employer)),
  //             'Employer Insurance': (!this.isShowRoundedVal ? parseFloat(this.filteredEmployees[idx].employerinsuranceamount) : this.getRoundedVal(this.filteredEmployees[idx].employerinsuranceamount)),
  //             'Org Emp Code': this.filteredEmployees[idx].orgempcode,
  //             'Custom Taxable Components ': this.filteredEmployees[idx].customtaxablecomponents,
  //             'Custom Non Taxable Components': this.filteredEmployees[idx].customnontaxablecomponents,
  //             'Biometric Id': this.filteredEmployees[idx].biometricid,
  //             ...(this.isValueGreaterThanZero('tea_allowance') && { 'Tea Allowance': (!this.isShowRoundedVal ? this.filteredEmployees[idx].tea_allowance : this.getRoundedVal(this.filteredEmployees[idx].tea_allowance)) }),
  //             'CTC': this.filteredEmployees[idx].paidmonthlyctc,

  //             'Email': !this.filteredEmployees[idx].email ? '': this.filteredEmployees[idx].email,
  //             'Vendor Name': !this.filteredEmployees[idx].vendor_name ? '': this.filteredEmployees[idx].vendor_name,
  //             'Project Name': !this.filteredEmployees[idx].project_name ? '' : this.filteredEmployees[idx].project_name,
  //             'Salary Book Project': !this.filteredEmployees[idx].salary_book_project ? '' : this.filteredEmployees[idx].salary_book_project,
  //             'Assigned OU Names': !this.filteredEmployees[idx].assigned_ou_names ? '' : this.filteredEmployees[idx].assigned_ou_names,

  //           };

  //         }

  //         exportData.push(obj);
  //       }


  //       const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  //       const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
  //       const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //       const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //       const downloadLink: any = document.createElement('a');
  //       downloadLink.href = window.URL.createObjectURL(data);
  //       let date = new Date()
  //       downloadLink.download = 'Payment_Advice_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
  //       downloadLink.click();
  //     }
  //   });
  // }

  getRoundedVal(val: any) {
    return (val ? Math.round(val) : '0');
  }

  exportToPdf(pdfName, title) {
    if (this.preAttendaceRef) {
      const clonedTable = this.preAttendaceRef.nativeElement.cloneNode(true) as HTMLElement;
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
      isAdviceLockedForPayoutFlag: ['N'],
      attendanceLockedMsg: [''],
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
      "isAdviceLockedForPayoutFlag": data.isAdviceLockedForPayoutFlag,
      "attendanceLockedMsg": data.attendanceLockedMsg,
      "year": this.year,
      "month": this.month

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeSendNotificationPopup();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        // console.log(e);
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

  confirmAlertButton() {
    this.alertModalStatus = true;
  }
  closeAlertModal() {
    this.alertModalStatus = false;
  }
  Verify_Lock_Payment_attednace() {

    this._attendanceService.lockedUnlockedAttednace({
      'productTypeId': this.product_type,
      'customerAccountId': this.tp_account_id,
      'action': 'Unlock',
      "year": this.year,
      "month": this.month,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          // setTimeout(() => {
          //   this.employer_details();
          // }, 1000)
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
        this.closeAlertModal();
      }, error: (e) => {
        // console.log(e);
      }
    })
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
      // "ticketStatus": "In-progress",
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

    // console.log(this.ticket_id, this.emp_name, this.emp_code, this.status);
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

  check_isAdviceLockedForPayoutFlag(e: any) {
    if (e.target.checked) {
      this.notificationForm.patchValue({
        isAdviceLockedForPayoutFlag: 'R',
        attendanceLockedMsg: 'revert back to hr team for attendance check',
      })

    } else {
      this.notificationForm.patchValue({
        isAdviceLockedForPayoutFlag: 'N',
        attendanceLockedMsg: '',
      })

    }
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
  //   XLSX.writeFile(workbook, 'Payment_Advice_Report_' + this.employer_name.replaceAll(' ', '').trim() + "" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx');
  // }

  // start - new export excel updated logic - sidharth kaul dated. 03.06.2025
  exportToExcelTable() {
    const table = document.getElementById('preAttendaceTable');
    if (!table) return;

    const clonedTable = table.cloneNode(true) as HTMLTableElement;

    // Remove first column (if needed)
    const headerRow = clonedTable.querySelector('thead tr') as HTMLTableRowElement;
    if (headerRow) headerRow.deleteCell(0);
    clonedTable.querySelectorAll('tbody tr').forEach(row => (row as HTMLTableRowElement).deleteCell(0));


    // Identify columns
    const headerCells = Array.from(headerRow.cells).map(cell => cell.textContent?.trim().toLowerCase() || '');
    // console.log(headerCells);
    const monthColIndex = headerCells.findIndex(h => h === 'month');
    const dateCols = ['date of birth', 'date of joining', 'date of leaving'];
    const dateColIndices = headerCells.reduce((acc: number[], col, idx) => {
      if (dateCols.includes(col)) acc.push(idx);
      return acc;
    }, []);

    // Columns to keep as string (do not convert to number)
    const stringCols = [
      'mobile', 'pf number', 'esi number', 'bank account no', 'ifsc', 'uan number'
    ];
    const stringColIndices = headerCells.reduce((acc: number[], col, idx) => {
      if (stringCols.includes(col)) acc.push(idx);
      return acc;
    }, []);

    // Go through body rows and overwrite innerText to avoid formatting
    const bodyRows = clonedTable.querySelectorAll('tbody tr');
    bodyRows.forEach(row => {
      const rowEl = row as HTMLTableRowElement;

      // Fix Month column
      if (monthColIndex > -1) {
        const cell = rowEl.cells[monthColIndex];
        if (cell) {
          const value = cell.textContent?.trim();
          if (value) {
            cell.innerText = value; // Remove formulas or leading characters
          }
        }
      }

      // Fix Date columns (standardize ISO -> UI format)
      dateColIndices.forEach(index => {
        const cell = rowEl.cells[index];
        if (cell) {
          const rawValue = cell.textContent?.trim();
          if (rawValue && rawValue !== '-') {
            const formatted = this.formatToUIDate(rawValue);
            cell.innerText = formatted;
          }
        }
      });

    });

    // Convert to Excel
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(clonedTable, { raw: true });

    // Post-process worksheet to convert numeric strings to numbers (except date columns and stringCols)
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
      'Payment_Advice_Report_' +
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

  // end
  // exportToExcelTable() {
  //     let table = document.getElementById('preAttendaceTable');
  //     if (!table) {
  //       console.error('Table not found!');
  //       return;
  //     }
  //     // Convert table to a worksheet

  //     let worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);

  //     Object.keys(worksheet).forEach((cell) => {

  //       Object.keys(worksheet).forEach(cell => {

  //         let cellValue = worksheet[cell]?.v;
  //          if (cell.startsWith('P') || cell.startsWith('Q')) { // Target column "P"
  //             if (worksheet[cell] && worksheet[cell].v !== undefined) {
  //                 worksheet[cell].t = 's'; // Set cell type to string
  //                 worksheet[cell].z = '@'; // Ensure Excel treats it as text
  //                 worksheet[cell].v = worksheet[cell].v.toString(); // Convert value to string
  //                 worksheet[cell].w = worksheet[cell].v; // Ensure display as text
  //             }
  //         }
  //     });

  //     // Create a new workbook and add the worksheet
  //     let workbook: XLSX.WorkBook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  //     })
  //     // Create a new workbook and add the worksheet
  //     let workbook: XLSX.WorkBook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  //     // Save the Excel file
  //     XLSX.writeFile(workbook, 'Payment_Advice_Report_' + this.employer_name.replaceAll(' ', '').trim() + "" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx');
  //   }

  isExcelDate(value: any): boolean {
    // Excel represents dates as numbers starting from 1-Jan-1900 (as 1)
    return typeof value === 'number' && value > 40000; // Approx 1-Jan-2009 onwards
  }


  unlockAdvice() {
    let empCodeArray = this.getSelectedEmployees().map(emp => emp.emp_code);

    if (!empCodeArray || empCodeArray.length == 0) {
      this.toastr.error('No employee selected', 'Oops!');
      return;
    }

    this.confirmationDialogService.confirm(`Are you sure you want to Unlock Payment Advice for ${empCodeArray.length} records?`, 'Unlock Payment Advice').subscribe(result => {
      if (result) {
        this._attendanceService.manageBulkAdvices({
          'action': 'Unlock',
          'empCode': empCodeArray,
          'customerAccountId': this.tp_account_id,
          'month': this.month,
          'year': this.year,
          'productTypeId': this.product_type,

        }).subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              this.selectAll = false;
              this.filteredEmployees.forEach(emp => emp.selected = false);

              this.Attendance_Report();

            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          }
        })
      }
    });
  }

  rejectAdvice() {
    let empCodeArray = this.getSelectedEmployees().map(emp => emp.emp_code);

    if (!empCodeArray || empCodeArray.length == 0) {
      this.toastr.error('No employee selected', 'Oops!');
      return;
    }

    this.confirmationDialogService.confirm(`Are you sure you want to Remove Payment Advice for ${empCodeArray.length} records ?`, 'Remove Payment Advice').subscribe(result => {
      if (result) {
        this._attendanceService.manageBulkAdvices({
          'action': 'DeleteAdvice',
          'empCode': empCodeArray,
          'customerAccountId': this.tp_account_id,
          'month': this.month,
          'year': this.year,
          'productTypeId': this.product_type,

        }).subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              this.selectAll = false;
              this.filteredEmployees.forEach(emp => emp.selected = false);
              this.Attendance_Report();

            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          }
        })
      }
    });
  }

  onEmployeeCheckboxChange() {
    const selectableEmployees = this.filteredEmployees.filter(emp => !(this.filteredEmployees.length - 1 && emp.emp_name === 'Grand Total'));
    this.selectAll = selectableEmployees.length > 0 && selectableEmployees.every(emp => emp.selected); // Updated logic
  }

  toggleSelectAll() {
    // console.log(this.filteredEmployees);
    this.filteredEmployees.forEach(employee => {
      if (!(this.filteredEmployees.length - 1 && employee.emp_name === 'Grand Total')) { // Prevent selecting the Grand Total row
        employee.selected = this.selectAll;
      }
    });
  }

  getSelectedEmployees() {
    return this.filteredEmployees.filter(employee => employee.selected);

  }


  lockAdvice() {
    let empCodeArray = this.getSelectedEmployees().map(emp => emp.emp_code);

    if (!empCodeArray || empCodeArray.length == 0) {
      this.toastr.error('No employee selected', 'Oops!');
      return;
    }

    this.confirmationDialogService.confirm(`Are you sure you want to Lock Payment Advice for ${empCodeArray.length} records?`, 'Lock Payment Advice').subscribe(result => {
      if (result) {
        this._attendanceService.manageBulkAdvices({
          'action': 'Lock',
          'empCode': empCodeArray,
          'customerAccountId': this.tp_account_id,
          'month': this.month,
          'year': this.year,
          'productTypeId': this.product_type,

        }).subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              this.selectAll = false;
              this.filteredEmployees.forEach(emp => emp.selected = false);
              this.Attendance_Report();

            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          }
        })
      }
    });
  }

  truncateToTwoDecimals(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }

    const numericValue = Number(value);
    return (Math.floor(numericValue * 100) / 100).toFixed(2);
  }

}
