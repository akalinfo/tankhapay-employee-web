import { Component, ElementRef, OnDestroy, Renderer2, ViewChild } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { PayoutService } from '../payout.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { dongleState, grooveState } from 'src/app/app.animation';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as QRCode from 'qrcode';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
import { ReportService } from '../../reports/report.service';
import { AccountsService } from '../../accounts/accounts.service';
import { LoginService } from '../../login/login.service';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  animations: [dongleState, grooveState],
})
export class PaymentComponent {
  PFAdminCharges:any;
  showSidebar: boolean = true;
  custumerAccountId: any = "";
  custumAmount: any = 0;
  packageList: any = [];
  packagestatus: boolean = false;
  addPaymentForms: FormGroup;
  selectPackageValue: any = '';
  product_type: any = '';
  tp_account_id: any = '';
  token: any = '';
  amount: number;
  invoicedetail: any = [];
  showPopup: boolean = false;
  paymentStarted: boolean = false;
  company_name: any = '';
  payout_date: any;
  state: any;
  showPaymentSummary: boolean = false;
  employer_mobile: any;
  initialAmount: any;
  employer_name: any = '';
  billing_address: any;
  user_type: any = '';
  registered_address: any = '';
  CustumAmount_popup: boolean = false;
  calPaymentStatus: any = '1';
  selectedPackage: any = "Payrolling";
  vpaDetails: any = "";
  employer_profile: any = [];
  bankDetailModalStatus: boolean = false;
  alertManualTransferStatus: boolean = false;
  numOfAssociate: any = '0';
  qrUrl: any = '';
  isShowQr: boolean = false;
  month: any;
  invoice_value: any;
  total_amount: any;
  year: any;
  customerSummary: any = [];
  payout_status: any;
  @ViewChild('qrcode', { static: false }) qrcode: ElementRef;
  isLowBalance: boolean = false;
  screenClicked: boolean = false;
  constructor(
    private _ReportService: ReportService,
    private route: Router,
    private _accountService: AccountsService,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private _PayoutService: PayoutService,
    public toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private _LoginService: LoginService,
  ) {
    {
      if (this.route.getCurrentNavigation().extras.state != null || this.route.getCurrentNavigation().extras.state != undefined) {
        this.amount = this.route.getCurrentNavigation().extras.state.amount;
        this.payout_status = this.route.getCurrentNavigation().extras.state.payout_status;
        this.initialAmount = this.amount;
        this.invoicedetail = this.route.getCurrentNavigation().extras.state.invoice_details;
        this.month = this.route.getCurrentNavigation().extras.state.month;
        this.year = this.route.getCurrentNavigation().extras.state.year;
        this.invoice_value = this.route.getCurrentNavigation().extras.state.invoice_val;
        this.total_amount = this.route.getCurrentNavigation().extras.state.Total_Amount;
        this.PFAdminCharges=this.route.getCurrentNavigation().extras.state.pfAdminCharges;
      }

    }

  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.product_type = localStorage.getItem('product_type');

    let userRequest: any = localStorage.getItem('paymentRequest');
    userRequest = JSON.parse(userRequest);

    this.custumerAccountId = userRequest.custumerAccountId;
    this.custumAmount = userRequest.amount;
    this.numOfAssociate = userRequest.numOfAssociate;

    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;

    this.addPaymentForms = this._formBuilder.group({
      custumAmount: [this.custumAmount]
    })

    this.getCustomerLedgerSummary();
    this.get_Employer_Profile();
    // this.payStart();
    // if ((this.payout_status === 'Low Balance' || this.payout_status === 'Pending')  && this.amount === this.initialAmount ) {
    // this.CustumAmount_popup = true;
    this.isLowBalance = true;
    // if ((this.payout_status === 'Low Balance' && this.invoice_value == 0) || (this.payout_status === 'Pending' && this.invoice_value == 0) || (this.payout_status === 'PartiallyPending' && this.invoice_value == 0)) {

    //   this.CalcReciebaleFromBaseAmount('Payrolling', this.amount);
    // }
    // else if ((this.payout_status === 'Low Balance' && this.invoice_value > 0)) {
    //   this.Generate_Required_AmountPI();
    // }
    this.screenClicked = true;
    // }



  }

  onAmountChange() {
    if (this.amount !== this.initialAmount) {
      this.Generate_required_amountPI_2();

    }
    this.screenClicked = true;
  }

  payoutStatusIsPending(): boolean {
    return this.payout_status === 'Pending' && this.amount < (this.customerSummary ? this.customerSummary.balance : 0);
  }


    // let loc_ammout = parseFloat((parseFloat(this.total_amount) - parseFloat(this.customerSummary.length == 0 ? '0.00' : this.customerSummary.balance)).toString());
    CalcReciebaleFromBaseAmount_For_Receipt() {
      this._PayoutService.CalcReciebaleFromBaseAmount({
        "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify({
          "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
          "baseAmount": this.amount,
          "numberOfEmployees": "0",
          "productTypeId": this.product_type,
          "packageName": "Payrolling",
          "billtype": "Salary",
          "invoicemonth": this.month,
          "invoiceyear": this.year,
          "pfAdminCharges": this.PFAdminCharges?.toString()
        }))
      }).subscribe((resData: any) => {
        if (resData.statusCode == true) {
          let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
          this.invoicedetail = JSON.parse(resultJson);
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
  Generate_required_amountPI_2() {
    this._PayoutService.GenerateRequiredAmountPI({
      "amount": this.amount?.toString(),
      "isBillable": 'N',
      "numberOfEmployees": this.numOfAssociate,
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
        // this.calPaymentStatus = "1";

      } else {
        this.invoicedetail = [];
        // this.calPaymentStatus = "1";
        this.showPopup = true;
        this.toastr.error(resData.message);
      }
    });
  }
  radioPackage(selectedVal) {
    this.addPaymentForms.patchValue({
      custumAmount: ''
    });
    this.selectPackageValue = selectedVal;

  }

  custumTextBox() {
    const radioButtons = this.elementRef.nativeElement.querySelectorAll('.gender-radio');
    radioButtons.forEach((radioButton) => {
      this.renderer.setProperty(radioButton, 'checked', false);
    });
    this.selectPackageValue = '';
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getCustomerLedgerSummary() {
    this._accountService.getCustomerLedgerSummary({
      'productTypeId': this.product_type,
      'customerAccountId': this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        console.log('resData.commonData==>', resData.commonData);
        this.customerSummary = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

        if ((this.payout_status === 'Low Balance' && this.invoice_value == 0) || (this.payout_status === 'Pending' && this.invoice_value == 0) || (this.payout_status === 'PartiallyPending' && this.invoice_value == 0)) {

          this.CalcReciebaleFromBaseAmount('Payrolling', this.amount);
        }
        else if ((this.payout_status === 'Low Balance' && this.invoice_value > 0)) {
          this.CalcReciebaleFromBaseAmount_For_Receipt();
        }

      }
    });
  }

  getPackageSub() {
    this._PayoutService.getPackages({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify({
        "customeraccountid": this._EncrypterService.aesEncrypt(this.custumerAccountId.toString()),
        "productTypeId": '2'
      }))
    })
      .subscribe((resData: any) => {
        if (resData.statusCode == true) {
          let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
          this.packageList = JSON.parse(resultJson);
          this.packageList = this.packageList.data.plandesc;
        }
        else {
          this.packageList = [];
          this.toastr.error(resData.message, 'Error');
        }
      }, (error: any) => {
        this.toastr.error(error.error.message, 'Oops!');
      });

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

  changeStatusCustum() {
    this.packagestatus = !this.packagestatus;
  }

  submitAddpaymentForm() {
    let post = this.addPaymentForms.value;
    let amount = post.custumAmount.toString();
    let packageName = 'Payrolling';
    this.selectedPackage = packageName;
    // this.CalcReciebaleFromBaseAmount(packageName, amount);
  }
  // submitPayInvoice(calJson){

  //   let resq = {
  //       "customeraccountid": calJson.customeraccountid,
  //       "numberofemployees": calJson.numberofemployees,
  //       "netamountreceived": calJson.netamountreceived,
  //       "servicechargerate": calJson.servicechargerate,
  //       "servicechargeamount": calJson.servicechargeamount,
  //       "gstmode": calJson.gstmode,
  //       "sgstrate": calJson.sgstrate,
  //       "sgstamount": calJson.sgstamount,
  //       "cgstrate": calJson.cgstrate,
  //       "cgstamount": calJson.cgstamount,
  //       "igstrate": calJson.igstrate,
  //       "igstamount": calJson.igstamount,
  //       "netvalue": calJson.payoutamount,
  //       "source": "Web",
  //       "created_by": calJson.customeraccountid,
  //       // "createdbyip": ":::1",
  //       "invoicetype": "",
  //       "service_name": calJson.service_name,
  //       "package_name": this.selectedPackage,
  //       "productTypeId": this.product_type
  //   }
  //   this.saveReceiable(resq);
  // }

  // addBalance() {
  //   this.showPaymentSummary = true;
  //   if (this.payout_status === 'Low Balance' && this.amount === this.initialAmount) {
  //     this.CalcReciebaleFromBaseAmount('Payrolling', this.amount);
  //   }
  // }

  CalcReciebaleFromBaseAmount(packageName: any, amount: any) {
    this._PayoutService.CalcReciebaleFromBaseAmount({
      "encrypted": this._EncrypterService.aesEncrypt(JSON.stringify({
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        "baseAmount": this.amount,
        "numberOfEmployees": this.numOfAssociate,
        "productTypeId": this.product_type,
        "packageName": packageName,
        "billtype": "Salary",
        "invoicemonth": this.month,
        "invoiceyear": this.year,
        "pfAdminCharges": this.PFAdminCharges?.toString()
      }))
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
        this.invoicedetail = JSON.parse(resultJson);
        // this.calPaymentStatus = "1";
        // this.saveReceiable();
      }
      else {
        // this.calPaymentStatus = "1";
        this.invoicedetail = [];
        this.toastr.error(resData.message, 'Error');
      }
    }, (error: any) => {
      // this.calPaymentStatus = "1";
      this.invoicedetail = [];
      this.toastr.error(error.error.message, 'Oops!');
    });

  }

  saveReceiable() {
    let resq = {
      "customeraccountid": this.invoicedetail?.customeraccountid,
      "numberofemployees": this.invoicedetail?.numberofemployees,
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
    this.route.navigate(['/payouts']);
  }

  payStart() {
    // this.addBalance();
    this.calPaymentStatus = "3";
    if (this.payout_status === 'Low Balance') {
      this.qrUrl = `upi://pay?pa=tankhapay@hdfcbank&pn=AkalInfoys&mc=6012&tr=${this.invoicedetail.invoiceno}&mode=03&am=${Number(this.invoicedetail.netamountreceived)}&cu=INR`;
    }
    // Set the flag to true to hide the row
    this.paymentStarted = true;
    // this.showPaymentSummary = true;
    this.saveReceiable();
  }

  qrCodeScan() {
    console.log("hee");

    this.isShowQr = true;
    this.qrUrl = `upi://pay?pa=tankhapay@hdfcbank&pn=AkalInfoys&mc=6012&tr=${this.invoicedetail.invoiceno}&mode=03&am=${Number(this.invoicedetail.netamountreceived)}&cu=INR`;
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

  // Function to handle keypress, keyup, and keydown events
  handleKeyPress() {
    this.screenClicked = false;
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
      'udf1': 'payout-payment'
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
