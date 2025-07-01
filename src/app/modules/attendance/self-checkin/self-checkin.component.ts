import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
declare var $: any;
import jwtDecode from 'jwt-decode';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { dongleState, grooveState } from 'src/app/app.animation';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { PayoutService } from '../../payout/payout.service';
import { AttendanceService } from '../attendance.service';
import { EmployeeService } from '../../employee/employee.service';
import { ReportService } from '../../reports/report.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { OnInit, OnDestroy } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { map, share } from "rxjs/operators";
import { IstToGermanTimeService } from 'src/app/shared/services/ist-to-german-timezone.service';

@Component({
  selector: 'app-self-checkin',
  templateUrl: './self-checkin.component.html',
  styleUrls: ['./self-checkin.component.css'],
  animations: [dongleState, grooveState]
})
export class SelfCheckinComponent {




  time = new Date();
  rxTime = new Date();
  intervalId;
  subscription: Subscription;

  tp_account_id: any;
  product_type: any = '';
  showSidebar: boolean = true;
  decoded_token: any;
  Edit_Form: FormGroup;
  checkin_Form: FormGroup;
  month: any;
  emp_code: any;
  in_time: any;
  out_time: any;
  attendance_date: any;
  emp_name: any;
  att_data: any = [];
  currentDate: string;
  Save_data: any = [];
  year: any;
  invKey: any = '';
  showPopup: boolean = false;
  show_Popup: boolean = false;
  employee_data: any;
  showEditButton: boolean = false;
  EmpCode: any;
  attendance_dt: any;
  check_type: any;
  data: any = [];
  isFullscreen: boolean = false;
  emp_json_data: any;
  filteredEmployees: any;
  limit: any = 10;
  p: number = 0;
  total: number = 0;
  EMP_Name: any;
  checkInStatus: boolean = false;
  checkOutStatus: boolean = false;
  in_Time: any;
  out_Time: any;
  minDate: any = '';

  markDateData: any = '';
  showGermanTime: any = 'IST';


  constructor(
    private _attendanceService: AttendanceService,
    private _ReportService: ReportService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    private _formBuilder: FormBuilder,
    private toastr: ToastrService,
    private _alertservice: AlertService,
    public istToGermanTimeService: IstToGermanTimeService,

  ) { }

  ngOnInit() {

    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);

    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    const minDate = new Date();
    const firstDayOfMonth = new Date(minDate.getFullYear(), minDate.getMonth() + 1, 1);

    // Convert to YYYY-MM-DD format for input[type="date"]
    var mmm = minDate.getMonth() + 1;
    if (this.tp_account_id == '6441' && mmm != 1) {
      mmm = minDate.getMonth();
    }
    var mmmm = (mmm > 9) ? mmm : "0" + mmm
    this.minDate = minDate.getFullYear() + "-" + mmmm + "-01";

    // console.log(this.minDate);

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yy = String(today.getFullYear());


    this.currentDate = `${dd}/${mm}/${yy}`;
    this.markDateData = this.currentDate;


    // Using Basic Interval
    this.intervalId = setInterval(() => {
      this.time = new Date();
    }, 1000);

    // Using RxJS Timer
    this.subscription = timer(0, 1000)
      .pipe(
        map(() => new Date()),
        share()
      )
      .subscribe(time => {
        let hour = this.rxTime.getHours();
        let minuts = this.rxTime.getMinutes();
        let seconds = this.rxTime.getSeconds();
        //let a = time.toLocaleString('en-US', { hour: 'numeric', hour12: true });
        let NewTime = hour + ":" + minuts + ":" + seconds
        // console.log(NewTime);
        this.rxTime = time;
      });


    this.Edit_Form = this._formBuilder.group({
      inTime: ['', [Validators.required]],
      outTime: ['', [Validators.required]],
      isNightShiftFlag: ['', [Validators.required]],
    })
    this.checkin_Form = this._formBuilder.group({
      markedStatus: ['Marked', Validators.required],
      // markDateAttr :['']
    });
    this.showEditButton == true;
    let selectedData = this.markDateData.replace(/\//g, '-');
    selectedData = selectedData.split('-');
    // this.checkin_Form.patchValue({
    //   markDateAttr: selectedData[2]+"-"+selectedData[1]+"-"+selectedData[0]
    // });


    this.checkin_Form.get('markedStatus')?.valueChanges.subscribe((value) => {
      this.TpCheckInOutSummary(); // Call the API method
    });
    this.TpCheckInOutSummary();

    if (localStorage.getItem('showGermanTime')) {
      this.showGermanTime = localStorage.getItem('showGermanTime');
    } else {
      localStorage.setItem('showGermanTime', 'IST');
      this.showGermanTime = 'IST';
    }
  }

  ngAfterViewInit() {
    // console.log('k', this.markDateData)
    let split_dt = this.markDateData.split('/');
    let min_split_dt = this.minDate.split('-');

    // console.log(min_split_dt)
    // console.log(split_dt)

    setTimeout(() => {
      $('#FromDate_filter').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(min_split_dt[0] + '-' + min_split_dt[1] + '-' + min_split_dt[2]),
      }).datepicker('setDate', new Date(split_dt[2] + '-' + split_dt[1] + '-' + split_dt[0]));


      $('body').on('change', '#FromDate_filter', function () {
        $('#recdate_filter').trigger('click');
      });

    }, 100);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_page(event: any) {
    this.p = event;
  }

  search(key: any) {
    // this.invKey = key.target.value;
    this.invKey = key;
    this.p = 0;
    this.filteredEmployees = this.employee_data.filter(function (element: any) {
      return (element?.emp_name?.toLowerCase().includes(key?.toLowerCase())
        || element?.emp_code?.toLowerCase().includes(key?.toLowerCase())
      )
    });
  }

  toggleFullscreen() {
    const el = document.getElementById('element');
    if (el && el.requestFullscreen) {
      el.requestFullscreen();
      this.isFullscreen = true; // Update the flag when entering fullscreen
    } else {
      console.error('Fullscreen API is not supported');
    }
  }

  closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
      this.isFullscreen = false; // Update the flag when exiting fullscreen
    }
  }

  TpCheckInOutSummary() {
    this._ReportService.GetTpCheckInOutSummary({
      "fromDate": this.markDateData,
      "toDate": this.markDateData,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "flag": "normal_report",
      "GeoFenceId": this.decoded_token.geo_location_id,
      "checkInOutMarkedType": this.checkin_Form.get('markedStatus')?.value?.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.employee_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this.employee_data);
        this.filteredEmployees = this.employee_data;
        this.emp_code = this.employee_data?.emp_code;
        this.showEditButton = true;
        // console.log(this.invKey);
        this.search(this.invKey);
        // this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
      } else {
        this.filteredEmployees = []
        this.employee_data = [];
        this.showEditButton = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });

  }


  openPopup(emp_name: any, att_date: any, check_in_dt: any, check_out_dt: any, in_time: any, out_time: any, emp_code: any, isNightShiftFlag: any) {
    in_time = in_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(in_time, check_in_dt) : in_time;
    out_time = out_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(out_time, check_out_dt) : out_time;

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

    if (this.checkin_Form.get('markedStatus')?.value?.toString() == 'Marked') {
      if (!isNightShiftFlag || isNightShiftFlag == 'N') {
        if (!att_date) {
          att_fr = $('#FromDate_filter').val();
          att_to = $('#FromDate_filter').val();
        }
      } else if (isNightShiftFlag == 'Y') {
        // console.log('checkkkkk')
        if (!check_in_dt) {
          att_fr = $('#FromDate_filter').val();
          att_to = $('#FromDate_filter').val();
        } else if (check_in_dt) {
          att_fr = check_in_dt;
          att_to = check_in_dt;
        }

        if (check_out_dt) {
          att_to = check_out_dt;
        }
      }

    } else {
      // console.log('11',$('#FromDate_filter').val())
      att_fr = $('#FromDate_filter').val();
      att_to = $('#FromDate_filter').val();
    }


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

  TpCheck_In_Out(emp_code: any, checkInOutType: string) {
    this._attendanceService.TpCheckInOut({
      "action": "Edit_CheckIn_Out",
      "checkInOutType": checkInOutType,
      "customerAccountId": this.tp_account_id.toString(),
      "empCode": emp_code.toString(),
      "productTypeId": this.product_type,
      "checkInOutBy": this.tp_account_id.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        if (checkInOutType.includes('Out')) {
          this.Save_data = resData.commonData;
          this.checkOutStatus = true; // Set check-out status to true when checkout is done successfully
        } else {
          this.Save_data = resData.commonData;
          this.checkInStatus = true; // Set check-in status to true when checkin is done successfully
        }
        this.TpCheckInOutSummary();
        // this.toastr.success(resData.message, 'Success');
        this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
        // Set showEditButton to true when both check-in and check-out are marked
        this.showEditButton = this.checkInStatus && this.checkOutStatus;

      } else {
        this.Save_data = [];
        this.showEditButton = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
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

    let temp_in_time = this.Edit_Form.get('inTime')?.value;
    let temp_out_time = this.Edit_Form.get('outTime')?.value;

    let check_in_time = temp_in_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertGermanToIst(temp_in_time, fromdate) : temp_in_time;
    let check_out_time = temp_out_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertGermanToIst(temp_out_time, todate) : temp_out_time;

    // console.log(fromdate);
    // console.log(todate);
    // return;

    this._attendanceService.TpCheckInOut({
      "action": "Save_CheckIn_Out",
      "isNightShiftFlag": isNightShiftFlag,
      "fromdate": fromdate,
      "todate": todate,
      "checkInTime": check_in_time,
      "checkOutTime": check_out_time,
      "checkInOutType": "InOut",
      "customerAccountId": this.tp_account_id.toString(),
      "empCode": this.emp_code.toString(),
      "productTypeId": this.product_type,
      "checkInOutBy": this.tp_account_id.toString(),
      "attDate": this.markDateData
    }).subscribe((resData: any) => {
      // console.log(resData);

      if (resData.statusCode) {

        this.data = resData.commonData;
        this.TpCheckInOutSummary();
        this.closePopup();
        this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
      } else {
        this.data = [];
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    })
  }

  closePopup() {
    this.showPopup = false;

    this.Edit_Form.patchValue({
      inTime: '',
      outTime: '',
      isNightShiftFlag: '',
    })
  }

  exportToExcel() {
    this._ReportService.GetTpCheckInOutSummary({
      "fromDate": this.markDateData,
      "toDate": this.markDateData,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "flag": "normal_report"
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this.data);
        let exportData = [];
        let days = {};
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          // + resData.commonData[i].dayname;
          days = {
            ...days, [head]: ''
          }
        }

        for (let idx = 0; idx < this.data.length; idx++) {
          let obj = {
            'Employee Code': this.data[idx].emp_code,
            'Employee Name': this.data[idx].emp_name,
            'Org Employee Code': this.data[idx].orgempcode,
            'Tp Code': this.data[idx].tpcode,
            'Check In Time': this.data[idx].check_in_time,
            'Check Out Time': this.data[idx].check_out_time,
            'Total Hrs': this.data[idx].no_of_hours_worked,

          }
          exportData.push(obj);

        }
        // console.log(exportData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = 'Self_Check_in.xlsx';
        downloadLink.click();
      }
    })
  }

  markDateFun() {
    let dt = $('#FromDate_filter').val().split('-');
    this.markDateData = new Date(dt[2] + '-' + dt[1] + '-' + dt[0]);
    // console.log(this.markDateData);

    const dd = String(this.markDateData.getDate()).padStart(2, '0');
    const mm = String(this.markDateData.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yy = String(this.markDateData.getFullYear());
    this.markDateData = `${dd}/${mm}/${yy}`;
    // console.log((this.markDateData));
    this.TpCheckInOutSummary();
  }
  blockTyping(event: KeyboardEvent): void {
    event.preventDefault(); // Prevent typing into the date input field
  }


  filterFromToDateLeads() {
    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    // console.log(todt-fromdt);

    if (todt >= fromdt) {
      // this.startDate = $('#FromDate').val();
      // this.endDate = $('#ToDate').val();
    }
    else {
      // $('#FromDate').val(this.startDate);
      // $('#ToDate').val(this.endDate);
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }

    // console.log(this.startDate, this.endDate);
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

  get_date() {
    if (!this.attendance_date) {
      return $('#FromDate').val();
    } else {
      return this.attendance_date;
    }
  }

  onTimezoneChange() {
    localStorage.setItem('showGermanTime', this.showGermanTime);
  }

  getGermanTime(time: string, date: string): string {
    return this.istToGermanTimeService.convertIstToGermanTime(time, date);
  }
}
