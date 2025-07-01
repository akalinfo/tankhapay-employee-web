import { Injectable } from '@angular/core';
import * as constants from '../../shared/helpers/constants';
import { ToastrService } from 'ngx-toastr';
import { HelpAndSupportService } from 'src/app/modules/help-and-support/help-and-support.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogsService {

  constructor(
    public toastr: ToastrService,
    private helpAndSupportService: HelpAndSupportService
  ) { }


  // Activity Logging - sidharth kaul 28.04.2025
  insertActivityLog(token: any, module_name: string, router_url: string) {

    if (token?.sso_admin_id == '' || token?.sso_admin_id != '99999') {

      let obj = {
        action: "insert_activity_logs",
        account_id: token?.tp_account_id?.toString(),
        activity_emp_code: (token?.isEmployer == '0') ? token?.emp_code : "",
        activity_modulename: module_name,
        activity_usertype: (token?.isEmployer == '1') ? 'Employer' : 'Employee',
        activity_detail: router_url || "",
        user_by: (token?.sub_userid) ? token?.name + '(subuser)' : token?.name,
        user_ip: "",
        employer_login_id: (token?.isEmployer == '1') ? token?.mobile : "",
        employer_email: (token?.isEmployer == '1') ? token?.userid : ""
      }

      this.helpAndSupportService.insertActivityLogs(obj).subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            // this.toastr.success("Activity Logged!");
            // this.toastr.success(`${module_name} -- Activity Logged!`);
          } else {
            console.log("Please check activity log api.")
          }
        }
      })

    } else return;

  }

}
