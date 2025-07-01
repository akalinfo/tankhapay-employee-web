import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { PayoutService } from '../payout.service';
declare var $: any;
import * as QRCode from 'qrcode';
import decode from 'jwt-decode';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AccountsService } from '../../accounts/accounts.service';
import { ReportService } from '../../reports/report.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { LoginService } from '../../login/login.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-advance-payment',
  templateUrl: './advance-payment.component.html',
  styleUrls: ['./advance-payment.component.css'],
  animations: [dongleState, grooveState],
})
export class AdvancePaymentComponent {
  showSidebar: boolean = true;
  token: any;
  tp_account_id: any;
  customerSummary: any = [];
  isShowQr: boolean = false;
  product_type: any;
  totalSelectedAmount: number = 0;
  Is_Billable: any;
  qrUrl: any = '';
  employer_profile: any = [];
  initialAmount: any;
  calPaymentStatus: any;
  selectedPackage: any = "Payrolling";
  Checkbox_Count: any;
  alertManualTransferStatus: boolean = false;
  showPopup: boolean = false;
  vpaDetails: any = "";
  showPaymentScreen: boolean = false;
  bankDetailModalStatus: boolean = false;
  amount: number;
  paymentStarted: boolean = false;
  company_name: any = '';
  invoicedetail: any = [];
  state: any;
  showPaymentSummary: boolean = false;
  employer_mobile: any;
  employer_name: any = '';
  screenClicked: boolean = false;
  billing_address: any;
  user_type: any = '';
  registered_address: any = '';
  pincode: any;
  accessRights: any = {};
  @ViewChild('qrcode', { static: false }) qrcode: ElementRef;
  payout_date: any;
  month:any;
  year:any;
  constructor(
    private _ReportService: ReportService,
    private router: Router,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private _PayoutService: PayoutService,
    public toastr: ToastrService,
    private _accountService: AccountsService,
    private _alertservice: AlertService,
    private _masterService: MasterServiceService,
    private _LoginService: LoginService,
  ) {
    if (this.router.getCurrentNavigation().extras.state != null || this.router.getCurrentNavigation().extras.state != undefined) {
      this.amount = this.router.getCurrentNavigation().extras.state.amount;
      this.Checkbox_Count = this.router.getCurrentNavigation().extras.state.Checkbox_Count;
      this.Is_Billable = this.router.getCurrentNavigation().extras.state.Is_Billable;
      this.totalSelectedAmount = this.router.getCurrentNavigation().extras.state.TotalSelectedAmount;
      this.initialAmount = this.amount;
      this.month=this.router.getCurrentNavigation().extras.state.Month;
      this.year=this.router.getCurrentNavigation().extras.state.Year;
      // this.customerSummary.balance=this.router.getCurrentNavigation().extras.state.current_balance;
      // console.log(this.amount, this.Is_Billable, this.Checkbox_Count, this.totalSelectedAmount,this.month,this.year);
    }

  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    let userRequest: any = localStorage.getItem('paymentRequest');
    userRequest = JSON.parse(userRequest);

    // this.custumAmount = userRequest.amount;
    // this.numOfAssociate = userRequest.numOfAssociate;
    this.accessRights = this._masterService.checkAccessRights('payouts/Advance');
    console.log(this.accessRights);

    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.getCustomerLedgerSummary();
    this.get_Employer_Profile();
    // added my vinod dated. 15.03.2024
    this.addBalance();
    this.screenClicked = true;
    // if (this.Is_Billable == '' || this.Is_Billable==undefined) {
    //   this.Generate_Required_AmountPI();
    // }

  }

  // Function to handle keypress, keyup, and keydown events
  handleKeyPress() {
    this.screenClicked = false;
  }

  onAmountChange() {
    if (this.amount !== this.initialAmount) {
      this.Generate_Required_AmountPI();
      this.screenClicked = true;
    }

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_Employer_Profile() {
    this._ReportService.getEmployerProfile({
      customeraccountid: (this.tp_account_id),
      productTypeId: this.product_type,
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.employer_profile = resData.commonData;
          // console.log(this.employer_profile);
          this.employer_name = this.employer_profile.full_name,
            this.employer_mobile = this.employer_profile.employer_mobile,
            this.company_name = this.employer_profile.company_name;
          this.user_type = this.employer_profile.user_type,
            this.registered_address = (this.employer_profile.company_address + ' ' + this.employer_profile.company_town_city
              + ' ' + this.employer_profile.company_pincode + '  ' + this.employer_profile.company_state
            ).trim(),
            this.billing_address = this.employer_profile.bill_address + '  ' + this.employer_profile.bill_city + '  ' + this.employer_profile.bill_pincode + '  ' + this.employer_profile.bill_state,
            this.payout_date = this.employer_profile.payout_frequency_dt + ' date of every month'

        } else {
          this.employer_profile = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      });
  }

  addBalance() {
    this.showPaymentSummary = true;

    if (this.Is_Billable === 'N' || this.Is_Billable == '' || this.Is_Billable == undefined) {
      this.Generate_Required_AmountPI();
    }

    else if (this.Is_Billable === 'Y' && this.amount === this.initialAmount) {
      this.CalcReciebaleFromBaseAmount();
    }
  }
  getCustomerLedgerSummary() {
    this._accountService.getCustomerLedgerSummary({
      'productTypeId': this.product_type,
      'customerAccountId': this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.customerSummary = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this.customerSummary.balance);

        // Call Generate_Required_AmountPI() after customerSummary has been populated
        // this.Generate_Required_AmountPI();
      }
    });
  }

  CalcReciebaleFromBaseAmount() {
    this._PayoutService.CalcReciebaleFromBaseAmount({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify({
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
        "baseAmount": this.amount,
        "numberOfEmployees": this.Checkbox_Count ? this.Checkbox_Count.toString() : '1',
        "productTypeId": this.product_type,
        "packageName": "Payrolling",
        "billtype": "Advances",
        "invoicemonth": this.month,
        "invoiceyear": this.year
      }))
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
        this.invoicedetail = JSON.parse(resultJson);
        this.calPaymentStatus = "1";
      }
      else {
        this.calPaymentStatus = "1";
        this.toastr.error(resData.message, 'Error');
      }
    }, (error: any) => {
      this.calPaymentStatus = "1";
      this.toastr.error(error.error.message, 'Oops!');
    });

  }

  Generate_Required_AmountPI() {
    this._PayoutService.GenerateRequiredAmountPI({
      "amount": this.amount?.toString() ? this.amount?.toString() : this.customerSummary.balance.toString(),
      "isBillable": 'N',
      "numberOfEmployees": this.Checkbox_Count ? this.Checkbox_Count.toString() : '1',
      "source": "Web",
      "createdBy": this.tp_account_id?.toString(),
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        let resultJson = (resData.commonData);
        this.invoicedetail = (resultJson);
        // console.log(this.invoicedetail);
        // this.toastr.success(resData.message);
        console.log(resData.message);
        this.calPaymentStatus = "1";
        // if (this.Is_Billable == '' || this.Is_Billable==undefined) {
        // this.saveReceiable();
        // }
      } else {
        this.invoicedetail = [];
        this.calPaymentStatus = "1";
        this.showPopup = true;
        this.toastr.error(resData.message);
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  PayNow() {
    // Check if Is_Billable is 'N'
    if (this.Is_Billable == 'N') {
      this.calPaymentStatus = "1";
      this.Generate_Required_AmountPI();

    }
    else if (this.Is_Billable === 'Y' && this.amount === this.initialAmount) {
      this.calPaymentStatus = "1";
      this.CalcReciebaleFromBaseAmount();
    }

    // Show the payment screen after PayNow() function is executed
    this.showPaymentScreen = true;
  }
  // closePopup(){
  //   this.showPopup=false;
  //   this.calPaymentStatus = "1";
  //   // this.showPopup=true;
  // }
  payStart() {
    if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add)) {
      this.toastr.error("You do not have the permission for this.");
      return;
    }
    //adedd by vinod dated. 15.03.2024
    // this.addBalance();
    this.showPaymentSummary = true;
    // end

    // {Number(this.invoicedetail.netamountreceived)}
    this.calPaymentStatus = "3";
    if (this.Is_Billable == 'N' || this.Is_Billable == '' || this.Is_Billable == undefined) {
      this.qrUrl = `upi://pay?pa=tankhapay@hdfcbank&pn=AkalInfoys&mc=6012&tr=${this.invoicedetail.invoiceno}&mode=03&am=${Number(this.amount)}&cu=INR`;
    }
    else {
      this.qrUrl = `upi://pay?pa=tankhapay@hdfcbank&pn=AkalInfoys&mc=6012&tr=${this.invoicedetail.invoiceno}&mode=03&am=${Number(this.invoicedetail.netamountreceived)}&cu=INR`;
    }
    // Set the flag to true to hide the row
    this.paymentStarted = true;

    this.saveReceiable();
  }

  bankTransferButton() {
    let resq = {
      'customerAccountId': this._EncrypterService.aesEncrypt((this.tp_account_id).toString())
    }
    this.getVpaDetails(resq);
  }

  getVpaDetails(resq: any) {
    this._PayoutService.getVpaDetails({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify(resq))
    })
      .subscribe((resData: any) => {
        if (resData.statusCode == true) {
          let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
          resultJson = JSON.parse(resultJson);
          this.vpaDetails = resultJson;
          this.bankDetailModalStatus = true;
        }
        else {
          this.bankDetailModalStatus = false;
          this.vpaDetails = '';
          this.toastr.error(resData.message, 'Error');
        }
      }, (error: any) => {
        this.bankDetailModalStatus = false;
        this.vpaDetails = '';
        this.toastr.error(error.error.message, 'Oops!');
      });

  }

  qrCodeScan() {
    console.log("hee");

    this.isShowQr = true;
    if (this.Is_Billable == 'N' || this.Is_Billable == '' || this.Is_Billable == undefined) {
      this.qrUrl = `upi://pay?pa=tankhapay@hdfcbank&pn=AkalInfoys&mc=6012&tr=${this.invoicedetail.invoiceno}&mode=03&am=${Number(this.amount)}&cu=INR`;
    }
    else {
      this.qrUrl = `upi://pay?pa=tankhapay@hdfcbank&pn=AkalInfoys&mc=6012&tr=${this.invoicedetail.invoiceno}&mode=03&am=${Number(this.invoicedetail.netamountreceived)}&cu=INR`;
    }
    this.generateQRCodeWithLogo(this.qrUrl);
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

  closeQRCode() {
    this.isShowQr = false;
  }

  manualTransfer(resq: any) {
    this._PayoutService.manualTransfer({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify(resq))
    })
      .subscribe((resData: any) => {
        //  console.log(resData)
        if (resData.statusCode == true) {
          this.bankDetailModalStatus = false;
          this.alertManualTransferStatus = true;
        }
        else {
          this.toastr.error(resData.message, 'Error');
        }
      }, (error: any) => {
        this.toastr.error(error.error.message, 'Oops!');
      });
  }
  submitAlertManualButton() {
    this.alertManualTransferStatus = true;
    this.router.navigate(['/payouts/Advance']);
  }

  closeBankDetailModal() {
    this.bankDetailModalStatus = false;
  }

  // submitPayInvoice(calJson) {

  //   let resq = {
  //     "customeraccountid": calJson.customeraccountid,
  //     "numberofemployees": this.Checkbox_Count ? this.Checkbox_Count.toString() : '1',
  //     "netamountreceived": calJson.netamountreceived,
  //     "servicechargerate": calJson.servicechargerate,
  //     "servicechargeamount": calJson.servicechargeamount,
  //     "gstmode": calJson.gstmode,
  //     "sgstrate": calJson.sgstrate,
  //     "sgstamount": calJson.sgstamount,
  //     "cgstrate": calJson.cgstrate,
  //     "cgstamount": calJson.cgstamount,
  //     "igstrate": calJson.igstrate,
  //     "igstamount": calJson.igstamount,
  //     "netvalue": calJson.payoutamount,
  //     "source": "Web",
  //     "created_by": calJson.customeraccountid,
  //     // "createdbyip": ":::1",
  //     "invoicetype": "",
  //     "service_name": calJson.service_name,
  //     "package_name": this.selectedPackage,
  //     "productTypeId": this.product_type
  //   }
  //   // this.saveReceiable(resq);
  // }

  saveReceiable() {
    let resq = {
      "customeraccountid": this.invoicedetail?.customeraccountid,
      "numberofemployees": this.Checkbox_Count ? this.Checkbox_Count.toString() : '1',
      "netamountreceived": this.invoicedetail?.netamountreceived,
      "servicechargerate": this.invoicedetail?.servicechargerate,
      "servicechargeamount": this.invoicedetail?.servicechargeamount,
      "gstmode": this.invoicedetail?.gstmode,
      "sgstrate": this.invoicedetail?.sgstrate,
      "sgstamount": this.invoicedetail?.sgstamount,
      "cgstrate": this.invoicedetail?.cgstrate,
      "cgstamount": this.invoicedetail?.cgstamount,
      "igstrate": this.invoicedetail?.igstrate,
      "igstamount": this.invoicedetail?.igstamount,
      "netvalue": this.invoicedetail?.payoutamount,
      "source": "Web",
      "created_by": this.invoicedetail?.customeraccountid,
      // "createdbyip": ":::1",
      "invoicetype": "",
      "service_name": this.invoicedetail?.service_name,
      "package_name": this.selectedPackage,
      "productTypeId": this.product_type
    }

    this._PayoutService.saveReceiable({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify(resq))
    })
      .subscribe((resData: any) => {
        // console.log(resData)
        if (resData.statusCode == true) {
          this.calPaymentStatus = '3';
        }
        else {

          this.toastr.error(resData.message, 'Error');
        }
      }, (error: any) => {

        this.toastr.error(error.error.message, 'Oops!');
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
      'description': 'Add Balance',
      'firstName': this.invoicedetail.customercontactname,
      'lastName': '-',
      'udf1': 'advance-payment'
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


}
