import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private _EncrypterService: EncrypterService,
    private _CallApiService: CallApiService,
  ) { }

  private employer_details_url: string = constants.employer_details_url;
  private add_new_employee_url: string = constants.add_new_employee_url;
  private employeeby_jsid_url: string = constants.employeeby_jsid_url;
  private updateEmployeeStatus_url: string = constants.updateEmployeeStatus_url;
  private verify_emp_mobile_url: string = constants.verify_emp_mobile_url;
  private getTpCandidateDetails_url: string = constants.getTpCandidateDetails_url;
  private updateTpBasicDetails_url: string = constants.updateTpBasicDetails_url;
  private file_upload_url: string = constants.file_upload_url;
  private updateTpKycDetails_url: string = constants.updateTpKycDetails_url;
  private updateTpBankDetails_url: string = constants.updateTpBankDetails_url;
  private getAll_state_url: string = constants.getAll_state_url;
  private getAll_Holiday_state_url: string = constants.getAll_Holiday_state_url;
  private GetMinWageCategoryByState_url: string = constants.GetMinWageCategoryByState_url;
  private CalcTPSalaryStructure_url: string = constants.CalcTPSalaryStructure_url;
  private SaveTpCandidateSalary_url: string = constants.SaveTpCandidateSalary_url;
  private getTpMinMaxPerDayWages_url: string = constants.getTpMinMaxPerDayWages_url;
  private send_sms_url: string = constants.send_sms_url;
  private remove_employee_url: string = constants.remove_employee_url;
  private GetTPSalaryStructure_url: string = constants.GetTPSalaryStructure_url;
  private profilePhotoUpload_url: string = constants.profilePhotoUpload_url;
  private insert_profile_photo_url: string = constants.insert_profile_photo_url;
  private getEmployeeProfile_url: string = constants.getEmployeeProfile_url;
  private checkKYCnum_url: string = constants.checkKYCnum_url;
  private checkUniqueDetails_url: string = constants.checkUniqueDetails_url;
  private updateEmployeeDetails_url: string = constants.updateEmployeeDetails_url;
  private getCustomerEmployeeDetails_url: string = constants.getCustomerEmployeeDetails_url;
  private save_profile_photo_url: string = constants.save_profile_photo_url;
  private getAppointeeDetails_url: string = constants.getAppointeeDetails_url;
  private getCandidatesWhoseSalarySetupIsPending_url: string = constants.getCandidatesWhoseSalarySetupIsPending_url;
  private SetTpCandidateRestructureMode_url: string = constants.SetTpCandidateRestructureMode_url;
  private get_tp_leave_temeplate_url: string = constants.get_tp_leave_temeplate_url;
  private updateEmpDetailsOnCRM_url: string = constants.updateEmpDetailsOnCRM_url;
  private manageEmployeeLeaveTemplate_hub_url: string = constants.manageEmployeeLeaveTemplate_hub_url;
  private calculateCandidateSalary_url: string = constants.calculateCandidateSalary_url;
  private UpdateStatutoryCompliances_url: string = constants.UpdateStatutoryCompliances_url;
  private getSalaryStructure_url: string = constants.getSalaryStructure_url;
  private setupSalary_url: string = constants.setupSalary_url;
  private getEmployerProfile_url: string = constants.getEmployerProfile_url;
  private joinTpAttendanceCandidate_url: string = constants.joinTpAttendanceCandidate_url;
  private updateAttendanceEmployeeDetails_url: string = constants.updateAttendanceEmployeeDetails_url;
  private getEmployeeleave_history_url: string = constants.getEmployeeleave_history_url;
  private bulkEmployeeLeaveTemplate_hub_url: string = constants.bulkEmployeeLeaveTemplate_hub_url;
  private manage_salary_structure_url: string = constants.manage_salary_structure_url;
  private get_mst_business_setup_dynamic_url: string = constants.get_mst_business_setup_dynamic_url;
  private createCustomSalaryStructure_url: string = constants.createCustomSalaryStructure_url;
  private saveCustomSalaryStructure_url: string = constants.saveCustomSalaryStructure_url;
  private get_mst_business_setup_url: string = constants.get_mst_business_setup_url;

  private getLWFRateByStateCode_url: string = constants.getLWFRateByStateCode_url;
  private GetStateProfessionalTax_url: string = constants.GetStateProfessionalTax_url;
  private fetchEmployeesFromAPI_url: string = constants.fetchEmployeesFromAPI_url;
  private getEmployerEmployeeFromApi_url: string = constants.getEmployerEmployeeFromApi_url;
  private updateSyncStatus_url: string = constants.updateSyncStatus_url;
  private updateEmployeeDetailsThroughApiProcess_url: string = constants.updateEmployeeDetailsThroughApiProcess_url;
  private uspccalcgrossfromctc_url: string = constants.uspccalcgrossfromctc_url;
  private uspccalcgrossfromctc_withoutconveyance_url: string = constants.uspccalcgrossfromctc_withoutconveyance_url;
  private getMasterSalaryStructure_url: string = constants.getMasterSalaryStructure_url;
  private SaveBulkPreparedSalary_url: string = constants.SaveBulkPreparedSalary_url;

  getCustomerEmployeeDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.getCustomerEmployeeDetails_url);
  }
  employer_details(Data: any) {
    return this._CallApiService.post_enc(Data, this.employer_details_url);
  }

  add_new_employee(Data: any) {
    return this._CallApiService.post_enc(Data, this.add_new_employee_url);
  }

  getEmployeeDetail_byjsid(Data: any) {
    return this._CallApiService.post_enc(Data, this.employeeby_jsid_url);
  }

  updateEmployeeStatus(Data: any) {
    return this._CallApiService.post_enc(Data, this.updateEmployeeStatus_url);
  }

  verify_emp_mobile(Data: any) {
    return this._CallApiService.post_enc(Data, this.verify_emp_mobile_url);
  }

  getTpCandidateDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.getTpCandidateDetails_url);
  }

  updateTpBasicDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.updateTpBasicDetails_url);
  }

  file_upload(Data: any) {
    return this._CallApiService.post(Data, this.file_upload_url);
  }

  updateTpKycDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.updateTpKycDetails_url);
  }

  updateTpBankDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.updateTpBankDetails_url);
  }

  getAll_state(Data: any) {
    return this._CallApiService.post_enc(Data, this.getAll_state_url);
  }
  getAll_Holiday_state(Data: any) {
    return this._CallApiService.post_enc(Data, this.getAll_Holiday_state_url);
  }

  GetMinWageCategoryByState(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetMinWageCategoryByState_url);
  }

  CalcTPSalaryStructure(Data: any) {
    return this._CallApiService.post_enc(Data, this.CalcTPSalaryStructure_url);
  }

  SaveTpCandidateSalary(Data: any) {
    return this._CallApiService.post_enc(Data, this.SaveTpCandidateSalary_url);
  }

  getTpMinMaxPerDayWages(Data: any) {
    return this._CallApiService.post_enc(Data, this.getTpMinMaxPerDayWages_url);
  }
  send_sms_employee(userData: any) {
    return this._CallApiService.post(userData, this.send_sms_url);
  }
  remove_employee(userData: any) {
    return this._CallApiService.post_enc(userData, this.remove_employee_url);
  }
  GetTPSalaryStructure(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetTPSalaryStructure_url);
  }

  profilePhotoUpload(userData: any) {
    return this._CallApiService.post_enc(userData, this.profilePhotoUpload_url);
  }

  insert_profile_photo(userData: any) {
    return this._CallApiService.post_enc(userData, this.insert_profile_photo_url);
  }
  getEmployeeProfile(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployeeProfile_url);
  }

  checkKYCnum(userData: any) {
    return this._CallApiService.post_enc(userData, this.checkKYCnum_url);
  }
  checkUniqueDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.checkUniqueDetails_url);
  }
  updateEmployeeDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateEmployeeDetails_url);
  }


  getEmployerProfile(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployerProfile_url);
  }
  save_profile_photo(userData: any) {
    return this._CallApiService.post_enc(userData, this.save_profile_photo_url);
  }
  getAppointeeDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.getAppointeeDetails_url);
  }
  // getLWFRateByStateCode(userData: any) {
  //   return this._CallApiService.post_enc(userData, this.getLWFRateByStateCode_url);
  // }
  getCandidatesWhoseSalarySetupIsPending(userData: any) {
    return this._CallApiService.post_enc(userData, this.getCandidatesWhoseSalarySetupIsPending_url);
  }

  SetTpCandidateRestructureMode(userData: any) {
    return this._CallApiService.post_enc(userData, this.SetTpCandidateRestructureMode_url);
  }
  get_tp_leave_temeplate(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_tp_leave_temeplate_url);
  }
  updateEmpDetailsOnCRM(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateEmpDetailsOnCRM_url);
  }
  manageEmployeeLeaveTemplate_hub(userData: any) {
    return this._CallApiService.post_enc(userData, this.manageEmployeeLeaveTemplate_hub_url);
  }
  calculateCandidateSalary(userData: any) {
    return this._CallApiService.post_enc(userData, this.calculateCandidateSalary_url);
  }
  UpdateStatutoryCompliances(userData: any) {
    return this._CallApiService.post_enc(userData, this.UpdateStatutoryCompliances_url);
  }

  getSalaryStructure(userData: any) {
    return this._CallApiService.post_enc(userData, this.getSalaryStructure_url);
  }
  setupSalary(userData: any) {
    return this._CallApiService.post_enc(userData, this.setupSalary_url);
  }
  joinTpAttendanceCandidate(userData: any) {
    return this._CallApiService.post_enc(userData, this.joinTpAttendanceCandidate_url);
  }
  private getGeoFencing_url: string = constants.GetGeoFencing_url;
  getGeoFencing(userData: any) {
    return this._CallApiService.post_enc(userData, this.getGeoFencing_url);
  }

  updateAttendanceEmployeeDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateAttendanceEmployeeDetails_url);
  }
  getEmployeeleave_history(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployeeleave_history_url);
  }
  bulkEmployeeLeaveTemplate_hub(userData: any) {
    return this._CallApiService.post_enc(userData, this.bulkEmployeeLeaveTemplate_hub_url);
  }
  manage_salary_structure(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_salary_structure_url);
  }
  get_mst_business_setup(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_mst_business_setup_url);
  }

  getLWFRateByStateCode(userData: any) {
    return this._CallApiService.post_enc(userData, this.getLWFRateByStateCode_url);
  }
  GetStateProfessionalTax(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetStateProfessionalTax_url);
  }


  get_mst_business_setup_dynamic(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_mst_business_setup_dynamic_url);
  }
  createCustomSalaryStructure(userData: any) {
    return this._CallApiService.post_enc(userData, this.createCustomSalaryStructure_url);
  }
  saveCustomSalaryStructure(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveCustomSalaryStructure_url);
  }

  fetchEmployeesFromAPI(userData: any) {
    return this._CallApiService.post_enc(userData, this.fetchEmployeesFromAPI_url)
  }
  getEmployerEmployeeFromApi(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployerEmployeeFromApi_url)
  }
  updateSyncStatus(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateSyncStatus_url)
  }
  updateEmployeeDetailsThroughApiProcess(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateEmployeeDetailsThroughApiProcess_url)
  }
  uspccalcgrossfromctc(userData: any) {
    return this._CallApiService.post_enc(userData, this.uspccalcgrossfromctc_url)
  }
  uspccalcgrossfromctc_withoutconveyance(userData: any) {
    return this._CallApiService.post_enc(userData, this.uspccalcgrossfromctc_withoutconveyance_url)
  }
  getMasterSalaryStructure(userData: any) {
    return this._CallApiService.post_enc(userData, this.getMasterSalaryStructure_url)
  }
  // manage_tds_structure(userData: any) {
  //   return this._CallApiService.post_enc(userData, this.manage_tds_structure_url);
  // }
  // manage_prof_tax_structure(userData: any) {
  //   return this._CallApiService.post_enc(userData, this.manage_prof_tax_structure_url);
  // }
  // manage_pf_structure(userData: any) {
  //   return this._CallApiService.post_enc(userData, this.manage_pf_structure_url);
  // }
  // manage_esi_structure(userData: any) {
  //   return this._CallApiService.post_enc(userData, this.manage_esi_structure_url);
  // }

  private getMinWageDays_url: string = constants.getMinWageDays_url;
  getMinWageDays(userData: any) {
    return this._CallApiService.post_enc(userData, this.getMinWageDays_url)
  }

  private syncEmployeeDetails_url: string = constants.syncEmployeeDetails_url;

  syncEmployeeDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.syncEmployeeDetails_url);
  }
  private getUpdateData_url: string = constants.getUpdateData_url;

  getUpdateData(userData: any) {
    return this._CallApiService.post_enc(userData, this.getUpdateData_url)
  }
  private getMasterTDS_url: string = constants.getMasterTDS_url;
  getMasterTDS(userData: any) {
    return this._CallApiService.post_enc(userData, this.getMasterTDS_url)
  }
  private saveConsultantSalarySetup_url: string = constants.saveConsultantSalarySetup_url;

  saveConsultantSalarySetup(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveConsultantSalarySetup_url)
  }
  private updateJoinigStatus_url: string = constants.updateJoinigStatus_url;
  updateJoinigStatus(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateJoinigStatus_url)
  }
  private getEmployerOUorGeoFenceDetails_url: string = constants.getEmployerOUorGeoFenceDetails_url;
  getEmployerOUorGeoFenceDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployerOUorGeoFenceDetails_url)
  }
  private updateSalaryDaysOrDailyAllowanceRate_url: string = constants.updateSalaryDaysOrDailyAllowanceRate_url;

  updateSalaryDaysOrDailyAllowanceRate(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateSalaryDaysOrDailyAllowanceRate_url)
  }
  private get_unitSalaryStructure_data_url: string = constants.get_unitSalaryStructure_data_url;

  get_unitSalaryStructure_data(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_unitSalaryStructure_data_url)
  }
  // added on 20.08.2024 by harsh 
  private get_employees_count_details_url: string = constants.get_employees_count_details_url;
  get_employees_count_details(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_employees_count_details_url)
  }
  private calculateCandidateSalaryForExcel_url: string = constants.calculateCandidateSalaryForExcel_url;
  calculateCandidateSalaryForExcel(userData: any) {
    return this._CallApiService.post_enc(userData, this.calculateCandidateSalaryForExcel_url)
  }

  // karan add two api 11 dec 2024
  private checkUniqueForActiveEmp_url: string = constants.checkUniqueForActiveEmp_url;
  private updateActiveEmployeeDetails_url: string = constants.updateActiveEmployeeDetails_url;
  checkUniqueForActiveEmp(userData: any) {
    return this._CallApiService.post_enc(userData, this.checkUniqueForActiveEmp_url)
  }

  updateActiveEmployeeDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateActiveEmployeeDetails_url);
  }
  // added by harsh dated. 25.02.2025
  private manage_dashboard_notifications_data_url = constants.manage_dashboard_notifications_data_url;
  private get_dashboard_notifications_data_url = constants.get_dashboard_notifications_data_url;
  private uploadBirthdayImg_url = constants.uploadBirthdayImg_url;

  manage_dashboard_notifications_data(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_dashboard_notifications_data_url);
  }
  get_dashboard_notifications_data(Data: any) {
    return this._CallApiService.post_enc(Data, this.get_dashboard_notifications_data_url);
  }
  uploadBirthdayImg(Data: any) {
    return this._CallApiService.post(Data, this.uploadBirthdayImg_url);
  }

  SaveBulkPreparedSalary(data: any) {
    return this._CallApiService.post_enc(data, this.SaveBulkPreparedSalary_url);
  }
  private get_emp_dpt_count_url: string = constants.get_emp_dpt_count_url;
  get_emp_dpt_count(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_emp_dpt_count_url)
  }
  // end 
  private uploadPanForm16_url: string = constants.uploadPanForm16_url;
  uploadPanForm16(userData: any) {
    return this._CallApiService.post_enc(userData, this.uploadPanForm16_url)
  }

  // add by ak 19062025
  private updateTDSExemption_url: string = constants.updateTDSExemption_url;

  updateTDSExemption(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateTDSExemption_url)
  }
}
