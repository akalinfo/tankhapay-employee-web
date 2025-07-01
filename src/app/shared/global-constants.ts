export class GlobalConstants {

  public static nameRegex: string = "^[A-Za-z ]+$";

  public static emailRegex: string = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";

  public static mobileRegex: string = "^[0-9]{10}$";

  public static pincodeRegex: any = "^[0-9]{6}$";

  public static gstnoRegex: string = "^([0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}[A-Za-z]{1}[0-9A-Za-z]{1})$";
  // public static gstnoRegex: string = "^([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[0-9A-Z]{1})$";
  // 27AAALN0133B2DY
  public static pannoRegex: string = "^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$";

  // public static EPFRegex: string = "/^[A-Z]{2}[\s\/]?[A-Z]{3}[\s\/]?[0-9]{7}[\s\/]?[0-9]{3}[\s\/]?[0-9]{7}$/";
  public static EPFRegex: string = "/^[A-Z]{2}[\s\/]?[A-Z]{3}[\s\/]?[0-9]{7}[\s\/]?[0-9]{3}$/";

  public static ESIRegex: string = "/^(\d{2})[--\s]?(\d{2})[--\s]?(\d{1,6})[--\s]?(\d{3})[--\s]?(\d{4})$/";

  public static alert_options: any = {
    autoClose: false,
    keepAfterRouteChange: false
  }
  public static alert_options_autoClose: any = {
    autoClose: true,
    keepAfterRouteChange: false
  }
  public static juspaymsg = "This functionality will be available soon.";
  public static juspaymsg_stg = "This functionality will be available on production only.";
  public static show_man_days_msg = "You are marking more paydays than the number of days set in the employee(s) salary structure. If so, the additional day(s) salaries will be considered overtime. Are you sure?";
  public static show_man_days_msg_alert = "You are marking more paydays than the number of days set in the employee(s) salary structure. If so, the additional day(s) salaries will be considered overtime. Are you sure?";
  public static mark_att_alert = "Employee(s) total marked present days are fewer than the combined weekly-offs and holidays. Continue?";
  public static NEW_THEME_IDS = ['653', '6927']
  // 6927 production id from coloring 6927 Digital India Corporation
  // for Time zone show hide
  //7145	EuRide India#06DNYPB5247L1ZE-20250402 01:04:01
  public static NEW_GERMAN_TIME_IDS = ['653','3088','7145']

}
