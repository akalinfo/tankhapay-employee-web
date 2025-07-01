import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import decode from 'jwt-decode';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-lwf-report',
  templateUrl: './lwf-report.component.html',
  styleUrls: ['./lwf-report.component.css']
})
export class LwfReportComponent {
  showSidebar: boolean = true;
  month: any;
  includeEmployeeDetails: boolean = true;
  days_count: any;
  addRemoveHide: boolean = false;
  year: any;
  selected_date: any;
  bankDetailsForm: FormGroup;
  yearsArray: any = [];
  data:any =[];
  product_type: any;
  tp_account_id: any = '';
  token: any = '';
  selectedReport: string = 'summary';
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
  show_label: boolean = true;
  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService:ReportService,
    private _alertservice: AlertService) {
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
  
      for (let i = 2022; i <= currentYear + 1; i++) {
        this.yearsArray.push(i);
  
      };

      this.bankDetailsForm = this._formBuilder.group({
        lwfstate: ['', [Validators.required]]
  
      });
  
    this.selected_date = localStorage.getItem('selected_date');
    this.days_count = this.selected_date.split('-')[0];
    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];

    this.Displaylwfecrreport();
    

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
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

  Hideshow_Emp(val:any){
    if(val==1){
      this.addRemoveHide=true;
    }
    else{
      this.addRemoveHide=false;
    }
  }
  Displaylwfecrreport(){
    this._ReportService.DisplaylwfecrreportMonthWiseApi({
      "year": this.year,
      "month":this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "lwfstate":"7",
      "GeoFenceId": this.token.geo_location_id 
    }).subscribe((resData: any) => {
      console.log(resData);
      if (resData.statusCode) {
        this.data =resData.commonData; 
        //this.toastr.success(resData.message, 'Success');
      } else {
        this.data = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  exportToExcel(){
    this._ReportService.DisplaylwfecrreportMonthWiseApi({
      "year": this.year,
      "month":this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "lwfstate":"7",
      "GeoFenceId": this.token.geo_location_id 
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
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

      if(!this.includeEmployeeDetails){
     
       for (let idx = 0; idx < this.data.length; idx++) {
          let obj = {
            'Employee': this.data[idx].emp_name,
            'Emp Code': this.data[idx].emp_code,
            'Gross-salary': this.data[idx].grossearning,
            'grossdeduction': this.data[idx].grossdeduction,
            'netpay': this.data[idx].netpay,
            'LWF Employee':this.data[idx].lwf_employee,
            'LWF Employer':this.data[idx].lwf_employer

          }
          exportData.push(obj);
        }
      }

      else{
            
   for (let idx = 0; idx < this.data.length; idx++) {
    let obj = {
      'Emp_code': this.data[idx].emp_code,
      'Emp_name':this.data[idx].emp_name,
      'Netpay':this.data[idx].netpay,
      'incrementarear':this.data[idx].incrementarear,
      'incrementarear_basic':this.data[idx].incrementarear_basic,
      'incrementarear_gross':this.data[idx].incrementarear_gross,
      'salaryindaysopted':this.data[idx].salaryindaysopted,
      'salarydays':this.data[idx].salarydays,
      'Month': this.data[idx].mon,
      'is_paused':this.data[idx].is_paused,
      'Fathername':this.data[idx].fathername,
      'Designation':this.data[idx].designation,
      'Department':this.data[idx].department,
      'posting_department':this.data[idx].department,
      'Subunit':this.data[idx].subunit,
      'dateofjoining':this.data[idx].dateofjoining,
      'dateofbirth':this.data[idx].dateofbirth,
      'esinumber':this.data[idx].esinumber,
      'post_offered':this.data[idx].post_offered,
      'pan_number':this.data[idx].pan_number,
      'uannumber':this.data[idx].uannumber,
      'email':this.data[idx].email,
      'dateofleaving':this.data[idx].dateofleaving,
      'arrear_days':this.data[idx].arrear_days,
      'loss_off_pay':this.data[idx].loss_off_pay,
      'total_paid_days':this.data[idx].total_paid_days,
      'ratebasic':this.data[idx].ratebasic,
      'ratehra':this.data[idx].ratehra,
      'rateconv':this.data[idx].rateconv,
      'ratemedical':this.data[idx].ratemedical,
      'contractcategory':this.data[idx].contractcategory,
      'ratespecialallowance':this.data[idx].ratespecialallowance,
      'FixedAllowancesTotal':this.data[idx].FixedAllowancesTotal,
      'fixedallowancestotalrate':this.data[idx].fixedallowancestotalrate,
      'basic':this.data[idx].basic,
      'hra':this.data[idx].hra,
      'conv':this.data[idx].conv,
      'medical':this.data[idx].medical,
      'specialallowance':this.data[idx].specialallowance,
      'arr_basic':this.data[idx].arr_basic,
      'arr_hra':this.data[idx].arr_hra,
      'arr_conv':this.data[idx].arr_conv,
      'arr_medical':this.data[idx].arr_medical,
      'arr_specialallowance':this.data[idx].arr_specialallowance,
      'incentive':this.data[idx].incentive,
      'refund':this.data[idx].refund,
      'monthly_bonus':this.data[idx].monthly_bonus,
      'grossearning':this.data[idx].grossearning,
      'epf':this.data[idx].epf,
      'vpf': this.data[idx].vpf,
      'esi':this.data[idx].esi,
      'tds':this.data[idx].tds,
      'lwf':this.data[idx].lwf,
      'insurance':this.data[idx].insurance,
      'mobile':this.data[idx].mobile,
      'other':this.data[idx].other,
      'loan':this.data[idx].loan,
      'advance':this.data[idx].advance,
      'grossdeduction':this.data[idx].grossdeduction,
      'netpay':this.data[idx].netpay,
      'ac_1':this.data[idx].ac_1,
      'ac_10':this.data[idx].ac_10,
      'ac_2':this.data[idx].ac_2,
      'ac21':this.data[idx].ac21,
      'employer_esi_contr':this.data[idx].employer_esi_contr,
      'lwf_employer':this.data[idx].lwf_employer,
      'salarystatus':this.data[idx].salarystatus,
      'arearaddedmonths':this.data[idx].arearaddedmonths,
      'totalarear':this.data[idx].totalarear,
      'voucher_amount':this.data[idx].voucher_amount,
      'ews':this.data[idx].ews,
      'gratuity':this.data[idx].gratuity,
      'bonus':this.data[idx].bonus,
      'dateofrelieveing':this.data[idx].dateofrelieveing,
      'employeenps':this.data[idx].employeenps,
      'otherledgerarears': this.data[idx].otherledgerarears,
      'otherledgerdeductions': this.data[idx].otherledgerdeductions,
      'othervariables': this.data[idx].othervariables,
      'otherledgerarearwithoutesi': this.data[idx].otherledgerarearwithoutesi,
      'otherbonuswithesi': this.data[idx].otherbonuswithesi,
      'insurancetype': this.data[idx].insurancetype,
  
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
        downloadLink.download = `LWF-Report.xlsx`;
        downloadLink.click();
      }
    })
  }

}
