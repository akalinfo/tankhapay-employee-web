import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

declare var $: any;
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ApprovalsService } from '../approvals.service';
import { dongleState, grooveState } from 'src/app/app.animation';
@Component({
  selector: 'app-master-voucher-type',
  templateUrl: './master-voucher-type.component.html',
  styleUrls: ['./master-voucher-type.component.css'],
  animations: [dongleState, grooveState]
})
export class MasterVoucherTypeComponent {
  @Input() parentData: any;
  master_voucher_flag:boolean=false;
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
  
  addSubledger() {
    const confirmation = window.confirm('Are you sure you want to add a new Subledger?');
    if (confirmation) {
        this.showEmpPopup();
    }
}
  addSkills() {
    
    if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add )) {
      this.toastr.error("You do not have the permission for this.");
      return; 
   }
    this.sub_ledger_type = this.TransactionForm.get('selectedSubLedger')?.value;
     this.selectedSubLedgerData = this.SubLedger_data.find(item => item.id === this.sub_ledger_type);

   if(this.selectedSubLedgerData?.deduction_name =='Other' || this.selectedSubLedgerData?.deduction_name =='Other (Deduction)' ||  this.selectedSubLedgerData?.deduction_name =='Others'){
   alert('Are you want to add a new Subledger!');
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
  }
  
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
        this.MasterLedger_data = resData.commonData.filter(option => 
          option.masterledgername !== 'Loan' && option.masterledgername !== 'Advances');

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
        this.selectedSubLedgerData = this.SubLedger_data.find(item => item.deduction_name === 'Other' ||item.deduction_name === 'Others' ||item.deduction_name === 'Other (Deduction)');
        
        if (this.sub_ledger_type && this.master_voucher_flag== false) {
          this.addSubledger();
      }
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

  checkAllCheckBox(ev: any) {
    this.data.forEach(x => x.checked = ev.target.checked)
  }

  isAllCheckBoxChecked() {
    return this.data.every(p => p.checked);
  }

  SaveOtherLedgerCustomer_Specific(){
    
    if (this.token.isEmployer != '1' && !(this.accessRights.Edit || this.accessRights.Add )) {
      this.toastr.error("You do not have the permission for this.");
      return; 
   }
    this._approvalsService.SaveOtherLedgerCustomerSpecific({
      "masterVoucherName":this.TransactionForm.get('selectedTransaction')?.value,
      "masterVoucherType":this.TransactionForm.get('selectedMasterLedger')?.value,
      "masterVoucherTypeId":this.selectedSubLedgerData?.id,
      "isTaxableOther":this.TransactionForm.get('selectedMasterLedger')?.value === 'Additional income' ? 'Y' : 'N',
      "createdBy":this.tp_account_id?.toString(),
      "otherLedgerName":this.save_ledger.get('saveLedger')?.value,
      "customerAccountId":this.tp_account_id?.toString(),

    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.master_voucher_flag=true;
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

}