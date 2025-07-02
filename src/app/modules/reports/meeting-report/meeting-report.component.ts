import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import decode from 'jwt-decode';
import * as XLSX from 'xlsx';
declare var $: any;
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import { IstToGermanTimeService } from 'src/app/shared/services/ist-to-german-timezone.service';

@Component({
  selector: 'app-meeting-report',
  templateUrl: './meeting-report.component.html',
  styleUrls: ['./meeting-report.component.css']
})
export class MeetingReportComponent {
  showSidebar: boolean = true;
  product_type: any;
  Emp_code: any;
  id: any;
  designation: any;
  emp_code: any;
  data: any = [];
  employee_data: any = [];
  checkin_Form: FormGroup;
  is_overtime_applicable: any;
  no_of_overtime_hours_worked: any;
  deviation_in_checkin: any;
  deviation_in_checkout: any;
  deviation_in_total_working_hours: any;
  show_label: boolean = true;
  tp_account_id: any = '';
  token: any = '';
  currentDate: any;
  currentDateString: any;
  from_date: any;
  to_date: any;
  employer_name: any;
  year: any;
  tot_check_in: string = '';
  tot_check_out: string = '';
  pop_imgcheck_in_image_path: any = '';
  pop_check_out_image_path: any = '';
  innerPanelData: any = [];
  innerTotalHrsWorked: any = '00:00';
  showGermanTime: any = 'IST';

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _alertservice: AlertService,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    public istToGermanTimeService: IstToGermanTimeService,
    private router: Router) {
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
    this.employer_name = this.token.name;
    // console.log(this.employer_name);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    let currDate = new Date();

    this.to_date = this.formatDate(currDate);
    // console.log(this.to_date);

    this.checkin_Form = this._formBuilder.group({
      FromDate: [this.formatDate(currDate), [Validators.required]],
      ToDate: [this.formatDate(currDate), [Validators.required]]

    });

    this.TpCheckInOutSummary();

    if (localStorage.getItem('showGermanTime')) {
      this.showGermanTime = localStorage.getItem('showGermanTime');
    } else {
      localStorage.setItem('showGermanTime', 'IST');
      this.showGermanTime = 'IST';
    }

  }

  onTimezoneChange() {
    localStorage.setItem('showGermanTime', this.showGermanTime);
  }
  getGermanTime(time: string, date: string): string {
    return this.istToGermanTimeService.convertIstToGermanTime(time, date);
  }


  ngAfterViewInit() {
    // setTimeout(() => {
    //     $('#FromDate').datepicker({
    //         dateFormat: 'dd/mm/yy',
    //         changeMonth: true,
    //         changeYear: true,
    //     }).datepicker('setDate', new Date()); // Set current date as default
    // }, 500);

    setTimeout(() => {
      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date()); // Set current date as default
    }, 500);
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getEmp_code(employee: any, idx: any) {
    this.Emp_code = employee;
    this.id = idx;
    this.designation = this.Emp_code?.designation;
    // console.log(this.designation);
    this.emp_code = this.Emp_code?.emp_code;
    // if (this.id != '' && this.id != undefined){
    this.router.navigate(['reports/meeting_report/meeting_by_emp-code'], { state: { emp_code: this.emp_code, id: this.id, designation: this.designation } });

    // else {
    //   this.toastr.info('Somthing went Wrong. Please try later.', 'Success');
    // }
  }

  TpCheckInOutSummary() {
    // this.from_date = $('#FromDate').val();

    if ($('#ToDate').val() != '' && $('#ToDate').val() != null && $('#ToDate').val() != undefined) {
      this.to_date = $('#ToDate').val();
    }
    // console.log({
    //   // "fromDate": this.from_date,
    //   "fromDate": this.to_date,
    //   "toDate": this.to_date,
    //   "customerAccountId": this.tp_account_id.toString(),
    //   "productTypeId": this.product_type,
    //   "flag": "normal_report"
    // });

    this._ReportService.GetTpCheckInOutSummary({
      // "fromDate": this.from_date,
      "fromDate": this.to_date,
      "toDate": this.to_date,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "flag": "meeting_report",
      "GeoFenceId": this.token.geo_location_id,
      "reportType": "Meeting"
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.employee_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        console.log(this.employee_data);
        //this.tot_check_inout =
        this.countNonZeroCheckTime(this.employee_data);
        this.emp_code = this.employee_data?.emp_code;

        if (this.employee_data.length > 0) {
          this.innerPanelData = this.employee_data[0];
        }
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
      // "fromDate": this.from_date,
      "fromDate": this.to_date,
      "toDate": this.to_date,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "flag": "meeting_report",
      "GeoFenceId": this.token.geo_location_id,
      "reportType": "Meeting"
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));;
        console.log(this.data), 'AASDFGH';
        let exportData = [];
        let days = {};
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          // + resData.commonData[i].dayname;
          days = {
            ...days, [head]: ''
          }
        }

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
          const orgEmpCode = this.data[idx].orgempcode;
          const tpcode = this.data[idx].tpcode;
          const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;

          let check_in_time = this.data[idx].check_in_time && this.showGermanTime == 'CET' ? this.getGermanTime(this.data[idx].check_in_time, this.data[idx].check_in_date) : this.data[idx].check_in_time;
          let check_out_time = this.data[idx].check_out_time && this.showGermanTime == 'CET' ? this.getGermanTime(this.data[idx].check_out_time, this.data[idx].check_out_date) : this.data[idx].check_out_time;
          let obj = {
            'Attendance Date': this.data[idx].attendancedate,
            'User Code': tpOrgEmpCode,
            'User Name': this.data[idx].emp_name,
            'Designation': this.data[idx].designation,
            'In Time': check_in_time,
            'Check In Location': this.data[idx].check_in_location,
            'Out Time': check_out_time,
            'Check Out Location': this.data[idx].check_out_location,
            'No Of Hours Worked': this.data[idx].no_of_hours_worked,
            'Total Deliverables': this.data[idx].check_in_out_count,
            // 'Shift Name':this.data[idx].shift_name,
            // 'Auto Assign Shift':this.data[idx].is_auto_shift_assign,
            // 'Night Shift':this.data[idx].is_night_shift,
            // 'Break': formatBreakTotalTime(this.data[idx].break_total_time),
            // <td> {{emp.tpcode }}</td>
            // <td> {{emp.orgempcode }}</td>

            ' ': ' ',

          }
          // console.log(this.data[idx].check_in_out_details);

          // if (this.data[idx].no_of_hours_worked !== '00:00' && this.data[idx].no_of_hours_worked !== undefined) {
          //   obj['Is Overtime Applicable'] = this.data[idx].is_overtime_applicable;
          //   obj['No Of Overtime Hours Worked'] = this.data[idx].no_of_overtime_hours_worked;
          //   obj['Deviation In Checkin'] = this.data[idx].deviation_in_checkin;
          //   obj['Deviation In Checkout'] = this.data[idx].deviation_in_checkout;
          //   obj['Deviation In Total Working Hours'] = this.data[idx].deviation_in_total_working_hours;
          // }

          let i = 1;
          for (const details of this.data[idx].check_in_out_details) {
            let check_in_time = details.check_in_time && this.showGermanTime == 'CET' ? this.getGermanTime(details.check_in_time, details.check_in_date) : details.check_in_time;
            let check_out_time = details.check_out_time && this.showGermanTime == 'CET' ? this.getGermanTime(details.check_out_time, details.check_out_date) : details.check_out_time;

            obj['CheckIn ' + i] = check_in_time;
            obj['CheckOut ' + i] = check_out_time;
            obj['Wrkhrs ' + i] = details.no_of_hours_worked;
            obj['Meeting Name ' + i] = details.meeting_name;
            obj['Meeting Feedback' + i] = details.meeting_feedback;
            obj['Meeting Remarks' + i] = details.meeting_remarks;
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
        downloadLink.download = 'Meeting_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
      }
    })
  }

  countNonZeroCheckTime(jsonData: any) {
    let count1 = 0;
    let count2 = 0;

    for (const entry of jsonData) {
      if (entry.check_in_time !== '00:00') {
        count1++;
      }
      if (entry.check_out_time !== '00:00') {
        count2++;
      }

    }


    this.tot_check_in = count1.toString();
    this.tot_check_out = count2.toString();


    // return count;
  }

  getCheckInImage(checkin_image: any) {
    console.log(checkin_image);

    if (checkin_image != '' && checkin_image != null) {
      this.pop_imgcheck_in_image_path = checkin_image;

    }
    else {
      this.pop_imgcheck_in_image_path = '';
    }
  }
  getCheckOutImage(checkout_image: any) {
    console.log(checkout_image);
    if (checkout_image != '' && checkout_image != null) {
      this.pop_check_out_image_path = checkout_image;
    }
    else {
      this.pop_check_out_image_path = '';
    }
  }


  openPanel(i: number, emp_data: any) {
    this.innerPanelData = emp_data;
    this.innerTotalHrsWorked = 0;

    if (!Array.isArray(emp_data.check_in_out_details) || emp_data.check_in_out_details.length === 0) {
      console.warn('No check-in/out details available for the selected employee.');
      return; // Exit if no valid data is available
    }
    // Summing up total hours worked
    emp_data.check_in_out_details.forEach((el: any) => {
      this.innerTotalHrsWorked += this.timeToHoursMinutes(el.no_of_hours_worked);
    });

    // Format total hours as 'hh:mm'
    const totalHours = Math.floor(this.innerTotalHrsWorked);
    const totalMinutes = Math.round((this.innerTotalHrsWorked - totalHours) * 60);
    this.innerTotalHrsWorked = `${totalHours.toString().padStart(2, '0')}:${totalMinutes.toString().padStart(2, '0')}`;

    const targetElement = document.getElementById(`collapseOne${i}`);

    // Toggle the panel
    if (targetElement) {
      const isOpen = targetElement.classList.contains('in');
      document.querySelectorAll('.in.panel-collapse.collapse').forEach(panel => {
        if (panel !== targetElement) panel.classList.remove('in');
      });
      if (!isOpen) {
        targetElement.classList.add('in');
      } else {
        targetElement.classList.remove('in');
      }
    } else {
      console.warn(`Element with ID collapseOne${i} not found.`);
    }
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

  timeToHoursMinutes(timeStr: any) {
    if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
      // console.error(`Invalid time format: ${timeStr}`);
      return 0; // Return 0 for invalid or missing time strings
    }
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  }


  synced_punches() {
    this.from_date = $('#ToDate').val();
    this.to_date = $('#ToDate').val();
    this._ReportService.process_att_punches_hub({
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "account_id": this.tp_account_id,
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        console.log(resData.message);


        // this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
      }
      this.TpCheckInOutSummary();
    });

  }
}
