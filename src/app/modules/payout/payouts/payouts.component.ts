import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../../employee/employee.service';
import { PayoutService } from '../payout.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { AccountsService } from '../../accounts/accounts.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AttendanceService } from '../../attendance/attendance.service';
import { environment } from 'src/environments/environment';
import { ApprovalsService } from '../../approvals/approvals.service';
import { ReportService } from '../../reports/report.service';
import { forkJoin } from 'rxjs';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { HelpAndSupportService } from '../../help-and-support/help-and-support.service';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';
declare var $: any;
@Component({
  selector: 'app-payouts',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.css'],
  animations: [dongleState, grooveState]
})
export class PayoutsComponent {
  searchKeyword: any;
  pfadmincharges: any;
  empCodes: any;
  master_data: any = [];
  Ledger_Name: any;
  message: any;
  invoice_amount: any;
  headId: any;
  invoice_detail_data: any = [];
  submit_button: boolean = false;
  mobile: any;
  dob: any;
  payment_mode_type: any = [];
  isAdditionalIncomeOpen: boolean = false;
  isDeductionOpen: boolean = false;
  isReimbursementOpen: boolean = false;
  report_button: boolean = false;
  product_type: any;
  total_Amount: any;
  payout_mode: any = [];
  calPaymentStatus: any;
  tp_account_id: any = '';
  showPopup: boolean = false;
  allowanceDeductForm: FormGroup;
  payout_form: FormGroup;
  showAllowDeductPopup: boolean = false;
  selected_emp_data: any;
  customerSummary: any = [];
  tb_account_id_ency: any = '';
  showSidebar: boolean = true;
  record_popup: boolean = false;
  payout_data: any = [];
  payout_json_data: any = [];
  // salaryData: any = [];
  // salaryData: Array<{mprmonth: string, mpryear: string, month_name: string}> = [];
  voucherData: any = [];
  month: any;
  payout_mode_type: any;
  SubLedger_data: any = [];
  year: any;
  index: any;
  selectedPayoutType: string = 'All';
  selected_date: any;
  payoutDetailSummary: any = [];
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
  id: any;
  yearsArray: any = [];
  totalAmount: number = 0;
  payout_json_detail_data: any = [];
  payout_detail: any = [];
  product_type_array: any[];
  product_type_text: any;
  token: any = '';
  button_status: boolean = false;
  payout_amount: any;
  stepNo = '1';
  CustumAmount_popup: boolean = false;
  payoutDetail: any = [];
  amount: any;
  Edit_salary_form: FormGroup;
  searchForm: FormGroup;
  accessRights: any = {};
  invoicedetail: any = [];
  selectedMonthYear: string = '';
  custumerAccountId: any = "";
  custumAmount: any = 0;
  //By Prabhat
  overtime_headid: string = '';
  allowance_headid: string = '';
  deduction_headid: string = '';
  advance_headid: string = '';
  open_approve_popup: boolean = false;
  voucher_data: any = [];
  confirmPaymentPop: any = false;
  selectSummary: any = '';
  numOfAssociate: any = '0';
  selectedPayment: any = '';
  payout_status: any;
  currentMonth: any;
  currentYear: any;
  currentDate = new Date();
  monthChanged = false;
  unit_master_list_data: any = [];
  selectedUnitId: any = [];
  selectedDepartmentId: any = [];
  selectedDesignationId: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];
  sidebarWidth: string = '0';
  checkedEmployees: any[] = [];
  selectAllChecked: boolean = false;
  monthSelected: boolean = false;
  selectedMonth: number | null = null;
  dropdownSettings = {};
  deptDropdownSettings = {};
  desgDropdownSettings = {};

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
  originalPayoutDetail: any;

  constructor(
    private _attendanceService: AttendanceService,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private _accountService: AccountsService,
    private router: Router,
    private _formBuilder: FormBuilder,
    private _PayoutService: PayoutService,
    public toastr: ToastrService,
    private _masterService: MasterServiceService,
    private _alertservice: AlertService,
    private _ReportService: ReportService,
    private _BusinesSettingsService: BusinesSettingsService,
    private helpAndSupportService: HelpAndSupportService) {
    // this.initializeMonthYear();
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.payout_mode_type = this.token.payout_mode_type;
    // console.log(this.payout_mode_type);

    this.tb_account_id_ency = this._EncrypterService.aesEncrypt(this.tp_account_id.toString())
    // this.product_type = token.product_type;

    this.product_type = localStorage.getItem('product_type');

    this.product_type_text = this.product_type == '1' ? 'Social Security' : this.product_type == '2' ? 'Payrolling' : '';
    this.product_type_array = [];

    if (this.token['product_type'] == '1,2') {

      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }
    if (this.token['product_type'] == '1') {
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });

    }
    if (this.token['product_type'] == '2') {
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }
    
    // const date = new Date();
    // let currentMonth = date.getMonth();
    // let currentYear = date.getFullYear();

    // for (let i = 2023; i <= currentYear + 1; i++) {
    //   this.yearsArray.push(i);

    // };
    let userRequest: any = localStorage.getItem('paymentRequest');
    userRequest = JSON.parse(userRequest);

    this.custumerAccountId = userRequest?.custumerAccountId;
    this.custumAmount = userRequest?.amount;
    this.numOfAssociate = userRequest?.numOfAssociate;

    const currentDate = new Date();
    this.currentMonth = currentDate.getMonth() + 1; // Adding 1 because getMonth returns zero-based index
    this.currentYear = currentDate.getFullYear();
    this.month = this.currentMonth.toString();
    this.year = this.currentYear.toString();
    this.accessRights = this._masterService.checkAccessRights('/payouts');
    console.log(this.accessRights);

    this.allowanceDeductForm = this._formBuilder.group({
      type: ['', [Validators.required]],
      value: ['', [Validators.required]],
      remarks: [''],

    })
    this.searchForm = this._formBuilder.group({
      searchKeyword: ['', [Validators.required]],
      statusoffilter: [''],
    });
    this.payout_form = this._formBuilder.group({
      selected_payout_mode: ['1', [Validators.required]],
      paymentRecordDate: ['', [Validators.required]],
      notificationCheckbox: [false]
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
    this.Create_Ticket_Form = this._formBuilder.group({
      ticketComment: ['', [Validators.required]],
    });
    localStorage.setItem('activeTab', 'id_Payouts');
    // this.month = date.getMonth();
    //this.year = date.getFullYear();
    console.log(this.month, this.year);
    this.isAdditionalIncomeOpen = true;
    this.isDeductionOpen = true;
    this.isReimbursementOpen = true;

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'unitid',
      textField: 'unitname',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };
    this.deptDropdownSettings = {
      singleSelection: false,
      idField: 'posting_department',
      textField: 'posting_department',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };
    this.desgDropdownSettings = {
      singleSelection: false,
      idField: 'post_offered',
      textField: 'post_offered',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };

    // this.PayoutSummary();
    this.getMasterData();
    this.get_att_unit_master_list();
    this.get_att_dept_master_list();
    this.get_att_role_master_list();
    this.getCustomerLedgerSummary();


    //For Ticket notifications
    // this.get_roles_master();
    // this.getTicketMaster();
    // this.get_ticket_status_master();
    // this.Get_Unread_Tickets();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('#FromDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date()); // Set current date as default
    }, 500);
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  openSidebar() {
    this.sidebarWidth = '400px';
  }

  // Method to close the sidebar
  closeSidebar() {
    // this.selectedUnitId=[];
    // this.selectedDesignationId=[];
    // this.selectedDepartmentId=[];
    this.sidebarWidth = '0';
    this.searchForm.get('searchKeyword')?.setValue('');
  }
  reset() {
    this.selectedUnitId = [];
    this.selectedDesignationId = [];
    this.selectedDepartmentId = [];
    this.searchForm.get('searchKeyword')?.setValue('');
    this.searchForm = this._formBuilder.group({
      statusoffilter: [''],
    });
  }
  Apply_new_filter() {
    // console.log(this.searchForm.get('statusoffilter')?.value);

    // this.getMasterData();
    this.getCustomerLedgerSummary();
    this.sidebarWidth = '0';
    this.PayoutSummary();
    this.updateDropdownSelection();

  }
  updateDropdownSelection() {
    const selectedMonthData = this.master_data.find(item => item.monthnumber == this.month);
    if (selectedMonthData) {
      const [selectedMonth, selectedYear] = selectedMonthData.monthname.split('-');
      this.month = selectedMonthData.monthnumber;
      this.year = selectedYear;
    }
  }
  onCheckboxChange(payout: any) {
    if (payout.checked) {
      this.checkedEmployees.push(payout.emp_code);
    } else {
      const index = this.checkedEmployees.indexOf(payout.emp_code);
      if (index !== -1) {
        this.checkedEmployees.splice(index, 1);
      }
    }
    // Update header checkbox based on all individual checkboxes
    this.updateSelectAllState();
  }
  selectAll(event: any) {
    this.checkedEmployees = [];
    this.selectAllChecked = event.target.checked;

    this.payoutDetail.forEach((payout: any) => {
      if (payout.paystatus !== 'Paid' && payout.amount != 0) {
        payout.checked = event.target.checked;
        if (event.target.checked) {
          this.checkedEmployees.push(payout.emp_code);
        } else {
          const index = this.checkedEmployees.indexOf(payout.emp_code);
          if (index !== -1) {
            this.checkedEmployees.splice(index, 1);
          }
        }
      } 
      //else if (payout.approvalstatus == 'Hold' && payout.amount == 0) {
      else if (this.searchForm.value.statusoffilter== 'Hold' && payout.amount == 0) {
        payout.checked = event.target.checked;
        if (event.target.checked) {
          this.checkedEmployees.push(payout.emp_code);
        } else {
          const index = this.checkedEmployees.indexOf(payout.emp_code);
          if (index !== -1) {
            this.checkedEmployees.splice(index, 1);
          }
        }

      } else {
        payout.checked = false;
      }
    });
  }

  updateSelectAllState() {
    const allChecked = this.payoutDetail.every((payout: any) =>
      payout.paystatus !== 'Paid' && payout.checked
    );
    this.selectAllChecked = allChecked;
  }

  get_att_unit_master_list() {
    this._BusinesSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllOUsForCustomer",
      "searchKeyword": ''
    }).subscribe((resData: any) => {
      this.unit_master_list_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          this.toastr.info('No data found', '');
          this.unit_master_list_data = [];
          return;
        }
        let unit_master_list_data = resData.commonData;
        // console.log(this.geo_fencing_list_data);

        for (let index = 0; index < unit_master_list_data.length; index++) {
          const element = unit_master_list_data[index];
          if (element.emp_codes) {
            unit_master_list_data[index].emp_codes = element.emp_codes ? element.emp_codes.replace(/}/g, '').replace(/{/g, '') : '';
          }
        }

        // Update unit_master_list_data with the org_unit_name for the dropdown
        this.unit_master_list_data = unit_master_list_data.map(item => ({
          unitname: item.org_unit_name,  // Use org_unit_name for unitname
          unitid: item.id                // Keep the ID for later use if needed
        }));
      } else {
        this.unit_master_list_data = [];
        console.log(resData.message);
      }
    });
  }
  get_att_dept_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetPostingDepartments",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.department_master_list_data = resData.commonData;
        //   if (!this.department_master_list_data.some(department => department.posting_department === this.selectedDepartmentId)) {
        //     this.selectedDepartmentId = [];  // Reset if the previously selected department no longer exists
        // }
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
      // console.log(resData);
      if (resData.statusCode) {
        this.role_master_list_data = resData.commonData;
        //   if (!this.role_master_list_data.some(role => role.post_offered === this.selectedDesignationId)) {
        //     this.selectedDesignationId =[];  // Reset if the previously selected role no longer exists
        // }
      } else {
        this.role_master_list_data = [];
        console.log(resData.message);
      }
    });
  }
  // initializeMonthYear() {
  //   const currentMonth = this.currentDate.getMonth() + 1; // getMonth is zero-based
  //   const currentYear = this.currentDate.getFullYear();
  //   const monthYearArray = [];

  //   for (let i = 0; i < 6; i++) { // Loop for 6 months
  //     let month = currentMonth - i;
  //     let year = currentYear;

  //     if (month <= 0) {
  //       month += 12;
  //       year -= 1;
  //     }

  //     const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
  //     monthYearArray.push({
  //       mprmonth: month.toString().padStart(2, '0'),
  //       mpryear: year.toString(),
  //       month_name: `${monthName} ${year}`
  //     });
  //   }

  //   this.salaryData = monthYearArray;
  //   this.setDefaultMonthYear();
  // }

  // setDefaultMonthYear() {
  //   const currentMonth = this.currentDate.getMonth() + 1;
  //   const currentYear = this.currentDate.getFullYear();
  //   this.selectedMonthYear = `${currentMonth.toString().padStart(2, '0')}-${currentYear}`;
  //   this.month = currentMonth.toString().padStart(2, '0');
  //   this.year = currentYear.toString();
  // }


  changeMonth(event: any) {
    const selectedMonthNumber = event.target.value;
    this.searchForm.get('searchKeyword')?.setValue('');
    // this.selectedUnitId=[];
    // this.selectedDesignationId=[];
    // this.selectedDepartmentId=[];
    this.selectAllChecked = false;
    if (selectedMonthNumber) {
      const selectedMonthData = this.master_data.find(item => item.monthnumber == selectedMonthNumber);
      if (selectedMonthData) {
        const [selectedMonth, selectedYear] = selectedMonthData.monthname.split('-');
        this.month = selectedMonthNumber;
        this.year = selectedYear;
        this.button_status = false;
        this.submit_button = false;
        this.report_button = false;
        this.monthChanged = true;
        this.monthSelected = true;
        this.PayoutSummary();
      }
      else {
        this.monthSelected = false;  // Hide the filter button if "Select Month" is selected
      }
    }
  }

  // changeMonth(event: any) {
  //   const selectedMonthYear = event.target.value;
  //   if (selectedMonthYear) {
  //     const [selectedMonth, selectedYear] = selectedMonthYear.split('-');
  //     this.month = selectedMonth;
  //     this.year = selectedYear;
  //     // console.log(this.month, this.year);
  //     this.button_status=false;
  //     this.submit_button=false;
  //     this.report_button=false;
  //     this.monthChanged = true;
  //     this.PayoutSummary();
  //   }
  // }

  get ad() {
    return this.allowanceDeductForm.controls;
  }

  openAllowDeductPopup(payout_data: any) {
    this.showAllowDeductPopup = true;
    this.selected_emp_data = payout_data?.emp_code;
    this.mobile = payout_data?.mobile;
    this.dob = payout_data?.dateofbirth;
    this.get_monthly_attendance();
    // console.log(this.selected_emp_data);

  }

  changeYear(e: any) {
    this.year = e.target.value;
    this.PayoutSummary();
  }
  changeProductType(e: any) {
    this.product_type = e.target.value;
    localStorage.setItem('product_type', this.product_type);
    this.PayoutSummary();
  }

  // Add_balance() {
  //   this.showPopup = false;

  //   this.amount = this.payout_amount - ((this.customerSummary != '' ? this.customerSummary.balance : '0.00'));
  //   this.router.navigate(['/payouts/payment'],
  //     {
  //       state: { amount: this.amount, payout_status: this.payout_status }
  //     });

  // }
  PayNow() {
    this.CustumAmount_popup = false;
  }
  close_popup() {
    this.showPopup = false;
  }

  approve_popup(): any {
    if (this.checkedEmployees.length == 0) {
      return this.toastr.error("Please select employees for record payment");
    } else {
      // for(let i=0;i<this.checkedEmployees.length;i++){
      let notAllowedArr = this.payoutDetail.filter(emp => this.checkedEmployees.includes(emp.emp_code) && (emp.amount == 0 || emp.approvalstatus == 'Hold'));
      if (notAllowedArr.length > 0) {
        return this.toastr.error("You can not proceed with employees whose salary amount is zero or status is hold.");
      }
      // }
    }

    this.open_approve_popup = true;
  }

  close_approve_popup() {
    this.open_approve_popup = false;
    this.checkedEmployees = [];
    this.selectAllChecked = false;
  }

  open_record_popup() {
    this.record_popup = true;
  }

  close_record_popup() {
    this.record_popup = false;
    this.checkedEmployees = [];
    this.selectAllChecked = false;
  }
  // submit_approve(){
  //   this.button_status=true;
  //   this.GetPaymentMode_Types();

  //   this.close_approve_popup();
  // }
  getMasterData() {
    this._PayoutService.GetMaster({
      "actionType": "GetAdviceMonths",
      "productTypeId": this.product_type,
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {

        this.master_data = resData.commonData;
        // console.log(this.master_data);

      } else {
        this.master_data = [];
        this.toastr.error(resData.message);
      }
    });
  }
  getCustomerLedgerSummary() {
    this._accountService.getCustomerLedgerSummary({
      'productTypeId': this.product_type,
      'customerAccountId': this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.customerSummary = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this.customerSummary);

      }
    })
  }
  PayoutSummary() {
    this.payoutDetail = [];
    let reqq: any;
    if (this.month == '' && this.year == '') {
      const currentDate = new Date();
      const currentMonth = currentDate?.getMonth() + 1; // Adding 1 because getMonth returns zero-based index
      const currentYear = currentDate?.getFullYear();

      this.selectedMonthYear = currentMonth + '-' + currentYear; // Set the default selected month-year
    } else {
      // If month and year are not empty, set the selected month-year accordingly
      this.selectedMonthYear = this.month + '-' + this.year;
    }
    reqq = {
      "customeraccountid": this.tp_account_id?.toString(),
      "payouttype": this.selectedPayoutType,
      "month": this.month.toString(), // Use the correct key for month
      "year": this.year.toString(),   // Use the correct key for year
      "productTypeId": this.product_type
    };
    //  }
    this._PayoutService
      .CustomerPayoutSummary(reqq)
      .subscribe((resData: any) => {
        this.monthChanged = false;
        if (resData.statusCode) {
          this.payout_data = this._EncrypterService.aesDecrypt(resData.commonData);
          // console.log(this.payout_data);

          this.payout_json_data = JSON.parse(this.payout_data);
          // console.log(this.payout_json_data);
          this.selectedMonth = this.month;
          // this.salaryData = this.payout_json_data.filter(item => item.payouttype === "Salary");
          this.voucherData = this.payout_json_data.filter(item => item.payouttype === "Voucher");
          this.getPayoutDetail();

        }
        else {
          this.monthChanged = false;
          this.payout_json_data = [];
          // this.salaryData = [];
          this.voucherData = [];
          this.toastr.error(resData.message, 'Error');

        }

      }, (error: any) => {
        this.monthChanged = false;
        this.payout_json_data = [];
        // this.salaryData = [];
        this.voucherData = [];
        this.toastr.error(error.error.message, 'Oops!');
      });
  }

  VoucherDetails(id: any) {
    if (id !== undefined && id !== '') {
      this.router.navigate(['/payouts/make-payments', id.toString()]);
    }
    else {
      this.toastr.info('Somthing went Wrong. Please try later.', 'Success');
    }

  }

  PayoutDetails(payout: any) {
    if (payout.amount < 0) {
      this.toastr.error("Invalid Required amount", "Oops!");
      return
    }
    this.selectSummary = payout;
    this.getPayoutDetail();
  }

  // isApprovedDisabled(payout: any): boolean {
  //   return (this.payoutDetailSummary[0]?.status === 'Completed' || this.payoutDetailSummary[0]?.status === 'PartiallyPending') && payout.approvalstatus === 'Approved';
  // }

  // isHoldDisabled(payout: any): boolean {
  //   // If payout status is Completed or PartiallyPending and its approval status is Approved, disable Hold
  //   return (this.payoutDetailSummary[0]?.status === 'Completed' || this.payoutDetailSummary[0]?.status === 'PartiallyPending') && payout.approvalstatus === 'Approved';
  // }

  // isReadOnly(payout: any): boolean {
  //   // Check if payout status is Completed or PartiallyPending and its approval status is Approved
  //   const isApprovedAndReadOnly = (this.payoutDetailSummary[0]?.status === 'Completed' || this.payoutDetailSummary[0]?.status === 'PartiallyPending') && payout.approvalstatus === 'Approved';
  //   // If the payout's approval status is Approved and it meets certain conditions, return true to make it readonly
  //   return isApprovedAndReadOnly || (payout.approvalstatus === 'Approved' && payout === this.selectedPayment);
  // }

  getPayoutDetail() {
    this.payoutDetail = [];
    let ou_id = this.selectedUnitId.map(obj => obj.unitid);
    let desgName = [];

    this.selectedDesignationId.map(desg => desgName.push(desg.post_offered));

    let deptName = [];
    this.selectedDepartmentId.map(dept => deptName.push(dept.posting_department));
    this.searchForm.get('statusoffilter')?.value;
    let reqq: any;
    this.searchKeyword = this.searchForm.get('searchKeyword')?.value?.toString();
    reqq = {
      "customeraccountid": this.tp_account_id.toString(),
      "payouttype": this.selectedPayoutType,
      "month": this.month.toString(),
      "year": this.year.toString(),
      "productTypeId": this.product_type,
      "GeoFenceId": this.token.geo_location_id,
      "searchKeyword": this.searchKeyword,
      "unitParameterName": ou_id.toString(),
      "postOffered": desgName.toString(),
      "postingDepartment": deptName.toString(),
      // "status": this.searchForm.get('statusoffilter')?.value?.toString()
    };
    console.log(reqq);

    this._PayoutService.CustomerPayoutDetails(reqq)
      .subscribe((resData: any) => {
        this.monthChanged = false;
        if (resData.statusCode == true) {
          this.stepNo = '2';
          let resultPayoutResult = this._EncrypterService.aesDecrypt(resData.commonData);
          let resultJson = JSON.parse(resultPayoutResult);
          this.selectedMonth = this.month;
          this.payoutDetail = resultJson.customerPayoutDetails;
          // console.log(this.payoutDetail);


          if (this.searchForm.get('statusoffilter')?.value === '') {

            this.payoutDetail = this.payoutDetail;
          } else {
            this.payoutDetail = this.payoutDetail.filter(x => x.approvalstatus === this.searchForm.get('statusoffilter')?.value);
          }

          this.checkedEmployees = [];
          this.selectAllChecked = false
          // this.empCodes = this.payoutDetail
          // .filter((emp: any) => emp.amount > 0 && emp.approvalstatus === 'Approved')
          // .map((emp: any) => emp.emp_code).join(',');

          this.payoutDetail.map((el: any, i: any) => {
            el['photopath'] = ((el['photopath'] != null && el['photopath'] != 'https://api.contract-jobs.com/crm_api/' && el['photopath'] != 'http://1akal.in/crm_api/') ? el['photopath'] : '');
          })

          this.payoutDetailSummary = resultJson.customerPayoutSummary;
          this.calculate_Amount();

          if (this.payoutDetailSummary[0]?.status === 'Low Balance' && this.payoutDetailSummary[0]?.invoicevalue == 0 && (!(this.currentMonth == this.payoutDetailSummary[0]?.mprmonth && this.currentYear == this.payoutDetailSummary[0]?.mpryear)
            || (this.payoutDetailSummary[0]?.days_left == 0))) {
            this.GetCustomer_InvoiceDetails();
          }

          if ((this.payoutDetailSummary[0]?.status === 'Pending') && this.payoutDetailSummary[0]?.invoicevalue == 0 && (!(this.currentMonth == this.payoutDetailSummary[0]?.mprmonth && this.currentYear == this.payoutDetailSummary[0]?.mpryear)
            || (this.payoutDetailSummary[0]?.days_left == 0)) && this.payout_mode_type == 'self') {
            this.GetCustomer_InvoiceDetails();
          }

          // if (this.payoutDetailSummary[0]?.status === 'Low Balance' && !(this.currentMonth == this.payoutDetailSummary[0]?.mprmonth && this.currentYear ==
          //   this.payoutDetailSummary[0]?.mpryear) && this.payoutDetailSummary[0]?.days_left==0 && this.payout_mode_type=='self') {
          //     this.GetCustomer_InvoiceDetails();
          //   this.CalcReciebaleFromBaseAmount();
          // }

        } else {
          this.monthChanged = false;
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      });
  }
  //by Prabhat

  GetCustomer_InvoiceDetails() {
    this._PayoutService.GetCustomerInvoiceDetails({
      "baseAmount": this.payoutDetailSummary[0]?.amount,
      "noOfEmployees": this.payoutDetailSummary[0]?.totalemployees,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.invoice_detail_data = (resData.commonData);
        this.invoice_amount = this.invoice_detail_data?.invoiceamount;
        this.calculate_Amount();
      } else {
        this.invoice_detail_data = [];
        this.invoice_amount = '';
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  submitPayButton(payment: any) {

    if (payment.amount < 0) {
      this.toastr.error("Invalid Required amount", "Oops!");
      return
    }
    // this.GetPaymentMode_Types();
    this.selectedPayment = payment;
    // this.record_popup=true;
    // this.open_approve_popup=false;
    this.confirmPaymentPop = true;

  }

  submit_Button(payment: any) {
    if (payment.amount < 0) {
      this.toastr.error("Invalid Required amount", "Oops!");
      return
    }
    this.GetPaymentMode_Types();
    this.selectedPayment = payment;
    this.record_popup = true;
    this.open_approve_popup = false;
  }
  submitPaySalary() {

    this.GetPaymentMode_Types();
    this.paySalary();

  }

  saveReceiable() {
    let resq = {
      "customeraccountid": this.invoicedetail?.customeraccountid,
      "numberofemployees": this.invoicedetail?.numberofemployees,
      "netamountreceived": this.invoicedetail?.netamountreceived,
      "servicechargerate": this.invoicedetail?.servicechargerate,
      "servicechargeamount": this.invoicedetail?.servicechargeamount,
      "gstmode": this.invoicedetail?.gstmode,
      "sgstrate": this.invoicedetail?.sgstrate,
      "sgstamount": this.invoicedetail?.sgstamount,
      "cgstrate": this.invoicedetail?.cgstrate,
      "cgstamount": this.invoicedetail?.cgstamount,
      "igstrate": this.invoicedetail?.igstrate,
      "igstamount": this.invoicedetail?.igstamount,
      "netvalue": this.invoicedetail?.payoutamount,
      "source": "Web",
      "created_by": this.invoicedetail?.customeraccountid,
      // "createdbyip": ":::1",
      "invoicetype": "",
      "service_name": this.invoicedetail?.service_name,
      "package_name": "Payrolling",
      "productTypeId": this.product_type
    }

    this._PayoutService.saveReceiable({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify(resq))
    })
      .subscribe((resData: any) => {
        // console.log(resData)
        if (resData.statusCode == true) {
          this.calPaymentStatus = '3';
        }
        else {

          this.toastr.error(resData.message, 'Error');
        }
      }, (error: any) => {

        this.toastr.error(error.error.message, 'Oops!');
      });


  }

  paySalary() {
    // old api
    // this._PayoutService.paySalary({
    // new api
    this._PayoutService.bulkPayout({
      "encrypted": this._EncrypterService.aesEncrypt(
        JSON.stringify({
          // "actionType": "leI40iudnMv9F/CBLKvGug==", //PaySalary
          // bew actonType
          "actionType": "PaySalary", //PaySalary
          "emp_code": this._EncrypterService.aesEncrypt(this.token.id),
          "markedByUserType": "Employer",
          "attendanceDates": {
            "Year": (this.selectedPayment.mpryear).toString(),
            "Month": (this.selectedPayment.mprmonth).toString()
          },
          "created_by": this.token.id,
          "customeraccountid": (this.token.tp_account_id).toString(),
          "productTypeId": this.token.product_type,
          "payoutEmpCodes": this.checkedEmployees.toString()
        })
      )
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        this.getPayoutDetail();
        this.button_status = true;
        this.close_approve_popup();
        this.selectedMonth = this.month;
        if ((this.payoutDetailSummary[0]?.status === 'PartiallyPending' && this.payoutDetailSummary[0]?.invoicevalue == 0) || (this.payoutDetailSummary[0]?.status === 'Pending' && this.payoutDetailSummary[0]?.invoicevalue == 0) && (!(this.currentMonth == this.payoutDetailSummary[0]?.mprmonth && this.currentYear == this.payoutDetailSummary[0]?.mpryear)
          || (this.payoutDetailSummary[0]?.days_left == 0)) && this.payoutDetailSummary[0]?.days_left == 0 && this.payoutDetailSummary[0]?.amount != 0 && (this.payoutDetailSummary[0]?.amount != this.customerSummary.balance)) {
          // this.Generate_Required_AmountPI();
          this.CalcReciebaleFromBaseAmount();
        }

        if ((this.payoutDetailSummary[0]?.status === 'Low Balance' && this.payoutDetailSummary[0]?.invoicevalue == 0) && (!(this.currentMonth == this.payoutDetailSummary[0]?.mprmonth && this.currentYear == this.payoutDetailSummary[0]?.mpryear)
          || (this.payoutDetailSummary[0]?.days_left == 0)) && this.payoutDetailSummary[0]?.days_left == 0 && (this.payoutDetailSummary[0]?.amount != this.customerSummary.balance)) {
          if (this.payoutDetailSummary[0]?.amount == 0 && this.total_Amount > 0) {
            this.CalcReciebaleFromBaseAmount();
          }
        }
        if ((this.payoutDetailSummary[0]?.status === 'Low Balance' || this.payoutDetailSummary[0]?.status === 'PartiallyPending' || this.payoutDetailSummary[0]?.status === 'Pending') && this.payoutDetailSummary[0]?.invoicevalue == 0 && (!(this.currentMonth == this.payoutDetailSummary[0]?.mprmonth && this.currentYear == this.payoutDetailSummary[0]?.mpryear)
          || (this.payoutDetailSummary[0]?.days_left == 0)) && this.payoutDetailSummary[0]?.days_left == 0 && this.payout_mode_type == 'self') {
          this.GetCustomer_InvoiceDetails();
          this.CalcReciebaleFromBaseAmount();
        }

        // if (this.payoutDetailSummary[0]?.status === 'Low Balance' && this.payoutDetailSummary[0]?.invoicevalue > 0 && !(this.currentMonth == this.payoutDetailSummary[0]?.mprmonth && this.currentYear ==
        //   this.payoutDetailSummary[0]?.mpryear) && this.payoutDetailSummary[0]?.days_left==0 && this.payout_mode_type=='self') {
        //     // this.GetCustomer_InvoiceDetails();
        //     this.Generate_Required_AmountPI();
        // }
        this.confirmPaymentPop = false;
        this.toastr.success(resData.message, 'Success ! ');
        // this.closeModal();
      }
      else {
        this.confirmPaymentPop = false;
        // this.toastr.error(resData.message, 'Oops!');

      }
    }, (error: any) => {

      // this.toastr.error(error.error.message, 'Oops!');
      this._alertservice.error(error.error.message, GlobalConstants.alert_options_autoClose);
    })
  }

  closeModal() {
    this.confirmPaymentPop = false;

  }
  onApprovalStatusChange(index: number, payout: any) {
    if (payout.approvalstatus === 'Approved') {
      this.ApprovesalryStatus(index, payout);
    } else if (payout.approvalstatus === 'Hold') {
      this.HoldsalryStatus(index, payout);
    }
  }

  isPayButtonDisabled(payout: any): boolean {
    return payout.days_left !== 0 || payout.amount === '0';
  }

  ApprovesalryStatus(index: any, userData: any) {
    let empcode = userData.mobile + "CJHUB" + userData.emp_code + "CJHUB" + userData.dateofbirth;
    let action_type = "kKS6roI70wfm5fuqKvqCqg==";
    let remarks = "approved salary status";

    this._PayoutService.UpdateSalaryStatus({
      "encrypted": this._EncrypterService.aesEncrypt(
        JSON.stringify({
          "customeraccountid": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
          "empcode": this._EncrypterService.aesEncrypt(empcode),
          "month": userData.mprmonth,
          "year": userData.mpryear,
          "action_type": action_type.toString(),
          "remarks": remarks.toString(),
          "productTypeId": this.product_type,
        })
      )

    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {

        this.getPayoutDetail();
        this.toastr.success(resData.message, 'Success');
      }
      else {
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        // this.toastr.error(resData.message, 'Error');
      }

    });

  }
  HoldsalryStatus(index: any, userData: any) {
    let empcode = userData.mobile + "CJHUB" + userData.emp_code + "CJHUB" + userData.dateofbirth;
    let action_type = "33PyreD6hkhGjzffE14F9Q==";
    let remarks = "hold salary status";

    this._PayoutService.UpdateSalaryStatus({
      "encrypted": this._EncrypterService.aesEncrypt(
        JSON.stringify({
          "customeraccountid": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
          "empcode": this._EncrypterService.aesEncrypt(empcode),
          "month": userData.mprmonth,
          "year": userData.mpryear,
          "action_type": action_type.toString(),
          "remarks": remarks.toString(),
          "productTypeId": this.product_type,
        })
      )

    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        this.toastr.success(resData.message, 'Success');
        // this.PayoutSummary();
        this.getPayoutDetail();

      }
      else {
        // this.toastr.error(resData.message, 'Error');
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }

    });

  }

  formatAmount(totalSelectedAmount: number, balance: string): string {
    const remainingAmount = totalSelectedAmount - parseFloat(balance || '0.00');
    // prabht return (remainingAmount >= 0 ? remainingAmount : 0).toFixed(2);
    return (remainingAmount >= 1 ? remainingAmount : 0).toFixed(2);
  }
  isShortfallZero(): boolean {
    return this.formatAmount(this.payoutDetailSummary[0]?.amount, this.customerSummary?.balance) === '0.00';
  }

  encrytValue(val: any) {
    return this._EncrypterService.aesEncrypt(val)
  }
  addBalance(enc_account_id: any, enc_amount: any, enc_totalemployees: any, status: any) {
    if (enc_amount < 0) {
      this.toastr.error("Invalid Required amount", "Oops!");
      return
    }

    this.showPopup = true;
    this.payout_amount = enc_amount;
    this.payout_status = status;

    let resq = {
      "amount": enc_amount,
      "custumerAccountId": enc_account_id,
      "numOfAssociate": enc_totalemployees
    }
    localStorage.setItem('paymentRequest', JSON.stringify(resq));
    //   if ( !this.isShortfallZero()) {
    //     const remainingBalance = this.payoutDetailSummary[0]?.amount - parseFloat((this.customerSummary !='' ? this.customerSummary.balance : '0.00'));

    //     this.amount = parseFloat(remainingBalance.toFixed(0.00));

    //     this.router.navigate(['/payouts/payment'], {
    //         state: { amount: this.amount, payout_status: this.payout_status }
    //     });
    // } else {
    this.router.navigate(['/payouts/payment'], {
      state: { amount: this.payout_amount, payout_status: this.payout_status, invoice_details: this.invoicedetail, month: this.payoutDetailSummary[0]?.mprmonth, year: this.payoutDetailSummary[0]?.mpryear, invoice_val: this.payoutDetailSummary[0]?.invoicevalue, Total_Amount: this.total_Amount, pfAdminCharges: this.payoutDetailSummary[0]?.pfadmincharges }
    });

    // if(this.payoutDetailSummary[0]?.amount == 0 && this.total_Amount > 0){
    //   this.router.navigate(['/payouts/payment'], {
    //     state: { amount: this.total_Amount, payout_status: this.payout_status,invoice_details: this.invoicedetail,month:this.payoutDetailSummary[0]?.mprmonth,year:this.payoutDetailSummary[0]?.mpryear,invoice_val:this.payoutDetailSummary[0]?.invoicevalue,Total_Amount:this.total_Amount}
    //   });
    // }
    // }


  }

  allowDeductChange(type: any) {
    this.allowanceDeductForm.patchValue({
      type: type
    })

    const selectedVoucher = this.voucher_data.find(voucher => {
      return voucher.voucher_name.toLowerCase() === type.toLowerCase();
    });
    if (selectedVoucher) {
      this.allowanceDeductForm.patchValue({
        type: type,
        value: selectedVoucher.amount,
        remarks: selectedVoucher.remarks
      });
    }
    else {
      this.allowanceDeductForm.patchValue({
        value: '',
        remarks: ''
      });
    }
  }

  saveAllowDeduct() {
    const isProduction = environment.production;
    const headIds = {
      overtime: { false: '49', true: '59' },
      allowance: { false: '50', true: '60' },
      deduction: { false: '52', true: '61' }
    };

    const type = this.ad?.type?.value;
    console.log(type, headIds[type]);

    if (type && headIds[type]) {
      const headId = headIds[type][isProduction];
      this.saveTpVoucher(headId);
    }
    // console.log(headId);

  }

  get_monthly_attendance() {

    let emp_code = this.mobile + 'CJHUB' + this.selected_emp_data + 'CJHUB' + this.dob;
    let encrypted_emp_code = this._EncrypterService.aesEncrypt(emp_code);

    this._attendanceService.get_monthly_attendance({
      "emp_code": encrypted_emp_code,
      "month": this.month.toString(),
      "year": this.year.toString(),
      "productTypeId": this.product_type,
      'customerAccountId': this.tp_account_id.toString()
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.voucher_data = resData.commonData.voucherDetails;

        } else {
          console.log(resData.message);
          this.toastr.info('Attendance yet to be marked', 'Info!');
          this.voucher_data = [];
        }
      })
  }
  saveTpVoucher(voucherHeadId: any) {
    if (this.allowanceDeductForm.valid) {
      this._attendanceService.saveTpVoucher({
        'customerAccountId': this.tp_account_id.toString(),
        'empCode': this.selected_emp_data?.toString(),
        'voucherHeadId': voucherHeadId?.toString(),
        'voucherAmount': this.ad.value.value,
        'voucherMonth': this.month,
        'voucherYear': this.year,
        'voucherRemarks': this.ad.remarks.value,
        'productTypeId': this.product_type,
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.get_monthly_attendance();
          this.getPayoutDetail();
          this.closeAllowanceDeductPopup();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      })

    }
    else {
      this.toastr.error('Please fill the required fields', 'Oops!');
    }
  }

  closeAllowanceDeductPopup() {
    this.showAllowDeductPopup = false;
    this.allowanceDeductForm.reset();
  }
  // calculateTotalAmount() {
  //   const payrollingCharges = parseFloat(this.invoicedetail?.payrollingcharges) || 0;
  //   const cgstAmount = parseFloat(this.invoicedetail?.cgstamount) || 0;
  //   const sgstAmount = parseFloat(this.invoicedetail?.sgstamount) || 0;
  //   const igstAmount = parseFloat(this.invoicedetail?.igstamount) || 0;

  //   // Calculate the total sum and round it to two decimal places
  //   this.totalAmount = parseFloat((payrollingCharges + cgstAmount + sgstAmount + igstAmount).toFixed(2));
  // }

  calculate_Amount() {
    const payoutamount = parseFloat(this.payoutDetailSummary[0]?.amount) || 0;
    const invoice_amount = parseFloat(this.invoice_detail_data?.invoiceamount) || 0;
    // console.log(invoice_amount);
    if (this.payoutDetailSummary[0]?.status === 'Low Balance' && this.payoutDetailSummary[0]?.invoicevalue == 0) {
      this.total_Amount = parseFloat((payoutamount + invoice_amount).toFixed(2));
      // console.log(this.total_Amount,"A",(this.payoutDetailSummary[0]?.status));
    }
    else if ((this.payoutDetailSummary[0]?.status === 'Pending') && this.payoutDetailSummary[0]?.invoicevalue == 0 && this.payout_mode_type == 'self') {
      this.total_Amount = parseFloat((payoutamount + invoice_amount).toFixed(2));
      // console.log(this.total_Amount,"A",(this.payoutDetailSummary[0]?.status));
    }
    else {
      this.total_Amount = parseFloat((payoutamount).toFixed(2));
      // console.log(this.total_Amount,"B",(this.payoutDetailSummary[0]?.status));
    }

  }

  CalcReciebaleFromBaseAmount() {
    this._PayoutService.CalcReciebaleFromBaseAmount({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify({
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        "baseAmount": this.payoutDetailSummary[0]?.amount,
        "numberOfEmployees": this.payoutDetailSummary[0]?.totalemployees,
        "productTypeId": this.product_type,
        "packageName": "Payrolling",
        "billtype": "Salary",
        "invoicemonth": this.month,
        "invoiceyear": this.year,
        "pfAdminCharges": this.payoutDetailSummary[0]?.pfadmincharges
      }))
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
        this.invoicedetail = JSON.parse(resultJson);
        // this.calculateTotalAmount();
        this.calculate_Amount();
        if (this.payoutDetailSummary[0]?.amount != 0 && this.payoutDetailSummary[0]?.days_left == 0) {

          this.saveReceiable();
        }
        // this.calPaymentStatus = "1";
      }
      else {
        this.invoicedetail = [];
        this.toastr.error(resData.message, 'Error');
      }
    }, (error: any) => {
      this.invoicedetail = [];
      this.toastr.error(error.error.message, 'Oops!');
    });

  }

  Generate_Required_AmountPI() {
    this._PayoutService.GenerateRequiredAmountPI({
      "amount": this.payoutDetailSummary[0]?.amount,
      "isBillable": 'N',
      "numberOfEmployees": this.payoutDetailSummary[0]?.totalemployees,
      "source": "Web",
      "createdBy": this.tp_account_id?.toString(),
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        let resultJson = (resData.commonData);
        this.invoicedetail = (resultJson);

        // console.log(this.invoicedetail);
        // this.toastr.success(resData.message);
        console.log(resData.message);
        if (this.payoutDetailSummary[0]?.amount != 0 && this.payoutDetailSummary[0]?.days_left == 0) {

          this.saveReceiable();
        }

      } else {
        this.invoicedetail = [];
        this.showPopup = true;
        // this.toastr.error(resData.message);
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  GetPaymentMode_Types() {
    this._PayoutService.GetPaymentModeTypes({}).subscribe((resData: any) => {

      if (resData.statusCode) {
        this.payment_mode_type = resData.commonData;
        // console.log(this.payment_mode_type);

      } else {
        this.payment_mode_type = [];
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  Record_Payment() {
    // const notificationSentStatus = this.payout_form.get('notificationCheckbox')?.value ? "Y" : "N";
    const notificationSentStatus = (this.empCodes && this.empCodes.length > 0)
      ? (this.payout_form.get('notificationCheckbox')?.value ? "Y" : "N") : "N";
    // console.log(notificationSentStatus);
    // old api
    // this._PayoutService.paySalary({
    // new api dated. 17.06.2025
    this._PayoutService.bulkPayout({
      "encrypted": this._EncrypterService.aesEncrypt(
        JSON.stringify({
          // "actionType": "zU7tocuFRchOSy8hl5IAtQ==", //RecordPayment
          // new actionType
          "actionType": "RecordPayment", //RecordPayment
          "emp_code": this._EncrypterService.aesEncrypt(this.token.id),
          "markedByUserType": "Employer",
          "attendanceDates": {
            "Year": (this.year).toString(),
            "Month": (this.month).toString()
          },
          "created_by": this.token.id,
          "customeraccountid": (this.token.tp_account_id).toString(),
          "productTypeId": this.token.product_type,
          "paymentMethodId": this.payout_form.get('selected_payout_mode')?.value,
          "paymentRecordDate": $('#FromDate2').val(),
          "notifyEmpCodes": this.checkedEmployees.toString(),
          "notificationSentStatus": notificationSentStatus,
          "payoutEmpCodes": this.checkedEmployees.toString()
        })
      )
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        this.report_button = true;
        this.submit_button = true;
        this.button_status = true;
        this.selectAllChecked = false;
        this.close_record_popup();
        this.getPayoutDetail();
        this.toastr.success(resData.message, 'Success ! ');
      }
      else {
        this.toastr.error(resData.message, 'Oops!');

      }
    }, (error: any) => {

      this.toastr.error(error.error.message, 'Oops!');
    })
  }

  processSelected(action: string) {
    const requests = this.checkedEmployees.map(empCode => {
      const userData = this.payoutDetail.find(p => p.emp_code === empCode);

      if (userData) {
        const empcode = `${userData.mobile}CJHUB${userData.emp_code}CJHUB${userData.dateofbirth}`;
        const action_type = action === 'Approved' ? 'kKS6roI70wfm5fuqKvqCqg==' : '33PyreD6hkhGjzffE14F9Q==';
        const remarks = action === 'Approved' ? 'approved salary status' : 'hold salary status';

        const payload = {
          encrypted: this._EncrypterService.aesEncrypt(
            JSON.stringify({
              customeraccountid: this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
              empcode: this._EncrypterService.aesEncrypt(empcode),
              month: userData.mprmonth,
              year: userData.mpryear,
              action_type,
              remarks,
              productTypeId: this.product_type,
            })
          )
        };

        return this._PayoutService.UpdateSalaryStatus(payload);
      }

      return null;
    }).filter(req => req !== null); // Filter out any null requests

    // Execute all API requests in parallel
    forkJoin(requests).subscribe(
      (responses: any[]) => {
        const successMessages = responses.filter(res => res.statusCode).map(res => res.message);
        const errorMessages = responses.filter(res => !res.statusCode).map(res => res.message);

        // Display success messages
        if (successMessages.length) {
          this.toastr.success(`${successMessages.length} records updated successfully`, 'Success');
        }

        // Display error messages
        if (errorMessages.length) {
          this._alertservice.error(errorMessages.join(', '), GlobalConstants.alert_options_autoClose);
        }

        // Refresh data after all requests are processed
        this.getPayoutDetail();
      },
      (error) => {
        this._alertservice.error('Failed to update some records.', GlobalConstants.alert_options_autoClose);
      }
    );
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
    // console.log('closeSendNotificationPopup');
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
      'reporting_module': 'Finance Team',
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
            (item: any) => item.tickettypename == 'Finance'
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
      'reporting_module': 'Finance Team',
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

  filteronclientdata(eve: any) {
    if (!this.originalPayoutDetail || this.originalPayoutDetail.length === 0) {
      this.originalPayoutDetail = [...this.payoutDetail];
    }
    if (eve === '') {

      this.payoutDetail = [...this.originalPayoutDetail];
    } else {
      this.payoutDetail = this.originalPayoutDetail.filter(x => x.approvalstatus === eve);
    }
    // console.log(eve);
    // this.payoutDetail = this.payoutDetail.filter(x => x.approvalstatus === eve);

  }

}
