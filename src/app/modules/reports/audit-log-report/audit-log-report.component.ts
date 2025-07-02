import { Component, ElementRef, ViewChild } from '@angular/core';
import { AttendanceService } from '../../attendance/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import jwtDecode from 'jwt-decode';
import * as XLSX from 'xlsx';
import { ReportService } from '../report.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { FilterField } from '../common-filter/filter.model';

declare var $: any;

@Component({
  selector: 'app-audit-log-report',
  templateUrl: './audit-log-report.component.html',
  styleUrls: ['./audit-log-report.component.css'],
  animations: [grooveState, dongleState,],

})
export class AuditLogReportComponent {
  showSidebar: boolean = true;
  decoded_token: any;
  tp_account_id: any;
  keyword: any = '';
  timeoutId: any;

  mark_att_type: any = '';
  mark_remarks: any = '';
  mark_leave_type: any = '';
  single_selected_index: any = '';
  // addOnFilters: FilterField[] = [];
  isSideBar: boolean = false;

  startDate: any;
  endDate: any;
  selected_report: any = '';
  reports_name_master: any = [];
  report_data: any = [];
  displayedColumns: any = [];

  constructor(
    private _attendanceService: AttendanceService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private _ReportService: ReportService,
  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    // console.log("TOKEN", this.decoded_token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    this.startDate = this.formatDate(new Date(currentYear, currentMonth, 1));
    this.endDate = this.formatDate(date);

    this.get_reports_name();

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  ngAfterViewInit() {

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.startDate);

      $('#ToDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.endDate);

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });

    }, 100);

  }

  formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}-${mm}-${yy}`;
  }


  search() {
    // this.keyword = key;
    // if (this.timeoutId) {
    //   clearTimeout(this.timeoutId);
    // }
    // this.timeoutId = setTimeout(() => {
    //   ;
    // }, 500)
  }


  exportToExcel() {
    if (this.report_data.length === 0) {
      this.toastr.error('No data to export', 'Oops!');
      return;
    }

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.report_data, {
      header: this.displayedColumns,
      skipHeader: false
    });

    const columnWidths = this.displayedColumns.map(col => ({
      wch: Math.max(
        col.length,
        ...this.report_data.map(row => String(row[col] || '').length)
      )
    }));
    ws['!cols'] = columnWidths;


    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Report');

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `audit_log_report_${timestamp}.xlsx`);

  }

  get_audit_report() {
    if (!this.selected_report) {
      this.toastr.error('Please select a report', 'Oops!');
      return;
    }

    if (this.selected_report != 'get_activity_logs' && !this.keyword) {
      this.toastr.info('Please enter an Emp Code!', 'Oops!');
      return;
    }

    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];

    // if (todt - fromdt > 31) {
    //   $('#FromDate').val(this.startDate);
    //   $('#ToDate').val(this.endDate);
    //   this.toastr.error("Date difference should not be greater than 30 days", 'Oops!');
    //   return;
    // }

    this.report_data = [];
    this.displayedColumns = [];

    let obj = {
      'p_action': this.selected_report,
      'p_account_id': this.tp_account_id.toString(),
      'p_from_dt': this.startDate,
      'p_to_dt': this.endDate,
      'p_activity_emp_code': this.keyword
    }

    this._ReportService.manage_audit_report_wfm(obj).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.report_data = resData.commonData;
          if (this.report_data.length > 0) {
            this.displayedColumns = Object.keys(this.report_data[0]);
          }
        } else {
        }
      }
    })
  }

  get_reports_name() {
    this._ReportService.manage_audit_report_wfm({
      'p_action': 'log_report_maste_type',
      'p_account_id': this.tp_account_id.toString(),
      'p_from_dt': this.startDate,
      'p_to_dt': this.endDate,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.reports_name_master = resData.commonData;
        } else {
          this.reports_name_master = [];
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

    // if (todt - fromdt > 5) {
    //   $('#FromDate').val(this.startDate);
    //   $('#ToDate').val(this.endDate);
    //   this.toastr.error("Date difference should not be greater than 5 days", 'Oops!');
    // }

     if (todt >= fromdt) {
      this.startDate = $('#FromDate').val();
      this.endDate = $('#ToDate').val();
    }
    else {
      $('#FromDate').val(this.startDate);
      $('#ToDate').val(this.endDate);
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }
    // console.log(this.startDate, this.endDate);
    
  }


}
