import { Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import decode from 'jwt-decode';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { ActivatedRoute, Router } from '@angular/router';
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
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';

declare var $: any;

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css', '../../employee-management/empl-profile/empl-profile.component.css'],
  animations: [grooveState, dongleState]
})
export class EmployeeDetailComponent {
  fdesignationList: any = [];
  fdesignationListname: any = [];
  functionaDesignationForm: FormGroup;
  isAddFunctionalDesignation: boolean = false;
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
  locationtransfer_data: any = [];
  location_default: any = [];
  letterid: any = '';
  currentCursorField: string = null;
  lastRange: any;
  appointmentLetterForm: FormGroup
  pdfSrc: string;
  isDataLoaded: boolean = true;
  invalidDate: boolean = false;
  pf_details: any;
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
      { class: 'comic-sans-ms', name: 'Comic Sans MS' }
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
  departmentForm: FormGroup;
  designationForm: FormGroup;
  @ViewChild('formElement') formElement: ElementRef;
  projectList: any = [];
  isBasicEditable: boolean = false;

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
    private _userMgmtService: UserMgmtService) { }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.payout_method = this.token.payout_mode_type;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    this.accessRights = this._masterService.checkAccessRights('/employees');

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
      name: [{ value: '', disabled: true }, [Validators.required, Validators.pattern('^[a-zA-Z. ]+$')]],
      dob: [{ value: '', disabled: true }, [Validators.required]],
      gender: [{ value: '', disabled: true }],
      employee_email: [{ value: '', disabled: true }, [
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
      ]],
      employee_mobile: [{ value: '', disabled: true }, [Validators.required,
      Validators.pattern('^[6-9]{1}[0-9]{9}$'),
      Validators.minLength(10),
      Validators.maxLength(10)
      ]],
      emergency_mobile: [{ value: '', disabled: true }, [
        Validators.pattern('^[6-9]{1}[0-9]{9}$'),
        Validators.minLength(10)
      ]],
      blood_relation: [{ value: '', disabled: true }, [Validators.pattern(/^[a-zA-Z ]+$/)]],
      perm_add: [{ value: '', disabled: true }, [Validators.required]],
      res_add: [{ value: '', disabled: true }],
      relation_name: [{ value: '', disabled: true }],
      post_offered: [{ value: '', disabled: true }, , [Validators.required]],
      posting_department: [{ value: '', disabled: true }, , [Validators.required]],
      doj: [{ value: '', disabled: true }, , [Validators.required]],
      orgempcode: [{ value: '', disabled: true },],
      jobType: [{ value: '', disabled: true }, [Validators.required]],
      geo_fencing: [{ value: '', disabled: true },],
      live_tracking: [''],
      orgIds: [{ value: '', disabled: true },],
      geoFenceIds: [{ value: '', disabled: true },],
      reportingManager: [{ value: '', disabled: true },],
      reportingManagerEmpCode: [''],
      departmentId: [''],
      designationId: [''],
      project: [{ value: '', disabled: true }],
      projectId: [''],
      emergency_contact_person: [{ value: '', disabled: true }],
      blood_group: [{ value: '', disabled: true }],
      pan_no: ['', [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/i)]],
      fdesignationId: [''],
      functional_designation: [''],
      probation: [''],
      vendorname: [''],
      contractenddate: [''],
      salarybookedproj: [''],
      salarybookedprojid: [''],
    })

    this.bankDetailsForm = this._formBuilder.group({
      acc_no: ['', [Validators.required]],
      check_acc_no: ['', [Validators.required]],
      bank_name: ['', [Validators.required]],
      bank_branch: ['', [Validators.required]],
      ifsc: ['', [Validators.required]],
      bank_doc: [''],
      bank_doc_file: [''],
      bank_file_path: [''],
      bank_file_name: ['']
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
      id: ['']
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
    this.designationForm = this._formBuilder.group({
      designationName: ['', [Validators.required]],
      id: ['', [Validators.required]]
    })
    this.getAppointmentDetails();
    this.getMasterLetters();
    this.getEmployerSocialSecurityDetails('EPF');
    this.get_att_dept_master_list();
    this.employer_details();
    this.getProjectList();
    this.get_locationtransfer();
    if (this.empDataFromParent?.emp_code) {
      this.GetServiceBook_Details();
    }
    this.functionaDesignationForm = this._formBuilder.group({
      designationName: ['', [Validators.required]],
      isFunctional: [false],
      func_designation: [''],
      id: ['', [Validators.required]]
    })
  }

  get bf() {
    return this.basic_detail_form.controls;
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
    let postData = {
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empId: this.empDataFromParent.emp_id,
      templateId: templateid
    }
    if (templateid) {
      this._EmployeemgmtService.getLetterTemplateId(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          let template = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.appointmentLetterForm.patchValue({
            template_html: template[0].templatetext,
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
        let gender = (basic_details.gender.trim().toUpperCase() == 'M' ? 'Male' : basic_details.gender.trim().toUpperCase() == 'F' ? 'Female' : basic_details.gender.trim());

        let salutation = (basic_details.gender.trim().toUpperCase() == 'M' ? 'Mr.' : basic_details.gender.trim().toUpperCase() == 'F' ? 'Ms.' : basic_details.salutation.trim());

        this.basic_detail_form.patchValue({
          name_title: '',
          name: this.cleanValue(basic_details.emp_name),
          dob: this.cleanValue(basic_details.dateofbirth),
          gender: this.cleanValue(gender),
          employee_email: this.cleanValue(basic_details.email),
          employee_mobile: this.cleanValue(basic_details.mobile),
          emergency_mobile: this.cleanValue(basic_details.emergency_contact),
          blood_relation: this.cleanValue(basic_details.bloodrelationname),
          perm_add: this.cleanValue(basic_details.emp_address),
          res_add: this.cleanValue(basic_details.residential_address),
          relation_name: this.cleanValue(basic_details.fathername),
          post_offered: this.cleanValue(basic_details.post_offered),
          doj: this.cleanValue(basic_details.dateofjoining),
          orgempcode: this.cleanValue(basic_details.orgempcode == undefined ? '' : basic_details.orgempcode),
          geo_fencing: this.cleanValue(this.candidateDetails?.GeoFenceId),
          jobType: this.cleanValue(this.candidateDetails.jobType),
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
          vendorname: this.candidateDetails.agencyname,
          contractenddate: this.candidateDetails.contractenddate,
          salarybookedproj: this.candidateDetails.salary_book_project,
          salarybookedprojid: this.candidateDetails.salary_book_project_id,
          probation: this.candidateDetails.probation_confirmation_date,

        });

        this.checkProfileEditable();
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

        this.appointmentLetterForm.patchValue({
          template: basic_details.apptempalteid,
          template_html: basic_details.appointmentletter
        })
        if (basic_details.apptempalteid) {
          this.getTemplateById(basic_details.apptempalteid, action);
        }
        if (this.candidateDetails.appointment_letter_issued == 'Y') {
          this.pdfProxy('appointment-container');
        }
        this.getMasterJobRole();
        this.getGeoFencingState();
        this.getEmployerOUorGeoFenceDetails('organization_unit');
        this.getEmployerGroFenceDetails('organization_unit_geofence');
        this.getProfileData();
      } else {
        this.toastr.error(resData.message);
      }

    })
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
        this.designationList = resData.commonData;
        this.get_att_role_master_list_for_functional_designation();
      } else {
        this.designationList = [];
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
      doj: $('#doj').val()
    })
    // this.submitted = true;

    if (this.basic_detail_form.invalid) {
      this.scrollToFirstError();
      return;
    }
    if (this.bf.pan_no.invalid) {
      if (this.bf.pan_no.errors?.pattern) {
        this.toastr.error("Invalid PAN number", "Oops");
      } else if (this.bf.pan_no.errors?.required) {
        this.toastr.warning("PAN number is required", "Oops");
      }
    }
    if (this.bf.employee_email.errors && this.bf.employee_email.errors.pattern) {
      return this.toastr.error("Invalid email!", 'Oops');
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
    if (this.bf.pan_no.value == '') {
      return this.toastr.error("Please enter Pan number", 'Oops');
    }

    // if (this.basic_detail_form.invalid) {
    //   return this.toastr.error("Please fill the required fields", 'Oops');
    // }
    let postData = {
      ...this.basic_detail_form.getRawValue(),
      updatedBy: this.empDataFromParent.emp_code,
      productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
      empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
      customerAccountId: this._EncrypterService.aesEncrypt(this.tp_account_id.toString())
    }
    this._EmployeeService.updateTpBasicDetails(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message)
        this.hideBasicDetails();

        // this.editData = false;
        // this.getEmployeeDetail();
      } else {
        this.toastr.error(resData.message);
      }

    })
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

    this._EmployeeService.updateTpKycDetails(postData1).subscribe((resData: any) => {
      if (resData.statusCode) {
      }
      else {
        this.toastr.error(resData.message);
      }
    })
  }


  get kf() {
    return this.kycForm.controls;
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
        from_date: exp.from_date.split("-").reverse().join("-"),
        to_date: exp.to_date.split("-").reverse().join("-"),
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
      this.trainingDetailForm.patchValue({
        training: training.training_name,
        completionDate: training.completion_date.split("-").reverse().join("-"),
        certification: training.certification,
        institute: training.institute,
        grade: training.grade_or_marks,
        id: training.id
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
        from_date: $('#expFrom').val().split("-").reverse().join("-"),
        to_date: $('#expTo').val().split("-").reverse().join("-"),
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
    let actionType, formData, completionDate = '';
    if (action == '') {
      if ($('#doc').val() == '') {
        return this.toastr.error("Please select completion date");
      }

      // this.trainingDetailForm.patchValue({
      //   completionDate : $('#doc').val().split("-").reverse().join("-"),
      // })
      completionDate = $('#doc').val().split("-").reverse().join("-")
      if (!this.trainingDetailForm.value.training) {
        return this.toastr.error("Please enter traninig name.");
      }
    }
    // return console.log(this.trainingDetailForm.value);

    if (!action) {
      if (!this.trainingDetailForm.value.id) {
        actionType = 'insert';
      } else {
        actionType = 'update';
      }
      formData = this.trainingDetailForm.value;
      formData = {
        ...formData,
        completionDate: completionDate
      }
    } else {
      actionType = action;
      formData = training;
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
    this._EmployeemgmtService.trainingDetails(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.getProfileData();
        this.hideTrainingModal();
      } else {
        this.toastr.error(resData.message);
      }
    })
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
    const encryptedParams = encodeURIComponent(this._EncrypterService.aesEncrypt('filled,' + this.empDataFromParent.emp_id + ',' + this.appointmentLetterForm.value.template));
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

    let postData = {
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empId: this.empDataFromParent.emp_id,
      appointmentLetterId: this.appointmentLetterForm.value.template,
      appointmentLetterHTML: this.appointmentLetterForm.value.template_html,
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

    let postData = {
      ...this.appointmentLetterForm.value,
      name: this.candidateDetails.emp_name,
      email: this.candidateDetails.email,
    }
    this._EmployeemgmtService.sendLetterMail(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
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

    this.basic_detail_form.patchValue({
      reportingManagerEmpCode: event.emp_code
    })
    // Perform actions with the selected value
  }

  onDesignationChange(event: any) {
    if (event)
      this.basic_detail_form.patchValue({
        designationId: event.dsignationid
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

  checkProfileEditable() {
    if (!this.candidateDetails || !this.candidateDetails.profile_editable_date) return;

    // Convert "MM/DD/YYYY" string to Date object
    const [day, month, year] = this.candidateDetails.profile_editable_date.split('/').map(Number);
    const profileEditableDate = new Date(year, month - 1, day); // Month is 0-based in JS Date

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to avoid time differences
    // Check if the profile_editable_date is today or a future date
    if (profileEditableDate >= today) {
      this.enableFields();
    } else {
      this.disableFields();
    }
  }

  enableFields() {
    this.isBasicEditable = true;
    this.basic_detail_form.get('blood_group')?.enable();
    this.basic_detail_form.get('emergency_mobile')?.enable();
    this.basic_detail_form.get('emergency_contact_person')?.enable();
    this.basic_detail_form.get('reportingManager')?.enable();
    this.basic_detail_form.get('res_add')?.enable();
    if (!this.basic_detail_form.get('perm_add').value) {
      this.basic_detail_form.get('perm_add').enable()
    }
  }

  disableFields() {
    this.isBasicEditable = false;
    Object.keys(this.basic_detail_form.controls).forEach(field => {
      this.basic_detail_form.get(field)?.disable();
    });
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
  showAddFunctionalDesignation(): any {
    if (!this.bf.departmentId.value) {
      return this.toastr.error("Please add or update the department first");
    }
    this.isAddFunctionalDesignation = true;

    this.functionaDesignationForm.patchValue({
      id: this.bf.departmentId.value
    })
  }
  onfDesignationChange(event: any) {
    // console.log(event);

    if (event)
      this.basic_detail_form.patchValue({
        fdesignationId: event.fdsignationid
      })
  }
  get_att_role_master_list_for_functional_designation() {
    this._attndanceService.get_att_master_list({
      "action": 'fdesignation_list_all',
      "customeraccountid": this.tp_account_id,
      "unit_id": '',
      // "designation_id": this.bf.designationId.value.toString(),
    }).subscribe((resData: any) => {
      //// console.log(resData);
      // console.log(this.candidateDetails.functional_designation);
      if (resData.statusCode) {
        this.fdesignationList = resData.commonData;
        // console.log(this.fdesignationList);

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
}
