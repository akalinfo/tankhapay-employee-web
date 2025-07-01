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
import { IstToGermanTimeService } from 'src/app/shared/services/ist-to-german-timezone.service';

declare var $: any;

@Component({
  selector: 'app-missed-punch-att',
  templateUrl: './missed-punch-att.component.html',
  styleUrls: ['./missed-punch-att.component.css'],
  animations: [grooveState, dongleState],
})
export class MissedPunchAttComponent {

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
  attendanceCategory: any = '';
  showBulkResyncDatePopup: boolean = false;
  bulk_from_dt: any;
  bulk_to_dt: any;
  @ViewChild('sd') sdate: ElementRef;
  @ViewChild('ed') edate: ElementRef;

  // leave_sub_type_arr: any = [
  //   {
  //     'typename': 'Earned Leave',
  //     'typecode': 'EL'
  //   },
  //   {
  //     'typename': 'Casual Leave',
  //     'typecode': 'CL'
  //   },
  // ]
  selected_att_type: any = 'MP';
  selected_dispay_name: any = '';
  accessRights: any = {};
  showGermanTime: any = 'IST';

  constructor(
    private _attendanceService: AttendanceService,
    private toastr: ToastrService,
    private router: Router,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private _ReportService: ReportService,
    private _masterService: MasterServiceService,
    public istToGermanTimeService: IstToGermanTimeService,
  ) {

    if (this.router.getCurrentNavigation().extras.state != undefined) {

      this.selected_att_type = this.router.getCurrentNavigation().extras.state.page;
      // console.log(this.selected_att_type);
      this.attendanceCategory = this.selected_att_type;
      this.selected_dispay_name = this.attendanceCategory == 'MP' ? 'Missed Punch' : 'Deviation';
      this.month = this.router.getCurrentNavigation().extras.state.month;
      this.year = this.router.getCurrentNavigation().extras.state.year;
    }
  }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

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

    this.get_missed_punch_att();

    if (localStorage.getItem('showGermanTime')) {
      this.showGermanTime = localStorage.getItem('showGermanTime');
    } else {
      localStorage.setItem('showGermanTime', 'IST');
      this.showGermanTime = 'IST';
    }
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    // this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    // this.selected_date = date;
    this.get_missed_punch_att();
  }

  changeYear(e: any) {
    this.year = e.target.value;
    // this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.get_missed_punch_att();
  }

  search(key: any) {
    this.keyword = key;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.get_missed_punch_att();
    }, 500)
  }

  change_att_category() {
    this.get_missed_punch_att();
  }

  get_missed_punch_att() {
    this.selected_missed_punches = [];
    $('input[name="check_punch_all"').prop('checked', false);
    $('input[name="check_punch"').prop('checked', false);

    this._attendanceService.get_missed_punch_att({
      'customeraccountid': this.tp_account_id,
      'year': this.year,
      'month': this.month,
      'keyword': this.keyword,
      'geoFenceId': this.decoded_token.geo_location_id,
      'attendanceCategory': this.attendanceCategory,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.missed_punch_data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));

          this.missed_punch_data.map((el: any) => {
            el['template_txt'] = !el['template_txt'] ? '' : JSON.parse(el['template_txt'])
            el['balance_txt'] = !el['balance_txt'] ? '' : JSON.parse(el['balance_txt'])
          })
          console.log(this.missed_punch_data);
        } else {
          this.toastr.error(resData.message, 'Oops!');
          this.missed_punch_data = [];
        }
      }, error: (e) => {
        console.log(e);
        this.missed_punch_data = [];
      }
    })
  }

  change_check_punch_all(e: any) {
    this.selected_missed_punches = [];
    if (e.target.checked) {
      this.missed_punch_data.map((el: any) => {
        if (el.is_salary_processed != 'Y') {
          this.selected_missed_punches.push(el.row_id);
        }
      })
    } else {
      this.selected_missed_punches = [];
    }

    $('input[name="check_punch"]').prop('checked', e.target.checked);
    console.log(this.selected_missed_punches);

  }

  change_check_punch(e: any, idx: any) {
    if (e.target.checked) {
      let index_rowid = this.missed_punch_data[idx].row_id;
      let add_idx = this.selected_missed_punches.findIndex((el: any) => el == index_rowid);
      if (add_idx == -1) {
        this.selected_missed_punches.push(index_rowid);
      }

    } else {
      let index_rowid = this.missed_punch_data[idx].row_id;
      let remove_idx = this.selected_missed_punches.findIndex((el: any) => el == index_rowid);
      if (remove_idx != -1) {
        this.selected_missed_punches.splice(remove_idx, 1);
      }
    }

    if (this.selected_missed_punches.length == this.missed_punch_data.length) {
      $('input[name="check_punch_all"').prop('checked', true);
    } else {
      $('input[name="check_punch_all"').prop('checked', false);
    }

    console.log(this.selected_missed_punches);
  }

  exportToExcel() {
    let exportData = [];

    for (let idx = 0; idx < this.missed_punch_data.length; idx++) {
      // if (this.filteredEmployees_forBulk[idx]?.lockstatus == 'Not Locked') {
      let obj = {
        'Employee': this.missed_punch_data[idx]?.emp_name,
        'EmpCode': this.missed_punch_data[idx]?.emp_code,
        'OrgEmpCode': this.missed_punch_data[idx]?.orgempcode,
        'TPCode': this.missed_punch_data[idx]?.tp_code,
        'AttDate': this.missed_punch_data[idx]?.att_date,
        // 'AttType': this.missed_punch_data[idx]?.attendance_type,
        'Assign_Shift': this.missed_punch_data[idx]?.shift_name_and_timing,
        'Working_Hours': this.missed_punch_data[idx]?.no_of_hours_worked,
        'Status': this.missed_punch_data[idx]?.att_catagory_txt

      }
      // console.log(this.missed_punch_data[idx]);

      exportData.push(obj);
      // }

    }
    // console.log(exportData);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    let date = new Date()
    downloadLink.download = `Missed_Punch-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
    downloadLink.click();

  }

  openAttCalendar() {
    this.showAttCalendarPopup = true;
    this.showSingleAttCalendarPopup = false;
    this.mark_att_type = '';
    this.mark_remarks = '';
    this.mark_leave_type = '';
  }
  openAttCalendar2(index: any) {
    this.showSingleAttCalendarPopup = true;
    this.showAttCalendarPopup = false;
    this.mark_att_type = '';
    this.mark_remarks = '';
    this.mark_leave_type = '';
    this.selected_missed_punches = [];
    this.selected_missed_punches.push(this.missed_punch_data[index].row_id);
    this.single_selected_index = index;
  }

  closeAttCalendar() {
    this.showAttCalendarPopup = false;
    this.showSingleAttCalendarPopup = false;
    this.selected_missed_punches = [];
    this.single_selected_index = '';
    this.mark_remarks = '';
    this.mark_att_type = '';
    this.mark_leave_type = '';
    $('input[name="check_punch_all"').prop('checked', false);
    $('input[name="check_punch"').prop('checked', false);
  }
  changeAttType(att_type: any) {
    this.mark_att_type = att_type;
    this.mark_leave_type = '';
  }

  changeLeaveType(e: any, prev_bal: any) {
    // To check the leave balance when applying for leave
    if (e.target.value != 'AA' && e.target.value != 'CO' && prev_bal == 0) {
      this.toastr.error('Insufficient Leave Balance', 'Oops!');
      $('input[name="leave_options"]').prop("checked", false);
      this.mark_att_type = '';
      this.mark_leave_type = '';
      return;

    } else if (e.target.value == 'AA') {
      this.mark_leave_type = '';

    } else if (e.target.value == 'CO') {
      if (prev_bal == 0) {
        this.toastr.error('Insufficient Compensatory Off Balance', 'Oops!');
        $('input[name="leave_options"]').prop("checked", false);
        this.mark_leave_type = '';
        return;
      }
      // console.log(this.attCalendarForm.value);
      // return;

      let emp_index = this.missed_punch_data[this.single_selected_index].emp_index;

      if (this.missed_punch_data[this.single_selected_index].comp_off_txt?.comp_off_applicable_type == 'All') {
        this.mark_leave_type = e.target.value;
        return;
      }
      let comp_off_applicable_dayname = JSON.parse(this.missed_punch_data[this.single_selected_index].comp_off_txt)?.comp_off_applicable_dayname;
      let comp_off_days_split = comp_off_applicable_dayname.split(',')
      console.log(comp_off_days_split);

      let split_dt = this.missed_punch_data[this.single_selected_index].att_date.split('/').reverse().join('-');
      let temp_dt = new Date(split_dt);
      let dayname = temp_dt.toLocaleDateString('en-US', { weekday: 'long' });

      let idx = comp_off_days_split.findIndex((e2: any) => e2 == dayname);

      if (idx == -1) {
        this.toastr.error('Compensatory Off applicable days are ' + comp_off_applicable_dayname, 'Oops!');
        $('input[name="leave_options"]').prop("checked", false);
        this.mark_leave_type = '';
        return;
      }

      this.mark_leave_type = e.target.value;
      // console.log(prev_bal);
    }
    else {
      this.mark_leave_type = e.target.value;
    }
  }

  manage_missed_punch_att() {
    if (this.selected_missed_punches.length == 0) {
      this.toastr.error('Please select atleast one record to continue', 'Oops!');
      return;
    }
    if (this.mark_att_type == '') {
      this.toastr.error('Please select attendance type', 'Oops!');
      return
    }
    if (this.mark_remarks == '') {
      this.toastr.error('Please enter remarks', 'Oops!');
      return
    }
    if (this.mark_att_type == 'LL' && (!this.mark_leave_type)) {
      this.toastr.error('Please select Leave Type', 'Oops!');
      return
    }

    let leave_bank_id = '';
    if (this.mark_leave_type) {
      leave_bank_id = this.missed_punch_data[this.single_selected_index].leave_bank_id;
    }


    // console.log(leave_bank_id);
    // return;
    this._attendanceService.manage_missed_punch_att({
      'customeraccountid': this.tp_account_id.toString(),
      'attendanceIds': this.selected_missed_punches,
      'attendanceType': this.mark_att_type,
      'leaveType': this.mark_leave_type,
      'leaveBankId': leave_bank_id,
      'remarks': this.mark_remarks,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.closeAttCalendar();
          this.selected_missed_punches = [];
          this.get_missed_punch_att();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
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

  manage_biometric_att_single(emp_org_code: any, date: any) {
    let from_date = date
    let to_date = date;
    // console.log(from_date, to_date);
    // return;

    if (!date) {
      this.toastr.error('Please select a date', 'Oops!');
      return;
    }

    this._ReportService.manage_biometric_att({
      action: 'enable_resync_biometric_att_from_to_dt',
      customeraccountid: this.tp_account_id.toString(),
      emp_org_code: emp_org_code.toString(),
      from_dt: from_date,
      to_dt: to_date,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.get_missed_punch_att();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  manage_biometric_att_bulk() {
    // let days_cnt = new Date(this.year, this.month, 0).getDate()
    // let mm = this.month <= 9 ? '0' + this.month : this.month;
    // let from_date = '01' + '/' + mm + '/' + this.year;
    // let to_date = days_cnt + '/' + mm + '/' + this.year

    if (!this.bulk_from_dt || !this.bulk_to_dt) {
      this.toastr.error('Please select both a From date and a To date', 'Oops!');
      return;
    }

    const extractedOrgEmpCodes = this.missed_punch_data
      .filter(item => this.selected_missed_punches.includes(item.row_id) && item.orgempcode)
      .map(item => item.orgempcode);


    // console.log(this.selected_missed_punches);
    // console.log(this.missed_punch_data);
    // console.log(extractedOrgEmpCodes);
    // console.log(from_date, to_date);
    // return;
    if (extractedOrgEmpCodes.length == 0) {
      this.toastr.error('Please select at least one record', 'Oops!');
      return;
    }

    // console.log(extractedOrgEmpCodes.join(','));
    // return;

    this._ReportService.manage_biometric_att({
      action: 'enable_resync_biometric_att_from_to_dt',
      customeraccountid: this.tp_account_id.toString(),
      emp_org_code: extractedOrgEmpCodes.join(','),
      from_dt: this.bulk_from_dt,
      to_dt: this.bulk_to_dt,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.get_missed_punch_att();
          this.closeBulkResyncDatePopup();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  check_access_right_cdn() {
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
      return false;
    } else {
      return true;
    }
  }

  openBulkResyncDatePopup() {
    this.showBulkResyncDatePopup = true;
    let days_cnt = new Date(this.year, this.month, 0).getDate()
    let mm = this.month <= 9 ? '0' + this.month : this.month;

    setTimeout(() => {
      this.bulk_from_dt = '01' + '/' + mm + '/' + this.year;
      this.bulk_to_dt = days_cnt + '/' + mm + '/' + this.year
      this.sdate.nativeElement.value = this.bulk_from_dt;
      this.edate.nativeElement.value = this.bulk_to_dt;
    }, 500)
    let from_date_max = this.year + '-' + mm + '-' + '01';
    let to_date_max = this.year + '-' + mm + '-' + days_cnt;
    setTimeout(() => {
      $(function () {
        $('#startDate').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: false,
          changeYear: false,
          minDate: new Date(from_date_max),
          maxDate: new Date(to_date_max)
        });
        $('#endDate').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: false,
          changeYear: false,
          minDate: new Date(from_date_max),
          maxDate: new Date(to_date_max)
        });

        $('body').on('change', '#startDate', function () {
          $('#recdate').trigger('click');
        });

        $('body').on('change', '#endDate', function () {
          $('#recdate').trigger('click');
        })

      });
    }, 0)
  }

  closeBulkResyncDatePopup() {
    this.showBulkResyncDatePopup = false;
    this.selected_missed_punches = [];
    $('input[name="check_punch_all"').prop('checked', false);
    $('input[name="check_punch"').prop('checked', false);
    this.bulk_from_dt = '';
    this.bulk_to_dt = '';
    this.sdate.nativeElement.value = '';
    this.edate.nativeElement.value = '';
  }

  filterFromToDateLeads() {
    // console.log(this.bulk_from_dt);
    // console.log(this.bulk_to_dt);

    let splitted_f = this.sdate.nativeElement.value.split("/", 3);
    let splitted_t = this.edate.nativeElement.value.split("/", 3);
    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    if (todt >= fromdt) {
      this.bulk_from_dt = this.sdate.nativeElement.value;
      this.bulk_to_dt = this.edate.nativeElement.value;
    }
    else {
      this.bulk_from_dt = '';
      this.bulk_to_dt = '';
      this.sdate.nativeElement.value = '';
      this.edate.nativeElement.value = '';
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }
  }

  onTimezoneChange() {
    localStorage.setItem('showGermanTime', this.showGermanTime);
  }
  getGermanTime(time: string, date: string): string {
    return this.istToGermanTimeService.convertIstToGermanTime(time, date);
  }

}
