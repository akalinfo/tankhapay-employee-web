import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import decode from 'jwt-decode';
import * as XLSX from 'xlsx';
declare var $: any;
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { FilterField } from '../common-filter/filter.model';

@Component({
  selector: 'app-esi-summary',
  templateUrl: './esi-summary.component.html',
  styleUrls: ['./esi-summary.component.css']
})
export class EsiSummaryComponent {
  currentDate: any;
  currentDateString: any;
  apiSuccess: boolean = false;
  payout_date: any;
  cur_payout_day: string = '';
  employer_profile: any = [];
  employer_name: any = '';
  showSidebar: boolean = true;
  product_type: any;
  data: any = [];
  month: any;
  includeEmployeeDetails: boolean = false;
  days_count: any;
  p: number = 0;
  invKey:any;
  filteredEmployees: any=[];
  ESIC_Challan:any=[];
  year: any;
  message:any;
  selected_date: any;
  monthsArray: any = [
    {
      'id': '1',
      'month': 'January',
    },
    {
      'id': '2',
      'month': 'February',
    },
    {
      'id': '3',
      'month': 'March',
    },
    {
      'id': '4',
      'month': 'April',
    },
    {
      'id': '5',
      'month': 'May',
    },
    {
      'id': '6',
      'month': 'June',
    },
    {
      'id': '7',
      'month': 'July',
    },
    {
      'id': '8',
      'month': 'August',
    },
    {
      'id': '9',
      'month': 'September',
    },
    {
      'id': '10',
      'month': 'October',
    },
    {
      'id': '11',
      'month': 'November',
    },
    {
      'id': '12',
      'month': 'December',
    }
  ];
  showfields: any = {
    ncp_days: false,
    member_name:false,
    S_No: false,
   gross_esi_income: false,
  //  eps_contri_remitted: false,
   lastworkingday: false,


 }; 

 fieldarray: any = [
   { name: 'S.No', value: 'S_No' },
   { name: 'IP Name', value: 'member_name' },
   { name: 'No Of Days for Which Wages Paid Payable During The Month', value: 'ncp_days' },
   { name: 'Total Monthly Wages', value: 'gross_esi_income' },
  //  { name: 'eps contri remitted', value: 'eps_contri_remitted' },
   { name: 'Last Working Day', value: 'lastworkingday' }
 ];
  yearsArray: any = [];
  show_label: boolean = true;
  tp_account_id: any = '';
  token: any = '';
  isSideBar :boolean = false;
  filters: FilterField[] =[];

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService:ReportService,
    private _alertservice: AlertService) {
      this.currentDate = new Date();
      this.currentDateString = this.currentDate.toString().slice(0, -30);
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
      this.token = decode(session_obj_d.token);
      this.tp_account_id = this.token.tp_account_id;
      // this.product_type = token.product_type;
      this.product_type = localStorage.getItem('product_type');
      const date = new Date();
      let currentMonth = date.getMonth();
      let currentYear = date.getFullYear();
     this.employer_name=this.token.name;
      for (let i = 2021; i <= currentYear + 1; i++) {
        this.yearsArray.push(i);
      };
  
      this.selected_date = localStorage.getItem('selected_date');
      this.days_count = this.selected_date.split('-')[0];
  
      this.month = this.selected_date.split('-')[1];
      this.year = this.selected_date.split('-')[2];
    
      var checkboxes = document.querySelectorAll(
        '.dropdown-item input[type="checkbox"]'
      );
      checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('click', function (event) {
          event.stopPropagation(); // Prevent click event from propagating to parent elements
        });
      });

      this.Displayesic();

    }

    toggleShowFields() {
      if (!this.includeEmployeeDetails) {
          // If "Include Employee Details" checkbox is checked, check all the showfields checkboxes
          Object.keys(this.showfields).forEach(key => this.showfields[key] = true);
      } else {
          // If "Include Employee Details" checkbox is unchecked, uncheck all the showfields checkboxes
          Object.keys(this.showfields).forEach(key => this.showfields[key] = false);
      }
  }
  
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  search() {
    let search_term = this.invKey.toLowerCase();
   this.p = 0;
   this.filteredEmployees = this.data.filter(function (element: any) {
     return (element.emp_code.toString()?.toLowerCase().includes(search_term) ||
     element?.member_name?.toLowerCase()?.includes(search_term) ||
     element?.orgempcode?.toLowerCase()?.includes(search_term) ||
     element?.tpcode?.toLowerCase()?.includes(search_term) 
     )
   });
 }

  applyFilters(filters: any) {
    this.month = filters.month;
    this.year = filters.year;
    this.Displayesic();
  }

  hideshowfields(e: any, data: any) {
    if (e.target.checked) {
      this.showfields[data.value] = true;
    } else {
      this.showfields[data.value] = false;
    }
  }

  fieldshowdata(name: any) {
    return this.showfields[name] ? 'checked' : null;
  }
  changeMonth(e: any) {
    this.month = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
  }

  changeYear(e: any) {
    this.year = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);
  }

  Displayesic(){
    this._ReportService.DisplayesicecrreportMonthWiseApi({
      "year": this.year,
      "month":this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "ReportType":"ND",
      "GeoFenceId": this.token.geo_location_id 
    }).subscribe((resData: any) => {
     console.log(resData);
      if (resData.statusCode) {
        this.data =resData.commonData; 
        this.filteredEmployees=this.data;
        this.apiSuccess = true;
        this.invKey='';
       // this.toastr.success(resData.message, 'Success');
      } else {
        this.apiSuccess = false;
        this.filteredEmployees = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  confirmation(){
    this.message = window.confirm('Are you sure you want to process Report?.');
    console.log(this.message);
    
    if(this.message){
      this.DownloadCompilance_Report();
    }
    else{
      window.close();
    }
  }
  DownloadCompilance_Report(){
  // alert('Are you sure you want to process Report?.');
//   console.log({
//     "year": this.year,
//      "month":this.month,
//      "customerAccountId": this.tp_account_id.toString(),
//      "userId":this.tp_account_id.toString(),
//      "productTypeId":this.product_type,
//      "compliancesFlag":"EPF",
//      "GeoFenceId": this.token.geo_location_id
//  });
  this._ReportService.DownloadCompilanceReport({
      "year": this.year,
      "month":this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "userId":this.tp_account_id.toString(),
      "productTypeId":this.product_type,
      "compliancesFlag":"ESIC",
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.ESIC_Challan = resData.commonData; 
            // console.log(this.ESIC_Challan);
            let exportData = [];
            
            let days = {};
            for (let i = 0; i < resData.commonData.length; i++) {
              let head = resData.commonData[i].w_date_d
              // + resData.commonData[i].dayname;
              days = {
                ...days, [head]: ''
              }
      }
   for (let idx = 0; idx < this.ESIC_Challan.length; idx++) {
    let obj = {
      
      'Emp Code': this.ESIC_Challan[idx].emp_code,
      'IP Number':this.ESIC_Challan[idx].esinumber,
      'IP Name':this.ESIC_Challan[idx].member_name,
      'No Of Days For Which Wages Paid Payable During The Month':this.ESIC_Challan[idx].ncp_days,
      'Total Monthly Wages':this.ESIC_Challan[idx].gross_esi_income,
      'Reason Code for Zero workings days(numeric only; provide 0 for all other reasons- Click on the link for reference)':'',
      'Last Working Day':this.ESIC_Challan[idx].lastworkingday,
      'IP Contribution':this.ESIC_Challan[idx].esic_amt,
      // 'UAN':this.ESIC_Challan[idx].uan,
      // 'MEMEBER NAME':this.ESIC_Challan[idx].member_name,
      // 'GROSS WAGES':this.ESIC_Challan[idx].gross_wages,
      // 'EPF WAGES':this.ESIC_Challan[idx].epf_wages,
      // 'EPF CONTRI REMITTED':this.ESIC_Challan[idx].epf_contri_remitted,
      // 'EPS CONTRI REMITTED':this.ESIC_Challan[idx].eps_contri_remitted,
      // 'EPF EPS CONTRI REMITTED':this.ESIC_Challan[idx].epf_eps_diff_remitted,
      // 'NCP DAYS':this.ESIC_Challan[idx].ncp_days,
      // 'REFUND OF ADVANCES':this.ESIC_Challan[idx].refund_of_advances,
    }
    exportData.push(obj);
  
      }
        console.log(exportData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = 'ESI_Summary_Report_'+this.employer_name.replaceAll(' ', '_').trim()  + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
        this.Displayesic();
      }
    })
  }

  exportToExcel(){
   
   /* this._ReportService.DisplayesicecrreportMonthWiseApi({
      "year": this.year,
      "month":this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "ReportType":"ND",
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = resData.commonData; 
            // console.log(this.data);
            let exportData = [];
            let days = {};
            for (let i = 0; i < resData.commonData.length; i++) {
              let head = resData.commonData[i].w_date_d;
              days = {
                ...days, [head]: ''
              }
      } */

      let exportData = [];
      let days = {};
      this.data = this.filteredEmployees;
      for (let i = 0; i < this.filteredEmployees.length; i++) {
        let head = this.filteredEmployees[i].w_date_d;
        days = {
          ...days, [head]: ''
        }
      }
      if(!this.includeEmployeeDetails){
        for (let idx = 0; idx < this.data.length; idx++) {
        const orgEmpCode = this.data[idx]?.orgempcode;
        const tpcode = this.data[idx]?.tpcode;
        const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
          let obj = {
            // 'Employee': this.data[idx].emp_name,
            'TP / Org Emp Code': tpOrgEmpCode,
            'IP Number': this.data[idx].esinumber,
            'IP Contribution': this.data[idx].esic_amt,
            // 'Ncp_days': this.data[idx].ncp_days

          }
          let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
          exportFields.forEach(field => {
                            obj[field.name] = this.data[idx][field.value];
                        });

          exportData.push(obj);
        }
      }
      else{    
        for (let idx = 0; idx < this.data.length; idx++) {
        const orgEmpCode = this.data[idx]?.orgempcode;
        const tpcode = this.data[idx]?.tpcode;
        const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
        let obj = {
          
          'TP / Org Emp Code': tpOrgEmpCode,
          'IP Number':this.data[idx].esinumber,
          'IP Name':this.data[idx].member_name,
          'No Of Days For Which Wages Paid Payable During The Month':this.data[idx].ncp_days,
          'Total Monthly Wages':this.data[idx].gross_esi_income,
          'Last Working Day':this.data[idx].lastworkingday,
          'IP Contribution':this.data[idx].esic_amt,


        }
        exportData.push(obj);
        }
      }
        // console.log(exportData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = 'ESI_Summary_Report_'+this.employer_name.replaceAll(' ', '_').trim()  + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
    //   }
    // })
  }

}
