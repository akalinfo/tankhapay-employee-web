import { Component } from '@angular/core';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { AttendanceService } from '../attendance.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';
import { dongleState, grooveState } from 'src/app/app.animation';

@Component({
  selector: 'app-generate-advice',
  templateUrl: './generate-advice.component.html',
  styleUrls: ['./generate-advice.component.css'],
  animations: [dongleState, grooveState]
})
export class GenerateAdviceComponent {

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

  searchKey: any = '';
  tp_account_id: any;
  decoded_token: any;
  ouIds: any;
  product_type: any;
  selected_date: any;
  yearsArray: any;
  days_count: any;
  showSidebar: boolean = true;
  filtered_employee_att_table_data: any = [];
  employee_att_table_data: any = [];
  attendancePurpose: any = 'Attendance';
  timeoutID: any;

  status_filter: any = 'all';
  att_status_filter: any = '';
  att_status_filter_copy: any;
  status_filter_copy: any;
  search_key_copy: any = '';
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
  advance_current_filter: any = 'Attendance';
  showRemarksPopup: boolean = false;
  remarks: any = '';
  statusFilter: any = '';


  constructor(
    private _businesessSettingsService: BusinesSettingsService,
    private _attendanceService: AttendanceService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
  }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.ouIds = this.decoded_token.ouIds;


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

    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    //
    this.yearsArray = [];
    for (let i = 2023; i <= currentYear + 1; i++) {
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

    this.selected_date = localStorage.getItem('selected_date');
    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];
    this.days_count = new Date(this.year, this.month, 0).getDate();


    this.get_geo_fencing_list();
    this.getDepartmentData();
    this.getDesignationData();
    this.getEmployerMonthAttendance_for_excel_table_data();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }


   getEmployerMonthAttendance_for_excel_table_data() {
    this.employee_att_table_data = [];
    this.filtered_employee_att_table_data = [];

    this._attendanceService.get_approved_days({
      'action': 'FetchApprovedAttendance',
      'accountid': this.tp_account_id,
      'month': this.month,
      'year': this.year,
      'search_keyword': this.searchKey,
      'emp_code': '',
      'att_purpose': this.attendancePurpose,
      'postOffered': this.desgName,
      'postingDepartment': this.deptName,
      'unitParameterName': this.orgName,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.statusFilter = '';
          this.employee_att_table_data = resData.commonData;
          this.filtered_employee_att_table_data = this.deepCopyArray(this.employee_att_table_data);
          this.closeSidebar();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }


  search() {
    // let searchkey = this.searchKey.toString().toLowerCase();
    // let att_status_filter = this.att_status_filter.toString().toLowerCase();
    // console.log(this.att_status_filter);
    // this.p = 0;
    // this.filtered_employee_att_table_data = this.employee_att_table_data.filter(function (element: any) {
    //   return (element?.emp_name?.toLowerCase().includes(searchkey)
    //     || element?.orgempcode?.toLowerCase().includes(searchkey)
    //     || element?.tpcode?.toLowerCase().includes(searchkey)
    //     || element?.mobile?.toLowerCase().includes(searchkey))
    //     // element.approval_status?.toLowerCase().includes(att_status_filter)
    // });
    // this.change_att_status();
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
    }
    this.timeoutID = setTimeout(() => {
      this.getEmployerMonthAttendance_for_excel_table_data();
    }, 1000)
  }

  // change_advance_current_status() {
  // this.searchKey = '';
  // this.filtered_employee_att_table_data = this.employee_att_table_data.filter((element: any) => {
  //   if (this.advance_current_filter === 'Current') {
  //     return element.advance_or_current === 'Current';
  //   } else if (this.advance_current_filter === 'Advance') {
  //     return element.advance_or_current === 'Advance';
  //   } else {
  //     return true;
  //   }
  // });
  // }

  change_status() {
    this.getEmployerMonthAttendance_for_excel_table_data();
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.getEmployerMonthAttendance_for_excel_table_data();
    // this.days_array = this.generateNumberArray();

  }

  changeYear(e: any) {
    this.year = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.getEmployerMonthAttendance_for_excel_table_data();
    // this.days_array = this.generateNumberArray();
  }


  generate_payment_advice(data: any) {

    this.confirmationDialogService.confirm(`Are you sure you want to generate payment advice for ${data.emp_name + '(' + data.tpcode + ')'}?`, 'Confirm').subscribe(result => {
      if (result) {
        this._attendanceService.generate_payment_advice({
          'action': 'ApproveBulkAttendanceFromExcel_New',
          'accountid': this.tp_account_id,
          'month': this.month,
          'year': this.year,
          'emp_code': data.emp_code,
          'advance_or_current': data.advance_or_current,
          'paiddays': !data.paiddays ? 0 : data.paiddays,
          'leave_taken': !data.leavetaken ? 0 : data.leavetaken,
        }).subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.closeSidebar();
            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          }
        })
      }
    })

  }

  generate_payment_advice_bulk() {
    // console.log(this.filtered_employee_att_table_data);
    // return;

    let emp_codes = [];
    let advance_or_current = [];
    let paiddays = [];
    let leave_taken = [];

    let temp_data = this.filtered_employee_att_table_data.filter((el: any) => el.isChecked == true);

    if (temp_data.length == 0) {
      this.toastr.error('Please select at least one employee', 'Oops!');
      return;
    }

    for (let i = 0; i < temp_data.length; i++) {
      emp_codes.push(temp_data[i].emp_code);
      advance_or_current.push(temp_data[i].advance_or_current);
      paiddays.push(!temp_data[i].paiddays ? 0 : temp_data[i].paiddays);
      leave_taken.push(!temp_data[i].leavetaken ? 0 : temp_data[i].leavetaken);
    }

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
              this.getEmployerMonthAttendance_for_excel_table_data();
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


  openRemarksPopup() {
    let temp_data = this.filtered_employee_att_table_data.filter((el: any) => el.isChecked == true);

    if (temp_data.length == 0) {
      this.toastr.error('Please select at least one employee', 'Oops!');
      return;
    }


    this.showRemarksPopup = true;
    this.remarks = '';
  }

  closeRemarksPopup() {
    this.showRemarksPopup = false;
    this.remarks = '';
  }

  create_bulk_advice() {
    // console.log(this.filtered_employee_att_table_data);
    // return;

    // let emp_codes = [];
    // let advance_or_current = [];
    // let paiddays = [];
    // let leave_taken = [];

    let attendance_details = [];

    let temp_data = this.filtered_employee_att_table_data.filter((el: any) => el.isChecked == true);

    if (temp_data.length == 0) {
      this.toastr.error('Please select at least one employee', 'Oops!');
      return;
    }

    for (let i = 0; i < temp_data.length; i++) {
      // emp_codes.push(temp_data[i].emp_code);
      // advance_or_current.push(temp_data[i].advance_or_current);
      // paiddays.push(!temp_data[i].paiddays ? 0 : temp_data[i].paiddays);
      // leave_taken.push(!temp_data[i].leavetaken ? 0 : temp_data[i].leavetaken);

      attendance_details.push({
        'emp_code': temp_data[i].emp_code,
        'month': this.month,
        'year': this.year,
        'paiddays': !temp_data[i].paiddays ? 0 : temp_data[i].paiddays,
        'leavetaken': !temp_data[i].leavetaken ? 0 : temp_data[i].leavetaken
      })
    }


    // [{"emp_code":"6327","month":"5","year":"2025","paiddays":"20","leavetaken":"5"}]


    console.log('accountid', this.tp_account_id,
      'month', this.month,
      'year', this.year,
      'emp_code', attendance_details)
    // return;


    this._attendanceService.create_bulk_advice({
      'customeraccountid': this.tp_account_id,
      'is_current_or_advance': this.attendancePurpose,
      'attendancedetails': attendance_details,
      'remarks': this.remarks,
      'createdbyusername': this.decoded_token.name,

      // 'action': 'ApproveBulkAttendanceFromExcel_New',
      // 'month': this.month,
      // 'year': this.year,
      // 'emp_code': emp_codes,
      // 'paiddays': paiddays,
      // 'leave_taken': leave_taken,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.getEmployerMonthAttendance_for_excel_table_data();
          this.toastr.success(resData.message, 'Success')
          this.closeRemarksPopup();
          this.closeSidebar();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })


  }


  get_selected_count() {
    let temp_data = this.filtered_employee_att_table_data.filter((el: any) => el.isChecked == true);

    if (temp_data.length == 0) {
      return '0';
    } else {
      return temp_data.length;
    }
  }


  get_checkbox_status(emp_data: any) {
    if (!((emp_data.advicestatus == 'Generated' && emp_data.advicelockstatus == 'Locked') || emp_data.payoutstatus == 'Generated')) {
      return true; // Not Generated
    } else {
      return false; // Generated
    }
  }
  get_advice_status(emp_data: any) {
    if (emp_data.advicestatus == 'Generated') {
      if (emp_data.advicelockstatus == 'Locked') {
        return 'Advice Locked';  //dark blue
      } else {
        return 'Advice Generated'; //light blue
      }

    } else if (emp_data.payoutstatus == 'Generated') {
      return 'Payout Generated'; //green
    } else {
      return 'Not Generated'; // white
    }
  }

  get_bg_row_color(emp_data: any) {
    if (emp_data.advicestatus == 'Generated') {
      if (emp_data.advicelockstatus == 'Locked') {
        return '#F8D7DA'; //light blue
      } else {
        return '#D0E7FF';  //dark blue
      }

    } else if (emp_data.payoutstatus == 'Generated') {
      return '#DFF6DD'; //green
    } else {
      return '#FFF4CC'; // default
    }
  }
  //   Not Generated #ffc2c2
  //   Advice Generated #c8ccff;
  //   Advice Locked #fff7aa
  //   Payout Generated  #c4f7c4
  get_row_color(emp_data: any) {
    if (emp_data.advicestatus == 'Generated') {
      if (emp_data.advicelockstatus == 'Locked') {
        return 'black'; //light blue
      } else {
        return 'black';  //dark blue
      }

    } else if (emp_data.payoutstatus == 'Generated') {
      return 'black'; //green
    } else {
      return 'black'; // default
    }
  }

  filter_by_status() {

    if (!this.statusFilter) {
      this.filtered_employee_att_table_data = this.deepCopyArray(this.employee_att_table_data);

    } else if (this.statusFilter == 'Advice Locked') {
      this.filtered_employee_att_table_data = this.employee_att_table_data.filter((el: any) => el.advicestatus == 'Generated' && el.advicelockstatus == 'Locked');

    } else if (this.statusFilter == 'Advice Generated') {
      this.filtered_employee_att_table_data = this.employee_att_table_data.filter((el: any) => el.advicestatus == 'Generated' && el.advicelockstatus != 'Locked');

    } else if (this.statusFilter == 'Payout Generated') {
      this.filtered_employee_att_table_data = this.employee_att_table_data.filter((el: any) => el.advicestatus != 'Generated' && el.payoutstatus == 'Generated');

    } else if (this.statusFilter == 'Not Generated') {
      this.filtered_employee_att_table_data = this.employee_att_table_data.filter((el: any) => el.advicestatus != 'Generated' && el.payoutstatus != 'Generated');

    }
  }

  //Sidebar Filter
  openSidebar() {
    this.search_key_copy = this.searchKey;
    this.month_copy = this.month;
    this.year_copy = this.year;
    this.att_status_filter_copy = this.att_status_filter;
    this.status_filter_copy = this.status_filter;
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
    this.searchKey = '';
    this.orgName_copy = [];
    this.search_key_copy = '';
    this.status_filter_copy = 'all';
    this.att_status_filter_copy = '';
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
    this.change_sidebar_filter_flag = true;
    this.searchKey = this.search_key_copy;
    this.month = this.month_copy;
    this.year = this.year_copy;

    this.days_count = new Date(this.year_copy, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.desgName = this.desgName_copy;
    this.deptName = this.deptName_copy;
    this.orgName = this.orgName_copy;

    this.att_status_filter = this.att_status_filter_copy;
    this.status_filter = this.status_filter_copy;
    // console.log(this.desgName);
    // console.log(this.deptName);

    this.getEmployerMonthAttendance_for_excel_table_data();
  }

  get_month_year_name() {
    let month = this.selected_date.split('-')[1];
    let year = this.selected_date.split('-')[2];

    return this.monthsArray[month - 1].month + ' ' + year
  }


  masterSelected: boolean = false;

  selectAllEmployees() {
    this.filtered_employee_att_table_data.forEach(emp => {
      if (this.get_advice_status(emp)) {
        emp.isChecked = this.masterSelected;
      }
    });
  }

  checkIfAllSelected() {
    const selectableEmps = this.filtered_employee_att_table_data.filter(emp => this.get_advice_status(emp));
    this.masterSelected = selectableEmps.length > 0 && selectableEmps.every(emp => emp.isChecked);
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



}
