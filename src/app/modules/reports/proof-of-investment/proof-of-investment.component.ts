import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import * as XLSX from 'xlsx';
import { grooveState, dongleState } from 'src/app/app.animation';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
declare var $: any;

@Component({
  selector: 'app-proof-of-investment',
  templateUrl: './proof-of-investment.component.html',
  styleUrls: ['./proof-of-investment.component.css'],
  animations: [grooveState, dongleState]
})

export class ProofOfInvestmentComponent {
  currentDate: any;
  currentDateString: any;
  payout_date: any;
  cur_payout_day: string = '';
  employer_profile: any = [];
  employer_name: any = '';
  showSidebar: boolean = true;
  month: any;
  days_count: any;
  year: any;
  selected_checkbox_Data: any = [];
  verify_Popup: boolean = false;
  selected_date: any;
  select_All: boolean = false;
  existingIndex: any;
  selected_checkbox_states: any;
  From_date: any;
  finyear: any;
  financial_yr: any;
  selected_checkbox_data: any;
  selectedItems: any[] = [];
  tax_data: any = [];
  Investment_declaration_data: any = [];
  selectedRows_ForHeader: any = [];
  Inv_data: any = [];
  showTaxPopup: boolean = false;
  Verify_Inv_data = [];
  proofapplicabledate: any;
  proof_date: any;
  from_date: any;
  to_date: any;

  To_date: any;
  Change_Modal_Form: FormGroup;
  taxByMonth_data: any = [];
  taxprojection_data: any = [];
  selectedRows: any[] = [];
  totalincome_data: any = [];
  selectedReports: any[] = [];
  totalsaving_data: any = [];
  chaptersixcomp_data: any = [];
  checked_row_data: any = [];
  filtered_data: any = [];
  header_checkbox: boolean = false;
  us80ccomp_data: any = [];
  flexiallowancecomp_data: any = [];
  save_Investment_data: any = [];
  yearsArray: any = [];
  checkbox: any;
  product_type: any;
  emp_name: any = '';
  p: number = 0;
  Remark_Form: FormGroup;
  selectedRowsForHeader: any = [];
  emp_code: any = '';
  tp_account_id: any = '';
  token: any = '';
  includeEmployeeDetails: boolean = false;
  data: any = [];
  bankDetailsForm: FormGroup;
  show_label: boolean = true;
  searchBy: string = 'EmployeeCode';
  addRemoveHide: boolean = false;
  showPopup: boolean = false;
  declaration_or_proof: any;
  employeeCode: string = '';
  showfields: any;
  start: any;
  end: any;

  fieldarray: any = [
    // { name: 'S No.', value: 'S_No' },
    { name: 'Financial Year', value: 'financial_year' },
    { name: 'Approved Docs', value: 'approveddocs' },
    { name: 'Rejected Docs', value: 'rejecteddocs' },
    { name: 'Pending Docs', value: 'pendingdocs' },
    { name: 'Total Docs', value: 'totaldocs' },
    { name: 'PAN Card', value: 'pancard' }

  ];
  selectedFiscalYear: string;
  fiscalYears: string[] = this.FinancialYears();
  current_year: any;
  changeDateModalShow: boolean = false;
  selectedDynmicColumnValues: any[] = [];


  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private _alertservice: AlertService,
    private sanitizer: DomSanitizer,) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.employer_name = this.token.name;
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    const date = new Date();

    this.bankDetailsForm = this._formBuilder.group({
      EmployeeCode: ['', [Validators.required]],
      financialyear: ['', [Validators.required]]
    });

    this.Remark_Form = this._formBuilder.group({
      Remarks: ['', [Validators.required]],
    });

    this.Change_Modal_Form = this._formBuilder.group({
      From_Date: ['', [Validators.required]],
      To_Date: ['', [Validators.required]],
      Type: ['', [Validators.required]],
      Proof_dt: ['', [Validators.required]]
    });

    this.intialize_show_fields();

    this.Change_Modal_Form.get('Type').valueChanges.subscribe((value) => {
      this.updateProofDateControl(value);
    });

    this.selected_date = localStorage.getItem('selected_date');
    this.days_count = this.selected_date.split('-')[0];

    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];

    var checkboxes = document.querySelectorAll(
      '.dropdown-item input[type="checkbox"]'
    );
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    });

    this.FinancialYears();
    this.addRemoveHide = false;
    this.getColumnValues();

    const now = new Date();
    const current_month = now.getMonth() + 1;
    this.current_year =
      current_month >= 4 ? `${now.getFullYear()}-${(now.getFullYear() + 1)}` : `${now.getFullYear() - 1}-${now.getFullYear()}`;
    this.bankDetailsForm.patchValue({ financialyear: this.current_year });
    this.InvestmentReportResultApi();
  }

  ngAfterViewInit() {

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
        Proof_dt: ' ' // Set Proof_dt to a space if Type is 'D'
      });

    } else {
      proofDateControl.enable();
      this.Change_Modal_Form.patchValue({
        Proof_dt: this.proofapplicabledate // Set Proof_dt to the actual value if Type is not 'D'
      });
    }
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
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

  openTaxPopup(financial_Yr: any, emp_code: any) {
    this.showTaxPopup = true;
    this.financial_yr = financial_Yr;
    this.GetTaxProjection(this.financial_yr, emp_code);

  }

  closeTaxpopup() {
    this.showTaxPopup = false;
    this.bankDetailsForm.reset();

    this.bankDetailsForm.patchValue({

      EmployeeCode: this.emp_code,
      financialyear: this.finyear

    })
  }

  open_verify_Popup(emp_code: any, emp_name: any) {
    this.emp_code = emp_code;
    this.emp_name = emp_name;
    this.verify_Popup = true;
    this.GetInvestmentsProof(emp_code);
  }

  close_popup() {
    this.verify_Popup = false;

    this.bankDetailsForm.patchValue({

      EmployeeCode: this.emp_code,
      financialyear: this.finyear

    })
  }
  fieldshowdata(name: any) {
    return this.showfields[name] ? 'checked' : null;
  }

  // FinancialYears(startingYear: number, currentYear: number) {
  //   let fiscalYears = [];
  //   for (let i = startingYear; i <= currentYear; i++) {
  //     const previousYear = i - 1;
  //     const finYear = `${previousYear}-${i.toString()}`;
  //     fiscalYears.push(finYear);
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
      const finYear = `${i}-${nextYear}`; // Format as full four-digit years
      fiscalYears.push(finYear);
    }

    return fiscalYears;
  }

  Hideshow_Emp(val: any) {
    if (val == 1) {
      this.addRemoveHide = true;
    }
    else {
      this.addRemoveHide = false;
    }
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

  search(key: any) {
    let invKey = key.target.value;
    this.p = 0;
    this.filtered_data = this.Inv_data.filter(function (element: any) {

      return element.headtype.toLowerCase().includes(invKey.toLowerCase())

    });

  }

  InvestmentReportResultApi() {
    let financial_year = '';
    financial_year = this.bankDetailsForm.get('financialyear')?.value;
    if (financial_year) {
      this._ReportService.InvestmentReportResultApi({
        "customerAccountId": this.tp_account_id?.toString(),
        "financialYear": this.bankDetailsForm.get('financialyear').value,
        "filterStatus": "invproof",
        "empCode": "",
        "searchKeyword": this.bankDetailsForm.get('EmployeeCode')?.value,
        "GeoFenceId": this.token.geo_location_id
      }).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.data = resData.commonData;
          this.emp_name = this.data[0].emp_name;
          this.emp_code = this.data[0].emp_code?.toString();
          this.finyear = this.data[0].financial_year;

        } else {
          this.data = [];
          this.emp_name = '';
          this.emp_code = '';
          this.show_label = false;
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      });
    } else {
      this.data = [];
      this.emp_name = '';
      this.emp_code = '';
      this.show_label = false;
      this.toastr.error('Please select a financial year.');
    }
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

  isAnyCheckboxChecked(): boolean {
    return this.Inv_data.some(row => row.isSelected);
  }

  // Helper function to get selected rows
  getSelectedRows(): any[] {
    return this.Inv_data.filter(row => row.isSelected);
  }


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

  GetTaxProjection(financial_yr: any, emp_code: any) {
    this.showPopup = true;
    this.GetInvestmentTypeData();
    this.financial_yr = financial_yr;
    const [start, end] = this.financial_yr.split('-').map(year => parseInt(year, 10));
    this.start = start + 1;
    this.end = end + 1;
    this._ReportService.GetTaxProjectionApi({
      "customerAccountId": this.tp_account_id.toString(),
      "financial_year": this.financial_yr,
      "empCode": emp_code.toString(),
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
    }).subscribe((resData: any) => {
      console.log(resData);
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


  VerifyInvestmentProof(status: any, emp_code: any) {
    this.checked_row_data = this.getSelectedRows();
    //this.checked_row_data =[checked_row_Data];

    // console.log(this.checked_row_data);

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
        // this.toastr.error(resData.message, 'Oops!');
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
      "modifiedByIp": "::1",
      "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
    }).subscribe((resData: any) => {
      if (resData.statusCode) {

        this.save_Investment_data = resData.commonData;
        console.log(this.save_Investment_data);

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

  exportToExcel() {
    this._ReportService.InvestmentReportResultApi({
      "customerAccountId": this.tp_account_id?.toString(),
      "financialYear": this.bankDetailsForm.get('financialyear').value,
      "filterStatus": "invproof",
      "empCode": this.bankDetailsForm.get('EmployeeCode')?.value,
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
        if (!this.includeEmployeeDetails) {
          for (let idx = 0; idx < this.data.length; idx++) {
            const orgEmpCode = this.data[idx]?.orgempcode;
            const tpcode = this.data[idx]?.tpcode;
            const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;
            let obj = {
              'Employee Name': this.data[idx].emp_name,
              'TP / Org Emp Code': tpOrgEmpCode,
            }
            let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
            exportFields.forEach(field => {
              obj[field.name] = this.data[idx][field.value];
            });

            exportData.push(obj);
          }
        }
        else {
          for (let idx = 0; idx < this.data.length; idx++) {
            const orgEmpCode = this.data[idx]?.orgempcode;
            const tpcode = this.data[idx]?.tpcode;
            const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;

            let obj = {
              'Employee Name': this.data[idx].emp_name,
              'TP / Org Emp Code': tpOrgEmpCode,
              'PAN Card': this.data[idx].pancard,
              'Financial Year': this.data[idx].financial_year,
              'Approved Docs': this.data[idx].approveddocs,
              'Rejected Docs': this.data[idx].rejecteddocs,
              'Pending Docs': this.data[idx].pendingdocs,
              'Total Docs': this.data[idx].totaldocs
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
        downloadLink.download = 'Proof_Of_Investment_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
      }
    })
  }

  exportToPDF() {
  this._ReportService.InvestmentReportResultApi({
    "customerAccountId": this.tp_account_id?.toString(),
    "financialYear": this.bankDetailsForm.get('financialyear').value,
    "filterStatus": "invproof",
    "empCode": this.bankDetailsForm.get('EmployeeCode')?.value,
    "GeoFenceId": this.token.geo_location_id ? this.token.geo_location_id : ''
  }).subscribe((resData: any) => {
    if (resData.statusCode) {
      this.data = resData.commonData;

      // Define table styles and header
      let tableHtml = `<style>
        .table {
          border: 1px solid black;
          border-collapse: collapse;
        }
        .table th,
        .table td {
          border: 1px solid black;
          padding: 8px;
        }
      </style>`;
      tableHtml += `<p style="text-align:center;">Proof of Investment Report (${this.employer_name} - ${this.currentDateString})</p>`;
      tableHtml += `<table class="table">`;

      // Define table headers based on includeEmployeeDetails
      let headers = ['Employee Name', 'TP / Org Emp Code'];
      if (this.includeEmployeeDetails) {
        headers.push('PAN Card', 'Financial Year', 'Approved Docs', 'Rejected Docs', 'Pending Docs', 'Total Docs');
      } else {
        let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
        headers = headers.concat(exportFields.map(field => field.name));
      }

      // Add table headers to HTML
      tableHtml += `<tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>`;

      // Add table rows
      for (let idx = 0; idx < this.data.length; idx++) {
        const orgEmpCode = this.data[idx]?.orgempcode;
        const tpcode = this.data[idx]?.tpcode;
        const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;

        let rowData = [
          this.data[idx].emp_name || '',
          tpOrgEmpCode || ''
        ];

        if (this.includeEmployeeDetails) {
          rowData.push(
            this.data[idx].pancard || '',
            this.data[idx].financial_year || '',
            this.data[idx].approveddocs || '',
            this.data[idx].rejecteddocs || '',
            this.data[idx].pendingdocs || '',
            this.data[idx].totaldocs || ''
          );
        } else {
          let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
          exportFields.forEach(field => {
            rowData.push(this.data[idx][field.value] || '');
          });
        }

        tableHtml += `<tr>${rowData.map(data => `<td>${data}</td>`).join('')}</tr>`;
      }

      tableHtml += `</table>`;

      // Call the PDF generation service
      this._ReportService.generatePdfByCode({
        "htmlBody": tableHtml
      }).subscribe((resData: any) => {
        if (resData.statusCode == true) {
          const byteCharacters = atob(resData.commonData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const file = new Blob([byteArray], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = fileURL;
          a.download = `Proof_Of_Investment_Report_${this.employer_name.replaceAll(' ', '_').trim()}_${this.currentDateString.replaceAll(' ', '_').trim()}.pdf`;
          a.click();
          URL.revokeObjectURL(fileURL);
        }
      });
    }
  });
  }

  exportToIndividualExcel(report: any) {
    // Prepare data for the individual employee
    const orgEmpCode = report?.orgempcode;
    const tpcode = report?.tpcode;
    const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;

    let obj: any = {
      'Employee Name': report.emp_name || '',
      'TP / Org Emp Code': tpOrgEmpCode || ''
    };

    if (this.includeEmployeeDetails) {
      obj = {
        ...obj,
        'PAN Card': report.pancard || '',
        'Financial Year': report.financial_year || '',
        'Approved Docs': report.approveddocs || '',
        'Rejected Docs': report.rejecteddocs || '',
        'Pending Docs': report.pendingdocs || '',
        'Total Docs': report.totaldocs || ''
      };
    } else {
      let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
      exportFields.forEach(field => {
        obj[field.name] = report[field.value] || '';
      });
    }

    // Convert data to worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([obj]);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Trigger download
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    const empName = report.emp_name?.replaceAll(' ', '_').trim() || 'Unknown';
    downloadLink.download = `Proof_Of_Investment_${empName}_${tpOrgEmpCode || 'NoCode'}_${this.currentDateString.replaceAll(' ', '_').trim()}.xlsx`;
    downloadLink.click();
  }

  exportToIndividualPDF(report: any) {
    // Define table styles
    const tableStyles = `<style>
      .table {
        border: 1px solid black;
        border-collapse: collapse;
        width: 100%;
      }
      .table th,
      .table td {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
      }
      .table th {
        background-color: #f2f2f2;
      }
    </style>`;

    // Define headers based on includeEmployeeDetails
    let headers = ['Employee Name', 'TP / Org Emp Code'];
    if (this.includeEmployeeDetails) {
      headers.push('PAN Card', 'Financial Year', 'Approved Docs', 'Rejected Docs', 'Pending Docs', 'Total Docs');
    } else {
      let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
      headers = headers.concat(exportFields.map(field => field.name));
    }

    // Prepare row data for the individual employee
    const orgEmpCode = report?.orgempcode;
    const tpcode = report?.tpcode;
    const tpOrgEmpCode = (orgEmpCode !== '' && orgEmpCode != null && orgEmpCode != undefined) ? orgEmpCode : tpcode;

    let rowData = [
      report.emp_name || '',
      tpOrgEmpCode || ''
    ];

    if (this.includeEmployeeDetails) {
      rowData.push(
        report.pancard || '',
        report.financial_year || '',
        report.approveddocs || '',
        report.rejecteddocs || '',
        report.pendingdocs || '',
        report.totaldocs || ''
      );
    } else {
      let exportFields = this.fieldarray.filter(field => this.showfields[field.value]);
      exportFields.forEach(field => {
        rowData.push(report[field.value] || '');
      });
    }

    // Generate HTML for the individual PDF
    let tableHtml = `${tableStyles}`;
    tableHtml += `<p style="text-align:center;">Proof of Investment Report - ${report.emp_name || 'Unknown'} (${this.currentDateString})</p>`;
    tableHtml += `<table class="table">`;
    tableHtml += `<tr>${headers.map(header => `<th>${header}</th>`).join('')}</tr>`;
    tableHtml += `<tr>${rowData.map(data => `<td>${data}</td>`).join('')}</tr>`;
    tableHtml += `</table>`;

    // Call the PDF generation service
    this._ReportService.generatePdfByCode({
      "htmlBody": tableHtml
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        const byteCharacters = atob(resData.commonData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new Blob([byteArray], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = fileURL;
        const empName = report.emp_name?.replaceAll(' ', '_').trim() || 'Unknown';
        a.download = `Proof_Of_Investment_${empName}_${tpOrgEmpCode || 'NoCode'}_${this.currentDateString.replaceAll(' ', '_').trim()}.pdf`;
        a.click();
        URL.revokeObjectURL(fileURL);
      }
    });
  }


  Reset() {
    this.bankDetailsForm.reset();
    this.bankDetailsForm.patchValue({ financialyear: '' });
  }


  SaveColumnValues() {
    if (this.selectedDynmicColumnValues.length > 0) {
      this._ReportService.manage_report_columns_wfm({
        "action": "save_report_columns",
        "report_name": "proof of investment",
        "accountid": this.tp_account_id.toString(),
        "report_description": "Proof Of Investment Reports",
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
      "report_name": "proof of investment",
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
      S_No: false,
      financial_year: false,
      approveddocs: false,
      rejecteddocs: false,
      pancard: false,
      pendingdocs: false,

      totaldocs: false,
    };
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
  exportToExcel1() {

    //excel//
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();


    function parseHtmlToLines(html: string): string[] {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html.replace(/<br\s*\/?>/gi, '\n');
      return tempDiv.textContent?.split('\n').map(line => line.trim()).filter(Boolean) || [];
    }


    const fields = parseHtmlToLines(this.taxByMonth_data.fields);
    const apr = parseHtmlToLines(this.taxByMonth_data.apr);
    const may = parseHtmlToLines(this.taxByMonth_data.may);
    const jun = parseHtmlToLines(this.taxByMonth_data.jun);
    const jul = parseHtmlToLines(this.taxByMonth_data.jul);
    const aug = parseHtmlToLines(this.taxByMonth_data.aug);
    const sep = parseHtmlToLines(this.taxByMonth_data.sep);
    const oct = parseHtmlToLines(this.taxByMonth_data.oct);
    const nov = parseHtmlToLines(this.taxByMonth_data.nov);
    const dec = parseHtmlToLines(this.taxByMonth_data.dec);
    const jan = parseHtmlToLines(this.taxByMonth_data.jan);
    const feb = parseHtmlToLines(this.taxByMonth_data.feb);
    const mar = parseHtmlToLines(this.taxByMonth_data.mar);
    const cumulative = parseHtmlToLines(this.taxByMonth_data.totalgrossearning);


    const taxByMonthSheetData: any[][] = [['Fields', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Cumulative']];

    const rowCount = Math.max(
      fields.length, apr.length, may.length, jun.length, jul.length,
      aug.length, sep.length, oct.length, nov.length, dec.length,
      jan.length, feb.length, mar.length, cumulative.length
    );

    for (let i = 0; i < rowCount; i++) {
      taxByMonthSheetData.push([
        fields[i] || '',
        apr[i] || '',
        may[i] || '',
        jun[i] || '',
        jul[i] || '',
        aug[i] || '',
        sep[i] || '',
        oct[i] || '',
        nov[i] || '',
        dec[i] || '',
        jan[i] || '',
        feb[i] || '',
        mar[i] || '',
        cumulative[i] || ''
      ]);
    }

    const taxByMonthSheet = XLSX.utils.aoa_to_sheet(taxByMonthSheetData);
    XLSX.utils.book_append_sheet(workbook, taxByMonthSheet, 'TaxByMonth');



    const taxProjectionSheet = XLSX.utils.json_to_sheet([this.taxprojection_data]);
    XLSX.utils.book_append_sheet(workbook, taxProjectionSheet, 'TaxProjection');


    const totalIncomeSheet = XLSX.utils.json_to_sheet(this.totalincome_data);
    XLSX.utils.book_append_sheet(workbook, totalIncomeSheet, 'TotalIncome');


    const totalSavingSheet = XLSX.utils.json_to_sheet(this.totalsaving_data);
    XLSX.utils.book_append_sheet(workbook, totalSavingSheet, 'TotalSaving');


    const chapterSixSheet = XLSX.utils.json_to_sheet(this.chaptersixcomp_data);
    XLSX.utils.book_append_sheet(workbook, chapterSixSheet, 'ChapterVI');


    const us80cSheet = XLSX.utils.json_to_sheet(this.us80ccomp_data);
    XLSX.utils.book_append_sheet(workbook, us80cSheet, 'US80C');


    const flexiAllowanceSheet = XLSX.utils.json_to_sheet(this.flexiallowancecomp_data);
    XLSX.utils.book_append_sheet(workbook, flexiAllowanceSheet, 'FlexiAllowance');


    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    downloadLink.download = `Proof_Of_Investment_Report_${this.employer_name.replaceAll(' ', '_').trim()}_${this.currentDateString.trim().replaceAll(' ', '_')}.xlsx`;
    downloadLink.click();


  }
}
