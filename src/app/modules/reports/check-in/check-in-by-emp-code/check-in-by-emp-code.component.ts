import { AfterViewInit, Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import * as XLSX from 'xlsx';
import { ReportService } from '../../report.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AttendanceService } from 'src/app/modules/attendance/attendance.service';
import { IstToGermanTimeService } from 'src/app/shared/services/ist-to-german-timezone.service';
declare var $: any;

@Component({
  selector: 'app-check-in-by-emp-code',
  templateUrl: './check-in-by-emp-code.component.html',
  styleUrls: ['./check-in-by-emp-code.component.css']
})
export class CheckInByEmpCodeComponent implements AfterViewInit {
  showSidebar: boolean = true;
  product_type: any;
  emp_code: any;
  id: any;
  currentDate: any;
  currentDateString: any;
  employer_name: any;
  data: any = [];
  employee_data: any = [];
  checkin_Form: FormGroup;
  designation: any;
  show_label: boolean = true;
  tp_account_id: any = '';
  token: any = '';
  from_date: any;
  to_date: any;
  year: any;
  is_overtime_applicable: any;
  no_of_overtime_hours_worked: any;
  deviation_in_checkin: any;
  deviation_in_checkout: any;
  deviation_in_total_working_hours: any;
  pop_imgcheck_in_image_path: any = '';
  pop_check_out_image_path: any = '';
  innerPanelData: any = [];
  innerTotalHrsWorked: any = 0;
  loading: boolean = false;
  showGermanTime: any = 'IST';

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private router: Router,
    private _alertservice: AlertService,
    private istToGermanTimeService: IstToGermanTimeService,
    public _AttendanceService: AttendanceService) {

    if (this.router.getCurrentNavigation().extras.state != null || this.router.getCurrentNavigation().extras.state != undefined) {
      this.emp_code = this.router.getCurrentNavigation().extras.state?.emp_code;
      this.id = this.router.getCurrentNavigation().extras.state?.id;
      // this.designation = this.router.getCurrentNavigation().extras.state?.designation;
      // console.log(this.designation);

    }

    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }
  formatDate(date: Date): string {
    const day: number = date.getDate();
    const month: number = date.getMonth() + 1;
    const year: number = date.getFullYear();

    // Pad single digit day/month with leading zero
    const dayString: string = day < 10 ? '0' + day : day.toString();
    const monthString: string = month < 10 ? '0' + month : month.toString();

    return `${dayString}/${monthString}/${year}`;
  }


  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.employer_name = this.token.name;

    let currDate = new Date();

    this.from_date = this.formatDate(currDate);
    this.to_date = this.formatDate(currDate);

    this.checkin_Form = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]]

    });


    this.TpCheckInOutSummary();

    if (localStorage.getItem('showGermanTime')) {
      this.showGermanTime = localStorage.getItem('showGermanTime');
    } else {
      localStorage.setItem('showGermanTime', 'IST');
      this.showGermanTime = 'IST';
    }

  }
  getGermanTime(time: string, date: string): string {
    return this.istToGermanTimeService.convertIstToGermanTime(time, date);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      $('#FromDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date()); // Set current date as default
    }, 500);

    setTimeout(() => {
      $('#ToDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date()); // Set current date as default
    }, 500);
  }

  openImagePopup(imagePath: string) {


  }

  getCheckInImage(checkin_image: any) {

    if (checkin_image != '' && checkin_image != null) {
      this.pop_imgcheck_in_image_path = checkin_image;

    }
    else {
      this.pop_imgcheck_in_image_path = '';
    }
  }
  getCheckOutImage(checkout_image: any) {
    if (checkout_image != '' && checkout_image != null) {
      this.pop_check_out_image_path = checkout_image;
    }
    else {
      this.pop_check_out_image_path = '';
    }
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  open_new_Panel(i: number, emp_data: any) {
    this.is_overtime_applicable = emp_data?.is_overtime_applicable;
    this.no_of_overtime_hours_worked = emp_data?.no_of_overtime_hours_worked;
    this.deviation_in_checkin = emp_data?.deviation_in_checkin;
    this.deviation_in_checkout = emp_data?.deviation_in_checkout;
    this.deviation_in_total_working_hours = emp_data?.deviation_in_total_working_hours

    const targetElement = document.getElementById(`CollapseOne${i}`);

    // Check if the clicked panel is already open
    const isOpen = targetElement.classList.contains('in');

    // Close all previously opened panels (if needed)
    const previouslyOpened = document.querySelectorAll('.in.panel-collapse.collapse');

    previouslyOpened.forEach(panel => {
      if (panel !== targetElement) {
        panel.classList.remove('in');
      }
    });

    // Toggle visibility of the clicked panel (considering its state)
    if (!isOpen) {
      targetElement.classList.add('in'); // Open if not already open
    } else {
      targetElement.classList.remove('in'); // Close if already open
    }
  }

  TpCheckInOutSummary() {

    // this.from_date = $('#FromDate').val();
    // this.to_date = $('#ToDate').val();
    this.loading = true;
    if ($('#FromDate2').val() != '' && $('#FromDate2').val() != null && $('#FromDate2').val() != undefined) {
      this.from_date = $('#FromDate2').val();
    }

    if ($('#ToDate2').val() != '' && $('#ToDate2').val() != null && $('#ToDate2').val() != undefined) {
      this.to_date = $('#ToDate2').val();
    }

    this._ReportService.GetTpCheckInOutSummary({
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "emp_code": this.emp_code,
      "GeoFenceId": this.token.geo_location_id,
      "flag": "check_in_by_emp_code"
    }).subscribe((resData: any) => {
      this.loading = false;
      // console.log(resData);
      if (resData.statusCode) {
        this.employee_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        console.log(this.employee_data);

      } else {
        this.employee_data = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });

  }
  formatBreakTotalTime(breakTotalTime: string): string {
    try {
      const breaks = JSON.parse(breakTotalTime);
      return breaks.map(b =>
        `${b.break_type} [${b.break_type_duration}] - ${b.break_type_paid_unpaid}`
      ).join(', ');
    } catch (e) {
      // console.error('Error parsing break_total_time:', e);
      return '';
    }
  }
  exportToExcel() {
    this._ReportService.GetTpCheckInOutSummary({
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "emp_code": this.emp_code,
      "GeoFenceId": this.token.geo_location_id,
      "flag": "check_in_by_emp_code",
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

        // for (let idx = 0; idx < this.data.length; idx++) {
        //   let obj = {

        //     'Employee Name': this.data[idx].emp_name,
        //     'Employee Code': this.data[idx].emp_code,
        //     'In Time': this.data[idx].check_in_time,
        //     'Check In Location': this.data[idx].check_in_location,
        //     'Out Time': this.data[idx].check_out_time,
        //     'Check Out Location': this.data[idx].check_out_location,
        //     'No Of Hours Worked': this.data[idx].no_of_hours_worked,
        //     'Attendance Date': this.data[idx].attendancedate,

        //   }
        //   // console.log(obj,"fgh");

        //   exportData.push(obj);
        // }
        const formatBreakTotalTime = (breakTotalTime: string): string => {
          try {
            const breaks = JSON.parse(breakTotalTime);
            return breaks.map(b =>
              `${b.break_type} [${b.break_type_duration}] - ${b.break_type_paid_unpaid}`
            ).join(', ');
          } catch (e) {
            // console.error('Error parsing break_total_time:', e);
            return '';
          }
        };
        for (let idx = 0; idx < this.data.length; idx++) {
          let check_in_time = this.data[idx].check_in_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(this.data[idx].check_in_time, this.data[idx].attendancedate) : this.data[idx].check_in_time;
          let check_out_time = this.data[idx].check_out_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(this.data[idx].check_out_time, this.data[idx].attendancedate) : this.data[idx].check_out_time;

          let obj = {
            'Attendance Date': this.data[idx].attendancedate,
            'Employee Code': this.data[idx].orgempcode,
            'TPCode': this.data[idx].tpcode,
            'Employee Name': this.data[idx].emp_name,
            'Department': this.data[idx].department,
            'Designation': this.data[idx].designation,
            'Organisation Unit': this.data[idx].assigned_ou_ids_names,
            'Geofence Name': this.data[idx].assigned_geofence_ids_names,
            'Source': this.data[idx].attendance_type,
            'Shift Name': this.data[idx].shift_name,
            'Night Shift': this.data[idx].is_night_shift,
            'Break': formatBreakTotalTime(this.data[idx].break_total_time),
            // <td> {{emp.tpcode }}</td>
            // <td> {{emp.orgempcode }}</td>
            'In Time': check_in_time,
            'Check In Location': this.data[idx].check_in_location,
            'Out Time': check_out_time,
            'Check Out Location': this.data[idx].check_out_location,
            'No Of Hours Worked': this.data[idx].no_of_hours_worked,
            ' ': ' ',
            'Is Overtime Applicable': this.data[idx].is_overtime_applicable,
            'No Of Overtime Hours Worked': this.data[idx].no_of_overtime_hours_worked,
            'Deviation In Checkin': this.data[idx].deviation_in_checkin,
            'Deviation In Checkout': this.data[idx].deviation_in_checkout,
            'Deviation In Total Working Hours': this.data[idx].deviation_in_total_working_hours,
          }

          if (this.data[idx].no_of_hours_worked !== '00:00' && this.data[idx].no_of_hours_worked !== undefined) {
            obj['Is Overtime Applicable'] = this.data[idx].is_overtime_applicable;
            obj['No Of Overtime Hours Worked'] = this.data[idx].no_of_overtime_hours_worked;
            obj['Deviation In Checkin'] = this.data[idx].deviation_in_checkin;
            obj['Deviation In Checkout'] = this.data[idx].deviation_in_checkout;
            obj['Deviation In Total Working Hours'] = this.data[idx].deviation_in_total_working_hours;
          }

          // console.log(this.data[idx].check_in_out_details);
          let i = 1;
          for (const details of this.data[idx].check_in_out_details) {
            let check_in_time = details.check_in_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(details.check_in_time, details.attendancedate) : details.check_in_time;
            let check_out_time = details.check_out_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(details.check_out_time, details.attendancedate) : details.check_out_time;


            obj['CheckIn ' + i] = check_in_time;
            obj['CheckOut ' + i] = check_out_time;
            obj['Wrkhrs ' + i] = details.no_of_hours_worked;
            obj['Source ' + i] = details.attendance_type;
            obj['Check-In Geofence ' + i] = details.check_in_geofence_id_name;
            obj['Check-Out Geofence ' + i] = details.check_out_geofence_id_name;
            i++;
          }
          exportData.push(obj);


          // console.log(obj,"fh");
        }

        // console.log(exportData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = 'Check_In_By_EMP_Code_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
      }
    })
  }

  openPanel(i: number, emp_data: any) {
    this.innerPanelData = emp_data;
    this.innerTotalHrsWorked = 0;

    this.innerPanelData.check_in_out_details.map((el: any) => {
      if (el.no_of_hours_worked !== null && el.no_of_hours_worked !== undefined) {
        this.innerTotalHrsWorked += this.timeToHoursMinutes(el.no_of_hours_worked);
      }
    })

    // Convert total numerical hours to 'hours:minutes' format
    const totalHours = Math.floor(this.innerTotalHrsWorked);
    const totalMinutes = Math.round((this.innerTotalHrsWorked - totalHours) * 60);
    // console.log(totalHours, totalMinutes);
    if (totalHours === 0) {
      this.innerTotalHrsWorked = '00:' + totalMinutes.toString().padStart(2, '0');
    } else {
      this.innerTotalHrsWorked = totalHours.toString().padStart(2, '0') + ':' + totalMinutes.toString().padStart(2, '0');
    }

    const targetElement = document.getElementById(`collapseOne${i}`);

    // Check if the clicked panel is already open
    const isOpen = targetElement.classList.contains('in');

    // Close all previously opened panels (if needed)
    const previouslyOpened = document.querySelectorAll('.in.panel-collapse.collapse');

    previouslyOpened.forEach(panel => {
      if (panel !== targetElement) {
        panel.classList.remove('in');
      }
    });

    // Toggle visibility of the clicked panel (considering its state)
    if (!isOpen) {
      targetElement.classList.add('in'); // Open if not already open
    } else {
      targetElement.classList.remove('in'); // Close if already open
    }
  }

  timeToHoursMinutes(timeStr: any) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  }

  reprocess_punches() {
    this.from_date = $('#FromDate2').val();
    this.to_date = $('#ToDate2').val();

    this._AttendanceService.attendanceProcessEmployeeAttendance({
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empcodes: this.employee_data[0].emp_code.toString(),
      fromdate: this.from_date,
      todate: this.to_date
    }).subscribe({
      next: (resData: any) => {
        //  console.log(resData, 'Success');
        if (resData.statusCode) {
          // this.get_Last_sync_stataus_hub();
          this.toastr.success(resData.message, 'Success');
          this.TpCheckInOutSummary();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

}
