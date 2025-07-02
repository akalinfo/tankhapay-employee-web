import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { SessionService } from 'src/app/shared/services/session.service';
declare var $: any;
import * as XLSX from 'xlsx';
import { VisitorService } from '../../visitor/visitor.service';
import { ReportService } from '../report.service';
@Component({
  selector: 'app-card-wise-visitor',
  templateUrl: './card-wise-visitor.component.html',
  styleUrls: ['./card-wise-visitor.component.css']
})
export class CardWiseVisitorComponent {
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
  Datepicker_Form:FormGroup;
  subscription: Subscription;
  token: any = '';
  idx:any;
  totalPages = 0;
  pageIndex = 0;
  pageSize = 10;
  pageSizes = [10, 30,50,70,90,100,120,150];
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
    // console.log(decoded_token);

    this.Datepicker_Form = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]],
      searchKeyword:['',[Validators.required]]
    });

    setTimeout(() => {
      this.Visitor_list();
    }, 1000);
  
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

  search(key: any) {
    let invKey = key.target.value;
    this.p = 0;
    this.filteredEmployees = this.visitor_list_data.filter(function (element: any) {
      
      return element.visitor_name.toLowerCase().includes(invKey.toLowerCase())||
      element.visitor_last_name.toString().toLowerCase().includes(invKey.toLowerCase())||
      element.visitor_mobile.toString().toLowerCase().includes(invKey.toLowerCase())||
      element.assign_visiting_card.toString().toLowerCase().includes(invKey.toLowerCase())
      
    });
   
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  nextPage() {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.Visitor_list();
    }
  }

  previousPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.Visitor_list();
    }
  }
  enlargeImage(imageUrl: string) {
    // Create a new window with the enlarged image
    window.open(imageUrl, '_blank');
}
  Visitor_list(){
    this._ReportService.visitor_card_details({
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
  
  exportToExcel() {
    this._ReportService.visitor_card_details({
      "p_fromdt":$('#FromDate2').val(),
      "p_todt":$('#ToDate2').val(),
      "p_keyword": this.Datepicker_Form.get('searchKeyword')?.value,
      "p_pageindex": this.pageIndex?.toString(),
      "p_pagesize": this.pageSize?.toString(),
      "p_accountid": this.tp_account_id?.toString()
    }).subscribe((resData: any) => {
      if (resData.status) {
        this.data = resData.commonData;
        // console.log(this.data);
        let exportData = [];
        let days = {};
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          // + resData.commonData[i].dayname;
          days = {
            ...days, [head]: ''
          }
        }

        for (let idx = 0; idx < this.data.length; idx++) {
          let obj = {
            'Card Number': this.data[idx].assign_visiting_card,
            'Registration Date':(this.data[idx].visit_date_check_in_time),
            'Name': this.data[idx].visitor_name+" "+this.data[idx].visitor_last_name,
            'Mobile': this.data[idx].visitor_mobile,
            'Email': this.data[idx].visitor_email,
           
            'Last Check In Time':this.data[idx].check_in_time,
            'Last Check Out Time':this.data[idx].check_out_time,
         
            'E Pass Number': this.data[idx].e_pass
          }
          exportData.push(obj);
        }

        // console.log(exportData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = 'Card_Wise_visitor_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
      }
    })
  }

  formatDate(dateString: string): string {
    // Parse the input date string
    const date = new Date(dateString);

    // Extract day, month, and year
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year

    // Return formatted date string in dd/mm/yy format
    return `${day}/${month}/${year}`;
}
}

  


