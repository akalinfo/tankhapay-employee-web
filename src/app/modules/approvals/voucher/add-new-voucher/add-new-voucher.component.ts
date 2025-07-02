import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import {  FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

declare var $: any;
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';

import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { ApprovalsService } from '../../approvals.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';

@Component({
  selector: 'app-add-new-voucher',
  templateUrl: './add-new-voucher.component.html',
  styleUrls: ['./add-new-voucher.component.css'],
  animations: [dongleState, grooveState]
})
export class AddNewVoucherComponent {
  @Input() parentData: any;
  showSidebar: boolean = true;
  month: any;
  check_box_count:any;
  data: any = [];
  MasterLedger_data: any = [];
  SubLedger_data: any = [];
  year: any;
  selected_date: any; 
  advance_date:any;
  sanction_dt:any;
  show_Emp_Popup:boolean=false;
  voucher_data:any=[];
  loan_advance_data:any=[];
  other_ledger_data:any=[];
  showPopup: boolean = false;
  addRemoveHide: boolean = false;
  token: any = '';
  tp_account_id: any;
  transaction_type: any;
  master_type: any;
  mprmonth:any;
  emp_code:any;
  mpryear:any;
  selectedRowsParams: any[] = [];
  Emp_code:any;
  sub_ledger_type: any;
  sub_Ledger:any;
  product_type: any = '';
  TransactionForm: FormGroup;
  subledgerForm:FormGroup;
  loan_data:any=[];
  advance_data:any=[];
  MasterLedgerForm: FormGroup;
  selectedSubLedgerData:any=[];
  SubLedgerForm: FormGroup;
  Check_count_checkbox:any;
  Emp_name:any;
  searchEmployeeName: string = '';
  selectedTransactionType: string = "-1";
  selectcredit: boolean = false;
  yearsArray: any = [];
  save_ledger:FormGroup;
  @ViewChild('hd') hdate: ElementRef;
  accessRights: any = {};
  constructor(private fb: FormBuilder,
    private _approvalsService: ApprovalsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _alertservice: AlertService,
    private _masterService: MasterServiceService
  ) { 

    if (this.router.getCurrentNavigation()?.extras.state) {
      const state = this.router.getCurrentNavigation().extras.state;
      this.selectedRowsParams = state.selectedRowsParams;
// console.log(this.selectedRowsParams);

 if (Array.isArray(this.selectedRowsParams) &&  this.selectedRowsParams.length === 1) {
    // If multiple checkboxes are checked
    const firstSelectedRow = this.selectedRowsParams[0];

    this.Emp_code = firstSelectedRow.only_emp_code;
    this.Emp_name = firstSelectedRow.emp_name;
    this.check_box_count=firstSelectedRow.check_box_count;
    this.mprmonth=firstSelectedRow.mprmonth;
    this.mpryear = firstSelectedRow.mpryear;
    this.emp_code =firstSelectedRow.emp_Code;
  } 
      // console.log(this.Emp_code, this.Emp_name,this.check_box_count);
    }
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    
    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    for (let i = 2021; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);
    };

    this.TransactionForm = this.fb.group({
      selectedTransaction: ['',  [Validators.required]],
      selectedMasterLedger: ['', [Validators.required]],
      selectedSubLedger: ['', [Validators.required]],
  
      subledgerTable : this.fb.array([]),
      loanTable:this.fb.array([]),
      AdvanceTable:this.fb.array([])
    });

    this.save_ledger = this.fb.group({
      saveLedger: ['',  [Validators.required]],
    });
    this.accessRights = this._masterService.checkAccessRights('/approval/voucher');
    // console.log(this.accessRights);

    this.Get_Transaction_Type();
    this.GetMaster_Ledger_Name();
    this.GetSubLedger_Name();
  }

  addSubledgerGroup() {
    const isTaxableValue = this.TransactionForm.get('selectedMasterLedger')?.value === 'Additional income' ? 'YES' : 'NO';

    this.subledgerTable.push(
      this.fb.group({
        IsTaxable: [isTaxableValue],
      })
    );
  }

  get subledgerTable(){
    return this.TransactionForm.get('subledgerTable') as FormArray;  
  }

  get loanTable(){
    return this.TransactionForm.get('loanTable') as FormArray;  
  }

  get AdvanceTable(){
    return this.TransactionForm.get('AdvanceTable') as FormArray; 
  }

  get loan(){
    return this.TransactionForm.controls.loanTable as FormArray;
  }

  showEmpPopup(){
    this.show_Emp_Popup=true;
  }

  closeEmpPopup(){
    this.show_Emp_Popup=false;
    this.save_ledger.reset();
  }

  changeDate(){
    this.TransactionForm.patchValue({
      'loanTable': this.hdate.nativeElement.value
    })

  }
  addSkills() {
    
    if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add )) {
      this.toastr.error("You do not have the permission for this.");
      return; 
   }
    this.sub_ledger_type = this.TransactionForm.get('selectedSubLedger')?.value;
     this.selectedSubLedgerData = this.SubLedger_data.find(item => item.id === this.sub_ledger_type);
    
    // this.sub_Ledger=
    if(this.selectedSubLedgerData?.deduction_name =='Advances'){
      // console.log(this.selectedSubLedgerData?.deduction_name);
       
      this.addAdvance();
    }else if(this.selectedSubLedgerData?.deduction_name =='Loan'){

      this.addLoan();
   }

   else if(this.selectedSubLedgerData?.deduction_name =='Other' || this.selectedSubLedgerData?.deduction_name =='Other (Deduction)' ||  this.selectedSubLedgerData?.deduction_name =='Others'){
   alert('Are you sure you want to add a new subledger?');
    this.showEmpPopup();
  }

  else{

    const isTaxableValue = this.TransactionForm.get('selectedMasterLedger')?.value === 'Additional income' ? 'YES' : 'NO';

    this.subledgerTable.push(
      this.fb.group({
        HeadName: [this.selectedSubLedgerData?.deduction_name],
        Amount: ['', [Validators.required, Validators.pattern('/[^0-9.]/g')]],
        LedgerType:[this.TransactionForm.get('selectedMasterLedger')?.value],
        IsTaxable: [isTaxableValue],
        IsBillableORNonBillable:[''],
        Action:['',[Validators.required]],
      })
    );

    // this.subledgerTable.push(
    //   this.fb.group({
    //   HeadName: [this.selectedSubLedgerData?.deduction_name],
    //   Amount: ['', [Validators.required, Validators.pattern('/[^0-9.]/g')]],
    //   LedgerType:[this.TransactionForm.get('selectedMasterLedger')?.value],
    //   IsTaxable:['NO'],
    //   IsBillableORNonBillable:[''],
    //   Action:['',[Validators.required]],
    // })
    // )
  }
  
}

addLoan() {

  if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add )) {
    this.toastr.error("You do not have the permission for this.");
    return; // Return here to stop execution of the function
 }

  this.sub_ledger_type = this.TransactionForm.get('selectedSubLedger')?.value;
  this.selectedSubLedgerData = this.SubLedger_data.find(item => item.id === this.sub_ledger_type);

  const loanFormGroup = this.fb.group({
    sanctionDate: ['', [Validators.required]],
    Amount: ['', [Validators.required, Validators.pattern('^[0-9]$')]],
    NO_of_Installments: [''],
    ROI: [''],
    Total_Interest: [''],
    BillableORNonBillable: ['No'],
    Monthly_EMI: ['', [Validators.required]],
  });
  // Listen for changes in Amount, NO_of_Installments, and ROI
  loanFormGroup.get('Amount')?.valueChanges.subscribe(() => this.calculateTotalInterestAndEMI(loanFormGroup));
  loanFormGroup.get('NO_of_Installments')?.valueChanges.subscribe(() => this.calculateTotalInterestAndEMI(loanFormGroup));
  loanFormGroup.get('ROI')?.valueChanges.subscribe(() => this.calculateTotalInterestAndEMI(loanFormGroup));

  this.loanTable.push(loanFormGroup);

  // Set up datepicker for the new form group
  const index = this.loanTable.length - 1;
  const currentDate = new Date();
  setTimeout(() => {
    $('#sanctionDate' + index).datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: currentDate,
      onSelect: (dateText: string) => {
        this.loanTable.controls[index].get('sanctionDate')?.setValue(dateText);
      },
    });
  }, 100);

  // setTimeout(() => {
  //   $('#sanctionDate' + index).datepicker({
  //     dateFormat: 'dd/mm/yy',
  //     changeMonth: true,
  //     changeYear: true,
  //     onSelect: (dateText: string) => {
  //       this.loanTable.controls[index].get('sanctionDate')?.setValue(dateText);
  //     },
  //   });
  // }, 100);
}

calculateTotalInterestAndEMI(loanFormGroup: FormGroup) {
  const amount = loanFormGroup.get('Amount')?.value || 0;
  const noOfInstallments = loanFormGroup.get('NO_of_Installments')?.value || 0;
  const roi = loanFormGroup.get('ROI')?.value || 0;

  // Calculate Total_Interest
  const totalInterest = (amount * noOfInstallments * roi) / (12 * 100); // Adjusted formula for compound interest

  // Calculate Monthly_EMI using the formula EMI = (Total_Interest + Amount) / No_of_Installments
  const monthlyEMI = (totalInterest + parseInt(amount as string)) / noOfInstallments;
  

  // Update the form controls with rounded values
  loanFormGroup.get('Total_Interest')?.setValue(totalInterest.toFixed(2));
  loanFormGroup.get('Monthly_EMI')?.setValue(monthlyEMI.toFixed(2));
}

addAdvance() {
  // AdvanceTable
  if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add )) {
     this.toastr.error("You do not have the permission for this.");
     return; // Return here to stop execution of the function
  }
  
  this.AdvanceTable.push(
    this.fb.group({
      sanctionDate: ['',[Validators.required]],
      Advance_Amount: ['', [Validators.required,Validators.pattern('^[0-9]$')]],
      BillableORNonBillable:['No']
    })
  );

  const index = this.AdvanceTable.length - 1;
  setTimeout(() => {
    $('#sanctionDate' + index).datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      onSelect: (dateText: string) => {
        // Update the selected date in the form group
        this.AdvanceTable.controls[index].get('sanctionDate')?.setValue(dateText);
      },
    });
  }, 100); 
}

  removeSubledger(i:number) {
    this.subledgerTable.removeAt(i);
  }

  toggle(){
    this.showSidebar = !this.showSidebar;
  }

  xyz(index) {
    return this.subledgerTable.at(index) as FormGroup;
  }

  xz(index){
    return this.loanTable.at(index) as FormGroup;
  }

  xy(index){
    return this.AdvanceTable.at(index) as FormGroup;
  }
  Get_Transaction_Type() {
    this.transaction_type=this.TransactionForm.get('selectedTransaction')?.value;
    this.TransactionForm.patchValue({
      selectedTransaction: ''
    });

    this._approvalsService.GetTransactionType({
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.data = resData.commonData;
       
      } 
      else {
        this.data = [];
      }
    });

  }

  GetMaster_Ledger_Name() {
    this.master_type = this.TransactionForm.get('selectedTransaction')?.value;
    this.TransactionForm.patchValue({
      selectedMasterLedger: ''
    });
    // console.log(this.master_type);

    this._approvalsService.GetMasterLedgerName({
      "transactionType": this.master_type,
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {

      if (resData.statusCode) {
        this.MasterLedger_data = resData.commonData;
        // console.log(this.MasterLedger_data);

      } else {
        this.MasterLedger_data = [];
      }
    });
  }

  GetSubLedger_Name() {
    this.sub_ledger_type = this.TransactionForm.get('selectedMasterLedger')?.value;
    
    this.TransactionForm.patchValue({
      selectedSubLedger: this.TransactionForm.get('selectedSubLedger')?.value
    });

    this.TransactionForm.patchValue({
      selectedSubLedger: ''
    });

    this._approvalsService.GetSubLedgerName({
      "ledgerName": this.sub_ledger_type,
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      
      if (resData.statusCode) {
        this.SubLedger_data = resData.commonData;
  
      } else {
        this.SubLedger_data = [];
      }
    });
  }

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }
  Hideshow_Emp(val: any) {
    if (val == 'Reimbursement') {
      this.addRemoveHide = true;
    }
    else {
      this.addRemoveHide = false;
    }
  }

  checkAllCheckBox(ev: any) {
    this.data.forEach(x => x.checked = ev.target.checked)
  }

  isAllCheckBoxChecked() {
    return this.data.every(p => p.checked);
  }

  // SaveOther_LedgerName(){
    
  //   if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add )) {
  //     this.toastr.error("You do not have the permission for this.");
  //     return; 
  //  }
  //   this._approvalsService.SaveOtherLedgerName({
  //     "otherMasterLedger":this.TransactionForm.get('selectedTransaction')?.value,
  //     "otherMasterLedgerType":this.TransactionForm.get('selectedMasterLedger')?.value,
  //     "otherSubLedgerType":this.TransactionForm.get('selectedSubLedger')?.value,
  //     "isTaxableOther":this.TransactionForm.get('selectedMasterLedger')?.value === 'Additional income' ? 'Y' : 'N',
  //     "createdBy":this.tp_account_id?.toString(),
  //     "otherLedgerName":this.save_ledger.get('saveLedger')?.value

  //   }).subscribe((resData: any) => {
  //     // console.log(resData);
  //     if (resData.statusCode) {
  //       this.other_ledger_data = resData.commonData;
  //       this.GetSubLedger_Name();
  //       this.toastr.success(resData.message);
        
  //       this.closeEmpPopup();
  //     } else {
  //       this.other_ledger_data = [];
  //       this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
  //     }

  //   });
  // }

  SaveOtherLedgerCustomer_Specific(){
    
    if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add )) {
      this.toastr.error("You do not have the permission for this.");
      return; 
   }
    this._approvalsService.SaveOtherLedgerCustomerSpecific({
      "masterVoucherName":this.TransactionForm.get('selectedTransaction')?.value,
      "masterVoucherType":this.TransactionForm.get('selectedMasterLedger')?.value,
      "masterVoucherTypeId":this.TransactionForm.get('selectedSubLedger')?.value,
      "isTaxableOther":this.TransactionForm.get('selectedMasterLedger')?.value === 'Additional income' ? 'Y' : 'N',
      "createdBy":this.tp_account_id?.toString(),
      "otherLedgerName":this.save_ledger.get('saveLedger')?.value,
      "customerAccountId":this.tp_account_id?.toString(),

    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.other_ledger_data = resData.commonData;
        this.GetSubLedger_Name();
        this.toastr.success(resData.message);
        
        this.closeEmpPopup();
      } else {
        this.other_ledger_data = [];
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }

    });
  }

  getNumeriVal(val:any){
    if (/[^0-9.]/g.test(val)) val = val.replace(/[^0-9.]/g,'')
   return val;
  }


    Save_Voucher() {

      if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add )) {
        this.toastr.error("You do not have the permission for this.");
        return; 
     }

    if (this.selectedRowsParams.length > 0) {
      this.selectedRowsParams.forEach(row => {
        // console.log(row, 'rpwwwwwwwwwwww');
        
        let empCode = row.emp_Code;
        this.mprmonth=row.mprmonth;
        this.mpryear=row.mpryear
        console.log(empCode,this.mprmonth,this.mpryear);
        this.subledgerTable.controls.forEach((control: FormGroup) => {
          let amountValue = control.value.Amount;
            // Retrieve deduction ID based on deduction name
        const deductionId = this.SubLedger_data.find(item => item.deduction_name === control.value.HeadName)?.id;

        if (
          this.TransactionForm.get('selectedTransaction')?.value === 'Debit' &&
          this.TransactionForm.get('selectedMasterLedger')?.value === 'Deduction'
        ) {
          // If the transaction is Debit and the master ledger is Deduction, adjust the amount
          if (parseFloat(amountValue) > 0) {
            // Convert positive amount to negative
            amountValue = '-' + amountValue;
          }
        }
  
        this._approvalsService.SaveVoucher({
          voucherYear: this.mpryear,
          voucherMonth: this.mprmonth,
          empCode: row.emp_Code,
          amount: amountValue.toString(),
          deductionId: deductionId,
          transactionType: this.TransactionForm.get('selectedTransaction')?.value,
          ledgerType: this.TransactionForm.get('selectedMasterLedger')?.value,
          subLedgerName: control.value.HeadName,
          isTaxableFlag: this.TransactionForm.get('selectedMasterLedger')?.value === 'Additional income' ? 'Y' : 'N',
          IsBillableFlag:  control.value.IsBillableORNonBillable,
          createdBy: this.tp_account_id.toString(),
          productTypeId: this.product_type,
          customerAccountId: this.tp_account_id.toString()
        }).subscribe((resData: any) => {
          // console.log(resData,"Arpit");
          // return;
          if (resData.statusCode) {
            this.voucher_data = resData.commonData;
            this.toastr.success(resData.message);
            this.router.navigate(['/payouts/Reimbursement']);
          } else {
            this.voucher_data = [];
            this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          }
        });
      });
    });
    }
  }


SaveAdvanceAndLoanVoucher() {

  if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add )) {
    this.toastr.error("You do not have the permission for this.");
    return; 
 }

  this.sanction_dt=this.loanTable.controls[0]?.value.sanctionDate;
  this.advance_date= this.AdvanceTable.controls[0]?.value.sanctionDate;

  if (this.selectedRowsParams.length > 0) {
    this.selectedRowsParams.forEach(row => {
      let empCode = row.emp_Code;
      // console.log(empCode);
      if (this.selectedSubLedgerData?.deduction_name=='Loan') {
        this._approvalsService.SaveAdvanceAndLoanVoucher({
          sanctionDate: this.loanTable.controls[0]?.value.sanctionDate,
          instalment: this.loanTable.controls[0]?.value.NO_of_Installments?.toString(),
          roi: this.loanTable.controls[0]?.value.ROI?.toString(),
          loanBillableOrNonBillable: 'N',
          empCode: empCode?.toString(),
          amount: this.loanTable.controls[0]?.value.Amount.toString(),
          headId: this.TransactionForm.get('selectedSubLedger')?.value,
          subLedgerHeadName: this.selectedSubLedgerData?.deduction_name,
          createdBy: this.tp_account_id.toString(),
          productTypeId: this.product_type,
          createdByIp: '11',
          customerAccountId: this.tp_account_id.toString()
        }).subscribe((resData: any) => {
          // console.log(resData);
          if (resData.statusCode) {
            this.loan_data = resData.commonData;
            this.toastr.success(resData.message);
            this.router.navigate(['/payouts/Advance']);
          } else {
            this.loan_data = [];
            this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          }
        });
      } else if (this.selectedSubLedgerData?.deduction_name=='Advances') {
        
        this._approvalsService.SaveAdvanceAndLoanVoucher({
          sanctionDate: this.advance_date,
          instalment: '1',
          roi: '0',
          loanBillableOrNonBillable: 'N',
          empCode: empCode,
          amount: this.AdvanceTable.controls[0]?.value.Advance_Amount.toString(),
          headId: this.TransactionForm.get('selectedSubLedger')?.value,
          subLedgerHeadName: this.selectedSubLedgerData?.deduction_name,
          createdBy: this.tp_account_id.toString(),
          productTypeId: this.product_type,
          createdByIp: '11',
          customerAccountId: this.tp_account_id.toString()
        }).subscribe((resData: any) => {
          // console.log(resData);
          if (resData.statusCode) {
            this.advance_data = resData.commonData;
            this.toastr.success(resData.message);
            this.router.navigate(['/payouts/Advance']);
          } else {
            this.advance_data = [];
            this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          }
        });
      }
    });
  }
}


}
