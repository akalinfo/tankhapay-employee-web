import { Component } from '@angular/core';
import { ReportService } from '../report.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { dongleState, grooveState } from 'src/app/app.animation';

@Component({
  selector: 'app-increment-report',
  templateUrl: './increment-report.component.html',
  styleUrls: ['./increment-report.component.css'],
  animations: [grooveState, dongleState]
})
export class IncrementReportComponent {
  isShowRoundedVal: boolean = false;
  showSidebar: boolean = true;
  product_type: any;
  tp_account_id: any;
  fromDate: any = '';
  toDate: any = '';
  empCode: any = '';
  maxDate: string;
  reportData: any = [];
  empCodeReport: any = [];
  isShowEmpCodeReport: boolean = false;
  filteredReportData: any = [];

  constructor(private _reportService: ReportService,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService
  ) {

  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    let token: any = decode(session_obj_d.token);
    this.tp_account_id = token.tp_account_id;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    const today = new Date();
    // Format today's date as YYYY-MM-DD
    this.maxDate = today.toISOString().split('T')[0];
    this.fromDate = new Date().toISOString().split('T')[0]
    this.toDate = new Date().toISOString().split('T')[0];
    this.getIncrementReport();
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getIncrementReport() {

    let action = this.empCode ? 'EmpIncrReportReport' : 'DetailedReport';
    let fromDate = new Date(this.fromDate).toLocaleDateString('en-GB');

    const toDate = new Date(this.toDate).toLocaleDateString('en-GB');
    this._reportService.incrementReportBusiness({
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id,
      fromDate: fromDate,
      toDate: toDate,
      action: action,
      empCode: this.empCode
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (action == 'DetailedReport') {
          this.reportData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          this.filteredReportData = this.reportData;
        }
        else
          this.empCodeReport = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
      } else {
        if (action == 'DetailedReport')
          this.reportData = [];
        else
          this.empCodeReport = [];
      }
    })
  }
  search(key: any) {
    let searchKey = key.target.value;
    this.filteredReportData = this.reportData.filter(ele => {
      return (ele.emp_code.toString().toLowerCase().includes(searchKey.trim())
        || ele.emp_name.toString().toLowerCase().includes(searchKey.trim())
        || ele.cjcode.toString().toLowerCase().includes(searchKey.trim()))
    }
    )
  }

  onDateChange(event: any) {
    const formattedDate = new Date(event).toLocaleDateString('en-GB'); // e.g., DD/MM/YYYY
    console.log('Formatted Date:', this.fromDate);
  }

  getEmpCodeReport(emp_code) {
    this.empCode = emp_code;
    this.isShowEmpCodeReport = true;
    let body: HTMLElement = document.querySelector('body');
    if (body) body.classList.add('modal-open');
    this.getIncrementReport();
  }

  hideModal() {
    this.empCode = '';
    this.isShowEmpCodeReport = false;
    let body: HTMLElement = document.querySelector('body');
    if (body) body.classList.remove('modal-open')
    this.empCodeReport = [];
  }
  getRoundedVal(val: any) {
    return (val ? Math.round(val) : '0');
  }
  truncateToTwoDecimals(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }

    const numericValue = Number(value);
    return (Math.floor(numericValue * 100) / 100).toFixed(2);
  }
}