import { ChangeDetectorRef, Component, Renderer2 } from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { PayoutService } from '../../payout/payout.service';
// import { AlertService } from 'src/app/shared/_alert';
import * as XLSX from 'xlsx';
import { environment } from 'src/environments/environment';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { Router } from '@angular/router';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { HelpAndSupportService } from '../../help-and-support/help-and-support.service';
import { FormControl } from '@angular/forms';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';
declare var $: any;

@Component({
  selector: 'app-attendances',
  templateUrl: './attendances.component.html',
  styleUrls: ['./attendances.component.css'],
  animations: [dongleState, grooveState]
})
export class AttendancesComponent {
  showSidebar: boolean = true;
  isDragging = false;
  decoded_token: any;
  month: any;
  year: any;
  month_copy: any;
  year_copy: any;
  alertModalStatus: boolean = false;
  is_att_sal_hide: string = 'N';
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


  yearsArray: any = [];
  product_type_array: any = [];
  blankCalendar: any = [];
  original_blankCalendar: any = [];
  emp_json_data: any = [];
  LedgerMasterHeads_head: any = [];
  filter_master_heads: any = []

  overtime_headid: string = '';
  allowance_headid: string = '';
  incentive_headid: string = '';
  deduction_headid: string = '';
  // advance_headid: string = '';
  travel_allowance = '';
  daily_allowance = '';

  tp_account_id: any;
  product_type: any = '';
  product_type_text: string = '';
  p: number = 1;
  // p: number = 0;
  limit: any = 10;
  limit_copy: any = 10;
  filteredEmployees: any = [];
  calendar_data: any = [];
  selected_emp_data: any;
  selectedCalendar_dates: any = [];
  startDragDate: string = '';
  endDragDate: string = '';
  show_product_type_dropdown: boolean = false;
  selected_date: any;
  show_payout_breakup: boolean = false;
  payroll_data: any = [];
  allowanceDeductForm: FormGroup;
  showAllowDeductPopup: boolean = false;
  voucher_data: any = [];
  keyword: any = '';
  is_insufficient_fund: boolean = false;
  payout_data: any = [];
  showLeaveTypes: boolean = false;
  markLeaveForm: FormGroup;
  bulk_att_data: any = [];
  filteredEmployees_forBulk: any = [];
  days_count: any = 0;

  options2: any = {
    autoClose: false,
    keepAfterRouteChange: true
  };

  showOpenBalance: boolean = false;
  openLeaveBalanceForm: FormGroup;
  showGenerateBtn: boolean = false;
  filter_emp_val: any = "All";
  filter_emp_val_copy: any = "All";
  original_filteredEmployees_forBulk: any = [];
  show_check_in_out = false;
  accessRights: any = {};
  download_excel_data: any = [];
  attendanceSummaryData: any = {};
  search_key: any = '';
  search_key_copy: any = '';
  searchTimeoutId: any;
  dropdownSettings: any = {};
  deptDropdownSettings: {};
  desgDropdownSettings: {};
  deptList: any = [];
  desgList: any = [];
  orgList: any = [];
  orgName: any = [];
  deptName: any = [];
  desgName: any = [];
  orgName_copy: any = [];
  deptName_copy: any = [];
  desgName_copy: any = [];
  change_sidebar_filter_flag: boolean = false;
  TDSForm: FormGroup;
  showTDSPopup: boolean = false;
  holidays_master_data: any = [];
  showLockedDaysPopup: boolean = false;
  locked_days_popup_data: any = [];
  locked_days_popup_data_msg: any = '';
  notificationForm: FormGroup;
  showNotificationPopup: boolean = false;
  roles_master_data: any = [];
  user_by_role_id_data: any = [];
  showTicketsTable: boolean = false;
  ticketStatusMaster: any = [];
  ticketsDetails: any = [];
  filteredTickets: any = [];
  selectedStatus: any = 'Open';
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

  statusControl = new FormControl('Open');
  create_ticket_data: any = [];
  dynamicHeads: any[] = [];

  // add by ak
  showApproveWorkReportPopup: boolean = false;
  CalcTpFlexiSalaryForm: FormGroup;
  payoutAmount: number = null;
  payoutEmpCode: any
  payoutPeriodLabel: string;
  GetTpFlexiSalaryData: any = [];
  CalcTpFlexiSalaryData: any = []
  current_month: any;
  current_year: any;
  errorMessage: string;
  maxInHandSalary: number = 0;
  isSummaryVisible: boolean = false;

  constructor(
    private _attendanceService: AttendanceService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    private _formBuilder: FormBuilder,
    private _PayoutService: PayoutService,
    private _masterService: MasterServiceService,
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService,
    private cdr: ChangeDetectorRef,
    private _businesessSettingsService: BusinesSettingsService,
    private helpAndSupportService: HelpAndSupportService) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    // console.log(this.decoded_token)

    // if (this.decoded_token.mobile == '7887990568') {
    //   this.is_insufficient_fund = true;
    // }

    this.Create_Ticket_Form = this._formBuilder.group({
      ticketComment: ['', [Validators.required]],
    });

    if (this.decoded_token.isEmployer == '0') {
      this.accessRights = this._masterService.checkAccessRights('/attendance');
      // console.log(this.accessRights);
    }


    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.product_type_array = [];
    this.product_type_text = this.product_type == '1' ? 'Social Security' : this.product_type == '2' ? 'Payrolling' : '';

    localStorage.setItem('activeTab', 'id_Attendance');

    if (this.decoded_token['product_type'] == '1,2') {
      this.show_product_type_dropdown = true;
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }
    if (this.decoded_token['product_type'] == '1') {
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
    }
    if (this.decoded_token['product_type'] == '2') {
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }


    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    this.current_month = currentMonth + 1;
    this.current_year = currentYear;

    for (let i = 2023; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);

    };

    if (localStorage.getItem('selected_date') == null) {
      // load prev month in all case
      let prev_month;
      let prev_year;
      if (currentMonth === 0) {
        prev_month = 12;
        prev_year = currentYear - 1;
      } else {
        prev_month = currentMonth;
        prev_year = currentYear;
      }
      let prev_monthdate = new Date(prev_year, prev_month, 0).getDate() + '-' + prev_month + '-' + prev_year;
      localStorage.setItem('selected_date', prev_monthdate);

    }
    this.selected_date = localStorage.getItem('selected_date');

    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];
    this.days_count = new Date(this.year, this.month, 0).getDate()

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'org_unit_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
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


    this.allowanceDeductForm = this._formBuilder.group({
      id: [''],
      type: ['', [Validators.required]],
      value: ['', [Validators.required]],
      remarks: [''],

    })

    this.markLeaveForm = this._formBuilder.group({
      leavetype: [''],
      emp_index: [''],
      att_type: [''],
    })

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

    this.openLeaveBalanceForm = this._formBuilder.group({
      rowid: [''],
      emp_id: [''],
      intial_leave_bal_txt: ([]),
      emp_name: [''],
      mobile: [''],
      orgempcode: [''],
      leave_bank_id: [''],
    })

    this.TDSForm = this._formBuilder.group({
      manualTDS: [''],
      empCode: [''],
    })

    // if (this.decoded_token.mobile != '7777777777') {
    //   this.PayoutSummary();
    // }

    // open on date 13/06/2024 start

    // if ((this.decoded_token.mobile == '7777777777'
    //   || this.decoded_token.mobile == '7827412951'
    //   || environment.production == false)) {
    //   this.show_check_in_out = true;
    // } else {
    //   this.show_check_in_out = false;
    // }

    // open on date 13/06/2024 start
    this.show_check_in_out = true;
    localStorage.removeItem('openedCalendar');

    this.get_calendar();
    this.get_holidays();

    // this.get_att_unit_master_list();
    this.get_geo_fencing_list();
    this.getDepartmentData();
    this.getDesignationData();

    // this.get_roles_master();
    // this.getTicketMaster();
    // this.get_ticket_status_master();
    // this.Get_Unread_Tickets();
    this.GetShowHideSalarytab();
  }

  PayoutSummary() {
    // this.payoutDetail = '';
    let reqq: any;
    if (this.month == '' && this.year == '') {
      reqq = {
        "customeraccountid": this.tp_account_id.toString(),
        "payouttype": "All",
        // "month": this.month.toString(),
        // "year": this.year.toString(),
        "productTypeId": this.product_type
      }
    }
    else {
      reqq = {
        "customeraccountid": this.tp_account_id.toString(),
        "payouttype": "All",
        "month": this.month.toString(),
        "year": this.year.toString(),
        "productTypeId": this.product_type
      }
    }
    this._PayoutService
      .CustomerPayoutSummary(reqq)
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.payout_data = this._EncrypterService.aesDecrypt(resData.commonData);
          if (JSON.parse(this.payout_data)[0]?.status == 'Low Balance') {
            this.is_insufficient_fund = true;
          } else {
            this.is_insufficient_fund = false;
          }
        }

      }, (error: any) => {
        console.error(error);
      });
  }

  get ad() {
    return this.allowanceDeductForm.controls;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  employer_details() {
    this.search_key = this.search_key.toString().trim();

    this._attendanceService
      .get_employer_today_attendance({

        customeraccountid: (this.tp_account_id),
        productTypeId: this.product_type,
        att_date: this.selected_date,
        emp_name: this.search_key,
        status: this.filter_emp_val,
        GeoFenceId: this.decoded_token.geo_location_id,
        pageNo: this.p,
        pageLimit: this.limit,
        postOffered: this.desgName,
        postingDepartment: this.deptName,
        unitParameterName: this.orgName,
        //,
        // searchKeyword: this.search_key,
      })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            let decrypted_emp_json_data = resData.commonData;
            this.emp_json_data = (decrypted_emp_json_data).data.attendancedetail;
            this.attendanceSummaryData = (decrypted_emp_json_data).data.attendancesummary;

            this.LedgerMasterHeads_head = (decrypted_emp_json_data).data.LedgerMasterHeads;
            const allowedVoucherNames = ['Overtime', 'Allowance', 'Deduction', 'Travel Allowance', 'Daily Allowance', 'Incentive'];
            this.dynamicHeads = this.LedgerMasterHeads_head.filter(head =>
              allowedVoucherNames.includes(head.voucher_name)
            );

            // this.overtime_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Overtime')[0]?.headid;
            // this.allowance_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Allowance')[0]?.headid;;
            // this.deduction_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Deduction')[0]?.headid;
            // // this.advance_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'SalaryAdvances')[0]?.headid;
            // // added on 16/05/2025
            // this.travel_allowance = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Travel Allowance')[0]?.headid;
            // this.daily_allowance = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Daily Allowance')[0]?.headid;
            // this.incentive_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Incentive')[0]?.headid;

            // end on 16/05/2025
            //  // added on 17/05/2024
            //   this.filter_master_heads= this.LedgerMasterHeads_head.filter(obj => (obj.voucher_name == 'Overtime'
            //   || obj.voucher_name == 'Allowance' || obj.voucher_name == 'Deduction'
            //   || obj.voucher_name == 'SalaryAdvances' || obj.voucher_name == 'Travel Allowance'
            //   || obj.voucher_name == 'Daily Allowance'));
            //   // end on 17/05/2024

            // console.log(' this.overtime_headid=>', this.overtime_headid);

            //setting showCalendar property
            this.emp_json_data.map((el: any) => {
              el['showCalendar'] = false;
              el['photopath'] = ((el['photopath'] != null && el['photopath']
                != 'https://api.contract-jobs.com/crm_api/') ? el['photopath'] : '');

              el['template_txt'] = el['template_txt'] != '' ? JSON.parse(el['template_txt']) : '';
              el['balance_txt'] = el['balance_txt'] != '' ? JSON.parse(el['balance_txt']) : '';

              el['comp_off_txt'] = el['comp_off_txt'] != '' ? JSON.parse(el['comp_off_txt']) : '';

            })

            this.filteredEmployees = this.emp_json_data;
            // console.log(this.emp_json_data);
            // this.filteredEmployees_forBulk = this.deepCopyArray(this.filteredEmployees);
            this.filteredEmployees_forBulk = this.deepCopyArray(this.filteredEmployees);
            let temp_arr = this.generateArrayOfObjects(this.days_count);

            // console.log(this.filteredEmployees);
            this.filteredEmployees_forBulk.map((el: any) => {
              el['att_details'] = temp_arr;
            });
            this.original_filteredEmployees_forBulk = this.deepCopyArray(this.filteredEmployees_forBulk);

            // this.search(this.keyword);
            // this.searchDownloadBulk(this.keyword);

            // H-removed
            // this.filter_emp(this.filter_emp_val);

            // console.log(resData.displayMessage);
            //this.toastr.success(resData.displayMessage, 'Success');

            // console.log(localStorage.getItem('openedCalendar'));

            let openedIndex = (localStorage.getItem('openedCalendar') == undefined ? null : parseInt(localStorage.getItem('openedCalendar')));
            if (openedIndex != null) {
              // H-removed
              // let oi = openedIndex + ((this.p - 1) * this.limit)
              // this.search(this.keyword);
              // this.toggleCalendar(openedIndex, this.filteredEmployees[oi], 'api');
              this.toggleCalendar(openedIndex, this.filteredEmployees[openedIndex], 'api');
            }

          } else {
            this.emp_json_data = [];
            this.filteredEmployees = [];
            this.filteredEmployees_forBulk = [];
            this.original_filteredEmployees_forBulk = [];
            this.attendanceSummaryData = {};
            // console.log(resData.message);
            //this.toastr.error(resData.message, 'Oops!');
          }

          if (this.change_sidebar_filter_flag) {
            this.closeSidebar();
          }

        }, error: (e) => {
          this.emp_json_data = [];
          this.filteredEmployees = [];
          this.filteredEmployees_forBulk = [];
          this.original_filteredEmployees_forBulk = [];
          console.log(e);
        }


      })

  }

  changeProductType(e: any) {
    this.product_type = e.target.value;
    localStorage.setItem('product_type', this.product_type);
    localStorage.removeItem('openedCalendar');
    this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
      arr[i].showCalendar = false;
    })
    this.p = 1;
    this.employer_details();
  }
  ngAfterViewChecked() {
    // Perform the change here
  }
  search(key: any) {
    if (this.searchTimeoutId) {
      clearTimeout(this.searchTimeoutId);
    }
    this.searchTimeoutId = setTimeout(() => {
      if (!key) {
        this.search_key = '';
        this.p = 1;
        this.employer_details();
        localStorage.removeItem('openedCalendar');
      } else {
        localStorage.removeItem('openedCalendar');
        this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
          arr[i].showCalendar = false;
        })
        this.p = 1;
        this.search_key = key;
        this.employer_details();
      }
    }, 1000);

    // H-removed
    // if (key != null && key != undefined && key != '') {
    //   // console.log(event);
    //   this.keyword = key;
    //   let searchkey = this.keyword.toString().toLowerCase();
    //   this.p = 1;
    //   // this.p = 0;
    //   this.filteredEmployees = this.emp_json_data.filter(function (element: any) {
    //     // return element.emp_name.toLowerCase().includes(searchkey)
    //     //   || element.mobile.toLowerCase().includes(searchkey)
    //     return (element.emp_name.toLowerCase().includes(searchkey)
    //       || element.mobile.toLowerCase().includes(searchkey) ||
    //       element.orgempcode?.toLowerCase().includes(searchkey)
    //     )

    //   });

    // }
    // else if (key == '') {
    //   this.filteredEmployees = this.deepCopyArray(this.emp_json_data);
    // }

    // console.log(this.filteredEmployees);
  }
  // searchDownloadBulk(key: any) {
  //   if (key != null && key != undefined && key != '') {
  //     // console.log(event);
  //     this.keyword = key;
  //     let searchkey = this.keyword.toString().toLowerCase();
  //     this.p = 1;
  //     // this.p = 0;
  //     this.filteredEmployees_forBulk = this.emp_json_data.filter(function (element: any) {
  //       return element.emp_name.toLowerCase().includes(searchkey)
  //         || element.mobile.toLowerCase().includes(searchkey)
  //     });

  //   }
  //   else if (key == '') {
  //     this.filteredEmployees_forBulk = this.deepCopyArray(this.emp_json_data);
  //   }
  //   // console.log(this.filteredEmployees);
  // }

  filter_emp(val: any) {

    this.p = 1;

    this.filter_emp_val = val;

    this.employer_details();

    // if (val == 1) {
    //   this.filteredEmployees = this.deepCopyArray(this.emp_json_data);

    // } else if (val == 2) {
    //   this.filteredEmployees = this.emp_json_data.filter((el: any) => {
    //     // if (el.approved_attendance.split(' ')[0] == 0) {
    //     //   return el;
    //     // }
    //     // console.log(el);
    //     if (el.monthly_att_approval_status == 'N' && parseInt(el.marked_attendance.split(' ')[0]) == 0) {
    //       return el;
    //     }
    //   })

    // } else if (val == 3) {
    //   this.filteredEmployees = this.emp_json_data.filter((el: any) => {
    //     // if (el.approved_attendance.split(' ')[0] > 0) {
    //     //   return el;
    //     // }
    //     if (el.monthly_att_approval_status == 'N' && parseInt(el.marked_attendance.split(' ')[0]) > 0) {
    //       return el;
    //     }
    //   })
    // } else if (val == 4) {
    //   this.filteredEmployees = this.emp_json_data.filter((el: any) => {
    //     // if (el.approved_attendance.split(' ')[0] > 0) {
    //     //   return el;
    //     // }
    //     if (el.monthly_att_approval_status == 'Y') {
    //       return el;
    //     }
    //   })
    // }
    // this.filter_bulk_emp_data(val);
  }

  filter_bulk_emp_data(val: any) {
    this.filter_emp_val = val;

    if (val == 1) {
      this.filteredEmployees_forBulk = this.deepCopyArray(this.original_filteredEmployees_forBulk);

    } else if (val == 2) {
      this.filteredEmployees_forBulk = this.original_filteredEmployees_forBulk.filter((el: any) => {
        // if (el.approved_attendance.split(' ')[0] == 0) {
        //   return el;
        // }
        if (el.monthly_att_approval_status == 'N') {
          return el;
        }
      })

    } else if (val == 3) {
      this.filteredEmployees_forBulk = this.original_filteredEmployees_forBulk.filter((el: any) => {
        // if (el.approved_attendance.split(' ')[0] > 0) {
        //   return el;
        // }
        if (el.monthly_att_approval_status == 'Y') {
          return el;
        }
      })
    }
  }

  get_page(event: any) {
    this.p = event;
    localStorage.removeItem('openedCalendar');
    this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
      arr[i].showCalendar = false;
    })
    this.employer_details();
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    localStorage.removeItem('openedCalendar');
    this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
      arr[i].showCalendar = false;
    });
    this.p = 1;

    this.get_calendar();
    this.get_holidays();
  }

  changeYear(e: any) {
    this.year = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    localStorage.removeItem('openedCalendar');
    this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
      arr[i].showCalendar = false;
    });
    this.p = 1;

    this.get_calendar();
    this.get_holidays();
  }

  /**Calendar **/
  toggleCalendar(new_index: any, emp_data: any, action: any): any {
    // console.log(emp_data.showCalendar);
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit && !this.accessRights.View) {
      return this.toastr.error("You do not have permission to perform this action.");
    }
    // let new_index = ((this.p - 1) * this.limit) + index;
    // console.log(new_index);
    // console.log('index', index, 'limit', this.limit, 'this.p', this.p, 'new_index', new_index);
    this.selected_emp_data = emp_data;

    if (action == 'toggle') {
      this.blankCalendar = this.deepCopyArray(this.original_blankCalendar);
    }

    if (this.filteredEmployees[new_index]?.showCalendar != undefined) {
      this.filteredEmployees[new_index].showCalendar = !this.filteredEmployees[new_index]?.showCalendar;
    } else {
      return;
    }

    if (this.filteredEmployees[new_index]?.showCalendar == true) {
      this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
        if (i != new_index) {
          arr[i].showCalendar = false;
        }
      })

      if (action == 'toggle') {
        localStorage.setItem('openedCalendar', new_index);
      }
      // H-removed
      // localStorage.setItem('openedCalendar', index);
      this.get_monthly_attendance(new_index);
    } else {
      localStorage.removeItem('openedCalendar');
      this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
        arr[i].showCalendar = false;
      })
      this.show_payout_breakup = false;
    }
  }

  get_calendar() {
    this._attendanceService.get_calendar({
      'action': 'get_blank_attendance',
      'employer_id': this.decoded_token.id,
      'month': this.month,
      'year': this.year,

    }).subscribe((resData: any) => {
      if (resData.status) {
        this.blankCalendar = this.deepCopyArray(resData.commonData);
        // this.blankCalendar.map((el: any) => {
        //   if (el.holiday_name_cd == 'HO') {
        //     el.attendance_type = 'HO';
        //   }
        // })
        this.original_blankCalendar = this.deepCopyArray(this.blankCalendar);


        this.employer_details();


      } else {
        this.blankCalendar = [];

        // this.toastr.error(resData.msg, 'Oops!');
      }
    })
  }

  calendarClick(data: any, index: any) {
    // console.log(data, 'harsh22');
    if (data.w_date == '') {
      return;
    }

    let checkIndex = this.selectedCalendar_dates.indexOf(data.w_date);

    if (checkIndex == -1) {
      this.selectedCalendar_dates.push(data.w_date);
    } else {
      this.selectedCalendar_dates.splice(checkIndex, 1);
    }

    // this.blankCalendar.map(el => {
    //   el.localSelection = false;
    // })
    this.blankCalendar[index].localSelection = (!this.blankCalendar[index].localSelection);
    // console.log(this.blankCalendar)
  }

  onMouseDown(event: MouseEvent, dd: any) {
    if (event.button === 2 || event.button === 0) {
      // console.log('harsh11');
      this.isDragging = true;
      this.startDragDate = dd.w_date;
      // this.selectedCalendar_dates = [];

      // this.blankCalendar.map(el => {
      //   el.localSelection = false;
      // })
    } else {
      this.isDragging = false;
    }
  }
  onMouseMove(event: MouseEvent, dd: any) {
    // console.log('Harsh')
    if (this.isDragging) {
      // console.log('hihihi');

      this.endDragDate = dd.w_date;

      const startIndex: any = this.getIndexByDate(this.startDragDate);
      const endIndex: any = this.getIndexByDate(this.endDragDate);

      if (startIndex < endIndex) {
        this.selectedCalendar_dates = this.blankCalendar.slice(startIndex, endIndex + 1)
          .filter(item => item.w_date != '')
          .map(item => item.w_date);
      } else {
        this.selectedCalendar_dates = this.blankCalendar.slice(endIndex, startIndex + 1)
          .filter(item => item.w_date != '')
          .map(item => item.w_date);
      }
      // console.log('Selected Dates', this.selectedCalendar_dates);

      this.blankCalendar.map(el => {
        el.localSelection = false;
      })

      this.selectedCalendar_dates.forEach(obj2 => {
        let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
        this.blankCalendar[index].localSelection = true;

      })

    }
  }
  onMouseUp(event: MouseEvent) {
    this.isDragging = false;
  }

  getIndexByDate(date: any) {
    return this.blankCalendar.findIndex((dd: any) => dd.w_date === date);
  }

  async onduty_click() {
    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }

    let auto_mark_n_actual_present_days = await this.validate_actual_auto('OD');
    if (auto_mark_n_actual_present_days == false) {
      return;
    }

    let checkSalaryConditonFlag = await this.checkSalaryCondFunc('OD');
    if (checkSalaryConditonFlag == false) {
      this.selectedCalendar_dates.forEach(obj2 => {
        let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
        this.blankCalendar[index].attendance_type = 'OD';
        this.blankCalendar[index].leavetype = '';

      })
      this.save_approve_attendance('SaveBulkAttendance');
    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this.selectedCalendar_dates.forEach(obj2 => {
            let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
            this.blankCalendar[index].attendance_type = 'OD';
            this.blankCalendar[index].leavetype = '';

          });
          this.save_approve_attendance('SaveBulkAttendance');
          // this.blankCalendar.map(el => {
          //   el.localSelection = false;
          // })
          // }
        } else {
        }
      });
    }

  }
  async ontour_click() {
    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }

    let auto_mark_n_actual_present_days = await this.validate_actual_auto('TR');
    if (auto_mark_n_actual_present_days == false) {
      return;
    }

    let checkSalaryConditonFlag = await this.checkSalaryCondFunc('TR');
    if (checkSalaryConditonFlag == false) {
      this.selectedCalendar_dates.forEach(obj2 => {
        let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
        this.blankCalendar[index].attendance_type = 'TR';
        this.blankCalendar[index].leavetype = '';

      })
      this.save_approve_attendance('SaveBulkAttendance');
    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this.selectedCalendar_dates.forEach(obj2 => {
            let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
            this.blankCalendar[index].attendance_type = 'TR';
            this.blankCalendar[index].leavetype = '';

          });
          this.save_approve_attendance('SaveBulkAttendance');
          // this.blankCalendar.map(el => {
          //   el.localSelection = false;
          // })
          // }
        } else {
        }
      });
    }

  }
  async onasl_click() {
    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }

    let auto_mark_n_actual_present_days = await this.validate_actual_auto('ASL');
    if (auto_mark_n_actual_present_days == false) {
      return;
    }

    let checkSalaryConditonFlag = await this.checkSalaryCondFunc('ASL');
    if (checkSalaryConditonFlag == false) {
      this.selectedCalendar_dates.forEach(obj2 => {
        let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
        this.blankCalendar[index].attendance_type = 'ASL';
        this.blankCalendar[index].leavetype = '';

      })
      this.save_approve_attendance('SaveBulkAttendance');
    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this.selectedCalendar_dates.forEach(obj2 => {
            let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
            this.blankCalendar[index].attendance_type = 'ASL';
            this.blankCalendar[index].leavetype = '';

          });
          this.save_approve_attendance('SaveBulkAttendance');
          // this.blankCalendar.map(el => {
          //   el.localSelection = false;
          // })
          // }
        } else {
        }
      });
    }

  }
  async onlwp_click() {
    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }

    let auto_mark_n_actual_present_days = await this.validate_actual_auto('LWP');
    if (auto_mark_n_actual_present_days == false) {
      return;
    }

    let checkSalaryConditonFlag = await this.checkSalaryCondFunc('LWP');
    if (checkSalaryConditonFlag == false) {
      this.selectedCalendar_dates.forEach(obj2 => {
        let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
        this.blankCalendar[index].attendance_type = 'LWP';
        this.blankCalendar[index].leavetype = '';

      })
      this.save_approve_attendance('SaveBulkAttendance');
    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this.selectedCalendar_dates.forEach(obj2 => {
            let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
            this.blankCalendar[index].attendance_type = 'LWP';
            this.blankCalendar[index].leavetype = '';

          });
          this.save_approve_attendance('SaveBulkAttendance');
          // this.blankCalendar.map(el => {
          //   el.localSelection = false;
          // })
          // }
        } else {
        }
      });
    }

  }
  go_to_dadsrkm_allowance() {
    this.router.navigate(['/attendance/dsr-da']);
  }
  go_to_upload_allowance() {
    //, { state: { 'page': 'welcome' }
    this.router.navigate(['/attendance/bulk-deduction']);
  }
  async present_click() {
    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }
    // console.log(this.selectedCalendar_dates);
    // console.log(this.selected_emp_data);

    let auto_mark_n_actual_present_days = await this.validate_actual_auto('PP');
    if (auto_mark_n_actual_present_days == false) {
      return;
    }

    let checkSalaryConditonFlag = await this.checkSalaryCondFunc('PP');

    // if (checkSalaryConditonFlag == true) {
    //   this.toastr.info(GlobalConstants.show_man_days_msg_alert);
    //   return;
    // }

    if (checkSalaryConditonFlag == false) {

      this.selectedCalendar_dates.forEach(obj2 => {
        let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
        this.blankCalendar[index].attendance_type = 'PP';
        this.blankCalendar[index].leavetype = '';
      })
      this.save_approve_attendance('SaveBulkAttendance');
      // this.blankCalendar.map(el => {
      //   el.localSelection = false;
      // })
      // }

    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this.selectedCalendar_dates.forEach(obj2 => {
            let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
            this.blankCalendar[index].attendance_type = 'PP';
            this.blankCalendar[index].leavetype = '';
          });
          this.save_approve_attendance('SaveBulkAttendance');
          // this.blankCalendar.map(el => {
          //   el.localSelection = false;
          // })
          // }
        } else {
        }
      });
    }
  }
  async wfh_click() {
    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }
    // console.log(this.selectedCalendar_dates);

    let auto_mark_n_actual_present_days = await this.validate_actual_auto('WFH');
    if (auto_mark_n_actual_present_days == false) {
      return;
    }

    let checkSalaryConditonFlag = await this.checkSalaryCondFunc('WFH');

    if (checkSalaryConditonFlag == false) {

      this.selectedCalendar_dates.forEach(obj2 => {
        let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
        this.blankCalendar[index].attendance_type = 'WFH';
        this.blankCalendar[index].leavetype = '';
      })
      this.save_approve_attendance('SaveBulkAttendance');

    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this.selectedCalendar_dates.forEach(obj2 => {
            let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
            this.blankCalendar[index].attendance_type = 'WFH';
            this.blankCalendar[index].leavetype = '';
          });
          this.save_approve_attendance('SaveBulkAttendance');

        } else {
        }
      });
    }
  }
  async absent_click() {
    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }

    this.selectedCalendar_dates.forEach(obj2 => {
      let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
      this.blankCalendar[index].attendance_type = 'AA';
      this.blankCalendar[index].leavetype = '';

    })

    // this.blankCalendar.map(el => {
    //   el.localSelection = false;
    // })
    this.save_approve_attendance('SaveBulkAttendance');
  }
  async half_click(index: any) {
    // let new_index = ((this.p - 1) * this.limit) + index;
    let new_index = index;

    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }

    let auto_mark_n_actual_present_days = await this.validate_actual_auto('HD');
    if (auto_mark_n_actual_present_days == false) {
      return;
    }

    let checkSalaryConditonFlag = await this.checkSalaryCondFunc('HD');

    // if (checkSalaryConditonFlag == true) {
    //   this.toastr.info(GlobalConstants.show_man_days_msg_alert);
    //   return;
    // }

    if (checkSalaryConditonFlag == false) {

      this.markLeaveForm.patchValue({
        emp_index: new_index,
        att_type: 'HD',
      })

      this.openLeaveTypes(this.selectedCalendar_dates);

      // this.selectedCalendar_dates.forEach(obj2 => {
      //   let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
      //   this.blankCalendar[index].attendance_type = 'HD';
      // })
      // this.save_approve_attendance('SaveBulkAttendance');

      //old
      // this.blankCalendar.map(el => {
      //   el.localSelection = false;
      // })
    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this.markLeaveForm.patchValue({
            emp_index: new_index,
            att_type: 'HD',
          })
          this.openLeaveTypes(this.selectedCalendar_dates);

        } else {
        }
      });

    }
  }


  /**Leave Click Changes**/
  async leave_click(index: any) {
    // let new_index = ((this.p - 1) * this.limit) + index;
    let new_index = index;

    // let check_dates = await this.validate_dates();
    let check_dates = await this.validate_dates_pass_future_dt();
    if (check_dates == false) {
      return;
    }
    let checkSalaryConditonFlag = await this.checkSalaryCondFunc('LL');
    // if (checkSalaryConditonFlag == true) {
    //   this.toastr.info(GlobalConstants.show_man_days_msg_alert);
    //   return;
    // }

    if (checkSalaryConditonFlag == false) {

      this.markLeaveForm.patchValue({
        emp_index: new_index,
        att_type: 'LL',
      });
      this.openLeaveTypes(this.selectedCalendar_dates);

    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this.markLeaveForm.patchValue({
            emp_index: new_index,
            att_type: 'LL',
          });
          this.openLeaveTypes(this.selectedCalendar_dates);

        } else {
        }
      });
    }

    // console.log(this.selectedCalendar_dates, '1');
    // console.log('2', this.blankCalendar);

    return;

    // this.selectedCalendar_dates.forEach(obj2 => {
    //   let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
    //   this.blankCalendar[index].attendance_type = 'LL';
    // })

    // Old
    // this.blankCalendar.map(el => {
    //   el.localSelection = false;
    // })

    // this.save_approve_attendance('SaveBulkAttendance');
  }

  handleInnerClick(e: any) {
    e.stopPropagation();
  }

  openLeaveTypes(dates: any) {
    this.showLeaveTypes = true;
    this.selectedCalendar_dates = dates;
    // console.log(this.selectedCalendar_dates);

  }
  closeLeaveTypes() {
    // console.log(this.selectedCalendar_dates);
    this.showLeaveTypes = false;
    $('input[name="leave_options"]').prop("checked", false);
    this.markLeaveForm.patchValue({
      leavetype: '',
      emp_index: '',
      att_type: '',
    })
  }
  changeLeaveType(e: any, prev_bal: any) {
    // console.log(this.selectedCalendar_dates);

    // To check the leave balance when applying for leave

    // console.log(this.selectedCalendar_dates.length , prev_bal);

    // Start Min Paid Days Condition - 15 July 2024
    let paiddays = parseFloat(this.selected_emp_data.marked_attendance_paid_days);
    let balance_txt = !this.selected_emp_data?.balance_txt ? 0 : this.selected_emp_data?.balance_txt;
    let comp_off_txt = !this.selected_emp_data?.comp_off_txt ? 0 : this.selected_emp_data?.comp_off_txt;

    if ((balance_txt == 0 && comp_off_txt == 0) || (balance_txt == 0 && e.target.value != 'CO')) {
      this.toastr.error('Your leave balance is low', 'Oops!');
      return;
    }
    else {
      if (balance_txt != 0) {
        // console.log('dfgdgf',balance_txt[0].effective_min_paid_days);
        let effective_min_paid_days = !balance_txt[0].effective_min_paid_days ? 0 : balance_txt[0].effective_min_paid_days;
        // console.log('dfgdgf',effective_min_paid_days);
        if (paiddays < effective_min_paid_days
          && effective_min_paid_days != 0
          && effective_min_paid_days != undefined) {
          // this.toastr.error('Minimum paid days'+effective_min_paid_days.toString() +' required to take this leave', 'Oops!');
          this.toastr.error('Minimum paid days ' + effective_min_paid_days + ' required to take this leave', 'Oops!');

          return;
        }
      }
    }
    // console.log(this.selected_emp_data);
    // END

    // if (this.selectedCalendar_dates.length > prev_bal && e.target.value != 'AA') {
    // To check the leave balance when applying for leave
    if ((this.markLeaveForm.value.att_type == 'HD' || this.markLeaveForm.value.att_type == 'HL') && (this.selectedCalendar_dates.length * 0.5) <= prev_bal && e.target.value != 'AA') {
      this.markLeaveForm.patchValue({
        leavetype: e.target.value,
      })
    }
    else if (e.target.value != 'AA' && e.target.value != 'CO' && this.selectedCalendar_dates.length > prev_bal) {
      this.toastr.error('Insufficient Leave Balance', 'Oops!');
      $('input[name="leave_options"]').prop("checked", false);
      this.markLeaveForm.patchValue({
        leavetype: '',
      })
      return;

    } else if (e.target.value == 'AA') {
      this.markLeaveForm.patchValue({
        leavetype: '',
      })
    } else if (e.target.value == 'CO') {
      if (this.selectedCalendar_dates.length > prev_bal) {
        this.toastr.error('Insufficient Compensatory Off Balance', 'Oops!');
        $('input[name="leave_options"]').prop("checked", false);
        this.markLeaveForm.patchValue({
          leavetype: '',
        })
        return;
      }

      let emp_index = this.markLeaveForm.value.emp_index;

      if (this.filteredEmployees[emp_index].comp_off_txt?.comp_off_applicable_type == 'All') {
        this.markLeaveForm.patchValue({
          leavetype: e.target.value,
        })
        return;
      }
      let comp_off_applicable_dayname = this.filteredEmployees[emp_index].comp_off_txt.comp_off_applicable_dayname;
      let comp_off_days_split = comp_off_applicable_dayname.split(',')
      // console.log(comp_off_days_split);
      // console.log(this.selectedCalendar_dates);

      for (let i = 0; i < this.selectedCalendar_dates.length; i++) {
        let split_dt = this.selectedCalendar_dates[i].split('-').reverse().join('-');
        let temp_dt = new Date(split_dt);
        let dayname = temp_dt.toLocaleDateString('en-US', { weekday: 'long' });

        let idx = comp_off_days_split.findIndex((e2: any) => e2 == dayname);

        if (idx == -1) {
          this.toastr.error('Compensatory Off applicable  days are  ' + comp_off_applicable_dayname, 'Oops!');
          $('input[name="leave_options"]').prop("checked", false);
          this.markLeaveForm.patchValue({
            leavetype: '',
          })
          return;
        }
      }

      this.markLeaveForm.patchValue({
        leavetype: e.target.value,
      })
      // console.log(prev_bal);
    }
    else {
      this.markLeaveForm.patchValue({
        leavetype: e.target.value,
      })

    }
  }

  changeLeaveHalfFullDay(e: any) {
    this.markLeaveForm.patchValue({
      att_type: e.target.value,
    })

    // console.log(this.markLeaveForm.value);
  }

  updateLeaveType() {
    // console.log(this.selectedCalendar_dates);
    let att_type = this.markLeaveForm.value.att_type;
    let leavetype = this.markLeaveForm.value.leavetype;
    console.log(leavetype, att_type);
    if ((att_type == 'LL' || att_type == 'HL') && leavetype == '') {
      this.toastr.error('Please select a Leave Type', 'Oops!');
      return;
    }

    this.selectedCalendar_dates.forEach(obj2 => {
      let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
      this.blankCalendar[index].attendance_type = att_type;
      this.blankCalendar[index].leavetype = leavetype;
    })

    // this.blankCalendar.map(el => {
    //   el.localSelection = false;
    // })

    this.save_approve_attendance('SaveBulkAttendance');
  }



  /**Leave Click Changes**/


  async holiday_click() {
    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }

    let checkSalaryConditonFlag = await this.checkSalaryCondFunc('HO');
    // if (checkSalaryConditonFlag == true) {
    //   this.toastr.info(GlobalConstants.show_man_days_msg_alert);
    //   return;
    // }

    if (checkSalaryConditonFlag == false) {

      this.selectedCalendar_dates.forEach(obj2 => {
        let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
        this.blankCalendar[index].attendance_type = 'HO';
        this.blankCalendar[index].leavetype = '';

      })

      // this.blankCalendar.map(el => {
      //   el.localSelection = false;
      // })
      this.save_approve_attendance('SaveBulkAttendance');

    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this.selectedCalendar_dates.forEach(obj2 => {
            let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
            this.blankCalendar[index].attendance_type = 'HO';
            this.blankCalendar[index].leavetype = '';

          })

          // this.blankCalendar.map(el => {
          //   el.localSelection = false;
          // })
          this.save_approve_attendance('SaveBulkAttendance');

        } else {
        }
      });
    }

  }
  async clear_click() {
    this.isDragging = false;
    // let check_dates = await this.validate_dates();
    // if (check_dates == false) {
    //   return;
    // }
    this.selectedCalendar_dates.forEach(obj2 => {
      let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
      this.blankCalendar[index].attendance_type = 'CLS';
      this.blankCalendar[index].leavetype = '';
    })

    this.blankCalendar.map(el => {
      el.localSelection = false;
    })
    this.save_approve_attendance('SaveBulkAttendance');
  }
  async weekoff_click() {
    this.isDragging = false;
    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }

    let checkSalaryConditonFlag = await this.checkSalaryCondFunc('WO');
    // if (checkSalaryConditonFlag == true) {
    //   this.toastr.info(GlobalConstants.show_man_days_msg_alert);
    //   return;
    // }

    if (checkSalaryConditonFlag == false) {

      this.selectedCalendar_dates.forEach(obj2 => {
        let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
        this.blankCalendar[index].attendance_type = 'WO';
        this.blankCalendar[index].leavetype = '';

      });

      this.blankCalendar.map(el => {
        el.localSelection = false;
      })
      this.save_approve_attendance('SaveBulkAttendance');

    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this.selectedCalendar_dates.forEach(obj2 => {
            let index = this.blankCalendar.findIndex(obj1 => obj1.w_date == obj2);
            this.blankCalendar[index].attendance_type = 'WO';
            this.blankCalendar[index].leavetype = '';

          });

          this.blankCalendar.map(el => {
            el.localSelection = false;
          })
          this.save_approve_attendance('SaveBulkAttendance');

        } else {
        }
      });

    }

  }

  remove_selection() {
    this.selectedCalendar_dates = [];
    this.blankCalendar.map(el => {
      el.localSelection = false;
    })
  }

  validate_dates_pass_future_dt() {
    return new Promise<boolean>((resolve) => {

      let current_date = new Date();

      let sel_emp_join = this.selected_emp_data.dateofjoining.split('/');
      let doj = new Date(sel_emp_join[2], (sel_emp_join[1] - 1), sel_emp_join[0]);

      let sel_emp_rel = this.selected_emp_data.dateofrelieveing.split('/');
      let dor = new Date(sel_emp_rel[2], (sel_emp_rel[1] - 1), sel_emp_rel[0]);

      // console.log(this.selectedCalendar_dates);

      if (this.selectedCalendar_dates.length == 0) {
        resolve(false);
      }

      for (let i = 0; i < this.selectedCalendar_dates.length; i++) {
        let split = this.selectedCalendar_dates[i].split('-');
        let sel_date = new Date(split[2], (split[1] - 1), split[0]);

        // if (sel_date > current_date) {
        //   this.toastr.error('Marking attendance for future dates is not allowed. Please check the selected date', 'Oops!');
        //   resolve(false);
        //   return;

        // } else
        if (sel_date < doj) {
          this.toastr.error('The marking date must be later than the employee(s) date of joining (DOJ)', 'Oops!');
          resolve(false);
          return;

        } else if (sel_date > dor) {
          this.toastr.error('The marking date must be earlier than the employee(s) date of leaving (DOL)', 'Oops!');
          resolve(false);
          return;

        }
      }

      resolve(true);

    });
  }
  validate_dates() {
    return new Promise<boolean>((resolve) => {

      let current_date = new Date();

      let sel_emp_join = this.selected_emp_data.dateofjoining.split('/');
      let doj = new Date(sel_emp_join[2], (sel_emp_join[1] - 1), sel_emp_join[0]);

      let sel_emp_rel = this.selected_emp_data.dateofrelieveing.split('/');
      let dor = new Date(sel_emp_rel[2], (sel_emp_rel[1] - 1), sel_emp_rel[0]);

      // console.log(this.selectedCalendar_dates);

      if (this.selectedCalendar_dates.length == 0) {
        resolve(false);
      }

      for (let i = 0; i < this.selectedCalendar_dates.length; i++) {
        let split = this.selectedCalendar_dates[i].split('-');
        let sel_date = new Date(split[2], (split[1] - 1), split[0]);

        if (sel_date > current_date) {
          this.toastr.error('Marking attendance for future dates is not allowed. Please check the selected date', 'Oops!');
          resolve(false);
          return;

        } else if (sel_date < doj) {
          this.toastr.error('The marking date must be later than the employee(s) date of joining (DOJ)', 'Oops!');
          resolve(false);
          return;

        } else if (sel_date > dor) {
          this.toastr.error('The marking date must be earlier than the employee(s) date of leaving (DOL)', 'Oops!');
          resolve(false);
          return;

        }
      }

      resolve(true);

    });
  }

  validate_actual_auto(att_type: any) {
    return new Promise<boolean>((resolve) => {

      let actual_present_days = !this.selected_emp_data.actual_present_days ? 0 : this.selected_emp_data.actual_present_days;
      let auto_mark_days = !this.selected_emp_data.auto_mark_days ? 0 : this.selected_emp_data.auto_mark_days;
      // console.log(actual_present_days, auto_mark_days);
      if (att_type != 'HD' && att_type != 'HL') {
        actual_present_days += this.selectedCalendar_dates.length;
      } else if (att_type == 'HD' || att_type == 'HL') {
        actual_present_days += (this.selectedCalendar_dates.length * 0.5);
      }

      if (actual_present_days < auto_mark_days) {
        this.confirmationDialogService.confirm(GlobalConstants.mark_att_alert, 'Confirm').subscribe(result2 => {
          if (result2) {
            resolve(true);
          } else {
            resolve(false);
          }

        });
      } else {
        resolve(true);
      }

    });
  }

  check_date(d: any, index: any) {
    // return true;
    let split_d = d.split('-');
    let date = new Date(split_d[2], (split_d[1] - 1), split_d[0]);
    let current_date = new Date();

    let sel_emp_join = this.selected_emp_data?.dateofjoining.split('/');
    let doj = (sel_emp_join != undefined && sel_emp_join != null) ? new Date(sel_emp_join[2], (sel_emp_join[1] - 1), sel_emp_join[0]) : '';

    let sel_emp_rel = this.selected_emp_data?.dateofrelieveing.split('/');
    let dor = (sel_emp_rel != undefined && sel_emp_rel != null) ? new Date(sel_emp_rel[2], (sel_emp_rel[1] - 1), sel_emp_rel[0]) : '';

    if (doj != '' && date < doj) {
      // this.blankCalendar[index].attendance_type = '';
      return true;
    } else if (dor != '' && date > dor) {
      // this.blankCalendar[index].attendance_type = '';
      return true;
    } else if (date > current_date) {
      // this.blankCalendar[index].attendance_type = '';
      return true;
    }

    return false;
  }
  /**Calendar **/


  // HUB Calendar Data
  get_monthly_attendance(new_idx: any) {
    let data = this.selected_emp_data
    // console.log(data);
    // console.log(this.holidays_master_data);

    let emp_code = data.mobile + 'CJHUB' + data.emp_code + 'CJHUB' + data.dateofbirth;
    let encrypted_emp_code = this._EncrypterService.aesEncrypt(emp_code);
    // this.blankCalendar = this.deepCopyArray(this.original_blankCalendar);
    //  debugger;
    this._attendanceService.get_monthly_attendance({
      "emp_code": encrypted_emp_code,
      "month": this.month.toString(),
      "year": this.year.toString(),
      "productTypeId": this.product_type,
      'customerAccountId': this.tp_account_id.toString()
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {

          this.blankCalendar = this.deepCopyArray(this.original_blankCalendar);
          // console.log(this.blankCalendar);
          // console.log(data);
          // console.log(this.holidays_master_data);


          this.calendar_data = !resData.commonData.data ? [] : resData.commonData.data;
          this.payroll_data = resData.commonData.payroll;
          this.voucher_data = !resData.commonData.voucherDetails ? [] : resData.commonData.voucherDetails;
          let auto_mark_days = 0;
          let actual_present_days = 0;

          // filter master data for allowance/deductions dated. 17/05/2024
          // for (let i = this.LedgerMasterHeads_head.length - 1; i >= 0; i--) {
          //   if (!this.voucher_data.some(({headid}) => headid === this.LedgerMasterHeads_head[i].headid)) {
          //     this.LedgerMasterHeads_head.splice(i, 1);
          //   }
          // }

          // for (let i = this.filter_master_heads.length - 1; i >= 0; i--) {
          //     if (!this.voucher_data.some(({headid}) => headid === this.filter_master_heads[i].headid)) {
          //       this.voucher_data.splice(i, 1);
          //     }
          //   }
          // end

          // this.voucher_data.forEach(item2 => {
          //   const matchingItem = this.LedgerMasterHeads_head.find(item1 => item1.headid === item2.headid);
          //   if (matchingItem) {
          //     item2.is_taxable = matchingItem.is_taxable;
          //   }
          // });
          // console.log(this.voucher_data);
          // console.log(this.LedgerMasterHeads_head);

          this.calendar_data.forEach((obj2: any) => {
            const matchingObjectIndex = this.blankCalendar.findIndex(obj1 => obj1.w_date.split('-')[0] == obj2.attday);

            if (matchingObjectIndex !== -1) {
              this.blankCalendar[matchingObjectIndex] = { ...this.blankCalendar[matchingObjectIndex], ...obj2 };
            }

            // if (obj2?.attendance_type == 'HO' || obj2?.attendance_type == 'WO' || obj2?.attendance_type == 'RH') {
            //   auto_mark_days += 1.0;
            // } else if (obj2?.attendance_type == 'PP' || obj2?.attendance_type == 'OD' || obj2?.attendance_type == 'WFH' || obj2?.attendance_type == 'TR' || obj2?.attendance_type == 'LWP' || obj2?.attendance_type == 'ASL') {
            //   actual_present_days += 1.0;
            // } else if (obj2?.attendance_type == 'HD') {
            //   actual_present_days += 0.5;
            // }
            // console.log(this.blankCalendar[matchingObjectIndex]);

          });

          let holiday_state_name = ''
          if (data.holiday_state_name) {
            holiday_state_name = data.holiday_state_name;
          } else {
            holiday_state_name = this.decoded_token.state;
          }

          // Holidays Patch on State Name : 27-12-2024
          if (holiday_state_name) {
            this.holidays_master_data.map((el1: any) => {
              if (el1?.state_name?.trim().toLowerCase() === holiday_state_name?.trim().toLowerCase()) {
                let dd = el1?.holiday_date.split('-')[0];
                console.log(dd, el1.holiday_name_cd);
                let idx = this.blankCalendar.findIndex(el2 => el2?.w_date.split('-')[0] == dd);
                // console.log(idx);
                if (idx != -1 && !this.blankCalendar[idx].attendance_type) {
                  this.blankCalendar[idx].attendance_type = el1.holiday_name_cd;
                }
              }
            })
          }


          this.blankCalendar.forEach((obj2: any) => {
            if (obj2?.attendance_type == 'HO' || obj2?.attendance_type == 'WO' || obj2?.attendance_type == 'RH') {
              auto_mark_days += 1.0;
            } else if (obj2?.attendance_type == 'PP' || obj2?.attendance_type == 'OD' || obj2?.attendance_type == 'WFH' || obj2?.attendance_type == 'TR' || obj2?.attendance_type == 'LWP' || obj2?.attendance_type == 'ASL') {
              actual_present_days += 1.0;
            } else if (obj2?.attendance_type == 'HD') {
              actual_present_days += 0.5;
            }
          })

          this.filteredEmployees[new_idx].auto_mark_days = auto_mark_days;
          this.filteredEmployees[new_idx].actual_present_days = actual_present_days;

          // setTimeout(() => {
          //   console.log(this.blankCalendar);
          // },1000)
          // console.log(this.filteredEmployees);
          this.cdr.detectChanges();
          this.selectedCalendar_dates = [];
          this.blankCalendar.map(el => {
            el.localSelection = false;
          })
          // console.log(this.blankCalendar);

        } else {
          this.blankCalendar = this.deepCopyArray(this.original_blankCalendar);

          // this.toastr.error(resData.message, 'Oops!');
          console.log(resData.message);
          this.toastr.info('Attendance is yet to be marked', 'Info!');
          this.calendar_data = [];
          this.payroll_data = [];
          this.voucher_data = [];
        }
      }, error: (e) => {
        this.download_excel_data = [];
        console.log(e);
      }
    })
  }

  save_approve_attendance(action: any) {

    // console.log(this.selected_emp_data);
    //
    if (this.selected_emp_data['advicelockstatus'] == 'Locked' && action == 'ApproveBulkAttendance') {
      this.toastr.info(' Payment Advice has been locked and ticket has been created');
      return;
    }

    let postdata = {};
    postdata['actionType'] = action;
    postdata['emp_code'] = this.selected_emp_data.mobile + 'CJHUB' + this.selected_emp_data.emp_code + 'CJHUB' + this.selected_emp_data.dateofbirth;
    postdata['markedByUserType'] = 'Employer';
    postdata['attendanceDates'] = [];
    postdata['productTypeId'] = this.product_type;
    postdata['customeraccountid'] = this.tp_account_id.toString();
    postdata['empLeaveBankId'] = this.selected_emp_data.leave_bank_id;
    postdata['payout_with_attendance'] = !this.selected_emp_data.payout_with_attendance ? '' : this.selected_emp_data.payout_with_attendance;

    let custom_msg = '';

    if (this.selectedCalendar_dates.length == 0 && action == 'SaveBulkAttendance') {
      this.toastr.info('No attendance has been marked', 'Info!');
      return;
    }

    // start
    let appr_checkSalaryConditonFlag = false;

    if (action == 'ApproveBulkAttendance') {
      let leavetaken = parseFloat(this.selected_emp_data.marked_attendance_leave_taken);
      let paiddays = parseFloat(this.selected_emp_data.marked_attendance_paid_days);
      let salarydays = parseFloat(this.selected_emp_data.salarydays);
      let salary_days_opted = this.selected_emp_data.salary_days_opted;
      // console.log('bjsbdjbsjbfjsdbjfsdbj');
      if (salarydays < 30 || salary_days_opted == 'Y') {
        if ((paiddays + leavetaken) > salarydays) {
          appr_checkSalaryConditonFlag = true
        }
      }
      for (let i = 0; i < this.blankCalendar.length; i++) {
        if (this.blankCalendar[i].attendance_type == 'MP') {
          if (environment.production) {
            this.toastr.error('Please resolve the missing punch or deviation in attendance status', 'Oops!');
            return;
          }

        } else if (this.blankCalendar[i].attendance_type == 'SWL') {
          this.toastr.error('Please resolve the sandwich policy leave for Weekly off in attendance status', 'Oops!');
          return;
        }
      }

    }
    if (appr_checkSalaryConditonFlag) {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {

        // console.log(result);
        if (result) {
          // if (appr_checkSalaryConditonFlag) {
          //   if (!confirm(GlobalConstants.show_man_days_msg))
          //     return;
          // }
          // end
          this.blankCalendar.map((el: any) => {

            let add_att_flag = true;

            // For Holiday & WeekOff
            if (el.attendance_type == 'WO' || el.attendance_type == 'HO' || el.attendance_type == 'RH') {
              const future_4_dt = new Date();
              future_4_dt.setDate(future_4_dt.getDate() + 4);
              const current_dt = new Date();

              const att_dt = new Date(
                (() => {
                  const [day, month, year] = el.w_date.split('-');
                  return `${year}-${month}-${day}`;
                })()
              );

              if (att_dt <= current_dt || (this.original_blankCalendar[0].is_bypass_future_dt == 'Y'
                && this.original_blankCalendar[0].payout_period == 'Advance' && att_dt <= future_4_dt)) {
                add_att_flag = true;
              } else {
                add_att_flag = false;
              }
            }
            if (add_att_flag && el.attendance_type !== null && el.attendance_type !== undefined && el.attendance_type !== '') {
              // let att_type = el.attendance_type == 'RH' ? 'HO' : el.attendance_type;
              let att_type = el.attendance_type;

              postdata['attendanceDates'].push({
                'attendancedate': el.w_date.split('-').join('/'),
                'attendancetype': att_type,
                'leavetype': el.leavetype
              });

              if (el.attendance_type == 'CLS') {
                custom_msg = 'Attendance has been cleared successfully';
              }
            }
          });

          if (postdata['attendanceDates'].length == 0) {
            this.toastr.info('No attendance marked', 'Info!');
            return;
          }
          // console.log(postdata);
          // return;

          this._attendanceService.save_monthly_attendance(postdata)
            .subscribe((resData: any) => {
              if (resData.statusCode) {
                if (custom_msg != '') {
                  this.toastr.info(custom_msg, 'Info');
                } else {
                  if (resData?.commonData && resData?.commonData?.data && resData.commonData?.data?.commonData && resData.commonData?.data?.commonData == 'Advance attendance already exists.') {
                    this.toastr.info(resData.commonData?.data?.commonData, 'Info');
                  } else {
                    this.toastr.success(resData.message, 'Success');
                  }
                }
                this.employer_details();

                this.selectedCalendar_dates = [];
                this.closeLeaveTypes();
              } else {
                this.toastr.error(resData.message, 'Oops!');
              }
            })
        } else {
          return;

        }
      });
    } else {

      this.blankCalendar.map((el: any) => {

        let add_att_flag = true;

        // For Holiday & WeekOff
        if (el.attendance_type == 'WO' || el.attendance_type == 'HO' || el.attendance_type == 'RH') {
          const future_4_dt = new Date();
          future_4_dt.setDate(future_4_dt.getDate() + 4);

          const current_dt = new Date();

          const att_dt = new Date(
            (() => {
              const [day, month, year] = el.w_date.split('-');
              return `${year}-${month}-${day}`;
            })()
          );

          if (att_dt <= current_dt || (this.original_blankCalendar[0].is_bypass_future_dt == 'Y' && this.original_blankCalendar[0].payout_period == 'Advance' && att_dt <= future_4_dt)) {
            add_att_flag = true;
          } else {
            add_att_flag = false;
          }

        }


        if (add_att_flag && el.attendance_type !== null && el.attendance_type !== undefined && el.attendance_type !== '') {
          // let att_type = el.attendance_type == 'RH' ? 'HO' : el.attendance_type;
          let att_type = el.attendance_type;

          postdata['attendanceDates'].push({
            'attendancedate': el.w_date.split('-').join('/'),
            'attendancetype': att_type,
            'leavetype': el.leavetype
          });

          if (el.attendance_type == 'CLS') {
            custom_msg = 'Attendance cleared successfully';
          }
        }

      });

      if (postdata['attendanceDates'].length == 0) {
        this.toastr.info('No attendance marked', 'Info!');
        return;
      }

      // console.log(postdata);
      // return;
      this._attendanceService.save_monthly_attendance(postdata)
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            if (custom_msg != '') {
              this.toastr.info(custom_msg, 'Info');
            } else {
              if (resData?.commonData && resData?.commonData?.data && resData.commonData?.data?.commonData && resData.commonData?.data?.commonData == 'Advance attendance already exists.') {
                this.toastr.info(resData.commonData?.data?.commonData, 'Info');
              } else {
                this.toastr.success(resData.message, 'Success');
              }
            }
            this.employer_details();

            this.selectedCalendar_dates = [];
            this.closeLeaveTypes();
          } else {
            this.toastr.error(resData.message, 'Oops!');
          }
        })
    }


  }



  /**Deep Copy**/
  deepCopyArray(arr) {
    const copy = [];

    arr.forEach(item => {
      if (Array.isArray(item)) {
        copy.push(this.deepCopyArray(item)); // Recursively copy arrays
      } else if (typeof item === 'object' && item !== null) {
        copy.push(this.deepCopyObject(item)); // Recursively copy objects
      } else {
        copy.push(item); // Copy primitive values
      }
    });

    return copy;
  }
  deepCopyObject(obj) {
    const copy = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          copy[key] = this.deepCopyArray(obj[key]); // Recursively copy arrays
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          copy[key] = this.deepCopyObject(obj[key]); // Recursively copy objects
        } else {
          copy[key] = obj[key]; // Copy primitive values
        }
      }
    }

    return copy;
  }
  /**Deep Copy**/


  show_hide_payout() {
    this.show_payout_breakup = !this.show_payout_breakup;
  }


  openAllowDeductPopup() {
    this.showAllowDeductPopup = true;

  }

  closeAllowanceDeductPopup() {
    this.showAllowDeductPopup = false;
    this.allowanceDeductForm.patchValue({
      id: '',
      type: '',
      value: '',
      remarks: '',
    })
  }

  allowDeductChange(head: any) {
    console.log(head);
    this.allowanceDeductForm.patchValue({ type: head.voucher_name.toLowerCase(), id: head.headid });

    const matchedVoucher = this.voucher_data.find(v => v.headid == head.headid);

    if (matchedVoucher) {
      this.allowanceDeductForm.patchValue({
        value: matchedVoucher.amount,
        remarks: matchedVoucher.remarks
      });
    } else {
      this.allowanceDeductForm.patchValue({
        value: '',
        remarks: ''
      });
    }

    // console.log(this.allowanceDeductForm.value);
  }




  saveTpVoucher() {
    let voucherHeadId = this.allowanceDeductForm.value.id.toString();

    if (this.allowanceDeductForm.valid) {
      this._attendanceService.saveTpVoucher({
        'customerAccountId': this.tp_account_id.toString(),
        'empCode': this.selected_emp_data.emp_code.toString(),
        'voucherHeadId': voucherHeadId,
        'voucherAmount': this.ad.value.value,
        'voucherMonth': this.month,
        'voucherYear': this.year,
        'voucherRemarks': this.ad.remarks.value,
        'productTypeId': this.product_type,
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeAllowanceDeductPopup();
          this.employer_details();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      })

    } else {
      this.toastr.error('Please provide information in all required fields', 'Oops!');
    }
  }

  changePage(e: any) {
    this.limit = e.target.value;
    // this.p = 0;
    this.p = 1;
    this.employer_details();
  }
  /*************Download Bulk Att***************/
  download_bulk_att() {
    // this.getEmployerMonthAttendance();
    // console.log(this.filteredEmployees_forBulk);
    // this.getEmployerMonthAttendance_for_excel();
    //  this.router.navigate(['/reports/monthly-in-out-shift-report'], {state: {month: this.month, year: this.year}} );

    const url = `/reports/monthly-in-out-shift-report`;
    window.open(url, '_blank');


  }
  generateArrayOfObjects(n) {
    const result = [];
    for (let i = 1; i <= n; i++) {
      if (this.blankCalendar[i - 1].holiday_name_cd == 'HO') {
        result.push({ 'attday': i, 'attendance_type': 'HO' });
      } else {
        result.push({ 'attday': i, 'attendance_type': '' });
      }
    }
    return result;
  }
  getEmployerMonthAttendance() {
    this._attendanceService.getEmployerMonthAttendance({
      customerAccountId: this.tp_account_id.toString(),
      month: this.month,
      year: this.year,
      'GeoFenceId': this.decoded_token.geo_location_id
    }).subscribe({
      next: (resData: any) => {

        if (resData.statusCode) {
          this.bulk_att_data = resData.commonData;
          // console.log(this.bulk_att_data);
          // console.log(this.filteredEmployees_forBulk);
          // return;

          this.bulk_att_data.forEach(obj1 => {
            let index = this.filteredEmployees_forBulk.findIndex(obj2 => obj1.emp_code == obj2.emp_code);
            if (index != -1) {
              let inner_index = this.filteredEmployees_forBulk[index]?.att_details.findIndex(obj3 => obj3.attday == obj1.attday);
              Object.assign(this.filteredEmployees_forBulk[index]?.att_details[inner_index], obj1);


              //present & leave days
              if (obj1?.attendance_type == 'PP' || obj1?.attendance_type == 'HO' || obj1?.attendance_type == 'RH' || obj1?.attendance_type == 'WFH' || obj1?.attendance_type == 'OD' || obj1?.attendance_type == 'TR' || obj1?.attendance_type == 'ASL') {
                this.filteredEmployees_forBulk[index].present_days += 1.0;
              } else if (obj1?.attendance_type == 'HD') {
                this.filteredEmployees_forBulk[index].present_days += 0.5;
              } else if (obj1?.attendance_type == 'LL') {
                this.filteredEmployees_forBulk[index].leave_days += 1.0;
              } else if (obj1?.attendance_type == 'AA' || obj1?.attendance_type == 'LWP') {
                this.filteredEmployees_forBulk[index].absent_days += 1.0;
              }
            }
          });

          this.getAttExcel();

        } else {
          this.bulk_att_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        // console.log(e);
      }

    })
  }

  getEmployerMonthAttendance_for_excel() {
    this._attendanceService.getEmployerMonthAttendance_for_excel({
      customerAccountId: this.tp_account_id.toString(),
      month: this.month,
      year: this.year,
      'GeoFenceId': this.decoded_token.geo_location_id,
      attendanceSource: 'all',
      productTypeId: this.product_type,
      action: 'GetEmployermonthAttendanceForExcel',
      postOffered: this.desgName,
      postingDepartment: this.deptName,
      unitParameterName: this.orgName,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.download_excel_data = resData.commonData;
          this.getAttExcel();
        } else {
          this.download_excel_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.download_excel_data = [];
        // console.log(e);
      }
    })
  }

  getAttExcel() {
    this._attendanceService.get_month_dates_days({
      'employer_id': this.decoded_token.id, 'month': this.month,
      'year': this.year,
      'GeoFenceId': this.decoded_token.geo_location_id,
    }).subscribe((resData: any) => {
      if (resData.status) {
        let exportData = [];
        //console.log(this.download_excel_data);
        for (let idx = 0; idx < this.download_excel_data.length; idx++) {
          let obj = {
            'Employee': this.download_excel_data[idx].emp_name,
            'TPayRefNo': this.download_excel_data[idx].emp_code,
            'OrgEmpCode': !this.download_excel_data[idx].orgempcode ? this.download_excel_data[idx].tpcode : this.download_excel_data[idx].orgempcode,
            'Mobile': this.download_excel_data[idx].mobile,
            'OrganizationUnit ': this.download_excel_data[idx].assignedous,
            'Designation': this.download_excel_data[idx].post_offered,
            'Department': this.download_excel_data[idx].posting_department,
            'Status': this.download_excel_data[idx]?.lockstatus,
            'DOB': this.download_excel_data[idx].dateofbirth,
            'DOJ': this.download_excel_data[idx].dateofjoining,
            'DOR': this.download_excel_data[idx].dateofrelieveing,
            'Man Days': !(this.download_excel_data[idx].salary_month_days) ? 'full-days' : this.download_excel_data[idx].salary_month_days

          }

          for (let i = 0; i < resData.commonData.length; i++) {
            let dateColumn = resData.commonData[i].w_date;
            let dayCount = resData.commonData[i].day_cnt;
            let dayKey = `day${dayCount}`;
            let attendanceType = this.download_excel_data[idx][dayKey] || "";

            obj[dateColumn] = attendanceType

          }
          exportData.push(obj);

        }
        // console.log(exportData);

        /////////////////
        // console.log(this.filteredEmployees_forBulk);
        // for (let idx = 0; idx < this.filteredEmployees_forBulk.length; idx++) {
        //   // if (this.filteredEmployees_forBulk[idx]?.lockstatus == 'Not Locked') {
        //   let obj = {
        //     'Employee': this.filteredEmployees_forBulk[idx].emp_name,
        //     'EmpCode': this.filteredEmployees_forBulk[idx].emp_code,
        //     'OrgEmpCode': this.filteredEmployees_forBulk[idx]?.orgempcode,
        //     'Mobile': this.filteredEmployees_forBulk[idx].mobile,
        //     'Status': this.filteredEmployees_forBulk[idx]?.lockstatus,
        //     'DOB': this.filteredEmployees_forBulk[idx].dateofbirth,
        //     'DOJ': this.filteredEmployees_forBulk[idx].dateofjoining,
        //     'DOR': this.filteredEmployees_forBulk[idx].dateofrelieveing,
        //     'Man Days': this.filteredEmployees[idx].salary_days_opted == 'N' ? 'full-days' : this.filteredEmployees[idx].salarydays
        //     // ...days,
        //     // ,
        //     // 'Leaves': this.filteredEmployees_forBulk[idx].leave_days,
        //     // 'Remarks': ''
        //   }
        //   // console.log(this.filteredEmployees_forBulk[idx]);

        //   for (let i = 0; i < resData.commonData.length; i++) {
        //     let dateColumn = resData.commonData[i].w_date;
        //     let att_type = this.filteredEmployees_forBulk[idx].att_details[i].attendance_type;
        //     let leave_type = this.filteredEmployees_forBulk[idx].att_details[i].leavetype;

        //     if (leave_type != '' && leave_type != null && leave_type != undefined) {
        //       att_type = att_type + '-' + leave_type;
        //     }

        //     obj[dateColumn] = att_type;
        //   }
        //   exportData.push(obj);
        //   // }

        // }
        // console.log(exportData);
        /////////////////
        // return;
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = `Attendace-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
        downloadLink.click();

      }
    })
  }
  /*************Download Bulk Att***************/


  /*************Opening Balance****************/
  closeOpenBalance() {
    this.showOpenBalance = false;
    this.showGenerateBtn = false;
    this.employer_details();
    this.openLeaveBalanceForm.patchValue({
      rowid: '',
      emp_id: '',
      emp_name: '',
      mobile: '',
      orgempcode: '',
      leave_bank_id: '',
      intial_leave_bal_txt: [],
    })
  }

  getOpeningBalance(empid: any, leave_bank_id: any) {
    this._attendanceService.getOpeningLeaveBalance({
      'accountId': this.tp_account_id.toString(),
      'empid': empid.toString(),
      'effective_dt': '01' + '-' + this.month + '-' + this.year,

    }).subscribe((resData: any) => {

      this.showOpenBalance = true;
      this.showGenerateBtn = false;

      if (resData.statusCode && resData.msgcd == '1') {
        let data = resData.commonData.data[0];
        let intial_leave_bal_txt = data.intial_leave_bal_txt;

        this.openLeaveBalanceForm.patchValue({
          rowid: data.rowid,
          emp_id: data.emp_id,
          emp_name: data.emp_name,
          mobile: data.mobile,
          orgempcode: data.orgempcode,
          leave_bank_id: leave_bank_id.toString(),
        })

        if (intial_leave_bal_txt != null && intial_leave_bal_txt != undefined && intial_leave_bal_txt != '') {
          this.openLeaveBalanceForm.patchValue({
            intial_leave_bal_txt: intial_leave_bal_txt
          });
        }

        // console.log(this.openLeaveBalanceForm.value);

      } else if (resData.statusCode && resData.msgcd == '0') {
        // this.getGenerateOpeningBalance(empid, leave_bank_id);

        this.openLeaveBalanceForm.patchValue({
          emp_id: empid.toString(),
          leave_bank_id: leave_bank_id.toString(),
        })
        this.showOpenBalance = true;
        this.showGenerateBtn = true;
        this.toastr.info('Please generate the opening balance', 'Info');
      }
      else {
        this.toastr.error(resData.message, 'Oops!');
      }

    })
  }

  getGenerateOpeningBalance() {
    let empid = this.openLeaveBalanceForm.value.emp_id;
    let leave_bank_id = this.openLeaveBalanceForm.value.leave_bank_id;

    this._attendanceService.getGenerateOpeningBalance({
      'accountId': this.tp_account_id.toString(),
      'empid': empid.toString(),
      'effective_dt': '01' + '-' + this.month + '-' + this.year,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.getOpeningBalance(empid, leave_bank_id);
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }

  getUpdateLeaveBalance() {
    let empid = this.openLeaveBalanceForm.value.emp_id;
    let leave_bank_id = this.openLeaveBalanceForm.value.leave_bank_id;
    let leavetemplate_text = this.openLeaveBalanceForm.value.intial_leave_bal_txt;
    this._attendanceService.getUpdateLeaveBalance({
      'accountId': this.tp_account_id.toString(),
      'empid': empid.toString(),
      'leavebankid': leave_bank_id.toString(),
      'leavetemplate_text': leavetemplate_text,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.getOpeningBalance(empid, leave_bank_id);
        this.toastr.success(resData.message, 'Success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }

  changeOpenBal(e: any, index: any) {
    const input = e.target as HTMLInputElement;
    const regex = /^\d*\.?\d*$/;

    if (!regex.test(input.value)) {
      let ilbt = this.openLeaveBalanceForm.value.intial_leave_bal_txt;
      ilbt[index].opening_bal = '0';

      this.openLeaveBalanceForm.patchValue({
        intial_leave_bal_txt: ilbt,
      });

      // console.log(this.openLeaveBalanceForm.value.intial_leave_bal_txt);

      input.value = '0';
      return;
    }

    let ilbt = this.openLeaveBalanceForm.value.intial_leave_bal_txt;
    ilbt[index].opening_bal = input.value;

    this.openLeaveBalanceForm.patchValue({
      intial_leave_bal_txt: ilbt,
    });

  }

  routeToBulkAttn(): any {
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit && !this.accessRights.View) {
      return this.toastr.error("You do not have permission to access this.");
    }
    this.router.navigate(['/attendance/bulk-attendance']);
  }
  routeToBulkAttnNew(): any {
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit && !this.accessRights.View) {
      return this.toastr.error("You do not have permission to access this.");
    }
    this.router.navigate(['/attendance/bulk-attendance-new']);
  }


  routeToLockAttn(): any {
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit && !this.accessRights.View) {
      return this.toastr.error("You do not have permission to access this.");
    }
    this.router.navigate(['/attendance/bulk-lock-attendance'], { state: { month: this.month, year: this.year } });
  }

  /*************Opening Balance****************/

  checkSalaryCondFunc(att_type: any) {
    return new Promise<boolean>((resolve, reject) => {

      let leavetaken = parseFloat(this.selected_emp_data.marked_attendance_leave_taken);
      let paiddays = parseFloat(this.selected_emp_data.marked_attendance_paid_days);
      let salarydays = parseFloat(this.selected_emp_data.salarydays);
      let salary_days_opted = this.selected_emp_data.salary_days_opted;

      let local_marking_days = 0;
      if (att_type == 'PP' || att_type == 'HO' || att_type == 'RH' || att_type == 'WO' || att_type == 'LL' || att_type == 'WFH' || att_type == 'OD' || att_type == 'TR' || att_type == 'LWP' || att_type == 'ASL') {
        local_marking_days = this.selectedCalendar_dates.length;
      } else if (att_type == 'HD' || att_type == 'HL') {
        local_marking_days = this.selectedCalendar_dates.length * 0.5;
      }
      // console.log('salarydays',salarydays,'salary_days_opted',salary_days_opted);
      if ((salarydays < 30 || salary_days_opted == 'Y') && salary_days_opted != null && salary_days_opted != undefined) {
        if ((local_marking_days + paiddays + leavetaken) > salarydays) {
          resolve(true);
        }
      }

      resolve(false);
    })
  }

  showTaxble(headid: any) {
    const idx = this.LedgerMasterHeads_head.findIndex((item1: any) => item1.headid == headid)
    // console.log('hh',this.LedgerMasterHeads_head)
    let result = '';
    if (idx != -1) {
      let is_taxable = this.LedgerMasterHeads_head[idx].is_taxable;

      result = is_taxable == 1 ? '(ESIC Applicable)' : '(ESIC Not Applicable)';
      // console.log(result);
    }
    return result;
  }

  display_week_off(data: any) {
    // console.log(data);
    if (!data) {
      return '';
    }
    let string = '';
    data.map((el: any) => {
      if (el.week_no.split(',').length == 5) {
        string += el.week_name + " (All), ";
      } else {
        string += el.week_name + " (" + (el.week_no) + "), ";
      }
    })

    return string.replace(/,\s*$/, '');
  }

  routeToMissedPunch(missed_devailtion: string) {
    this.router.navigate(['/attendance/missed-punch'], { state: { 'page': missed_devailtion, 'month': this.month, 'year': this.year } });
  }

  ngOnDestroy() {
    localStorage.removeItem('openedCalendar');
  }

  check_access_right_cdn() {
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
      return false;
    } else {
      return true;
    }
  }

  openSidebar() {
    this.search_key_copy = this.search_key;
    this.limit_copy = this.limit;
    this.month_copy = this.month;
    this.year_copy = this.year;
    this.filter_emp_val_copy = this.filter_emp_val;
    this.orgName_copy = this.deepCopyArray(this.orgName);
    this.desgName_copy = this.deepCopyArray(this.desgName);
    this.deptName_copy = this.deepCopyArray(this.deptName);
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "380px";
  }

  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }

  resetFilter() {
    this.limit_copy = 10;
    this.month_copy = this.month;
    this.year_copy = this.year;
    // this.deptName = [];
    // this.desgName = [];
    // this.orgName = [];
    this.deptName_copy = [];
    this.desgName_copy = [];
    this.orgName_copy = [];
    this.search_key_copy = '';
    this.search_key = '';
    this.filter_emp_val_copy = 'All';
    // this.employer_details();
  }



  /***********Master************** */
  get_geo_fencing_list() {
    this._businesessSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllOUsForCustomer"
    }).subscribe((resData: any) => {
      this.orgList = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          this.toastr.info('No data found', 'Oops!');
          return;
        }

        this.orgList = resData.commonData;

      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }

  get_att_unit_master_list() {
    this.orgList = [];

    this._attendanceService.get_att_master_list({
      action: 'master_unit_list',
      customeraccountid: this.tp_account_id.toString(),
      unit_id: '',
      department_id: '',

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.orgList = resData.commonData;
        } else {

        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  // get_att_dept_master_list() {
  //   this.deptList = [];

  //   this._attendanceService.get_att_master_list({
  //     action: 'master_department_list',
  //     customeraccountid: this.tp_account_id.toString(),
  //     unit_id: '',
  //     department_id: '',

  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         this.deptList = resData.commonData;
  //       } else {

  //       }
  //     }, error: (e) => {
  //       console.log(e);
  //     }
  //   })
  // }
  // get_att_role_master_list() {
  //   this.desgList = [];

  //   this._attendanceService.get_att_master_list({
  //     action: 'master_role_list',
  //     customeraccountid: this.tp_account_id.toString(),
  //     unit_id: '',
  //     department_id: '',
  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         this.desgList = resData.commonData;
  //       } else {

  //       }
  //     }, error: (e) => {
  //       console.log(e);
  //     }
  //   })
  // }

  // getOrgUnitData() {
  //   this.orgList = [];

  //   this._attendanceService.getMaster({
  //     'actionType': 'GetMasterUnitNames',
  //     'customerAccountId': this.tp_account_id,
  //     'productTypeId': this.product_type,
  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         this.orgList = (resData.commonData);
  //         // console.log(this.orgList);

  //       } else {
  //         this.toastr.error(resData.message, 'Oops!');
  //       }
  //     }
  //   })
  // }
  getDepartmentData() {
    this.deptList = [];

    this._attendanceService.getMaster({
      'actionType': 'GetPostingDepartments',
      'customerAccountId': this.tp_account_id,
      'productTypeId': this.product_type,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.deptList = (resData.commonData);
          // console.log(this.deptList);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  getDesignationData() {
    this.desgList = [];

    this._attendanceService.getMaster({
      'actionType': 'GetMasterPostOffered',
      'customerAccountId': this.tp_account_id,
      'productTypeId': this.product_type,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.desgList = (resData.commonData);
          // console.log(this.desgList);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  /***********Master************** */

  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;
    this.search_key = this.search_key_copy;
    this.month = this.month_copy;
    this.year = this.year_copy;

    this.days_count = new Date(this.year_copy, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    localStorage.removeItem('openedCalendar');
    this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
      arr[i].showCalendar = false;
    });

    this.limit = this.limit_copy;
    this.filter_emp_val = this.filter_emp_val_copy;
    this.desgName = this.desgName_copy;
    this.orgName = this.orgName_copy;
    this.deptName = this.deptName_copy;
    this.p = 1;

    // console.log(this.desgName);
    // console.log(this.deptName);

    this.get_calendar();
    this.get_holidays();
  }

  get_month_year_name() {
    let month = this.selected_date.split('-')[1];
    let year = this.selected_date.split('-')[2];

    return this.monthsArray[month - 1].month + ' ' + year
  }

  get_pay_type(typecode: any) {
    let leave_master = !this.filteredEmployees[0].leave_mst ? [] : JSON.parse(this.filteredEmployees[0].leave_mst);
    let i = leave_master.findIndex((el: any) => el.leavetypecode == typecode);

    if (i != -1) {
      return leave_master[i].leave_ctg;
    } else {
      return '-';
    }
  }

  openTDSPopup(empCode: any) {
    this.showTDSPopup = true;
    let openedIndex = parseInt(localStorage.getItem('openedCalendar'));
    let tds_val = '0';

    if (openedIndex != null) {
      tds_val = !this.filteredEmployees[openedIndex].tds ? '0' : this.filteredEmployees[openedIndex].tds;
    }

    this.TDSForm.patchValue({
      empCode: empCode,
      manualTDS: tds_val,
    })
  }

  closeTDSPopup() {
    this.showTDSPopup = false;
    this.TDSForm.patchValue({
      empCode: '',
      manualTDS: '0',
    })
  }

  changeManualTDS(e: any) {
    const input = e.target as HTMLInputElement;
    const regex = /^\d*\.?\d*$/;

    if (!regex.test(input.value)) {

      this.TDSForm.patchValue({
        manualTDS: 0,
      });

      input.value = '0';
      return;
    }

    this.TDSForm.patchValue({
      manualTDS: input.value,
    });

    console.log(this.TDSForm.value);

  }



  updateTDS() {
    let data = this.TDSForm.value;

    let postData = {
      action: 'updateManualTDS',
      customerAccountId: this.tp_account_id.toString(),
      userby: this.tp_account_id.toString(),
      empCode: data.empCode,
      manualTDS: data.manualTDS,
    }

    this._attendanceService.updateManualTDS(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.closeTDSPopup();
        this.employer_details();
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  get_holidays() {
    this._attendanceService.get_calendar({
      'action': 'get_holiday_list',
      'employer_id': this.decoded_token.id,
      'month': this.month,
      'year': this.year,

    }).subscribe((resData: any) => {
      if (resData.status) {
        this.holidays_master_data = resData.commonData;
        // "holiday_name": "TESTING",
        // "holiday_date": "15-11-2024",
        // "holiday_name_cd": "HO",
        // "state_name": "ARUNACHAL PRADESH",
        // "template_id": 293

      } else {
        this.holidays_master_data = [];
        // this.toastr.error(resData.msg, 'Oops!');
        console.log("No Record Found", resData.msg);
      }
    })
  }

  // async runLoopAndThenCode() {
  //   const data = [1, 2, 3, 4, 20, 1];
  //   let check = false;

  //   await new Promise<void>((resolve) => {
  //     setTimeout(() => {
  //       data.map((el: any) => {
  //         if (el == 20) {
  //           check = true;
  //         }
  //       });
  //       resolve(); // Resolve the Promise to indicate completion
  //     }, 1000);
  //   });

  //   // console.log(check);

  // }
  getEmp_code(employee: any, idx: any) {
    this.router.navigate(['attendance/manage-early-late-att'], { state: { emp_code: (employee.emp_code).toString(), id: idx, designation: employee.emp_designation } });
  }

  formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}/${mm}/${yy}`;
  }


  getDeviationSalaryDetails(emp_data: any) {
    // console.log(emp_data);
    // return;
    this._attendanceService.manageDeviationSalaryDetails({
      "action": "PaidDaysDifference",
      "customerAccountId": this.tp_account_id.toString(),
      "month": this.month.toString(),
      "year": this.year.toString(),
      "productTypeId": this.product_type,
      "empCode": emp_data.emp_code,
      "amount": '',

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.locked_days_popup_data = resData.commonData[0];
          this.locked_days_popup_data_msg = resData.message;
          this.locked_days_popup_data['emp_name'] = emp_data.emp_name;
          this.locked_days_popup_data['emp_code'] = emp_data.emp_code;
          this.showLockedDaysPopup = true;

          // console.log(this.locked_days_popup_data);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  get_abs_value(value: any) {
    if (!value) {
      return '';
    }
    if (value < 0) {
      value = -value;
    }
    return value;
  }

  closeLockedDaysPopup() {
    this.locked_days_popup_data = [];
    this.showLockedDaysPopup = false;
    this.locked_days_popup_data_msg = '';
  }

  updateLockedDays() {
    this._attendanceService.manageDeviationSalaryDetails({
      "action": "CreateDeviationSalary",
      "customerAccountId": this.tp_account_id.toString(),
      "month": this.month.toString(),
      "year": this.year.toString(),
      "productTypeId": this.product_type,
      "empCode": this.locked_days_popup_data.emp_code,
      "amount": this.locked_days_popup_data.v_deviationamount,
      // added on dated. 03.03.2025
      "old_days": this.locked_days_popup_data.old_paid_days,
      "new_days": this.locked_days_popup_data.new_paid_days,
      "salaryid": this.locked_days_popup_data.salaryid,
      "daysdiff": this.locked_days_popup_data.difference
      // end

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.employer_details();
          this.toastr.success(resData.message, 'Success');
          this.closeLockedDaysPopup();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }


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
  // createSupportRequest() {
  //   let data = this.notificationForm.value;

  //   let subject_desc = this.ticketMasterData.find((el: any) => el.id == data.subject_id).tickettypename;

  //   let user_data = this.user_by_role_id_data.find((el: any) => el.user_id == data.user_id)

  //   let emp_code = user_data.user_mobile + 'CJHUB' + user_data.emp_code + 'CJHUB' + user_data.dateofbirth

  //   // console.log(data)
  //   // console.log(subject_desc)
  //   // console.log(emp_code);

  //   // return;

  //   this._attendanceService.createSupportRequest({
  //     'emp_code': emp_code,
  //     'productTypeId': this.product_type,
  //     'query_comment': data.query_comment,
  //     'subject_id': data.subject_id,
  //     'subject_desc': subject_desc,
  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         this.toastr.success(resData.message, 'Success');
  //         this.closeSendNotificationPopup();

  //       } else {
  //         this.toastr.error(resData.message, 'Oops!');
  //       }
  //     }
  //   })
  // }


  createTicket() {
    let data = this.notificationForm.value;

    // console.log(this.ticketMasterData);

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
      // ,'createdBy': data.user_id,
      "isAdviceLockedForPayoutFlag": data.isAdviceLockedForPayoutFlag,
      "attendanceLockedMsg": data.attendanceLockedMsg,
      "year": this.year,
      "month": this.month,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeSendNotificationPopup();

          setTimeout(() => {
            this.employer_details();
          }, 1000)

          // this.Get_Unread_Tickets();

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
      'reporting_module': 'Human Resource',
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
            (item: any) => item.tickettypename == 'Attendance'
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
          this.filtered_ticket_status =
            resData.commonData.filter((status: any) => status.Description !== 'All'
              && (status.Description == 'Open' || status.Description == 'Closed'))

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
      'reporting_module': 'Human Resource',
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
    this.statusControl.setValue('Open');
    this.showTicketsTable = false;
    this.Get_Unread_Tickets();
  }

  Get_Tickets() {
    this.selectedStatus = 'Open';
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
      "orgUnitId": this.decoded_token.geo_location_id?.toString(),
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
          this.filterTickets();
          this.showTicketsTable = true;


        } else {
          // this.toastr.error('No record found', 'Oops!');
          this.ticketStatusMaster = [];
          this.ticketsDetails = [];
          this.filteredTickets = [];
          this.toastr.error(resData.message);
        }
      });

  }

  GetShowHideSalarytab() {

    if (this.decoded_token.sub_userid) {
      this._attendanceService.getShowHideSalarytab({
        'action': 'attendance_salary_hide',
        "keyword": this.decoded_token?.sub_userid?.toString(),
        "organization_unitid": '',
        "emp_code": '',
        "orgUnitId": this.decoded_token.geo_location_id?.toString(),
        "productTypeId": this.product_type,
        "customeraccountid": this.tp_account_id?.toString()
      })
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            // console.log(JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))[0].is_att_sal_hide)

            this.is_att_sal_hide = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))[0].is_att_sal_hide
          } else {
            this.is_att_sal_hide = 'N';
          }
        });
    } else {
      this.is_att_sal_hide = 'N';
    }


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
      "orgUnitId": this.decoded_token.geo_location_id?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    })
      .subscribe((resData: any) => {
        // console.log(resData);
        if (resData.statusCode) {
          this.unread_query_cnt_data = resData.commonData[0];
          // console.log(resData.commonData);

        } else {
          // this.toastr.error('No record found', 'Oops!');

        }
      });

  }
  // Get_Tickets() {
  //   const lastDate = this.formatDate(new Date(this.year, this.month, 0));
  //   // let month = this.month <= 9 ? '0' + this.month : this.month;

  //   let fromdate ='01/' + '01' + '/' + '2025';

  //   const currentDate = new Date();
  //   const day = currentDate.getDate() <= 9 ? '0' + currentDate.getDate() : currentDate.getDate();
  //   const month = currentDate.getMonth() + 1 <= 9 ? '0' + (currentDate.getMonth() + 1) : currentDate.getMonth() + 1;
  //   const year = currentDate.getFullYear();

  //   const current_date = `${day}/${month}/${year}`;

  //   this.helpAndSupportService.GetTickets({
  //     // "fromDate": '01/' + month + '/' + this.year,
  //     "fromDate": fromdate,
  //     "toDate": current_date,
  //     "ticketStatus": 'all',
  //     "orgUnitId": this.decoded_token.geo_location_id?.toString(),
  //     "productTypeId": this.product_type,
  //     "customerAccountId": this.tp_account_id?.toString()
  //   })
  //   .subscribe((resData: any) => {
  //     // console.log(resData);
  //     if (resData.statusCode) {
  //       if (this.ticketStatusMaster.length == 0) {

  //         this.ticketStatusMaster = resData.commonData.ticketStatusMaster;
  //       }
  //       this.filtered_ticket_status = resData.commonData.ticketStatusMaster.filter((status: any) => status.Description !== 'All')
  //       this.ticketsDetails = resData.commonData.ticketsDetails;
  //       if (this.ticketsDetails == "" || this.ticketsDetails == "undefined" || this.ticketsDetails == null) {
  //         this.toastr.error('No Record Found', 'Oops!');
  //         return;
  //       }
  //       this.showTicketsTable = true;


  //     } else {
  //       this.ticketStatusMaster = [];
  //       this.ticketsDetails = [];
  //       this.toastr.error(resData.message);
  //     }
  //   });

  // }


  Verify_Lock_Payment_attednace() {

    this._attendanceService.lockedUnlockedAttednace({
      'productTypeId': this.product_type,
      'customerAccountId': this.tp_account_id,
      'action': 'Lock',
      "year": this.year,
      "month": this.month,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          setTimeout(() => {
            this.employer_details();
          }, 1000)
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
        this.closeAlertModal();
      }, error: (e) => {
        console.log(e);
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

  getIconForDocumentType(document_type: string): string {
    if (document_type === 'pdf') {
      return 'fa fa-file-pdf-o text-danger';
    } else {
      return 'fa fa-file-image-o';
    }
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
      // "ticketStatus": "In-progress",
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

  check_isAdviceLockedForPayoutFlag(e: any) {
    if (e.target.checked) {
      this.notificationForm.patchValue({
        isAdviceLockedForPayoutFlag: 'Y',
        attendanceLockedMsg: 'Generate payout for all approved attendance'
      })

    } else {
      this.notificationForm.patchValue({
        isAdviceLockedForPayoutFlag: 'N',
        attendanceLockedMsg: '',
      })

    }
  }

  filterTickets() {
    if (this.selectedStatus === 'all') {
      this.filteredTickets = [...this.ticketsDetails];
    } else {
      this.filteredTickets = this.ticketsDetails.filter(ticket => ticket.status === this.selectedStatus);
    }
  }

  changeStatus(event: Event) {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.filterTickets();
  }

  confirmAlertButton() {
    this.alertModalStatus = true;
  }
  closeAlertModal() {
    this.alertModalStatus = false;
  }


  lockAdvice(emp_code: any) {
    this.confirmationDialogService.confirm('Are you sure you want to Lock Payment Advice?', 'Lock Payment Advice').subscribe(result => {
      if (result) {
        this._attendanceService.manageAdvices({
          'action': 'Lock',
          'empCode': emp_code,
          'customerAccountId': this.tp_account_id,
          'month': this.month,
          'year': this.year,
          'productTypeId': this.product_type,

        }).subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              this.employer_details();
            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          }
        })
      }
    });
  }

  check_holiday_type(att_type: any, att_date: any) {
    let month = this.month <= 9 ? '0' + this.month : this.month;
    let date = att_date + '-' + month + '-' + this.year;

    // console.log(att_type, att_date);
    if (!att_date) {
      return '';
    }

    if (att_type == 'HO') {
      let idx = this.holidays_master_data.findIndex(el => el.holiday_date == date);
      if (idx != -1) {
        return this.holidays_master_data[idx].holiday_name_cd;
      } else {
        return att_type;
      }
    } else {
      return att_type;
    }
  }

  public get accountClass(): string {
    if (GlobalConstants.NEW_THEME_IDS.includes(this.tp_account_id.toString())) {
      return 'account-' + 'newtheme';
    } else {
      return 'account';
    }

  }

  openWorkReportModal(emp_data: any) {
    this.payoutEmpCode = emp_data.emp_code.toString();
    this._attendanceService.GetTpFlexiSalary({
      "empCode": this._EncrypterService.aesEncrypt(emp_data.emp_code.toString()),
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
      "month": (this.month).toString(),
      "year": this.year.toString(),
      "productTypeId": this.product_type
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.GetTpFlexiSalaryData = this._EncrypterService.aesDecrypt(resData.commonData);
        this.GetTpFlexiSalaryData = JSON.parse(this.GetTpFlexiSalaryData);
        this.maxInHandSalary = this.GetTpFlexiSalaryData?.maxinhandsalary;
      } else {
        this.GetTpFlexiSalaryData = [];
        this.maxInHandSalary = 0;
        this.toastr.error(resData.message);
      }
    });


    this.payoutPeriodLabel = 'Enter the payout amount for ' + this.getMonthName(this.month.toString()) + ' ' + this.year;
    this.showApproveWorkReportPopup = true;
  }
  closeWorkReportModal() {
    this.showApproveWorkReportPopup = false;
    this.isSummaryVisible = false;
    this.CalcTpFlexiSalaryData = [];
    this.errorMessage = '';
    this.payoutAmount = null;
  }
  getMonthName(id: string): string | null {
    const month = this.monthsArray.find(m => m.id === id);
    return month ? month.month : null;
  }
  restrictToNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  onAmountChange(event: any): void {
    const enteredValue = Number(event.target.value);
    this.payoutAmount = enteredValue;
    if (this.payoutAmount > this.maxInHandSalary) {
      this.errorMessage = 'Note: Maximum Salary ₹' + this.maxInHandSalary;
    } else {
      this.errorMessage = '';
    }
  }

  onSubmitCalcTpFlexiSalary(): void {
    if (this.payoutAmount <= 0) {
      this.errorMessage = 'Please enter a valid amount!';
      return;
    }
    if (this.errorMessage) {
      return;
    }
    this._attendanceService.CalcTpFlexiSalary({
      "empCode": this._EncrypterService.aesEncrypt(this.payoutEmpCode.toString()),
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
      "month": (this.month).toString(),
      "year": this.year.toString(),
      "salaryAmount": this.payoutAmount.toString(),
      "productTypeId": this.product_type
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.CalcTpFlexiSalaryData = this._EncrypterService.aesDecrypt(resData.commonData);
        this.CalcTpFlexiSalaryData = JSON.parse(this.CalcTpFlexiSalaryData);
        this.isSummaryVisible = true;
      } else {
        this.CalcTpFlexiSalaryData = [];
        this.toastr.error(resData.message);
      }
    });
  }


  confirmSaveTpFlexiSalary(): void {
    if (!this.CalcTpFlexiSalaryData) {
      this.toastr.error('Salary calculation data is missing.');
      return;
    }
    let flexiSalaryComponents = {
      "emp_code": this.CalcTpFlexiSalaryData?.emp_code,
      "customeraccountid": this.CalcTpFlexiSalaryData?.customeraccountid,
      "attendancemonth": this.CalcTpFlexiSalaryData?.attendancemonth,
      "attendanceyear": this.CalcTpFlexiSalaryData?.attendanceyear,
      "salarydays": this.CalcTpFlexiSalaryData?.salarydays,
      "salaryhours": this.CalcTpFlexiSalaryData?.salaryhours,
      "salaryamount": this.CalcTpFlexiSalaryData?.salaryamount,
      "esicontribution": this.CalcTpFlexiSalaryData?.esicontribution,
      "epfcontribution": this.CalcTpFlexiSalaryData?.epfcontribution,
      "costtoemployer": this.CalcTpFlexiSalaryData?.costtoemployer,
      "mastersalaryid": this.CalcTpFlexiSalaryData?.mastersalaryid,
      "inhandsalary": this.CalcTpFlexiSalaryData?.inhandsalary,
      "mininhandsalary": this.CalcTpFlexiSalaryData?.mininhandsalary,
      "maxinhandsalary": this.CalcTpFlexiSalaryData?.maxinhandsalary,
      "incentiveamount": this.CalcTpFlexiSalaryData?.incentiveamount,
      "incentivetitle": this.CalcTpFlexiSalaryData?.incentivetitle,
      "workreportstatus": this.CalcTpFlexiSalaryData?.workreportstatus,
      "esicontributionbare": this.CalcTpFlexiSalaryData?.esicontributionbare,
      "costtoemployerbare": this.CalcTpFlexiSalaryData?.costtoemployerbare,
      "inhandsalarybare": this.CalcTpFlexiSalaryData?.inhandsalarybare,
      "productTypeId": this.product_type.toString()
    };

    this._attendanceService.SaveTpFlexiSalary({
      "flexiSalaryComponents": this._EncrypterService.aesEncrypt(JSON.stringify(flexiSalaryComponents)),
      "createdBy": this.tp_account_id?.toString(),
      "productTypeId": this.product_type.toString()

    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.toastr.success(resData.message);
      } else {
        this.toastr.error(resData.message);
      }
      this.showApproveWorkReportPopup = false;
      this.isSummaryVisible = false;
      this.CalcTpFlexiSalaryData = [];
      this.errorMessage = '';
      this.payoutAmount = null;
    });
    console.log('Payout submitted:', this.payoutAmount);
  }


  go_to_generate_payment_advice() {
    this.router.navigate(['/attendance/generate-advice']);

  }


  generate_payment_advice(data: any) {

    let emp_codes = [];
    let advance_or_current = [];
    let paiddays = [];
    let leave_taken = [];

    emp_codes.push(data.emp_code);
    advance_or_current.push('Current');
    paiddays.push(!data.marked_attendance_leave_taken ? 0 : data.marked_attendance_leave_taken);
    leave_taken.push(!data.marked_attendance_leave_taken ? 0 : data.marked_attendance_leave_taken);

    this.confirmationDialogService.confirm(`Are you sure you want to generate payment advice?`, 'Confirm').subscribe(result => {
      if (result) {
        // return;
        this._attendanceService.generate_payment_advice({
          'action': 'ApproveBulkAttendanceFromExcel_New',
          'accountid': this.tp_account_id,
          'month': this.month,
          'year': this.year,
          'emp_code': emp_codes,
          'advance_or_current': advance_or_current,
          'paiddays': paiddays,
          'leave_taken': leave_taken,
        }).subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              // this.getEmployerMonthAttendance_for_excel_table_data();l
              this.toastr.success(resData.message, 'Success');
              this.closeSidebar();
            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          }
        })
      }
    })

  }

}
