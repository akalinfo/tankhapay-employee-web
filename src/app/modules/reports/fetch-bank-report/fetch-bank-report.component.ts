import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
declare var $: any;
@Component({
  selector: 'app-fetch-bank-report',
  templateUrl: './fetch-bank-report.component.html',
  styleUrls: ['./fetch-bank-report.component.css']
})
export class FetchBankReportComponent {
  showSidebar: boolean = true;
  month: any;
  fromdate: any = '';
  todate: any = '';
  days_count: any;
  includeEmployeeDetails: boolean = true;
  year: any;
  bankDetailsForm: FormGroup;
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
  yearsArray: any = [];
  product_type: any;
  tp_account_id: any = '';
  token: any = '';
  data: any = [];
  json_data: any = [];
  show_label: boolean = true;
  from_date: any = '';
  to_date: any = '';

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService) {
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    let currDate = new Date();
    currDate.setMonth(currDate.getMonth() + 1);
    currDate.setDate(currDate.getDate() - currDate.getDate())

    $('#FromDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: currDate
    })

    $('#ToDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: currDate
    })


    this.bankDetailsForm = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]]

    });

    this.bankDetailsForm.patchValue({
      fromdate: $('#FromDate').val(),
      ToDate: $('#ToDate').val()
    })

    // console.log(this.bankDetailsForm.value);
    this.FetchBank();
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

  FetchBank() {
    this.from_date = $('#FromDate').val();
    this.to_date = $('#ToDate').val();

    this._ReportService.FetchBankReportApi({
      "customerAccountId": this.tp_account_id.toString(),
      "FromDate": this.from_date,
      "ToDate": this.to_date,
      "individualSearch": "",
      "contractIdSearch": "",
      "GeoFenceId": this.token.geo_location_id 
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.data = resData.commonData;
     
      } else {
        this.data = [];
        this.show_label = false;
       // this.toastr.error(resData.message, 'Error');
      }
    });
  }

  exportToExcel(){
   
    this._ReportService.FetchBankReportApi({
      "customerAccountId": this.tp_account_id.toString(),
      "FromDate": this.from_date,
      "ToDate": this.to_date,
      "individualSearch": "",
      "contractIdSearch": "",
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
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
            'posting_department': this.data[idx].grossearning,
            'ifsccode': this.data[idx].grossdeduction

          }
          exportData.push(obj);
        }
      }

      else{
            
   for (let idx = 0; idx < this.data.length; idx++) {
    let obj = {
      'View': this.data[idx].View,
      'bankbatchcode': this.data[idx].bankbatchcode,
      'Emp_code': this.data[idx].emp_code,
      'Emp_name':this.data[idx].emp_name,
      'Fathername':this.data[idx].fathername,
      'bankaccountno':this.data[idx].bankaccountno,
      'posting_department':this.data[idx].posting_department,
      'ifsccode':this.data[idx].ifsccode,
      'static_col':this.data[idx].static_col,
      'salary':this.data[idx].salary,
      'salary_yearmonday':this.data[idx].salary_yearmonday,
      'downloaddatetime':this.data[idx].downloaddatetime
   
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
        downloadLink.download = `Disbursement-Report.xlsx`;
        downloadLink.click();
      }
    })
  }

}
