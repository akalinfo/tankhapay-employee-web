import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { environment } from 'src/environments/environment';
import { HelpAndSupportService } from '../help-and-support/help-and-support.service';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';
declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  showSidebar: boolean = true;
  decoded_token: any;
  module_ids: any = [];
  tp_accountid: any;
  flag_status:any;
  /* for staging
  // module_ids = ['2', '3', '4', '5', '12', '13', '14', '103'];
      2	  "Employees"
      3	  "Attendance"
      4	  "Payouts"
      5	  "Approvals"
      12	"Reports"
      13	"Accounts"
      14	"Business-settings"
      103	"Visitor Management"
  */
 /* for Produciton
 // module_ids_prod = ['2', '3', '4', '5', '12', '13', '14', '44'];
    2	"Employees"
    3	"Attendance"
    4	"Payouts"
    5	"Approvals"
    12	"Reports"
    13	"Accounts"
    14	"Business-settings"
    44	"Visitor Management"
  */
  is_show_menu = false;
  ticketsDetails: any = [];

  constructor(
    private _sessionService: SessionService,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private _masterService: MasterServiceService,
    private helpAndSupportService: HelpAndSupportService) { }
  
  // 01 nov 2024 chnage password hide sub user
  ngOnInit() {

    let session_obj = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    localStorage.setItem('product_type', this.decoded_token['product_type']);
    this.tp_accountid = this.decoded_token?.tp_account_id;
    //let is_passwordchange= decoded_token['is_passwordchange'];
    if (this.decoded_token['is_passwordchange'] == 'N' && this.decoded_token.isEmployer=='1') {
      this.router.navigate(['/change-password']);
    }

    if (localStorage.getItem('selected_date') == null) {
      let prev_month;
      let prev_year;
      const date = new Date();
      let currentMonth = date.getMonth();
      let currentYear = date.getFullYear();

      if (currentMonth === 0) {
        prev_month = 12;
        prev_year = currentYear - 1;
      } else {
        prev_month = currentMonth;
        prev_year = currentYear;
      }

      let prev_monthdate = new Date(prev_year, prev_month, 0).getDate() + '-' + prev_month + '-' + prev_year;
      localStorage.setItem('selected_date', prev_monthdate);

    }
    //  "Employees", "Attendance", "Payouts",	"Approvals", 	"Reports", 	"Accounts", 	"Business-settings", "Visitor Management"
    // order is important
    if (environment.production) {
      this.module_ids = ['93','2', '3', '4', '5', '12', '13', '14', '44'];
    } else {
      this.module_ids = ['162','2', '3', '4', '5', '12', '13', '14', '103'];
    }
    // show visitor for "DUMMY#34AABCU9603R1ZS-20231109 01:11:42" remove dummy user for visitor mgmt
    // "GS IT SOLUTIONS#06CUYPK5400J2Z8-20240509 11:05:31"
    this.is_show_menu = (
      this.decoded_token.tp_account_id == '4744'
      // || this.decoded_token.tp_account_id == '3088'
      || environment.production == false
    ) ? true : false;

    //this.Manage_tp_master();
    // this.decoded_token.tp_account_id == '4744' ? true : false;
    //this.Get_Tickets();
  }

  ngAfterViewInit() {
    let access_rights = JSON.parse(localStorage.getItem('access_rights'));

    // console.log(access_rights);

    //if (this.decoded_token['isEmployer'] == 0) {  //IF Sub-employer
      this.module_ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          this.renderer.setStyle(element, 'display', 'none');
        }
      });


      access_rights.map((m: any) => {
        let showModuleId = m.moduleid;

        const element = document.getElementById(showModuleId);
        if (element) {
          this.renderer.setStyle(element, 'display', 'block');
        }

      })
   // }

  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  Manage_tp_master(){

    this._masterService.manage_tp_master({
      'action': 'get_banner_status',
      'account_id': this.tp_accountid.toString()
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.flag_status = resData?.message.toString();

        if(this.flag_status=='Y'){
          $(document).ready(function(){
       setTimeout(function() {
           $('#mydiwali').modal('show');
       }, 500);
    });
    }
        } else {
          this.flag_status = '';
        }

      }, error: (e: any) => {
        console.log('resData', e);
      }
    });


  }

  Get_Tickets() {
    // const lastDate = this.formatDate(new Date(this.year, this.month, 0));
    // let month = this.month <= 9 ? '0' + this.month : this.month;

    let fromdate = '01/' + '01' + '/' + '2025';

    const currentDate = new Date();
    const day = currentDate.getDate() <= 9 ? '0' + currentDate.getDate() : currentDate.getDate();
    const month = currentDate.getMonth() + 1 <= 9 ? '0' + (currentDate.getMonth() + 1) : currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const current_date = `${day}/${month}/${year}`;

    this.ticketsDetails = [];

    this.helpAndSupportService.getAllQueriesTickets({
      // "fromDate": '01/' + month + '/' + this.year,
      'action': 'GetQueries',
      "fromDate": fromdate,
      "toDate": current_date,
      "ticketStatus": 'Open',
      "orgUnitId": this.decoded_token.geo_location_id?.toString(),
      "productTypeId": this.decoded_token['product_type'],
      "customerAccountId": this.tp_accountid?.toString()
    })
      .subscribe((resData: any) => {
        // console.log(resData);
        if (resData.statusCode) {
          // this.ticketsDetails = resData.commonData;
          this.ticketsDetails = resData.commonData.filter(el => el.read_flag == 'N');

        } else {
          // this.toastr.error('No record found', 'Oops!');
          this.ticketsDetails = [];
          // console.log(resData.message);
        }
      });

  }

  redirect_to_page(ticket_type:any) {
    // console.log(ticket_type.toLowerCase());
    let tkt_type = ticket_type.trim().toLowerCase();
    
    if (tkt_type == 'attendance') {
      console.log(tkt_type == 'attendance');
      this.router.navigate(['/reports/pre-attendance'])

    } else if (tkt_type == 'finance') {
      this.router.navigate(['/reports/liability-report'])

    } else if (tkt_type == 'payroll') {
      this.router.navigate(['/attendance'])

    }

  }


}
