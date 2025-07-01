import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import decode from 'jwt-decode';
import * as XLSX from 'xlsx';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
import { FilterField } from '../common-filter/filter.model';

@Component({
  selector: 'app-esi-ecr',
  templateUrl: './esi-ecr.component.html',
  styleUrls: ['./esi-ecr.component.css']
})
export class ESIECRComponent {
  currentDate: any;
  currentDateString: any;
  payout_date: any;
  cur_payout_day: string = '';
  employer_profile: any = [];
  employer_name: any = '';
  showSidebar: boolean = true;
  product_type: any;
  data: any = [];
  p: number = 0;
  invKey:any;
  filteredEmployees: any=[];
  month: any;
  includeEmployeeDetails: boolean = false;
  days_count: any;
  year: any;
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
  showfields: any;

 fieldarray: any = [
   { name: 'S.No.', value: 'S_No' },
   { name: 'IP Name', value: 'member_name' },
   { name: 'No Of Days For Which Wages Paid Payable During The Month', value: 'ncp_days' },
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
  selectedDynmicColumnValues: any[] = [];


  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService:ReportService,
    private _alertservice: AlertService ) {
      this.currentDate = new Date();
      this.currentDateString = this.currentDate.toString().slice(0, -30);
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
      this.token = decode(session_obj_d.token);
      this.tp_account_id = this.token.tp_account_id;
      this.employer_name=this.token.name;
      // this.product_type = token.product_type;
      this.product_type = localStorage.getItem('product_type');
      const date = new Date();
      let currentMonth = date.getMonth();
      let currentYear = date.getFullYear();

      this.intialize_show_fields();

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
      this.getColumnValues();

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

  hideshowfields(e: any, field: any) {
    this.showfields[field.value] = e.target.checked;
    if (e.target.checked) {
      // Add field value if checked
      if (!this.selectedDynmicColumnValues.includes(field.value)) {
        this.selectedDynmicColumnValues.push(field.value);
      }
    } else {
      // Remove field value if unchecked
      this.selectedDynmicColumnValues = this.selectedDynmicColumnValues.filter(val => val !== field.value);
    }
    // console.log(this.selectedDynmicColumnValues, 'this.selectedDynmicColumnValues')
  }

  toggleShowFields() {
    if (!this.includeEmployeeDetails) {
      // If "Include Employee Details" checkbox is checked, check all the showfields checkboxes
      Object.keys(this.showfields).forEach(key => this.showfields[key] = true);
    } else {
      // If "Include Employee Details" checkbox is unchecked, uncheck all the showfields checkboxes
      Object.keys(this.showfields).forEach(key => this.showfields[key] = false);
    }

    this.selectedDynmicColumnValues = [];

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
      "ReportType":"D",
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
     // console.log(resData);
      if (resData.statusCode) {
        this.data =resData.commonData;
        this.filteredEmployees=this.data;
        this.invKey='';
       // this.toastr.success(resData.message, 'Success');
      } else {
        this.filteredEmployees = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  exportToExcel(){
    /*this._ReportService.DisplayesicecrreportMonthWiseApi({
      "year": this.year,
      "month":this.month,
      "customerAccountId": this.tp_account_id.toString(),
      "ReportType":"D",
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
      } */

      let exportData = [];
      let days = {};
      for (let i = 0; i < this.filteredEmployees.length; i++) {
        let head = this.filteredEmployees[i].w_date_d
        // + resData.commonData[i].dayname;
        days = {
          ...days, [head]: ''
        }
      }
      this.data = this.filteredEmployees;
      if(!this.includeEmployeeDetails){

       for (let idx = 0; idx < this.data.length; idx++) {
        const orgEmpCode = this.data[idx]?.orgempcode;
        const tpcode = this.data[idx]?.tpcode;
        const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
          let obj = {
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
        downloadLink.download = 'ESI_ECR_Report_'+this.employer_name.replaceAll(' ', '_').trim()  + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
    //   }
    // })
  }

  exportToExcelTable() {
      let table = document.getElementById('esi_ecr');
      if (!table) {
        console.error('Table not found!');
        return;
      }
      // Convert table to a worksheet
  
      let worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);
  
  
      // Create a new workbook and add the worksheet
      let workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      // Save the Excel file
      XLSX.writeFile(workbook, 'ESIC_Return_Report' + this.employer_name.replaceAll(' ', '').trim() + "" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx');
    }

  SaveColumnValues() {
    if (this.selectedDynmicColumnValues.length > 0) {
      this._ReportService.manage_report_columns_wfm({
        "action": "save_report_columns",
        "report_name": "esic return",
        "accountid": this.tp_account_id.toString(),
        "report_description": "ESIC Return Reports",
        "report_column_text": this.selectedDynmicColumnValues,
        "productTypeId": this.product_type
      }).subscribe((resData: any) => {
        // if (resData.statusCode) {
        this.toastr.success(resData.commonData.msg);
        this.getColumnValues();

      });
    }
    else {
      this.toastr.info('Please select  column to display');
    }

  }

  getColumnValues() {
    this.selectedDynmicColumnValues = [];
    this.intialize_show_fields();

    // console.log('getColumnValues');
    // if (this.selectedDynmicColumnValues.length > 0) {
    this._ReportService.manage_report_columns_wfm({
      "action": "get_report_columns",
      "report_name": "esic return",
      "accountid": this.tp_account_id.toString(),
      "productTypeId": this.product_type
    }).subscribe((resData: any) => {
      // if (resData.statusCode) {
      // this.toastr.success(resData.msg);
      if (resData.statusCode) {
        this.selectedDynmicColumnValues = JSON.parse(resData.commonData[0]?.report_column_text);

        this.selectedDynmicColumnValues.forEach((el: any) => {
          this.showfields[el] = true
        })
      }

      console.log(this.selectedDynmicColumnValues, this.showfields);

    });


  }


  intialize_show_fields() {
    this.showfields = {
      ncp_days: false,
      member_name:false,
      S_No: false,
     gross_esi_income: false,
    //  eps_contri_remitted: false,
     lastworkingday: false,
   };
  }

}
