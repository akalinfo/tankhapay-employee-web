import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class ApprovalsService {

  constructor(
    private _CallApiService: CallApiService
  ) { }

  private CheckAdvanceForAssociate_url: string = constants.CheckAdvanceForAssociate_url;
  private SaveTpVoucher_url: string = constants.SaveTpVoucher_url;
  private get_employer_today_attendance_url: string = constants.get_employer_today_attendance_url;
  private get_od_appl_by_account_url: string = constants.get_od_appl_by_account_url;
  private approved_od_appl_by_applid_url: string = constants.approved_od_appl_by_applid_url;
  private RecordVoucherPayment_url:string=constants.RecordVoucherPayment_url;

   //27-12-2024 add by akchhaya
   private getAllTravelRequestSummary_url: string=constants.getAllTravelRequestSummary_url;
   private getAllTravelExpenseDetails_url: string= constants.getAllTravelExpenseDetails_url;
   private updateTravelReqExpStatus_url: string= constants.updateTravelReqExpStatus_url;

  checkAdvanceForAssociate(userData: any) {
    return this._CallApiService.post_enc(userData, this.CheckAdvanceForAssociate_url);
  }
  saveTpVoucher(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveTpVoucher_url);
  }
  get_employer_today_attendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_employer_today_attendance_url);
  }
  private CanditateDetailsForVoucher_url: string = constants.CanditateDetailsForVoucher_url;
  CanditateDetailsForVoucher(userData: any) {
    return this._CallApiService.post_enc(userData, this.CanditateDetailsForVoucher_url);
  }

  private GetTransactionType_url: string = constants.GetTransactionType_url;
  private GetMasterLedgerName_url: string = constants.GetMasterLedgerName_url;
  private GetSubLedgerName_url: string = constants.GetSubLedgerName_url;
  GetTransactionType(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetTransactionType_url);
  }

  GetMasterLedgerName(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetMasterLedgerName_url);
  }

  GetSubLedgerName(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetSubLedgerName_url);
  }

  private SaveOtherLedgerName_url: string = constants.SaveOtherLedgerName_url;
  private SaveVoucher_url: string = constants.SaveVoucher_url;
  private SaveAdvanceAndLoanVoucher_url: string = constants.SaveAdvanceAndLoanVoucher_url;

  SaveOtherLedgerName(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveOtherLedgerName_url);
  }

  SaveVoucher(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveVoucher_url);
  }

  SaveAdvanceAndLoanVoucher(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveAdvanceAndLoanVoucher_url);
  }

  private GetVoucherDetails_url: string = constants.GetVoucherDetails_url;
  GetVoucherDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetVoucherDetails_url);
  }
  private DisburseVoucher_url: string = constants.DisburseVoucher_url;
  DisburseVoucher(userData: any) {
    return this._CallApiService.post_enc(userData, this.DisburseVoucher_url);
  }
  private RejectVoucher_url: string = constants.RejectVoucher_url;
  RejectVoucher(userData: any) {
    return this._CallApiService.post_enc(userData, this.RejectVoucher_url);
  }

  private GetAllReimbursementClaimsForEmployer_url:string= constants.GetAllReimbursementClaimsForEmployer_url;

  GetAllReimbursementClaimsForEmployer(userData:any){
    return this._CallApiService.post_enc(userData, this.GetAllReimbursementClaimsForEmployer_url);
  }

  private ManageReimbursementClaim_url:string = constants.ManageReimbursementClaim_url;

  ManageReimbursementClaim(userData:any){
    return this._CallApiService.post_enc(userData, this.ManageReimbursementClaim_url);
  }
  get_od_appl_by_account(userData:any){
    return this._CallApiService.post_enc(userData, this.get_od_appl_by_account_url);
  }
  approved_od_appl_by_applid(userData:any){
    return this._CallApiService.post_enc(userData, this.approved_od_appl_by_applid_url);
  }



  RecordVoucherPayment(userData:any){
    return this._CallApiService.post_enc(userData, this.RecordVoucherPayment_url);
  }
  private SaveOtherLedgerCustomerSpecific_url:string=constants.SaveOtherLedgerCustomerSpecific_url;

  SaveOtherLedgerCustomerSpecific(userData:any){
    return this._CallApiService.post_enc(userData, this.SaveOtherLedgerCustomerSpecific_url);
  }

  // 27-12-2024 add by akchhaya
  getAllTravelRequestSummary(userData: any){
    return this._CallApiService.post_enc(userData, this.getAllTravelRequestSummary_url)
  }
  getAllTravelExpenseDetails(userData: any){
    return this._CallApiService.post_enc(userData, this.getAllTravelExpenseDetails_url)
  }
  updateTravelReqExpStatus(userData: any){
     return this._CallApiService.post_enc(userData, this.updateTravelReqExpStatus_url)
   }

   private getemployeelistHubFace_url: string = constants.getemployeelistHubFace_url;
   getFaceEmployeeList(userData: any) {
    return this._CallApiService.post_enc(userData, this.getemployeelistHubFace_url);
  }
  private approveRejectFaceRegister_url: string = constants.approveRejectFaceRegister_url;
  approveRejectFaceRegister(userData: any) {
    return this._CallApiService.post_enc(userData, this.approveRejectFaceRegister_url);
  }

  private get_ir_appl_by_account_url: string = constants.get_ir_appl_by_account_url;
  get_ir_appl_by_account(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_ir_appl_by_account_url);
  }
  private approve_reject_application_by_id_url: string = constants.approve_reject_application_by_id_url;
  approve_reject_application_by_id(userData: any) {
    return this._CallApiService.post_enc(userData, this.approve_reject_application_by_id_url);
  }
}
