import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ApprovalsService } from '../../approvals/approvals.service';
declare var $: any;
import decode from 'jwt-decode';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { PayoutService } from '../payout.service';
import { AccountsService } from '../../accounts/accounts.service';
import { dongleState, grooveState } from 'src/app/app.animation';
@Component({
  selector: 'app-advance',
  templateUrl: './advance.component.html',
  styleUrls: ['./advance.component.css'],
  animations: [dongleState, grooveState]
})
export class AdvanceComponent {
  submit_button:boolean = false;
  button_status:boolean=false;
  report_button:boolean=false;
  showSidebar: boolean = true;
  payout_mode_type: any;
  product_type: any = '';
  token: any = '';
  from_date: any = '';
  PI_data:any=[];
  to_date: any = '';
  batch_no: any;
  disburse_data:any=[];
  reject_data:any;
  selectedBillableOption: string;
  isBillable:any;
  mpr_year: any;
  mpr_month: any;
  emp_code: any;
  PI_form: FormGroup;
  month: any;
  checkbox_count:any;
  amount: number = 0;
  days_count: any;
  voucher_data: any = [];
  filteredEmployees: any=[];
  year: any;
  customerSummary: any=[];
  disburse_status: any;
  selectedRowsAmount: number = 0;
  showPopup: boolean = false;
  calPaymentStatus : any = '1';
  disburse_popup:boolean=false;
  is_recovery:any;
  invoicedetail : any = [];
  totalSelectedAmount: number = 0;
  isHeaderCheckboxChecked: boolean = false;
  tp_account_id: any;
  payment_mode_type:any=[];
  monthsArray: any = [
    {
      'id': '1',
      'month': 'January',
    },
    {
      'id': '2',
      'month': 'February',
    },
    {
      'id': '3',
      'month': 'March',
    },
    {
      'id': '4',
      'month': 'April',
    },
    {
      'id': '5',
      'month': 'May',
    },
    {
      'id': '6',
      'month': 'June',
    },
    {
      'id': '7',
      'month': 'July',
    },
    {
      'id': '8',
      'month': 'August',
    },
    {
      'id': '9',
      'month': 'September',
    },
    {
      'id': '10',
      'month': 'October',
    },
    {
      'id': '11',
      'month': 'November',
    },
    {
      'id': '12',
      'month': 'December',
    }
  ];
  selected_date: any;
  yearsArray: any = [];
  payoutSummary: any[] = [
    { month_name: '', payoutdate1: '',totalemployees: '' }
  ];
  open_approve_popup:boolean = false;
  record_popup:boolean=false;
  payout_form: FormGroup;
  recordPaymentId:any;
  constructor(
    private _approvalsService: ApprovalsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _PayoutService: PayoutService,
    private _formBuilder: FormBuilder,
    private _accountService : AccountsService,
    private _EncrypterService : EncrypterService,
    private _alertservice: AlertService,
    private router: Router
  ) { }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.payout_mode_type = this.token.payout_mode_type;
    const date = new Date();
    let currentMonth = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    let currentYear = date.getFullYear();

    for (let i = 2022; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);
    };
    this.selected_date = localStorage.getItem('selected_date') || null;

    if (this.selected_date) {
      this.days_count = this.selected_date.split('-')[0];
      this.month = this.selected_date.split('-')[1];
      this.year = this.selected_date.split('-')[2];
      // console.log("A",this.month,this.year);
    } else {
      this.month = currentMonth.toString();
      this.year = currentYear.toString();
      // console.log("B",this.month,this.year);
    }

    this.PI_form = this._formBuilder.group({
      isBillable: ['', [Validators.required]],
    });
    this.payout_form = this._formBuilder.group({
      selected_payout_mode: ['1', [Validators.required]],
      paymentRecordDate:['', [Validators.required]]

    });
    this.updatePayoutSummary();
    this.Get_Voucher_Details();
    // this.isBillable = 'N'; // Set the default value to 'N'
    this.selectedBillableOption = 'N'; 
    this.getCustomerLedgerSummary();
    
  }

  ngAfterViewInit() {
    setTimeout(() => {
      $('#FromDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date()); // Set current date as default
    }, 500);
  }

  updatePayoutSummary() {
    const currentDate = new Date();
    const previousMonthDate = new Date(this.year, this.month - 1, 1);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Set previous month and year
    const previousMonth = this.month - 1 === 0 ? 12 : this.month - 1;
    const previousYear = this.month - 1 === 0 ? this.year - 1 : this.year;

    this.payoutSummary[0].month_name = `${monthNames[previousMonth - 1]}-${previousYear}`;
    this.payoutSummary[0].payoutdate1 = this.formatDate(currentDate);
    this.updateTotalEmployeesCount();
  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  }
  updateTotalEmployeesCount() {
    this.payoutSummary[0].totalemployees = this.voucher_data.filter((advance: any) => advance.isSelected).length;
  }
  submit_Button(){
    
    this.GetPaymentMode_Types();
    this.record_popup=true;
    this.open_approve_popup=false;
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  openPopup(){
    this.showPopup = true;
  }
  closePopup() {
    this.showPopup = false;
  }

  formatAmount(totalSelectedAmount: number, balance: string): string {
    const remainingAmount = totalSelectedAmount - parseFloat(balance || '0.00');
    return '₹' + (remainingAmount >= 0 ? remainingAmount : 0).toFixed(2);
}

  getCheckedCheckboxCount() {
    return this.voucher_data.filter(advance => advance.isSelected).length;
  }

  parseFloat(value: any): number {
    return parseFloat(value);
}

pay() {

  // Calculate the remaining balance
  const remainingBalance = this.totalSelectedAmount - parseFloat((this.customerSummary!=''? this.customerSummary.balance:'0.00'));
  this.amount = parseFloat(remainingBalance.toFixed(0)); 
  // console.log(this.amount);

  if (this.amount === 0 || this.totalSelectedAmount <= (this.customerSummary!=''? this.customerSummary.balance:'0.00')) {
      // Iterate through selected rows and disburse vouchers
      this.disburse_popup=true;
      
  } else {
      // this.openPopup();
      this.checkbox_count =this.getCheckedCheckboxCount();
    // console.log(this.checkbox_count);
     const remainingBalance = this.totalSelectedAmount - parseFloat((this.customerSummary!=''? this.customerSummary.balance:'0.00'));
  this.amount = parseFloat(remainingBalance.toFixed(0)); 
  // console.log(this.amount);

    this.router.navigate(['/payouts/Advance-Payment'],
     {
      state: {amount: this.amount, Checkbox_Count: this.checkbox_count, Is_Billable:this.selectedBillableOption, TotalSelectedAmount: this.totalSelectedAmount,Month:this.month,Year:this.year}
    }
    );
  }
}

disbuse_multiple_voucher(){

  this.voucher_data.forEach(advance => {
      if (advance.isSelected) {
          this.emp_code = advance?.emp_code;
          this.mpr_year = advance?.mpryear;
          this.mpr_month = advance?.mprmonth;
          this.batch_no = advance?.batch_no;
        if(this.payout_mode_type=='self'){
         this.Disburse_Voucher_for_self_mode();
        }
        else{
          this.Disburse_Voucher();
        }
      

       
      }
  });
  this.router.navigate(['/approval/voucher_report']);
}

closeModal() {
  this.disburse_popup = false; 
}
  changeMonth(e: any) {
    this.month = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    this.button_status=false;
    this.submit_button=false;
    this.report_button=false;
    this.updateTotalEmployeesCount();
    this.resetCheckboxes();
    this.Get_Voucher_Details();
  }

  changeYear(e: any) {
    this.year = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
    this.button_status=false;
    this.submit_button=false;
    this.report_button=false;
    this.updateTotalEmployeesCount();
    this.resetCheckboxes();
    this.Get_Voucher_Details();
  }
  checkAll(event: any) {
    const isChecked = event.target.checked;
    this.updateTotalEmployeesCount();
    this.voucher_data.forEach((advance: any) => {
        advance.isSelected = isChecked;
    });
    this.updateSelectedRowsAmount(null); // Update total amount when all checkboxes are checked/unchecked
}

resetCheckboxes() {
  this.isHeaderCheckboxChecked = false; // Uncheck header checkbox
  this.totalSelectedAmount=0;
  this.voucher_data.forEach((reimbursement: any) => {
      reimbursement.isSelected = false; // Uncheck all row checkboxes
  });
  this.updateTotalEmployeesCount();
}

  getTotalAmount(): number {
    this.updateTotalEmployeesCount();
    return this.voucher_data.reduce((total: number, advance: any) => {
      return total + parseFloat(advance.amount);
    }, 0);
  }

  selected_data(selected_data:any){
    this.emp_code = selected_data?.emp_code;
    this.mpr_year = selected_data?.mpryear;
    this.mpr_month = selected_data?.mprmonth;
    this.batch_no = selected_data?.batch_no;
    this.disburse_status = selected_data?.disburse_status;
    this.is_recovery =selected_data?.is_recovery;
    console.log(this.mpr_year,this.mpr_month);
  }
  GetPaymentMode_Types(){
    this._PayoutService.GetPaymentModeTypes({}).subscribe((resData: any) => {
  
      if (resData.statusCode) {
        this.payment_mode_type = resData.commonData;
        // console.log(this.payment_mode_type);
        
      } else {
        this.payment_mode_type = [];
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  updateBillableOption() {
    this.voucher_data.forEach(advance => {
        advance.is_billable = this.selectedBillableOption;
    });
    // console.log(this.selectedBillableOption);
}


//   updateBillableOption(event: any) {
//     this.isBillable=event.target.value;
//     this.voucher_data.forEach(advance => {
//         advance.is_billable = event.target.value;
//     });
    
// }
toggleAllCheckboxes(event: any) {
  this.voucher_data.forEach((advance: any) => advance.isSelected = event.target.checked); // You might want to update total amount here
}
isAnyCheckboxChecked(): boolean {
  return this.voucher_data.some(advance => advance.isSelected);
}


updateSelectedRowsAmount(advance: any) {
  this.updateTotalEmployeesCount();
  this.totalSelectedAmount = this.voucher_data.reduce((total, current) => {
      return current.isSelected ? total + parseFloat(current.amount) : total;
  }, 0);

  this.emp_code = advance?.emp_code;
  this.mpr_year = advance?.mpryear;
  this.mpr_month = advance?.mprmonth;
  this.batch_no = advance?.batch_no;
}

getCustomerLedgerSummary(){
  this._accountService.getCustomerLedgerSummary({
    'productTypeId': this.product_type,
    'customerAccountId' : this.tp_account_id?.toString()
  }).subscribe((resData:any)=>{
    if(resData.statusCode){
      this.customerSummary= JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
    // console.log(this._EncrypterService.aesEncrypt(this.customerSummary));
    
    }
  })
}
approve_popup(){
  this.open_approve_popup=true;
}

close_approve_popup(){
  this.open_approve_popup=false;
}

open_record_popup(){
  this.record_popup=true;
}

close_record_popup(){
  this.record_popup=false;
}
Get_Voucher_Details() {
  this.from_date = "01/" + (this.month?.toString()?.length == 1 ? ("0" + this.month?.toString()) : this.month?.toString()) + "/" + this.year?.toString();
  this.to_date = (new Date(this.year, this.month, 0).getDate()?.toString()) + "/" + (this.month?.toString()?.length == 1 ? ("0" + this.month?.toString()) : this.month?.toString()) + "/" + this.year?.toString();
    
  localStorage.setItem('from_date', this.from_date);
  localStorage.setItem('to_date', this.to_date);

  this._approvalsService.GetVoucherDetails({
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "deductionId": "",
      "transactionType": "",
      "ledgerType": "",
      "searchKeyword": "",
      "productTypeId": this.product_type,
      "subLedgerName": "",
      "customerAccountId": this.tp_account_id.toString()
  }).subscribe((resData: any) => {
      // Filter records with masterledgername: "Advances" and headname: "Advances" and disburse_status: "N"
      if (resData.statusCode) {
          this.voucher_data = resData.commonData.filter((record: any) => {
              return ((record.masterledgername === "Advances" && record.headname === "Advances" && record.disburse_status === "N") || (record.masterledgername === "Loan" &&  record.disburse_status === "N"));
          });
          // console.log(this.voucher_data.length);
      } else {
          this.voucher_data = [];
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
  });
}
 

Disburse_Voucher() {

  this._approvalsService.DisburseVoucher({
    "voucherYear": this.mpr_year,
    "voucherMonth": this.mpr_month,
    "empCode": this.emp_code,
    "voucherBatchNo": this.batch_no,
    "disburseBy": this.tp_account_id?.toString(),
    "productTypeId": this.product_type,
    "customerAccountId": this.tp_account_id?.toString(),
    "recordPaymentId":"-9999"
  }).subscribe((resData: any) => {
    // console.log(resData);

    if (resData.statusCode) {

      this.Get_Voucher_Details();
      this.disburse_data = resData.commonData;
      this.toastr.success(resData.message);
    
    } else {
      this.disburse_data = [];
      this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
    }
  });
}

Disburse_Voucher_for_self_mode() {
  this._approvalsService.DisburseVoucher({
    "voucherYear": this.mpr_year,
    "voucherMonth": this.mpr_month,
    "empCode": this.emp_code,
    "voucherBatchNo": this.batch_no,
    "disburseBy": this.tp_account_id?.toString(),
    "productTypeId": this.product_type,
    "customerAccountId": this.tp_account_id?.toString(),
    "recordPaymentId":this.recordPaymentId?.toString()
  }).subscribe((resData: any) => {
    // console.log(resData);

    if (resData.statusCode) {

      this.Get_Voucher_Details();
      this.disburse_data = resData.commonData;
      this.toastr.success(resData.message);
    
    } else {
      this.disburse_data = [];
      this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
    }
  });
}

  Reject_Voucher(){
    
    this._approvalsService.RejectVoucher({
      "voucherYear": this.mpr_year,
      "voucherMonth": this.mpr_month,
      "empCode": this.emp_code,
      "voucherBatchNo": this.batch_no,
      "deletedBy": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()

    }).subscribe((resData: any) => {
      console.log(resData);

      if (resData.statusCode) {

        this.Get_Voucher_Details();
        this.reject_data = resData.commonData;
        this.toastr.success(resData.message);
      
      } else {
        this.reject_data = [];
        this.Get_Voucher_Details();
        // this.toastr.error(resData.message);
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  RecordVoucher_Payment(){
    this._approvalsService.RecordVoucherPayment({
      "payoutYear": this.year,
      "payoutMonth": this.month,
      "paymentMethodId":this.payout_form.get('selected_payout_mode')?.value,
      "paymentRecordDate":$('#FromDate2').val(),
      "createdBy": this.tp_account_id?.toString(),
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.recordPaymentId= resData.commonData;
        
        this.report_button=true;
        this.submit_button=true;
        this.button_status=true;
        this.close_record_popup();
        this.disbuse_multiple_voucher();
        this.resetCheckboxes();
        this.toastr.success(resData.message);
      
      } else {
        this.toastr.error(resData.message,'Oops!');
        // this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }
}
