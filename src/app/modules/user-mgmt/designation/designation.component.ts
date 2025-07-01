import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import { RecruitService } from '../../recruit/recruit.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { AttendanceService } from '../../attendance/attendance.service';
import { UserMgmtService } from '../user-mgmt.service';
import { dongleState, grooveState } from 'src/app/app.animation';
declare var $: any;
@Component({
  selector: 'app-designation',
  templateUrl: './designation.component.html',
  styleUrls: ['./designation.component.css'],
  animations: [grooveState, dongleState]
})
export class DesignationComponent {
  deptartmentList: any = [];
  tp_account_id: any = '';
  token: any = '';
  product_type: any;
  showSidebar: boolean = true;
  addDepartmentForm: FormGroup;
  addDesignationForm: FormGroup;
  addDesignationwithempForm: FormGroup;
  addfuncDesignationwithempForm: FormGroup;
  departments: any = [];
  designation_with_dept: any = [];
  activeDepartment: any = [];
  dept_list: any = [];
  isCollapsed: boolean[] = [];
  desgList: any = [];
  isChecked: boolean = false;
  isAddDesg: boolean = false;
  empList: any = [];
  dropdownSetting = {};
  selectedval: any = [];
  dropdownSettings: any = {};
  isShowEmp: boolean = false;
  mappedEmpList: any = [];
  pageIndex: number = 1;

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _faceCheckinService: FaceCheckinService,
    private _recruitService: RecruitService,
    private _fb: FormBuilder,
    private encrypterService: EncrypterService,
    private _commonService: FaceCheckinService,
    private _attndanceService: AttendanceService,
    private _userMgmtService: UserMgmtService,
  ) {
    this.isCollapsed = new Array().fill(false);
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    const date = new Date();
    let currentMonth = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    let currentYear = date.getFullYear();

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'emp_id',
      textField: 'emp_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      //allowRemoteDataSearch: true,     
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };

    this.addDepartmentForm = this._fb.group({
      departmentName: ['', [Validators.required]],
      id: ['']
    });

    this.addDesignationForm = this._fb.group({
      roleName: ['', [Validators.required]],
      id: [''],
      isFunctional: [false],
      func_designation: [''],
      posting_department: ['', [Validators.required]]
    })
    this.addDesignationwithempForm = this._fb.group({
      roleName: ['', [Validators.required]],
      id: [''],
      isFunctional: [false],
      func_designation: [''],
      posting_department: ['', [Validators.required]],
      deptid: ['', [Validators.required]],
      deptname: ['', [Validators.required]],
      category: ['']
    })
    this.addfuncDesignationwithempForm = this._fb.group({
      roleName: ['', [Validators.required]],
      id: [''],
      func_designation: ['', [Validators.required]],
      category: [''],
      isFunctional: true
    })

    this.getDepartmentData();
    this.getEmpList();
    this.getdesignationwithdeptData();
    this.get_att_dept_master_list();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
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
        this.departments = JSON.parse(this.encrypterService.aesDecrypt(res.commonData));
      } else {
        this.departments = [];
      }
    })

  }
  async getdesignationwithdeptData() {
    let obj = {
      action: 'designation_list_with_dept',
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
        this.designation_with_dept = JSON.parse(this.encrypterService.aesDecrypt(res.commonData));
        // console.log(this.designation_with_dept);

      } else {
        this.designation_with_dept = [];
      }
    })

  }

  openInNewTab(dept: any = '') {
    $('#add-department').modal('show');
    if (dept) {
      this.addDepartmentForm.patchValue({
        departmentName: dept.departmentname,
        id: dept.id
      })
    }
    if (this.addDepartmentForm.value.id && dept.empids) {

      let filteredEmp = this.empList.filter(emp => dept.empids ? dept.empids.includes(emp.emp_id) : []);

      filteredEmp.map(emp => this.selectedval.push({ emp_id: emp.emp_id, emp_name: emp.emp_name }));
    }
    // window.open('/business-settings/unit-parameter-listing', '_blank');
  }

  addDesignation(dept: any) {
    this.isAddDesg = true;
    if (!this.isChecked) {
      this.addDesignationForm.patchValue({
        id: dept.id
      })
    } else {
      const checkboxes = document.querySelectorAll('.multiDesignation');
      const checkedValues = Array.from(checkboxes)
        .filter((checkbox: any) => checkbox.checked)
        .map((checkbox: any) => checkbox.value);
      if (checkedValues.length == 0) {
        return
      }
      this.addDesignationForm.patchValue({
        id: checkedValues.toString()
      })
    }
    $('#add-designation').modal('show');

    // window.open('/business-settings/unit-parameter-listing', '_blank');
  }

  updateDesg(desg: any, dept: any, empids) {
    // console.log("designation", desg, "departments", dept)
    this.isAddDesg = false;

    if (desg.func_designation != "") {
      this.addDesignationForm.patchValue({
        isFunctional: true,
        func_designation: desg.func_designation
      })
    }

    this.addDesignationwithempForm.patchValue({
      id: dept.desgId.toString(),
      roleName: dept.desgname,
      posting_department: dept.id,
      func_designation: '',
      deptid: dept.id,
      deptname: dept.name,
      category: ''
    })
    // console.log(empids.empids);

    this.getDeptWiseEmployees(dept.id);
    $('#add-designation').modal('show');
    this.selectedval = [];
    if (!this.isAddDesg && empids.empids) {
      let filteredEmp = this.empList.filter(emp => empids.empids.includes(emp.emp_id))
      filteredEmp.map(emp => this.selectedval.push({ emp_id: emp.emp_id, emp_name: emp.emp_name }));
    }
    // this.getDeptWiseEmployees(dept.id);
  }
  addfunctionaldesignation(desg: any, dept: any, empids) {
    // console.log("designation", desg, "departments", dept)
    this.isAddDesg = false;



    this.addfuncDesignationwithempForm.patchValue({
      id: dept.desgId.toString(),
      roleName: dept.desgname,
      func_designation: dept.func_designation ? dept.func_designation : ''
    })

    $('#add-funcdesignation').modal('show');
  }

  closeNewDepartmentModal() {
    $('#add-department').modal('hide');
    this.addDepartmentForm.reset();
    this.selectedval = [];
    this.getEmpList('');
  }

  closeNewDesignationModal() {
    $('#add-designation').modal('hide');
    this.isChecked = false;
    let checkbox: any = document.getElementById('multidesignation')
    //checkbox.checked = false;
    this.addDesignationForm.reset();
    this.selectedval = [];
    this.getEmpList('');
  }
  closefunNewDesignationModal() {
    $('#add-funcdesignation').modal('hide');
    //this.isChecked = false;
    //let checkbox: any = document.getElementById('multidesignation')
    //checkbox.checked = false;
    this.addfuncDesignationwithempForm.reset();
    //this.selectedval = [];
    this.getEmpList('');
  }
  savenewDepartment() {
    let empIds = this.selectedval.map(emp => emp.emp_id)
    let action = this.addDepartmentForm.value.id ? 'update_department_unit' : 'save_department_direct'
    this._recruitService.SaveDepartment({
      ...this.addDepartmentForm.value,
      "action": action,
      "customeraccountid": this.tp_account_id.toString(),
      "userby": this.tp_account_id.toString(),
      "empids": empIds.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.closeNewDepartmentModal();
        this.getDepartmentData();
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  toggleNestedTable(index: number): void {
    // console.log(index);

    if (!this.departments[index].degcount) {
      return;
    }
    this.activeDepartment = this.activeDepartment === index ? null : index;
    // return console.log(this.departments[index]);
    this.getMasterData(this.departments[index].id);
    this.getDeptWiseEmployees(this.departments[index].id);
  }
  dept_list_combined: Array<{ id: number, name: string, desgId: number }> = [];
  showdepartmentnames(designationwithdept: any, index: number) {
    this.activeDepartment = index;

    this.dept_list_combined = designationwithdept.department_ids.map((deptId: number, i: number) => ({
      id: deptId,
      name: designationwithdept.department_names[i],
      desgId: designationwithdept.desg_ids[i],
      desgname: designationwithdept.designationname,
      func_designation: designationwithdept.func_designation[i]
    }));
  }
  getMasterData(deptid: any = '', action: string = '') {
    // this.currentDept = deptid;
    this._attndanceService.get_att_master_list({
      "action": 'designation_list_all',
      "customeraccountid": this.tp_account_id,
      "unit_id": '',
      "department_id": deptid,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.desgList = resData.commonData;
      } else {
        this.desgList = [];
      }
    })
  }

  getDeptWiseEmployees(deptid: any) {
    this._userMgmtService.getDeptWiseEmployees({
      action: 'emp_list_dept',
      customerAccountId: this.tp_account_id.toString(),
      departmentid: deptid.toString(),
      desgid: ''
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.empList = JSON.parse(this.encrypterService.aesDecrypt(resData.commonData));

      } else {
        this.empList = []
      }
    })
  }

  savenewDesignation() {
    let isFunctional = this.addDesignationForm.value.isFunctional;
    let action = 'save_designation_unit';
    let empIds = this.selectedval.map(emp => emp.emp_id)
    let dept = this.departments[this.activeDepartment]
    let id = [];
    if (typeof this.addDesignationForm.value.id != 'object') {
      id.push(this.addDesignationForm.value.id)
    } else {
      id = id;
    }

    let postData = {
      action: action,
      customeraccountid: this.tp_account_id.toString(),
      userby: this.token.id,
      ...this.addDesignationForm.value,
      id: this.addDesignationForm.get('posting_department').value.toString(),
      empids: empIds.toString(),
      deptid: this.addDesignationForm.get('posting_department') ? this.addDesignationForm.get('posting_department').value : null,
      deptname: this.addDesignationForm.get('posting_department') ? this.addDesignationForm.get('posting_department').value : '',
      func_designation: this.addDesignationForm.value.func_designation?.toString(),
      category: isFunctional ? 'both' : ''
    }


    this._userMgmtService.saveDesignation(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (this.isAddDesg) {
          this.toastr.success('Designation added successfully');
        } else {
          this.toastr.success('Designation updated successfully');
        }
        this.getdesignationwithdeptData();

        this.closeNewDesignationModal();
      } else {
        this.toastr.error(resData.message);
      }
    })
  }
  updateDesignation() {
    let isFunctional = this.addDesignationwithempForm.value.isFunctional;
    let action = 'update_designation_wt_unit';
    let empIds = this.selectedval.map(emp => emp.emp_id)
    let dept = this.departments[this.activeDepartment]
    let id = [];
    if (typeof this.addDesignationwithempForm.value.id != 'object') {
      id.push(this.addDesignationwithempForm.value.id)
    } else {
      id = id;
    }

    let postData = {
      action: action,
      customeraccountid: this.tp_account_id.toString(),
      userby: this.token.id,
      ...this.addDesignationwithempForm.value,
      empids: empIds.toString(),

    }


    this._userMgmtService.saveDesignation(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        if (this.isAddDesg) {
          this.toastr.success('Designation added successfully');
        } else {
          this.toastr.success('Designation updated successfully');
        }
        this.getdesignationwithdeptData();

        this.closeNewDesignationModal();
      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  getBulkCheckBox(isChecked: boolean) {
    this.isChecked = isChecked;
  }

  getEmpList(key: string = '') {
    let postdata = {
      action: 'emp_all_list',
      customeraccountid: this.tp_account_id.toString(),
      organization_unitid: this.token.geo_location_id,
      emp_code: '',
      keyword: key,
      fromdate: '',
      todate: ''
    }

    this._faceCheckinService.getemployeeList(postdata).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.empList = JSON.parse(this.encrypterService.aesDecrypt(resData.commonData));
      } else {
        this.empList = [];
      }
    })
  }

  onFilterChange(event: any) {
    if (event.length < 3 && event.length > 0) {
      // this.filteredData = this.empList;
      return;
    }
    this.getEmpList(event);
  }

  showEmployeeList(ids: any) {
    this.isShowEmp = true;
    if (ids)
      this.mappedEmpList = this.empList.filter(emp => ids.includes(emp.emp_id));
    // console.log(this.mappedEmpList)
  }
  get_page(event: any) {
    this.pageIndex = event;
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
        this.deptartmentList = JSON.parse(this.encrypterService.aesDecrypt(res.commonData));
        // console.log(this.deptartmentList);

      } else {
        this.deptartmentList = [];
      }
    })

  }
  addfunctionalDesignation() {

    this.addfuncDesignationwithempForm.patchValue({
      func_designation: this.addfuncDesignationwithempForm.get('func_designation').value,
      category: 'both'
    })
    let postdata = {
      action: 'update_designation_wt_unit',
      customeraccountid: this.tp_account_id.toString(),
      userby: this.token.id,
      ...this.addfuncDesignationwithempForm.value
    }
    // console.log(postdata);
    this._userMgmtService.saveDesignation(postdata).subscribe((resData: any): any => {
      if (resData.statusCode) {
        this.getdesignationwithdeptData();
        // this.hideAddFunctionalDesignation();
        this.toastr.success('Functional Designation added successfully');
      } else {
        return this.toastr.error('Something went wrong,Functional Designation not added. Please try again.')
      }
    })
  }

}
