import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import * as XLSX from 'xlsx';
declare var $: any;
import { ReportService } from '../../reports/report.service';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AttendanceService } from '../../attendance/attendance.service';
@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.css']
})
export class CheckInComponent {

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
  innerTotalHrsWorked: any = 0;
  loading: boolean = false;
  markStatus = '';
  sso_admin_id: any = '';
  constructor(
    public toastr: ToastrService,
    public _AttendanceService: AttendanceService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _alertservice: AlertService,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
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
    console.log(this.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.sso_admin_id = this.token.sso_admin_id;
    let currDate = new Date();

    this.to_date = this.formatDate(currDate);
    // console.log(this.to_date);

    this.checkin_Form = this._formBuilder.group({
      FromDate: [this.formatDate(currDate), [Validators.required]],
      ToDate: [this.formatDate(currDate), [Validators.required]],
      markedStatus: ['Marked', Validators.required]
    });

    this.TpCheckInOutSummary();

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
    this.router.navigate(['reports/check-in/check-in-by-emp-code'], { state: { emp_code: this.emp_code, id: this.id, designation: this.designation } });

    // else {
    //   this.toastr.info('Somthing went Wrong. Please try later.', 'Success');
    // }
  }

  TpCheckInOutSummary() {
    // this.from_date = $('#FromDate').val();


    this.loading = true;
    if ($('#ToDate').val() != '' && $('#ToDate').val() != null && $('#ToDate').val() != undefined) {
      this.to_date = $('#ToDate').val();
    }
    this.markStatus = this.checkin_Form.get('markedStatus')?.value?.toString();
    this._ReportService.GetTpCheckInOutSummary({
      // "fromDate": this.from_date,
      "fromDate": this.to_date,
      "toDate": this.to_date,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "flag": "normal_report",
      "GeoFenceId": this.token.geo_location_id,
      "checkInOutMarkedType": this.checkin_Form.get('markedStatus')?.value?.toString()
    }).subscribe((resData: any) => {
      console.log(resData);

      this.loading = false;
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
      "flag": "normal_report",
      "GeoFenceId": this.token.geo_location_id,
      "checkInOutMarkedType": this.checkin_Form.get('markedStatus')?.value?.toString()

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
            'In Time': this.data[idx].check_in_time,
            'Check In Location': this.data[idx].check_in_location,
            'Out Time': this.data[idx].check_out_time,
            'Check Out Location': this.data[idx].check_out_location,
            'No Of Hours Worked': this.data[idx].no_of_hours_worked,
            'Shift Name': this.data[idx].shift_name,
            'Auto Assign Shift': this.data[idx].is_auto_shift_assign,
            'Night Shift': this.data[idx].is_night_shift,
            'Break': formatBreakTotalTime(this.data[idx].break_total_time),
            // <td> {{emp.tpcode }}</td>
            // <td> {{emp.orgempcode }}</td>

            ' ': ' ',

          }
          // console.log(this.data[idx].check_in_out_details);

          if (this.data[idx].no_of_hours_worked !== '00:00' && this.data[idx].no_of_hours_worked !== undefined) {
            obj['Is Overtime Applicable'] = this.data[idx].is_overtime_applicable;
            obj['No Of Overtime Hours Worked'] = this.data[idx].no_of_overtime_hours_worked;
            obj['Deviation In Checkin'] = this.data[idx].deviation_in_checkin;
            obj['Deviation In Checkout'] = this.data[idx].deviation_in_checkout;
            obj['Deviation In Total Working Hours'] = this.data[idx].deviation_in_total_working_hours;
          }

          let i = 1;
          for (const details of this.data[idx].check_in_out_details) {
            obj['CheckIn ' + i] = details.check_in_time;
            obj['CheckOut ' + i] = details.check_out_time;
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
        downloadLink.download = 'Check_In_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
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
    // console.log(emp_data, 'eeeeeeeeeeee')
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
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  }

  synced_punches() {
    this.TpCheckInOutSummary();

    this.from_date = $('#ToDate').val();
    this.to_date = $('#ToDate').val();
    this._ReportService.process_att_punches_hub({
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "account_id": this.tp_account_id,
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      console.log(resData);

      if (resData.statusCode) {
        console.log(resData.message);

        // this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
      }

    });

  }

  exportToPdf() {
    let tableHtml = `<style>.table {
          border: 1px solid black;
          border-collapse: collapse;
        }
        .table th,
        .table td {
          border: 1px solid black;
          padding: 8px;
        }
      </style>`;
    tableHtml += `<p style="text-align:center;">Check In Check Out Report (${this.markStatus}-${this.to_date})</p>`;
    tableHtml += `<table class="table">`;
    tableHtml += `<tr>
                  <th>Attendance Date</th>
                  <th>Employee Code</th>
                  <th>TPCode</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Organisation Unit</th>
                  <th>Source</th>
                  <th>In Time</th>
                  <th>Check In</th>
                  <th>Out Time</th>
                  <th>Check Out</th>
                  <th>No Of</th>
                  <th>Shift Name</th>
                  <th>Auto Assign</th>
                  <th>Night Shift</th>
                  <th>Break</th>
                </tr>`;
    for (let emp of this.employee_data) {
      tableHtml += `<tr>
                                  <td>${emp.attendancedate || ''}</td>
                                  <td>${emp.orgempcode || ''}</td>
                                  <td>${emp.tpcode || ''}</td>
                                  <td>${emp.emp_name || ''}</td>
                                  <td>${emp.department || ''}</td>
                                  <td>${emp.designation || ''}</td>
                                  <td>${emp.assigned_ou_ids_names || ''}</td>
                                  <td>${emp.attendance_type || ''}</td>
                                  <td>${emp.check_in_time || ''}</td>
                                  <td>${emp.check_in_location || ''}</td>
                                  <td>${emp.check_out_time || ''}</td>
                                  <td>${emp.check_out_location || ''}</td>
                                  <td>${emp.no_of_hours_worked || ''}</td>
                                  <td>${emp.shift_name || ''}</td>
                                  <td>${emp.is_auto_shift_assign || ''}</td>
                                  <td>${emp.is_night_shift || ''}</td>
                                  <td>${this.formatBreakTotalTime(emp.break_total_time) || ''}</td>
                                </tr>`;
    }

    tableHtml += `</table>`;
    this._ReportService.generatePdfByCode({
      "htmlBody": tableHtml
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        const byteCharacters = atob(resData.commonData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new Blob([byteArray], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        a.download = 'checkin-checkout-report.pdf';
        a.click();
        URL.revokeObjectURL(fileURL);
      }
    })
  }
  reprocess_punches(emp_code: any) {
    this.from_date = $('#ToDate').val();
    this.to_date = $('#ToDate').val();

    this._AttendanceService.attendanceProcessEmployeeAttendance({
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empcodes: emp_code.toString(),
      fromdate: this.from_date,
      todate: this.to_date
    }).subscribe({
      next: (resData: any) => {
        console.log(resData, 'Success');
        if (resData.statusCode) {
          // this.get_Last_sync_stataus_hub();        
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

}