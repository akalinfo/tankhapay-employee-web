import { Component, ElementRef, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import decode from 'jwt-decode'
import { SessionService } from 'src/app/shared/services/session.service';
import { LoginService } from '../../login.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as QRCode from 'qrcode';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-starting-balance',
  templateUrl: './starting-balance.component.html',
  styleUrls: ['./starting-balance.component.css'],
  animations: [dongleState, grooveState],
})
export class StartingBalanceComponent implements OnDestroy {

  customerAccountId: any = "";
  customAmount: any = 0;
  packageList: any = [];
  packagestatus: boolean = false;
  addPaymentForms: FormGroup;
  selectPackageValue: any = '';
  product_type: any = '';
  tp_account_id: any = '';
  token: any = '';
  invoicedetail: any = [];

  calPaymentStatus: any = '2';
  selectedPackage: any = "Starting Payment";
  vpaDetails: any = "";
  bankDetailModalStatus: boolean = false;
  alertManualTransferStatus: boolean = false;
  numOfAssociate: any = '0';
  qrUrl: any = '';
  isShowQr: boolean = false;
  emp_mobile: any;
  signup_flag: any;
  // intervalId: any;
  remaining: number = 0;
  timerId: any;
  formattedTime: string = '';
  private ngUnsubscribe = new Subject<void>();
  @ViewChild('qrcode', { static: false }) qrcode: ElementRef;
  // showPaymentScreen: boolean = false;
  // @ViewChild('juspayDiv') juspayDiv: ElementRef;

  constructor(
    private route: Router,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private _LoginService: LoginService,
    public toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private _alertservice: AlertService

  ) {
    if (this.route.getCurrentNavigation().extras.state != null || this.route.getCurrentNavigation().extras.state != undefined) {
      this.product_type = this.route.getCurrentNavigation().extras.state.product_type;
      this.customAmount = this.route.getCurrentNavigation().extras.state.starting_pay_amt;
      this.emp_mobile = this.route.getCurrentNavigation().extras.state.mobile;

      // console.log(this.product_type);
      // console.log(this.customAmount);
    }

    this.route.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      takeUntil(this.ngUnsubscribe)
    ).subscribe((event: NavigationEnd) => {
      // Check if you are leaving the current component
      if (event.url !== '/login/starting-balance') {
        this.stopTimer();
      }
    });

  }

  ngOnInit() {

    let isLoggedIn = this._SessionService.check_user_session();

    if (isLoggedIn) {

      let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
      // this.product_type = localStorage.getItem('product_type');

      // let userRequest:any = localStorage.getItem('paymentRequest');
      // userRequest = JSON.parse(userRequest);

      // this.customerAccountId =userRequest.customerAccountId;
      // this.customAmount = userRequest.amount;
      // this.numOfAssociate = userRequest.numOfAssociate;

      this.token = decode(session_obj_d.token);
      this.tp_account_id = this.token.tp_account_id;

      console.log(this.token)

      this.addPaymentForms = this._formBuilder.group({
        customAmount: [this.customAmount]
      })
      this.CalcReciebaleFromBaseAmount('Starting Payment', this.customAmount)
    } else {
      localStorage.clear();
      this.route.navigate(['/login']);
      return;
    }
  }
  backtoOnBoarding() {
    this.route.navigate(['/login/onboarding'], { state: { mobile: this.emp_mobile } });

  }

  submitPayInvoice(calJson: any) {

    // console.log(calJson);
    let resq = {
      "customeraccountid": calJson.customeraccountid,
      "numberofemployees": calJson.numberofemployees,
      "netamountreceived": calJson.netamountreceived,
      "servicechargerate": calJson.servicechargerate,
      "servicechargeamount": calJson.servicechargeamount,
      "gstmode": calJson.gstmode,
      "sgstrate": calJson.sgstrate,
      "sgstamount": calJson.sgstamount,
      "cgstrate": calJson.cgstrate,
      "cgstamount": calJson.cgstamount,
      "igstrate": calJson.igstrate,
      "igstamount": calJson.igstamount,
      "netvalue": calJson.baseamount,
      "source": "Web",
      "created_by": calJson.customeraccountid,
      "createdbyip": ":::1",
      "invoicetype": "",
      "service_name": calJson.service_name,
      "package_name": this.selectedPackage,
      "productTypeId": this.product_type
    }

    // console.log(resq);
    this.saveReceivable(resq);
  }

  bankTransferButton() {
    let resq = {
      'customerAccountId': this._EncrypterService.aesEncrypt((this.tp_account_id).toString())
    }
    this.getVpaDetails(resq);
  }


  getVpaDetails(resq: any) {
    this._LoginService.getVpaDetails({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify(resq))
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode == true) {
            let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
            resultJson = JSON.parse(resultJson);
            this.vpaDetails = resultJson;
            this.bankDetailModalStatus = true;
          }
          else {
            this.bankDetailModalStatus = false;
            this.vpaDetails = '';
            // this.toastr.error(resData.message, 'Error');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);
          }
        }, error: (e: any) => {
          this.bankDetailModalStatus = false;
          this.vpaDetails = '';
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);
        }
      });

  }

  submitBankTransfer() {
    let d = new Date();
    let getYear = d.getFullYear();
    let getMonth = d.getMonth() + 1;
    let getDate = d.getDate();
    let gethour = d.getHours();
    let getMinute = d.getMinutes();
    let getSecond = d.getSeconds();

    let receivedDate = getYear + "/" + getMonth + "/" + getDate + " " + gethour + ":" + getMinute + ":" + getSecond;

    let resq = {
      "invoiceno": this.invoicedetail.pinumber,
      "dateofreceiving": receivedDate,
      "modified_by": this.tp_account_id,
      "amount": this.invoicedetail.netamountreceived,
      "paymentmethod": "Manual Bank Transfer"
    }
    this.manualTransfer(resq);
  }

  closeBankDetailModal() {
    this.bankDetailModalStatus = false;
  }

  manualTransfer(resq: any) {
    this._LoginService.manualTransfer({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify(resq))
    })
      .subscribe({
        next: (resData: any) => {
          //  console.log(resData)
          if (resData.statusCode == true) {
            this.bankDetailModalStatus = false;
            // this.alertManualTransferStatus = true;
            // for hide the second model buttion dated 15.01.2024
            this.alertManualTransferStatus = false;
            this.submitAlertManualButton();
            // end dated 15.01.2024
          }
          else {
            // this.toastr.error(resData.message, 'Error');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);
          }
        }, error: (e) => {
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);
        }

      })
  }

  submitAlertManualButton() {
    this.alertManualTransferStatus = false;
    this.calPaymentStatus = "2";
    // this.route.navigate(['/payouts']);
  }

  payStart() {
    this.calPaymentStatus = "2";
    this.qrUrl = `upi://pay?pa=tankhapay@hdfcbank&pn=AkalInfoys&mc=6012&tr=${this.invoicedetail.invoiceno}&mode=03&am=${Number(this.invoicedetail.netamountreceived)}&cu=INR`;
  }
  generateQRCodeWithLogo(qrData: string): void {
    const canvas = this.qrcode.nativeElement;
    const context: CanvasRenderingContext2D = canvas.getContext('2d');
    // Generate QR code
    QRCode.toCanvas(canvas, qrData, { errorCorrectionLevel: 'H' }, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
      } else {
        // Load the logo
        const logoImage = new Image();
        logoImage.src = '../../../../assets/img/tankhapay-logo.png';

        logoImage.onload = () => {
          // Draw the rectangular mask
          const maskWidth = canvas.width / 8; // Adjust the mask width as needed
          const maskHeight = canvas.height / 5; // Adjust the mask height as needed
          const x = (canvas.width - maskWidth) / 2;
          const y = (canvas.height - maskHeight) / 2;

          context.fillStyle = 'white'; // Set the background color outside the rectangle
          context.fillRect(x, y, maskWidth, maskHeight);

          // Use the rectangular mask as a clipping region
          context.save();
          context.clip();

          // Draw the QR code inside the rectangular mask
          context.drawImage(canvas, 0, 0);

          // Restore the context to remove the clipping region
          context.restore();

          // Draw the logo in the center with specific width and height
          const logoWidth = maskWidth / 1.5; // Adjust the logo width as needed
          const logoHeight = maskHeight / 1.5; // Adjust the logo height as needed
          const logoX = x + (maskWidth - logoWidth) / 2;
          const logoY = y + (maskHeight - logoHeight) / 2;

          context.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
        };


      }
    });
  }
  qrCodeScan() {
    // console.log("hee");
    this.isShowQr = true;
    this.resetStartTimer(300);
    // this.resetStartTimer(300);
    this.qrUrl = `upi://pay?pa=tankhapay@hdfcbank&pn=AkalInfoys&mc=6012&tr=${this.invoicedetail.pinumber}&mode=03&am=${Number(this.invoicedetail.netamountreceived)}&cu=INR`;
    this.generateQRCodeWithLogo(this.qrUrl);
    // this.intervalId = setInterval(() => {
    //   this.hdfcPaymentStatus();
    // }, 10000) // 10 seconds
    // console.log(this.qrUrl);
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

    if (environment.production == false) {
      this.toastr.info(GlobalConstants.juspaymsg_stg, 'Info!');
      return;
    }

    this._LoginService.jusPaySessionOrder({
      'order_id': this.invoicedetail.pinumber,
      'amount': this.invoicedetail.netamountreceived,
      'customerAccountId': this.invoicedetail.customeraccountid,
      'email': this.token.userid,
      'mobile': this.invoicedetail.customermobilenumber,
      'description': 'Starting Payment',
      'firstName': this.invoicedetail.customercontactname,
      'lastName': '-',
    }).subscribe({
      next: (resData: any) => {

        console.log(resData);

        // Redirecting to payment link which is received from merchant server after Session API S2S call
        window.location.replace(resData.payment_links.web);

        // IFrame Code
        // this.showPaymentScreen = true;
        // const paymentPageDiv = this.juspayDiv.nativeElement;
        // const juspayIframe = document.createElement("iframe");
        // juspayIframe.src = resData.payment_links.web;
        // juspayIframe.setAttribute("allow", "payment *");
        // juspayIframe.width = "1000";
        // juspayIframe.height = "920";
        // paymentPageDiv.appendChild(juspayIframe);

      }, error: (e) => {
        // this.showPaymentScreen = false
        this.toastr.error(e.error.message);
      }
    })
  }

  CalcReciebaleFromBaseAmount(packageName: any, amount: any) {
    this._LoginService.CalcReciebaleFromBaseAmount({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify({
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        "baseAmount": amount,
        "numberOfEmployees": this.numOfAssociate,
        "productTypeId": this.product_type,
        "packageName": packageName
      }))
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode == true) {
          let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
          this.invoicedetail = JSON.parse(resultJson);
          // console.log(this.invoicedetail);
          this.calPaymentStatus = "2";
        }
        else {
          this.calPaymentStatus = "2";
          this.route.navigate(['/login/onboarding'], { state: { mobile: this.emp_mobile } });
          this.toastr.error(resData.message, 'Error');
        }
      }, error: (e) => {
        this.route.navigate(['/login/onboarding'], { state: { mobile: this.emp_mobile } });
        this.toastr.error(e.error.message, 'Oops!');
      }
    });

  }

  saveReceivable(resq: any) {

    this._LoginService.saveReceivable({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify(resq))
    })
      .subscribe({
        next: (resData: any) => {
          //console.log(resData)
          if (resData.statusCode == true) {
            this.calPaymentStatus = '3';
            // this.intervalId = setInterval(() => {
            //   this.getEmployer_status();
            // },15000) // 15 seconds
          }
          else {
            // this.toastr.error(resData.message, 'Error');
            this._alertservice.error(resData.message, GlobalConstants.alert_options);
          }
        }, error: (e: any) => {
          // this.toastr.error(e.error.message, 'Oops!');
          this._alertservice.error(e.error.message, GlobalConstants.alert_options);
        }
      });

  }

  back_to_receipt() {
    this.calPaymentStatus = '2';
  }


  getEmployer_status() {
    this._LoginService.getEmployer_status({
      'employer_mobile': this.emp_mobile
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          let data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.signup_flag = data.signup_flag;

          //console.log(this.signup_flag)
          if (this.signup_flag == 'SP') {
            this.route.navigate(['/login']);
          }

        } else {
          // this.toastr.error(resData.message, 'Oops!');
          this._alertservice.error(resData.message, GlobalConstants.alert_options);
        }
      }, error: (e) => {
        // this.toastr.error(e.error.message, 'Oops!');
        this._alertservice.error(e.error.message, GlobalConstants.alert_options);
      }
    })
  }

  convertFirstCharAfterFirstDash(inputString) {
    const firstDashIndex = inputString.indexOf('-');

    // If a dash is found
    if (firstDashIndex !== -1) {
      // Extract the substring after the first dash
      const substringAfterFirstDash = inputString.substring(firstDashIndex + 1);

      // Convert the first character of the substring to uppercase
      const firstCharUppercase = substringAfterFirstDash.charAt(0).toUpperCase();

      // Concatenate the string with the modified substring
      const resultString = inputString.substring(0, firstDashIndex + 1) + firstCharUppercase + substringAfterFirstDash.substring(1);

      return resultString;
    }

    // If no dash is found, return the original string
    return inputString;
  }

  ngOnDestroy() {
    // Clear the interval when the component is destroyed
    // if (this.intervalId) {
    //   clearInterval(this.intervalId);
    // }
    this.stopTimer();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  closeQRCode() {
    this.isShowQr = false;
    this.stopTimer();
    // if (this.intervalId) {
    //   clearInterval(this.intervalId);
    // }
  }

  hdfcPaymentStatus() {
    this._LoginService.hdfcPaymentStatus({
      "order_no": this.invoicedetail.pinumber,
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {

            // if (this.intervalId) {
            //   clearInterval(this.intervalId);
            // }
            // {"transactionid":"","transactiontime":"","paymentstatus":"",
            // "amount":"","fromUser":"","toUser":"","paymentmode":"UPI","msg":"","invoice_no":""}
            let paymentData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
            //  console.log(paymentData);
            console.log('paymentData');
            // console.log(paymentData.paymentstatus);
            if (paymentData.paymentstatus == 'SUCCESS') {
              this.isShowQr = false;
              this.stopTimer();
              this.route.navigate(['/login/thank-u'], { state: { pinumber: this.invoicedetail.pinumber } });
            }
            else {
              console.log('else block');
            }

          } else {
            // console.log();
          }
        }, error: (e) => {
          // console.log(e.error);
          this.stopTimer();
          this.isShowQr = false;
        }
      })
  }

  /**Timer**/
  timerTick() {
    this.remaining -= 1;
    if (this.remaining < 0) {
      // Timeout logic here
      this.closeQRCode();
      location.reload();

    } else {
      // Format the remaining time in "mm:ss" format
      const minutes = Math.floor(this.remaining / 60);
      const seconds = this.remaining % 60;
      if (seconds % 10 == 0) {
        this.hdfcPaymentStatus(); // every 10 seconds
      }
      this.formattedTime = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

      // Update the timer display
      this.timerId = setTimeout(() => {
        this.timerTick();
      }, 1000);
    }
  }


  resetStartTimer(newRemaining: number) {
    // Clear the existing timer, if any
    if (this.timerId) {
      clearTimeout(this.timerId);
    }

    // Set the new remaining time
    this.remaining = newRemaining;

    // Start the timer
    this.timerTick();
  }

  stopTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
    this.remaining = 0;
    this.formattedTime = '';
  }

}
