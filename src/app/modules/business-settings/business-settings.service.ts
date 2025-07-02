import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class BusinesSettingsService {

  constructor(
    private _CallApiService: CallApiService
  ) { }

  private getEmployerProfile_url: string = constants.getEmployerProfile_url;
  private updateEmployerProfile_url: string = constants.updateEmployerProfile_url;
  private profilePhotoUpload_url: string = constants.profilePhotoUpload_url;

  private get_business_device_url: string = constants.get_business_device_url;
  private update_business_device_by_id_url: string = constants.update_business_device_by_id_url;
  private insert_business_device_url: string = constants.insert_business_device_url;
  private manage_business_device_url: string = constants.manage_business_device_url;
  private manage_holidays_master_url: string = constants.manage_holidays_master_url;

  private DisableStatutoryCompliance_url: string = constants.DisableStatutoryCompliance_url;
  private RefreshMaterializedViewByApi_url: string = constants.RefreshMaterializedViewByApi_url;
  private JusPaymanageCard_url: string = constants.JusPaymanageCard_url;

  // added on 29-12-2023 by akchhaya
  private GetGeoFencing_url: string = constants.GetGeoFencing_url;
  private GetGeoFencingForParticularId_url: string = constants.GetGeoFencingForParticularId_url;
  private SaveGeoFencing_url: string = constants.SaveGeoFencing_url;
  private otp_send_mobile_email_update_url: string = constants.otp_send_mobile_email_update_url;
  private otp_verify_mobile_email_update_url: string = constants.otp_verify_mobile_email_update_url;
  private update_employer_mobile_email_url: string = constants.update_employer_mobile_email_url;
  private update_employer_mobile_email_hub_url: string = constants.update_employer_mobile_email_hub_url;

  private get_alert_type_master_url: string = constants.get_alert_type_master_url;
  private enable_desable_alert_url: string = constants.enable_desable_alert_url;
  private get_alerts_list_url: string = constants.get_alerts_list_url;
  private manage_approval_master_url: string = constants.manage_approval_master_url;
  private insert_update_approval_template_url: string = constants.insert_update_approval_template_url;

  getEmployerProfile(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmployerProfile_url);
  }
  updateEmployerProfile(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateEmployerProfile_url);
  }
  profilePhotoUpload(userData: any) {
    return this._CallApiService.post_enc(userData, this.profilePhotoUpload_url);
  }

  get_business_device(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_business_device_url);
  }
  update_business_device_by_id(userData: any) {
    return this._CallApiService.post_enc(userData, this.update_business_device_by_id_url);
  }
  insert_business_device(userData: any) {
    return this._CallApiService.post_enc(userData, this.insert_business_device_url);
  }
  manage_business_device(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_business_device_url);
  }
  manage_holidays_master(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_holidays_master_url);
  }


  GetGeoFencing_List(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetGeoFencing_url)
  }
  GetGeoFencingForParticularId(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetGeoFencingForParticularId_url)
  }
  SaveGeoFencing(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveGeoFencing_url)
  }
  private UpdateEmployerEsiDetails_url: string = constants.UpdateEmployerEsiDetails_url;
  private UpdateEmployerEpfDetails_url: string = constants.UpdateEmployerEpfDetails_url;
  private GetEmployerSocialSecurityDetails_url: string = constants.GetEmployerSocialSecurityDetails_url;
  private saveUpdateUnit_url: string = constants.saveUpdateUnit_url;
  private saveDepartmentUnit_url: string = constants.saveDepartmentUnit_url;
  private updateEmployeesOUandGeoFencingId_url: string = constants.updateEmployeesOUandGeoFencingId_url;
  GetEmployerSocialSecurityDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetEmployerSocialSecurityDetails_url);
  }
  UpdateEmployerEsiDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.UpdateEmployerEsiDetails_url);
  }
  UpdateEmployerEpfDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.UpdateEmployerEpfDetails_url);
  }

  DisableStatutoryCompliance(userData: any) {
    return this._CallApiService.post_enc(userData, this.DisableStatutoryCompliance_url);
  }

  RefreshMaterializedViewByApi(userData: any) {
    return this._CallApiService.post_enc(userData, this.RefreshMaterializedViewByApi_url);
  }
  JusPaymanageCard(userData: any) {
    return this._CallApiService.post_enc(userData, this.JusPaymanageCard_url);
  }
  otp_send_mobile_email_update(userData: any) {
    return this._CallApiService.post_enc(userData, this.otp_send_mobile_email_update_url);
  }
  otp_verify_mobile_email_update(userData: any) {
    return this._CallApiService.post_enc(userData, this.otp_verify_mobile_email_update_url);
  }
  update_employer_mobile_email(userData: any) {
    return this._CallApiService.post_enc(userData, this.update_employer_mobile_email_url);
  }
  update_employer_mobile_email_hub(userData: any) {
    return this._CallApiService.post_enc(userData, this.update_employer_mobile_email_hub_url);
  }
  saveUpdateUnit(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveUpdateUnit_url);
  }
  saveDepartmentUnit(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveDepartmentUnit_url);
  }
  updateEmployeesOUandGeoFencingId(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateEmployeesOUandGeoFencingId_url);
  }
  private saveDesignationUnit_url: string = constants.saveDesignationUnit_url;
  saveDesignationUnit(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveDesignationUnit_url);
  }
  private mapEmployee_url: string = constants.mapEmployee_url;
  mapEmployee(userData: any) {
    return this._CallApiService.post_enc(userData, this.mapEmployee_url);
  }

  private saveCustomSalaryStructureUnit_url: string = constants.saveCustomSalaryStructureUnit_url;
  saveCustomSalaryStructureUnit(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveCustomSalaryStructureUnit_url);
  }
  get_alert_type_master(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_alert_type_master_url);
  }
  enable_desable_alert(userData: any) {
    return this._CallApiService.post_enc(userData, this.enable_desable_alert_url);
  }
  get_alerts_list(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_alerts_list_url);
  }
  private updateEmployeeOuIds_url: string = constants.updateEmployeeOuIds_url;
  updateEmployeeOuIds(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateEmployeeOuIds_url);
  }
  private CheckPayrollRunStatus_url: string = constants.CheckPayrollRunStatus_url;
  CheckPayrollRunStatus(userData: any) {
    return this._CallApiService.post_enc(userData, this.CheckPayrollRunStatus_url);
  }

  // private manage_business_compliance_url: string = constants.manageBusinessCompliance_url;
  // save_business_compliance(userData: any) {
  //   return this._CallApiService.post_enc(userData, this.manage_business_compliance_url);
  // }

  private update_employer_logo_path_url: string = constants.update_employer_logo_path_url;
  update_employer_logo_path(userData: any) {
    return this._CallApiService.post_enc(userData, this.update_employer_logo_path_url);
  }
  private getCompanyBillingAddress_url  : string = constants.getCompanyBillingAddress_url;
  getCompanyBillingAddress(userData: any) {
    return this._CallApiService.post_enc(userData, this.getCompanyBillingAddress_url);
  }
  private getSwitchEmployerProfileData_url  : string = constants.getSwitchEmployerProfileData_url;
  getSwitchEmployerProfileData(userData: any) {
    return this._CallApiService.post_enc(userData, this.getSwitchEmployerProfileData_url);
  }
  private setDefaultBillingAddress_url  : string = constants.setDefaultBillingAddress_url;
  setDefaultBillingAddress(userData: any) {
    return this._CallApiService.post_enc(userData, this.setDefaultBillingAddress_url);
  }
  manage_approval_master(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_approval_master_url);
  }
  insert_update_approval_template(userData: any) {  
    return this._CallApiService.post_enc(userData, this.insert_update_approval_template_url);
  }
 enable_desable_remove_work_flow(userData: any) {
    return this._CallApiService.post_enc(userData, this.enable_desable_remove_work_flow_url);
  }
private enable_desable_remove_work_flow_url: string = constants.enable_desable_remove_work_flow_url;
private attendanceOnly_url: string = constants.attendanceOnly_url;
 attendanceOnly(userData: any) {
    return this._CallApiService.post_enc(userData, this.attendanceOnly_url)
  }
  private getExpenseReport_url: string = constants.getExpenseReport_url;
getExpenseReport(userData: any) {
   return this._CallApiService.post_enc(userData, this.getExpenseReport_url)
}
private bulk_insert_holiday_master_url: string = constants.bulk_insert_holiday_master_url;
  bulk_insert_holiday_master(userData: any) {
    return this._CallApiService.post_enc(userData, this.bulk_insert_holiday_master_url);
  }
  private updateEmployeesGeoFenceIds_url: string = constants.updateEmployeesGeoFenceIds_url;
  updateEmployeesGeoFenceIds(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateEmployeesGeoFenceIds_url);
  }
}
