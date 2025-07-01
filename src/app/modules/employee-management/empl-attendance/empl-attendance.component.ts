import { ChangeDetectorRef, Component, Input, Renderer2 } from '@angular/core';
import { AttendanceService } from '../../attendance/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { PayoutService } from '../../payout/payout.service';
import { AlertService } from 'src/app/shared/_alert';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { Router } from '@angular/router';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';
import { environment } from 'src/environments/environment';
import { ReportService } from '../../reports/report.service';
declare var $: any;
@Component({
  selector: 'app-empl-attendance',
  templateUrl: './empl-attendance.component.html',
  styleUrls: ['./empl-attendance.component.css'],
  animations: [dongleState, grooveState]
})
export class EmplAttendanceComponent {

  showSidebar: boolean = true;
  isDragging = false;
  decoded_token: any;
  month: any;
  year: any;

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
  filteredEmployees: any = [];
  employee_data: any = []
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
  original_filteredEmployees_forBulk: any = [];
  show_check_in_out = false;
  accessRights: any = {};
  download_excel_data: any = [];
  attendanceSummaryData: any = {};
  search_key: any = '';
  searchTimeoutId: any;
  @Input() empDataFromParent: any;
  empl_mobile_no: any;
  holidays_master_data: any = [];
  dynamicHeads: any[] = [];

  // add by ak 11062025
  showPopup: boolean = false;
  Edit_Form: FormGroup;
  in_time: any;
  out_time: any;
  attendance_date: any;
  emp_name: any;
  emp_code: any;
  markDateData: any;
  currentDate: string;
  data: any = [];
  currentFromDate: string;
  currentToDate: string;
  checkin_Form: FormGroup;
  isCurrentMonthYear: boolean = true;

  showEmployeeData: boolean = false;

  constructor(
    private _attendanceService: AttendanceService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    private _formBuilder: FormBuilder,
    private _PayoutService: PayoutService,
    private alertService: AlertService,
    private _masterService: MasterServiceService,
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService,
    private cdr: ChangeDetectorRef,
    private _ReportService: ReportService,

  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);

    this.empl_mobile_no = this.empDataFromParent.mobile;

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

    this.openLeaveBalanceForm = this._formBuilder.group({
      rowid: [''],
      emp_id: [''],
      intial_leave_bal_txt: ([]),
      emp_name: [''],
      mobile: [''],
      orgempcode: [''],
      leave_bank_id: [''],
    })

    // add by ak 11-06-2025
    this.Edit_Form = this._formBuilder.group({
      inTime: ['', [Validators.required]],
      outTime: ['', [Validators.required]],
      isNightShiftFlag: ['', [Validators.required]],
    })
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yy = String(today.getFullYear());


    this.currentDate = `${dd}/${mm}/${yy}`;
    this.markDateData = this.currentDate;

    // Get the first day of the current month
    const fromDate = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get the last day of the current month
    const toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formatDate = (date: Date) => {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month as number with leading zero
      const yyyy = date.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    this.currentFromDate = formatDate(fromDate);
    this.currentToDate = formatDate(toDate);
    this.checkin_Form = this._formBuilder.group({
      markedStatus: ['Marked', Validators.required],
      empCode: ['', Validators.required],
      FromDate:['']
    });

    
    this.checkin_Form.patchValue({
      FromDate :this.getTodayDate()
    })

    this.checkin_Form.get('FromDate')?.valueChanges.subscribe(value => {
      if (this.showEmployeeData) {
        this.TpCheckInOutSummary(); // Only call if data is already visible
      }
    });

    this.checkin_Form.get('markedStatus')?.valueChanges.subscribe(value => {
      if (this.showEmployeeData) {
        this.TpCheckInOutSummary(); // Only call if data is already visible
      }
    });
    this.checkin_Form.get('empCode')?.valueChanges.subscribe(value => {
      if (this.showEmployeeData) {
        this.TpCheckInOutSummary(); // Only call if data is already visible
      }
    });

    // open on date 13/06/2024 start
    this.show_check_in_out = true;
    localStorage.removeItem('openedCalendar');

    this.get_calendar();
    this.get_holidays();
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
        this.blankCalendar.map((el: any) => {
          if (el.holiday_name_cd == 'HO') {
            el.attendance_type = 'HO';
          }
        })
        this.original_blankCalendar = this.deepCopyArray(this.blankCalendar);


        this.employer_details();


      } else {
        this.blankCalendar = [];

        this.toastr.error(resData.msg, 'Oops!');
      }
    })
  }

  employer_details() {


    this._attendanceService
      .get_employer_today_attendance({

        customeraccountid: (this.tp_account_id),
        productTypeId: this.product_type,
        att_date: this.selected_date,
        emp_name: this.empl_mobile_no,
        status: this.filter_emp_val,
        GeoFenceId: this.decoded_token.geo_location_id,
        pageNo: this.p,
        pageLimit: this.limit

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
            // // this.advance_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'SalaryAdvances')[0].headid;
            // // added on 16/05/2025
            // this.travel_allowance = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Travel Allowance')[0]?.headid;
            // this.daily_allowance = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Daily Allowance')[0]?.headid;


            //setting showCalendar property
            this.emp_json_data.map((el: any) => {
              el['showCalendar'] = false;
              el['photopath'] = ((el['photopath'] != null && el['photopath']
                != 'https://api.contract-jobs.com/crm_api/') ? el['photopath'] : '');

              el['template_txt'] = el['template_txt'] != '' ? JSON.parse(el['template_txt']) : '';
              el['balance_txt'] = el['balance_txt'] != '' ? JSON.parse(el['balance_txt']) : '';

              el['comp_off_txt'] = !el['comp_off_txt'] ? '' : JSON.parse(el['comp_off_txt']);

            })

            this.filteredEmployees = this.emp_json_data;
            this.checkin_Form.patchValue({
              empCode: this.filteredEmployees[0]?.emp_code,
            })
            // console.log(this.emp_json_data);
            // this.filteredEmployees_forBulk = this.deepCopyArray(this.filteredEmployees);
            this.filteredEmployees_forBulk = this.deepCopyArray(this.filteredEmployees);
            let temp_arr = this.generateArrayOfObjects(this.days_count);

            // console.log(this.filteredEmployees);
            this.filteredEmployees_forBulk.map((el: any) => {
              el['att_details'] = temp_arr;
            });
            this.original_filteredEmployees_forBulk = this.deepCopyArray(this.filteredEmployees_forBulk);


            // let openedIndex = (localStorage.getItem('openedCalendar') == undefined ? null : parseInt(localStorage.getItem('openedCalendar')));
            // if (openedIndex != null) {

            this.toggleCalendar(0, this.filteredEmployees[0], 'api');
            // }

          } else {
            this.emp_json_data = [];
            this.filteredEmployees = [];
            this.filteredEmployees_forBulk = [];
            this.original_filteredEmployees_forBulk = [];
            this.attendanceSummaryData = {};
            // console.log(resData.message);
            //this.toastr.error(resData.message, 'Oops!');
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
  /**Deep Copy**/

  toggleCalendar(new_index: any, emp_data: any, action: any): any {
    // console.log(emp_data);
    console.log(this.filteredEmployees)
    // console.log(this.accessRights);
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit && !this.accessRights.View) {
      return this.toastr.error("You do not have permission to perform this action.");
    }

    this.selected_emp_data = emp_data;
    if (action == 'toggle') {
      this.blankCalendar = this.deepCopyArray(this.original_blankCalendar);
    }

    this.filteredEmployees[new_index].showCalendar = true;

    // if (this.filteredEmployees[new_index]?.showCalendar != undefined) {
    //   this.filteredEmployees[new_index].showCalendar = !this.filteredEmployees[new_index]?.showCalendar;
    // } else {
    //   return;
    // }

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
  ngOnDestroy() {
    localStorage.removeItem('openedCalendar');
  }
  changeMonth(e: any) {
    this.month = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    localStorage.removeItem('openedCalendar');

    // Check if current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    this.isCurrentMonthYear = (Number(this.month) === currentMonth && Number(this.year) === currentYear);

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

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    this.isCurrentMonthYear = (Number(this.month) === currentMonth && Number(this.year) === currentYear);


    this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
      arr[i].showCalendar = false;
    });
    this.p = 1;

    this.get_calendar();
    this.get_holidays();
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
  changeLeaveType(e: any, prev_bal: any) {
    // console.log(this.selectedCalendar_dates);

    // To check the leave balance when applying for leave

    // console.log(this.selectedCalendar_dates.length , prev_bal);

    // Start Min Paid Days Condition - 15 July 2024
    let paiddays = parseFloat(this.selected_emp_data.marked_attendance_paid_days);
    let balance_txt = !this.selected_emp_data?.balance_txt ? 0 : this.selected_emp_data?.balance_txt;
    if (balance_txt == 0) {
      this.toastr.error('Your leave balance is low', 'Oops!');
      return;
    } else {
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
    console.log(leavetype);
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
  async clear_click() {
    this.isDragging = false;
    let check_dates = await this.validate_dates();
    if (check_dates == false) {
      return;
    }
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
  check_access_right_cdn() {
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
      return false;
    } else {
      return true;
    }
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

      console.log(this.openLeaveBalanceForm.value.intial_leave_bal_txt);

      input.value = '0';
      return;
    }

    let ilbt = this.openLeaveBalanceForm.value.intial_leave_bal_txt;
    ilbt[index].opening_bal = input.value;

    this.openLeaveBalanceForm.patchValue({
      intial_leave_bal_txt: ilbt,
    });

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
        // for hub api dated. 30.04.2025 harsh
        // let data = resData.commonData[0];
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

  allowDeductChange(head: any) {
    // console.log(head);
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
  openAllowDeductPopup() {
    this.showAllowDeductPopup = true;

  }


  save_approve_attendance(action: any) {
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
                  this.toastr.success(resData.message, 'Success');
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
              this.toastr.success(resData.message, 'Success');
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

  /**Leave Click Changes**/
  async leave_click(index: any) {
    let new_index = index;
    console.log(this.p, this.limit, index, new_index);

    let check_dates = await this.validate_dates();
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

  get ad() {
    return this.allowanceDeductForm.controls;
  }
  remove_selection() {
    this.selectedCalendar_dates = [];
    this.blankCalendar.map(el => {
      el.localSelection = false;
    })
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
  closeAllowanceDeductPopup() {
    this.showAllowDeductPopup = false;
    this.allowanceDeductForm.patchValue({
      id: '',
      type: '',
      value: '',
      remarks: '',
    })
  }
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
  checkSalaryCondFunc(att_type: any) {
    return new Promise<boolean>((resolve, reject) => {

      let leavetaken = parseFloat(this.selected_emp_data.marked_attendance_leave_taken);
      let paiddays = parseFloat(this.selected_emp_data.marked_attendance_paid_days);
      let salarydays = parseFloat(this.selected_emp_data.salarydays);
      let salary_days_opted = this.selected_emp_data.salary_days_opted;

      let local_marking_days = 0;
      if (att_type == 'PP' || att_type == 'HO' || att_type == 'RH' || att_type == 'WO' || att_type == 'LL' || att_type == 'WFH' || att_type == 'OD' || att_type == 'TR' || att_type == 'ASL') {
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
                // console.log(dd, el1.holiday_name_cd);q
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
      }
    })
  }

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

  public get accountClass(): string {
    if (GlobalConstants.NEW_THEME_IDS.includes(this.tp_account_id.toString())) {
      return 'account-' + 'newtheme';
    } else {
      return 'account';
    }

  }

  check_date_filter() {
    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    // console.log(todt-fromdt);

    if (todt >= fromdt) {
      return true;
    }
    else {
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
      return false;
    }
  }

  loadEmployeeData() {
    this.TpCheckInOutSummary();
    this.showEmployeeData = true;
  }
  TpCheckInOutSummary() {
    //let selectFrom = this.currentFromDate;
    //let selectTo = this.currentToDate;
    let selectFrom = this.formateDate(new Date(this.year, this.month -1, 1));
    let selectTo = this.formateDate(new Date(this.year, this.month , 0));
    // console.log(selectFrom,'selectFrom')
    // console.log(this.month,'month')
    if(this.checkin_Form.get('markedStatus')?.value == 'Not Marked'){
       selectFrom = this.formateDate(this.checkin_Form.get('FromDate')?.value)
       selectTo = this.formateDate(this.checkin_Form.get('FromDate')?.value)
    }
    this._ReportService.GetTpCheckInOutSummary({
      "fromDate": selectFrom,
      "toDate": selectTo,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "flag": "normal_report",
      "GeoFenceId": this.decoded_token.geo_location_id,
      "checkInOutMarkedType": this.checkin_Form.get('markedStatus')?.value?.toString(),
      "empCode": this.checkin_Form.get('empCode')?.value?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.employee_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this.employee_data, 'employee_data');
        // this.alertService.success(resData.message, GlobalConstants.alert_options_autoClose);
      } else {
        this.employee_data = [];
        this.alertService.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });

  }

  SaveEmployee_CheckinCheckOut() {
    let isNightShiftFlag = this.Edit_Form.get('isNightShiftFlag').value;
    let fromdate = '';
    let todate = '';
    if (isNightShiftFlag == 'Y') {
      let check_flag = this.check_date_filter();

      if (check_flag == false) {
        return;
      }

      fromdate = $('#FromDate').val();
      todate = $('#ToDate').val();
    }

    // console.log(fromdate);
    // console.log(todate);
    // return;

    this._attendanceService.TpCheckInOut({
      "action": "Save_CheckIn_Out",
      "isNightShiftFlag": isNightShiftFlag,
      "fromdate": fromdate,
      "todate": todate,
      "checkInTime": this.Edit_Form.get('inTime')?.value,
      "checkOutTime": this.Edit_Form.get('outTime')?.value,
      "checkInOutType": "InOut",
      "customerAccountId": this.tp_account_id.toString(),
      "empCode": this.emp_code.toString(),
      "productTypeId": this.product_type,
      "checkInOutBy": this.tp_account_id.toString(),
      "attDate": this.convertDashToSlash(this.attendance_date)
    }).subscribe((resData: any) => {
      // console.log(resData);

      if (resData.statusCode) {

        this.data = resData.commonData;
        this.TpCheckInOutSummary();
        this.closePopup();
        this.alertService.success(resData.message, GlobalConstants.alert_options_autoClose);
      } else {
        this.data = [];
        this.alertService.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    })
  }

  openPopup(emp_name: any, att_date: any, check_in_dt: any, check_out_dt: any, in_time: any, out_time: any, emp_code: any, isNightShiftFlag: any) {
    this.showPopup = true;
    this.emp_name = emp_name;
    this.attendance_date = att_date;
    this.emp_code = emp_code;
    this.in_time = in_time;
    this.out_time = out_time;
    // Patch values to the form
    this.Edit_Form.patchValue({
      inTime: this.in_time,
      outTime: this.out_time,
      isNightShiftFlag: !isNightShiftFlag ? 'N' : isNightShiftFlag,
    });

    // console.log(att_date);

    let att_fr = '';
    let att_to = '';

    // console.log(this.checkin_Form.get('markedStatus')?.value)

    // if (this.checkin_Form.get('markedStatus')?.value?.toString() == 'Marked') {
    //   if (!isNightShiftFlag || isNightShiftFlag == 'N') {
    //     if (!att_date) {
    //       att_fr = $('#FromDate_filter').val();
    //       att_to = $('#FromDate_filter').val();
    //     }
    //   } else if (isNightShiftFlag == 'Y') {
    //     // console.log('checkkkkk')
    //     if (!check_in_dt) {
    //       att_fr = $('#FromDate_filter').val();
    //       att_to = $('#FromDate_filter').val();
    //     } else if (check_in_dt) {
    //       att_fr = check_in_dt;
    //       att_to = check_in_dt;
    //     }

    //     if (check_out_dt) {
    //       att_to = check_out_dt;
    //     }
    //   }

    // } else {
    // console.log('11',$('#FromDate_filter').val())
    att_fr = $('#FromDate_filter').val();
    att_to = $('#FromDate_filter').val();
    // }


    if (isNightShiftFlag && isNightShiftFlag == 'Y') {
      let att_fr_split = att_fr.split('-');
      let dt1 = att_fr_split[2] + '-' + att_fr_split[1] + '-' + att_fr_split[0];

      let att_to_split = att_to.split('-');
      let dt2 = att_to_split[2] + '-' + att_to_split[1] + '-' + att_to_split[0];

      setTimeout(() => {
        $('#FromDate').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
          minDate: new Date(dt1)
        }).datepicker('setDate', new Date(dt1));

        $('#ToDate').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
        }).datepicker('setDate', new Date(dt2));

        $('body').on('change', '#FromDate', function () {
          $('#recdate').trigger('click');
        });

        $('body').on('change', '#ToDate', function () {
          $('#recdate').trigger('click');
        });


      }, 100);

    }
  }

  closePopup() {
    this.showPopup = false;

    this.Edit_Form.patchValue({
      inTime: '',
      outTime: '',
      isNightShiftFlag: '',
    })
  }

  get_date() {
    if (!this.attendance_date) {
      return $('#FromDate').val();
    } else {
      return this.attendance_date;
    }
  }

  convertDashToSlash(dateStr: string): string {
    return dateStr.replace(/-/g, '/');
  }

  getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: 'YYYY-MM-DD'
  }

  formateDate(selectedDate){
    const rawDate = new Date(selectedDate);
    const day = String(rawDate.getDate()).padStart(2, '0');
    const month = String(rawDate.getMonth() + 1).padStart(2, '0');
    const year = rawDate.getFullYear();
    return `${day}/${month}/${year}`;
  }


  

}