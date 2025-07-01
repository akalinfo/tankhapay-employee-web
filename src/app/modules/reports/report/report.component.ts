import { Component } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { PayoutService } from '../../payout/payout.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { environment } from 'src/environments/environment';
import { ReportService } from '../report.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { DateConversionService } from 'src/app/shared/services/date-conversion.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {
  showSidebar: boolean = true;
  token: any;
  tp_account_id: any;
  product_type: any = '';
  product_type_array: any[];
  product_type_text: any;
  is_insufficient_fund: boolean = false;
  month: any;
  year: any;
  selected_date: string;
  payout_data: any = [];
  decoded_token: any;
  sso_admin_id: string = '';
  payroll_report: any = [];
  statutory_report: any = [];
  dec_invstment_report: any = [];
  attendance_report: any = [];
  taxes_form_report: any = [];
  access_rights: any = [];
  leave_report: any = [];
  asset_report: any = [];
  Esic_and_UAN_report: any = [];
  Miscellaneous_report: any = [];
  visitor_report: any = [];
  invoicedetail: any = [];
  payout_json_data: any = [];
  is_prduction = environment.production;
  lbl_paymsg: string = '';
  constructor(
    private _SessionService: SessionService,
    private _PayoutService: PayoutService,
    private _EncrypterService: EncrypterService,
    private _MasterService: MasterServiceService,
    public toastr: ToastrService,
    private router: Router,
    private dateConversionService: DateConversionService) { }
  
  ngOnInit() {

    let session_obj_d: any = JSON.parse(
    this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);

    this.tp_account_id = this.token.tp_account_id;
    this.sso_admin_id = this.token.sso_admin_id
    // console.log('sso_admin_id=>', this.sso_admin_id);

    this.product_type = localStorage.getItem('product_type');

    this.product_type_text = this.product_type == '1' ? 'Social Security' : this.product_type == '2' ? 'Payrolling' : '';
    this.product_type_array = [];
    // console.log('ngOnInit=>sndknfsdknfkds');
    if (this.token['product_type'] == '1,2') {

      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }
    if (this.token['product_type'] == '1') {
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });

    }
    if (this.token['product_type'] == '2') {
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }

    if (localStorage.getItem('selected_date') != null && localStorage.getItem('selected_date') != undefined) {
      this.selected_date = localStorage.getItem('selected_date');
      this.month = this.selected_date.split('-')[1];
      this.year = this.selected_date.split('-')[2];
    } else {
      this.month = '';
      this.year = '';
    }
    // console.log(this.selected_date);

    // && environment.production
    // 6,151

    //&& environment.production 
    // commented for arpit for staging testing
    // add subusers accountid 3088 on production
    // allow nistha=> 98 / dharm=> 151/ satish => 153 and anirudh => 6 SSO for reports access aded 07.10.2024
    // 202 for s.pooja@akalinfo.com
    if (this.token.mobile != '7777777777' && this.sso_admin_id != '6' && this.sso_admin_id != '202'
      && this.sso_admin_id != '151' && this.sso_admin_id != '153' &&  this.sso_admin_id != '98' && environment.production
      && this.tp_account_id != '2719' && this.tp_account_id != '3088') {
      this.PayoutSummary();
    } else {
      this.getReportsModule();
     }
//end
    //this.PayoutSummary();


    // if (this.token.mobile == '7887990568') {
    //   this.is_insufficient_fund = true;
    // }

    localStorage.setItem('activeTab', 'id_Reports');

  }
  PayoutSummary() {

    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    if (currentMonth === 0) {
      this.month = 12;
      this.year = currentYear - 1;
    } else {
      this.month = currentMonth;
      this.year = currentYear;
    }
    //this.selected_date
    this.lbl_paymsg = this.dateConversionService.convertDate(
      (new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year)
    );
    // this.payoutDetail = '';
    // console.log("jkbsdckjbsdkjbfsdkj");
    let reqq: any;
    // if (this.month == '' && this.year == '') {
    //   reqq = {
    //     "customeraccountid": this.tp_account_id.toString(),
    //     "payouttype": "All",
    //     "month": this.month.toString(),
    //     "year": this.year.toString(),
    //     "productTypeId": this.product_type
    //   }
    // }
    // else {
    reqq = {
      "customeraccountid": this.tp_account_id.toString(),
      "payouttype": "All",
      "month": this.month.toString(),
      "year": this.year.toString(),
      "productTypeId": this.product_type
    }
    // }
    this._PayoutService
      .CustomerPayoutSummary(reqq)
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.payout_data = this._EncrypterService.aesDecrypt(resData.commonData);
          this.payout_json_data = JSON.parse(this.payout_data);
          console.log('ndjbsdkjf=>',this.payout_data);
          // as disscussed with yatin sir for check only invoicevalue is zero or not if 0 then show insufficient fund
          // if (JSON.parse(this.payout_data)[0]?.status == 'Low Balance') {

          console.log(JSON.parse(this.payout_data)[0]?.invoicevalue);
          if (JSON.parse(this.payout_data)[0]?.invoicevalue == '0') {
            this.is_insufficient_fund = true;
            let resq = {
              "amount": "0",
              "custumerAccountId": this.tp_account_id.toString(),
              "numOfAssociate": this.payout_json_data[0]?.totalemployees?.toString()
            }
            localStorage.setItem('paymentRequest', JSON.stringify(resq));
          } else {
            this.is_insufficient_fund = false;
          }
          console.log(this.is_insufficient_fund);
          this.getReportsModule();
        }

      }, (error: any) => {
        console.error(error);
        this.payout_json_data = [];
        this.getReportsModule();
      });


  }

  CalcReciebaleFromBaseAmount() {
    this._PayoutService.CalcReciebaleFromBaseAmount({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify({
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
        "baseAmount": "0",
        "numberOfEmployees": this.payout_json_data[0]?.totalemployees?.toString(),
        "is_credit_used": "N",
        "creditamount": "0",
        "productTypeId": this.product_type,
        "packageName": "Custom",
        "billtype": "",
        "invoicemonth": this.month?.toString(),
        "invoiceyear": this.year?.toString()
      }))
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
        this.invoicedetail = JSON.parse(resultJson);
        this.router.navigate(['reports/report_payment'], {
          state: { amount: "0",invoice_details: this.invoicedetail,invoice_val:this.payout_json_data[0].invoicevalue}
        });
      }
      else {
        this.invoicedetail = [];
        this.toastr.error(resData.message, 'Error');
      }
    }, (error: any) => {
      this.invoicedetail = [];
      this.toastr.error(error.error.message, 'Oops!');
    });

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getReportsModule() {

    this.access_rights = JSON.parse(localStorage.getItem('access_rights'));
    // console.log(this.access_rights);
    for (let idx = 0; idx < this.access_rights.length; idx++) {
      if (this.access_rights[idx].module_category == 'Payroll Overview') {
        this.payroll_report.push({
          modulename_display: this.access_rights[idx].modulename,
          linkname: this.access_rights[idx].linkname
        })
      } else if (this.access_rights[idx].module_category == 'Statutory Reports') {
        this.statutory_report.push({
          modulename_display: this.access_rights[idx].modulename,
          linkname: this.access_rights[idx].linkname
        })
      } else if (this.access_rights[idx].module_category == 'Declarations & Investments') {
        this.dec_invstment_report.push({
          modulename_display: this.access_rights[idx].modulename,
          linkname: this.access_rights[idx].linkname
        })
      } else if (this.access_rights[idx].module_category == 'Attendance Report') {
        this.attendance_report.push({
          modulename_display: this.access_rights[idx].modulename,
          linkname: this.access_rights[idx].linkname
        })
      } else if (this.access_rights[idx].module_category == 'Taxes and Forms') {
        this.taxes_form_report.push({
          modulename_display: this.access_rights[idx].modulename,
          linkname: this.access_rights[idx].linkname
        })
      }
      // leave_report
      else if (this.access_rights[idx].module_category == 'Leave Reports') {
        this.leave_report.push({
          modulename_display: this.access_rights[idx].modulename,
          linkname: this.access_rights[idx].linkname
        })
      }
      //"Asset Report"
      else if (this.access_rights[idx].module_category == 'Asset Report') {
        this.asset_report.push({
          modulename_display: this.access_rights[idx].modulename,
          linkname: this.access_rights[idx].linkname
        })
      }

      //visitor Report
      else if (this.access_rights[idx].module_category == 'Visitors Report') {
        this.visitor_report.push({
          modulename_display: this.access_rights[idx].modulename,
          linkname: this.access_rights[idx].linkname
        })
      }
      else if (this.access_rights[idx].module_category == 'ESIC & UAN Reports') {
        this.Esic_and_UAN_report.push({
          modulename_display: this.access_rights[idx].modulename,
          linkname: this.access_rights[idx].linkname
        })
      }
      else if (this.access_rights[idx].module_category == 'Miscellaneous Report') {
        this.Miscellaneous_report.push({
          modulename_display: this.access_rights[idx].modulename,
          linkname: this.access_rights[idx].linkname
        })
      }
    }
  }

}
