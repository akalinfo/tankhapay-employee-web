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
import { IstToGermanTimeService } from 'src/app/shared/services/ist-to-german-timezone.service';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.component.html',
  styleUrls: ['./check-in.component.css']
})
export class CheckInComponent {
  showSidebar: boolean = true;
  product_type: any;
  Emp_code: any;
  id: any;
  designation: any;
  emp_code: any;
  data: any = [];
  employee_data: any = [];
  checkin_Form: FormGroup;
  is_overtime_applicable: any;
  no_of_overtime_hours_worked: any;
  deviation_in_checkin: any;
  deviation_in_checkout: any;
  deviation_in_total_working_hours: any;
  show_label: boolean = true;
  tp_account_id: any = '';
  token: any = '';
  currentDate: any;
  currentDateString: any;
  from_date: any;
  to_date: any;
  employer_name: any;
  year: any;
  tot_check_in: string = '';
  tot_check_out: string = '';
  pop_imgcheck_in_image_path: any = '';
  pop_check_out_image_path: any = '';
  innerPanelData: any = [];
  innerTotalHrsWorked: any = 0;
  loading: boolean = false;
  markStatus = '';
  sso_admin_id: any = '';
  checkInOutDeviceStatus: any = '';
  get_employee_leave_data: any;
  ouIds: any;
  reprocessDisabled = false;
  reprocessTimer: any = null;

  // deptList: any = [];
  // desgList: any = [];
  // orgList: any = [];
  // orgName: any = [];
  // deptName: any = [];
  // desgName: any = [];
  // orgName_copy: any = [];
  // deptName_copy: any = [];
  // desgName_copy: any = [];

  unit_master_list_data: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];

  selectedUnitId: any = [];
  selectedDepartmentId: any = [];
  selectedDesignationId: any = [];
  selectedUnitId_copy: any = [];
  selectedDepartmentId_copy: any = [];
  selectedDesignationId_copy: any = [];

  dropdownSettings: any = {};
  dropdownSettings_department: any = {};
  dropdownSettings_designation: any = {};
  change_sidebar_filter_flag: boolean = false;
  geo_fencing_list_data_count: any;
  geo_fencing_list_data: any;

  showGermanTime: any = 'IST';

  constructor(
    public toastr: ToastrService,
    public _AttendanceService: AttendanceService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _loginService: LoginService,
    private _alertservice: AlertService,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private _BusinesSettingsService: BusinesSettingsService,
    public istToGermanTimeService: IstToGermanTimeService,
    private router: Router) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
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

    let currDate = new Date();

    this.to_date = this.formatDate(currDate);
    // console.log(this.to_date);

    this.checkin_Form = this._formBuilder.group({
      FromDate: [this.formatDate(currDate), [Validators.required]],
      ToDate: [this.formatDate(currDate), [Validators.required]],
      markedStatus: ['Marked', Validators.required]
    });

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'unitid',
      textField: 'unitname',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      allowSearchFilter: true,
      enableCheckAll: true,
      itemsShowLimit: 5,
    };
    this.dropdownSettings_department = {
      singleSelection: false,
      idField: 'posting_department',
      textField: 'posting_department',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      allowSearchFilter: true,
      enableCheckAll: true,
      itemsShowLimit: 5,
    };
    this.dropdownSettings_designation = {
      singleSelection: false,         // Allow multiple selections
      idField: 'post_offered',        // Field to bind as the ID
      textField: 'post_offered',      // Field to bind as the display text
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 5,              // Limit items displayed in the UI
      allowSearchFilter: true,
      enableCheckAll: true,
    };

    this.get_geo_fencing_list();
    this.get_att_dept_master_list();
    this.get_att_role_master_list();

    this.TpCheckInOutSummary();
    // this.get_employee_leave();

    if (localStorage.getItem('showGermanTime')) {
      this.showGermanTime = localStorage.getItem('showGermanTime');
    } else {
      localStorage.setItem('showGermanTime', 'IST');
      this.showGermanTime = 'IST';
    }

  }


  ngAfterViewInit() {

    // setTimeout(() => {
    //     $('#FromDate').datepicker({
    //         dateFormat: 'dd/mm/yy',
    //         changeMonth: true,
    //         changeYear: true,
    //     }).datepicker('setDate', new Date()); // Set current date as default
    // }, 500);

    setTimeout(() => {
      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date()); // Set current date as default
    }, 500);

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_geo_fencing_list() {
    this._BusinesSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllOUsForCustomer",
      "searchKeyword": ''
    }).subscribe((resData: any) => {
      this.geo_fencing_list_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          this.toastr.info('No data found', '');
          this.geo_fencing_list_data = [];
          return;
        }
        this.geo_fencing_list_data = resData.commonData;

        for (let index = 0; index < this.geo_fencing_list_data.length; index++) {
          const element = this.geo_fencing_list_data[index];
          if (element.emp_codes) {
            this.geo_fencing_list_data[index].emp_codes = element.emp_codes ? element.emp_codes.replace(/}/g, '').replace(/{/g, '') : '';
          }
        }
        this.geo_fencing_list_data_count = this.geo_fencing_list_data.length;

        // Update unit_master_list_data with the org_unit_name for the dropdown
        this.unit_master_list_data = this.geo_fencing_list_data.map(item => ({
          unitname: item.org_unit_name,  // Use org_unit_name for unitname
          unitid: item.id                // Keep the ID for later use if needed
        }));
      } else {
        this.geo_fencing_list_data_count = 0;
      }
    }, (error: any) => {
      this.geo_fencing_list_data_count = 0;
    });
  }


  get_att_dept_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetPostingDepartments",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.department_master_list_data = resData.commonData.map(department => ({
          posting_department: department.posting_department
        }));

        // Add 'All' if not already present
        if (!this.department_master_list_data.some(dept => dept.posting_department === 'All')) {
          // this.department_master_list_data.unshift({ posting_department: 'All' });
        }
      } else {
        this.department_master_list_data = [];
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
      if (resData.statusCode) {
        this.role_master_list_data = resData.commonData.map(role => ({
          post_offered: role.post_offered
        }));

        // Add "All" option if it doesn't already exist
        if (!this.role_master_list_data.some(role => role.post_offered === 'All')) {
          // this.role_master_list_data.unshift({ post_offered: 'All' });
        }
      } else {
        this.role_master_list_data = [];
        console.log(resData.message);
      }
    });
  }

  getEmp_code(employee: any, idx: any) {
    if (employee.check_in_time) {
      this.Emp_code = employee;
      this.id = idx;
      this.designation = this.Emp_code?.designation;
      // console.log(this.designation);
      this.emp_code = this.Emp_code?.emp_code;
      // if (this.id != '' && this.id != undefined){
      this.router.navigate(['reports/check-in/check-in-by-emp-code'], { state: { emp_code: this.emp_code, id: this.id, designation: this.designation } });

    } else {
      this.toastr.info('Employee on Leave.', 'Info');
    }

    // else {
    //   this.toastr.info('Somthing went Wrong. Please try later.', 'Success');
    // }
  }

  TpCheckInOutSummary() {
    // this.from_date = $('#FromDate').val();
    this.loading = true;
    if ($('#ToDate').val() != '' && $('#ToDate').val() != null && $('#ToDate').val() != undefined) {
      this.to_date = $('#ToDate').val();
    }
    this.markStatus = this.checkin_Form.get('markedStatus')?.value?.toString();
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

    this._ReportService.GetTpCheckInOutSummary({
      // "fromDate": this.from_date,
      "fromDate": this.to_date,
      "toDate": this.to_date,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "flag": "normal_report",
      "GeoFenceId": this.token.geo_location_id,
      "checkInOutMarkedType": this.checkin_Form.get('markedStatus')?.value?.toString(),
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment
    }).subscribe((resData: any) => {
      this.loading = false;
      this.checkInOutDeviceStatus = resData.checkInOutDeviceStatus;
      // console.log(this.checkInOutDeviceStatus.last_offline_sync_date.split(' '))
      if (resData.statusCode) {
        this.employee_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this.employee_data);
        //this.tot_check_inout =
        this.countNonZeroCheckTime(this.employee_data);
        this.emp_code = this.employee_data?.emp_code;

        if (this.employee_data.length > 0) {
          this.innerPanelData = this.employee_data[0];
        }


      } else {
        this.employee_data = [];
        this.show_label = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
      this.get_employee_leave();
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

    this._ReportService.GetTpCheckInOutSummary({
      // "fromDate": this.from_date,
      "fromDate": this.to_date,
      "toDate": this.to_date,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "flag": "normal_report",
      "GeoFenceId": this.token.geo_location_id,
      "checkInOutMarkedType": this.checkin_Form.get('markedStatus')?.value?.toString(),
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment

    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));

        this.data.forEach((item: any) => {
          item.check_in_time = item.check_in_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(item.check_in_time, item.attendancedate) : item.check_in_time;
          item.check_out_time = item.check_out_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(item.check_out_time, item.attendancedate) : item.check_out_time;

          if (Array.isArray(item.check_in_out_details)) {
            item.check_in_out_details.forEach((item2: any) => {
              item2.check_in_time = item2.check_in_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(item2.check_in_time, item2.check_in_date) : item2.check_in_time;
              item2.check_out_time = item2.check_out_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(item2.check_out_time, item2.check_out_date) : item2.check_out_time;
            })

          }
        })
      }
      this.merging_employee_leave_data_for_excel();
    })
  }

  merging_employee_leave_data_for_excel() {
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

    let selected_date = this.to_date.replace(/\//g, '-');
    let temp_data = [];

    let obj = {
      action: "get_employee_leave_check_in_out",
      accountId: this.tp_account_id?.toString(),
      ouIds: this.ouIds,
      selectedDate: selected_date || null,
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment
    };

    this._loginService.get_tpay_dashboard_data(obj)
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            temp_data = resData.commonData;

          }

          for (let data of temp_data) {
            let obj = {
              "marked_status": "",
              "table_ref": "",
              "emp_code": data.emp_code.toString(),
              "emp_name": data.emp_name,
              "designation": !data.post_offered ? '' : data.post_offered,
              "jobtype": "",
              "attendancedate": data.att_date,
              "check_in_time": "",
              "check_out_time": "",
              "attendance_type": "",
              "check_in_out_count": "",
              "no_of_hours_worked": "",
              "check_in_location": "",
              "check_out_location": "",
              "check_in_image_path": "",
              "check_out_image_path": "",
              "dateofjoining": "",
              "photopath": "",
              "orgempcode": !data.orgempcode ? '' : data.orgempcode,
              "tpcode": !data.tpcode ? '' : data.tpcode,
              "check_in_out_details": [],
              "is_overtime_applicable": "",
              "no_of_overtime_hours_worked": "",
              "deviation_in_checkin": "",
              "deviation_in_checkout": "",
              "deviation_in_total_working_hours": "",
              "shift_name": "",
              "is_night_shift": "",
              "break_total_time": "",
              "break_pay_type": "",
              "is_auto_shift_assign": "",
              "attendance_policy_id": "",
              "department": "",
              "assigned_ou_ids": "",
              "assigned_ou_ids_names": "",
              "assigned_geofence_ids": "",
              "assigned_geofence_ids_names": "",
              "check_in_date": "",
              "check_out_date": "",
              "live_tracking_opted": "",
              "offline_sync_id": "",
              "leavetype": data.leavetype,
              "leavetypename": data.leavetypename,
            }

            this.data.push(obj);
          }




          let exportData = [];
          let days = {};
          for (let i = 0; i < this.data.length; i++) {
            let head = this.data.w_date_d
            // + resData.commonData[i].dayname;
            days = {
              ...days, [head]: ''
            }
          }

          const formatBreakTotalTime = (breakTotalTime: string): string => {
            try {
              const breaks = JSON.parse(breakTotalTime);
              return breaks.map(b =>
                `${b.break_type} [${b.break_type_duration}] - ${b.break_type_paid_unpaid}`
              ).join(', ');
            } catch (e) {
              // console.error('Error parsing break_total_time:', e);
              return '';
            }
          };

          // Sort data by emp_name ascending
          this.data.sort((a, b) => a.emp_name.localeCompare(b.emp_name));


          for (let idx = 0; idx < this.data.length; idx++) {
            let obj = {
              'Attendance Date': this.data[idx].attendancedate,
              'Employee Code': this.data[idx].orgempcode,
              'TPCode': this.data[idx].tpcode,
              'Employee Name': this.data[idx].emp_name,
              'Department': this.data[idx].department,
              'Designation': this.data[idx].designation,
              'Leave Type': this.data[idx].leavetypename,
              'Organisation Unit': this.data[idx].assigned_ou_ids_names,
              'Geofence Name': this.data[idx].assigned_geofence_ids_names,
              'Source': this.data[idx].attendance_type,
              'In Time': this.data[idx].check_in_time,
              'Check In Location': this.data[idx].check_in_location,
              'Out Time': this.data[idx].check_out_time,
              'Check Out Location': this.data[idx].check_out_location,
              'No Of Hours Worked': this.data[idx].no_of_hours_worked,
              'Shift Name': this.data[idx].shift_name,
              'Auto Assign Shift': this.data[idx].is_auto_shift_assign,
              'Night Shift': this.data[idx].is_night_shift,
              'Break': formatBreakTotalTime(this.data[idx].break_total_time),
              // <td> {{emp.tpcode }}</td>
              // <td> {{emp.orgempcode }}</td>

              ' ': ' ',

            }
            // console.log(this.data[idx].check_in_out_details);

            if (this.data[idx].no_of_hours_worked !== '00:00' && this.data[idx].no_of_hours_worked !== undefined) {
              obj['Is Overtime Applicable'] = this.data[idx].is_overtime_applicable;
              obj['No Of Overtime Hours Worked'] = this.data[idx].no_of_overtime_hours_worked;
              obj['Deviation In Checkin'] = this.data[idx].deviation_in_checkin;
              obj['Deviation In Checkout'] = this.data[idx].deviation_in_checkout;
              obj['Deviation In Total Working Hours'] = this.data[idx].deviation_in_total_working_hours;
            }

            let i = 1;
            for (const details of this.data[idx].check_in_out_details) {
              obj['CheckIn ' + i] = details.check_in_time;
              obj['CheckOut ' + i] = details.check_out_time;
              obj['Wrkhrs ' + i] = details.no_of_hours_worked;
              obj['Source ' + i] = details.attendance_type;
              obj['Check-In Geofence ' + i] = details.check_in_geofence_id_name;
              obj['Check-Out Geofence ' + i] = details.check_out_geofence_id_name;
              i++;
            }

            exportData.push(obj);


            // console.log(obj,"fh");

          }
          // console.log(this.data), 'AASDFGH';

          // if (exportData.length == 0) {
          //   this.toastr.info('No data found.', 'Info');
          //   return;
          // }

          // console.log(exportData);
          const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
          const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
          const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const downloadLink: any = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(data);
          let date = new Date()
          downloadLink.download = 'Check_In_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
          downloadLink.click();


        }
      })



  }

  countNonZeroCheckTime(jsonData: any) {
    let count1 = 0;
    let count2 = 0;

    for (const entry of jsonData) {
      if (entry.check_in_time !== '00:00') {
        count1++;
      }
      if (entry.check_out_time !== '00:00') {
        count2++;
      }

    }


    this.tot_check_in = count1.toString();
    this.tot_check_out = count2.toString();


    // return count;
  }

  getCheckInImage(checkin_image: any) {
    // console.log(checkin_image);

    if (checkin_image != '' && checkin_image != null) {
      this.pop_imgcheck_in_image_path = checkin_image;

    }
    else {
      this.pop_imgcheck_in_image_path = '';
    }
  }
  getCheckOutImage(checkout_image: any) {
    // console.log(checkout_image);
    if (checkout_image != '' && checkout_image != null) {
      this.pop_check_out_image_path = checkout_image;
    }
    else {
      this.pop_check_out_image_path = '';
    }
  }


  openPanel(i: number, emp_data: any) {
    // console.log(emp_data, 'eeeeeeeeeeee')
    this.innerPanelData = emp_data;
    this.innerTotalHrsWorked = 0;

    this.innerPanelData.check_in_out_details.map((el: any) => {
      if (el.no_of_hours_worked !== null && el.no_of_hours_worked !== undefined) {
        this.innerTotalHrsWorked += this.timeToHoursMinutes(el.no_of_hours_worked);
      }
    })

    // Convert total numerical hours to 'hours:minutes' format
    const totalHours = Math.floor(this.innerTotalHrsWorked);
    const totalMinutes = Math.round((this.innerTotalHrsWorked - totalHours) * 60);
    // console.log(totalHours, totalMinutes);
    if (totalHours === 0) {
      this.innerTotalHrsWorked = '00:' + totalMinutes.toString().padStart(2, '0');
    } else {
      this.innerTotalHrsWorked = totalHours.toString().padStart(2, '0') + ':' + totalMinutes.toString().padStart(2, '0');
    }

    const targetElement = document.getElementById(`collapseOne${i}`);

    // Check if the clicked panel is already open
    const isOpen = targetElement.classList.contains('in');

    // Close all previously opened panels (if needed)
    const previouslyOpened = document.querySelectorAll('.in.panel-collapse.collapse');

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
  }

  open_new_Panel(i: number, emp_data: any) {
    this.is_overtime_applicable = emp_data?.is_overtime_applicable;
    this.no_of_overtime_hours_worked = emp_data?.no_of_overtime_hours_worked;
    this.deviation_in_checkin = emp_data?.deviation_in_checkin;
    this.deviation_in_checkout = emp_data?.deviation_in_checkout;
    this.deviation_in_total_working_hours = emp_data?.deviation_in_total_working_hours

    const targetElement = document.getElementById(`CollapseOne${i}`);

    // Check if the clicked panel is already open
    const isOpen = targetElement.classList.contains('in');

    // Close all previously opened panels (if needed)
    const previouslyOpened = document.querySelectorAll('.in.panel-collapse.collapse');

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
  }

  timeToHoursMinutes(timeStr: any) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  }

  synced_punches() {

    this.TpCheckInOutSummary();
    this.from_date = $('#ToDate').val();
    this.to_date = $('#ToDate').val();
    this.get_employee_leave();

    this._ReportService.process_att_punches_hub({
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "account_id": this.tp_account_id,
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        // console.log(resData.message);

        // this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
      }

    });

  }

  exportToPdf() {
    if(this.employee_data.length > 200){
      this.toastr.error('Too many records. Please apply a filter to reduce the data.');
      return;
    }
    else{
      let tableHtml = `<style>.table {
            border: 1px solid black;
            border-collapse: collapse;
          }
          .table th,
          .table td {
            border: 1px solid black;
            padding: 8px;
          }
        </style>`;
      tableHtml += `<p style="text-align:center;">Check In Check Out Report (${this.markStatus}-${this.to_date})</p>`;
      tableHtml += `<table class="table">`;
      tableHtml += `<tr>
                    <th>Attendance Date</th>
                    <th>Employee Code</th>
                    <th>TPCode</th>
                    <th>Employee Name</th>
                    <th>Organisation Unit</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Leave Type</th>
                    <th>Source</th>
                    <th>In Time</th>
                    <th>Check In Location</th>
                    <th>Check In Pic</th>
                    <th>Out Time</th>
                    <th>Check Out Location</th>
                    <th>Check Out Pic</th>
                    <th>No Of</th>
                    <th>Shift Name</th>
                    <th>Auto Assign</th>
                    <th>Night Shift</th>
                    <th>Break</th>
                  </tr>`;
      for (let emp of this.employee_data) {
        let check_in_time = emp.check_in_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(emp.check_in_time, emp.attendancedate) : emp.check_in_time;
        let check_out_time = emp.check_out_time && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(emp.check_out_time, emp.attendancedate) : emp.check_out_time;

        tableHtml += `<tr>
                                    <td>${emp.attendancedate || ''}</td>
                                    <td>${emp.orgempcode || ''}</td>
                                    <td>${emp.tpcode || ''}</td>
                                    <td>${emp.emp_name || ''}</td>
                                    <td>${emp.assigned_ou_ids_names || ''}</td>
                                    <td>${emp.department || ''}</td>
                                    <td>${emp.designation || ''}</td>
                                    <td>${emp.leavetypename || ''}</td>
                                    <td>${emp.attendance_type || ''}</td>
                                    <td>${check_in_time || ''}</td>
                                    <td>${emp.check_in_location || ''}</td>
                                        <td><img src="${emp.check_in_image_path}" /></td>
                                    <td>${check_out_time || ''}</td>
                                    <td>${emp.check_out_location || ''}</td>
                                      <td><img src="${emp.check_out_image_path}" /></td>
                                    <td>${emp.no_of_hours_worked || ''}</td>
                                    <td>${emp.shift_name || ''}</td>
                                    <td>${emp.is_auto_shift_assign || ''}</td>
                                    <td>${emp.is_night_shift || ''}</td>
                                    <td>${this.formatBreakTotalTime(emp.break_total_time) || ''}</td>
                                  </tr>`;
      }

      tableHtml += `</table>`;
      this._ReportService.generatePdfByCode({
        "htmlBody": tableHtml
      }).subscribe((resData: any) => {
        if (resData.statusCode == true) {
          const byteCharacters = atob(resData.commonData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const file = new Blob([byteArray], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const a = document.createElement('a');
          a.href = fileURL;
          a.download = 'checkin-checkout-report.pdf';
          a.click();
          URL.revokeObjectURL(fileURL);
        }
      })
    }
  }

  reprocess_punches(emp_code: any) {
    this.from_date = $('#ToDate').val();
    this.to_date = $('#ToDate').val();

    this._AttendanceService.attendanceProcessEmployeeAttendance({
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empcodes: emp_code.toString(),
      fromdate: this.from_date,
      todate: this.to_date
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          // this.get_Last_sync_stataus_hub();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  // Listing of Employees on Leave - sidharth kaul dated. 21.05.2025
  get_employee_leave() {
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

    let selected_date = this.to_date.replace(/\//g, '-');

    let obj = {
      action: "get_employee_leave_check_in_out",
      accountId: this.tp_account_id?.toString(),
      ouIds: this.ouIds,
      selectedDate: selected_date || null,
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment
    };

    this._loginService.get_tpay_dashboard_data(obj)
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_employee_leave_data = resData.commonData;


            // console.log(this.get_employee_leave_data, 'get_employee_leave_data');

            //             {
            //     "emp_id": 1946,
            //     "emp_code": 6607,
            //     "emp_name": "Akchhaya",
            //     "orgempcode": "25D22",
            //     "att_date": "06-Jun-2025",
            //     "post_offered": "Test",
            //     "employee_photo": null,
            //     "leavetype": "CL",
            //     "leavetypename": "Casual leave"
            // }

            for (let data of this.get_employee_leave_data) {
              let obj = {
                "marked_status": "",
                "table_ref": "",
                "emp_code": data.emp_code.toString(),
                "emp_name": data.emp_name,
                "designation": !data.post_offered ? '' : data.post_offered,
                "jobtype": "",
                "attendancedate": data.att_date,
                "check_in_time": "",
                "check_out_time": "",
                "attendance_type": "",
                "check_in_out_count": "",
                "no_of_hours_worked": "",
                "check_in_location": "",
                "check_out_location": "",
                "check_in_image_path": "",
                "check_out_image_path": "",
                "dateofjoining": "",
                "photopath": "",
                "orgempcode": !data.orgempcode ? '' : data.orgempcode,
                "tpcode": !data.tpcode ? '' : data.tpcode,
                "check_in_out_details": [],
                "is_overtime_applicable": "",
                "no_of_overtime_hours_worked": "",
                "deviation_in_checkin": "",
                "deviation_in_checkout": "",
                "deviation_in_total_working_hours": "",
                "shift_name": "",
                "is_night_shift": "",
                "break_total_time": "",
                "break_pay_type": "",
                "is_auto_shift_assign": "",
                "attendance_policy_id": "",
                "department": "",
                "assigned_ou_ids": "",
                "assigned_ou_ids_names": "",
                "assigned_geofence_ids": "",
                "assigned_geofence_ids_names": "",
                "check_in_date": "",
                "check_out_date": "",
                "live_tracking_opted": "",
                "offline_sync_id": "",
                "leavetype": data.leavetype,
                "leavetypename": data.leavetypename,
              }

              this.employee_data.push(obj);
            }

            this.employee_data.sort((a, b) => a.emp_name.localeCompare(b.emp_name));

            // this.employee_data
          } else {
            this.get_employee_leave_data = [];
          }
          this.closeSidebar();
        }, error: (e) => {
          this.get_employee_leave_data = [];
          //console.log(e);
        }
      });
  }


  reprocess_today_checkinout() {
    if (this.reprocessDisabled) {
      this.toastr.info('Please wait 5 minutes before reprocessing again.', 'Info');
      return;
    }

    this.reprocessDisabled = true;
    this.reprocessTimer = setTimeout(() => {
      this.reprocessDisabled = false;
    }, 5 * 60 * 1000); // 5 minutes

    let todate = $('#ToDate').val();
    let fromdate = $('#ToDate').val();

    this._ReportService.reprocess_today_checkinout({
      'accountid': this.tp_account_id.toString(),
      'fromdate': fromdate,
      'todate': todate,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success('Processed in queue, wait for 5 mins', 'Success');
          this.TpCheckInOutSummary();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    });
  }

  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;

    this.selectedUnitId = this.selectedUnitId_copy;
    this.selectedDesignationId = this.selectedDesignationId_copy;
    this.selectedDepartmentId = this.selectedDepartmentId_copy;

    // this.get_od_appl_by_account();
    this.TpCheckInOutSummary()

  }

  openSidebar() {
    this.change_sidebar_filter_flag = true;

    this.selectedUnitId_copy = this.deepCopyArray(this.selectedUnitId);
    this.selectedDesignationId_copy = this.deepCopyArray(this.selectedDesignationId);
    this.selectedDepartmentId_copy = this.deepCopyArray(this.selectedDepartmentId);

    document.getElementById("sidebar").style.width = "380px";
  }

  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }
  resetFilter() {
    this.selectedUnitId = [];
    this.selectedDesignationId = [];
    this.selectedDepartmentId = [];
    this.selectedUnitId_copy = [];
    this.selectedDesignationId_copy = [];
    this.selectedDepartmentId_copy = [];
  }

  onTimezoneChange() {
    localStorage.setItem('showGermanTime', this.showGermanTime);
  }

  getGermanTime(time: string, date: string): string {
    return this.istToGermanTimeService.convertIstToGermanTime(time, date);
  }


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



}
