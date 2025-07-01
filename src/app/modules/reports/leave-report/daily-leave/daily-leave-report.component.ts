import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { LeaveMgmtService } from 'src/app/modules/leave-mgmt/leave-mgmt.service';
import { SessionService } from 'src/app/shared/services/session.service';
declare var $: any;
import * as XLSX from 'xlsx';
import { ReportService } from '../../report.service';
import { AttendanceService } from 'src/app/modules/attendance/attendance.service';
import { BusinesSettingsService } from 'src/app/modules/business-settings/business-settings.service';
@Component({
  selector: 'app-daily-leave-report',
  templateUrl: './daily-leave-report.component.html',
  styleUrls: ['./daily-leave-report.component.css']
})
export class DailyLeaveReportComponent {
  showSidebar: boolean = false;
  limit: any = 50;
  p: number = 1;
  currentDate: any;
  currentDateString: any;
  employer_name: any = '';
  statusFilter: any = 'All';
  tp_account_id: any;
  filteredEmployees: any = [];
  leave_appl_list_data: any = [];
  data: any = [];
  tot_approved: any = 0;
  tot_rejected: any = 0;
  tot_pending: any = 0;
  selected_val: string = '1';
  decoded_token: any;

  invKey: any = '';
  invKey_copy: any = '';
  change_sidebar_filter_flag: boolean = false;
  startDate: any;
  endDate: any;
  startDate_copy: any;
  endDate_copy: any;
  statusFilter_copy: any = 'All';

  dropdownSettings: any = {};
  deptDropdownSettings: {};
  desgDropdownSettings: {};
  deptList: any = [];
  desgList: any = [];
  orgList: any = [];
  orgName: any = [];
  deptName: any = [];
  desgName: any = [];
  orgName_copy: any = [];
  deptName_copy: any = [];
  desgName_copy: any = [];
  product_type: any;


  constructor(
    private _leaveMgmtService: LeaveMgmtService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _ReportService: ReportService,
    private _formBuilder: FormBuilder,
    private _attendanceService: AttendanceService,
    private _businesessSettingsService: BusinesSettingsService,
  ) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }


  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.employer_name = this.decoded_token.name;
    this.product_type = localStorage.getItem('product_type');

    // console.log(decoded_token);

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

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    this.startDate = this.formatDate(firstDayOfMonth);
    this.endDate = this.formatDate(lastDayOfMonth);

    this.get_geo_fencing_list();
    this.getDepartmentData();
    this.getDesignationData();
    this.get_daily_leave();
  }

  ngAfterViewInit() {

  }


  get_daily_leave() {
    this.get_Leave_appl_by_account();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}/${mm}/${yy}`;
  }

  changeStatusFilter(val: any) {
    this.statusFilter = val;
    this.get_daily_leave();
  }
  get_page(event: any) {
    this.p = event;

  }

  search() {
    let invKey = this.invKey;
    this.p = 1;
    this.filteredEmployees = this.leave_appl_list_data.filter(function (element: any) {

      return element.emp_name.toLowerCase().includes(invKey?.toLowerCase()) ||
        element.cjcode.toString().toLowerCase().includes(invKey?.toLowerCase()) ||
        element.orgempcode.toString().toLowerCase().includes(invKey?.toLowerCase())

    });

  }

  get_Leave_appl_by_account() {

    this._ReportService.get_Leave_appl_by_account_empid({
      'action': 'get_Leave_appl_by_account',
      'accountId': this.tp_account_id.toString(),
      'fromdate': this.startDate,
      'todate': this.endDate,
      'approval_status': this.statusFilter,
      'p_geofenceid': this.decoded_token.geo_location_id?.toString(),
      'ouIds': this.decoded_token.ouIds?.toString(),
      'postOffered': this.desgName,
      'postingDepartment': this.deptName,
      'unitParameterName': this.orgName,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leave_appl_list_data = resData.commonData;
          this.filteredEmployees = this.leave_appl_list_data;
          // console.log("FILTERED DATA ------",this.filteredEmployees);
          this.search();
        } else {
          this.leave_appl_list_data = [];
          this.filteredEmployees = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.leave_appl_list_data = [];
        this.filteredEmployees = [];
        console.log(e);
      }
    })

    if (this.change_sidebar_filter_flag) {
      this.closeSidebar();
    }
  }

  exportToExcel() {
    this._ReportService.get_Leave_appl_by_account_empid({
      action: 'get_Leave_appl_by_account',
      accountId: this.tp_account_id.toString(),
      fromdate: this.startDate,
      todate: this.endDate,
      approval_status: this.statusFilter,
      p_geofenceid: this.decoded_token.geo_location_id?.toString(),
      ouIds: this.decoded_token.ouIds?.toString(),
      postOffered: this.desgName,
      postingDepartment: this.deptName,
      unitParameterName: this.orgName,
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = resData.commonData;
        let exportData: any[] = [];

        for (let idx = 0; idx < this.data.length; idx++) {
          const item = this.data[idx];

          // const commonFields = {
          //   'Employee Name': item.emp_name,
          //   'Employee Id': item.orgempcode !== '' && item.orgempcode != null ? item.orgempcode : item.tpcode,
          //   'Leave type': item.leavetypename,
          //   'Type': item.paid_unpaid,
          //   'Reason': item.leave_description,
          //   'From date': item.fromdate,
          //   'To date': item.todate,
          //   'Leave Days': item.leave_days,
          //   'Status': item.approval_status,
          // };
          // <td>{{ report.vendor_name }}</td>
          //                             <td>{{ report.project_name }}</td>
          //                             <td>{{ report.salary_book_project }}</td>
          const applDetails = item.appl_detail;

          if (Array.isArray(applDetails) && applDetails.length > 0) {
            applDetails.forEach((detail: any, i: number) => {
              exportData.push({
                // ...(i === 0 ? commonFields : {
                'Employee Name': item.emp_name,
                'Employee Code': item.orgempcode !== '' && item.orgempcode != null ? item.orgempcode : item.tpcode,
                'Email Id': item.email,
                'Org Unit Name': item.assignedous,
                
                'Leave type': item.leavetypename,
                'Type': item.paid_unpaid,
                'Reason': item.leave_description,
                'From date': item.fromdate,
                'To date': item.todate,
                'Leave Days': item.leave_days,
                'Status': item.approval_status,
                // }),
                'Leave applied date': detail.leave_applied_date,
                'Leave day type': detail.leave_day_type,
                'Requested on': item.createdon,
                'Project Name': item.project_name,
                'Vender Name': item.vendor_name,
                'Salary Book Project': item.salary_book_project,
              });
            });
          } else {
            // In case appl_detail is missing, add the common row only
            // exportData.push({
            //   ...commonFields,
            //   'Leave applied date': '',
            //   'Leave day type': '',
            // });
          }
        }

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const downloadLink: HTMLAnchorElement = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date();
        downloadLink.download = `Daily_Leave_Report_${this.employer_name.replaceAll(' ', '_').trim()}_${this.currentDateString.trim().replaceAll(' ', '_')}.xlsx`;
        downloadLink.click();
      }
    });
  }




  /**Sidebar Filter**/
  resetFilter() {
    this.invKey_copy = '';
    this.statusFilter_copy = 'All';
    this.deptName_copy = [];
    this.desgName_copy = [];
    this.orgName_copy = [];

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    this.startDate_copy = this.formatDate(firstDayOfMonth);
    this.endDate_copy = this.formatDate(lastDayOfMonth);

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.startDate_copy); // Set current date as default

      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.endDate_copy); // Set current date as default

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });


    }, 100);

  }

  openSidebar() {
    this.change_sidebar_filter_flag = true;

    this.invKey_copy = this.invKey;
    this.statusFilter_copy = this.statusFilter;

    this.orgName_copy = this.deepCopyArray(this.orgName);
    this.desgName_copy = this.deepCopyArray(this.desgName);
    this.deptName_copy = this.deepCopyArray(this.deptName);

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.startDate); // Set current date as default

      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.endDate); // Set current date as default

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });


      this.startDate_copy = this.startDate;
      this.endDate_copy = this.endDate;
    }, 1500);

    document.getElementById("sidebar").style.width = "380px";

  }

  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }

  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;

    this.startDate = this.startDate_copy;
    this.endDate = this.endDate_copy;
    this.invKey = this.invKey_copy;
    this.statusFilter = this.statusFilter_copy;

    this.desgName = this.desgName_copy;
    this.orgName = this.orgName_copy;
    this.deptName = this.deptName_copy;

    this.startDate = $('#FromDate').val();
    this.endDate = $('#ToDate').val();

    this.get_daily_leave();
  }

  filterFromToDateLeads() {

    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    if (todt >= fromdt) {
      this.startDate_copy = $('#FromDate').val();
      this.endDate_copy = $('#ToDate').val();
    }
    else {
      $('#FromDate').val(this.startDate_copy);
      $('#ToDate').val(this.endDate_copy);
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }
  }
  /**Sidebar Filter**/


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

  getDepartmentData() {
    this.deptList = [];

    this._attendanceService.getMaster({
      'actionType': 'GetPostingDepartments',
      'customerAccountId': this.tp_account_id,
      'productTypeId': this.product_type,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.deptList = (resData.commonData);
          // console.log(this.deptList);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  getDesignationData() {
    this.desgList = [];

    this._attendanceService.getMaster({
      'actionType': 'GetMasterPostOffered',
      'customerAccountId': this.tp_account_id,
      'productTypeId': this.product_type,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.desgList = (resData.commonData);
          // console.log(this.desgList);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
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
