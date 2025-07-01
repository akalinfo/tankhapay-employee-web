import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { EmployeeService } from '../employee.service';
import { Router } from '@angular/router';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { PayoutService } from '../../payout/payout.service';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { AttendanceService } from '../../attendance/attendance.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { RecruitService } from '../../recruit/recruit.service';
import { UserMgmtService } from '../../user-mgmt/user-mgmt.service';
import { dongleState, grooveState } from 'src/app/app.animation';


declare var $: any;

@Component({
  selector: 'app-edit-employee-detail',
  templateUrl: './edit-employee-detail.component.html',
  styleUrls: ['./edit-employee-detail.component.css'],
  animations: [grooveState, dongleState]
})
export class EditEmployeeDetailComponent {
  vendor_master_list_data: any = [];
  fdesignationList: any = [];
  showSidebar: boolean = true;
  basic_detail_form: FormGroup;
  token: any = '';
  empId: any = '';
  product_type: any = '';
  tp_account_id: any = '';
  routerDetails: any = '';
  candidateDetails: any = '';
  geoFencingData: any = [];
  submitted: boolean = false;
  employerOUorGeoFenceData: any = [];
  dropdownSettings = {};
  geoDropdownSettings = {};
  selectedval: any = [];
  orgGroup: any = [];
  employerGeoFenceData: any = [];
  masterJobType: any = [];
  organzationUnitList: any = [];
  deptList: any = [];
  desgList: any = [];
  orgData: any = [];
  aop: any = '';
  salaryStructure: any = '';
  basicdetailsupdated_status: any = '';
  pan_verification_status: any = '';
  aadharverfication_status: any = '';
  accountverification_status: any = '';
  ouid: any = '';
  salaryStructureView: any = '';
  pf_details: any;
  unitSalaryForm: FormGroup;
  filteredEmployees: any = [];
  designationList: any = [];
  deptartmentList: any = [];
  isAddDepartment: boolean = false;
  isAddDesignation: boolean = false;
  departmentForm: FormGroup;
  designationForm: FormGroup;
  projectList: any = [];
  showLiveLocation: string;
  accessRightsArray: any = [];

  constructor(private toastr: ToastrService,
    private _EncrypterService: EncrypterService,
    private _EmployeeService: EmployeeService,
    private _formBuilder: FormBuilder,
    private _SessionService: SessionService,
    private payOutService: PayoutService,
    private _BusinesSettingsService: BusinesSettingsService,
    private _attndanceService: AttendanceService,
    private _faceCheckinService: FaceCheckinService,
    private _recruitService: RecruitService,
    private _userMgmtService: UserMgmtService,
    private router: Router) {
    this.routerDetails = this.router.getCurrentNavigation().extras.state;

  }

  ngOnInit() {

    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;
    this.accessRightsArray = JSON.parse(localStorage.getItem('access_rights') || '[]');

    // Check if an object with modulename "Live Tracking" exists
    this.showLiveLocation = this.accessRightsArray.some(
      (item: any) => item.modulename === "Live Tracking"
    );

    this.basic_detail_form = this._formBuilder.group({
      name_title: [''],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z. ]+$')]],
      dob: ['', [Validators.required]],
      probation: [''],
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
      Validators.maxLength(10),]],
      emergency_mobile: ['', [
        Validators.pattern('^[6-9]{1}[0-9]{9}$'),
        Validators.minLength(10)
      ]],
      blood_relation: ['', [Validators.pattern(/^[a-zA-Z/ ]+$/)]],
      perm_add: ['', [Validators.required]],
      res_add: [''],
      relation_name: [''],
      post_offered: ['', [Validators.required]],
      posting_department: ['', [Validators.required]],
      doj: ['', [Validators.required]],
      orgempcode: [''],
      jobType: ['', [Validators.required]],
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
      contractenddate: [''],
      vendorname: [''],
      salarybookedproj: [''],
      salarybookedprojid: [''],
    })

    this.unitSalaryForm = this._formBuilder.group({
      unit: [''],
      department: [''],
      designation: [''],
      aop: ['']
    })

    this.departmentForm = this._formBuilder.group({
      departmentName: ['', [Validators.required]]
    })
    this.designationForm = this._formBuilder.group({
      designationName: ['', [Validators.required]],
      isFunctional: [false],
      id: ['', [Validators.required]]
    })

    let date = new Date();
    date.setFullYear(date.getFullYear() - 18);

    $('#dob').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: date
    })
    $('#probation').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true
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
    $('#contractenddate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
    })

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

    this.getAppointmentDetails();
    this.getEmployeeDetail();
    this.getGeoFencingState();
    this.getMasterJobRole();
    this.getEmployerSocialSecurityDetails('EPF');
    this.employer_details();
    this.get_att_dept_master_list();
    this.getProjectList();
    this.get_vendor_master_list();
    this.get_att_role_master_list_for_functional_designation();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get bf() {
    return this.basic_detail_form.controls;
  }

  getMasterJobRole() {
    this.payOutService.GetMaster({ actionType: 'MasterJobTypes', productTypeId: this.product_type }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.masterJobType = (resData.commonData);
      }
    })
  }

  cleanValue(value: any): string {
    if (typeof value === 'string') {
      return value.replace(/&nbsp;/g, '').replace(/\n/g, '').trim(); // Removes &nbsp;, newlines, and trims
    }
    return value; // Return as-is if it's not a string
  }

  getAppointmentDetails() {
    let emp_code = this.routerDetails.mobile + 'CJHUB' + this.routerDetails.emp_code + 'CJHUB' + this.routerDetails.dob;

    this._EmployeeService.getAppointeeDetails({
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type), 'empCode': this._EncrypterService.aesEncrypt(emp_code), 'ecStatus': this.routerDetails.ecStatus
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let appointMentDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

        this.candidateDetails = appointMentDetails.candidateDetails;
        this.candidateDetails['encrypted_empid'] = this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id + ',' + this.candidateDetails.js_id + ',' + this.routerDetails.ecStatus);

        let jsonData = this.candidateDetails.emp_address != '' ? JSON.parse(this.candidateDetails.emp_address) : this.candidateDetails.emp_address;
        let nonemptyVal = Object.values(jsonData).filter(value => value !== "");
        let perm_add = nonemptyVal.join(', ');
        this.candidateDetails.emp_address = perm_add?.replaceAll('<br>', '');

        let gender = (this.candidateDetails.gender.trim().toUpperCase() == 'M' ? 'Male' : this.candidateDetails.gender.trim().toUpperCase() == 'F' ? 'Female' : this.candidateDetails.gender.trim());

        let salutation = (this.candidateDetails.gender.trim().toUpperCase() == 'M' ? 'Mr.' : this.candidateDetails.gender.trim().toUpperCase() == 'F' ? 'Ms.' : this.candidateDetails.salutation.trim());
        this.basicdetailsupdated_status = this.candidateDetails?.basicdetailsupdated_status;

        this.aadharverfication_status = this.candidateDetails?.aadharverfication_status;
        this.pan_verification_status = this.candidateDetails?.pan_verification_status;
        this.accountverification_status = this.candidateDetails?.accountverification_status;
        let basic_details = this.candidateDetails;
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
          probation: this.candidateDetails.probation_confirmation_date,
          contractenddate: basic_details.contractenddate,
          vendorname: basic_details.agencyname,
          salarybookedproj: this.candidateDetails.salary_book_project,
          salarybookedprojid: this.candidateDetails.salary_book_project_id
        });

        if (this.candidateDetails.department_id) {
          this.get_att_role_master_list();
        }

        if (this.candidateDetails.joiningStatus == 'JOINED') {
          this.getSalaryStructure()
        }
        if (this.candidateDetails.jobType == 'Unit Parameter') {
          this.getMasterData('', '', 'master_unit_list');
        }
        this.getEmployerOUorGeoFenceDetails('organization_unit');
        this.getEmployerGroFenceDetails('organization_unit_geofence');

      } else {
        this.candidateDetails = [];
      }

    })
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


  getSalaryStructure() {
    this._EmployeeService.getSalaryStructure({
      'productTypeId': this._EncrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._EncrypterService.aesEncrypt(this.tp_account_id.toString()), 'empId':
        this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id),
      'salaryMode': 'Custom'
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.salaryStructure = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

        this.unitSalaryForm.patchValue({
          unit: this.salaryStructure.e_unitid,
          department: this.salaryStructure.e_departmentid,
          designation: this.salaryStructure.e_designationid
        })
        this.getMasterData(this.unitSalaryForm.value.unit, '', 'master_department_list')

      }
    })
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
    if (this.bf.pan_no.invalid) {
      if (this.bf.pan_no.errors?.pattern) {
        this.toastr.error("Invalid PAN number", "Oops");
      }
    }

    if (this.bf.employee_email.errors && this.bf.employee_email.errors.pattern) {
      return this.toastr.error("Invalid email!", 'Oops');
    }

    if (this.bf.employee_personal_email.errors && this.bf.employee_personal_email.errors.pattern) {
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

    if (!this.bf.posting_department.value) {
      return this.toastr.error("Please select department.", 'Oops');
    }
    if (!this.bf.post_offered.value) {
      return this.toastr.error("Please select designation.", 'Oops');
    }

    if (this.bf.jobType.value == '') {
      return this.toastr.error("Please enter job type.", 'Oops');
    }
    // if (this.basic_detail_form.invalid) {
    //   return this.toastr.error("Please fill the required fields", 'Oops');
    // }

    //console.log(this.basic_detail_form.value);
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

    let postData = {
      ...this.basic_detail_form.value,
      updatedBy: this.token.userid,
      productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
      empId: this._EncrypterService.aesEncrypt(this.candidateDetails.emp_id.toString()),
      customerAccountId: this._EncrypterService.aesEncrypt(this.tp_account_id.toString()),
      jobTypeCategory: ''
    }
    this._EmployeeService.updateTpBasicDetails(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message)
        if (this.bf.jobType.value != 'Unit Parameter')
          this.router.navigate(['/employees/view-employee-detail', this.candidateDetails.encrypted_empid])
        else this.getAppointmentDetails();
        // this.editData = false;
        // this.getEmployeeDetail();
      } else {
        this.toastr.error(resData.message);
      }

    })
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
      this._EmployeeService.updateTpKycDetails(postData1).subscribe((resData: any) => {
        if (resData.statusCode) {

        }
        else {
          this.toastr.error(resData.message);
        }
      })
    }
  }

  getEmployeeDetail() {

    this._EmployeeService.getTpCandidateDetails({ 'empId': this._EncrypterService.aesEncrypt(this.routerDetails.empId.toString()), 'productTypeId': this._EncrypterService.aesEncrypt(this.product_type) }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        // this.employeeDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData.commonData));

        this.basic_detail_form.patchValue({
          geo_fencing: resData.commonData.basicDetails.GeoFenceId
        })

      }
    })

    //   }
    // })
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

  getLiveTracking(isLiveLoc: any) {
    this.basic_detail_form.patchValue({
      live_tracking: isLiveLoc
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

  checkJobType() {
    if (this.bf.jobType.value == 'Unit Parameter') {
      this.getMasterData('', '', 'master_unit_list');
    }
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
          if (this.unitSalaryForm.value.department) {
            this.getMasterData('', this.unitSalaryForm.value.department, 'master_role_list');
          }
        } else if (action == 'master_role_list') {
          this.desgList = [];
          let orgData = resData.commonData
          this.desgList = orgData;
          if (this.unitSalaryForm.value.designation) {
            this.unitSalaryForm.patchValue({
              aop: this.desgList.filter(desg => desg.dsignationid == this.unitSalaryForm.value.designation)[0].target_offered_salary
            })
            this.getAop(this.unitSalaryForm.value.designation)
          }
          this.aop = '';
        }

      } else {
        // this.toastr.error(resData.message);
        // this.organzationUnitList = [];
        if (action == 'master_department_list') {
          this.desgList = [];
          this.deptList = [];
          this.aop = '';
          this.salaryStructure = '';
          this.salaryStructureView = '';
        } else if (action == 'master_role_list') {
          this.desgList = [];
          this.aop = '';
          this.salaryStructure = '';
          this.salaryStructureView = '';
        }
        // this.deptList=[];
      }
    })
  }



  getAop(desgid: any) {
    this.aop = '';

    this.aop = this.desgList.filter(desg => desg.dsignationid == desgid)[0].target_offered_salary;
    let desgData = this.desgList.filter(desg => desg.dsignationid == desgid)[0];
    let postData = {
      action: 'GetUnitSalaryStructure',
      "customeraccountid": this.tp_account_id.toString(),
      "organization_unitid": this.unitSalaryForm.value.unit,
      "departmentid": this.unitSalaryForm.value.department,
      "designationid": this.unitSalaryForm.value.designation,
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

    if (this.basicdetailsupdated_status != 'Y' ||
      ((!(this.aadharverfication_status == 'Y' || this.pan_verification_status == 'Y')
        || this.accountverification_status != 'Y') && this.token.payout_mode_type != 'self')) {
      return this.toastr.error("Please complete the Basic information, KYC & Bank details first!", "Oops")
    } else if (this.basicdetailsupdated_status != 'Y' && this.token.payout_mode_type == 'self') {
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
        //console.log(this.candidateDetails.encrypted_empid);

        this.router.navigate(['/employees/view-employee-detail', this.candidateDetails.encrypted_empid])
        // // this.edit_custom_salary = false;
        // this.customCalculatedData ='';
        // this.getAppointmentDetails();
        // this.isCustomEditSal=false;
        // this.restructureMode = '';
        // this.isCustomInputTrigger = false;
        // localStorage.setItem('restructureMode','');
        // this.isShowSalaryTable=false;
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
        this.pf_details = resData.commonData;
      }
    })
  }

  routeToUnit() {
    if (this.ouid == '') {
      return;
    }
    this.router.navigate(['business-settings/unit-parameter-settings', this._EncrypterService.aesEncrypt(this.ouid.toString())])
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

        } else {
          // this.toastr.error(resData.message);
          this.filteredEmployees = [];
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
      func_designation: this.designationForm.value.isFunctional == true
        ? this.designationForm.value.designationName
        : '',
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
  //   console.log(project)
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
  onfDesignationChange(event: any) {
    // console.log(event);

    if (event)
      this.basic_detail_form.patchValue({
        fdesignationId: event.fdsignationid
      })
  }
  get_att_role_master_list_for_functional_designation() {
    // console.log('ssssssssss');

    this._attndanceService.get_att_master_list({
      "action": 'fdesignation_list_all',
      "customeraccountid": this.tp_account_id,
      "unit_id": '',
      // "designation_id": this.bf.designationId.value.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);

      if (resData.statusCode) {
        this.fdesignationList = resData.commonData;
        setTimeout(() => {
          const a = Number(this.candidateDetails.functional_designation);
          this.basic_detail_form.patchValue({
            functional_designation: a
          });
        });
      } else {
        this.fdesignationList = [];
      }
    })

  }
  onselectsalarybookedproj(project: object) {
    if (project) {
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

        this.toastr.error('No data found');

      }
    }, (error: any) => {

      this.vendor_master_list_data = []
      this.toastr.error('No data found');

    })
  }
}