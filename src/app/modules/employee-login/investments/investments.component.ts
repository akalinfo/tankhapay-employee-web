import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import { grooveState, dongleState } from 'src/app/app.animation';
import decode from 'jwt-decode';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';

@Component({
  selector: 'app-investments',
  templateUrl: './investments.component.html',
  styleUrls: ['./investments.component.css','../../employee-management/empl-investment/empl-investment.component.css'],
  animations: [grooveState, dongleState]
})
export class InvestmentsComponent {
  [x: string]: any;
  orgempCode: any;
  @Input() empDataFromParent: any;
  currentDate: any;
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
  regime_type: any;
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
  showTaxPopup: boolean = false;
  selectedReports: any[] = [];
  verify_Popup: boolean = false;
  filtered_data: any = [];
  current_year: any = [];
  Remark_Form: FormGroup;
  regimetype: any;
  upload_Popup: boolean = false;
  selectedFile: File | null = null;
  fileError: string = '';
  component_name: any;
  head_id: any;
  UploadInvestmentProof_Form: FormGroup;
  view_proof_popup: boolean = false;
  submitted: boolean = false;
  uploadHomeLoan_Popup: boolean = false;
  UploadHomeLoan_Form: FormGroup;
  uploadHRA_Popup: boolean = false
  UploadHRA_Form: FormGroup;
  InvestmentDeclaration_Form: FormGroup;
  declaration_Popup: boolean = false;
  isopenDeclarationProof: boolean = false

  HomeLoanDeclarationPopup: boolean = false;
  HomeLoanDeclaration_Form: FormGroup;

  addRentDeclarationForm : FormGroup;
  updateRentDeclarationForm : FormGroup;
  rentDetails :any = '';
  viewRentModalStatus :boolean = false;
  editRentModal:boolean = false;

  updateRentDetails :any = '';
  aboveOneLakh :any = true;
  finalSubmissionDate : any = '';

  tenureOptions = [
    { value: '1', label: 'Monthly' },
    { value: '2', label: 'Quarterly' },
    { value: '3', label: 'Half-Yearly' },
    { value: '4', label: 'Yearly' }
  ];

  fiscalYears: string[] = this.FinancialYears();
  declarationmessage: any = '';
  toDatefromMessage: any = '';
  saveRegime_Form: FormGroup;

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private _alertservice: AlertService,
    private _EmployeeManagementService: EmployeeManagementService) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    console.log(this.tp_account_id,'test')
    this.employer_name = this.token.name;
    // this.product_type = token.product_type;

    this.product_type = localStorage.getItem('product_type');
    const date = new Date();
    let currentMonth = date.getMonth();
    let startingYear = 2021;
    let currentYear = date.getFullYear();
    // console.log(this.empDataFromParent);

    this.bankDetailsForm = this._formBuilder.group({
      EmployeeCode: ['', [Validators.required]],
      financialyear: ['', [Validators.required]]
    });

    this.selected_date = localStorage.getItem('selected_date');
    // this.days_count = this.selected_date.split('-')[0];

    this.month = this.selected_date?.split('-')[1];
    this.year = this.selected_date?.split('-')[2];

    this.FinancialYears();
    this.addRemoveHide = false;

    this.Remark_Form = this._formBuilder.group({
      Remarks: ['', [Validators.required]],
    });

    this.UploadInvestmentProof_Form = this._formBuilder.group({
      receiptNumber: ['', [Validators.required]],
      receiptDate: ['', [Validators.required]],
      receiptAmount: ['', [Validators.required]],
      max_limit	: [''],
      headId: ['', [Validators.required]],
      investmentId: ['', [Validators.required]],
      enc_empCode: ['', [Validators.required]],
      receiptDoc: ['', [Validators.required]],
      originalDocumentName: ['', [Validators.required]],
      parentSeniorCitizen: [false],
      disabilityMoreThan80: [false],
      employeeWithSevereDisability: [false]

    })

    this.UploadHomeLoan_Form = this._formBuilder.group({
      enc_empCode: ['', [Validators.required]],
      loanAmount: ['', [Validators.required]],
      loanSanctionDate: ['', [Validators.required]],
      propertyValue: ['', [Validators.required]],
      nameOfOwner: ['', [Validators.required]],
      lenderName: ['', [Validators.required]],
      principalAmount: ['', [Validators.required]],
      interestAmount: ['', [Validators.required]],
      loanNo: ['', [Validators.required]],
      loanType: ['Personal', [Validators.required]],
      loanHolderType: ['Personal', [Validators.required]],
      loanHolderName: ['', [Validators.required]],
      lenderPannumber1: ['', [Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      lenderPannumber2: ['',[Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      lenderPannumber3: ['',[Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      lenderPannumber4: ['',[Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      receiptDoc: ['',[Validators.required]],
      originalDocumentName: ['', [Validators.required]],
      isFirstTimeBuyer: [false],
      isBefore01Apr1999: [false]
    }, { validators: this.propertyLoanValidator });

    this.UploadHRA_Form = this._formBuilder.group({
      headId: ['', [Validators.required]],
      enc_empCode: ['', [Validators.required]],
      tenureId: ['', [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: ['', [Validators.required]],
      receiptNo: ['', [Validators.required]],
      receiptDate: ['', [Validators.required]],
      rentAmount: ['', [Validators.required]],
      landLordName: ['', [Validators.required]],
      landLordAddress: ['', [Validators.required]],
      landLordPan: [''],
      receiptDoc: ['',[Validators.required]],
      originalDocumentName: ['', [Validators.required]],
    });

    this.UploadHRA_Form.get('rentAmount')?.valueChanges.subscribe(() => this.updatePanValidation());
    this.UploadHRA_Form.get('tenureId')?.valueChanges.subscribe(() => this.updatePanValidation());

    this.InvestmentDeclaration_Form = this._formBuilder.group({
      headId: ['', [Validators.required]],
      investment_id: ['', [Validators.required]],
      enc_empCode: ['', [Validators.required]],
      max_limit	: [''],
      investment_amount: ['', [Validators.required]],
      investment_comment: [''],
      // parentSeniorCitizen: [false],
      // disabilityMoreThan80: [false],
      // employeeWithSevereDisability: [false]

    })


    this.addRentDeclarationForm = this._formBuilder.group({
      'rentAmount':['', [Validators.required]],
      'landLordName':['', [Validators.required]],
      'landLordPan':['', [Validators.required]],
      'landLordAddress':['', [Validators.required]],
      'metroCity':['', [Validators.required]],
      
    })

    this.updateRentDeclarationForm = this._formBuilder.group({
      'rentAmount':['', [Validators.required]],
      'landLordName':['', [Validators.required]],
      'landLordPan':['', [Validators.required]],
      'landLordAddress':['', [Validators.required]],
      'metroCity':['', [Validators.required]],
      'indexValue':['', [Validators.required]],
    })

    this.HomeLoanDeclaration_Form = this._formBuilder.group({
      enc_empCode: ['', [Validators.required]],
      loanAmount: ['', [Validators.required]],
      loanSanctionDate: ['', [Validators.required]],
      propertyValue: ['', [Validators.required]],
      homeAddress: [''],
      lenderName: ['', [Validators.required]],
      interestOnBorrowedCapital: ['', [Validators.required]],
      principalOnBorrowedCapital: ['', [Validators.required, this.validateInterestAmount.bind(this)]],
      lenderPannumber1: ['', [Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      lenderPannumber2: ['', [Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      lenderPannumber3: ['', [Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      lenderPannumber4: ['', [Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]],
      isFirstTimeBuyer: [false],
      isBefore01Apr1999: [false]
    });

    this.HomeLoanDeclaration_Form.get('isBefore01Apr1999')?.valueChanges.subscribe((isChecked) => {
      let interestOnBorrowedCapital_value = this.HomeLoanDeclaration_Form.get('interestOnBorrowedCapital').value;
      let principalOnBorrowedCapital_value = this.HomeLoanDeclaration_Form.get('principalOnBorrowedCapital').value;
      if (isChecked) {
        if (interestOnBorrowedCapital_value >= 30000) {
          if (principalOnBorrowedCapital_value <= 30000) {
            this.HomeLoanDeclaration_Form.get('principalOnBorrowedCapital')?.setValue(principalOnBorrowedCapital_value);
          } else {
            this.HomeLoanDeclaration_Form.get('principalOnBorrowedCapital')?.setValue(30000);
          }
        } else {
          this.HomeLoanDeclaration_Form.get('principalOnBorrowedCapital')?.setValue(interestOnBorrowedCapital_value);
        }
      } else {
        if (interestOnBorrowedCapital_value >= 200000) {
          if (principalOnBorrowedCapital_value <= 200000) {
            this.HomeLoanDeclaration_Form.get('principalOnBorrowedCapital')?.setValue(principalOnBorrowedCapital_value);
          } else {
            this.HomeLoanDeclaration_Form.get('principalOnBorrowedCapital')?.setValue(200000);
          }
        } else {
          this.HomeLoanDeclaration_Form.get('principalOnBorrowedCapital')?.setValue(interestOnBorrowedCapital_value);
        }

      }
    });

    this.saveRegime_Form = this._formBuilder.group({
      taxRegime: [this.regimetype, [Validators.required]]
    });

    // this.HomeLoanDeclaration_Form.get('interestOnBorrowedCapital')?.valueChanges.subscribe((value) => {
    //   const interestValue = value ? Number(value) : 0; // Ensure numeric value
    //   const isBefore1999 = this.HomeLoanDeclaration_Form.get('isBefore01Apr1999')?.value;
    //   const maxLimit = isBefore1999 ? 30000 : 200000;
  
    //   // Set value for principalOnBorrowedCapital when interestOnBorrowedCapital changes
    //   this.HomeLoanDeclaration_Form.get('principalOnBorrowedCapital')?.setValue(
    //     Math.min(interestValue, maxLimit),
    //     { emitEvent: false } // Prevents infinite loop
    //   );
    // });

    this.filterStatus = 'taxreport';
    const now = new Date();
    const current_month = now.getMonth() + 1;
    this.current_year =
      current_month >= 4 ? `${now.getFullYear()}-${(now.getFullYear() + 1)}` : `${now.getFullYear() - 1}-${now.getFullYear()}`;
    this.bankDetailsForm.patchValue({ financialyear: this.current_year });
    this.InvestmentReport(this.filterStatus);

    }

  
  // FinancialYears(startingYear: number, currentYear: number) {
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
    const start = startingYear || (current - 3); // Default to 3 years ago if not provided

    if (start > current) {
      throw new Error("Starting year cannot be greater than the current year.");
    }
    const fiscalYears: string[] = [];
    for (let i = start; i <= current; i++) {
      const nextYear = i + 1;
      this.finYear = `${i}-${nextYear}`; // Format as full four-digit years
      fiscalYears.push(this.finYear);
    }

    return fiscalYears;
  }


  onRadioChange(filter: any) {
    this.filterStatus = filter.target.value;
    this.InvestmentReport(this.filterStatus);
  }

  InvestmentReport(filter: any) {
    let filter_status = filter;
    this._ReportService.InvestmentReportResultApi({
      "customerAccountId": this.tp_account_id?.toString(),
      "financialYear": this.bankDetailsForm.get('financialyear')?.value,
      "filterStatus": filter_status,
      "empCode": this.empDataFromParent?.emp_code.toString(),
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = resData.commonData;
        this.filteredEmployees = this.data;
        this.emp_name = this.data[0].emp_name;
        this.emp_code = this.data[0].emp_code;

      } else {
        this.data = [];
        this.filteredEmployees = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }


  isAnyCheckboxChecked() {
    return this.selectedReports.length > 0;
  }

  GetTaxProjection(taxByMonth_data: any) {
    this.viewFinYear = this.bankDetailsForm.get('financialyear').value;
    const [start, end] = this.bankDetailsForm.get('financialyear').value.split('-').map(year => parseInt(year, 10));
    this.start=start + 1;
    this.end=end + 1;
    this.showTaxPopup = true;
    this.Employee_name = taxByMonth_data?.emp_name;
    this.Employee_code = taxByMonth_data?.emp_code;
    this.orgempCode = taxByMonth_data?.orgempcode || taxByMonth_data?.tpcode;

    const employeeCode = this.Employee_code?.toString() || this.empDataFromParent?.emp_code.toString();
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
        this.taxByMonth_data = this.tax_data?.taxByMonth || {};

        // this.taxByMonth_data["fields"]=this.sanitizer.bypassSecurityTrustHtml(this.taxByMonth_data["fields"]?.replaceAll('"',''));
        if (this.taxByMonth_data?.fields) {
          this.taxByMonth_data["fields"] = this.sanitizer.bypassSecurityTrustHtml(
            this.taxByMonth_data["fields"].replaceAll('"', '')
          );
        }
        this.taxprojection_data = this.tax_data?.taxprojection;
        this.regimetype = this.taxprojection_data?.regimetype;
        this.saveRegime_Form.patchValue({ taxRegime: this.regimetype });
        this.totalincome_data = this.tax_data?.totalincome;
        // console.log(this.totalincome_data);
        this.totalsaving_data = this.tax_data?.totalsaving;
        this.chaptersixcomp_data = this.tax_data?.chaptersixcomp;
        this.us80ccomp_data = this.tax_data?.us80ccomp;
        this.flexiallowancecomp_data = this.tax_data.flexiAllowances;
        //  this.toastr.success(resData.message, 'Success');
        this.parentSeniorCitizenChecked = this.chaptersixcomp_data?.some(
          (item: any) => item.investment_id === 3 && item.declr_amount > 0
        );
        
        this.disabilityMoreThan80Checked = this.chaptersixcomp_data?.some(
          (item: any) => item.investment_id === 8 && item.declr_amount > 0
        );
        
        this.employeeWithSevereDisabilityChecked = this.chaptersixcomp_data?.some(
          (item: any) => item.investment_id === 18 && item.declr_amount > 0
        );
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
      this.GetEmpRegimeAndTaxProjection(taxByMonth_data)
    });
  }

  closeTaxProjection() {
    this.showTaxPopup = false;
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  Reset() {
    this.bankDetailsForm.reset();
  }

  // add by akchhaya 23-01-2025
  GetInvestmentsProof(emp_code: any) {

    this._ReportService.GetInvestmentsProofDetails({
      "customerAccountId": this.tp_account_id.toString(),
      "financialYear": this.bankDetailsForm.get('financialyear').value,
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

  // Implement your selectAll function
  selectAll(event: any) {
    this.header_checkbox = event.target.checked;

    if (this.header_checkbox) {
      // Select all rows based on a condition (e.g., status === 'pending')
      this.Inv_data.forEach(row => row.isSelected = true);
    } else {
      // Deselect all rows
      this.Inv_data.forEach(row => row.isSelected = false);
    }

    // Update the UI and handle the selected data
    // this.VerifyInvestmentProof('', this.getSelectedRows());
  }

  // Implement your onCheckbox_Change function
  onCheckbox_Change(event: any, row: any, index: any) {
    row.isSelected = event.target.checked;

    // Check if all rows are selected or not
    this.header_checkbox = this.Inv_data.every(row => row.isSelected);

    // Send only the data of checked rows
    // this.VerifyInvestmentProof('', this.getSelectedRows());
  }

  isAnyCheckboxCheckedProof(): boolean {
    return this.Inv_data.some(row => row.isSelected);
  }

  // Helper function to get selected rows
  getSelectedRows(): any[] {
    return this.Inv_data.filter(row => row.isSelected);
  }

  VerifyInvestmentProof(status: any, emp_code: any) {
    this.checked_row_data = this.getSelectedRows();
    if (status === 'R') {
      // Check if Remarks field is empty
      if (this.Remark_Form.get('Remarks')?.value.trim() === '') {
        alert('Please Enter Remarks.');
        return;
      }
    }
    // return;
    this._ReportService.VerifyInvestmentProofDetails({
      "customerAccountId": this.tp_account_id?.toString(),
      "userId": this.tp_account_id?.toString(),
      "investmentsProofDetails": this.checked_row_data,
      "verificationStatus": status,
      "remarks": this.Remark_Form.get('Remarks')?.value,
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.Verify_Inv_data = resData.commonData;
        this.GetInvestmentsProof(emp_code);
        this.toastr.success(resData.message, 'Success');
        this.close_popup();
      } else {
        this.Verify_Inv_data = [];
        this.show_label = false;
        this.toastr.error(resData.message, 'Oops!');
      }
    });
  }

  open_verify_Popup() {
    this.GetInvestmentsProof(this.emp_code);
    this.verify_Popup = true;
  }
  close_popup() {
    this.verify_Popup = false;
  }

  updateRegimeStatusConfirmation(){
    const confirmChange = confirm(`Are you sure, you want to change the Regime?`);
    if (confirmChange) {

    }else{   
      event.preventDefault();   
      this.regimetype=this.taxprojection_data?.regimetype;
    }
  }
  // add by akkchhaya on 19-02-2025 start
  updateRegimeStatus() {
    
    let formData = this.saveRegime_Form.value;
    // console.log(formData); return;
    let regimeType = formData.taxRegime.toString();
    let empCode = this.taxByMonth_data?.mobile + "CJHUB" + this.taxByMonth_data?.emp_code + "CJHUB" + this.taxByMonth_data?.dateofbirth;
    const confirmChange = confirm(`Are you sure, you want Submit?`);
    if (confirmChange) {
      this.isModalOpen = false;
      this.regimetype = regimeType;
      this._EmployeeManagementService.SaveEmpRegime({
        "empCode": this._EncrypterService.aesEncrypt(empCode.toString()),
        "financialYear": this.bankDetailsForm.get('financialyear')?.value,
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
        "regimeType": regimeType,
        "createdBy": this.empDataFromParent.emp_code?.toString(),
        "createdByIp": "",
        "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
        "uploadByUserType": "Employee"
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
        this.GetEmpRegimeAndTaxProjection(this.taxByMonth_data)
        // this.closeTaxProjectionModal();
      });

    }else{   
      event.preventDefault();   
      this.regimetype=this.taxprojection_data?.regimetype;
    }
  }



  // add by akkchhaya on 19-02-2025 end
  Upload_proof_popup(income: any, taxByMonth_data: any) {
    let approval_status = income?.approval_status;
    if(approval_status === 'A'){
      alert("Already approved! Updates are not allowed.");
      return;
    }else{
      this.component_name = income?.componentname;
      this.head_id = income?.headid;
      let empCode = taxByMonth_data?.mobile + "CJHUB" + taxByMonth_data?.emp_code + "CJHUB" + taxByMonth_data?.dateofbirth;
      this.UploadInvestmentProof_Form.patchValue({
        headId: income?.headid.toString(),
        investmentId: income?.investment_id,
        enc_empCode: this._EncrypterService.aesEncrypt(empCode.toString()),
        max_limit: income?.max_limit,

      });
      this.upload_Popup = true;
    }


  }

  close_proof_popup() {
    this.upload_Popup = false;
    this.submitted = false;
    this.resetFileSelection();
    this.UploadInvestmentProof_Form.reset();
  }

  onFileSelected(event: Event, formName: string) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.fileError = 'No file selected.';
      return;
    }

    const file = input.files[0];
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (!allowedTypes.includes(file.type)) {
      this.fileError = 'Invalid file type! Only PDF, PNG, JPG, and JPEG are allowed.';
      this.selectedFile = null;
      return;
    }

    if (file.size > maxSize) {
      this.fileError = 'File size must be less than 1MB.';
      this.selectedFile = null;
      return;
    }

    this.fileError = ''; // Clear error
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImage = e.target.result;
      const updateData = {
        receiptDoc: e.target.result, // Base64 string
        originalDocumentName: file.name, // Store file name
      };

      switch (formName) {
        case 'UploadInvestmentProof_Form':
          this.UploadInvestmentProof_Form.patchValue(updateData);
          break;
        case 'UploadHomeLoan_Form':
          this.UploadHomeLoan_Form.patchValue(updateData);
          break;
        case 'UploadHRA_Form':
          this.UploadHRA_Form.patchValue(updateData);
          break;
        default:
          console.warn('Unknown form:', formName);
      }

      // this.UploadInvestmentProof_Form.patchValue({
      //   receiptDoc: e.target.result, // Base64 string
      //   originalDocumentName: file.name, // Store file name
      // });
    };
    reader.onerror = (error) => {
      console.error('Error converting file to Base64:', error);
      this.fileError = 'File could not be processed.';
    };
    reader.readAsDataURL(file);
  }

  get_investment_type(head_id: any): string {
    if (head_id == 1) {
      return 'Chapter VI';
    } else if (head_id == 2) {
      return 'U/S 80C'; // Add meaningful values
    } else if (head_id == 10) {
      return 'Flexi Allowance'; // Add meaningful values
    } else {
      return ''; // Default return value
    }
  }

  SaveInvestmentProofDocuments() {
    this.submitted = true;
    if (this.UploadInvestmentProof_Form.valid) {
      let formData = this.UploadInvestmentProof_Form.value;
      if (formData?.headId.toString() === "1") {
        this.SaveCH6InvestmentProof();
      } else if (["2", "10"].includes(formData?.headId.toString())) {
        this.Save80CInvestmentProof();
      }
    }
  }

  Save80CInvestmentProof() {
    let formData = this.UploadInvestmentProof_Form.value;
    if (formData?.max_limit !== undefined && formData?.max_limit > 0 && (formData?.max_limit !== null || formData?.max_limit !== '')) {
      const maxLimit = Number(formData.max_limit);
      const investmentAmount = Number(formData.receiptAmount);
      if (!isNaN(maxLimit) && investmentAmount > maxLimit) {
        alert('Please enter an investment amount less than or equal to the max limit of ' + maxLimit + '.');
        return;
      }
    }
    let base64Image = formData?.receiptDoc;
    let documentBase64 = base64Image.split(',')[1];
    this._EmployeeManagementService.Save80cComponents({
      "empCode": formData?.enc_empCode,
      "financialYear": this.bankDetailsForm.get('financialyear')?.value,
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
      "headId": this._EncrypterService.aesEncrypt(formData?.headId.toString()),
      "createdByIp": "",
      "createdBy": this.tp_account_id?.toString(),
      "investmentId": formData?.investmentId.toString(),
      "investmentComment": "Bussiness",
      "receiptNumber": formData?.receiptNumber.toString(),
      "receiptDate": this.convertDateFormat(formData?.receiptDate),
      "receiptAmount": formData?.receiptAmount.toString(),
      "documentBase64": documentBase64.toString(),
      "originalDocumentName": formData?.originalDocumentName.toString(),
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
      "uploadByUserType": "Employer"
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message, 'Success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
      this.UploadInvestmentProof_Form.reset();
      this.upload_Popup = false;
      this.submitted = false;
      this.resetFileSelection();
      this.GetTaxProjection(this.taxByMonth_data)
    });

  }

  SaveCH6InvestmentProof() {
    let formData = this.UploadInvestmentProof_Form.value;
    if (formData?.max_limit !== undefined && formData?.max_limit > 0 && (formData?.max_limit !== null || formData?.max_limit !== '')) {
      const maxLimit = Number(formData.max_limit);
      const investmentAmount = Number(formData.receiptAmount);
      if (!isNaN(maxLimit) && investmentAmount > maxLimit) {
        alert('Please enter an investment amount less than or equal to the max limit of ' + maxLimit + '.');
        return;
      }
    }
    let base64Image = formData?.receiptDoc;
    let documentBase64 = base64Image.split(',')[1];
    this._EmployeeManagementService.saveCH6ProofDetails({
      "empCode": formData?.enc_empCode,
      "financialYear": this.bankDetailsForm.get('financialyear')?.value,
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
      "headId": this._EncrypterService.aesEncrypt(formData?.headId.toString()),
      "createdByIp": "",
      "createdBy": this.tp_account_id?.toString(),
      "investmentId": formData?.investmentId.toString(),
      "investmentComment": "Bussiness",
      "receiptNumber": formData?.receiptNumber.toString(),
      "receiptDate": this.convertDateFormat(formData?.receiptDate),
      "receiptAmount": formData?.receiptAmount.toString(),
      "documentBase64": documentBase64.toString(),
      "originalDocumentName": formData?.originalDocumentName.toString(),
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
      "uploadByUserType": "Employer",
      "parentSeniorCitizen": formData?.parentSeniorCitizen ? "Y" : "N",
      "disabilityMoreThan80": formData?.disabilityMoreThan80 ? "Y" : "N",
      "employeeWithSevereDisability": formData?.employeeWithSevereDisability ? "Y" : "N",
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message, 'Success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
      this.UploadInvestmentProof_Form.reset();
      this.upload_Popup = false;
      this.submitted = false;
      this.resetFileSelection();
      this.GetTaxProjection(this.taxByMonth_data)
    });

  }

  view_proof(income: any, emp_code: any) {
    console.log(income)
    this.GetViewInvestmentsProof(income, emp_code)
    this.view_proof_popup = true;
  }

  close_view_proof() {
    this.view_proof_popup = false;
  }

  GetViewInvestmentsProof(income: any, emp_code: any) {
    this._EmployeeManagementService.GetViewInvestmentsProof({
      "customerAccountId": this.tp_account_id.toString(),
      "financialYear": this.bankDetailsForm.get('financialyear').value,
      "empCode": emp_code.toString(),
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : '',
      "headId": income?.headid.toString(),
      "investmentId": income?.investment_id ? income?.investment_id.toString() : "-9999",
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

  convertDateFormat(inputDate: string): string {
    const date = new Date(inputDate);

    // Get day, month, and year
    const day = ('0' + date.getDate()).slice(-2); // Adds leading zero if single digit
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Month is 0-indexed, so add 1
    const year = date.getFullYear();

    // Format as dd/mm/yyyy
    return `${day}/${month}/${year}`;
  }

  restrictToNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  resetFileSelection() {
    this.selectedFile = null;
    this.fileError = '';

    // Reset file input
    const fileInput = document.getElementById('receiptDoc') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  propertyLoanValidator(group: AbstractControl) {
    const propertyValue = Number(group.get('propertyValue')?.value);
    const loanAmount = Number(group.get('loanAmount')?.value);
    return propertyValue >= loanAmount ? null : { propertyLessThanLoan: true };
  }

  Upload_Homeloan_popup(income: any, taxByMonth_data: any) {
    this.component_name = income?.componentname;
    this.head_id = income?.headid;
    let empCode = taxByMonth_data?.mobile + "CJHUB" + taxByMonth_data?.emp_code + "CJHUB" + taxByMonth_data?.dateofbirth;
    this.UploadHomeLoan_Form.patchValue({
      enc_empCode: this._EncrypterService.aesEncrypt(empCode.toString()),

    });
    this.uploadHomeLoan_Popup = true;
  }
  closeHomeload_popup() {
    this.uploadHomeLoan_Popup = false;
    this.submitted = false;
    this.resetFileSelection();
    this.UploadHomeLoan_Form.reset();
  }

  SaveHomeLoanDocuments() {
    this.submitted = true;
    this.UploadHomeLoan_Form.updateValueAndValidity(); 
    console.log(this.UploadHomeLoan_Form)
    if (this.UploadHomeLoan_Form.valid) {
      let formData = this.UploadHomeLoan_Form.value;
      let base64Image = formData?.receiptDoc;
      let documentBase64 = base64Image.split(',')[1];
      this._EmployeeManagementService.saveHomeLoanDetails({
        "empCode": formData?.enc_empCode,
        "financialYear": this.bankDetailsForm.get('financialyear')?.value,
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
        "createdByIp": "",
        "createdBy": this.tp_account_id?.toString(),
        "loanAmount": formData?.loanAmount.toString(),
        "loanSanctionDate": this.convertDateFormat(formData?.loanSanctionDate),
        "propertyValue": formData?.propertyValue.toString(),
        "homeAddress": formData?.homeAddress,
        "nameOfOwner": formData?.nameOfOwner.toString(),
        "lenderName": formData?.lenderName.toString(),
        "isFirstTimeBuyer": formData?.isFirstTimeBuyer ? "Y" : "N",
        "principalAmount": formData?.principalAmount.toString(),
        "interestAmount": formData?.interestAmount.toString(),
        "isBefore01Apr1999": formData?.isBefore01Apr1999 ? "Y" : "N",
        "loanNo": formData?.loanNo.toString(),
        "loanType": formData?.loanType.toString(),
        "loanHolderType": formData?.loanHolderType.toString(),
        "loanHolderName": formData?.loanHolderName.toString(),
        "documentBase64": documentBase64.toString(),
        "originalDocumentName": formData?.originalDocumentName.toString(),
        "lenderPannumber1": formData?.lenderPannumber1.toString(),
        "lenderPannumber2": formData?.lenderPannumber2.toString(),
        "lenderPannumber3": formData?.lenderPannumber3.toString(),
        "lenderPannumber4": formData?.lenderPannumber4.toString(),
        "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
        "uploadByUserType": "Employer",
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
        this.UploadHomeLoan_Form.reset();
        this.uploadHomeLoan_Popup = false;
        this.submitted = false;
        this.resetFileSelection();
        this.GetTaxProjection(this.taxByMonth_data)
      });
    }else {
      if (this.UploadHomeLoan_Form.errors?.propertyLessThanLoan) {
        alert('❌ Property value must be greater than or equal to the loan amount.');
      }
    }
  }

  validatePAN(pan: any) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }

  // start HRA Code 
  Upload_HRAproof_popup(income: any, taxByMonth_data: any) {
    this.component_name = income?.componentname;
    this.head_id = income?.headid;
    let empCode = taxByMonth_data?.mobile + "CJHUB" + taxByMonth_data?.emp_code + "CJHUB" + taxByMonth_data?.dateofbirth;
    this.UploadHRA_Form.patchValue({
      headId: income?.headid.toString(),
      enc_empCode: this._EncrypterService.aesEncrypt(empCode.toString()),

    });
    this.uploadHRA_Popup = true;
  }

  close_HRAproof_popup() {
    this.uploadHRA_Popup = false;
    this.submitted = false;
    this.resetFileSelection();
    this.UploadHRA_Form.reset();

  }

  SaveHRADocuments() {
    this.submitted = true;
    if (this.UploadHRA_Form.valid) {
      let formData = this.UploadHRA_Form.value;
      let base64Image = formData?.receiptDoc;
      let documentBase64 = base64Image.split(',')[1];
      this._EmployeeManagementService.saveHraProof({
        "empCode": formData?.enc_empCode,
        "financialYear": this.bankDetailsForm.get('financialyear')?.value,
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
        "createdByIp": "",
        "createdBy": this.tp_account_id?.toString(),
        "headId": this._EncrypterService.aesEncrypt(formData?.headId.toString()),
        "tenureId": formData?.tenureId.toString(),
        "fromDate": this.convertDateFormat(formData?.fromDate),
        "toDate": this.convertDateFormat(formData?.toDate),
        "receiptNo": formData?.receiptNo.toString(),
        "receiptDate": this.convertDateFormat(formData?.receiptDate),
        "rentAmount": formData?.rentAmount.toString(),
        "landLordName": formData?.landLordName.toString(),
        "landLordAddress": formData?.landLordAddress.toString(),
        "landLordPan": formData?.landLordPan.toString(),
        "documentBase64": documentBase64.toString(),
        "originalDocumentName": formData?.originalDocumentName.toString(),
        "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
        "uploadByUserType": "Employer",
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
        this.UploadHRA_Form.reset();
        this.submitted = false;
        this.uploadHRA_Popup = false;
        this.resetFileSelection();
        this.GetTaxProjection(this.taxByMonth_data)
      });
    }
  }

  updatePanValidation() {
    const rentAmount = Number(this.UploadHRA_Form.get('rentAmount')?.value);
    const tenureId = Number(this.UploadHRA_Form.get('tenureId')?.value);
    
    let yearlyRent = 0;
    if (tenureId === 1) yearlyRent = rentAmount * 12;
    else if (tenureId === 2) yearlyRent = rentAmount * 4;
    else if (tenureId === 3) yearlyRent = rentAmount * 2;
    else if (tenureId === 4) yearlyRent = rentAmount;

    // PAN required only if yearly rent exceeds 100000
    if (yearlyRent > 100000) {
      this.UploadHRA_Form.get('landLordPan')?.setValidators([Validators.required, Validators.pattern('[A-Z]{5}[0-9]{4}[A-Z]{1}')]);
    } else {
      this.UploadHRA_Form.get('landLordPan')?.clearValidators();
    }
    
    this.UploadHRA_Form.get('landLordPan')?.updateValueAndValidity();
  }

  GetEmpRegimeAndTaxProjection(taxByMonth_data: any) {
    let empCode = taxByMonth_data?.mobile + "CJHUB" + taxByMonth_data?.emp_code + "CJHUB" + taxByMonth_data?.dateofbirth;

    this._EmployeeManagementService.GetEmpRegimeAndTaxProjection({
      "empCode": this._EncrypterService.aesEncrypt(empCode.toString()),
      "financialYear": this.bankDetailsForm.get('financialyear')?.value,
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
        let commonData = JSON.parse(resultJson);
        this.declaration_or_proof = commonData.regimeDetails.declaration_or_proof;
        this.regime_type = commonData.regimeDetails.regimetype;
        this.finalSubmissionDate = commonData.regimeDetails.final_submit_date;
        this.isopenDeclarationProof = this.checkInvestmentDeclarationStatus(commonData.regimeDetails.declarationmessage,commonData.regimeDetails.final_submit_date);
        this.declarationmessage = commonData.regimeDetails.declarationmessage;
      } else {
        this.declaration_or_proof = [];
        this.this.regime_type = [];
        this.isopenDeclarationProof = false;
        this.declarationmessage  = '';
      }
    });
  }

  InvestmentDeclarationPopup(income: any, taxByMonth_data: any) {
    let approval_status = income?.approval_status;
    if(approval_status === 'A'){
      alert("Already approved! Updates are not allowed.");
      return;
    }else{
      this.component_name = income?.componentname;
      this.head_id = income?.headid;
      let empCode = taxByMonth_data?.mobile + "CJHUB" + taxByMonth_data?.emp_code + "CJHUB" + taxByMonth_data?.dateofbirth;
      this.InvestmentDeclaration_Form.patchValue({
        headId: income?.headid.toString(),
        investment_id: income?.investment_id,
        investment_amount: income?.declr_amount,
        enc_empCode: this._EncrypterService.aesEncrypt(empCode.toString()),
        max_limit: income?.max_limit

      });
      this.declaration_Popup = true;
    }

  }
  close_declaration_popup() {
    this.declaration_Popup = false;
  }

  SaveInvestmentDeclaration() {
    let formData = this.InvestmentDeclaration_Form.value;
    if (formData?.max_limit !== undefined && formData?.max_limit > 0 && (formData?.max_limit !== null || formData?.max_limit !== '')) {
      const maxLimit = Number(formData.max_limit);
      const investmentAmount = Number(formData.investment_amount);
      if (!isNaN(maxLimit) && investmentAmount > maxLimit) {
        alert('Please enter an investment amount less than or equal to the max limit of ' + maxLimit + '.');
        return;
      }
    }
    
    let parentSeniorCitizen = formData.investment_id === 3 ? "Y" : "N";
    let disabilityMoreThan80 = formData.investment_id === 8 ? "Y" : "N";
    let employeeWithSevereDisability = formData.investment_id === 18 ? "Y" : "N";

    this._EmployeeManagementService.SaveEmpInvestmentDeclaration({
      "empCode": formData?.enc_empCode,
      "financialYear": this.bankDetailsForm.get('financialyear')?.value,
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
      "headId": formData?.headId.toString(),
      "createdByIp": "",
      "createdBy": this.tp_account_id?.toString(),
      "investmentDetail":  this.createInvestmentDetail(formData).toString(),
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
      "parentSeniorCitizen": parentSeniorCitizen,
      "disabilityMoreThan80": disabilityMoreThan80,
      "employeeWithSevereDisability": employeeWithSevereDisability,
      "isSingleEntry": "Y"
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message, 'Success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
      this.InvestmentDeclaration_Form.reset();
      this.declaration_Popup = false;
      this.GetTaxProjection(this.taxByMonth_data)
    });

  }

  createInvestmentDetail(formData: any): string {
    if (!formData || typeof formData !== 'object') {
      console.error("Invalid formData:", formData);
      return "{}"; // Return an empty JSON object if formData is invalid
    }
    return JSON.stringify([{
      investment_id: formData?.investment_id?.toString() || "",
      investment_comment: "Business",
      investment_amount: formData?.investment_amount?.toString() || "0"
    }]);
  }

  checkInvestmentDeclarationStatus(message: string, submissionDate: string = ''): boolean {
    // Regular expression to extract dates in DD/MM/YYYY format
    const dateRegex = /(\d{2}\/\d{2}\/\d{4})/g;
    const dates = message.match(dateRegex);

    if (dates && dates.length === 2) {
      const fromDateStr = dates[0]; // e.g., 01/01/2025
      const toDateStr = dates[1];   // e.g., 28/02/2025

      // Parse from and to dates
      const [fromDay, fromMonth, fromYear] = fromDateStr.split('/').map(Number);
      const [toDay, toMonth, toYear] = toDateStr.split('/').map(Number);
      const fromDate = new Date(fromYear, fromMonth - 1, fromDay);
      const toDate = new Date(toYear, toMonth - 1, toDay, 23, 59, 59); // end of day
      this.toDatefromMessage = toDateStr;
      const currentDate = new Date();
      // If a submission date is provided, parse and validate it
      if (submissionDate) {
        console.log(submissionDate);
        submissionDate = submissionDate.split(" ")[0];
        const [subDay, subMonth, subYear] = submissionDate.split('/').map(Number);
        const subDate = new Date(subYear, subMonth - 1, subDay);
        // If submission date is within range, return false
        if (subDate >= fromDate && subDate <= toDate) {
          return false;
        }
      }
      // If submissionDate not in range, check if declaration is still open
      return toDate >= currentDate && fromDate <= currentDate;
    } else {
      return false; // Invalid message format
    }
  }

  decodeHtmlContent(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  OpenHomeLoanDeclarationPopup(income: any, taxByMonth_data: any){
    let emp_name = taxByMonth_data?.emp_name;
    this.head_id = income?.headid;
    let empCode = taxByMonth_data?.mobile + "CJHUB" + taxByMonth_data?.emp_code + "CJHUB" + taxByMonth_data?.dateofbirth;
    this.GetHomeLoanDetails(empCode);
    this.HomeLoanDeclaration_Form.patchValue({
      enc_empCode: this._EncrypterService.aesEncrypt(empCode.toString()),
      lenderName: emp_name,
    });
    this.HomeLoanDeclarationPopup = true;
  }
  closeHomeloadDeclaration_popup() {
    this.HomeLoanDeclarationPopup = false;
    this.submitted = false;
    this.HomeLoanDeclaration_Form.reset();
  }

  SaveHomeLoanDeclaration() {
    this.submitted = true;
    if (this.HomeLoanDeclaration_Form.valid) {
      let formData = this.HomeLoanDeclaration_Form.value;
      if (Number(formData.propertyValue) < Number(formData.loanAmount)) {
        alert('❌ Property value must be greater than or equal to the loan amount.');
        return;
      }
      this._EmployeeManagementService.SaveHomeLoanDeclaration({
        "empCode": formData?.enc_empCode,
        "financialYear": this.bankDetailsForm.get('financialyear')?.value,
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
        "createdByIp": "",
        "createdBy": this.tp_account_id?.toString(),
        "loanAmount": formData?.loanAmount.toString(),
        "loanSanctionDate": this.convertDateFormat(formData?.loanSanctionDate),
        "propertyValue": formData?.propertyValue.toString(),
        "homeAddress": formData?.homeAddress,
        "lenderName": formData?.lenderName.toString(),
        "isFirstTimeBuyer": formData?.isFirstTimeBuyer ? "Y" : "N",
        "principalOnBorrowedCapital": formData?.principalOnBorrowedCapital.toString(),
        "interestOnBorrowedCapital": formData?.interestOnBorrowedCapital.toString(),
        "isBefore01Apr1999": formData?.isBefore01Apr1999 ? "Y" : "N",
        "lenderPannumber1": formData?.lenderPannumber1.toString(),
        "lenderPannumber2": formData?.lenderPannumber2.toString(),
        "lenderPannumber3": formData?.lenderPannumber3.toString(),
        "lenderPannumber4": formData?.lenderPannumber4.toString(),
        "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
        // "uploadByUserType": "Employer",
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
        this.GetTaxProjection(this.taxByMonth_data)
        this.HomeLoanDeclaration_Form.reset();
        this.HomeLoanDeclarationPopup = false;
        this.submitted = false;
      });
    } 
  }

  GetHomeLoanDetails(empCode: any){
    this._EmployeeManagementService.GetHomeLoanDetails({
      "empCode": this._EncrypterService.aesEncrypt(empCode.toString()),
      "financialYear": this.bankDetailsForm.get('financialyear')?.value,
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
        let commonData = JSON.parse(resultJson);
        console.log(commonData,'tets')
        if (commonData) {
          this.HomeLoanDeclaration_Form.patchValue({
            loanAmount: commonData?.loan_amount ? String(commonData.loan_amount) : '',
            loanSanctionDate: commonData?.loan_sanction_date ? this.convertToDateFormat(commonData.loan_sanction_date) : '',
            propertyValue: commonData?.property_value ? String(commonData.property_value) : '',
            homeAddress: commonData?.homeAddress ? String(commonData.homeAddress) : '',
            lenderName: commonData?.lender_name ? String(commonData.lender_name) : '',
            isFirstTimeBuyer: commonData?.is_firsttymebuyer === "Y",  // Convert "Y"/"N" to Boolean
            principalOnBorrowedCapital: commonData?.principal_on_borrowed_capital ? String(commonData.principal_on_borrowed_capital) : '',
            interestOnBorrowedCapital: commonData?.interest_on_borrowed_capital ? String(commonData.interest_on_borrowed_capital) : '',
            isBefore01Apr1999: commonData?.isbefore01apr1999 === "Y", // Convert "Y"/"N" to Boolean
            lenderPannumber1: commonData?.lender_pannumber1 ? String(commonData.lender_pannumber1) : '',
            lenderPannumber2: commonData?.lender_pannumber2 ? String(commonData.lender_pannumber2) : '',
            lenderPannumber3: commonData?.lender_pannumber3 ? String(commonData.lender_pannumber3) : '',
            lenderPannumber4: commonData?.lender_pannumber4 ? String(commonData.lender_pannumber4) : '',
          });
        }      
      } else {
        this.commonData = [];
      }
    });
  }

  convertToDateFormat(dateStr: string): string {
    if (!dateStr) return '';  // Handle empty date case
  
    let parts = dateStr.split('/'); // Split by "/"
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`; // Rearrange to YYYY-MM-DD
    }
  
    return ''; // Return empty string if format is incorrect
  }

  validateInterestAmount(control: AbstractControl) {
    const maxLimit = this.HomeLoanDeclaration_Form?.get('isBefore01Apr1999')?.value ? 30000 : 200000;
    return control.value && parseInt(control.value) > maxLimit
      ? { maxLimitExceeded: true }
      : null;
  }

  HRADeclarationPopup(){
    this.addRentDeclarationForm.reset();
    this.aboveOneLakh = true;
    this.HRADeclaration_Popup = true;
  }
  closeHRADeclaration_popup() {
    this.HRADeclaration_Popup = false;
    this.submitted = false;
    this.HRADeclaration_Form.reset();
  }

  SaveHRADeclaration() : void{
    let post  = this.addRentDeclarationForm.value;
    let bankDetailsForm = this.bankDetailsForm.value;
    let finYear = bankDetailsForm.financialyear;
    let finYr = finYear.split('-');

    let amount = parseFloat(post.rentAmount)/12;
    let isMetro = post.metroCity;
    let landLordAddress = (post.landLordAddress);
    let landLordPan =post.landLordPan; 
    let landLordName  = post.landLordName;

    let emp_code = this.empDataFromParent.mobile + 'CJHUB' + this.empDataFromParent.emp_code + 'CJHUB' + this.empDataFromParent.dob;

    landLordAddress = (!landLordAddress)?'':landLordAddress;
    landLordPan = (!landLordPan)?'':landLordPan;
    landLordName = (!landLordName)?'':landLordName;

    if(finYr.length != 2){
      this.toastr.error('Invalid Financial Year');
        return ;
    }
    
    
    if(post.rentAmount > 100000){
      if(post.landLordPan == ''){
        this.toastr.error('Please enter Land Lord PAN');
        return ;
      }
      if(post.landLordPan.length != 10){
        this.toastr.error('Please enter valid PAN');
        return ;
      }
      if(!landLordName){
        this.toastr.error('Please enter Land Lord Name');
          return ;
      }
      if(!landLordAddress){
        this.toastr.error('Please enter Land Lord Address');
          return ;
      }
    }
    
      let objeReq = [
        {
          "rent_year":finYr[0], "rent_month":"4", "is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0", "no_of_child_under_cha":"0",
          "landlordname":landLordName, "landlordpancard":landLordPan, "address":landLordAddress
        },
        {
          "rent_year":finYr[0], "rent_month":"5", "is_metro":isMetro,
          "rentpaid":amount, "no_of_child_under_cea":"0",
          "no_of_child_under_cha":"0","landlordname":landLordName,
          "landlordpancard":landLordPan,"address":landLordAddress
        },
        {
          "rent_year":finYr[0],"rent_month":"6","is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0","no_of_child_under_cha":"0",
          "landlordname":landLordName,"landlordpancard":landLordPan,"address":landLordAddress
        },
        {
          "rent_year":finYr[0],"rent_month":"7","is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0","no_of_child_under_cha":"0",
          "landlordname":landLordName,"landlordpancard":landLordPan,"address":landLordAddress
        },
        {
          "rent_year":finYr[0],"rent_month":"8","is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0","no_of_child_under_cha":"0",
          "landlordname":landLordName,"landlordpancard":landLordPan,"address":landLordAddress
        },
        {
          "rent_year":finYr[0],"rent_month":"9","is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0","no_of_child_under_cha":"0",
          "landlordname":landLordName,"landlordpancard":landLordPan,"address":landLordAddress
        },
        {
          "rent_year":finYr[0],"rent_month":"10","is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0","no_of_child_under_cha":"0",
          "landlordname":landLordName,"landlordpancard":landLordPan,"address":landLordAddress
        },
        {
          "rent_year":finYr[0],"rent_month":"11","is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0","no_of_child_under_cha":"0",
          "landlordname":landLordName,"landlordpancard":landLordPan,"address":landLordAddress
        },
        {
          "rent_year":finYr[0],"rent_month":"12","is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0","no_of_child_under_cha":"0",
          "landlordname":landLordName,"landlordpancard":landLordPan,"address":landLordAddress
        },
        {
          "rent_year":finYr[1],"rent_month":"1","is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0","no_of_child_under_cha":"0",
          "landlordname":landLordName,"landlordpancard":landLordPan,"address":landLordAddress
        },
        {
          "rent_year":finYr[1],"rent_month":"2","is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0","no_of_child_under_cha":"0",
          "landlordname":landLordName,"landlordpancard":landLordPan,"address":landLordAddress
        },
        {
          "rent_year":finYr[1],"rent_month":"3","is_metro":isMetro,
          "rentpaid":amount,"no_of_child_under_cea":"0","no_of_child_under_cha":"0",
          "landlordname":landLordName,"landlordpancard":landLordPan,"address":landLordAddress
        }
      ]
   
    let payLoad = {
        "empCode": this._EncrypterService.aesEncrypt(emp_code.toString()),
        "financialYear": finYear,
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        "createdByIp": "::1",
        "createdBy": this.tp_account_id,
        "rentDetail": JSON.stringify(objeReq),
        "productTypeId":  this._EncrypterService.aesEncrypt(this.product_type.toString())
    } 

    this.saveHouseRentDetail(payLoad)

    /*this._EmployeeManagementService.saveEmpRentDetails(payLoad).subscribe({
      next: (resData: any) => {
        if(resData.statusCode == true){
          this.GetTaxProjection(this.taxByMonth_data)
          this.toastr.success(resData.message, 'Success!');
          this.HRADeclaration_Popup= false;
          this.editRentModal = false;
          return ;
        }
        else{
          this.toastr.error(resData.message, 'Oops!');
          return ;
        }
      }, error: (e) => {
          this.toastr.error(e.message, 'Oops!');
          return ;
      }
    })*/
  }

  viewRentDetails(){
    this.viewRentModalStatus = true;
    this.getEmpRentDetails();
  }
  closeViewRentPop(){
    this.viewRentModalStatus = false;
  }

  getEmpRentDetails(){
    let emp_code = this.empDataFromParent.mobile + 'CJHUB' + this.empDataFromParent.emp_code + 'CJHUB' + this.empDataFromParent.dob;
    let bankDetailsForm = this.bankDetailsForm.value;
    let finYear = bankDetailsForm.financialyear;
    let payLoad = {
      "empCode":  this._EncrypterService.aesEncrypt(emp_code.toString()),
      "financialYear":finYear,
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString())
    } 
    this._EmployeeManagementService.getEmpRentDetails(payLoad).subscribe({
      next: (resData: any) => {
        if(resData.statusCode == true){
         this.rentDetails = this._EncrypterService.aesDecrypt(resData.commonData);
         this.rentDetails = JSON.parse(this.rentDetails);
         this.updateRentDetails = this.rentDetails
        }
        else{
          this.toastr.error(resData.message, 'Oops!');
          return ;
        }
      }, error: (e) => {
          this.toastr.error(e.message, 'Oops!');
          return ;
      }
    })
  }

  acceptOnlyNumberAmount(event:any){
    const input = event.target as HTMLInputElement;
    const sanitizedValue = input.value.replace(/[^0-9.-]/g, '');
    input.value = sanitizedValue;
    if(parseFloat(input.value) > 100000){
      this.aboveOneLakh = false;
    }
    else{
      this.aboveOneLakh = true;
    }
  }
  validatePanNo(event:any){
    let input =event.target as HTMLInputElement;
    let panNumber = input.value
    var cleanedPan = panNumber.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    input.value = cleanedPan;
    var panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
    if (cleanedPan.length === 10 && !panRegex.test(cleanedPan))
    {
      input.value = '';
      this.toastr.error('Invalid Pan Card Number', 'Oops!');
    }
  }
  getMonth(rent_month: any): string {
    switch (Number(rent_month)) { // Ensure rent_month is treated as a number
      case 1: return 'January';
      case 2: return 'February';
      case 3: return 'March';
      case 4: return 'April';
      case 5: return 'May';
      case 6: return 'June';
      case 7: return 'July';
      case 8: return 'August';
      case 9: return 'September';
      case 10: return 'October';
      case 11: return 'November';
      case 12: return 'December';
      default: return ''; // Or handle invalid month numbers with an error message
    }
  }

  openEditRent(obj:any,index:any){
    this.aboveOneLakh = true;
    this.updateRentDeclarationForm.reset();
    this.editRentModal = true;
    

    this.updateRentDeclarationForm.patchValue({
      'rentAmount':obj.rentpaid,
      'landLordName':obj.landlordname,
      'landLordPan':obj.landlordpancard,
      'landLordAddress':obj.address,
      'metroCity':obj.is_metro,
      'indexValue':index
    });

    if(parseFloat(this.calculateTotalRentPaid()) > 100000){
      this.aboveOneLakh = false; 
    }
    else{
      this.aboveOneLakh = true;
    }

  }

  closeUpdateRentPopUp(){
    this.editRentModal = false;
  }

  saveHouseRentDetail(payLoad){
    this._EmployeeManagementService.saveEmpRentDetails(payLoad).subscribe({
      next: (resData: any) => {
        if(resData.statusCode == true){
          this.toastr.success(resData.message, 'Success!');
          this.HRADeclaration_Popup= false;
          this.editRentModal = false;
          this.GetTaxProjection(this.taxByMonth_data)
          return ;
        }
        else{
          this.toastr.error(resData.message, 'Oops!');
          return ;
        }
      }, error: (e) => {
          this.toastr.error(e.error.message, 'Oops!');
          return ;
      }
    })
  }

  updateRentDetail(){
    let emp_code = this.empDataFromParent.mobile + 'CJHUB' + this.empDataFromParent.emp_code + 'CJHUB' + this.empDataFromParent.dob;
    let post = this.updateRentDeclarationForm.value;
    let indexValue = post.indexValue
    for(let i=indexValue;i< 12;i++){
      this.updateRentDetails[i].landlordname = post.landLordName;
      this.updateRentDetails[i].rentpaid = post.rentAmount;
      this.updateRentDetails[i].landlordpancard = post.landLordPan;
      this.updateRentDetails[i].address = post.landLordAddress;
    }

    if(parseFloat(this.calculateTotalRentPaid()) > 100000){
      if(post.landLordPan == ''){
        this.toastr.error('Please enter PAN Card Number of Landlord', 'Oops!');
        return ;
      }
      if(post.landLordPan.length != '10'){
        this.toastr.error('Invalid PAN Card Number', 'Oops!');
        return ;
      }
      if(post.landLordAddress == ''){
        this.toastr.error('Please enter Address of Landlord', 'Oops!');
      }
    }
    
    let payLoad = {
      "empCode": this._EncrypterService.aesEncrypt(emp_code.toString()),
      "financialYear": this.updateRentDetails[0].financial_year,
      "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      "createdByIp": "::1",
      "createdBy": this.tp_account_id,
      "rentDetail": JSON.stringify(this.updateRentDetails),
      "productTypeId":  this._EncrypterService.aesEncrypt(this.product_type.toString())
    }
    this.saveHouseRentDetail(payLoad);
  }

  acceptOnlyNumberUpdateAmount(event:any){
    const input = event.target as HTMLInputElement;
    const sanitizedValue = input.value.replace(/[^0-9.-]/g, '');
    input.value = sanitizedValue;
    let post = this.updateRentDeclarationForm.value;
    let index = post.indexValue
    this.updateRentDetails[index].rentpaid = post.rentAmount;
    if(parseFloat(this.calculateTotalRentPaid()) > 100000){
      this.aboveOneLakh = false; 
    }
    else{
      this.aboveOneLakh = true;
    }
    // if(parseFloat(input.value) > 100000){
    //   this.aboveOneLakh = false;
    // }
    // else{
    //   this.aboveOneLakh = true;
    // }
  }
  calculateTotalRentPaid(){
    console.log(this.updateRentDetails.reduce((sum, entry) => parseFloat(sum) + parseFloat(entry.rentpaid), 0));
    return this.updateRentDetails.reduce((sum, entry) => parseFloat(sum) + parseFloat(entry.rentpaid), 0);
  }

  onInterestChange(event: Event) {
    console.log(event)
    const interestValue = event.target ? Number((event.target as HTMLInputElement).value) : 0; // Get numeric value from input
    const isBefore1999 = this.HomeLoanDeclaration_Form.get('isBefore01Apr1999')?.value;
    const maxLimit = isBefore1999 ? 30000 : 200000;
  
    this.HomeLoanDeclaration_Form.get('principalOnBorrowedCapital')?.setValue(
      Math.min(interestValue, maxLimit),
      { emitEvent: false } // Prevents infinite loop
    );
  }

  // add by ak 09-04-2025 start 
  shouldDisplay(income: any): boolean {
    const investment_id = income?.investment_id;
    const declr_amount = income?.declr_amount;
  
    // Check if the counterpart is declared (used for hiding logic)
    const hasDeclared = (id: number) =>
      this.chaptersixcomp_data?.some((comp: any) => comp.investment_id === id && comp.declr_amount > 0);
  
    // Mutual exclusion based on declared amount
    if (investment_id === 2 && hasDeclared(3)) return false;
    if (investment_id === 3 && hasDeclared(2)) return false;
  
    if (investment_id === 7 && hasDeclared(8)) return false;
    if (investment_id === 8 && hasDeclared(7)) return false;
  
    if (investment_id === 17 && hasDeclared(18)) return false;
    if (investment_id === 18 && hasDeclared(17)) return false;
  
    // Always show if this component has any declared amount
    if (declr_amount && declr_amount > 0) return true;
  
    // Parent Senior Citizen
    if (this.parentSeniorCitizenChecked && investment_id === 3) return true;
    if (!this.parentSeniorCitizenChecked && investment_id === 2) return true;
  
    // Disability More Than 80%
    if (this.disabilityMoreThan80Checked && investment_id === 8) return true;
    if (!this.disabilityMoreThan80Checked && investment_id === 7) return true;
  
    // Employee With Severe Disability
    if (this.employeeWithSevereDisabilityChecked && investment_id === 18) return true;
    if (!this.employeeWithSevereDisabilityChecked && investment_id === 17) return true;
  
    // Unaffected IDs
    if (![2, 3, 7, 8, 17, 18].includes(investment_id)) return true;
  
    // Default: hide
    return false;
  }
  
   // add by ak 09-04-2025 end 
  

  exportToPDF(empCode: any) {
  // Call GetTaxProjection to fetch data
  //this.submitUpdateRegimeStatus();
  this._ReportService.GetTaxProjectionApi({
    "customerAccountId": this.tp_account_id.toString(),
    "financial_year": this.bankDetailsForm.get('financialyear').value,
    "empCode": empCode?.toString(),
    "GeoFenceId": this.token.geo_location_id
  }).subscribe((resData: any) => {
    if (resData.statusCode) {
      // Populate data
      this.tax_data = resData.commonData;
      this.taxByMonth_data = this.tax_data?.taxByMonth || {};
      if (this.taxByMonth_data?.fields) {
        this.taxByMonth_data["fields"] = this.taxByMonth_data["fields"].replaceAll('"', '');
      }
      this.taxprojection_data = this.tax_data?.taxprojection;
      this.totalincome_data = this.tax_data?.totalincome;
      this.totalsaving_data = this.tax_data?.totalsaving;
      this.chaptersixcomp_data = this.tax_data?.chaptersixcomp;
      this.us80ccomp_data = this.tax_data?.us80ccomp;
      this.flexiallowancecomp_data = this.tax_data?.flexiAllowances;

      // Define variables
      const viewFinYear = this.viewFinYear || "";
      const employeeName = this.Employee_name || "NA";
      const orgEmpCode = this.orgempCode || "";
      const regimeType = this.taxprojection_data?.regimetype || "";
      const panCard = this.taxprojection_data?.pancard || "";
      const currentDateString = new Date().toISOString().split('T')[0]; // e.g., "2025-06-14"
      // const employerName = this.employer_name || "Example Corp";
      const startYear = this.start || "";
      const endYear = this.end || "";
      const declarationOrProof = this.declaration_or_proof || "D";
      const tpAccountId = this.tp_account_id || "";

      // Define CSS styles
      let htmlBody = `
        <style>
          .table {
            border: 1px solid black;
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 10px;
            font-size: 12px;
          }
          .table th, .table td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          .table th {
            background-color: #26A69A; /* Teal */
            color: white;
            font-weight: bold;
          }
          .table tbody tr {
            background-color: #E0F7FA; /* Light blue */
          }
          h4 {
            text-align: center;
            margin: 10px 0;
            font-size: 14px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .declaration, .note {
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-bottom: 10px;
            font-size: 12px;
          }
          .declaration div, .note div {
            padding: 10px;
            border-top: 1px solid #ccc;
          }
          .declaration div:first-child, .note div:first-child {
            background-color: #26A69A; /* Teal */
            color: white;
            font-weight: bold;
          }
        </style>
      `;

      // Header section
      htmlBody += `
        <div class="header">
          <h2>Tax Projection For Financial Year ${viewFinYear}</h2>
          <h4>Name: ${employeeName} (${orgEmpCode})</h4>
          <h4>Regime Type: ${regimeType}</h4>
          <h4>Pan Card: ${panCard}</h4>
        </div>
      `;

      // Tax By Month table 5.64 
      htmlBody += `
        <h4>Tax By Month</h4>
        <table class="table" style="width:100%;font-size:10px;">
          <thead>
            <tr>
              <th style="width:19%;">Fields</th>
              <th style="width:6%;">Apr</th>
              <th style="width:6%;">May</th>
              <th style="width:6%;">Jun</th>
              <th style="width:6%;">Jul</th>
              <th style="width:6%;">Aug</th>
              <th style="width:6%;">Sep</th>
              <th style="width:6%;">Oct</th>
              <th style="width:6%;">Nov</th>
              <th style="width:6%;">Dec</th>
              <th style="width:6%;">Jan</th>
              <th style="width:6%;">Feb</th>
              <th style="width:6%;">Mar</th>
              <th style="width:9%;">Cumulative</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.taxByMonth_data && this.taxByMonth_data.fields) {
        const months = ['apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];
        htmlBody += `
          <tr>
            <td style="width:19%;">${this.taxByMonth_data.fields}</td>
            ${months.map(month => `<td style="width:6%;">${this.taxByMonth_data[month] || '0'}</td>`).join('')}
            <td style="width:9%;">${this.taxByMonth_data.totalgrossearning || '0'}</td>
          </tr>
        `;
      } else {
        htmlBody += `<tr><td colspan="14">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;

      // Tax Projection table
      htmlBody += `
        <h4>Tax Projection</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Total Income</th>
              <th>Total Savings</th>
              <th>Taxable Income</th>
              <th>Net Payable Tax</th>
              <th>Tax Deducted</th>
              <th>Balance Tax</th>
              <th>Tax Slab</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${this.taxprojection_data?.totalincome || '0'}</td>
              <td>${this.taxprojection_data?.totalsavings || '0'}</td>
              <td>${this.taxprojection_data?.taxableincome || '0'}</td>
              <td>${this.taxprojection_data?.netpayabletax || '0'}</td>
              <td>${this.taxprojection_data?.taxdeducted || '0'}</td>
              <td>${this.taxprojection_data?.balancetax || '0'}</td>
              <td>${this.taxprojection_data?.taxslab || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      `;

      // Total Income table
      htmlBody += `
        <h4>Total Income</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Income Head</th>
              <th>Income</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.totalincome_data && this.totalincome_data.length > 0) {
        this.totalincome_data.forEach((income: any) => {
          htmlBody += `
            <tr>
              <td>${income.incomehead || 'N/A'}</td>
              <td>${income.income || '0'}</td>
            </tr>
          `;
        });
      } else {
        htmlBody += `<tr><td colspan="2">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;

      // Total Saving table
      htmlBody += `
        <h4>Total Saving</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Saving Head</th>
              <th>Saving</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.totalsaving_data && this.totalsaving_data.length > 0) {
        this.totalsaving_data.forEach((saving: any) => {
          htmlBody += `
            <tr>
              <td>${saving.savinghead || 'N/A'}</td>
              <td>${saving.saving || '0'}</td>
              <td>${saving.approval_status || 'N/A'}</td>
            </tr>
          `;
        });
      } else {
        htmlBody += `<tr><td colspan="3">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;

      // Chapter VI Components table
      htmlBody += `
        <h4>Chapter VI Components</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Component Name</th>
              <th>Max Limit</th>
              <th>Component Value (Declaration)</th>
              <th>Component Value (Proof)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.chaptersixcomp_data && this.chaptersixcomp_data.length > 0) {
        this.chaptersixcomp_data.forEach((comp: any) => {
          if (this.shouldDisplay(comp)) { // Assuming shouldDisplay is defined
            htmlBody += `
              <tr>
                <td>${comp.componentname || 'N/A'}</td>
                <td>${comp.max_limit || '0'}</td>
                <td>${comp.declr_amount || '0'}</td>
                <td>${comp.componentvalue || '0'}</td>
                <td>${comp.approval_status || 'N/A'}</td>
              </tr>
            `;
          }
        });
      } else {
        htmlBody += `<tr><td colspan="5">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;

      // U/S 80C Components table
      htmlBody += `
        <h4>U/S 80C Components</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Component Name</th>
              <th>Max Limit</th>
              <th>Component Value (Declaration)</th>
              <th>Component Value (Proof)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.us80ccomp_data && this.us80ccomp_data.length > 0) {
        this.us80ccomp_data.forEach((comp: any) => {
          htmlBody += `
            <tr>
              <td>${comp.componentname || 'N/A'}</td>
              <td>${comp.max_limit || '0'}</td>
              <td>${comp.declr_amount || '0'}</td>
              <td>${comp.componentvalue || '0'}</td>
              <td>${comp.approval_status || 'N/A'}</td>
            </tr>
          `;
        });
      } else {
        htmlBody += `<tr><td colspan="5">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;

      // Flexi Allowance Components table
      htmlBody += `
        <h4>Flexi Allowance Components</h4>
        <table class="table">
          <thead>
            <tr>
              <th>Component Name</th>
              <th>Max Limit</th>
              <th>Component Value (Declaration)</th>
              <th>Component Value (Proof)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;
      if (this.flexiallowancecomp_data && this.flexiallowancecomp_data.length > 0) {
        this.flexiallowancecomp_data.forEach((comp: any) => {
          htmlBody += `
            <tr>
              <td>${comp.componentname || 'N/A'}</td>
              <td>${comp.max_limit || '0'}</td>
              <td>${comp.declr_amount || '0'}</td>
              <td>${comp.componentvalue || '0'}</td>
              <td>${comp.approval_status || 'N/A'}</td>
            </tr>
          `;
        });
      } else {
        htmlBody += `<tr><td colspan="5">No data available</td></tr>`;
      }
      htmlBody += `</tbody></table>`;

      // Declaration section (if applicable)
      if (declarationOrProof === 'D' && ['981', '6148', '3088'].includes(tpAccountId)) {
        htmlBody += `
          <div class="declaration">
            <div>Declaration</div>
            <div>
              I hereby declare that the particulars given on pre-page/above are correct and complete in all respect. I may be allowed appropriate tax rebate while calculating my tax liability of Financial Year ${viewFinYear} (Assessment Year ${startYear} - ${endYear}).
            </div>
            <div>
              <b>The self-attested documentary proof for claiming the benefits of various savings / investments already made or likely to be made, will be submitted by 15th January ${startYear} failing which the tax may be recovered from me by nullifying the savings / investments stated in declaration form.</b>
            </div>
            <div>
              I hereby state that the claim of deduction shown above is in my name and if it is in joint account then it is declared herewith that the other claimant will not claim it in his/her ITR.
            </div>
            <div>
              In case of payment/ contribution/ investments, I will produce the original document for verification, whenever it will be asked for.
            </div>
          </div>
        `;
      }

      // Notes table
      htmlBody += `
        <h4>Note</h4>
        <table class="table">
          <thead>
            <tr>
              <th colspan="2">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px;">1</td>
              <td style="padding: 8px;">All employees are requested to keep the bills/Tax Invoice etc. on a monthly basis at their end to avail exemption under Flexi Allowances.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">2</td>
              <td style="padding: 8px;">In case of Uniform Allowance, exemption is limited to the purchase of formal clothes by the employee for himself/herself only.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">3</td>
              <td style="padding: 8px;">For claiming exemption under Driver/Fuel allowance, the vehicle should be in the name of the employee.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">4</td>
              <td style="padding: 8px;">If purchases are made online, then the bills/invoices must be supported by a delivery challan.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">5</td>
              <td style="padding: 8px;">No COD transactions will be accepted. Further, any purchases made in cash exceeding Rs. 10,000/- will not be considered.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">6</td>
              <td style="padding: 8px;">Only Bills/Invoices depicting proper particulars of items purchased will be accepted. Particulars mentioning only codes will not be accepted for exemption.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">7</td>
              <td style="padding: 8px;">All POS transactions should be supported by proper receipts. It is further requested that photocopies of such invoices be kept beforehand.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">8</td>
              <td style="padding: 8px;">LTA exemption is restricted to two times in a block of four years. The current block is 2022-2025.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">9</td>
              <td style="padding: 8px;">The LTA Form should be supported by the original boarding pass if the journey is undertaken by Air.</td>
            </tr>
            <tr>
              <td style="padding: 8px;">10</td>
              <td style="padding: 8px;">While purchasing, please ensure to collect Tax invoices and proof of payment.</td>
            </tr>
          </tbody>
        </table>
      `;

      // Call the PDF generation service
      this._ReportService.generatePdfByCode({
        "htmlBody": htmlBody
      }).subscribe((pdfRes: any) => {
        if (pdfRes.statusCode) {
          const byteCharacters = atob(pdfRes.commonData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const file = new Blob([byteArray], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = fileURL;
          a.download = `Tax_Projection_Report_${employeeName.replaceAll(' ', '_').trim()}_${currentDateString.replaceAll(' ', '_').trim()}.pdf`;
          a.click();
          URL.revokeObjectURL(fileURL);
        } else {
          console.error('PDF generation failed:', pdfRes.message);
        }
        this.closeTaxProjection()
      }, (error: any) => {
        console.error('PDF generation error:', error);
      });
    } else {
      console.error('Failed to fetch tax projection data:', resData.message);
    }
  });
  }


  submitUpdateRegimeStatus() {
    let formData = this.saveRegime_Form.value;
    // console.log(formData); return;
    let regimeType = formData.taxRegime.toString();
    let empCode = this.taxByMonth_data?.mobile + "CJHUB" + this.taxByMonth_data?.emp_code + "CJHUB" + this.taxByMonth_data?.dateofbirth;
    const confirmChange = confirm(`Are you sure, you want Submit?`);
    if (confirmChange) {
      this.isModalOpen = false;
      this.regimetype = regimeType;
      this._EmployeeManagementService.SaveEmpRegime({
        "empCode": this._EncrypterService.aesEncrypt(empCode.toString()),
        "financialYear": this.bankDetailsForm.get('financialyear')?.value,
        "customerAccountId": this._EncrypterService.aesEncrypt(this.tp_account_id?.toString()),
        "regimeType": regimeType,
        "createdBy": this.empDataFromParent.emp_code?.toString(),
        "createdByIp": "",
        "productTypeId": this._EncrypterService.aesEncrypt(this.product_type.toString()),
        "uploadByUserType": "Employee",
        "finalSubmit":"Y",
        "finalSubmitDateRange":this.declarationmessage
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
        this.GetEmpRegimeAndTaxProjection(this.taxByMonth_data)
        // this.closeTaxProjectionModal();
      });

    }else{   
      event.preventDefault();   
      this.regimetype=this.taxprojection_data?.regimetype;
    }
  }
  
  
}