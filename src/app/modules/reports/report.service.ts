import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private _EncrypterService: EncrypterService,
    private _CallApiService: CallApiService,
  ) { }
  private SalaryVerificationViewApi_url: string = constants.SalaryVerificationViewApi_url;
  private LiabilityReportApi_url: string = constants.LiabilityReportApi_url;
  private deleteLiabilityReport_url: string = constants.deleteLiabilityReport_url;
  private FetchBankReportApi_url: string = constants.FetchBankReportApi_url;
  private DisplayesicecrreportMonthWiseApi_url: string = constants.DisplayesicecrreportMonthWiseApi_url;
  private DisplayepfecrreportMonthWiseApi_url: string = constants.DisplayepfecrreportMonthWiseApi_url;
  private DisplaylwfecrreportMonthWiseApi_url: string = constants.DisplaylwfecrreportMonthWiseApi_url;
  private InvestmentReportResultApi_url: string = constants.InvestmentReportResultApi_url;
  private DisbursmentReportApi_url: string = constants.DisbursmentReportApi_url;
  private PrepayoutReportApi_url: string = constants.PrepayoutReportApi_url;
  private GetInvestmentsProofDetails_url: string = constants.GetInvestmentsProofDetails_url;
  private EmployeesPaySummary_url: string = constants.EmployeesPaySummary_url;
  private SalarySlip_url: string = constants.SalarySlip_url;
  private getEmployerProfile_url: string = constants.getEmployerProfile_url;
  private get_Leave_appl_by_account_empid_url: string = constants.get_Leave_appl_by_account_empid_url;
  private SaveJivoDsrDaData_url: string = constants.SaveJivoDsrDaData_url;
  private getJivoDSRDA_data_url: string = constants.getJivoDSRDA_data_url;
  private visitor_card_details_url: string = constants.visitor_card_details_url;
  private manage_biometric_att_url: string = constants.manage_biometric_att_url;
  private GetReportFields_url: string = constants.GetReportFields_url;

  private daywisecheckcheckinReport_url: string = constants.daywisecheckcheckinReport_url;

  GetReportFields(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetReportFields_url);
  }
  visitor_card_details(userData: any) {
    return this._CallApiService.post_enc(userData, this.visitor_card_details_url);
  }

  private visitor_summary_url: string = constants.visitor_summary_url;
  visitor_summary(userData: any) {
    return this._CallApiService.post_enc(userData, this.visitor_summary_url);
  }
  getEmployerProfile(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployerProfile_url);
  }
  SalaryVerificationViewApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.SalaryVerificationViewApi_url);
  }

  LiabilityReportApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.LiabilityReportApi_url);
  }

  deleteLiabilityReportApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.deleteLiabilityReport_url);
  }

  FetchBankReportApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.FetchBankReportApi_url);
  }

  DisplayesicecrreportMonthWiseApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.DisplayesicecrreportMonthWiseApi_url);
  }

  DisplayepfecrreportMonthWiseApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.DisplayepfecrreportMonthWiseApi_url);
  }

  DisplaylwfecrreportMonthWiseApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.DisplaylwfecrreportMonthWiseApi_url);
  }

  InvestmentReportResultApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.InvestmentReportResultApi_url);
  }

  DisbursmentReportApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.DisbursmentReportApi_url);
  }
  PrepayoutReportApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.PrepayoutReportApi_url);
  }
  GetInvestmentsProofDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetInvestmentsProofDetails_url);
  }

  EmployeesPaySummary(Data: any) {
    return this._CallApiService.post_enc(Data, this.EmployeesPaySummary_url);
  }

  SalarySlip(Data: any) {
    return this._CallApiService.post_enc(Data, this.SalarySlip_url);
  }
  private VerifyInvestmentProofDetails_url: string = constants.VerifyInvestmentProofDetails_url;
  VerifyInvestmentProofDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.VerifyInvestmentProofDetails_url);
  }
  private GetTaxProjectionApi_url: string = constants.GetTaxProjectionApi_url;
  GetTaxProjectionApi(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetTaxProjectionApi_url);
  }
  private GetTpCheckInOutSummary_url: string = constants.GetTpCheckInOutSummary_url;

  GetTpCheckInOutSummary(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetTpCheckInOutSummary_url);
  }
  private GetDetailedLiabilityReportByEmpCode_url: string = constants.GetDetailedLiabilityReportByEmpCode_url;

  GetDetailedLiabilityReportByEmpCode(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetDetailedLiabilityReportByEmpCode_url);
  }
  private getPunchingAttendance_url: string = constants.getPunchingAttendance_url;
  private process_att_punches_hub_url: string = constants.process_att_punches_hub_url;
  private get_Last_sync_stataus_url: string = constants.get_Last_sync_stataus_url;
  private get_business_device_url: string = constants.get_business_device_url;
  private akal_syncattpunch_url: string = constants.akal_syncattpunch_url;

  get_business_device(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_business_device_url);
  }

  akal_syncattpunch(userData: any) {
    return this._CallApiService.post_enc(userData, this.akal_syncattpunch_url);
  }


  getPunchingAttendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.getPunchingAttendance_url);
  }
  process_att_punches_hub(userData: any) {
    return this._CallApiService.post_enc(userData, this.process_att_punches_hub_url);
  }

  get_Last_sync_stataus_hub(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_Last_sync_stataus_url);
  }

  // added on 25.01.2024 arpit
  private GetInvestmentDeclarationDateForEmployee_url: string = constants.GetInvestmentDeclarationDateForEmployee_url;
  private SaveInvestmentDeclarationDateForIndividualEmp_url: string = constants.SaveInvestmentDeclarationDateForIndividualEmp_url;
  private GetInvestmentDeclarationDate_url: string = constants.GetInvestmentDeclarationDate_url;
  private SaveInvestmentDeclarationDate_url: string = constants.SaveInvestmentDeclarationDate_url;


  private getAnnualReport_url: string = constants.getAnnualReport_url;
  private manage_audit_report_wfm_url: string = constants.manage_audit_report_wfm_url;

  GetInvestmentDeclarationDateForEmployee(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetInvestmentDeclarationDateForEmployee_url);
  }
  SaveInvestmentDeclarationDateForIndividualEmp(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveInvestmentDeclarationDateForIndividualEmp_url);
  }
  GetInvestmentDeclarationDate(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetInvestmentDeclarationDate_url);
  }
  SaveInvestmentDeclarationDate(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveInvestmentDeclarationDate_url);
  }
  // end
  private DownloadCompilanceReport_url: string = constants.DownloadCompilanceReport_url;
  DownloadCompilanceReport(userData: any) {
    return this._CallApiService.post_enc(userData, this.DownloadCompilanceReport_url);
  }

  private get_employee_leave_balance_url: string = constants.get_employee_leave_balance_url;
  private get_leave_types_by_account_url: string = constants.get_leave_types_by_account_url;
  private get_leave_taken_history_url: string = constants.get_leave_taken_history_url;

  get_employee_leave_balance(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_employee_leave_balance_url);
  }
  get_leave_types_by_account(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_leave_types_by_account_url);
  }
  get_Leave_appl_by_account_empid(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_Leave_appl_by_account_empid_url);
  }
  SaveJivoDsrDaData(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveJivoDsrDaData_url);
  }
  getJivoDSRDA_data(userData: any) {
    return this._CallApiService.post_enc(userData, this.getJivoDSRDA_data_url);
  }
  private complianceFlagReportForBusiness_url: string = constants.complianceFlagReportForBusiness_url;
  complianceFlagReportForBusiness(userData: any) {
    return this._CallApiService.post_enc(userData, this.complianceFlagReportForBusiness_url);
  }
  private SubmitUanForBusiness_url: string = constants.SubmitUanForBusiness_url;

  SubmitUanForBusiness(userData: any) {
    return this._CallApiService.post_enc(userData, this.SubmitUanForBusiness_url);
  }

  private SubmitEsicForBusiness_url: string = constants.SubmitEsicForBusiness;

  SubmitEsicForBusiness(userData: any) {
    return this._CallApiService.post_enc(userData, this.SubmitEsicForBusiness_url);
  }
  manage_biometric_att(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_biometric_att_url);
  }
  private SaveDearnessAllowanceData_url: string = constants.SaveDearnessAllowanceData_url;
  SaveDearnessAllowanceData(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveDearnessAllowanceData_url);
  }
  private GetLoanReport_url: string = constants.GetLoanReport_url;
  GetLoanReport(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetLoanReport_url);
  }
  get_leave_taken_history(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_leave_taken_history_url);
  }
  private GetMaster_Dropdown_url: string = constants.getMaster_Dropdown_url;
  
  GetMaster_Dropdown(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetMaster_Dropdown_url);
  }

  private GetDashboardSettingData_url: string = constants.GetDashboardSettingData_url;
  
  GetDashboardSettingData(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetDashboardSettingData_url);
  }
  private get_asset_report_url: string = constants.get_asset_report_url;
  get_asset_report(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_asset_report_url);
  }
  private getSalarySlip_url: string = constants.getSalarySlip_url;
  getSalarySlip(userData: any) {
    return this._CallApiService.post_enc(userData, this.getSalarySlip_url);
  }
  private incrementReportBusiness_url: string = constants.incrementReportBusiness_url;

  incrementReportBusiness(userData: any) {
    return this._CallApiService.post_enc(userData, this.incrementReportBusiness_url);
  }

  private sendSalaryPdf_url: string = constants.sendSalaryPdf_url;
  sendSalaryPdf(userData: any) {
    return this._CallApiService.post_enc(userData, this.sendSalaryPdf_url);
  }
  daywisecheckcheckinReport(userData: any) {
    return this._CallApiService.post_enc(userData, this.daywisecheckcheckinReport_url);
  }
  private approveRejectMissedPunchAttendance_url: string = constants.approveRejectMissedPunchAttendance_url;
  approveRejectMissedPunchAttendance(userData: any) {
    return this._CallApiService.post_enc(userData, this.approveRejectMissedPunchAttendance_url);
  }
  private CalculateDeviationFines_url: string = constants.CalculateDeviationFines_url;
  CalculateDeviationFines(userData: any) {
    return this._CallApiService.post_enc(userData, this.CalculateDeviationFines_url);
  }
  private UpdateDeviationFines_url: string = constants.UpdateDeviationFines_url;
  UpdateDeviationFines(userData: any) {
    return this._CallApiService.post_enc(userData, this.UpdateDeviationFines_url);
  }
  private generatePdfByCode_url: string = constants.generatePdfByCode_url;
  generatePdfByCode(userData: any) {
    return this._CallApiService.post_enc(userData, this.generatePdfByCode_url);
  }

  private manage_report_columns_wfm_url: string = constants.manage_report_columns_wfm_url;
  manage_report_columns_wfm(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_report_columns_wfm_url);
  }

  private getAc21Report_url: string = constants.getAc21Report_url;
  getAc21Report(userData: any) {
    return this._CallApiService.post_enc(userData, this.getAc21Report_url);
  }

  getAnnualReport(Data: any) {
    return this._CallApiService.post_enc(Data, this.getAnnualReport_url);
  }
  manage_audit_report_wfm(Data: any) {
    return this._CallApiService.post_enc(Data, this.manage_audit_report_wfm_url);
  }
  private update_weekly_off_holiday_by_account_url: string = constants.update_weekly_off_holiday_by_account_url;
  update_weekly_off_holiday_by_account(userData: any) {
    return this._CallApiService.post_enc(userData, this.update_weekly_off_holiday_by_account_url);
  }

  private get_employee_leave_balance_el_url: string = constants.get_employee_leave_balance_el_url;

  get_employee_leave_balance_el(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_employee_leave_balance_el_url);
  }

  private getDeclarationSubmittedReport_url: string = constants.getDeclarationSubmittedReport_url;
  getDeclarationSubmittedReport(userData: any) {
    return this._CallApiService.post_enc(userData, this.getDeclarationSubmittedReport_url);
  }

  private reprocess_today_checkinout_url: string = constants.reprocess_today_checkinout_url;
  reprocess_today_checkinout(userData: any) {
    return this._CallApiService.post_enc(userData, this.reprocess_today_checkinout_url);
  }

  private kafkaProcessAttPunchesHub_url: string = constants.kafkaProcessAttPunchesHub_url;
  kafkaProcessAttPunchesHub(userData: any) {
    return this._CallApiService.post_enc(userData, this.kafkaProcessAttPunchesHub_url);
  }

   private getTdsReportData_url: string = constants.getTdsReportData_url;
  getTdsReportData(userData: any) {
    return this._CallApiService.post_enc(userData, this.getTdsReportData_url);
  }
  private get_hourly_summary_report_url: string = constants.get_hourly_summary_report_url;
  get_hourly_summary_report(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_hourly_summary_report_url);
  }
  // ak
  private getPdfBtyeCodePortrait_url: string = constants.getPdfBtyeCodePortrait_url;
  getPdfBtyeCodePortrait(userData: any) {
    return this._CallApiService.post_enc(userData, this.getPdfBtyeCodePortrait_url);
  }
}
