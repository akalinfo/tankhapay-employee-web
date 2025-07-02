import { Component, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  showSidebar: boolean = false;
  decoded_token: any;
  module_ids: any = [];
  tp_accountid: any;
  flag_status:any;

  is_show_menu = false;

  constructor(
    private _sessionService: SessionService,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef,
    private _masterService: MasterServiceService
  ) { }
// 01 nov 2024 chnage password hide sub user
  ngOnInit() {

    let session_obj = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    localStorage.setItem('product_type', this.decoded_token['product_type']);
    this.tp_accountid = this.decoded_token?.tp_account_id;
    //  console.log(decoded_token);
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
    // if (environment.production) {
    //   this.module_ids = ['93','2', '3', '4', '5', '12', '13', '14', '44'];
    // } else {
    //   this.module_ids = ['162','2', '3', '4', '5', '12', '13', '14', '103'];
    // }
    // // show visitor for "DUMMY#34AABCU9603R1ZS-20231109 01:11:42" remove dummy user for visitor mgmt
    // // "GS IT SOLUTIONS#06CUYPK5400J2Z8-20240509 11:05:31"
    // this.is_show_menu = (
    //   this.decoded_token.tp_account_id == '4744'
    //   // || this.decoded_token.tp_account_id == '3088'
    //   || environment.production == false
    // ) ? true : false;

  }

  ngAfterViewInit() {
    // let access_rights = JSON.parse(localStorage.getItem('access_rights'));

    // console.log(access_rights);

    //if (this.decoded_token['isEmployer'] == 0) {  //IF Sub-employer
      // this.module_ids.forEach(id => {
      //   const element = document.getElementById(id);
      //   if (element) {
      //     this.renderer.setStyle(element, 'display', 'none');
      //   }
      // });


      // access_rights.map((m: any) => {
      //   let showModuleId = m.moduleid;

      //   const element = document.getElementById(showModuleId);
      //   if (element) {
      //     this.renderer.setStyle(element, 'display', 'block');
      //   }

      // })


  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  routeToTND(){
    window.open(`${environment.PMS_TND_ATL_URL}tnd/feedback`, '_blank');
  }
  
}
