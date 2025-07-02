import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AttendanceService } from '../../attendance/attendance.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import * as XLSX from 'xlsx';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { ReportService } from '../report.service';
import moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { IstToGermanTimeService } from 'src/app/shared/services/ist-to-german-timezone.service';

declare var $: any;

@Component({
  selector: 'app-monthly-in-out-shift-report',
  templateUrl: './monthly-in-out-shift-report.component.html',
  styleUrls: ['./monthly-in-out-shift-report.component.css']
})

export class MonthlyInOutShiftReportComponent {

  filteredEmployees: any = [];
  showSidebar: boolean = true;
  yearsArray: any = [];
  decoded_token: any;
  calendar_data: any = [];
  blankCalendar: any = [];
  emp_json_data: any = [];

  LedgerMasterHeads_head: any = [];

  overtime_headid: string = '';
  allowance_headid: string = '';
  deduction_headid: string = '';
  advance_headid: string = '';
  travel_allowance: string = '';
  daily_allowance: string = '';


  tp_account_id: any;
  product_type: any;
  p: number = 0;
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
  selected_date: any;
  days_count: any;  // No. of days in a month
  // days_array: any = []; // Array representing no. of days in a month
  getEmployerMonthAttData: any = [];
  showAttCalendarPopup: boolean = false;
  attCalendarForm: FormGroup;
  searchKey: any = '';
  excelBulkAttUploadArray: any = [];
  excelToTableData: any = [];
  fileUpload_binarystr: any = '';
  fileUpload_name: any = '';

  show_bulk_upload_btn = true;
  showAllowDeductPopup: boolean = false;
  allowanceDeductForm: FormGroup;
  voucherdetails_split: any = [];
  month_days_master: any = [];
  filter_emp_val: any;
  download_excel_data: any = [];
  employee_att_table_data: any = [];
  filtered_employee_att_table_data: any = [];
  ouIds: any = '';
  status_filter: any = 'all';
  att_status_filter: any = '';

  att_status_filter_copy: any;
  status_filter_copy: any;
  search_key_copy: any = '';
  month_copy: any;
  year_copy: any;
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
  selectAll: boolean = false;
  showSelectionCheckboxes: boolean = true;

  showfields: any;
  fieldarray: any = [];
  includeAllDateFields: boolean = true;

  selectedDynmicColumnValues: any[] = [];
  filtered_month_days_master: any[] = [];
  showGermanTime = 'IST';
  // showGermanTime = 'CET';


  constructor(
    private _attendanceService: AttendanceService,
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private confirmationDialogService: ConfirmationDialogService,
    private _businesessSettingsService: BusinesSettingsService,
    private _reportService: ReportService,
    public istToGermanTimeService:IstToGermanTimeService ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.ouIds = this.decoded_token.ouIds;

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
    // this.get_att_unit_master_list();
    this.getDepartmentData();
    this.getDesignationData();

    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

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
    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];
    this.days_count = new Date(this.year, this.month, 0).getDate()

    // this.get_month_dates_days();

    this.getEmployerMonthAttendance_for_excel_table_data();
    // this.days_array = this.generateNumberArray();

    this.attCalendarForm = this._formBuilder.group({
      emp_code: [''],
      emp_name: [''],
      dateofbirth: [''],
      mobile: [''],
      attendancedate: [''],
      attendancetype: [''],
      leave_bank_id: [''],
      leavetype: [''],
      emp_index: [''],
    });

    this.allowanceDeductForm = this._formBuilder.group({
      emp_code: ['', [Validators.required]],
      emp_name: [''],
      type: ['', [Validators.required]],
      value: ['', [Validators.required]],
      remarks: ['']
    });



    // Very Important Logic
    (async () => {
      await this.get_month_dates_days();
      // console.log("HIII");
      Object.keys(this.showfields).forEach(key => this.showfields[key] = true);
      this.updateFilteredDays();
    })();

    // this.getColumnValues();

    if (localStorage.getItem('showGermanTime')) {
      this.showGermanTime = localStorage.getItem('showGermanTime');
    } else {
      localStorage.setItem('showGermanTime', 'IST');
      this.showGermanTime = 'IST';
    }

  }

  get ad() {
    return this.allowanceDeductForm.controls;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.get_month_dates_days();
    this.getEmployerMonthAttendance_for_excel_table_data();
    // this.days_array = this.generateNumberArray();

  }

  change_status() {
    this.getEmployerMonthAttendance_for_excel_table_data();
  }

  changeYear(e: any) {
    this.year = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.get_month_dates_days();
    this.getEmployerMonthAttendance_for_excel_table_data();
    // this.days_array = this.generateNumberArray();
  }

  getEmployerMonthAttendance_for_excel_table_data() {
    this._attendanceService.getEmployerMonthAttendance_for_excel({
      customerAccountId: this.tp_account_id.toString(),
      month: this.month,
      year: this.year,
      'GeoFenceId': this.decoded_token.geo_location_id,
      attendanceSource: 'all',
      productTypeId: this.product_type,
      action: 'GetEmployermonthAttendanceCheckinoutForExcel',
      ouIds: this.ouIds,
      status: this.status_filter,
      postOffered: this.desgName,
      postingDepartment: this.deptName,
      unitParameterName: this.orgName,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.employee_att_table_data = resData.commonData;
          this.filtered_employee_att_table_data = this.deepCopyArray(this.employee_att_table_data);

          this.filtered_employee_att_table_data = this.filtered_employee_att_table_data.map(item => ({ ...item, selected: false }));
          this.search();
        } else {
          this.employee_att_table_data = [];
          this.filtered_employee_att_table_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }

        if (this.change_sidebar_filter_flag) {
          this.closeSidebar();
        }
      }, error: (e) => {
        this.employee_att_table_data = [];
        this.filtered_employee_att_table_data = [];
        console.log(e);
      }
    })
  }


  search() {
    let searchkey = this.searchKey.toString().toLowerCase();
    let att_status_filter = this.att_status_filter.toString().toLowerCase();
    // console.log(this.att_status_filter);
    // this.p = 0;
    this.filtered_employee_att_table_data = this.employee_att_table_data.filter(function (element: any) {
      return (element.emp_name.toLowerCase().includes(searchkey)
        || element.orgempcode?.toLowerCase().includes(searchkey)
        || element.tpcode?.toLowerCase().includes(searchkey)
        || element.mobile.toLowerCase().includes(searchkey)) &&
        element.approval_status?.toLowerCase().includes(att_status_filter)
    });
    // this.change_att_status();
  }

  // change_att_status() {
  //   // this.att_status_filter;
  //   if (this.att_status_filter == '') {
  //   }
  //   let new_data = this.filtered_employee_att_table_data.filter((el:any) => this.att_status_filter?.toLowerCase() == el.approval_status?.toLowerCase());
  //   this.filtered_employee_att_table_data = this.deepCopyArray(new_data);
  // }


  filter_emp(val: any) {
    this.filter_emp_val = val;
    // console.log(this.filter_emp_val);
    if (val == 1) {
      this.filteredEmployees = this.deepCopyArray(this.emp_json_data);
    } else if (val == 2) {
      this.filteredEmployees = this.emp_json_data.filter((el: any) => {
        // if (el.approved_attendance.split(' ')[0] == 0) {
        //   return el;
        // }
        if (el.monthly_att_approval_status == 'N' && (el.present_days) == 0) {
          return el;
        }
      })
    } else if (val == 3) {
      this.filteredEmployees = this.emp_json_data.filter((el: any) => {
        // if (el.approved_attendance.split(' ')[0] == 0) {
        //   return el;
        // }
        if (el.monthly_att_approval_status == 'N' && (el.present_days) > 0) {
          return el;
        }
      })

    } else if (val == 4) {
      this.filteredEmployees = this.emp_json_data.filter((el: any) => {
        // if (el.approved_attendance.split(' ')[0] > 0) {
        //   return el;
        // }
        if (el.monthly_att_approval_status == 'Y') {
          return el;
        }
      })
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


  // generateNumberArray(): number[] {
  //   return Array.from({ length: this.days_count }, (_, index) => index + 1);
  // }
  generateArrayOfObjects(n) {
    const result = [];
    for (let i = 1; i <= n; i++) {
      // if (this.month_days_master[i - 1].holiday_name_cd == 'HO') {
      //   result.push({ 'attday': i, 'attendance_type': 'HO' });
      // } else

      // {
      result.push({ 'attday': i, 'attendance_type': '' });
      //}
    }
    return result;
  }

  getEmployerMonthAttendance() {
    this._attendanceService.getEmployerMonthAttendance({
      customerAccountId: this.tp_account_id.toString(),
      month: this.month,
      year: this.year
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.getEmployerMonthAttData = resData.commonData;
          // console.log(this.getEmployerMonthAttData);
          // console.log(this.filteredEmployees);

          this.getEmployerMonthAttData.forEach(obj1 => {
            let index = this.filteredEmployees.findIndex(obj2 => obj1.emp_code == obj2.emp_code);
            if (index != -1) {
              let inner_index = this.filteredEmployees[index]?.att_details.findIndex(obj3 => obj3.attday == obj1.attday);
              Object.assign(this.filteredEmployees[index]?.att_details[inner_index], obj1);


              //present & leave days
              if (obj1?.attendance_type == 'PP' || obj1?.attendance_type == 'HO' || obj1?.attendance_type == 'WO') {
                this.filteredEmployees[index].present_days += 1.0;
              } else if (obj1?.attendance_type == 'HD') {
                this.filteredEmployees[index].present_days += 0.5;
              } else if (obj1?.attendance_type == 'LL') {
                this.filteredEmployees[index].leave_days += 1.0;
              } else if (obj1?.attendance_type == 'AA') {
                this.filteredEmployees[index].absent_days += 1.0;
              }
            }
          });

          this.emp_json_data = this.deepCopyArray(this.filteredEmployees);
          // console.log(this.emp_json_data)
          this.filter_emp(this.filter_emp_val)

        } else {
          this.getEmployerMonthAttData = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

  validate_dates(dateofjoining: any, dateofrelieveing: any, dd: any, mm: any, yy: any) {
    // console.log(this.month,this.year);

    let current_date = new Date();
    let dynamic_date = new Date(yy, (mm - 1), dd);
    // console.log(dynamic_date);

    let sel_emp_join = dateofjoining.split('/');
    let doj = new Date(sel_emp_join[2], (sel_emp_join[1] - 1), sel_emp_join[0]);

    if (dateofrelieveing != '') {
      let sel_emp_rel = dateofrelieveing.split('/');
      let dor = new Date(sel_emp_rel[2], (sel_emp_rel[1] - 1), sel_emp_rel[0]);

      if (dynamic_date > dor) {
        // this.toastr.error('Marking date should be less than employee DOL (Date of Leaving) date', 'Oops!');
        return false;

      }
    }


    if (dynamic_date > current_date) {
      // this.toastr.error('Future date attendance marking not allowed. Please check selected date', 'Oops!');
      return false;

    } else if (dynamic_date < doj) {
      // this.toastr.error('Marking date should be greater than employee DOJ date', 'Oops!');
      return false;

    }

    return true;

  }

  validate_dates2(emp_code: any, dateofjoining: any, dateofrelieveing: any, dd: any, mm: any, yy: any) {
    // console.log(this.month,this.year);

    let current_date = new Date();
    let dynamic_date = new Date(yy, (mm - 1), dd);
    // console.log(dynamic_date);

    let sel_emp_join = dateofjoining.split('/');
    let doj = new Date(sel_emp_join[2], (sel_emp_join[1] - 1), sel_emp_join[0]);

    if (dateofrelieveing != '') {
      let sel_emp_rel = dateofrelieveing.split('/');
      let dor = new Date(sel_emp_rel[2], (sel_emp_rel[1] - 1), sel_emp_rel[0]);

      if (dynamic_date > dor) {
        this.toastr.error('Marking date should be less than employee (' + emp_code + ') DOL (Date of Leaving) date', 'Oops!', { disableTimeOut: true });
        return false;

      }
    }


    if (dynamic_date > current_date) {
      this.toastr.error('Future date attendance marking not allowed of employee (' + emp_code + '). Please check selected date', 'Oops!', { disableTimeOut: true });
      return false;

    } else if (dynamic_date < doj) {
      this.toastr.error('Marking date should be greater than employee (' + emp_code + ') DOJ date', 'Oops!', { disableTimeOut: true });
      return false;

    }

    return true;

  }



  // get_month_dates_days() {
  //   this._attendanceService.get_month_dates_days({
  //     'employer_id': this.decoded_token.id, 'month': this.month,
  //     'year': this.year
  //   }).subscribe((resData: any) => {
  //     // console.log(resData);
  //     if (resData.status) {
  //       this.month_days_master = resData.commonData;
  //       console.log("month_days_master",this.month_days_master);
  //       this.intialize_show_fields(this.month_days_master);
  //       this.initialize_fieldarray();
  //       this.updateFilteredDays();

  //     } else {
  //       this.toastr.error(resData.message, 'Oops!');
  //     }
  //   })
  // }

  async get_month_dates_days() {
    try {
      const resData: any = await firstValueFrom(
        this._attendanceService.get_month_dates_days({
          employer_id: this.decoded_token.id,
          month: this.month,
          year: this.year
        })
      );

      if (resData.status) {
        this.month_days_master = resData.commonData;
        // console.log("month_days_master", this.month_days_master);
        this.intialize_show_fields(this.month_days_master);
        this.initialize_fieldarray();
        this.updateFilteredDays();
      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    } catch (error) {
      console.error('Error while fetching month dates:', error);
      this.toastr.error('Something went wrong while loading data.', 'Error');
    }
  }


  getShortMonthName(data: any) {
    if (!data) {
      return '';
    }

    let monthId = data.w_date.split('-')[1];
    // console.log('id', monthId);
    const month = this.monthsArray.find((m: any) => parseInt(m.id) == parseInt(monthId));
    // console.log('month', month);
    if (month) {
      return month.month.slice(0, 3);
    }
    return '';
  }

  getEmployerMonthAttendance_for_excel() {
    this._attendanceService.getEmployerMonthAttendance_for_excel({
      customerAccountId: this.tp_account_id.toString(),
      month: this.month,
      year: this.year,
      'GeoFenceId': this.decoded_token.geo_location_id,
      attendanceSource: 'all',
      productTypeId: this.product_type,
      action: 'GetEmployermonthAttendanceCheckinoutForExcel',
      ouIds: this.ouIds,
      status: this.status_filter,
      postOffered: this.desgName,
      postingDepartment: this.deptName,
      unitParameterName: this.orgName,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          let download_excel_data_temp = resData.commonData;

          //filter excel data on search, att status
          let searchkey = this.searchKey.toString().toLowerCase();
          let att_status_filter = this.att_status_filter.toString().toLowerCase();

          this.download_excel_data = download_excel_data_temp.filter(function (element: any) {
            return (element.emp_name.toLowerCase().includes(searchkey)
              || element.orgempcode.toLowerCase().includes(searchkey)
              || element.tpcode.toLowerCase().includes(searchkey)
              || element.mobile.toLowerCase().includes(searchkey)) &&
              element.approval_status?.toLowerCase().includes(att_status_filter)
          });
          //filter excel data on search, att status
          this.getAttExcel();
        } else {
          this.download_excel_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.download_excel_data = [];
        console.log(e);
      }
    })
  }

  getAttExcel() {
    this._attendanceService.get_month_dates_days({
      'employer_id': this.decoded_token.id, 'month': this.month,
      'year': this.year
    }).subscribe((resData: any) => {
      if (resData.status) {
        let exportData = [];

        for (let idx = 0; idx < this.download_excel_data.length; idx++) {
          let obj = {
            'Employee': this.download_excel_data[idx].emp_name,
            'TPayRefNo': this.download_excel_data[idx].emp_code,
            'OrgEmpCode': !this.download_excel_data[idx].orgempcode ? this.download_excel_data[idx].tpcode : this.download_excel_data[idx].orgempcode,
            'Mobile': this.download_excel_data[idx].mobile,
            'OrganizationUnit ': this.download_excel_data[idx].assignedous,
            'Designation': this.download_excel_data[idx].post_offered,
            'Department': this.download_excel_data[idx].posting_department,
            'Status': this.download_excel_data[idx]?.lockstatus,
            'DOB': this.download_excel_data[idx].dateofbirth,
            'DOJ': this.download_excel_data[idx].dateofjoining,
            'DOR': this.download_excel_data[idx].dateofrelieveing,
            'Man Days': !(this.download_excel_data[idx].salary_month_days) ? 'full-days' : this.download_excel_data[idx].salary_month_days,
            'ApprovalStatus': this.download_excel_data[idx]?.approval_status,
            'Present': !this.download_excel_data[idx].prsentcount ? 0 : this.download_excel_data[idx].prsentcount,
            'Leave': !this.download_excel_data[idx].leavecount ? 0 : this.download_excel_data[idx].leavecount,
            'Paid Days': !this.download_excel_data[idx].paiddays ? 0 : this.download_excel_data[idx].paiddays,
            'LossOfPay': !this.download_excel_data[idx].lossofpay ? 0 : this.download_excel_data[idx].lossofpay,
          }

          for (let i = 0; i < resData.commonData.length; i++) {
            let dateColumn = resData.commonData[i].w_date;
            let dayCount = resData.commonData[i].day_cnt;
            let dayKey = `day${dayCount}`;
            let attendanceType = this.download_excel_data[idx][dayKey] || "";

            obj[dateColumn] = attendanceType

          }
          exportData.push(obj);

        }


        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = `Monthly-CheckIn-Out-Report-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
        downloadLink.click();

      }
    })
  }


  //Sidebar Filter
  openSidebar() {
    this.search_key_copy = this.searchKey;
    this.month_copy = this.month;
    this.year_copy = this.year;
    this.att_status_filter_copy = this.att_status_filter;
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
    // this.deptName = [];
    // this.desgName = [];
    // this.orgName = [];
    this.deptName_copy = [];
    this.desgName_copy = [];
    this.searchKey = '';
    this.orgName_copy = [];
    this.search_key_copy = '';
    this.status_filter_copy = 'all';
    this.att_status_filter_copy = '';
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

  // get_att_unit_master_list() {
  //   this.orgList = [];

  //   this._attendanceService.get_att_master_list({
  //     action: 'master_unit_list',
  //     customeraccountid: this.tp_account_id.toString(),
  //     unit_id: '',
  //     department_id: '',

  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         this.orgList = resData.commonData;
  //       } else {

  //       }
  //     }, error: (e) => {
  //       console.log(e);
  //     }
  //   })
  // }

  // get_att_dept_master_list() {
  //   this.deptList = [];

  //   this._attendanceService.get_att_master_list({
  //     action: 'master_department_list',
  //     customeraccountid: this.tp_account_id.toString(),
  //     unit_id: '',
  //     department_id: '',

  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         this.deptList = resData.commonData;
  //       } else {

  //       }
  //     }, error: (e) => {
  //       console.log(e);
  //     }
  //   })
  // }
  // get_att_role_master_list() {
  //   this.desgList = [];

  //   this._attendanceService.get_att_master_list({
  //     action: 'master_role_list',
  //     customeraccountid: this.tp_account_id.toString(),
  //     unit_id: '',
  //     department_id: '',
  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         this.desgList = resData.commonData;
  //       } else {

  //       }
  //     }, error: (e) => {
  //       console.log(e);
  //     }
  //   })
  // }

  // getOrgUnitData() {
  //   this.orgList = [];

  //   this._attendanceService.getMaster({
  //     'actionType': 'GetMasterUnitNames',
  //     'customerAccountId': this.tp_account_id,
  //     'productTypeId': this.product_type,
  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         this.orgList = (resData.commonData);
  //         // console.log(this.orgList);

  //       } else {
  //         this.toastr.error(resData.message, 'Oops!');
  //       }
  //     }
  //   })
  // }
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

  /***********Master************** */

  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;
    this.searchKey = this.search_key_copy;
    this.month = this.month_copy;
    this.year = this.year_copy;

    this.days_count = new Date(this.year_copy, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.desgName = this.desgName_copy;
    this.deptName = this.deptName_copy;
    this.orgName = this.orgName_copy;

    this.att_status_filter = this.att_status_filter_copy;
    this.status_filter = this.status_filter_copy;
    // console.log(this.desgName);
    // console.log(this.deptName);

    // this.get_month_dates_days();
    // this.getEmployerMonthAttendance_for_excel_table_data();
    this.includeAllDateFields = true;
    // Very Important Logic
    (async () => {
      await this.get_month_dates_days();
      // console.log("HIII");
      Object.keys(this.showfields).forEach(key => this.showfields[key] = true);
      this.updateFilteredDays();
    })();

    this.getEmployerMonthAttendance_for_excel_table_data();

  }

  get_month_year_name() {
    let month = this.selected_date.split('-')[1];
    let year = this.selected_date.split('-')[2];

    return this.monthsArray[month - 1].month + ' ' + year
  }

  // exportToExcelTable() {
  //     let table = document.getElementById('shiftReportTable');
  //     if (!table) {
  //       console.error('Table not found!');
  //       return;
  //     }
  //     // Convert table to a worksheet

  //     let worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(table);

  //     const date = new Date()
  //     // Create a new workbook and add the worksheet
  //     let workbook: XLSX.WorkBook = XLSX.utils.book_new();
  //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  //     // Save the Excel file
  //     XLSX.writeFile(workbook, `Monthly-CheckIn-Out-Report-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`);

  //   }




  update_weekly_off_holiday_by_account() {
    this.confirmationDialogService.confirm('Are you sure you want to assign the WO or HO to all employees according to the leave template for the selected month and year?', 'Confirm').subscribe(result => {
      if (result) {
        this._reportService.update_weekly_off_holiday_by_account({
          'p_account_id': this.tp_account_id,
          'p_year': this.year,
          'p_month': this.month,

        }).subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success!');
            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          }, error: (e) => {
            console.log(e);
          }
        })
      }
    });
  }

  //=====================================================================================================

  // Export selected checkboxes data - sidharth kaul dated. 13.05.2025
  onEmployeeCheckboxChange() {
    const selectableEmployees = this.filtered_employee_att_table_data.filter(emp => !(this.filtered_employee_att_table_data.length - 1 && emp.emp_name === 'Grand Total'));
    this.selectAll = selectableEmployees.length > 0 && selectableEmployees.every(emp => emp.selected); // Updated logic
    // console.log("UPDATED LOGIC ---", this.selectedEmployees)
  }

  toggleSelectAll() {
    // console.log(this.filtered_employee_att_table_data);
    this.filtered_employee_att_table_data.forEach(report => {
      if (report.emp_name != 'Grand Total') { // Prevent selecting the Grand Total row
        report.selected = this.selectAll;
      }
    });
  }

  get selectedEmployees() {
    return this.filtered_employee_att_table_data.filter(emp => emp.selected);
  }

  cancelForm() {
    this.selectAll = false;
  }

  // exportToExcelTable() {
  //   const originalTable = document.getElementById('shiftReportTable') as HTMLTableElement;

  //   if (!originalTable) {
  //     console.error('Table not found!');
  //     return;
  //   }

  //   // Check how many rows are selected
  //   const selectedRows = this.filtered_employee_att_table_data
  //     .map((emp, index) => ({ emp, index }))
  //     .filter(item => item.emp.selected);

  //   // Create a new table in memory
  //   const newTable = document.createElement('table');

  //   // Clone the table header
  //   const thead = originalTable.querySelector('thead');
  //   if (thead) {
  //     newTable.appendChild(thead.cloneNode(true));
  //   }

  //   const originalTbody = originalTable.querySelector('tbody');
  //   const newTbody = document.createElement('tbody');

  //   const allRows = Array.from(originalTbody?.rows || []);

  //   if (selectedRows.length > 0) {
  //     // selected items
  //     selectedRows.forEach(item => {
  //       newTbody.appendChild(allRows[item.index].cloneNode(true));
  //     });
  //   } else {
  //     // none selected
  //     allRows.forEach(row => {
  //       newTbody.appendChild(row.cloneNode(true));
  //     });
  //   }

  //   newTable.appendChild(newTbody);

  //   // Export filtered data in excel
  //   const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(newTable);
  //   const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  //   const timestamp = new Date().toISOString().slice(0, 10);
  //   const formattedDate = moment(timestamp, 'YYYY-MM-DD').format('DD-MM-YYYY');
  //   XLSX.writeFile(workbook, `Att_Muster_Roll_Report_${formattedDate}.xlsx`);

  //     this.filtered_employee_att_table_data.forEach(report => {
  //     if (report.emp_name != 'Grand Total') {
  //       report.selected = false;
  //     }
  //   });

  //   this.selectAll = false;
  // }

  exportToExcelTable(): void {
    const originalTable = document.getElementById('shiftReportTable') as HTMLTableElement;

    if (!originalTable) {
      console.error('Table not found!');
      return;
    }

    const selectedRows = this.filtered_employee_att_table_data
      .map((emp, index) => ({ emp, index }))
      .filter(item => item.emp.selected);

    const newTable = document.createElement('table');

    // Clone the header
    const thead = originalTable.querySelector('thead');
    if (thead) {
      newTable.appendChild(thead.cloneNode(true));
    }

    const originalTbody = originalTable.querySelector('tbody');
    const newTbody = document.createElement('tbody');
    const allRows = Array.from(originalTbody?.rows || []);

    if (selectedRows.length > 0) {
      selectedRows.forEach(item => {
        newTbody.appendChild(allRows[item.index].cloneNode(true));
      });
    } else {
      allRows.forEach(row => {
        newTbody.appendChild(row.cloneNode(true));
      });
    }

    newTable.appendChild(newTbody);

    // Convert HTML table to worksheet
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(newTable);

    // Get the column index for 'Date' from the header
    let dateColIndex: number | null = null;
    const headerRow = newTable.querySelector('thead tr') as HTMLTableRowElement;

    if (headerRow) {
      Array.from(headerRow.cells).forEach((cell, index) => {
        if (cell.textContent?.trim() === 'Date') {
          dateColIndex = index;
        }
      });
    }

    if (dateColIndex !== null) {
      const range = XLSX.utils.decode_range(worksheet['!ref']!);

      for (let row = range.s.r + 1; row <= range.e.r; ++row) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: dateColIndex });
        const cell = worksheet[cellAddress];

        if (cell && typeof cell.v === 'string') {
          const parsedDate = moment(cell.v, ['DD-MM-YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY', 'MMM D, YYYY'], true);
          if (parsedDate.isValid()) {

            cell.v = parsedDate.format('DD-MM-YYYY'); // store as string
            cell.t = 's';                             // type: string
            cell.z = '@';                             // format: text

          }
        }
      }
    } else {
      console.warn('Date column not found. Exporting without formatting.');
    }

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const today = moment().format('DD-MM-YYYY');
    XLSX.writeFile(workbook, `Att_Muster_Roll_Report_${today}.xlsx`);

    // Clear selection after export
    this.filtered_employee_att_table_data.forEach(report => {
      if (report.emp_name !== 'Grand Total') {
        report.selected = false;
      }
    });

    this.selectAll = false;
  }


  // New code to add dynamic date headers to report - sidharth kaul dated. 20.05.2025

  intialize_show_fields(dataArray: any[]) {
    this.showfields = {};
    dataArray.forEach(item => {
      if (item.w_date_d) {
        this.showfields[item.w_date_d] = false;
      }
    });
    // console.log("intialize_show_fields", this.showfields);
  }


  initialize_fieldarray() {
    this.fieldarray = [];
    for (const key in this.showfields) {
      this.fieldarray.push({ name: key, value: key });
    }
    // console.log("initialize_fieldarray", this.fieldarray);
  }

  hideshowfields(e: any, field: any) {
    this.showfields[field.value] = e.target.checked;
    if (e.target.checked) {
      // Add field value if checked
      if (!this.selectedDynmicColumnValues.includes(field.value)) {
        this.selectedDynmicColumnValues.push(field.value);
      }
    } else {
      // Remove field value if unchecked
      this.selectedDynmicColumnValues = this.selectedDynmicColumnValues.filter(val => val !== field.value);
    }
    // console.log(this.selectedDynmicColumnValues, 'this.selectedDynmicColumnValues')
  }

  toggleShowFields() {

    if (!this.includeAllDateFields) {
      // If "Include Employee Details" checkbox is checked, check all the showfields checkboxes
      Object.keys(this.showfields).forEach(key => this.showfields[key] = true);
    } else {
      // If "Include Employee Details" checkbox is unchecked, uncheck all the showfields checkboxes
      Object.keys(this.showfields).forEach(key => this.showfields[key] = false);
    }

    this.selectedDynmicColumnValues = [];
  }

  updateFilteredDays() {
    this.filtered_month_days_master = this.month_days_master.filter(item =>
      this.showfields[item.w_date_d]
    );
    // console.log("filtered_month_days_master", this.filtered_month_days_master);
    const allTrue = Object.values(this.showfields).every(value => value === true);
    this.includeAllDateFields = allTrue;

  }

  SaveColumnValues() {
    if (this.selectedDynmicColumnValues.length > 0) {
      this._reportService.manage_report_columns_wfm({
        "action": "save_report_columns",
        "report_name": "disbursement",
        "accountid": this.tp_account_id.toString(),
        "report_description": "Disbursement Reports",
        "report_column_text": this.selectedDynmicColumnValues,
        "productTypeId": this.product_type
      }).subscribe((resData: any) => {
        // if (resData.statusCode) {
        this.toastr.success(resData.commonData.msg);
        this.getColumnValues();

      });
    }
    else {
      this.toastr.info('Please select column to display');
    }

  }

  getColumnValues() {
    this.selectedDynmicColumnValues = [];
    // this.intialize_show_fields();

    // console.log('getColumnValues');
    // if (this.selectedDynmicColumnValues.length > 0) {
    this._reportService.manage_report_columns_wfm({
      "action": "get_report_columns",
      "report_name": "disbursement",
      "accountid": this.tp_account_id.toString(),
      "productTypeId": this.product_type
    }).subscribe((resData: any) => {
      // this.toastr.success(resData.msg);
      if (resData.statusCode) {
        this.selectedDynmicColumnValues = JSON.parse(resData.commonData[0]?.report_column_text);

        this.selectedDynmicColumnValues.forEach((el: any) => {
          this.showfields[el] = true
        })
      }
      // console.log(this.selectedDynmicColumnValues, this.showfields);
    });

  }


  getCheckInOutTime(report: any, day_cnt: number, index: number): string | null {
    //  {{emp_data['day' + dd.day_cnt]?.split('|')[1].split('-')[0] | istToGermanTime:dd.day_cnt+'/'+month+'/'+year}}
    //  {{emp_data['day' + dd.day_cnt]?.split('|')[1].split('-')[1] | istToGermanTime:dd.day_cnt+'/'+month+'/'+year}}

    const val = report['day' + day_cnt];
    if (!val) return null;
    const parts = val.split('|');
    if (!parts[1]) return null;
    const times = parts[1].split('-');
    return times[index] ? times[index] : null;
  }


  onTimezoneChange() {
    localStorage.setItem('showGermanTime', this.showGermanTime);
  }
   getGermanTime(time: string, date: string): string {
    return this.istToGermanTimeService.convertIstToGermanTime(time, date);
  }

}
