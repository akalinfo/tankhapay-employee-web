import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
declare var $: any;
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import { VisitorService } from '../../visitor/visitor.service';
import { ApprovalsService } from '../approvals.service';

@Component({
  selector: 'app-proof-of-reimbursement',
  templateUrl: './proof-of-reimbursement.component.html',
  styleUrls: ['./proof-of-reimbursement.component.css']
})
export class ProofOfReimbursementComponent {
  showSidebar: boolean = false;
  tp_account_id: any;
  filteredEmployees:any=[];
  reimbursement_data:any=[];
  reimbursement_claim_data:any=[];
  data:any=[];
  decoded_token:any;
  currentDate: any;
  filterStatus:any;
  claimRecordId:any;
  emp_code:any;
  product_type:any;
  p: number = 1;
  expense_doc_status_code:any;
  currentDateString: any;
  visitor_list_data:any=[];
  employer_name: any = '';
  Reimbursement_Form:FormGroup;
  Reject_Reimbursement_cliam:FormGroup;
  header_checkbox: boolean = false;
  filterTypes:any=[];
  selectedStatus: string = 'All';
  constructor(
    private _approvalsService: ApprovalsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _ReportService:ReportService,
    private _formBuilder: FormBuilder,
  ) {
   }

  
  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
     this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.employer_name = this.decoded_token.name;
    this.product_type = localStorage.getItem('product_type');
    // console.log(decoded_token);

    this.Reimbursement_Form = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]],
      filterStatus:['All',[Validators.required]]
    });

    this.Reject_Reimbursement_cliam = this._formBuilder.group({
      Remarks: ['', [Validators.required]],
    });

    setTimeout(() => {
      this.GetAllReimbursementClaims_ForEmployer();
    }, 1000);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
      $('#FromDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', firstDayOfMonth); // Set first day of current month as default
  
      $('#ToDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', lastDayOfMonth); // Set last day of current month as default
    }, 500);
  }

  onStatusChange(event: any): void {
    this.selectedStatus = event.target.value;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  GetAllReimbursementClaims_ForEmployer(){
    this._approvalsService.GetAllReimbursementClaimsForEmployer({
      "fromDate": $('#FromDate2').val(),
      "toDate": $('#ToDate2').val(),
      "filterStatus": this.Reimbursement_Form.get('filterStatus')?.value,
      "orgUnitId": this.decoded_token.geo_location_id?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.reimbursement_data = resData.commonData.reimbursementClaimsDetails;
        this.filteredEmployees = this.reimbursement_data;
       if(this.filterTypes.length==0){
         this.filterTypes = resData.commonData.filterTypes;
        //  console.log(this.filterTypes);
       }

      } else {
        this.filterTypes=[];
        this.reimbursement_data = [];
        this.filteredEmployees =[];
        this.toastr.error(resData.message);
      }
    });
  }
  selected_data(selected_data:any){
    this.emp_code = selected_data?.emp_code;
    this.claimRecordId = selected_data?.claim_record_id;
  }

  Approve_ReimbursementClaim(){
    this._approvalsService.ManageReimbursementClaim({
      "claimStatus": 'A',
      "claimRejectReason": '',
      "empCode": this.emp_code,
      "claimRecordId": this.claimRecordId,
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "modifiedBy": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.reimbursement_claim_data = resData.commonData.reimbursementClaimsDetails;
       this.GetAllReimbursementClaims_ForEmployer();
        this.toastr.success(resData.message);
      } else {
        this.reimbursement_claim_data = [];
        this.toastr.error(resData.message);
      }
    });
  }

  Reject_ReimbursementClaim(){
    this._approvalsService.ManageReimbursementClaim({
      "claimStatus": 'R',
      "claimRejectReason": this.Reject_Reimbursement_cliam.get('Remarks')?.value,
      "empCode": this.emp_code,
      "claimRecordId": this.claimRecordId,
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "modifiedBy": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.reimbursement_claim_data = resData.commonData.reimbursementClaimsDetails;
        this.GetAllReimbursementClaims_ForEmployer();
        this.toastr.success(resData.message);
      } else {
        this.reimbursement_claim_data = [];
        this.toastr.error(resData.message);
      }
    });
  }
}
