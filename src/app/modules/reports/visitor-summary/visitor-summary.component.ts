import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
declare var $: any;
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { VisitorService } from '../../visitor/visitor.service';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-visitor-summary',
  templateUrl: './visitor-summary.component.html',
  styleUrls: ['./visitor-summary.component.css']
})
export class VisitorSummaryComponent {
  showSidebar: boolean = false;
  tp_account_id: any;
  filteredEmployees:any=[];
  data:any=[];
  decoded_token:any;
  currentDate: any;
  p: number = 1;
  currentDateString: any;
  visitor_list_data:any=[];
  employer_name: any = '';
  pageIndex = 0;
  pageSize = 10;
  Datepicker_Form:FormGroup;
  
  constructor(
    private _VisitorService: VisitorService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _ReportService:ReportService,
    private _formBuilder: FormBuilder,
  ) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
   }

  
  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
     this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.employer_name = this.decoded_token.name;
    // console.log(decoded_token)

    this.Datepicker_Form = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]],
      searchKeyword:['',[Validators.required]]
    });

    
    setTimeout(() => {
      this.Visitor_list();
    }, 1000);
  
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
      $('#FromDate2').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', firstDayOfMonth); // Set first day of current month as default
  
      $('#ToDate2').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', lastDayOfMonth); // Set last day of current month as default
    }, 500);
  }

  // search(key: any) {
  //   let invKey = key.target.value;
  //   this.p = 0;
  //   this.filteredEmployees = this.visitor_list_data.filter(function (element: any) {
      
  //     return element.visitor_name.toLowerCase().includes(invKey.toLowerCase())||
  //     element.visitor_last_name.toString().toLowerCase().includes(invKey.toLowerCase())||
  //     element.visitor_mobile.toString().toLowerCase().includes(invKey.toLowerCase())||
  //     element.assign_visiting_card.toString().toLowerCase().includes(invKey.toLowerCase())
      
  //   });
   
  // }

  Visitor_list(){
    this._ReportService.visitor_summary({
      "p_fromdt":$('#FromDate2').val(),
      "p_todt":$('#ToDate2').val(),
      "p_keyword": this.Datepicker_Form.get('searchKeyword')?.value,
      "p_pageindex": this.pageIndex?.toString(),
      "p_pagesize": this.pageSize?.toString(),
      "p_accountid": this.tp_account_id?.toString(),
      "p_ou_id":this.decoded_token.geo_location_id?.toString()
  
    }).subscribe((resData: any) => {
      // console.log(resData);
  
      if (resData.status) {
  
        this.visitor_list_data = resData.commonData;
        this.filteredEmployees=this.visitor_list_data;
      
      } else {
        this.visitor_list_data = [];
        this.filteredEmployees=[];
        this.toastr.error(resData.message)
      }
    });
  }
  
}
