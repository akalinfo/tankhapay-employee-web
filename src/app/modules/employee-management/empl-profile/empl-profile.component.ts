import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import decode from 'jwt-decode';
import { EmployeeManagementService } from '../employee-management.service';
import { Router } from '@angular/router';
import { EmployeeService } from '../../employee/employee.service';
import { PayoutService } from '../../payout/payout.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { AttendanceService } from '../../attendance/attendance.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { RecruitService } from '../../recruit/recruit.service';
import { UserMgmtService } from '../../user-mgmt/user-mgmt.service';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';
import axios from 'axios';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';
import { LoginService } from '../../login/login.service';
declare var $: any;
@Component({
  selector: 'app-empl-profile',
  templateUrl: './empl-profile.component.html',
  styleUrls: ['./empl-profile.component.css', '../empl-service-book/empl-service-book.component.css'],
  animations: [grooveState, dongleState]
})
export class EmplProfileComponent {
  fdesignationListname: any = [];
  vendorForm: FormGroup;
  vendor_master_list_data: any = [];
  isAddVendor: boolean = false;
  confirmationModal: boolean = false;
  showSidebar: boolean = true;
  product_type: any;
  token: any = '';
  tp_account_id: any = '';
  accessRights: any;
  @Input() empDataFromParent: any;
  candidateDetails: any = '';
  basic_detail_form: FormGroup;
  bankDetailsForm: FormGroup;
  payout_method: any;
  file: any;
  send_file: string | ArrayBuffer;
  submitted: boolean = false;
  masterJobType: any = [];
  geoFencingData: any = [];
  employerOUorGeoFenceData: any = [];
  orgGroup: any = [];
  selectedval: any = [];
  geoDropdownSettings = {};
  dropdownSettings = {};
  employerGeoFenceData: any = [];
  isBasicDetails: boolean = false;
  isBankInfo: boolean = false;
  kycForm: FormGroup;
  edit_kyc_details: boolean = false;
  isEducationDetails: boolean = false;
  educationDetailForm: FormGroup;
  trainingDetailForm: FormGroup;
  workExperienceForm: FormGroup;
  isTrainingDetail: boolean = false;
  isWorkExperience: boolean = false;
  familyDetailForm: FormGroup;
  isFamilyDetail: boolean = false;
  stateMaster: any = [];
  educationDetailData: any = [];
  experiencedata: any = [];
  trainingData: any = [];
  familyData: any = [];
  isUnitParameterSalary: boolean = false;
  aop: string = '';
  organzationUnitList: any = [];
  ouid: any = '';
  deptList: any = [];
  desgList: any = [];
  salaryStructure: any = '';
  salaryStructureView: any = '';
  masterTemplateList: any = [];
  letterid: any = '';
  currentCursorField: string = null;
  lastRange: any;
  appointmentLetterForm: FormGroup
  pdfSrc: string;
  isDataLoaded: boolean = true;
  invalidDate: boolean = false;
  pf_details: any;
  location_default: any = [];
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
  deptartmentList: any = [];
  designationList: any = [];
  fdesignationList: any = [];
  Disciplinary_Actions_Details: any = [];
  open_disciplinary_popup: boolean = false;
  disciplinary_form: FormGroup;
  open_edit_disciplinary_popup: boolean = false;
  open_edit_reward_popup: boolean = false;
  open_reward_popup: boolean = false;
  reward_form: FormGroup;
  Reward_Form: FormGroup;
  Disciplinary_Form: FormGroup;
  reward_row_id: any;
  action_row_id: any;
  edit_reward_data: any = [];
  delete_reward_data: any = [];
  add_reward_data: any = [];
  Reward_Details: any = [];
  filteredEmployees: any = [];
  isAddDepartment: boolean = false;
  isAddDesignation: boolean = false;
  isAddFunctionalDesignation: boolean = false;
  departmentForm: FormGroup;
  designationForm: FormGroup;
  functionaDesignationForm: FormGroup;
  @ViewChild('formElement') formElement: ElementRef;
  projectList: any = [];
  isJoinigDateEditable: boolean = true;
  is_production: boolean = true;

  projectMapForm: FormGroup;
  LocationTransferForm: FormGroup;
  project_map_history_data: any = [];
  locationtransfer_data: any = [];
  isProjectMapDetail: boolean = false;
  isLocationtransferDetail: boolean = false;
  projectMapTitle: any = '';
  LocationtransferTitle: any = '';
  project_list_data: any = [];
  state_list_data: any = [];
  isGratuity: boolean;
  isGrpInsuranceAllowed: string;
  isGrpInsurance: boolean;
  employeeInsurance: any;
  isShowSalaryTable: boolean;
  isEmployerGratuity: boolean;
  edli_adminchargesincludeinctc: any;
  accessRightsArray: any;
  showLiveLocation: any;

  salaryPercent: { basicPercent: any; hraPercent: any; };
  salComponentHead: any = [];
  CompletedCycle: any = [];
  uanNumber: any;
  showUANNumberPopup: boolean = false;
  showESICNumberPopup: boolean = false;
  esicNumber: any = '';
  esicDispensaryAddress: any = '';
  base64String: any = '';
  fileName: any = '';
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;

  @Output() notify: EventEmitter<string> = new EventEmitter();
  emp_code: any;
  notifyParent() {
    this.notify.emit('1');
  }

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _EmployeeService: EmployeeService,
    private _EmployeemgmtService: EmployeeManagementService,
    private _EncrypterService: EncrypterService,
    private router: Router,
    private payOutService: PayoutService,
    private _masterService: MasterServiceService,
    private _faceCheckinService: FaceCheckinService,
    private _BusinesSettingsService: BusinesSettingsService,
    private http: HttpClient,
    private _attndanceService: AttendanceService,
    private _recruitService: RecruitService,
    private _userMgmtService: UserMgmtService,
    private activityLogsService: ActivityLogsService,
    private confirmationDialogService: ConfirmationDialogService, private sanitizer: DomSanitizer, private _LoginService: LoginService,
    private _ReportService: ReportService) { }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.payout_method = this.token.payout_mode_type;
    // this.product_type = token.product_type;
    // console.log(this.tp_account_id);
    this.product_type = localStorage.getItem('product_type');
    this.accessRights = this._masterService.checkAccessRights('/employees');

    this.accessRightsArray = JSON.parse(localStorage.getItem('access_rights') || '[]');

    // Check if an object with modulename "Live Tracking" exists
    this.showLiveLocation = this.accessRightsArray.some(
      (item: any) => item.modulename === "Live Tracking"
    );

    this.is_production = environment.production;
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'org_unit_id',
      textField: 'org_unit_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };
    this.geoDropdownSettings = {
      singleSelection: false,
      idField: 'geo_id',
      textField: 'org_unit_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };

    this.basic_detail_form = this._formBuilder.group({
      name_title: [''],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z. ]+$')]],
      dob: ['', [Validators.required]],
      gender: [''],
      employee_email: ['', [
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
      ]],
            employee_personal_email: ['', [
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
      ]],
      employee_mobile: ['', [Validators.required,
      Validators.pattern('^[6-9]{1}[0-9]{9}$'),
      Validators.minLength(10),
      Validators.maxLength(10)
      ]],
      emergency_mobile: ['', [
        Validators.pattern('^[6-9]{1}[0-9]{9}$'),
        Validators.minLength(10)
      ]],
      blood_relation: ['', [Validators.pattern(/^[a-zA-Z ]+$/)]],
      perm_add: ['', [Validators.required]],
      res_add: [''],
      relation_name: [''],
      post_offered: ['', [Validators.required]],
      posting_department: ['', [Validators.required]],
      doj: ['', [Validators.required]],
      orgempcode: [''],
      jobType: ['', [Validators.required]],
      jobTypeCategory: [''],
      geo_fencing: [''],
      live_tracking: [''],
      orgIds: [''],
      geoFenceIds: [''],
      reportingManager: [''],
      reportingManagerEmpCode: [''],
      departmentId: [''],
      designationId: [''],
      project: [''],
      projectId: [''],
      emergency_contact_person: [''],
      blood_group: [''],
      fdesignationId: [''],
      functional_designation: [''],
      pan_no: ['', [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/i)]],
      probation: [''],
      vendorname: [''],
      contractenddate: [''],
      salarybookedproj: [''],
      salarybookedprojid: [''],
    })

    this.bankDetailsForm = this._formBuilder.group({
      acc_no: ['', [Validators.required]],
      check_acc_no: ['', [Validators.required]],
      bank_name: [''],// removed required
      bank_branch: [''], // removed required
      ifsc: [''], // removed required
      bank_doc: [''],
      bank_doc_file: [''],
      bank_file_path: [''],
      bank_file_name: ['']
    })
    this.applyConditionalBankValidators();
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
    });

    this.educationDetailForm = this._formBuilder.group({
      course: ['', [Validators.required]],
      specialization: ['', [Validators.pattern(/.*\S.*/)]],
      country: ['', [Validators.required]],
      state: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
      university_college: ['', [Validators.pattern(/.*\S.*/)]],
      course_type: [''],
      passing_year: ['', [Validators.pattern(/^(19|20)\d{2}$/)]],
      percentage_cgpa: [''],
      id: ['']
    })

    this.workExperienceForm = this._formBuilder.group({
      company_name: ['', [Validators.required]],
      job_title: [''],
      from_date: ['', [Validators.required]],
      to_date: ['', [Validators.required]],
      description: [''],
      skills: [''],
      total_experience: ['', [Validators.required]],
      last_take_home_drawn: [''],
      leaving_reason: [''],
      id: ['']
    })

    this.trainingDetailForm = this._formBuilder.group({
      training: [''],
      completionDate: [''],
      certification: [''],
      institute: [''],
      grade: [''],
      id: [''],
      certification_doc: [''],
      certification_doc_file: [''],
      certification_file_path: [''],
      certification_file_name: [''],
      hideval: [''],
    })

    this.familyDetailForm = this._formBuilder.group({
      name: ['', [Validators.required]],
      panno: [''],
      address: [''],
      relationName: [''],
      dob: [''],
      aadharno: [''],
      id: ['']
    })

    this.appointmentLetterForm = this._formBuilder.group({
      template: [''],
      template_html: [''],
      subject: [''],
      body: [''],
      header: [''],
      footer: ['']
    })

    this.reward_form = this._formBuilder.group({
      rewardName: ['', [Validators.required]],
      rewardReason: ['', [Validators.required]],
      rewardDate: ['', [Validators.required]],
    });
    this.disciplinary_form = this._formBuilder.group({
      actionDetail: ['', [Validators.required]],
      actionDate: ['', [Validators.required]],
      actionReason: ['', [Validators.required]],
    });
    this.Disciplinary_Form = this._formBuilder.group({
      action_Detail: ['', [Validators.required]],
      action_Date: ['', [Validators.required]],
      action_Reason: ['', [Validators.required]],
    });

    this.Reward_Form = this._formBuilder.group({
      reward_Name: ['', [Validators.required]],
      reward_Reason: ['', [Validators.required]],
      reward_Date: ['', [Validators.required]],
    });

    this.departmentForm = this._formBuilder.group({
      departmentName: ['', [Validators.required]]
    })
    this.vendorForm = this._formBuilder.group({
      vendorname: ['', [Validators.required]]
    })
    this.designationForm = this._formBuilder.group({
      designationName: ['', [Validators.required]],
      id: ['', [Validators.required]]
    })

    this.functionaDesignationForm = this._formBuilder.group({
      designationName: ['', [Validators.required]],
      isFunctional: [false],
      func_designation: [''],
      id: ['', [Validators.required]]
    })



    this.projectMapForm = this._formBuilder.group({
      id: [''],
      project_id: [''],
      emp_code: [''],
      deputed_date: [''],
      relieved_date: [''],
      remarks: [''],

    });

    this.LocationTransferForm = this._formBuilder.group({
      id: [''],
      state_id: ['', [Validators.required]],
      emp_code: [''],
      effectiveDate: [''],
      remarks: [''],
      Location: [''],
      checkboxdefault: [0]

    })
    this.getEmpCompletedCycle();

    this.getAppointmentDetails();
    this.getMasterLetters();
    this.getEmployerSocialSecurityDetails('EPF');
    this.get_att_dept_master_list();
    this.employer_details();
    this.getProjectList();
    if (this.empDataFromParent?.emp_code) {
      this.GetServiceBook_Details();
      this.get_project_map();
      this.get_project_list();
      this.get_state_list();
      this.get_locationtransfer();
    }
    this.get_vendor_master_list();
    // this.getSalaryStructure();
    this.getMasterSalaryStructure();
    // console.log("emp_code",this.empDataFromParent.emp_code);
    this.emp_code = this.empDataFromParent.emp_code;
 }

  // Conditional Validation for bank_name, bank_branch and ifsc_code - sidharth kaul 16.06.2025
  applyConditionalBankValidators() {
    if (this.payout_method == 'standard') {
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

  get bf() {
    return this.basic_detail_form.controls;
  }
  get train() {
    return this.trainingDetailForm.controls;
  }


  get bdf() {
    return this.bankDetailsForm.controls;
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  getMasterLetters(letterid: any = '') {

    this._EmployeemgmtService.getMasterLetters({
      'productTypeId': this.product_type, 'customerAccountId': this.tp_account_id.toString(),
      'lettersType': 'Appointment Letter', 'letterId': letterid
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (!letterid) {
          this.masterTemplateList = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        } else {
          let template = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))[0];
          this.appointmentLetterForm.patchValue({
            template_html: template.template_html,
            subject: template.email_subject,
            body: template.email_body
          })

          // $('#attachment').val(template.template_html)
        }

      }
    })
  }


  getTemplateById(templateid: any, action: any = '') {
    ////// console.log(this.salaryStructure);

    let postData = {
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empId: this.empDataFromParent.emp_id,
      templateId: templateid
    }
    if (templateid) {
      let html = '';
      let salaryStructureforhtml1 = `<style>.table {
        width: 100% !important;
        max-width: 100% !important;;
        margin-bottom: 20px !important;
        padding:10px !important;
    }
        .bor-class{
        border:0.1px solid #000;
        }
        </style>
            ${'\u00A0'.repeat(500)}
            <div style="page-break-after: always;"></div>
            <div style="page-break"></div>
           ${'\u00A0'.repeat(500)}
     <div class="table-responsive" >
            <table class="table">
              <thead>
                 <tr>
              <td colspan="3" style="text-align:center;"><b>ANNEXURE-A</b></td>
              </tr>
                <tr>
                  <th class="bor-class">CTC</th>
                  <th class="bor-class">Monthly</th>
                  <th class="bor-class">Annually</th>
                </tr>
              </thead>
              <tbody id="roundedValues">
              `;
      if (this.candidateDetails.jobType != 'Consultant') {
        salaryStructureforhtml1 += `
                <tr class="danger1" >
                  <th colspan="3" class="bor-class">1. GROSS SALARY</th>
                </tr>
                <tr class="danger1" >
                  <td scope="col" class="bor-class">${this.getEarningLabel('BASIC SALARY')}</td>
                  <td class="bor-class">${this.salaryStructure.basic}</td>
                  <td class="bor-class">${this.salaryStructure.basic * 12}</td>
                </tr>
                <tr class="danger1" >
                  <td scope="col" class="bor-class">${this.getEarningLabel('HRA')}</td>
                  <td class="bor-class">${this.salaryStructure.hra}</td>
                  <td class="bor-class">${this.salaryStructure.hra * 12}</td>
                </tr>
                `;
      }
      if (this.salaryStructure.allowances != '' && this.salaryStructure.allowances != '0' && this.salaryStructure.allowances != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1"
                  >
                  <td scope="col" class="bor-class">${this.getEarningLabel('Special Allowance')}</td>
                  <td class="bor-class">${this.salaryStructure.allowances}</td>
                  <td class="bor-class">${this.salaryStructure.allowances * 12}</td>
                </tr>
                `;
      }
      if (this.salaryStructure?.conveyance_allowance != '' && this.salaryStructure?.conveyance_allowance != '0.0000' && this.salaryStructure?.conveyance_allowance != '0') {
        salaryStructureforhtml1 += `
                <tr class="danger1"
                  >
                  <td scope="col" class="bor-class">${this.getEarningLabel('Conveyance')}</td>
                  <td class="bor-class">${this.salaryStructure.conveyance_allowance}</td>
                  <td class="bor-class">${this.salaryStructure.conveyance_allowance * 12}</td>
                </tr>
                `;
      }
      if (this.salaryStructure?.medical_allowance != '' && this.salaryStructure?.medical_allowance != '0.0000' && this.salaryStructure?.medical_allowance != '0') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">${this.getEarningLabel('Medical Expenses')}</td>
                  <td class="bor-class">${this.salaryStructure.medical_allowance} </td>
                  <td class="bor-class">${this.salaryStructure.medical_allowance * 12}</td>
                </tr>
`;
      }
      if (Array.isArray(this.salaryStructure?.OtherDeductions)) {
        for (let deduction of this.salaryStructure.OtherDeductions) {
          if (deduction.deduction_amount !== 0) {
            salaryStructureforhtml1 += `
              <tr class="danger1">
                <td scope="col" class="bor-class">${this.getEarningLabel(deduction.deduction_name)}</td>
                <td class="bor-class">${deduction.deduction_amount}</td>
                <td class="bor-class">${deduction.deduction_amount * 12}</td>
              </tr>
            `;
          }
        }
      }
      if (
        this.salaryStructure.gross !== '' &&
        this.salaryStructure.gross !== '0' &&
        this.salaryStructure.gross !== '0.0000' &&
        this.candidateDetails.jobType !== 'Consultant'
      ) {
        salaryStructureforhtml1 += `

                <tr>
                  <th scope="col" class="bor-class">Gross Salary</th>
                  <th class="bor-class">${this.salaryStructure.gross}</th>
                  <th class="bor-class">${this.salaryStructure.grossAnnual}</th>
                </tr>`;
      }
      if (this.salaryStructure.bonus != '' && this.salaryStructure.bonus != '0' && this.salaryStructure.bonus != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">Regular Bonus</td>
                  <td class="bor-class">${this.salaryStructure.bonus}</td>
                  <td class="bor-class">${this.salaryStructure.bonus * 12}</td>
                </tr>`;
      }
      if (this.salaryStructure.mealvouchers != '' && this.salaryStructure.mealvouchers != '0' && this.salaryStructure.mealvouchers != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">Meal Voucher</td>
                  <td class="bor-class">${this.salaryStructure.mealvouchers}</td>
                  <td class="bor-class">${this.salaryStructure.mealvouchers * 12}</td>
                </tr>
                `;
      }
      if (this.salaryStructure.medicalinsurancepremium != '' && this.salaryStructure.medicalinsurancepremium != '0' && this.salaryStructure.medicalinsurancepremium != '0.0000') {
        salaryStructureforhtml1 += `


                <tr class="danger1">
                  <td scope="col" class="bor-class">Medical Insurance Premium</td>
                  <td class="bor-class">${this.salaryStructure.medicalinsurancepremium}</td>
                  <td class="bor-class">${this.salaryStructure.medicalinsurancepremium * 12}</td>
                </tr>`;
      }
      if (this.salaryStructure.teaallowances != '' && this.salaryStructure.teaallowances != '0' && this.salaryStructure.teaallowances != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">Tea Allowances</td>
                  <td class="bor-class">${this.salaryStructure.teaallowances}</td>
                  <td class="bor-class">${this.salaryStructure.teaallowances * 12}</td>
                </tr>
                `;
      }
      if (this.salaryStructure.employerepfrate != '' && this.salaryStructure.employerepfrate != '0' && this.salaryStructure.employerepfrate != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">Employer EPF Part</td>
                  <td class="bor-class">${this.salaryStructure.employerepfrate}</td>
                  <td class="bor-class">${this.salaryStructure.employerepfrate * 12}</td>
                </tr>
                `;
      }
      if (this.salaryStructure.employeresirate != '' && this.salaryStructure.employeresirate != '0' && this.salaryStructure.employeresirate != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">Employer ESIC Part</td>
                  <td class="bor-class">${this.salaryStructure.employeresirate}</td>
                  <td class="bor-class">${this.salaryStructure.employeresirate * 12}</td>
                </tr>
                `;
      }
      if (this.salaryStructure.employerlwf != '' && this.salaryStructure.employerlwf != '0' && this.salaryStructure.employerlwf != '0.0000') {
        salaryStructureforhtml1 += ` <tr class="danger1">
                  <td scope="col" class="bor-class">Employer LWF</td>
                  <td class="bor-class">
                    ${this.salaryStructure.employerlwf}</td>
                  <td class="bor-class">${this.salaryStructure.employerlwf * 12}
                  </td>
                </tr>
                `;
      }
      if (this.salaryStructure.employergratuity != '' && this.salaryStructure.employergratuity != '0' && this.salaryStructure.employergratuity != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">Employer Gratuity</td>
                  <td class="bor-class">
                    ${this.salaryStructure.employergratuity}
                  </td>
                  <td class="bor-class">${this.salaryStructure.employergratuity * 12}</td>
                </tr>
                `;
      }
      if (this.salaryStructure.employerinsuranceamount != '' && this.salaryStructure.employerinsuranceamount != '0' && this.salaryStructure.employerinsuranceamount != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">Employer Group Insurance</td>
                  <td class="bor-class">
                    ${this.salaryStructure.employerinsuranceamount}
                  </td>
                  <td class="bor-class">${this.salaryStructure.employerinsuranceamount * 12}</td>
                </tr>
                `;
      }
      if (this.salaryStructure.total != '' && this.salaryStructure.total != '0' && this.salaryStructure.total != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <th scope="col" class="bor-class">GRAND TOTAL</th>
                  <th class="bor-class">
                    ${this.salaryStructure.total}
                  </th class="bor-class">
                  <th class="bor-class">${this.salaryStructure.totalAnnual}</th>
                </tr>
`;
      }
      salaryStructureforhtml1 += `
                <tr class="danger1">
                  <th colspan="3" class="bor-class">3. DEDUCTION</th>
                </tr>
`;
      if (this.salaryStructure.taxes != '' && this.salaryStructure.taxes != '0' && this.salaryStructure.taxes != '0.0000') {

        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">Tax</td>
                  <td class="bor-class">
                    ${this.salaryStructure.taxes}
                  </td>
                  <td class="bor-class">
                    ${this.salaryStructure.taxes * 12}
                  </td>
                </tr>
                `;
      }
      if (this.salaryStructure.employeeepfrate != '' && this.salaryStructure.employeeepfrate != '0' && this.salaryStructure.employeeepfrate != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">${this.getEarningLabel('Employee EPF')}</td>
                  <td class="bor-class">
                    ${this.salaryStructure.employeeepfrate}
                  </td>
                  <td class="bor-class">
                    ${this.salaryStructure.employeeepfrate * 12}
                  </td>
                </tr>
                `;
      }
      if (this.salaryStructure.vpfemployee != '' && this.salaryStructure.vpfemployee != '0' && this.salaryStructure.vpfemployee != '0.0000') {
        salaryStructureforhtml1 += `


                <tr class="danger1"
                  >
                  <td scope="col" class="bor-class">Employee VPF</td>
                  <td class="bor-class">
                    ${this.salaryStructure.vpfemployee}</td>
                  <td class="bor-class">${this.salaryStructure.vpfemployee * 12}
                  </td>
                </tr>
                `;
      }
      if (this.salaryStructure.employeeesirate != '' && this.salaryStructure.employeeesirate != '0' && this.salaryStructure.employeeesirate != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">Employee ESIC</td>
                  <td class="bor-class">${this.salaryStructure.employeeesirate}</td>
                  <td class="bor-class">${this.salaryStructure.employeeesirate * 12}</td>
                </tr>
`;
      }
      if (this.salaryStructure.employeelwf != '' && this.salaryStructure.employeelwf != '0' && this.salaryStructure.employeelwf != '0.0000') {

        salaryStructureforhtml1 += `
                <tr class="danger1"
                  >
                  <td scope="col" class="bor-class">Employee LWF</td>
                  <td class="bor-class">
                    ${this.salaryStructure.employeelwf}</td>
                  <td class="bor-class"> ${this.salaryStructure.employeelwf * 12}
                  </td>
                </tr>
                `;
      }
      if (this.salaryStructure.insuranceamount != '' && this.salaryStructure.insuranceamount != '0' && this.salaryStructure.insuranceamount != '0.0000') {
        salaryStructureforhtml1 += `

                <tr class="danger1"
                  >
                  <td scope="col" class="bor-class">Employee Group Insurance</td>
                  <td class="bor-class">
                    ${this.salaryStructure.insuranceamount}</td>
                  <td class="bor-class"> ${this.salaryStructure.insuranceamount * 12}
                  </td>
                </tr>
                `;
      }
      if (this.salaryStructure.gratuity != '' && this.salaryStructure.gratuity != '0' && this.salaryStructure.gratuity != '0.0000') {
        salaryStructureforhtml1 += `
                <tr class="danger1">
                  <td scope="col" class="bor-class">${this.getEarningLabel('Gratuity In Hand')}</td>
                  <td class="bor-class">
                    ${this.salaryStructure.gratuity}</td>
                  <td class="bor-class">${this.salaryStructure.gratuity * 12}
                  </td>
                </tr>
`;
      } salaryStructureforhtml1 += `

                <tr class="danger3">
                  <td class="bor-class">Total CTC</td>
                  <td class="bor-class">${this.salaryStructure.ctc}</td>
                  <td class="bor-class">${this.salaryStructure.ctcAnnual}</td>
                </tr>
                <tr class="danger3">
                  <td class="bor-class">Salary In Hand</td>
                  <td class="bor-class">${this.salaryStructure.salaryinhand}</td>
                  <td class="bor-class">${this.salaryStructure.inHandAnnual}</td>
                </tr>
              </tbody>
            </table>
            <div class="row">
              <div class="col-md-12">
                <div class="d-flex justify-content-between align-items-center">
                  <div class="col-md-4">
                    <label><strong>Effective Date : &nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.effectivefrom ?
          this.salaryStructure.effectivefrom.substring(0, 10) : ''}</span>
                  </div>
                  <div class="col-md-4">
                    <label><strong>Professional Tax Applied : &nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.is_professional_tax_applied}</span>
                  </div>
                  `;
      if (this.salaryStructure.is_professional_tax_applied == 'Y') {
        salaryStructureforhtml1 += `
                  <div class="col-md-4" >
                    <label><strong>Professional Tax State : &nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.professional_tax_state}</span>
                  </div>
                  `;
      }
      salaryStructureforhtml1 += `
                  <div class="col-md-4">
                    <label><strong>LWF Applied :&nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.is_lwf_applied}</span>
                  </div>
                  `;
      if (this.salaryStructure.is_lwf_applied == 'Y') {
        salaryStructureforhtml1 += `
                  <div class="col-md-4" >
                    <label><strong>LWF State : &nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.lwf_state}</span>
                  </div>
                  `;
      } salaryStructureforhtml1 += `
                </div>
              </div>
            </div>

          </div>`;
      this._EmployeemgmtService.getLetterTemplateId(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          let template = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.appointmentLetterForm.patchValue({
            template_html: template[0].templatetext + salaryStructureforhtml1,
            subject: template[0].email_subject,
            body: template[0].email_body,
            header: template[0].header,
            footer: template[0].footer
          })
          if (action == 'ISSUE') {
            this.sendLetterMail();
          }
        }
      })
    }
  }

  cleanValue(value: any): string {
    if (typeof value === 'string') {
      return value.replace(/&nbsp;/g, '').replace(/\n/g, '').trim(); // Removes &nbsp;, newlines, and trims
    }
    return value; // Return as-is if it's not a string
  }

  getAppointmentDetails(action: any = '') {

    let emp_code = this.empDataFromParent.mobile + 'CJHUB' + (this.empDataFromParent.emp_code == '' ? this.empDataFromParent.js_id : this.empDataFromParent.emp_code) + 'CJHUB' + this.empDataFromParent.dob;
    let ecStatusValue = (this.empDataFromParent.emp_code == '' ? 'TEC' : 'EC')
    this._EmployeeService.getAppointeeDetails({
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type), 'empCode': this._EncrypterService.aesEncrypt(emp_code), 'ecStatus': ecStatusValue
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let appointMentDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.stateMaster = appointMentDetails.statesMaster;
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
        let gender = (basic_details.gender.trim().toUpperCase() == 'M' ? 'Male' : basic_details.gender.trim().toUpperCase() == 'F' ? 'Female' : basic_details.gender.trim());

        let salutation = (basic_details.gender.trim().toUpperCase() == 'M' ? 'Mr.' : basic_details.gender.trim().toUpperCase() == 'F' ? 'Ms.' : basic_details.salutation.trim());
        // Added by karan on dated. 10.03.2025
        if (this.token.payout_mode_type == 'self' && this.candidateDetails.joiningStatus == 'JOINED') {
          if (this.token.sso_admin_id != '') {
            this.isJoinigDateEditable = true;
          } else if ((this.candidateDetails?.uan_number != '' && this.candidateDetails?.uan_number != 'Request For UAN') || (this.candidateDetails?.esi_number != ''
            && this.candidateDetails?.esi_number != 'Request For ESIC')) {
            this.isJoinigDateEditable = false;
          }
        }
        if (this.token.payout_mode_type != 'self' && this.candidateDetails.joiningStatus == 'JOINED') {
          this.isJoinigDateEditable = false;
        }
        // end
        this.basic_detail_form.patchValue({
          name_title: (salutation == 'Mr.' || salutation == 'Mrs.' || salutation == 'Ms.') ? salutation : '',
          name: this.cleanValue(basic_details.emp_name),
          dob: this.cleanValue(basic_details.dateofbirth),
          gender: this.cleanValue(gender),
          employee_email: this.cleanValue(basic_details.email),
          employee_personal_email: this.cleanValue(basic_details.personal_email),
          employee_mobile: this.cleanValue(basic_details.mobile),
          emergency_mobile: this.cleanValue(basic_details.emergency_contact),
          blood_relation: this.cleanValue(basic_details.bloodrelationname),
          perm_add: this.cleanValue(basic_details.emp_address),
          res_add: this.cleanValue(basic_details.residential_address),
          relation_name: this.cleanValue(basic_details.fathername),
          post_offered: this.cleanValue(basic_details.post_offered),
          // functional_designation: this.cleanValue(basic_details.functional_designation),
          doj: this.cleanValue(basic_details.dateofjoining),
          orgempcode: this.cleanValue(basic_details.orgempcode == undefined ? '' : basic_details.orgempcode),
          geo_fencing: this.cleanValue(this.candidateDetails?.GeoFenceId),
          jobType: this.cleanValue(this.candidateDetails.jobType),
          jobTypeCategory: this.cleanValue(this.candidateDetails?.jobtype_category),
          live_tracking: this.cleanValue(this.candidateDetails.live_tracking_enable),
          posting_department: this.cleanValue(this.candidateDetails.posting_department),
          reportingManager: this.cleanValue(this.candidateDetails.reporting_manager_name),
          reportingManagerEmpCode: this.cleanValue(this.candidateDetails.reportingmanager_emp_code ? this.candidateDetails.reportingmanager_emp_code : ''),
          designationId: this.candidateDetails.designation_id ? this.candidateDetails.designation_id : '',
          departmentId: this.candidateDetails.department_id ? this.candidateDetails.department_id : '',
          project: this.candidateDetails.project_name,
          projectId: this.candidateDetails.project_id,
          emergency_contact_person: this.candidateDetails.emergency_contact_person,
          blood_group: this.candidateDetails.blood_group,
          pan_no: this.candidateDetails.pan_card,
          probation: this.candidateDetails.probation_confirmation_date,
          vendorname: this.candidateDetails.agencyname,
          contractenddate: this.candidateDetails.contractenddate,
          salarybookedproj: this.candidateDetails.salary_book_project,
          salarybookedprojid: this.candidateDetails.salary_book_project_id
        });

        if (this.candidateDetails.department_id) {
          this.get_att_role_master_list();
        }

        this.bankDetailsForm.patchValue({
          acc_no: basic_details.bank_account_no,
          check_acc_no: basic_details.bank_account_no,
          bank_name: basic_details.bank_name,
          bank_branch: basic_details.bank_branch,
          ifsc: basic_details.ifsccode,
          bank_file_path: basic_details.bankdoc
        })
        // console.log(this.candidateDetails);

        this.appointmentLetterForm.patchValue({
          template: basic_details.apptempalteid,
          template_html: basic_details.appointmentletter
        })
        if (basic_details.apptempalteid) {
          this.getTemplateById(basic_details.apptempalteid, action);
        }
        if (this.candidateDetails.appointment_letter_issued == 'Y') {
          this.pdfProxy('appointment-container');
          //  console.log(this.pdfProxy('appointment-container'));
        }
        this.getMasterJobRole();
        this.getGeoFencingState();
        this.getEmployerOUorGeoFenceDetails('organization_unit');
        this.getEmployerGroFenceDetails('organization_unit_geofence');
        this.getProfileData();
        this.getSalaryStructure();
      } else {
        this.toastr.error(resData.message);
      }

    });
    // this.getSalaryStructure();
  }

  get_att_dept_master_list() {
    let obj = {
      action: 'mst_dept',
      customeraccountid: this.tp_account_id.toString(),
      organization_unitid: '',
      emp_code: '',
      keyword: '',
      fromdate: '',
      todate: '',
      pagesize: 1000,
      index: 0
    }
    this._faceCheckinService.getemployeeList(obj).subscribe((res: any) => {
      if (res.statusCode) {
        this.deptartmentList = JSON.parse(this._EncrypterService.aesDecrypt(res.commonData));
      } else {
        this.deptartmentList = [];
      }
    })

  }
  get_att_role_master_list() {
    this._attndanceService.get_att_master_list({
      "action": 'designation_list_all',
      "customeraccountid": this.tp_account_id,
      "unit_id": '',
      "department_id": this.bf.departmentId.value.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        // console.log(resData.commonData);

        this.designationList = resData.commonData;

        this.get_att_role_master_list_for_functional_designation();
      } else {
        this.designationList = [];
      }
    })

  }
  get_att_role_master_list_for_functional_designation() {
    this._attndanceService.get_att_master_list({
      "action": 'fdesignation_list_all',
      "customeraccountid": this.tp_account_id,
      "unit_id": '',

      // "designation_id": this.bf.designationId.value.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      // console.log(this.candidateDetails.functional_designation);
      if (resData.statusCode) {
        this.fdesignationList = resData.commonData;
        setTimeout(() => {
          const a = Number(this.candidateDetails.functional_designation);
          const matched = this.fdesignationList.find(fd => Number(fd.dsignationid) === a);
          // console.log(matched);
          this.fdesignationListname = matched;
          this.basic_detail_form.patchValue({
            functional_designation: a
          });
        });
      } else {
        this.fdesignationList = [];
      }
    })

  }


  openFile(file_path: any) {
    window.open(file_path, '_blank');
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
        // console.log(this.send_file);

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
        } else if (doc_type == 'certification') {
          this.trainingDetailForm.patchValue({
            certification_doc_file: this.send_file,
            certification_file_name: this.file.name
          })
          // console.log(this.trainingDetailForm.value);

        }
        else {
          this.bankDetailsForm.patchValue({
            bank_doc_file: this.send_file,
            bank_file_name: this.file.name
          })
          // console.log(this.bankDetailsForm.value);

        }
        // this.addNewContactForm.patchValue({
        //   gst_copy_path: this.send_file,
        // });
      };

    } else {
      this.toastr.error('Please choose a file.', 'Oops!');
    }

  }

  getMasterJobRole() {
    this.payOutService.GetMaster({ actionType: 'MasterJobTypes', productTypeId: this.product_type }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.masterJobType = (resData.commonData);
      }
    })
  }

  getEmployerOUorGeoFenceDetails(action: any) {
    this._EmployeeService.getEmployerOUorGeoFenceDetails({
      'customerAccountId': this.tp_account_id.toString(),
      'action': action, 'orgUnitIds': ''
    }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        this.employerOUorGeoFenceData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

        let ouids = [];

        this.employerOUorGeoFenceData.forEach((element: any) => {
          this.candidateDetails.assigned_ou_ids.split(',').forEach((ouid: any) => {
            if (ouid == element.org_unit_id)
              ouids.push({ 'org_unit_id': element.org_unit_id, 'org_unit_name': element.org_unit_name });
          });
        })

        this.basic_detail_form.patchValue({
          orgIds: ouids
        })

        if (ouids.length > 0)
          this.onItemSelect('');
      } else {
        this.employerOUorGeoFenceData = [];
      }
    })
  }

  getEmployerGroFenceDetails(action: any) {
    this._EmployeeService.getEmployerOUorGeoFenceDetails({
      'customerAccountId': this.tp_account_id.toString(),
      'action': action, 'orgUnitIds': ''
    }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        this.employerGeoFenceData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

        let geoids = [];
        this.employerGeoFenceData.forEach((element: any) => {
          this.candidateDetails.assigned_geofence_ids.split(',').forEach((geoid: any) => {
            if (geoid == element.geo_id)
              geoids.push({ 'geo_id': element.geo_id, 'org_unit_name': element.org_unit_name });
          })
        });

        this.basic_detail_form.patchValue({
          geoFenceIds: geoids
        })
      } else {
        this.employerGeoFenceData = [];
      }
    })
  }

  onItemSelect(item: any) {
    this.orgGroup = this.selectedval.map(val => val.org_unit_id);
  }

  onSelectAll(item: any) {
    this.orgGroup = item.map(val => val.org_unit_id);

  }
  onUnselectAll(item: any) {
    this.orgGroup = item.map(val => val.org_unit_id);
  }
  onItemUnselect(item: any) {
    this.orgGroup = this.selectedval.map(val => val.org_unit_id);
  }

  openBasicDetails() {
    this.isBasicDetails = true;
    setTimeout(() => {

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
      $('#probation').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      })
      $('#contractenddate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      })
    }, 0)

    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.add('modal-open');
    }
  }
  hideBasicDetails() {
    this.isBasicDetails = false;
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.remove('modal-open');
    }
    this.basic_detail_form.reset();
    this.getAppointmentDetails();
  }

  hideUnitSalary() {
    this.isUnitParameterSalary = false;
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.remove('modal-open');
    }
    this.salaryStructure = '';
    this.salaryStructureView = '';
    this.getAppointmentDetails();
  }

  getGeoFencingState() {
    this._EmployeeService.getGeoFencing({
      'customerAccountId': this.tp_account_id.toString(),
      action: 'GetAllGeoFencingForCustomer'
    }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        this.geoFencingData = (resData.commonData);
      }
    })
  }

  openBankDetails() {
    this.isBankInfo = true;
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.add('modal-open');
    }
  }

  hideBankModal() {
    this.isBankInfo = false;
    this.bankDetailsForm.reset();
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.remove('modal-open');
    }
    this.getAppointmentDetails();
  }

  calculateExperience() {

    const fromDate = this.workExperienceForm.get('from_date')?.value;
    const toDate = this.workExperienceForm.get('to_date')?.value;

    if (fromDate && toDate) {
      const from = new Date(this.formatDate(fromDate)); // Convert string to Date
      const to = new Date(this.formatDate(toDate)); // Convert string to Date

      if (from < to) {
        this.invalidDate = false;
        const yearsDiff = this.calculateYearsDifference(from, to);
        this.workExperienceForm.get('total_experience')?.setValue(yearsDiff.toFixed(1)); // Update total experience
      } else {
        this.invalidDate = true;
        this.workExperienceForm.get('total_experience')?.setValue(''); // Reset if dates are invalid
      }
    }
  }

  formatDate(dateStr: string): string {
    const parts = dateStr.split('-');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is zero-indexed
    const year = parseInt(parts[2], 10) + 2000; // Handle two-digit year
    return new Date(year, month, day).toISOString().substring(0, 10); // Return 'yyyy-mm-dd'
  }

  // Helper function to calculate the difference in years between two dates
  calculateYearsDifference(from: Date, to: Date): number {
    const diffInMilliseconds = to.getTime() - from.getTime();
    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);
    return diffInDays / 365.25; // Account for leap years
  }

  scrollToFirstError() {
    const firstInvalidControl = this.formElement.nativeElement.querySelector(
      '.is-invalid'
    );
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // this.renderer.setStyle(firstInvalidControl, 'border', '2px solid red');
    }
  }

  update_basic_details(): any {

    this.submitted = true;
    this.basic_detail_form.patchValue({
      dob: $('#dob').val(),
      doj: $('#doj').val(),
      probation: $('#probation').val(),
      contractenddate: $('#contractenddate').val(),
    })
    // this.submitted = true;

    if (this.basic_detail_form.invalid) {
      this.scrollToFirstError();
      return;
    }

    if (this.bf.employee_email.errors && this.bf.employee_email.errors.pattern) {
      return this.toastr.error("Invalid email!", 'Oops');
    }

    if (this.bf.employee_personal_email.errors && this.bf.employee_personal_email.errors.pattern) {
      return this.toastr.error("Invalid email!", 'Oops');
    }
    if (this.bf.pan_no.invalid) {
      if (this.bf.pan_no.errors?.pattern) {
        this.toastr.error("Invalid PAN No", "Oops");
      }
    }
    // if(this.bf.name.errors && this.bf.name.errors.pattern){
    //   return this.toastr.error("Invalid email!",'Oops');
    // }
    if (this.bf.name.errors && this.bf.name.errors.pattern) {
      return this.toastr.error("Invalid Name!", 'Oops');
    }

    if (this.bf.dob.value == '') {
      return this.toastr.error("Please select date of birth.", 'Oops');
    }

    if (this.bf.doj.value == '') {
      return this.toastr.error("Please select date of joining.", 'Oops');
    }
    if (this.bf.jobType.value == '') {
      return this.toastr.error("Please enter job type.", 'Oops');
    }
    if (this.bf.posting_department.value == '') {
      return this.toastr.error("Please select department.", 'Oops');
    }
    if (this.bf.post_offered.value == '') {
      return this.toastr.error("Please select designation.", 'Oops');
    }

    // console.log(this.bf.geoFenceIds.value, this.bf.live_tracking.value);
    if (this.bf.geoFenceIds.value && this.bf.geoFenceIds.value.length > 0 && this.bf.live_tracking.value && this.bf.live_tracking.value == 'Y') {
      this.toastr.error('Please select either Geo Fence or Live Tracking, not both.', 'Oops');
      return;
    }


    if (this.bf.project.value && !this.bf.projectId.value) {
      let projectid = this.projectList.filter(project => project.project_name == this.bf.project.value)[0];
      if (!projectid) {
        this.basic_detail_form.patchValue({
          project: '',
          projectId: ''
        })
      } else {
        this.basic_detail_form.patchValue({
          projectId: projectid['id']
        })
      }
    }

    // if (this.basic_detail_form.invalid) {
    //   return this.toastr.error("Please fill the required fields", 'Oops');
    // }
    let postData = {
      ...this.basic_detail_form.value,
      updatedBy: this.token.userid,
      productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
      empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
      customerAccountId: this._EncrypterService.aesEncrypt(this.tp_account_id.toString())
    }
    this._EmployeeService.updateTpBasicDetails(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        // Activity Log
        this.activityLogsService?.insertActivityLog(this.token, 'Edit Employee Details', this.router?.url)

        this.hideBasicDetails();

        // this.editData = false;
        // this.getEmployeeDetail();
      } else {
        this.toastr.error(resData.message);
      }

    });
    if (this.basic_detail_form.get('pan_no')?.value != '') {
      const postData1 = {
        aadhar_no: '',
        aadhar_doc: '',
        aadhar_doc_file: '',
        aadhar_file_path: '',
        pan_no: this.basic_detail_form.get('pan_no')?.value,
        pan_doc: '',
        pan_doc_file: '',
        pan_file_path: '',
        aadhar_file_name: '',
        pan_file_name: '',
        updatedBy: Number(this.token.id),
        productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
        doc_type: 'pan',
        empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
        customerAccountId: this._EncrypterService.aesEncrypt(this.tp_account_id.toString())
      };
      // let postData1 = {
      //   pan_no: this.basic_detail_form.get('pan_no').value,
      //   updatedBy: this.token.userid,
      //   productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
      //   doc_type: 'pan',
      //   empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
      //   customerAccountId: this._EncrypterService.aesEncrypt(this.tp_account_id.toString())
      // }
      this._EmployeeService.updateTpKycDetails(postData1).subscribe((resData: any) => {
        if (resData.statusCode) {
          //console.log('sdfdfsdfsdf');

        }
        else {
          this.toastr.error(resData.message);
        }
      })
    }
  }

  updateBankDetails(): any {

    this.submitted = true;
    if (this.bdf['acc_no'].value != this.bdf['check_acc_no'].value) {
      return this.toastr.error("Confirm Bank Account no does not match the Account no", "Oops");
    }
    if (this.bankDetailsForm.invalid) {
      return this.toastr.error("Please fill the required fields!", "Oops");
    }

    if ((this.bdf.bank_doc_file.value && !this.bdf.bank_file_path.value)) {
      this._EmployeeService.file_upload({ 'data': this.bdf['bank_doc_file'].value, 'name': this.bdf['bank_file_name'].value }).subscribe((resData: any) => {
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
            empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
            js_id: this._EncrypterService.aesEncrypt(this.candidateDetails.js_id.toString()),
            customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
          }

          this._EmployeeService.updateTpBankDetails(postData).subscribe((resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message);
              this.hideBankModal();
              this.getAppointmentDetails();
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
        empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
        js_id: this._EncrypterService.aesEncrypt(this.candidateDetails.js_id.toString()),
        customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
      }

      this._EmployeeService.updateTpBankDetails(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message);
          this.bankDetailsForm.reset();
          this.hideBankModal();
          this.getAppointmentDetails();
        } else {
          this.toastr.error(resData.message);
        }
      })

    }
  }

  get kf() {
    return this.kycForm.controls;
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
          "appointmentId": this.candidateDetails.emp_id,
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
                  empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
                  customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
                }
                this._EmployeeService.updateTpKycDetails(postData1).subscribe((resData: any) => {
                  if (resData.statusCode) {
                    this.toastr.success(resData.message);

                    this.kycForm.reset(kycform);

                    this.edit_kyc_details = false;
                    resolve('Data updated successfully');
                    // this.editData=false;
                    this.getAppointmentDetails();
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
                empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
                customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
              }

              this._EmployeeService.updateTpKycDetails(postData).subscribe((resData: any) => {
                if (resData.statusCode) {
                  this.toastr.success(resData.message);

                  this.kycForm.reset(kycform);

                  this.edit_kyc_details = false;
                  resolve('Data updated successfully');
                  // this.editData=false;
                  this.getAppointmentDetails();
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
          "appointmentId": this.candidateDetails.emp_id,
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
                  empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
                  customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
                }
                this._EmployeeService.updateTpKycDetails(postData).subscribe((resData: any) => {
                  if (resData.statusCode) {
                    this.toastr.success(resData.message);
                    this.kycForm.reset(kycform);
                    resolve('Data updated successfully');
                    this.edit_kyc_details = false;
                    // this.editData=false;
                    this.getAppointmentDetails();
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
                empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
                customerAccountId: this._EncrypterService.aesEncrypt(JSON.stringify(this.tp_account_id))
              }
              this._EmployeeService.updateTpKycDetails(postData).subscribe((resData: any) => {
                if (resData.statusCode) {
                  this.toastr.success(resData.message);
                  this.kycForm.reset(kycform);
                  resolve('Data updated successfully');
                  this.edit_kyc_details = false;
                  // this.editData=false;
                  this.getAppointmentDetails();
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

  hideKycModal() {
    this.edit_kyc_details = false;
    this.kycForm.reset();
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

  editkycdetails(): any {
    if (this.token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    if (this.empDataFromParent.basicdetailsupdated_status != 'Y') {
      return this.toastr.error("Please updated basic details first!", "Oops")
    }
    this.edit_kyc_details = true;
  }

  showEducationModal(edu: any = '') {
    this.isEducationDetails = true;
    if (edu) {
      this.educationDetailForm.patchValue({
        id: edu.id,
        course: edu.course,
        specialization: edu.specialization,
        state: edu.state,
        university_college: edu.university_college,
        course_type: edu.course_type,
        passing_year: edu.passing_year,
        percentage_cgpa: edu.percentage_cgpa,
        country: edu.country
      })
    }
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.add('modal-open');
    }
  }
  showExperienceModal(exp: any = '') {
    this.isWorkExperience = true;
    if (exp) {
      this.workExperienceForm.patchValue({
        company_name: exp.company_name,
        job_title: exp.job_title,
        from_date: exp.from_date,
        to_date: exp.to_date,
        // from_date: exp.from_date.split("-").reverse().join("-"),
        // to_date: exp.to_date.split("-").reverse().join("-"),
        description: exp.job_description,
        skills: exp.skills,
        total_experience: exp.total_experience,
        last_take_home_drawn: exp.last_take_home_drawn,
        leaving_reason: exp.leaving_reason,
        id: exp.id
      })
    }
    setTimeout(() => {
      $('#expFrom').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        onSelect: (selectedDate: string) => {
          this.workExperienceForm.get('from_date')?.setValue(selectedDate); // Update form control
          this.calculateExperience();
        }
      });

      $('#expTo').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        onSelect: (selectedDate: string) => {
          this.workExperienceForm.get('to_date')?.setValue(selectedDate); // Update form control
          this.calculateExperience();
        }
      });
    }, 0);
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.add('modal-open');
    }
  }
  showTrainingModal(training: any = '') {
    this.isTrainingDetail = true;
    if (training) {
      // console.log(training);

      this.trainingDetailForm.patchValue({
        training: training.training_name,
        completionDate: training.completion_date.split("-").reverse().join("-"),
        // certification: training.certification,
        institute: training.institute,
        grade: training.grade_or_marks,
        id: training.id,
        certification_file_path: training.certification_path,
        certification_file_name: training.certification
      })
    }
    setTimeout(() => {
      $('#doc').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      })
    }, 0)
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.add('modal-open');
    }
  }

  hideTrainingModal() {
    this.isTrainingDetail = false;
    this.trainingDetailForm.reset();
    const fileInput = document.getElementById('e_bankdoc1') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.remove('modal-open');
    }
  }
  hideEducationModal() {
    this.isEducationDetails = false;
    this.educationDetailForm.reset();
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.remove('modal-open');
    }
  }

  hideWorkExperience() {
    this.isWorkExperience = false;
    this.workExperienceForm.reset();
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.remove('modal-open');
    }
  }

  showFamilyDetail(family: any = '') {
    this.isFamilyDetail = true;
    if (family) {
      this.familyDetailForm.patchValue({
        name: family.name,
        address: family.address,
        relationName: family.relation,
        dob: family.date_of_birth ? family.date_of_birth.split("-").reverse().join("-") : null,
        aadharno: family.identification_no,
        id: family.id
      })
    }
    setTimeout(() => {
      $('#familydob').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        maxDate: new Date(),
        yearRange: "-100:+0"
      })
    }, 0)
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.add('modal-open');
    }
  }

  hideFamilyDetail() {
    this.isFamilyDetail = false;
    this.familyDetailForm.reset();
    let ele = document.querySelector('body');
    if (ele) {
      ele.classList.remove('modal-open');
    }
  }

  updateEducationDetail(action: any = '', edu: any = ''): any {
    let actionType, formData;
    if (!action) {
      if (!this.educationDetailForm.value.id) {
        actionType = 'insert';
      } else {
        actionType = 'update';
      }

      if (this.educationDetailForm.get('state').hasError('pattern') && this.educationDetailForm.get('state').touched) {
        return this.toastr.error("State cannot contain only spaces.")
      }
      if (this.educationDetailForm.get('state').hasError('required') && this.educationDetailForm.get('state').touched) {
        return this.toastr.error("State is required.")
      }
      if (this.educationDetailForm.get('university_college').hasError('pattern') && this.educationDetailForm.get('university_college').touched) {
        return this.toastr.error("University/College cannot contain only spaces.")
      }
      if (this.educationDetailForm.get('passing_year').hasError('pattern') && this.educationDetailForm.get('passing_year').touched) {
        return this.toastr.error("Enter a valid year (e.g., 1999).")
      }

      formData = this.educationDetailForm.value;
    } else {
      actionType = action;
      formData = edu;
      if (!confirm("Are you sure you want to delete this record?")) {
        return;
      }
    }

    let postData = {
      action: actionType,
      emp_code: this.candidateDetails.emp_code,
      customeraccountid: this.tp_account_id,
      ...formData
    }
    this._EmployeemgmtService.educationDetails(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.getProfileData();
        this.hideEducationModal();
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  updateExperienceDetail(action: any = '', exp: any = ''): any {
    let actionType, formData;

    if (action == '') {
      if ($('#expFrom').val() == '') {
        return this.toastr.error("Please select from date");
      }
      if ($('#expTo').val() == '') {
        return this.toastr.error("Please select to date");
      }

      this.workExperienceForm.patchValue({
        from_date: $('#expFrom').val(),
        to_date: $('#expTo').val(),
        // from_date: $('#expFrom').val().split("-").reverse().join("-"),
        // to_date: $('#expTo').val().split("-").reverse().join("-"),
      })

      if (!this.workExperienceForm.value.company_name) {
        return this.toastr.error("Please enter company name.");
      }
    }
    if (!action) {
      if (!this.workExperienceForm.value.id) {
        actionType = 'insert';
      } else {
        actionType = 'update';
      }
      formData = this.workExperienceForm.value
    } else {
      actionType = action;
      formData = exp;
      if (!confirm("Are you sure you want to delete this record?")) {
        return;
      }
    }
    let postData = {
      action: actionType,
      emp_code: this.candidateDetails.emp_code,
      customeraccountid: this.tp_account_id,
      ...formData
    }
    this._EmployeemgmtService.workExperience(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.getProfileData();
        this.hideWorkExperience();
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  updateTrainingDetail(action: any = '', training: any = ''): any {
    let actionType = '';
    let completionDate = '';

    if (action === '') {
      const completionVal = $('#doc').val();
      if (!completionVal) {
        return this.toastr.error("Please select completion date");
      }

      completionDate = completionVal.split("-").reverse().join("-");
      if (!this.trainingDetailForm.value.training) {
        return this.toastr.error("Please enter training name.");
      }
    }

    actionType = this.trainingDetailForm.value.id ? 'update' : 'insert';

    const fileData = this.train['certification_doc_file'].value;
    const fileName = this.train['certification_file_name'].value;
    const hasNewFile = !!fileData && !!fileName;

    // 📦 Prepare payload after optional upload
    const submitForm = () => {
      // Always patch completionDate
      this.trainingDetailForm.patchValue({
        completionDate: completionDate
      });

      const formValue = this.trainingDetailForm.value;

      const postData = {
        action: actionType,
        emp_code: this.candidateDetails.emp_code,
        customeraccountid: this.tp_account_id,
        ...formValue
      };

      // console.log("🚀 Final Payload:", postData);
      // return;
      this._EmployeemgmtService.trainingDetails(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message);
          this.getProfileData();
          this.hideTrainingModal();
        } else {
          this.toastr.error(resData.message);
        }
      });
    };

    if (hasNewFile) {
      // 👇 Upload only if user selected a file
      this._EmployeeService.file_upload({
        data: fileData,
        name: fileName
      }).subscribe((resData: any) => {
        if (resData.status) {
          this.toastr.success(resData.msg);

          // Only now patch the new file info
          this.trainingDetailForm.patchValue({
            certification_file_path: resData.file_path,
            certification_file_name: resData.file_name
          });

          submitForm(); // now call the actual update
        } else {
          this.toastr.error("File upload failed.");
        }
      });
    } else {
      // ✅ No file selected, keep the old path untouched
      submitForm();
    }
  }





  updateFamilyDetails(action: any = '', family: any = ''): any {
    let actionType, formData;
    if (action == '') {
      if ($('#familydob').val() != '') {
        this.familyDetailForm.patchValue({
          dob: $('#familydob').val().split('-').reverse().join('-')
        })
      }
      if (this.familyDetailForm.invalid) {
        return this.toastr.error('Please enter family member name.');
      }
    }
    if (!action) {
      if (!this.familyDetailForm.value.id) {
        actionType = 'insert';
      } else {
        actionType = 'update';
      }
      formData = this.familyDetailForm.value;
    } else {
      if (!confirm("Are you sure you want to delete this record?")) {
        return;
      }
      actionType = action;
      formData = family;
    }
    let postData = {
      action: actionType,
      emp_code: this.candidateDetails.emp_code,
      customeraccountid: this.tp_account_id,
      ...formData
    }
    this._EmployeemgmtService.familyDetails(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.getProfileData();
        this.hideFamilyDetail();
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  getProfileData() {
    this._faceCheckinService.getemployeeList({
      "action": "empl_details",
      "customeraccountid": this.tp_account_id,
      "emp_code": this.candidateDetails.emp_code,
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let decryptedRecord = (JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData)))[0];
        this.educationDetailData = decryptedRecord.academic_records ? decryptedRecord.academic_records : [];
        this.experiencedata = decryptedRecord.work_experience ? decryptedRecord.work_experience : [];
        this.trainingData = decryptedRecord.training_details ? decryptedRecord.training_details : [];
        this.familyData = decryptedRecord.family_details ? decryptedRecord.family_details : [];
        // console.log(this.trainingData);

      }
    })
  }

  getPermAdd(isChecked: boolean) {
    if (isChecked) {
      this.basic_detail_form.patchValue({
        perm_add: this.basic_detail_form.value.res_add
      })
    }
  }

  getSetupSalaryModal() {
    this.isUnitParameterSalary = true;
    let body = document.querySelector('body');
    body.classList.add('modal-open');
    this.getMasterData('', '', 'master_unit_list');
  }

  getMasterData(ouid: any = '', deptid: any = '', action: string = '') {
    // this.deptList=[];
    // this.desgList=[];
    this.aop = '';
    this._attndanceService.get_att_master_list({
      "action": action,
      "customeraccountid": this.tp_account_id,
      "unit_id": ouid,
      "department_id": deptid,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (action == 'master_unit_list') {
          this.organzationUnitList = (resData.commonData);
        }
        else if (action == 'master_department_list') {
          this.ouid = ouid;
          this.desgList = [];
          this.aop = '';
          let orgData = resData.commonData
          this.deptList = orgData;

          // this.orgData =orgData;

        } else if (action == 'master_role_list') {
          this.desgList = [];
          let orgData = resData.commonData
          this.desgList = orgData
          this.aop = '';
        }

      } else {
        this.toastr.error(resData.message);
        // this.organzationUnitList = [];
        if (action == 'master_department_list') {
          this.desgList = [];
          this.deptList = [];
          this.aop = '';
        } else if (action == 'master_role_list') {
          this.desgList = [];
          this.aop = '';
        }
        // this.deptList=[];
      }
    })
  }

  routeToUnit() {
    if (this.ouid == '') {
      return;
    }
    const body = document.querySelector('body');
    body.classList.remove('modal-open');
    this.router.navigate(['business-settings/unit-parameter-settings', this._EncrypterService.aesEncrypt(this.ouid.toString())])
  }

  getAop(desgid: any) {
    this.aop = ''
    this.aop = this.desgList.filter(desg => desg.dsignationid == desgid)[0].target_offered_salary;
    let desgData = this.desgList.filter(desg => desg.dsignationid == desgid)[0];
    let postData = {
      action: 'GetUnitSalaryStructure',
      "customeraccountid": this.tp_account_id.toString(),
      "organization_unitid": desgData.org_unit_id,
      "departmentid": desgData.departmentid,
      "designationid": desgid,
      "appointment_id": "-9999"
    }

    this._EmployeeService.get_unitSalaryStructure_data(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.salaryStructure = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData))[0];

        this.salaryStructure['ctcAnnual'] = Math.round(this.salaryStructure['ctc'] * 12);
        this.salaryStructure['inHandAnnual'] = Math.round(this.salaryStructure['salaryinhand'] * 12);
        this.salaryStructure['grossAnnual'] = Math.round(this.salaryStructure['gross'] * 12);
        this.salaryStructure['total'] = (parseFloat(this.salaryStructure.gross) + parseFloat(this.salaryStructure.bonus || '0') + parseFloat(this.salaryStructure.employerepfrate || '0') + parseFloat(this.salaryStructure.employeresirate || '0') + parseFloat(this.salaryStructure.employerlwf || '0') + parseFloat(this.salaryStructure.employergratuity || '0'));

        this.salaryStructure['totalAnnual'] = Math.round(this.salaryStructure['total'] * 12)
        this.salaryStructure['total'] = Math.round(this.salaryStructure['total'])

        if (this.salaryStructure && typeof this.salaryStructure === 'object') {
          this.salaryStructureView = { ...this.salaryStructure };
          for (const key in this.salaryStructure) {

            if (typeof Math.round(this.salaryStructure[key]) === 'number' && this.salaryStructure[key] != null && !Number.isNaN(Math.round(this.salaryStructure[key]))) {

              this.salaryStructureView[key] = Math.round(this.salaryStructure[key]);
            }
          }
        }

        this.salaryStructureView['OtherDeductions'] = [
          {
            'deduction_name': this.getEarningLabel('Salary Bonus'),
            'deduction_amount': this.salaryStructure.salarybonus
          },
          {
            'deduction_name': this.getEarningLabel('Commission'),
            'deduction_amount': this.salaryStructure.commission
          },
          {
            'deduction_name': this.getEarningLabel('Transport Allowance'),
            'deduction_amount': this.salaryStructure.transport_allowance
          },
          {
            'deduction_name': this.getEarningLabel('Travelling Allowance'),
            'deduction_amount': this.salaryStructure.travelling_allowance
          },
          {
            'deduction_name': this.getEarningLabel('Leave Encashment'),
            'deduction_amount': this.salaryStructure.leave_encashment
          },
          {
            'deduction_name': this.getEarningLabel('Gratuity In Hand'),
            'deduction_amount': this.salaryStructure.gratuityinhand
          },
          {
            'deduction_name': this.getEarningLabel('Overtime Allowance'),
            'deduction_amount': this.salaryStructure.overtime_allowance
          },
          {
            'deduction_name': this.getEarningLabel('Notice Pay'),
            'deduction_amount': this.salaryStructure.notice_pay
          },
          {
            'deduction_name': this.getEarningLabel('Hold Salary (Non Taxable)'),
            'deduction_amount': this.salaryStructure.hold_salary_non_taxable
          },
          {
            'deduction_name': this.getEarningLabel('Children Education Allowance'),
            'deduction_amount': this.salaryStructure.children_education_allowance
          },
        ]
        //console.log(this.salaryStructureView);

      } else {
        this.salaryStructure = '';
        this.salaryStructureView = '';
      }
    })
  }

  saveCustomSal(): any {

    if (this.empDataFromParent.basicdetailsupdated_status != 'Y' ||
      ((!(this.empDataFromParent.aadharverfication_status == 'Y' || this.empDataFromParent.pan_verification_status == 'Y')
        || this.empDataFromParent.accountverification_status != 'Y') && this.token.payout_mode_type != 'self')) {
      return this.toastr.error(`Please complete the Basic information ${this.token.payout_mode_type != 'self' ? ', KYC & Bank details first!' : '!'}`, "Oops")
    } else if (this.empDataFromParent.basicdetailsupdated_status != 'Y' && this.token.payout_mode_type == 'self') {
      return this.toastr.error("Please complete the Basic information first!", "Oops")
    }

    // console.log(this.salaryStructure);

    let postData = {
      ...this.salaryStructure,
      'personalinfoid': this.candidateDetails.emp_id,
      'salarycategoryname': this.salaryStructure.employerepfrate == 0 ? 'PNF' : 'PF',
      'epf_employer': this.salaryStructure.employerepfrate,
      'epf_employee': this.salaryStructure.employeeepfrate,
      'esi_employer': this.salaryStructure.employeresirate,
      'esi_employee': this.salaryStructure.employeeesirate,
      'salary_in_hand': this.salaryStructure.salaryinhand,
      'esiexceptionalcase': this.salaryStructure.isesiexceptionalcase,
      'tp_leave_template_txt': null,
      'dateOfJoining': this.candidateDetails.dateofjoining,
      'jobRole': this.candidateDetails.post_offered,
      "location_type": this.salaryStructure.locationtype,
      "salarydaysopted": this.salaryStructure.salaryindaysopted,
      'operation': "Generate",
      'minwagescategoryid': this.salaryStructure.salminwagesctgid,
      'minwagescategoryname': this.salaryStructure.minwagesctgname,
      'minimumwagessalary': this.salaryStructure.minimumwagesalary,
      'effectivedate': this.salaryStructure.effectivefrom.split('-').reverse().join('/'),
      'status': 1,
      'msg': "Salary calculated successfully.",
      'minwagestatename': this.salaryStructure.minwagesstate,
      'pfSumAmt': this.salaryStructure.basic,
      'edli_adminchargesincludeinctc': this.pf_details.edli_adminchargesincludeinctc
    }


    this._EmployeeService.saveCustomSalaryStructure(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.hideUnitSalary();

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

        this.router.navigate(['/employees/view-employee-detail', this.candidateDetails.encrypted_empid])
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  previewLetter() {
    const encryptedParams = encodeURIComponent(this._EncrypterService.aesEncrypt('filled,' + this.empDataFromParent.emp_id + ',' + this.appointmentLetterForm.value.template + ',' + this.appointmentLetterForm.value.template));
    const url = `${window.location.origin}/employee-mgmt/preview-pdf/${encryptedParams}`;
    window.open(url, '_blank');
  }
  previewLetterwithannexure() {
    const encryptedParams = encodeURIComponent(this._EncrypterService.aesEncrypt('filledwithannexure,' + this.empDataFromParent.emp_id + ',' + this.appointmentLetterForm.value.template + ',' + this.appointmentLetterForm.value.template));
    const url = `${window.location.origin}/employee-mgmt/preview-pdf/${encryptedParams}`;
    window.open(url, '_blank');
  }

  manageCandidateAppointmentLetter(actionType: string): any {

    if (!this.appointmentLetterForm.value.template) {
      return this.toastr.error('Please select the appointmentLetter template');
    }

    if (!this.candidateDetails.email && actionType == 'ISSUE') {
      return this.toastr.error(`Please update the employee's emailid. `);
    }
    //console.log(this.salaryStructure);
    const salaryStructureforhtml = `<style>.table {
    width: 100% !important;
    max-width: 100% !important;;
    margin-bottom: 20px !important;
    padding:10px !important;
}.page-break {
        page-break-before: always;
    }</style>
        ${'\u00A0'.repeat(500)}
           <div style="page-break-after: always;"></div>
            <div style="page-break"></div>
       <center><b>ANNEXURE-A</b></center>${'\u00A0'.repeat(500)}
<div class="table-responsive" *ngIf="salaryStructure != ''">
    <table class="table" style="width: 100%;margin-bottom:20px;">
        <thead>
            <tr>
                <th>Salary Bucket</th>
                <th>Monthly</th>
                <th>Annually</th>
            </tr>
        </thead>
        <tbody id="roundedValues">

            <tr class="danger1">
                <th colspan="3">1. GROSS SALARY</th>
            </tr>
            <tr class="danger1">
                <td scope="col">Basic</td>
                <td>${this.salaryStructure.basic}</td>
                <td>${this.salaryStructure.basic * 12}</td>
            </tr>
            <tr class="danger1">
                <td scope="col">HRA</td>
                <td>${this.salaryStructure.hra}</td>
                <td>${this.salaryStructure.hra * 12}</td>
            </tr>


            ${this.salaryStructure.allowances && this.salaryStructure.allowances != '0' ? `
            <tr class="danger1">
                <td scope="col">Special Allowance</td>
                <td>${this.salaryStructure.allowances}</td>
                <td>${this.salaryStructure.allowances * 12}</td>
            </tr>` : ''}

            ${this.salaryStructure.conveyance_allowance && this.salaryStructure.conveyance_allowance != '0' ? `
            <tr class="danger1">
                <td scope="col">Conveyance Allowance</td>
                <td>${this.salaryStructure.conveyance_allowance}</td>
                <td>${this.salaryStructure.conveyance_allowance * 12}</td>
            </tr>` : ''}

            <tr class="danger3">
                <td>Salary Bucket Total</td>
                <td>${this.salaryStructure.ctc}</td>
                <td>${this.salaryStructure.ctcAnnual}</td>
            </tr>
            <tr class="danger3">
                <td>Salary In Hand</td>
                <td>${this.salaryStructure.salaryinhand}</td>
                <td>${this.salaryStructure.inHandAnnual}</td>
            </tr>
        </tbody>
    </table>
    <div class="row">
        <div class="col-md-12">
            <div class="d-flex justify-content-between align-items-center">
                <div class="col-md-4">
                    <label><strong>Effective Date : &nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.effectivefrom ? this.salaryStructure.effectivefrom.substring(0, 10) : ''}</span>
                </div>
                <div class="col-md-4">
                    <label><strong>Professional Tax Applied : &nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.is_professional_tax_applied}</span>
                </div>
                <div class="col-md-4">
                    <label><strong>LWF Applied :&nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.is_lwf_applied}</span>
                </div>
            </div>
        </div>
    </div>
</div>`;
    let postData = {
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empId: this.empDataFromParent.emp_id,
      appointmentLetterId: this.appointmentLetterForm.value.template,
      appointmentLetterHTML: this.appointmentLetterForm.value.template_html + salaryStructureforhtml,
      action: actionType
    }
    this._EmployeemgmtService.manageCandidateAppointmentLetter(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (actionType == 'ISSUE') {
          this.getAppointmentDetails('ISSUE');
        } else {
          this.getAppointmentDetails();
        }
        return this.toastr.success(resData.message);
      } else {
        return this.toastr.error(resData.message);
      }
    })
  }
  manageCandidateAppointmentLetterwithannexure(actionType: string): any {

    if (!this.appointmentLetterForm.value.template) {
      return this.toastr.error('Please select the appointmentLetter template');
    }

    if (!this.candidateDetails.email && actionType == 'ISSUE') {
      return this.toastr.error(`Please update the employee's emailid. `);
    }

    let postData = {
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empId: this.empDataFromParent.emp_id,
      appointmentLetterId: this.appointmentLetterForm.value.template,
      appointmentLetterHTML: this.appointmentLetterForm.value.template_html,
      action: actionType,
      issuetype: 'ISSUEWITHANNEXURE'
    }


    this._EmployeemgmtService.manageCandidateAppointmentLetter(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (actionType == 'ISSUE') {
          this.getAppointmentDetails('ISSUE');
        } else {
          this.getAppointmentDetails();
        }
        return this.toastr.success(resData.message);
      } else {
        return this.toastr.error(resData.message);
      }
    })
  }






  // pdfProxy(id: any) {
  //   let url = '';
  //   if (id == 'pdf-container') {
  //     url = this.candidateDetails.offer_letter_url;
  //   } else {
  //     url = this.candidateDetails.appointment_letter_url;
  //   }

  //   if (url) {
  //     this.http.post(`${environment.tankhapay_api}employee/pdfProxy`, { 'pdf': url }, { responseType: 'blob' })
  //       .subscribe((response: Blob) => {
  //         const parent = document.getElementById(id);
  //         while (parent.firstChild) {
  //           parent.removeChild(parent.firstChild);
  //         }

  //         const reader = new FileReader();
  //         reader.onloadend = async () => {
  //           const pdfDoc = await PDFDocument.load(reader.result as ArrayBuffer);
  //           const pages = pdfDoc.getPages();
  //           const firstPage = pages[0];

  //           const secondPage = pdfDoc.addPage([firstPage.getWidth(), firstPage.getHeight()]);
  //           const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  //           const pageWidth = secondPage.getWidth();
  //           const margin = 50;
  //           const tableWidth = pageWidth - 2 * margin;
  //           const colWidth1 = tableWidth * 0.4;
  //           const colWidth2 = tableWidth * 0.3;
  //           const colWidth3 = tableWidth * 0.3;

  //           let yPosition = 750;

  //           // Title
  //           secondPage.drawText('ANNEXURE-A', {
  //             x: margin + tableWidth / 3,
  //             y: yPosition,
  //             size: 14,
  //             font: font,
  //             color: rgb(0, 0, 0),
  //           });

  //           yPosition -= 20;

  //           // Table Header (Light Gray)
  //           secondPage.drawRectangle({
  //             x: margin,
  //             y: yPosition,
  //             width: tableWidth,
  //             height: 20,
  //             borderWidth: 1,
  //             borderColor: rgb(0, 0, 0),
  //             color: rgb(0.9, 0.9, 0.9), // Light Gray
  //           });

  //           secondPage.drawText('Salary Bucket', { x: margin + 10, y: yPosition + 5, size: 10, font: font });
  //           secondPage.drawText('Monthly', { x: margin + colWidth1 + 10, y: yPosition + 5, size: 10, font: font });
  //           secondPage.drawText('Annually', { x: margin + colWidth1 + colWidth2 + 10, y: yPosition + 5, size: 10, font: font });

  //           yPosition -= 20;

  //           // Gross Salary Header (Dark Gray)
  //           secondPage.drawRectangle({
  //             x: margin,
  //             y: yPosition,
  //             width: tableWidth,
  //             height: 20,
  //             borderWidth: 1,
  //             borderColor: rgb(0, 0, 0),
  //             color: rgb(0.8, 0.8, 0.8), // Dark Gray
  //           });

  //           secondPage.drawText('1. GROSS SALARY', { x: margin + 10, y: yPosition + 5, size: 10, font: font });

  //           yPosition -= 20;

  //           // Function to draw table rows with alternating colors
  //           const drawRow = (desc: string, monthly: string, annually: string, isHighlight = false) => {
  //             secondPage.drawRectangle({
  //               x: margin,
  //               y: yPosition,
  //               width: tableWidth,
  //               height: 20,
  //               borderWidth: 1,
  //               borderColor: rgb(0.2, 0.2, 0.2),
  //               color: isHighlight ? rgb(1, 0.9, 0.9) : rgb(1, 1, 1), // Red Highlight for Important Rows
  //             });

  //             secondPage.drawText(desc, { x: margin + 10, y: yPosition + 5, size: 10, font: font });
  //             secondPage.drawText(monthly, { x: margin + colWidth1 + 10, y: yPosition + 5, size: 10, font: font });
  //             secondPage.drawText(annually, { x: margin + colWidth1 + colWidth2 + 10, y: yPosition + 5, size: 10, font: font });

  //             yPosition -= 20;
  //           };

  //           // Salary Data
  //           drawRow('Basic', `${this.salaryStructure.basic}`, `${this.salaryStructure.basic * 12}`);
  //           drawRow('HRA', `${this.salaryStructure.hra}`, `${this.salaryStructure.hra * 12}`);

  //           if (this.salaryStructure.allowances && this.salaryStructure.allowances !== '0') {
  //             drawRow('Special Allowance', `${this.salaryStructure.allowances}`, `${this.salaryStructure.allowances * 12}`);
  //           }

  //           if (this.salaryStructure.conveyance_allowance && this.salaryStructure.conveyance_allowance !== '0') {
  //             drawRow('Conveyance Allowance', `${this.salaryStructure.conveyance_allowance}`, `${this.salaryStructure.conveyance_allowance * 12}`);
  //           }

  //           // Salary Bucket Total (Highlighted)
  //           drawRow('Salary Bucket Total', `${this.salaryStructure.ctc}`, `${this.salaryStructure.ctcAnnual}`, true);

  //           // Salary In Hand (Highlighted)
  //           drawRow('Salary In Hand', `${this.salaryStructure.salaryinhand}`, `${this.salaryStructure.inHandAnnual}`, true);

  //           // Effective Date & Other Details
  //           yPosition -= 30;
  //           secondPage.drawText(`Effective Date: ${this.salaryStructure.effectivefrom ? this.salaryStructure.effectivefrom.substring(0, 10) : ''}`, {
  //             x: margin,
  //             y: yPosition,
  //             size: 10,
  //             font: font,
  //           });

  //           yPosition -= 20;
  //           secondPage.drawText(`Professional Tax Applied: ${this.salaryStructure.is_professional_tax_applied}`, {
  //             x: margin,
  //             y: yPosition,
  //             size: 10,
  //             font: font,
  //           });

  //           yPosition -= 20;
  //           secondPage.drawText(`LWF Applied: ${this.salaryStructure.is_lwf_applied}`, {
  //             x: margin,
  //             y: yPosition,
  //             size: 10,
  //             font: font,
  //           });

  //           // Save and display the modified PDF
  //           const modifiedPdfBytes = await pdfDoc.save();
  //           const pdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
  //           const pdfUrl = URL.createObjectURL(pdfBlob);

  //           const iframe = document.createElement('iframe');
  //           iframe.style.width = '100%';
  //           iframe.style.height = '100vh';
  //           iframe.src = pdfUrl;
  //           document.getElementById(id).appendChild(iframe);
  //           console.log(modifiedPdfBytes);

  //         };
  //         console.log(response);

  //         reader.readAsArrayBuffer(response);
  //       });
  //   }
  // }
  pdfProxy(id: any) {
    // this.pdfSrc = 'http://localhost:3000/api/employee/pdfProxy';
    let url = '';
    if (id == 'pdf-container') {
      url = this.candidateDetails.offer_letter_url;
    } else {
      url = this.candidateDetails.appointment_letter_url;
    }
    if (url) {
      this.http.post(`${environment.tankhapay_api}employee/pdfProxy`, { 'pdf': url }, { responseType: 'blob' })
        .subscribe((response: Blob) => {
          const parent = document.getElementById(id);
          while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
          }
          const pdfUrl = URL.createObjectURL(response);
          const iframe = document.createElement('iframe');
          iframe.style.width = '100%';
          iframe.style.height = '100vh';
          iframe.src = pdfUrl;
          document.getElementById(id).appendChild(iframe); // Assuming there's a div with id 'pdf-container'
        });
    }
  }






  check_digits(event: any) {
    const input = event.target as HTMLInputElement;
    const regex = /^\d{0,9}(\.\d{0,2})?$/;

    if (!regex.test(input.value)) {
      this.workExperienceForm.patchValue({
        last_take_home_drawn: '0',
      });
    } else {
      this.workExperienceForm.patchValue({
        last_take_home_drawn: input.value,
      });
    }
  }
  check_digits_two(event: any) {
    const input = event.target as HTMLInputElement;
    const regex = /^\d{0,2}(\.\d{0,2})?$/;

    if (!regex.test(input.value)) {
      this.workExperienceForm.patchValue({
        total_experience: '0',
      });
    } else {
      this.workExperienceForm.patchValue({
        total_experience: input.value,
      });
    }
  }

  getEmployerSocialSecurityDetails(action: String) {
    this._BusinesSettingsService.GetEmployerSocialSecurityDetails({
      'customerAccountId': this.tp_account_id.toString(),
      'socialSecurityType': action
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.pf_details = resData.commonData;
      }
    })
  }

  routeToAppointmentLetter() {
    this.router.navigate(['/employee-mgmt/letter-listing', this._EncrypterService.aesEncrypt('Appointment Letter' + ',' + '3')]);
  }

  routeToOfferLetter() {

    this.router.navigate(['/employee-mgmt/letter-listing', this._EncrypterService.aesEncrypt('Offer Letter' + ',' + '4')]);
  }

  sendLetterMail() {
    // console.log(this.salaryStructure);

    let postData = {
      ...this.appointmentLetterForm.value,
      name: this.candidateDetails.emp_name,
      email: this.candidateDetails.email,
      ...this.salaryStructure,
    }
    this._EmployeemgmtService.sendLetterMail(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        // console.log(resData.commonData);
        this._EmployeeService.file_upload({ 'name': `Appointment Letter.pdf`, 'data': `data:application/pdf;base64,${resData.commonData}` }).subscribe((response: any) => {
          if (response.status) {
            let postData = {
              productTypeId: this.product_type,
              customerAccountId: this.tp_account_id.toString(),
              empId: this.empDataFromParent.emp_id,
              appointmentLetterURL: response.file_path,
              action: 'UPDATE_ISSUED_APPOINTMENT_LETTER_URL'
            }
            this._EmployeemgmtService.manageCandidateAppointmentLetter(postData).subscribe((resData: any) => {
              if (resData.statusCode) {
                this.toastr.success('Email sent successfully');
                this.getAppointmentDetails();
              }
            })
          } else {
            this.toastr.error(resData.message);
          }
        })
        // this.toastr.success(resData.message);
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  formatExitMessage(exitMessage: string | undefined): string {
    if (!exitMessage) return '';
    return exitMessage.replace(/(\d{1,2}(?:st|nd|rd|th) \w+ \d{4})/g, '<b>$1</b>');
  }

  GetServiceBook_Details() {
    this._EmployeemgmtService.GetServiceBookDetails({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      'action': 'YearwiseServiceBook',
      'year': '',
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        let service_book_data = resData.commonData;
        this.Disciplinary_Actions_Details = service_book_data?.Disciplinary_Actions_Details;
        this.Reward_Details = service_book_data?.Reward_Details;
        // this.Leave_Summary=this.service_book_data?.Leave_Summary;
        // this.formatLeaveSummary();
        // console.log(this.Disciplinary_Actions_Details);
      } else {
        this.Reward_Details = [];
        this.Disciplinary_Actions_Details = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    });

  }

  open_disciplinary() {
    this.open_disciplinary_popup = true;
    setTimeout(() => {
      $('#actionDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);
  }
  close_disciplinary() {
    this.open_disciplinary_popup = false;
    this.disciplinary_form.reset();
  }

  close_disciplinary_popup() {
    this.open_edit_disciplinary_popup = false;
    this.Disciplinary_Form.reset();
  }
  disciplinary_popup(data: any) {
    this.action_row_id = data?.action_row_id;
    this.open_edit_disciplinary_popup = true;
    // console.log(data);

    this.Disciplinary_Form.patchValue({
      'action_Detail': data?.action_detail,
      'action_Reason': data?.action_reason,
      'action_Date': data?.action_date,
    });
    setTimeout(() => {
      $('#action_date').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);
  }
  close_edit_reward_popup() {
    this.open_edit_reward_popup = false;
    this.Reward_Form.reset();
  }
  open_edit_popup(data: any) {
    this.reward_row_id = data?.reward_row_id;
    this.open_edit_reward_popup = true;

    this.Reward_Form.patchValue({
      'reward_Name': data?.rewardname,
      'reward_Reason': data?.reward_reason,
      'reward_Date': data?.reward_date,
    });
    setTimeout(() => {
      $('#reward_date').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);
  }
  close_reward_popup() {
    this.open_reward_popup = false;
    this.reward_form.reset();
  }
  open_popup() {
    this.open_reward_popup = true;

    setTimeout(() => {
      $('#reward_Date').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
        defaultDate: null
      });
    }, 1000);
  }

  Add_reward() {
    const createdByUserName = `${this.token.name}-${this.token.mobile}`;
    this._EmployeemgmtService.AddEditRewards({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy": this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "action": 'AddRewardDetails',
      "rewardName": this.reward_form.get('rewardName')?.value?.toString(),
      "rewardReason": this.reward_form.get('rewardReason')?.value?.toString(),
      "rewardDate": $('#reward_Date').val(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.add_reward_data = resData.commonData;
        this.GetServiceBook_Details();
        this.close_reward_popup();
        this.toastr.success(resData.message, 'success');
      } else {
        this.add_reward_data = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    });

  }

  edit_reward() {
    const createdByUserName = `${this.token.name}-${this.token.mobile}`;
    // console.log(createdByUserName);
    this._EmployeemgmtService.EditRewards({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy": this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "action": 'EditRewardDetails',
      "rewardName": this.Reward_Form.get('reward_Name')?.value?.toString(),
      "rewardReason": this.Reward_Form.get('reward_Reason')?.value?.toString(),
      "rewardDate": $('#reward_date')?.val(),
      "rewardRowId": this.reward_row_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.edit_reward_data = resData.commonData;
        // console.log(this.edit_reward_data);
        this.GetServiceBook_Details();
        this.close_edit_reward_popup();
        this.toastr.success(resData.message, 'success');
      } else {
        this.edit_reward_data = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    });

  }

  DeleteReward_Details(data: any) {
    const createdByUserName = `${this.token.name}-${this.token.mobile}`;
    this._EmployeemgmtService.DeleteRewardDetails({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy": this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "rewardRowId": data?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.delete_reward_data = resData.commonData;
        this.close_edit_reward_popup();
        this.GetServiceBook_Details();
        this.toastr.success(resData.message, 'success');
      } else {
        this.delete_reward_data = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    });

  }

  AddDisciplinary_Action() {
    const createdByUserName = `${this.token.name}-${this.token.mobile}`;
    this._EmployeemgmtService.AddEditDisciplinaryAction({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy": this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "action": 'AddDisciplinaryAction',
      "actionDetail": this.disciplinary_form.get('actionDetail')?.value?.toString(),
      "actionReason": this.disciplinary_form.get('actionReason')?.value?.toString(),
      "actionDate": $('#actionDate').val(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.GetServiceBook_Details();
        this.close_disciplinary();
        this.toastr.success(resData.message, 'success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    });

  }

  edit_disciplinary() {
    const createdByUserName = `${this.token.name}-${this.token.mobile}`;
    // console.log(createdByUserName);
    this._EmployeemgmtService.EditDisciplinaryAction({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy": this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "action": 'EditDisciplinaryAction',
      "actionDetail": this.Disciplinary_Form.get('action_Detail')?.value?.toString(),
      "actionReason": this.Disciplinary_Form.get('action_Reason')?.value?.toString(),
      "actionDate": $('#action_date').val(),
      "actionRowId": this.action_row_id?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.GetServiceBook_Details();
        this.close_disciplinary_popup();
        this.toastr.success(resData.message, 'success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    });

  }

  Deletedisciplinary_Details(data: any) {
    const createdByUserName = `${this.token.name}-${this.token.mobile}`;
    this._EmployeemgmtService.DeleteDisciplinaryAction({
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
      "createdBy": this.tp_account_id?.toString(),
      "createdByUserName": createdByUserName,
      "actionRowId": data?.toString()
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.close_disciplinary_popup();
        this.GetServiceBook_Details();
        this.toastr.success(resData.message, 'success');
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    });

  }

  employer_details() {
    let ou_id = '';

    let desgName = [];

    let deptName = [];

    this._EmployeeService
      .employer_details({
        customeraccountid: this.tp_account_id.toString(),
        productTypeId: this.product_type,
        GeoFenceId: this.token.geo_location_id,
        ouIds: !this.token.ouIds ? ou_id : this.token.ouIds,
        department: deptName ? deptName.toString() : '',
        designation: desgName ? desgName.toString() : '',
        searchKeyword: '',
        employeesStatus: 'Active'
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          // this.employee_data = resData.commonData;
          let employee_data = resData.commonData;
          //this._EncrypterService.aesDecrypt(resData.commonData);
          // this.emp_json_data = (this.employee_data);
          this.filteredEmployees = employee_data;
          this.isDataLoaded = true;

        } else {
          // this.toastr.error(resData.message);
          this.filteredEmployees = [];
          this.isDataLoaded = true;
        }
      });
  }

  search(term: string, item: any): boolean {

    let key = term;
    return (
      item.emp_name.toLowerCase().includes(key) ||
      item.mobile.toLowerCase().includes(key) ||
      item.orgempcode.toLowerCase().includes(key) ||
      item.tpcode.toLowerCase().includes(key))

    // console.log(this.filteredEmployees);
  }

  onEmployeeSelect(event: any): void {

    if (event) {
      this.basic_detail_form.patchValue({
        reportingManagerEmpCode: event.emp_code
      })
    } else {
      this.basic_detail_form.patchValue({
        reportingManagerEmpCode: ''
      })
    }
    // Perform actions with the selected value
  }

  onDesignationChange(event: any) {
    if (event)
      this.basic_detail_form.patchValue({
        designationId: event.dsignationid
      })
  }
  onfDesignationChange(event: any) {
    // console.log(event);

    if (event)
      this.basic_detail_form.patchValue({
        fdesignationId: event.fdsignationid
      })
  }

  onDepartmentChange(event: any) {
    if (event) {
      this.basic_detail_form.patchValue({
        departmentId: event.id,
        post_offered: ''
      })
      this.get_att_role_master_list();
    }
  }

  showAddDepartment() {
    this.isAddDepartment = true;
  }

  hideAddDepartment() {
    this.isAddDepartment = false;
    this.departmentForm.reset();
  }

  addDepartment() {
    if (!this.departmentForm.value.departmentName) {
      return;
    }
    this._recruitService.SaveDepartment({
      "departmentName": this.departmentForm.value.departmentName,
      "id": "",
      "action": 'save_department_direct',
      "customeraccountid": this.tp_account_id.toString(),
      "userby": this.tp_account_id.toString(),
      "empids": ''
    }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        this.get_att_dept_master_list();
        this.hideAddDepartment();
        return this.toastr.success("Department added successfully");
      } else {
        this.toastr.error("Something went wrong, department not added. Please try again.");
      }
    })
  }
  showAddDesignation(): any {
    if (!this.bf.departmentId.value) {
      return this.toastr.error("Please add or update the department first");
    }
    this.isAddDesignation = true;
    this.designationForm.patchValue({
      id: this.bf.departmentId.value
    })
  }

  hideAddDesignation() {
    this.isAddDesignation = false;
    this.designationForm.reset();
  }

  addDesignation() {
    let postData = {
      action: 'save_designation_unit',
      customeraccountid: this.tp_account_id.toString(),
      userby: this.token.id,
      roleName: this.designationForm.value.designationName,
      id: this.designationForm.value.id.toString(),

    }

    this._userMgmtService.saveDesignation(postData).subscribe((resData: any): any => {
      if (resData.statusCode) {
        this.get_att_role_master_list();
        this.hideAddDesignation();
        this.toastr.success('Designation added successfully');
      } else {
        return this.toastr.error('Something went wrong, Designation not added. Please try again.')
      }
    })
  }

  getProjectList() {
    this._faceCheckinService.getemployeeList({
      "action": "mst_project_list",
      "customeraccountid": this.tp_account_id.toString(),
      "emp_code": "",
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.projectList = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      } else {
        this.projectList = [];
      }
    })
  }

  // onProjectSelect(project:object){
  //   // console.log(project)
  //   this.basic_detail_form.patchValue({
  //     projectId : project['id']
  //   })
  // }
  onProjectSelect(project: object) {
    if (project) {
      this.basic_detail_form.patchValue({
        projectId: project['id']
      })
    } else {
      this.basic_detail_form.patchValue({
        projectId: '',
        project: ''
      })
    }
  }

  hideProjectMap() {
    this.isProjectMapDetail = false;
    this.projectMapForm.patchValue({
      id: [''],
      project_id: [''],
      emp_code: [''],
      deputed_date: [''],
      relieved_date: [''],
      remarks: [''],

    })
  }

  showProjectMapDetails(action: any, data: any) {
    this.projectMapTitle = action; // Add, Update, Delete
    this.isProjectMapDetail = true;

    if (action != 'Add') {
      this.projectMapForm.patchValue({
        id: data.id,
        project_id: data.project_id,
      })
    }

    setTimeout(() => {
      $('#deputedDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        // maxDate: new Date(),
      })

      $('#relievedDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        // maxDate: new Date(),
      })
      $('body').on('change', '#deputedDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#relievedDate', function () {
        $('#recdate').trigger('click');
      })

      let deputedDate;
      let relievedDate;

      if (action == 'Add') {
        $('#deputedDate').datepicker('setDate', new Date());
        // $('#relievedDate').datepicker('setDate', new Date());

      } else {
        $('#deputedDate').datepicker('setDate', data.deputeddate);
        $('#relievedDate').datepicker('setDate', data.relieveddate);

      }
      deputedDate = $('#deputedDate').val();
      relievedDate = $('#relievedDate').val();

      // console.log('Deputed Date:', deputedDate);
      // console.log('Relieved Date:', relievedDate);
    }, 0)

  }
  hidelocationtransfer() {
    this.isLocationtransferDetail = false;
    const currentState = '';
    this.LocationTransferForm.patchValue({
      id: [''],
      state_id: currentState,
      emp_code: [''],
      effectiveDate: [''],
      remarks: [''],
      Location: [''],
      checkboxdefault: [0],

    });
    $('#effectiveDate').datepicker('setDate', null);
  }
  showLocationTransfer(action: any, data: any) {
    this.LocationtransferTitle = action; // Add, Update, Delete
    this.isLocationtransferDetail = true;
    //console.log(data);
    const selectedState = this.state_list_data.find(state => state.state === data.state);
    //console.log(selectedState.state);
    let formattedDate = this.convertDateFormat(data.location_effective_date);
    // console.log(formattedDate);

    if (action != 'Add') {
      this.LocationTransferForm.patchValue({
        id: data.id,
        state_id: selectedState.id,
        effectiveDate: formattedDate,
        remarks: data.remarks,
        Location: data.location,
        emp_code: data.emp_code,
        checkboxdefault: data.is_latest === true ? 1 : 0,

      });
      //console.log(this.LocationTransferForm.value.checkboxdefault);
      //console.log(data.is_latest);
    }
    else {
      this.LocationTransferForm.patchValue({
        checkboxdefault: 0
      });
    }

    setTimeout(() => {
      $('#effectiveDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        // maxDate: new Date(),
      })

      $('body').on('change', '#effectiveDate', function () {
        $('#recdate1').trigger('click');
      });



      let effectiveDate = action === 'Add' ? new Date() : formattedDate;
      $('#effectiveDate').datepicker('setDate', effectiveDate);

      if (action == 'Add') {
        $('#effectiveDate').datepicker('setDate', new Date());

      } else {
        $('#effectiveDate').datepicker('setDate', effectiveDate);

      }
      effectiveDate = $('#effectiveDate').val();
    }, 0)

  }
  convertDateFormat(dateString: string): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`; // Convert to "DD-MM-YY"
  }
  updateProjectMapDetails() {
    let action = '';
    let project_id = this.projectMapForm.value.project_id
    let remarks = this.projectMapForm.value.remarks;
    let id = this.projectMapForm.value.id;

    if (!project_id) {
      this.toastr.error('Please select a project', 'Oops!');
      return;
    }

    if (this.projectMapTitle == 'Add') {
      action = 'new_resources_details';
      id = null;
    } else if (this.projectMapTitle == 'Update') {
      action = 'update_resources';
    } else if (this.projectMapTitle == 'Delete') {
      action = 'delete_resources';
    }

    let deputedDate = $('#deputedDate').val();
    let relievedDate = $('#relievedDate').val();

    if (this.projectMapTitle == 'Add') {
      relievedDate = '';
      if (!deputedDate) {
        this.toastr.error('Deputed date not present', 'Oops!');
        return;
      }
    } else if (this.projectMapTitle != 'Add' && (!deputedDate)) {//|| !relievedDate  or Relieved date
      this.toastr.error('Either Deputed date in not present', 'Oops!');
      return;
    }

    this._EmployeemgmtService.manageResources({
      "action": action,
      "id": !id ? null : id.toString(),
      "customeraccountid": this.tp_account_id.toString(),
      "project_id": project_id.toString(),
      "emp_code": this.empDataFromParent.emp_code,
      "deputed_date": deputedDate,
      "relieved_date": relievedDate,
      "remarks": remarks,
      "userBy": this.tp_account_id.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.get_project_map();
          this.hideProjectMap();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }
  updateLocationTransferDetails() {
    //console.log(this.LocationTransferForm.value.checkboxdefault);

    let action = '';
    let state_id = this.LocationTransferForm.value.state_id
    let state_name = this.state_list_data.find(state => state.id == this.LocationTransferForm.value.state_id);
    let remarks = this.LocationTransferForm.value.remarks;
    let location = this.LocationTransferForm.value.Location;
    let id = this.LocationTransferForm.value.id;
    let checkboxval = this.LocationTransferForm.value.checkboxdefault == 1 ? '1' : '0';
    // console.log(id);

    if (!state_id) {
      this.toastr.error('Please select a state', 'Oops!');
      return;
    }

    if (this.LocationtransferTitle == 'Add') {
      action = 'insert';
      id = null;
    } else if (this.LocationtransferTitle == 'Update') {
      action = 'update';
    } else if (this.LocationtransferTitle == 'Delete') {
      action = 'delete';
    }

    let effectiveDate = $('#effectiveDate').val() || this.LocationTransferForm.value.effectiveDate;

    if (this.LocationtransferTitle == 'Add') {
      if (!effectiveDate) {
        this.toastr.error('Effective date not present', 'Oops!');
        return;
      }
    } else if (this.LocationtransferTitle != 'Add' && (!effectiveDate)) {
      this.toastr.error('Either effectiveDate in not present', 'Oops!');
      return;
    }

    this._EmployeemgmtService.emp_location_hist({
      "action": action,
      "empCode": this.empDataFromParent.emp_code,
      "customerAccountId": this.tp_account_id.toString(),
      "transferId": id?.toString() || null,
      "locationEffectiveDate": effectiveDate,
      "state": state_name?.state,
      "location": location,
      "remarks": remarks,
      "userBy": this.empDataFromParent.emp_code,
      "set_default_location": checkboxval,
      "userIp": ''
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.get_locationtransfer();
          this.hidelocationtransfer();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  deleteConfirmLocation(_action: any, data: any) {
    this.LocationtransferTitle = _action; // Add, Update, Delete
    // this.isLocationtransferDetail = true;
    //console.log(data);
    const selectedState = this.state_list_data.find(state => state.state === data.state);
    //console.log(selectedState.state);
    let formattedDate = this.convertDateFormat(data.location_effective_date);
    // console.log(formattedDate);

    if (_action != 'Add') {
      this.LocationTransferForm.patchValue({
        id: data.id,
        state_id: selectedState.id,
        effectiveDate: formattedDate,
        remarks: data.remarks,
        Location: data.location,
        emp_code: data.emp_code,
        checkboxdefault: data.is_latest === true ? 1 : 0,

      });
      //console.log(this.LocationTransferForm.value.checkboxdefault);
      //console.log(data.is_latest);
    }
    else {
      this.LocationTransferForm.patchValue({
        checkboxdefault: 0
      });
    }

    setTimeout(() => {
      $('#effectiveDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        // maxDate: new Date(),
      })

      $('body').on('change', '#effectiveDate', function () {
        $('#recdate1').trigger('click');
      });



      let effectiveDate = action === 'Add' ? new Date() : formattedDate;
      $('#effectiveDate').datepicker('setDate', effectiveDate);

      if (action == 'Add') {
        $('#effectiveDate').datepicker('setDate', new Date());

      } else {
        $('#effectiveDate').datepicker('setDate', effectiveDate);

      }
      effectiveDate = $('#effectiveDate').val();
    }, 0)

    let action = 'delete';
    let effectiveDate = $('#effectiveDate').val() || this.LocationTransferForm.value.effectiveDate;

    let state_id = this.LocationTransferForm.value.state_id
    let state_name = this.state_list_data.find(state => state.id == this.LocationTransferForm.value.state_id);
    let remarks = this.LocationTransferForm.value.remarks;
    let location = this.LocationTransferForm.value.Location;
    let id = this.LocationTransferForm.value.id;
    let checkboxval = this.LocationTransferForm.value.checkboxdefault == 1 ? '1' : '0';

    this.confirmationDialogService.confirm('Are you sure you want to delete the location ?', 'Delete').subscribe(result => {
      if (result) {
        this._EmployeemgmtService.emp_location_hist({
          "action": action,
          "empCode": this.empDataFromParent.emp_code,
          "customerAccountId": this.tp_account_id.toString(),
          "transferId": id?.toString() || null,
          "locationEffectiveDate": effectiveDate,
          "state": state_name.state,
          "location": location,
          "remarks": remarks,
          "userBy": this.empDataFromParent.emp_code,
          "set_default_location": checkboxval,
          "userIp": ''
        }).subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              this.get_locationtransfer();
              this.hidelocationtransfer();

            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          }
        })
      }
    });
  }

  toggleCheckbox(event: any) {
    const isChecked = event.target.checked;
    this.LocationTransferForm.patchValue({
      checkboxdefault: isChecked ? '1' : '0'
    });
  }

  get_project_map() {
    this.project_map_history_data = [];

    this._EmployeemgmtService.project_map(
      {
        "action": "project_mapp_hist",
        "customeraccountid": this.tp_account_id.toString(),
        "emp_code": this.empDataFromParent.emp_code,
        "organization_unitid": "",
        "keyword": "",
        "fromdate": "",
        "todate": ""
      }
    ).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.project_map_history_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          // console.log(this._EncrypterService.aesDecrypt(resData.commonData));

        } else {

        }
      }
    })
  }
  get_locationtransfer() {
    this.locationtransfer_data = [];

    this._EmployeemgmtService.project_map(
      {
        "action": "emp_location_hist",
        "customeraccountid": this.tp_account_id.toString(),
        "emp_code": this.empDataFromParent.emp_code,
        "organization_unitid": "",
        "keyword": "",
        "fromdate": "",
        "todate": ""
      }
    ).subscribe({
      next: (resData: any) => {
        // console.log(resData);
        if (resData.statusCode) {
          //console.log(resData);

          this.locationtransfer_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          //console.log(this.locationtransfer_data);

          this.location_default = this.locationtransfer_data
            ? this.locationtransfer_data.filter(x => x.is_latest === true)
            : [];
          //console.log(this.location_default);

          // console.log(this._EncrypterService.aesDecrypt(resData.commonData));

        } else {

        }
      }
    })
  }


  get_project_list() {
    this.project_list_data = [];

    this._EmployeemgmtService.project_map(
      {
        "action": "mst_project_list",
        "customeraccountid": this.tp_account_id.toString(),
        "emp_code": this.empDataFromParent.emp_code,
        "organization_unitid": "",
        "keyword": "",
        "fromdate": "",
        "todate": ""
      }
    ).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.project_list_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          // console.log(this._EncrypterService.aesDecrypt(resData.commonData));

        } else {

        }
      }
    })
  }
  get_state_list() {
    this.state_list_data = [];
    this._EmployeeService.getAll_state({}).subscribe((resData: any) => {
      // console.log(resData);

      if (resData.statusCode) {
        this.state_list_data = resData.commonData;
      } else {
        this.state_list_data = [];
      }
    })
  }


  change_project_name() {
    // console.log(this.projectMapForm.value.project_id);
    if (this.projectMapForm.value.project_id) {
      let idx = this.project_list_data.findIndex(el => el.id == this.projectMapForm.value.project_id);

      $('#deputedDate').datepicker('setDate', this.project_list_data[idx].start_date);
      $('#relievedDate').datepicker('setDate', this.project_list_data[idx].end_date);
    }
  }
  change_state_name() {
    // console.log(this.projectMapForm.value.project_id);
    if (this.LocationTransferForm.value.state_id) {
      let idx = this.state_list_data.findIndex(el => el.id == this.LocationTransferForm.value.state_id);

      // $('#effectiveDate').datepicker('setDate', this.state_list_data[idx].start_date);
    }
  }
  filterFromToDateLeads() {
    let fromdt = $('#deputedDate').val();
    let todt = $('#relievedDate').val();

    if (fromdt && todt) {
      let splitted_f = fromdt.split("-");
      let splitted_t = todt.split("-");

      if (splitted_f.length !== 3 || splitted_t.length !== 3) {
        this.toastr.error('Invalid date format', 'Error!');
        return;
      }

      let join_fr = `${splitted_f[2]}${splitted_f[1]}${splitted_f[0]}`;
      let join_to = `${splitted_t[2]}${splitted_t[1]}${splitted_t[0]}`;

      // console.log(join_fr);
      // console.log(join_to);

      if (join_fr > join_to) {
        $('#relievedDate').datepicker('setDate', '');
        this.toastr.error("The relieved date must be later than or equal to the deputation date", 'Oops!');
        return;
      }

      let doj = this.empDataFromParent?.dateofjoining;
      // console.log(doj);
      if (doj) {
        let splitted_doj = doj.split("/");
        if (splitted_doj.length !== 3) {
          this.toastr.error('Invalid date format for Date of Joining', 'Error!');
          return;
        }
        let join_doj = `${splitted_doj[2]}${splitted_doj[1]}${splitted_doj[0]}`;

        if (join_fr < join_doj) {
          $('#deputedDate').datepicker('setDate', '');
          this.toastr.error('The deputation date must be later than the date of joining', 'Oops!');
          return;
        }
      }
    } else if (fromdt) {
      let splitted_f = fromdt.split("-");
      if (splitted_f.length !== 3) {
        this.toastr.error('Invalid date format', 'Error!');
        return;
      }

      let join_fr = `${splitted_f[2]}${splitted_f[1]}${splitted_f[0]}`;

      let doj = this.empDataFromParent?.dateofjoining;
      if (doj) {
        let splitted_doj = doj.split("-");
        if (splitted_doj.length !== 3) {
          this.toastr.error('Invalid date format for Date of Joining', 'Error!');
          return;
        }
        let join_doj = `${splitted_doj[2]}${splitted_doj[1]}${splitted_doj[0]}`;

        if (join_fr < join_doj) {
          $('#deputedDate').datepicker('setDate', '');
          this.toastr.error('The deputation date must be later than the date of joining', 'Oops!');
          return;
        }
      }
    }
  }
  // pankaj 27 mar 2025
  getSalaryStructure() {
    // console.log(this.product_type, this.tp_account_id.toString(), this.candidateDetails);

    this._EmployeeService.getSalaryStructure({
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()), 'empId':
        this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id),
      'salaryMode': 'Custom'
    }).subscribe((resData: any) => {
      // console.log(resData);

      if (resData.statusCode) {
        this.salaryStructure = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this.salaryStructure);

        this.isGratuity = this.salaryStructure.gratuity == '' || (this.salaryStructure.gratuity != '' && Math.round(this.salaryStructure.gratuity) == 0) ? false : true;

        let date = !this.salaryStructure.effectivefrom ? '' : (this.salaryStructure.effectivefrom.substring(0, 10).split('/')[1] + '/' +
          this.salaryStructure.effectivefrom.substring(0, 10).split('/')[0] + '/' +
          this.salaryStructure.effectivefrom.substring(0, 10).split('/')[2]);


        if (this.isGrpInsuranceAllowed == 'Y') {
          this.isGrpInsurance = this.salaryStructure.isgroupinsurance == 'Y' ? true : false;
          if (this.isGrpInsurance) {

            this.employeeInsurance = this.salaryStructure.insuranceamount;
            this.employeeInsurance = this.salaryStructure.employerinsuranceamount;

          }
        }

        // this.calculateSal();

        this.isShowSalaryTable = true;
        this.isEmployerGratuity = this.salaryStructure.employergratuityopted != 'N' ? true : false;
        this.edli_adminchargesincludeinctc = this.salaryStructure.edli_adminchargesincludeinctc;

        // if(this.candidateDetails.joiningStatus=='RESTRUCTURE' && localStorage.getItem('restructureMode')=='CustomRestructureMode'){
        //   this.getuspccalcgrossfromctc_withoutconveyance();
        // }

        this.salaryStructure['ctcAnnual'] = Math.round(this.salaryStructure['ctc'] * 12);
        this.salaryStructure['inHandAnnual'] = Math.round(this.salaryStructure['salaryinhand'] * 12);
        this.salaryStructure['grossAnnual'] = Math.round(this.salaryStructure['gross'] * 12);
        this.salaryStructure['total'] = (parseFloat(this.salaryStructure.gross) + parseFloat(this.salaryStructure.bonus || '0') + parseFloat(this.salaryStructure.employerepfrate || '0') + parseFloat(this.salaryStructure.employeresirate || '0') + parseFloat(this.salaryStructure.employerlwf || '0') + parseFloat(this.salaryStructure.employergratuity || '0')
          + parseFloat(this.salaryStructure.mealvouchers || '0') + parseFloat(this.salaryStructure.medicalinsurancepremium || '0') + parseFloat(this.salaryStructure.teaallowances || '0')) + parseFloat(this.salaryStructure.employerinsuranceamount || '0');

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
            'deduction_name': this.getEarningLabel('Salary Bonus'),
            'deduction_amount': this.salaryStructure.salarybonus
          },
          {
            'deduction_name': this.getEarningLabel('Commission'),
            'deduction_amount': this.salaryStructure.commission
          },
          {
            'deduction_name': this.getEarningLabel('Transport Allowance'),
            'deduction_amount': this.salaryStructure.transport_allowance
          },
          {
            'deduction_name': this.getEarningLabel('Travelling Allowance'),
            'deduction_amount': this.salaryStructure.travelling_allowance
          },
          {
            'deduction_name': this.getEarningLabel('Leave Encashment'),
            'deduction_amount': this.salaryStructure.leave_encashment
          },
          {
            'deduction_name': this.getEarningLabel('Gratuity In Hand'),
            'deduction_amount': this.salaryStructure.gratuityinhand
          },
          {
            'deduction_name': this.getEarningLabel('Overtime Allowance'),
            'deduction_amount': this.salaryStructure.overtime_allowance
          },
          {
            'deduction_name': this.getEarningLabel('Notice Pay'),
            'deduction_amount': this.salaryStructure.notice_pay
          },
          {
            'deduction_name': this.getEarningLabel('Hold Salary (Non Taxable)'),
            'deduction_amount': this.salaryStructure.hold_salary_non_taxable
          },
          {
            'deduction_name': this.getEarningLabel('Children Education Allowance'),
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
  pdfUrl: SafeResourceUrl | null = null;
  async previewLetter1() {
    this.confirmationModal = true;
    // console.log('sdfdsfsdw');
    // console.log(this.appointmentLetterForm.get('header').value);
    try {


      ////// let formData = new FormData();
      // let htmlContent = `<table >`
      // htmlContent += `<tr><td><img src="${this.appointmentLetterForm.get('header').value}" width="500"></td></tr>`;
      // htmlContent += `<tr> <td><div class="main" style="font-size:10px;">${this.appointmentLetterForm.get('template_html').value}</div></td></tr></table>`;
      // // return
      // htmlContent = htmlContent.replace(/(<p[^>]*style="[^"]*font-size:)(\s?\d+px)([^"]*")/g, '$110px$3');
      // htmlContent = htmlContent.replace(/(<h\d[^>]*style="[^"]*font-size:)(\s?\d+px)([^"]*")/g, '$115px$3');
      // // console.log(htmlContent);

      // formData.append('htmlBody', htmlContent);
      // formData.append('footerBody', this.appointmentLetterForm.get('footer').value);
      // API call to get the PDF (using async/await)

      let formData = new FormData();
      const headerImg = this.appointmentLetterForm.get('header')?.value || '';
      const templateHtml = this.appointmentLetterForm.get('template_html')?.value || '';
      const footerHtml = this.appointmentLetterForm.get('footer')?.value || '';
      let rawTemplate = this.appointmentLetterForm.get('template_html')?.value || '';

      rawTemplate = rawTemplate.replace(/<font[^>]*size=["']?(\d+)["']?[^>]*>/gi, (match, size) => {
        let newSize = '20px';
        if (size === '6') {
          newSize = '20px';
        } else if (size === '5') {
          newSize = '18px';
        } else if (size === '4') {
          newSize = '16px';
        } else if (size === '3') {
          newSize = '14px';
        } else if (size === '2') {
          newSize = '12px';
        }

        return `<span style="font-size:${newSize}; font-family:Arial">`;
      });

      rawTemplate = rawTemplate.replace(/<\/font>/gi, '</span>');

      const style = `
      <style>
        body, table, p, div, span, td, th {
          font-size: 15px !important;
          font-family: Garamond, serif !important;;
        }
        h1, h2, h3, h4, h5, h6 {
          font-size: 18px !important;
        }
      </style>
    `;

      const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <table width="100%">
            <tr>
              <td><img src="${this.appointmentLetterForm.get('header')?.value}" width="500"></td>
            </tr>
            <tr>
              <td>${rawTemplate}</td>
            </tr>
          </table>
        </body>
      </html>
    `;

      formData.append('htmlBody', htmlContent);
      formData.append('footerBody', footerHtml);

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

  showAddFunctionalDesignation(): any {
    if (!this.bf.departmentId.value) {
      return this.toastr.error("Please add or update the department first");
    }
    this.isAddFunctionalDesignation = true;

    this.functionaDesignationForm.patchValue({
      id: this.bf.departmentId.value
    })
  }

  hideAddFunctionalDesignation() {
    this.isAddFunctionalDesignation = false;
    this.functionaDesignationForm.reset();
  }

  addFunctionalDesignation() {
    let postData = {
      action: 'save_designation_unit',
      customeraccountid: this.tp_account_id.toString(),
      userby: this.token.id,
      roleName: this.functionaDesignationForm.value.designationName,
      func_designation: this.functionaDesignationForm.value.designationName,
      id: this.functionaDesignationForm.value.id.toString(),
    }

    this._userMgmtService.saveDesignation(postData).subscribe((resData: any): any => {
      if (resData.statusCode) {
        this.get_att_role_master_list();
        this.hideAddFunctionalDesignation();
        this.toastr.success('Designation added successfully');
      } else {
        return this.toastr.error('Something went wrong, Designation not added. Please try again.')
      }
    })
  }
  onselectsalarybookedproj(project: object) {
    if (project) {
      console.log(project);

      this.basic_detail_form.patchValue({
        salarybookedprojid: project['id']
      })
    } else {
      this.basic_detail_form.patchValue({
        salarybookedproj: '',
        salarybookedprojid: '',
      })
    }
  }
  showAddVendor() {
    this.isAddVendor = true;
  }
  get_vendor_master_list() {
    this._faceCheckinService.getemployeeList({
      "action": "mst_vendor_list",
      "customeraccountid": this.tp_account_id.toString(),
      "emp_code": "",
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData: any) => {
      this.vendor_master_list_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          // this.toastr.info('No data found', 'Info');
          this.toastr.error('No data found');
          return;
        }
        this.vendor_master_list_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

      } else {

        // this.toastr.error('No data found');

      }
    }, (error: any) => {

      this.vendor_master_list_data = []
      this.toastr.error('No data found');

    })
  }
  hideAddVendor() {
    this.isAddVendor = false;
    this.vendorForm.reset();
  }
  addvendor() {
    if (!this.vendorForm.value.vendorname) {
      return;
    }
    let obj = {
      "action": "save_vendor", "customerAccountId": this.tp_account_id.toString(),
      ...this.vendorForm.value
    };

    this._userMgmtService.managevenodrs(obj).subscribe((resData: any): any => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.get_vendor_master_list();
        this.hideAddVendor();
        return this.toastr.success("Vendor added successfully");
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  // New code for live tracking sidharth kaul dated. 17.05.2025
  getLiveTracking(isLiveLoc: any) {
    this.basic_detail_form.patchValue({
      live_tracking: isLiveLoc
    })
  }
  getEarningLabel(componentName: string): string {
    const match = this.salComponentHead.find(item =>
      item.salary_component_name?.toLowerCase() === componentName.toLowerCase()
    );

    return match?.earningType || componentName;
  }

  getMasterSalaryStructure(): any {
    // console.log('data');

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

          if (salary_setup_head[idx].calculationtype == 'Flat') {

            monthlyAmt = Number(salary_setup_head[idx].calculationpercent);

          }



          if (salary_setup_head[idx].isactive == 'Y') {
            this.salComponentHead.push({
              salary_component_name: salary_setup_head[idx].componentname,
              percentage_fixed: salary_setup_head[idx].calculationtype,
              percentage_ctc: salary_setup_head[idx].calculationpercent,
              is_taxable: salary_setup_head[idx].esiapplicable,
              ispfapplicable: salary_setup_head[idx].epfapplicable,
              salary_component_id: salary_setup_head[idx].id,
              salary_component_amount: monthlyAmt.toFixed(2),
              earningType: salary_setup_head[idx].earningtype
            });

          }
          // console.log(this.salComponentHead);

        }

      } else {
        this.toastr.error(resData.message);
      }
    })
  }
  getEmpCompletedCycle() {
    //console.log('completed cycle');

    // console.log(this.candidateDetails.emp_code);

    //{"action":"GET_MY_AC","customeraccountid":"653","user_id":"6327"}
    this._LoginService.getEmpCompletedCycle_url_fun({
      'action': 'GET_MY_AC',
      'customeraccountid': this.tp_account_id.toString(), 'user_id': this.empDataFromParent.emp_code
    }).subscribe((resData: any) => {
      //console.log(resData);
      //console.log('insde the completed cycle');

      if (resData.statusCode) {
        this.CompletedCycle = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        //console.log(this.CompletedCycle);
        this.CompletedCycle = this.CompletedCycle?.filter(x => x.is_published == '1');

      } else {
        //console.log('no data in completed cycle');

        this.CompletedCycle = [];
      }
    })
  }


  //-----------Start UAN Number------------//
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
      "empId": this.empDataFromParent.emp_id.toString(),
      "empCode": this.empDataFromParent?.emp_code.toString(),
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
  //-----------End UAN Number------------//


  //----------Start ESIC Number------------//
  openESICNumberPopup() {
    this.showESICNumberPopup = true;
    this.esicNumber = !this.empDataFromParent.esi_number ? '' : this.empDataFromParent.esi_number;

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    this.base64String = '';
    this.fileName = '';
  }

  closeESICNumberPopup() {
    this.showESICNumberPopup = false;
    this.esicNumber = '';
    this.esicDispensaryAddress = '';
  }

  updateEsicNumber() {

    if (!this.esicNumber || !this.esicDispensaryAddress) {
      this.toastr.error('Please enter ESIC Number and Dispensary Address', 'Oops!');
      return;
    }

    let action = 'Update';

    if (this.base64String) {
      action = 'Insert';
    }

    this._ReportService.SubmitEsicForBusiness({
      "empId": this.empDataFromParent.emp_id.toString(),
      "empCode": this.empDataFromParent.emp_code.toString(),
      "customerAccountId": this.tp_account_id.toString(),
      "createdBy": this.tp_account_id.toString(),
      "esicNumber": this.esicNumber.toString(),
      "dispensaryAddress": this.esicDispensaryAddress,
      "documentUploadType": action,
      "documentByteCode": this.base64String,
      "originalDocumentName": this.fileName,
      "documentFilePath": !this.empDataFromParent.esic_card_doc_path ? '' : this.empDataFromParent.esic_card_doc_path,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        // this.empDataFromParent.esi_number = this.esicNumber;
        // this.empDataFromParent.esic_card_doc_path =
        this.closeESICNumberPopup();
        this.notifyParent();
        this.toastr.success(resData.message, 'Success!');
      } else {
        this.toastr.error(resData.message, 'Error!');
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      this.base64String = '';
      this.fileName = '';
      this.clearFileData(input);
      return;
    }

    const file = input.files[0];
    if (file.size > 1048576) {
      this.toastr.error('Uploaded ESIC document must be less than 1 MB.', 'File Size Error');
      this.clearFileData(input);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const byteArray = new Uint8Array(arrayBuffer);
      const base64String = this.byteArrayToBase64(byteArray);


      this.base64String = base64String;
      this.fileName = file.name;

      // Only call submitEsicBusiness after reading file successfully
      console.log('File read successfully:', this.fileName, this.base64String);
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsArrayBuffer(file); // Asynchronously read the file
  }

  clearFileData(input?: HTMLInputElement): void {
    this.base64String = '';
    this.fileName = '';
    if (input) {
      input.value = ''; // Reset the input field
    }
  }
  byteArrayToBase64(byteArray: Uint8Array): string {
    let binary = '';
    const len = byteArray.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(byteArray[i]);
    }
    return window.btoa(binary);
  }
  //----------End ESIC Number------------//



//======================================================================================================

  // Start - Add Skill Set Code - sidharth kaul dated. 28.06.2025
  // levelPotential: number;
  // skillSetMatrix: any;

  // calculatePotential(data: any) {

  //   let totalWeightedScore = 0;
  //   let maxPossibleScore = 0;

  //   data.forEach(skill => {
  //     const weightage = skill.latest_weightage / 100;
  //     const level = skill.latest_level;

  //     // Weighted score for the current skill
  //     totalWeightedScore += level * weightage;

  //     // Maximum possible weighted score for the current skill
  //     maxPossibleScore += 4 * weightage;
  //   });

  //   // Calculate the potential
  //   const potential = (totalWeightedScore / maxPossibleScore) * 100;

  //   this.levelPotential = potential;
  // }

  // getSkillSetSettings() {
  //   let obj = {
  //     action: "GET_CONFIGURATION",
  //     customeraccountid: this.tp_account_id.toString(),
  //     module_id: '5'
  //   }

  //   this.generalSettingService.getKraSettings(obj).subscribe((res: any) => {
  //     if (res.statusCode) {
  //       let decriptData = JSON.parse(this._EncrypterService.aesDecrypt(res?.commonData))
  //       this.skillSetMatrix = decriptData[0];
  //     } else {
  //       this.toastr.error(res?.message)
  //     }
  //   })

  // }

  // End - Add Skill Set Code


}
