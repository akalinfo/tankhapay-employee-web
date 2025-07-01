import { Component } from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { ToastrService } from 'ngx-toastr';

declare var $: any;

@Component({
  selector: 'app-sync-attendance',
  templateUrl: './sync-attendance.component.html',
  styleUrls: ['./sync-attendance.component.css']
})
export class SyncAttendanceComponent {

  showSidebar: boolean = true;
  att_data: any = [];
  startDate: any;
  endDate: any;

  constructor(
    private _attendanceService: AttendanceService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {

    const current_date = new Date();
    const january15 = new Date(2025, 0, 15);
    const minDate = current_date > january15 ? current_date : january15;

    this.startDate = this.formatDate(minDate);
    this.endDate = this.formatDate(minDate);
    this.fetchAttendancefromClient();
  }

  ngAfterViewInit() {

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(2025, 0, 15),
      }).datepicker('setDate', this.startDate);

      $('#ToDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        minDate: new Date(2025, 0, 15),
      }).datepicker('setDate', this.endDate);

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });

    }, 100);

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}-${mm}-${yy}`;
  }

  fetchAttendancefromClient() {
    let splitted_f = this.startDate.split('-');
    let splitted_t = this.endDate.split('-');

    // console.log(' this.startDate', this.startDate,' this.endDate', this.endDate);

    let fromdt: any = splitted_f[2] + '-' + splitted_f[1] + '-' + splitted_f[0];
    let todt: any = splitted_t[2] + '-' + splitted_t[1] + '-' + splitted_t[0];

    // console.log(fromdt, todt);

    this._attendanceService.fetchAttendancefromClient({
      'from_date': fromdt,
      'to_date': todt,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.att_data = resData.commonData;
          // console.log("ATT CLIENT API DATA --",this.att_data);

        } else {
          this.att_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  saveAttendancefromClient() {

    const updatedArray = this.att_data.map(item => {
      const formattedLogDate = item.LogDate.replace(/[-T:]/g, '') + item.UserId;
      const { LogDate, SerialNumber, UserId, DeviceSName, ...rest } = item;
      return { ...rest, txn_id: formattedLogDate, org_empcode: UserId, emp_name: '', punch_datetime: item.LogDate, machine_serial_no: SerialNumber, machine_ip: DeviceSName };
    });
    // return;

    this._attendanceService.saveAttendancefromClient({
      'punchingDetails': updatedArray,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          if (resData.message == "Device Serial Number Not Registered") {
            this.toastr.info(resData.message, 'Info');
          } else {
            this.toastr.success(resData.message, 'Success');
          }

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  filterFromToDateLeads() {
    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    // console.log(todt-fromdt);

    if (todt - fromdt > 30) {
      $('#FromDate').val(this.startDate);
      $('#ToDate').val(this.endDate);
      this.toastr.error("Date difference should not be greater than 5 days", 'Oops!');

    } else if (todt >= fromdt) {
      this.startDate = $('#FromDate').val();
      this.endDate = $('#ToDate').val();

      this.fetchAttendancefromClient();
    }
    else {
      $('#FromDate').val(this.startDate);
      $('#ToDate').val(this.endDate);
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }

    // console.log(this.startDate, this.endDate);
  }

}
