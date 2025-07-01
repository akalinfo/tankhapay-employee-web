import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(
    private _CallApiService: CallApiService
  ) { }

  private get_calendar_url: string = constants.get_calendar_url;
  private get_employer_today_attendance_url: string = constants.get_employer_today_attendance_url;
  private get_monthly_attendance_url: string = constants.get_monthly_attendance_url;
  private save_monthly_attendance_url: string = constants.save_monthly_attendance_url;
  private get_month_dates_days_url: string = constants.get_month_dates_days_url;
  private CheckAdvanceForAssociate_url: string = constants.CheckAdvanceForAssociate_url;
  private SaveTpVoucher_url: string = constants.SaveTpVoucher_url;
  private getEmployerMonthAttendance_url: string = constants.getEmployerMonthAttendance_url;
  private save_excel_bulk_att_url: string = constants.save_excel_bulk_att_url;
  private att_file_upload_url: string = constants.att_file_upload_url;
  private get_att_import_header_url: string = constants.get_att_import_header_url;
  private getOpeningLeaveBalance_url: string = constants.getOpeningLeaveBalance_url;
  private getGenerateOpeningBalance_url: string = constants.getGenerateOpeningBalance_url;
  private getUpdateLeaveBalance_url: string = constants.getUpdateLeaveBalance_url;
  private TpCheckInOut_url: string = constants.TpCheckInOut_url;
  private bulk_deduction_upload_url: string = constants.bulk_deduction_upload_url;
  private get_missed_punch_att_url: string = constants.get_missed_punch_att_url;
  private manage_missed_punch_att_url: string = constants.manage_missed_punch_att_url;
  private getEmployerMonthAttendance_for_excel_url: string = constants.getEmployerMonthAttendance_for_excel_url;
  private get_att_master_list_url: string = constants.get_att_master_list_url;
  private getUnitTodayAttendance_url: string = constants.getUnitTodayAttendance_url;
  private getUnitConsolidatedAttendance_url: string = constants.getUnitConsolidatedAttendance_url;
  private saveUnitConsolidatedAttendance_url: string = constants.saveUnitConsolidatedAttendance_url;
  private deleteSingleConsolidatedAttendance_url: string = constants.deleteSingleConsolidatedAttendance_url;
  private saveUpdateOtrule_url: string = constants.saveUpdateOtrule_url;
  private get_today_attendence_reports_url: string = constants.get_today_attendence_reports_url;
  private saveEditOtRules_url: string = constants.saveEditOtRules_url;
  private tea_allowance_rate_url: string = constants.tea_allowance_rate_url;

  private getMaster_Dropdown_url: string = constants.getMaster_Dropdown_url;
  private updateManualTDS_url: string = constants.updateManualTDS_url;

  private fetchAttendancefromClient_url: string = constants.fetchAttendancefromClient_url;
  private saveAttendancefromClient_url: string = constants.saveAttendancefromClient_url;


  private getManualSalaryInfo_url: string = constants.getManualSalaryInfo_url;
  private saveManualSalaryInfo_url: string = constants.saveManualSalaryInfo_url;
  private rejectManualSalary_url: string = constants.rejectManualSalary_url;

  private fetchArearByMonthYearEmpCode_url: string = constants.fetchArearByMonthYearEmpCode_url;
  private getEmployeesForLedger_url: string = constants.getEmployeesForLedger_url;
  private bulkLedgerEntry_url: string = constants.bulkLedgerEntry_url;
  private viewArrearDetails_url: string = constants.viewArrearDetails_url;
  private verifyArrear_url: string = constants.verifyArrear_url;

  private getCandidateDetails_url: string = constants.getCandidateDetails_url;
  private manageDeviationSalaryDetails_url: string = constants.manageDeviationSalaryDetails_url;

  private manage_payout_ticketing_workflow_url: string = constants.manage_payout_ticketing_workflow_url;
  private createSupportRequest_url: string = constants.createSupportRequest_url;
  private getTicketMaster_url: string = constants.getTicketMaster_url;
  private createTicket_url: string = constants.createTicket_url;
  private lockUnlockAdvice_url: string = constants.lockUnlockAdvice_url;
  private readTicketInternalDepartment_url: string = constants.readTicketInternalDepartment_url;

  private saveBulkManualSalaryInfo_url: string = constants.saveBulkManualSalaryInfo_url;
  private saveBulkDeviationSalaryDetails_url: string = constants.saveBulkDeviationSalaryDetails_url;
  private attendance_reProcessEmployeeAttendance_url: string = constants.attendance_reProcessEmployeeAttendance_url;

  private manageAdvices_url: string = constants.manageAdvices_url;
  private manageBulkAdvices_url: string = constants.manageBulkAdvices_url;

  get_calendar(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_calendar_url);
  }
  get_employer_today_attendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_employer_today_attendance_url);
  }
  get_monthly_attendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_monthly_attendance_url);
  }
  save_monthly_attendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.save_monthly_attendance_url);
  }
  get_month_dates_days(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_month_dates_days_url);
  }
  checkAdvanceForAssociate(userData: any) {
    return this._CallApiService.post_enc(userData, this.CheckAdvanceForAssociate_url);
  }
  saveTpVoucher(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveTpVoucher_url);
  }
  getEmployerMonthAttendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployerMonthAttendance_url);
  }
  save_excel_bulk_att(userData: any) {
    return this._CallApiService.post_enc(userData, this.save_excel_bulk_att_url);
  }
  att_file_upload(userData: any) {
    return this._CallApiService.post(userData, this.att_file_upload_url);
  }
  get_att_import_header(userData: any) {
    return this._CallApiService.post(userData, this.get_att_import_header_url);
  }
  getOpeningLeaveBalance(userData: any) {
    return this._CallApiService.post_enc(userData, this.getOpeningLeaveBalance_url);
  }
  getGenerateOpeningBalance(userData: any) {
    return this._CallApiService.post_enc(userData, this.getGenerateOpeningBalance_url);
  }
  getUpdateLeaveBalance(userData: any) {
    return this._CallApiService.post_enc(userData, this.getUpdateLeaveBalance_url);
  }
  TpCheckInOut(userData: any) {
    return this._CallApiService.post_enc(userData, this.TpCheckInOut_url);
  }
  bulk_deduction_upload(userData: any) {
    return this._CallApiService.post_enc(userData, this.bulk_deduction_upload_url);
  }
  get_missed_punch_att(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_missed_punch_att_url);
  }
  manage_missed_punch_att(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_missed_punch_att_url);
  }
  getEmployerMonthAttendance_for_excel(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployerMonthAttendance_for_excel_url);
  }
  get_att_master_list(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_att_master_list_url);
  }
  getUnitTodayAttendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.getUnitTodayAttendance_url);
  }
  getUnitConsolidatedAttendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.getUnitConsolidatedAttendance_url);
  }
  saveUnitConsolidatedAttendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveUnitConsolidatedAttendance_url);
  }
  deleteSingleConsolidatedAttendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.deleteSingleConsolidatedAttendance_url);
  }
  saveUpdateOtrule(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveUpdateOtrule_url);
  }
  get_today_attendence_reports(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_today_attendence_reports_url);
  }
  tea_allowance_rate(userData: any) {
    return this._CallApiService.post_enc(userData, this.tea_allowance_rate_url);
  }
  saveEditOtRules(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveEditOtRules_url);
  }
  getMaster(userData: any) {
    return this._CallApiService.post_enc(userData, this.getMaster_Dropdown_url);
  }
  updateManualTDS(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateManualTDS_url);
  }

  fetchAttendancefromClient(userData: any) {
    return this._CallApiService.post_enc(userData, this.fetchAttendancefromClient_url);
  }
  saveAttendancefromClient(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveAttendancefromClient_url);
  }

  getManualSalaryInfo(userData: any) {
    return this._CallApiService.post_enc(userData, this.getManualSalaryInfo_url);
  }
  saveManualSalaryInfo(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveManualSalaryInfo_url);
  }
  rejectManualSalary(userData: any) {
    return this._CallApiService.post_enc(userData, this.rejectManualSalary_url);
  }


  fetchArearByMonthYearEmpCode(userData: any) {
    return this._CallApiService.post_enc(userData, this.fetchArearByMonthYearEmpCode_url);
  }
  getEmployeesForLedger(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployeesForLedger_url);
  }
  bulkLedgerEntry(userData: any) {
    return this._CallApiService.post_enc(userData, this.bulkLedgerEntry_url);
  }
  viewArrearDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.viewArrearDetails_url);
  }
  verifyArrear(userData: any) {
    return this._CallApiService.post_enc(userData, this.verifyArrear_url);
  }
  getCandidateDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.getCandidateDetails_url);
  }
  manageDeviationSalaryDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.manageDeviationSalaryDetails_url);
  }
  manage_payout_ticketing_workflow(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_payout_ticketing_workflow_url);
  }
  createSupportRequest(userData: any) {
    return this._CallApiService.post_enc(userData, this.createSupportRequest_url);
  }
  getTicketMaster(userData: any) {
    return this._CallApiService.post_enc(userData, this.getTicketMaster_url);
  }
  createTicket(userData: any) {
    return this._CallApiService.post_enc(userData, this.createTicket_url);
  }
  lockedUnlockedAttednace(userData: any) {
    return this._CallApiService.post_enc(userData, this.lockUnlockAdvice_url);
  }
  readTicketInternalDepartment(userData: any) {
    return this._CallApiService.post_enc(userData, this.readTicketInternalDepartment_url);
  }
  // get_employee_list_for_generate_leave(userData:any) {
  //   return this._CallApiService.post_enc(userData, this.get_employee_list_for_generate_leave_url);
  // }
  saveBulkManualSalaryInfo(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveBulkManualSalaryInfo_url);
  }
  saveBulkDeviationSalaryDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveBulkDeviationSalaryDetails_url);
  }

  private get_employee_list_for_generate_leave_url: string = constants.get_employee_list_for_generate_leave_url;
  private updateBulkLeaveBalance_url: string = constants.updateBulkLeaveBalance_url;
  private generateBulkOpeningBalance_url: string = constants.generateBulkOpeningBalance_url;

  get_employee_list_for_generate_leave(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_employee_list_for_generate_leave_url);
  }
  updateBulkLeaveBalance(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateBulkLeaveBalance_url);
  }
  generateBulkOpeningBalance(userData: any) {
    return this._CallApiService.post_enc(userData, this.generateBulkOpeningBalance_url);
  }
  attendanceProcessEmployeeAttendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.attendance_reProcessEmployeeAttendance_url);
  }

  private getemployeelistFace_url: string = constants.getemployeelistFace_url;
  getShowHideSalarytab(userData: any) {
    return this._CallApiService.post_enc(userData, this.getemployeelistFace_url);
  }

  manageAdvices(userData: any) {
    return this._CallApiService.post_enc(userData, this.manageAdvices_url);
  }
  manageBulkAdvices(userData: any) {
    return this._CallApiService.post_enc(userData, this.manageBulkAdvices_url);
  }
  private get_timesheet_data_url: string = constants.get_timesheet_data_url;
  private manage_timesheet_data_url: string = constants.manage_timesheet_data_url;
  get_timesheet_data(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_timesheet_data_url);
  }
  manage_timesheet_data(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_timesheet_data_url);
  }
  // attendance
  private save_excel_bulk_att_new_url: string = constants.save_excel_bulk_att_new_url;
  save_excel_bulk_att_new(userData: any) {
    return this._CallApiService.post_enc(userData, this.save_excel_bulk_att_new_url);
  }

  private GetTpFlexiSalary_url: string = constants.GetTpFlexiSalary_url;
  private CalcTpFlexiSalary_url: string = constants.CalcTpFlexiSalary_url;
  private SaveTpFlexiSalary_url: string = constants.SaveTpFlexiSalary_url;

  GetTpFlexiSalary(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetTpFlexiSalary_url);
  }

  CalcTpFlexiSalary(userData: any) {
    return this._CallApiService.post_enc(userData, this.CalcTpFlexiSalary_url);
  }

  SaveTpFlexiSalary(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveTpFlexiSalary_url);
  }
  private getEmployerTodayRequiredAttendance_url: string = constants.getEmployerTodayRequiredAttendance_url;
  getEmployerTodayRequiredAttendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployerTodayRequiredAttendance_url);
  }

  
  private get_approved_days_url: string = constants.get_approved_days_url;
  get_approved_days(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_approved_days_url);
  }
  private generate_payment_advice_url: string = constants.generate_payment_advice_url;
  generate_payment_advice(userData: any) {
    return this._CallApiService.post_enc(userData, this.generate_payment_advice_url);
  }

  private create_bulk_advice_url: string = constants.create_bulk_advice_url;
  create_bulk_advice(userData: any) {
    return this._CallApiService.post_enc(userData, this.create_bulk_advice_url);
  }

}
