import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { SessionService } from 'src/app/shared/services/session.service';
import { UserMgmtService } from '../../user-mgmt/user-mgmt.service';
import { ShiftSpecificService } from '../../attendance/shift-specific-service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { BusinesSettingsService } from '../business-settings.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
// import { ConsoleService } from '@ng-select/ng-select/lib/console.service';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';
import { lastValueFrom } from 'rxjs';

declare var $:any;

@Component({
  selector: 'app-approval-workflow',
  templateUrl: './approval-workflow.component.html',
  styleUrls: ['./approval-workflow.component.css'],
  animations: [grooveState, dongleState]
})
export class ApprovalWorkflowComponent {

  showAddApprovalModal: boolean = false;
  approvalForm: FormGroup;
  approvalWorkFlowData: any = [];
  approvalWorkFlowData_copy: any = [];
  showApprovalDetails: boolean = false;
  tp_account_id: any;
  decoded_token: any;
  empl_mobile_no: any;
  approval_type_master_data: any = [];
  approval_level_master_data: any = [];
  approval_module_master_data: any = [];
  userList_original: any = [];
  userList_modified: any = [];
  allRolesData: any = [];
  allDepartmentsData: any = [];
  showSidebar: boolean = true;
  add_update_workflow_title: any = '';
  sub_user_list_data: any = [];
  empDropdownSettings: any;
  desgDropdownSettings: any;
  moduleDropdownSettings: any = {};
  employeeDropdownSettings: any = {};
  designationListData: any = [];
  dept_employee_list: any = [];
  selected_emp_code_data: any = [];
  search_keyword: any = '';
  filter_by: any = 'Employee';
  templateDataObj: any;

  // previousSelectedModules: any = [];

  constructor(
    private _formBuilder: FormBuilder,
    private _sessionService: SessionService,
    private _userMgmtService: UserMgmtService,
    private shiftSettingService: ShiftSpecificService,
    private _encrypterService: EncrypterService,
    private _commonService: FaceCheckinService,
    private _businessSettingsService: BusinesSettingsService,
    private toastr: ToastrService,
    private confirmationDialogService: ConfirmationDialogService,
  ) {
    // this.empDropdownSettings = {
    //   singleSelection: true,
    //   idField: 'emp_code',
    //   textField: 'emp_name',
    //   allowSearchFilter: true,
    //   // closeDropDownOnSelection: true,
    // };
  }

  ngOnInit() {

    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);

    this.tp_account_id = this.decoded_token.tp_account_id;

    this.approvalForm = this._formBuilder.group({
      row_id: [''],
      template_name: ['', [Validators.required]],

      department_id: ['', [Validators.required]],
      department_name: ['', [Validators.required]],

      approval_module_id: ['', [Validators.required]],
      approval_module_name: [''],

      template_mode: ['', [Validators.required]],
      emp_code_data: ['', [Validators.required]],

      reporting_to_level: ['', [Validators.required]],
      approval_level_name: [''],

      designation_data: ['', [Validators.required]],

      approval_txt: this._formBuilder.array([]),

    });

    // this.onReportingLevelChange();

    this.desgDropdownSettings = {
      singleSelection: false,
      idField: 'dsignationid',
      textField: 'designationname',
      allowSearchFilter: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableCheckAll: true,
      // closeDropDownOnSelection: true,
    };

    this.moduleDropdownSettings = {
      singleSelection: false,
      idField: 'approval_module_id',
      textField: 'approval_module_name',
      allowSearchFilter: true,
      enableCheckAll: false,
      // closeDropDownOnSelection: true,
    };
    this.employeeDropdownSettings = {
      singleSelection: false,
      idField: 'emp_code',
      textField: 'emp_name',
      allowSearchFilter: true,
      // closeDropDownOnSelection: true,
    };

    this.get_approval_list();
    this.get_approval_type_master();
    this.get_approval_level_master();
    this.get_approval_module_master();
    this.getUserList();
    this.getRoles();
    this.getDepartmentData();

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }


  get_approval_type_master() {
    this._businessSettingsService.manage_approval_master({
      'action': 'get_approval_type_master',
      'accountid': this.tp_account_id,
    }).subscribe({
      next: (resData: any) => {
        if (resData.status) {
          this.approval_type_master_data = resData.commonData;
          // console.log(this.approval_type_master_data);

        } else {
          this.approval_type_master_data = [];
        }
      }
    })
  }

  get_approval_level_master() {
    this._businessSettingsService.manage_approval_master({
      'action': 'get_approval_level_master',
      'accountid': this.tp_account_id,
    }).subscribe({
      next: (resData: any) => {
        if (resData.status) {
          this.approval_level_master_data = resData.commonData;

          // console.log('level_master_data', this.approval_level_master_data);

        } else {
          this.approval_level_master_data = [];
        }
      }
    })
  }

  get_approval_module_master() {
    this._businessSettingsService.manage_approval_master({
      'action': 'get_approval_module_master',
      'accountid': this.tp_account_id,
    }).subscribe({
      next: (resData: any) => {
        if (resData.status) {
          this.approval_module_master_data = resData.commonData;

        } else {
          this.approval_module_master_data = [];
        }
      }
    })
  }

  async getUserList() {
    let obj =
    {
      customeraccountid: this.tp_account_id.toString(),
      productTypeId: this.decoded_token.product_type.toString(),
      GeoFenceId: this.decoded_token.geo_location_id
    }

    await this.shiftSettingService.getUserList(obj)
      .subscribe((res: any) => {
        if (res.statusCode) {
          this.userList_original = [];
          this.userList_modified = [];

          let userList_original = res.commonData;
          userList_original.map((item) => {
            if (item.joiningstatus.trim() == 'Active' && item.dateofrelieveing == '') {
              this.userList_original.push({ ...item }); // shallow copy
              item.emp_name = item.emp_name + ` (${item.orgempcode != '' ? item.orgempcode : (item.tpcode ? item.tpcode : item.emp_code)})`
              this.userList_modified.push({ ...item }); // shallow copy
            }
          })

          // console.log('employees', this.userList_modified);
        } else {

        }
      })
  }

  getRoles() {
    this._userMgmtService.getRoles({
      'customerAccountId': this._encrypterService.aesEncrypt(this.tp_account_id.toString())
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.allRolesData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        // console.log('roles', this.allRolesData);
      } else {
        this.allRolesData = [];
      }
    })
  }

  get_sub_user_list_by_role_id(role_id: any, index: any) {
    const approvalTxt = this.approvalTxtArray;
    const targetGroup = approvalTxt.at(index) as FormGroup;
    targetGroup.get('userOptions')?.setValue([]);
    this._businessSettingsService.manage_approval_master({
      'action': 'get_sub_user_list_by_role_id',
      'accountid': this.tp_account_id.toString(),
      'row_id': role_id,
    }).subscribe((resData: any) => {
      if (resData.status) {
        this.sub_user_list_data = resData.commonData;
        // console.log('subusers', this.sub_user_list_data);
        targetGroup.get('userOptions')?.setValue(this.sub_user_list_data);

      } else {
        this.sub_user_list_data = [];
      }
    })
  }

  async getDepartmentData() {
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
    await this._commonService.getemployeeList(obj).subscribe((res: any) => {
      if (res.statusCode) {
        this.allDepartmentsData = JSON.parse(this._encrypterService.aesDecrypt(res.commonData));
        // console.log(this.allDepartmentsData);
      } else {
        this.allDepartmentsData = [];
      }
    })
  }

  get approvalTxtArray(): FormArray {
    return this.approvalForm.get('approval_txt') as FormArray;
  }

  change_department(e: any) {
    this.dept_employee_list = [];
    this.approvalForm.patchValue({
      emp_code_data: ''
    })

    this.approvalForm.patchValue({
      designation_data: '',
      emp_code_data: ''
    })
    if (e.target.value) {

      const selectedDepartment = this.allDepartmentsData.find(dept => dept.id == e.target.value);
      if (selectedDepartment) {
        this.approvalForm.patchValue({
          department_name: selectedDepartment.departmentname,
        })

      }

      this.get_designation_list();
    } else {

    }
  }

  onDesgSelect(item: any) {
    this.get_dept_employee_list();

  }
  onDesgDeSelect(item: any) {
    this.get_dept_employee_list();
  }

  onDesgSelectAll(item: any) {
    setTimeout(() => {
      this.get_dept_employee_list();
    }, 0)
  }

  onDesgDeSelectAll(item: any) {
    this.dept_employee_list = [];
    this.approvalForm.patchValue({
      emp_code_data: ''
    })
  }

  onModuleSelect(item: any) {
  
    // let temp_2 = this.approvalForm.value.row_id.split(',');
    // temp_2.push(',');
    // this.approvalForm.patchValue({
    //   row_id: temp_2.join(',')
    // });

    // this.previousSelectedModules = [...this.approvalForm.get('approval_module_id')?.value.join(',')];

  }

  onModuleDeSelect(deselectedItem: any) {

    if(this.add_update_workflow_title == 'Update'){
      this.approvalForm.get('approval_module_id')?.value.push(deselectedItem);
      this.approvalForm.patchValue({
        approval_module_id: this.approvalForm.get('approval_module_id')?.value
      });
    }
  }

  get_designation_list() {
    this.designationListData = [];

    this._businessSettingsService.manage_approval_master({
      'action': 'get_designation_list',
      'accountid': this.tp_account_id,
      'department_id': this.approvalForm.value.department_id.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.status) {
          this.designationListData = resData.commonData;
          // console.log(this.designationListData);

        } else {
          this.designationListData = [];
        }
      }
    })
  }

  // change_module(e: any) {
  //   if (e.target.value) {
  //     const selectedModule = this.approval_module_master_data.find(module => module.approval_module_id == e.target.value);
  //     if (selectedModule) {
  //       this.approvalForm.patchValue({
  //         approval_module_name: selectedModule.approval_module_name,
  //       })
  //     }
  //   }
  // }


  onReportingLevelChange(e: any): void {
    const reportingLevel = this.approvalForm.get('reporting_to_level')?.value || 0;
    this.adjustApprovalLevels(reportingLevel);

    if (e.target.value) {
      const selectedLevel = this.approval_level_master_data.find(level => level.approval_level_id == e.target.value);
      if (selectedLevel) {
        this.approvalForm.patchValue({
          approval_level_name: selectedLevel.approval_level_name,
        })
      }
    }
  }

  adjustApprovalLevels(levelCount: number): void {
    // const approvalTxt = this.approvalForm.get('approval_txt') as FormArray;
    // approvalTxt.clear(); // Clear existing levels

    // for (let i = 1; i <= levelCount; i++) {
    //   approvalTxt.push(
    //     this._formBuilder.group({
    //       approval_level_id: [i.toString(), Validators.required],
    //       approval_type_id: [null, Validators.required],
    //       approval_role_id: ['', Validators.required],
    //       op_emp_code: ['', Validators.required],
    //     })
    //   );
    // }
  }

  // onUserSelect(item: any, index:any) {
  //   console.log('Selected User:', item);
  //   console.log(this.approvalForm.value.op_emp_code);
  //   const approvalTxt = this.approvalTxtArray;

  //   if (index >= 0 && index < approvalTxt.length) {
  //     const targetGroup = approvalTxt.at(index) as FormGroup;
  //     targetGroup.patchValue({ approval_role_id: '', approval_sub_user_id:'', approval_sub_user_name: '', userOptions: [[]], });
  //   } else {
  //     console.error(`Index ${index} is out of bounds for approval_txt.`);
  //   }
  // }

  // onUserDeSelect(item: any, index:any) {
  //   console.log('Deselected User:', item);
  //   console.log(this.approvalForm.value.op_emp_code);

  //   const approvalTxt = this.approvalTxtArray;

  //   if (index >= 0 && index < approvalTxt.length) {
  //     const targetGroup = approvalTxt.at(index) as FormGroup;
  //     targetGroup.patchValue({ approval_role_id: '', approval_sub_user_id:'', approval_sub_user_name: '', userOptions: [[]], });
  //   } else {
  //     console.error(`Index ${index} is out of bounds for approval_txt.`);
  //   }
  // }

  change_op_emp_code(index: any) {
    const approvalTxt = this.approvalTxtArray;

    if (index >= 0 && index < approvalTxt.length) {
      const targetGroup = approvalTxt.at(index) as FormGroup;
      targetGroup.patchValue({ approval_role_id: '', approval_sub_user_id: '', approval_sub_user_name: '', userOptions: [[]], });
    } else {
      console.error(`Index ${index} is out of bounds for approval_txt.`);
    }
  }

  change_approval_role_id(index: any) {
    const approvalTxt = this.approvalTxtArray;
    const targetGroup = approvalTxt.at(index) as FormGroup;

    let selectedRoleId = targetGroup.value.approval_role_id;

    if (selectedRoleId) {
      targetGroup.patchValue({ approval_sub_user_id: '', approval_sub_user_name: '' });
      this.get_sub_user_list_by_role_id(selectedRoleId, index);
    } else {
      // Clear user options and reset selections
      targetGroup.patchValue({ approval_sub_user_id: '', approval_sub_user_name: '' });
      targetGroup.get('userOptions')?.setValue([]);
    }


    if (index >= 0 && index < approvalTxt.length) {
      // console.log(targetGroup);
      targetGroup.patchValue({ op_emp_code: '' });
    } else {
      console.error(`Index ${index} is out of bounds for approval_txt.`);
    }
  }

  delete_level(index: any) {
    const approvalTxt = this.approvalTxtArray;

    if (index >= 0 && index < approvalTxt.length) {
      approvalTxt.removeAt(index);
      this.updateApprovalLevelIds();

      let approvalTxtLength = !approvalTxt.length ? 0 : approvalTxt.length;
      this.approvalForm.patchValue({
        'reporting_to_level': approvalTxtLength
      })

      const selectedLevel = this.approval_level_master_data.find(level => level.approval_level_id == approvalTxtLength);
      if (selectedLevel) {
        this.approvalForm.patchValue({
          approval_level_name: selectedLevel.approval_level_name,
        })
      }

    } else {
      console.error(`Index ${index} is out of bounds for approval_txt.`);
    }
  }

  updateApprovalLevelIds(): void {
    const approvalTxt = this.approvalTxtArray;

    approvalTxt.controls.forEach((control, idx) => {
      control.patchValue({
        approval_level_id: (idx + 1).toString(),
      });
    });
  }

  addNewLevel() {
    const approvalTxtArray = this.approvalForm.get('approval_txt') as FormArray;
    const levelGroup = this._formBuilder.group(
      {
        approval_level_id: [(approvalTxtArray.length + 1).toString(), Validators.required],
        approval_type_id: [null, Validators.required],
        approval_role_id: [''],
        op_emp_code: [''],
        approval_sub_user_id: [''],
        approval_sub_user_name: [''],
        userOptions: [[]],
      },
    );

    approvalTxtArray.push(levelGroup);

    const approvalTxt = this.approvalTxtArray;
    let approvalTxtLength = !approvalTxt.length ? 0 : approvalTxt.length;
    this.approvalForm.patchValue({
      'reporting_to_level': approvalTxtLength
    })

    const selectedLevel = this.approval_level_master_data.find(level => level.approval_level_id == approvalTxtLength);
    if (selectedLevel) {
      this.approvalForm.patchValue({
        approval_level_name: selectedLevel.approval_level_name
      })
    }
  }


  // new asyn logic - sidharth kaul dated. 16.05.2025
  async get_approval_list(): Promise<void> {
  this.approvalWorkFlowData = [];
  this.approvalWorkFlowData_copy = [];

  try {
    const resData: any = await lastValueFrom(
      this._businessSettingsService.manage_approval_master({
        action: 'get_approval_list',
        accountid: this.tp_account_id,
      })
    );

    if (resData.status) {
      this.approvalWorkFlowData = resData.commonData;
      this.approvalWorkFlowData_copy = this.deepCopyArray(resData.commonData);
      console.log('Approval Workflow Data --', this.approvalWorkFlowData);
    } else {
      this.approvalWorkFlowData = [];
    }
  } catch (error) {
    console.error('Error fetching approval list:', error);
  }
}


  insert_update_approval_template() {

    let data = this.approvalForm.value;
    // this.logInvalidFields();

    let isValid = true;
    let isDuplicateEmp = false;
    let isDuplicateRole = false;
    const seenOpEmpCodes = new Set<string>();
    const seenApprovalRoleIds = new Set<string>();

    this.approvalTxtArray.controls.forEach((control) => {
      const opEmpCode = control.get('op_emp_code')?.value;
      const approvalRoleId = control.get('approval_role_id')?.value;
      const approval_sub_user_id = control.get('approval_sub_user_id')?.value;

      if (!opEmpCode && !approvalRoleId) {
        isValid = false;
        return;
      }

      if (opEmpCode) {
        if (seenOpEmpCodes.has(opEmpCode.toString())) {
          isDuplicateEmp = true;
        } else {
          seenOpEmpCodes.add(opEmpCode.toString());
        }
      }

      if (approvalRoleId) {
        if (seenApprovalRoleIds.has(approvalRoleId.toString())) {
          isDuplicateRole = true;
        } else {
          seenApprovalRoleIds.add(approvalRoleId.toString());
        }

        if (!approval_sub_user_id) {
          isValid = false;
        }
      }
    });

    if (isDuplicateEmp) {
      this.toastr.error('Please check for duplicate approval levels assigned to the same employee', 'Oops!');
      return;
    }

    if (isDuplicateRole) {
      this.toastr.error('Please check for duplicate approval levels assigned to the same role', 'Oops!');
      return;
    }

    let designation_id = '';
    let designation_name = '';

    if (data.designation_data && data.designation_data.length > 0) {
      designation_id = data.designation_data.map(item => item.dsignationid).join(",");
      designation_name = data.designation_data.map(item => item.designationname).join(",");

    } else {
      this.toastr.error('Please select atleast one designation', 'Oops!');
      return;
    }

    let emp_codes = '';
    if (data.emp_code_data && data.emp_code_data.length > 0) {
      emp_codes = data.emp_code_data.map(item => item.emp_code).join(",");
    }

    let approval_module_id = '';
    if (this.add_update_workflow_title == 'Add' || this.add_update_workflow_title == 'Update') {
      approval_module_id = data.approval_module_id.map(item => item.approval_module_id).join(",");
    } else if (this.add_update_workflow_title == 'Update') {
      approval_module_id = data.approval_module_id;
    }

    let local_action = this.add_update_workflow_title == 'Add' ? 'insert_approval_template' : 'update_approval_template';

    if (this.approvalForm.valid && this.approvalTxtArray.length > 0 && isValid) {
      data.approval_txt = data.approval_txt.map((level: any) => {
        const { userOptions, approval_sub_user_name, ...rest } = level;
        return rest;
      });

      let obj = {
        'local_action': local_action,
        'action': 'insert_update_approval_template',
        'accountid': this.tp_account_id,
        'template_name': data.template_name,
        'department_id': data.department_id,
        'department_name': data.department_name,
        'approval_module_id': approval_module_id,
        'template_mode': data.template_mode,
        'emp_codes': emp_codes,
        'reporting_to_level': data.reporting_to_level,
        'approval_txt': data.approval_txt,
        'row_id': (this.add_update_workflow_title == 'Add') ? '' : (!data.row_id ? '' : data.row_id),
        'designation_id': designation_id,
        'designation_name': designation_name,
      }
      // console.log("TEST OBJ", obj);

      this._businessSettingsService.insert_update_approval_template(obj).subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_approval_list();
            this.closeAddApprovalModal();
            this.toastr.success(resData.message, 'Success');
          } else {
            if(resData?.commonData == 'closeModal'){
              this.toastr.info(resData.message, 'Info!');
              this.closeAddApprovalModal();
            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          }
        }
      })

    } else {
      this.toastr.error('Please fill all the fields', 'Oops!');
    }

  }

  openAddApprovalModal() {
    this.showAddApprovalModal = true;
    this.add_update_workflow_title = 'Add';

    this.approvalForm.patchValue({
      row_id: '',
      template_name: '',

      department_id: '',
      department_name: '',

      approval_module_id: '',
      approval_module_name: '',
      template_mode: '',
      emp_code_data: '',

      reporting_to_level: '',
      approval_level_name: '',
      designation_data: '',

      approval_txt: [],
    });
    const approvalTxtArray = this.approvalTxtArray;
    approvalTxtArray.clear();

  }
  closeAddApprovalModal() {
    this.showAddApprovalModal = false;
    this.showApprovalDetails = false;
    this.selected_emp_code_data = [];

    this.approvalForm.patchValue({
      row_id: '',
      template_name: '',

      department_id: '',
      department_name: '',

      approval_module_id: '',
      approval_module_name: '',
      template_mode: '',
      emp_code_data: '',

      reporting_to_level: '',
      approval_level_name: '',

      designation_data: '',

      approval_txt: [],
    });
    const approvalTxtArray = this.approvalTxtArray;
    approvalTxtArray.clear();

  }

  openApprovalDetails() {
    this.showApprovalDetails = true;
  }

 openEditApprovalModal(data: any) {
  this.showAddApprovalModal = true;
  this.showApprovalDetails = true;
  this.add_update_workflow_title = data.is_enable === 'Y' ? 'Update' : 'View';

  // Designation Parsing
  const ids = data.aw_designation_id.split(",").map(id => id.trim());
  const names = data.aw_designation_name.split(",").map(name => name.trim());
  const designation_data = ids.map((id, index) => ({
    dsignationid: parseInt(id, 10),
    designationname: names[index]
  }));

  // Module Info Mapping
  const module_name_data = data?.workflow_details?.map(item => ({
    approval_module_id: item.approval_module_id,
    approval_module_name: item.approval_module_name
  })) || [];

  const row_id_data = data?.workflow_details?.map(item => item.row_id).join(',') || '';
  const associated_emp_codes = data?.workflow_details?.[0]?.associated_emp_codes || [];

  // Patch basic fields
  this.approvalForm.patchValue({
    row_id: row_id_data,
    template_name: data.template_name,
    department_id: data.department_id ? parseInt(data.department_id) : '',
    department_name: data.department_name,
    approval_module_id: module_name_data,
    approval_module_name: data?.workflow_details?.[0]?.approval_module_name || '',
    template_mode: data.template_mode,
    emp_code_data: associated_emp_codes,
    reporting_to_level: data.reporting_to_level,
    approval_level_name: data.approval_level_name,
    designation_data: designation_data
  });

  // Handle FormArray (approval_txt)
  const approvalTxtArray = this.approvalForm.get('approval_txt') as FormArray;
  approvalTxtArray.clear();

  const workflowDetails = data?.workflow_details?.[0]?.approval_workflow_detail || data?.approval_workflow_detail || [];

  workflowDetails.forEach(item => {
    approvalTxtArray.push(this._formBuilder.group({
      approval_level_id: [item.approval_level_id?.toString() || '', [Validators.required]],
      approval_type_id: [item.approval_type_id?.toString() || '', [Validators.required]],
      approval_role_id: [item.approval_role_id?.toString() || ''],
      op_emp_code: [item.op_emp_code?.toString() || ''],
      approval_sub_user_id: [item.approval_sub_user_id?.toString() || ''],
      approval_sub_user_name: [item.user_fullname || ''],
      userOptions: [[]]
    }));
  });

  // Set selected emp codes
  this.selected_emp_code_data = associated_emp_codes;

  // Get designation list based on dept
  if (data.department_id) {
    this.get_designation_list();
  }

  // Fetch dept-wise employees if updating
  if (this.add_update_workflow_title === 'Update') {
    this.get_dept_employee_list();
  }

  // console.log('Modal data loaded', data);
}

  show_hide_add_btn() {
    if (this.approvalTxtArray && this.approvalTxtArray.length >= this.approval_level_master_data.length) {
      return false;
    } else {
      return true;
    }
  }

  enable_disable_work_flow(e: any, row_arr: any) {
    
    let status = e.target.checked;
    let dml_type = status ? 'enable' : 'disable';

    for(let data of row_arr) {
    this._businessSettingsService.enable_desable_remove_work_flow({
      'accountid': this.tp_account_id,
      'row_id': data?.row_id,
      'dml_type': dml_type,

    }).subscribe({
      next: (resData: any) => {
        if (resData.status && resData.commonData[0]?.msgcd == '1') {
          this.toastr.success(resData.commonData[0].msg, 'Success');

        } else if (resData.status && resData.commonData[0]?.msgcd == '0') {
          this.toastr.info(resData.commonData[0].msg, 'Info');
        } else {
          this.toastr.error(resData.message, "Oops!");
        }
        this.get_approval_list();

      }
    })
  }
  }

  openDeleteModal(data:any){
    this.templateDataObj = data;
    // console.log("OPEN DELETE", this.templateDataObj);
  }

  remove_work_flow(row_id: any) {
    this.confirmationDialogService.confirm('Are you sure you want to remove this record ?', 'Confirm').subscribe(result => {
      if (result) {
        this._businessSettingsService.enable_desable_remove_work_flow({
          'accountid': this.tp_account_id,
          'row_id': row_id,
          'dml_type': 'remove',

        }).subscribe({
          next: async (resData: any) => {
            if (resData.status && resData.commonData[0]?.msgcd == '1') {
              this.toastr.success(resData.commonData[0].msg, 'Success');
               await this.get_approval_list();
              
              // const result = this.approvalWorkFlowData.find(item =>  
              //   item.template_name == this.templateDataObj?.template_name
              // );
              const result = this.approvalWorkFlowData.find(item => {
              return  item.template_name == this.templateDataObj?.template_name &&
                      item.department_name == this.templateDataObj?.department_name &&
                      item.department_id == this.templateDataObj?.department_id &&
                      item.aw_designation_id == this.templateDataObj?.aw_designation_id &&
                      item.template_mode == this.templateDataObj?.template_mode 
              });
              
              this.templateDataObj = result;
              if(!this.templateDataObj?.workflow_details || this.templateDataObj?.workflow_details.length == 0){
                ($('#SendMessage1') as any).modal('hide');
              }

            } else if (resData.status && resData.commonData[0]?.msgcd == '0') {
              this.toastr.info(resData.commonData[0].msg, 'Info');
              this.get_approval_list();
            } else {
              this.toastr.error(resData.message, "Oops!");
            }
          }
        })

      } else {
      }
    });
  }


  get_label(data: any) {

    // console.log(data);
    // console.log(this.userList_modified, this.allRolesData,'sub_user_list_data',this.sub_user_list_data);

    if (data.op_emp_code) {
      const selected = this.userList_modified.find(user => user.emp_code == data.op_emp_code);
      return selected?.emp_name;

    } else if (data.approval_role_id) {
      const selected = this.allRolesData.find(role => role.role_id == data.approval_role_id);
      return selected?.role_name + ' [ ' + data?.approval_sub_user_name + ' ] ';

    } else {
      return 'N/A';
    }
  }

  logInvalidFields(): void {
    const invalidFields = [];

    Object.keys(this.approvalForm.controls).forEach((key) => {
      const control = this.approvalForm.get(key);
      if (control && control.invalid) {
        invalidFields.push({
          field: key,
          errors: control.errors,
        });
      }
    });

    console.log('Invalid Fields:', invalidFields);
  }

  get_dept_employee_list() {
    let data = this.approvalForm.value;
    // console.log(this.selected_emp_code_data);

    // console.log(data);
    let department_id = data.department_id;
    let designation_id = data.designation_data.map((el: any) => el.dsignationid).join(",");

    if (!department_id || !designation_id) {
      this.toastr.error('Please select Department and atleast one Desgination for employee list', 'Oops!');
      this.selected_emp_code_data = [];
      this.approvalForm.patchValue({
        emp_code_data: this.selected_emp_code_data
      });

    } else {
      this._businessSettingsService.manage_approval_master({
        'action': 'get_dept_employee_list',
        'accountid': this.tp_account_id,
        'department_id': department_id.toString(),
        'designation_id': designation_id,
      }).subscribe({
        next: (resData: any) => {
          if (resData.status) {
            this.dept_employee_list = resData.commonData;
            this.dept_employee_list.forEach((el: any) => {
              el['emp_name'] = el.emp_name + ' (' + el.tpcode + ')';

              // if (this.add_update_workflow_title == 'Update') {
              //   let idx = this.selected_emp_code_data.findIndex((t1:any) => t1.emp_code == el.emp_code)
              //   if (idx != -1) {
              //     this.selected_emp_code_data[idx].emp_name = el.emp_name
              //   } else {
              //     this.selected_emp_code_data.splice(idx, 1);
              //   }
              // }
            });
            // console.log(this.dept_employee_list);

          } else {
            this.dept_employee_list = [];
            this.selected_emp_code_data = [];
          }

          if (this.add_update_workflow_title == 'Update') {
            const empCodeSet = new Set(this.dept_employee_list.map(emp => emp.emp_code));
            const commonObjects = this.selected_emp_code_data.filter(emp => empCodeSet.has(emp.emp_code));

            // console.log('common', commonObjects);
            // console.log(this.selected_emp_code_data);
            this.approvalForm.patchValue({
              emp_code_data: commonObjects
            })

            this.selected_emp_code_data = commonObjects;

          }
        }
      })
    }

  }

  onEmployeeSelect(item: any) {
    this.selected_emp_code_data.push(item);
    // console.log(this.approvalForm.value.emp_code_data);
  }

  onEmployeeDeSelect(item: any) {
    let idx = this.selected_emp_code_data.findIndex((el: any) => el.emp_code == item.emp_code);

    if (idx != -1) {
      this.selected_emp_code_data.splice(idx, 1);
    }
  }

  onEmployeeSelectAll(item: any) {
    // console.log(item);
    this.selected_emp_code_data = [];
    item.forEach((el: any) => this.selected_emp_code_data.push(el));
    // console.log(this.selected_emp_code_data);
  }

  onEmployeeDeSelectAll(item: any) {
    this.selected_emp_code_data = [];
  }


  showEmpNamesModal: boolean = false;
  empNamesModalData: any = [];

  openEmpNamesModal(associated_emp_codes_data: any, data: any) {
    if (associated_emp_codes_data) {
      this.empNamesModalData = associated_emp_codes_data;
      this.showEmpNamesModal = true;

      // console.log(associated_emp_codes_data);

    } else {
      this.empNamesModalData = [];
    }

    const ids = data?.aw_designation_id.split(",");
    const names = data?.aw_designation_name.split(",");

    const designation_data = ids.map((id, index) => ({
      dsignationid: parseInt(id),
      designationname: names[index]
    }));

    const associated_emp_codes = !data?.workflow_details[0]?.associated_emp_codes ? [] : data?.workflow_details[0]?.associated_emp_codes;
    // this.selected_emp_code_data = associated_emp_codes.map((id, index) => ({
    //   emp_code: parseInt(id),
    // }));
    this.selected_emp_code_data = associated_emp_codes;

    this.approvalForm.patchValue({
      row_id: data.row_id,
      template_name: data.template_name,

      department_id: !data.department_id ? '' : parseInt(data.department_id),
      department_name: data.department_name,

      approval_module_id: !data.approval_module_id ? '' : parseInt(data.approval_module_id),
      approval_module_name: data.approval_module_name,
      template_mode: data.template_mode,
      emp_code_data: associated_emp_codes,

      reporting_to_level: data.reporting_to_level,
      approval_level_name: data.approval_level_name,

      // approval_txt: data.approval_workflow_detail,

      designation_data: designation_data,
    });

    const approvalTxtArray = this.approvalTxtArray;
    approvalTxtArray.clear();

    data?.workflow_details[0]?.approval_workflow_detail?.forEach((item) => {
      const requiredFields = {
        approval_level_id: [item.approval_level_id, [Validators.required]],
        approval_type_id: [item.approval_type_id, [Validators.required]],
        approval_role_id: [item.approval_role_id || ''],
        op_emp_code: [item.op_emp_code?.toString() || ''],
        approval_sub_user_id: [item.approval_sub_user_id || ''],
        approval_sub_user_name: [item.user_fullname || ''],
        userOptions: [[]],
      };

      approvalTxtArray.push(this._formBuilder.group(requiredFields));
    });

  }

  closeEmpNamesModal() {
    this.empNamesModalData = [];
    this.showEmpNamesModal = false;
    this.closeAddApprovalModal();
  }

  search() {
    // console.log(this.approvalWorkFlowData_copy);
    if (!this.search_keyword) {
      this.approvalWorkFlowData = this.deepCopyArray(this.approvalWorkFlowData_copy);
    } else {
      
      let key = this.search_keyword.toLowerCase();

      if (this.filter_by == 'Employee') {
        this.approvalWorkFlowData = this.approvalWorkFlowData_copy.filter((el: any) => {
          return el?.workflow_details[0]?.associated_emp_codes?.some((emp: any) =>
            emp.emp_name.toLowerCase().includes(key)
          ) || el?.template_name?.toLowerCase().includes(key)
            || el?.department_name?.toLowerCase().includes(key)
        })
      } else if (this.filter_by == 'Approver') {
        this.approvalWorkFlowData = this.approvalWorkFlowData_copy.filter((el: any) => {
          return el?.workflow_details[0]?.approval_workflow_detail?.some((emp: any) =>
            emp?.emp_name?.toLowerCase().includes(key) ||
            emp?.cjcode?.toLowerCase().includes(key) ||
            emp?.orgempcode?.toLowerCase().includes(key) ||
            emp?.user_fullname?.toLowerCase().includes(key) ||
            emp?.role_name?.toLowerCase().includes(key)
          ) || el?.template_name?.toLowerCase().includes(key)
            || el?.department_name?.toLowerCase().includes(key)
        })
      }
    }
  }


  /**Deep Copy**/
  deepCopyArray(arr) {
    const copy = [];

    arr.forEach(item => {
      if (Array.isArray(item)) {
        copy.push(this.deepCopyArray(item)); // Recursively copy arrays
      } else if (typeof item === 'object' && item !== null) {
        copy.push(this.deepCopyObject(item)); // Recursively copy objects
      } else {
        copy.push(item); // Copy primitive values
      }
    });

    return copy;
  }
  deepCopyObject(obj) {
    const copy = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          copy[key] = this.deepCopyArray(obj[key]); // Recursively copy arrays
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          copy[key] = this.deepCopyObject(obj[key]); // Recursively copy objects
        } else {
          copy[key] = obj[key]; // Copy primitive values
        }
      }
    }

    return copy;
  }
  /**Deep Copy**/
}

