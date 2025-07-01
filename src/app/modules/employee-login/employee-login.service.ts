import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constant from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class EmployeeLoginService {

  constructor(private CallApiService : CallApiService) { }

  private getAllReimbursementClaims_url : string = constant.getAllReimbursementClaims_url;
  private addEditReimbursementClaim_url : string = constant.addEditReimbursementClaim_url;
  private deleteReimbursementClaim_url : string = constant.deleteReimbursementClaim_url;
  private get_Leave_appl_filter_url : string = constant.get_Leave_appl_filter_url;
  private remove_applied_leave_url : string = constant.remove_applied_leave_url;
  private apply_leave_appl_url : string = constant.apply_leave_appl_url;
  private getTravelSummary_url : string = constant.getTravelSummary_url;
  private saveTravelDetails_url : string = constant.saveTravelDetails_url;
  private getTravelMaster_url : string = constant.getTravelMaster_url;
  private getTravelExpenseDetails_url : string = constant.getTravelExpenseDetails_url;
  private updateTravelExpenseDetails_url : string = constant.updateTravelExpenseDetails_url;
  private approveTravelRequest_url : string = constant.approveTravelRequest_url;
  private approveRejectTravelExpense_url : string = constant.approveRejectTravelExpense_url;
  private approveRejectMissedPunch_url : string = constant.approveRejectMissedPunch_url;
  private getCalenderRecordsByEmployee_url : string = constant.getCalenderRecordsByEmployee_url;
  private get_faq_category_url : string = constant.get_faq_category_url;
  private getEmployeeSupportTicket_url : string = constant.getEmployeeSupportTicket_url;

  // approve/reject
  // private approveTravelRequest_url : string = constant.approveTravelRequest_url;
  // private approveRejectTravelExpense_url : string = constant.approveRejectTravelExpense_url;
  // private approveRejectMissedPunch_url : string = constant.approveRejectMissedPunch_url;
  private approveRejectOnDuty_url : string = constant.approveRejectOnDuty_url;
  private approveRejectCompOffRequest_url : string = constant.approveRejectCompOffRequest_url;
  private approveRejectWFHRequest_url : string = constant.approveRejectWFHRequest_url;
  private approveRejectImprestRequest_url : string = constant.approveRejectImprestRequest_url;
  // end

  getAllReimbursementClaims(userData:any){
    return this.CallApiService.post_enc(userData, this.getAllReimbursementClaims_url);
  }

  addEditReimbursementClaim(userData:any){
    return this.CallApiService.post_enc(userData, this.addEditReimbursementClaim_url);
  }

  deleteReimbursementClaim(userData:any){
    return this.CallApiService.post_enc(userData, this.deleteReimbursementClaim_url);
  }

  get_Leave_appl_filter(userData:any){
    return this.CallApiService.post_enc(userData, this.get_Leave_appl_filter_url);
  }

  getEmployeeSupportTicket(userData:any){
    return this.CallApiService.post_enc(userData, this.getEmployeeSupportTicket_url);
  }

  private getEmployeeQueryTrail_url : string = constant.getEmployeeQueryTrail_url;
  getEmployeeQueryTrail(userData:any){
    return this.CallApiService.post_enc(userData, this.getEmployeeQueryTrail_url);
  }

  private getTicketCategory_url : string = constant.getTicketCategory_url;
  getTicketCategory(userData:any){
    return this.CallApiService.post_enc(userData, this.getTicketCategory_url);
  }
  private saveTicketDetail_url : string = constant.saveTicketDetail_url;
  saveTicketDetail(userData:any){
    return this.CallApiService.post_enc(userData, this.saveTicketDetail_url);
  }
  private saveQueryTrail_url : string = constant.saveQueryTrail_url;
  saveQueryTrail(userData:any){
    return this.CallApiService.post_enc(userData, this.saveQueryTrail_url);
  }

  remove_applied_leave(userData:any){
    return this.CallApiService.post_enc(userData, this.remove_applied_leave_url);
  }
  apply_leave_appl(userData:any){
    return this.CallApiService.post_enc(userData, this.apply_leave_appl_url);
  }
  getTravelSummary(userData:any){
    return this.CallApiService.post_enc(userData, this.getTravelSummary_url);
  }
  saveTravelDetails(userData:any){
    return this.CallApiService.post_enc(userData, this.saveTravelDetails_url);
  }
  getTravelMaster(userData:any){
    return this.CallApiService.post_enc(userData, this.getTravelMaster_url);
  }
  getTravelExpenseDetails(userData:any){
    return this.CallApiService.post_enc(userData, this.getTravelExpenseDetails_url);
  }
  updateTravelExpenseDetails(userData:any){
    return this.CallApiService.post_enc(userData, this.updateTravelExpenseDetails_url);
  }

  private getAllState_url : string = constant.getAllState_url;
  getAllState(userData:any){
    return this.CallApiService.post_enc(userData, this.getAllState_url);
  }

  private esicRelationship_url : string = constant.esicRelationship_url;
  esicRelationship(userData:any){
    return this.CallApiService.post_enc(userData, this.esicRelationship_url);
  }

  private getStateEsiDispensary_url : string = constant.getStateEsiDispensary_url;
  getStateEsiDispensary(userData:any){
    return this.CallApiService.post_enc(userData, this.getStateEsiDispensary_url);
  }
  private saveOrUpdateDependent_url : string = constant.saveOrUpdateDependent_url;
  saveOrUpdateDependent(userData:any){
    return this.CallApiService.post_enc(userData, this.saveOrUpdateDependent_url);
  }
  private getDependentLists_url : string = constant.getDependentLists_url;
  getDependentLists(userData:any){
    return this.CallApiService.post_enc(userData, this.getDependentLists_url);
  }

  approveTravelRequest(userData:any){
    return this.CallApiService.post_enc(userData, this.approveTravelRequest_url);
  }

  approveRejectTravelExpense(userData:any){
    return this.CallApiService.post_enc(userData, this.approveRejectTravelExpense_url);
  }

  // sidharth kaul dated. 30.04.2025
  approveRejectMissedPunch(userData:any){
    return this.CallApiService.post_enc(userData, this.approveRejectMissedPunch_url);
  }

  approveRejectOnDuty(userData:any){
    return this.CallApiService.post_enc(userData, this.approveRejectOnDuty_url);
  }

  approveRejectCompOffRequest(userData:any){
    return this.CallApiService.post_enc(userData, this.approveRejectCompOffRequest_url);
  }

  approveRejectWFHRequest(userData:any){
    return this.CallApiService.post_enc(userData, this.approveRejectWFHRequest_url);
  }

  // End

  getCalenderRecordsByEmployee(userData:any){
    return this.CallApiService.post_enc(userData, this.getCalenderRecordsByEmployee_url);
  }

  private previewTrainingExamAnswer_url : string = constant.previewTrainingExamAnswer_url;
  private previewFeedbackAnswer_url : string = constant.previewFeedbackAnswer_url;

  previewTrainingExamAnswer(userData:any){
    return this.CallApiService.post_enc(userData, this.previewTrainingExamAnswer_url);
  }
  previewFeedbackAnswer(userData:any){
    return this.CallApiService.post_enc(userData, this.previewFeedbackAnswer_url);
  }
  private employeeTrainingMarkAttendance_url : string = constant.employeeTrainingMarkAttendance_url;
  employeeTrainingMarkAttendance(userData:any){
    return this.CallApiService.post_enc(userData, this.employeeTrainingMarkAttendance_url);
  }
  get_faq_category(userData:any){
    return this.CallApiService.post_enc(userData, this.get_faq_category_url);
  }
  private hrPolicyList_url: string =constant.hrPolicyList_url;

  hrPolicyList(userData:any){
    return this.CallApiService.post_enc(userData,this.hrPolicyList_url);
  }

  private manageCompOffRequest_url: string =constant.manageCompOffRequest_url;
  private manageWFHRequest_url: string = constant.manageWFHRequest_url;
  private uploadCompOffDocument_url: string =constant.uploadCompOffDocument_url;
  private uploadWFHDocument_url: string =constant.uploadWFHDocument_url;
  private getCompOffRequest_url: string =constant.getCompOffRequest_url;
  private getCategoryListData_url: string = constant.getCategoryListData_url;
  private getImprestRequest_url: string = constant.getImprestRequest_url;
  private createImprestRequest_url: string = constant.createImprestRequest_url;

  manageCompOffRequest(userData:any){
    return this.CallApiService.post_enc(userData,this.manageCompOffRequest_url);
  }

  manageWFHRequest(userData:any){
    return this.CallApiService.post_enc(userData,this.manageWFHRequest_url);
  }

  uploadCompOffDocument(userData:any){
    return this.CallApiService.post_enc(userData,this.uploadCompOffDocument_url);
  }

  uploadWFHDocument(userData:any){
    return this.CallApiService.post_enc(userData,this.uploadWFHDocument_url);
  }

  getCompOffRequest(userData:any){
    return this.CallApiService.post_enc(userData,this.getCompOffRequest_url);
  }

  // Imprest Request sidharth kaul dated. 23.05.2025

  getCategoryListData(userData:any){
    return this.CallApiService.post_enc(userData,this.getCategoryListData_url);
  }

  getImprestRequest(userData:any){
    return this.CallApiService.post_enc(userData,this.getImprestRequest_url);
  }

  createImprestRequest(userData:any){
    return this.CallApiService.post_enc(userData,this.createImprestRequest_url);
  }

  approveRejectImprestRequest(userData:any){
    return this.CallApiService.post_enc(userData, this.approveRejectImprestRequest_url);
  }

  // end
  // Rekha dated. 20.06.2025

   private exit_form_url:string=constant.exit_form_url;
  private exit_form_save_url:string=constant.exit_form_save_url;
  private clearance_form_save_url:string=constant.clearance_form_save_url;
  getExitFormDetails(userData:any){
    return this.CallApiService.post_enc(userData, this.exit_form_url);
  }
   saveExitFormDetail(userData:any){
    return this.CallApiService.post_enc(userData, this.exit_form_save_url);
  }
   saveCleranceForm(userData:any){
    return this.CallApiService.post_enc(userData, this.clearance_form_save_url);
  }
  // end
}
