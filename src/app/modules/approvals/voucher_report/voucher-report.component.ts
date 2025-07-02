import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
declare var $: any;
import decode from 'jwt-decode';
import { Router } from '@angular/router';
import { ApprovalsService } from '../approvals.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';
@Component({
  selector: 'app-voucher-report',
  templateUrl: './voucher-report.component.html',
  styleUrls: ['./voucher-report.component.css']
})
export class VoucherReportComponent {
  showSidebar: boolean = true;
  voucher_data: any = [];
  MasterLedger_data: any = [];
  showDisbursedMessage: boolean = false;
  token: any = '';
  invKey: any = '';
  batch_no: any;
  reject_data:any;
  mpr_year: any;
  mpr_month: any;
  emp_code: any;
  id: any;
  disburse_data: any = [];
  selectedSubLedgerData: any = [];
  tp_account_id: any;
  data: any = [];
  SubLedger_data: any = [];
  filteredEmployees: any = [];
  disburse_status: any;
  is_recovery:any;
  search_Type: any;
  transaction_type: any;
  p: number = 0;
  search_Keyword: any;
  sub_ledger_type: any;
  Sub_ledger_type: any;
  deduction_name: any;
  master_type: any;
  from_date: any;
  to_date: any;
  addRemoveHide: boolean = false;
  product_type: any = '';
  Voucher_form: FormGroup;

  constructor(
    private _approvalsService: ApprovalsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    private _formBuilder: FormBuilder,
    private router: Router,
    private _alertservice: AlertService) { }

    
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.Voucher_form = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]],
      searchKeyword: ['', [Validators.required]],
      searchType: ['All', [Validators.required]],
      deductionId: ['', [Validators.required]],
      ledgerType: ['', [Validators.required]],
      subLedgerName: ['', [Validators.required]],
      transactionType: ['', [Validators.required]],
      selectedTransaction: ['', [Validators.required]],
      selectedMasterLedger: ['', [Validators.required]],
      selectedSubLedger: ['', [Validators.required]],
    });

    this.Get_Transaction_Type();
    this.GetMaster_Ledger_Name();
    this.GetSubLedger_Name();
    localStorage.setItem('activeTab', 'id_Approval');
    setTimeout(() => {
      this.Get_Voucher_Details('','');
    }, 1000);
    

  }
  ngAfterViewInit() {
    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date());
    }, 500);

    setTimeout(() => {
      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date());
    }, 500);

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  Hideshow_Emp(val: any) {
    if (val == 1) {
      this.addRemoveHide = true;
    }
    else {
      this.addRemoveHide = false;
    }
  }

  search(key: any) {
    let invKey = key.target.value;
    this.p = 0;
    this.filteredEmployees = this.voucher_data.filter(function (element: any) {

      return element.emp_name.toLowerCase().includes(invKey.toLowerCase()) ||
        element.emp_code.toString().toLowerCase().includes(invKey.toLowerCase())

    });

  }

  Get_Transaction_Type() {
    this.transaction_type = this.Voucher_form.get('selectedTransaction')?.value;
    this.Voucher_form.patchValue({
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
    this.master_type = this.Voucher_form.get('selectedTransaction')?.value;

    this.Voucher_form.patchValue({
      selectedMasterLedger: ''
    });

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
    this.sub_ledger_type = this.Voucher_form.get('selectedMasterLedger')?.value;
    this.Voucher_form.patchValue({
      selectedSubLedger: this.Voucher_form.get('selectedSubLedger')?.value
    });

    this.Voucher_form.patchValue({
      selectedSubLedger: ''
    });

    this._approvalsService.GetSubLedgerName({
      "ledgerName": this.sub_ledger_type,
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {

      if (resData.statusCode) {
        this.SubLedger_data = resData.commonData;
        this.selectedSubLedgerData = this.SubLedger_data.find(item => item.id === this.sub_ledger_type);


      } else {
        this.SubLedger_data = [];
      }
    });
  }

  Get_Voucher_Details(subledger: any, idx: any) {
    this.deduction_name = subledger;
    this.id = idx;

    this.from_date = $('#FromDate').val();
    this.to_date = $('#ToDate').val();
    this.search_Keyword = this.Voucher_form.get('searchKeyword').value;


    this._approvalsService.GetVoucherDetails({
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "deductionId": this.id,
      "transactionType": this.Voucher_form.get('selectedTransaction')?.value,
      "ledgerType": this.Voucher_form.get('selectedMasterLedger')?.value,
      "searchKeyword": this.search_Keyword,
      "productTypeId": this.product_type,
      "subLedgerName": this.deduction_name,
      "customerAccountId": this.tp_account_id.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.voucher_data = resData.commonData;
        this.filteredEmployees = this.voucher_data;
        // console.log(this.voucher_data);

        // this.toastr.success(resData.message);

      } else {
        this.voucher_data = [];
        this.filteredEmployees = this.voucher_data;
        // this.toastr.error(resData.message);
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  selected_data(selected_data:any){
    this.emp_code = selected_data?.emp_code;
    this.mpr_year = selected_data?.mpryear;
    this.mpr_month = selected_data?.mprmonth;
    this.batch_no = selected_data?.batch_no;
    this.disburse_status = selected_data?.disburse_status;
    this.is_recovery =selected_data?.is_recovery;
  }

  Disburse_Voucher() {

    this._approvalsService.DisburseVoucher({
      "voucherYear": this.mpr_year,
      "voucherMonth": this.mpr_month,
      "empCode": this.emp_code,
      "voucherBatchNo": this.batch_no,
      "disburseBy": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {

        this.Get_Voucher_Details(this.deduction_name, this.id);
        this.disburse_data = resData.commonData;
        this.toastr.success(resData.message);
      
      } else {
        this.disburse_data = [];
        this.Get_Voucher_Details(this.deduction_name, this.id);
        this.toastr.error(resData.message)
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

        this.Get_Voucher_Details(this.deduction_name, this.id);
        this.reject_data = resData.commonData;
        this.toastr.success(resData.message);
      
      } else {
        this.reject_data = [];
        this.Get_Voucher_Details(this.deduction_name, this.id);
        this.toastr.error(resData.message)
      }
    });
  }
  Reset() {
    this.Voucher_form.reset();

    this.Voucher_form.patchValue({
      selectedTransaction: '',
      selectedMasterLedger: '',
      selectedSubLedger: ''
    });

  }

  changeSubledger(e: any) {
    // console.log(e.target.value);
    let data = JSON.parse(e.target.value);
    // {
    //   "id": "14",
    //   "deduction_name": "Laptop reimbursement",
    //   "is_taxable": "False"
    // }
    this.deduction_name = data?.deduction_name;
    this.id = data?.id;

    this.Voucher_form.patchValue({
      selectedSubLedger: this.data?.id,
    })
    this.Get_Voucher_Details(data?.deduction_name, data?.id);
  }
}
