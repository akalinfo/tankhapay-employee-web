import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../../employee/employee.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { PayoutService } from '../../payout/payout.service';
import { Router } from '@angular/router';
import decode from 'jwt-decode';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { EmployeeManagementService } from '../employee-management.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AngularEditorConfig } from '@kolkov/angular-editor';
declare var $: any;
import axios from 'axios';

@Component({
  selector: 'app-empl-payrolling',
  templateUrl: './empl-payrolling.component.html',
  styleUrls: ['./empl-payrolling.component.css'],
  animations: [dongleState, grooveState]
})
export class EmplPayrollingComponent {
  isShowRoundedVal: boolean = true;
  confirmationModal: boolean = false;
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '800px',
    minHeight: '0',
    maxHeight: '700px',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',


    toolbarHiddenButtons: [
      ['bold', 'italic'],
      ['fontSize'],
      [
        'link',
        'unlink',
        'insertImage',
        'insertVideo',
        'insertHorizontalRule',
        'removeFormat',
        'toggleEditorMode'
      ]
    ],
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' },
      { class: 'garamond', name: 'Garamond' }
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    uploadUrl: 'v1/image'
  };
  payout_method: any;
  GetForm16_data: any = [];
  form16_flag: boolean = false;
  flag: boolean = false;
  payslip_data: SafeResourceUrl | null = null;
  mobile: any;
  employer_mobile: any
  add_exit_data: any = [];
  template_data: any = [];
  reason_of_leaving_data: any = [];
  exit_detail_data: any = [];
  openPopup: boolean = false;
  openprobationPopup: boolean = false;
  openExperiencePopup: boolean = false;
  open_form16_popup: boolean = false;
  candidateDetails: any = '';
  token: any;
  tp_account_id: any;
  product_type: string;
  @Input() empDataFromParent: any;
  statutoryComplianceForm: FormGroup;
  statesMaster: any = [];
  deductionsMaster: any = [];
  isEditsal: boolean = false;
  edit_statutory_compliances: boolean = false;
  restructureMode: string = '';
  isCustomEditSal: boolean = false;
  advanceSalaryform: FormGroup;
  customSalaryform: FormGroup;
  consultantform: FormGroup;
  otherDetailForm: FormGroup;
  Form16Form: FormGroup;
  Exit_form: FormGroup;
  probation_form: FormGroup;
  Experience_form: FormGroup;
  salaryDetails: string = '';
  minWagesCtg: any = [];
  LWF_master_data: any = [];
  lwfmsg: string = '';
  PT_applied_master_data: any = [];
  ptmsg: string = '';
  salaryStructure: any = {};
  isGratuity: boolean = false;
  isShowSalaryTable: boolean = false;
  isEmployerGratuity: boolean = false;
  leaveTemplateData: any = [];
  customCalculatedData: any;
  isEmployerPartExcluded: any = 'N';
  grossSalary: any = 0;
  esi_details: any = '';
  pf_details: any = '';
  customSalaryMsg: any = '';
  isCustomInputTrigger: boolean = false;
  salaryPercent: { basicPercent: any; hraPercent: any; };
  salaryCalcType: string = 'percent';
  gratuityInHand: boolean = false;
  isDojValid: boolean = false;
  edit_salary_restructure: boolean;
  accessRights: any;
  isFormDisable: boolean = false;
  edit_custom_salary: boolean = false;
  minWageDays: any = [];
  changedFields: Set<string> = new Set();
  master_data: any = [];
  selectedExitType: string = "";
  emp_name: any;
  employer_name: any;
  documentNameResignation: string = '';
  resignationBase64Data: string = '';
  resignationDocumentType: string = '';
  resignationFilePath: string = '';
  base64DataForm16: string = '';
  originalDocumentNameForm16: string = '';
  base64DataNOC: string = '';  //// To store the base64 encoded string for NOC file
  originalDocumentNameNOC: string = '';  // To store the original NOC file name
  documentTypeNOC: string = '';
  relievingBase64Data: string = ''; // To store the base64 encoded string for the relieving letter
  originalDocumentNameRelievingLetter: string = ''; // To store the original file name for the relieving letter
  relievingDocumentType: string = '';
  emp_id: any;
  financialYears_Array: string[] = [];
  selectedFinancial_Year: string;
  exit_row_id: any;
  exit_status_id: any;
  exit_status_name: any;
  exit_type_id: any;
  isEditConsultantSalary: boolean = false;
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
  year: any;
  selected_date: any;
  days_count: any;
  fin_year: any;
  month: any;
  edli_adminchargesincludeinctc: any;
  financialYearsArray: string[] = [];
  selectedFinancialYear: string = '';
  addForm16_data: any = [];
  form16_id: any;

  form16_edit_popup: boolean = false;
  isGrpInsurance: boolean = false;
  isGrpInsuranceAllowed: any = '';
  employerInsurance: any = 0;
  employeeInsurance: any = 0;
  tds_details: any = '';
  masterTDS: any = [];
  masterTemplateList: any = [];
  masterTemplateListforprobation: any = [];
  masterTemplateListforExperience: any = [];
  show_charity_contribution: boolean = false;
  restrictedAccountIds: number[];

  tdsFile: { originalDocumentName: string; documentByteCode: string } | null = null;
  TdsExemptionForm: FormGroup;
  tds_exempted_docpath: string = ''; // example path, set from backend
  showTdsUploadForm: boolean = false;
  isEditMode: boolean = true; 
  hasSubmittedTdsExemption: boolean = false;

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EmployeeService: EmployeeService,
    private _EncrypterService: EncrypterService,
    private Router: Router,
    private _BusinesSettingsService: BusinesSettingsService,
    private _PayoutService: PayoutService,
    private _EmployeeManagementService: EmployeeManagementService,
    private _masterService: MasterServiceService,
    private sanitizer: DomSanitizer) {

  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d?.token);
    this.tp_account_id = this.token.tp_account_id;
    this.payout_method = this.token.payout_mode_type;
    this.employer_name = this.token.name;
    this.employer_mobile = this.token.mobile;
    //local dummy 6927    "Digital India Corporation"
    this.restrictedAccountIds = [653, 6927]; // List of account IDs to disable checkbox

    this.product_type = localStorage.getItem('product_type');
    this.accessRights = this._masterService.checkAccessRights('/employees');
    const date = new Date();
    let currentMonth = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    let currentYear = date.getFullYear();

    for (let i = 2022; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);
    };
    this.selected_date = localStorage.getItem('selected_date') || null;
    this.generateFinancialYears();

    if (this.selected_date) {
      this.days_count = this.selected_date.split('-')[0];
      this.month = this.selected_date.split('-')[1];
      this.year = this.selected_date.split('-')[2];
      // console.log("A",this.month,this.year);
    } else {
      this.month = currentMonth.toString();
      this.year = currentYear.toString();
      // ////console.log("B",this.month,this.year);
    }

    // 5337 Goalbindu Karma Sahayak and dummy account 653
    const allowedAccountIds = ['653', '3088', '5337'];
    this.show_charity_contribution = allowedAccountIds.includes(this.tp_account_id.toString());
    // ...existing code...
    this.statutoryComplianceForm = this._formBuilder.group({
      pfOpted: ['', [Validators.required]],
      esiOpted: ['', [Validators.required]],
      otherVariablesDetails: new FormArray([])
    })

    this.customSalaryform = this._formBuilder.group({
      mop: ['', [Validators.required]],
      salarystructure: this._formBuilder.array([]),
      pfOpted: ['N', [Validators.required]],
      esiOpted: ['N', [Validators.required]],
      pfCapApplied: ['N', [Validators.required]],
      lwfOpted: ['N', [Validators.required]],
      ptApplied: ['N', [Validators.required]],
      effectiveDate: ['', [Validators.required]],
      hourlySalarySetup: ['N', [Validators.required]],
      charityContributionEmp: ['N'],
      customTaxPercent: ['1'],
      minWageState: ['', [Validators.required]],
      minWagesCtg: ['', [Validators.required]],
      salaryDays: ['', [Validators.required]],
      salaryDaysOpted: ['', [Validators.required]],
      isGrpInsurance: ['N'],
    })

    this.consultantform = this._formBuilder.group({
      mop: ['', [Validators.required]],
      tdsId: ['', [Validators.required]]
    })

    this.otherDetailForm = this._formBuilder.group({
      daRate: [''],
      salaryDaysOpted: [''],
      salaryDays: [''],
      kmRate: [''],
      teaAllowanceFlag: ['N'],
      manualTDS: [''],
      isTdsExempt: ['N'],
      originalDocumentName: [''],
      documentByteCode: ['']
    })

    this.Exit_form = this._formBuilder.group({
      exitTypeId: ['1', [Validators.required]],
      noticePeriod: ['', [Validators.required]],
      resignationDate: ['', [Validators.required]],
      relievingDate: ['', [Validators.required]],
      documentByteCodeResignation: ['', [Validators.required]],
      originalDocumentNameResignation: ['', [Validators.required]],
      documentByteCodeNOC: ['', [Validators.required,]],
      originalDocumentNameNOC: ['', [Validators.required]],
      documentByteCodeRelievingLetter: ['', [Validators.required]],
      originalDocumentNameRelievingLetter: ['', [Validators.required]],
      finalDues: [''],
      clearanceDate: [''],
      NOCClearanceDate: [''],
      exitReason: ['', [Validators.required]],
      template_html: [''],
      subject: [''],
      body: [''],
      header: [''],
      footer: ['']
    });

    this.probation_form = this._formBuilder.group({
      template_html: [''],
      template_for_probation: [''],
    });

    this.Experience_form = this._formBuilder.group({
      template_html: [''],
      template_for_probation: ['']
    });

    this.Form16Form = this._formBuilder.group({
      documentByteCode: ['', [Validators.required]],
      documentUploadType: ['', [Validators.required,]]
    });

    this.getMasterData();
    this.getAppointmentDetails();
    this.getMasterSalaryStructure();
    this.getMinWageDays();
    this.getEmployerSocialSecurityDetails('EPF');
    this.getEmployerSocialSecurityDetails('ESI');
    this.getEmployerSocialSecurityDetails('TDS');
    this.getEmployerSocialSecurityDetails('GROUPINSURANCE');

    if (this.empDataFromParent?.emp_code) {
      this.GetExit_Details();
      this.GetForm16_Details();
    }
    this.getMasterTDS();
    this.getMasterLetters();
    this.getMasterLettersforprobtaion();
    this.getMasterLettersforExperience();
  }

  openFileInNewTab(filePath: string): void {
    window.open(filePath, '_blank');
  }

  generateFinancialYears(): void {
    const currentYear = new Date().getFullYear();
    this.financialYearsArray.push('All');  // Add 'All' option first

    for (let i = 0; i < 3; i++) {  // Adjust the range as needed
      const financialYear = `${currentYear - i}-${currentYear - i + 1}`;
      this.financialYearsArray.push(financialYear);
    }

    this.selectedFinancialYear = this.financialYearsArray[0];  // Default to 'All' or current financial year
  }

  openEditPopup(data: any) {
    this.form16_id = data?.form_16_row_id;
    this.fin_year = data?.financial_year;
    this.form16_edit_popup = true;
  }

  closeEditPopup() {
    this.form16_edit_popup = false;
    this.removeForm16File();
  }

  changeFinancialYear(event: any): void {
    this.selectedFinancialYear = event.target.value;
    this.GetForm16_Details();
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

  ngAfterViewChecked() {
    let currDate = new Date();
    currDate.setDate(currDate.getDate() + 30);
    $('#customEffectiveDate').datepicker({
      dateFormat: 'mm/yy',
      changeMonth: true,
      changeYear: true,
      defaultDate: '1',
      maxDate: currDate,
      beforeShowDay: function (date) {
        // Disable all days except the 1st of the month
        return [date.getDate() === 1, ''];
      }
    })
  }

  // open_form16_popup
  open_form_popup() {
    this.open_form16_popup = true;
  }

  close_form16_popup() {
    this.open_form16_popup = false;
    this.removeForm16File();
  }

  open_exit_popup(data: any) {
    this.openPopup = true;
    this.emp_name = data?.emp_name;
    this.emp_id = data?.emp_id;
    this.selectedExitType = this.master_data.find(item => item.id === this.exit_detail_data.exit_type_id)?.exittype || '';

    this.Exit_form.patchValue({
      exitTypeId: this.exit_detail_data.exit_type_id || '',
      documentByteCodeResignation: this.exit_detail_data.resignation_doc_path || '',
      documentByteCodeNOC: this.exit_detail_data.noc_doc_path || '',
      documentByteCodeRelievingLetter: this.exit_detail_data.relieving_experience_letter_path || '',
      NOCClearanceDate: this.exit_detail_data.noc_clearance_date || '',
    });
    this.GetReasons_Of_Leaving(this.exit_detail_data.exit_type_id);
    if (this.exit_detail_data.exit_type_id === '3') {
      this.Exit_form.patchValue({
        resignationDate: this.exit_detail_data.termination_date || '',
      });
    } else {
      this.Exit_form.patchValue({
        resignationDate: this.exit_detail_data.resignation_date || '',
      });
    }

    if (this.exit_detail_data.exit_type_id === '1') {
      this.Exit_form.patchValue({
        noticePeriod: this.exit_detail_data.notice_period || '',
        relievingDate: this.exit_detail_data.agreed_relieving_date || '',
      });
    }
    if (this.exit_detail_data.exit_type_id === '1' || this.exit_detail_data.exit_type_id === '3') {
      this.Exit_form.patchValue({
        exitReason: this.exit_detail_data.reason_of_leaving || ''
      });

    }
    if (this.exit_detail_data.exit_status_id == '5') {
      this.Exit_form.patchValue({
        finalDues: this.exit_detail_data.final_dues || '',
        clearanceDate: this.exit_detail_data.final_dues_clearance_date || ''
      });
    }

    setTimeout(() => {
      $('#resignationDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      })
    }, 1000);

    setTimeout(() => {
      $('#NOCClearanceDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      })
    }, 1000);
    setTimeout(() => {
      $('#relievingDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);

    setTimeout(() => {
      $('#clearanceDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);

  }

  open_probation_popup(data: any) {
    this.openprobationPopup = true;
    this.emp_name = data?.emp_name;
    this.emp_id = data?.emp_id;
    this.selectedExitType = this.master_data.find(item => item.id === this.exit_detail_data.exit_type_id)?.exittype || '';

    this.Exit_form.patchValue({
      exitTypeId: this.exit_detail_data.exit_type_id || '',
      documentByteCodeResignation: this.exit_detail_data.resignation_doc_path || '',
      documentByteCodeNOC: this.exit_detail_data.noc_doc_path || '',
      documentByteCodeRelievingLetter: this.exit_detail_data.relieving_experience_letter_path || '',
      NOCClearanceDate: this.exit_detail_data.noc_clearance_date || '',
    });
    this.GetReasons_Of_Leaving(this.exit_detail_data.exit_type_id);
    if (this.exit_detail_data.exit_type_id === '3') {
      this.Exit_form.patchValue({
        resignationDate: this.exit_detail_data.termination_date || '',
      });
    } else {
      this.Exit_form.patchValue({
        resignationDate: this.exit_detail_data.resignation_date || '',
      });
    }

    if (this.exit_detail_data.exit_type_id === '1') {
      this.Exit_form.patchValue({
        noticePeriod: this.exit_detail_data.notice_period || '',
        relievingDate: this.exit_detail_data.agreed_relieving_date || '',
      });
    }
    if (this.exit_detail_data.exit_type_id === '1' || this.exit_detail_data.exit_type_id === '3') {
      this.Exit_form.patchValue({
        exitReason: this.exit_detail_data.reason_of_leaving || ''
      });

    }
    if (this.exit_detail_data.exit_status_id == '5') {
      this.Exit_form.patchValue({
        finalDues: this.exit_detail_data.final_dues || '',
        clearanceDate: this.exit_detail_data.final_dues_clearance_date || ''
      });
    }

    setTimeout(() => {
      $('#resignationDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      })
    }, 1000);

    setTimeout(() => {
      $('#NOCClearanceDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      })
    }, 1000);
    setTimeout(() => {
      $('#relievingDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);

    setTimeout(() => {
      $('#clearanceDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);

  }

  open_Experience_popup(data: any) {
    this.openExperiencePopup = true;
    this.emp_name = data?.emp_name;
    this.emp_id = data?.emp_id;
    this.selectedExitType = this.master_data.find(item => item.id === this.exit_detail_data.exit_type_id)?.exittype || '';

    this.Exit_form.patchValue({
      exitTypeId: this.exit_detail_data.exit_type_id || '',
      documentByteCodeResignation: this.exit_detail_data.resignation_doc_path || '',
      documentByteCodeNOC: this.exit_detail_data.noc_doc_path || '',
      documentByteCodeRelievingLetter: this.exit_detail_data.relieving_experience_letter_path || '',
      NOCClearanceDate: this.exit_detail_data.noc_clearance_date || '',
    });
    this.GetReasons_Of_Leaving(this.exit_detail_data.exit_type_id);
    if (this.exit_detail_data.exit_type_id === '3') {
      this.Exit_form.patchValue({
        resignationDate: this.exit_detail_data.termination_date || '',
      });
    } else {
      this.Exit_form.patchValue({
        resignationDate: this.exit_detail_data.resignation_date || '',
      });
    }

    if (this.exit_detail_data.exit_type_id === '1') {
      this.Exit_form.patchValue({
        noticePeriod: this.exit_detail_data.notice_period || '',
        relievingDate: this.exit_detail_data.agreed_relieving_date || '',
      });
    }
    if (this.exit_detail_data.exit_type_id === '1' || this.exit_detail_data.exit_type_id === '3') {
      this.Exit_form.patchValue({
        exitReason: this.exit_detail_data.reason_of_leaving || ''
      });

    }
    if (this.exit_detail_data.exit_status_id == '5') {
      this.Exit_form.patchValue({
        finalDues: this.exit_detail_data.final_dues || '',
        clearanceDate: this.exit_detail_data.final_dues_clearance_date || ''
      });
    }

    setTimeout(() => {
      $('#resignationDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      })
    }, 1000);

    setTimeout(() => {
      $('#NOCClearanceDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      })
    }, 1000);
    setTimeout(() => {
      $('#relievingDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);

    setTimeout(() => {
      $('#clearanceDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);

  }
  getFileName(path: string): string {
    return path ? path.split('/').pop() : '';
  }
  getDateLabel(): string {
    switch (this.selectedExitType) {
      case 'Resignation Received':
        return 'Date of Resignation';
      case 'Termination':
        return 'Termination Date';
      case 'Retirement':
        return 'Retirement Date';
      case 'Absconding':
        return 'Absconding reported Date';
      case 'Demise':
        return 'Demise reported Date';
      default:
        return 'Date of Resignation';
    }
  }
  getDynamicLabel(): string {
    switch (this.exit_detail_data?.exit_type_name) {
      case 'Retirement':
        return 'Retirement Date';
      case 'Absconding':
        return 'Absconding Reported Date';
      case 'Demise':
        return 'Demise Reported Date';
      case 'Resignation Received':
        return 'Date of Resignation';
      default:
        return 'Date of Resignation';
    }
  }
  close_exit_popup() {
    this.openPopup = false;
    this.Exit_form.reset();
    this.removeNOCImage();
    this.removeResignationFile();
    this.removeRelievingFile();
    this.resetResignationFileData();
  }
  close_probation_popup() {
    this.openprobationPopup = false;
    this.probation_form.reset();
    // this.removeNOCImage();
    // this.removeResignationFile();
    // this.removeRelievingFile();
    // this.resetResignationFileData();
  }
  close_Experience_popup() {
    this.openExperiencePopup = false;
    this.Experience_form.reset();
    // this.removeNOCImage();
    // this.removeResignationFile();
    // this.removeRelievingFile();
    // this.resetResignationFileData();
  }
  getMasterData() {
    this._PayoutService.GetMaster({
      "actionType": "GetMasterExitTypes",
      "productTypeId": this.product_type,
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.master_data = resData.commonData;
        // console.log(this.master_data);

      } else {
        this.master_data = [];
        this.toastr.error(resData.message);
      }
    });
  }
  onResignationTypeChange(event: any) {
    const selectedValue = event.target.value;
    this.selectedExitType = this.master_data.find(item => item.id === selectedValue)?.exittype || '';
    // Call GetReasonsOfLeaving with the selected exitTypeId
    this.GetReasons_Of_Leaving(selectedValue);
    setTimeout(() => {
      $('#relievingDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);
    this.removeResignationFile();
  }

  // Function to hide separation reason for specific resignation types
  isSeparationReasonHidden(): boolean {
    return this.selectedExitType === 'Retirement' ||
      this.selectedExitType === 'Absconding' ||
      this.selectedExitType === 'Demise';
  }

  onResignationFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.resetResignationFileData();
      return;
    }

    const file = input.files[0];
    this.documentNameResignation = file.name;

    if (file.size > 1048576) { // 1 MB limit
      this.toastr.error('File must be less than 1 MB.', 'File Size Error');
      this.clearFileInput(input);
      return;
    }

    const fileExtension = this.documentNameResignation.split('.').pop()?.toLowerCase();
    if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'pdf') {
      this.handleResignationFile(file, fileExtension);
    } else {
      this.toastr.error('Invalid file type. Only JPG, PNG, and PDF are allowed.', 'File Type Error');
      this.clearFileInput(input);
    }

    // Update the form control for originalDocumentNameResignation
    this.Exit_form.patchValue({
      originalDocumentNameResignation: this.documentNameResignation,
    });
  }
  isPdf(fileName: string): boolean {
    const extension = fileName?.split('.')?.pop()?.toLowerCase();
    return extension === 'pdf';
  }
  isImage(fileName: string): boolean {
    const extension = fileName?.split('.')?.pop()?.toLowerCase();
    return extension === 'jpg' || extension === 'jpeg' || extension === 'png';
  }

  handleResignationFile(file: File, fileType: string): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64String = reader.result as string;
      this.resignationBase64Data = base64String.split(',')[1];
      this.resignationDocumentType = file.type.split('/')[1];
      // Update form control with base64 data
      this.Exit_form.patchValue({
        documentByteCodeResignation: this.resignationBase64Data,
      });
    };

    reader.onerror = (error) => {
      console.error('File reading error: ', error);
    };
  }

  // Handling NOC file selection
  onNOCFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.originalDocumentNameNOC = '';
      this.base64DataNOC = '';
      this.clearFileInput(input);
      return;
    }

    const file = input.files[0];
    this.originalDocumentNameNOC = file.name;

    if (file.size > 1048576) { // 1 MB limit
      this.toastr.error('Uploaded NOC document must be less than 1 MB.', 'File Size Error');
      this.clearFileInput(input);
      return;
    }

    const fileExtension = this.originalDocumentNameNOC.split('.').pop()?.toLowerCase();
    if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'pdf') {
      this.handleNOCFile(file, fileExtension);
    } else {
      this.toastr.error('Invalid file type. Only JPG, PNG, and PDF are allowed.', 'File Type Error');
      this.clearFileInput(input);
    }
  }

  handleNOCFile(file: File, fileType: string): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64String = reader.result as string;
      this.base64DataNOC = base64String.split(',')[1];
      this.documentTypeNOC = file.type.split('/')[1];

      // Set form controls for NOC
      this.Exit_form.patchValue({
        documentByteCodeNOC: this.base64DataNOC,
        originalDocumentNameNOC: this.originalDocumentNameNOC,
      });
    };

    reader.onerror = (error) => {
      console.error('File reading error: ', error);
    };
  }

  clearFileInput(input: HTMLInputElement): void {
    input.value = ''; // Reset file input
  }

  resetResignationFileData(): void {
    this.documentNameResignation = '';
    this.resignationBase64Data = '';
    this.resignationDocumentType = '';
  }

  removeResignationFile(): void {
    this.resetResignationFileData();
    this.Exit_form.patchValue({
      originalDocumentNameResignation: '',
      documentByteCodeResignation: '',
    });

    const fileInput = document.querySelector('#inputGroupFile01') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  removeNOCImage(): void {
    // Clear the file input's values
    this.originalDocumentNameNOC = '';
    this.base64DataNOC = '';
    this.documentTypeNOC = '';

    // Get the specific file input by ID or class, then reset it
    const fileInput = document.querySelector('#inputGroupFile02') as HTMLInputElement; // Match with the file input ID
    if (fileInput) {
      fileInput.value = ''; // Clear the file input selection
    }

    // Reset the form controls that hold the file's data
    this.Exit_form.patchValue({
      documentByteCodeNOC: '',
      originalDocumentNameNOC: '',
    });
  }
  onForm16FileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.originalDocumentNameForm16 = '';
      this.base64DataForm16 = '';
      this.clear_FileInput(input);
      return;
    }

    const file = input.files[0];
    this.originalDocumentNameForm16 = file.name;

    if (file.size > 1048576) { // 1 MB limit
      this.toastr.error('Uploaded Form 16 must be less than 1 MB.', 'File Size Error');
      this.clear_FileInput(input);
      return;
    }

    const fileExtension = this.originalDocumentNameForm16.split('.').pop()?.toLowerCase();
    if (fileExtension === 'pdf') {
      this.handleForm16File(file);
    } else {
      this.toastr.error('Invalid file type. Only PDF is allowed.', 'File Type Error');
      this.clear_FileInput(input);
    }
  }

  handleForm16File(file: File): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64String = reader.result as string;
      this.base64DataForm16 = base64String.split(',')[1];
    };

    reader.onerror = (error) => {
      console.error('File reading error: ', error);
    };
  }

  clear_FileInput(input: HTMLInputElement): void {
    input.value = ''; // Reset file input
  }

  removeForm16File(): void {
    this.originalDocumentNameForm16 = '';
    this.base64DataForm16 = '';

    const fileInput = document.getElementById('inputGroupFileForm16') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onRelievingFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.originalDocumentNameRelievingLetter = '';
      this.relievingBase64Data = '';
      this.clearFileInput(input);
      return;
    }

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.originalDocumentNameRelievingLetter = file.name;

      if (file.size > 1048576) { // Check if file size is more than 1 MB
        this.toastr.error('Uploaded document must be less than 1 MB.', 'File Size Error');
        this.clearFileInput(input); // Clear input to reset selection
        return;
      }

      const fileExtension = this.originalDocumentNameRelievingLetter.split('.').pop()?.toLowerCase();
      if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'pdf') {
        this.handleSupportedFileRelieving(file);
      } else {
        this.toastr.error('Invalid file type. Only JPG, PNG, and PDF are allowed.', 'File Type Error');
        this.clearFileInput(input);
      }
    }
  }

  handleSupportedFileRelieving(file: File): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64String = reader.result as string;
      this.relievingBase64Data = base64String.split(',')[1]; // Store the base64 encoded string
      this.relievingDocumentType = file.type.split('/')[1]; // Store the document type
    };

    reader.onerror = (error) => {
      console.error('File reading error: ', error);
    };
  }

  removeRelievingFile(): void {
    this.originalDocumentNameRelievingLetter = '';
    this.relievingBase64Data = '';
    this.relievingDocumentType = '';

    const fileInput = document.querySelector('#inputGroupFileRelieving') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; // Clear the input file selection
    }
  }

  get sf() {
    return this.statutoryComplianceForm.controls;
  }

  get variableForm() {
    return this.statutoryComplianceForm.controls.otherVariablesDetails as FormArray;
  }

  getAppointmentDetails() {

    let emp_code = this.empDataFromParent.mobile + 'CJHUB' + (this.empDataFromParent.emp_code == '' ? this.empDataFromParent.js_id : this.empDataFromParent.emp_code) + 'CJHUB' + this.empDataFromParent.dob;
    let ecStatusValue = (this.empDataFromParent.emp_code == '' ? 'TEC' : 'EC')

    this._EmployeeService.getAppointeeDetails({
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type), 'empCode': this._EncrypterService.aesEncrypt(emp_code), 'ecStatus': ecStatusValue
    }).subscribe((resData: any): any => {
      // console.log(resData);

      if (resData.statusCode) {
        let appointMentDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.candidateDetails = appointMentDetails.candidateDetails;
        let jsonData = this.candidateDetails.emp_address != '' ? JSON.parse(this.candidateDetails.emp_address) : this.candidateDetails.emp_address;
        let nonemptyVal = Object.values(jsonData).filter(value => value !== "");
        let perm_add = nonemptyVal.join(', ');
        // this.candidateDetails.emp_address = perm_add;
        this.candidateDetails.emp_address = perm_add?.replaceAll('<br>', '');
        let basic_details = this.candidateDetails;

        this.empDataFromParent = {
          ...this.empDataFromParent,
          'joiningStatus': basic_details.joiningStatus,
          'basicdetailsupdated_status': basic_details.basicdetailsupdated_status,
          'aadharverfication_status': basic_details.aadharverfication_status,
          'pan_verification_status': basic_details.pan_verification_status,
          'accountverification_status': basic_details.accountverification_status
        }

        this.statutoryComplianceForm.patchValue({
          pfOpted: this.candidateDetails.pf_opted,
          esiOpted: this.candidateDetails.esi_opted,
        })
        if (this.candidateDetails.joiningStatus == 'RESTRUCTURE' && localStorage.getItem('restructureMode') == 'Restructure') {
          this.isEditsal = true;
          this.edit_statutory_compliances = true;
          this.restructureMode = 'Restructure';
        } else if (this.candidateDetails.joiningStatus == 'RESTRUCTURE' && localStorage.getItem('restructureMode') == 'CustomRestructureMode') {
          this.isCustomEditSal = true;
          this.restructureMode = 'CustomRestructureMode';
        } else if (this.candidateDetails.joiningStatus == 'JOINED') {
          localStorage.setItem('restructureMode', '');
        }

        let otherVariablesDetails = this.candidateDetails.others_variables_deduction_json != '' ? JSON.parse(this.candidateDetails.others_variables_deduction_json) : this.candidateDetails.others_variables_deduction_json;
        this.variableForm.clear();
        for (let idx = 0; idx < otherVariablesDetails.length; idx++) {
          this.variableForm.push(this._formBuilder.group({
            deduction_name: new FormControl(otherVariablesDetails[idx].deduction_name),
            deduction_id: new FormControl(otherVariablesDetails[idx].deduction_id),
            deduction_value: new FormControl(otherVariablesDetails[idx].deduction_amount),
            deduction_frequency: new FormControl(otherVariablesDetails[idx].deduction_frequency),
            includedinctc: new FormControl(otherVariablesDetails[idx].includedinctc),
            isvariable: new FormControl(otherVariablesDetails[idx].isvariable),
          }))
        }

        // console.log(this.candidateDetails.is_lwf_state);

        this.customSalaryform.patchValue({
          minWageState: this.candidateDetails.min_wages_state == 'Central' ? 'DELHI' : this.candidateDetails.min_wages_state.toUpperCase(),
          lwfOpted: this.candidateDetails.is_lwf_state,
          ptApplied: this.candidateDetails.pt_opted,
          pfCapApplied: this.candidateDetails.pf_cap_applied,
          pfOpted: this.candidateDetails.pf_opted,
          esiOpted: this.candidateDetails.esi_opted
        })

        this.consultantform.patchValue({
          mop: this.candidateDetails.gross,
          tdsId: parseInt(this.candidateDetails.consultanttdsid)
        })

        if (this.candidateDetails.jobType != 'Consultant') {
          this.getMinWagesState(this.cf.minWageState);
        }

        if (this.candidateDetails.joiningStatus == 'JOINED' || this.candidateDetails.joiningStatus == 'RESTRUCTURE' || this.candidateDetails.joiningStatus == 'RELIEVED') {
          this.getSalaryStructure();
        }

        this.deductionsMaster = appointMentDetails.deductionsMaster;
        this.statesMaster = appointMentDetails.statesMaster;
      } else {
        this.candidateDetails = [];
        this.deductionsMaster = [];
        this.statesMaster = [];
        return this.toastr.error(resData.message);
      }

    })
  }

  checkDOJ(): any {
    if ($('#doj').val() != '' && $('#dob') != '') {
      let dobParts = $('#dob').val().split('/');
      let formattedDateDob: any = `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`;

      let minDate = new Date(formattedDateDob);
      minDate.setFullYear(minDate.getFullYear() + 18);
      let dojValue = $('#doj').val(); // Assuming #doj contains a date in "dd-mm-yy" format
      let dojParts = dojValue.split('/');
      let formattedDateDoj = `${dojParts[2]}-${dojParts[1]}-${dojParts[0]}`;
      let dojDate = new Date(formattedDateDoj);

      if (dojDate <= minDate) {
        this.isDojValid = false;
        return this.toastr.error(`Date of joining must be greater than or equal to ${dobParts[0]}/${dobParts[1]}/${(Number(dobParts[2]) + 18)}`)
      } else {
        this.isDojValid = true;
      }
    }
  }

  getSalaryStructure() {
    this._EmployeeService.getSalaryStructure({
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()), 'empId':
        this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id),
      'salaryMode': 'Custom'
    }).subscribe((resData: any) => {
      // console.log(resData);

      if (resData.statusCode) {
        this.salaryStructure = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log("DATA FROM API --", this.salaryStructure);

        this.isGratuity = this.salaryStructure.gratuity == '' || (this.salaryStructure.gratuity != '' && Math.round(this.salaryStructure.gratuity) == 0) ? false : true;

        let date = !this.salaryStructure.effectivefrom ? '' : (this.salaryStructure.effectivefrom.substring(0, 10).split('/')[1] + '/' +
          this.salaryStructure.effectivefrom.substring(0, 10).split('/')[0] + '/' +
          this.salaryStructure.effectivefrom.substring(0, 10).split('/')[2]);

        this.customSalaryform.patchValue({
          mop: Math.round((parseFloat(this.salaryStructure.ctc)) * 12),
          minWagesCtg: this.salaryStructure.salminwagesctgid,
          pfCapApplied: !this.salaryStructure.pfcapapplied ? 'N' : this.salaryStructure.pfcapapplied,
          effectiveDate: date.substring(3, 10),
          salaryDaysOpted: this.salaryStructure.salaryindaysopted,
          salaryDays: this.salaryStructure.salarydays,
          lwfOpted: !this.salaryStructure.islwfstate ? 'N' : this.salaryStructure.islwfstate,
          hourlySalarySetup: !this.salaryStructure?.ishourlysetup ? 'N' : this.salaryStructure?.ishourlysetup,
          charityContributionEmp: !this.salaryStructure?.charity_contribution ? 'N' : this.salaryStructure?.charity_contribution,
          customTaxPercent: this.salaryStructure?.customtaxpercent,
          // daRate: this.salaryStructure.dailyallowance_rate
        })

        this.otherDetailForm.patchValue({
          salaryDaysOpted: this.salaryStructure.salaryindaysopted,
          salaryDays: this.salaryStructure.salarydays,
          daRate: this.salaryStructure.dailyallowance_rate,
          kmRate: this.salaryStructure.perkilometerrate,
          teaAllowanceFlag: this.salaryStructure.tea_allowance_enabled,
          manualTDS: this.salaryStructure.taxes,
          isTdsExempt: this.salaryStructure?.is_exemptedfromtds || 'N'
        })
        this.tds_exempted_docpath = this.salaryStructure?.tds_exempted_docpath || '';
        this.showTdsUploadForm = !this.tds_exempted_docpath;
        
        if (this.isGrpInsuranceAllowed == 'Y') {
          this.isGrpInsurance = this.salaryStructure.isgroupinsurance == 'Y' ? true : false;
          if (this.isGrpInsurance) {

            this.employeeInsurance = this.salaryStructure.insuranceamount;
            this.employerInsurance = this.salaryStructure.employerinsuranceamount;

          }
        }

        // this.calculateSal();

        this.isShowSalaryTable = true;
        this.isEmployerGratuity = this.salaryStructure.employergratuityopted != 'N' ? true : false;
        this.edli_adminchargesincludeinctc = this.salaryStructure.edli_adminchargesincludeinctc;

        // if(this.candidateDetails.joiningStatus=='RESTRUCTURE' && localStorage.getItem('restructureMode')=='CustomRestructureMode'){
        //   this.getuspccalcgrossfromctc_withoutconveyance();
        // }
        //console.log(this.isShowRoundedVal);

        // this.salaryStructure['ctcAnnual'] = this.salaryStructure['ctc'] * 12
        // this.salaryStructure['ctcAnnual'] = this.salaryStructure['ctc'] * 12;
        this.salaryStructure['ctcAnnual'] = Number(this.getRoundedVal(this.salaryStructure.ctc)) * 12;

        // this.salaryStructure['inHandAnnual'] = this.salaryStructure['salaryinhand'] * 12;
        this.salaryStructure['inHandAnnual'] = Number(this.getRoundedVal(this.salaryStructure['salaryinhand'])) * 12;
        // this.salaryStructure['grossAnnual'] = this.salaryStructure['gross'] * 12;
        this.salaryStructure['grossAnnual'] = Number(this.getRoundedVal(this.salaryStructure['gross'])) * 12;

        this.salaryStructure['total'] = (parseFloat(this.salaryStructure.gross) + parseFloat(this.salaryStructure.bonus || '0') + parseFloat(this.salaryStructure.employerepfrate || '0') + parseFloat(this.salaryStructure.employeresirate || '0') + parseFloat(this.salaryStructure.employerlwf || '0') + parseFloat(this.salaryStructure.employergratuity || '0')
          + parseFloat(this.salaryStructure.mealvouchers || '0') + parseFloat(this.salaryStructure.medicalinsurancepremium || '0') + parseFloat(this.salaryStructure.teaallowances || '0')) + parseFloat(this.salaryStructure.employerinsuranceamount || '0');

        // this.salaryStructure['totalAnnual'] = this.salaryStructure['total'] * 12
        this.salaryStructure['totalAnnual'] = Number(this.getRoundedVal(this.salaryStructure['total'])) * 12
        this.salaryStructure['total'] = this.salaryStructure['total']

        if (this.salaryStructure && typeof this.salaryStructure === 'object') {
          for (const key in this.salaryStructure) {
            if (typeof this.salaryStructure[key] === 'number' && !Number.isNaN(this.salaryStructure[key])) {

              this.salaryStructure[key] = this.salaryStructure[key];
            }
          }
        }

        const exclusions = [
          this.getEarningLabel('Conveyance'),
          this.getEarningLabel('Medical'),
          this.getEarningLabel('Bonus'),
          this.getEarningLabel('Meal Vouchers'),
          this.getEarningLabel('Medical Insurance Premium'),
          this.getEarningLabel('Tea Allowances')
        ];

        this.salaryStructure['OtherDeductions'] = [
          {
            'deduction_name': 'Salary Bonus',
            'deduction_amount': this.salaryStructure.salarybonus
          },
          {
            'deduction_name': 'Commission',
            'deduction_amount': this.salaryStructure.commission
          },
          {
            'deduction_name': 'Transport Allowance',
            'deduction_amount': this.salaryStructure.transport_allowance
          },
          {
            'deduction_name': 'Travelling Allowance',
            'deduction_amount': this.salaryStructure.travelling_allowance
          },
          {
            'deduction_name': 'Leave Encashment',
            'deduction_amount': this.salaryStructure.leave_encashment
          },
          {
            'deduction_name': 'Gratuity In Hand',
            'deduction_amount': this.salaryStructure.gratuityinhand
          },
          {
            'deduction_name': 'Overtime Allowance',
            'deduction_amount': this.salaryStructure.overtime_allowance
          },
          {
            'deduction_name': 'Notice Pay',
            'deduction_amount': this.salaryStructure.notice_pay
          },
          {
            'deduction_name': 'Hold Salary (Non Taxable)',
            'deduction_amount': this.salaryStructure.hold_salary_non_taxable
          },
          {
            'deduction_name': 'Children Education Allowance',
            'deduction_amount': this.salaryStructure.children_education_allowance
          },
          ...(this.salaryStructure.OtherDeductions && this.salaryStructure.OtherDeductions.trim() !== ""
            ? JSON.parse(this.salaryStructure.OtherDeductions).filter((deduction: any) =>
              !exclusions.includes(deduction.deduction_name)
            )
            : [])
        ]

      } else {
        this.salaryStructure = '';
      }
    })
  }

  editStatutoryCompliance(): any {

    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }

    if (this.empDataFromParent.basicdetailsupdated_status != 'Y' ||
      ((!(this.empDataFromParent.aadharverfication_status == 'Y' || this.empDataFromParent.pan_verification_status == 'Y')
        || this.empDataFromParent.accountverification_status != 'Y') && this.payout_method != 'self')) {
      return this.toastr.error("Please complete the Basic information, KYC & Bank details first!", "Oops")
    } else if (this.empDataFromParent.basicdetailsupdated_status != 'Y' && this.payout_method == 'self') {
      return this.toastr.error("Please complete the Basic information first!", "Oops")
    }

    this.edit_statutory_compliances = true;
  }

  editCustomSalaryRestructure(): any {
    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }

    if (this.empDataFromParent.basicdetailsupdated_status != 'Y' && this.payout_method == 'self') {
      return this.toastr.error("Please complete the Basic information first!", "Oops")
    } else if (this.empDataFromParent.basicdetailsupdated_status != 'Y' ||
      ((!(this.empDataFromParent.aadharverfication_status == 'Y' || this.empDataFromParent.pan_verification_status == 'Y')
        || this.empDataFromParent.accountverification_status != 'Y') && this.payout_method != 'self' && this.candidateDetails.jobType != 'Consultant')) {
      return this.toastr.error("Please complete the Basic information, KYC & Bank details first!", "Oops")
    }

    if (this.candidateDetails.joiningStatus == 'PENDING') {
      this.edit_custom_salary = true;
    }
  }

  editConsultantSalary(): any {
    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    if (this.empDataFromParent.basicdetailsupdated_status != 'Y' && this.payout_method != 'self') {
      return this.toastr.error("Please complete the Basic first!", "Oops")
    }

    this.isEditConsultantSalary = true;

  }

  editSalary(mode: any = ''): any {
    // if((this.candidateDetails.salary_setup_mode=='Custom' && mode =='CustomRestructureMode') ||
    // (this.candidateDetails.salary_setup_mode=='Advance' && mode =='Restructure')){
    this.restructureMode = mode;
    localStorage.setItem('restructureMode', mode);
    this.SetCandidateRestructureMode(mode);
  }

  SetCandidateRestructureMode(mode: any) {
    let postData = {
      customerAccountId: (this.tp_account_id.toString()),
      jsId: (this.candidateDetails.js_id),
      productTypeId: (this.product_type),
      restructureMode: (mode)
    }

    this._EmployeeService.SetTpCandidateRestructureMode(postData).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        this.toastr.success(resData.message);
        if (mode == 'Restructure' || this.isEditsal) {
          this.isEditsal = !this.isEditsal;
        } else {
          this.isCustomEditSal = !this.isCustomEditSal;
        }
        if (this.isEditsal || this.isCustomEditSal) {
          this.candidateDetails.joiningStatus = 'RESTRUCTURE';
        } else {
          this.edit_statutory_compliances = false;
          this.candidateDetails.joiningStatus = 'JOINED';
          this.getuspccalcgrossfromctc_withoutconveyance();
        }
        this.salaryDetails = '';
        this.isFormDisable = true;
      }
      else {
        this.toastr.error(resData.message);
        this.isEditsal = false;
        this.isFormDisable = false;
      }
    }, (error: any) => {
      this.toastr.error(error.error.message);
    })

  }

  discardSalary() {
    this.restructureMode = '';
    localStorage.setItem('restructureMode', '');
    this.SetCandidateRestructureMode('DiscardRestructure');
  }

  getMinWagesState(state: any) {

    this.salaryDetails = '';
    this._EmployeeService.GetMinWageCategoryByState({ 'minWagesStateName': state.value, 'productTypeId': this.product_type, 'customerAccountId': this.tp_account_id.toString() }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.minWagesCtg = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      } else {
        // this.toastr.error(resData.message)
        this.minWagesCtg = [];
      }
    })
  }

  getStatutoryPf(pf: any) {
    this.statutoryComplianceForm.patchValue({
      pfOpted: pf
    })
  }

  getStatutoryEsi(esi: any) {

    this.statutoryComplianceForm.patchValue({
      esiOpted: esi
    })
  }

  // updated logic - sidharth kaul 04.06.2025
  addVariable(variable: any) {
    const deductionVal = this.deductionsMaster.find(obj => obj.id == variable.value);
    if (!deductionVal) return;

    // Prevent duplicate entries
    for (let idx = 0; idx < this.variableForm.value.length; idx++) {
      if (this.variableForm.value[idx].deduction_name === deductionVal.deduction_name) {
        return;
      }
    }

    // Create form controls
    const group = this._formBuilder.group({
      deduction_name: new FormControl(deductionVal.deduction_name),
      deduction_id: new FormControl(Number(variable.value)),
      deduction_value: new FormControl(''),
      deduction_frequency: new FormControl(''),
      includedinctc: new FormControl(''),
      isvariable: new FormControl('')
    });

    // Apply conditional logic for 'VPF'
    if (deductionVal.deduction_name === 'VPF') {
      group.get('deduction_frequency')?.setValue('Monthly');
      // group.get('deduction_frequency')?.disable(); // Disable the dropdown
      group.get('includedinctc')?.setValue('N');
      group.get('isvariable')?.setValue('N');
    }

    if (group.get('deduction_frequency').value !== 'Monthly') {
      group.get('includedinctc')?.setValue('Y');
    }

    // For future frequency changes
    group.get('deduction_frequency')?.valueChanges.subscribe(frequency => {
      if (frequency !== 'Monthly') {
        group.get('includedinctc')?.setValue('Y');
      } else {
        group.get('includedinctc')?.setValue('');
      }
    });

    this.variableForm.push(group);
  }
  // End


  saveStatutoryForm(): any {

    // if (this.sf.pfOpted.value == '') {
    //   return this.toastr.error("Please select option for Pf opted")
    // }
    // if (this.sf.esiOpted.value == '') {
    //   return this.toastr.error("Please select option for Esi opted")
    // }

    // if(this.variableForm.length==0){
    //   return this.toastr.error("Please select atleast one variable.")
    // }

    for (let i = 0; i < this.variableForm.length; i++) {
      const currentGroup = this.variableForm.at(i) as FormGroup;

      if (
        currentGroup.get('deduction_name').value === '' ||
        currentGroup.get('deduction_value').value === '' ||
        currentGroup.get('deduction_frequency').value === '' ||
        currentGroup.get('includedinctc').value === '' ||
        currentGroup.get('isvariable').value === ''
      ) {
        // Perform your logic when an empty field is found
        return this.toastr.error(`Field at index ${i + 1} is empty.`);
      }
    }

    let postData = {
      ...this.statutoryComplianceForm.value,
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      'empId': this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
      'modifiedBy': this.token.id
    }

    this._EmployeeService.UpdateStatutoryCompliances(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.statutoryComplianceForm.reset();
        this.variableForm.clear();
        this.getAppointmentDetails();
        this.edit_statutory_compliances = false;
        return this.toastr.success(resData.message);
      } else {
        return this.toastr.error(resData.message);
      }
    })
  }

  removeVariable(idx: any) {
    this.variableForm.removeAt(idx);
  }

  getMasterSalaryStructure(): any {
    this._EmployeeService.getMasterSalaryStructure({
      'customerAccountId': this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let salary_setup_head = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.salaryPercent = {
          'basicPercent': salary_setup_head[0].calculationpercent,
          'hraPercent': salary_setup_head[1].calculationpercent
        }

        for (let idx = 0; idx < salary_setup_head.length; idx++) {
          let monthlyAmt = 0;
          // if(this.candidateDetails.joiningStatus=='JOINED' || this.candidateDetails.joiningStatus=='RESTRUCTRE'){ 

          //   if(salary_setup_head[idx].componentname!='HRA' && (salary_setup_head[idx].calculationtype=='Percent' || salary_setup_head[idx].calculationtype=='Percentage')){
          //     monthlyAmt=  ((Number(salary_setup_head[idx].calculationpercent))/100)*((Number(this.cf.mop.value))/12);
          //   }else if(salary_setup_head[idx].componentname=='HRA'){
          //     monthlyAmt= ((Number(salary_setup_head[idx].calculationpercent))/100)*Number(this.salComponentHead.controls[idx-1].value.basicSalAmount);
          //   } 
          // }
          if (salary_setup_head[idx].calculationtype == 'Flat') {

            monthlyAmt = Number(salary_setup_head[idx].calculationpercent);

          }

          // if(salary_setup_head[idx].componentname=='Hold Salary (Non Taxable)'){
          //   salary_setup_head[idx].componentname='Hold Salary (Non Taxable)'
          // }

          if (salary_setup_head[idx].isactive == 'Y') {
            this.salComponentHead.push(this._formBuilder.group({
              'salary_component_name': new FormControl(salary_setup_head[idx].componentname),
              'percentage_fixed': new FormControl(salary_setup_head[idx].calculationtype),
              'percentage_ctc': new FormControl(salary_setup_head[idx].calculationpercent),
              'is_taxable': new FormControl(salary_setup_head[idx].esiapplicable),
              'ispfapplicable': new FormControl(salary_setup_head[idx].epfapplicable),
              'salary_component_id': new FormControl(salary_setup_head[idx].id),
              'salary_component_amount': new FormControl(monthlyAmt.toFixed(2)),
              'earningType': new FormControl(salary_setup_head[idx].earningtype)
            }));
          }
          // console.log(this.salComponentHead);

        }

      } else {
        this.toastr.error(resData.message);
      }
    })
  }


  getEmployerSocialSecurityDetails(action: String) {
    this._BusinesSettingsService.GetEmployerSocialSecurityDetails({
      'customerAccountId': this.tp_account_id.toString(),
      'socialSecurityType': action
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (action == 'ESI') {
          this.esi_details = resData.commonData;
          if (this.esi_details.is_esi_registered == 'Y') {
            this.customSalaryform.patchValue({
              esiOpted: 'Y'
            })
          }
        } else if (action == 'EPF') {
          this.pf_details = resData.commonData;
          if (this.pf_details.is_epf_registered == 'Y') {
            this.customSalaryform.patchValue({
              pfOpted: 'Y'
            })
          }

        } else if (action == 'TDS') {
          this.tds_details = resData.commonData;
        } else {
          this.isGrpInsuranceAllowed = resData.commonData.groupinsurance_enablestatus;
          if (this.isGrpInsuranceAllowed == 'N') {
            this.isGrpInsurance = false;
          }
        }
      }
    })
  }

  calculateSal(): any {
    //console.log('bsic data');

    if (this.customSalaryform.controls.mop.value == '') {
      return this.toastr.error("Please enter value Annual Salary");
    }
    //console.log(this.salComponentHead.controls[0].value.percentage_ctc);
    // console.log((parseFloat(this.salComponentHead.controls[0].value.percentage_ctc) < parseFloat(this.salaryPercent.basicPercent) || parseFloat(this.salComponentHead.controls[0].value.percentage_ctc) > 100));

    if ((this.salComponentHead.controls[0].value.percentage_ctc == '' || (parseFloat(this.salComponentHead.controls[0].value.percentage_ctc) < parseFloat(this.salaryPercent.basicPercent) || parseFloat(this.salComponentHead.controls[0].value.percentage_ctc) > 100)) && this.salaryCalcType == 'percent') {
      return this.toastr.error(`Basic salary percent must be between ${this.salaryPercent.basicPercent}-100 percent`);
    }
    //console.log(this.salComponentHead.controls[1].value.percentage_ctc);
    //console.log(this.salaryPercent.hraPercent);

    // if ((this.salComponentHead.controls[1].value.percentage_ctc == '' || (parseFloat(this.salComponentHead.controls[1].value.percentage_ctc) < parseFloat(this.salaryPercent.hraPercent) || parseFloat(this.salComponentHead.controls[1].value.percentage_ctc) > 100)) && this.salaryCalcType == 'percent') {
    //   return this.toastr.error(`HRA percent must be between ${this.salaryPercent.hraPercent}-100 percent`);
    // }
    //pankaj add
    if (this.tp_account_id.toString() == '653' || this.tp_account_id.toString() == '3088' || this.tp_account_id.toString() == '5567') {

      if ((this.salComponentHead.controls[1].value.percentage_ctc == '' || (parseFloat(this.salComponentHead.controls[1].value.percentage_ctc) < parseFloat(this.salaryPercent.hraPercent) || parseFloat(this.salComponentHead.controls[1].value.percentage_ctc) > 120)) && this.salaryCalcType == 'percent') {
        return this.toastr.error(`HRA percent must be between ${this.salaryPercent.hraPercent}-120 percent`);
      }
    }
    else {
      if ((this.salComponentHead.controls[1].value.percentage_ctc == '' || (parseFloat(this.salComponentHead.controls[1].value.percentage_ctc) < parseFloat(this.salaryPercent.hraPercent) || parseFloat(this.salComponentHead.controls[1].value.percentage_ctc) > 100)) && this.salaryCalcType == 'percent') {
        return this.toastr.error(`HRA percent must be between ${this.salaryPercent.hraPercent}-100 percent`);
      }
    }
    let salary_setup_head = this.salComponentHead.controls;
    // console.log(salary_setup_head);

    this.customCalculatedData = '';

    let totalDecimalDiff = 0, allowanceIdx = -1;
    for (let idx = 0; idx < salary_setup_head.length; idx++) {
      let monthlyAmt: any = 0;
      // && salary_setup_head[idx].value.salary_component_name!='Special Allowance' && salary_setup_head[idx].value.percentage_fixed=='Percentage' && this.salaryCalcType=='percent'
      if (salary_setup_head[idx].value.salary_component_name != 'HRA' && salary_setup_head[idx].value.salary_component_name != 'Gratuity In Hand' && salary_setup_head[idx].value.percentage_fixed != 'Flat'
        && salary_setup_head[idx].value.salary_component_name != 'Special Allowance'
      ) {
        monthlyAmt = ((parseFloat(salary_setup_head[idx].value.percentage_ctc)) / 100) * ((parseFloat(this.cf.mop.value ? this.cf.mop.value : 0)) / 12);

      } else if ((salary_setup_head[idx].value.salary_component_name == 'HRA' && this.salaryCalcType == 'percent') || (salary_setup_head[idx].value.salary_component_name == 'Gratuity In Hand' && this.gratuityInHand)) {

        monthlyAmt = ((parseFloat(salary_setup_head[idx].value.percentage_ctc)) / 100) * (parseFloat(salary_setup_head[0].value.salary_component_amount));

      } else if ((salary_setup_head[idx].value.percentage_fixed == 'Flat' || this.salaryCalcType == 'percent') && salary_setup_head[idx].value.salary_component_name != 'Gratuity In Hand') {
        monthlyAmt = parseFloat(salary_setup_head[idx].value.percentage_ctc || '0')
      }
      const roundedAmt = Math.round(monthlyAmt * 100) / 100;
      const decimalDiff = monthlyAmt - roundedAmt;

      totalDecimalDiff += decimalDiff;

      salary_setup_head[idx].patchValue({
        'salary_component_amount': roundedAmt
      })

      if (salary_setup_head[idx].value.percentage_fixed == 'Flat') {
        salary_setup_head[idx].patchValue({
          'percentage_ctc': roundedAmt
        })
      }

      if (salary_setup_head[idx].value.salary_component_name != 'Special Allowance') {
        //   monthlyAmt = (((Math.round(monthlyAmt)).toFixed(2)));
        // }else{
        allowanceIdx = idx;
        // monthlyAmt = monthlyAmt + decimalDiff;
      }

    }
    if (allowanceIdx != -1) {
      const allowanceAmount = parseFloat(salary_setup_head[allowanceIdx].value.salary_component_amount || '0');
      salary_setup_head[allowanceIdx].patchValue({
        'salary_component_amount': Math.round((allowanceAmount + totalDecimalDiff) * 100) / 100,
        'percentage_ctc': Math.round((allowanceAmount + totalDecimalDiff) * 100) / 100
      })
    }
    this.isCustomInputTrigger = true;

    this.getuspccalcgrossfromctc_withoutconveyance()
    // .then(() =>{
    //    this.getuspccalcgrossfromctc_withoutconveyance()})
    // .catch((error) => console.error("Error in chained calls", error))
  }

  getuspccalcgrossfromctc_withoutconveyance(): Promise<any> {
    return new Promise((resolve, reject): any => {
      if ($('#customEffectiveDate').val() != '') {
        this.customSalaryform.patchValue({
          effectiveDate: $('#customEffectiveDate').val()
        })
      } else {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
        const yyyy = today.getFullYear();

        const currentDate = mm + '/' + yyyy;
        this.customSalaryform.patchValue({
          effectiveDate: currentDate
        })
      }
      if (this.customSalaryform.invalid) {
        return Promise.resolve();
      }
      let date = '01/' + $('#customEffectiveDate').val()
      if (this.cf.minWagesCtg.value == '') {
        this.toastr.error("Please select minimum wages category");
        return Promise.resolve();
      }
      else if (this.cf.salaryDays.value == '') {
        return this.toastr.error("Please select salary days");
      } else if (!this.cf.effectiveDate.value) {
        return this.toastr.error('Please select effective date.');
      }
      this.grossSalary = 0;
      let mop = parseFloat(((parseFloat(this.cf.mop.value)) / 12).toFixed(2))
      let conveyance_amt = 0;
      let pfSumAmt = 0;
      this.salComponentHead.controls.forEach(control => {
        const { is_taxable, ispfapplicable, percentage_fixed, percentage_ctc, salary_component_amount } = control.value;
        const value = this.safeParseFloat(percentage_fixed === 'Flat' ? percentage_ctc : salary_component_amount);

        if (is_taxable === 'N' && this.cf.esiOpted.value == 'Y') conveyance_amt += value;
        if (ispfapplicable === 'Y' && this.cf.pfOpted.value == 'Y') pfSumAmt += value;
      });
      // console.log(this.salComponentHead);

      if (this.isEmployerPartExcluded == 'Y') {
        this.grossSalary = mop;
        let sum = 0;

        for (let i = 0; i < this.salComponentHead.controls.length; i++) {
          if (this.salComponentHead.controls[i].value.percentage_fixed != 'Flat')
            sum += parseFloat(this.salComponentHead.controls[i].value.salary_component_amount);
          else
            sum += parseFloat(this.salComponentHead.controls[i].value.percentage_ctc);
        }

        if (sum != parseFloat(this.grossSalary)) {
          this.toastr.info(`Remaining Gross amount has been adjusted to special allowance which excceeds from ${(sum - this.grossSalary).toFixed(2)} amount. Adjust if you want!`)
        }

        for (let i = 0; i < this.salComponentHead.value.length; i++) {
          if (this.salComponentHead.controls[i].value.salary_component_name == 'Special Allowance') {
            this.salComponentHead.controls[i].patchValue({
              salary_component_amount: (parseFloat(this.salComponentHead.controls[i].value.salary_component_amount) + parseFloat((this.grossSalary - sum).toFixed(2))).toFixed(2),
              percentage_ctc: (parseFloat(this.salComponentHead.controls[i].value.percentage_ctc) + parseFloat((this.grossSalary - sum).toFixed(2))).toFixed(2)
            })
          }
        }
        return;
      }

      let esiOpted = this.esi_details.is_esi_registered == 'Y' ? this.cf.esiOpted.value : 'N';
      let pfOpted = this.pf_details.is_epf_registered == 'Y' ? this.cf.pfOpted.value : 'N';
      this.customSalaryform.patchValue({
        esiOpted: esiOpted,
        pfOpted: pfOpted
      })

      let postData = {
        'appointmentid': this.candidateDetails.emp_id,
        ...this.customSalaryform.value,
        'effectiveDate': date,
        'gratuityopted': this.isGratuity ? 'Y' : 'N',
        'employerGratuity': this.isEmployerGratuity ? 'Y' : 'N',
        'isEmployerPartExcluded': this.isEmployerPartExcluded,
        'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
        'basic': (Math.round(this.salComponentHead.controls[0].value.salary_component_amount)),
        'mop': parseFloat(((parseFloat(this.cf.mop.value)) / 12).toFixed(2)),
        'conveyance_amt': Math.round(conveyance_amt),
        'pfapplicablecomponents': pfSumAmt,
        'isGrpInsurance': this.isGrpInsurance ? 'Y' : 'N',
        'employeeInsurance': this.employeeInsurance,
        'employerInsurance': this.employerInsurance
      }

      this._EmployeeService.uspccalcgrossfromctc_withoutconveyance(postData).subscribe((resData1: any): any => {
        if (resData1.statusCode) {
          // console.log(resData1);

          if (resData1.commonData[0] && resData1.commonData[0].status == 0) {
            this.customSalaryMsg = resData1.commonData[0].msg;
            return;
          } else {
            this.customSalaryMsg = '';
          }
          resolve('');
          this.grossSalary = parseFloat(resData1.commonData[0].gross.toFixed(5));
          let sum = 0;

          for (let i = 0; i < this.salComponentHead.controls.length; i++) {
            if (this.salComponentHead.controls[i].value.percentage_fixed != 'Flat')
              sum += parseFloat(this.salComponentHead.controls[i].value.salary_component_amount);
            else
              sum += parseFloat(this.salComponentHead.controls[i].value.percentage_ctc);
          }

          if (sum != parseFloat(this.grossSalary)) {
            this.toastr.info(`Remaining Gross amount has been adjusted to special allowance which excceeds from ${(sum - this.grossSalary).toFixed(2)} amount. Adjust if you want!`)
          }
          for (let i = 0; i < this.salComponentHead.value.length; i++) {
            if (this.salComponentHead.controls[i].value.salary_component_name == 'Special Allowance') {

              // console.log(this.salComponentHead.controls[i].value.salary_component_amount,this.salComponentHead.controls[i].value.percentage_ctc)
              this.salComponentHead.controls[i].patchValue({
                salary_component_amount: (parseFloat(this.salComponentHead.controls[i].value.salary_component_amount ? this.salComponentHead.controls[i].value.salary_component_amount : 0) + parseFloat((this.grossSalary - sum).toFixed(2))).toFixed(2),
                percentage_ctc: (parseFloat(this.salComponentHead.controls[i].value.percentage_ctc ? this.salComponentHead.controls[i].value.percentage_ctc : 0) + parseFloat((this.grossSalary - sum).toFixed(2))).toFixed(2)
              })
            }
          }

          // this.salComponentHead.controls[2].patchValue({
          //   salary_component_amount : Math.round(this.salComponentHead.controls[2].value.salary_component_amount) + (Math.round(this.grossSalary)-sum)
          // })
        } else {
          resolve('');
          return this.toastr.error(resData1.message);
        }
      })
    })

  }

  safeParseFloat(value: any): number {
    return parseFloat(value) || 0;
  }

  getEpfVal(isChecked: any) {
    if (isChecked) {
      this.customSalaryform.patchValue({
        pfOpted: 'Y'
      })
    } else {
      this.customSalaryform.patchValue({
        pfOpted: 'N'
      })
    }
    this.customCalculatedData = '';
    this.getuspccalcgrossfromctc_withoutconveyance();
  }
  getEsiVal(isChecked: any) {
    if (isChecked) {
      this.customSalaryform.patchValue({
        esiOpted: 'Y'
      })
    } else {
      this.customSalaryform.patchValue({
        esiOpted: 'N'
      })
    }
    this.customCalculatedData = '';
    this.getuspccalcgrossfromctc_withoutconveyance();
  }

  getLwfOnchange(isChecked: boolean) {
    // console.log(isChecked);

    if (isChecked) {
      this.customSalaryform.patchValue({
        lwfOpted: 'Y'
      })
    } else {
      this.customSalaryform.patchValue({
        lwfOpted: 'N'
      })
    }
    this.customCalculatedData = '';
    this.getuspccalcgrossfromctc_withoutconveyance();
  }

  getPtOnChange(isChecked: boolean) {
    if (isChecked) {
      this.customSalaryform.patchValue({
        ptApplied: 'Y'
      })
    } else {
      this.customSalaryform.patchValue({
        ptApplied: 'N'
      })
    }
    this.customCalculatedData = '';
    this.getuspccalcgrossfromctc_withoutconveyance();
  }

  getPfCapOnChange(isChecked: boolean) {

    if (isChecked) {
      this.customSalaryform.patchValue({
        pfCapApplied: 'Y'
      })
    } else {
      this.customSalaryform.patchValue({
        pfCapApplied: 'N'
      })
    }
    this.customCalculatedData = '';
    this.getuspccalcgrossfromctc_withoutconveyance();
  }

  getGratuity(isChecked: boolean) {
    this.isGratuity = isChecked ? true : false;
    this.customCalculatedData = '';
    this.getuspccalcgrossfromctc_withoutconveyance();
  }
  getEmployerGratuity(isChecked: boolean) {
    this.isEmployerGratuity = isChecked ? true : false;
    this.customCalculatedData = '';
    this.getuspccalcgrossfromctc_withoutconveyance();
  }

  getGrpInsurance(isChecked: boolean) {
    this.isGrpInsurance = isChecked ? true : false;
    if (!isChecked) {
      this.employeeInsurance = 0;
      this.employerInsurance = 0;
    }
    this.customCalculatedData = '';
    this.getuspccalcgrossfromctc_withoutconveyance();
  }

  getIsEmployerPart(isChecked: boolean) {
    this.isEmployerPartExcluded = isChecked ? 'Y' : 'N';
    this.customCalculatedData = '';
  }

  getIsGratuityInHand(isChecked: boolean) {
    this.gratuityInHand = isChecked;
    this.customCalculatedData = '';
    this.calculateSal();
  }

  salaryInDaysCustom(isSal: any) {
    if (isSal == 'Y') {
      this.customSalaryform.patchValue({
        salaryDays: '',
        salaryDaysOpted: 'Y'
      })

    } else {
      this.customSalaryform.patchValue({
        salaryDays: 30,
        salaryDaysOpted: 'N'
      })
      this.getuspccalcgrossfromctc_withoutconveyance();
    }
  }

  get cf() {
    return this.customSalaryform.controls;
  }

  get salComponentHead() {
    return this.cf.salarystructure as FormArray;
  }

  get of() {
    return this.otherDetailForm.controls;
  }

  calculateCustomSal(): any {

    if ($('#customEffectiveDate').val() != '') {
      this.customSalaryform.patchValue({
        effectiveDate: $('#customEffectiveDate').val()
      })
    }
    let date = '01/' + $('#customEffectiveDate').val()
    if (this.cf.minWagesCtg.value == '') {
      return this.toastr.error("Please select minimum wages category");
    }
    else if (this.cf.salaryDays.value == '') {
      return this.toastr.error("Please select salary days");
    } else if (!this.cf.effectiveDate.value) {
      return this.toastr.error('Please select effective date.');
    }

    let pfSumAmt = 0;
    if (this.cf.pfOpted.value == 'Y') {
      for (let i = 0; i < this.salComponentHead.controls.length; i++) {

        if (this.salComponentHead.controls[i].value.ispfapplicable == 'Y') {
          if (this.salComponentHead.controls[i].value.percentage_fixed == 'Flat') {
            pfSumAmt += parseFloat(this.salComponentHead.controls[i].value.percentage_ctc)
          } else {
            pfSumAmt += parseFloat(this.salComponentHead.controls[i].value.salary_component_amount)
          }
        }
      }
    }

    let postData = {
      'appointmentid': this.candidateDetails.emp_id,
      ...this.customSalaryform.value,
      'effectiveDate': date,
      'gratuityopted': this.isGratuity ? 'Y' : 'N',
      'employerGratuity': this.isEmployerGratuity ? 'Y' : 'N',
      'isEmployerPartExcluded': this.isEmployerPartExcluded,
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      'basic': (parseInt(this.salComponentHead.controls[0].value.salary_component_amount)),
      'mop': Math.round((this.cf.mop.value) / 12),
      'pfSumAmt': pfSumAmt,
      'isGrpInsurance': this.isGrpInsurance ? 'Y' : 'N',
      'employeeInsurance': this.employeeInsurance,
      'employerInsurance': this.employerInsurance
    }

    let sum = 0;

    for (let i = 0; i < this.salComponentHead.controls.length; i++) {
      if (this.salComponentHead.controls[i].value.percentage_fixed != 'Flat')
        sum += parseFloat(this.salComponentHead.controls[i].value.salary_component_amount);
      else
        sum += parseFloat(this.salComponentHead.controls[i].value.percentage_ctc);

      if (this.salComponentHead.controls[i].value.salary_component_name == 'Special Allowance') {
        if (this.salComponentHead.controls[i].value.percentage_ctc < 0) {
          this.salComponentHead.controls[1].patchValue({
            salary_component_amount: parseFloat(this.salComponentHead.controls[1].value.salary_component_amount) + parseFloat(this.salComponentHead.controls[i].value.percentage_ctc),
            percentage_ctc: ((parseFloat(this.salComponentHead.controls[1].value.salary_component_amount) + parseFloat(this.salComponentHead.controls[i].value.percentage_ctc)) / parseFloat(this.salComponentHead.controls[0].value.salary_component_amount)) * 100
          })
          this.salComponentHead.controls[i].patchValue({
            salary_component_amount: 0.00,
            percentage_ctc: 0.00
          })
          // return this.toastr.error("Salary amount cannot excced Gross Salary. Please check.");
        }
      }
    }

    if (sum != parseFloat(this.grossSalary)) {
      this.toastr.info(`Remaining Gross amount has been adjusted to special allowance which excceeds from ${(this.grossSalary - sum).toFixed(2)} amount. Adjust if you want!`)
    }
    // console.log(this.grossSalary);

    postData.mop = this.grossSalary;
    this._EmployeeService.createCustomSalaryStructure(postData).subscribe((resData: any): any => {
      if (resData.statusCode) {
        if (!resData.commonData[0].status) {
          return this.toastr.error(resData.commonData[0].msg);
        }
        this.customCalculatedData = resData.commonData[0];
        // console.log(resData.commonData[0]);

        // this.customCalculatedData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

        // if (this.customCalculatedData && typeof this.customCalculatedData === 'object') {
        //   for (const key in this.customCalculatedData) {
        //     if (typeof Math.round(this.customCalculatedData[key]) === 'number' && !Number.isNaN(Math.round(this.customCalculatedData[key]))) {

        //       this.customCalculatedData[key] = Math.round(this.customCalculatedData[key]);
        //     } 
        //   }
        // }
        // console.log(this.customCalculatedData);


        this.customCalculatedData.gratuityRound = this.customCalculatedData.gratuityopted == 'Y' ? (this.customCalculatedData.gratuity) : '0';
        this.customCalculatedData.employerGratuityRound = this.customCalculatedData.employergratuityopted == 'Y' ? (this.customCalculatedData.employergratuity) : '0';
        this.leaveTemplateData = JSON.parse(this._EncrypterService.aesDecrypt(resData.templateData));
      } else {
        this.customCalculatedData = '';
      }
    })

  }

  saveCustomSal(): any {
    this.edli_adminchargesincludeinctc = this.pf_details.edli_adminchargesincludeinctc

    let pfSumAmt = 0;
    if (this.cf.pfOpted.value == 'Y') {
      for (let i = 0; i < this.salComponentHead.controls.length; i++) {

        if (this.salComponentHead.controls[i].value.ispfapplicable == 'Y') {
          if (this.salComponentHead.controls[i].value.percentage_fixed == 'Flat') {
            pfSumAmt += parseFloat(this.salComponentHead.controls[i].value.percentage_ctc)
          } else {
            pfSumAmt += parseFloat(this.salComponentHead.controls[i].value.salary_component_amount)
          }
        }
      }
    }

    let postData = {
      ...this.customCalculatedData,
      'tp_leave_template_txt': this.leaveTemplateData,
      'dateOfJoining': this.candidateDetails.dateofjoining,
      'jobRole': this.candidateDetails.post_offered,
      'customeraccountid': null,
      'unitid': null,
      'designationid': null,
      'departmentid': null,
      'pfSumAmt': pfSumAmt,
      'edli_adminchargesincludeinctc': this.edli_adminchargesincludeinctc,
      'isGrpInsurance': this.isGrpInsurance ? 'Y' : 'N',
      'employeeInsurance': this.employeeInsurance,
      'employerInsurance': this.employerInsurance,
      'isHourlySetup': this.customSalaryform.value?.hourlySalarySetup || 'N',
      'charityContributionEmp': this.customSalaryform.value?.charityContributionEmp || 'N',
      'customTaxPercent': this.customSalaryform.value?.customTaxPercent || '1'
      // 'daRate': this.cf.daRate.value
    }

    // console.log("OBJJ - saveCustomSalaryStructure", postData)
    postData['ishourlysetup'] = this.customSalaryform.value?.hourlySalarySetup || 'N';

    this._EmployeeService.saveCustomSalaryStructure(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this._EmployeeService.updateJoinigStatus({
          js_id: this._EncrypterService.aesEncrypt(this.candidateDetails.js_id.toString()),
          joining_status: "eccode_issued",
          is_ec_code_issued: "Y",
          user_by: this.tp_account_id.toString(),
          hub_emp_doj: this.candidateDetails.dateofjoining,
          hub_emp_code: this.candidateDetails.emp_code
        }).subscribe((resData1: any) => {
          if (resData1.statusCode) {
            //this.toastr.success(resData1.message);
          } else {
            //this.toastr.error(resData1.message);
          }
        })
        this.edit_custom_salary = false;
        this.customCalculatedData = '';
        this.getAppointmentDetails();
        this.isCustomEditSal = false;
        this.restructureMode = '';
        this.isCustomInputTrigger = false;
        localStorage.setItem('restructureMode', '');
        this.isShowSalaryTable = false;
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  getMinWageDays() {
    this._EmployeeService.getMinWageDays({}).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.minWageDays = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  setSalDaysReqCustom(salDayopted: any) {
    if (salDayopted.value == '30') {
      this.customSalaryform.patchValue({
        salaryDaysOpted: 'N'
      })
    } else {
      this.customSalaryform.patchValue({
        salaryDaysOpted: 'Y'
      })
    }
    this.getuspccalcgrossfromctc_withoutconveyance();
  }

  salaryInDaysOther(isSal: any) {
    if (isSal == 'Y') {
      this.otherDetailForm.patchValue({
        salaryDays: '',
        salaryDaysOpted: 'Y'
      })

    } else {
      this.otherDetailForm.patchValue({
        salaryDays: 30,
        salaryDaysOpted: 'N'
      })
    }
  }

  setSalDaysReqOther(salDayopted: any) {
    if (salDayopted.value == '30') {
      this.otherDetailForm.patchValue({
        salaryDaysOpted: 'N'
      })
    } else {
      this.otherDetailForm.patchValue({
        salaryDaysOpted: 'Y'
      })
    }
  }


  onBlur(field: string) {
    // Track the field that was changed
    this.changedFields.add(field);
  }

  saveAllDetails() {

    // Iterate over changed fields and trigger corresponding API calls
    if (this.changedFields.has('daRate')) {
      if (confirm('Are you sure you want to update the daily allowance rate?')) {
        this.saveSalaryDaysorDailyAllowance('updateDailyAllowanceRate');
      }
    }

    if (this.changedFields.has('salaryDays')) {
      if (confirm('Are you sure you want to update the salary days?')) {
        this.saveSalaryDaysorDailyAllowance('updateSalaryDays');
      }
    }

    if (this.changedFields.has('kmRate') && this.of.kmRate.value) {
      if (confirm('Are you sure you want to update the per kilometer rate?')) {
        this.saveSalaryDaysorDailyAllowance('updatePerKilometerRate');
      }
    }

    if (this.changedFields.has('teaAllowanceFlag') && this.of.teaAllowanceFlag.value) {
      if (confirm('Are you sure you want to update the tea allowance?')) {
        this.saveSalaryDaysorDailyAllowance('updateTeaAllowanceFlag');
      }
    }
    if (this.changedFields.has('manualTDS') && this.of.manualTDS.value) {
      if (confirm('Are you sure you want to update the TDS?')) {
        this.saveSalaryDaysorDailyAllowance('updateManualTDS');
      }
    }

    // for TDS Exemption by ak
    const exemptionValue = this.of.isTdsExempt?.value;
    const documentByteCode = this.of.documentByteCode?.value;
    const isDocBeingEdited = !!documentByteCode?.trim(); //documentByteCode && documentByteCode.trim() !== '';
    const isStatusChanged = this.changedFields.has('isTdsExempt');

    if ((this.isEditMode === undefined || this.isEditMode === true)) {
      // Prevent repeated submits if no new changes and already submitted once
      if (!isStatusChanged && !isDocBeingEdited && this.hasSubmittedTdsExemption) {
        this.toastr.info('No changes detected since last submission.');
        return;
      }

      // Then your existing logic here...
      if (exemptionValue === 'Y' && !this.tds_exempted_docpath) {
        // if (!isDocBeingEdited) {
        //   // Show error first if no document uploaded
        //   this.toastr.error('Please upload a document for TDS exemption.');
        // } else {
        //   // Only confirm if document is present
        //   if (confirm('Are you sure you want to update the TDS Exemption?')) {
        //     this.onSubmitTdsExemption();
        //     this.hasSubmittedTdsExemption = true; // Set this inside onSubmitTdsExemption success instead, see note below
        //   }
        // }

        if (confirm('Are you sure you want to update the TDS Exemption?')) {
          this.onSubmitTdsExemption();
          this.hasSubmittedTdsExemption = true; // Set this inside onSubmitTdsExemption success instead, see note below
        }
        

      } else if (exemptionValue === 'N' && this.tds_exempted_docpath) {
        if (confirm('This action will remove the existing TDS exemption Doc. Continue?')) {
          this.onSubmitTdsExemption();
        }
      } else if (exemptionValue === 'N' && !this.tds_exempted_docpath) {
        if (isStatusChanged) {
          if (confirm('Are you sure you want to update the TDS Exemption?')) {
            this.onSubmitTdsExemption();
          }
        }
      } else if (isDocBeingEdited) {
        if (confirm('Are you sure you want to update the TDS Exemption?')) {
          this.onSubmitTdsExemption();
        }
      }
    }

    // Clear the changed fields set after saving

  }

  saveSalaryDaysorDailyAllowance(action: string): any {

    if (action == 'updateDailyAllowanceRate' && this.of.daRate.value == '') {
      return this.toastr.error("Please enter daily allowance rate");
    }

    if (action == 'updateSalaryDays' && (this.of.salaryDays.value == '' || this.of.salaryDaysOpted.value == '')) {
      return this.toastr.error("Please select salary days");
    }

    let postData = {
      action: action,
      customerAccountId: this.tp_account_id.toString(),
      userby: this.tp_account_id.toString(),
      empCode: this.candidateDetails.emp_code,
      ...this.otherDetailForm.value
    }
    this._EmployeeService.updateSalaryDaysOrDailyAllowanceRate(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.changedFields.clear();
        this.getSalaryStructure();
      } else {
        this.toastr.error(resData.message);
      }
    })
  }
  GetExit_Details() {
    this._EmployeeManagementService.GetExitDetails({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "empCode": this.empDataFromParent?.emp_code?.toString()
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.exit_detail_data = resData.commonData;
          // console.log(this.exit_detail_data?.emp_code);
          // this.toastr.success(resData.message, 'Success');
        } else {
          this.exit_detail_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  GetReasons_Of_Leaving(exitTypeId: string) {
    this._EmployeeManagementService.GetReasonsOfLeaving({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "exitTypeId": exitTypeId?.toString()
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.reason_of_leaving_data = resData.commonData;
          // console.log(this.reason_of_leaving_data);
        } else {
          this.reason_of_leaving_data = [];
          // this.toastr.error(resData.message, 'Oops!');
        }
      });
  }
  handleExitDetails(): void {
    if (this.exit_detail_data?.exit_status_id === "") {
      // Call AddEditExit_Details if exit_status_id is an empty string
      this.AddEditExit_Details();
    } else {
      // Call EditExit_Details if exit_status_id has a value
      this.EditExit_Details();
    }
  }
  AddEditExit_Details() {
    const resig_documentUploadType = this.resignationBase64Data ? "New" : "";
    const documentName = resig_documentUploadType === "New" ? this.documentNameResignation : "";

    const reliv_documentUploadType = this.relievingBase64Data ? "New" : "";
    const reliv_documentName = reliv_documentUploadType === "New" ? this.originalDocumentNameRelievingLetter : "";

    const noc_documentUploadType = this.base64DataNOC ? "New" : "";
    const noc_documentName = noc_documentUploadType === "New" ? this.originalDocumentNameNOC : "";

    const createdBy = `${this.employer_name}-${this.employer_mobile}`;
    // console.log(createdBy);

    this._EmployeeManagementService.AddEditExitDetails({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "empId": this.empDataFromParent?.emp_id?.toString(),
      "action": "AddExitDetails",
      "createdBy": createdBy,
      "exitTypeId": this.Exit_form.get('exitTypeId')?.value?.toString(),
      "resignationDate": $('#resignationDate').val(),
      "noticePeriod": this.Exit_form.get('noticePeriod')?.value?.toString() || '',
      "relievingDate": $('#relievingDate').val(),
      "documentUploadTypeResignation": resig_documentUploadType,
      "originalDocumentNameResignation": documentName,
      "documentByteCodeResignation": this.resignationBase64Data?.toString(),
      "exitReason": this.Exit_form.get('exitReason')?.value?.toString() || '',
      "exitRowId": "",
      "NOCClearanceDate": $('#NOCClearanceDate').val(),
      "documentUploadTypeNOC": noc_documentUploadType,
      "originalDocumentNameNOC": noc_documentName,
      "documentByteCodeNOC": this.base64DataNOC?.toString(),
      "documentUploadTypeRelievingLetter": reliv_documentUploadType,
      "originalDocumentNameRelievingLetter": reliv_documentName,
      "documentByteCodeRelievingLetter": this.relievingBase64Data?.toString(),
      "finalDues": this.Exit_form.get('finalDues')?.value?.toString() || '',
      "clearanceDate": $('#clearanceDate').val()
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.add_exit_data = resData.commonData;


          this.close_exit_popup()
          this.GetExit_Details();
          // console.log(this.add_exit_data);
          this.toastr.success(resData.message, 'Success');
        } else {
          this.add_exit_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  EditExit_Details() {
    let resig_documentUploadType: string;

    if (this.resignationBase64Data) {
      resig_documentUploadType = "New";
    } else if (this.exit_detail_data?.resignation_doc_path !== "") {
      resig_documentUploadType = "Same";
    } else {
      resig_documentUploadType = "";
    }
    const documentName = resig_documentUploadType === "New" ? this.documentNameResignation : "";

    let reliv_documentUploadType: string;
    if (this.relievingBase64Data) {
      reliv_documentUploadType = "New";
    } else if (this.exit_detail_data?.relieving_experience_letter_path !== "") {
      reliv_documentUploadType = "Same";
    } else {
      reliv_documentUploadType = "";
    }
    // In case of "Same", document name is not required
    const reliv_documentName = reliv_documentUploadType === "New" ? this.originalDocumentNameRelievingLetter : "";

    let noc_documentUploadType: string;
    if (this.base64DataNOC) {
      noc_documentUploadType = "New";
    } else if (this.exit_detail_data?.noc_doc_path !== "") {
      noc_documentUploadType = "Same";
    } else {
      noc_documentUploadType = "";
    }
    const noc_documentName = noc_documentUploadType === "New" ? this.originalDocumentNameNOC : "";

    const createdBy = `${this.employer_name}-${this.employer_mobile}`;
    // console.log(createdBy);

    this._EmployeeManagementService.AddEditExitDetails({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "empId": this.empDataFromParent?.emp_id?.toString(),
      "action": "EditExitDetails",
      "createdBy": createdBy,
      "exitTypeId": this.Exit_form.get('exitTypeId')?.value?.toString(),
      "resignationDate": $('#resignationDate').val(),
      "noticePeriod": this.Exit_form.get('noticePeriod')?.value?.toString() || '',
      "relievingDate": $('#relievingDate').val(),
      "documentUploadTypeResignation": resig_documentUploadType,
      "originalDocumentNameResignation": documentName,
      "documentByteCodeResignation": this.resignationBase64Data?.toString() || '',
      "exitReason": this.Exit_form.get('exitReason')?.value?.toString() || '',
      "exitRowId": this.exit_detail_data?.exit_row_id?.toString(),
      "NOCClearanceDate": $('#NOCClearanceDate').val(),
      "documentUploadTypeNOC": noc_documentUploadType,
      "originalDocumentNameNOC": noc_documentName,
      "documentByteCodeNOC": this.base64DataNOC?.toString() || '',
      "documentUploadTypeRelievingLetter": reliv_documentUploadType,
      "originalDocumentNameRelievingLetter": reliv_documentName,
      "documentByteCodeRelievingLetter": this.relievingBase64Data?.toString() || '',
      "finalDues": this.Exit_form.get('finalDues')?.value?.toString() || '',
      "clearanceDate": $('#clearanceDate').val()
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.add_exit_data = resData.commonData;
          this.close_exit_popup()
          this.GetExit_Details();
          // console.log(this.add_exit_data);
          this.toastr.success(resData.message, 'Success');
        } else {
          this.add_exit_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  verify_and_lock() {

    let resig_documentUploadType: string;

    if (this.resignationBase64Data) {
      resig_documentUploadType = "New";
    } else if (this.exit_detail_data?.resignation_doc_path !== "") {
      resig_documentUploadType = "Same";
    } else {
      resig_documentUploadType = "";
    }
    const documentName = resig_documentUploadType === "New" ? this.documentNameResignation : "";

    let reliv_documentUploadType: string;
    if (this.relievingBase64Data) {
      reliv_documentUploadType = "New";
    } else if (this.exit_detail_data?.relieving_experience_letter_path !== "") {
      reliv_documentUploadType = "Same";
    } else {
      reliv_documentUploadType = "";
    }
    // In case of "Same", document name is not required
    const reliv_documentName = reliv_documentUploadType === "New" ? this.originalDocumentNameRelievingLetter : "";

    let noc_documentUploadType: string;
    if (this.base64DataNOC) {
      noc_documentUploadType = "New";
    } else if (this.exit_detail_data?.noc_doc_path !== "") {
      noc_documentUploadType = "Same";
    } else {
      noc_documentUploadType = "";
    }
    const noc_documentName = noc_documentUploadType === "New" ? this.originalDocumentNameNOC : "";

    const createdBy = `${this.employer_name}-${this.employer_mobile}`;
    // console.log(createdBy);

    this._EmployeeManagementService.AddEditExitDetails({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "empId": this.empDataFromParent?.emp_id?.toString(),
      "action": "FinalVerifyAndLock",
      "createdBy": createdBy,
      "exitTypeId": this.Exit_form.get('exitTypeId')?.value?.toString(),
      "resignationDate": $('#resignationDate').val(),
      "noticePeriod": this.Exit_form.get('noticePeriod')?.value?.toString() || '',
      "relievingDate": $('#relievingDate').val(),
      "documentUploadTypeResignation": resig_documentUploadType,
      "originalDocumentNameResignation": documentName,
      "documentByteCodeResignation": this.resignationBase64Data?.toString(),
      "exitReason": this.Exit_form.get('exitReason')?.value?.toString() || '',
      "exitRowId": this.exit_detail_data?.exit_row_id?.toString(),
      "NOCClearanceDate": $('#NOCClearanceDate').val(),
      "documentUploadTypeNOC": noc_documentUploadType,
      "originalDocumentNameNOC": noc_documentName,
      "documentByteCodeNOC": this.base64DataNOC?.toString(),
      "documentUploadTypeRelievingLetter": reliv_documentUploadType,
      "originalDocumentNameRelievingLetter": reliv_documentName,
      "documentByteCodeRelievingLetter": this.relievingBase64Data?.toString(),
      "finalDues": this.Exit_form.get('finalDues')?.value?.toString() || '',
      "clearanceDate": $('#clearanceDate').val()
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.add_exit_data = resData.commonData;
          this.close_exit_popup()
          this.GetExit_Details();
          // console.log(this.add_exit_data);
          this.toastr.success(resData.message, 'Success');
        } else {
          this.add_exit_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  pay_salary_slip() {
    const empcodestring = `${this.empDataFromParent?.mobile?.toString()}CJHUB${this.empDataFromParent?.emp_code?.toString()}CJHUB${this.empDataFromParent?.dob?.toString()}CJHUB${this.month.toString()}CJHUB${this.year.toString()}`;

    this._EmployeeManagementService.GetSalarySlipURL({
      "productTypeId": this._EncrypterService.aesEncrypt(this.product_type),
      "empCodeString": this._EncrypterService.aesEncrypt(empcodestring.toString()),
      "source": "Employer"
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.flag = true;  // Set flag to true if statusCode is successful
        const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(resData.pdfPath);

        if (sanitizedUrl) {
          this.payslip_data = sanitizedUrl;
          this.toastr.success(resData.message, 'Success');
        } else {
          this.flag = false;
          this.payslip_data = null;
          this.toastr.error('Invalid PDF Path', 'Error');
        }
      } else {
        this.flag = false;
        this.payslip_data = null;  // Reset on failure
        this.toastr.error(resData.message, 'Oops!');
      }
    });
  }

  GetForm16_Details() {
    this._EmployeeManagementService.GetForm16Details({
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "financialYear": this.selectedFinancialYear?.toString()
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.GetForm16_data = resData.commonData;
          this.form16_flag = resData.statusCode;
          // console.log(this.GetForm16_data[0]?.form16path);

          // this.toastr.success(resData.message, 'Success');
        } else {
          this.GetForm16_data = [];
          this.form16_flag = false;
          console.error('Error:', resData.message);
          // this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  Add_Form16() {
    const createdByUserName = `${this.employer_name}-${this.employer_mobile}`;
    // console.log(createdByUserName);

    this._EmployeeManagementService.AddEditForm16({
      "action": "AddForm16",
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "financialYear": this.selectedFinancialYear?.toString(),
      "createdBy": this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName?.toString(),
      "form16RowId": "",
      "documentByteCode": this.base64DataForm16?.toString(),
      "originalDocumentName": this.originalDocumentNameForm16?.toString()
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.addForm16_data = resData.commonData;
          this.form16_flag = resData.statusCode;
          this.GetForm16_Details();
          this.close_form16_popup();
          // console.log(this.addForm16_data);
          this.toastr.success(resData.message, 'Success');
        } else {
          this.form16_flag = false;
          this.addForm16_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  Edit_Form16() {
    const createdByUserName = `${this.employer_name}-${this.employer_mobile}`;
    // console.log(createdByUserName);

    this._EmployeeManagementService.AddEditForm16({
      "action": "EditForm16",
      "customerAccountId": this.tp_account_id?.toString(),
      "productTypeId": this.product_type,
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "financialYear": this.selectedFinancialYear?.toString(),
      "createdBy": this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName?.toString(),
      "form16RowId": this.form16_id?.toString(),
      "documentByteCode": this.base64DataForm16?.toString(),
      "originalDocumentName": this.originalDocumentNameForm16?.toString()
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.addForm16_data = resData.commonData;
          this.form16_flag = resData.statusCode;
          this.GetForm16_Details();
          this.closeEditPopup();
          // console.log(this.addForm16_data);
          this.toastr.success(resData.message, 'Success');
        } else {
          this.form16_flag = false;
          this.addForm16_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  printSalaryStructure() {
    var modalContent = document.querySelector('#salarystructure');
    var printWindow = window.open('', '_blank');

    printWindow.document.open();
    printWindow.document.write('<html><head><title>Salary Structure</title>');
    printWindow.document.write('<link rel="stylesheet" href="assets/css/style.css">');
    printWindow.document.write('<link rel="stylesheet" href="assets/plugins/css/plugins.css">');
    printWindow.document.write('<link rel="stylesheet" href="assets/css/bootstrap.min.css">');
    printWindow.document.write(`<style> .Appointment-outer-box{
      width:100%;
    }
    .Appointment-outer-box table tr th {
      font-weight: 600;
      background: #ceedff;
      line-height:30px;
      text-align: left;
      padding-left: 10px;
    }
    .Appointment-outer-box table tr.danger1 th {
      font-weight: 600;
      background: #ceedff;
      text-align: left;
      padding-left: 10px;
      line-height:30px;
    }
    .danger1 td{
      padding-left:10px;
      line-height:30px;
    }
    .danger3 td, .danger3 th {
      background: #337ab7 !important;
      color: #fff;
      padding-left :10px;
      line-height:30px;
    }
    .table-responsive{
      width: 100%;
    }
    table.table{
      width:100%;
    }
    p{
      font-size: 14px;
      text-align: center;
      margin: 0 0 10px;
      line-height: 1.8;
    }
    </style>`);
    printWindow.document.write(`</head><body><div class="Appointment-outer-box">
    <h3 style="padding: 0px;margin-top: 8px;text-align:center;margin-top: 43px;">ANNEXURE-A</h3>
    <p>Annual Earning Opportunity For ${this.candidateDetails.emp_name}</p>`);
    printWindow.document.write(modalContent.innerHTML);
    printWindow.document.write('</div></body></html>');
    printWindow.document.close();

    var printStyle = `
                      <style>
                        @media print {

                   body {
                    background-color: #eef5f9;
                    color: #67757c;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 12px;
                    line-height: 1.618;
                    overflow-x: hidden;
                    -webkit-font-smoothing: antialiased;
                    margin: 0;
                    font-weight: 400;
                    }
                    .Appointment-outer-box{
                      width:100%;
                    }
                    .Appointment-outer-box table tr th {
                      font-weight: 600;
                      background: #ceedff;
                    }
                    .Appointment-outer-box table tr.danger1 th {
                      font-weight: 600;
                      background: #ceedff;
                      text-align: left;
                      padding-left: 10px;
                    }
                    .danger1 td{
                      padding-left:10px;
                    }
                    .danger3 td, .danger3 th {
                      background: #337ab7 !important;
                      color: #fff;
                      padding-left :10px;
                    }
                    .table-responsive{
                      width: 100%;
                    }
                    table.table{
                      width:100%;
                    }
                 </style>`;
    printWindow.document.head.insertAdjacentHTML('beforeend', printStyle);

    printWindow.print();
    // printWindow.window.close();

  }

  clearCalculatedData(idx: any, amount: any): any {
    this.customCalculatedData = '';
    let mop = Math.round((parseFloat(this.customSalaryform.value.mop)) / 12);

    if (this.salComponentHead.controls[idx].value.salary_component_amount > mop) {
      return this.toastr.error("Basic Salary cannot exceed the monthly ctc amount.");
    }
    this.isCustomInputTrigger = true;
    this.salComponentHead.controls[idx].patchValue({
      salary_component_amount: amount == '' ? '0.00' : (amount)
    })
    if (this.salComponentHead.controls[idx].value.percentage_fixed == 'Flat') {
      this.salComponentHead.controls[idx].patchValue({
        percentage_ctc: amount == '' ? '0.00' : (amount)
      })
    }
    if (this.salaryCalcType == 'flat') {
      this.salComponentHead.controls[0].patchValue({
        // salary_component_amount : parseFloat(this.salComponentHead.controls[0].value.salary_component_amount) + parseFloat(this.salComponentHead.controls[i].value.percentage_ctc),
        percentage_ctc: (parseFloat(this.salComponentHead.controls[0].value.salary_component_amount) / ((parseFloat(this.cf.mop.value)) / 12)) * 100
      })
    }
    if (idx == 0) {
      for (let i = 0; i < this.salComponentHead.controls.length; i++) {
        if (this.salComponentHead.controls[i].value.salary_component_name == 'HRA' && this.salaryCalcType != 'flat') {
          let amount: number = (((this.salComponentHead.controls[i].value.percentage_ctc)) / 100) * ((parseInt(this.salComponentHead.controls[0].value.salary_component_amount)));

          this.salComponentHead.controls[i].patchValue({
            salary_component_amount: Math.round(amount)
          })
        }
      }

    }

    let sum = 0;

    for (let i = 0; i < this.salComponentHead.controls.length; i++) {
      if (this.salComponentHead.controls[i].value.salary_component_name != 'Special Allowance') {
        if (this.salComponentHead.controls[i].value.percentage_fixed != 'Flat')
          sum += parseFloat(this.salComponentHead.controls[i].value.salary_component_amount);
        else
          sum += parseFloat(this.salComponentHead.controls[i].value.percentage_ctc);
      }
    }

    // if(sum!=parseFloat(this.grossSalary)){
    //   this.toastr.info(`Remaining Gross amount hass been adjusted to special allowance which excceeds from ${(this.grossSalary-sum).toFixed(2)} amount. Adjust if you want!`)
    // }
    for (let i = 0; i < this.salComponentHead.value.length; i++) {
      if (this.salComponentHead.controls[i].value.salary_component_name == 'Special Allowance') {

        this.salComponentHead.controls[i].patchValue({
          salary_component_amount: (parseFloat(this.salComponentHead.controls[i].value.salary_component_amount) + parseFloat((this.grossSalary - sum).toFixed(2))).toFixed(2),
          percentage_ctc: (parseFloat(this.salComponentHead.controls[i].value.salary_component_amount) + parseFloat((this.grossSalary - sum).toFixed(2))).toFixed(2)
        })

        if (this.salComponentHead.controls[i].value.percentage_ctc < 0) {
          // this.salComponentHead.controls[1].patchValue({
          //   salary_component_amount : parseFloat(this.salComponentHead.controls[1].value.salary_component_amount) + parseFloat(this.salComponentHead.controls[i].value.percentage_ctc),
          //   percentage_ctc : ((parseFloat(this.salComponentHead.controls[1].value.salary_component_amount) + parseFloat(this.salComponentHead.controls[i].value.percentage_ctc)) / parseFloat(this.salComponentHead.controls[0].value.salary_component_amount)) * 100 
          // })
          this.salComponentHead.controls[i].patchValue({
            salary_component_amount: 0.00,
            percentage_ctc: 0.00
          })

          // return
          //  this.toastr.warning("Salary amount cannot excced Gross Salary. Please check.");
        }
      }

    }
    // if(this.salComponentHead.controls[idx].value.is_taxable=='N' || idx==0){
    this.getuspccalcgrossfromctc_withoutconveyance()
    // .then(() => this.getuspccalcgrossfromctc_withoutconveyance())
    // .catch((error) => console.error("Error in chained calls", error))

    // }
  }

  getMasterTDS() {
    this._EmployeeService.getMasterTDS({ 'actionType': 'GetAllPaymentPurposes', 'productTypeId': this.product_type }).subscribe((resData: any) => {
      //  console.log(resData);

      if (resData.statusCode) {
        this.masterTDS = resData.commonData;
      } else {
        this.toastr.error(resData.message);
      }
    })
  }


  getMasterLetters(letterid: any = '') {

    this._EmployeeManagementService.getMasterLetters({
      'productTypeId': this.product_type, 'customerAccountId': this.tp_account_id.toString(),
      'lettersType': 'Termination Letter', 'letterId': letterid
    }).subscribe((resData: any) => {
      // console.log(resData.commonData);

      if (resData.statusCode) {
        if (!letterid) {
          this.masterTemplateList = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        } else {
          let template = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))[0];
          // this.appointmentLetterForm.patchValue({
          //   template_html: template.template_html,
          //   subject: template.email_subject,
          //   body: template.email_body
          // })

          // $('#attachment').val(template.template_html)
        }

      }
    })
  }


  getMasterLettersforprobtaion(letterid: any = '') {

    this._EmployeeManagementService.getMasterLetters({
      'productTypeId': this.product_type, 'customerAccountId': this.tp_account_id.toString(),
      'lettersType': 'Confirmation Letter', 'letterId': letterid
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (!letterid) {
          this.masterTemplateListforprobation = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        } else {
          let template = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))[0];
          // this.appointmentLetterForm.patchValue({
          //   template_html: template.template_html,
          //   subject: template.email_subject,
          //   body: template.email_body
          // })

          // $('#attachment').val(template.template_html)
        }

      }
    })
  }

  getMasterLettersforExperience(letterid: any = '') {

    this._EmployeeManagementService.getMasterLetters({
      'productTypeId': this.product_type, 'customerAccountId': this.tp_account_id.toString(),
      'lettersType': 'Relieving letter', 'letterId': letterid
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (!letterid) {
          this.masterTemplateListforExperience = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        } else {
          let template = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))[0];

        }

      }
    })
  }

  getTemplateById(templateid: any, action: any = '') {
    // console.log(this.salaryStructure);
    let postData = {
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empId: this.empDataFromParent.emp_id,
      templateId: templateid
    }
    if (templateid) {
      this._EmployeeManagementService.getLetterTemplateId(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          let template = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.template_data = template;
          // console.log(template);

          this.Exit_form.patchValue({
            template_html: template[0].templatetext,
            subject: template[0].email_subject,
            body: template[0].email_body,
            header: template[0].header,
            footer: template[0].footer
          })

        }
      })
    }
  }

  getTemplateByIdforprobation(templateid: any, action: any = '') {
    // console.log(this.salaryStructure);

    let postData = {
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empId: this.empDataFromParent.emp_id,
      templateId: templateid
    }
    if (templateid) {

      this._EmployeeManagementService.getLetterTemplateId(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          let template = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.template_data = template;
          // console.log(template);

          this.probation_form.patchValue({
            template_html: template[0].templatetext,
            subject: template[0].email_subject,
            body: template[0].email_body,
            header: template[0].header,
            footer: template[0].footer
          })

        }
      })
    }
  }

  getTemplateByIdforExperience(templateid: any, action: any = '') {

    let postData = {
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empId: this.empDataFromParent.emp_id,
      templateId: templateid
    }
    if (templateid) {

      this._EmployeeManagementService.getLetterTemplateId(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          let template = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.template_data = template;
          // console.log(template);

          this.Experience_form.patchValue({
            template_html: template[0].templatetext,
            subject: template[0].email_subject,
            body: template[0].email_body,
            header: template[0].header,
            footer: template[0].footer
          })

        }
      })
    }
  }

  pdfUrl: SafeResourceUrl | null = null;

  async previewLetter1() {
    this.confirmationModal = true;
    // console.log(this.template_data);
    // console.log(this.appointmentLetterForm.get('header').value);
    try {


      let formData = new FormData();
      let htmlContent = `<table>`
      htmlContent += `<tr><td><img src="${this.template_data[0].header}" width="500"></td></tr>`;
      htmlContent += `<tr> <td><div class="main" style="font-size:10px;">${this.template_data[0].templatetext}</div></td></tr></table>`;
      // return
      htmlContent = htmlContent.replace(/(<p[^>]*style="[^"]*font-size:)(\s?\d+px)([^"]*")/g, '$110px$3');
      htmlContent = htmlContent.replace(/(<h\d[^>]*style="[^"]*font-size:)(\s?\d+px)([^"]*")/g, '$115px$3');
      // console.log(htmlContent);

      formData.append('htmlBody', htmlContent);
      formData.append('footerBody', this.template_data[0].footer);
      // API call to get the PDF (using async/await)
      const options = {
        method: 'POST',
        url: 'https://api.contract-jobs.com/crm_api/TpApi/rendorPdf2',
        headers: {
          "Content-Type": "application/text",
        },
        data: formData
      };

      const temp = await axios(options);
      // console.log(temp);
      const base64Data = temp.data.commonData;
      // Process the base64 PDF data and upload
      // const base64Data = temp;
      // console.log(base64Data);

      const unsafeUrl = `data:application/pdf;base64,${base64Data}`;
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
    }
    catch (err) {
    }
  }

  closeConfirmModal() {
    this.confirmationModal = false;
  }

  async previewCurrentLetter1() {
    this.confirmationModal = true;
    // console.log(this.template_data);
    // console.log(this.appointmentLetterForm.get('header').value);
    try {


      let formData = new FormData();
      let htmlContent = `<table>`
      htmlContent += `<tr><td><img src="${this.template_data[0].header}" ></td></tr>`;
      htmlContent += `<tr> <td><div class="main" style="font-size:10px;">${this.Experience_form.get('template_html').value}</div></td></tr></table>`;
      // return
      htmlContent = htmlContent.replace(/(<p[^>]*style="[^"]*font-size:)(\s?\d+px)([^"]*")/g, '$110px$3');
      htmlContent = htmlContent.replace(/(<h\d[^>]*style="[^"]*font-size:)(\s?\d+px)([^"]*")/g, '$115px$3');
      // console.log(htmlContent);

      formData.append('htmlBody', htmlContent);
      formData.append('footerBody', this.template_data[0].footer);
      // API call to get the PDF (using async/await)
      const options = {
        method: 'POST',
        url: 'https://api.contract-jobs.com/crm_api/TpApi/rendorPdf2',
        headers: {
          "Content-Type": "application/text",
        },
        data: formData
      };

      const temp = await axios(options);
      // console.log(temp);
      const base64Data = temp.data.commonData;
      // Process the base64 PDF data and upload
      // const base64Data = temp;
      // console.log(base64Data);

      const unsafeUrl = `data:application/pdf;base64,${base64Data}`;
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);

    }
    catch (err) {

    }
  }
  async previewCurrentLetter2() {
    this.confirmationModal = true;
    // console.log(this.template_data);
    // console.log(this.appointmentLetterForm.get('header').value);
    try {


      let formData = new FormData();
      let htmlContent = `<table>`
      htmlContent += `<tr><td><img src="${this.template_data[0].header}" ></td></tr>`;
      htmlContent += `<tr> <td><div class="main" style="font-size:10px;">${this.Exit_form.get('template_html').value}</div></td></tr></table>`;
      // return
      htmlContent = htmlContent.replace(/(<p[^>]*style="[^"]*font-size:)(\s?\d+px)([^"]*")/g, '$110px$3');
      htmlContent = htmlContent.replace(/(<h\d[^>]*style="[^"]*font-size:)(\s?\d+px)([^"]*")/g, '$115px$3');
      // console.log(htmlContent);

      formData.append('htmlBody', htmlContent);
      formData.append('footerBody', this.template_data[0].footer);
      // API call to get the PDF (using async/await)
      const options = {
        method: 'POST',
        url: 'https://api.contract-jobs.com/crm_api/TpApi/rendorPdf2',
        headers: {
          "Content-Type": "application/text",
        },
        data: formData
      };

      const temp = await axios(options);
      // console.log(temp);
      const base64Data = temp.data.commonData;
      // Process the base64 PDF data and upload
      // const base64Data = temp;
      // console.log(base64Data);

      const unsafeUrl = `data:application/pdf;base64,${base64Data}`;
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);

    }
    catch (err) {

    }
  }
  async previewCurrentLetter3() {
    this.confirmationModal = true;
    // console.log(this.template_data);
    // console.log(this.appointmentLetterForm.get('header').value);
    try {


      let formData = new FormData();
      let htmlContent = `<table>`
      htmlContent += `<tr><td><img src="${this.template_data[0].header}" ></td></tr>`;
      htmlContent += `<tr> <td><div class="main" style="font-size:10px;">${this.probation_form.get('template_html').value}</div></td></tr></table>`;
      // return
      htmlContent = htmlContent.replace(/(<p[^>]*style="[^"]*font-size:)(\s?\d+px)([^"]*")/g, '$110px$3');
      htmlContent = htmlContent.replace(/(<h\d[^>]*style="[^"]*font-size:)(\s?\d+px)([^"]*")/g, '$115px$3');
      // console.log(htmlContent);

      formData.append('htmlBody', htmlContent);
      formData.append('footerBody', this.template_data[0].footer);
      // API call to get the PDF (using async/await)
      const options = {
        method: 'POST',
        url: 'https://api.contract-jobs.com/crm_api/TpApi/rendorPdf2',
        headers: {
          "Content-Type": "application/text",
        },
        data: formData
      };

      const temp = await axios(options);
      // console.log(temp);
      const base64Data = temp.data.commonData;
      // Process the base64 PDF data and upload
      // const base64Data = temp;
      // console.log(base64Data);

      const unsafeUrl = `data:application/pdf;base64,${base64Data}`;
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);

    }
    catch (err) {

    }
  }

  // Start - hourly salary setup setting
  change_hourlySalarySetup(check: any) {
    // console.log("CHECK-------", check)
    let value = check ? 'Y' : 'N';
    this.customSalaryform.patchValue({
      hourlySalarySetup: value,
    })

  }



  hourlySalarySetup(val: any) {
    // this.salaryStructure?.ishourlysetup
    let hourlySalarySetup = !this.antctrl?.hourlySalarySetup?.value ? '' : this.antctrl?.hourlySalarySetup?.value;
    return hourlySalarySetup.includes(val);
  }
  // End - hourly salary setup setting

  // Start - charity contribution by employee sidharth kaul dated. 15.05.2025
  change_charityContributionEmp(check: any) {
    // console.log("CHECK-------", check)
    let value = check ? 'Y' : 'N';
    this.customSalaryform.patchValue({
      charityContributionEmp: value
    })
  }

  charityContributionEmp(val: any) {
    // this.salaryStructure?.ishourlysetup
    let charityContributionEmp = !this.antctrl?.charityContributionEmp?.value ? '' : this.antctrl?.charityContributionEmp?.value;
    return charityContributionEmp.includes(val);
  }
  // End - charity contribution by employee


  // Utility Functions/Getters
  get antctrl() {
    return this.customSalaryform.controls;
  }

  formatCustomDate(dateString: string): string {
    const [month, day, year] = dateString.split(' ')[0].split('/');
    return `${day}/${month}/${year}`;
  }

  validateTaxPercent() {
    const control = this.customSalaryform.get('customTaxPercent');
    let value = parseFloat(control?.value);

    // If it's not a number or out of range, reset to 0
    if (isNaN(value)) {
      control?.setValue('0');
      return;
    }

    // Clamp the value between 0 and 100
    if (value < 0) value = 0;
    if (value > 100) value = 100;

    // Round to 2 decimal places (or nearest int if you prefer)
    control?.setValue(value.toFixed(2));
  }
  getEarningLabel(componentName: string): string {
    const controlsArray = this.salComponentHead.controls;

    const match = controlsArray.find((control) => {
      const name = control.get('salary_component_name')?.value;
      return name?.toLowerCase() === componentName.toLowerCase();
    });

    return match?.get('earningType')?.value || componentName;
  }

  // getRoundedVal(val: any) {
  //   return (val ? Math.round(val) : 0);
  // }

  getRoundedVal(val: any) {
    let num = parseFloat(val);
    return !isNaN(num) ? Math.round(num) : 0;
  }


  getFilteredDeductionsforvariable() {
    return this.salaryStructure?.OtherDeductions?.filter(d =>
      d.deduction_name !== 'VPF' && d.isvariable === 'Y'
    );
  }
   getFilteredDeductionsforothercomponents() {
    return this.salaryStructure?.OtherDeductions?.filter(d => d.deduction_name !== 'VPF' && d.deduction_name !== 'Incentive' &&
      d.isvariable !== 'Y' && !d?.deduction_frequency);
  }
  // getFilteredDeductionsfordedcution() {
  //   return this.salaryStructure?.OtherDeductions?.filter(d => d.deduction_name === 'VPF');
  // }
 getFilteredDeductionsfordedcution() {
    return this.salaryStructure?.OtherDeductions?.filter(d => d.deduction_name === 'VPF' ||
       (d.isvariable == 'N' && d?.deduction_frequency));
  }
  ////To Get value when monthly is selected then yes and no are avilable other wise only yes
  getIncludedInCtcOptions(freq: string): { value: string, label: string }[] {
    if (freq === 'Monthly') {
      return [
        { value: 'Y', label: 'Yes' },
        { value: 'N', label: 'No' }
      ];
    } else {
      return [
        { value: 'Y', label: 'Yes' }
      ];
    }
  }

  ////To show no if VPF is selected otherwise show yes/no
  getIsVariableOptions(deductionName: string): { value: string, label: string }[] {
    if (deductionName?.toLowerCase() === 'vpf') {
      return [
        { value: 'N', label: 'No' }
      ];
    } else {
      return [
        { value: 'Y', label: 'Yes' },
        { value: 'N', label: 'No' }
      ];
    }
  }

  truncateToTwoDecimals(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '0.00';
    }

    const numericValue = Number(value);
    return (Math.floor(numericValue * 100) / 100).toFixed(2);
  }


  // charity contribution Check function ---- sidharth kaul dated. 13.06.2025
  charityCheck(value:any){
    // return this.show_charity_contribution && value != '' && parseFloat(value) > 0;
    return this.show_charity_contribution && value !== '';
  }

   onTdsFileSelect(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    const maxSizeInBytes = 2 * 1024 * 1024;

    if (file.type !== 'application/pdf') {
      this.toastr.error('Only PDF files are allowed.');
      return;
    }

    if (file.size > maxSizeInBytes) {
      this.toastr.error('File size exceeds 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];

      this.otherDetailForm.patchValue({
        originalDocumentName: file.name,
        documentByteCode: base64String
      });

      this.tds_exempted_docpath = ''; // Remove old view
      this.showTdsUploadForm = true;
    };

    reader.readAsDataURL(file);
  }

  getPdfUrl(documentByteCode: string): string {
    return `data:application/pdf;base64,${documentByteCode}`;
  }

  // getTDSExemption(isChecked: boolean): void {
  //   this.isTDSExemption = isChecked;

  //   this.TdsExemptionForm.patchValue({
  //     isTdsExempt: isChecked ? 'Y' : 'N',
  //     documentByteCode: '',
  //     originalDocumentName: ''
  //   });

  //   this.onSubmitTdsExemption();
  // }

  onSubmitTdsExemption(): void {
    const formData = this.otherDetailForm.value;

    // Only validate documentByteCode when exemption checkbox hasn't been interacted with
    // if (formData.isTdsExempt === 'Y') {
    //   if (!formData.documentByteCode) {
    //     this.toastr.error('Please select a document to upload.');
    //     return;
    //   }
    // }
      
    let postData = {
      action: "updateTDSExemption",
      customerAccountId: this.tp_account_id.toString(),
      userby: this.tp_account_id.toString(),
      empCode: this.candidateDetails.emp_code,
      isTdsExempt: formData.isTdsExempt,
      originalDocumentName: formData.originalDocumentName,
      documentByteCode: formData.documentByteCode,
    }
    this._EmployeeService.updateTDSExemption(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.hasSubmittedTdsExemption = true;
        this.otherDetailForm.patchValue({
          documentByteCode: '',
          originalDocumentName: ''
        });
        this.getSalaryStructure();
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

}