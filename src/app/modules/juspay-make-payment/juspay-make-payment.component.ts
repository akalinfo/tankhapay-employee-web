import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { LoginService } from '../login/login.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { GlobalConstants } from 'src/app/shared/global-constants';
import jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-make-payment',
  templateUrl: './juspay-make-payment.component.html',
  styleUrls: ['./juspay-make-payment.component.css']
})
export class JuspyMakePaymentComponent {

  invoicedetail: any;
  data: any = [];
  rupees_words: string;
  roundDiff: any = '';
  routerData: any = {};
  token: any;
  paymnet_status: boolean = false;
  paymnet_status_msg: any = '';
  constructor(
    private _EncrypterService: EncrypterService,
    private toastr: ToastrService,
    private _LoginService: LoginService,
    private route: ActivatedRoute,
    private router: Router,

  ) {
    this.route.queryParams.subscribe(params => {
      try {
        // console.log(params);

        const base64EncodedData = decodeURIComponent(params['data'] || '{}');
        // console.log('Base64 Encoded Data:', base64EncodedData);

        const encryptedData = atob(base64EncodedData);
        // console.log('Encrypted Data:', encryptedData);

        const decryptedData = this._EncrypterService.aesDecrypt(encryptedData);
        // console.log('Decrypted Data:', decryptedData);

        const data = JSON.parse(decryptedData);

        if (Object.keys(data).length !== 0) {
          this.routerData = data;
          this.validate_paymentlink_by_orderid();
        }
      } catch (error) {
        console.error('Error processing the payment data:', error);
        this.toastr.error('Failed to process the payment data.', 'Error');
      }
    });
  }


  ngOnInit() {
    // this.direct_login();
    // this.get_receivable_detail();
  }

  validate_paymentlink_by_orderid() {
    this._LoginService.validate_paymentlink_by_orderid({
      'orderid': this.routerData.orderid,
      'invoiceno': this.routerData.invoiceno,
      'account_id': this.routerData.account_id,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          if (resData.msgcd == '0') {
            this.toastr.info(resData.message, 'Info!');
            this.paymnet_status = true;
            this.paymnet_status_msg = resData.message;
            setTimeout(() => window.close(), 5000);
          } else {
            this.direct_login();
          }
        } else {
          this.toastr.error(resData.message, 'Oops!');
          this.paymnet_status = true;
          this.paymnet_status_msg = resData.message;
        }

      }, error: (e) => {
        console.log(e);
      }
    })
  }

  direct_login() {
    this._LoginService.direct_login({
      'mobile': this.routerData.mobile,
    })
      .subscribe({
        next: (resData: any) => {

          if (resData.status == 'True') {

            localStorage.setItem('activeUser', JSON.stringify(resData));

            if (resData.token) {
              this.token = jwtDecode(resData.token);
              this.get_receivable_detail();
              // let signup_flag = this.token.signup_flag;
              // let gstin_no_isverify_y_n = this.token.gstin_no_isverify_y_n;
              // let user_type = this.token.user_type;
              // console.log(signup_flag);

              // if (this.prev_signup_flag == 'AV' || this.prev_signup_flag == 'PT' || this.prev_signup_flag == 'CD' || this.prev_signup_flag == 'EA' || this.prev_signup_flag == 'SPI') {
              //   if (user_type == 'Business') {
              //     if (gstin_no_isverify_y_n != 'Y') {
              //       this.router.navigate(['/dashboard/welcome']);
              //     } else if (gstin_no_isverify_y_n == 'Y') {
              //       // this.router.navigate(['/dashboard']);
              //       this.router.navigate(['/dashboard/welcome']);
              //     }
              //   } else if (user_type == 'Individual') {
              //     localStorage.setItem('default_url', '/dashboard');
              //     // this.router.navigate(['/dashboard']);
              //     this.router.navigate(['/dashboard/welcome']);
              //   }


              // } else if (this.prev_signup_flag == 'SP') {
              //   this.router.navigate(['/accounts']);

              // }
            }
          } else {
            this.toastr.error(resData.msg, 'Error');
          }

        }, error: (e) => {
          console.log(e);
        }
      })
  }

  get_receivable_detail() {
    this.data = [];

    let date = new Date();
    let dd: any = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let mm: any = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
    let yy = date.getFullYear();

    let date2 = new Date(yy - 1, mm - 1, dd);
    let dd2: any = date2.getDate() < 10 ? '0' + date2.getDate() : date2.getDate();
    let mm2: any = date2.getMonth() + 1 < 10 ? '0' + (date2.getMonth() + 1) : date2.getMonth() + 1;
    let yy2 = date2.getFullYear();
    // console.log(dd2, mm2, yy2, date2);

    const from_date = dd2 + '/' + mm2 + '/' + yy2;
    const to_date = dd + '/' + mm + '/' + yy;
    // return;
    this._LoginService.get_receivable_detail({
      "fromDate": from_date,
      "toDate": to_date,
      "customerAccountId": this.routerData.account_id,
      // "status": 'Paid',
      "status": 'All',
      "searchKeyword": this.routerData.invoiceno,
    }).subscribe((resData: any) => {
      //  console.log(resData);
      if (resData.statusCode) {
        let temp = ((JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))));
        // console.log(temp);
        let payment_status = temp[0]?.status;
        if (payment_status == 'Failed') {
          this.paymnet_status = true;
          this.paymnet_status_msg = 'Payment failed for this invoice number. Please contact the TankhaPay team for a new payment link.';

          this.toastr.info('Payment failed for this invoice number. Please contact the TankhaPay team for a new payment link.', 'Info');
          setTimeout(() => window.close(), 5000);
        } else if (payment_status == 'Paid') {
          this.paymnet_status = true;
          this.paymnet_status_msg = 'The order invoice has already been paid. Please contact the TPay Operations Team for further assistance.';
          this.toastr.success('The order invoice has already been paid. Please contact the TPay Operations Team for further assistance', 'Success');
          setTimeout(() => window.close(), 5000);
        } else if (payment_status == 'Pending') {
          this.data = temp;
          this.generateInvoice();
        }

        // this.changeInvoice(this.invoice_filter_val);
        // this.toastr.success(resData.message);

      } else {
        this.data = [];
        this.toastr.error(resData.message);
      }
    });

  }

  generateInvoice() {
    this.invoicedetail = this.data[0];

    // this.InvoiceModalStatus = true;
    var amount: any = parseFloat(this.invoicedetail.netamountreceived);

    this.roundDiff = ((Math.round(amount)) - amount).toFixed(2);
    amount = amount + parseFloat(this.roundDiff);

    var fraction = Math.round(this.frac(amount) * 100);
    var f_text = "";
    if (fraction > 0) {
      f_text = "and " + this.convert_number(fraction) + " Paisa";
    }


    if (this.invoicedetail.entrytype == 'Invoice' && this.invoicedetail.adjustment_amount != '') {
      // amount = this.receiable_Details[index].receipt_amount
      amount = this.invoicedetail.netamountreceived - this.invoicedetail.adjustment_amount
    }

    if (this.invoicedetail.entrytype == 'Receipt') {
      // amount = this.receiable_Details[index].receipt_amount
      amount = this.invoicedetail.netamountreceived + this.invoicedetail.netamountreceived_invoice
      if (this.invoicedetail.adjustment_amount != 0 || this.invoicedetail.adjustment_amount_invoice != 0) {
        amount = amount - this.invoicedetail.adjustment_amount_invoice
      }
    }

    if (this.invoicedetail.entrytype == 'Invoice' && this.invoicedetail.adjustment_amount != '') {
      // amount = this.receiable_Details[index].receipt_amount
      amount = this.invoicedetail.netamountreceived - this.invoicedetail.adjustment_amount
    }

    if (this.invoicedetail.adjustment_amount != '' && this.invoicedetail.adjustment_amount != null) {
      // amount = amount-parseFloat(this.receiable_Details[index].adjustment_amount);
    }
    let words = this.convert_number(amount) + " Rupees " + f_text + " Only";
    this.rupees_words = words;

    console.log(this.invoicedetail);

  }

  convert_number(number) {
    // console.log('number: ' + number);
    if ((number < 0) || (number > 999999999)) {
      return "NUMBER OUT OF RANGE!";
    }
    var Gn = Math.floor(number / 10000000);
    number -= Gn * 10000000;
    var kn = Math.floor(number / 100000);
    number -= kn * 100000;
    var Hn = Math.floor(number / 1000);
    number -= Hn * 1000;
    var Dn = Math.floor(number / 100);
    number = number % 100;
    var tn = Math.floor(number / 10);
    var one = Math.floor(number % 10);
    var res = "";

    if (Gn > 0) {
      res += (this.convert_number(Gn) + " Crore");
    }
    if (kn > 0) {
      res += (((res == "") ? "" : " ") +
        this.convert_number(kn) + " Lakh");
    }
    if (Hn > 0) {
      res += (((res == "") ? "" : " ") +
        this.convert_number(Hn) + " Thousand");
    }
    if (Dn) {
      res += (((res == "") ? "" : " ") +
        this.convert_number(Dn) + " Hundred");
    }

    var ones = Array("", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen");

    var tens = Array("", "", "Twenty", "Thirty", "Fourty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety");

    if (tn > 0 || one > 0) {
      if (!(res == "")) {
        res += " ";
      }
      if (tn < 2) {
        res += ones[tn * 10 + one];
      }
      else {
        res += tens[tn];
        if (one > 0) {
          res += (" " + ones[one]);
        }
      }
    }
    if (res == "") {
      res = "Zero";
    }
    return res;
  }

  frac(f: any) {
    return f % 1;
  }

  returnSum_2(val4: any, val5: any) {
    let a1 = val4 == '' || isNaN(val4) ? 0 : parseFloat(val4);
    let b1 = val5 == '' || isNaN(val5) ? 0 : parseFloat(val5);

    return a1 + b1;
  }
  returnSum_3(val1: any, val2: any, val3: any) {
    let a1 = val1 == '' || isNaN(val1) ? 0 : parseFloat(val1);
    let a2 = val2 == '' || isNaN(val2) ? 0 : parseFloat(val2);
    let a3 = val3 == '' || isNaN(val3) ? 0 : parseFloat(val3);

    return a1 + a2 + a3;
  }


  juspayRedirectbtn() {

    // Open for public on dated 29.06.2024 as discussed with Yatin sir and andy sir
    /* let juspay_redirect_flag = ((this.token.sso_admin_id != ''
       && this.token.sso_admin_id != null
       && this.token.sso_admin_id != undefined
     ) ? true : false);
 
     //environment.production == true  &&
     if (juspay_redirect_flag == false) {
       this.toastr.info(GlobalConstants.juspaymsg, 'Info!');
       return;
     }
       */

    // if (environment.production == false) {
    //   this.toastr.info(GlobalConstants.juspaymsg_stg, 'Info!');
    //   return;
    // }

    let description = this.routerData.action == 'renew_subscription' ? 'Add Balance ' : 'Starting Payment';

    // console.log(this.routerData);
    this._LoginService.jusPaySessionOrder({
      'order_id': this.routerData.invoiceno,
      'amount': this.routerData.amount,
      'customerAccountId': this.routerData.account_id,
      'email': this.token.userid,
      'mobile': this.routerData.mobile,
      'description': description,
      'firstName': this.routerData.firstName,
      'lastName': '-',
    }).subscribe({
      next: (resData: any) => {
        // console.log(resData);

        // Redirecting to payment link which is received from merchant server after Session API S2S call
        window.location.replace(resData.payment_links.web);

      }, error: (e) => {
        // this.showPaymentScreen = false
        this.toastr.error(e.error.message);
      }
    })
  }

}
