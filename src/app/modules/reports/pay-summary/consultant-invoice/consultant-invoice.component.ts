import { Component } from '@angular/core';
import { ReportService } from '../../report.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { ActivatedRoute } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';

@Component({
  selector: 'app-consultant-invoice',
  templateUrl: './consultant-invoice.component.html',
  styleUrls: ['./consultant-invoice.component.css']
})

export class ConsultantInvoiceComponent {

  showSidebar:boolean = false;
  token:any;
  tp_account_id :any;
  product_type : any;
  salmonth:any='';
  salyear:any='';
  emp_code:any='';
  salary_data:any = [];
  selectedMonth:any;

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
  earningsHeaders: any=[];
  deductionHeaders: any=[];
  variable_data = [];
  deduction_data = [];

  constructor(private _ReportService : ReportService,
    private _sessionService : SessionService,
    private router : ActivatedRoute,
    private _EncrypterService : EncrypterService
  ){
    this.router.params.subscribe((params: any) => {
      let id = this._EncrypterService.aesDecrypt(params['id']);
      this.emp_code = id.split(',')[0];
      this.salmonth = id.split(',')[1];
      this.salyear = id.split(',')[2];
      // console.log(this.salmonth);
    });
  }
  ngOnInit(){
     let session_obj_d: any = JSON.parse(
          this._sessionService.get_user_session());
        this.token = decode(session_obj_d.token);
        this.tp_account_id = this.token?.tp_account_id;
        // this.product_type = token.product_type;
        this.product_type = localStorage.getItem('product_type');

        this.Salary_Slip();
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getMonthName(monthId: number) {
    this.selectedMonth = this.monthsArray.find(month => month.id === monthId.toString());
    return this.selectedMonth ? this.selectedMonth.month : '';
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
       
        this.variable_data = (resData.commonData.variablesDetails);
        this.deduction_data = (resData.commonData.deductionDetails);
        this.earningsHeaders = resData.commonData.dynamicEarningHeads;
        this.deductionHeaders = (resData.commonData.dynamicDeductionHeads);

      } else {
        this.salary_data = [];
        this.variable_data=[];
        this.deduction_data=[];
        this.earningsHeaders=[];
        this.deductionHeaders=[];
        // this.show_label = false;
      }
    });
  
  }

  onPrint(){
    const printContent = document.getElementById('printable-invoice').innerHTML;
  
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Consultant Invoice</title>');
    const styles = document.getElementsByTagName('style');
    for (let i = 0; i < styles.length; i++) {
      printWindow.document.write(styles[i].outerHTML);
    }
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
  
    var printStyle = `<style>  @media print { table table tr td{border: 1px solid #a9a8a8;} body{font-family: sans-serif;}.light-skyblue{background:lightblue}.white{background:white}.export-button{background-color:#72ee74;color:white;border:0;padding:10px 20px;text-align:center;text-decoration:none;display:inline-block;font-size:10px;margin:4px 2px;cursor:pointer;border-radius:4px}.dropdown.float-right-box ul#menu3{left:-52px}.top-right-outer-box{display:flex;justify-content:flex-start}.form-check{padding-top:10px}.form-check .form-check-input{height:20px;width:20px;vertical-align:text-bottom;margin:3px 5px 0 0}.table-responsive.reports-table-outer-box thead{background:#1669b6 !important;color:#fff}table.table-striped td{border:1px solid black;padding:2px;border-collapse:collapse;color:#000}.brd-top{border-top:none !important}.brd-btm{border-bottom:none !important}*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.text-left{text-align:left}table.salary-slip-header-box{background-color:#f6f6f6;width:100%;max-width:100%}.salary-slip-logo-box{vertical-align:text-bottom}.salary-slip-logo-box{padding:20px}.salary-slip-address-box{text-align:right;float:right;max-width:300px;padding:20px}.salary-slip-address-box p{font-weight:600;font-size:12px;margin-bottom:5px}.Salary-Slip-month-title-box h4{width:100%;text-align:center;display:block;padding-bottom:30px;font-weight:500;font-size:22px}p.print-btn-box.text-right{position:absolute;top:-45px;right:0}.table-responsive.reports-table-outer-box table tr td,.table-responsive.reports-table-outer-box table tr th{padding:4px !important;font-size:12px}} </style>`;
    printWindow.document.head.insertAdjacentHTML('beforeend', printStyle);
  
    printWindow.document.close();
    printWindow.print();
  }
}
