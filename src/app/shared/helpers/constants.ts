import { environment } from '../../../environments/environment';

// /************************Api base URL**************************/

// ng build
// ng build --configuration production

export const tankhapay_baseurl: string = environment.tankhapay_api;

// export const hub_directbaseUrl: string = environment.hub_api;

export const tp_employer_Url: string = environment.tp_employer_api;

export const tnd_tankhapay_api_URL: string = environment.tnd_tankhapay_api;

//****************** Employer Mobile App API's  START ******************* */
// Employer Mobile App API's
export const updateProductType_url: string = tp_employer_Url + "updateProductType";
export const getEmployer_status_url: string = tp_employer_Url + "employer/getEmployer_status";
export const updateEmployerBillingCompany_url: string = tp_employer_Url + "updateEmployerBillingCompany"
export const gst_verify_without_otp_url: string = tp_employer_Url + "gst_verify_without_otp"
export const getAll_district_url: string = tp_employer_Url + "employer/getAll_district"
export const get_employer_aggreement_url: string = tp_employer_Url + "get_employer_aggreement"
export const employerStartingPaymentset_url: string = tp_employer_Url + "employer/employerStartingPaymentset"
export const send_sms_url: string = tp_employer_Url + "EmployeeSendApplink";
export const employer_register_url: string = tp_employer_Url + "employer_register";
export const screendetails_url: string = tp_employer_Url + "verify_user_otp";
export const employer_login_otp_send_url: string = tp_employer_Url + "employer_login_otp_send"
export const hdfcPaymentStatus_url: string = tp_employer_Url + "hdfcPaymentStatus"


//****************** Employer Mobile App API's  END ******************* */


//********************************* Business Web Application API's  START ***************************/
// for OTP WITH MObile Login
export const send_OTP_url: string = tankhapay_baseurl + "send_OTP";
export const verify_OTP_url: string = tankhapay_baseurl + "verify_OTP";

export const no_name: string = 'U2FsdGVkX18reTervTSu9OwsP3egwIyXqE3Ujw3cMenUtb1O/7EBxQRicJg2Z68C';

// Email and password Login
export const user_login_url: string = tankhapay_baseurl + "login";
export const direct_login_url: string = tankhapay_baseurl + "direct_login";
export const employer_details_url: string = tankhapay_baseurl + "employee";
export const password_login_url: string = tankhapay_baseurl + "changepassword";
// sso -login/id
export const single_signOn_url: string = tankhapay_baseurl + "admin/busSSOSignOn";

export const add_new_employee_url: string = tankhapay_baseurl + "tp/" + "add_new_employee";
export const employeeby_jsid_url: string = tankhapay_baseurl + "employee/" + "employeeby_jsid";
export const updateEmployeeStatus_url: string = tankhapay_baseurl + "employee/" + "updateEmployeeStatus";
// harsh code
export const get_calendar_url: string = tankhapay_baseurl + "attendance/get_calendar";
export const get_employer_today_attendance_url: string = tankhapay_baseurl + "attendance/" + "get_employer_today_attendance";
export const get_monthly_attendance_url: string = tankhapay_baseurl + "attendance/" + "get_monthly_attendance";
export const save_monthly_attendance_url: string = tankhapay_baseurl + "attendance/" + "save_monthly_attendance";
export const get_month_dates_days_url: string = tankhapay_baseurl + "attendance/" + "get_month_dates_days";
export const CheckAdvanceForAssociate_url: string = tankhapay_baseurl + "attendance/" + "CheckAdvanceForAssociate";
export const SaveTpVoucher_url: string = tankhapay_baseurl + "attendance/" + "SaveTpVoucher";
export const getEmployerMonthAttendance_url: string = tankhapay_baseurl + "attendance/" + "getEmployerMonthAttendance";
export const save_excel_bulk_att_url: string = tankhapay_baseurl + "attendance/" + "save_excel_bulk_att";
export const att_file_upload_url: string = tankhapay_baseurl + "attendance/" + "att_file_upload";
export const get_att_import_header_url: string = tankhapay_baseurl + "attendance/" + "get_att_import_header";
export const get_tp_leave_temeplate_url: string = tankhapay_baseurl + "leaves/" + "get_tp_leave_temeplate";
export const getLeaveTemplate_url: string = tankhapay_baseurl + "leaves/" + "getLeaveTemplate";
export const manageCustomerLeaveTemplate_hub_url: string = tankhapay_baseurl + "leaves/" + "manageCustomerLeaveTemplate_hub";
export const get_business_device_url: string = tankhapay_baseurl + "device/" + "get_business_device";
export const update_business_device_by_id_url: string = tankhapay_baseurl + "device/" + "update_business_device_by_id";
export const insert_business_device_url: string = tankhapay_baseurl + "device/" + "insert_business_device";
export const manage_business_device_url: string = tankhapay_baseurl + "device/" + "manage_business_device";
export const manage_holidays_master_url: string = tankhapay_baseurl + "master/" + "manage_holidays_master";
// export const getPunchingAttendance_url: string = tankhapay_baseurl + "getPunchingAttendance";
export const getPunchingAttendance_url: string = tankhapay_baseurl + "Report/get_biometric_attendance_details";
export const process_att_punches_hub_url: string = tankhapay_baseurl + "process_att_punches_hub";
export const get_Last_sync_stataus_url: string = tankhapay_baseurl + "get_Last_sync_stataus";
///api/get_Last_sync_stataus
export const get_area_of_work_url: string = tankhapay_baseurl + "get_area_of_work"
// payout modules
export const CustomerPayoutDetails_url: string = tankhapay_baseurl + "TpCandidateAPI/CustomerPayoutDetails";
export const CustomerPayoutSummary_url: string = tankhapay_baseurl + "TpCandidateAPI/CustomerPayoutSummary";
// view update employer profile

export const getEmployerProfile_url: string = tankhapay_baseurl + "employer/getEmployerProfile";
export const updateEmployerProfile_url: string = tankhapay_baseurl + "employer/updateEmployerProfile";
export const saveLeaveTemplate_url: string = tankhapay_baseurl + "employer/saveLeaveTemplate";
export const profilePhotoUpload_url: string = tankhapay_baseurl + "employer/profilePhotoUpload";
//karan api's for add update employee kyc
export const verify_emp_mobile_url: string = tankhapay_baseurl + "employee/" + "verify_emp_mobile";
export const getTpCandidateDetails_url: string = tankhapay_baseurl + "employee/" + "getTpCandidateDetails";
export const updateTpBasicDetails_url: string = tankhapay_baseurl + "employee/" + "updateTpBasicDetails";
export const updateTpKycDetails_url: string = tankhapay_baseurl + "employee/" + "updateTpKycDetails";
export const file_upload_url: string = tankhapay_baseurl + "employer/" + "file_upload";
export const getTpMinMaxPerDayWages_url: string = tankhapay_baseurl + "employee/" + "getTpMinMaxPerDayWages";
export const remove_employee_url: string = tankhapay_baseurl + "employee/" + "remove_employee";
export const GetTPSalaryStructure_url: string = tankhapay_baseurl + "employee/" + "GetTPSalaryStructure";
export const checkKYCnum_url: string = tankhapay_baseurl + "employee/" + "checkKYCnum";
export const insert_profile_photo_url: string = tankhapay_baseurl + "employee/insert_profile_photo";
export const getEmployeeProfile_url: string = tankhapay_baseurl + "employee/getEmployeeProfile";
export const checkUniqueDetails_url: string = tankhapay_baseurl + "employee/" + "checkUniqueDetails";
export const updateEmployeeDetails_url: string = tankhapay_baseurl + "employee/" + "updateEmployeeDetails";
export const getLatestTransaction_Url: string = tankhapay_baseurl + "account/" + "employer_latest_transaction";
export const PaymentPerformaInvoice_url: string = tankhapay_baseurl + "account/" + "PaymentPerformaInvoice";
export const SetTpCandidateRestructureMode_url: string = tankhapay_baseurl + "employee/SetTpCandidateRestructureMode"
export const manageEmployeeLeaveTemplate_hub_url: string = tankhapay_baseurl + "leaves/" + "manageEmployeeLeaveTemplate_hub";
export const updateEmpDetailsOnCRM_url: string = tankhapay_baseurl + "employee/updateEmpDetailsOnCRM";

// get arpit code

export const GetTpVoucherDetails_url: string = tankhapay_baseurl + "TpCandidateAPI/GetTpVoucherDetails";
export const GetVoucherDetails_url: string = tankhapay_baseurl + "approval/GetVoucherDetails";

export const updateTpBankDetails_url: string = tankhapay_baseurl + "employee/" + "updateTpBankDetails";
export const getAll_state_url: string = tankhapay_baseurl + "master/" + "getAll_state";
export const getAll_Holiday_state_url: string = tankhapay_baseurl + "master/" + "getAll_Holiday_state";
export const GetMinWageCategoryByState_url: string = tankhapay_baseurl + "master/" + "GetMinWageCategoryByState";

export const CalcTPSalaryStructure_url: string = tankhapay_baseurl + "employee/" + "CalcTPSalaryStructure";
export const SaveTpCandidateSalary_url: string = tankhapay_baseurl + "employee/" + "SaveTpCandidateSalary";
export const SalaryVerificationViewApi_url: string = tankhapay_baseurl + "Report/SalaryVerificationViewApi";
export const LiabilityReportApi_url: string = tankhapay_baseurl + "Report/LiabilityReportApi";
export const deleteLiabilityReport_url: string = tankhapay_baseurl + "Report/deleteLiabilityReportApi";

export const FetchBankReportApi_url: string = tankhapay_baseurl + "Report/FetchBankReportApi";
export const DisplayesicecrreportMonthWiseApi_url: string = tankhapay_baseurl + "Report/DisplayesicecrreportMonthWiseApi";
export const DisplayepfecrreportMonthWiseApi_url: string = tankhapay_baseurl + "Report/DisplayepfecrreportMonthWiseApi";
export const DisplaylwfecrreportMonthWiseApi_url: string = tankhapay_baseurl + "Report/DisplaylwfecrreportMonthWiseApi";
export const InvestmentReportResultApi_url: string = tankhapay_baseurl + "Report/InvestmentReportResultApi";
export const DisbursmentReportApi_url: string = tankhapay_baseurl + "Report/DisbursmentReportApi";
export const PrepayoutReportApi_url: string = tankhapay_baseurl + "Report/PrepayoutReportApi";
export const GetInvestmentsProofDetails_url: string = tankhapay_baseurl + "Report/GetInvestmentsProofDetails";
export const EmployeesPaySummary_url: string = tankhapay_baseurl + "Report/EmployeesPaySummary";
export const SalarySlip_url: string = tankhapay_baseurl + "Report/SalarySlip";
export const CanditateDetailsForVoucher_url: string = tankhapay_baseurl + "approval/CanditateDetailsForVoucher";

// By Prabhat
export const tpPay_api_Url: string = environment.tpPay_api;
export const paySalary_url: string = tankhapay_baseurl + "payoutApi/paysalary";
export const getPackages_url: string = tankhapay_baseurl + "payoutApi/get_employer_montly_subscription";
export const UpdateSalaryStatus_url: string = tankhapay_baseurl + "payoutApi/UpdateSalaryStatus";
export const CalcReciebale_url: string = tankhapay_baseurl + "payoutApi/CalcReciebaleFromBaseAmount";
export const saveReciebale_url: string = tankhapay_baseurl + "payoutApi/save_receivables";
export const getVpaDetails_url: string = tankhapay_baseurl + "payoutApi/GetVpaDetails";
export const manualTransfer_url: string = tankhapay_baseurl + "payoutApi/manual_transfer";
//
export const getCustomerEmployeeDetails_url: string = tankhapay_baseurl + "employee/" + "getCustomerEmployeeDetails";

export const save_profile_photo_url: string = tankhapay_baseurl + "employee/" + "save_profile_photo";
export const VerifyInvestmentProofDetails_url: string = tankhapay_baseurl + "Report/VerifyInvestmentProofDetails";
export const GetTaxProjectionApi_url: string = tankhapay_baseurl + "Report/GetTaxProjectionApi";
export const GetTpCheckInOutSummary_url: string = tankhapay_baseurl + "Report/GetTpCheckInOutSummary";
export const GetDetailedLiabilityReportByEmpCode_url: string = tankhapay_baseurl + "Report/GetDetailedLiabilityReportByEmpCode";


export const GetTransactionType_url: string = tankhapay_baseurl + "approval/GetTransactionType";
export const GetMasterLedgerName_url: string = tankhapay_baseurl + "approval/GetMasterLedgerName";
export const GetSubLedgerName_url: string = tankhapay_baseurl + "approval/GetSubLedgerName";

// Forgot Password and reset password
export const reset_password_url: string = tankhapay_baseurl + "reset_password";
export const is_url_expired_url: string = tankhapay_baseurl + "is_url_expired";
export const forgot_password_url: string = tankhapay_baseurl + "forgot_password";
export const forgotpassword_send_sms_url: string = tankhapay_baseurl + "forgotpassword_send_sms";
export const welcomeSendMail_url: string = tankhapay_baseurl + "welcomeSendMail"


export const getAll_state_Url: string = tp_employer_Url + "employer/getAll_state";

// arpit code 21-12-2023
export const SaveOtherLedgerName_url: string = tankhapay_baseurl + "approval/SaveOtherLedgerName";
export const SaveVoucher_url: string = tankhapay_baseurl + "approval/SaveVoucher";
export const SaveAdvanceAndLoanVoucher_url: string = tankhapay_baseurl + "approval/SaveAdvanceAndLoanVoucher";


// added on 29-12-2023 by akchhaya
export const GetGeoFencing_url: string = tankhapay_baseurl + "Business/GetGeoFencing";
export const GetGeoFencingForParticularId_url: string = tankhapay_baseurl + "Business/GetGeoFencingForParticularId";
export const SaveGeoFencing_url: string = tankhapay_baseurl + "Business/SaveGeoFencing";
// export const getGeoFencing_url : string = tankhapay_baseurl+"employee/getGeoFencing";
// added by karan on 02/01/2024

export const calculateCandidateSalary_url: string = tankhapay_baseurl + "employee/calculateCandidateSalary";
export const UpdateStatutoryCompliances_url: string = tankhapay_baseurl + "employee/UpdateStatutoryCompliances";
export const getSalaryStructure_url: string = tankhapay_baseurl + "employee/getSalaryStructure";
export const setupSalary_url: string = tankhapay_baseurl + "employee/setupSalary";
export const getAppointeeDetails_url: string = tankhapay_baseurl + "employee/getAppointeeDetails";
// export const getLWFRateByStateCode_url: string = tankhapay_baseurl + "employee/getLWFRateByStateCode";
export const getCandidatesWhoseSalarySetupIsPending_url: string = tankhapay_baseurl + "employee/getCandidatesWhoseSalarySetupIsPending";
export const joinTpAttendanceCandidate_url: string = tankhapay_baseurl + "employee/joinTpAttendanceCandidate";
export const updateAttendanceEmployeeDetails_url: string = tankhapay_baseurl + "employee/updateAttendanceEmployeeDetails";

export const UpdateEmployerEsiDetails_url: string = tankhapay_baseurl + "Business/UpdateEmployerEsiDetails";
export const UpdateEmployerEpfDetails_url: string = tankhapay_baseurl + "Business/UpdateEmployerEpfDetails";
export const GetEmployerSocialSecurityDetails_url: string = tankhapay_baseurl + "Business/GetEmployerSocialSecurityDetails";
// dated. 24.01.2024
export const getCustomerLedgerSummary_url: string = tankhapay_baseurl + "account/" + "getCustomerLedgerSummary";
// added by arpit on 25.01.2024
export const GetInvestmentDeclarationDateForEmployee_url: string = tankhapay_baseurl + "Report/GetInvestmentDeclarationDateForEmployee";
export const SaveInvestmentDeclarationDateForIndividualEmp_url: string = tankhapay_baseurl + "Report/SaveInvestmentDeclarationDateForIndividualEmp";
export const GetInvestmentDeclarationDate_url: string = tankhapay_baseurl + "Report/GetInvestmentDeclarationDate";
export const SaveInvestmentDeclarationDate_url: string = tankhapay_baseurl + "Report/SaveInvestmentDeclarationDate";
export const DisburseVoucher_url: string = tankhapay_baseurl + "approval/DisburseVoucher";
export const RejectVoucher_url: string = tankhapay_baseurl + "approval/RejectVoucher";
export const TpCheckInOut_url: string = tankhapay_baseurl + "attendance/TpCheckInOut";

export const check_template_is_editable_url: string = tankhapay_baseurl + "leave/check_template_is_editable"

export const getOpeningLeaveBalance_url: string = tankhapay_baseurl + "leave/getOpeningLeaveBalance";
export const getGenerateOpeningBalance_url: string = tankhapay_baseurl + "leave/getGenerateOpeningBalance";
export const getUpdateLeaveBalance_url: string = tankhapay_baseurl + "leave/getUpdateLeaveBalance";
//export const get
export const jusPaySessionOrder_url: string = tankhapay_baseurl + "jusPaySessionOrder";
export const jusPayOrderResponse_url: string = tankhapay_baseurl + "jusPayOrderResponse";
// for manage Save Card dated. 03.06.2024
export const JusPaymanageCard_url: string = tankhapay_baseurl + "JusPaymanageCard";
// end
export const getEmployeeleave_history_url: string = tankhapay_baseurl + "leaves/getEmployeeleave_history";
export const bulkEmployeeLeaveTemplate_hub_url: string = tankhapay_baseurl + "leaves/" + "bulkEmployeeLeaveTemplate_hub";
//Arpit Visitor Report APi
export const visitor_summary_url: string = tankhapay_baseurl + "visitor/visitor_summary";
export const visitor_card_details_url: string = tankhapay_baseurl + "visitor/visitor_card_details";
//end dated 23.05.24
export const uspccalcgrossfromctcUrl: string = tankhapay_baseurl + "employee/uspccalcgrossfromctc";

// end

// karan user management
export const getRoles_url: string = tankhapay_baseurl + "user-mgmt/getRoles";
export const getAllUser_url: string = tankhapay_baseurl + "user-mgmt/getAllUsers";
export const saveUser_url: string = tankhapay_baseurl + "user-mgmt/saveUser";
export const saveRole_url: string = tankhapay_baseurl + "user-mgmt/saveRole";
export const getRoleById_url: string = tankhapay_baseurl + "user-mgmt/getRoleById";
export const getModules_url: string = tankhapay_baseurl + "user-mgmt/getModules";
export const savePrivilege_url: string = tankhapay_baseurl + "user-mgmt/savePrivilege";
// end

// sidharth kaul - dashboard settings
export const addUpdateDashboardSetting_url: string = tankhapay_baseurl + "insert_update_dashboard_setting_data";
// end
//********************************* Business Web Application API's  END ***************************/
export const getPrivilege_url: string = tankhapay_baseurl + "user-mgmt/getPrivilege";
// export const addSubmodules_url : string= tankhapay_baseurl + "user-mgmt/addSubmodules";
export const addSubmodules_url: string = tankhapay_baseurl + "user-mgmt/addSubmodule";
export const getGeoFencing_url: string = tankhapay_baseurl + "user-mgmt/getGeoFencing";
// harsh api's
export const get_dashboard_status_url: string = tankhapay_baseurl + "get_dashboard_status";
// advance api's
export const GenerateRequiredAmountPI_url: string = tankhapay_baseurl + "payoutApi/GenerateRequiredAmountPI";


// Flexy Seetings
export const manage_salary_structure_url: string = tankhapay_baseurl + "employee/manage_salary_structure";
export const get_mst_business_setup_url: string = tankhapay_baseurl + "employee/get_mst_business_setup";

// export const manage_tds_structure_url: string = tankhapay_baseurl + "employee/manage_tds_structure";
// export const manage_prof_tax_structure_url: string = tankhapay_baseurl + "employee/manage_prof_tax_structure";
// export const manage_pf_structure_url: string = tankhapay_baseurl + "employee/manage_pf_structure";
// export const manage_esi_structure_url: string = tankhapay_baseurl + "employee/manage_esi_structure";


export const show_bus_setting_page_url: string = tankhapay_baseurl + "master/show_bus_setting_page";
export const DownloadCompilanceReport_url: string = tankhapay_baseurl + "Report/DownloadCompilanceReport";

export const DisableStatutoryCompliance_url: string = tankhapay_baseurl + "Business/DisableStatutoryCompliance";
export const RefreshMaterializedViewByApi_url: string = tankhapay_baseurl + "refresh_account_details";

export const getPayoutTransactionsDetails_url: string = tankhapay_baseurl + "getPayoutTransactionsDetails";
export const getFundAddedTransactionsDetails_url: string = tp_employer_Url + "CustomerTransactionsApi/getFundAddedTransactionsDetails";

export const get_url_access_right_global_url: string = tankhapay_baseurl + "user-mgmt/get_url_access_right_global";
export const getLWFRateByStateCode_url: string = tankhapay_baseurl + "employee/getLWFRateByStateCode";
export const GetStateProfessionalTax_url: string = tankhapay_baseurl + "employee/GetStateProfessionalTax";

// karan new apis dated. 27.04.2024
export const get_mst_business_setup_dynamic_url: string = tankhapay_baseurl + "employee/get_mst_business_setup_dynamic";
export const createCustomSalaryStructure_url: string = tankhapay_baseurl + "employee/createCustomSalaryStructure";
export const saveCustomSalaryStructure_url: string = tankhapay_baseurl + "employee/saveCustomSalaryStructure";

// Arpit Vistor Management API's

export const saveVisitor_url: string = tankhapay_baseurl + "visitor/saveVisitor";
export const visiting_card_list_url: string = tankhapay_baseurl + "visitor/visiting_card_list";
export const visitor_list_url: string = tankhapay_baseurl + "visitor/visitor_list";
export const update_blacklist_visitor_url: string = tankhapay_baseurl + "visitor/update_blacklist_visitor";
export const Update_visitor_url: string = tankhapay_baseurl + "visitor/Update_visitor";

// harsh api's
export const add_update_leave_type_url: string = tankhapay_baseurl + "leaves/" + "add_update_leave_type";
export const get_Leave_appl_by_account_empid_url: string = tankhapay_baseurl + "leaves/" + "get_Leave_appl_by_account_empid";
export const get_employee_leave_balance_url: string = tankhapay_baseurl + "leaves/" + "get_employee_leave_balance";
export const approved_leave_appl_by_applid_url: string = tankhapay_baseurl + "leaves/" + "approved_leave_appl_by_applid";
export const get_leave_types_by_account_url: string = tankhapay_baseurl + "leaves/get_leave_types_by_account";

///////////////////////////////////// shiftDetails page///////////////////////////////////////////////////
export const GetShiftDetail_url: string = tankhapay_baseurl + "attendance/get_shift_details";
export const CreateNewShift_url: string = tankhapay_baseurl + "attendance/create_new_shift";
export const GetMasterList_url: string = tankhapay_baseurl + "attendance/get_master_list";
export const GetShiftSpecificSettings_url: string = tankhapay_baseurl + "attendance/get_shift_specific_settings";
export const CreateShiftSpecificSettings_url: string = tankhapay_baseurl + "attendance/create_shift_specific_settings";
export const GetBreakDetails_url: string = tankhapay_baseurl + "attendance/get_break_details";
export const CreateBreakDetails_url: string = tankhapay_baseurl + "attendance/create_new_break";
export const GetMasterShift_url: string = tankhapay_baseurl + "attendance/get_master_shift";
export const CreateEmployeeShift_url: string = tankhapay_baseurl + "attendance/create_employee_shift_mapping";
export const UpdateShiftStatus_url: string = tankhapay_baseurl + "attendance/enable_disable_status";
export const CreateShiftRotation_url: string = tankhapay_baseurl + "attendance/create_shift_rotation";
export const CreateGeneralSettings_url: string = tankhapay_baseurl + "attendance/create_general_settings";


// Arpit Vistor Management API's
export const save_visitor_card_url: string = tankhapay_baseurl + "visitor/save_visitor_card";
export const check_in_out_visitor_url: string = tankhapay_baseurl + "visitor/check_in_out_visitor";
export const send_visitor_otp_url: string = tankhapay_baseurl + "visitor/send_visitor_otp";
export const verify_visitor_otp_url: string = tankhapay_baseurl + "visitor/verify_visitor_otp";
// karan changes

export const fetchEmployeesFromAPI_url: string = tankhapay_baseurl + "employee/fetchEmployeesFromAPI";
export const getEmployerEmployeeFromApi_url: string = tankhapay_baseurl + "employee/getEmployerEmployeeFromApi";
export const updateSyncStatus_url: string = tankhapay_baseurl + "employee/updateSyncStatus";
export const updateEmployeeDetailsThroughApiProcess_url: string = tankhapay_baseurl + "employee/updateEmployeeDetailsThroughApiProcess";

export const GetCustomerInvoiceDetails_url: string = tankhapay_baseurl + "Business/GetCustomerInvoiceDetails";

export const GetAudienceList_url: string = tankhapay_baseurl + "NotificationApi/GetAudienceList";
export const GetCampaignsDetails_url: string = tankhapay_baseurl + "NotificationApi/GetCampaignsDetails";

export const upsert_leave_general_settings_url: string = tankhapay_baseurl + "leaves/upsert_leave_general_settings";
export const vbasvdbvasbvbds: string = 'X2R1bW1heV90ZXN0d2R3ZXIzMnE0MTIzMjE0MTI=';

export const get_leave_general_settings_url: string = tankhapay_baseurl + "leaves/get_leave_general_settings";
/************* Akchhay Kumar Notification Task *****/
export const AddEditPushNotifications_url: string = tankhapay_baseurl + "NotificationApi/AddEditPushNotifications";
export const ChangeApprovalStatusForCampaign_url: string = tankhapay_baseurl + "NotificationApi/ChangeApprovalStatusForCampaign";
export const GetUniqueCampaignDetails_url: string = tankhapay_baseurl + "NotificationApi/GetUniqueCampaignDetails";
export const GetTargetAudience_url: string = tankhapay_baseurl + "NotificationApi/GetTargetAudience";

// akchhaya 15-05-2024
export const Tpnotify_url: string = tpPay_api_Url + "api/TpCandidateAPI/sendCustumFCM";

export const GetPaymentModeTypes_url: string = tankhapay_baseurl + "payoutApi/GetPaymentModeTypes";

// akchhaya 13-05-2024 Live tracking
export const GetEmployeeEventLiveTrackingDetails_url: string = tankhapay_baseurl + "TpLiveTrackingApi/GetEmployeeEventLiveTrackingDetails";
// bulk upload
export const bulk_deduction_upload_url: string = tankhapay_baseurl + "attendance/bulk_deduction_upload";
/*************** Akchhay Kumar Notification Task   ***********/
export const get_tpay_dashboard_data_url: string = tankhapay_baseurl + "dashboard/get_tpay_dashboard_data";

export const getMasterSalaryStructure_url: string = tankhapay_baseurl + "employee/getMasterSalaryStructure"
export const uspccalcgrossfromctc_withoutconveyance_url: string = tankhapay_baseurl + "employee/uspccalcgrossfromctc_withoutconveyance";
export const uspccalcgrossfromctc_url: string = tankhapay_baseurl + "employee/uspccalcgrossfromctc";

// karan  changes dated. 28.04.2024
export const getMinWageDays_url: string = tankhapay_baseurl + "employee/getMinWageDays";

// end

// harsh api
export const leave_type_enable_desable_url: string = tankhapay_baseurl + "leaves/leave_type_enable_desable";
// end

export const GetAllReimbursementClaimsForEmployer_url: string = tankhapay_baseurl + "approval/GetAllReimbursementClaimsForEmployer"
// Jivo DSR DA Reports added on 01-06-2024
export const SaveJivoDsrDaData_url: string = tankhapay_baseurl + "outSider/SaveJivoDsrDaData";
export const getJivoDSRDA_data_url: string = tankhapay_baseurl + "outSider/getJivoDSRDA_data";

// arpit dated. 07.06.2024
export const ManageReimbursementClaim_url: string = tankhapay_baseurl + "ReimbursementClaims/ManageReimbursementClaim";

// export const getTpAlerts_url: string = tp_employer_Url + "TpAlertsApi/getTpAlerts ";
export const getTpAlerts_url: string = tankhapay_baseurl + "TpAlertsApi/getTpAlerts ";

// end
// akchay chnages dated. 08.06.2024
// --------- New Prabhat Kumar
export const getemployeelistHubFace_url: string = tpPay_api_Url + "Api/TPFaceCheckIn/GetFaceCheckInUserListing";
// --------- old
export const getemployeelistFace_url: string = tankhapay_baseurl + "master/get_master_data";
//prabhat code reverted
// export const getemployeelistFace_url: string = tpPay_api_Url + "Api/TPFaceCheckIn/GetFaceCheckInUserListing";

export const registerFace_url: string = tankhapay_baseurl + "FaceApi/registerFace";
export const markAttendance_url: string = tankhapay_baseurl + "FaceApi/markAttendance";

// help and support api's by arpit dated. 14.06.2024
export const GetTickets_url: string = tankhapay_baseurl + "TpHelpAndSupportApi/GetTickets";
export const GetTicketTrail_url: string = tankhapay_baseurl + "TpHelpAndSupportApi/GetTicketTrail";
export const CreateTicketTrail_url: string = tankhapay_baseurl + "TpHelpAndSupportApi/CreateTicketTrail";
export const UpdateTicketstatus_url: string = tankhapay_baseurl + "TpHelpAndSupportApi/UpdateTicketstatus";

// added on dated. 17.06.2024
export const SubmitEsicForBusiness: string = tankhapay_baseurl + "Report/SubmitEsicForBusiness";
export const SubmitUanForBusiness_url: string = tankhapay_baseurl + "Report/SubmitUanForBusiness";
export const complianceFlagReportForBusiness_url: string = tankhapay_baseurl + "Report/complianceFlagReportForBusiness";

// employer Mobile and Email OTP update
export const otp_send_mobile_email_update_url: string = tankhapay_baseurl + "otp_send_mobile_email_update";
export const otp_verify_mobile_email_update_url: string = tankhapay_baseurl + "otp_verify_mobile_email_update";
export const update_employer_mobile_email_url: string = tankhapay_baseurl + "master/update_employer_mobile_email";
export const update_employer_mobile_email_hub_url: string = tankhapay_baseurl + "master/update_employer_mobile_email_hub";
export const manage_biometric_att_url: string = tankhapay_baseurl + "Report/manage_biometric_att";

// karan changes dated. 22.06.2024
export const syncEmployeeDetails_url: string = tankhapay_baseurl + "employee/syncEmployeeDetails";
export const getUpdateData_url: string = tankhapay_baseurl + "employee/getUpdateData";
export const updateJoinigStatus_url: string = tankhapay_baseurl + "employee/updateJoiningStatus"

//OD Application
export const get_od_appl_by_account_url: string = tankhapay_baseurl + "leave/get_od_appl_by_account";
export const approved_od_appl_by_applid_url: string = tankhapay_baseurl + "leave/approved_od_appl_by_applid";

// karan on dated. 04.07.2024
export const updateEmployeesOUandGeoFencingId_url: string = tankhapay_baseurl + "master/updateEmployeesOUandGeoFencingId"

export const getMasterTDS_url: string = tankhapay_baseurl + "employee/getMasterTDS";
export const saveConsultantSalarySetup_url: string = tankhapay_baseurl + "employee/saveConsultantSalarySetup";

export const saveUpdateUnit_url: string = tankhapay_baseurl + "master/saveUpdateUnit"
export const saveDepartmentUnit_url: string = tankhapay_baseurl + "master/saveDepartmentUnit"
//OD Application

export const GetConsultantPayoutDetails_url: string = tankhapay_baseurl + "Consultant/GetConsultantPayoutDetails";
export const AddEditConsultantPayoutDetails_url: string = tankhapay_baseurl + "Consultant/AddEditConsultantPayoutDetails";
export const DeleteConsultantPayoutRecord_url: string = tankhapay_baseurl + "Consultant/DeleteConsultantPayoutRecord";
export const GetMaster_url: string = tankhapay_baseurl + "MasterApi/GetMaster";
export const saveDesignationUnit_url: string = tankhapay_baseurl + "master/saveDesignationUnit";
// added on dated. 12.07.2024
export const get_missed_punch_att_url: string = tankhapay_baseurl + "attendance/get_missed_punch_att";
export const manage_missed_punch_att_url: string = tankhapay_baseurl + "attendance/manage_missed_punch_att";
export const get_gatepass_data_url: string = tankhapay_baseurl + "leave/get_gatepass_data";

export const ConsultantPayout_url: string = tankhapay_baseurl + "Consultant/ConsultantPayout";

export const getEmployerMonthAttendance_for_excel_url: string = tankhapay_baseurl + "attendance/getEmployerMonthAttendance_for_excel";
// new constanst on dated. 13.07.2024
export const mapEmployee_url: string = tankhapay_baseurl + "master/mapEmployee";
export const getEmployerOUorGeoFenceDetails_url: string = tankhapay_baseurl + "employee/getEmployerOUorGeoFenceDetails"
export const updateSalaryDaysOrDailyAllowanceRate_url: string = tankhapay_baseurl + "employee/updateSalaryDaysOrDailyAllowanceRate"

//**************Arpit /Karan Release dated. 20.07.2024 ********************
export const saveCustomSalaryStructureUnit_url: string = tankhapay_baseurl + "master/saveCustomSalaryStructure_unit";
export const RecordVoucherPayment_url: string = tankhapay_baseurl + "approval/RecordVoucherPayment";
// ******************************************************************************************
// unit wise attednace saved on dated. 24.07.2024
export const get_att_master_list_url: string = tankhapay_baseurl + "attendance/get_att_master_list";
export const getUnitTodayAttendance_url: string = tankhapay_baseurl + "attendance/getUnitTodayAttendance";
export const getUnitConsolidatedAttendance_url: string = tankhapay_baseurl + "attendance/getUnitConsolidatedAttendance";
export const saveUnitConsolidatedAttendance_url: string = tankhapay_baseurl + "attendance/saveUnitConsolidatedAttendance";
export const deleteSingleConsolidatedAttendance_url: string = tankhapay_baseurl + "attendance/deleteSingleConsolidatedAttendance";
// unit wise attednace saved on dated. 24.07.2024
// karan new api end points
export const get_unitSalaryStructure_data_url: string = tankhapay_baseurl + "master/get_unitSalaryStructure_data";
// arpit changes 02/08/2024
export const SaveOtherLedgerCustomerSpecific_url: string = tankhapay_baseurl + "approval/SaveOtherLedgerCustomerSpecific";
// karan dated. 03/08/2024
export const registerSubUser_url: string = tankhapay_baseurl + "user-mgmt/registerSubUser";
// dashboard details
export const get_today_attendence_reports_url: string = tankhapay_baseurl + "dashboard/get_today_attendence_reports";
// end
// 08.08.2024 harsh
export const get_alert_type_master_url: string = tankhapay_baseurl + "dashboard/get_alert_type_master";
export const enable_desable_alert_url: string = tankhapay_baseurl + "dashboard/enable_desable_alert";
export const get_alerts_list_url: string = tankhapay_baseurl + "dashboard/get_alerts_list";
// end
export const saveUpdateOtrule_url: string = tankhapay_baseurl + "attendance/saveUpdateOtrule";
// added by harsh date. 20.08.2024
export const get_employees_count_details_url: string = tankhapay_baseurl + "dashboard/get_employees_count_details";
// karan api dated. 21.08.2024
export const updateEmployeeOuIds_url: string = tankhapay_baseurl + "Business/updateEmployeeOuIds";
// harsh added on dated. 29.08.2024
export const SaveDearnessAllowanceData_url: string = tankhapay_baseurl + "DearnessAllowance/SaveDearnessAllowanceData";
// karan api dated. 31.08.2024
export const saveEditOtRules_url: string = tankhapay_baseurl + "attendance/saveEditOtRules";
export const CheckPayrollRunStatus_url: string = tankhapay_baseurl + "employer/CheckPayrollRunStatus";
// arpit and karan api dated. 07.09.2024
export const calculateCandidateSalaryForExcel_url: string = tankhapay_baseurl + "employee/calculateCandidateSalaryForExcel";
export const tea_allowance_rate_url: string = tankhapay_baseurl + "attendance/tea_allowance_rate";
export const GetLoanReport_url: string = tankhapay_baseurl + "Report/GetLoanReport";

export const GetExitDetails_url: string = tankhapay_baseurl + "GetExitDetails";
export const GetReasonsOfLeaving_url: string = tankhapay_baseurl + "GetReasonsOfLeaving";
export const AddEditExitDetails_url: string = tankhapay_baseurl + "AddEditExitDetails";

export const educationDetails_url: string = tankhapay_baseurl + "employee/educationDetails";
export const workExperience_url: string = tankhapay_baseurl + "employee/workExperience";
export const trainingDetails_url: string = tankhapay_baseurl + "employee/trainingDetails";
export const familyDetails_url: string = tankhapay_baseurl + "employee/familyDetails";

export const get_receivable_detail_url: string = environment.tp_employer_api + "get_receivable_detail";
export const validate_paymentlink_by_orderid_url: string = tankhapay_baseurl + "validate_paymentlink_by_orderid";

//arpit 26 sep 2024
export const AddEditForm16_url: string = tankhapay_baseurl + "AddEditForm16";
export const GetForm16Details_url: string = tankhapay_baseurl + "GetForm16Details";
//
export const GetSalarySlipURL_url: string = tp_employer_Url + "TpCandidateAPI/GetSalarySlipURL";
export const getLetterTemplateCategories_url: string = tankhapay_baseurl + "employee/getLetterTemplateCategories";
export const addEditLetterCateogory_url: string = tankhapay_baseurl + "employee/addEditLetterCateogory";
export const deleteLetterCtg_url: string = tankhapay_baseurl + "employee/deleteLetterCtg";
// manage assets master
export const get_asset_master_url: string = tankhapay_baseurl + "get_asset_master";
export const insert_asset_location_category_url: string = tankhapay_baseurl + "insert_asset_location_category";
export const insert_update_assets_url: string = tankhapay_baseurl + "insert_update_assets";
export const remove_verify_assets_url: string = tankhapay_baseurl + "remove_verify_assets";

/****************** dated 05.10.2024***************** */
/***************** Recruit module *******************/
export const templateList_url: string = tankhapay_baseurl + "recruit/allTemplates";
export const templateFieldName_url: string = tankhapay_baseurl + "recruit/allTemplateFieldName";
export const templateField_url: string = tankhapay_baseurl + "recruit/allTemplateFields";
export const templateType_url: string = tankhapay_baseurl + "recruit/allTemplateType";
export const templateActions_url: string = tankhapay_baseurl + "recruit/templateActions";
export const candidateList_url: string = tankhapay_baseurl + "recruit/allCandidates";
export const candidateActions_url: string = tankhapay_baseurl + "recruit/candidateActions";
export const saveEmailJson_url: string = tankhapay_baseurl + "recruit/saveEmailJson";
export const offerLetterActions_url: string = tankhapay_baseurl + "recruit/offerLetterActions";

//karan 04 oct 2024
export const getMasterLetters_url: string = tankhapay_baseurl + "employee/getMasterLetters";
export const addEditTemplate_url: string = tankhapay_baseurl + "employee/addEditTemplate";
export const getMasterFieldsForTemplateType_url: string = tankhapay_baseurl + "employee/getMasterFieldsForTemplateType";
// Arpit 05 oct
export const EnableDisableCatagoryDocument_url: string = tankhapay_baseurl + "EnableDisableCatagoryDocument";
export const AddCatagoryDocumentName_url: string = tankhapay_baseurl + "AddCatagoryDocumentName";
export const AddNewCatagory_url: string = tankhapay_baseurl + "AddNewCatagory";
export const GetDocumentMasterDetails_url: string = tankhapay_baseurl + "GetDocumentMasterDetails";
// added for leave reports
export const get_leave_taken_history_url: string = tankhapay_baseurl + "leaves/get_leave_taken_history";

export const manage_tp_master_url: string = tankhapay_baseurl + "master/manage_tp_master";

//arpit 11 oct 2024
export const AddEditDocument_url: string = tankhapay_baseurl + "AddEditDocument";
export const GetCandidateDocumentMasterDetails_url: string = tankhapay_baseurl + "GetCandidateDocumentMasterDetails";
//karan 11 oct 2024
export const getLetterTemplateId_url: string = tankhapay_baseurl + "employee/getLetterTemplateId";
export const manageCandidateAppointmentLetter_url: string = tankhapay_baseurl + "employee/manageCandidateAppointmentLetter";
export const mapTPCode_url: string = tankhapay_baseurl + "recruit/mapTPCode";
export const letterTEmplateById_url: string = tankhapay_baseurl + "recruit/letterTEmplateById";

// Fetch the data from db


export const akal_syncattpunch_url: string = tankhapay_baseurl + "office/syncattpunch";

export const getMaster_Dropdown_url: string = tankhapay_baseurl + "Report/GetMaster_Dropdown";
export const GetDashboardSettingData_url: string = tankhapay_baseurl + "get_dashboard_setting_data";
// harsh dated. 25.10.2024
export const save_remove_confirm_release_asset_url: string = tankhapay_baseurl + "save_remove_confirm_release_asset";
export const get_assets_url: string = tankhapay_baseurl + "get_assets";
// karan dated. 26.10.2024
export const SaveDepartment_url: string = tankhapay_baseurl + "master/saveDepartmentDirect";
// harsh dated 07.11.2024
export const manage_tp_hierarchy_url: string = tankhapay_baseurl + "orgchart/manage_tp_hierarchy";
export const get_tp_hierarchy_url: string = tankhapay_baseurl + "orgchart/get_tp_hierarchy";
// Karan code dated : 08-11-2024
export const sendLetterMail_url: string = tankhapay_baseurl + "Business/sendLetterMail";
export const insertLetterHead_url: string = tankhapay_baseurl + "master/insertLetterHead";
//Arpit code dated : 08-11-2024
export const GetServiceBookDetails_url: string = tankhapay_baseurl + "GetServiceBookDetails";

export const GetReportFields_url: string = tankhapay_baseurl + "Report/GetReportFields";
// harsh api
export const get_asset_report_url: string = tankhapay_baseurl + "get_asset_report";

export const useSession_url: string = tankhapay_baseurl + "master/useSession";

export const update_employer_logo_path_url: string = tankhapay_baseurl + "update_employer_logo_path";

//arpit api dated. 05.12.2024
export const AddEditDisciplinaryAction_url: string = tankhapay_baseurl + "AddEditDisciplinaryAction";
export const DeleteDisciplinaryAction_url: string = tankhapay_baseurl + "DeleteDisciplinaryAction";
//karan dated. 05.12.2024
export const managePolicy_url: string = tankhapay_baseurl + "policy/managePolicy";
export const AddEditRewards_url: string = tankhapay_baseurl + "AddEditRewards";
export const EditRewards_url: string = tankhapay_baseurl + "EditRewards";
export const EditDisciplinaryAction_url: string = tankhapay_baseurl + "EditDisciplinaryAction";
export const DeleteRewardDetails_url: string = tankhapay_baseurl + "DeleteRewardDetails";
//karan

// HRMAPI
export const branding_logo_path_url: string = tnd_tankhapay_api_URL + "TpayCareerWeb/GetCustomerAccIDByDomainName";
export const get_branding_detail_url: string = tnd_tankhapay_api_URL + "branding/get_branding_detail";

// end
export const checkUniqueForActiveEmp_url: string = tankhapay_baseurl + "employee/checkUniqueForActiveEmp";
export const updateActiveEmployeeDetails_url: string = tankhapay_baseurl + "employee/updateActiveEmployeeDetails";

export const updateManualTDS_url: string = tankhapay_baseurl + "attendance/updateManualTDS";
// karan dated. 18.12.2024
export const manageEmpAppSettings_url: string = tankhapay_baseurl + "policy/manageEmpAppSettings";
// by prabhat for set and get the detault address in business settings dated. 19.12.2024
export const getCompanyBillingAddress_url: string = tankhapay_baseurl + "employer/getEmployerProfile_allAddress";
export const getSwitchEmployerProfileData_url: string = tankhapay_baseurl + "employer/getSwitchEmployerProfileData";
export const setDefaultBillingAddress_url: string = tankhapay_baseurl + "employer/setDefaultBillingAddress";
// end by prabhat for
// harsh dated. 27.12.2024
export const manage_bulk_holiday_state_url: string = tankhapay_baseurl + "leave/manage_bulk_holiday_state";
// end
// add by akchhaya 27-12-2024
export const getAllTravelRequestSummary_url: string = tankhapay_baseurl + "travel/getAllTravelRequestSummary";
export const getAllTravelExpenseDetails_url: string = tankhapay_baseurl + "travel/getAllTravelExpenseDetails";
export const updateTravelReqExpStatus_url: string = tankhapay_baseurl + "travel/updateTravelReqExpStatus";
export const getTpAlertsByDateFilter_url: string = tankhapay_baseurl + "NotificationApi/getTpAlertsByDateFilter";

// added  by harsh dated. 04.01.2025

export const fetchAttendancefromClient_url: string = tankhapay_baseurl + "fetchAttendancefromClient";
export const saveAttendancefromClient_url: string = tankhapay_baseurl + "saveAttendancefromClient";

// end
export const saveDesignation_url: string = tankhapay_baseurl + "master/saveDesignation";
// dated. 09.01.2025 harsh
export const manage_approval_master_url: string = tankhapay_baseurl + "manage_approval_master";
export const insert_update_approval_template_url: string = tankhapay_baseurl + "insert_update_approval_template";
export const enable_desable_remove_work_flow_url: string = tankhapay_baseurl + "enable_desable_remove_work_flow";
// end
// chandra mohan
export const attendanceOnly_url: string = tankhapay_baseurl + "master/attendanceOnly";
export const getSalarySlip_url: string = tankhapay_baseurl + "Report/getSalarySlipURL";
// harsh dated 23.01.2025
export const getManualSalaryInfo_url: string = tankhapay_baseurl + "attendance/getManualSalaryInfo";
export const saveManualSalaryInfo_url: string = tankhapay_baseurl + "attendance/saveManualSalaryInfo";
export const rejectManualSalary_url: string = tankhapay_baseurl + "attendance/rejectManualSalary";
// end
export const incrementReportBusiness_url: string = tankhapay_baseurl + "Report/incrementReportBusiness";
export const getExpenseReport_url: string = tankhapay_baseurl + "Report/ExpenseReportBusiness";
// dated. 31.01.2025
export const fetchArearByMonthYearEmpCode_url: string = tankhapay_baseurl + "attendance/fetchArearByMonthYearEmpCode";
export const bulkLedgerEntry_url: string = tankhapay_baseurl + "attendance/bulkLedgerEntry";
export const getEmployeesForLedger_url: string = tankhapay_baseurl + "attendance/getEmployeesForLedger";
export const verifyArrear_url: string = tankhapay_baseurl + "attendance/verifyArrear";
export const viewArrearDetails_url: string = tankhapay_baseurl + "attendance/viewArrearDetails";
// whats app sms harsh dated. 06.02.2025
export const leaveApplicationApproval_url: string = tankhapay_baseurl + "master/leaveApplicationApproval";
export const leaveApplicationRejection_url: string = tankhapay_baseurl + "master/leaveApplicationRejection";

// end

/*Whatsapp notification api Karan*/
export const reimbursementClaim_url: string = tankhapay_baseurl + "master/" + "reimbursementClaim";
export const sendSalaryPdf_url: string = tankhapay_baseurl + "Report/sendSalaryPdf";
export const daywisecheckcheckinReport_url: string = tankhapay_baseurl + "Report/daywisecheckcheckinReport";
// added dated. 15.02.2025
export const getMasterListingOfApproval_url: string = tankhapay_baseurl + "getMasterListingOfApproval";
export const getApprovalRequestByActionType_url: string = tankhapay_baseurl + "getApprovalRequestByActionType";
export const approveRejectLeave_url: string = tankhapay_baseurl + "approveRejectLeave";
export const get_monthly_attendance_employee_url: string = tankhapay_baseurl + "approveRejectLeave";
// export const get
// dated 17.02.2025
export const getCandidateDetails_url: string = tankhapay_baseurl + "employee/getCandidateDetails";
// end
// dated. 17.02.2025
export const approveRejectMissedPunchAttendance_url: string = tankhapay_baseurl + "TpBusinessAPI/approveRejectMissedPunchAttendance";
// end
// dated. 18.02.2025
export const CalculateDeviationFines_url: string = tankhapay_baseurl + "TpCandidateCheckInOut/CalculateDeviationFines";
export const UpdateDeviationFines_url: string = tankhapay_baseurl + "TpCandidateCheckInOut/UpdateDeviationFines";
// end

//ks 19 feb 2025
export const changeDocumentStatusAcceptReject_url: string = tankhapay_baseurl + "ChangeDocumentStatusAcceptReject";
// added on dated. 20.02.2025
export const manageProjects_url: string = tankhapay_baseurl + "policy/manageProjects";
// end
// akchay dated. 21.02.2025
export const SaveEmpRegime_url: string = tankhapay_baseurl + "TpTaxesApi/SaveEmpRegime";
export const Save80cComponents_url: string = tankhapay_baseurl + "TpInvestmentProofApi/Save80cComponents";
export const saveCH6ProofDetails_url: string = tankhapay_baseurl + "TpInvestmentProofApi/saveCH6ProofDetails";
export const GetViewInvestmentsProof_url: string = tankhapay_baseurl + "TpInvestmentProofApi/GetViewInvestmentsProof";
export const saveHraProof_url: string = tankhapay_baseurl + "TpInvestmentProofApi/saveHraProof";
export const saveHomeLoanDetails_url: string = tankhapay_baseurl + "TpInvestmentProofApi/saveHomeLoanDetails";
export const generatePdfByCode_url: string = tankhapay_baseurl + "Report/getPdfBtyeCode ";
// end
// vinod dated

export const manage_report_columns_wfm_url: string = tankhapay_baseurl + "report/manage_report_columns_wfm";
// end
export const getAc21Report_url: string = tankhapay_baseurl + "Report/ac21Report";


// hasrh send notification api for birthday wishes
export const manage_dashboard_notifications_data_url: string = tankhapay_baseurl + "employee/manage_dashboard_notifications_data";
export const get_dashboard_notifications_data_url: string = tankhapay_baseurl + "employee/get_dashboard_notifications_data";
export const uploadBirthdayImg_url: string = tankhapay_baseurl + "employer/uploadBirthdayImg";
// end

export const get_Leave_appl_filter_url: string = tp_employer_Url + "leave/get_Leave_appl_filter";
export const employeeLoginByMob_url: string = tankhapay_baseurl + "employeeLoginByMob";
export const getEmployeeMenu_url: string = tankhapay_baseurl + "getEmployeeMenu";

export const getAllReimbursementClaims_url: string = tpPay_api_Url + '/api/ReimbursementClaims/GetAllReimbursementClaims';
export const addEditReimbursementClaim_url: string = tpPay_api_Url + '/api/ReimbursementClaims/AddEditReimbursementClaim';
export const deleteReimbursementClaim_url: string = tp_employer_Url + `ReimbursementClaims/DeleteReimbursementClaim`;
export const manageDeviationSalaryDetails_url: string = tankhapay_baseurl + "attendance/manageDeviationSalaryDetails";
export const updateMasterCatDefineEmployee_url: string = tankhapay_baseurl + "TpCandidateDocumentAPI/assignDocumentToCandidate";
// chandra mohan dated. 01.03.2025
export const remove_applied_leave_url: string = tp_employer_Url + "leave/remove_applied_leave";
export const apply_leave_appl_url: string = tp_employer_Url + "leave/apply_leave_appl";
// end
// 01/03/2025
export const getEmployeeSupportTicket_url: string = tpPay_api_Url + "mobile_api/employee/query/type";
export const getEmployeeQueryTrail_url: string = tpPay_api_Url + "mobile_api/employee/query/query_trail";
export const getTicketCategory_url: string = tpPay_api_Url + "mobile_api/employee/query/tickets";
export const saveTicketDetail_url: string = tpPay_api_Url + "mobile_api/employee/query/save_query";
export const saveQueryTrail_url: string = tpPay_api_Url + "mobile_api/employee/query/save_query_trail";
// end
// dated. 01.03.2025
export const SavePreviousIncomeDetail_url: string = tankhapay_baseurl + "TpTaxesApi/SavePreviousIncomeDetail";

// harsh dated. 02.03.2025

export const manage_payout_ticketing_workflow_url: string = tankhapay_baseurl + "employee/manage_payout_ticketing_workflow";
export const createSupportRequest_url: string = tankhapay_baseurl + "employee/createSupportRequest";
export const getTicketMaster_url: string = tankhapay_baseurl + "employee/getTicketMaster";

// dated. 02.03.2025 karan
export const getTravelSummary_url: string = tp_employer_Url + "travel/getTravelSummary";
export const saveTravelDetails_url: string = tp_employer_Url + "travel/saveTravelDetails";
export const getTravelMaster_url: string = tp_employer_Url + "master/getTravelMaster";
export const getTravelExpenseDetails_url: string = tp_employer_Url + "travel/getTravelExpenseDetails";
export const updateTravelExpenseDetails_url: string = tp_employer_Url + "travel/updateTravelExpenseDetails";


export const getAllState_url: string = tpPay_api_Url + "api/employer/getAll_state";
export const esicRelationship_url: string = tpPay_api_Url + "api/MasterApi/GetEsicRelationship";
export const getStateEsiDispensary_url: string = tpPay_api_Url + "api/MasterApi/GetStateEsiDispensaries";
export const saveOrUpdateDependent_url: string = tpPay_api_Url + "api/Insurance/SaveEsicDependents";
export const getDependentLists_url: string = tpPay_api_Url + "api/Insurance/GetCandidateEsicDependents";

export const SaveEmpInvestment_url: string = tp_employer_Url + "TpTaxesApi/SaveEmpInvestment";
export const GetEmpRegimeAndTaxProjection_url: string = tp_employer_Url + "TpTaxesApi/GetEmpRegimeAndTaxProjection";

export const approveTravelRequest_url: string = tp_employer_Url + "approveTravelRequest";
export const approveRejectTravelExpense_url: string = tp_employer_Url + "approveRejectTravelExpense";
export const approveRejectMissedPunch_url: string = tp_employer_Url + "approveRejectMissPunch";
export const approveRejectOnDuty_url: string = tp_employer_Url + "approveRejectOnduty";
export const approveRejectCompOffRequest_url: string = tp_employer_Url + "approveRejectCompOffRequest";
export const approveRejectWFHRequest_url: string = tp_employer_Url + "approveRejectWfhRequest";

// Approve/Reject Imprest Request - sidharth kaul 26.05.2025
export const approveRejectImprestRequest_url: string = tankhapay_baseurl + "imprest/approve_reject_application";

export const getCalenderRecordsByEmployee_url: string = tp_employer_Url + "tndApp/getCalenderRecordsByEmployee";
export const previewTrainingExamAnswer_url: string = tp_employer_Url + "tndApp/previewTrainingExamAnswer";
export const previewFeedbackAnswer_url: string = tp_employer_Url + "tndApp/previewFeedbackAnswer";
export const employeeTrainingMarkAttendance_url: string = tp_employer_Url + "tndApp/employeeTrainingMarkAttendance";

export const approveRejectFaceRegister_url: string = tankhapay_baseurl + "approveRejectFaceRegister";

// harsh dated. 03.03.2025
export const createTicket_url: string = tankhapay_baseurl + "employee/createTicket";
export const lockUnlockAdvice_url: string = tankhapay_baseurl + "employee/lockUnlockAdvice";
export const getAllQueriesTickets_url: string = tankhapay_baseurl + "TpHelpAndSupportApi/getAllQueriesTickets";
export const readTicketInternalDepartment_url: string = tankhapay_baseurl + "TpHelpAndSupportApi/readTicketInternalDepartment";

// end
export const get_faq_category_url: string = tp_employer_Url + "get_faq_category";
export const hrPolicyList_url: string = tp_employer_Url + "policy/hrPolicyList";

export const getDeptWiseEmployees_url: string = tankhapay_baseurl + "master/getDeptWiseEmployees";
export const getAnnualReport_url: string = tankhapay_baseurl + "Report/liabilityReportCombined";
export const manage_audit_report_wfm_url: string = tankhapay_baseurl + "manage_audit_report_wfm";

export const saveBulkManualSalaryInfo_url: string = tankhapay_baseurl + "attendance/saveBulkManualSalaryInfo";
// dated on dated. 11.03.2025
export const saveBulkDeviationSalaryDetails_url: string = tankhapay_baseurl + "attendance/saveBulkDeviationSalaryDetails";
// end
//chandra Mohna dated. 12.03.2025
export const addUpdateBudget_url: string = tankhapay_baseurl + "budget/addUpdateBudget";
export const insertBudgetDetail_url: string = tankhapay_baseurl + "budget/insertBudgetDetail";
export const SaveBulkPreparedSalary_url: string = tankhapay_baseurl + "employee/SaveBulkPreparedSalary";
// end
// added by harsh dated . 15.03.2025
export const bulk_insert_holiday_master_url: string = tankhapay_baseurl + "master/" + "bulk_insert_holiday_master";
//harsh 19 mar 2025
export const get_employee_list_for_generate_leave_url: string = tankhapay_baseurl + "leave/get_employee_list_for_generate_leave";
export const generateBulkOpeningBalance_url: string = tankhapay_baseurl + "leave/generateBulkOpeningBalance";
export const updateBulkLeaveBalance_url: string = tankhapay_baseurl + "leave/updateBulkLeaveBalance";
//ak 21 -03-2025
export const TaxCalculator_url: string = tankhapay_baseurl + "TPSalaryBusiness/TaxCalculator";
export const project_map_url: string = tankhapay_baseurl + "master/get_master_data";
export const manageResources_url: string = tankhapay_baseurl + "policy/manageResources";
export const attendance_reProcessEmployeeAttendance_url: string = tankhapay_baseurl + "attendance/reProcessEmployeeAttendance";
// hasrh dated. 27.03.2025
export const manageAdvices_url: string = tankhapay_baseurl + "attendance/manageAdvices";
export const manageBulkAdvices_url: string = tankhapay_baseurl + "attendance/manageBulkAdvices";
// end
// prabhat dated. 27.03.2025
export const employeeSSOLogin_url: string = tankhapay_baseurl + "businessEmployeeSSOLogin";
// end

export const SaveEmpInvestmentDeclaration_url: string = tankhapay_baseurl + "TpTaxesApi/SaveEmpInvestmentDeclaration";
// dated by harsh dated. 28.03.2025
export const update_weekly_off_holiday_by_account_url: string = tankhapay_baseurl + "leave/update_weekly_off_holiday_by_account";
// dated. 29.03.2025
export const emp_location_hist_url: string = tankhapay_baseurl + "saveLocationTransferHistory";

// harsh dated. 01.04.2025
export const manageCompOffRequest_url: string = tankhapay_baseurl + "leave/manageCompOffRequest";
export const uploadCompOffDocument_url: string = tankhapay_baseurl + "leave/uploadCompOffDocument";
export const getCompOffRequest_url: string = tankhapay_baseurl + "leave/getCompOffRequest";
// end
//
export const GetHomeLoanDetails_url: string = tp_employer_Url + "TpTaxesApi/GetHomeLoanDetails";
export const SaveHomeLoan_url: string = tp_employer_Url + "TpTaxesApi/SaveHomeLoan";
// cm dated. 03.04.2025
export const get_employee_leave_balance_el_url: string = tankhapay_baseurl + "leaves/" + "get_employee_leave_balance_el";
// dated 03.04.2025
export const saveEmpRentDetails_url: string = tp_employer_Url + "TpTaxesApi/SaveEmpRentDetails";
export const getEmpRentDetails_url: string = tp_employer_Url + "TpTaxesApi/getEmpRentDetails";
//end
export const manage_timesheet_data_url: string = tankhapay_baseurl + "attendance/manage_timesheet_data";
export const get_timesheet_data_url: string = tankhapay_baseurl + "attendance/get_timesheet_data";

// sidharth kaul dated. 09.04.2025
export const manageWFHRequest_url: string = tankhapay_baseurl + "leave/manageWfhApplication";
export const uploadWFHDocument_url: string = tankhapay_baseurl + "leave/uploadWfhDocument";
// end
export const get_emp_dpt_count_url: string = tankhapay_baseurl + "dashboard/get_tpay_dashboard_data";
// sidharth kaul dated. 15.04.2025
export const GetMonthWiseOnboardingData_url: string = tankhapay_baseurl + "Report/getMonthWiseOnboardingDetails";
// prabhat dated. 19.04.2025
export const getDeclarationSubmittedReport_url: string = tankhapay_baseurl + "TpTaxesApi/GetCustomerWiseEmployeeRegimeDetails";

// Pankaj Bhonsle dated. 23.04.2025
export const contractrenewal_url: string = tankhapay_baseurl + "master/contractrenewal";
// end

// Pankaj Bhonsle dated. 25.04.2025
export const getEmpSummary_url: string = tnd_tankhapay_api_URL + "pms/getEmpSummary";
export const getEmpCompletedCycle_url: string = tnd_tankhapay_api_URL + "pms/getEmpCompletedCycle";
// end

// harsh dated. 26.04.2025
export const save_excel_bulk_att_new_url: string = tankhapay_baseurl + "attendance/" + "save_excel_bulk_att_new";
// end

// sidharth kaul dated. 28.04.2025
export const insertActivityLogs_url: string = tankhapay_baseurl + "insert_activity_logs";
//  end

// sidharth kaul dated. 22.05.2025
export const getCategoryListData_url: string = tankhapay_baseurl + "imprest/get_imprest_master";
export const getImprestRequest_url: string = tankhapay_baseurl + "imprest/get_imprest_applications_filter";
export const createImprestRequest_url: string = tankhapay_baseurl + "imprest/manage_imprest_applications";

//  end

// sidharth kaul
// end

// akchhay dated. 29.04.2025
export const GetTpFlexiSalary_url: string = tp_employer_Url + "TpCandidateAPI/GetTpFlexiSalary";
export const CalcTpFlexiSalary_url: string = tp_employer_Url + "TpCandidateAPI/CalcTpFlexiSalaryComponents";
export const SaveTpFlexiSalary_url: string = tp_employer_Url + "TpCandidateAPI/SaveTpFlexiSalaryComponents";
// end
// dated . 09.05.2025
export const insert_birthday_wishes_url: string = tankhapay_baseurl + "dashboard/insert_birthday_wishes";

//kajal(12-05-2025)
export const getEmpListURL: string = tp_employer_Url + "livetrack/get_live_tracking_data_mobile";

//added on dated. 14.05.2025 pankaj
export const managevendors_url: string = tankhapay_baseurl + "policy/managevendors";
//end
// dated. 14.05.2025
export const getEmployerTodayRequiredAttendance_url: string = tankhapay_baseurl + "attendance/" + "getEmployerTodayRequiredAttendance";


export const get_ir_appl_by_account_url: string = tankhapay_baseurl + "imprest/get_ir_appl_by_account";
export const approve_reject_application_by_id_url: string = tankhapay_baseurl + "imprest/approve_reject_application_by_id";
// dated. 31.05.2025
export const get_approved_days_url: string = tankhapay_baseurl + "attendance/get_approved_days";
export const generate_payment_advice_url: string = tankhapay_baseurl + "attendance/generate_payment_advice";
// dated. 02.06.2025
export const deleteAllCacheKeysForAccount_url: string = tankhapay_baseurl + "redis/deleteAllCacheKeysForAccount";

export const reprocess_today_checkinout_url: string = tankhapay_baseurl + "Report/reprocess_today_checkinout";
// dated . 12.06.2025
export const create_bulk_advice_url: string = tankhapay_baseurl + "attendance/create_bulk_advice";
// dated. 12.06.2025
export const kafkaProcessAttPunchesHub_url: string = tankhapay_baseurl + "kafka_process_att_punches_hub";

// add by ak 12-06-2025
export const updateEmployeesGeoFenceIds_url: string = tankhapay_baseurl + "Business/updateEmployeesGeoFenceIds";

export const getTdsReportData_url: string = tankhapay_baseurl + "get_tds_report_data";
export const uploadPanForm16_url: string = tankhapay_baseurl + "TPBusinessAPI/AddEditForm16ByPanCard";
// kusum dated. 17.06.2025
export const insight_sso_url: string = tankhapay_baseurl + "superset/accessToken";
// dated. 17.06.2025
export const bulkPayout_url: string = tankhapay_baseurl + "payoutApi/bulkPayout";
// end

// P-Rekha dated. 20.06.2025
export const exit_form_url:string = tankhapay_baseurl+"getExitReasonMaster";
export const exit_form_save_url:string = tankhapay_baseurl+"saveExitQuestionnaire";
export const full_and_final_get_url:string=  tankhapay_baseurl+"TpCandidate/getExitEmployeeList";
export const clearance_form_save_url:string= tankhapay_baseurl+ "submitExitClearanceForm";

// 
export const get_hourly_summary_report_url: string = tankhapay_baseurl + "Report/get_hourly_summary_report";

// add by ak 19-06-2025
export const updateTDSExemption_url: string = tankhapay_baseurl + "employee/updateTDSExemption"
// rekha dated. 27.06.2025
export const send_email_remainder_url:string = tankhapay_baseurl + "sendEmailExitRemainder"
export const markExitFormSentToEmployee:string = tankhapay_baseurl + "markExitFormSentToEmployee"
export const submitApprovalFeedbackForm:string = tankhapay_baseurl + "submitApprovalFeedbackForm"
// end 
export const getPdfBtyeCodePortrait_url: string = tankhapay_baseurl + "Report/getPdfBtyeCodePortrait ";

// add sidharth kaul dated. 28.06.2025
export const GeneralSettingTabData_url: string = tnd_tankhapay_api_URL + "pms/getconfigdata";
export const createUpdateGeneralSetting_url: string = tnd_tankhapay_api_URL + "pms/saveupdateconfig";
export const feedbackCategeory_url: string = tnd_tankhapay_api_URL + "pms/createupdatefeedbackcat";
export const CreateUpdateSkillSet_url: string = tnd_tankhapay_api_URL + "pms/createupdateskillset";
export const GetKraCatlogue_url: string = tnd_tankhapay_api_URL + "pms/getmethodslist";
export const tagSkillSet_url: string = tnd_tankhapay_api_URL + "pms/createskillsettag";
export const filePmsUpload_url: string = tnd_tankhapay_api_URL + "pms/uploadpmsfile";
// end
