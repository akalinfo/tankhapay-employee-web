import { Component } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import { AttendanceService } from '../../attendance/attendance.service';
import { ActivatedRoute, Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { EmployeeService } from '../../employee/employee.service';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import * as XLSX from 'xlsx';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
declare var $: any;

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
})
export class EmployeeDetailsComponent {

  showSidebar: boolean = true;
  tp_account_id: any;
  product_type: any;
  // search_key: any = '';
  filter_emp_val: any = '';
  decoded_token: any;
  p: any = 1;
  limit: any = 10;
  attendanceDetails_data: any = [];
  project_master_list_data: any = [];
  LedgerMasterHeads_head: any = [];
  attendanceSummaryData: any = {};
  product_type_array: any = [];
  product_type_text: string = '';
  today_date: any;
  filter_status: any = 'active';
  attendanceDetails_data_original: any = [];
  ouIds: any;
  employees_count_details_data: any = [];
  employees_count_details_data_original: any = [];
  searchKey: any = '';
  timeoutId: any;
  filter_jobtype: any = '';
  filter_dept: any = '';
  filter_desg: any = '';
  filter_proj: any = '';
  employee_details_cnt = 0;
  accessRights: any = {};
  country: any;
  value: number;
  deptList: any;
  forotherpagedeptid: any;
  desgList: any = [];
  forotherpagedesgtid: any;
  forotherpageprojecttid: any;
  forotherpagefuncdesgid: any;
  change_sidebar_filter_flag: boolean = false;
  month_copy: any;
  year_copy: any;
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
  current_month: number;
  current_year: number;
  dropdownSettings: any = {};
  deptDropdownSettings: {};
  orgList: any = [];
  orgName_copy: any = [];

  constructor(
    private _employeeService: EmployeeService,
    private _sessionService: SessionService,
    private router: Router,
    private toastr: ToastrService,
    private _EncrpterService: EncrypterService,
    private _businesessSettingsService: BusinesSettingsService,
    private _masterService: MasterServiceService,
    private route: ActivatedRoute, 
    private _faceCheckinService: FaceCheckinService) {

    if (this.router.getCurrentNavigation().extras.state != undefined) {
      // this.today_date = this.router.getCurrentNavigation().extras.state.year;
      // console.log(this.router.getCurrentNavigation().extras.state);
      this.forotherpagedeptid = this.router.getCurrentNavigation()?.extras?.state?.department ?? '';
      this.forotherpagedesgtid = this.router.getCurrentNavigation()?.extras?.state?.desg_name ?? '';
      this.forotherpageprojecttid = this.router.getCurrentNavigation()?.extras?.state?.proj_name ?? '';
      this.forotherpagefuncdesgid = this.router.getCurrentNavigation()?.extras?.state?.funcdesg_name ?? '';
      //console.log(this.forotherpagefuncdesgid);

      this.filter_status = this.router.getCurrentNavigation().extras.state.status ?? 'active';
      // console.log(this.filter_status);
    }
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as {
      country: string;
      value: number;
    };

    this.country = state?.country ?? '';
    this.value = state?.value ?? 0;

  }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.ouIds = this.decoded_token.ouIds;

    this.product_type = localStorage.getItem('product_type');
    this.product_type_array = [];
    this.product_type_text = this.product_type == '1' ? 'Social Security' : this.product_type == '2' ? 'Payrolling' : '';

    localStorage.setItem('activeTab', 'id_Dashboard');

    if (this.decoded_token['product_type'] == '1,2') {
      // this.show_product_type_dropdown = true;
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }
    if (this.decoded_token['product_type'] == '1') {
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
    }
    if (this.decoded_token['product_type'] == '2') {
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }


    const date = new Date();

    this.month_copy = date.getMonth();
    this.year_copy = date.getFullYear();

    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    this.current_month = currentMonth + 1;
    this.current_year = currentYear;

    for (let i = 2023; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);
    };

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'org_unit_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
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


    if (!this.today_date) {
      let date = new Date();
      let dd = date.getDate();
      let mm = date.getMonth() + 1
      let yy = date.getFullYear();
      this.today_date = dd + '-' + mm + '-' + yy;
    }
    this.get_employees_count_details();
    this.get_geo_fencing_list();
    this.getDepartmentData();
    this.getDesignationData();
    this.getProjectList();

  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     $(function () {
  //       $('#today_date').datepicker({
  //         dateFormat: 'dd-mm-yy',
  //         changeMonth: true,
  //         changeYear: true,
  //       });

  //     });

  //     $('body').on('change', '#today_date', function () {
  //       $('#recdate').trigger('click');
  //     })
  //   }, 0);
  // }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_employees_count_details() {
    this.employee_details_cnt = 0;
    let obj = {
        action: 'get_employees_count_details',
        accountId: (this.tp_account_id),
        p_ou_locationid: this.decoded_token.geo_location_id,
        status_filter: this.filter_status,
        ouIds: this.decoded_token.ouIds,
        job_type: this.filter_jobtype,
        keyword: this.searchKey,
        pagesize: this.limit,
        pageindex: this.p - 1,
        month: this.month_copy?.toString(),
        year: this.year_copy?.toString(),
        department_id: this.forotherpagedeptid,
        designantion_id: this.forotherpagedesgtid,
        unitParameterName: this.orgName_copy,
        project: this.forotherpageprojecttid,
        forotherpagefuncdesgid: this.forotherpagefuncdesgid
    };

    console.log("filter test obj --", obj);

    this._employeeService
      .get_employees_count_details(obj)
      .subscribe((resData: any) => {
        // console.log(resData);

        if (resData.statusCode) {
          this.employees_count_details_data = resData.commonData;
          //console.log(this.employees_count_details_data);

          // console.log(this.router.getCurrentNavigation().extras.state);

          if (this.router.getCurrentNavigation()?.extras.state) {
            this.employees_count_details_data = this.employees_count_details_data.filter(x => x.posting_department == this.router.getCurrentNavigation().extras.state.department);
            // console.log(this.employees_count_details_data);

          }
          this.employees_count_details_data_original = this.deepCopyArray(this.employees_count_details_data);
          this.employee_details_cnt = this.employees_count_details_data[0].tot_records;
          // console.log(this.employees_count_details_data[0]);

        } else {
          this.employees_count_details_data = [];
          this.employees_count_details_data_original = [];
        }
      });
  }


  search() {
    if (this.timeoutId) {
      clearInterval(this.timeoutId)
    }
    this.timeoutId = setTimeout(() => {
      let searchkey = this.searchKey.toString().toLowerCase();
      this.p = 1;
      this.get_employees_count_details();
    }, 500)
    // console.log(this.att_status_filter);
    // this.employees_count_details_data = this.employees_count_details_data_original.filter(function (element: any) {
    //   return (element.emp_name.toLowerCase().includes(searchkey)
    //     || element.mobile.toLowerCase().includes(searchkey))
    // });
    // this.change_att_status();

  }

  changeTodayDate() {
    this.today_date = $('#today_date').val();
    // console.log(this.today_date);
    this.get_employees_count_details();
  }

  changePage(e: any) {
    this.limit = e.target.value;
    this.p = 1;
    this.get_employees_count_details();
  }

  change_status_filter() {
    this.p = 1;
    this.get_employees_count_details();
  }

  change_jobtype_filter() {
    this.p = 1;
    this.get_employees_count_details();
  }

  change_dept_filter() {
    // console.log(this.deptList);
    this.forotherpagedeptid = this.filter_dept;

    const selectedProject = this.deptList.find(item => item.departmentname === this.filter_dept);
    // console.log('Selected Project Details:', selectedProject);
    this.p = 1;
    this.get_employees_count_details();
  }

  change_desg_filter() {
    this.forotherpagedesgtid = this.filter_desg;
    this.p = 1;
    this.get_employees_count_details();
  }

  change_project_filter() {
    this.forotherpageprojecttid = this.filter_proj;
    this.p = 1;
    this.get_employees_count_details();
  }

  // changeFilterStatus() {
  //   if (this.filter_status == '') {
  //     this.attendanceDetails_data = this.deepCopyArray(this.attendanceDetails_data_original);
  //   } else {
  //     this.attendanceDetails_data = [];
  //     this.attendanceDetails_data= this.attendanceDetails_data_original.filter((el:any) => {
  //       if (el.today_status==this.filter_status) {
  //         return el;
  //       }
  //     });
  //   }
  // }

  get_page(event: any) {
    this.p = event;
    this.get_employees_count_details();
  }

  routeToEmployee(index: any) {

    let acccess_data = !localStorage.getItem('access_rights') ? [] : JSON.parse(localStorage.getItem('access_rights'));
    let ecstatus = this.filter_status == 'joining-pending' ? 'TEC' : 'EC';
    //  this.employees_count_details_data[index].emp_name;
    let emp_id = this.employees_count_details_data[index].emp_id;
    let js_id = this.employees_count_details_data[index].js_id;

    let id = emp_id + ',' + js_id + ',' + ecstatus;
    if (id != '' && id != undefined) {
      if (acccess_data.find((el: any) => el.modulename == 'Employee Management')) {
        this.router.navigate(['/employee-mgmt/employee', this._EncrpterService.aesEncrypt(id.toString())]);
      } else {
        this.router.navigate(['/employees/view-employee-detail', this._EncrpterService.aesEncrypt(id.toString())])
      }
    } else {
      this.toastr.info('Somthing went Wrong. Please try later.', 'Info');
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

  async getDepartmentData(key: any = '') {
    let obj = {
      action: 'mst_dept_dashboard_filter',
      customeraccountid: this.tp_account_id.toString(),
      organization_unitid: '',
      emp_code: '',
      keyword: key,
      fromdate: '',
      todate: '',
      pagesize: '',
      index: 0
    }
    await this._faceCheckinService.getemployeeList(obj).subscribe((res: any) => {
      const decrypted = JSON.parse(this._EncrpterService.aesDecrypt(res.commonData));
      this.deptList = decrypted.map(item => ({
        ...item,
        selected: item.department_name === this.forotherpagedeptid
      }));
      this.filter_dept = this.forotherpagedeptid;
      // console.log('Dept List:', this.deptList);
      // console.log('Selected Department ID:', this.filter_dept);
      // console.log('ForOtherPageDeptId:', this.forotherpagedeptid);


    })
  }
  async getDesignationData(key: any = '') {
    let obj = {
      action: 'post_offered_dashboard_filter',
      customeraccountid: this.tp_account_id.toString(),
      organization_unitid: '',
      emp_code: '',
      keyword: key,
      fromdate: '',
      todate: '',
      pagesize: '',
      index: 0
    }
    await this._faceCheckinService.getemployeeList(obj).subscribe((res: any) => {
      const decrypted = JSON.parse(this._EncrpterService.aesDecrypt(res.commonData));
      // console.log(decrypted);

      // this.desgList = JSON.parse(this._EncrpterService.aesDecrypt(res.commonData));
      this.desgList = decrypted.map(item => ({
        ...item,
        selected: item.post_offered === this.forotherpagedesgtid?.toUpperCase()
      }));
      this.filter_desg = this.forotherpagedesgtid?.toUpperCase();
      // console.log(this.desgList);
      // console.log('Dept List:', this.desgList);
      // console.log('Selected Department ID:', this.filter_desg);
      // console.log('forotherpagedesgtid:', this.forotherpagedesgtid);
    })
  }
  getProjectList() {
    this._faceCheckinService.getemployeeList({
      "action": "mst_project_dashboard_filter",
      "customeraccountid": this.tp_account_id.toString(),
      "emp_code": "",
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        const decrypted = JSON.parse(this._EncrpterService.aesDecrypt(resData.commonData));
        // console.log(decrypted);
        this.project_master_list_data = decrypted.map(item => ({
          ...item,
          selected: item.project_name === this.forotherpageprojecttid?.toUpperCase()
        }));
        const selectedProject = decrypted.find(item => item.project_name === this.forotherpageprojecttid?.toUpperCase());
        this.filter_proj = selectedProject?.project_name ?? '';
        // console.log(this.forotherpageprojecttid);
        // console.log(this.filter_proj);

      } else {
        this.project_master_list_data = [];
      }
    })
  }
  exportExcelData() {
    this._employeeService
      .get_employees_count_details({
        action: 'get_employees_count_details',
        accountId: (this.tp_account_id),
        p_ou_locationid: this.decoded_token.geo_location_id,
        status_filter: this.filter_status,
        ouIds: this.decoded_token.ouIds,
        job_type: this.filter_jobtype,
        keyword: this.searchKey,
        pagesize: '',
        pageindex: '',
        department_id: this.forotherpagedeptid,
        designantion_id: this.forotherpagedesgtid,
        project: this.forotherpageprojecttid,
        forotherpagefuncdesgid: this.forotherpagefuncdesgid,
        is_excel: 'Y'
      })
      .subscribe((resData: any) => {
        console.log(resData);

        if (resData.statusCode) {
          let data: any = resData.commonData;
          //console.log(data);

          let exportData = [];
          for (let i = 0; i < data.length; i++) {
            exportData.push({
              'Employee Name': data[i].emp_name,
              "OU Name": data[i].assignedous,
              'Department': data[i].posting_department,
              'Designation': data[i].post_offered,
              'Functional Designation (Expertise)': data[i].func_designation,
              'Project': data[i].project_title,
              'Job Type': data[i].jobtype,
              'Mobile': data[i].mobile,
              'DOJ-DOL': data[i].dateofjoining + '-' + (data[i].dateofrelieveing ? data[i].dateofrelieveing : ''),
              'Status': data[i].joiningstatus,
            });
          }
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
          const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

          const excelData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const downloadLink: any = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(excelData);
          let date = new Date()
          downloadLink.download = `Employee_Details.xlsx`;
          downloadLink.click();
        }
      });
  }

  // New Filters Code - sidharth kaul dated. 30.06.2025 ------------------------------------------------------

  openSidebar() {
    // this.search_key_copy = this.search_key;
    // this.month_copy = this.month;
    // this.year_copy = this.year;
    // this.filter_emp_val_copy = this.filter_emp_val;
    // this.orgName_copy = this.deepCopyArray(this.orgList); //orgName
    // this.desgName_copy = this.deepCopyArray(this.desgName);
    // this.deptName_copy = this.deepCopyArray(this.deptName);
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "380px";
  }


  resetFilter() {

    // this.month_copy = this.month;
    // this.year_copy = this.year;
    // // this.deptName = [];
    // // this.desgName = [];
    // // this.orgName = [];
    // this.deptName_copy = [];
    // this.desgName_copy = [];
    // this.orgName_copy = [];
    // this.search_key_copy = '';
    // this.search_key = '';
    // this.filter_emp_val_copy = 'All';
    // this.employer_details();

    this.searchKey = '';
    this.month_copy = '';
    this.year_copy = '';
    this.filter_jobtype = '';
    this.orgName_copy = [];
    this.filter_dept = '';
    this.filter_desg = '';

    this.get_employees_count_details()

  }

  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }

  get_geo_fencing_list() {
    this._businesessSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllOUsForCustomer"
    }).subscribe((resData: any) => {
      this.orgList = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          this.toastr.info('No data found', 'Oops!');
          return;
        }

        this.orgList = resData.commonData;

      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }

  change_sidebar_filter() {
    
    this.change_sidebar_filter_flag = true;

    this.p = 1;
    this.forotherpagedeptid = this.filter_dept;
    this.forotherpagedesgtid = this.filter_desg;
    this.forotherpageprojecttid = this.filter_proj;

    this.get_employees_count_details();

    // this.search_key = this.search_key_copy;
    // this.month = this.month_copy;
    // this.year = this.year_copy;

    // this.days_count = new Date(this.year_copy, this.month, 0).getDate()
    // let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    // this.selected_date = date;
    // localStorage.setItem('selected_date', date);
    // localStorage.removeItem('openedCalendar');
    // this.filteredEmployees.forEach((el: any, i: any, arr: any) => {
    //   arr[i].showCalendar = false;
    // });

    // this.filter_emp_val = this.filter_emp_val_copy;
    // this.desgName = this.desgName_copy;
    // this.orgName = this.orgName_copy;
    // this.deptName = this.deptName_copy;
    // this.p = 1;

    // // console.log(this.desgName);
    // // console.log(this.deptName);

    // this.get_calendar();
    // this.get_holidays();
  }



}
