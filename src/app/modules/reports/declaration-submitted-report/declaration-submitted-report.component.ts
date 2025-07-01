import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReportService } from '../report.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { grooveState, dongleState } from 'src/app/app.animation';
import { DomSanitizer,SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-declaration-submitted-report',
  templateUrl: './declaration-submitted-report.component.html',
  styleUrls: ['./declaration-submitted-report.component.css'],
  animations: [grooveState, dongleState]
})
export class DeclarationSubmittedReportComponent {
  showSidebar: boolean = false;
  isSideActive = false;
  financialYears = [];
  tpAccountId:any = '';
  productType : any = '';
  token:any ='';
  declarationSearchForm: FormGroup;
  detailsDeclaration : any = [];
  showTaxPopup: boolean = false;
  financial_yr: any;
  taxByMonth_data: any = [];
  taxprojection_data:any = [];
  totalincome_data:any = [];
  totalsaving_data:any = [];
  chaptersixcomp_data:any [];
  us80ccomp_data:any = [];
  declaration_or_proof:any = '';
  flexiallowancecomp_data :any= [];
  tp_account_id :any = '';
  Inv_data:any = [];
  filtered_data:any = [];
  show_label:any = '';
  showPopup:any = '';
  start :any = '';
  end:any = '';
  tax_data:any ='';
  Investment_declaration_data:any = '';
  From_date:any ='';
  To_date:any ='';
  proofapplicabledate:any = '';
  constructor(private _formBuilder: FormBuilder,
              private _ReportService: ReportService,
              private _sessionService: SessionService,
              private _encrypterService: EncrypterService,
              private _toastr: ToastrService,
            private sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
    this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tpAccountId = this.token.tp_account_id;
    this.tp_account_id = this.tpAccountId;
    this.productType = this.token.product_type;
    this.generateFinancialYears();
    this.declarationSearchForm = this._formBuilder.group({
      financialYear:['']
    })
    if(this.financialYears.length > 0){
      this.declarationSearchForm.patchValue({
        financialYear: this.financialYears[0]
      })
    }
    this.getDeclarationSubmitReport();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  toggleSidebar(){
    this.isSideActive = !this.isSideActive;
  }
  reloadPage(){

  }

  generateFinancialYears(): void {
    const startYear = 2022;
    const currentYear = new Date().getFullYear(); // Get the current calendar year
    //Adjust the current calendar year to be the financial year
    //If we're before July, we're still in the previous FY
    const currentMonth = new Date().getMonth();
    const financialCurrentYear = currentMonth >= 6 ? currentYear + 1 : currentYear;

    for (let year = financialCurrentYear; year >= startYear; year--) {
      // Create the financial year string e.g., "2020-2021"
      this.financialYears.push(`${year}-${year + 1}`);
    }
  }

  filterReport(){
    this.getDeclarationSubmitReport();
  }

  getDeclarationSubmitReport(){
    this.detailsDeclaration= [];
    let post = this.declarationSearchForm.value;
    this.financial_yr = post.financialYear;
    this._ReportService.getDeclarationSubmittedReport({
      "customerAccountId": this._encrypterService.aesEncrypt((this.tpAccountId).toString()),
      "productTypeId":this._encrypterService.aesEncrypt((this.productType).toString()),
      "action":"Q1CEqHhXvK8wQNxoQ4DSszdyIuBhqSTFkc2cJ+oWPtQ=",
      "financialYear": post.financialYear,
    }).subscribe({
      next: (resData: any) => {
        if(resData.statusCode == true){
          let result = this._encrypterService.aesDecrypt(resData.commonData);
          this.detailsDeclaration = JSON.parse(result);
        }
        else{
          this._toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        let msg = e.message;
        try{
          msg = e.error.message;
        }
        catch(e1){

        }
        this._toastr.error(msg || 'Something went wrong', 'Oops!');
      }
    })
  }

  closeTaxpopup() {
    this.showTaxPopup = false;
  }

  openTaxPopup(financial_Yr: any, emp_code: any) {
    this.showTaxPopup = true;
    this.financial_yr = financial_Yr;
    this.GetTaxProjection(this.financial_yr, emp_code);
  }

  GetInvestmentsProof(emp_code: any) {

    this._ReportService.GetInvestmentsProofDetails({
      "customerAccountId": this.tp_account_id.toString(),
      "financialYear": this.financial_yr,
      "empCode": emp_code.toString(),
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.Inv_data = resData.commonData;
        this.filtered_data = this.Inv_data;
        //  console.log(this.Inv_data[0].status);
      } else {
        this.filtered_data = [];
        this.show_label = false;
      }
    });
  }

  GetTaxProjection(financial_yr: any, emp_code: any) {
    this.showPopup = true;
    this.GetInvestmentTypeData();
    this.financial_yr = financial_yr;
    const [start, end] = this.financial_yr.split('-').map(year => parseInt(year, 10));
    this.start=start + 1;
    this.end=end + 1;
    this._ReportService.GetTaxProjectionApi({
      "customerAccountId": this.tp_account_id.toString(),
      "financial_year": this.financial_yr,
      "empCode": emp_code.toString(),
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.tax_data = resData.commonData;
        this.taxByMonth_data = this.tax_data.taxByMonth;
        this.taxprojection_data = this.tax_data.taxprojection;
        this.totalincome_data = this.tax_data.totalincome;
        this.totalsaving_data = this.tax_data.totalsaving;
        this.chaptersixcomp_data = this.tax_data.chaptersixcomp;
        this.us80ccomp_data = this.tax_data.us80ccomp;
        this.flexiallowancecomp_data = this.tax_data.flexiAllowances;
      } else {
        this.tax_data = [];
        this.show_label = false;
      }

    });
  }

  GetInvestmentTypeData() {
    this._ReportService.GetInvestmentDeclarationDate({
      "customerAccountId": this.tp_account_id.toString(),
      "financialYear": this.financial_yr,
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.Investment_declaration_data = resData.commonData;
        // console.log(this.Investment_declaration_data);

        this.From_date = this.Investment_declaration_data[0]?.openfrom;
        this.To_date = this.Investment_declaration_data[0]?.opento;
        this.declaration_or_proof = this.Investment_declaration_data[0]?.declaration_or_proof;
        this.proofapplicabledate = this.Investment_declaration_data[0]?.proofapplicabledate;
      } else {
        this.Investment_declaration_data = [];
      }
    });
  }
  decodeHtmlContent(html: string): SafeHtml {
      return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
