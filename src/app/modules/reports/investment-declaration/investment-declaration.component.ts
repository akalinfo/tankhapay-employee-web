import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import * as XLSX from 'xlsx';
declare var $: any;
import decode from 'jwt-decode';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
import { grooveState, dongleState } from 'src/app/app.animation';

@Component({
  selector: 'app-investment-declaration',
  templateUrl: './investment-declaration.component.html',
  styleUrls: ['./investment-declaration.component.css'],
  animations: [grooveState, dongleState]
})
export class InvestmentDeclarationComponent {
  currentDate: any;
  orgempCode: any;
  currentDateString: any;
  payout_date: any;
  cur_payout_day: string = '';
  employer_profile: any = [];
  employer_name: any = '';
  showSidebar: boolean = true;
  month: any;
  typeValue: string;
  finYear: any;
  includeEmployeeDetails: boolean = false;
  days_count: any;
  filterStatus: any;
  proofapplicabledate: any;
  filteredEmployees: any = [];
  p: number = 0;
  invKey: any;
  proof_date: any;
  TO_DT: any;
  FROM_DT: any;
  To_date: any;
  year: any;
  From_date: any;
  financial_yr: any;
  Investment_data: any = [];
  selectedItems: any[] = [];
  selected_date: any;
  previousYear: any;
  yearsArray: any = [];
  Investment_declaration_data: any = [];
  product_type: any;
  tp_account_id: any = '';
  token: any = '';
  data: any = [];
  tax_data: any = [];
  Inv_data: any = [];
  Verify_Inv_data = [];
  taxByMonth_data: any = [];
  taxprojection_data: any = [];
  totalincome_data: any = [];
  Change_Modal_Form: FormGroup;
  selectedRadioOption: string = 'taxreport';
  check: boolean = false;
  totalsaving_data: any = [];
  FinancialYear: any;
  declaration_or_proof: any;
  from_date: any;
  to_date: any;
  save_Investment_data: any = [];
  EMP_NAME: any;
  financialYear: number = 1;
  chaptersixcomp_data: any = [];
  us80ccomp_data: any = [];
  flexiallowancecomp_data: any = [];
  bankDetailsForm: FormGroup;
  Investment_Form: FormGroup;
  json_data: any = [];
  show_label: boolean = true;
  EMP_Code: any;
  employeeCode: string = '';
  selectedFiscalYear: string;
  emp_name: any;
  emp_code: any;
  Employee_name: any;
  Employee_code: any;
  searchBy: string = 'EmployeeCode';
  addRemoveHide: boolean = false;
  show_hide: boolean = false;
  showPopup: boolean = false;
  selectedReports: any[] = [];
  current_year: any;
  changeDateModalShow: boolean = false
  viewFinYear: any;
  start: any;
  end: any;
  showfields: any = {
    S_No: false,
    financial_year: false,
    approveddocs: false,
    rejecteddocs: false,
    pancard: false,
    pendingdocs: false,

    totaldocs: false,
  };

  fieldarray: any = [
    // { name: 'S No.', value: 'S_No' },
    { name: 'Financial Year', value: 'financial_year' },
    { name: 'Approved Docs', value: 'approveddocs' },
    { name: 'Rejected Docs', value: 'rejecteddocs' },
    { name: 'Pending Docs', value: 'pendingdocs' },
    { name: 'Total Docs', value: 'totaldocs' },
    { name: 'PAN Card', value: 'pancard' }

  ];

  fiscalYears: string[] = this.FinancialYears();
  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private _alertservice: AlertService) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.employer_name = this.token.name;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');

    this.bankDetailsForm = this._formBuilder.group({
      EmployeeCode: ['', [Validators.required]],
      financialyear: ['', [Validators.required]]
    });

    this.Investment_Form = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]]

    });

    this.Change_Modal_Form = this._formBuilder.group({
      From_Date: ['', [Validators.required]],
      To_Date: ['', [Validators.required]],
      Type: ['', [Validators.required]],
      Proof_dt: ['', [Validators.required]]
    });

    this.selected_date = localStorage.getItem('selected_date');
    this.days_count = this.selected_date.split('-')[0];

    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];

    this.FinancialYears();
    this.addRemoveHide = false;

    this.Change_Modal_Form.get('Type').valueChanges.subscribe((value) => {
      this.updateProofDateControl(value);
    });

    this.filterStatus = 'taxreport';
    const now = new Date();
    const current_month = now.getMonth() + 1;
    this.current_year =
      current_month >= 4 ? `${now.getFullYear()}-${(now.getFullYear() + 1)}` : `${now.getFullYear() - 1}-${now.getFullYear()}`;
    this.bankDetailsForm.patchValue({ financialyear: this.current_year });
    this.InvestmentReport(this.filterStatus);
  }
  ngAfterViewInit() {
    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      })
    }, 500);

    setTimeout(() => {
      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      })
    }, 500);


    setTimeout(() => {
      $('#from_Date').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      })
    }, 500);

    setTimeout(() => {
      $('#to_Date').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      })
    }, 500);
  }

  ngAfterViewChecked() {
    setTimeout(() => {
      $('#proof_date').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      })
    }, 500);
  }

  updateProofDateControl(typeValue: string): void {
    const proofDateControl = this.Change_Modal_Form.get('Proof_dt');
    if (typeValue === 'D') {
      proofDateControl.disable();
      this.Change_Modal_Form.patchValue({
        Proof_dt: ['']
      });

    } else {
      this.Change_Modal_Form.patchValue({
        Proof_dt: this.proofapplicabledate
      });
      proofDateControl.enable();
    }
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  search(key: any) {
    this.invKey = key.target.value;
    this.p = 0;
    this.filteredEmployees = this.data.filter(function (element: any) {
      return (element.emp_name.toLowerCase().includes(key.target.value.toLowerCase())
        || element.emp_code.toString().toLowerCase().includes(key.target.value.toLowerCase()) ||
        element.orgempcode?.toString().toLowerCase().includes(key.target.value.toLowerCase()) ||
        element.tpcode.toString().toLowerCase().includes(key.target.value.toLowerCase())
      )
    });
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

  // FinancialYears(startingYear: number, currentYear: number){
  //   let fiscalYears = [];
  //   for (let i = startingYear; i <= currentYear; i++) {
  //     this.previousYear = i - 1;
  //     this.finYear = `${this.previousYear}-${i.toString()}`;
  //     fiscalYears.push(this.finYear);
  //   }

  //   return fiscalYears;
  // }

  FinancialYears(
    startingYear?: number,
    currentYear?: number,
    finYearStartMonth: number = 4 // Default financial year starts in April
  ): string[] {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // Months are 0-based, so add 1
    const current = currentYear || (currentMonth >= finYearStartMonth ? now.getFullYear() : now.getFullYear() - 1);
    const start = startingYear || (current - 3); // Default to 4 years ago if not provided

    if (start > current) {
      throw new Error("Starting year cannot be greater than the current year.");
    }

    const fiscalYears: string[] = [];
    for (let i = start; i <= current; i++) {
      const nextYear = i + 1;
      const finYear = `${i}-${nextYear}`; // Format as full four-digit years
      fiscalYears.push(finYear);
    }
    return fiscalYears;
  }

  onRadioChange(filter: any) {
    this.filterStatus = filter.target.value;
    this.InvestmentReport(this.filterStatus);

    if (this.filterStatus === 'all') {
      this.InvestmentReport('all');
      this.addRemoveHide = false;
    }
  }

  Hideshow_Emp(val: any) {
    if (val == 1) {
      this.addRemoveHide = true;
    }
    else {
      this.addRemoveHide = false;
    }
  }
  InvestmentReport(filter: any) {
    this.GetInvestmentTypeData();
    let filter_status = filter;
    let financial_year = '';
    financial_year = this.bankDetailsForm.get('financialyear')?.value;
    if (financial_year) {
      this._ReportService.InvestmentReportResultApi({
        "customerAccountId": this.tp_account_id?.toString(),
        "financialYear": financial_year,
        "filterStatus": filter_status,
        "empCode": "",
        "searchKeyword": this.bankDetailsForm.get('EmployeeCode')?.value,
        "GeoFenceId": this.token.geo_location_id
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.data = resData.commonData;
          // console.log(this.data);

          this.filteredEmployees = this.data;
          this.emp_name = this.data[0].emp_name;
          this.emp_code = this.data[0].emp_code;

        } else {
          this.data = [];
          this.filteredEmployees = [];
          this.emp_name = '';
          this.emp_code = '';
          this.show_label = false;
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      });
    } else {
      this.data = [];
      this.filteredEmployees = [];
      this.emp_name = '';
      this.emp_code = '';
      this.show_label = false;
      this.toastr.error('Please select a financial year.');
    }
  }

  GetInvestmentDeclaration_DateForEmployee(emp_name: any, financialyear: any, emp_code: any) {
    this.EMP_NAME = emp_name;
    this.FinancialYear = financialyear;
    this.EMP_Code = emp_code;

    this._ReportService.GetInvestmentDeclarationDateForEmployee({
      "customerAccountId": this.tp_account_id.toString(),
      "financialYear": this.FinancialYear,
      "empCode": this.EMP_Code?.toString(),
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.Investment_data = resData.commonData;

        this.FROM_DT = this.Investment_data[0]?.openfrom;
        this.TO_DT = this.Investment_data[0]?.opento;

        this.Investment_Form.patchValue({
          FromDate: this.FROM_DT,
          ToDate: this.TO_DT
        });

      } else {
        this.Investment_data = [];
        this.show_label = false;
      }
    });
  }

  SaveInvestmentDeclarationDate_ForIndividualEmp() {
    this.from_date = $('#FromDate').val();
    this.to_date = $('#ToDate').val();

    this._ReportService.SaveInvestmentDeclarationDateForIndividualEmp({
      "customerAccountId": this.tp_account_id.toString(),
      "financialYear": this.FinancialYear,
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "modifiedBy": this.tp_account_id.toString(),
      // "modifiedByIp":"::1",
      "empCode": this.EMP_Code.toString(),
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {

        this.save_Investment_data = resData.commonData;

        // console.log(this.save_Investment_data);
        this.toastr.success(resData.message, 'Success');

      } else {
        this.save_Investment_data = [];
        this.show_label = false;
        this.toastr.error(resData.message, 'Oops!');
      }
    });
  }

  GetInvestment_DeclarationDate() {
    this.changeDateModalShow = true;
    this._ReportService.GetInvestmentDeclarationDate({
      "customerAccountId": this.tp_account_id.toString(),
      "financialYear": this.bankDetailsForm.get('financialyear')?.value,
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.Investment_declaration_data = resData.commonData;
        // console.log(this.Investment_declaration_data);

        this.From_date = this.Investment_declaration_data[0]?.openfrom;
        this.To_date = this.Investment_declaration_data[0]?.opento;
        this.declaration_or_proof = this.Investment_declaration_data[0]?.declaration_or_proof;
        this.proofapplicabledate = this.Investment_declaration_data[0]?.proofapplicabledate;
        // console.log(this.From_date,this.To_date);

        if (this.declaration_or_proof === 'D') {
          this.Change_Modal_Form.patchValue({
            From_Date: this.From_date,
            To_Date: this.To_date,
            Type: this.declaration_or_proof,
            Proof_dt: ' ' // Set Proof_dt to a space if Type is 'D'
          });
        } else {
          this.Change_Modal_Form.patchValue({
            From_Date: this.From_date,
            To_Date: this.To_date,
            Type: this.declaration_or_proof,
            Proof_dt: this.proofapplicabledate // Set Proof_dt to the actual value if Type is not 'D'
          });
        }


      } else {
        this.Investment_declaration_data = [];
        this.show_label = false;
      }
    });
  }

  CloseChangeDateModalShow() {
    this.changeDateModalShow = false;
  }

  SaveInvestment_DeclarationDate() {
    this.from_date = $('#from_Date').val();
    this.to_date = $('#to_Date').val();
    this.proof_date = $('#proof_date').val();
    let InvType = this.Change_Modal_Form.get('Type')?.value;
    // if(InvType === 'P'){
    //   alert('Investment proof changes are currently not allowed. The window will reopen on Dec 1, 2025.');
    //   return;
    // }
    this._ReportService.SaveInvestmentDeclarationDate({
      "customerAccountId": this.tp_account_id?.toString(),
      "financialYear": this.bankDetailsForm.get('financialyear')?.value,
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "proofApplicableDate": this.proof_date,
      "invType": this.Change_Modal_Form.get('Type')?.value,
      "modifiedBy": this.tp_account_id?.toString(),
      "GeoFenceId": this.token.geo_location_id
      // "modifiedByIp":"::1"
    }).subscribe((resData: any) => {
      if (resData.statusCode) {

        this.save_Investment_data = resData.commonData;
        // console.log(this.save_Investment_data);
        this.toastr.success(resData.message, 'Success');

      } else {
        this.save_Investment_data = [];
        this.show_label = false;
        this.toastr.error(resData.message, 'Oops!');
      }
    });
    this.Change_Modal_Form.reset();
    this.changeDateModalShow = false
  }

  selectAll(event: any) {
    if (event.target.checked) {

      this.selectedItems = this.Inv_data.filter(report => report.status == 'pending' || report.status == 'Accepted');
    } else {
      // If the master checkbox is unchecked, clear the selection
      this.selectedItems = [];
    }
  }

  onCheckboxChange(report: any) {
    if (report.status === 'pending') {
      // If the status is 'Accepted', toggle the selected state
      if (this.selectedReports.includes(report)) {
        this.selectedReports = this.selectedReports.filter(r => r !== report);
      } else {
        this.selectedReports.push(report);
      }
    }
  }

  isAnyCheckboxChecked() {
    return this.selectedReports.length > 0;
  }

  GetTaxProjection(taxByMonth_data: any) {
    this.viewFinYear = this.bankDetailsForm.get('financialyear').value;
    const [start, end] = this.bankDetailsForm.get('financialyear').value.split('-').map(year => parseInt(year, 10));
    this.start = start + 1;
    this.end = end + 1;
    this.showPopup = true;
    this.Employee_name = taxByMonth_data?.emp_name;
    this.Employee_code = taxByMonth_data?.emp_code;
    this.orgempCode = taxByMonth_data?.orgempcode || taxByMonth_data?.tpcode;
    //console.log(this.Employee_name,this.orgempCode);

    const employeeCode = this.Employee_code?.toString() || this.bankDetailsForm.get('EmployeeCode')?.value?.toString() || taxByMonth_data?.empcode?.toString();
    // console.log(employeeCode);
    this._ReportService.GetTaxProjectionApi({
      "customerAccountId": this.tp_account_id.toString(),
      "financial_year": this.bankDetailsForm.get('financialyear').value,
      "empCode": employeeCode,
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.tax_data = resData.commonData;
        // console.log(this.tax_data);

        this.taxByMonth_data = this.tax_data?.taxByMonth || {};
        // this.taxByMonth_data["fields"]=this.sanitizer.bypassSecurityTrustHtml(this.taxByMonth_data["fields"]?.replaceAll('"',''));
        if (this.taxByMonth_data?.fields) {
          this.taxByMonth_data["fields"] = this.sanitizer.bypassSecurityTrustHtml(
            this.taxByMonth_data["fields"].replaceAll('"', '')
          );
        }
        this.taxprojection_data = this.tax_data?.taxprojection;
        this.totalincome_data = this.tax_data?.totalincome;
        // console.log(this.totalincome_data);
        this.totalsaving_data = this.tax_data?.totalsaving;
        this.chaptersixcomp_data = this.tax_data?.chaptersixcomp;
        this.us80ccomp_data = this.tax_data?.us80ccomp;
        this.flexiallowancecomp_data = this.tax_data.flexiAllowances;

        //  this.toastr.success(resData.message, 'Success');
      } else {
        this.tax_data = [];
        this.taxByMonth_data = [];
        this.taxByMonth_data["fields"] = [];
        this.taxprojection_data = [];
        this.totalincome_data = [];
        this.totalsaving_data = [];
        this.chaptersixcomp_data = [];
        this.us80ccomp_data = [];
        this.flexiallowancecomp_data = [];
        this.show_label = false;
      }
    });
  }

  exportToExcel() {
    this._ReportService.InvestmentReportResultApi({
      "customerAccountId": this.tp_account_id.toString(),
      "financialYear": this.bankDetailsForm.get('financialyear').value,
      "filterStatus": this.filterStatus,
      "empCode": this.bankDetailsForm.get('EmployeeCode').value,
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = resData.commonData;
        this.taxByMonth_data = this.tax_data?.taxByMonth;
        // this.taxByMonth_data["fields"]=this.sanitizer.bypassSecurityTrustHtml(this.taxByMonth_data["fields"]?.replaceAll('"',''));
        let exportData = [];
        let days = {};
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          // + resData.commonData[i].dayname;
          days = {
            ...days, [head]: ''
          }
        }
        if (this.filterStatus == "taxreport") {
          for (let idx = 0; idx < this.data.length; idx++) {

            const removeHtmlTags = (input) => input.replace(/<[^>]*>/g, '');

            if (this.filterStatus == "taxreport") {
              for (let idx = 0; idx < this.data.length; idx++) {
                const orgEmpCode = this.data[idx]?.orgempcode;
                const tpcode = this.data[idx]?.tpcode;
                const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
                // Function to convert string with line breaks into an array
                const splitByLineBreaks = (input) => input.split('<br>');

                let obj = {
                  'Employee Name': this.data[idx].emp_name,
                  'TP / Org Emp Code': tpOrgEmpCode,
                  'Pan Card': this.data[idx].pancard,
                  'Fields': splitByLineBreaks(removeHtmlTags(this.data[idx]?.fields)).join('<br>'),
                  'Apr': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['apr'])).join('<br>'),
                  'May': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['may'])).join('<br>'),
                  'Jun': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['jun'])).join('<br>'),
                  'Jul': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['jul'])).join('<br>'),
                  'Aug': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['aug'])).join('<br>'),
                  'Sep': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['sep'])).join('<br>'),
                  'Oct': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['oct'])).join('<br>'),
                  'Nov': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['nov'])).join('<br>'),
                  'Dec': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['dec'])).join('<br>'),
                  'Jan': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['jan'])).join('<br>'),
                  'Feb': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['feb'])).join('<br>'),
                  'Mar': splitByLineBreaks(removeHtmlTags(this.taxByMonth_data['mar'])).join('<br>'),
                  'Cumulative': splitByLineBreaks(removeHtmlTags(this.data[idx].totalgrossearning)).join('<br>'),
                };
                exportData.push(obj);
              }
            }
          }


        }

        else {
          for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
            const orgEmpCode = this.filteredEmployees[idx]?.orgempcode;
            const tpcode = this.filteredEmployees[idx]?.tpcode;
            const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
            let obj = {
              'Financial Year': this.filteredEmployees[idx].financialyear,
              'TP / Org Emp Code': tpOrgEmpCode,
              'Employee Name': this.filteredEmployees[idx].emp_name,
              'Pan Card': this.filteredEmployees[idx].pancard,
              'Father Name': this.filteredEmployees[idx].fathername,
              'Branch': this.filteredEmployees[idx].branch,
              'Org Unit': this.filteredEmployees[idx].assignedous,
              'Regime Type': this.filteredEmployees[idx].regime_tye,
              'Sub Unit': this.filteredEmployees[idx].subunit,
              'Post Offered': this.filteredEmployees[idx].post_offered,
              'Mediclaim (Self/Spouse/Children) (80D)': this.filteredEmployees[idx].col_1,
              'Mediclaim (Parents) (80D)': this.filteredEmployees[idx].col_2,
              'Mediclaim (Parents) (80D) - Parents Senior Citizen (Claim Under 80D)': this.filteredEmployees[idx].col_3,
              'Mediclaim (Preventive Checkup Self/Spouse/Children/Parents) (80D)': this.filteredEmployees[idx].col_4,
              'Mediclaim (Prem. Ded. From Sal. Self/Spouse/Children) (80D)': this.filteredEmployees[idx].col_5,
              'Mediclaim (Prem. Ded. From Sal. Parents) (80D)': this.filteredEmployees[idx].col_6,
              'Handicaped Dependents (80DD)': this.filteredEmployees[idx].col_7,
              'Handicaped Dependents (80DD) -Disability More Than 80% with Dependent (80DD)': this.filteredEmployees[idx].col_8,
              'Med. Exp. For Spec. Diseases (80DDB)': this.filteredEmployees[idx].col_9,
              'Repayment of Loan for Higher Edu.(80E)': this.filteredEmployees[idx].col_10,
              'Donations to Charitable Institutions eligible for 100% deduction': this.filteredEmployees[idx].col_11,
              'Rent Paid (80GG)': this.filteredEmployees[idx].col_12,
              'Donation-Scientific Res. & Rural(80GGA)': this.filteredEmployees[idx].col_13,
              'Donations to Charitable Institutions eligible for 50% deduction': this.filteredEmployees[idx].col_51,
              'Donations to Political Parties by an Assessee eligible for 100% deduction': this.filteredEmployees[idx].col_52,
              'Foreign Sources (80R)': this.filteredEmployees[idx].col_14,
              'Outside India (80RRA)': this.filteredEmployees[idx].col_15,
              'Interest on Saving Bank (80TTA)': this.filteredEmployees[idx].col_16,
              // 
              'Pension Handicap (80U)': this.filteredEmployees[idx].col_17,
              'Pension Handicap (80U) Employee with Severe Disability': this.filteredEmployees[idx].col_18,
              'Interest on Saving Bank (80TTB)': this.filteredEmployees[idx].col_19,
              'Interest Paid on Elec. Vehicle': this.filteredEmployees[idx].col_20,
              'Interest on Home Loan(2016-17)': this.filteredEmployees[idx].col_21,
              'Interest on Home Loan(2019-20)': this.filteredEmployees[idx].col_22,
              ' NPS 80CCD (i)': this.filteredEmployees[idx].col_23,
              'NPS 80CCD (1B)': this.filteredEmployees[idx].col_24,
              // 
              'EPF (80C)': this.filteredEmployees[idx].col_25,
              'VPF (80C)': this.filteredEmployees[idx].col_26,
              'PF Deducted By Prev. Employer(80C)': this.filteredEmployees[idx].col_27,
              'LIC Premium (80C)': this.filteredEmployees[idx].col_28,
              'ULIP (80C)': this.filteredEmployees[idx].col_29,
              'NPS/Pension Scheme Central Govt. (80CCD) (i)': this.filteredEmployees[idx].col_30,
              'PPF (80C)': this.filteredEmployees[idx].col_31,
              'Fixed Deposit (80C)': this.filteredEmployees[idx].col_32,
              // Tution Fee (80C)
              'Tution Fee (80C)': this.filteredEmployees[idx].col_33,
              'Repayment of House Loan Principal(80C)': this.filteredEmployees[idx].col_34,
              'NSC (80C)': this.filteredEmployees[idx].col_35,
              'Interest on NSC (80C)': this.filteredEmployees[idx].col_36,
              'Mutual Fund (80C)': this.filteredEmployees[idx].col_37,
              'Pension Fund (80CCC)': this.filteredEmployees[idx].col_38,
              'Sukanya Samridhi Scheme (80C)': this.filteredEmployees[idx].col_39,
              'KVP': this.filteredEmployees[idx].col_40,
              // 
              'Others': this.filteredEmployees[idx].col_41,
              'Stamp Duty': this.filteredEmployees[idx].col_42,
              'Metro': this.filteredEmployees[idx].is_metro,
              'Land Lord Name': this.filteredEmployees[idx].landlordname,
              'Land Lord Pancard': this.filteredEmployees[idx].landlordpancard,
              'Rent Paid': this.filteredEmployees[idx].rentpaid,
              'Income Previous Employer': this.filteredEmployees[idx].income_previous_employer,
              'Total Other Income': this.filteredEmployees[idx].total_otherincome,
              // 
              'Total Letout Income': this.filteredEmployees[idx].total_letoutincome,
              'Lender Pan Number': this.filteredEmployees[idx].lender_pannumber,
              'Lender Name': this.filteredEmployees[idx].lender_name,
              'Total Loss On Property': this.filteredEmployees[idx].totallossonproperty,
              'Professional Tax': this.filteredEmployees[idx].col_50,
              'Status': this.filteredEmployees[idx].regime_status,
              'Date Of Submission': this.filteredEmployees[idx].createdon,
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
        downloadLink.download = 'Investment_Declaration_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
      }
    })
  }
  exportToExcel1() {
    this._ReportService.InvestmentReportResultApi({
      "customerAccountId": this.tp_account_id.toString(),
      "financialYear": this.bankDetailsForm.get('financialyear').value,
      "filterStatus": this.filterStatus,
      "empCode": this.bankDetailsForm.get('EmployeeCode').value,
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = resData.commonData;
        this.taxByMonth_data = this.tax_data?.taxByMonth;
        // this.taxByMonth_data["fields"]=this.sanitizer.bypassSecurityTrustHtml(this.taxByMonth_data["fields"]?.replaceAll('"',''));
        let exportData = [];
        let days = {};
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          // + resData.commonData[i].dayname;
          days = {
            ...days, [head]: ''
          }
        }
        if (this.filterStatus == "taxreport") {
          for (let idx = 0; idx < this.data.length; idx++) {
            const orgEmpCode = this.data[idx]?.orgempcode;
            const tpcode = this.data[idx]?.tpcode;
            const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;

            function parseHtmlToLines(html: string): string {
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = html.replace(/<br\s*\/?>/gi, '\n');
              // Replace \n with \r\n for Excel and return
              return (tempDiv.textContent || '').trim().replace(/\n/g, '\r\n');
            }


            let obj = {
              'Employee Name': this.data[idx].emp_name,
              'TP / Org Emp Code': tpOrgEmpCode,
              'Pan Card': this.data[idx].pancard,
              'Fields': parseHtmlToLines(this.data[idx]?.fields),
              'Apr': parseHtmlToLines(this.data[idx]['apr']),
              'May': parseHtmlToLines(this.data[idx]['may']),
              'Jun': parseHtmlToLines(this.data[idx]['jun']),
              'Jul': parseHtmlToLines(this.data[idx]['jul']),
              'Aug': parseHtmlToLines(this.data[idx]['aug']),
              'Sep': parseHtmlToLines(this.data[idx]['sep']),
              'Oct': parseHtmlToLines(this.data[idx]['oct']),
              'Nov': parseHtmlToLines(this.data[idx]['nov']),
              'Dec': parseHtmlToLines(this.data[idx]['dec']),
              'Jan': parseHtmlToLines(this.data[idx]['jan']),
              'Feb': parseHtmlToLines(this.data[idx]['feb']),
              'Mar': parseHtmlToLines(this.data[idx]['mar']),
              'Cumulative': parseHtmlToLines(this.data[idx].totalgrossearning),
            };
            exportData.push(obj);
          }
        }


        else {
          for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
            const orgEmpCode = this.filteredEmployees[idx]?.orgempcode;
            const tpcode = this.filteredEmployees[idx]?.tpcode;
            const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
            let obj = {
              'Financial Year': this.filteredEmployees[idx].financialyear,
              'TP / Org Emp Code': tpOrgEmpCode,
              'Employee Name': this.filteredEmployees[idx].emp_name,
              'Pan Card': this.filteredEmployees[idx].pancard,
              'Father Name': this.filteredEmployees[idx].fathername,
              'Branch': this.filteredEmployees[idx].branch,
              'Org Unit': this.filteredEmployees[idx].assignedous,
              'Regime Type': this.filteredEmployees[idx].regime_tye,
              'Sub Unit': this.filteredEmployees[idx].subunit,
              'Post Offered': this.filteredEmployees[idx].post_offered,
              'Mediclaim (Self/Spouse/Children) (80D)': this.filteredEmployees[idx].col_1,
              'Mediclaim (Parents) (80D)': this.filteredEmployees[idx].col_2,
              'Mediclaim (Parents) (80D) - Parents Senior Citizen (Claim Under 80D)': this.filteredEmployees[idx].col_3,
              'Mediclaim (Preventive Checkup Self/Spouse/Children/Parents) (80D)': this.filteredEmployees[idx].col_4,
              'Mediclaim (Prem. Ded. From Sal. Self/Spouse/Children) (80D)': this.filteredEmployees[idx].col_5,
              'Mediclaim (Prem. Ded. From Sal. Parents) (80D)': this.filteredEmployees[idx].col_6,
              'Handicaped Dependents (80DD)': this.filteredEmployees[idx].col_7,
              'Handicaped Dependents (80DD) -Disability More Than 80% with Dependent (80DD)': this.filteredEmployees[idx].col_8,
              'Med. Exp. For Spec. Diseases (80DDB)': this.filteredEmployees[idx].col_9,
              'Repayment of Loan for Higher Edu.(80E)': this.filteredEmployees[idx].col_10,
              'Donations to Charitable Institutions eligible for 100% deduction': this.filteredEmployees[idx].col_11,
              'Rent Paid (80GG)': this.filteredEmployees[idx].col_12,
              'Donation-Scientific Res. & Rural(80GGA)': this.filteredEmployees[idx].col_13,
              'Donations to Charitable Institutions eligible for 50% deduction': this.filteredEmployees[idx].col_51,
              'Donations to Political Parties by an Assessee eligible for 100% deduction': this.filteredEmployees[idx].col_52,
              'Foreign Sources (80R)': this.filteredEmployees[idx].col_14,
              'Outside India (80RRA)': this.filteredEmployees[idx].col_15,
              'Interest on Saving Bank (80TTA)': this.filteredEmployees[idx].col_16,
              // 
              'Pension Handicap (80U)': this.filteredEmployees[idx].col_17,
              'Pension Handicap (80U) Employee with Severe Disability': this.filteredEmployees[idx].col_18,
              'Interest on Saving Bank (80TTB)': this.filteredEmployees[idx].col_19,
              'Interest Paid on Elec. Vehicle': this.filteredEmployees[idx].col_20,
              'Interest on Home Loan(2016-17)': this.filteredEmployees[idx].col_21,
              'Interest on Home Loan(2019-20)': this.filteredEmployees[idx].col_22,
              ' NPS 80CCD (i)': this.filteredEmployees[idx].col_23,
              'NPS 80CCD (1B)': this.filteredEmployees[idx].col_24,
              // 
              'EPF (80C)': this.filteredEmployees[idx].col_25,
              'VPF (80C)': this.filteredEmployees[idx].col_26,
              'PF Deducted By Prev. Employer(80C)': this.filteredEmployees[idx].col_27,
              'LIC Premium (80C)': this.filteredEmployees[idx].col_28,
              'ULIP (80C)': this.filteredEmployees[idx].col_29,
              'NPS/Pension Scheme Central Govt. (80CCD) (i)': this.filteredEmployees[idx].col_30,
              'PPF (80C)': this.filteredEmployees[idx].col_31,
              'Fixed Deposit (80C)': this.filteredEmployees[idx].col_32,
              // Tution Fee (80C)
              'Tution Fee (80C)': this.filteredEmployees[idx].col_33,
              'Repayment of House Loan Principal(80C)': this.filteredEmployees[idx].col_34,
              'NSC (80C)': this.filteredEmployees[idx].col_35,
              'Interest on NSC (80C)': this.filteredEmployees[idx].col_36,
              'Mutual Fund (80C)': this.filteredEmployees[idx].col_37,
              'Pension Fund (80CCC)': this.filteredEmployees[idx].col_38,
              'Sukanya Samridhi Scheme (80C)': this.filteredEmployees[idx].col_39,
              'KVP': this.filteredEmployees[idx].col_40,
              // 
              'Others': this.filteredEmployees[idx].col_41,
              'Stamp Duty': this.filteredEmployees[idx].col_42,
              'Metro': this.filteredEmployees[idx].is_metro,
              'Land Lord Name': this.filteredEmployees[idx].landlordname,
              'Land Lord Pancard': this.filteredEmployees[idx].landlordpancard,
              'Rent Paid': this.filteredEmployees[idx].rentpaid,
              'Income Previous Employer': this.filteredEmployees[idx].income_previous_employer,
              'Total Other Income': this.filteredEmployees[idx].total_otherincome,
              // 
              'Total Letout Income': this.filteredEmployees[idx].total_letoutincome,
              'Lender Pan Number': this.filteredEmployees[idx].lender_pannumber,
              'Lender Name': this.filteredEmployees[idx].lender_name,
              'Total Loss On Property': this.filteredEmployees[idx].totallossonproperty,
              'Professional Tax': this.filteredEmployees[idx].col_50,
              'Status': this.filteredEmployees[idx].regime_status,
              'Date Of Submission': this.filteredEmployees[idx].createdon,
            }
            exportData.push(obj);
          }
        }
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        downloadLink.download = 'Investment_Declaration_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
      }
    })
  }
  exportToExcelforemp(employeeData: any) {
    const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];

    // Projection sheet (same as before)
    const fields = employeeData.taxByMonth.fields.changingThisBreaksApplicationSecurity.split('<br>').map(f => f.trim());

    const monthValues = months.map(month => {
      const rawHtml = employeeData.taxByMonth[month] || '';
      const cleanHtml = rawHtml.replace(/<\/?span[^>]*>/g, '');
      return cleanHtml.split('<br>').map(v => v.trim());
    });

    const cumulativeRaw = employeeData.taxByMonth.totalgrossearning || '';
    const cumulativeClean = cumulativeRaw.replace(/<\/?span[^>]*>/g, '');
    const cumulativeValues = cumulativeClean.split('<br>').map(v => v.trim());

    const projectionData: any[][] = [];
    projectionData.push(['Fields', ...months.map(m => m.toUpperCase()), 'CUMULATIVE']);
    fields.forEach((field, idx) => {
      const row = [field];
      months.forEach((_, monthIdx) => {
        row.push(monthValues[monthIdx][idx] || '0');
      });
      row.push(cumulativeValues[idx] || '0');
      projectionData.push(row);
    });

    // Tax Projection sheet with custom headers
    const taxHeaders = [
      'Total Income',
      'Total Savings',
      'Taxable Income',
      'Net Payable Tax',
      'Tax Deducted',
      'Balance Tax',
      'Tax Slab',
    ];

    // Prepare tax projection values array (make sure order matches headers)
    const taxValues = [
      employeeData.taxprojection.totalincome,
      employeeData.taxprojection.totalsavings,
      employeeData.taxprojection.taxableincome,
      employeeData.taxprojection.netpayabletax,
      employeeData.taxprojection.taxdeducted,
      employeeData.taxprojection.balancetax,
      employeeData.taxprojection.taxslab,
    ];

    const totalIncomeHeaders = ['Income Head', 'Income Amount'];
    const totalIncomeRows = employeeData.totalincome.map(item => [item.incomehead, item.income]);
    const totalIncomeSheetData = [totalIncomeHeaders, ...totalIncomeRows];
    const wsTotalIncome = XLSX.utils.aoa_to_sheet(totalIncomeSheetData);

    const totalsvingHeaders = ['Saving Head', 'Saving', 'Status'];
    const totalsavingRows = employeeData.totalsaving.map(item => [item.savinghead, item.saving, item.approval_status]);
    const totalsavingSheetData = [totalsvingHeaders, ...totalsavingRows];
    const wsTotalsaving = XLSX.utils.aoa_to_sheet(totalsavingSheetData);


    const chaptersixcompHeaders = ['Component Name', 'Component Value(Declaration)', 'Component Value(Proof)', 'Status'];
    const chaptersixcompRows = employeeData.chaptersixcomp.map(item => [item.componentname, item.declr_amount, item.componentvalue, item.approval_status]);
    const chaptersixcompSheetData = [chaptersixcompHeaders, ...chaptersixcompRows];
    const wschaptersixcomp = XLSX.utils.aoa_to_sheet(chaptersixcompSheetData);


    const us80ccompHeaders = ['Component Name', 'Component Value(Declaration)', 'Component Value(Proof)', 'Status'];
    const us80ccompRows = employeeData.us80ccomp.map(item => [item.componentname, item.declr_amount, item.componentvalue, item.approval_status]);
    const us80ccompSheetData = [us80ccompHeaders, ...us80ccompRows];
    const wsus80ccomp = XLSX.utils.aoa_to_sheet(us80ccompSheetData);


    const flexiAllowancesHeaders = ['Component Name', 'Component Value(Declaration)', 'Component Value(Proof)', 'Status'];
    const flexiAllowancesRows = employeeData.flexiAllowances.map(item => [item.componentname, item.declr_amount, item.componentvalue, item.approval_status]);
    const flexiAllowancesSheetData = [flexiAllowancesHeaders, ...flexiAllowancesRows];
    const wsflexiAllowances = XLSX.utils.aoa_to_sheet(flexiAllowancesSheetData);


    // Compose tax projection sheet data (header row + data row)
    const taxProjectionSheetData = [taxHeaders, taxValues];

    // Create worksheets
    const wsProjection = XLSX.utils.aoa_to_sheet(projectionData);
    const wsTaxProjection = XLSX.utils.aoa_to_sheet(taxProjectionSheetData);

    // Create workbook and append sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsProjection, 'Projection');
    XLSX.utils.book_append_sheet(wb, wsTaxProjection, 'tax_projection');
    XLSX.utils.book_append_sheet(wb, wsTotalIncome, 'total_income');
    XLSX.utils.book_append_sheet(wb, wsTotalsaving, 'total_saving');
    XLSX.utils.book_append_sheet(wb, wschaptersixcomp, 'chapter_VI_components');
    XLSX.utils.book_append_sheet(wb, wsus80ccomp, 'us80ccomp');
    XLSX.utils.book_append_sheet(wb, wsflexiAllowances, 'flexiAllowances');

    // Write workbook and trigger download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EmployeeProjectionWithTaxProjection.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  Reset() {
    this.bankDetailsForm.reset();
    this.bankDetailsForm.patchValue({ financialyear: '' });
  }

  printPage() {

  }

  decodeHtmlContent(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  GetInvestmentTypeData() {
    this._ReportService.GetInvestmentDeclarationDate({
      "customerAccountId": this.tp_account_id.toString(),
      "financialYear": this.bankDetailsForm.get('financialyear')?.value,
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
  exporttax() {
    const removeHtmlTags = (input: string): string => input.replace(/<[^>]*>/g, '');
    const convertToMultilineText = (input: string = ''): string => removeHtmlTags(input).replaceAll('<br>', '\n');

    const singleRowObj = {
      'Employee Name': this.data.emp_name,
      'TP / Org Emp Code': this.data.orgempcode || this.data.tpcode,
      'Pan Card': this.data.pancard,
      'Fields': convertToMultilineText(this.data.fields),
      'Apr': convertToMultilineText(this.data.apr),
      'May': convertToMultilineText(this.data.may),
      'Jun': convertToMultilineText(this.data.jun),
      'Jul': convertToMultilineText(this.data.jul),
      'Aug': convertToMultilineText(this.data.aug),
      'Sep': convertToMultilineText(this.data.sep),
      'Oct': convertToMultilineText(this.data.oct),
      'Nov': convertToMultilineText(this.data.nov),
      'Dec': convertToMultilineText(this.data.dec),
      'Jan': convertToMultilineText(this.data.jan),
      'Feb': convertToMultilineText(this.data.feb),
      'Mar': convertToMultilineText(this.data.mar),
      'Cumulative': convertToMultilineText(this.data.totalgrossearning)
    };

    const exportData = [singleRowObj]; // single row

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    downloadLink.download = 'Single_Row_Tax_Report.xlsx';
    downloadLink.click();

  }
}
