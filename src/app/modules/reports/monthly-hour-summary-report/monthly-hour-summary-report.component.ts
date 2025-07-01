import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import * as XLSX from 'xlsx';
declare var $: any;
import { ReportService } from '../report.service';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AttendanceService } from '../../attendance/attendance.service';
import { LoginService } from '../../login/login.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import moment from 'moment';

@Component({
  selector: 'app-monthly-hour-summary-report',
  templateUrl: './monthly-hour-summary-report.component.html',
  styleUrls: ['./monthly-hour-summary-report.component.css']
})
export class MonthlyHourSummaryReportComponent {
  showSidebar: boolean = true;
  product_type: any;
  Emp_code: any;
  id: any;
  designation: any;
  emp_code: any;
  data: any = [];
  employee_data: any = [];
  // checkin_Form: FormGroup;
  // is_overtime_applicable: any;
  // no_of_overtime_hours_worked: any;
  // deviation_in_checkin: any;
  // deviation_in_checkout: any;
  // deviation_in_total_working_hours: any;
  // show_label: boolean = true;
  tp_account_id: any = '';
  token: any = '';
  currentDate: any;
  currentDateString: any;
  employer_name: any;
  tot_check_in: string = '';
  tot_check_out: string = '';
  pop_imgcheck_in_image_path: any = '';
  pop_check_out_image_path: any = '';
  innerPanelData: any = [];
  innerTotalHrsWorked: any = 0;
  loading: boolean = false;
  markStatus = '';
  sso_admin_id: any = '';
  ouIds: any;
  isSideBar: boolean = true;
  invKey: any;

  month: any;
  month_copy: any;
  year: any;
  year_copy: any;
  // att_status_filter: any = '';
  // att_status_filter_copy: any = '';

  selectedUnitId: any = [];
  selectedDepartmentId: any = [];
  selectedDesignationId: any = [];
  unit_master_list_data: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];

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
  change_sidebar_filter_flag: boolean = false;
  status_filter: any = '';
  status_filter_copy: any = '';

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
  selected_date: any;
  days_count: any;  // No. of days in a month


  constructor(
    public toastr: ToastrService,
    public _AttendanceService: AttendanceService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _loginService: LoginService,
    private _alertservice: AlertService,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private _businesessSettingsService: BusinesSettingsService,
    private router: Router) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.employer_name = this.token.name;
    // console.log(this.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.sso_admin_id = this.token.sso_admin_id;
    this.ouIds = this.token.ouIds;

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

    this.get_geo_fencing_list();
    this.getDepartmentData();
    this.getDesignationData();

    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    //
    this.yearsArray = [];
    for (let i = 2023; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);

    };

    if (localStorage.getItem('selected_date') == null) {
      let prev_month;
      let prev_year;

      if (currentMonth === 0) {
        prev_month = 12;
        prev_year = currentYear - 1;
      } else {
        prev_month = currentMonth;
        prev_year = currentYear;
      }

      let prev_monthdate = new Date(prev_year, prev_month, 0).getDate() + '-' + prev_month + '-' + prev_year;
      localStorage.setItem('selected_date', prev_monthdate);

    }
    this.selected_date = localStorage.getItem('selected_date');

    this.selected_date = localStorage.getItem('selected_date');
    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];
    this.days_count = new Date(this.year, this.month, 0).getDate()


    this.get_hourly_summary_report();
    // this.get_employee_leave();

  }


  formatDate(date: Date): string {
    const day: number = date.getDate();
    const month: number = date.getMonth() + 1;
    const year: number = date.getFullYear();

    // Pad single digit day/month with leading zero
    const dayString: string = day < 10 ? '0' + day : day.toString();
    const monthString: string = month < 10 ? '0' + month : month.toString();

    return `${dayString}/${monthString}/${year}`;
  }

  getMonth() {
    return this.monthsArray[this.month-1].month;
  }


  ngAfterViewInit() {

    // // setTimeout(() => {
    // //     $('#FromDate').datepicker({
    // //         dateFormat: 'dd/mm/yy',
    // //         changeMonth: true,
    // //         changeYear: true,
    // //     }).datepicker('setDate', new Date()); // Set current date as default
    // // }, 500);

    // setTimeout(() => {
    //   $('#ToDate').datepicker({
    //     dateFormat: 'dd/mm/yy',
    //     changeMonth: true,
    //     changeYear: true,
    //   }).datepicker('setDate', new Date()); // Set current date as default
    // }, 500);

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }


  get_hourly_summary_report() {
    this.loading = true;
    const previouslyOpened = document.querySelectorAll('.in.panel-collapseOne');
    previouslyOpened.forEach(panel => {
        panel.classList.remove('in');
    });

    let from_date = '01' + '-' + this.month + '-' + this.year;
    let to_date = this.days_count + '-' + this.month + '-' + this.year;

    const unitIds = this.selectedUnitId.length === this.unit_master_list_data.length
      ? this.unit_master_list_data.map(unit => unit.unitid).join(',')
      : this.selectedUnitId.map(unit => unit.unitid).join(',');

    // Handle postingDepartment
    const postingDepartment = this.selectedDepartmentId.length === this.department_master_list_data.length
      ? this.department_master_list_data.map(dept => dept.posting_department).join(',')
      : this.selectedDepartmentId.map(dept => dept.posting_department).join(',');

    const postOffered = this.selectedDesignationId.length === this.role_master_list_data.length
      ? this.role_master_list_data.map(dept => dept.post_offered).join(',')
      : this.selectedDesignationId.map(dept => dept.post_offered).join(',');

    // console.log("unitParameterName", unitIds,
    //   "postOffered", postOffered,
    //   "postingDepartment", postingDepartment)

    // {"fromDate":"18/06/2025","toDate":"18/06/2025",
    //   "customerAccountId":"653","productTypeId":"2",
    //   "flag":"normal_report","GeoFenceId":"","checkInOutMarkedType":"Not Marked",
    //   "unitParameterName":"","postOffered":"","postingDepartment":""}

    // console.log(this._EncrypterService.aesDecrypt(''))

    this._ReportService.get_hourly_summary_report({
      "action": "get_hourly_summary_report",
      "accountid": this.tp_account_id.toString(),
      "fromDate": from_date,
      "toDate": to_date,
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment
    }).subscribe((resData: any) => {
      this.loading = false;
      if (resData.statusCode) {
        this.employee_data = resData.commonData;
        this.closeSidebar();

      } else {
        this.employee_data = [];
        // this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });


  }

  formatBreakTotalTime(breakTotalTime: string): string {
    try {
      const breaks = JSON.parse(breakTotalTime);
      return breaks.map(b =>
        `${b.break_type} [${b.break_type_duration}] - ${b.break_type_paid_unpaid}`
      ).join(', ');
    } catch (e) {
      // console.error('Error parsing break_total_time:', e);
      return '';
    }
  }
  exportToExcel() {
    let from_date = '01' + '-' + this.month + '-' + this.year;
    let to_date = this.days_count + '-' + this.month + '-' + this.year;

    // this._ReportService.GetTpCheckInOutSummary({
    //   "fromDate": from_date,
    //   "toDate": to_date,
    //   "customerAccountId": this.tp_account_id.toString(),
    //   "productTypeId": this.product_type,
    //   "flag": "normal_report",
    //   "GeoFenceId": this.token.geo_location_id,
    //   // "checkInOutMarkedType": this.checkin_Form.get('markedStatus')?.value?.toString()
    //   "checkInOutMarkedType": 'Not Marked',

    // }).subscribe((resData: any) => {
    //   if (resData.statusCode) {
    //     this.data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));;
    //     // console.log(this.data), 'AASDFGH';
    //     let exportData = [];
    //     let days = {};
    //     for (let i = 0; i < resData.commonData.length; i++) {
    //       let head = resData.commonData[i].w_date_d
    //       // + resData.commonData[i].dayname;
    //       days = {
    //         ...days, [head]: ''
    //       }
    //     }

    //     const formatBreakTotalTime = (breakTotalTime: string): string => {
    //       try {
    //         const breaks = JSON.parse(breakTotalTime);
    //         return breaks.map(b =>
    //           `${b.break_type} [${b.break_type_duration}] - ${b.break_type_paid_unpaid}`
    //         ).join(', ');
    //       } catch (e) {
    //         // console.error('Error parsing break_total_time:', e);
    //         return '';
    //       }
    //     };

    //     for (let idx = 0; idx < this.data.length; idx++) {
    //       let obj = {
    //         'Attendance Date': this.data[idx].attendancedate,
    //         'Employee Code': this.data[idx].orgempcode,
    //         'TPCode': this.data[idx].tpcode,
    //         'Employee Name': this.data[idx].emp_name,
    //         'Department': this.data[idx].department,
    //         'Designation': this.data[idx].designation,
    //         'Organisation Unit': this.data[idx].assigned_ou_ids_names,
    //         'Geofence Name': this.data[idx].assigned_geofence_ids_names,
    //         'Source': this.data[idx].attendance_type,
    //         'In Time': this.data[idx].check_in_time,
    //         'Check In Location': this.data[idx].check_in_location,
    //         'Out Time': this.data[idx].check_out_time,
    //         'Check Out Location': this.data[idx].check_out_location,
    //         'No Of Hours Worked': this.data[idx].no_of_hours_worked,
    //         'Shift Name': this.data[idx].shift_name,
    //         'Auto Assign Shift': this.data[idx].is_auto_shift_assign,
    //         'Night Shift': this.data[idx].is_night_shift,
    //         'Break': formatBreakTotalTime(this.data[idx].break_total_time),
    //         // <td> {{emp.tpcode }}</td>
    //         // <td> {{emp.orgempcode }}</td>

    //         ' ': ' ',

    //       }
    //       // console.log(this.data[idx].check_in_out_details);

    //       if (this.data[idx].no_of_hours_worked !== '00:00' && this.data[idx].no_of_hours_worked !== undefined) {
    //         obj['Is Overtime Applicable'] = this.data[idx].is_overtime_applicable;
    //         obj['No Of Overtime Hours Worked'] = this.data[idx].no_of_overtime_hours_worked;
    //         obj['Deviation In Checkin'] = this.data[idx].deviation_in_checkin;
    //         obj['Deviation In Checkout'] = this.data[idx].deviation_in_checkout;
    //         obj['Deviation In Total Working Hours'] = this.data[idx].deviation_in_total_working_hours;
    //       }

    //       let i = 1;
    //       for (const details of this.data[idx].check_in_out_details) {
    //         obj['CheckIn ' + i] = details.check_in_time;
    //         obj['CheckOut ' + i] = details.check_out_time;
    //         obj['Wrkhrs ' + i] = details.no_of_hours_worked;
    //         obj['Source ' + i] = details.attendance_type;
    //         obj['Check-In Geofence ' + i] = details.check_in_geofence_id_name;
    //         obj['Check-Out Geofence ' + i] = details.check_out_geofence_id_name;
    //         i++;
    //       }

    //       exportData.push(obj);


    //       // console.log(obj,"fh");
    //     }

    //     // console.log(exportData);
    //     const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    //     const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    //     const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //     const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    //     const downloadLink: any = document.createElement('a');
    //     downloadLink.href = window.URL.createObjectURL(data);
    //     let date = new Date()
    //     downloadLink.download = 'Check_In_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
    //     downloadLink.click();
    //   }
    // })
  }



  // openPanel(i: number, emp_data: any) {
  //   // console.log(emp_data, 'eeeeeeeeeeee')
  //   this.innerPanelData = emp_data;
  //   this.innerTotalHrsWorked = 0;

  //   this.innerPanelData.check_in_out_details.map((el: any) => {
  //     if (el.no_of_hours_worked !== null && el.no_of_hours_worked !== undefined) {
  //       this.innerTotalHrsWorked += this.timeToHoursMinutes(el.no_of_hours_worked);
  //     }
  //   })

  //   // Convert total numerical hours to 'hours:minutes' format
  //   const totalHours = Math.floor(this.innerTotalHrsWorked);
  //   const totalMinutes = Math.round((this.innerTotalHrsWorked - totalHours) * 60);
  //   // console.log(totalHours, totalMinutes);
  //   if (totalHours === 0) {
  //     this.innerTotalHrsWorked = '00:' + totalMinutes.toString().padStart(2, '0');
  //   } else {
  //     this.innerTotalHrsWorked = totalHours.toString().padStart(2, '0') + ':' + totalMinutes.toString().padStart(2, '0');
  //   }

  //   const targetElement = document.getElementById(`collapseOne${i}`);

  //   // Check if the clicked panel is already open
  //   const isOpen = targetElement.classList.contains('in');

  //   // Close all previously opened panels (if needed)
  //   const previouslyOpened = document.querySelectorAll('.in.panel-collapse.collapse');

  //   previouslyOpened.forEach(panel => {
  //     if (panel !== targetElement) {
  //       panel.classList.remove('in');
  //     }
  //   });

  //   // Toggle visibility of the clicked panel (considering its state)
  //   if (!isOpen) {
  //     targetElement.classList.add('in'); // Open if not already open
  //   } else {
  //     targetElement.classList.remove('in'); // Close if already open
  //   }
  // }

  open_new_Panel(i: number, emp_data: any) {
    // console.log(emp_data);
    return;

    let from_date = '01' + '-' + this.month + '-' + this.year;
    let to_date = this.days_count + '-' + this.month + '-' + this.year;

    const unitIds = this.selectedUnitId.length === this.unit_master_list_data.length
      ? this.unit_master_list_data.map(unit => unit.unitid).join(',')
      : this.selectedUnitId.map(unit => unit.unitid).join(',');

    // Handle postingDepartment
    const postingDepartment = this.selectedDepartmentId.length === this.department_master_list_data.length
      ? this.department_master_list_data.map(dept => dept.posting_department).join(',')
      : this.selectedDepartmentId.map(dept => dept.posting_department).join(',');

    const postOffered = this.selectedDesignationId.length === this.role_master_list_data.length
      ? this.role_master_list_data.map(dept => dept.post_offered).join(',')
      : this.selectedDesignationId.map(dept => dept.post_offered).join(',');

    this._ReportService.get_hourly_summary_report({
      "action": "get_hourly_summary_report_detail",
      "accountid": this.tp_account_id.toString(),
      "fromDate": from_date,
      "toDate": to_date,
      "emp_code": emp_data.emp_code?.toString(),
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment
    }).subscribe((resData: any) => {
      this.loading = false;
      if (resData.statusCode) {
        this.innerPanelData = resData.commonData;

        const targetElement = document.getElementById(`collapseOne${i}`);

        // Check if the clicked panel is already open
        const isOpen = targetElement.classList.contains('in');

        // Close all previously opened panels (if needed)
        const previouslyOpened = document.querySelectorAll('.in.panel-collapseOne');

        previouslyOpened.forEach(panel => {
          if (panel !== targetElement) {
            panel.classList.remove('in');
          }
        });

        // Toggle visibility of the clicked panel (considering its state)
        if (!isOpen) {
          targetElement.classList.add('in'); // Open if not already open
        } else {
          targetElement.classList.remove('in'); // Close if already open
        }

      } else {
        this.innerPanelData = [];
        // this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });



  }

  timeToHoursMinutes(timeStr: any) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  }



  exportToPdf() {

    // let tableHtml = `<style>.table {
    //       border: 1px solid black;
    //       border-collapse: collapse;
    //     }
    //     .table th,
    //     .table td {
    //       border: 1px solid black;
    //       padding: 8px;
    //     }
    //   </style>`;
    // tableHtml += `<p style="text-align:center;">Monthly Hour Summary Report (${this.markStatus}-${this.to_date})</p>`;
    // tableHtml += `<table class="table">`;
    // tableHtml += `<tr>
    //               <th>Attendance Date</th>
    //               <th>Employee Code</th>
    //               <th>TPCode</th>
    //               <th>Employee Name</th>
    //               <th>Department</th>
    //               <th>Designation</th>
    //               <th>Organisation Unit</th>
    //               <th>Source</th>
    //               <th>In Time</th>
    //               <th>Check In</th>
    //               <th>Out Time</th>
    //               <th>Check Out</th>
    //               <th>No Of</th>
    //               <th>Shift Name</th>
    //               <th>Auto Assign</th>
    //               <th>Night Shift</th>
    //               <th>Break</th>
    //             </tr>`;
    // for (let emp of this.employee_data) {
    //   tableHtml += `<tr>
    //                               <td>${emp.attendancedate || ''}</td>
    //                               <td>${emp.orgempcode || ''}</td>
    //                               <td>${emp.tpcode || ''}</td>
    //                               <td>${emp.emp_name || ''}</td>
    //                               <td>${emp.department || ''}</td>
    //                               <td>${emp.designation || ''}</td>
    //                               <td>${emp.assigned_ou_ids_names || ''}</td>
    //                               <td>${emp.attendance_type || ''}</td>
    //                               <td>${emp.check_in_time || ''}</td>
    //                               <td>${emp.check_in_location || ''}</td>
    //                               <td>${emp.check_out_time || ''}</td>
    //                               <td>${emp.check_out_location || ''}</td>
    //                               <td>${emp.no_of_hours_worked || ''}</td>
    //                               <td>${emp.shift_name || ''}</td>
    //                               <td>${emp.is_auto_shift_assign || ''}</td>
    //                               <td>${emp.is_night_shift || ''}</td>
    //                               <td>${this.formatBreakTotalTime(emp.break_total_time) || ''}</td>
    //                             </tr>`;
    // }

    // tableHtml += `</table>`;
    // this._ReportService.generatePdfByCode({
    //   "htmlBody": tableHtml
    // }).subscribe((resData: any) => {
    //   if (resData.statusCode == true) {
    //     const byteCharacters = atob(resData.commonData);
    //     const byteNumbers = new Array(byteCharacters.length);
    //     for (let i = 0; i < byteCharacters.length; i++) {
    //       byteNumbers[i] = byteCharacters.charCodeAt(i);
    //     }
    //     const byteArray = new Uint8Array(byteNumbers);
    //     const file = new Blob([byteArray], { type: 'application/pdf' });
    //     const fileURL = URL.createObjectURL(file);
    //     const a = document.createElement('a');
    //     a.href = fileURL;
    //     a.download = 'checkin-checkout-report.pdf';
    //     a.click();
    //     URL.revokeObjectURL(fileURL);
    //   }
    // })
  }


  //Sidebar Filter
  openSidebar() {
    // this.search_key_copy = this.searchKey;
    this.month_copy = this.month;
    this.year_copy = this.year;
    this.status_filter_copy = this.status_filter;
    this.orgName_copy = this.deepCopyArray(this.orgName);
    this.desgName_copy = this.deepCopyArray(this.desgName);
    this.deptName_copy = this.deepCopyArray(this.deptName);
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "380px";
  }

  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }

  resetFilter() {
    this.month_copy = this.month;
    this.year_copy = this.year;
    this.deptName = [];
    this.desgName = [];
    this.orgName = [];
    this.deptName_copy = [];
    this.desgName_copy = [];
    this.orgName_copy = [];
    // this.searchKey = '';
    // this.search_key_copy = '';
    this.status_filter_copy = '';
    this.get_hourly_summary_report();
    // this.employer_details();
  }


  /***********Master************** */
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

    this._AttendanceService.getMaster({
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

    this._AttendanceService.getMaster({
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

  /***********Master************** */

  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;
    // this.searchKey = this.search_key_copy;
    this.month = this.month_copy;
    this.year = this.year_copy;

    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.desgName = this.desgName_copy;
    this.deptName = this.deptName_copy;
    this.orgName = this.orgName_copy;

    this.status_filter = this.status_filter_copy;
    this.get_hourly_summary_report();

    // this.getEmployerMonthAttendance_for_excel_table_data();
  }


  exportToExcelTable() {
    const table = document.getElementById('hourSummaryReportTable');
    if (!table) {
      console.error('Table not found!');
      return;
    }

    const clonedTable = table.cloneNode(true) as HTMLTableElement;
    // Remove all tr elements with class 'panel-collapse'
    clonedTable.querySelectorAll('tr.panel-collapseOne').forEach(tr => tr.remove());

    // Remove the first column from the header
    const headerRow = clonedTable.querySelector('thead tr');
    if (headerRow && (headerRow as HTMLTableRowElement).cells.length > 0) {
      (headerRow as HTMLTableRowElement).deleteCell(0);
    }

    // Remove the first column from each body row, only if it exists
    const bodyRows = clonedTable.querySelectorAll('tbody tr');
    bodyRows.forEach(row => {
      const rowEl = row as HTMLTableRowElement;
      if (rowEl.cells.length > 0) {
        rowEl.deleteCell(0);
      }
    });

    // Convert table to worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(clonedTable, { raw: true });

    // (Optional) Post-process worksheet for numeric columns, string columns, etc.

    // Create workbook and export
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'Hourly_Summary_Report.xlsx');
  }


  formatToUIDate(value: string): string {
    // Check if value is in ISO format YYYY-MM-DD
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (isoDatePattern.test(value)) {
      const dateObj = new Date(value);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = dateObj.toLocaleString('default', { month: 'short' }); // 'Jun'
      const year = String(dateObj.getFullYear()).slice(-2); // '01'
      return `${day}-${month}-${year}`;
    }
    return value; // Already in UI format
  }


  navigateToEmployeeDetails(emp: any) {
    this.router.navigate(['/reports/employee-daily-hour-wise'], { state: { emp_code: emp.emp_code, emp_name: emp.emp_name + ' ' + '- ' + (emp?.orgempcode || emp?.cjcode || '') } });

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
