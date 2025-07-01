import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
declare var $: any;
import decode from 'jwt-decode';
import { AccountsService } from '../../accounts/accounts.service';
import { ApprovalsService } from '../../approvals/approvals.service';
import { PayoutService } from '../payout.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { dongleState, grooveState } from 'src/app/app.animation';

@Component({
  selector: 'app-reimbursement',
  templateUrl: './reimbursement.component.html',
  styleUrls: ['./reimbursement.component.css'],
  animations: [dongleState, grooveState]
})
export class ReimbursementComponent {
  recordPaymentId:any;
  submit_button:boolean = false;
  button_status:boolean=false;
  report_button:boolean=false;
  payment_mode_type:any=[];
  showSidebar: boolean = true;
  product_type: any = '';
  token: any = '';
  from_date: any = '';
  PI_data:any=[];
  to_date: any = '';
  batch_no: any;
  disburse_data:any=[];
  reject_data:any;
  SubLedger_data:any=[];
  selectedBillableOption: string = 'Y';
  isBillable:any;
  mpr_year: any;
  mpr_month: any;
  emp_code: any;
  PI_form: FormGroup;
  month: any;
  checkbox_count:any;
  amount:any;
  days_count: any;
  voucher_data: any = [];
  filteredEmployees: any=[];
  year: any;
  customerSummary: any=[];
  disburse_status: any;
  selectedRowsAmount: number = 0;
  showPopup: boolean = false;
  p: number = 0;
  invKey:any;
  calPaymentStatus : any = '1';
  disburse_popup:boolean=false;
  is_recovery:any;
  invoicedetail : any = [];
  totalSelectedAmount: number = 0;
  isHeaderCheckboxChecked: boolean = false;
  tp_account_id: any;
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
  payout_mode_type:any;
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
    this.subledger();
    this.getCustomerLedgerSummary();
    this.Get_Voucher_Details();
    this.isBillable = 'N'; // Set the default value to 'N'
    this.selectedBillableOption = 'N'; 
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

  updateBillableOption() {
    this.voucher_data.forEach(advance => {
        advance.is_billable = this.selectedBillableOption;
    });
    // console.log(this.selectedBillableOption);
}

//   updateBillableOption(event: any) {
//     this.isBillable=event.target.value;
//     this.voucher_data.forEach(reimbursement => {
//       reimbursement.is_billable = event.target.value;
//     });
//     // console.log(this.isBillable);
    
// }

parseFloat(value: any): number {
  return parseFloat(value);
}

  openPopup(){
    this.showPopup = true;
  }
  closePopup() {
    this.showPopup = false;
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

  resetCheckboxes() {
    this.isHeaderCheckboxChecked = false; // Uncheck header checkbox
    this.totalSelectedAmount=0;
    this.voucher_data.forEach((reimbursement: any) => {
        reimbursement.isSelected = false; // Uncheck all row checkboxes
    });
    this.updateTotalEmployeesCount();
  }
  
  selected_data(selected_data:any){
    this.emp_code = selected_data?.emp_code;
    this.mpr_year = selected_data?.mpryear;
    this.mpr_month = selected_data?.mprmonth;
    this.batch_no = selected_data?.batch_no;
    this.disburse_status = selected_data?.disburse_status;
    this.is_recovery =selected_data?.is_recovery;
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
  checkAll(event: any) {
    const isChecked = event.target.checked;
    this.updateTotalEmployeesCount();
    this.voucher_data.forEach((reimbursement: any) => {
      reimbursement.isSelected = isChecked;
    });
    this.calculateTotalSelectedAmount();
    this.updateSelectedRowsAmount(null); // Update total amount when all checkboxes are checked/unchecked
}

  getTotalAmount(): number {
    this.updateTotalEmployeesCount();
    return this.voucher_data.reduce((total: number, reimbursement: any) => {
      return total + parseFloat(reimbursement.amount);
    }, 0);
  }

  formatAmount(totalSelectedAmount: number, balance: string): string {
    const remainingAmount = totalSelectedAmount - parseFloat(balance || '0.00');
    return '₹' + (remainingAmount >= 0 ? remainingAmount : 0).toFixed(2);
}
  getCheckedCheckboxCount() {
    return this.voucher_data.filter(reimbursement => reimbursement.isSelected).length;
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
  
    this.router.navigate(['/payouts/Reimbursement-Payment'],
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
  search(key: any) {
    this.invKey = key.target.value;
    this.p = 0;
    this.filteredEmployees = this.voucher_data.filter(function (element: any) {
      return (element.headname.toLowerCase().includes(key.target.value.toLowerCase())
        || element.masterledgername.toLowerCase().includes(key.target.value.toLowerCase())
      )
    });
    this.resetCheckboxes();
  }

  calculateTotalSelectedAmount() {
    this.totalSelectedAmount = this.filteredEmployees.reduce((total: number, reimbursement: any) => {
        if (reimbursement.isSelected) {
            return total + parseFloat(reimbursement.amount); // Assuming 'amount' is the field you want to sum
        }
        return total;
    }, 0);
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
        this.toastr.error(resData.message)
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
        this.toastr.error(resData.message,'Oops!');
        // this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  toggleAllCheckboxes(event: any) {
    this.voucher_data.forEach((reimbursement: any) => reimbursement.isSelected = event.target.checked); // You might want to update total amount here
  }
  isAnyCheckboxChecked(): boolean {
    return this.voucher_data.some(reimbursement=> reimbursement.isSelected);
  }
  
  updateSelectedRowsAmount(reimbursement: any) {
    this.updateTotalEmployeesCount();
    this.totalSelectedAmount = this.voucher_data.reduce((total, current) => {
        return current.isSelected ? total + parseFloat(current.amount) : total;
    }, 0);

    this.emp_code = reimbursement?.emp_code;
    this.mpr_year = reimbursement?.mpryear;
    this.mpr_month = reimbursement?.mprmonth;
    this.batch_no = reimbursement?.batch_no;
    this.calculateTotalSelectedAmount();
  }

subledger(){
  this._approvalsService.GetSubLedgerName({
    "ledgerName": "Reimbursement"
  }).subscribe((resData: any) => {
    
    if (resData.statusCode) {
      this.SubLedger_data = resData.commonData;

    } else {
      this.SubLedger_data = [];
    }
  });
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
        "subLedgerName": "", // Pass selected option here
        "customerAccountId": this.tp_account_id.toString()
    }).subscribe((resData: any) => {
        if (resData.statusCode) {
            // Filter records based on selected option Additional income
            this.voucher_data = resData.commonData.filter((record: any) => {
                return (record.masterledgername === "Reimbursement" &&  record.disburse_status === "N") || (record.masterledgername === "Additional income" &&  record.disburse_status === "N");
            });
           this.filteredEmployees=this.voucher_data;
           
        } else {
            this.voucher_data = [];
            this.filteredEmployees=[];
            this.toastr.error(resData.message,'Oops!');
            // this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
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
      // console.log(resData);

      if (resData.statusCode) {
        let mobile = this.filteredEmployees.filter(emp=> emp.emp_code == this.emp_code)[0].mobile;
        let amount = this.filteredEmployees.filter(emp=> emp.emp_code == this.emp_code)[0].amount;
        let is_whatsappsms = this.filteredEmployees.filter(emp=> emp.emp_code == this.emp_code)[0].is_whatsappsms;
        if(is_whatsappsms=='Y'){

          this._PayoutService.reimbursementClaim({recipient_mobile : mobile,amount: amount,status : 'rejected'}).subscribe((resData:any)=>{})
        // this._PayoutService.reimbursementClaim
        }
        this.Get_Voucher_Details();
        this.reject_data = resData.commonData;
        this.toastr.success(resData.message);
      
      } else {
        this.reject_data = [];
        this.Get_Voucher_Details();
        // this.toastr.error(resData.message)
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
