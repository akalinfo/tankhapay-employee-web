import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { Router } from '@angular/router';
import { EmployeeService } from '../employee.service';
import { environment } from 'src/environments/environment';

import { ToastrService } from 'ngx-toastr';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import * as XLSX from 'xlsx';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { LoginService } from '../../login/login.service';
import { RecruitService } from '../../recruit/recruit.service';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { Store } from '@ngrx/store';
import { setFilters } from '../store/filter.actions';
import { ReportService } from '../../reports/report.service';
import { ActivityLogsService } from 'src/app/shared/services/activity-logs.service';
//import { dongleState, grooveState } from 'src/app/app.animation';
declare var $: any;

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css'],
})
export class EmployeesComponent {
  selectedProductType: any;
  userid: any;
  tp_account_id: any = '';
  dateofrelieveing: any;
  empName: any;
  selectedDate!: Date;
  selectedEmployee: any;
  searchText: string = '';
  company_name: string = '';
  element: any;
  // isSuspendPopup: boolean = false;
  product_type: any;
  product_type_text: any;
  employee_data: any = [];
  emp_json_data: any = [];
  searchKeyword = '';
  Employees: any = [];
  view_emp_data: any = [];
  invKey: any = '';
  filteredEmployees: any = [];
  showSidebar: boolean = true;
  p: number = 1;
  total: number = 0;
  pageConfig: any;
  js_id: any = '';
  product_type_array: any[];
  token: any = ''
  employer_id: string = '';
  exit_employee_form: FormGroup;
  Remove_Employee_form: FormGroup;
  Update_Employee_form: FormGroup;
  @ViewChild('rd') rdate: ElementRef;
  show_product_type_dropdown: boolean = false;
  limit: any = 50;
  //akchhaya
  selectedImage: string | ArrayBuffer | null = null;
  emp_code_upload: any | null = null;
  customeraccountid_upload: any | null = null;
  isPopupVisible: boolean = false;
  bulkEmployeeType: any = '1';
  payout_method: any;
  accessRights: any = {};
  status_filter: any = 'Active';
  get_employee_list_data: any = [];
  get_employee_attendance_data: any = [];
  isEmpMgmt: boolean = false;
  isDataLoaded: boolean = false;
  dropdownSettings: any = {};
  deptDropdownSettings: {};
  desgDropdownSettings: {};
  geo_fencing_list_data: any = [];
  geo_fencing_list_data_count: number = 0;
  deptList: any = [];
  desgList: any = [];
  org_data: any = [];
  deptName: any = [];
  desgName: any = [];
  addDepartmentForm: FormGroup;
  total_count: any = 0;
  is_production = false;
  constructor(
    private _SessionService: SessionService,
    private _EmployeeService: EmployeeService,
    private router: Router,
    public toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private _EncrpterService: EncrypterService,
    private _BusinesSettingsService: BusinesSettingsService,
    private _masterService: MasterServiceService,
    private _loginService: LoginService,
    private _recruitService: RecruitService,
    private _ReportService: ReportService,
    private _faceCheckinService: FaceCheckinService,
    private store: Store<{ filters: any }>) {

    if (this.router.getCurrentNavigation().extras.state != undefined) {
      this.invKey = this.router.getCurrentNavigation().extras.state.emp_name;
    }

    // console.log(this.router.url);

    if (this.router.url.includes('employee-mgmt')) {
      this.isEmpMgmt = true;
    }
    localStorage.setItem('empmgmt', 'Profile');
  }

  searchByKey() {
    if (this.invKey.length > 2) {
      this.applyFilters();
    } else if (this.invKey.length == 0) {
      this.applyFilters();
    }
  }

  applyFilters() {
    const filters = {
      keyword: this.invKey,   // Bind the search values
      department: this.deptName,
      designation: this.desgName,
      status: this.status_filter,
      orgUnit: this.org_data
    };

    this.store.dispatch(setFilters({ filters }));
    this.employer_details();
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.employer_id = this.token.id;
    this.payout_method = this.token.payout_mode_type;
    this.company_name = this.token?.company_name;
    // this.getUrlAccessRights()
    this.is_production = environment.production;
    this.accessRights = this._masterService.checkAccessRights(window.location.pathname)

    // localStorage.setItem('activeTab', 'id_Employees');

    this.product_type_text = this.product_type == '1' ? 'Social Security' : this.product_type == '2' ? 'Payrolling' : '';
    this.product_type_array = [];
    if (this.token['product_type'] == '1,2') {
      this.show_product_type_dropdown = true;
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }
    if (this.token['product_type'] == '1') {
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });

    }
    if (this.token['product_type'] == '2') {
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }

    $('#dateofrelieveing').datepicker({
      dateFormat: 'dd-mm-yy',
      changeMonth: true,
      changeYear: true,
    });

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'org_unit_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,     
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };
    this.deptDropdownSettings = {
      singleSelection: false,
      idField: 'posting_department',
      textField: 'posting_department',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,     
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };
    this.desgDropdownSettings = {
      singleSelection: false,
      idField: 'post_offered',
      textField: 'post_offered',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,     
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };

    this.exit_employee_form = this._formBuilder.group({
      exit_remark: [''],
      exit_date: ['']
    });

    this.Remove_Employee_form = this._formBuilder.group({
      backout_remark: ['']
    });

    this.addDepartmentForm = this._formBuilder.group({
      departmentName: ['', [Validators.required]]
    })
    // this.get_employer_profile();
    this.store.select('filters').subscribe(filters => {
      this.invKey = filters.keyword;
      this.deptName = filters.department;
      this.desgName = filters.designation;
      this.status_filter = filters.status;
      this.org_data = filters.orgUnit;
      // Apply these filters to your employee search logic
      this.employer_details();
    });
    // this.employer_details();
    this.get_employee_attendance();
    this.get_employee_list();
    this.get_geo_fencing_list();
    this.get_att_dept_master_list();
    this.get_att_role_master_list();
    // this.getDepartmentData();
    // this.getDesignationData();
  }

  get c() {
    return this.exit_employee_form.controls;
  }

  // search() {
  //   // this.invKey = key.target.value;

  //   let key = this.invKey;
  //   return (
  //   item.emp_name.toLowerCase().includes(key) ||
  //   item.mobile.toLowerCase().includes(key) ||
  //   item.orgempcode.toLowerCase().includes(key) ||
  //   item.tpcode.toLowerCase().includes(key) )

  //   // console.log(this.filteredEmployees);
  // }

  employer_details() {
    let ou_id = this.org_data.map(obj => obj.id);
  
    let desgName = [];
    this.desgName.map(desg => desgName.push(desg.post_offered));

    let deptName = [];
    this.deptName.map(dept => deptName.push(dept.posting_department));
    if (this.limit == this.total_count) {
      this.limit = '';
    }
    // console.log('ou_id', this.token.ouIds);
    // console.log('!ou_id ? this.token.ouIds : ou_id.toString()', ou_id );
    this._EmployeeService
      .employer_details({
        customeraccountid: this.tp_account_id.toString(),
        productTypeId: this.product_type,
        GeoFenceId: this.token.geo_location_id,
        // ouIds: !this.token.ouIds ? ou_id.toString() : this.token.ouIds,
        ouIds: ou_id.length==0 ? this.token.ouIds : ou_id.toString(),
        department: deptName ? deptName.toString() : '',
        designation: desgName ? desgName.toString() : '',
        searchKeyword: this.invKey?.toString()?.trim(),
        employeesStatus: this.status_filter,
        pageNo: this.p,
        pageLimit: this.limit
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.employee_data = resData.commonData;
          //this._EncrypterService.aesDecrypt(resData.commonData);
          this.emp_json_data = (this.employee_data);
          this.filteredEmployees = this.emp_json_data;
          this.total_count = resData.totalRecords;
          if (this.limit == '') this.limit = this.total_count;
          this.isDataLoaded = true;
          this.closeSidebar();

        } else {
          // this.toastr.error(resData.message);
          this.emp_json_data = [];
          this.employee_data = [];
          this.filteredEmployees = [];
          this.isDataLoaded = true;
          this.total_count = 0;
        }
      });
  }

  resetFilter() {
    this.deptName = [];
    this.desgName = [];
    this.org_data = [];
    this.status_filter = 'Active';
    this.invKey = '';
  }

  get_employee_list() {
    this._loginService.get_tpay_dashboard_data({
      "action": "get_employee_list",
      "accountId": this.tp_account_id,
      "geo_location_id": this.token.geo_location_id,
      "ouIds": this.token.ouIds
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_employee_list_data = resData.commonData[0];
          } else {
            this.get_employee_list_data = [];
          }
        }, error: (e) => {
          this.get_employee_list_data = [];
          console.log(e);
        }
      })
  }

  get_employee_attendance() {
    this._loginService.get_tpay_dashboard_data({
      "action": "get_employee_attendance",
      "accountId": this.tp_account_id,
      "geo_location_id": this.token.geo_location_id,
      "ouIds": this.token.ouIds
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_employee_attendance_data = resData.commonData[0];
          } else {
            this.get_employee_attendance_data = [];
          }

        }, error: (e) => {
          this.get_employee_attendance_data = [];
          console.log(e);
        }
      })
  }

  get_geo_fencing_list(key: any = '') {

    // let manualForm = this.filterSearchForm.value;
    // let searchKeywordValue = manualForm.search_keyword;
    this._BusinesSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllGeoFencingForCustomer",
      "searchKeyword": key
    }).subscribe((resData: any) => {
      this.geo_fencing_list_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          this.toastr.info('No data found', '');
          this.geo_fencing_list_data = [];
          return;
        }
        this.geo_fencing_list_data = resData.commonData;
      } else {
        // this.filteredGeo_fencing = this.geo_fencing_list_data =[]
        // this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        this.geo_fencing_list_data_count = 0;
      }
    }, (error: any) => {

      // this.filteredGeo_fencing = this.geo_fencing_list_data =[]
      //   this._alertservice.error(error.error.message, GlobalConstants.alert_options_autoClose);
      this.geo_fencing_list_data_count = 0;
    })
  }

  async getDepartmentData(key: any = '') {
    let obj = {
      action: 'mst_dept',
      customeraccountid: this.tp_account_id.toString(),
      organization_unitid: '',
      emp_code: '',
      keyword: key,
      fromdate: '',
      todate: '',
      pagesize: 1000,
      index: 0
    }
    await this._faceCheckinService.getemployeeList(obj).subscribe((res: any) => {
      this.deptList = JSON.parse(this._EncrpterService.aesDecrypt(res.commonData));
    })
  }

  async getDesignationData(key: any = '') {
    let obj = {
      action: 'post_offered',
      customeraccountid: this.tp_account_id.toString(),
      organization_unitid: '',
      emp_code: '',
      keyword: key,
      fromdate: '',
      todate: '',
      pagesize: 50,
      index: 0
    }
    await this._faceCheckinService.getemployeeList(obj).subscribe((res: any) => {
      this.desgList = JSON.parse(this._EncrpterService.aesDecrypt(res.commonData));
    })
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  setSelectedEmployee(employee: any) {

    this.selectedEmployee = employee;
    this.js_id = this.selectedEmployee.js_id;

    // console.log(this.selectedEmployee);
  }

  resend_app_link(employee: any) {

    if (environment.production) {
      this._EmployeeService
        .send_sms_employee({
          employee_mobile: employee.mobile,
          action_type: 'add_employee',
          employee_name: employee.emp_name,
          company_name: this.company_name,
        })
        .subscribe((resData2: any) => {
          //console.log(resData2);

          if (resData2.statusCode) {
            this.toastr.success(
              'App Link Notification has been sent to Employee Mobile Number',
              'Success'
            );
          } else {
            this.toastr.info(
              resData2.message,
              'Info'
            );
          }

        });
    } else {
      this.toastr.info(
        'App Link Notification facility disabled on staging server',
        'Info'
      );
    }


  }
  ngAfterViewInit() {

    $('#dateofrelieveing').datepicker({
      dateFormat: 'dd-mm-yy',
      changeMonth: true,
      changeYear: true,
    });

  }

  Pause_Emp(id: any, emp_code: any): any {

    if (this.token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }

    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    let a = (date + "/" + month + "/" + year);

    this._EmployeeService.updateEmployeeStatus({
      "customeraccountid": id.toString(),
      "empcode": emp_code,
      "status": "Paused",
      "exit_date": a,
      "remarks": "",
      "productTypeId": this.product_type
    })
      .subscribe((resData: any) => {
        // console.log(resData);
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.employer_details();
        }
        else {
          this.toastr.error(resData.message, 'Error');
        }
      })
  }

  remove_employee(js_id: any): any {
    if (this.token.isEmployer != '1' &&
      !this.accessRights.Add && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    if (this.Remove_Employee_form.controls['backout_remark'].value != '') {
      this._EmployeeService.remove_employee({
        "customeraccountid": this.tp_account_id.toString(),
        "employer_id": this.employer_id.toString(),
        "js_id": js_id.toString(),
        "backout_remark": this.Remove_Employee_form.controls['backout_remark'].value,
        "createdby": this.employer_id.toString(),
        "productTypeId": this.product_type
      })
        .subscribe((resData: any) => {
          //console.log(resData);
          if (resData.statusCode) {
            this.Remove_Employee_form.patchValue({
              backout_remark: ''
            })
            this.toastr.success(resData.message, 'Success');
            this.employer_details();
          }
          else {
            this.toastr.error(resData.message, 'Error');
          }
        });
    } else {
      this.toastr.error('Please Enter the remark', 'Error');
    }
  }

  Resume_Emp(id: any, emp_code: any): any {
    if (this.token.isEmployer != '1' &&
      !this.accessRights.Add && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    let a = (date + "/" + month + "/" + year);

    this._EmployeeService.updateEmployeeStatus({
      "customeraccountid": id.toString(),
      "empcode": emp_code,
      "status": "Resume",
      "exit_date": a,
      "remarks": "",
      "productTypeId": this.product_type
    })
      .subscribe((resData: any) => {
        // console.log(resData);
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.employer_details();
        }
        else {
          this.toastr.error(resData.message, 'Error');
        }
      })

  }

  Exit_Emp(id: any, emp_code: any): any {
    //console.log(this.c.exit_remark.value);
    if (this.token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    let selectedDateStr = '';
    if (this.rdate != undefined) {
      selectedDateStr = this.rdate.nativeElement.value;
    }
    this._EmployeeService.updateEmployeeStatus({
      "customeraccountid": id.toString(),
      "empcode": emp_code,
      "status": "Inactive",
      "exit_date": selectedDateStr,
      "remarks": this.c['exit_remark'].value,
      "productTypeId": this.product_type
    })
      .subscribe((resData: any) => {
        //  console.log(resData);
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.exit_employee_form.patchValue({
            exit_remark: '',
            exit_date: ''
          });
          this.employer_details();
        }
        else {
          this.toastr.error(resData.message, 'Error');
        }
      })
  }
  getEmployeeDetail(emp_data: any) {

    let id = emp_data.emp_id + ',' + emp_data.js_id + ',' + emp_data.ecstatus;
    if (id != '' && id != undefined) {
      this.router.navigate(['/employees/view-employee-detail', this._EncrpterService.aesEncrypt(id.toString())]);
    } else {
      this.toastr.info('Somthing went Wrong. Please try later.', 'Success');
    }
  }

  getEmployeeMgmt(emp_data: any) {
    let id = emp_data.emp_id + ',' + emp_data.js_id + ',' + emp_data.ecstatus;
    if (id != '' && id != undefined) {
      this.router.navigate(['/employee-mgmt/employee', this._EncrpterService.aesEncrypt(id.toString())]);
    } else {
      this.toastr.info('Somthing went Wrong. Please try later.', 'Success');
    }
  }

  getReviseSalDetail(emp_data: any) {
    let id = emp_data.emp_id + ',' + emp_data.js_id;
    if (id != '' && id != undefined) {
      this.router.navigate(['/employees/revise-salary', this._EncrpterService.aesEncrypt(id.toString())]);
    } else {
      this.toastr.info('Somthing went Wrong. Please try later.', 'Success');
    }
  }

  get_page(event: any) {
    // console.log(event);
    this.p = event;
    this.employer_details();
  }

  changeProductType(e: any) {
    this.product_type = e.target.value;
    localStorage.setItem('product_type', this.product_type);
    this.employer_details();
  }
  get_employer_profile() {
    this._BusinesSettingsService
      .getEmployerProfile({
        customeraccountid: (this.tp_account_id),
        productTypeId: this.product_type,
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.company_name = resData.commonData.company_name;
          //console.log(this.company_name);
        }
      });
  }

  changePage(e: any) {
    this.limit = e.target.value;
    this.p = 1;
    this.employer_details();
  }

  onFileSelected(event: any, emp_data: any) {

    this.emp_code_upload = emp_data.mobile + 'CJHUB' + emp_data.emp_code + 'CJHUB' + emp_data.emp_dob;
    this.customeraccountid_upload = emp_data.customeraccountid;
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
        this.isPopupVisible = true; // Show the popup after selecting an image
      };
      reader.readAsDataURL(file);
    }
  }

  getEmployeeStatus(val: any) {
    let status = val;
    this.status_filter = val;
    localStorage.setItem('emp_status_filter', val);
    this.filteredEmployees = this.emp_json_data.filter(function (element: any) {
      return element.joiningstatus.toLowerCase().includes(status.toLowerCase())
    });
  }

  uploadProfile_photo() {
    this.isPopupVisible = false;
    const imageData: string = this.selectedImage.toString();
    const emp_profile_photo: string = imageData
    let postData = {

      emp_code: this._EncrpterService.aesEncrypt(this.emp_code_upload.toString()),
      emp_profile_photo: emp_profile_photo,
      created_by: this.employer_id,
      productTypeId: this._EncrpterService.aesEncrypt(this.product_type),
      customerAccountId: this._EncrpterService.aesEncrypt(this.tp_account_id.toString())
    }
    this._EmployeeService.save_profile_photo(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.employer_details();
      } else {
        this.toastr.error(resData.message);
      }
      this.isPopupVisible = false;
    })
  }

  exportExcelData() {
    let ou_id = this.org_data.map(obj => obj.id);
    let desgName = [];
    this.desgName.map(desg => desgName.push(desg.post_offered));

    let deptName = [];
    this.deptName.map(dept => deptName.push(dept.posting_department));
    this._EmployeeService.getCustomerEmployeeDetails({
      'customerAccountId': this.tp_account_id.toString(), 'productTypeId': this.product_type,
      GeoFenceId: this.token.geo_location_id, ouIds: !this.token.ouIds ? ou_id.toString() : this.token.ouIds,
      department: deptName.toString(),
      designation: desgName.toString(),
      searchKeyword: this.invKey,
      employeesStatus: this.status_filter
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let data: any = JSON.parse(this._EncrpterService.aesDecrypt(resData.commonData));
        //console.log(data);

        let exportData = [];
        for (let i = 0; i < data.length; i++) {
          if (this.payout_method == 'attendance') {
            exportData.push({
              'Employee Name*': data[i].emp_name,
              "Father/Husband's Name*": data[i].fathername,
              'Gender(M/F/T)*': data[i].gender,
              'DOB(DD/MM/YYYY)*': data[i].dateofbirth,
              'DOJ(DD/MM/YYYY)*': data[i].dateofjoining,
              'Mobile no*': data[i].mobile,
              'Email Id': data[i].email,
              'Personal Email Id': data[i]?.personal_email,
              'Aadhaar Card No*': data[i].aadhar_card_no,
              'Pan Card No*': data[i].pancard,
            })
          } else {
            let jsonData = data[i].permanent_address ? JSON.parse(data[i].permanent_address) : data[i].permanent_address;
            let nonemptyVal = Object.values(jsonData).filter(value => value !== "");
            let perm_add = nonemptyVal.join(', ')?.replaceAll('<br>', '');
            let location_transfer_history = data[i].transfer_location_history ? JSON.parse(data[i].transfer_location_history) : [];
            let loc_transfer_his = location_transfer_history.map(lt => ` ${lt.location}`).join("\n");
            let geofence_list = data[i].geofence_list ? JSON.parse(data[i].geofence_list) : [];
            let geofence_list_info = geofence_list.map(gt => ` : ${gt.geofence_name}`).join("\n");
            let ou_list = data[i].ou_list ? JSON.parse(data[i].ou_list) : [];
            let ou_list_info = ou_list.map(ot => ` : ${ot.ou_name}`).join("\n");
            let familyDetails = data[i].family_details ? JSON.parse(data[i].family_details) : [];
            let familyInfo = familyDetails.map(f => `Name : ${f.name} ,Relation : ${f.relation}, DOB: ${f.date_of_birth}`).join("\n");

            let trainingDetails = data[i].training_details ? JSON.parse(data[i].training_details) : [];
            let trainingInfo = trainingDetails.map(t => `Training name : ${t.training_name} ,Institute : ${t.institute}, Completion date : ${t.completion_date}`).join("\n");

            let work_experience = data[i].work_experience ? JSON.parse(data[i].work_experience) : [];
            let work_experienceinfo = work_experience.map(w => `Company Name : ${w.company_name} ,Job Title :${w.job_title}, Fromdate :${w.from_date},Todate : ${w.to_date},Job description : ${w.job_description},Skill : ${w.skills},Experience : ${w.total_experience},Last Drawn Salary : ${w.last_take_home_drawn},Leaving Reason : ${w.leaving_reason}`).join("\n");

            let academic_records = data[i].academic_records ? JSON.parse(data[i].academic_records) : [];
            let academic_recordsinfo = academic_records.map(a => `Course : ${a.course} ,Specialization :${a.specialization}, State :${a.state},Country : ${a.country},University/College : ${a.university_college},Course Type : ${a.skills},Passing Year : ${a.passing_year},Percentage/cgpa: ${a.percentage_cgpa}`).join("\n");

            exportData.push({
              'Employee Name*': data[i].emp_name,
              "Father/Husband's Name*": data[i].fathername,
              'Gender(M/F/T)*': data[i].gender,
              'DOB(DD/MM/YYYY)*': data[i].dateofbirth,
              'DOJ(DD/MM/YYYY)*': data[i].dateofjoining,
              'DOL(DD/MM/YYYY)*': data[i].dateofrelieveing,
              'Designation': data[i].post_offered,
              'Department': data[i].posting_department,
              'Mobile no*': data[i].mobile,
              'Email Id': data[i].email,
              'Personal Email Id': data[i]?.personal_email,
              // 'Aadhar Verification Status': data[i].aadharverfication_status,
              'Aadhaar Card No*': data[i].aadhar_card_no,
              // 'KYC Required': data[i].iskycrequired,
              // 'Pan Verification Status': data[i].pan_verification_status,
              'Pan Card No*': data[i].pancard,
              // 'Account Verification Status': data[i].accountverification_status,
              'Bank AC No*': data[i].bankaccountno,
              'IFSC Code*': data[i].ifsccode,
              'Bank Name*': data[i].bank_name,
              'Bank Branch*': data[i].bank_branch,
              'PF rqd(Y/N)*': data[i].pf_applicable,
              'UAN No': data[i].uannumber,
              'ESIC rqd(Y/N)*': data[i].esi_applicable,
              'ESIC No': data[i].esinumber,
              'ESIC Dependent Details': data[i]?.esic_dependent_details,
              'Relation Emergency Contact No': data[i].emergency_contact,
              'Blood Relation Name': data[i].bloodrelationname,
              'Permanent Address*': perm_add,
              'Residential Address': data[i].residential_address,
              'Org Emp Code': data[i].orgempcode,
              'TP Code': data[i].tpcode,
              'Job Type': data[i].jobtype,
              // 'Joining Status': data[i].joining_status,
              'Reporting Manager Name': data[i].reportingmanagername,
              'Contract End Date': data[i].contractenddate,
              'Probation Confirmation Date': data[i].probation_confirmation_date,
              'Salary Booked Under Project Name': data[i].salary_book_project,
              'Vendor Name': data[i].agencyname,
              'Project': data[i].project_title,
              'Blood Group': data[i].blood_group,
              'Location': loc_transfer_his,
              'Geofence':geofence_list_info,
              'Organization Unit': ou_list_info,
              'Family Details': familyInfo,
              'Education Details': academic_recordsinfo,
              'Work Experience': work_experienceinfo,
              'Training Details': trainingInfo,
            })
          }
        }

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(excelData);
        let date = new Date()
        downloadLink.download = `Employee_List.xlsx`;
        downloadLink.click();
      }
    })
  }


  joinEmployee(emp: any): any {

    if (this.token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }

    let postData = {
      mobileNumber: emp.mobile,
      created_by: this.employer_id,
      customerAccountId: this._EncrpterService.aesEncrypt(this.tp_account_id.toString())
    }
    this._EmployeeService.joinTpAttendanceCandidate(postData).subscribe((resData: any): any => {
      if (resData.statusCode) {
        this.employer_details();
        return this.toastr.success(resData.message);
      } else {
        return this.toastr.error(resData.message);
      }
    })
  }

  openSidebar() {
    document.getElementById("sidebar").style.width = "380px";
  }

  closeSidebar() {
    document.getElementById("sidebar").style.width = "0";
  }

  addEmployee() {
    // console.log(this.accessRights.Add);
    if (this.token.isEmployer == '1' || this.accessRights.Add) {
      this.router.navigate(['/employees/single-employee']);
    } else {
      this.toastr.error("You do have the permission for this.");
    }
  }

  addBulkEmployee() {
    if (this.token.isEmployer == '1' || this.accessRights.Add) {
      this.router.navigate(['/employees/bulk-employee']);
    } else {
      this.toastr.error("You do have the permission for this.");
    }
  }

  addEmployeeViaApi() {
    this.router.navigate(['employees/employee-log']);
  }

  addBulkSalary() {
    if (this.token.isEmployer == '1' || this.accessRights.Add) {
      this.router.navigate(['/employees/bulk-salary']);
    } else {
      this.toastr.error("You do have the permission for this.");
    }
  }

  addBulkCustomSalary() {
    if (this.token.isEmployer == '1' || this.accessRights.Add) {
      this.router.navigate(['/employees/bulk-salary-custom']);
    } else {
      this.toastr.error("You do have the permission for this.");
    }
  }

  openInNewTab() {
    $('#add-department').modal('show');
    // window.open('/business-settings/unit-parameter-listing', '_blank');
  }

  closeNewDepartmentModal() {
    $('#add-department').modal('hide');
    this.addDepartmentForm.reset();
  }

  savenewDepartment() {
    this._recruitService.SaveDepartment({
      "departmentName": this.addDepartmentForm.value.departmentName,
      "action": "save_department_direct",
      "customeraccountid": this.tp_account_id.toString(),
      "userby": this.tp_account_id.toString(),
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

  get_att_dept_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetPostingDepartments",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.deptList = resData.commonData;
        //   if (!this.deptList.some(department => department.posting_department === this.selectedDepartmentId)) {
        //     this.selectedDepartmentId = 'All';  // Reset if the previously selected department no longer exists
        // }
      } else {
        this.deptList = [];
        console.log(resData.message);
      }
    });
  }
  get_att_role_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetMasterPostOffered",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.desgList = resData.commonData;
        //   if (!this.desgList.some(role => role.post_offered === this.selectedDesignationId)) {
        //     this.selectedDesignationId = 'All';  // Reset if the previously selected role no longer exists
        // }
      } else {
        this.desgList = [];
        // console.log(resData.message);
      }
    });
  }


  // ngOnDestroy() {
  //   localStorage.clearItem('emp_status_filter');
  //   console.log('hh')

  // }

  // getUrlAccessRights(){
  //   this._masterService.getURLAccessRight({'roleid': this.token.role,'url':window.location.pathname}).subscribe((resData:any)=>{
  //     if(resData.statusCode){
  //       this.accessRights = JSON.parse((JSON.parse(this._EncrpterService.aesDecrypt(resData.commonData)))[0].get_url_access_right);
  //       console.log(this.accessRights);

  //     }else{
  //       this.toastr.error(resData.message);
  //       this.accessRights =[];
  //     }
  //   })
  // }
}
