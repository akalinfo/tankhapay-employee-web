import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { LeaveMgmtService } from 'src/app/modules/leave-mgmt/leave-mgmt.service';
import { SessionService } from 'src/app/shared/services/session.service';
import * as XLSX from 'xlsx';
import { ReportService } from '../../report.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { AttendanceService } from 'src/app/modules/attendance/attendance.service';
import { BusinesSettingsService } from 'src/app/modules/business-settings/business-settings.service';
declare var $: any;

@Component({
  selector: 'app-leave-booked-balance',
  templateUrl: './leave-booked-balance.component.html',
  styleUrls: ['./leave-booked-balance.component.css'],
  animations: [dongleState, grooveState],
})
export class LeaveBookedBalanceComponent {
  product_type: any;
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
  statusFilter: any = 'All';
  invKey: any = '';
  invKey_copy: any = '';
  change_sidebar_filter_flag: boolean = false;
  startDate: any;
  endDate: any;
  startDate_copy: any;
  endDate_copy: any;
  statusFilter_copy: any = 'All';
  showSidebar: boolean = true;
  currentDate: any;
  limit: any = 50;
  p: number = 1;
  tableHeaders: any;
  currentDateString: any;
  filteredEmployees: any = [];
  employer_name: any = '';
  tp_account_id: any;
  data: any = [];
  employee_leave_balance_data: any = [];
  leave_appl_list_data: any = [];
  decoded_token: any;
  showEmpHistory: boolean = false;
  leaveHistoryData: any = [];
  currentEmp: any = {};
  employee_name: any = '';
  month_copy: any;
  year_copy: any;
  month: any;
  year: any;

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

  constructor(
    private _leaveMgmtService: LeaveMgmtService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _ReportService: ReportService,
    private _formBuilder: FormBuilder, private _attendanceService: AttendanceService, private _businesessSettingsService: BusinesSettingsService
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

    // add filter by pankaj dated. 24.04.2025
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
    //end
    this.Get_leave_types_by_account();
    // this.Get_employee_leave_balance();
    // add filter by pankaj dated. 24.04.2025
    const date = new Date();
    let currentYear = date.getFullYear();

    for (let i = 2023; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);

    };
    // end
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  get_page(event: any) {
    this.p = event;

  }
  search(key: any) {
    let invKey = key.target.value;
    this.p = 1;
    this.filteredEmployees = this.employee_leave_balance_data.filter(function (element: any) {

      return element.employee_detail?.emp_name?.toLowerCase().includes(invKey?.toLowerCase()) ||
        element.employee_detail?.cjcode?.toString().toLowerCase().includes(invKey?.toLowerCase()) ||
        element.employee_detail?.orgempcode?.toString().toLowerCase().includes(invKey?.toLowerCase())

    });

  }

  Get_leave_types_by_account() {
    this._ReportService.get_leave_types_by_account({
      'action': 'get_leave_type',
      'customeraccountid': this.tp_account_id?.toString(),

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leave_appl_list_data = resData.commonData;
          // this.generateTableHeaders(this.leave_appl_list_data);
          this.Get_employee_leave_balance();

        } else {
          this.leave_appl_list_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.leave_appl_list_data = [];
        console.log(e);
      }
    })
  }

  // generateTableHeaders(leaveTypes: any[]) {
  //   const tableHeaders: string[] = ['#', 'Employee Name'];

  //   // Loop through the leave types and add them to table headers
  //   for (const leaveType of leaveTypes) {
  //     tableHeaders.push(`${leaveType.typename} Booked`);
  //     tableHeaders.push(`${leaveType.typename} Balance`);
  //   }

  //   // Set the generated table headers
  //   this.tableHeaders = tableHeaders;
  // }

  Get_employee_leave_balance() {
    let obj = {
      "empid": "0",
      'accountId': this.tp_account_id?.toString(),
      'p_geofenceid': this.decoded_token.geo_location_id?.toString(),
      'ouIds': this.decoded_token.ouIds?.toString(),
      // add filter by pankaj dated. 24.04.2025
      'month': this.month,
      'year': this.year,
      'desgName': this.desgName || '',
      'orgName': this.orgName || '',
      'deptName': this.deptName || ''
      // end
    };
    // console.log('ddddddddddd', obj);
    // return;
    this._ReportService.get_employee_leave_balance(obj).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.employee_leave_balance_data = resData.commonData;
          // this.filteredEmployees = this.deepCopyArray(this.employee_leave_balance_data);
          this.processEmployeeData();

        } else {
          this.employee_leave_balance_data = [];
          this.filteredEmployees = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.employee_leave_balance_data = [];
        this.filteredEmployees = [];
        console.log(e);
      }
    })
  }

  // getLeaveBalance(balanceArray: any[], leaveType: string): string {
  //   const balance = balanceArray.find(item => item.type_name === leaveType);
  //   return balance ? balance.cur_bal : 'N/A';
  // }

  exportToExcel() {
    // Fetch leave types
    this._ReportService.get_leave_types_by_account({
      'action': 'get_leave_type',
      'customeraccountid': this.tp_account_id?.toString(),
    }).subscribe({
      next: (leaveTypesRes: any) => {
        if (leaveTypesRes.statusCode) {
          const leaveTypes = leaveTypesRes.commonData;

          // Fetch employee leave balance data
          this._ReportService.get_employee_leave_balance({
            "empid": "0",
            'accountId': this.tp_account_id?.toString(),
            'p_geofenceid': this.decoded_token.geo_location_id?.toString(),
            ////////////01.05.2025 pankaj
            'ouIds': this.decoded_token.ouIds?.toString(),
            'desgName': this.desgName || '',
            'orgName': this.orgName || '',
            'deptName': this.deptName || ''
          }).subscribe({
            next: (employeeLeaveBalanceRes: any) => {
              if (employeeLeaveBalanceRes.statusCode) {
                const employeeLeaveBalanceData = employeeLeaveBalanceRes.commonData;

                // Prepare export data
                const exportData = [];

                const headerRow = {
                  '#': '',
                  'Employee Name': '',
                  'Employee Code': '',
                  'Email': '',
                  'Org Unit Name': '',
                  // 'Vendor Name': '',
                  // 'Project Name': '',
                  // 'Salary Book Project': ''
                };

                // Iterate over each leave type and add the type name as the column headers
                for (const leaveType of leaveTypes) {
                  headerRow[leaveType.typename + '_Taken'] = 'Taken'; // Only add the type name
                  headerRow[leaveType.typename + '_Balance'] = 'Balance'; // Only add the type name
                }

                // Push the header row to export data
                exportData.push(headerRow);

                // Iterate over each employee
                for (let i = 0; i < employeeLeaveBalanceData.length; i++) {
                  const employee = employeeLeaveBalanceData[i];

                  // Create an export row for the current employee
                  const exportRow = {
                    '#': i + 1,
                    'Employee Name': employee.employee_detail.emp_name,
                    'Employee Code': (employee.employee_detail.orgempcode !== '' &&
                      employee.employee_detail.orgempcode != null &&
                      employee.employee_detail.orgempcode != undefined) ? employee.employee_detail.orgempcode : employee.employee_detail.cjcode,
                    'Email': employee.employee_detail.email,
                    'Org Unit Name': employee.employee_detail.assignedous,
                    'Vender Name': employee.employee_detail.vendor_name,
                    'Project Name': employee.employee_detail.project_name,
                    'Salary Book Project': employee.employee_detail.salary_book_project
                  };

                  // Iterate over each leave type
                  for (const leaveType of leaveTypes) {
                    // Get leave taken and balance for the current leave type
                    const leaveTaken = employee.balance_txt ? employee.balance_txt.find(b => b.type_name === leaveType.typename)?.leave_taken || 'N/A' : 'N/A';
                    const leaveBalance = employee.balance_txt ? employee.balance_txt.find(b => b.type_name === leaveType.typename)?.cur_bal || 'N/A' : 'N/A';

                    // Add leave taken and balance as a single string to export row
                    //  exportRow[leaveType.typename] = `${leaveTaken} | ${leaveBalance}`;
                    exportRow[leaveType.typename + '_Taken'] = `${leaveTaken}`; // Only add the type name
                    exportRow[leaveType.typename + '_Balance'] = `${leaveBalance}`; // Only add the type name
                  }

                  // Push the export row to export data
                  exportData.push(exportRow);
                }

                // Export to Excel
                const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
                const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
                const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const downloadLink: any = document.createElement('a');
                downloadLink.href = window.URL.createObjectURL(data);
                const date = new Date();
                downloadLink.download = 'Leave_Taken_and_Balance_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
                downloadLink.click();
              } else {
                this.toastr.error(employeeLeaveBalanceRes.message, 'Oops!');
              }
            },
            error: (error) => {
              console.error(error);
              this.toastr.error('Error fetching employee leave balance data', 'Oops!');
            }
          });
        } else {
          this.toastr.error(leaveTypesRes.message, 'Oops!');
        }
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Error fetching leave types', 'Oops!');
      }
    });
  }

  // Added New by Harsh - 06 Aug 24
  processEmployeeData() {
    // console.log("viod");
    this.filteredEmployees = this.employee_leave_balance_data.map(emp => {
      let balanceTxt = this.leave_appl_list_data.map(leaveType => {
        let leaveBalance = emp.balance_txt?.find(balance => balance.type_code === leaveType.typecode);
        return {
          typename: leaveType.typename,
          leave_taken: leaveBalance ? leaveBalance.leave_taken : 'N/A',
          cur_bal: leaveBalance ? leaveBalance.cur_bal : 'N/A'
        };
      });
      return { ...emp, balanceTxt };
    });
    // console.log("FILTERED DATA ------",this.filteredEmployees);

    this.employee_leave_balance_data = this.deepCopyArray(this.filteredEmployees);
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

  // Added New by Harsh - 06 Aug 24
  get_leave_taken_history(data: any) {
    this.leaveHistoryData = [];
    this.currentEmp = data;
    this.employee_name = data.employee_detail.emp_name;
    let date = new Date();
    let mm = date.getMonth() + 1;
    let yy = date.getFullYear();
    // console.log(data);
    // return;

    this._ReportService.get_leave_taken_history({
      'action': 'get_leave_taken_history',
      'accountId': this.tp_account_id.toString(),
      'att_month': mm,
      'att_year': yy,
      'emp_id': data.emp_id.toString(),
      'template_id': data.template_id.toString(),

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.showEmpHistory = true;
          this.leaveHistoryData = resData.commonData;

        } else {
          this.leaveHistoryData = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  closeEmpHistory() {
    this.showEmpHistory = false;
    this.employee_name = '';
    this.leaveHistoryData = [];
    this.currentEmp = {};
  }

  get_tot_leave_balance() {
    if (this.currentEmp?.balance_txt.length > 0) {
      let tot = 0;
      this.currentEmp?.balance_txt.map((el: any) => {
        tot += !el.cur_bal ? 0 : parseFloat(el.cur_bal);
      })
      return tot;
    } else {
      return 0;
    }
  }

  downloadExcel() {
    let exportData = [];

    // Step 1: Add the first row with Current Leave Balance and Total Leave Balance
    let leaveBalance = '';
    if (this.currentEmp?.balance_txt?.length) {
      this.currentEmp.balance_txt.forEach((item: any, index: number) => {
        leaveBalance += `${item.type_code}-${item.cur_bal}`;
        if (index < this.currentEmp.balance_txt.length - 1) {
          leaveBalance += ', '; // Separate leave balances by a comma
        }
      });
    }

    // Push the first row in the format you desire
    exportData.push({
      'A': 'Current Leave Balance',    // Column 1
      'B': leaveBalance,               // Column 2: leave balances like CL-3.0, ML-3.0
      'C': 'Total Leave Balance',      // Column 3
      'D': this.get_tot_leave_balance(), // Column 4: Total balance like 8
    });

    // Step 2: Add a blank row between the first and second rows
    exportData.push({
      'A': '', // Empty column 1
      'B': '', // Empty column 2
      'C': '', // Empty column 3
      'D': '', // Empty column 4
    });

    // Step 3: Add headers for the leave history (Month-Year, Template Name, Leave Taken)
    exportData.push({
      'A': 'Month-Year',         // Column 1: Month-Year header
      'B': 'Template Name',      // Column 2: Template Name header
      'C': 'Leave Taken',        // Column 3: Leave Taken header
      'D': '',                   // Column 4: Empty to align columns
    });

    // Step 4: Add the leave history data
    this.leaveHistoryData.forEach((el: any) => {
      let leaveTaken = '';
      if (el?.leave_taken_txt?.length) {
        el.leave_taken_txt.forEach((item: any, index: number) => {
          leaveTaken += `${item.typecode}-${item.leave_taken}`;
          if (index < el.leave_taken_txt.length - 1) {
            leaveTaken += ', '; // Separate leave taken values by a comma
          }
        });
      }

      // Push each row of leave history data
      exportData.push({
        'A': el?.att_date_txt || '',                   // Column 1: Month-Year
        'B': el?.template_name || '',                  // Column 2: Template Name
        'C': `${el?.tot_leave_taken} (${leaveTaken})`, // Column 3: Leave Taken
        'D': '',                                       // Column 4: Empty to align columns
      });
    });

    // console.log(exportData);

    // Convert the data into a worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData, { header: ['A', 'B', 'C', 'D'], skipHeader: true });

    // Adjust column width for better readability
    worksheet['!cols'] = [
      { wch: 25 },  // Width for Column 1 (Current Leave Balance/Month-Year)
      { wch: 30 },  // Width for Column 2 (Leave Balances/Template Name)
      { wch: 25 },  // Width for Column 3 (Total Leave Balance/Leave Taken)
      { wch: 15 },  // Width for Column 4 (Total/Empty)
    ];

    // Create the workbook and add the worksheet
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Create a Blob for download
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: HTMLAnchorElement = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);

    // Generate a file name with the current date
    let date = new Date();
    downloadLink.download = `download-leave-history-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

    // Trigger the download
    downloadLink.click();
  }
  // add filter by pankaj dated. 24.04.2025
  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;

    // this.startDate = this.startDate_copy;
    // this.endDate = this.endDate_copy;
    this.month = this.month_copy;
    this.year = this.year_copy;

    this.desgName = this.desgName_copy;
    this.orgName = this.orgName_copy;
    this.deptName = this.deptName_copy;

    // this.startDate = $('#FromDate').val();
    // this.endDate = $('#ToDate').val();

    this.Get_employee_leave_balance();
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

  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }

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

  formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}/${mm}/${yy}`;
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
  // end

}