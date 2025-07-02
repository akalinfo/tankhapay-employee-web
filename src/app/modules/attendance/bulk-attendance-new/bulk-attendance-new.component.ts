import { Component, ElementRef, ViewChild } from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import * as XLSX from 'xlsx';
import { dongleState, grooveState } from 'src/app/app.animation';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';
declare var $: any;
import { Router } from '@angular/router';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { firstValueFrom, forkJoin, of } from 'rxjs';
@Component({
  selector: 'app-bulk-attendance-new',
  templateUrl: './bulk-attendance-new.component.html',
  styleUrls: ['./bulk-attendance-new.component.css'],
  animations: [dongleState, grooveState]

})
export class BulkAttendanceNewComponent {

  filteredEmployees: any = [];
  showSidebar: boolean = true;
  yearsArray: any = [];
  decoded_token: any;
  calendar_data: any = [];
  blankCalendar: any = [];
  emp_json_data: any = [];

  LedgerMasterHeads_head: any = [];

  overtime_headid: string = '';
  allowance_headid: string = '';
  deduction_headid: string = '';
  // advance_headid: string = '';
  travel_allowance = '';
  daily_allowance = '';
  alertModalStatus: boolean = false;
  is_payout_with_attendance: string = 'PWA';
  tp_account_id: any;
  product_type: any;
  p: number = 0;
  month: any;
  year: any;
  attendanceFormat: string = 'excel';
  attendanceSource: any = 'all';
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
  selected_date: any;
  days_count: any;  // No. of days in a month
  // days_array: any = []; // Array representing no. of days in a month
  getEmployerMonthAttData: any = [];
  showAttCalendarPopup: boolean = false;
  attCalendarForm: FormGroup;
  searchKey: any = '';
  excelBulkAttUploadArray: any = [];
  excelToTableData: any = [];
  fileUpload_binarystr: any = '';
  fileUpload_name: any = '';

  show_bulk_upload_btn = true;
  showAllowDeductPopup: boolean = false;
  allowanceDeductForm: FormGroup;
  voucherdetails_split: any = [];
  month_days_master: any = [];
  sso_admin_id: string = '';
  showSpinner: boolean = true;
  accessRights: any = {};
  payout_period: any = '';
  is_bypass_future_dt: any = '';
  download_excel_data: any = [];
  download_type: any = 'actual';

  filter_emp_val: any = "All";
  filter_emp_val_copy: any = "All";
  searchKey_copy: any = '';
  month_copy: any;
  year_copy: any;
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
  attendancePurpose: any = 'Attendance';

  is_any_filter_triggered: boolean = false;
  selection_limit: any = 50;

  constructor(
    private _attendanceService: AttendanceService,
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private _masterService: MasterServiceService,
    private _businesessSettingsService: BusinesSettingsService,
    private router: Router) {
  }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj)?.token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.sso_admin_id = this.decoded_token.sso_admin_id
    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    //
    this.yearsArray = [];

    if (this.decoded_token?.isEmployer == '0') {
      this.accessRights = this._masterService.checkAccessRights('/attendance');
      // console.log(this.accessRights);
    }

    if (currentMonth == 11) {
      currentYear = currentYear + 1;
    }

    for (let i = 2023; i <= currentYear; i++) {
      this.yearsArray.push(i);
    };

    if (localStorage.getItem('selected_date') == null) {
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
    // this.days_count = new Date(this.year, this.month, 0).getDate()
    // this.attendanceSource = !localStorage.getItem('attendanceSource') ? 'all' : localStorage.getItem('attendanceSource');
    // if (this.attendanceSource == 'bulkexcel') {
    //   this.attendanceFormat = 'bulkexcel_manual';
    // }

    this.get_month_dates_days();
    // Masters
    this.get_geo_fencing_list();
    this.getDepartmentData();
    this.getDesignationData();


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



    // this.days_array = this.generateNumberArray();

    this.attCalendarForm = this._formBuilder.group({
      emp_code: [''],
      emp_name: [''],
      dateofbirth: [''],
      mobile: [''],
      attendancedate: [''],
      attendancetype: [''],
      leave_bank_id: [''],
      leavetype: [''],

      emp_index: [''],
      payout_with_attendance: ['']
    });

    this.allowanceDeductForm = this._formBuilder.group({
      emp_code: ['', [Validators.required]],
      emp_name: [''],
      type: ['', [Validators.required]],
      value: ['', [Validators.required]],
      remarks: [''],

    })

  }

  get ad() {
    return this.allowanceDeductForm.controls;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    // this.days_count = new Date(this.year, this.month, 0).getDate()
    // let date = this.days_count + '-' + this.month + '-' + this.year;
    // this.selected_date = date;
    // localStorage.setItem('selected_date', date);

    // this.get_month_dates_days();
    // this.days_array = this.generateNumberArray();

  }

  changeYear(e: any) {
    this.year = e.target.value;
    // this.days_count = new Date(this.year, this.month, 0).getDate()
    // let date = this.days_count + '-' + this.month + '-' + this.year;
    // this.selected_date = date;
    // localStorage.setItem('selected_date', date);

    // this.get_month_dates_days();
    // this.days_array = this.generateNumberArray();

  }


  search(event: any) {
    let searchkey = event.target.value.toString().toLowerCase();
    this.p = 0;
    this.filteredEmployees = this.emp_json_data.filter(function (element: any) {
      return element.emp_name.toLowerCase().includes(searchkey)
        || element.mobile.toLowerCase().includes(searchkey)
    });
  }
  filter_emp(val: any) {
    this.filter_emp_val = val;
    // console.log(this.filter_emp_val);
    if (val == 1) {
      this.filteredEmployees = this.deepCopyArray(this.emp_json_data);
    } else if (val == 2) {
      this.filteredEmployees = this.emp_json_data.filter((el: any) => {
        // if (el.approved_attendance.split(' ')[0] == 0) {
        //   return el;
        // }
        if (el.monthly_att_approval_status == 'N' && (el.present_days) == 0) {
          return el;
        }
      })
    } else if (val == 3) {
      this.filteredEmployees = this.emp_json_data.filter((el: any) => {
        // if (el.approved_attendance.split(' ')[0] == 0) {
        //   return el;
        // }
        if (el.monthly_att_approval_status == 'N' && (el.present_days) > 0) {
          return el;
        }
      })

    } else if (val == 4) {
      this.filteredEmployees = this.emp_json_data.filter((el: any) => {
        // if (el.approved_attendance.split(' ')[0] > 0) {
        //   return el;
        // }
        if (el.monthly_att_approval_status == 'Y') {
          return el;
        }
      })
    }
  }

  employer_details() {
    // this.attendanceSource = !localStorage.getItem('attendanceSource') ? 'all' : localStorage.getItem('attendanceSource');
    this.emp_json_data = [];
    this.filteredEmployees = [];
    // console.log({
    //   customeraccountid: (this.tp_account_id),
    //   productTypeId: this.product_type,
    //   att_date: this.selected_date,
    //   emp_name: '',
    //   approval_status: '',
    //   GeoFenceId: this.decoded_token.geo_location_id,
    //   attendanceSource: this.attendanceSource,
    // });




    this._attendanceService
      .get_employer_today_attendance({
        customeraccountid: (this.tp_account_id),
        productTypeId: this.product_type,
        att_date: this.selected_date,
        emp_name: this.searchKey,
        approval_status: '',
        status: this.filter_emp_val,
        // status: 'All',
        pageNo: 1,
        pageLimit: 5000,
        GeoFenceId: this.decoded_token.geo_location_id,
        attendanceSource: this.attendanceSource,
        postOffered: this.desgName,
        postingDepartment: this.deptName,
        unitParameterName: this.orgName,
        attendancePurpose: this.attendancePurpose,
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          let decrypted_emp_json_data = resData.commonData;

          this.LedgerMasterHeads_head = (decrypted_emp_json_data).data.LedgerMasterHeads;

          this.overtime_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Overtime')[0]?.headid;
          this.allowance_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Allowance')[0]?.headid;
          this.deduction_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Deduction')[0]?.headid;
          // this.advance_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'SalaryAdvances')[0]?.headid;

          // added on 16/05/2025
          this.travel_allowance = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Travel Allowance')[0]?.headid;
          this.daily_allowance = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Daily Allowance')[0]?.headid;
          // end on 16/05/2025

          this.emp_json_data = (decrypted_emp_json_data).data.attendancedetail.filter((el: any) => {
            return el.time_criteria === 'Full Time'
          })


          // let temp_arr = this.generateArrayOfObjects(this.days_count);
          let temp_arr = this.generateArrayOfObjects();
          // 'attday': i, 'attendance_type': 'HO'
          // let date = new Date(split_d[2], (split_d[1] - 1), split_d[0]);

          //setting att_details property
          this.emp_json_data.map((el: any, i: any) => {
            let holiday_days = 0.0;
            // temp_arr.map((ta:any) => {
            //   let date = new Date(this.year, this.month, ta.attday);
            //   if (ta.attendance_type == 'HO' && date <= el.dateofrelieveing && date >= el.dateofjoining) {
            //     holiday_days += 1;
            //   }

            // })
            el['photopath'] = ((el['photopath'] != null && el['photopath']
              != 'https://api.contract-jobs.com/crm_api/') ? el['photopath'] : '');
            // (el.photopath == '' ? '' : el.photopath);
            el['att_details'] = temp_arr;
            // el['present_days'] = holiday_days;
            // el['present_days'] = 0.0;
            // el['leave_days'] = 0.0;
            // el['absent_days'] = 0.0;
            // el['auto_mark_days'] = 0.0;
            // el['actual_present_days'] = 0.0;

            el['template_txt'] = el['template_txt'] != null ? JSON.parse(el['template_txt']) : '';
            // el['balance_txt'] = JSON.parse(el['balance_txt']);
            el['balance_txt'] = el['balance_txt'] != null ? JSON.parse(el['balance_txt']) : '';
          })
          this.filteredEmployees = this.deepCopyArray(this.emp_json_data);

          if (this.filteredEmployees.length > 0) {
            this.is_payout_with_attendance = this.filteredEmployees[0]?.payout_with_attendance;
          }

          //  console.log(this.filteredEmployees)
          // return;

          if (this.attendanceFormat != 'excel') {
            // this.getEmployerMonthAttendance();
            // this.getEmployerMonthAttendance_for_excel_2();
            this.showSpinner = false;
          }

          if (this.attendanceFormat == 'excel') {
            this.showSpinner = false;

          }

          if (this.change_sidebar_filter_flag) {
            this.closeSidebar();
          }

        } else {
          this.emp_json_data = [];
          this.filteredEmployees = [];
          this.toastr.error(resData.message, 'Oops!');
        }

        // console.log(this.filteredEmployees);
      });
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


  // generateNumberArray(): number[] {
  //   return Array.from({ length: this.days_count }, (_, index) => index + 1);
  // }
  generateArrayOfObjects() {
    let n = this.month_days_master.length;
    const result = [];
    for (let i = 1; i <= n; i++) {
      let split_dt = this.month_days_master[i - 1].w_date.split('-');

      if (this.month_days_master[i - 1].holiday_name_cd == 'HO') {
        result.push({ 'attday': split_dt[0], 'attendance_type': 'HO', 'attmonth': split_dt[1], 'attyear': split_dt[2] });
      } else {
        result.push({ 'attday': split_dt[0], 'attendance_type': '', 'attmonth': split_dt[1], 'attyear': split_dt[2] });
      }
    }
    return result;
  }

  getEmployerMonthAttendance() {
    // console.log('harsshhh');

    this._attendanceService.getEmployerMonthAttendance({
      customerAccountId: this.tp_account_id.toString(),
      month: this.month,
      year: this.year,
      attendanceSource: this.attendanceSource,
      postOffered: this.desgName,
      postingDepartment: this.deptName,
      unitParameterName: this.orgName,
      searchKeyword: this.searchKey,
      attendancePurpose: this.attendancePurpose,
    })
      .subscribe((resData: any) => {
        this.emp_json_data.map((el: any, i: any) => {
          el['present_days'] = 0.0;
          el['leave_days'] = 0.0;
          el['absent_days'] = 0.0;
          el['auto_mark_days'] = 0.0;
          el['actual_present_days'] = 0.0;
        })
        this.filteredEmployees = this.deepCopyArray(this.emp_json_data);
        this.showSpinner = false;

        if (resData.statusCode) {
          this.getEmployerMonthAttData = resData.commonData;
          // console.log(this.getEmployerMonthAttData);
          // console.log(this.filteredEmployees);

          this.getEmployerMonthAttData.forEach(obj1 => {
            // console.log(obj1)
            let index = this.filteredEmployees.findIndex(obj2 => obj1.emp_code == obj2.emp_code);
            if (index != -1) {
              let inner_index = this.filteredEmployees[index]?.att_details.findIndex(obj3 => obj3.attday == obj1.attday && obj3.attmonth == obj1.attmonth && obj3.attyear == obj1.attyear);
              if (inner_index != -1) {
                Object.assign(this.filteredEmployees[index]?.att_details[inner_index], obj1);

              }

              //present & leave days
              if (obj1?.attendance_type == 'PP' || obj1?.attendance_type == 'HO' || obj1?.attendance_type == 'WO' || obj1?.attendance_type == 'WFH' || obj1?.attendance_type == 'OD' || obj1?.attendance_type == 'TR' || obj1?.attendance_type == 'ASL') {
                this.filteredEmployees[index].present_days += 1.0;
              } else if (obj1?.attendance_type == 'HD') {
                this.filteredEmployees[index].present_days += 0.5;
              } else if (obj1?.attendance_type == 'LL') {
                this.filteredEmployees[index].leave_days += 1.0;
              } else if (obj1?.attendance_type == 'AA' || obj1?.attendance_type == 'LWP') {
                this.filteredEmployees[index].absent_days += 1.0;
              }

              if (obj1?.attendance_type == 'HO' || obj1.attendance_type == 'WO') {
                this.filteredEmployees[index].auto_mark_days += 1.0;
              } else if (obj1?.attendance_type == 'PP' || obj1.attendance_type == 'OD' || obj1?.attendance_type == 'WFH' || obj1?.attendance_type == 'TR' || obj1?.attendance_type == 'ASL') {
                this.filteredEmployees[index].actual_present_days += 1.0;
              } else if (obj1?.attendance_type == 'HD') {
                this.filteredEmployees[index].actual_present_days += 0.5;
              }

            }
          });

          this.emp_json_data = this.deepCopyArray(this.filteredEmployees);
          // console.log(this.emp_json_data)
          this.filter_emp(this.filter_emp_val)

        } else {
          this.getEmployerMonthAttData = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  validate_dates(emp_name: any, dateofjoining: any, dateofrelieveing: any, dd: any, mm: any, yy: any) {
    // console.log(this.month,this.year);

    let current_date = new Date();
    let dynamic_date = new Date(yy, (mm - 1), dd);
    // console.log(dynamic_date);

    let sel_emp_join = dateofjoining.split('/');
    let doj = new Date(sel_emp_join[2], (sel_emp_join[1] - 1), sel_emp_join[0]);

    if (dateofrelieveing != '') {
      let sel_emp_rel = dateofrelieveing.split('/');
      let dor = new Date(sel_emp_rel[2], (sel_emp_rel[1] - 1), sel_emp_rel[0]);

      if (dynamic_date > dor) {
        // console.log('ok', emp_name, dd, mm, yy)
        // this.toastr.error('Marking date should be less than employee DOL (Date of Leaving) date', 'Oops!');
        return false;

      }
    }


    if ((dynamic_date > current_date && this.payout_period != 'Advance')
      || (this.payout_period == 'Advance' && dynamic_date > current_date && this.is_bypass_future_dt == 'N')) {
      // if (dynamic_date > current_date) {
      // this.toastr.error('Future date attendance marking not allowed. Please check selected date', 'Oops!');
      return false;

    } else if (dynamic_date < doj) {
      // this.toastr.error('Marking date should be greater than employee DOJ date', 'Oops!');
      return false;

    }

    return true;

  }

  validate_dates2(emp_code: any, dateofjoining: any, dateofrelieveing: any, dd: any, mm: any, yy: any) {

    let current_date = new Date();
    //let advance_curr_date = new Date(current_date.getFullYear(), current_date.getMonth(), 25);
    let dynamic_date = new Date(yy, (mm - 1), dd);


    let sel_emp_join = dateofjoining.split('/');
    let doj = new Date(sel_emp_join[2], (sel_emp_join[1] - 1), sel_emp_join[0]);

    if (dateofrelieveing != '') {
      let sel_emp_rel = dateofrelieveing.split('/');
      let dor = new Date(sel_emp_rel[2], (sel_emp_rel[1] - 1), sel_emp_rel[0]);

      if (dynamic_date > dor) {
        this.toastr.error('Marking date should be less than employee (' + emp_code + ') DOL (Date of Leaving) date', 'Oops!', { disableTimeOut: true });
        return false;
      }
    }
    // console.log('this.payout_period',this.payout_period);
    if ((dynamic_date > current_date && this.payout_period != 'Advance')
      || (this.payout_period == 'Advance' && dynamic_date > current_date && this.is_bypass_future_dt == 'N')) {
      this.toastr.error('Future date attendance marking not allowed of employee (' + emp_code + '). Please check selected date', 'Oops!', { disableTimeOut: true });
      return false;

    } else if (dynamic_date < doj) {
      this.toastr.error('Marking date should be greater than employee (' + emp_code + ') DOJ date', 'Oops!', { disableTimeOut: true });
      return false;

    }

    return true;

  }


  /***Excel Bulk Upload Att***/
  getEmployerMonthAttendance_for_excel(type: any) {
    this.download_type = type;

    if (this.download_type == 'blank') {
      this.getAttExcel();

    } else if (this.download_type == 'actual' || this.download_type == 'actual_present_future') {
      let att_purpose = this.attendancePurpose;
      if (this.download_type == 'actual_present_future') {
        att_purpose = 'Attendance';
      }

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
        searchKeyword: this.searchKey,
        attendancePurpose: att_purpose,

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
  }

  getAttExcel() {
    this._attendanceService.get_month_dates_days({
      'employer_id': this.decoded_token.id, 'month': this.month,
      'year': this.year
    }).subscribe((resData: any) => {
      if (resData.status) {
        let exportData = [];

        // console.log(this.filteredEmployees);
        for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
          if ((this.filteredEmployees[idx]?.lockstatus == 'Not Locked' || (this.filteredEmployees[idx]?.lockstatus == 'Locked' && this.filteredEmployees[idx]?.payout_with_attendance == 'P' && this.filteredEmployees[idx]?.deviationpaystatus == 'N'))
            && (!this.filteredEmployees[idx]?.advicelockstatus || this.filteredEmployees[idx]?.advicelockstatus?.toLowerCase() != 'locked')) {
            let leave_balance = '';
            // if (this.filteredEmployees[idx]?.prev_bal != undefined && this.filteredEmployees[idx]?.prev_bal != null && this.filteredEmployees[idx]?.prev_bal != '') {
            //   JSON.parse(this.filteredEmployees[idx]?.prev_bal).map((el: any) => {
            //     leave_balance = leave_balance + (el.typecode) + '-' + (el.prev_bal) + ','
            //   })
            // }

            if (this.filteredEmployees[idx]?.balance_txt != undefined && this.filteredEmployees[idx]?.balance_txt != null && this.filteredEmployees[idx]?.balance_txt != '') {
              (this.filteredEmployees[idx]?.balance_txt).map((el: any) => {
                // if (el.init_bal)
                leave_balance = leave_balance + (el.typecode) + '-' + (el.prev_bal) + ','
              });
            }


            // console.log(leave_balance);

            // let leavetaken = parseFloat(this.filteredEmployees[index].marked_attendance_leave_taken);
            // let paiddays = parseFloat(this.filteredEmployees[index].marked_attendance_paid_days);
            // let salarydays = parseFloat(this.filteredEmployees[index].salarydays);
            // let salary_days_opted = this.filteredEmployees[index].salary_days_opted;

            let obj = {
              'Employee': this.filteredEmployees[idx].emp_name,
              'EmpCode': this.filteredEmployees[idx].emp_code,
              'OrgEmpCode': this.filteredEmployees[idx]?.orgempcode,
              'Mobile': this.filteredEmployees[idx].mobile,
              'OrganizationUnit': this.filteredEmployees[idx].assignedous,
              'Department': this.filteredEmployees[idx].posting_department,
              'Designation': this.filteredEmployees[idx].post_offered,
              'Status': this.filteredEmployees[idx]?.lockstatus,
              'DOB': this.filteredEmployees[idx].dateofbirth,
              'DOJ': this.filteredEmployees[idx].dateofjoining,
              'DOR': this.filteredEmployees[idx].dateofrelieveing,
              'Leave Balance': (leave_balance),
              'Man Days': this.filteredEmployees[idx].salary_days_opted == 'N' ? 'full-days' : this.filteredEmployees[idx].salarydays
              // ...days,
              // ,
              // 'Leaves': this.filteredEmployees[idx].leave_days,
              // 'Remarks': ''
            }
            // console.log(this.filteredEmployees[idx]);

            // Removed
            // for (let i = 0; i < resData.commonData.length; i++) {
            //   let dateColumn = resData.commonData[i].w_date;
            //   let att_type = this.filteredEmployees[idx].att_details[i].attendance_type;
            //   let leave_type = this.filteredEmployees[idx].att_details[i].leavetype;

            //   if (leave_type != '' && leave_type != null && leave_type != undefined) {
            //     att_type = att_type + '-' + leave_type;
            //   }

            //   obj[dateColumn] = att_type;
            // }


            if (this.download_type == 'blank') {
              for (let i = 0; i < resData.commonData.length; i++) {
                let dateColumn = resData.commonData[i].w_date;
                obj[dateColumn] = '';
              }

            } else if (this.download_type == 'actual') {
              let find = this.download_excel_data.find(el => el.emp_code == this.filteredEmployees[idx].emp_code);
              if (!find) {  // If not found
                for (let i = 0; i < resData.commonData.length; i++) {
                  let dateColumn = resData.commonData[i].w_date;
                  obj[dateColumn] = '';
                }

              } else { // If found
                for (let i = 0; i < resData.commonData.length; i++) {
                  let dateColumn = resData.commonData[i].w_date;
                  let dayCount = resData.commonData[i].day_cnt;
                  let dayKey = `day${dayCount}`;
                  let attendanceType = find[dayKey] || "";

                  obj[dateColumn] = attendanceType

                }
              }

            } else if (this.download_type == 'actual_present_future') {
              let date = new Date();
              let currentDate = date.getDate();
              let currentMonth = date.getMonth() + 1;
              let currentYear = date.getFullYear();

              for (let i = 0; i < resData.commonData.length; i++) {
                let dateColumn = resData.commonData[i].w_date;

                if (dateColumn.split('-')[0] >= currentDate && currentMonth >= dateColumn.split('-')[1] && currentYear >= dateColumn.split('-')[2]) {
                  // If the date is in the future
                  let dateColumn = resData.commonData[i].w_date;
                  obj[dateColumn] = 'PP';

                } else {
                  let find = this.download_excel_data.find(el => el.emp_code == this.filteredEmployees[idx].emp_code);
                  if (!find) {  // If not found
                    for (let i = 0; i < resData.commonData.length; i++) {
                      let dateColumn = resData.commonData[i].w_date;
                      obj[dateColumn] = '';
                    }

                  } else { // If found
                    for (let i = 0; i < resData.commonData.length; i++) {
                      let dateColumn = resData.commonData[i].w_date;
                      let dayCount = resData.commonData[i].day_cnt;
                      let dayKey = `day${dayCount}`;
                      let attendanceType = find[dayKey] || "";

                      obj[dateColumn] = attendanceType

                    }
                  }
                }

              }

            }

            let split_doj = this.filteredEmployees[idx].dateofjoining.split('/');
            let split_dor = this.filteredEmployees[idx].dateofrelieveing ? this.filteredEmployees[idx].dateofrelieveing.split('/') : [];
            for (let i = 0; i < resData.commonData.length; i++) {
              let dateColumn = resData.commonData[i].w_date;

              if (split_dor.length > 1) {
                if (dateColumn.split('-')[0] > split_dor[0] && dateColumn.split('-')[1] >= split_dor[1] && dateColumn.split('-')[2] >= split_dor[2]) {
                  // If the date is after the DOR
                  obj[dateColumn] = '';
                }
              }

              if (dateColumn.split('-')[0] < split_doj[0] && dateColumn.split('-')[1] <= split_doj[1] && dateColumn.split('-')[2] <= split_doj[2]) {
                // If the date is before the DOJ
                obj[dateColumn] = '';
              }
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
        downloadLink.download = `Attendance-${date.getMonth() + 1}-${date.getFullYear()}-${this.attendancePurpose}-sheet.xlsx`;
        downloadLink.click();

      }
    })
  }

  onFileChange(event: any) {
    // console.log(this.month);
    this.excelBulkAttUploadArray = [];
    this.excelToTableData = [];
    this.fileUpload_binarystr = ''; // Initialize the binary string variable
    this.fileUpload_name = '';
    this.show_bulk_upload_btn = true;
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    this.fileUpload_name = target.files[0].name;
    if (this.fileUpload_name.split('.')[1] != 'xlsx') {
      this.toastr.error('Please upload a valid xlsx file', 'Oops!');
      return;
    }
    reader.onload = (e: any) => {
      /* create workbook */
      // const binarystr: string = e.target.result;
      const binaryContent = e.target.result; // This will be a binary string
      // Encode the binary content as base64 and
      // Assign the binary string to the variable
      this.fileUpload_binarystr = btoa(binaryContent);
      const wb: XLSX.WorkBook = XLSX.read(binaryContent, { type: 'binary' });

      /* selected the first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      const data: any = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // console.log(data);

      this.excelBulkAttUploadArray = data
        .filter((_, rowIndex) => rowIndex > 0) // Exclude the first row (header row)
        .filter((row) => row[data[0].indexOf('EmpCode')]) // Filter rows with non-empty EmpCode
        .map((row) => {
          const rowObj = {};

          data[0].forEach((key, index) => {
            const cellValue = row[index] ? row[index].toString() : '';
            rowObj[key] = cellValue;
          });

          return rowObj;
        });
      // this.excelBulkAttUploadArray = data;
      // console.log(this.excelBulkAttUploadArray, 'harsh11');
      // console.log(this.filteredEmployees);

      // Check if the key is a number (Excel serial number)
      this.excelBulkAttUploadArray.forEach((obj, index) => {
        const newObj = {};
        for (let key in obj) {
          if (!isNaN(Number(key))) {
            // Convert Excel serial number to date string
            const dateString = this.excelSerialToJSDate(Number(key));
            // Assign the value to the new key (date string)
            newObj[dateString] = obj[key];
          } else {
            // If the key is not a number, keep it as is
            newObj[key] = obj[key];
          }
        }
        // Replace the original object with the new object in the array
        this.excelBulkAttUploadArray[index] = newObj;
      });

      let advise_locked_cnt = 0;
      const dateRegex = /\d{2}-\d{2}-\d{4}/g;

      for (let i = 0; i < this.excelBulkAttUploadArray.length; i++) {
        let attendanceDates = [];
        let emp_code;
        let mobile;
        let dob;
        let employee;
        let doj;
        let dor;
        let rowColorStatus = true;
        let orgempcode;
        let status;
        let department;
        let designation;
        let OrganizationUnit;

        let show_bulk_upload_btn_early_state = this.show_bulk_upload_btn;

        for (const key in this.excelBulkAttUploadArray[i]) {
          if (key.match(dateRegex)) {
            let splitd = key.split('-');
            // console.log(splitd);
            this.excelBulkAttUploadArray[i][key] = this.excelBulkAttUploadArray[i][key]?.toString().trim();

            if (this.excelBulkAttUploadArray[i][key]?.toString().split('-')[0] == 'LL' ||
              this.excelBulkAttUploadArray[i][key]?.toString().split('-')[0] == 'HL' ||
              this.excelBulkAttUploadArray[i][key]?.toString().split('-')[0] == 'HD'
            ) {
              attendanceDates.push({
                "attendancedate": splitd.join('/').toString(),
                "attendancetype": this.excelBulkAttUploadArray[i][key]?.toString().split('-')[0],
                "leavetype": this.excelBulkAttUploadArray[i][key]?.toString().split('-')[1],
              });
            } else {
              attendanceDates.push({
                "attendancedate": splitd.join('/').toString(),
                "attendancetype": this.excelBulkAttUploadArray[i][key]?.toString()
              });
            }

            if (this.excelBulkAttUploadArray[i][key] != 'PP' && this.excelBulkAttUploadArray[i][key].split('-')[0] != 'HD'
              && this.excelBulkAttUploadArray[i][key].split('-')[0] != 'HL' &&
              this.excelBulkAttUploadArray[i][key] != 'AA' && this.excelBulkAttUploadArray[i][key] != 'HO' &&
              this.excelBulkAttUploadArray[i][key] != 'CLS' && this.excelBulkAttUploadArray[i][key].split('-')[0] != 'LL' &&
              // this.excelBulkAttUploadArray[i][key].split('-')[1] != 'CL' && this.excelBulkAttUploadArray[i][key].split('-')[1] != 'ML' &&
              // this.excelBulkAttUploadArray[i][key].split('-')[1] != 'PL' && this.excelBulkAttUploadArray[i][key].split('-')[1] != 'MatL' &&
              this.excelBulkAttUploadArray[i][key] != '' && this.excelBulkAttUploadArray[i][key] != 'WO'
              && this.excelBulkAttUploadArray[i][key] != 'WFH' && this.excelBulkAttUploadArray[i][key] != 'OD'
              && this.excelBulkAttUploadArray[i][key] != 'TR' && this.excelBulkAttUploadArray[i][key] != 'LWP'
              && this.excelBulkAttUploadArray[i][key] != 'ASL') {
              // console.log(this.show_bulk_upload_btn)
              rowColorStatus = false;
              this.show_bulk_upload_btn = false;
            }

            if (this.excelBulkAttUploadArray[i][key] != '') {
              let valid_dates_check = this.validate_dates2(this.excelBulkAttUploadArray[i]['EmpCode'],
                this.excelBulkAttUploadArray[i]['DOJ'], this.excelBulkAttUploadArray[i]['DOR'], splitd[0], splitd[1], splitd[2]);

              if (valid_dates_check == false) {
                const fileInput = document.getElementById("attendnace_excel") as HTMLInputElement;
                fileInput.value = '';
                return;
              }
            }

          } else if (key === 'EmpCode') {
            emp_code = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'Mobile') {
            mobile = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'DOB') {
            dob = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'Employee') {
            employee = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'DOJ') {
            doj = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'DOR') {
            dor = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'OrgEmpCode') {
            orgempcode = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'Status') {
            status = this.excelBulkAttUploadArray[i][key];

            if (status == 'Locked' && this.get_lock_status(emp_code)) {
              const fileInput = document.getElementById("attendnace_excel") as HTMLInputElement;
              fileInput.value = '';
              this.toastr.error('Attendance status already Locked', 'Oops!');
              return;
            }
          } else if (key == 'OrganizationUnit') {
            OrganizationUnit = this.excelBulkAttUploadArray[i][key];
          } else if (key == 'Department') {
            department = this.excelBulkAttUploadArray[i][key];
          } else if (key == 'Designation') {
            designation = this.excelBulkAttUploadArray[i][key];
          }

          else {
            this.excelBulkAttUploadArray[i][key] = '';
          }

        }
        // EmpCode & Mobile Check - 12/12/2024
        let temp_idx = this.filteredEmployees.findIndex(el => el?.emp_code == emp_code);
        if (temp_idx != -1) {
          if (this.filteredEmployees[temp_idx].mobile != mobile) {
            rowColorStatus = false;
          }
        } else {
          rowColorStatus = false;
        }


        let lock_check_idx = this.filteredEmployees.findIndex((el: any) => el.emp_code == emp_code);

        // console.log(lock_check_idx);
        // console.log(this.filteredEmployees[lock_check_idx]?.advicelockstatus, this.filteredEmployees[lock_check_idx]?.emp_name);

        // console.log(this.filteredEmployees);
        if (lock_check_idx != -1 && (!this.filteredEmployees[lock_check_idx]?.advicelockstatus ||
          this.filteredEmployees[lock_check_idx]?.advicelockstatus?.toLowerCase() != 'locked')) {
          this.excelToTableData.push({
            attendanceDates: attendanceDates,
            emp_code: emp_code,
            mobile: mobile,
            dob: dob,
            employee: employee,
            doj: doj,
            dor: dor,
            rowColor: rowColorStatus,
            status: status,
            orgempcode: orgempcode,
            department: department,
            designation: designation,
            OrganizationUnit: OrganizationUnit
          });
        } else {
          advise_locked_cnt++;
          this.show_bulk_upload_btn = show_bulk_upload_btn_early_state;
        }

      }

      if (advise_locked_cnt > 0) {
        this.toastr.info('Some employees Payment Advice has been locked and ticket has been created', 'Info');
      }

      // console.log(this.excelToTableData, 'harsh22');
    };
  }


  get_lock_status(emp_code: any) {
    if (!emp_code) {
      return true;
    }

    let idx = this.filteredEmployees.findIndex((el: any) => el.emp_code == emp_code);

    if (idx != -1) {
      if (this.filteredEmployees[idx]?.lockstatus == 'Locked' && this.filteredEmployees[idx]?.payout_with_attendance == 'P' && this.filteredEmployees[idx]?.deviationpaystatus == 'N') {
        return false;
      } else {
        return true;
      }

    } else {
      return true;
    }


  }

  excelSerialToJSDate(serial: any) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);

    var day: any = date_info.getDate();
    var month: any = date_info.getMonth() + 1;
    var year = date_info.getFullYear();

    if (day < 10) {
      day = '0' + day;
    }
    if (month < 10) {
      month = '0' + month;
    }

    return day + '-' + month + '-' + year;
  }

  // uploadExcelBulkAtt() {
  //   // console.log(this.excelToTableData);
  //   // console.log(this.excelBulkAttUploadArray);
  //   // console.log(this.filteredEmployees);
  //   // return;
  //   if (this.excelToTableData.length == 0) {
  //     this.toastr.error('No Data found to upload', 'Oops!');
  //     return;
  //   }
  //   for (let i = 0; i < this.excelToTableData.length; i++) {
  //     if (this.excelToTableData[i].rowColor == false) {
  //       this.toastr.error('Excel data is not in correct format', 'Oops!');
  //       return;
  //     }
  //   }

  //   let set = new Set();

  //   this.excelToTableData[0].attendanceDates.forEach((el: any) => {
  //     set.add(el.attendancedate.split('/')[1]);
  //   })
  //   // console.log(set.size);
  //   //return ;

  //   let excel_date_split = this.excelToTableData[0].attendanceDates[0].attendancedate.split('/');
  //   let month = this.month;
  //   if (month.length == 1) {
  //     month = '0' + month;
  //   }
  //   if (set.size != 2) {
  //     if (month != excel_date_split[1] || this.year != excel_date_split[2]) {
  //       this.toastr.error('Selected Month-Year not match with attendance excel file', 'Oops!');
  //       return;
  //     }
  //   }


  //   // console.log(this.excelBulkAttUploadArray);
  //   // return;

  //   // To append empLeaveBankId from employees data to Excel data
  //   this.excelBulkAttUploadArray.map((ob1: any, i1: any) => {
  //     let i2 = this.filteredEmployees.findIndex((ob2: any) => ob2.emp_code.toString() == ob1.EmpCode);
  //     let empLeaveBankId = this.filteredEmployees[i2]?.leave_bank_id != undefined && this.filteredEmployees[i2]?.leave_bank_id != null ? this.filteredEmployees[i2]?.leave_bank_id : '';
  //     this.excelBulkAttUploadArray[i1] = { ...this.excelBulkAttUploadArray[i1], ...{ empLeaveBankId: empLeaveBankId } }
  //     this.excelBulkAttUploadArray[i1] = { ...this.excelBulkAttUploadArray[i1], ...{ attendancePurpose: this.attendancePurpose } }

  //     let payout_with_attendance = !this.filteredEmployees[i2]?.payout_with_attendance ? '' : this.filteredEmployees[i2]?.payout_with_attendance;
  //     this.excelBulkAttUploadArray[i1] = { ...this.excelBulkAttUploadArray[i1], ...{ payout_with_attendance: payout_with_attendance } }
  //   })

  //   console.log('action', 'SaveBulkAttendance')
  //   console.log('bulk_att_data', this.excelBulkAttUploadArray)
  //   console.log('customeraccountid', this.tp_account_id.toString())
  //   console.log('productTypeId', this.product_type)
  //   return;

  //   this._attendanceService.save_excel_bulk_att({
  //     'action': 'SaveBulkAttendance',
  //     'bulk_att_data': this.excelBulkAttUploadArray,
  //     'customeraccountid': this.tp_account_id.toString(),
  //     'productTypeId': this.product_type,
  //   })
  //     .subscribe((resData: any) => {
  //       if (resData.statusCode) {
  //         this.toastr.success(resData.message, 'Success');
  //         // localStorage.setItem('attendanceSource', 'bulkexcel');
  //         this.attendanceSource = 'bulkexcel';
  //         this.att_file_upload();
  //         this.employer_details();
  //         this.excelToTableData = [];
  //         this.excelBulkAttUploadArray = [];
  //         this.attendanceFormat = 'bulkexcel_manual';
  //       } else {
  //         this.toastr.error(resData.message, 'Oops!');
  //       }
  //     })

  // }


  uploadExcelBulkAtt() {
    if (this.excelToTableData.length === 0) {
      this.toastr.error('No Data found to upload', 'Oops!');
      return;
    }

    for (let i = 0; i < this.excelToTableData.length; i++) {
      if (this.excelToTableData[i].rowColor === false) {
        this.toastr.error('Excel data is not in correct format', 'Oops!');
        return;
      }
    }

    const set = new Set();
    this.excelToTableData[0].attendanceDates.forEach((el: any) => {
      set.add(el.attendancedate.split('/')[1]);
    });

    const excel_date_split = this.excelToTableData[0].attendanceDates[0].attendancedate.split('/');
    let month = this.month;
    if (month.length === 1) {
      month = '0' + month;
    }
    if (set.size !== 2 && (month !== excel_date_split[1] || this.year !== excel_date_split[2])) {
      this.toastr.error('Selected Month-Year not match with attendance excel file', 'Oops!');
      return;
    }

    // Append empLeaveBankId and other fields to Excel data
    this.excelBulkAttUploadArray = this.excelBulkAttUploadArray.map((ob1: any) => {
      const i2 = this.filteredEmployees.findIndex((ob2: any) => ob2.emp_code.toString() === ob1.EmpCode);
      const empLeaveBankId = this.filteredEmployees[i2]?.leave_bank_id || '';
      const payout_with_attendance = this.filteredEmployees[i2]?.payout_with_attendance || '';
      return {
        ...ob1,
        empLeaveBankId,
        attendancePurpose: this.attendancePurpose,
        payout_with_attendance,
      };
    });

    // Chunk the data
    const chunkSize = 50; // Adjust chunk size as needed
    const chunks = [];
    for (let i = 0; i < this.excelBulkAttUploadArray.length; i += chunkSize) {
      chunks.push(this.excelBulkAttUploadArray.slice(i, i + chunkSize));
    }

    this.showSpinner = true;

    // Process chunks in parallel
    this.processChunksInParallel(chunks);
  }

  processChunksInParallel(chunks: any[], concurrencyLimit: number = 4) {
    const failedChunks: any[] = []; // To store failed chunks for retry or logging
    let activePromises: Promise<any>[] = []; // To track active uploads
    let currentIndex = 0; // To track the current chunk being processed

    const processNextChunk = () => {
      if (currentIndex >= chunks.length) {
        return Promise.resolve(); // No more chunks to process
      }

      const chunk = chunks[currentIndex];
      const index = currentIndex;
      currentIndex++;

      const uploadPromise = firstValueFrom(
        this._attendanceService.save_excel_bulk_att({
          action: 'SaveBulkAttendance',
          bulk_att_data: chunk,
          customeraccountid: this.tp_account_id.toString(),
          productTypeId: this.product_type,
        })
      )
        .then((resData: any) => {
          if (!resData.statusCode) {
            // If the chunk fails, add it to the failedChunks array
            failedChunks.push({ chunk, index, error: resData.message });
          }
        })
        .catch((error) => {
          // Handle API errors and add the chunk to the failedChunks array
          failedChunks.push({ chunk, index, error: error.message });
        })
        .finally(() => {
          // Remove the completed promise from activePromises
          activePromises = activePromises.filter((p) => p !== uploadPromise);
        });

      activePromises.push(uploadPromise);

      // Once a promise finishes, start the next chunk
      return uploadPromise.then(() => processNextChunk());
    };

    // Start processing up to the concurrency limit
    const initialPromises = Array.from({ length: concurrencyLimit }, () => processNextChunk());

    Promise.allSettled(initialPromises)
      .then(() => {
        const failedCount = failedChunks.length;

        if (failedCount == this.excelBulkAttUploadArray.length) {
          this.toastr.error('All records failed to upload.', 'Oops!');

        } else if (failedCount > 0) {
          this.toastr.error(`Some record(s) failed to upload.`, 'Oops!');
          console.error(`${failedCount} Failed Chunks:`, failedChunks); // Log failed chunks for debugging
          // Optionally retry failed chunks
          // this.retryFailedChunks(failedChunks);

        } else {
          this.toastr.success('All data uploaded successfully', 'Success');
          this.attendanceSource = 'bulkexcel';
          this.attendanceFormat = 'bulkexcel_manual';
          this.is_any_filter_triggered = true;
          this.att_file_upload();
          this.employer_details();
          this.excelToTableData = [];
          this.excelBulkAttUploadArray = [];

        }
      })
      .catch((error) => {
        this.toastr.error('An error occurred while uploading data', 'Oops!');
        console.error('Error during upload:', error);
      });
  }


  att_file_upload() {
    this._attendanceService.att_file_upload({
      'data': this.fileUpload_binarystr,
      'name': this.fileUpload_name,
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  checkEmployee(e: any, index: any) {

    if (this.getSelectedRecords() >= this.selection_limit && e.target.checked) {
      this.toastr.info('You can select only ' + this.selection_limit + ' employees at a time', 'Oops!');
      e.target.checked = false;
      this.filteredEmployees[index].localSelection = false;
      return;
    } else {
      this.filteredEmployees[index].localSelection = e.target.checked;
    }

    // console.log(e.target.checked);
  }

  getSelectedRecords() {
    let cnt = 0;
    this.filteredEmployees.map((el: any) => {
      if (el.localSelection == true) {
        cnt += 1;
      }
    })

    return cnt;
  }
  getApprovedRecords() {
    let cnt = 0;
    this.filteredEmployees.map((el: any) => {
      if (el?.monthly_att_approval_status == 'Y') {
        cnt += 1;
      }
    })

    return cnt;
  }

  checkEmployeeAll(e: any) {
    let first_n_cnt = 0;

    for (let i = 0; i < this.filteredEmployees.length; i++) {
      // if (first_n_cnt == 50) {
      if (first_n_cnt == this.selection_limit) {
        this.toastr.info('You can select only ' + this.selection_limit + ' employees at a time', 'Oops!');
        break;
      }

      if (this.filteredEmployees[i].monthly_att_approval_status == 'N' && (this.filteredEmployees[i].marked_attendance_paid_days) > 0 && this.filteredEmployees[i].lockstatus == 'Not Locked' && this.filteredEmployees[i].advicelockstatus == 'Unlocked' && this.filteredEmployees[i].payoutlockstatus == 'Unlocked') {
        first_n_cnt++;
        this.filteredEmployees[i].localSelection = e.target.checked;
      }
    }
    // this.filteredEmployees.map((el: any, i:any) => {
    //   if (el.monthly_att_approval_status != 'Y') {
    //     el.localSelection = e.target.checked;
    //   }
    // })
    // console.log(first_n_cnt);
    $('input[name="checkemp"]').slice(0, first_n_cnt).prop('checked', e.target.checked);

  }
  confirmAlertButton() {
    this.alertModalStatus = true;
  }
  closeAlertModal() {
    this.alertModalStatus = false;
  }
  save_approve_attendance() {
    // console.log(this.filteredEmployees);
    // return;
    let bulk_att_data = [];
    let checkSalaryConditonCount = 0;
    let checkSalaryConditonFlag = false;
    let actual_present_auto_days_flag = false;

    let mp_cnt = 0;
    let swl_cnt = 0;

    for (let i = 0; i < this.filteredEmployees.length; i++) {
      let temp = {};

      let leavetaken = parseFloat(this.filteredEmployees[i].marked_attendance_leave_taken);
      let paiddays = parseFloat(this.filteredEmployees[i].marked_attendance_paid_days);
      let salarydays = parseFloat(this.filteredEmployees[i].salarydays);
      let salary_days_opted = this.filteredEmployees[i].salary_days_opted;
      let actual_present_days = this.filteredEmployees[i].actual_present_days;
      let auto_mark_days = this.filteredEmployees[i].auto_mark_days;
      // console.log(this.filteredEmployees[i].emp_name,',',this.filteredEmployees[i].actual_present_days, '---', this.filteredEmployees[i].auto_mark_days);
      // console.log(this.filteredEmployees[i]);
      if (this.filteredEmployees[i].localSelection == false || this.filteredEmployees[i].localSelection == undefined) {
        continue;
      }

      if ((salarydays < 30 || salary_days_opted == 'Y') && salary_days_opted != null && salary_days_opted != undefined) {
        if ((paiddays + leavetaken) > salarydays) {
          checkSalaryConditonFlag = true;
          checkSalaryConditonCount++;
        }
      }

      if (actual_present_days < auto_mark_days) {
        actual_present_auto_days_flag = true;
        // console.log('harshhhhhhhh check');
      }
      let mp_type_check = false;
      let swl_type_check = false;

      if (this.filteredEmployees[i].swl_days > 0) {
        swl_type_check = true;
        swl_cnt = this.filteredEmployees[i].swl_days;
      }

      if (this.filteredEmployees[i].mispunch_days > 0) {
        mp_type_check = true;
        mp_cnt = this.filteredEmployees[i].mispunch_days;
      }

      // Removed on 14-May-2025
      // this.filteredEmployees[i].att_details.map((el2: any) => {
      //   if (el2.attendance_type != undefined) {
      //     // let dd = el2.attday <= 9 ? "0" + el2.attday : el2.attday;
      //     // let mm = el2.attmonth <= 9 ? "0" + el2.attmonth : el2.attmonth;
      //     // dated. 25.03.2025
      //     let dd = parseInt(el2.attday) <= 9 ? "0" + el2.attday : el2.attday;
      //     let mm = parseInt(el2.attmonth) <= 9 ? "0" + el2.attmonth : el2.attmonth;
      //     // end

      //     let yy = el2.attyear;
      //     let date = dd + '-' + mm + '-' + yy;
      //     let attendance_type = el2.attendance_type;

      //     temp[date] = attendance_type;
      //     if (attendance_type == 'MP') {
      //       mp_type_check = true;
      //       mp_cnt++;

      //     } else if (attendance_type == 'SWL') {
      //       swl_type_check = true;
      //       swl_cnt++;

      //     }
      //     // console.log(attendance_type)
      //   }
      // });


      // console.log(temp);
      // return;

      if (Object.keys(temp).length != 0 && !mp_type_check && !swl_type_check) {
        temp['EmpCode'] = this.filteredEmployees[i].emp_code.toString();
        temp['DOB'] = this.filteredEmployees[i].dateofbirth;
        temp['DOJ'] = this.filteredEmployees[i].dateofjoining;
        temp['Employee'] = this.filteredEmployees[i].emp_name;
        temp['Mobile'] = this.filteredEmployees[i].mobile;
        temp['OrgEmpCode'] = this.filteredEmployees[i].orgempcode;
        temp['payout_with_attendance'] = this.filteredEmployees[i]?.payout_with_attendance;
        temp['attendancePurpose'] = this.attendancePurpose;

        bulk_att_data.push(temp);
      }
    }
    // return;
    if (mp_cnt > 0) {
      this.toastr.info(`Please resolve there are ${mp_cnt} missing punch or deviation in attendance status`, 'Oops!');
      // return;

    }
    if (swl_cnt > 0) {
      this.toastr.info(`Please resolve there are ${swl_cnt} sandwich leave in attendance status`, 'Oops!');
      // return;

    }

    // console.log(bulk_att_data);
    // return;

    if (bulk_att_data.length == 0) {
      this.toastr.info('Please select at least one employee for Approval', 'Oops!');
      return;
    }

    // if (bulk_att_data.length > 50) {
    if (bulk_att_data.length > 200) {
      this.toastr.info('Maximum 200 employee(s) allowed for Approval. You have total selected :' + bulk_att_data.length, 'Oops!');
      return;
    }

    // console.log(bulk_att_data);
    // return;

    if (actual_present_auto_days_flag) {
      this.confirmationDialogService.confirm(GlobalConstants.mark_att_alert, 'Confirm').subscribe(result2 => {
        if (result2) {
          if (checkSalaryConditonFlag == false) {

            this._attendanceService.save_excel_bulk_att({
              'action': 'ApproveBulkAttendance',
              'bulk_att_data': bulk_att_data,
              'customeraccountid': this.tp_account_id.toString(),
              'productTypeId': this.product_type,
            })
              .subscribe((resData: any) => {
                if (resData.statusCode) {
                  this.toastr.success(resData.message, 'Success');
                  // localStorage.setItem('attendanceSource', 'bulkexcel');
                  this.attendanceSource = 'bulkexcel';
                  this.employer_details();
                  $('input[name="checkempAll"').prop('checked', false);
                  this.attendanceFormat = 'bulkexcel_manual';
                } else {
                  this.toastr.error(resData.message, 'Oops!');
                }
              });

          } else {
            this.confirmationDialogService.confirm('You are marking more paydays than the number of days set in the ' + checkSalaryConditonCount + ' employee(s) salary structure. If so, the additional day(s) salaries will be considered overtime. Are you sure?', 'Confirm').subscribe(result => {
              if (result) {
                this._attendanceService.save_excel_bulk_att({
                  'action': 'ApproveBulkAttendance',
                  'bulk_att_data': bulk_att_data,
                  'customeraccountid': this.tp_account_id.toString(),
                  'productTypeId': this.product_type,
                })
                  .subscribe((resData: any) => {
                    if (resData.statusCode) {
                      this.toastr.success(resData.message, 'Success');
                      // localStorage.setItem('attendanceSource', 'bulkexcel');
                      this.attendanceSource = 'bulkexcel';
                      this.employer_details();
                      $('input[name="checkempAll"').prop('checked', false);
                      this.attendanceFormat = 'bulkexcel_manual';
                    } else {
                      this.toastr.error(resData.message, 'Oops!');
                    }
                  })

              } else {
              }
            });
          }
        } else {
          return;
        }
      });

    } else {
      if (checkSalaryConditonFlag == false) {

        this._attendanceService.save_excel_bulk_att({
          'action': 'ApproveBulkAttendance',
          'bulk_att_data': bulk_att_data,
          'customeraccountid': this.tp_account_id.toString(),
          'productTypeId': this.product_type,
        })
          .subscribe((resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              // localStorage.setItem('attendanceSource', 'bulkexcel');
              this.attendanceSource = 'bulkexcel';
              this.employer_details();
              $('input[name="checkempAll"').prop('checked', false);
              this.attendanceFormat = 'bulkexcel_manual';
            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          });

      } else {
        this.confirmationDialogService.confirm('You are marking more paydays than the number of days set in the ' + checkSalaryConditonCount + ' employee(s) salary structure. If so, the additional day(s) salaries will be considered overtime. Are you sure?', 'Confirm').subscribe(result => {
          if (result) {
            this._attendanceService.save_excel_bulk_att({
              'action': 'ApproveBulkAttendance',
              'bulk_att_data': bulk_att_data,
              'customeraccountid': this.tp_account_id.toString(),
              'productTypeId': this.product_type,
            })
              .subscribe((resData: any) => {
                if (resData.statusCode) {
                  this.toastr.success(resData.message, 'Success');
                  // localStorage.setItem('attendanceSource', 'bulkexcel');
                  this.attendanceSource = 'bulkexcel';
                  this.employer_details();
                  $('input[name="checkempAll"').prop('checked', false);
                  this.attendanceFormat = 'bulkexcel_manual';
                } else {
                  this.toastr.error(resData.message, 'Oops!');
                }
              })

          } else {
          }
        });
      }
    }


  }


  save_approve_attendance_new() {
    this.is_any_filter_triggered = true;
    let attendanceDates = [];
    let empCodes = [];
    let checkSalaryConditonCount = 0;
    let checkSalaryConditonFlag = false;
    let actual_present_auto_days_flag = false;
    // this.showSpinner = true;

    let mp_cnt = 0;
    let swl_cnt = 0;

    for (let i = 0; i < this.filteredEmployees.length; i++) {
      const employee = this.filteredEmployees[i];

      if (employee.localSelection === false || employee.localSelection === undefined) {
        continue;
      }

      empCodes.push(employee.emp_code.toString());

      let leavetaken = parseFloat(employee.marked_attendance_leave_taken);
      let paiddays = parseFloat(employee.marked_attendance_paid_days);
      let salarydays = parseFloat(employee.salarydays);
      let salary_days_opted = employee.salary_days_opted;
      let actual_present_days = employee.actual_present_days;
      let auto_mark_days = employee.auto_mark_days;

      if ((salarydays < 30 || salary_days_opted === 'Y') && salary_days_opted != null && salary_days_opted !== undefined) {
        if ((paiddays + leavetaken) > salarydays) {
          checkSalaryConditonFlag = true;
          checkSalaryConditonCount++;
        }
      }

      if (actual_present_days < auto_mark_days) {
        actual_present_auto_days_flag = true;
      }

      let mp_type_check = false;
      let swl_type_check = false;

      if (this.filteredEmployees[i].swl_days > 0) {
        swl_type_check = true;
        swl_cnt = this.filteredEmployees[i].swl_days;
      }

      if (this.filteredEmployees[i].mispunch_days > 0) {
        mp_type_check = true;
        mp_cnt = this.filteredEmployees[i].mispunch_days;
      }


      // Removed on 14-May-2025
      // employee.att_details.map((el2: any) => {
      //   if (el2.attendance_type === 'MP') {
      //     mp_type_check = true;
      //     mp_cnt++;
      //   } else if (el2.attendance_type === 'SWL') {
      //     swl_type_check = true;
      //     swl_cnt++;
      //   }
      // });

      if (mp_type_check || swl_type_check) {
        continue;
      }
    }

    if (mp_cnt > 0) {
      this.toastr.info(`Please resolve there are ${mp_cnt} missing punch or deviation in attendance status`, 'Oops!');
      return;
    }

    if (swl_cnt > 0) {
      this.toastr.info(`Please resolve there are ${swl_cnt} sandwich leave in attendance status`, 'Oops!');
      return;
    }

    if (empCodes.length === 0) {
      this.toastr.info('Please select at least one employee for Approval', 'Oops!');
      return;
    }

    if (empCodes.length > 200) {
      this.toastr.info('Maximum 200 employee(s) allowed for Approval. You have total selected: ' + empCodes.length, 'Oops!');
      return;
    }

    // Prepare attendanceDates object
    attendanceDates.push({
      empCode: empCodes.join(','), // Comma-separated empCodes
      month: this.month,
      year: this.year,
    });

    if (actual_present_auto_days_flag) {
      this.confirmationDialogService.confirm(GlobalConstants.mark_att_alert, 'Confirm').subscribe(result2 => {
        if (result2) {
          this.submitAttendanceDates(attendanceDates, checkSalaryConditonFlag, checkSalaryConditonCount);
        } else {
          return;
        }
      });
    } else {
      this.submitAttendanceDates(attendanceDates, checkSalaryConditonFlag, checkSalaryConditonCount);
    }
  }

  submitAttendanceDates(attendanceDates: any, checkSalaryConditonFlag: boolean, checkSalaryConditonCount: number) {
    if (!checkSalaryConditonFlag) {
      this._attendanceService.save_excel_bulk_att_new({
        // action: 'ApproveBulkAttendanceFromExcel',
        action: 'ApproveBulkAttendanceFromExcel_New',
        attendanceDates: attendanceDates,
        customeraccountid: this.tp_account_id.toString(),
        productTypeId: this.product_type,
        attendancePurpose: this.attendancePurpose,
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          let msg = '';
          for (let i = 0; i < JSON.parse(resData.commonData).length; i++) {
            msg += JSON.parse(resData.commonData)[i].message
          }
          this.toastr.success(msg, 'Success');
          // [{\"message\": \"41 Record(s) Approved.\"}, {\"message\": \"4 Record(s) not approved due to advance attendance already exists.\"}]
          // this.attendanceSource = 'bulkexcel';
          this.employer_details();
          $('input[name="checkempAll"]').prop('checked', false);
          // this.attendanceFormat = 'bulkexcel_manual';
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      });
    } else {
      this.confirmationDialogService.confirm(
        `You are marking more paydays than the number of days set in the ${checkSalaryConditonCount} employee(s) salary structure. If so, the additional day(s) salaries will be considered overtime. Are you sure?`,
        'Confirm'
      ).subscribe(result => {
        if (result) {
          this._attendanceService.save_excel_bulk_att_new({
            // action: 'ApproveBulkAttendanceFromExcel',
            action: 'ApproveBulkAttendanceFromExcel_New',
            attendanceDates: attendanceDates,
            customeraccountid: this.tp_account_id.toString(),
            productTypeId: this.product_type,
            attendancePurpose: this.attendancePurpose,
          }).subscribe((resData: any) => {
            if (resData.statusCode) {
              let msg = '';
              for (let i = 0; i < JSON.parse(resData.commonData).length; i++) {
                msg += JSON.parse(resData.commonData)[i].message
              }
              this.toastr.success(msg, 'Success');
              // this.attendanceSource = 'bulkexcel';
              this.employer_details();
              $('input[name="checkempAll"]').prop('checked', false);
              // this.attendanceFormat = 'bulkexcel_manual';
            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          });
        }
      });
    }
  }

  /***Excel Bulk Att Upload***/


  /***Update Att Calendar***/
  openAttCalendar(index: any, data: any, emp_code: any, emp_name: any, dateofbirth: any, mobile: any, leave_bank_id: any, payout_with_attendance: any) {
    this.showAttCalendarPopup = true;
    let date = data.attday + '/' + data.attmonth + '/' + data.attyear;
    let attendancetype = data.attendance_type != undefined ? data.attendance_type : '';
    let leavetype = data.leavetype != undefined ? data.leavetype : '';

    this.attCalendarForm.patchValue({
      emp_code: emp_code,
      emp_name: emp_name,
      dateofbirth: dateofbirth,
      mobile: mobile,
      attendancedate: date,
      attendancetype: attendancetype,
      leave_bank_id: leave_bank_id,
      leavetype: leavetype,

      emp_index: index,
      payout_with_attendance: payout_with_attendance,
    })

  }

  closeAttCalendar() {
    this.showAttCalendarPopup = false;
    $('input[name="leave_options"]').prop("checked", false);
    this.attCalendarForm.patchValue({
      emp_code: '',
      emp_name: '',
      dateofbirth: '',
      mobile: '',
      attendancedate: '',
      attendancetype: '',
      leave_bank_id: '',
      leavetype: '',

      emp_index: '',
      payout_with_attendance: '',
    })
  }

  changeAttType(attendancetype: any) {
    //   if (attendancetype=='CO') {
    //     this.attCalendarForm.patchValue({
    //       attendancetype: 'LL',
    //       leavetype: attendancetype,
    //     })
    //   } else {
    this.attCalendarForm.patchValue({
      attendancetype: attendancetype,
      leavetype: '',
    })
    // }
  }

  changeLeaveType(e: any, prev_bal: any) {
    // To check the leave balance when applying for leave

    // Start Min Paid Days Condition - 15 July 2024
    let idxx = this.attCalendarForm.value.emp_index;
    let paiddays = parseFloat(this.filteredEmployees[idxx].marked_attendance_paid_days);
    let balance_txt = !this.filteredEmployees[idxx]?.balance_txt ? 0 : this.filteredEmployees[idxx]?.balance_txt;
    if (balance_txt == 0) {
      this.toastr.error('Low Leave Balance', 'Oops!');
      return;
    } else {
      let effective_min_paid_days = !balance_txt[0].effective_min_paid_days ? 0 : balance_txt[0].effective_min_paid_days;
      if (paiddays < effective_min_paid_days
        && effective_min_paid_days != 0
        && effective_min_paid_days != undefined
      ) {
        this.toastr.error('Minimum paid days ' + effective_min_paid_days + ' required to take this leave', 'Oops!');
        return;
      }
    }
    // END

    if (e.target.value != 'AA' && e.target.value != 'CO' && prev_bal == 0) {
      this.toastr.error('Insufficient Leave Balance', 'Oops!');
      $('input[name="leave_options"]').prop("checked", false);
      this.attCalendarForm.patchValue({
        attendancetype: '',
        leavetype: '',
      })
      return;

    } else if (e.target.value == 'AA') {
      this.attCalendarForm.patchValue({
        leavetype: '',
      })
    } else if (e.target.value == 'CO') {
      if (prev_bal == 0) {
        this.toastr.error('Insufficient Compensatory Off Balance', 'Oops!');
        $('input[name="leave_options"]').prop("checked", false);
        this.attCalendarForm.patchValue({
          leavetype: '',
        })
        return;
      }
      // console.log(this.attCalendarForm.value);
      // return;

      let emp_index = this.attCalendarForm.value.emp_index;
      // console.log(this.filteredEmployees[emp_index]);

      if (this.filteredEmployees[emp_index].comp_off_txt?.comp_off_applicable_type == 'All') {
        this.attCalendarForm.patchValue({
          leavetype: e.target.value,
        })
        return;
      }
      let comp_off_applicable_dayname = JSON.parse(this.filteredEmployees[emp_index]?.comp_off_txt)?.comp_off_applicable_dayname;
      let comp_off_days_split = comp_off_applicable_dayname.split(',')
      //console.log(comp_off_days_split);

      let split_dt = this.attCalendarForm.value.attendancedate.split('/').reverse().join('-');
      let temp_dt = new Date(split_dt);
      let dayname = temp_dt.toLocaleDateString('en-US', { weekday: 'long' });

      let idx = comp_off_days_split.findIndex((e2: any) => e2 == dayname);

      if (idx == -1) {
        this.toastr.error('Compensatory off applicable days are ' + comp_off_applicable_dayname, 'Oops!');
        $('input[name="leave_options"]').prop("checked", false);
        this.attCalendarForm.patchValue({
          leavetype: '',
        })
        return;
      }

      this.attCalendarForm.patchValue({
        leavetype: e.target.value,
      })
      // console.log(prev_bal);
    }
    else {
      this.attCalendarForm.patchValue({
        leavetype: e.target.value,
      })

    }
  }

  changeLeaveHalfFullDay(e: any) {
    this.attCalendarForm.patchValue({
      attendancetype: e.target.value,
    })

    // console.log(this.markLeaveForm.value);
  }

  updateAttendance() {
    let data = this.attCalendarForm.value;
    if (data.attendancetype == '') {
      this.toastr.error('Please choose an attendance type', 'Oops!');
      return;
    }

    if ((data.attendancetype == 'LL' || data.attendancetype == 'HL') && data.leavetype == '') {
      this.toastr.error('Please choose a leave type', 'Oops!');
      return;
    }

    let postdata = {};
    postdata['actionType'] = 'SaveBulkAttendance';
    postdata['emp_code'] = data.mobile + 'CJHUB' + data.emp_code + 'CJHUB' + data.dateofbirth;
    postdata['markedByUserType'] = 'Employer';
    postdata['attendanceDates'] = [];
    postdata['productTypeId'] = this.product_type;
    postdata['customeraccountid'] = this.tp_account_id.toString();
    postdata['empLeaveBankId'] = data.leave_bank_id;
    postdata['payout_with_attendance'] = !data.payout_with_attendance ? '' : data.payout_with_attendance;
    postdata['attendancePurpose'] = this.attendancePurpose;

    let regex = /^[1-9]$/;
    let temp = data.attendancedate.split('/');
    let dd = temp[0].match(regex) ? '0' + temp[0] : temp[0];
    let mm = temp[1].match(regex) ? '0' + temp[1] : temp[1];
    let date = dd + '/' + mm + '/' + temp[2];

    if (data.attendancetype == 'LL' || data.attendancetype == 'HL' || data.attendancetype == 'HD') {
      postdata['attendanceDates'].push({
        'attendancedate': date,
        'attendancetype': data.attendancetype,
        'leavetype': data.leavetype,
      });
    } else {
      postdata['attendanceDates'].push({
        'attendancedate': date,
        'attendancetype': data.attendancetype,
      });
    }

    let index = this.filteredEmployees.findIndex(ob1 => ob1.emp_code == data.emp_code);
    this.filteredEmployees[index]?.att_details.map(el => {
      if (el.attendance_type != undefined && el.attendance_type != '' && el.attday != temp[0]) {
        let day = el.attday.toString().match(regex) ? '0' + el.attday : el.attday;
        // let mm = this.month.toString().match(regex) ? '0' + this.month : this.month;
        let mm = el.attmonth.toString().match(regex) ? '0' + el.attmonth : el.attmonth;
        let x;

        if (el.attendance_type == 'LL' || el.attendance_type == 'HL' || el.attendance_type == 'HD') {
          x = {
            "attendancedate": day + '/' + mm + '/' + el.attyear,
            "attendancetype": el.attendance_type,
            "leavetype": el.leavetype != undefined && el.leavetype != null ? el.leavetype : '',
          }
        } else {
          x = {
            "attendancedate": day + '/' + mm + '/' + el.attyear,
            "attendancetype": el.attendance_type,
          }
        }

        postdata['attendanceDates'].push(x);
      }
    })


    // console.log(postdata);
    // console.log(this.filteredEmployees[index]);
    // return;

    let checkSalaryConditonFlag = false;
    let leavetaken = parseFloat(this.filteredEmployees[index].marked_attendance_leave_taken);
    let paiddays = parseFloat(this.filteredEmployees[index].marked_attendance_paid_days);
    let salarydays = parseFloat(this.filteredEmployees[index].salarydays);
    let salary_days_opted = this.filteredEmployees[index].salary_days_opted;

    let local_marking_days = 0;
    if (data.attendancetype == 'PP' || data.attendancetype == 'HO' || data.attendancetype == 'WO' || data.attendancetype == 'LL' || data.attendancetype == 'WFH' || data.attendancetype == 'OD' || data.attendancetype == 'TR' || data.attendancetype == 'ASL') {
      local_marking_days = 1;
    } else if (data.attendancetype == 'HD' || data.attendancetype == 'HL') {
      local_marking_days = 0.5;
    }

    if (salarydays < 30 || salary_days_opted == 'Y') {
      if ((local_marking_days + paiddays + leavetaken) > salarydays) {
        checkSalaryConditonFlag = true;
      }
    }

    if (checkSalaryConditonFlag == false) {

      this._attendanceService.save_monthly_attendance(postdata)
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            // localStorage.setItem('attendanceSource', 'all');
            this.attendanceSource = 'all';
            this.attendanceFormat = 'manually';
            this.closeAttCalendar();
            this.employer_details();
            this.searchKey = '';
            this.toastr.success(resData.message, 'Success');

          } else {
            this.toastr.error(resData.message, 'Oops!');
          }
        })

    } else {
      this.confirmationDialogService.confirm(GlobalConstants.show_man_days_msg, 'Confirm').subscribe(result => {
        if (result) {
          this._attendanceService.save_monthly_attendance(postdata)
            .subscribe((resData: any) => {
              if (resData.statusCode) {
                // localStorage.setItem('attendanceSource', 'all');
                this.attendanceSource = 'all';
                this.attendanceFormat = 'manually';
                this.closeAttCalendar();
                this.employer_details();
                this.searchKey = '';
                this.toastr.success(resData.message, 'Success');

              } else {
                this.toastr.error(resData.message, 'Oops!');
              }
            })

        } else {
        }
      });
    }
  }
  /***Update Att Calendar***/


  /***Allowance & Deduction***/
  openAllowDeductPopup(emp_code: any, emp_name: any, voucherdetails: any) {
    this.voucherdetails_split = voucherdetails != null ? voucherdetails.split('<br/>') : '';
    // console.log(this.voucherdetails_split);
    this.showAllowDeductPopup = true;
    this.allowanceDeductForm.patchValue({
      emp_code: emp_code,
      emp_name: emp_name,
    })

    // console.log(this.filteredEmployees);
    // console.log(this.allowanceDeductForm.value);

  }

  closeAllowanceDeductPopup() {
    this.showAllowDeductPopup = false;
    this.allowanceDeductForm.patchValue({
      emp_code: '',
      emp_name: '',
      type: '',
      value: '',
      remarks: '',
    })
  }

  allowDeductChange(type: any) {
    let data;
    let value = '';
    let remarks = '';
    // console.log('type',type);

    if (this.voucherdetails_split != '') {
      for (let i = 0; i < this.voucherdetails_split.length; i++) {
        let x = this.voucherdetails_split[i].split(':')[0];
        if (x.toLowerCase() == type) {
          data = this.voucherdetails_split[i].split(':');
        }
        // console.log(x);
      }
    }

    if (data != undefined && data.length > 0) {
      value = data[1];
      remarks = data.length == 3 ? data[2] : '';
    }

    // console.log(data);

    this.allowanceDeductForm.patchValue({
      type: type,
      value: value,
      remarks: remarks,
    });

    //patch value & remarks from Voucher Details...
    // console.log(this.allowanceDeductForm.value);
    // console.log(this.filteredEmployees);
  }

  saveAllowDeduct() {
    // console.log(this.allowanceDeductForm.value);
    let data = this.allowanceDeductForm.value;
    // console.log(data);

    // if (this.ad['type'].value == 'adv_salary') {
    //   if (this.allowanceDeductForm.valid) {
    //     this._attendanceService.checkAdvanceForAssociate({
    //       'customerAccountId': this.tp_account_id.toString(),
    //       'empCode': data.emp_code.toString(),
    //       'AdvanceHeadId': this.advance_headid,
    //       'amount': data.value,
    //       'productTypeId': this.product_type.toString(),

    //     }).subscribe((resData: any) => {
    //       if (resData.statusCode) {
    //         this.closeAllowanceDeductPopup();
    //         this.toastr.success(resData.message, 'Success');
    //       } else {
    //         this.toastr.error(resData.message, 'Oops!');
    //       }
    //     })

    //   } else {
    //     this.toastr.error('Please fill the required fields', 'Oops!');
    //   }

    // } else

    if (this.ad.type.value == 'overtime') {
      this.saveTpVoucher(this.overtime_headid);

    } else if (this.ad.type.value == 'allowance') {
      this.saveTpVoucher(this.allowance_headid);

    } else if (this.ad.type.value == 'deduction') {
      this.saveTpVoucher(this.deduction_headid);
    } // added on 16/05/2024

    else if (this.ad.type.value == 'travel allowance') {
      this.saveTpVoucher(this.travel_allowance);

    } else if (this.ad.type.value == 'daily allowance') {
      this.saveTpVoucher(this.daily_allowance);
    }

    // end on 16/05/2024
    // console.log(this.ad.type.value);


  }

  saveTpVoucher(voucherHeadId: any) {
    let data = this.allowanceDeductForm.value;

    if (this.allowanceDeductForm.valid) {
      this._attendanceService.saveTpVoucher({
        'customerAccountId': this.tp_account_id.toString(),
        'empCode': data.emp_code.toString(),
        'voucherHeadId': voucherHeadId,
        'voucherAmount': data.value,
        'voucherMonth': this.month,
        'voucherYear': this.year,
        'voucherRemarks': data.remarks,
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
      this.toastr.error('Please complete the required fields', 'Oops!');
    }
  }

  /***Allowance & Deduction***/

  clear_file() {
    const fileInput = document.getElementById("attendnace_excel") as HTMLInputElement;
    fileInput.value = '';
    this.excelBulkAttUploadArray = [];
    this.excelToTableData = [];
  }

  // calculate_day(dd: any) {
  //   var daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  //   var myDate = new Date(this.year, (this.month - 1), dd);
  //   var dayNumber = myDate.getDay();

  //   var dayName = daysOfWeek[dayNumber];
  //   return dayName;
  // }

  get_month_dates_days() {
    this.is_any_filter_triggered = true;
    this.showSpinner = true;

    this._attendanceService.get_month_dates_days({
      'employer_id': this.decoded_token.id, 'month': this.month,
      'year': this.year
    }).subscribe((resData: any) => {
      if (resData.status) {
        this.payout_period = resData.commonData[0].payout_period;
        this.is_bypass_future_dt = resData.commonData[0].is_bypass_future_dt;
        this.month_days_master = resData.commonData;
        this.days_count = this.month_days_master.length;

        let date = this.month_days_master[this.days_count - 1].day_cnt + '-' + this.month + '-' + this.year;
        this.selected_date = date;
        localStorage.setItem('selected_date', date);

        this.employer_details();

      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }

  showTaxble(val: any) {
    const idx = this.LedgerMasterHeads_head.findIndex((item1: any) => item1.voucher_name === val)
    // console.log('hh',this.LedgerMasterHeads_head)
    let result = '';
    if (idx != -1) {
      let is_taxable = this.LedgerMasterHeads_head[idx].is_taxable;

      result = is_taxable == 1 ? '(ESIC Applicable)' : '(ESIC Not Applicable)';
      // console.log(result);
    }
    return result;
  }

  go_to_upload_allowance() {
    //, { state: { 'page': 'welcome' }
    this.router.navigate(['/attendance/bulk-deduction']);
  }

  // clearLocalStorage() {
  //   localStorage.removeItem('attendanceSource');
  //   this.attendanceSource = 'all';
  //   this.attendanceFormat = 'manually';
  //   this.employer_details();
  // }

  // getLocalStorage() {
  //   let att_source = localStorage.getItem('attendanceSource');
  //   if (att_source == 'bulkexcel') {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  change_att_format(val: any) {
    console.log(this.attendanceFormat);
    if (this.attendanceFormat == 'excel') {
      this.is_any_filter_triggered = true;
      this.showSpinner = true;
      this.employer_details();
    } else {
      this.emp_json_data = [];
      this.filteredEmployees = [];
    }
    this.attendanceSource = val;
  }

  is_comp_off_applicable(comp_off_txt: any) {
    let comp_off_applicable = !comp_off_txt ? '' : JSON.parse(comp_off_txt)?.is_comp_off_applicable;

    if (comp_off_applicable && comp_off_applicable == 'Y') {
      return true;
    } else {
      return false;
    }
  }

  get_tot_co_bal(comp_off_txt) {
    let tot_co_bal = !comp_off_txt ? '' : JSON.parse(comp_off_txt)?.tot_co_bal;

    if (tot_co_bal) {
      return tot_co_bal;
    } else {
      return '';
    }
  }

  ngOnDestroy() {
    // localStorage.removeItem('attendanceSource');
  }

  check_access_right_cdn() {
    if (this.decoded_token?.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
      return false;
    } else {
      return true;
    }
  }


  openSidebar() {
    this.searchKey_copy = this.searchKey;
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
    this.month_copy = this.month;
    this.year_copy = this.year;
    // this.deptName = [];
    // this.desgName = [];
    // this.orgName = [];
    this.deptName_copy = [];
    this.desgName_copy = [];
    this.orgName_copy = [];
    this.searchKey_copy = '';
    this.searchKey = '';
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
    this.is_any_filter_triggered = true;
    this.change_sidebar_filter_flag = true;
    this.searchKey = this.searchKey_copy;
    this.month = this.month_copy;
    this.year = this.year_copy;

    this.days_count = new Date(this.year_copy, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;

    this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
      arr[i].showCalendar = false;
    });

    this.filter_emp_val = this.filter_emp_val_copy;
    this.desgName = this.desgName_copy;
    this.orgName = this.orgName_copy;
    this.deptName = this.deptName_copy;
    this.p = 1;

    // console.log(this.desgName);
    // console.log(this.deptName);

    this.get_month_dates_days();

  }

  change_sidebar_filter_page() {
    this.change_sidebar_filter_flag = true;
    this.searchKey = this.searchKey_copy;
    // this.month = this.month_copy;
    // this.year = this.year_copy;

    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;

    this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
      arr[i].showCalendar = false;
    });

    this.filter_emp_val = this.filter_emp_val_copy;
    this.desgName = this.desgName_copy;
    this.orgName = this.orgName_copy;
    this.deptName = this.deptName_copy;
    this.p = 1;

    // console.log(this.desgName);
    // console.log(this.deptName);

    // this.get_month_dates_days();

  }

  change_att_purpose(val: any) {
    // this.employer_details();
    this.is_any_filter_triggered = true;

    if (this.attendanceFormat == 'excel') {
      this.emp_json_data = [];
      this.filteredEmployees = [];
      this.showSpinner = true;
      this.employer_details();
    } else {
      this.emp_json_data = [];
      this.filteredEmployees = [];
    }
  }

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
        // console.log(e);
      }
    })
  }

  // getEmployerMonthAttendance_for_excel_2() {
  //   this._attendanceService.getEmployerMonthAttendance_for_excel({
  //     customerAccountId: this.tp_account_id.toString(),
  //     month: this.month,
  //     year: this.year,
  //     'GeoFenceId': this.decoded_token.geo_location_id,
  //     attendanceSource: 'all',
  //     productTypeId: this.product_type,
  //     action: 'GetEmployermonthAttendanceForExcel_bulk',
  //     postOffered: this.desgName,
  //     postingDepartment: this.deptName,
  //     unitParameterName: this.orgName,
  //     searchKeyword: this.searchKey,
  //     attendancePurpose: this.attendancePurpose,

  //   }).subscribe((resData: any) => {

  //     this.emp_json_data.map((el: any, i: any) => {
  //       el['present_days'] = 0.0;
  //       el['leave_days'] = 0.0;
  //       el['absent_days'] = 0.0;
  //       el['auto_mark_days'] = 0.0;
  //       el['actual_present_days'] = 0.0;
  //     })
  //     this.filteredEmployees = this.deepCopyArray(this.emp_json_data);
  //     this.showSpinner = false;

  //     if (resData.statusCode) {
  //       this.getEmployerMonthAttData = resData.commonData;
  //       // console.log(this.getEmployerMonthAttData);
  //       // console.log(this.filteredEmployees);

  //       this.getEmployerMonthAttData.forEach(obj1 => {
  //         let empIndex = this.filteredEmployees.findIndex(obj2 => obj1.emp_code == obj2.emp_code);

  //         if (empIndex != -1) {
  //           const employee = this.filteredEmployees[empIndex];
  //           // console.log(employee);

  //           for (let day = 1; day <= 31; day++) {
  //             const dayKey = `day${day}`;
  //             let temp = obj1[dayKey];
  //             let attType = temp.split('-')[0];
  //             let leaveType = temp.includes('-') ? temp.split('-')[1] : '';

  //             // console.log(attType);

  //             if (attType && employee.att_details) {
  //               // console.log('hi')
  //               const detailIndex = employee.att_details.findIndex(detail => detail.attday == day);

  //               if (detailIndex != -1) {
  //                 employee.att_details[detailIndex].attendance_type = attType;
  //                 employee.att_details[detailIndex].leaveType = leaveType;
  //                 employee.att_details[detailIndex].approval_status = obj1.approval_status;

  //                 //present & leave days
  //                 if (attType == 'PP' || attType == 'HO' || attType == 'WO' || attType == 'WFH' || attType == 'OD' || attType == 'TR' || attType == 'ASL') {
  //                   this.filteredEmployees[empIndex].present_days += 1.0;
  //                 } else if (attType == 'HD') {
  //                   this.filteredEmployees[empIndex].present_days += 0.5;
  //                 } else if (attType == 'LL') {
  //                   this.filteredEmployees[empIndex].leave_days += 1.0;
  //                 } else if (attType == 'AA' || attType == 'LWP') {
  //                   this.filteredEmployees[empIndex].absent_days += 1.0;
  //                 }

  //                 if (attType == 'HO' || attType == 'WO') {
  //                   this.filteredEmployees[empIndex].auto_mark_days += 1.0;
  //                 } else if (attType == 'PP' || attType == 'OD' || attType == 'WFH' || attType == 'TR' || attType == 'ASL') {
  //                   this.filteredEmployees[empIndex].actual_present_days += 1.0;
  //                 } else if (attType == 'HD') {
  //                   this.filteredEmployees[empIndex].actual_present_days += 0.5;
  //                 }
  //               }
  //             }
  //           }


  //         }
  //       });


  //       this.emp_json_data = this.deepCopyArray(this.filteredEmployees);
  //       console.log(this.emp_json_data)
  //       this.filter_emp(this.filter_emp_val)

  //     } else {
  //       this.getEmployerMonthAttData = [];
  //       this.toastr.error(resData.message, 'Oops!');
  //     }
  //   })
  // }


  // employer_details() {
  //   if (this.is_any_filter_triggered == false) {
  //     this.showSpinner = false;
  //     return;
  //   } else {
  //     this.is_any_filter_triggered = false;
  //   }

  //   this.showSpinner = true;

  //   const employerDetails$ = this._attendanceService.get_employer_today_attendance({
  //     customeraccountid: this.tp_account_id,
  //     productTypeId: this.product_type,
  //     att_date: this.selected_date,
  //     emp_name: this.searchKey,
  //     approval_status: '',
  //     status: this.filter_emp_val,
  //     pageNo: 1,
  //     pageLimit: 5000,
  //     GeoFenceId: this.decoded_token.geo_location_id,
  //     attendanceSource: this.attendanceSource,
  //     postOffered: this.desgName,
  //     postingDepartment: this.deptName,
  //     unitParameterName: this.orgName,
  //     attendancePurpose: this.attendancePurpose,
  //   });

  //   // Conditionally call the second API
  //   console.log(this.attendanceFormat);
  //   const attendanceForExcel$ = this.attendanceFormat !== 'excel'
  //     ? this._attendanceService.getEmployerMonthAttendance_for_excel({
  //       customerAccountId: this.tp_account_id.toString(),
  //       month: this.month,
  //       year: this.year,
  //       GeoFenceId: this.decoded_token.geo_location_id,
  //       attendanceSource: this.attendanceSource,
  //       productTypeId: this.product_type,
  //       action: 'GetEmployermonthAttendanceForExcel_bulk',
  //       postOffered: this.desgName,
  //       postingDepartment: this.deptName,
  //       unitParameterName: this.orgName,
  //       searchKeyword: this.searchKey,
  //       attendancePurpose: this.attendancePurpose,
  //     })
  //     : of(null); // Return an empty observable if the condition is not met

  //   forkJoin({ employerDetails: employerDetails$, attendanceForExcel: attendanceForExcel$ }).subscribe({
  //     next: ({ employerDetails, attendanceForExcel }) => {
  //       // Process the first API response
  //       if ((employerDetails as any).statusCode) {
  //         const decrypted_emp_json_data = (employerDetails as any).commonData;
  //         this.LedgerMasterHeads_head = decrypted_emp_json_data.data.LedgerMasterHeads;

  //         this.overtime_headid = this.LedgerMasterHeads_head.find(obj => obj.voucher_name === 'Overtime')?.headid || '';
  //         this.allowance_headid = this.LedgerMasterHeads_head.find(obj => obj.voucher_name === 'Allowance')?.headid || '';
  //         this.deduction_headid = this.LedgerMasterHeads_head.find(obj => obj.voucher_name === 'Deduction')?.headid || '';
  //         this.travel_allowance = this.LedgerMasterHeads_head.find(obj => obj.voucher_name === 'Travel Allowance')?.headid || '';
  //         this.daily_allowance = this.LedgerMasterHeads_head.find(obj => obj.voucher_name === 'Daily Allowance')?.headid || '';

  //         this.emp_json_data = decrypted_emp_json_data.data.attendancedetail.filter((el: any) => el.time_criteria === 'Full Time');

  //         let temp_arr = this.generateArrayOfObjects();
  //         // 'attday': i, 'attendance_type': 'HO'
  //         // let date = new Date(split_d[2], (split_d[1] - 1), split_d[0]);

  //         //setting att_details property
  //         this.emp_json_data.map((el: any, i: any) => {
  //           let holiday_days = 0.0;
  //           // temp_arr.map((ta:any) => {
  //           //   let date = new Date(this.year, this.month, ta.attday);
  //           //   if (ta.attendance_type == 'HO' && date <= el.dateofrelieveing && date >= el.dateofjoining) {
  //           //     holiday_days += 1;
  //           //   }

  //           // })
  //           el['photopath'] = ((el['photopath'] != null && el['photopath']
  //             != 'https://api.contract-jobs.com/crm_api/') ? el['photopath'] : '');
  //           // (el.photopath == '' ? '' : el.photopath);
  //           el['att_details'] = temp_arr;
  //           el['present_days'] = holiday_days;
  //           el['present_days'] = 0.0;
  //           el['leave_days'] = 0.0;
  //           el['absent_days'] = 0.0;
  //           el['auto_mark_days'] = 0.0;
  //           el['actual_present_days'] = 0.0;

  //           el['template_txt'] = el['template_txt'] != null ? JSON.parse(el['template_txt']) : '';
  //           // el['balance_txt'] = JSON.parse(el['balance_txt']);
  //           el['balance_txt'] = el['balance_txt'] != null ? JSON.parse(el['balance_txt']) : '';
  //         })
  //         this.filteredEmployees = this.deepCopyArray(this.emp_json_data);

  //         if (this.filteredEmployees.length > 0) {
  //           this.is_payout_with_attendance = this.filteredEmployees[0]?.payout_with_attendance;
  //         }


  //         if (this.attendanceFormat == 'excel') {
  //           this.showSpinner = false;
  //         }
  //         if (this.change_sidebar_filter_flag) {
  //           this.closeSidebar();
  //         }

  //       } else {
  //         this.emp_json_data = [];
  //         this.showSpinner = false;
  //         this.filteredEmployees = [];
  //         this.toastr.error((employerDetails as any).message, 'Oops!');
  //       }

  //       // Process the second API response if it was called
  //       if (attendanceForExcel && (attendanceForExcel as any).statusCode) {
  //         this.getEmployerMonthAttData = (attendanceForExcel as any).commonData;

  //         this.getEmployerMonthAttData.forEach(obj1 => {
  //           const empIndex = this.filteredEmployees.findIndex(obj2 => obj1.emp_code === obj2.emp_code);

  //           if (empIndex !== -1) {
  //             const employee = this.filteredEmployees[empIndex];

  //             for (let day = 1; day <= 31; day++) {
  //               const dayKey = `day${day}`;
  //               const temp = obj1[dayKey];
  //               const attType = temp.split('-')[0];
  //               const leaveType = temp.includes('-') ? temp.split('-')[1] : '';

  //               if (attType && employee.att_details) {
  //                 const detailIndex = employee.att_details.findIndex(detail => detail.attday == day);

  //                 if (detailIndex !== -1) {
  //                   employee.att_details[detailIndex].attendance_type = attType;
  //                   employee.att_details[detailIndex].leaveType = leaveType;
  //                   employee.att_details[detailIndex].approval_status = obj1.approval_status;

  //                   // Update present, leave, and absent days
  //                   if (['PP', 'HO', 'WO', 'WFH', 'OD', 'TR', 'ASL'].includes(attType)) {
  //                     this.filteredEmployees[empIndex].present_days += 1.0;
  //                   } else if (attType === 'HD') {
  //                     this.filteredEmployees[empIndex].present_days += 0.5;
  //                   } else if (attType === 'LL') {
  //                     this.filteredEmployees[empIndex].leave_days += 1.0;
  //                   } else if (['AA', 'LWP'].includes(attType)) {
  //                     this.filteredEmployees[empIndex].absent_days += 1.0;
  //                   }

  //                   if (['HO', 'WO'].includes(attType)) {
  //                     this.filteredEmployees[empIndex].auto_mark_days += 1.0;
  //                   } else if (['PP', 'OD', 'WFH', 'TR', 'ASL'].includes(attType)) {
  //                     this.filteredEmployees[empIndex].actual_present_days += 1.0;
  //                   } else if (attType === 'HD') {
  //                     this.filteredEmployees[empIndex].actual_present_days += 0.5;
  //                   }
  //                 }
  //               }
  //             }
  //           }
  //         });

  //         this.showSpinner = false;

  //         this.emp_json_data = this.deepCopyArray(this.filteredEmployees);
  //         this.filter_emp(this.filter_emp_val);
  //       } else if (attendanceForExcel === null) {
  //         this.showSpinner = false;
  //         // console.log('Skipped calling getEmployerMonthAttendance_for_excel_2');
  //       } else {
  //         this.showSpinner = false;
  //         this.getEmployerMonthAttData = [];
  //         this.toastr.error((attendanceForExcel as any).message, 'Oops!');
  //       }
  //     },
  //     error: (error) => {
  //       this.showSpinner = false;
  //       this.toastr.error('An error occurred while fetching data', 'Oops!');
  //       // console.error('Error:', error);
  //     },

  //     complete: () => {
  //       // console.log('check');
  //       this.showSpinner = false;
  //       if (this.emp_json_data.length == 0) {
  //         this.toastr.error('No Data Found', 'Oops!');
  //       }
  //     }

  //   });
  // }


  call_employer_details() {
    this.is_any_filter_triggered = true;
    this.showSpinner = true;
    this.employer_details();
  }

    go_to_generate_payment_advice() {
    this.router.navigate(['/attendance/generate-advice']);

  }

}
