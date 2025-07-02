import { Injectable } from '@angular/core';


import { CallApiService } from '../../shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';
@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(
    private _CallApiService: CallApiService) { }


  private send_OTP_url: string = constants.send_OTP_url;
  private verify_OTP_url: string = constants.verify_OTP_url;
  private user_login_url: string = constants.user_login_url;
  private employer_register_url: string = constants.employer_register_url;
  private screendetails_url: string = constants.screendetails_url;
  private employer_login_otp_send_url: string = constants.employer_login_otp_send_url;
  private updateProductType_url: string = constants.updateProductType_url;
  private forgot_password_url: string = constants.forgot_password_url;
  private get_area_of_work_url: string = constants.get_area_of_work_url;
  private reset_password_url: string = constants.reset_password_url;
  private is_url_expired_url: string = constants.is_url_expired_url;
  private getAll_state_Url: string = constants.getAll_state_Url;
  private updateEmployerBillingCompany_url: string = constants.updateEmployerBillingCompany_url;
  private getEmployer_status_url: string = constants.getEmployer_status_url;
  private gst_verify_without_otp_url: string = constants.gst_verify_without_otp_url;
  private getAll_district_url: string = constants.getAll_district_url;
  private get_employer_aggreement_url: string = constants.get_employer_aggreement_url;
  private employerStartingPaymentset_url: string = constants.employerStartingPaymentset_url;
  private forgotpassword_send_sms_url: string = constants.forgotpassword_send_sms_url;
  private CalcReciebale_url: string = constants.CalcReciebale_url;
  private saveReceivable_url: string = constants.saveReciebale_url;
  private getVpaDetails_url: string = constants.getVpaDetails_url;
  private manualTransfer_url: string = constants.manualTransfer_url;
  private hdfcPaymentStatus_url: string = constants.hdfcPaymentStatus_url;
  private welcomeSendMail_url: string = constants.welcomeSendMail_url;
  private direct_login_url: string = constants.direct_login_url;
  private get_dashboard_status_url: string = constants.get_dashboard_status_url;
  private get_tpay_dashboard_data_url: string = constants.get_tpay_dashboard_data_url;
  // for jusPay
  private jusPaySessionOrder_url: string = constants.jusPaySessionOrder_url;
  private jusPayOrderResponse_url: string = constants.jusPayOrderResponse_url;

  private get_receivable_detail_url: string = constants.get_receivable_detail_url;
  private validate_paymentlink_by_orderid_url: string = constants.validate_paymentlink_by_orderid_url;

  employer_register(Data: any) {
    return this._CallApiService.post_enc(Data, this.employer_register_url);
  }
  screendetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.screendetails_url);
  }
  employer_login_otp_send(Data: any) {
    return this._CallApiService.post_enc(Data, this.employer_login_otp_send_url);
  }
  send_OTP(Data: any) {
    return this._CallApiService.post_enc(Data, this.send_OTP_url);
  }
  verify_OTP(Data: any) {
    return this._CallApiService.post_enc(Data, this.verify_OTP_url);
  }
  user_login(Data: any) {
    return this._CallApiService.post_enc(Data, this.user_login_url);
  }

  // private employer_register_url:string = constants.employer_register_url;
  // private screendetails_url:string=constants.screendetails_url;
  // private employer_login_otp_send_url:string=constants.employer_login_otp_send_url;

  // employer_register(Data:any){
  //   return this._CallApiService.post_enc(Data, this.employer_register_url);
  // }

  // screendetails(Data:any){
  //   return this._CallApiService.post_enc(Data, this.screendetails_url);
  // }

  // employer_login_otp_send(Data:any){
  // return this._CallApiService.post_enc(Data, this.employer_login_otp_send_url);
  // }

  updateProductType(Data: any) {
    return this._CallApiService.post_enc(Data, this.updateProductType_url);
  }
  get_area_of_work(Data: any) {
    return this._CallApiService.post_enc(Data, this.get_area_of_work_url);
  }
  forgot_password(Data: any) {
    return this._CallApiService.post_enc(Data, this.forgot_password_url);
  }
  reset_password(Data: any) {
    return this._CallApiService.post_enc(Data, this.reset_password_url);
  }
  is_url_expired(Data: any) {
    return this._CallApiService.post_enc(Data, this.is_url_expired_url);
  }
  getAll_state(Data: any) {
    return this._CallApiService.post_enc(Data, this.getAll_state_Url);
  }
  updateEmployerBillingCompany(Data: any) {
    return this._CallApiService.post_enc(Data, this.updateEmployerBillingCompany_url);
  }
  getEmployer_status(Data: any) {
    return this._CallApiService.post_enc(Data, this.getEmployer_status_url);
  }
  gst_verify_without_otp(Data: any) {
    return this._CallApiService.post_enc(Data, this.gst_verify_without_otp_url);
  }
  getAll_district(Data: any) {
    return this._CallApiService.post_enc(Data, this.getAll_district_url);
  }
  get_employer_aggreement(Data: any) {
    return this._CallApiService.post_enc(Data, this.get_employer_aggreement_url);
  }
  employerStartingPaymentset(Data: any) {
    return this._CallApiService.post_enc(Data, this.employerStartingPaymentset_url);
  }
  forgotpassword_send_sms(Data: any) {
    return this._CallApiService.post_enc(Data, this.forgotpassword_send_sms_url);
  }
  CalcReciebaleFromBaseAmount(Data: any) {
    return this._CallApiService.post(Data, this.CalcReciebale_url)
  }
  saveReceivable(Data: any) {
    return this._CallApiService.post(Data, this.saveReceivable_url)
  }
  getVpaDetails(Data: any) {
    return this._CallApiService.post(Data, this.getVpaDetails_url)
  }
  manualTransfer(Data: any) {
    return this._CallApiService.post(Data, this.manualTransfer_url)
  }
  hdfcPaymentStatus(Data: any) {
    return this._CallApiService.post_enc(Data, this.hdfcPaymentStatus_url)
  }
  sendWelcomeEmail(Data: any) {
    return this._CallApiService.post_enc(Data, this.welcomeSendMail_url)
  }
  direct_login(Data: any) {
    return this._CallApiService.post_enc(Data, this.direct_login_url)
  }
  get_dashboard_status(Data: any) {
    return this._CallApiService.post_enc(Data, this.get_dashboard_status_url)
  }
  get_tpay_dashboard_data(Data: any) {
    return this._CallApiService.post_enc(Data, this.get_tpay_dashboard_data_url)
  }
  jusPaySessionOrder(Data: any) {
    return this._CallApiService.post(Data, this.jusPaySessionOrder_url)
  }
  jusPayOrderResponse(Data: any) {
    return this._CallApiService.post(Data, this.jusPayOrderResponse_url)
  }
  get_receivable_detail(Data: any) {
    return this._CallApiService.post_enc(Data, this.get_receivable_detail_url)
  }
  validate_paymentlink_by_orderid(Data: any) {
    return this._CallApiService.post_enc(Data, this.validate_paymentlink_by_orderid_url)
  }

  private branding_logo_path_url_url = constants.branding_logo_path_url;
  get_branding_logo_path(Data: any) {
    return this._CallApiService.post_enc(Data, this.branding_logo_path_url_url)
  }
  // pankaj dated. 25.04.2025
  private getEmpSummary_url = constants.getEmpSummary_url;
  getEmpSummary_url_fun(Data: any) {
    return this._CallApiService.post_enc(Data, this.getEmpSummary_url)
  }
  private getEmpCompletedCycle_url = constants.getEmpCompletedCycle_url;
  getEmpCompletedCycle_url_fun(Data: any) {
    return this._CallApiService.post_enc(Data, this.getEmpCompletedCycle_url)
  }
  // end

  private insert_birthday_wishes_url = constants.insert_birthday_wishes_url;
  insert_birthday_wishes(Data: any) {
    return this._CallApiService.post_enc(Data, this.insert_birthday_wishes_url)
  }

  private send_employee_otp_url = constants.send_employee_otp_url;
  send_employee_otp(Data: any) {
    return this._CallApiService.post_enc(Data, this.send_employee_otp_url)
  }
  private verify_employee_otp_url = constants.verify_employee_otp_url;
  verify_employee_otp(Data: any) {
    return this._CallApiService.post_enc(Data, this.verify_employee_otp_url)
  }

}

