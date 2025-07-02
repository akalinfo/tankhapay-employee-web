import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class LeaveMgmtService {

  constructor(
    private _CallApiService: CallApiService
  ) { }

  private saveLeaveTemplate_url: string = constants.saveLeaveTemplate_url;
  private get_tp_leave_temeplate_url: string = constants.get_tp_leave_temeplate_url;
  private getLeaveTemplate_url: string = constants.getLeaveTemplate_url;
  private manageCustomerLeaveTemplate_hub_url: string = constants.manageCustomerLeaveTemplate_hub_url;
  private check_template_is_editable_url: string = constants.check_template_is_editable_url;
  private add_update_leave_type_url: string = constants.add_update_leave_type_url;
  private get_Leave_appl_by_account_empid_url: string = constants.get_Leave_appl_by_account_empid_url;
  private get_employee_leave_balance_url: string = constants.get_employee_leave_balance_url;
  private approved_leave_appl_by_applid_url: string = constants.approved_leave_appl_by_applid_url;
  private upsert_leave_general_settings_url: string = constants.upsert_leave_general_settings_url;
  private get_leave_general_settings_url: string = constants.get_leave_general_settings_url;
  private leave_type_enable_desable_url: string = constants.leave_type_enable_desable_url;
  private get_gatepass_data_url: string = constants.get_gatepass_data_url;
  private manage_bulk_holiday_state_url: string = constants.manage_bulk_holiday_state_url;

  private leaveApplicationApproval_url: string = constants.leaveApplicationApproval_url;
  private leaveApplicationRejection_url: string = constants.leaveApplicationRejection_url;

  saveLeaveTemplate(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveLeaveTemplate_url);
  }
  get_tp_leave_temeplate(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_tp_leave_temeplate_url);
  }
  getLeaveTemplate(userData: any) {
    return this._CallApiService.post_enc(userData, this.getLeaveTemplate_url);
  }
  getLeaveTemplate_enableonly(userData: any) {
    return this._CallApiService.post_enc(userData, this.getLeaveTemplate_url);
  }
  manageCustomerLeaveTemplate_hub(userData: any) {
    return this._CallApiService.post_enc(userData, this.manageCustomerLeaveTemplate_hub_url);
  }
  check_template_is_editable(userData:any){
    return this._CallApiService.post_enc(userData, this.check_template_is_editable_url);
  }
  add_update_leave_type(userData:any){
    return this._CallApiService.post_enc(userData, this.add_update_leave_type_url);
  }
  get_Leave_appl_by_account_empid(userData:any){
    return this._CallApiService.post_enc(userData, this.get_Leave_appl_by_account_empid_url);
  }
  get_employee_leave_balance(userData:any){
    return this._CallApiService.post_enc(userData, this.get_employee_leave_balance_url);
  }
  approved_leave_appl_by_applid(userData:any){
    return this._CallApiService.post_enc(userData, this.approved_leave_appl_by_applid_url);
  }
  upsert_leave_general_settings(userData:any){
    return this._CallApiService.post_enc(userData, this.upsert_leave_general_settings_url);
  }
  get_leave_general_settings(userData:any){
    return this._CallApiService.post_enc(userData, this.get_leave_general_settings_url);
  }
  get_leave_types_by_account_url= constants.get_leave_types_by_account_url;
  get_leave_types_by_account(userData:any){
    return this._CallApiService.post_enc(userData, this.get_leave_types_by_account_url);
  }
  leave_type_enable_desable(userData:any){
    return this._CallApiService.post_enc(userData, this.leave_type_enable_desable_url);
  }
  get_gatepass_data(userData:any){
    return this._CallApiService.post_enc(userData, this.get_gatepass_data_url);
  }
  manage_bulk_holiday_state(userData:any){
    return this._CallApiService.post_enc(userData, this.manage_bulk_holiday_state_url);
  }
  leaveApplicationApproval(userData:any){
    return this._CallApiService.post_enc(userData, this.leaveApplicationApproval_url);
  }
  leaveApplicationRejection(userData:any){
    return this._CallApiService.post_enc(userData, this.leaveApplicationRejection_url);
  }

}
