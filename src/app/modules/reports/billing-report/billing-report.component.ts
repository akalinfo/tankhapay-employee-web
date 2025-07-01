import { Component, ElementRef, ViewChild } from '@angular/core';
import { AttendanceService } from '../../attendance/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import jwtDecode from 'jwt-decode';
import * as XLSX from 'xlsx';
import { ReportService } from '../report.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { PayoutService } from '../../payout/payout.service';
import moment from 'moment';
declare var $:any;

@Component({
  selector: 'app-billing-report',
  templateUrl: './billing-report.component.html',
  styleUrls: ['./billing-report.component.css']
})
export class BillingReportComponent {
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
  product_type: any;
  month_data: any;
  rowData: any;
  monthYear: any;

  constructor(
    private _attendanceService: AttendanceService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private _ReportService: ReportService,
    private _payoutService: PayoutService,
  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    this.startDate = this.formatDate(new Date(currentYear, currentMonth, 1));
    this.endDate = this.formatDate(date);

    // this.get_reports_name();
    this.MonthwiseOnboardEmployeeCount();

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

  const columnMappings = [
    { key: 'onboardmonth', label: 'Month Year' },
    { key: 'employeecount', label: 'Number of Employees' },
    { key: 'Relievedcount', label: 'Number of Relieved Employees' },
    { key: 'cumulativeemployeecount', label: 'Total nos. of employees' }
  ];

  const dataForExcel = this.report_data.map(row => {
    const newRow = {};
    columnMappings.forEach(col => {
      newRow[col.label] = row[col.key];
    });
    return newRow;
  });

  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataForExcel, {
    skipHeader: false
  });

  const columnWidths = columnMappings.map(col => ({
    wch: Math.max(
      col.label.length,
      ...this.report_data.map(row => String(row[col.key] || '').length)
    )
  }));
  ws['!cols'] = columnWidths;

  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Billing Report');

  const timestamp = new Date().toISOString().slice(0, 10);
  const formattedDate = moment(timestamp, 'YYYY-MM-DD').format('DD-MM-YYYY');
  XLSX.writeFile(wb, `billing_report_${formattedDate}.xlsx`);

}


  get_audit_report() {
    // if (!this.selected_report) {
    //   this.toastr.error('Please select a report', 'Oops!');
    //   return;

    // }

    // let splitted_f = $('#FromDate').val().split("-", 3);
    // let splitted_t = $('#ToDate').val().split("-", 3);

    // let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    // let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    // // console.log(todt-fromdt);

    // if (todt - fromdt > 31) {
    //   $('#FromDate').val(this.startDate);
    //   $('#ToDate').val(this.endDate);
    //   this.toastr.error("Date difference should not be greater than 30 days", 'Oops!');
    //   return;
    // }

    this.report_data = [];
    this.month_data = [];
    this.displayedColumns = [];

    
    this._ReportService.manage_audit_report_wfm({
      'p_action': this.selected_report,
      'p_account_id': this.tp_account_id.toString(),
      'p_from_dt': this.startDate,
      'p_to_dt': this.endDate,
      'p_activity_emp_code': this.keyword,
    }).subscribe({
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

  setSelectedEmployee(rowData: any){
    this.monthYear = rowData?.onboardmonth;
    this.getMonthWiseOnboardingDetails();
  }

  MonthwiseOnboardEmployeeCount() {
    this._payoutService.GetMaster(
      {
        'actionType': 'MonthwiseOnboardEmployeeCount',
        'productTypeId': this.product_type,
        'customerAccountId': this.tp_account_id.toString(),
      }
    ).subscribe({
      next: (resData:any) => {
        if (resData.statusCode) {
          this.report_data = resData.commonData;
          // console.log("DATATA FOR COUNT---------",this.report_data)
          if (this.report_data.length > 0) {
            this.displayedColumns = Object.keys(this.report_data[0]);
          }
        } else {
          this.toastr.error(resData.message, "Oops!");
        }
      }
    })

  }

  // GET API CALL - Month Wise Onboarding Data
  getMonthWiseOnboardingDetails() {
    let obj =  {
        onBoardMonth: this.monthYear,
        customerAccountId: this.tp_account_id.toString(),
        productTypeId: this.product_type
      }
    
    this._payoutService.GetMonthWiseOnboardingData_url(obj).subscribe({
      next: (resData:any) => {
        if (resData.statusCode) {
          this.month_data = resData.commonData;
          // console.log("DATATA FOR Report/getMonthWiseOnboardingDetails---------",this.month_data)
        } else {
          this.toastr.error(resData.message, "Oops!");
        }
      }
    })

  }

  exportToExcel_MonthYear() {
    if (this.month_data.length === 0) {
      this.toastr.error('No data to export', 'Oops!');
      return;
    }
  
    // Prepare export data with only emp_name and orgempcode/tpcode
    const exportData = this.month_data.map(row => ({
      emp_name: row.emp_name,
      orgempcode: row.orgempcode || row.tpcode
    }));
  
    // Optional: Set export columns (this is now fixed instead of dynamic)
    const exportColumns = ['emp_name', 'orgempcode','tpcode','status','relieving_date'];
  
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData, {
      header: exportColumns,
      skipHeader: false
    });
  
    // Auto adjust column widths
    const columnWidths = exportColumns.map(col => ({
      wch: Math.max(
        col.length,
        ...exportData.map(row => String(row[col] || '').length)
      )
    }));
  
    ws['!cols'] = columnWidths;
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Onboarding Report');
  
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Employee_list-${this.monthYear}_${timestamp}.xlsx`);
  }
  

}
