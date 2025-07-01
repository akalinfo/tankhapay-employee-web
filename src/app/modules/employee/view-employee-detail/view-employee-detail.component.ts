import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EmployeeService } from '../employee.service';
import decode from 'jwt-decode';
import { ActiveToast, ToastrService } from 'ngx-toastr';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { grooveState, dongleState } from 'src/app/app.animation';
import { AnonymousSubject } from 'rxjs/internal/Subject';
import { ReportService } from '../../reports/report.service';
declare var $: any;

@Component({
  selector: 'app-view-employee-detail',
  templateUrl: './view-employee-detail.component.html',
  styleUrls: ['./view-employee-detail.component.css'],
  animations: [grooveState, dongleState]
})
export class ViewEmployeeDetailComponent {
  showSidebar: boolean = true;
  tp_account_id: any;
  product_type: any = '';
  employee_form!: FormGroup;
  postData: any;
  employee_data: any = [];
  view_emp_data: any = [];
  emp_json_data: any = [];
  searchKeyword = '';
  Employees: any = [];
  invKey: any = '';
  filteredEmployees: any = [];
  p: number = 0;
  limit: number = 20;
  total: number = 0;
  pageConfig: any;
  empId: any = '';
  basic_detail_form: FormGroup
  employeeDetails: any = '';
  kycForm: FormGroup;
  bankDetailsForm: FormGroup;
  token: any = '';
  editData: boolean = false;
  file: any = '';
  send_file: string | ArrayBuffer;
  edit_kyc_details: boolean = false;
  submitted: boolean = false;
  pfOpted: any = 'N';
  esicOpted: any = 'N';
  states: any = [];
  minWagesCtg: any = [];
  edit_bank_details: boolean = false;
  edit_salary_restructure: boolean = false;
  jsId: any = '';
  salaryStructureData: any = '';
  filterdSalData: any = ''
  templateData: any = '';
  minWagesText: any;
  prevFormVal: any = '';

  basicdetailsupdated_status: string = '';
  aadharverfication_status: string = '';
  pan_verification_status: string = '';
  accountverification_status: string = '';
  grossSal: any = 0;
  isAddAnother: boolean = false;
  profileImg: any = '';
  ecStatus: any = '';
  candidateDetails: any = {};
  statesMaster: any = [];
  deductionsMaster: any = [];
  statutoryComplianceForm: FormGroup;
  advanceSalaryform: FormGroup;
  pTDetails: any;
  salaryDetails: any = '';
  leaveTemplateData: any = [];
  edit_statutory_compliances: boolean = false;
  isEditsal: boolean = false;
  isFormDisable: boolean = false;
  salaryStructure: any = {};
  isBasicSalDisabled: boolean = true;
  leaveTemplateForm: FormGroup;
  isDojValid: boolean = false;
  editLeave: boolean = false;
  // isAdvanceAllowed:boolean=false
  isAdvanceAllowed: boolean = true;
  accessRights: any;

  @ViewChild('ed') effective_dt_val: ElementRef;
  salarymsg: any = '';
  payout_method: any;
  leaveHistoryBalanceData: any = [];
  LWF_master_data: any = [];
  PT_applied_master_data: any = [];
  lwfmsg: any = '';
  ptmsg: any = '';
  customSalaryform: FormGroup;
  business_setup: any = [];
  esi_details: any = '';
  pf_details: any = '';
  customCalculatedData: any;
  edit_custom_salary: boolean = false;
  isShowSalaryTable: boolean = false;
  salaryCalcType: any = 'percent';
  isGratuity: boolean = false;
  isEmployerGratuity: boolean = false;
  isTDSExemption: boolean = false;
  isEmployerPartExcluded: any = 'N';
  grossSalary: any = '';
  customSalaryMsg: String = ''
  restructureMode: string = '';
  isCustomEditSal: boolean = false;
  minWageDays: any = [];
  gratuityInHand: boolean = false;
  isCustomInputTrigger: boolean = false;
  salaryPercent: { basicPercent: any; hraPercent: any; };
  isUpdateEmp: boolean = false;
  basicDetailForm: FormGroup;
  updatedEmpDetails: any = '';
  masterTDS: any;
  consultantform: FormGroup;
  isEditConsultantSalary: boolean = false;
  otherDetailForm: FormGroup;
  changedFields: Set<string> = new Set();
  edli_adminchargesincludeinctc: any = '';
  isGrpInsuranceAllowed: any = '';
  tds_details: any = ''
  isGrpInsurance: any = '';
  employeeInsurance: number = 0;
  employerInsurance: number = 0;
  accessRightsArray: any;
  showLiveLocation: any;

  uanNumber: any;
  showUANNumberPopup: boolean = false;

  show_charity_contribution: boolean = false;

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  tdsFile: { originalDocumentName: string; documentByteCode: string } | null = null;
  TdsExemptionForm: FormGroup;
  tds_exempted_docpath: string = ''; // example path, set from backend
  showTdsUploadForm: boolean = false;
  isEditMode: boolean = true;
  hasSubmittedTdsExemption: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private _EmployeeService: EmployeeService,
    private router: ActivatedRoute,
    private Router: Router,
    public toastr: ToastrService,
    private elementRef: ElementRef,
    private _masterService: MasterServiceService,
    private _BusinesSettingsService: BusinesSettingsService,
    private _ReportService: ReportService,
  ) {

    this.router.params.subscribe((params: any) => {

      let id = this._EncrypterService.aesDecrypt(params['empid']);
      this.empId = id.split(',')[0];
      this.jsId = id.split(',')[1];
      this.ecStatus = id.split(',')[2];

    });

  }

  ngOnInit() {

    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;
    this.payout_method = this.token.payout_mode_type;
    this.accessRights = this._masterService.checkAccessRights('/employees');
    this.accessRightsArray = JSON.parse(localStorage.getItem('access_rights') || '[]');

    // Check if an object with modulename "Live Tracking" exists
    this.showLiveLocation = this.accessRightsArray.some(
      (item: any) => item.modulename === "Live Tracking"
    );
    // if(this.token.mobile=='7777777777'){
    //   this.isAdvanceAllowed=true
    // }
    // productTypeId
    //this.employer_details();
    this.getEmployeeDetail();
    // 5337 Goalbindu Karma Sahayak and dummy account 653
    const allowedAccountIds = ['653', '3088', '5337'];
    this.show_charity_contribution = allowedAccountIds.includes(this.tp_account_id.toString());
    // ...existing code...

    this.employee_form = this._formBuilder.group({
      product_type: ['', [Validators.required]],
      employee_name: ['', [Validators.required]],
      employee_mobile: [
        '',
        [
          Validators.required,
          Validators.pattern('^[6-9]{1}[0-9]{9}$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      employee_email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
    });

    this.basic_detail_form = this._formBuilder.group({
      name_title: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z ]+$')]],
      dob: ['', [Validators.required]],
      gender: [''],
      employee_email: ['', [
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,4}$'),
      ]],
      employee_mobile: ['', [Validators.required,
      Validators.pattern('^[6-9]{1}[0-9]{9}$'),
      Validators.minLength(10),
      Validators.maxLength(10),]],
      emergency_mobile: ['', [
        Validators.pattern('^[6-9]{1}[0-9]{9}$'),
        Validators.minLength(10)
      ]],
      blood_relation: ['', [Validators.pattern(/^[a-zA-Z ]+$/)]],
      perm_add: ['', [Validators.required]],
      res_add: [''],
      relation_name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z /]+$/)]],
      post_offered: [''],
      doj: ['', [Validators.required]],
      orgempcode: ['']
    })

    this.kycForm = this._formBuilder.group({
      aadhar_no: ['', [Validators.pattern('^[0-9]{12}$')]],
      aadhar_doc: [''],
      aadhar_doc_file: [''],
      aadhar_file_path: [''],
      pan_no: ['', [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/i)]],
      pan_doc: [''],
      pan_doc_file: [''],
      pan_file_path: [''],
      aadhar_file_name: [''],
      pan_file_name: ['']
    })

    this.bankDetailsForm = this._formBuilder.group({
      acc_no: ['', [Validators.required]],
      // gender: ['', [Validators.required]],
      check_acc_no: ['', [Validators.required]],
      bank_name: [''], // removed validation
      bank_branch: [''], // removed validation
      ifsc: [''], // removed validation
      bank_doc: [''],
      bank_doc_file: [''],
      bank_file_path: [''],
      bank_file_name: ['']
    });

    this.applyConditionalBankValidators();

    this.statutoryComplianceForm = this._formBuilder.group({
      pfOpted: ['', [Validators.required]],
      esiOpted: ['', [Validators.required]],
      otherVariablesDetails: new FormArray([])
    })

    this.advanceSalaryform = this._formBuilder.group({
      minWageState: ['', [Validators.required]],
      minWagesCtg: ['', [Validators.required]],
      locationType: ['', [Validators.required]],
      SalDaysOpted: ['', [Validators.required]],
      salInDays: ['', [Validators.required]],
      monthlyOfferedpkg: ['', [Validators.required,]],
      basicOption: ['', [Validators.required]],
      basicSal: ['', [Validators.required]],
      pfCapApplied: ['', [Validators.required]],
      effectiveDate: ['', [Validators.required]],
      pfOpted: ['', [Validators.required]],
      lwfApplied: ['N'],
      ptApplied: ['N'],
      esiOpted: ['', [Validators.required]]
    })

    this.leaveTemplateForm = this._formBuilder.group({
      leavetemplate_text: ['', [Validators.required]],
      effective_dt: ['', [Validators.required]]
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
    let date = new Date();
    date.setFullYear(date.getFullYear() - 18);

    $('#dob').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: date
    })

    let currDate = new Date();
    // currDate.setMonth(currDate.getMonth() + 1);
    currDate.setDate(currDate.getDate() + 30);

    $('#doj').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: currDate
    })

    $('#effectiveFromCalcSal').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: currDate
    })

    $('body').on('change', '#dob', function () {
      $('#recdate').trigger('click');
    })
    $('body').on('change', '#doj', function () {
      $('#recdate').trigger('click');
    })

    this.TdsExemptionForm = this._formBuilder.group({
      isTdsExempt: ['N'],
      originalDocumentName: [''],
      documentByteCode: ['']
    });

    this.getstates();
    this.get_tp_leave_temeplate();
    this.getMasterSalaryStructure();
    this.getEmployerSocialSecurityDetails('EPF');
    this.getEmployerSocialSecurityDetails('ESI');
    this.getEmployerSocialSecurityDetails('TDS');
    this.getEmployerSocialSecurityDetails('GROUPINSURANCE');
    this.getMinWageDays();
    this.getMasterTDS();

  }

  // Conditional Validation for bank_name, bank_branch and ifsc_code - sidharth kaul 16.06.2025
  applyConditionalBankValidators() {
    if (this.payout_method === 'standard') {
      this.bankDetailsForm.get('bank_name')?.setValidators(Validators.required);
      this.bankDetailsForm.get('bank_branch')?.setValidators(Validators.required);
      this.bankDetailsForm.get('ifsc')?.setValidators(Validators.required);
    } else {
      this.bankDetailsForm.get('bank_name')?.clearValidators();
      this.bankDetailsForm.get('bank_branch')?.clearValidators();
      this.bankDetailsForm.get('ifsc')?.clearValidators();
    }

    ['bank_name', 'bank_branch', 'ifsc'].forEach(field => {
      this.bankDetailsForm.get(field)?.updateValueAndValidity();
    });
  }

  get kf() {
    return this.kycForm.controls;
  }

  get bf() {
    return this.bankDetailsForm.controls;
  }

  get sf() {
    return this.statutoryComplianceForm.controls;
  }

  get af() {
    return this.advanceSalaryform.controls;
  }

  get variableForm() {
    return this.statutoryComplianceForm.controls.otherVariablesDetails as FormArray;
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

  ngAfterViewChecked() {
    let currDate = new Date();
    // currDate.setMonth(currDate.getMonth() + 1);
    currDate.setDate(currDate.getDate() + 30);
    $('#effectiveFromCalcSal').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: currDate,
      beforeShowDay: function (date) {
        // Disable all days except the 1st of the month
        return [date.getDate() === 1, ''];
      }
    })

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
  getAppointmentDetails() {

    let emp_code = this.basic_detail_form.controls.employee_mobile.value + 'CJHUB' + (this.view_emp_data.basicDetails.emp_code == '' ? this.jsId : this.view_emp_data.basicDetails.emp_code) + 'CJHUB' + this.basic_detail_form.controls.dob.value;
    let ecStatusValue = (this.view_emp_data.basicDetails.emp_code == '' ? 'TEC' : 'EC')

    this._EmployeeService.getAppointeeDetails({
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type), 'empCode': this._EncrypterService.aesEncrypt(emp_code), 'ecStatus': ecStatusValue
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let appointMentDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

        this.candidateDetails = appointMentDetails.candidateDetails;
        let jsonData = this.candidateDetails.emp_address != '' ? JSON.parse(this.candidateDetails.emp_address) : this.candidateDetails.emp_address;
        let nonemptyVal = Object.values(jsonData).filter(value => value !== "");
        let perm_add = nonemptyVal.join(', ');
        // this.candidateDetails.emp_address = perm_add;
        this.candidateDetails.emp_address = perm_add?.replaceAll('<br>', '');

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
        this.advanceSalaryform.patchValue({

          pfCapApplied: this.candidateDetails.pf_cap_applied,
          pfOpted: this.candidateDetails.pf_opted,
          esiOpted: this.candidateDetails.esi_opted,
          minWageState: this.candidateDetails.min_wages_state == 'Central' ? 'DELHI' : this.candidateDetails.min_wages_state.toUpperCase(),
          lwfApplied: this.candidateDetails.is_lwf_state,
          ptApplied: this.candidateDetails.pt_opted,
        })
        if (Number(this.af.monthlyOfferedpkg.value) > 35000) {
          this.advanceSalaryform.patchValue({
            basicOption: '5'
          })

          let element: any = document.getElementsByClassName('basicOption');
          for (let i = 0; i < element.length; i++) {
            element[i].classList.add("no-click");
          }
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
          this.getMinWagesState(this.af.minWageState);
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

  openFile(file_path: any) {
    // console.log(file_path);

    window.open(file_path, '_blank');
  }

  getstates() {
    this._EmployeeService.getAll_state({}).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.states = resData.commonData
      } else {
        this.states = [];
      }
    })
  }

  detectMimeType(b64): any {

    var signatures = {
      JVBERi0: "application/pdf",
      R0lGODdh: "image/gif",
      R0lGODlh: "image/gif",
      iVBORw0KGgo: "image/png",
      "/9j/": "image/jpg"
    };

    for (var s in signatures) {
      if (b64.indexOf(s) === 0) {
        return signatures[s] + ";base64,";
      }
    }
  }

  getEmployerProfilePic() {
    let emp_code = this.basic_detail_form.controls.employee_mobile.value + 'CJHUB' + this.view_emp_data.basicDetails.emp_code + 'CJHUB' + this.basic_detail_form.controls.dob.value;
    this._EmployeeService.getEmployeeProfile({
      'customerAccountId': this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id)),
      'empCode': emp_code,
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type)
    }).subscribe((resData: any) => {
      if (resData.statusCode)
        // "data:image/png;base64,"+
        this.profileImg = "data:" + this.detectMimeType(this._EncrypterService.aesDecrypt(resData.commonData)) + this._EncrypterService.aesDecrypt(resData.commonData);

      else
        this.profileImg = '';
    })
  }
  employer_details() {
    this._EmployeeService
      .employer_details({
        encrypted: this._EncrypterService.aesEncrypt(
          JSON.stringify({
            customeraccountid: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id)),
            productTypeId: this.product_type,
          })
        )
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.employee_data = this._EncrypterService.aesDecrypt(resData.commonData);
          this.emp_json_data = JSON.parse(this.employee_data);
          this.filteredEmployees = this.emp_json_data;
          // console.log(this.filteredEmployees);
          // console.log(this.filteredEmployees.js_id);
        }
      });
  }

  getEmployeeDetail() {

    this._EmployeeService.getTpCandidateDetails({ 'empId': this._EncrypterService.aesEncrypt(this.empId.toString()), 'productTypeId': this._EncrypterService.aesEncrypt(this.product_type) }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        // this.employeeDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData.commonData));
        this.view_emp_data = resData.commonData;
        // console.log(this.view_emp_data.basicDetails.emp_address);
        if (Object.keys(this.view_emp_data.basicDetails).length == 0 && Object.keys(this.view_emp_data.kycDetails).length == 0 && Object.keys(this.view_emp_data.bankDetails).length == 0) {
          return this.toastr.warning('No data found for this employee', 'Oops');
        }
        let basic_details = this.view_emp_data.basicDetails;
        let perm_add = '';
        try {
          let jsonData = basic_details.emp_address ? JSON.parse(basic_details.emp_address) : {};
          if (typeof jsonData === 'object' && jsonData !== null) {
            let nonemptyVal = Object.values(jsonData).filter(value => value !== "");
            perm_add = nonemptyVal.join(', ');
          } else {
            perm_add = basic_details.emp_address; // In case it's already a string
          }
        } catch (e) {
          // If parsing fails, assume it's a plain string
          perm_add = basic_details.emp_address;
        }

        this.basicdetailsupdated_status = basic_details?.basicdetailsupdated_status;

        this.aadharverfication_status = basic_details?.aadharverfication_status;
        this.pan_verification_status = basic_details?.pan_verification_status;
        this.accountverification_status = basic_details?.accountverification_status;

        // this.view_emp_data.basicDetails.emp_address = perm_add;
        this.view_emp_data.basicDetails.emp_address = perm_add?.replaceAll('<br>', '');

        this.leaveTemplateForm.patchValue({
          effective_dt: this.view_emp_data?.basicDetails?.leave_effective_from != null && this.view_emp_data?.basicDetails?.leave_effective_from != undefined ? this.view_emp_data?.basicDetails?.leave_effective_from : '',
          leavetemplate_text: this.view_emp_data.basicDetails.leave_template_json != '' ? (JSON.parse(this.view_emp_data.basicDetails.leave_template_json)[0]) : ''
        })

        let gender = (basic_details.gender.trim().toUpperCase() == 'M' ? 'Male' : basic_details.gender.trim().toUpperCase() == 'F' ? 'Female' : basic_details.gender.trim());

        let salutation = (basic_details.gender.trim().toUpperCase() == 'M' ? 'Mr.' : basic_details.gender.trim().toUpperCase() == 'F' ? 'Ms.' : basic_details.salutation.trim());


        this.basic_detail_form.patchValue({
          name_title: salutation,
          name: basic_details.emp_name,
          dob: basic_details.dateofbirth,
          gender: gender,
          employee_email: basic_details.email,
          employee_mobile: basic_details.mobile,
          emergency_mobile: basic_details.emergency_contact,
          blood_relation: basic_details.bloodrelationname,
          perm_add: basic_details.emp_address,
          res_add: basic_details.residential_address,
          relation_name: basic_details.fathername,
          post_offered: basic_details.post_offered,
          doj: basic_details.dateofjoining,
          orgempcode: basic_details.orgempcode == undefined ? '' : basic_details.orgempcode
        })
        this.getEmployerProfilePic();
        this.getAppointmentDetails();
        this.getEmployeeleave_history();
        let kyc_details = this.view_emp_data.kycDetails;
        // console.log(kyc_details);

        this.kycForm.patchValue({
          aadhar_no: kyc_details.aadharcard,
          // aadhar_doc: kyc_details.aadhardoc,
          aadhar_file_path: kyc_details.aadhardoc,
          pan_no: kyc_details.pancard,
          // pan_doc: kyc_details.pandoc
          pan_file_path: kyc_details.pandoc
        })
        let bank_details = this.view_emp_data.bankDetails;

        this.bankDetailsForm.patchValue({
          acc_no: bank_details.bankaccountno,
          check_acc_no: bank_details.bankaccountno,
          bank_name: bank_details.bankname,
          bank_branch: bank_details.bankbranch,
          ifsc: bank_details.ifsccode,
          bank_file_path: bank_details.bankdoc
        })
      }
    })

    //   }
    // })
  }

  update_basic_details(): any {
    this.basic_detail_form.patchValue({
      dob: $('#dob').val(),
      doj: $('#doj').val()
    })
    // this.submitted = true;
    if (this.basic_detail_form.invalid) {
      return this.toastr.error("Please fill the required fields", 'Oops');
    }
    this.checkDOJ();
    if (!this.isDojValid) {
      return this.toastr.error("Employee not eligible for selected Date of joining as age is less than 18");
    }
    //console.log(this.basic_detail_form.value);

    let postData = {
      ...this.basic_detail_form.value,
      updatedBy: this.token.userid,
      productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
      empId: this._EncrypterService.aesEncrypt(this.empId.toString()),
      customerAccountId: this._EncrypterService.aesEncrypt(this.tp_account_id.toString())
    }
    this._EmployeeService.updateTpBasicDetails(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.editData = false;
        this._EmployeeService.updateEmpDetailsOnCRM({
          'account_id': this.tp_account_id.toString(), 'jsId': this.jsId, 'employee_name': this.basic_detail_form.controls.name.value,
          'employee_mobile': this.basic_detail_form.controls.employee_mobile.value, 'updatedBy': this.token.userid
        }).subscribe((result: any) => {
          if (result.statusCode) {
            this.toastr.success(resData.message);
          } else {
            this.toastr.error(result.message);
          }
        })
        this.getEmployeeDetail();
      } else {
        this.toastr.error(resData.message);
      }

    })
  }

  isCandidateDetailsEmpty(): boolean {
    return Object.keys(this.candidateDetails).length !== 0;
  }

  editBasicData(): any {
    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }

    if (this.tp_account_id == '4643') {
      return this.showUpdateEmp();
    }
    let data = {
      mobile: this.candidateDetails.mobile,
      emp_code: this.view_emp_data.basicDetails.emp_code == '' ? this.jsId : this.view_emp_data.basicDetails.emp_code,
      dob: this.candidateDetails.dateofbirth,
      ecStatus: this.ecStatus,
      empId: this.empId
    }

    this.Router.navigate(['/employees/edit-employee'], { state: data })
    this.editData = true;
  }

  onFileSelect(event: any, doc_type: any) {

    const reader = new FileReader();

    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      this.file = file;

      const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes
      const selectedFile = file; // Get the selected file

      if (selectedFile && selectedFile.size > maxFileSize) {
        // Check if the file size exceeds the limit
        this.toastr.error('File size exceeds the maximum allowed (2MB). Please choose a smaller file.');
        return
      }
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.send_file = reader.result;
        if (doc_type == 'aadhar') {
          this.kycForm.patchValue({
            aadhar_doc_file: this.send_file,
            aadhar_file_name: this.file.name
          })
        } else if (doc_type == 'pan') {
          this.kycForm.patchValue({
            pan_doc_file: this.send_file,
            pan_file_name: this.file.name
          })
        } else {
          this.bankDetailsForm.patchValue({
            bank_doc_file: this.send_file,
            bank_file_name: this.file.name
          })
        }
        // this.addNewContactForm.patchValue({
        //   gst_copy_path: this.send_file,
        // });
      };

    } else {
      this.toastr.error('Please choose a file.', 'Oops!');
    }

  }

  update_kyc_details(doc_type: any): any {

    if (doc_type == 'pan') {
      // && (this.kf.pan_doc_file.value=='' && this.kf.pan_file_path.value!='')
      if (this.kf.pan_no.value == '') {
        return this.toastr.error("Please Enter PAN Card No");
      }
      if (this.kf['pan_no'].errors && this.kf['pan_no'].errors['pattern']) {
        return this.toastr.error("Invalid pan number", "Oops");
      }

      // if(this.kf.pan_no.value!='' && (this.kf.pan_doc_file.value=='' && this.kf.pan_file_path.value=='')){
      //   return this.toastr.error("Please Select pan document");
      // }
      this.kycForm.patchValue({
        pan_no: this.kf['pan_no'].value.toUpperCase()
      })
    } else {
      // && (this.kf.aadhar_doc_file.value=='' && this.kf.aadhar_file_path.value!='')
      if (this.kf.aadhar_no.value == '') {
        return this.toastr.error("Please Enter Aadhaar no");
      }
      if (this.kf['aadhar_no'].errors && this.kf['aadhar_no'].errors['pattern']) {
        return this.toastr.error("Invalid aadhar number", "Oops");
      }

      // if(this.kf.aadhar_no.value!='' && (this.kf.aadhar_doc_file.value=='' && this.kf.aadhar_file_path.value=='')){
      //   return this.toastr.error("Please Select Aadhaar document");
      // }
    }

    return new Promise((resolve, reject) => {
      let kycform = {
        aadhar_no: '',
        aadhar_doc: '',
        aadhar_doc_file: '',
        aadhar_file_path: '',
        pan_no: '',
        pan_doc: '',
        pan_doc_file: '',
        pan_file_path: '',
        aadhar_file_name: '',
        pan_file_name: ''
      }

      if (doc_type == 'pan') {
        let postData = {
          "fieldName": 'pancardno',
          "fieldValue": this.kf.pan_no.value,
          "appointmentId": this.empId,
          "productTypeId": this._EncrypterService.aesEncrypt(this.product_type),
          "doc_type": 'pan'
        }
        this._EmployeeService.checkKYCnum(postData).subscribe((resData: any) => {
          if (resData.status) {
            if (this.kf.pan_doc_file.value != '') {
              this.uploadFile('pan').then(() => {
                let postData1 = {
                  ...this.kycForm.value,
                  updatedBy: Number(this.token.id),
                  productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
                  doc_type: 'pan',
                  empId: this._EncrypterService.aesEncrypt(this.empId.toString()),
                  customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
                }
                this._EmployeeService.updateTpKycDetails(postData1).subscribe((resData: any) => {
                  if (resData.statusCode) {
                    this.toastr.success(resData.message);
                    this.kycForm.reset(kycform);
                    this.edit_kyc_details = false;
                    resolve('Data updated successfully');
                    // this.editData=false;
                    this.getEmployeeDetail();
                  } else {
                    this.toastr.error(resData.message);
                    reject('Data cannot be updated');
                  }
                })
              })
            } else {

              let postData = {
                ...this.kycForm.value,
                updatedBy: Number(this.token.id),
                productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
                doc_type: 'pan',
                empId: this._EncrypterService.aesEncrypt(this.empId.toString()),
                customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
              }
              this._EmployeeService.updateTpKycDetails(postData).subscribe((resData: any) => {
                if (resData.statusCode) {
                  this.toastr.success(resData.message);

                  this.kycForm.reset(kycform);

                  this.edit_kyc_details = false;
                  resolve('Data updated successfully');
                  // this.editData=false;
                  this.getEmployeeDetail();
                } else {
                  this.toastr.error(resData.message);
                  reject('Data cannot be updated');
                }
              })
            }
          } else {
            this.toastr.error(resData.message);
          }
        })

      }
      else {

        let postData1 = {
          "fieldName": 'aadharcard',
          "fieldValue": this.kf.aadhar_no.value,
          "appointmentId": this.empId,
          "productTypeId": this._EncrypterService.aesEncrypt(this.product_type),
          "doc_type": 'aadhar'
        }
        this._EmployeeService.checkKYCnum(postData1).subscribe((resData: any) => {

          if (resData.status) {
            if (this.kf.aadhar_doc_file.value != '') {
              this.uploadFile('aadhar').then(() => {
                let postData = {
                  ...this.kycForm.value,
                  updatedBy: Number(this.token.id),
                  doc_type: 'aadhar',
                  productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
                  empId: this._EncrypterService.aesEncrypt(this.empId.toString()),
                  customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
                }
                this._EmployeeService.updateTpKycDetails(postData).subscribe((resData: any) => {
                  if (resData.statusCode) {
                    this.toastr.success(resData.message);
                    this.kycForm.reset(kycform);
                    resolve('Data updated successfully');
                    this.edit_kyc_details = false;
                    // this.editData=false;
                    this.getEmployeeDetail();
                  } else {
                    this.toastr.error(resData.message);
                    reject('Data cannot be updated');
                  }
                })
              })
            } else {
              let postData = {
                ...this.kycForm.value,
                updatedBy: Number(this.token.id),
                productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
                doc_type: 'aadhar',
                empId: this._EncrypterService.aesEncrypt(this.empId.toString()),
                customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
              }
              this._EmployeeService.updateTpKycDetails(postData).subscribe((resData: any) => {
                if (resData.statusCode) {
                  this.toastr.success(resData.message);
                  this.kycForm.reset(kycform);
                  resolve('Data updated successfully');
                  this.edit_kyc_details = false;
                  // this.editData=false;
                  this.getEmployeeDetail();
                } else {
                  this.toastr.error(resData.message);
                  reject('Data cannot be updated');
                }
              })
            }
          } else {
            this.toastr.error(resData.message);
          }
        })
      }
    })
  }

  uploadFile(doc_type: any) {

    let data = '';
    let name = '';
    if (doc_type == 'pan') {
      data = this.kf['pan_doc_file'].value;
      name = this.kf['pan_file_name'].value;
    } else {
      data = this.kf['aadhar_doc_file'].value;
      name = this.kf['aadhar_file_name'].value;
    }

    return new Promise((resolve, reject) => {
      this._EmployeeService.file_upload({ 'data': data, 'name': name }).subscribe((resData: any) => {
        if (resData.status) {
          this.toastr.success(resData.msg);
          if (doc_type == 'pan') {
            this.kycForm.patchValue({
              pan_file_path: resData.file_path,
              pan_file_name: resData.file_name
            })
            resolve('Pan Document uploaded successfully');
          } else {
            this.kycForm.patchValue({
              aadhar_file_path: resData.file_path,
              aadhar_file_name: resData.file_name
            })
            resolve('Aadhar Document uploaded successfully');
          }

        } else {
          reject('Document cannot be uploaded');
        }
      })
    })

  }

  updateBankDetails(): any {

    this.submitted = true;
    if (this.bf['acc_no'].value != this.bf['check_acc_no'].value) {
      return this.toastr.error("Confirm Bank Account no does not match the Account no", "Oops");
    }
    if (this.bankDetailsForm.invalid) {
      return this.toastr.error("Invalid data entered!", "Oops");
    }

    if ((this.bf.bank_doc_file.value != '' && this.bf.bank_file_path.value == '')) {
      this._EmployeeService.file_upload({ 'data': this.bf['bank_doc_file'].value, 'name': this.bf['bank_file_name'].value }).subscribe((resData: any) => {
        if (resData.status) {
          this.toastr.success(resData.msg);
          this.bankDetailsForm.patchValue({
            bank_file_path: resData.file_path,
            bank_file_name: resData.file_name
          })


          let postData = {
            ...this.bankDetailsForm.value,
            updatedBy: Number(this.token.id),
            productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
            empId: this._EncrypterService.aesEncrypt(this.empId.toString()),
            js_id: this._EncrypterService.aesEncrypt(this.jsId.toString()),
            customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
          }

          this._EmployeeService.updateTpBankDetails(postData).subscribe((resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message);
              this.bankDetailsForm.reset();
              this.edit_bank_details = false;
              this.getEmployeeDetail();
            } else {
              this.toastr.error(resData.message);
            }
          })

        }
      })
    } else {
      let postData = {
        ...this.bankDetailsForm.value,
        updatedBy: Number(this.token.id),
        productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
        empId: this._EncrypterService.aesEncrypt(this.empId.toString()),
        js_id: this._EncrypterService.aesEncrypt(this.jsId.toString()),
        customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
      }

      this._EmployeeService.updateTpBankDetails(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message);
          this.bankDetailsForm.reset();
          this.edit_bank_details = false;
          this.getEmployeeDetail();
        } else {
          this.toastr.error(resData.message);
        }
      })

    }
  }

  getPfOption(opt: any) {
    this.pfOpted = opt;
    this.bankDetailsForm.patchValue({
      pfOpted: this.pfOpted
    })
  }

  getEsicOpted(opt: any) {
    this.esicOpted = opt;
    this.bankDetailsForm.patchValue({
      esicOpted: this.esicOpted
    })
  }


  getMinWagesState(state: any) {
    this.advanceSalaryform.patchValue({
      minWagesCtg: ''
    })
    this.salaryDetails = '';
    this._EmployeeService.GetMinWageCategoryByState({ 'minWagesStateName': state.value, 'productTypeId': this.product_type, 'customerAccountId': this.tp_account_id.toString() }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.minWagesCtg = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      } else {
        // this.toastr.error(resData.message)
        this.minWagesCtg = [];
      }
      this.get_lwfapplied_value(this.af.lwfApplied.value);
      this.get_ptApplied_value(this.af.ptApplied.value);
    })
  }


  editkycdetails(): any {
    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    if (this.basicdetailsupdated_status != 'Y') {
      return this.toastr.error("Please updated basic details first!", "Oops")
    }
    this.edit_kyc_details = true;
  }

  editbankdetails(): any {
    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    if (this.aadharverfication_status != 'Y' && this.pan_verification_status != 'Y' && this.payout_method != 'self') {
      return this.toastr.error("Please fill the kyc details first", 'Oops');
    }
    this.edit_bank_details = true;
  }

  editStatutoryCompliance(): any {

    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }

    if (this.basicdetailsupdated_status != 'Y' ||
      ((!(this.aadharverfication_status == 'Y' || this.pan_verification_status == 'Y')
        || this.accountverification_status != 'Y') && this.payout_method != 'self')) {
      return this.toastr.error("Please complete the Basic information, KYC & Bank details first!", "Oops")
    } else if (this.basicdetailsupdated_status != 'Y' && this.payout_method == 'self') {
      return this.toastr.error("Please complete the Basic information first!", "Oops")
    }

    this.edit_statutory_compliances = true;
  }
  editSalaryRestructure(): any {
    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }

    if (this.basicdetailsupdated_status != 'Y' ||
      ((!(this.aadharverfication_status == 'Y' || this.pan_verification_status == 'Y')
        || this.accountverification_status != 'Y') && this.payout_method != 'self')) {
      return this.toastr.error("Please complete the Basic information, KYC & Bank details first!", "Oops")
    } else if (this.basicdetailsupdated_status != 'Y' && this.payout_method == 'self') {
      return this.toastr.error("Please complete the Basic information first!", "Oops")
    }


    if (this.candidateDetails.joiningStatus == 'PENDING') {
      this.edit_salary_restructure = true;
    }
  }

  editSalary(mode: any = ''): any {
    // if((this.candidateDetails.salary_setup_mode=='Custom' && mode =='CustomRestructureMode') ||
    // (this.candidateDetails.salary_setup_mode=='Advance' && mode =='Restructure')){
    this.restructureMode = mode;
    localStorage.setItem('restructureMode', mode);
    this.SetCandidateRestructureMode(mode);

  }

  discardSalary() {
    this.restructureMode = '';
    localStorage.setItem('restructureMode', '');
    this.SetCandidateRestructureMode('DiscardRestructure');
  }

  SetCandidateRestructureMode(mode: any) {
    let postData = {
      customerAccountId: (this.tp_account_id.toString()),
      jsId: (this.jsId),
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

  addAnotherDoc() {
    this.isAddAnother = true;
  }

  salaryInDays(isSal: any) {

    if (isSal == 'Y') {
      this.advanceSalaryform.patchValue({
        SalDaysOpted: 'Y',
        salInDays: ''
      })

    } else {
      this.advanceSalaryform.patchValue({
        SalDaysOpted: isSal,
        salInDays: 30
      })
      this.calculateBasicSal(this.af.basicOption.value);
    }

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

  teaAllowance(tea: string) {
    this.otherDetailForm.patchValue({
      teaAllowanceFlag: tea
    })
  }
  calculateAdvanceSal(): any {


    this.advanceSalaryform.patchValue({
      effectiveDate: $('#effectiveFromCalcSal').val()
    })

    if (this.af.SalDaysOpted.value == '' || this.af.basicOption.value == '' || this.af.basicSal.value == ''
      || this.af.effectiveDate.value == '' || this.af.locationType.value == '' || this.af.minWageState.value == ''
      || this.af.minWagesCtg.value == '' || this.af.minWagesCtg.value == null || this.af.pfCapApplied.value == '' || this.af.pfOpted.value == '' ||
      this.af.salInDays.value == '' || this.af.esiOpted.value == '') {
      return this.toastr.error("Please select all fields", "Oops!")
    }

    if (Number(this.af.monthlyOfferedpkg.value) < Number(this.af.basicSal.value)) {
      return this.toastr.error("Basic salary cannot exceed MOP");
    }

    let minWageSal = this.minWagesCtg.filter(obj => obj.minwagecategoryid == this.af.minWagesCtg.value)[0].minimumwagessalary;
    if ((this.sf.pfOpted.value == 'Y' || this.sf.esiOpted.value == 'Y') && Number(this.af.monthlyOfferedpkg.value) < Number(minWageSal)) {
      return this.toastr.error(`MOP cannot be less than Min wage salary (${minWageSal})`);
    }

    if ((this.sf.pfOpted.value == 'N' || this.sf.esiOpted.value == 'N') && Number(this.af.monthlyOfferedpkg.value) < 100) {
      return this.toastr.error(`Please enter valid MOP amount.`);
    }
    let postData = {
      ...this.advanceSalaryform.value,
      'monthlyOfferedpkg': this.advanceSalaryform.controls.monthlyOfferedpkg.value,
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      'empId': this._EncrypterService.aesEncrypt(this.empId.toString())
    }

    // console.log(postData);
    // return;

    this._EmployeeService.calculateCandidateSalary(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        if ((JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))).status == '1') {
          this.salaryDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.leaveTemplateData = JSON.parse(this._EncrypterService.aesDecrypt(resData.templateData));
          this.salarymsg = '';
          if (Number(this.salaryDetails.allowances) < 0 || Number(this.salaryDetails.hra) < 0) {
            this.salarymsg = 'Basic Salary too high. Please select Basic + HRA Option.';
            this.salaryDetails = '';
          }
        } else {
          this.salaryDetails = '';
          this.salarymsg = (JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))).msg;
        }
      } else {
        this.salaryDetails = '';
        this.salarymsg = '';
      }
    })
  }

  setSalDaysReq(salDayopted: any) {
    if (salDayopted.value == '30') {
      this.advanceSalaryform.patchValue({
        SalDaysOpted: 'N'
      })
    } else {
      this.advanceSalaryform.patchValue({
        SalDaysOpted: 'Y'
      })
    }
    this.calculateBasicSal(this.af.basicOption.value);
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

  toggleButton() {
    var checkbox: any = document.getElementById('confirmSalBreakup');
    var submitButton: any = document.getElementById('SubmitSalary');

    if (checkbox.checked) {
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.setAttribute('disabled', '');
    }
  }

  getPfCapValue(capVal: any) {
    this.advanceSalaryform.patchValue({
      pfCapApplied: capVal
    })

  }
  get_lwfapplied_value(val: any) {
    this.LWF_master_data = [];
    this.advanceSalaryform.patchValue({
      lwfApplied: val
    })

    if (val == 'Y') {
      if (!this.af.minWageState.value) {
        this.toastr.error('Please select Minimum Wage State', 'Oops!');
        return;
      }
      let state = this.af.minWageState.value;
      let index = this.statesMaster.findIndex((ob1: any) => { return ob1.statename.toUpperCase() == state.toUpperCase() });
      let statecode = this.statesMaster[index].statecode;

      this._EmployeeService.getLWFRateByStateCode({
        stateCode: statecode,
      }).subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.LWF_master_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
            // console.log(this.LWF_master_data);
            this.lwfmsg = '';
          } else {
            this.LWF_master_data = [];
            this.advanceSalaryform.patchValue({
              lwfApplied: 'N'
            })
            this.lwfmsg = resData.message;

          }
        }, error: (e) => {
          this.LWF_master_data = [];
          console.log(e);
        }
      })
    }
  }


  get_ptApplied_value(val: any) {
    this.PT_applied_master_data = [];
    this.advanceSalaryform.patchValue({
      ptApplied: val
    })

    if (val == 'Y') {
      if (!this.af.minWageState.value) {
        this.toastr.error('Please select Minimum Wage State', 'Oops!');
        return;
      }
      let state = this.af.minWageState.value;
      let index = this.statesMaster.findIndex((ob1: any) => { return ob1.statename.toUpperCase() == state.toUpperCase() });
      let statecode = this.statesMaster[index].statecode;

      this._EmployeeService.GetStateProfessionalTax({
        stateCode: statecode,
        productTypeId: this.product_type
      }).subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.PT_applied_master_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
            // console.log(this.PT_applied_master_data);
            this.ptmsg = '';

          } else {
            this.PT_applied_master_data = [];
            this.advanceSalaryform.patchValue({
              ptApplied: 'N'
            })
            this.ptmsg = resData.message;

          }
        }, error: (e) => {
          this.PT_applied_master_data = [];
          console.log(e);
        }
      })
    }
  }

  getStatutoryEsi(esi: any) {
    this.advanceSalaryform.patchValue({
      esiOpted: esi
    })
    this.statutoryComplianceForm.patchValue({
      esiOpted: esi
    })
  }

  getStatutoryPf(pf: any) {
    this.advanceSalaryform.patchValue({
      pfOpted: pf
    })
    this.statutoryComplianceForm.patchValue({
      pfOpted: pf
    })
  }

  addVariable(variable: any) {
    let deductionVal = this.deductionsMaster.filter(obj => {
      return obj.id == variable.value
    })

    for (let idx = 0; idx < this.variableForm.value.length; idx++) {
      if (this.variableForm.value[idx].deduction_name == deductionVal[0].deduction_name) {
        return;
      }
    }

    this.variableForm.push(this._formBuilder.group({
      deduction_name: new FormControl(deductionVal[0].deduction_name),
      deduction_id: new FormControl(Number(variable.value)),
      deduction_value: new FormControl(''),
      deduction_frequency: new FormControl(''),
      includedinctc: new FormControl(''),
      isvariable: new FormControl(''),
    }))
  }


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
        return this.toastr.error(`Field at index ${i} is empty.`);
      }
    }

    let postData = {
      ...this.statutoryComplianceForm.value,
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      'empId': this._EncrypterService.aesEncrypt(this.empId.toString()),
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
  calculateBasicSal(basicOption: any) {
    // }/
    let element: any = document.querySelectorAll('.basicOption');
    let input: any = document.querySelector('#basicSal');
    input.disabled = true;
    element[1].disabled = false;
    element[2].disabled = false;
    element[3].disabled = false;
    element[0].disabled = false;
    if (Number(this.af.monthlyOfferedpkg.value) > 35000) {
      if (basicOption == '' || basicOption == '2' || basicOption == '3')
        basicOption = '5';

      element[2].disabled = true;
      // element[3].disabled = true;
      // element[1].disabled = true; Previous value
      element[1].disabled = true; // new values
    } else if (Number(this.af.monthlyOfferedpkg.value) > 25000 && Number(this.af.monthlyOfferedpkg.value) <= 35000) {
      // if(basicOption=='' || basicOption=='2')
      if (basicOption == '')
        basicOption = '3';
      // element[1].disabled =true;
    }
    else if (Number(this.af.monthlyOfferedpkg.value) < 25000 && basicOption == '') {
      basicOption = '1';
    }
    let minwagesctg = this.minWagesCtg.filter(obj => { return obj.minwagecategoryid == this.af.minWagesCtg.value })[0];
    // Basic opt 1 - 50%  basic of mop
    let basicSal: any = 0;
    if (basicOption == '1') {
      this.isBasicSalDisabled = true;
      if (this.af.SalDaysOpted.value == 'Y') {
        let days = Number(this.af.salInDays.value);
        basicSal = Math.round((Number(this.af.monthlyOfferedpkg.value) * 50) / 100 * (days / 26));
      } else {
        basicSal = Math.round(((Number(this.af.monthlyOfferedpkg.value)) * 50) / 100);
      }

    } else if (basicOption == '2') {

      if (this.af.SalDaysOpted.value == 'Y') {
        let days = Number(this.af.salInDays.value);
        basicSal = Math.round((Number(minwagesctg.minimumwagessalary)) * (days / 26));
      } else {
        basicSal = Math.round(Number(this.af.monthlyOfferedpkg.value));
      }
      input.disabled = false;
    } else if (basicOption == '3') {
      // this.isBasicSalDisabled=true;
      // if (this.af.pfOpted.value == 'Y' && minwagesctg.wagesctgname == 'Unskilled') {
      //   this.toastr.error("Option Not Allowed For Unskilled Category.")
      //   this.advanceSalaryform.patchValue({
      //     basicOption: '1',
      //     SalDaysOpted: 'N',
      //     salInDays: 30
      //   })
      // } else {
      if (this.af.pfOpted.value == 'N') {
        basicSal = 15050;
      } else {
        basicSal = 15000;
      }
      // }
      input.disabled = false;
    } else if (basicOption == '4') {
      // this.isBasicSalDisabled=false;
    } else if (basicOption == '5') {
      // this.isBasicSalDisabled=true;
      if (this.af.SalDaysOpted.value == 'Y') {
        let days = Number(this.af.salInDays.value);
        basicSal = Math.round(((Number(this.af.monthlyOfferedpkg.value)) * 40) / 100 * (days / 26));
      } else {
        basicSal = Math.round(((Number(this.af.monthlyOfferedpkg.value)) * 40) / 100);
      }
    }
    this.advanceSalaryform.patchValue({
      basicOption: basicOption,
      basicSal: Number.isNaN(basicSal) ? 0 : basicSal
    })
  }

  savesalarybreakup() {
    let sal_struct = [];
    sal_struct.push(this.salaryDetails)
    let postData = {
      'jsId': this.jsId,
      'dateOfJoining': this.view_emp_data.basicDetails.dateofjoining,
      'tpSalaryStructure': (sal_struct),
      'jobRole': this.candidateDetails.post_offered,
      'customerAccountId': this.tp_account_id.toString(),
      'tpLeaveTemplateId': this.leaveTemplateData[0].templateid.toString(),
      'updatedBy': this.token.id,
      'minWageStateName': this.af.minWageState.value,
      'productTypeId': this.product_type
    }
    this._EmployeeService.setupSalary(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.getAppointmentDetails();
        this.salaryDetails = '';
        this.isEditsal = false;
        this.edit_salary_restructure = false;
        this.restructureMode = '';
        localStorage.setItem('restructureMode', '')
        return this.toastr.success(resData.message);
      } else {
        return this.toastr.error(resData.message)
      }
    })
  }

  addBasicSetupSalary(): any {
    if (this.token.isEmployer != '1') {

      if (!(this.accessRights.Edit || this.accessRights.Add || this.accessRights.View)) {
        return this.toastr.error("You do not have the permission for this.");
      }

    }
    if (this.aadharverfication_status != 'Y' && this.pan_verification_status != 'Y' && this.payout_method != 'self') {
      return this.toastr.error("Please fill the kyc details first", 'Oops');
    }
    let data = {
      mobile: this.candidateDetails.mobile,
      emp_code: this.view_emp_data.basicDetails.emp_code == '' ? this.jsId : this.view_emp_data.basicDetails.emp_code,
      dob: this.candidateDetails.dateofbirth,
      ecStatus: this.ecStatus
    }

    this.Router.navigate(['/employees/setup-salary'], { state: data })
  }

  getSalaryStructure() {
    this._EmployeeService.getSalaryStructure({
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()), 'empId':
        this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id),
      'salaryMode': 'Custom'
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.salaryStructure = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

        this.isGratuity = this.salaryStructure.gratuity == '' || (this.salaryStructure.gratuity != '' && Math.round(this.salaryStructure.gratuity) == 0) ? false : true;

        let date = !this.salaryStructure.effectivefrom ? '' : (this.salaryStructure.effectivefrom.substring(0, 10).split('/')[1] + '/' +
          this.salaryStructure.effectivefrom.substring(0, 10).split('/')[0] + '/' +
          this.salaryStructure.effectivefrom.substring(0, 10).split('/')[2]);
        this.advanceSalaryform.patchValue({
          monthlyOfferedpkg: this.salaryStructure.monthlyofferedpackage,
          locationType: this.salaryStructure.locationtype,
          minWagesCtg: this.salaryStructure.salminwagesctgid,
          SalDaysOpted: this.salaryStructure.salaryindaysopted,
          salInDays: this.salaryStructure.salarydays,
          basicOption: this.salaryStructure.basicoption,
          pfCapApplied: this.salaryStructure.pfcapapplied,
          effectiveDate: date,
          basicSal: this.salaryStructure.basic
        })
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
          //hourlySalarySetup
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
        // this.calculateSal();

        if (this.isGrpInsuranceAllowed == 'Y') {
          this.isGrpInsurance = this.salaryStructure.isgroupinsurance == 'Y' ? true : false;
          if (this.isGrpInsurance) {

            this.employeeInsurance = this.salaryStructure.insuranceamount;
            this.employerInsurance = this.salaryStructure.employerinsuranceamount;

          }
        }

        this.isShowSalaryTable = true;
        this.isEmployerGratuity = this.salaryStructure.employergratuityopted != 'N' ? true : false;
        this.isTDSExemption = this.salaryStructure.is_exemptedfromtds != 'N' ? true : false;
        this.edli_adminchargesincludeinctc = this.pf_details.edli_adminchargesincludeinctc;
        // if(this.candidateDetails.joiningStatus=='RESTRUCTURE' && localStorage.getItem('restructureMode')=='CustomRestructureMode'){
        //   this.getuspccalcgrossfromctc_withoutconveyance();
        // }

        this.salaryStructure['ctcAnnual'] = Math.round(this.salaryStructure['ctc'] * 12);
        this.salaryStructure['inHandAnnual'] = Math.round(this.salaryStructure['salaryinhand'] * 12);
        this.salaryStructure['grossAnnual'] = Math.round(this.salaryStructure['gross'] * 12);
        this.salaryStructure['total'] = (parseFloat(this.salaryStructure.gross) + parseFloat(this.salaryStructure.bonus || '0') + parseFloat(this.salaryStructure.employerepfrate || '0') + parseFloat(this.salaryStructure.employeresirate || '0') + parseFloat(this.salaryStructure.employerlwf || '0') + parseFloat(this.salaryStructure.employergratuity || '0')
          + parseFloat(this.salaryStructure.mealvouchers || '0') + parseFloat(this.salaryStructure.medicalinsurancepremium || '0') + parseFloat(this.salaryStructure.teaallowances || '0')) + parseFloat(this.salaryStructure.employerinsuranceamount || '0');;

        this.salaryStructure['totalAnnual'] = Math.round(this.salaryStructure['total'] * 12)
        this.salaryStructure['total'] = Math.round(this.salaryStructure['total'])

        if (this.salaryStructure && typeof this.salaryStructure === 'object') {
          for (const key in this.salaryStructure) {
            if (typeof Math.round(this.salaryStructure[key]) === 'number' && !Number.isNaN(Math.round(this.salaryStructure[key]))) {

              this.salaryStructure[key] = Math.round(this.salaryStructure[key]);
            }
          }
        }

        const exclusions = [
          'Conveyance Allowance',
          'Medical',
          'Bonus',
          'Meal Vouchers',
          'Medical Insurance Premium',
          'Tea Allowances'
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
    <p>Annual Earning Opportunity For ${this.view_emp_data.basicDetails?.emp_name}</p>`);
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

  updateLeaveTemplate() {
    let data = this.leaveTemplateForm.value;
    if (this.leaveTemplateForm.valid) {
      this._EmployeeService.manageEmployeeLeaveTemplate_hub({
        'leaveTemplate': new Array(data.leavetemplate_text),
        'customerAccountId': this.tp_account_id.toString(),
        'productTypeId': this.product_type.toString(),
        'empId': this.empId.toString(),
        'templateId': data.leavetemplate_text.templateid,
        'effectiveDate': data.effective_dt
      })
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            this.toastr.success(resData.message, 'Success');
            this.editLeave = false;
            this.leaveTemplateForm.patchValue({
              effective_dt: '',
              leavetemplate_text: '',
            })
            this.getEmployeeDetail();

          } else {
            this.toastr.error(resData.message, 'Oops!');
          }
        })
    } else {
      this.toastr.error('Please fill the required details', 'Oops!');
    }
  }


  get_tp_leave_temeplate() {
    this._EmployeeService.get_tp_leave_temeplate({ "customeraccountid": this.tp_account_id.toString() }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.leaveTemplateData = resData.commonData.data;
      }
    })
  }
  open_leave_temp_tab() {
    setTimeout(() => {
      $(function () {
        $('#effective_dt').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
        })
        $('body').on('change', '#effective_dt', function () {
          $('#recdate2').trigger('click');
        })
      })
    }, 0)
  }
  changeLeaveTemplate(e: any) {
    this.leaveTemplateForm.patchValue({
      leavetemplate_text: JSON.parse(e.target.value),
    })
  }
  change_effectivedt() {
    this.leaveTemplateForm.patchValue({
      effective_dt: this.effective_dt_val.nativeElement.value,
    })
  }

  editLeaveTemplate(): any {
    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    this.open_leave_temp_tab();
    this.editLeave = !this.editLeave;
  }

  getEmployeeleave_history() {
    this._EmployeeService.getEmployeeleave_history({
      'accountId': this.view_emp_data.basicDetails.customeraccountid.toString(),
      'empid': this.view_emp_data.basicDetails.emp_id.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leaveHistoryBalanceData = resData.commonData;
        }
        else {
          this.leaveHistoryBalanceData = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.leaveHistoryBalanceData = [];
      }
    })
  }


  calculateSal(): any {

    if (this.customSalaryform.controls.mop.value == '') {
      return this.toastr.error("Please enter value Annual Salary");
    }

    if ((this.salComponentHead.controls[0].value.percentage_ctc == '' || (parseFloat(this.salComponentHead.controls[0].value.percentage_ctc) < parseFloat(this.salaryPercent.basicPercent) || parseFloat(this.salComponentHead.controls[0].value.percentage_ctc) > 100)) && this.salaryCalcType == 'percent') {
      return this.toastr.error(`Basic salary percent must be between ${this.salaryPercent.basicPercent}-100 percent`);
    }
    if ((this.salComponentHead.controls[1].value.percentage_ctc == '' || (parseFloat(this.salComponentHead.controls[1].value.percentage_ctc) < parseFloat(this.salaryPercent.hraPercent) || parseFloat(this.salComponentHead.controls[1].value.percentage_ctc) > 100)) && this.salaryCalcType == 'percent') {
      return this.toastr.error(`HRA percent must be between ${this.salaryPercent.hraPercent}-100 percent`);
    }
    let salary_setup_head = this.salComponentHead.controls;

    this.customCalculatedData = '';

    let decimalDiff = 0, allowanceIdx = 0;
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
        monthlyAmt = parseFloat(salary_setup_head[idx].value.percentage_ctc)
      }

      decimalDiff = parseFloat((monthlyAmt - Math.round(monthlyAmt) + decimalDiff).toFixed(2));

      if (salary_setup_head[idx].value.salary_component_name != 'Special Allowance') {
        monthlyAmt = (((Math.round(monthlyAmt)).toFixed(2)));
      } else {
        allowanceIdx = idx;
        // monthlyAmt = monthlyAmt + decimalDiff;
      }

      salary_setup_head[idx].patchValue({
        'salary_component_amount': (monthlyAmt)
      })

      if (salary_setup_head[idx].value.percentage_fixed == 'Flat') {
        salary_setup_head[idx].patchValue({
          'percentage_ctc': (monthlyAmt)
        })
      }
    }
    if (allowanceIdx != 0) {
      salary_setup_head[allowanceIdx].patchValue({
        'salary_component_amount': decimalDiff + salary_setup_head[allowanceIdx].value.salary_component_amount,
        'percentage_ctc': decimalDiff + salary_setup_head[allowanceIdx].value.salary_component_amount
      })
    }
    this.isCustomInputTrigger = true;

    this.getuspccalcgrossfromctc_withoutconveyance();
  }

  getuspccalcgrossfromctc(): any {
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
      return;
    }
    let date = '01/' + this.cf.effectiveDate.value;

    if (this.cf.minWagesCtg.value == '') {
      return this.toastr.error("Please select minimum wages category");
    }
    else if (this.cf.salaryDays.value == '') {
      return this.toastr.error("Please select salary days");
    } else if (!this.cf.effectiveDate.value) {
      return this.toastr.error('Please select effective date.');
    }
    let mop = parseFloat(((parseFloat(this.cf.mop.value)) / 12).toFixed(2))
    for (let i = 0; i < this.salComponentHead.controls.length; i++) {
      if (this.salComponentHead.controls[i].value.is_taxable == 'N') {
        if (this.salComponentHead.controls[i].value.percentage_fixed == 'Flat') {
          mop -= this.salComponentHead.controls[i].value.percentage_ctc
        } else {
          mop -= this.salComponentHead.controls[i].value.salary_component_amount
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
      'basic': (Math.round(this.salComponentHead.controls[0].value.salary_component_amount)),
      'mop': mop
    }

    this._EmployeeService.uspccalcgrossfromctc(postData).subscribe((resData1: any): any => {
      if (resData1.statusCode) {
        // let gross = resData1.commonData[0].gross;
        if (resData1.commonData[0] && resData1.commonData[0].status == 0) {
          this.customSalaryMsg = resData1.commonData[0].msg;
          return;
        } else {
          this.customSalaryMsg = '';
        }
        this.grossSalary = parseFloat(resData1.commonData[0].gross.toFixed(2));
        console.log(this.grossSalary);

        for (let i = 0; i < this.salComponentHead.controls.length; i++) {
          if (this.salComponentHead.controls[i].value.is_taxable == 'N') {
            if (this.salComponentHead.controls[i].value.percentage_fixed == 'Flat') {
              this.grossSalary += parseFloat(this.salComponentHead.controls[i].value.percentage_ctc)
            } else {
              this.grossSalary += parseFloat(this.salComponentHead.controls[i].value.salary_component_amount)
            }
          }
        }
        let sum = 0;

        for (let i = 0; i < this.salComponentHead.controls.length; i++) {
          if (this.salComponentHead.controls[i].value.percentage_fixed != 'Flat')
            sum += parseFloat(this.salComponentHead.controls[i].value.salary_component_amount);
          else
            sum += parseFloat(this.salComponentHead.controls[i].value.percentage_ctc);
        }

        if (sum != parseFloat(this.grossSalary)) {
          this.toastr.info(`Remaining Gross amount hass been adjusted to special allowance which excceeds from ${(this.grossSalary - sum).toFixed(2)} amount. Adjust if you want!`)
        }
        for (let i = 0; i < this.salComponentHead.value.length; i++) {
          if (this.salComponentHead.controls[i].value.salary_component_name == 'Special Allowance') {
            //console.log(parseFloat(this.salComponentHead.controls[i].value.salary_component_amount) ,parseFloat((this.grossSalary-sum).toFixed(2)));

            this.salComponentHead.controls[i].patchValue({
              salary_component_amount: (parseFloat(this.salComponentHead.controls[i].value.salary_component_amount) + parseFloat((this.grossSalary - sum).toFixed(2))).toFixed(2),
              percentage_ctc: (parseFloat(this.salComponentHead.controls[i].value.salary_component_amount) + parseFloat((this.grossSalary - sum).toFixed(2))).toFixed(2)
            })
          }

        }

        // this.salComponentHead.controls[2].patchValue({
        //   salary_component_amount : Math.round(this.salComponentHead.controls[2].value.salary_component_amount) + (Math.round(this.grossSalary)-sum)
        // })
      } else {
        return this.toastr.error(resData1.message);
      }
    })

  }

  getuspccalcgrossfromctc_withoutconveyance(): any {
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
      return;
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

    let mop = parseFloat(((parseFloat(this.cf.mop.value)) / 12).toFixed(2))
    let conveyance_amt = 0;
    let pfSumAmt = 0;
    for (let i = 0; i < this.salComponentHead.controls.length; i++) {
      if (this.salComponentHead.controls[i].value.is_taxable == 'N' && this.cf.esiOpted.value == 'Y') {
        if (this.salComponentHead.controls[i].value.percentage_fixed == 'Flat') {
          conveyance_amt += parseFloat(this.salComponentHead.controls[i].value.percentage_ctc)
        } else {
          conveyance_amt += parseFloat(this.salComponentHead.controls[i].value.salary_component_amount)
        }
      }
      if (this.salComponentHead.controls[i].value.ispfapplicable == 'Y' && this.cf.pfOpted.value == 'Y') {
        if (this.salComponentHead.controls[i].value.percentage_fixed == 'Flat') {
          pfSumAmt += parseFloat(this.salComponentHead.controls[i].value.percentage_ctc)
        } else {
          pfSumAmt += parseFloat(this.salComponentHead.controls[i].value.salary_component_amount)
        }
      }
    }

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

        if (resData1.commonData[0] && resData1.commonData[0].status == 0) {
          this.customSalaryMsg = resData1.commonData[0].msg;
          return;
        } else {
          this.customSalaryMsg = '';
        }
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
            this.salComponentHead.controls[i].patchValue({
              salary_component_amount: (parseFloat(this.salComponentHead.controls[i].value.salary_component_amount) + parseFloat((this.grossSalary - sum).toFixed(2))).toFixed(2),
              percentage_ctc: (parseFloat(this.salComponentHead.controls[i].value.percentage_ctc) + parseFloat((this.grossSalary - sum).toFixed(2))).toFixed(2)
            })
          }
        }

        // this.salComponentHead.controls[2].patchValue({
        //   salary_component_amount : Math.round(this.salComponentHead.controls[2].value.salary_component_amount) + (Math.round(this.grossSalary)-sum)
        // })
      } else {
        return this.toastr.error(resData1.message);
      }
    })

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
              'salary_component_id': new FormControl(salary_setup_head[idx].id),
              'salary_component_amount': new FormControl(monthlyAmt.toFixed(2)),
              'ispfapplicable': new FormControl(salary_setup_head[idx].epfapplicable),
              'earningType': new FormControl(salary_setup_head[idx].earningtype)
            }));
          }
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
    console.log(isChecked);

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

  getIsEmployerPart(isChecked: boolean) {
    this.isEmployerPartExcluded = isChecked ? 'Y' : 'N';
    this.customCalculatedData = '';
  }

  getIsGratuityInHand(isChecked: boolean) {
    this.gratuityInHand = isChecked;
    this.customCalculatedData = '';
    this.calculateSal();
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
      this.toastr.info(`Remaining Gross amount hass been adjusted to special allowance which excceeds from ${(this.grossSalary - sum).toFixed(2)} amount. Adjust if you want!`)
    }
    postData.mop = this.grossSalary;
    this._EmployeeService.createCustomSalaryStructure(postData).subscribe((resData: any): any => {
      if (resData.statusCode) {
        if (!resData.commonData[0].status) {
          return this.toastr.error(resData.commonData[0].msg);
        }
        this.customCalculatedData = resData.commonData[0];
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

  editCustomSalaryRestructure(): any {
    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }

    if (this.basicdetailsupdated_status != 'Y' ||
      ((!(this.aadharverfication_status == 'Y' || this.pan_verification_status == 'Y')
        || this.accountverification_status != 'Y') && this.payout_method != 'self' && this.candidateDetails.jobType != 'Consultant')) {
      return this.toastr.error("Please complete the Basic information, KYC & Bank details first!", "Oops")
    } else if (this.basicdetailsupdated_status != 'Y' && this.payout_method == 'self') {
      return this.toastr.error("Please complete the Basic information first!", "Oops")
    }

    if (this.candidateDetails.joiningStatus == 'PENDING') {
      this.edit_custom_salary = true;
    }
  }

  editConsultantSalary(): any {
    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    if (this.basicdetailsupdated_status != 'Y' && this.payout_method != 'self') {
      return this.toastr.error("Please complete the Basic first!", "Oops")
    }

    this.isEditConsultantSalary = true;

  }

  clearCalculatedData(idx: any, amount: any): any {
    this.customCalculatedData = '';
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
          // return this.toastr.error("Salary amount cannot excced Gross Salary. Please check.");
        }
      }

    }
    this.getuspccalcgrossfromctc_withoutconveyance()

  }

  saveCustomSal(): any {
    if (this.candidateDetails.joiningStatus != 'JOINED' && this.candidateDetails.joiningStatus != 'RESTRUCTURE') {
      this.edli_adminchargesincludeinctc = this.pf_details.edli_adminchargesincludeinctc
      //console.log('kk2',this.pf_details.edli_adminchargesincludeinctc)
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
    console.log(this.customCalculatedData);
    let postData = {
      ...this.customCalculatedData,
      'tp_leave_template_txt': this.leaveTemplateData,
      'dateOfJoining': this.view_emp_data.basicDetails.dateofjoining,
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
    // postData.patchValue({
    //   'ishourlysetup': this.customSalaryform.value?.hourlySalarySetup || 'N'
    // });
    postData['ishourlysetup'] = this.customSalaryform.value?.hourlySalarySetup || 'N';

    console.log(postData);
    this._EmployeeService.saveCustomSalaryStructure(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this._EmployeeService.updateJoinigStatus({
          js_id: this._EncrypterService.aesEncrypt(this.jsId.toString()),
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

  getMasterTDS() {
    this._EmployeeService.getMasterTDS({ 'actionType': 'GetAllPaymentPurposes', 'productTypeId': this.product_type }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.masterTDS = resData.commonData;
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  showUpdateEmp() {
    this.isUpdateEmp = true;
    this._EmployeeService.getUpdateData({ 'orgEmpCode': this.candidateDetails?.orgempcode }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        this.updatedEmpDetails = resData.commonData[0];
        this.updatedEmpDetails = {
          first_name: this.cleanString(this.updatedEmpDetails.first_name),
          last_name: this.cleanString(this.updatedEmpDetails.last_name),
          date_of_birth: this.cleanString(this.updatedEmpDetails.date_of_birth),
          gender: this.cleanString(this.updatedEmpDetails.gender),
          email_id: this.cleanString(this.updatedEmpDetails.email_id),
          mobile_number: this.cleanMobileNumber(this.updatedEmpDetails.mobile_number),
          alternate_mobile_number: this.cleanMobileNumber(this.updatedEmpDetails.alternate_mobile_number),
          bloodRelationName: '',
          permanent_address: this.cleanString(this.updatedEmpDetails.permanent_address),
          communication_address: this.cleanString(this.updatedEmpDetails.communication_address),
          father_name: this.cleanString(this.updatedEmpDetails.father_name),
          role: this.cleanString(this.updatedEmpDetails.role),
          joining_date: this.cleanString(this.updatedEmpDetails.joining_date?.split('-').reverse().join('/')),
          employee_id: this.cleanString(this.updatedEmpDetails.employee_id),
          aadhar_number: this.cleanAadharNumber(this.updatedEmpDetails.aadhar_number),
          pan_number: this.cleanPanNumber(this.updatedEmpDetails.pan_number),
          account_number: this.cleanBankAccountNumber(this.updatedEmpDetails.account_number),
          bank_name: this.cleanString(this.updatedEmpDetails.bank_name),
          bank_branch_name: this.cleanString(this.updatedEmpDetails.bank_branch_name),
          ifsc_code: this.cleanIFSCCode(this.updatedEmpDetails.ifsc_code),
          epf_eligible: this.updatedEmpDetails.epf_eligible == '' ? 'N' : this.updatedEmpDetails.epf_eligible == 'No' ? 'N' : this.updatedEmpDetails.epf_eligible == 'Yes' ? 'Y' : 'N',
          uan_number: !this.updatedEmpDetails.uan_number && (this.updatedEmpDetails.epf_eligible == 'Y' || this.updatedEmpDetails.epf_eligible == 'Yes') ? 'Request for UAN' : this.updatedEmpDetails.uan_number.replace(/\D/g, ""),
          esi_eligible: this.updatedEmpDetails.esi_eligible == '' ? 'N' : this.updatedEmpDetails.esi_eligible == 'No' ? 'N' : this.updatedEmpDetails.esi_eligible == 'Yes' ? 'Y' : 'N',
          esi_number: !this.updatedEmpDetails.esi_number && this.updatedEmpDetails.esi_eligible == 'Y' || this.updatedEmpDetails.esi_eligible == 'Yes' ? 'Request for ESIC' : this.updatedEmpDetails.esi_number.replace(/\D/g, ""),
          academy: this.updatedEmpDetails.academy ? this.updatedEmpDetails.academy.trim() : ''
        }
      } else {
        return this.toastr.error(resData.message);
      }
    })
  }
  updateUser() {

    let postData = {
      salutation: '',
      empName: this.cleanString(this.updatedEmpDetails.first_name) + ' ' + this.cleanString(this.updatedEmpDetails.last_name),
      dob: this.cleanString(this.updatedEmpDetails.date_of_birth == '0000-00-00' ? '' : this.updatedEmpDetails.date_of_birth?.split('-').reverse().join('/')),
      gender: this.cleanString(this.updatedEmpDetails.gender),
      email: this.cleanString(this.updatedEmpDetails.email_id),
      mobile: this.cleanMobileNumber(this.candidateDetails.mobile),
      emergencyContact: this.cleanMobileNumber(this.updatedEmpDetails.alternate_mobile_number),
      bloodRelationName: '',
      permanentAddress: this.cleanString(this.updatedEmpDetails.permanent_address),
      residentialAddress: this.cleanString(this.updatedEmpDetails.communication_address),
      fatherName: this.cleanString(this.updatedEmpDetails.father_name),
      postOffered: this.cleanString(this.updatedEmpDetails.role),
      doj: this.cleanString(this.updatedEmpDetails.joining_date?.split('-').reverse().join('/')),
      orgEmpCode: this.cleanString(this.updatedEmpDetails.employee_id),
      aadharCardNo: this.cleanAadharNumber(this.updatedEmpDetails.aadhar_number),
      panCardNo: this.cleanPanNumber(this.updatedEmpDetails.pan_number),
      bankAccountNo: this.cleanBankAccountNumber(this.updatedEmpDetails.account_number),
      bankName: this.cleanString(this.updatedEmpDetails.bank_name),
      bankBranch: this.cleanString(this.updatedEmpDetails.bank_branch_name),
      ifscCode: this.cleanIFSCCode(this.updatedEmpDetails.ifsc_code),
      pfOpted: this.updatedEmpDetails.epf_eligible == '' ? 'N' : this.updatedEmpDetails.epf_eligible == 'No' ? 'N' : this.updatedEmpDetails.epf_eligible == 'Yes' ? 'Y' : 'N',
      uanNumber: !this.updatedEmpDetails.uan_number && (this.updatedEmpDetails.epf_eligible == 'Y' || this.updatedEmpDetails.epf_eligible == 'Yes') ? 'Request for UAN' : this.updatedEmpDetails.uan_number.replace(/\D/g, ""),
      esicOpted: this.updatedEmpDetails.esi_eligible == '' ? 'N' : this.updatedEmpDetails.esi_eligible == 'No' ? 'N' : this.updatedEmpDetails.esi_eligible == 'Yes' ? 'Y' : 'N',
      esicNumber: !this.updatedEmpDetails.esi_number && (this.updatedEmpDetails.esi_eligible == 'Y' || this.updatedEmpDetails.esi_eligible == 'Yes') ? 'Request for ESIC' : this.updatedEmpDetails.esi_number.replace(/\D/g, ""),
      esicDependentDetails: this.updatedEmpDetails.esic_dependent_details != undefined && this.updatedEmpDetails.esic_dependent_details != null ? this.updatedEmpDetails.esic_dependent_details : '',
      reportingManagerName: this.updatedEmpDetails.reportingmanagername != undefined && this.updatedEmpDetails.reportingmanagername != null ? this.updatedEmpDetails.reportingmanagername : '',
      academy: this.updatedEmpDetails.academy ? this.updatedEmpDetails.academy.trim() : '',
      updatedBy: this.token.userid,
      productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
      customerAccountId: this._EncrypterService.aesEncrypt(this.tp_account_id.toString())
    }

    this._EmployeeService.updateEmployeeDetailsThroughApiProcess(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.isUpdateEmp = false;
        this.getEmployeeDetail();
      } else {
        this.toastr.error(resData.message);
      }

    })

  }

  cleanString(input: string): string {
    return input ? input.trim() : '';
  }

  cleanMobileNumber(number: string): string {
    return number.replace(/\D/g, "");
  }

  cleanAadharNumber(number: string): string {
    return number.replace(/\D/g, "");
  }

  cleanPanNumber(number: string): string {
    return number.replaceAll("'", '');
  }

  cleanBankAccountNumber(number: string): string {
    return number.replace(/\D/g, "");
  }

  cleanIFSCCode(code: string): string {
    return code && /^[A-Z]{4}0[A-Z0-9]{6}$/.test(code) ? code : '';
  }

  saveConsultantSalarySetup(): any {
    if (this.consultantform.invalid) {
      return this.toastr.error("Some fields missing");
    }
    this._EmployeeService.saveConsultantSalarySetup({
      'customerAccountId': this.tp_account_id.toString(), 'consultantId': this.empId.toString(),
      'grossAmount': this.consultantform.controls.mop.value, 'tdsId': this.consultantform.controls.tdsId.value,
      'createdBy': this.token.id, 'productTypeId': this.product_type, 'consultantJsId': this.jsId.toString(), 'dateOfJoining': this.candidateDetails.dateofjoining,
      'jobRole': 'Consultant'
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.isEditConsultantSalary = false;
        this.getAppointmentDetails();
      } else {
        this.toastr.error(resData.message);
      }
    })
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


  // Start - hourly salary setup setting sidharth kaul dated. 12.05.2025
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


  addUanNumber() {
    // console.log("empId", this.empDataFromParent.emp_id.toString(),
    //   "empCode", this.empDataFromParent?.emp_code.toString(),
    //   "customerAccountId", this.tp_account_id.toString(),
    //   "createdBy", this.tp_account_id.toString(),
    //   "uanNumber", this.uanNumber?.toString())

    //   return;

    if (!this.uanNumber || this.uanNumber.trim() === '') {
      this.toastr.error('Please enter a valid UAN number', 'Oops!');
      return;

    }

    this._ReportService.SubmitUanForBusiness({
      "empId": this.candidateDetails.emp_id.toString(),
      "empCode": this.view_emp_data.basicDetails.emp_code.toString(),
      "customerAccountId": this.tp_account_id.toString(),
      "createdBy": this.tp_account_id.toString(),
      "uanNumber": this.uanNumber?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        // this.submit_uan_data = resData.commonData;
        // this.UAN_Report(this.filterStatus);
        this.getAppointmentDetails();
        this.closeUanNumberPopup();
        this.toastr.success(resData.message, 'Oops!');
      } else {
        // this.submit_uan_data = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    });
  }

  openUanNumberPopup(uanNumber: any) {
    this.showUANNumberPopup = true;
    this.uanNumber = uanNumber;
  }

  closeUanNumberPopup() {
    this.showUANNumberPopup = false;
    this.uanNumber = '';
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


  // ========================================================================================================

  getEarningLabel(componentName: string): string {

    const controlsArray = this.salComponentHead.controls;

    const match = controlsArray.find((control) => {
      const name = control.get('salary_component_name')?.value;
      return name?.toLowerCase() === componentName.toLowerCase();
    });

    return match?.get('earningType')?.value || componentName;
  }




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
  getFilteredDeductionsfordedcution() {
    return this.salaryStructure?.OtherDeductions?.filter(d => d.deduction_name === 'VPF' || (d.isvariable == 'N' && d?.deduction_frequency));
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


}
