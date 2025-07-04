import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { LeaveMgmtService } from 'src/app/modules/leave-mgmt/leave-mgmt.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../../reports/report.service';
import * as XLSX from 'xlsx';
import { dongleState, grooveState } from 'src/app/app.animation';
@Component({
  selector: 'app-employee-leave-balance',
  templateUrl: './employee-leave-balance.component.html',
  styleUrls: ['./employee-leave-balance.component.css']
})
export class EmployeeLeaveBalanceComponent {

  filteredEmployees: any = [];
  limit: any = 50;
  p: number = 1;
  showSidebar: boolean = true;
  currentDate: any;
  tableHeaders: any;
  currentDateString: any;
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

  constructor(
    private _leaveMgmtService: LeaveMgmtService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private router: Router,
    private _ReportService: ReportService,
    private _formBuilder: FormBuilder,
  ) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }


  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.employer_name = this.decoded_token.name;
    // console.log(decoded_token);
    // console.log(this.decoded_token.id);

    let date = new Date();

    this.Get_leave_types_by_account();
    this.Get_employee_leave_balance();

  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_page(event: any) {
    this.p = event;
  }
  // get_employee_leave_balance

  Get_leave_types_by_account() {
    this._ReportService.get_leave_types_by_account({
      'action': 'get_leave_type',
      'customeraccountid': this.tp_account_id?.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leave_appl_list_data = resData.commonData;
          this.generateTableHeaders(this.leave_appl_list_data);
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

  generateTableHeaders(leaveTypes: any[]) {
    const tableHeaders: string[] = ['#', 'Employee Name'];

    // Loop through the leave types and add them to table headers
    for (const leaveType of leaveTypes) {
      tableHeaders.push(leaveType.typename);
    }

    // Set the generated table headers
    this.tableHeaders = tableHeaders;
  }

  Get_employee_leave_balance() {
    // this._EmployeeService.getTpCandidateDetails({ 'empId': this._EncrypterService.aesEncrypt(this.empId.toString());
    this._ReportService.get_employee_leave_balance_el({
      "empid": this.decoded_token.id,
      'accountId': this.tp_account_id?.toString(),
      'p_geofenceid': this.decoded_token.geo_location_id?.toString(),
      'ouIds': this.decoded_token.ouIds?.toString()
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.employee_leave_balance_data = resData.commonData;
          this.filteredEmployees = this.employee_leave_balance_data;
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

  getLeaveBalance(balanceArray: any[], leaveType: string): string {
    const balance = balanceArray?.find(item => item.type_name === leaveType);
    return balance ? balance.cur_bal : 'N/A';
  }
  search(key: any) {
    let invKey = key.target.value;
    // console.log(invKey);
    this.p = 1;
    // console.log(this.employee_leave_balance_data);
    this.filteredEmployees = this.employee_leave_balance_data.filter(function (element: any) {

      return element.employee_detail?.emp_name?.toLowerCase().includes(invKey?.toLowerCase()) ||
        element.employee_detail?.cjcode?.toString().toLowerCase().includes(invKey?.toLowerCase()) ||
        element.employee_detail?.orgempcode?.toString().toLowerCase().includes(invKey?.toLowerCase())

    });

  }
  exportToExcel() {
    // Fetch leave types
    this._ReportService.get_leave_types_by_account({
      'action': 'get_leave_type',
      'customeraccountid': this.tp_account_id?.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          const leaveTypes = resData.commonData;

          // Fetch employee leave balance data
          this._ReportService.get_employee_leave_balance_el({
            "empid": "0",
            'accountId': this.tp_account_id?.toString(),
            'p_geofenceid': this.decoded_token.geo_location_id?.toString()
          }).subscribe({
            next: (resData: any) => {
              if (resData.statusCode) {
                const employeeLeaveBalanceData = resData.commonData;

                // Generate table headers
                const tableHeaders: string[] = ['#', 'Employee Name', 'Employee Code'];
                for (const leaveType of leaveTypes) {
                  tableHeaders.push(leaveType.typename);
                }

                // Generate export data
                const exportData = [];
                for (let i = 0; i < employeeLeaveBalanceData.length; i++) {
                  const employeeData = employeeLeaveBalanceData[i];
                  const exportRow = {
                    '#': i + 1,
                    'Employee Name': employeeData.employee_detail.emp_name,
                    'Employee Code': (employeeData.employee_detail.orgempcode !== ''
                      && employeeData.employee_detail.orgempcode != null
                      && employeeData.employee_detail.orgempcode != undefined) ? employeeData.employee_detail.orgempcode : employeeData.employee_detail.cjcode

                  };

                  // Populate leave balance data
                  for (const leaveType of leaveTypes) {
                    exportRow[leaveType.typename] = this.getLeaveBalance(employeeData.balance_txt, leaveType.typename);
                  }

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
                downloadLink.download = 'Employee_Leave_Balance_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
                downloadLink.click();
              } else {
                this.toastr.error(resData.message, 'Oops!');
              }
            },
            error: (e) => {
              console.error(e);
              this.toastr.error('Error fetching employee leave balance data', 'Oops!');
            }
          });
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      },
      error: (e) => {
        console.error(e);
        this.toastr.error('Error fetching leave types', 'Oops!');
      }
    });
  }
  //Added by Arpit by merging both the API's Data dated 13/05/24

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

    console.log(exportData);

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


}
