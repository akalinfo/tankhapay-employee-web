import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { LoginService } from '../../login/login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { SidebarComponent } from 'src/app/components/core/sidebar/sidebar.component';
import { EmployeeService } from '../../employee/employee.service';
import { Router } from '@angular/router';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';

@Component({
  selector: 'app-summary-dashboard-new',
  templateUrl: './summary-dashboard-new.component.html',
  styleUrls: ['./summary-dashboard-new.component.css']
})
export class SummaryDashboardNewComponent {

  showSidebar: boolean = true;
    tp_account_id: any;
    decoded_token: any;
    product_type: any;
    geo_location_id: any;
    ouIds: any;
    get_employee_list_data: any = [];
    get_employee_attendance_data: any = [];
    get_employee_birthday_data: any = [];
    get_employee_leave_data: any = [];
    get_employee_holidays_data: any = [];
    @ViewChild(SidebarComponent, { static: true }) sidebarComponent!: any;
    @ViewChild('sideMenu', { static: true }) sideMenuElement!: ElementRef;
    emp_joining_pending_cnt: any = [];
    state_master_data: any = [];
    sel_state: string ;
    show_recruitment: boolean = false;

    constructor(
      private _loginService: LoginService,
      private _sessionService: SessionService,
      private renderer: Renderer2,
      private router: Router,
      private _employeeService: EmployeeService,
      private _masterService: MasterServiceService,
    ) { }

    ngOnInit() {
      let session_obj = this._sessionService.get_user_session();
      let token = JSON.parse(session_obj).token;
      this.decoded_token = jwtDecode(token);
      this.tp_account_id = this.decoded_token.tp_account_id;
      this.product_type = localStorage.getItem('product_type');
      this.geo_location_id = this.decoded_token.geo_location_id;
      this.ouIds = this.decoded_token.ouIds;
      this.sel_state= this.decoded_token.state.toUpperCase();

      this.show_recruitment = !this._masterService.checkAccessRights('/recruit') ? false : true;

      this.getStateMaster();
      this.get_employee_list();
      this.get_employee_attendance();
      this.get_employee_birthday();
      this.get_employee_leave();
      this.get_employee_holidays();
      // this.employer_details();
    }
    // ngAfterViewInit(): void {
    //   this.hideSideMenu();
    // }

    hideSideMenu(): void {
      const sideMenu = this.sidebarComponent.elementRef.nativeElement.querySelector('.navbar-default.sidebar');
      if (sideMenu) {
        this.renderer.setStyle(sideMenu, 'display', 'none');
      }
    }

    toggle() {
      this.showSidebar = !this.showSidebar;
    }

    get_employee_list() {
      this._loginService.get_tpay_dashboard_data({
        "action": "get_employee_list",
        "accountId": this.tp_account_id,
        "geo_location_id": this.geo_location_id,
        "ouIds":this.ouIds
      })
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.get_employee_list_data = resData.commonData[0];
            } else {
              this.get_employee_list_data = [];
            }
          }, error: (e) => {
            this.get_employee_list_data = [];
            console.log(e);
          }
        })
    }
    get_employee_attendance() {
      this._loginService.get_tpay_dashboard_data({
        "action": "get_employee_attendance",
        "accountId": this.tp_account_id,
        "geo_location_id": this.geo_location_id,
        "ouIds":this.ouIds
      })
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.get_employee_attendance_data = resData.commonData[0];
            } else {
              this.get_employee_attendance_data = [];
            }

          }, error: (e) => {
            this.get_employee_attendance_data = [];
            console.log(e);
          }
        })
    }
    get_employee_birthday() {
      this._loginService.get_tpay_dashboard_data({
        "action": "get_employee_birthday",
        "accountId": this.tp_account_id,
        "geo_location_id": this.geo_location_id,
        "ouIds":this.ouIds
      })
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.get_employee_birthday_data = resData.commonData;
            } else {
              this.get_employee_birthday_data = [];
            }
          }, error: (e) => {
            this.get_employee_birthday_data = [];
            console.log(e);
          }
        })
    }
    get_employee_leave() {
      this._loginService.get_tpay_dashboard_data({
        "action": "get_employee_leave",
        "accountId": this.tp_account_id,
        "geo_location_id": this.geo_location_id,
        "ouIds":this.ouIds
      })
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.get_employee_leave_data = resData.commonData;
            } else {
              this.get_employee_leave_data = [];
            }

          }, error: (e) => {
            this.get_employee_leave_data = [];
            console.log(e);
          }
        })
    }
    get_employee_holidays() {
      this._loginService.get_tpay_dashboard_data({
        "action": "get_employee_holidays",
        "accountId": this.tp_account_id,
        "geo_location_id": this.geo_location_id,
        "ouIds":this.ouIds,
        "state_name": this.sel_state
      })
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.get_employee_holidays_data = resData.commonData;
            } else {
              this.get_employee_holidays_data = [];
            }
          }, error: (e) => {
            this.get_employee_holidays_data = [];
            console.log(e);
          }
        })
    }
    changeState(e: any) {
      // let val = e.target.value;
      this.sel_state = e.target.value;
      this. get_employee_holidays();
    }
    getStateMaster() {
      this._employeeService.getAll_state({})
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              // Filter out records where the state contains "Zone"
              this.state_master_data = resData.commonData.filter(
                (state: any) => !state.state.toLowerCase().includes("zone")
              );
            } else {
              this.state_master_data = [];
            }
          },
          error: (e) => {
            this.state_master_data = [];
          }
        });
    }

    get_holiday_date(dt: any) {
      let split_dt = dt.split('-');
      return split_dt[2];
    }
    get_holiday_month(dt: any) {
      let split_dt = dt.split('-');
      let date = new Date(split_dt[0], split_dt[1] - 1, split_dt[2]);
      // console.log(date);
      return date.toLocaleDateString('default', { month: 'short' });

    }

    // employer_details() {

    //   this._employeeService
    //     .employer_details({
    //       customeraccountid: this.tp_account_id.toString(),
    //       productTypeId: this.product_type,
    //       GeoFenceId: this.decoded_token.geo_location_id,
    //       ouIds:this.ouIds
    //     })
    //     .subscribe((resData: any) => {
    //       if (resData.statusCode) {
    //         let employee_data = resData.commonData;
    //         //this._EncrypterService.aesDecrypt(resData.commonData);
    //         this.emp_joining_pending_cnt = 0;

    //         employee_data.map((el) => {
    //           // console.log(el.joiningstatus);
    //           if (el.joiningstatus.toLowerCase().includes('app link sent') ||
    //             el.joiningstatus.toLowerCase().includes('onboarding pending') ||
    //             el.joiningstatus.toLowerCase().includes('set up salary')) {
    //             this.emp_joining_pending_cnt++;
    //           }

    //         })
    //       }
    //     });
    // }

    routeToEmployee(status:any) {
      this.router.navigate(['/dashboard/employee-details'], {state: {'status': status }});
      // localStorage.setItem('emp_status_filter', status);
    }

    routeToAttReport(status:any) {
      this.router.navigate(['/dashboard/att-report'], {state: {'status': status }});
    }


}
