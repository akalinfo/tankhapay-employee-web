import { Component, ElementRef, ViewChild } from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import * as XLSX from 'xlsx';
import { ReportService } from '../../reports/report.service';
import { Router } from '@angular/router';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';

declare var $: any;

@Component({
  selector: 'app-missed-punch-att',
  templateUrl: './bulk-lock-attendance.component.html',
  styleUrls: ['./bulk-lock-attendance.component.css'],
  animations: [grooveState, dongleState],
})
export class BulkLockAttendanceComponent {

  showSidebar: boolean = true;
  missed_punch_data: any = [];
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
  decoded_token: any;
  tp_account_id: any;
  keyword: any = '';
  timeoutId: any;
  selected_missed_punches: any = [];
  showAttCalendarPopup: boolean = false;
  showSingleAttCalendarPopup: boolean = false;
  mark_att_type: any = '';
  mark_remarks: any = '';
  mark_leave_type: any = '';
  single_selected_index: any = '';
  showBulkResyncDatePopup: boolean = false;
  bulk_from_dt: any;
  bulk_to_dt: any;
  @ViewChild('sd') sdate: ElementRef;
  @ViewChild('ed') edate: ElementRef;

  selected_att_type: any = 'MP';
  selected_dispay_name: any = '';
  accessRights: any = {};
  product_type: any;
  searchKey: any = '';
  bulk_lock_att_data: any = [];
  selected_emp_arr = [];
  bulk_lock_att_data_original: any = [];
  status_filter: any = '';
  failed_emp_codes = [];
  success_emp_codes = [];

  constructor(
    private _attendanceService: AttendanceService,
    private toastr: ToastrService,
    private router: Router,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private _ReportService: ReportService,
    private _masterService: MasterServiceService,
  ) {

    if (this.router.getCurrentNavigation().extras.state != undefined) {

      this.selected_att_type = this.router.getCurrentNavigation().extras.state.page;
      // console.log(this.selected_att_type);
      this.month = this.router.getCurrentNavigation().extras.state.month;
      this.year = this.router.getCurrentNavigation().extras.state.year;
    }
  }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    this.product_type = localStorage.getItem('product_type');

    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    if (this.decoded_token.isEmployer == '0') {
      this.accessRights = this._masterService.checkAccessRights('/attendance');
      // console.log(this.accessRights);
    }

    for (let i = 2023; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);
    };

    if (!this.month) {
      this.month = currentMonth + 1;
    }
    if (!this.year) {
      this.year = currentYear;
    }

    this.get_bulk_lock_att();
    // this.get_missed_punch_att();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changeMonth(e: any) {
    this.success_emp_codes = [];
    this.failed_emp_codes = [];
    this.month = e.target.value;
    this.get_bulk_lock_att();

  }

  changeYear(e: any) {
    this.success_emp_codes = [];
    this.failed_emp_codes = [];
    this.year = e.target.value;
    this.get_bulk_lock_att();

  }


  get_bulk_lock_att() {
    this.bulk_lock_att_data = [];
    this.bulk_lock_att_data_original = [];
    this.selected_emp_arr = [];

    this._attendanceService.manageDeviationSalaryDetails({
      "action": "ShowAllDeviations",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
      "month": this.month,
      "year": this.year.toString(),
      "empCode": '-1',

    }).subscribe({
      next: (resData: any) => {
        $('input[name="checkempAll"').prop('checked', false);
        $('input[name="checkemp"').prop('checked', false);

        if (resData.statusCode) {
          this.bulk_lock_att_data = resData.commonData;
          this.bulk_lock_att_data_original = JSON.parse(JSON.stringify(resData.commonData));
          // this.toastr.success(resData.message, 'Success');
          // this.closeLockedDaysPopup();

          for (let i=0; i<this.failed_emp_codes.length; i++) {
            let idx = this.bulk_lock_att_data.findIndex(el => el.emp_code == this.failed_emp_codes[i].emp_code);
            this.bulk_lock_att_data[idx].message = this.failed_emp_codes[i].message;
            this.bulk_lock_att_data_original[idx].message = this.failed_emp_codes[i].message;

          }
          for (let i=0; i<this.success_emp_codes.length; i++) {
            let idx = this.bulk_lock_att_data.findIndex(el => el.emp_code == this.success_emp_codes[i].emp_code);
            this.bulk_lock_att_data[idx].message = this.success_emp_codes[i].message;
            this.bulk_lock_att_data_original[idx].message = this.success_emp_codes[i].message;
          }


          this.change_status_filter();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  search() {
    let searchkey = this.searchKey.toLowerCase();
    this.bulk_lock_att_data = this.bulk_lock_att_data_original.filter(function (element: any) {
      return element.emp_name.toLowerCase().includes(searchkey)
        || element.tpcode.toLowerCase().includes(searchkey)
        || element.orgempcode.toLowerCase().includes(searchkey)
    });


    // let temp_arr = [];
    // for (let i=0; i<this.selected_emp_arr.length; i++) {
    //   let idx = this.bulk_lock_att_data.findIndex(el => el.emp_code == this.selected_emp_arr[i]);

    //   if (idx != -1) {
    //     temp_arr.push(this.selected_emp_arr[idx]);
    //   }
    // }
    // this.selected_emp_arr = temp_arr;
  }

  get_orgemp_tp_code(data: any) {
    if (data.orgempcode) {
      return '(' + data.orgempcode + ')';
    } else if (data.tpcode) {
      return '(' + data.tpcode + ')';
    } else {
      return '';
    }
  }

  check_emp(e: any, emp_code: any) {
    // console.log(e.target.checked, this.selected_emp_arr.find((el:any) => el == emp_code));
    if (e.target.checked) {
      if (this.selected_emp_arr.find((el: any) => el == emp_code) == undefined) {
        this.selected_emp_arr.push(emp_code);
      }
    } else {
      const index = this.selected_emp_arr.findIndex((el: any) => el == emp_code);
      if (index != -1) this.selected_emp_arr.splice(index, 1);

    }


    if (this.bulk_lock_att_data.length == this.selected_emp_arr.length) {
      $('input[name="checkempAll"').prop('checked', true);

    } else {
      $('input[name="checkempAll"').prop('checked', false);

    }
    // console.log(this.selected_emp_arr);

  }

  check_emp_all(e: any) {
    this.selected_emp_arr = [];
    if (e.target.checked) {
      this.bulk_lock_att_data.forEach((el: any) => {
        if (el.approval_status == 'P') {
          this.selected_emp_arr.push(el.emp_code);
        }
      })
      $('input[name="checkempAll"').prop('checked', true);
      $('input[name="checkemp"').prop('checked', true);

    } else {
      this.selected_emp_arr = [];
      $('input[name="checkempAll"').prop('checked', false);
      $('input[name="checkemp"').prop('checked', false);

    }
    // console.log(this.selected_emp_arr);
  }

  saveBulkDeviationSalaryDetails() {
    // this.bulk_lock_att_data_original;
    this.success_emp_codes = [];
    this.failed_emp_codes = [];

    const checkedBoxes = document.querySelectorAll<HTMLInputElement>('.checkemp:checked');
    const checkedBoxesEmpCodes = Array.from(checkedBoxes).map(checkbox =>
      checkbox.getAttribute('data-emp-code')
    );
    // console.log(checkedBoxesEmpCodes);

    this.selected_emp_arr = this.selected_emp_arr.filter(el => checkedBoxesEmpCodes.includes(el));

    let bulk_json_data = [];
    this.selected_emp_arr.forEach((selected_emp_code: any) => {
      let index = this.bulk_lock_att_data_original.findIndex(el => el.emp_code == selected_emp_code);
      bulk_json_data.push(
        {
          "empCode": this.bulk_lock_att_data_original[index].emp_code,
          "amount": !this.bulk_lock_att_data_original[index].deviationamount ? 0 : this.bulk_lock_att_data_original[index].deviationamount,
          "oldDays": !this.bulk_lock_att_data_original[index].old_days ? 0 : this.bulk_lock_att_data_original[index].old_days,
          "newDays": !this.bulk_lock_att_data_original[index].new_days ? 0 : this.bulk_lock_att_data_original[index].new_days,
          "salaryId": !this.bulk_lock_att_data_original[index].salaryid ? 0 : this.bulk_lock_att_data_original[index].salaryid,
          "daysDiff": !this.bulk_lock_att_data_original[index].daysdiff ? 0 : this.bulk_lock_att_data_original[index].daysdiff
        },
      )
    })
    // console.log(bulk_json_data)
    // return;

    if (bulk_json_data.length == 0) {
      this.toastr.error('Please select atleast one record', 'Oops!');
      return;
    }

    this._attendanceService.saveBulkDeviationSalaryDetails({
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
      "month": this.month,
      "year": this.year,
      "bulkJson": bulk_json_data

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Oops!');
          console.log(JSON.parse(resData.commonData.failed_emp_codes));
          this.failed_emp_codes = JSON.parse(resData.commonData?.failed_emp_codes);
          this.success_emp_codes = JSON.parse(resData.commonData?.success_emp_codes);
          this.get_bulk_lock_att();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  find_emp_code(emp_code:any) {
    let idx = this.selected_emp_arr.findIndex(el => el == emp_code);

    if (idx != -1) {
      return true;
    } else {
      return false;
    }
  }

  find_emp_code_all() {
    if (this.bulk_lock_att_data.length == 0) {
      return false;

    } else {
      for (let i=0; i<this.bulk_lock_att_data.length; i++) {
        let idx = this.selected_emp_arr.findIndex(el => el == this.bulk_lock_att_data[i].emp_code);
        if (idx == -1)  {
          return false;
        }
      }
      return true;

    }
  }

  change_status_filter() {
    if (this.status_filter == 'P') {
      this.bulk_lock_att_data = this.bulk_lock_att_data_original.filter((el:any) => {
        if (el.emp_deviation_status == 'N') {
          return el;
        }
      })

    } else if (this.status_filter == 'A') {
      this.bulk_lock_att_data = this.bulk_lock_att_data_original.filter((el:any) => {
        if (el.emp_deviation_status == 'Y') {
          return el;
        }
      })

    } else {
      this.bulk_lock_att_data = JSON.parse(JSON.stringify(this.bulk_lock_att_data_original));
    }
  }
}
