import { Component, ElementRef, ViewChild } from '@angular/core';
import { AccountsService } from '../accounts.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import * as XLSX from 'xlsx';
import * as QRCode from 'qrcode';
import { LoginService } from '../../login/login.service';
import { Router } from '@angular/router';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent {

  showSidebar: boolean = true;
  token: any;
  tp_account_id: any;
  product_type: any;
  transactionData: any=[];
  InvoiceModalStatus:boolean =false;
  invoicedetail : any ='';
  rupees_words :any ='';
  qrUrl ='';
  transactionType: any='All';
  fromDate: string='';
  toDate: string='';
  customerSummary: any='';
  lastLatestTran: any=[];
  nextmonth: any='';
  year: any;
  isFundAddedModal: boolean;
  transactionInfo: any={};
  fundAddedTransDetails: any='';
  isPaymentOption : boolean =false;
  payoutTransDetails: any=[];
  totalPaidAmt: any=0;
  remaining: number=0;
  formattedTime: string='';
  timerId: any;
  sso_admin_id:any='';

  constructor(private _accountService : AccountsService,
    private _SessionService : SessionService,
    private _EncrypterService : EncrypterService,
    private toastr: ToastrService,
    private _alertservice: AlertService,
    private _LoginService :LoginService,
    private router: Router){}

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.sso_admin_id = this.token.sso_admin_id;
    let date=new Date();
    date.setMonth(date.getMonth()+1)
    this.nextmonth = date.toLocaleString('en-US', { month: 'long' });
    this.year =date.getFullYear();
    this.getLatestTransaction();
    this.getCustomerLedgerSummary();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getTransactionByType(type:any){
    this.transactionType = type;
    this.getLatestTransaction();
  }
  
  Add_balance(){
    this.router.navigate(['/payouts/Advance-Payment'])
  }
  redirectTomanageSaveCard(){
    this.router.navigate(['/business-settings/manage-card'])
  }
  getTransactionUsingDate(daterange:any){
    console.log(daterange);
    let to_dt = new Date();
    let date =  to_dt.getDate()<10 ? ('0'+to_dt.getDate()): to_dt.getDate();
    let month = (to_dt.getMonth()+1) <10 ? ('0'+(to_dt.getMonth()+1)) : (to_dt.getMonth()+1);
    let year = to_dt.getFullYear();
    this.toDate = date+ "/"+ month+"/"+year;
    if(daterange =='>6'){
      this.fromDate='01/01/2022';
    }else{
      let from_dt = new Date();
      from_dt.setMonth((to_dt.getMonth()+1)-daterange);
      
      this.fromDate= '01'+ "/"+((from_dt.getMonth()+1)<10? ('0'+(from_dt.getMonth()+1)): from_dt.getMonth() ) +"/"+ from_dt.getFullYear();
    }
  }

  filterTransaction(){
    this.getLatestTransaction();
  }

  getLatestTransaction(){

    let postData ={
      "customeraccountid": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      "transaction_flag": "Latest",
      "status": "Paid",
      "transactiontype": this.transactionType,
      "tranmonth": "",
      "datefrom": this.fromDate,
      "dateto": this.toDate,
      "productTypeId": this.product_type
    }
      this._accountService.getLatestTransaction(postData).subscribe((resData:any):any=>{
        if(resData.statusCode){
          this.transactionData= JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData)).data;
          
          this.lastLatestTran = this.transactionData.filter(obj=>{return obj.status=='Success'});
        }else{
          this.transactionData=[]; 
          return  this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      })
  }

  frac(f: any) {
    return f % 1;
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

  generateInvoice(data: any) {

    this.transactionInfo = data;
    this._accountService.PaymentPerformaInvoice({'customeraccountid': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
  'transaction_id': data.transactionids,"transaction_flag": "Latest",'status':data.status}).subscribe((resData:any)=>{
    if(resData.statusCode){
      this.invoicedetail= JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
     // console.log(this.invoicedetail);
     var amount = this.invoicedetail.netamountreceived;
     console.log(amount);
     
     var fraction = Math.round(this.frac(amount) * 100);
     console.log(fraction);
     
     var f_text = "";
     if (fraction > 0) {
       f_text = "and " + this.convert_number(fraction) + " Paisa";
     }
     let words = this.convert_number(amount) + " Rupees " + f_text + " Only";
     this.rupees_words = words;
    }
  })
    this.InvoiceModalStatus = true;
  }

  closeInvoiceModal() {
    this.InvoiceModalStatus = false;
  }

  onPrint(divName) {

    var w = window.open();
    const printContents = document.getElementById(divName).innerHTML;
    const originalContents = document.body.innerHTML;
    w.document.body.innerHTML = printContents;
    w.window.print();
    w.document.body.innerHTML = originalContents;
    w.window.close();

  }

  getCustomerLedgerSummary(){
    this._accountService.getCustomerLedgerSummary({
      'productTypeId': this.product_type,
      'customerAccountId' : this.tp_account_id.toString()
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.customerSummary= JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      
      }
    })
  }

  getFundAddedTransactionsDetails(transct:any){
    this.transactionInfo=transct;
    console.log(transct.operationtype);
    this.qrUrl = `upi://pay?pa=tankhapay@hdfcbank&pn=AkalInfoys&mc=6012&tr=${transct.invoiceno}&mode=03&am=${Number(transct.netamountreceived)}&cu=INR`;

    this.isFundAddedModal= true;
    this._accountService.getFundAddedTransactionsDetails({'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
    'transactionId': transct.transactionids, 'productTypeId' : this.product_type.toString() }).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.getPayoutTransactionsDetails(transct.transactionids);
        let fundAddedTransDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        if(fundAddedTransDetails.customerTransactionSummary!='')
        this.fundAddedTransDetails=  JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        else
        this.fundAddedTransDetails={};
      }
    })
  }


  getPayoutTransactionsDetails(transId:any){
    this._accountService.getPayoutTransactionsDetails({'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
    'transactionId': transId, 'productTypeId' : this._EncrypterService.aesEncrypt(this.product_type.toString())}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.payoutTransDetails =JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        for(let i=0;i<this.payoutTransDetails.customerPayoutTransactionDetails.length;i++){
          this.totalPaidAmt +=Number(this.payoutTransDetails.customerPayoutTransactionDetails[i].emp_amount);
        }
        // this.payoutTransDetails =  {
        //   customerPayoutTransactionSummary:payoutDetail.customerPayoutTransactionSummary[0],
        //   customerPayoutTransactionDetails :payoutDetail.customerPayoutTransactionDetails[0]
        // }
        
      }else{
        this.fundAddedTransDetails=  '';
      }
    })
  }


  downloadEmpSalary(trn:any){

    this._accountService.getPayoutTransactionsDetails({'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
    'transactionId': trn.transactionids, 'productTypeId' : this._EncrypterService.aesEncrypt(this.product_type.toString())}).subscribe((resData:any)=>{
      if(resData.statusCode){
        let payoutTransDetails =JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        let exportData=[];
        for(let i=0;i<payoutTransDetails.customerPayoutTransactionDetails.length;i++){
          exportData.push({'Employee Name':payoutTransDetails.customerPayoutTransactionDetails[i].emp_name,
                            'Amount': payoutTransDetails.customerPayoutTransactionDetails[i].emp_amount,
                          'Transaction Time': trn.trantime});
        }


        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
            const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const downloadLink: any = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(data);
            let date = new Date()
            downloadLink.download = 'Employee-Salary-Transaction.xlsx';
            downloadLink.click();
        
      }else{
        this.fundAddedTransDetails=  '';
      }
    })
  }

  // qrCodeScan(){

  //   this.qrUrl=`upi://pay?pa=tankhapay@hdfcbank&pn=AkalInfoys&mc=6012&tr=${this.invoicedetail.invoiceno}&mode=03&am=${Number(this.invoicedetail.netamountreceived)}&cu=INR`;
  //   this.enableQr();
  // }

  enableQr(){
    this.isPaymentOption=true;
    setTimeout(() => {
      this.generateQRCodeWithLogo(this.qrUrl);
      console.log(document.getElementById('qrcode'));
    }, 100);
    this.resetStartTimer(300);
  }

  closeQRCode() {
    this.isPaymentOption = false;
    this.stopTimer();
    // if (this.intervalId) {
    //   clearInterval(this.intervalId);
    // }
  }

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
              this.isPaymentOption = false;
              this.stopTimer();
              // this.route.navigate(['/login/thank-u'], { state: { pinumber: this.invoicedetail.pinumber } });
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
          this.isPaymentOption = false;
        }
      })
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


  generateQRCodeWithLogo(qrData: string): void {
    // @ViewChild('qrcode', { static: false })let qrcode: ElementRef;
   
    const canvas: HTMLCanvasElement = document.getElementById('qrcode') as HTMLCanvasElement;
    // console.log(canvas);
    
    // this.qrcode.nativeElement;
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
}
