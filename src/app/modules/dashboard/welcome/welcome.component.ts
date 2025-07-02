import { Component, OnDestroy } from '@angular/core';
import decode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { LoginService } from '../../login/login.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {

  emp_name: any='';
  intial_pay_amount: any;
  showSidebar: boolean = false;
  tp_accountid: any;
  progressData: any;
  progressPercent: any = 0;
  show_bus_setting_page: string = '';
  constructor(
    private _sessionService: SessionService,
    private _loginService: LoginService,
    private toastr: ToastrService,
    private router: Router,
    private _masterService: MasterServiceService
  ) {
    // let assistant_status = localStorage.getItem('assistant_status');
    // if (assistant_status != null && assistant_status == 'Y') {
    //    this.showSidebar = true;
    // }
  }


  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    let token: any = decode(session_obj_d.token);

    localStorage.setItem('product_type', token['product_type']);
    if (localStorage.getItem('show_bus_setting_page') != null && localStorage.getItem('show_bus_setting_page') != undefined) {
      this.show_bus_setting_page = localStorage.getItem('show_bus_setting_page');
    } else {
      localStorage.setItem('show_bus_setting_page', token['show_bus_setting_page']);
    }




    // console.log(token);
    this.emp_name = token.name;
    this.intial_pay_amount = token.intial_pay_amount;
    this.tp_accountid = token.tp_account_id;
    this.get_dashboard_status();

  }

  dont_show_this_again() {
    this._masterService.show_bus_setting_page({
      'action': 'update_bus_setting_page',
      'account_id': this.tp_accountid
    }).subscribe({
      next: (resData: any) => {
        // console.log(resData);
        this.show_bus_setting_page = 'N';
        localStorage.setItem('show_bus_setting_page', 'N');

        localStorage.setItem('default_url', '/dashboard');
        this.router.navigate(['/dashboard']);

      }, error: (e: any) => {
        console.log('resData', e);
      }
    });

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_dashboard_status() {
    this._loginService.get_dashboard_status({
      'account_id': this.tp_accountid
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.progressData = resData.commonData?.onboarding_assistant;
            console.log(this.progressData);

            let entries = Object.entries(this.progressData);
            // console.log(entries);

            let t = 0;
            entries.forEach(([key, val]) => {
              if (val == 'Y') {
                // console.log(key,val);
                t++;
              }
            })

            this.progressPercent = (t * (100 / entries.length)).toFixed(2);

            if (t == entries.length) {
              localStorage.setItem('assistant_status', 'N');
              localStorage.setItem('default_url', '/dashboard');
              //this.router.navigate(['/dashboard']);

            }

            // console.log(this.progressPercent);
          } else {
            this.progressData = {};
            this.progressPercent = 0;
            this.toastr.error(resData.message, 'Oops!');
          }
        }, error: (e: any) => {
          this.progressPercent = 0;
          this.progressData = {};

        }
      })
  }

  routeToCompany(check_flag: any) {
    if (check_flag == 'N') {
      this.router.navigate(['/dashboard/company-details'], { state: { 'page': 'welcome' } });
    } else {
      this.router.navigate(['/business-settings'], { state: { 'page': 'welcome' } });
    }

  }
  routeToPayout() {
    this.router.navigate(['/business-settings/payout'], { state: { 'page': 'welcome' } });
  }
  routeToLeave() {
    this.router.navigate(['/leave-mgmt/leave-settings'], { state: { 'page': 'welcome' } });
  }
  routeToAddEmp() {
    this.router.navigate(['/employees'], { state: { 'page': 'welcome' } });
  }
  routeTosalarystructure() {
    this.router.navigate(['/dashboard/salary-stucture'], { state: { 'page': 'welcome' } });
  }
  routeTosalarycompliance() {
    this.router.navigate(['/dashboard/compliance'], { state: { 'page': 'welcome' } });
  }
  changePage(val: any) {
    if (val != '-1') {
      // Get the selected value from the dropdown
      const selectedValue = val;
      // Open the selected URL in a new tab
      window.open(selectedValue, '_blank');
      console.log('changePage', val);
    }
  }
}
