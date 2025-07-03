import { Component, OnInit, AfterViewInit, EventEmitter, Output } from '@angular/core';
// import { SessionService } from '../../../shared/services/session.service';
// import decode from 'jwt-decode';
// import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
// import { UserManagementService } from 'src/app/modules/admin/user-management/user-management.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { PayoutService } from 'src/app/modules/payout/payout.service';
declare var $: any;  // Declaring $ as a variable so that we can use it to access jQuery
// import { OnlineStatusService, OnlineStatusType } from 'ngx-online-status';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { HelpAndSupportService } from 'src/app/modules/help-and-support/help-and-support.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment.prod';
import { BusinesSettingsService } from 'src/app/modules/business-settings/business-settings.service';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';
import { UserMgmtService } from 'src/app/modules/user-mgmt/user-mgmt.service';
import { ReportService } from 'src/app/modules/reports/report.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  profilepath: string = '';
  @Output() toggleEmitter = new EventEmitter<void>();
  month: any;
  sub_employer_check: any;
  tp_account_id: any;
  payout_data: any = [];
  notification_data: any = [];
  branding_data: any = [];
  unread_notifications: any = [];
  product_type: any = '';
  year: any;
  is_insufficient_fund: boolean = false;
  user_name: string = '';
  decoded_token: any;
  disp_image_txt: string = '';
  show_toggle_buttions: boolean = true;
  default_dashboard_url: string = '/profile/employee-detail';
  // dashboard/welcome
  show_right_logo: any = true;
  left_logo_path: any = '';
  isemployee: boolean = false;
  userType = 'Employer';
  notificationEmpId = '';
  employerProfiles: any;
  dashboard_settings:any = null;

  constructor(

    private _SessionService: SessionService,
    private sanitizer: DomSanitizer,
    private helpAndSupportService: HelpAndSupportService,
    private _sessionService: SessionService,
    private _EncrypterService: EncrypterService,
    // private _PayoutService: PayoutService,
    private router: Router,
    private _masterService: MasterServiceService,
    private _BusinesSettingsService: BusinesSettingsService,
     private _ReportService: ReportService,
    private toastr: ToastrService,
    private activityLogsService: ActivityLogsService,
    private _userMgmtService : UserMgmtService) { }


  ngOnInit(): void {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    // console.log("this.decoded", this.decoded_token);
    this.sub_employer_check = this.decoded_token?.isEmployer;

    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // this.isemployee = this.decoded_token.employee_flag ? this.decoded_token.employee_flag.empflag : 'N';
    this.isemployee = window.location.pathname.includes('profile');
    // check for local or staging enviroment
    // if (environment.production == false) {
    //   this.isemployee = 'Y';
    // } else {
    //   this.isemployee = 'N';
    // }
    // end
    // this.default_dashboard_url = localStorage.getItem('default_url');
    // console.log(this.default_dashboard_url)

    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());

    this.notificationEmpId = this.tp_account_id;
    //userType

    if (session_obj_d.employer_type == 'Employee') {
      this.userType = 'Employee';
      // this.notificationEmpId = this.decoded_token.jsid;
      // let jsId = '';
      this.notificationEmpId = '';
      if (typeof (this.decoded_token.employee_flag) == 'undefined' || typeof (this.decoded_token.employee_flag) == undefined) {
        // jsId = this.decoded_token.js_id;
        this.notificationEmpId = this.decoded_token.js_id;
      }
      else {
        this.notificationEmpId = this.decoded_token.employee_flag.js_id;
      }
      // console.log(this.decoded_token);

    }
    else if (this.isemployee) {
      this.userType = 'Employee';
      // this.notificationEmpId = this.decoded_token.js_id;

      this.notificationEmpId = '';
      if (typeof (this.decoded_token.employee_flag) == 'undefined' || typeof (this.decoded_token.employee_flag) == undefined) {
        // jsId = this.decoded_token.js_id;
        this.notificationEmpId = this.decoded_token.js_id;
      }
      else {
        this.notificationEmpId = this.decoded_token.employee_flag.js_id;
      }

    }

    this.profilepath = session_obj_d.profile_photo_path;
    // console.log(this.profilepath);
    this.user_name = session_obj_d.name + ' [ ' + session_obj_d.email_id + ' ]';

    //console.log(session_obj_d.name.trim().split(' '));
    this.disp_image_txt = session_obj_d.name;
    if (this.disp_image_txt.trim().split(' ').length > 1 && this.disp_image_txt.split(' ')[1] != '') {
      this.disp_image_txt = this.disp_image_txt.trim().split(' ')[0].charAt(0).toUpperCase() + this.disp_image_txt.split(' ')[1].charAt(0).toUpperCase();

    } else {
      this.disp_image_txt = this.disp_image_txt.trim().split(' ')[0].charAt(0).toUpperCase();
    }

    //console.log(session_obj_d);
    // console.log(session_obj_d.name);
    // console.log(session_obj_d.email_id);

    if (this.profilepath == null || this.profilepath == '' || this.profilepath == undefined) {
      this.profilepath = '';
    }
    if (this.router.url == '/change-password' || this.router.url == '/login/registration-approved'
      || this.router.url == '/login/starting-balance' || this.router.url == '/login/onboarding') {
      this.show_toggle_buttions = false
    }

    //  console.log(this.router.url);
    this.get_branding_info_by_account();

    this.getSwitchEmployerProfileData();
    
    // notification api call inside getDashboardSetting api - if subuser but dashboard setting does not exist 
    // and if exists check notification setting => 
    if (this.decoded_token?.sub_userid != '' ) {
      this.getDashboardSettingData();
    }

    // Always call for employer and (employee that is not subuser)=>
    if (this.decoded_token?.isEmployer === '1' || 
      (this.decoded_token?.sub_userid == '' && this.decoded_token?.isEmployer === '0')) {
      this.Notification_Alert();
    }

  }

  toggleSidebar() {
    this.toggleEmitter.emit();
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngAfterViewInit() {
    //   $('ul.nav li a').click(function (e: any) {
    //     localStorage.setItem('activeTab', $(e.target).attr('id'));
    //   });

    //   let activeTab = localStorage.getItem('activeTab');
    //   //console.log(activeTab);

    //   if (activeTab != '') {
    //     $('#' + activeTab).parent('li').addClass('active');
    //   }
    //  console.log(activeTab);

    setTimeout(() => {
      $('#side-menu li a').click(function (e: any) {
        localStorage.setItem('activeTab', $(e.target).attr('id'));
      });
      let activeTab = localStorage.getItem('activeTab');
      // console.log(activeTab);
      if (activeTab != '' && activeTab != null) {
        if (activeTab != 'id_User/Shift_Specific_Settings')
          $('#' + activeTab).parent('li').addClass('active');
        else
          $('#' + 'id_User/Shift_Specific_Settings').parent('li').addClass('active');
      }
    }, 500);

  }
  onNotificationClick() {

    this.is_insufficient_fund = true;
  }
  PayoutSummary() {

    let reqq: any;
    if (this.month == '' && this.year == '') {
      reqq = {
        "customeraccountid": this.tp_account_id.toString(),
        "payouttype": "All",
        // "month": this.month.toString(),
        // "year": this.year.toString(),
        "productTypeId": this.product_type
      }
    }
    else {
      reqq = {
        "customeraccountid": this.tp_account_id.toString(),
        "payouttype": "All",
        "month": this.month.toString(),
        "year": this.year.toString(),
        "productTypeId": this.product_type
      }
    }
    // this._PayoutService
    //   .CustomerPayoutSummary(reqq)
    //   .subscribe((resData: any) => {
    //     if (resData.statusCode) {
    //       this.payout_data = this._EncrypterService.aesDecrypt(resData.commonData);
    //       if (JSON.parse(this.payout_data)[0]?.status == 'Low Balance') {
    //         this.is_insufficient_fund = true;

    //       } else {
    //         this.is_insufficient_fund = false;
    //       }
    //     }

    //   }, (error: any) => {
    //     console.error(error);
    //   });
  }

  // getTpAlerts

  Notification_Alert() {
    this.helpAndSupportService.getTpAlerts({
      "actionType": "5lH7eEtQfcdl85RBHkQHFT+npFs1/LNUD006wLPFaU0=",
      "emp_id": this._EncrypterService.aesEncrypt((this.notificationEmpId)?.toString()),
      "alertUserType": this._EncrypterService.aesEncrypt((this.userType)?.toString()),
      "productTypeId": this.product_type,
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.notification_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          // console.log(this.notification_data);
          // Filter for unread notifications
          this.unread_notifications = this.notification_data.filter(notification => notification.isviewed === "N");

        } else {
          // console.log(resData.message);
          this.unread_notifications = [];
          this.notification_data = [];
        }
      })

  }

  get_branding_info_by_account() {
    // console.log(localStorage.getItem('left_logo_path'));
    // console.log('test','again',this.tp_account_id);

    if (localStorage.getItem('left_logo_path')) {
      this.show_right_logo = localStorage.getItem('show_right_logo');
      this.left_logo_path = localStorage.getItem('left_logo_path');

      // console.log(localStorage.getItem('is_enable_branding'));
      if (localStorage.getItem('is_enable_branding') == 'Y') {
        this.show_right_logo = false;
      }
      else {
        this.show_right_logo = true;
      }

    }
    else {
      console.log('test', 'again', this.tp_account_id);
      this.helpAndSupportService.get_branding_details({
        "account_id": this.tp_account_id?.toString()
      })
        .subscribe((resData: any) => {
          console.log(resData);
          if (resData.status) {
            this.branding_data = resData.commonData
            // JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
            // console.log(this.branding_data);
            // console.log("vinod",this.branding_data[0].msgcd);
            if (this.branding_data[0].msgcd == '1') {
              if (this.branding_data[0].is_enable_branding == 'Y') {
                this.show_right_logo = false;
                this.left_logo_path = this.branding_data[0].logo;
              } else {
                this.show_right_logo = true;
                this.left_logo_path = 'https://www.tankhapay.com/images/logo-01.png';
              }

              // console.log( this.branding_data[0].logo);

            } else {
              this.show_right_logo = true;
              this.left_logo_path = 'https://www.tankhapay.com/images/logo-01.png';
            }

          } else {
            this.show_right_logo = false;
            this.left_logo_path = 'https://www.tankhapay.com/images/logo-01.png';
            this.branding_data = [];
          }

          localStorage.setItem('left_logo_path', this.left_logo_path);
          localStorage.setItem('show_right_logo', this.show_right_logo);
          localStorage.setItem('is_enable_branding', this.branding_data[0].is_enable_branding);
        });
    }



  }

  getProfileData() {

    this._masterService.employeeLoginByMob({
      "mobileNo": this._EncrypterService.aesEncrypt(this.decoded_token.mobile),
      "empSecretKey": "L0MIewmxbN+zB/1aThhVXEEVRInhqzZ6Br67OOWNaKBwDwXxYQ7yBmjrU0wJuIq9"
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let empData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        console.log(JSON.parse(localStorage.getItem('activeUser')))
        this._masterService.getEmployeeMenu({}).subscribe((resData: any) => {
          if (resData.statusCode) {
            let activeUserSession = JSON.parse(localStorage.getItem('activeUser'));
            let newSession = { ...activeUserSession, employeeMenuHtml: resData.commonData }
            localStorage.setItem('activeUser', JSON.stringify(newSession));
            const urlTree = this.router.createUrlTree(['/profile/employee-detail'], {
              queryParams: { data: this._EncrypterService.aesEncrypt(JSON.stringify({ emp_id: empData.emp_id, js_id: empData.js_id, ecStatus: empData.ecStatus })) }
            });
            const url = urlTree.toString();
            window.open(url, '_blank');
          } else {
            this.toastr.error('Something went wrong.Cannot open employee login.', "Ooops");
          }
        })

      } else {
        this.toastr.error(resData.message)
      }
    })

  }

  getMobileVersion() {
    let url = 'https://m.tankhapay.com/?id=';
    const date = this.getCurrentFormattedDate();
    url += this._EncrypterService.aesEncrypt(this.decoded_token.mobile + 'TP' + date);
    // const url = urlTree.toString();
    window.open(url, '_blank');
    // this.router.navigate(['/profile/mobile'])
  }

  getCurrentFormattedDate(): string {
    const now = new Date();

    // Extract components
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  getSwitchEmployerProfileData() {
    if (this.decoded_token?.isEmployer == '1') {
      let obj = {
        action: 'account_switch_details_allAddress',
        customeraccountid: this.tp_account_id.toString()
      }
      this._BusinesSettingsService.getSwitchEmployerProfileData(obj).subscribe({
        next: (resData: any) => {
          if (resData.statusCode == true) {
            this.employerProfiles = resData.commonData;
          } else {
            this.employerProfiles = '';
            this.toastr.error(resData.message, 'Oops!');
          }
        }, error: (e) => {
          this.employerProfiles = '';
          this.toastr.error(e.message, 'Oops!');
        }
      })
    }
  }

    // Activity Log
    insertActivityLog() { 
      this.activityLogsService?.insertActivityLog(this.decoded_token,'Logout', this.router?.url)
    }

    
   deleteCache() {
    // alert("Who called me ?")
    this._userMgmtService.deleteAllCacheKeysForAccount({
      'customerAccountId': this.tp_account_id.toString(),

    }).subscribe((resData: any) => {
      // if (resData.statusCode) {
      //   this.toastr.success(resData.message, 'Success');
      // } else {
      //   this.toastr.error(resData.message, 'Oops!');
      // }
    });

   }

   
  // Get Dashboard Setting for Sub_User - sidharth kaul dated. 19.06.2025
  getDashboardSettingData() {
      this.dashboard_settings = {};

      this._ReportService.GetDashboardSettingData({
        'action': 'GET_DASHBOARD_SETTINGS',
        'customeraccountid': this.tp_account_id?.toString(),
        'subuser_id': this.decoded_token?.sub_userid?.toString()

      }).subscribe({
        next: (resData: any) => {
          // console.log(resData);

          if (resData.statusCode) {
            this.dashboard_settings = resData.commonData;
            // console.log("API CALL dashboard_settings",this.dashboard_settings);
          } else {
            this.dashboard_settings = null;
            console.log("No setting found for this subUserId!");
          }

          // Notification_Alert logic here
          if (!this.dashboard_settings || this.dashboard_settings?.notifications) {
            this.Notification_Alert();
          }

        }
      })
  }


}
