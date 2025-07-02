import { Component } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { AttendanceService } from '../attendance.service';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as XLSX from 'xlsx';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';
import { Router } from '@angular/router';
import { PayoutService } from '../../payout/payout.service';

declare var $: any;

@Component({
  selector: 'app-attendance-unit',
  templateUrl: './attendance-unit.component.html',
  styleUrls: ['./attendance-unit.component.css']
})
export class AttendanceUnitComponent {

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
  limit: any = 50;
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
  filter_emp_val: any = 'All';
  original_filteredEmployees_forBulk: any = [];
  show_check_in_out = false;
  accessRights: any = {};
  download_excel_data: any = [];

  /***New**/
  emp_data: any = [];
  filter_wise: any = 'employee';
  company_attendance_unit_form: FormGroup;
  employee_attendance_unit_form: FormGroup;
  unit_master_list_data: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];
  filteredEmployees_new: any = [];
  emp_json_data_new: any = [];
  original_unit_consolidated_att_data: any = [];
  show_new_calendar: boolean = false;
  selected_emp_data_new: any;
  timeoutID: any;
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
  keyword_copy: any = '';
  month_copy: any;
  year_copy: any;
  limit_copy: any = 50;
  filter_emp_val_copy: any = 'All';
  change_sidebar_filter_flag: boolean = false;

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
  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    // console.log(this.decoded_token)

    // if (this.decoded_token.mobile == '7887990568') {
    //   this.is_insufficient_fund = true;
    // }

    if (this.decoded_token.isEmployer == '0') {
      this.accessRights = this._masterService.checkAccessRights('/attendance/attendance-unit');
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

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'org_unit_id',
      textField: 'org_unit_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
    };
    this.deptDropdownSettings = {
      singleSelection: false,
      idField: 'departmentid',
      textField: 'departmentname',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
    };
    this.desgDropdownSettings = {
      singleSelection: false,
      idField: 'dsignationid',
      textField: 'designationname',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
    };

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


    this.company_attendance_unit_form = this._formBuilder.group({
      company_attendance_units: this._formBuilder.array([]),
    });
    this.employee_attendance_unit_form = this._formBuilder.group({
      employee_attendance_units: this._formBuilder.array([]),
    });

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

    this.get_att_unit_master_list('', '');
    this.get_att_dept_master_list('', '');
    this.get_att_role_master_list('', '');
    // this.getUnitTodayAttendance();
    this.get_calendar();
  }

  get ad() {
    return this.allowanceDeductForm.controls;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  /**Company Unit Array**/
  get company_attendance_unit_array() {
    return this.company_attendance_unit_form.get('company_attendance_units') as FormArray;
  }
  add_company_unit_att_array() {
    const unit_form_group = this._formBuilder.group({
      emp_name: [''],
      division: [''],
      unit_roll: [''],
      present_days: [''],
      absent_days: [''],
      days: [''],
    })
    this.company_attendance_unit_array.push(unit_form_group);
  }
  remove_company_unit_att_array(index: any) {
    this.company_attendance_unit_array.removeAt(index);
  }
  /**END**/

  /**Employee Unit Array**/
  get employee_attendance_unit_array() {
    return this.employee_attendance_unit_form.get('employee_attendance_units') as FormArray;
  }
  add_employee_unit_att_array() {
    let current_emp_index = parseInt(localStorage.getItem('showEmpInnerAttendance'));
    let emp_data = this.filteredEmployees_new[current_emp_index];
    // console.log(emp_data);

    const unit_form_group = this._formBuilder.group({
      attendanceid: ['-9999'],
      emp_code: [emp_data.emp_code],
      emp_name: [emp_data.emp_name],
      customeraccountid: [this.tp_account_id],
      unitid: ['', Validators.required],
      departmentid: ['', Validators.required],
      designationid: ['', Validators.required],

      unitname: [''],
      departmentname: [''],
      designationname: [''],

      attendancemonth: [this.month],
      attendanceyear: [this.year],
      presentcount: ['0', Validators.required],
      leavecount: ['0'],
      absentcount: ['0'],
      totaldays: ['0'],
      overtimehrs: ['0', Validators.required],
      attendancefrom: [''],
      attendanceto: [''],
      salaryid: [''],
      salarypaystatus: ['P'],
      remarks: [''],

      filtered_department_master_list_data: [[]],
      filtered_role_master_list_data: [[]],
    })
    this.employee_attendance_unit_array.push(unit_form_group);

    let idx = this.employee_attendance_unit_array.value.length - 1;
    const attendanceFromId = `att_from${idx}`;
    const attendanceToId = `att_to${idx}`;
    setTimeout(() => {
      $(`#${attendanceFromId}`).datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(this.year, this.month - 1, 1),
        maxDate: new Date(this.year, this.month - 1, this.days_count),
        onSelect: (dateText: string) => {
          const formGroup = this.employee_attendance_unit_array.at(idx) as FormGroup;
          formGroup.get('attendancefrom')?.setValue(dateText);
          this.triggerRecDateClick(idx);
        }
      });
      $(`#${attendanceToId}`).datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(this.year, this.month - 1, 1),
        maxDate: new Date(this.year, this.month - 1, this.days_count),
        onSelect: (dateText: string) => {
          const formGroup = this.employee_attendance_unit_array.at(idx) as FormGroup;
          formGroup.get('attendanceto')?.setValue(dateText);
          this.triggerRecDateClick(idx);
        }
      });

    }, 100);
    // console.log(this.employee_attendance_unit_array.value);

    this.employee_attendance_unit_array.markAsUntouched();
  }
  remove_employee_unit_att_array(index: any) {
    let attendanceid = this.get_employee_unit_formGroup(index).value.attendanceid;
    let empcode = this.get_employee_unit_formGroup(index).value.emp_code;
    let findIdx = this.original_unit_consolidated_att_data.findIndex(x => x.attendanceid == attendanceid);
    // console.log(attendanceid, empcode);
    // console.log(this.original_unit_consolidated_att_data);
    // console.log(findIdx);
    this.employee_attendance_unit_array.markAsUntouched();
    if (findIdx != -1 && attendanceid != '-9999') {
      // call remove API
      this.deleteSingleConsolidatedAttendance(empcode, attendanceid, index);
      return;
    }
    this.employee_attendance_unit_array.removeAt(index);

  }
  clear_employee_unit_att(): void {
    while (this.employee_attendance_unit_array.length !== 0) {
      this.employee_attendance_unit_array.removeAt(0);
    }
  }
  get_employee_unit_formGroup(index: number): FormGroup {
    return this.employee_attendance_unit_array.at(index) as FormGroup;
  }
  /**END**/

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


  changeProductType(e: any) {
    this.product_type = e.target.value;
    localStorage.setItem('product_type', this.product_type);
    this.employer_details();
  }
  search(key: any) {
    if (this.timeoutID) {
      clearInterval(this.timeoutID);
    }
    this.timeoutID = setTimeout(() => {
      this.keyword = key;
      this.p = 1;
      this.getUnitTodayAttendance();
    }, 500)

    // if (key != null && key != undefined && key != '') {
    //   console.log(key);
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
    // // console.log(this.filteredEmployees);
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
    this.getUnitTodayAttendance();
    // this.p = 1;

    // this.filter_emp_val = val;

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
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    // this.getUnitTodayAttendance();
    this.get_calendar();
  }

  changeYear(e: any) {
    this.year = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    // this.getUnitTodayAttendance();
    this.get_calendar();
  }

  /**Calendar **/

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
    let new_index = ((this.p - 1) * this.limit) + index;

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
    let new_index = ((this.p - 1) * this.limit) + index;

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
    if (balance_txt == 0) {
      this.toastr.error('Low Leave Balance', 'Oops!');
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
    if (this.markLeaveForm.value.att_type == 'HD' && (this.selectedCalendar_dates.length * 0.5) <= prev_bal && e.target.value != 'AA') {
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

  updateLeaveType() {
    // console.log(this.selectedCalendar_dates);
    let att_type = this.markLeaveForm.value.att_type;
    let leavetype = this.markLeaveForm.value.leavetype;
    // console.log(leavetype);
    if (att_type == 'LL' && leavetype == '') {
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
          this.toastr.error('Future date attendance marking not allowed. Please check selected date', 'Oops!');
          resolve(false);
          return;

        } else if (sel_date < doj) {
          this.toastr.error('Marking date should be greater than employee DOJ date', 'Oops!');
          resolve(false);
          return;

        } else if (sel_date > dor) {
          this.toastr.error('Marking date should be less than employee DOL (Date of Leaving) date', 'Oops!');
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
      if (att_type != 'HD') {
        actual_present_days += this.selectedCalendar_dates.length;
      } else if (att_type == 'HD') {
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
      this.blankCalendar[index].attendance_type = '';
      return true;
    } else if (dor != '' && date > dor) {
      this.blankCalendar[index].attendance_type = '';
      return true;
    } else if (date > current_date) {
      this.blankCalendar[index].attendance_type = '';
      return true;
    }

    return false;
  }
  /**Calendar **/


  // HUB Calendar Data
  save_approve_attendance(action: any) {
    let postdata = {};
    postdata['actionType'] = action;
    postdata['emp_code'] = this.selected_emp_data.mobile + 'CJHUB' + this.selected_emp_data.emp_code + 'CJHUB' + this.selected_emp_data.dateofbirth;
    postdata['markedByUserType'] = 'Employer';
    postdata['attendanceDates'] = [];
    postdata['productTypeId'] = this.product_type;
    postdata['customeraccountid'] = this.tp_account_id.toString();
    postdata['empLeaveBankId'] = this.selected_emp_data.leave_bank_id;

    let custom_msg = '';

    if (this.selectedCalendar_dates.length == 0 && action == 'SaveBulkAttendance') {
      this.toastr.info('No attendance marked', 'Info!');
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
          this.toastr.error('Please clear the missing punch attendance status', 'Oops!');
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
            if (el.attendance_type !== null && el.attendance_type !== undefined && el.attendance_type !== '') {
              postdata['attendanceDates'].push({
                'attendancedate': el.w_date.split('-').join('/'),
                'attendancetype': el.attendance_type,
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
        } else {
          return;

        }
      });
    } else {

      this.blankCalendar.map((el: any) => {
        if (el.attendance_type !== null && el.attendance_type !== undefined && el.attendance_type !== '') {
          postdata['attendanceDates'].push({
            'attendancedate': el.w_date.split('-').join('/'),
            'attendancetype': el.attendance_type,
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
      type: '',
      value: '',
      remarks: '',
    })
  }

  allowDeductChange(type: any) {
    this.allowanceDeductForm.patchValue({
      type: type
    })
    // console.log(this.voucher_data);
    if (type == 'allowance') {
      for (let i = 0; i < this.voucher_data.length; i++) {
        if (this.voucher_data[i].headid == this.allowance_headid) {
          this.allowanceDeductForm.patchValue({
            value: this.voucher_data[i].amount,
            remarks: this.voucher_data[i].remarks
          })
          break;
        } else {
          this.allowanceDeductForm.patchValue({
            value: '',
            remarks: ''
          })
        }
      }

    } else if (type == 'deduction') {
      for (let i = 0; i < this.voucher_data.length; i++) {
        if (this.voucher_data[i].headid == this.deduction_headid) {
          this.allowanceDeductForm.patchValue({
            value: this.voucher_data[i].amount,
            remarks: this.voucher_data[i].remarks
          })
          break;
        } else {
          this.allowanceDeductForm.patchValue({
            value: '',
            remarks: ''
          })
        }
      }

    } else if (type == 'overtime') {
      for (let i = 0; i < this.voucher_data.length; i++) {
        if (this.voucher_data[i].headid == this.overtime_headid) {
          this.allowanceDeductForm.patchValue({
            value: this.voucher_data[i].amount,
            remarks: this.voucher_data[i].remarks
          })
          break;
        } else {
          this.allowanceDeductForm.patchValue({
            value: '',
            remarks: ''
          })
        }
      }

    }
    // added on 16/05/2024
    else if (type == 'travel allowance') {
      for (let i = 0; i < this.voucher_data.length; i++) {
        if (this.voucher_data[i].headid == this.travel_allowance) {
          this.allowanceDeductForm.patchValue({
            value: this.voucher_data[i].amount,
            remarks: this.voucher_data[i].remarks
          })
          break;
        } else {
          this.allowanceDeductForm.patchValue({
            value: '',
            remarks: ''
          })
        }
      }

    }
    else if (type == 'daily allowance') {
      for (let i = 0; i < this.voucher_data.length; i++) {
        if (this.voucher_data[i].headid == this.daily_allowance) {
          this.allowanceDeductForm.patchValue({
            value: this.voucher_data[i].amount,
            remarks: this.voucher_data[i].remarks
          })
          break;
        } else {
          this.allowanceDeductForm.patchValue({
            value: '',
            remarks: ''
          })
        }
      }

    }
    // end on 16/05/2024
  }

  saveAllowDeduct() {

    // if (this.ad['type'].value == 'adv_salary') {

    //   if (this.allowanceDeductForm.valid) {
    //     this._attendanceService.checkAdvanceForAssociate({
    //       'customerAccountId': this.tp_account_id.toString(),
    //       'empCode': this.selected_emp_data.emp_code.toString(),
    //       'AdvanceHeadId': this.advance_headid,
    //       'amount': this.ad['value'].value,
    //       'productTypeId': this.product_type.toString(),
    //     })
    //       .subscribe((resData: any) => {
    //         if (resData.statusCode) {
    //           this.closeAllowanceDeductPopup();
    //           this.toastr.success(resData.message, 'Success');
    //         } else {
    //           this.toastr.error(resData.message, 'Oops!');
    //         }
    //       })

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
    }
    // added on 16/05/2024

    else if (this.ad.type.value == 'travel allowance') {
      this.saveTpVoucher(this.travel_allowance);

    } else if (this.ad.type.value == 'daily allowance') {
      this.saveTpVoucher(this.daily_allowance);
    }

    // end on 16/05/2024

  }

  saveTpVoucher(voucherHeadId: any) {
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
      this.toastr.error('Please fill the required fields', 'Oops!');
    }
  }

  changePage(e: any) {
    this.limit = e.target.value;
    // this.p = 0;
    this.p = 1;
  }
  /*************Download Bulk Att***************/
  download_bulk_att() {
    // this.getEmployerMonthAttendance();
    // console.log(this.filteredEmployees_forBulk);
    this.getEmployerMonthAttendance_for_excel();

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
    })
      .subscribe((resData: any) => {
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
              if (obj1?.attendance_type == 'PP' || obj1?.attendance_type == 'HO' || obj1?.attendance_type == 'WFH' || obj1?.attendance_type == 'OD') {
                this.filteredEmployees_forBulk[index].present_days += 1.0;
              } else if (obj1?.attendance_type == 'HD') {
                this.filteredEmployees_forBulk[index].present_days += 0.5;
              } else if (obj1?.attendance_type == 'LL') {
                this.filteredEmployees_forBulk[index].leave_days += 1.0;
              } else if (obj1?.attendance_type == 'AA') {
                this.filteredEmployees_forBulk[index].absent_days += 1.0;
              }
            }
          });

          this.getAttExcel();

        } else {
          this.bulk_att_data = [];
          this.toastr.error(resData.message, 'Oops!');
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
      action: 'GetEmployermonthAttendanceForExcel'
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
        console.log(e);
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

        for (let idx = 0; idx < this.download_excel_data.length; idx++) {
          let obj = {
            'Employee': this.download_excel_data[idx].emp_name,
            'EmpCode': this.download_excel_data[idx].emp_code,
            'OrgEmpCode': this.download_excel_data[idx]?.orgempcode,
            'Mobile': this.download_excel_data[idx].mobile,
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

  go_to_upload_allowance() {
    //, { state: { 'page': 'welcome' }
    this.router.navigate(['/attendance/bulk-deduction']);
  }


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
        // for hub api dated. 30.04.2025 harsh
        //let data = resData.commonData[0];
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
        this.toastr.info('Please generate opening balance', 'Info');
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
    let ilbt = this.openLeaveBalanceForm.value.intial_leave_bal_txt;
    ilbt[index].opening_bal = e.target.value;

    this.openLeaveBalanceForm.patchValue({
      intial_leave_bal_txt: ilbt,
    })

    // console.log(this.openLeaveBalanceForm.value);
  }

  routeToBulkAttn(): any {
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    this.router.navigate(['/attendance/bulk-attendance']);
  }

  /*************Opening Balance****************/

  checkSalaryCondFunc(att_type: any) {
    return new Promise<boolean>((resolve, reject) => {

      let leavetaken = parseFloat(this.selected_emp_data.marked_attendance_leave_taken);
      let paiddays = parseFloat(this.selected_emp_data.marked_attendance_paid_days);
      let salarydays = parseFloat(this.selected_emp_data.salarydays);
      let salary_days_opted = this.selected_emp_data.salary_days_opted;

      let local_marking_days = 0;
      if (att_type == 'PP' || att_type == 'HO' || att_type == 'WO' || att_type == 'LL' || att_type == 'WFH' || att_type == 'OD') {
        local_marking_days = this.selectedCalendar_dates.length;
      } else if (att_type == 'HD') {
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

  routeToMissedPunch() {
    this.router.navigate(['/attendance/missed-punch']);
  }


  /********New Work********/

  //---->>>>>>Inner Drop Downs *****/
  get_att_unit_master_list(unit_id: any, department_id: any) {
    this.unit_master_list_data = [];

    this._attendanceService.get_att_master_list({
      action: 'master_unit_list',
      customeraccountid: this.tp_account_id.toString(),
      unit_id: unit_id,
      department_id: department_id,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.unit_master_list_data = resData.commonData;
        } else {

        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }
  get_att_dept_master_list(unit_id: any, department_id: any) {
    this.department_master_list_data = [];

    this._attendanceService.get_att_master_list({
      action: 'master_department_list',
      customeraccountid: this.tp_account_id.toString(),
      unit_id: unit_id,
      department_id: department_id,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.department_master_list_data = resData.commonData;
        } else {

        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }
  get_att_role_master_list(unit_id: any, department_id: any) {
    this.role_master_list_data = [];

    this._attendanceService.get_att_master_list({
      action: 'master_role_list',
      customeraccountid: this.tp_account_id.toString(),
      unit_id: unit_id,
      department_id: department_id,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.role_master_list_data = resData.commonData;
        } else {

        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  get_filtered_dept_master_list(org_unit_id: any) {
    if (!org_unit_id) {
      return [];
    } else {
      let temp_arr = this.department_master_list_data.filter((el: any) => el.org_unit_id == org_unit_id);
      // console.log(temp_arr);
      return temp_arr;
    }
  }

  get_filtered_role_master_list(org_unit_id: any, departmentid: any) {
    if (!org_unit_id || !departmentid) {
      return [];
    } else {
      let temp_arr = this.role_master_list_data.filter((el: any) => el.org_unit_id == org_unit_id && el.departmentid == departmentid);
      // console.log(temp_arr);
      return temp_arr;
    }
  }

  change_unitid(index: any) {
    let formGroup = this.get_employee_unit_formGroup(index);
    // console.log(formGroup);
    let temp_arr1 = this.department_master_list_data.filter((el: any) => el.org_unit_id == formGroup.value.unitid);

    //  console.log(this.unit_master_list_data.filter((el: any) => el.org_unit_id == formGroup.value.unitid)[0].org_unit_name);
    let unit_name = this.unit_master_list_data.filter((el: any) => el.org_unit_id == formGroup.value.unitid)[0].org_unit_name;

    // unitname: [''],
    //   departmentname: [''],
    //   designationname: [''],

    formGroup.patchValue({
      filtered_department_master_list_data: temp_arr1,
      filtered_role_master_list_data: [],
      departmentid: '',
      designationid: '',
      unitname: unit_name
    })

  }
  change_departmentid(index: any) {
    let formGroup = this.get_employee_unit_formGroup(index);
    let temp_arr1 = this.role_master_list_data.filter((el: any) => el.org_unit_id == formGroup.value.unitid && el.departmentid == formGroup.value.departmentid);
    // console.log(formGroup);
    let dept_name = this.department_master_list_data.filter((el: any) => el.departmentid == formGroup.value.departmentid)[0].departmentname;



    formGroup.patchValue({
      filtered_role_master_list_data: temp_arr1,
      designationid: '',
      departmentname: dept_name
    })
  }
  change_designationid(index: any) {
    // console.log(this.employee_attendance_unit_array,value);
    let formGroup = this.get_employee_unit_formGroup(index);
    let role_name = this.role_master_list_data.filter((el: any) => el.dsignationid == formGroup.value.departmentid)[0].designationname;

    formGroup.patchValue({
      designationname: role_name
    });
  }
  //*->>>>>>>>>>>>>END ****/

  getUnitTodayAttendance() {
    // console.log(this.orgName);
    // console.log(this.deptName);
    // console.log(this.desgName);
    // [
    //   {
    //       "org_unit_id": 80,
    //       "org_unit_name": "shilctech"
    //   }
    // ]
    // [
    //   {
    //       "departmentid": 41,
    //       "departmentname": "Hr"
    //   }
    // ]
    // [
    //   {
    //       "dsignationid": 23,
    //       "designationname": "tester"
    //   }
    // ]

    this._attendanceService.getUnitTodayAttendance({
      customeraccountid: this.tp_account_id,
      att_date: this.selected_date,
      emp_name: this.keyword,
      approval_status: this.filter_emp_val,
      productTypeId: '2',
      attendanceSource: 'all',
      unitParameterName: this.orgName,
      postingDepartment: this.deptName,
      postOffered: this.desgName,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.emp_json_data_new = resData.commonData.attendancedetail;
          this.emp_json_data_new.map((el: any) => {
            el['showEmpInnerAttendance'] = false;
            el['photopath'] = ((el['photopath'] != null && el['photopath']
              != 'https://api.contract-jobs.com/crm_api/') ? el['photopath'] : '');

            el['template_txt'] = !el['template_txt'] ? '' : JSON.parse(el['template_txt']);
            el['balance_txt'] = !el['balance_txt'] ? '' : JSON.parse(el['balance_txt']);
            el['comp_off_txt'] = !el['comp_off_txt'] ? '' : JSON.parse(el['comp_off_txt']);
            el['prev_bal'] = !el['prev_bal'] ? '' : JSON.parse(el['prev_bal']);

          })
          this.filteredEmployees_new = this.deepCopyArray(this.emp_json_data_new);
          // console.log(this.filteredEmployees_new);
          let openedIndex = (localStorage.getItem('showEmpInnerAttendance') == undefined ? null : parseInt(localStorage.getItem('showEmpInnerAttendance')));
          if (openedIndex != null) {
            //** H-removed */
            // let oi = openedIndex + ((this.p - 1) * this.limit)
            // this.search(this.keyword);
            // this.toggleCalendar(openedIndex, this.filteredEmployees_new[oi], 'api');
            this.toggle_emp_att(openedIndex, this.filteredEmployees_new[openedIndex], 'api');
          }

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }

        if (this.change_sidebar_filter_flag) {
          this.closeSidebar();
        }

      }, error: (e) => {
        console.log(e);
      }
    })
  }

  toggle_emp_att(index: any, emp_data: any, action: any) {
    // console.log(index, emp_data);
    if (this.filteredEmployees_new[index]?.showEmpInnerAttendance != undefined) {
      this.filteredEmployees_new[index].showEmpInnerAttendance = !this.filteredEmployees_new[index]?.showEmpInnerAttendance;
    } else {
      return;
    }
    if (action == 'toggle_btn') {
      this.clear_employee_unit_att();
    }

    if (this.filteredEmployees_new[index]?.showEmpInnerAttendance == true) {
      this.filteredEmployees_new.forEach((el: any, i: any, arr: any) => {
        if (i != index) {
          arr[i].showEmpInnerAttendance = false;
        }
      });

      localStorage.setItem('showEmpInnerAttendance', index);
      this.getUnitConsolidatedAttendance(emp_data.emp_code);
    } else {
      localStorage.removeItem('showEmpInnerAttendance');
    }
  }

  getUnitConsolidatedAttendance(emp_code: any) {
    this._attendanceService.getUnitConsolidatedAttendance({
      customeraccountid: this.tp_account_id.toString(),
      empCode: emp_code.toString(),
      attYear: this.year,
      attMonth: this.month,

    }).subscribe({
      next: (resData: any) => {
        this.clear_employee_unit_att();
        this.original_unit_consolidated_att_data = [];

        if (resData.statusCode) {
          let data = !resData.commonData ? [] : resData.commonData;
          this.original_unit_consolidated_att_data = resData.commonData;

          data.map((el: any, idx: any) => {
            const unit_form_group = this._formBuilder.group({
              attendanceid: [el.attendanceid],
              emp_code: [el.emp_code],
              emp_name: [el.emp_name],
              customeraccountid: [el.customeraccountid],
              unitid: [!el.unitid ? '' : el.unitid, Validators.required],
              departmentid: [!el.departmentid ? '' : el.departmentid, Validators.required],
              designationid: [!el.designationid ? '' : el.designationid, Validators.required],
              unitname: [!el.unitname ? '' : el.unitname],
              departmentname: [!el.departmentname ? '' : el.departmentname],
              designationname: [!el.designationname ? '' : el.designationname],
              attendancemonth: [el.attendancemonth],
              attendanceyear: [el.attendanceyear],
              presentcount: [!el.presentcount ? 0 : el.presentcount, Validators.required],
              leavecount: [!el.leavecount ? 0 : el.leavecount],
              absentcount: [!el.absentcount ? 0 : el.absentcount],
              totaldays: [!el.totaldays ? 0 : el.totaldays],
              overtimehrs: [!el.overtimehrs ? 0 : el.overtimehrs, Validators.required],
              attendancefrom: [el.attendancefrom],
              attendanceto: [el.attendanceto],
              salaryid: [el.salaryid],
              salarypaystatus: [!el.salarypaystatus ? 'P' : el.salarypaystatus],
              remarks: [el.remarks],

              filtered_department_master_list_data: [this.get_filtered_dept_master_list(el.unitid)],
              filtered_role_master_list_data: [this.get_filtered_role_master_list(el.unitid, el.departmentid)],
            });
            // console.log(unit_form_group.value);
            this.employee_attendance_unit_array.push(unit_form_group);

            const attendanceFromId = `att_from${idx}`;
            const attendanceToId = `att_to${idx}`;
            setTimeout(() => {
              $(`#${attendanceFromId}`).datepicker({
                dateFormat: 'dd/mm/yy',
                changeMonth: true,
                changeYear: true,
                minDate: new Date(this.year, this.month - 1, 1),
                maxDate: new Date(this.year, this.month - 1, this.days_count),
                onSelect: (dateText: string) => {
                  const formGroup = this.employee_attendance_unit_array.at(idx) as FormGroup;
                  formGroup.get('attendancefrom')?.setValue(dateText);
                  this.triggerRecDateClick(idx);
                }
              });
              $(`#${attendanceToId}`).datepicker({
                dateFormat: 'dd/mm/yy',
                changeMonth: true,
                changeYear: true,
                minDate: new Date(this.year, this.month - 1, 1),
                maxDate: new Date(this.year, this.month - 1, this.days_count),
                onSelect: (dateText: string) => {
                  const formGroup = this.employee_attendance_unit_array.at(idx) as FormGroup;
                  formGroup.get('attendanceto')?.setValue(dateText);
                  this.triggerRecDateClick(idx);
                }
              });

            }, 100);

          });
          this.employee_attendance_unit_array.markAsUntouched();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }

      }, error: (e) => {
        this.clear_employee_unit_att();
        this.original_unit_consolidated_att_data = [];
        console.log(e);
      }
    })
  }


  saveUnitConsolidatedAttendance(action: any) {

    if (!this.employee_attendance_unit_array.valid) {
      this.employee_attendance_unit_array.markAllAsTouched();
      this.toastr.error('Please ensure all mandatory fields are filled out.', 'Oops!');
      return;
    }

    let present_days_cnt = this.get_present_days_cnt();
    //let overtime_days_cnt = this.get_overtime_days_cnt();
    if (present_days_cnt > this.days_count) {
      this.toastr.error('Total present days cannot exceed total month days', 'Oops!');
      return;
    }
    // if (overtime_days_cnt > this.days_count) {
    //   this.toastr.error('Total overtime days cannot exceed total month days', 'Oops!');
    //   return;
    // }

    let temp = this.employee_attendance_unit_array.value;

    //return console.log(this.employee_attendance_unit_array.value);
    let salary_data = temp.map(({ filtered_department_master_list_data, filtered_role_master_list_data, ...rest }) => rest)

    let current_emp_index = parseInt(localStorage.getItem('showEmpInnerAttendance'));
    let emp_data = this.filteredEmployees_new[current_emp_index];

    let filtered_salary_data = salary_data.filter((el: any) => {
      if (el.salarypaystatus != 'Paid') {
        return el;
      }
    });

    if (filtered_salary_data.length == 0) {
      this.toastr.info('Add or modify at least one row before saving the attendance', 'Info!');
      return;
    }

    let isUniqueCombo = this.checkUniqueCombinations(filtered_salary_data);
    if (isUniqueCombo == false) {
      this.toastr.error('Only one Attendance can be marked for a unit', 'Oops!');
      return;
    }
    let isUniqueDateRange = this.checkUniqueDateRanges(filtered_salary_data);
    if (isUniqueDateRange == false) {
      this.toastr.error('Date range cannot overlap', 'Oops!');
      return;
    }
    // console.log(filtered_salary_data);
    // return;

    this._attendanceService.saveUnitConsolidatedAttendance({
      customeraccountid: this.tp_account_id.toString(),
      empCode: emp_data.emp_code,
      salaryDetails: filtered_salary_data,
      action: action

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.getUnitTodayAttendance();
          // this.getUnitConsolidatedAttendance(emp_data.emp_code);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  deleteSingleConsolidatedAttendance(empCode: any, attendanceId: any, index: any) {
    this._attendanceService.deleteSingleConsolidatedAttendance({
      customeraccountid: this.tp_account_id.toString(),
      empCode: empCode.toString(),
      attendanceId: attendanceId.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.employee_attendance_unit_array.removeAt(index);
          this.getUnitTodayAttendance();
          // this.getUnitConsolidatedAttendance(empCode);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  get_original_salary_status(idx: any) {
    if (idx < this.original_unit_consolidated_att_data.length) {
      let data = !this.original_unit_consolidated_att_data ? [] : this.original_unit_consolidated_att_data;
      let salarypaystatus = !data[idx].salarypaystatus ? '' : data[idx].salarypaystatus;
      return salarypaystatus;
    } else {
      return 'P';
    }
  }

  get_present_days_cnt() {
    let data = !this.employee_attendance_unit_array.value ? [] : this.employee_attendance_unit_array.value;
    let count = 0;
    if (data.length > 0) {
      data.map((el: any) => {
        if (el.presentcount) {
          count += parseFloat(el.presentcount);
        }
      })
    }
    return count;
  }
  get_overtime_days_cnt() {
    let data = !this.employee_attendance_unit_array.value ? [] : this.employee_attendance_unit_array.value;
    let count = 0;
    if (data.length > 0) {
      data.map((el: any) => {
        if (el.overtimehrs) {
          count += parseFloat(el.overtimehrs);
        }
      })
    }
    return count;
  }
  check_present_value(idx: any, event: any) {
    const input = event.target as HTMLInputElement;
    const regex = /^\d{0,2}(\.\d{0,2})?$/;

    if (!regex.test(input.value)) {
      this.employee_attendance_unit_array.at(idx).patchValue({
        presentcount: '0',
      });
    } else {
      this.employee_attendance_unit_array.at(idx).patchValue({
        presentcount: input.value,
      });
    }
  }
  check_overtime_value(idx: any, event: any) {
    const input = event.target as HTMLInputElement;
    const regex = /^\d{0,5}(\.\d{0,2})?$/;

    if (!regex.test(input.value)) {
      this.employee_attendance_unit_array.at(idx).patchValue({
        overtimehrs: '0',
      });
    } else {
      this.employee_attendance_unit_array.at(idx).patchValue({
        overtimehrs: input.value,
      });
    }
  }

  triggerRecDateClick(index: number) {
    const recdateElement = document.getElementById(`recdate${index}`);
    if (recdateElement) {
      recdateElement.click();
    }
  }

  filterFromToDateLeads(idx: any) {
    // console.log(this.employee_attendance_unit_array.at(idx).value);
    let fromdt = this.employee_attendance_unit_array.at(idx).value.attendancefrom;
    let todt = this.employee_attendance_unit_array.at(idx).value.attendanceto;

    if (fromdt && todt) {
      let splitted_f = fromdt.split("/", 3);
      let splitted_t = todt.split("/", 3);

      let join_fr = splitted_f[2] + splitted_f[1] + splitted_f[0];
      let join_to = splitted_t[2] + splitted_t[1] + splitted_t[0];
      // console.log((parseInt(splitted_t[0])- parseInt(splitted_f[0]))+1);
      if (join_fr > join_to) {
        this.employee_attendance_unit_array.at(idx).patchValue({
          attendancefrom: '',
          attendanceto: '',
          presentcount: '0'
        });
        this.toastr.error("The start date must be less than or equal to the end date", 'Oops!');
        return;
      }
      this.employee_attendance_unit_array.at(idx).patchValue({
        presentcount: ((parseInt(splitted_t[0]) - parseInt(splitted_f[0])) + 1),
      });
    }
  }

  checkUniqueCombinations(records: any) {
    const combinations = new Set();

    for (const record of records) {
      const combination = `${record.unitid}-${record.departmentid}-${record.designationid}`;
      if (combinations.has(combination)) {
        return false;
      }
      combinations.add(combination);
    }
    return true;
  }
  checkUniqueDateRanges(records: any) {
    const dateRanges = [];

    for (const record of records) {
      if (record.attendancefrom && record.attendancefrom !== '' && record.attendanceto && record.attendanceto !== '') {
        const fromDate = new Date(record.attendancefrom.split('/').reverse().join('-'));
        const toDate = new Date(record.attendanceto.split('/').reverse().join('-'));

        for (const [existingFromDate, existingToDate] of dateRanges) {
          if ((fromDate >= existingFromDate && fromDate <= existingToDate) ||
            (toDate >= existingFromDate && toDate <= existingToDate) ||
            (fromDate <= existingFromDate && toDate >= existingToDate)) {
            return false;
          }
        }

        dateRanges.push([fromDate, toDate]);
      }
    }
    return true;
  }

  /*====>Calendar Work */
  get_calendar() {
    this._attendanceService.get_calendar({
      'action': 'get_blank_attendance',
      'employer_id': this.decoded_token.id,
      'month': this.month,
      'year': this.year,

    }).subscribe((resData: any) => {
      if (resData.status) {
        this.blankCalendar = this.deepCopyArray(resData.commonData);
        // H-removed
        // this.blankCalendar.map((el: any) => {
        //   if (el.holiday_name_cd == 'HO') {
        //     el.attendance_type = 'HO';
        //   }
        // })
        this.original_blankCalendar = this.deepCopyArray(this.blankCalendar);
        this.getUnitTodayAttendance();

        // H-removed
        // this.employer_details();

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
        emp_name: '',
        approval_status: '',
        GeoFenceId: this.decoded_token.geo_location_id
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          let decrypted_emp_json_data = resData.commonData;
          this.emp_json_data = (decrypted_emp_json_data).data.attendancedetail;

          this.LedgerMasterHeads_head = (decrypted_emp_json_data).data.LedgerMasterHeads;

          this.overtime_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Overtime')[0].headid;
          this.allowance_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Allowance')[0].headid;;
          this.deduction_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Deduction')[0].headid;
          // this.advance_headid = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'SalaryAdvances')[0].headid;
          // added on 16/05/2025
          this.travel_allowance = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Travel Allowance')[0].headid;
          this.daily_allowance = this.LedgerMasterHeads_head.filter(obj => obj.voucher_name == 'Daily Allowance')[0].headid;
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
          // console.log(resData.displayMessage);
          //this.toastr.success(resData.displayMessage, 'Success');

          // H-removed
          // this.filter_emp(this.filter_emp_val);

          // console.log(localStorage.getItem('openedCalendar'));

          // H-removed
          // let openedIndex = (localStorage.getItem('openedCalendar') == undefined ? null : parseInt(localStorage.getItem('openedCalendar')));
          // if (openedIndex != null) {
          //   let oi = openedIndex + ((this.p - 1) * this.limit)
          //   this.search(this.keyword);
          //   this.toggleCalendar(openedIndex, this.filteredEmployees[oi], 'api');
          //   // this.toggleCalendar(openedIndex, this.filteredEmployees[openedIndex]);
          // }

        } else {
          this.emp_json_data = [];
          this.filteredEmployees = [];
          this.filteredEmployees_forBulk = [];
          this.original_filteredEmployees_forBulk = [];
          // console.log(resData.message);
          //this.toastr.error(resData.message, 'Oops!');
        }
      });
  }
  toggleCalendar(index: any, emp_data: any, action: any): any {
    // H-removed
    // if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
    //   return this.toastr.error("You do not have the permission for this.");
    // }
    let new_index = ((this.p - 1) * this.limit) + index;

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

      // localStorage.setItem('openedCalendar', new_index);
      localStorage.setItem('openedCalendar', index);
      // this.get_monthly_attendance();
    } else {
      localStorage.removeItem('openedCalendar');
      this.show_payout_breakup = false;
    }
  }

  get_monthly_attendance(emp_data: any) {
    let data = emp_data;
    this.selected_emp_data_new = data;
    let emp_code = data.mobile + 'CJHUB' + data.emp_code + 'CJHUB' + data.dateofbirth;
    let encrypted_emp_code = this._EncrypterService.aesEncrypt(emp_code);
    // this.blankCalendar = this.deepCopyArray(this.original_blankCalendar);

    this._attendanceService.get_monthly_attendance({
      "emp_code": encrypted_emp_code,
      "month": this.month.toString(),
      "year": this.year.toString(),
      "productTypeId": this.product_type,
      'customerAccountId': this.tp_account_id.toString()
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {

          this.blankCalendar = this.deepCopyArray(this.original_blankCalendar);
          // console.log(this.blankCalendar);

          this.calendar_data = resData.commonData.data;
          this.payroll_data = resData.commonData.payroll;
          this.voucher_data = resData.commonData.voucherDetails;
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

            if (obj2?.attendance_type == 'HO' || obj2?.attendance_type == 'WO') {
              auto_mark_days += 1.0;
            } else if (obj2?.attendance_type == 'PP' || obj2?.attendance_type == 'OD' || obj2?.attendance_type == 'WFH') {
              actual_present_days += 1.0;
            } else if (obj2?.attendance_type == 'HD') {
              actual_present_days += 0.5;
            }
            // console.log(this.blankCalendar[matchingObjectIndex]);

          });

          // H-removed
          // this.filteredEmployees[new_idx].auto_mark_days = auto_mark_days;
          // this.filteredEmployees[new_idx].actual_present_days = actual_present_days;

          // setTimeout(() => {
          //   console.log(this.blankCalendar);
          // },1000)
          // console.log(this.filteredEmployees);

          this.selectedCalendar_dates = [];
          this.blankCalendar.map(el => {
            el.localSelection = false;
          })
          // console.log(this.blankCalendar);

        } else {
          this.blankCalendar = this.deepCopyArray(this.original_blankCalendar);

          // this.toastr.error(resData.message, 'Oops!');
          console.log(resData.message);
          // this.toastr.info('Attendance yet to be mark', 'Info!');
          this.calendar_data = [];
          this.payroll_data = [];
          this.voucher_data = [];
        }

        this.show_new_calendar = true;

      })
  }

  closeNewCalendar() {
    this.show_new_calendar = false;
  }
  /*====>End */


  /********New Work********/

  /***Sidebar***/
  openSidebar() {
    this.keyword_copy = this.keyword;
    this.orgName_copy = this.deepCopyArray(this.orgName);
    this.deptName_copy = this.deepCopyArray(this.deptName);
    this.desgName_copy = this.deepCopyArray(this.desgName);
    this.month_copy = this.month;
    this.year_copy = this.year;
    this.limit_copy = this.limit;
    this.filter_emp_val_copy = this.filter_emp_val;
    this.change_sidebar_filter_flag = false;

    this.orgList = this.deepCopyArray(this.unit_master_list_data);
    //this.change_OrgUnit_Dept_Sidebar();
    // if (!this.orgName_copy || this.orgName_copy.length == 0) {
    //   this.deptName_copy = [];
    //   this.deptList = [];
    // } else {
    //   this.deptList = this.get_filtered_dept_master_list(this.orgName_copy[0].org_unit_id);
    // }

    // if (!this.deptName_copy || this.deptName_copy.length == 0) {
    //   this.desgName_copy = [];
    //   this.desgList = [];
    // } else {
    //   this.desgList = this.get_filtered_role_master_list(this.orgName_copy[0].org_unit_id, this.deptName_copy[0].departmentid);
    // }

    this.deptList = this.deepCopyArray(this.department_master_list_data);
    this.desgList = this.deepCopyArray(this.role_master_list_data);

    document.getElementById("sidebar").style.width = "380px";
  }

  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }

  resetFilter() {
    this.orgName_copy = [];
    this.deptName_copy = [];
    this.desgName_copy = [];

    this.orgName = [];
    this.deptName = [];
    this.desgName = [];

    // this.orgList = this.deepCopyArray(this.unit_master_list_data);
    // this.deptList = [];
    // this.desgList = [];

    this.keyword_copy = '';
    this.keyword = '';
    this.month_copy = this.month;
    this.year_copy = this.year;
    this.limit_copy = 50;
    this.filter_emp_val_copy = 'All';
  }

  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;
    this.keyword = this.keyword_copy;
    this.month = this.month_copy;
    this.year = this.year_copy;

    this.days_count = new Date(this.year_copy, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.limit = this.limit_copy;
    this.filter_emp_val = this.filter_emp_val_copy;
    this.orgName = this.orgName_copy;
    this.deptName = this.deptName_copy;
    this.desgName = this.desgName_copy;
    this.p = 1;

    // console.log(this.orgName);
    // console.log(this.deptName);
    // console.log(this.desgName);

    this.get_calendar();
  }


  change_OrgUnit_Dept_Sidebar() {
    if (!this.orgName_copy || this.orgName_copy.length == 0) {
      this.deptName_copy = [];
      this.deptList = [];
    } else {
      this.deptList = this.get_filtered_dept_master_list(this.orgName_copy[0].org_unit_id);
    }
    // console.log(this.orgName_copy, this.deptList, !this.orgName_copy, this.deptName_copy);

    if (!this.deptName_copy || this.deptName_copy.length == 0) {
      this.desgName_copy = [];
      this.desgList = [];
    } else {
      this.desgList = this.get_filtered_role_master_list(this.orgName_copy[0].org_unit_id, this.deptName_copy[0].departmentid);
    }
  }

  /***Sidebar***/


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

  check_access_right_cdn() {
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
      return false;
    } else {
      return true;
    }
  }

}
