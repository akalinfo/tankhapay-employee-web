import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import decode from 'jwt-decode';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
declare var $: any;
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../report.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-advance-salary',
  templateUrl: './advance-salary.component.html',
  styleUrls: ['./advance-salary.component.css']
})
export class AdvanceSalaryComponent {
  showSidebar: boolean = true;
  profilepath: string = '';
  user_name: string = '';
  disp_image_txt: string = '';
  month: any;
  salmonth:any='';
  salyear:any='';
  yearsArray: any = [];
  emp_code:any='';
  fromdate: any = '';
  employer_name:any='';
  hracomponents:any;
  taxslabmaster:any;
  quarterlyamount:any;
  tax_summary:any;
  user_type:any='';
  registered_address:any='';
  todate: any = '';
  employer_profile: any = [];
  business_detail: FormGroup;
  payout_date_form: FormGroup;
  days_count: any;
  employer_mobile:any;
  
  selectedMonth:any;
  billing_address:any;
  includeEmployeeDetails: boolean = true;
  year: any;
  employer_email:any;
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
  
  bankDetailsForm: FormGroup;
  selected_date: any;
  financialYear:any;
  product_type: any;
  name:any;
  tp_account_id: any = '';
  token: any = '';
  cur_payout_day: string = '';
  data: any = [];
  salary_data:any=[];
  payout_date:any;
  variable_data:any=[];
  deduction_data:any=[];
  json_data: any = [];
  show_label: boolean = true;
  from_date: any = '';
  to_date: any = '';
  company_name: any='';
  earningsData:any=[];
  deductionsData:any=[];
  earningsHeaders:any=[];
  tax_data:any=[];
  Inv_data:any=[];
  totalsaving_data:any=[];
  Verify_Inv_data=[];
  taxByMonth_data:any=[];
  taxprojection_data:any=[];
  totalincome_data:any=[];
  chaptersixcomp_data:any=[];
  us80ccomp_data:any=[];
  Employee_code:any;
    showDoB: boolean = true;
    is_production: boolean = environment.production;
  hra: any = {};
  deductionHeaders:any=[];
  sec_17_components_one:any=[];
  sec_17_components_two:any=[];
  epfValue:any;
  taxsummary:any;
  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private http: HttpClient,
    private _EncrypterService: EncrypterService,
       private sanitizer:DomSanitizer,
    private _ReportService: ReportService) {
      this.router.params.subscribe((params: any) => {
        let id = this._EncrypterService.aesDecrypt(params['id']);
        this.emp_code = id.split(',')[0];
        this.salmonth = id.split(',')[1];
        this.salyear = id.split(',')[2];
        // console.log(this.salmonth);
      });
  }
  ngOnInit() {
    
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token?.tp_account_id;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    let currDate = new Date();

    currDate.setMonth(currDate.getMonth() + 1);
    currDate.setDate(currDate.getDate() - currDate.getDate())
    this.profilepath = session_obj_d.profile_photo_path;
    this.user_name = session_obj_d.name + ' [ ' + session_obj_d.email_id + ' ]';
    // this.name=session_obj_d.name;

    this.disp_image_txt = session_obj_d.name;
    if (this.disp_image_txt.trim().split(' ').length > 1 && this.disp_image_txt.split(' ')[1] != '') {
      this.disp_image_txt = this.disp_image_txt.trim().split(' ')[0].charAt(0).toUpperCase() + this.disp_image_txt.split(' ')[1].charAt(0).toUpperCase();

    } else {
      this.disp_image_txt = this.disp_image_txt.trim().split(' ')[0].charAt(0).toUpperCase();
    }


    if (this.profilepath == null || this.profilepath == '' || this.profilepath == undefined) {
      this.profilepath = '';
    }
    this.Salary_Slip();
    this.GetTaxProjection();
    if (this.is_production && this.tp_account_id == '4643') {
      this.showDoB = false;
    }
}


toggle() {
  this.showSidebar = !this.showSidebar;
}

getMonthName(monthId: number) {
  this.selectedMonth = this.monthsArray.find(month => month.id === monthId.toString());
  return this.selectedMonth ? this.selectedMonth.month : '';
}

downloadPdf() {
  const pdf = new jsPDF();
  pdf.save('salary-slip.pdf');
}

Salary_Slip(){
  this._ReportService.SalarySlip({
    "customerAccountId": this.tp_account_id.toString(),
    "month": this.salmonth,
    "year": this.salyear,
    "empCode":this.emp_code,
    "GeoFenceId": this.token.geo_location_id 

  }).subscribe((resData: any) => {
    
    if (resData.statusCode) {
      this.salary_data.push(resData.commonData.salaryStructureDetails[0]);
      this.variable_data.push(resData.commonData.variablesDetails[0]);
      this.deduction_data.push(resData.commonData.deductionDetails[0]);
      this.earningsHeaders = resData.commonData.dynamicEarningHeads;
      this.deductionHeaders = (resData.commonData.dynamicDeductionHeads);
    } else {
      this.salary_data = [];
      this.variable_data=[];
      this.deduction_data=[];
      this.earningsHeaders=[];
      this.deductionHeaders=[];
      this.show_label = false;
    }
  });

}
getTotalForComponentsOne(column: 'total' | 'exempt' | 'taxable'): number {
  return this.sec_17_components_one?.reduce((sum, item) => sum + (item[column] || 0), 0) || 0;
}

getTotalForComponentsTwo(column: 'gtotal' | 'exempt' | 'taxable'): number {
  let total = this.sec_17_components_two?.reduce((sum, item) => sum + (item[column] || 0), 0) || 0;
  if (column === 'gtotal' || column === 'taxable') {
    total += this.epfValue || 0;
  }
  return total;
}
// Method to calculate totals for each column dynamically
getTotalForIncomeData(column: 'income' | 'exempt' | 'taxable'): number {
  return this.totalincome_data?.reduce((sum, item) => sum + (item[column] || 0), 0) || 0;
}
GetTaxProjection() {
  let previousYear = parseInt(this.salyear, 10) - 1;
  let nextYear = parseInt(this.salyear, 10) + 1;

  this.financialYear = (this.salmonth === 1 || this.salmonth === 2 || this.salmonth === 3) 
    ? `${previousYear}-${this.salyear}` 
    : `${this.salyear}-${nextYear}`;

  this._ReportService.GetTaxProjectionApi({
    "customerAccountId": this.tp_account_id.toString(),
    "financial_year": this.financialYear.toString(),
    "empCode": this.emp_code?.toString()
  }).subscribe((resData: any) => {
    if (resData.statusCode) {
      this.tax_data = resData.commonData;
      this.taxByMonth_data = this.tax_data?.taxByMonth || {};
      
      if (this.taxByMonth_data?.fields) {
        this.taxByMonth_data["fields"] = this.sanitizer.bypassSecurityTrustHtml(
          this.taxByMonth_data["fields"].replaceAll('"', '')
        );
      }

      this.taxprojection_data = this.tax_data?.taxprojection;
      this.totalincome_data = this.tax_data?.totalincome || [];
      this.totalsaving_data = this.tax_data?.totalsaving;
      this.chaptersixcomp_data = this.tax_data?.chaptersixcomp || [];
      this.taxsummary = this.tax_data?.taxsummary;
      this.quarterlyamount = this.taxsummary[0]?.quarterlyamount;
      this.hracomponents = JSON.parse(this.taxsummary[0]?.hracomponents || '[]');
      this.sec_17_components_one= JSON.parse(this.taxsummary[0]?.sec_17_components_one || '[]');
      this.sec_17_components_two= JSON.parse(this.taxsummary[0]?.sec_17_components_two || '[]');
      this.taxslabmaster = JSON.parse(this.taxsummary[0]?.taxslabmaster || '[]');
      this.tax_summary = Object.entries(JSON.parse(this.taxsummary[0]?.taxsummary || '{}'));
      const epf80CComponent = this.tax_data?.us80ccomp.find((component: any) => component.componentname === "EPF (80C)");
      this.epfValue = epf80CComponent ? epf80CComponent.componentvalue : 0;
      // console.log(this.epfValue,"A");
      
    } else {
      this.resetTaxProjectionData();
    }
  });
}
getTotalFor80C(): number {
  return this.tax_data?.us80ccomp?.reduce((sum, comp) => sum + (comp.componentvalue || 0), 0) || 0;
}
getTotalForChapterSix(): number {
  return this.tax_data?.chaptersixcomp?.reduce((sum, item) => sum + (item.componentvalue || 0), 0) || 0;
}
getGrandTotal(): number {
  return this.getTotalFor80C() + this.getTotalForChapterSix();
}

resetTaxProjectionData() {
  this.tax_data = [];
  this.taxByMonth_data = [];
  this.taxprojection_data = [];
  this.totalincome_data = [];
  this.totalsaving_data = [];
  this.chaptersixcomp_data = [];
  this.hracomponents = [];
}

onPrint(){
  const printContent = document.getElementById('123').innerHTML;

  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>Advance-Salary-Slip</title>');
  const styles = document.getElementsByTagName('style');
  for (let i = 0; i < styles.length; i++) {
    printWindow.document.write(styles[i].outerHTML);
  }
  printWindow.document.write('</head><body>');
  printWindow.document.write(printContent);
  printWindow.document.write('</body></html>');

  var printStyle = `<style>  @media print { .light-skyblue{background:lightblue}.white{background:white}.export-button{background-color:#72ee74;color:white;border:0;padding:10px 20px;text-align:center;text-decoration:none;display:inline-block;font-size:10px;margin:4px 2px;cursor:pointer;border-radius:4px}.dropdown.float-right-box ul#menu3{left:-52px}.top-right-outer-box{display:flex;justify-content:flex-start}.form-check{padding-top:10px}.form-check .form-check-input{height:20px;width:20px;vertical-align:text-bottom;margin:3px 5px 0 0}.table-responsive.reports-table-outer-box thead{background:#1669b6 !important;color:#fff}table.table-striped td{border:1px solid black;padding:2px;border-collapse:collapse;color:#000}.brd-top{border-top:none !important}.brd-btm{border-bottom:none !important}*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.text-left{text-align:left}table.salary-slip-header-box{background-color:#f6f6f6;width:100%;max-width:100%}.salary-slip-logo-box{vertical-align:text-bottom}.salary-slip-logo-box{padding:20px}.salary-slip-address-box{text-align:right;float:right;max-width:300px;padding:20px}.salary-slip-address-box p{font-weight:600;font-size:12px;margin-bottom:5px}.Salary-Slip-month-title-box h4{width:100%;text-align:center;display:block;padding-bottom:30px;font-weight:500;font-size:22px}p.print-btn-box.text-right{position:absolute;top:-45px;right:0}.table-responsive.reports-table-outer-box table tr td,.table-responsive.reports-table-outer-box table tr th{padding:4px !important;font-size:12px}} </style>`;
  printWindow.document.head.insertAdjacentHTML('beforeend', printStyle);

  printWindow.document.close();
  printWindow.print();
}

}