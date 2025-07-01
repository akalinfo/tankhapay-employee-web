import { Component } from '@angular/core';
import { ReportService } from '../report.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import * as XLSX from 'xlsx';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dsr-da-report',
  templateUrl: './dsr-da-report.component.html',
  styleUrls: ['./dsr-da-report.component.css']
})
export class DsrDaReportComponent {

  showSidebar: boolean = true;
  yearArr: any = [];
  tp_account_id: any;
  sso_admin_id: any;
  month: any;
  year: any;
  jivo_DSRDA_data: any = [];
  // *ngIf="(this.sso_admin_id !='' || this.tp_account_id=='2719') "
  constructor(
    private _reportService: ReportService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
  ) { }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    let token: any = decode(session_obj_d.token);
    this.tp_account_id = token.tp_account_id;
    this.sso_admin_id = token.sso_admin_id;
    // console.log(token);
    // this.emp_mobile = token.mobile;
    // this.employer_id = token.id;  

    let date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    // let mm = date.getMonth() + 1;
    let yy = 2024
    //date.getFullYear();

    if (currentMonth === 0) {
      this.month = 12;
      this.year = currentYear - 1;
    } else {
      this.month = currentMonth;
      this.year = currentYear;
    }
    for (let i = yy; i <= date.getFullYear() + 1; i++) {
      this.yearArr.push(i);
    }
    this.getJivoDSRDA_data();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  SaveJivoDsrDaData() {
    if (this.tp_account_id == '2719' ||  environment.production == false) {
      this._reportService.SaveJivoDsrDaData({
        account_id: this.tp_account_id.toString(),
        month: this.month,
        year: this.year,
      }).subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.toastr.success(resData.message, 'Success');
            this.getJivoDSRDA_data();
          } else {
            this.toastr.error(resData.message, 'Oops!');
          }
        }, error: (e) => {
          console.log(e);
        }
      })
    } else {
      this.toastr.info('This Feature avaiable for only Jivo Client', 'Oops!');
    }

  }

  getJivoDSRDA_data() {

    this._reportService.getJivoDSRDA_data({
      account_id: this.tp_account_id.toString(),
      month: this.month,
      year: this.year,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.jivo_DSRDA_data = [];
          this.jivo_DSRDA_data = resData.commonData;
        } else {
          this.jivo_DSRDA_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.jivo_DSRDA_data = [];
        console.log(e);
      }
    })
  }
  SearchMonthYear() {
    this.getJivoDSRDA_data();
  }
  download_excel() {
    let exportData = [];

    this.jivo_DSRDA_data.map((el: any, i: any) => {
      let obj = {};
      obj = {
        'Month-Year': this.convert_Num_to_Month(el.month, el.year) + '-' + el.year,
        'EmployeeCode': el.personid,
        'Days Per Month': el.days_per_month,
        'Employee Name': !el.emp_name ? 'Not Found' : el.emp_name,
      }
      exportData.push(obj);
    })

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    let date = new Date()
    downloadLink.download = `DSR-DA-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
    downloadLink.click();
  }

  convert_Num_to_Month(num: any, year: any) {
    let date = new Date(year, num - 1, 1);
    let month = date.toLocaleDateString('en-US', { month: 'long' });
    return month;
  }

}
