import { Component } from '@angular/core';
import { ReportService } from '../report.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { AttendanceService } from '../../attendance/attendance.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { IstToGermanTimeService } from 'src/app/shared/services/ist-to-german-timezone.service';


@Component({
  selector: 'app-in-out-time-report',
  templateUrl: './in-out-time-report.component.html',
  styleUrls: ['./in-out-time-report.component.css']
})
export class InOutTimeReportComponent {

  showSidebar: boolean = false;
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
  tp_account_id: any;
  searchKey: any = '';
  search_key_copy: any = '';
  change_sidebar_filter_flag: boolean = false;
  month_copy: any;
  year_copy: any;
  days_count: any;
  desgName: any = [];
  deptName: any = [];
  orgName: any = [];
  desgName_copy: any = [];
  deptName_copy: any = [];
  orgName_copy: any = [];
  dropdownSettings: any = {};
  deptDropdownSettings: {};
  desgDropdownSettings: {};
  deptList: any = [];
  desgList: any = [];
  orgList: any = [];
  decoded_token: any;
  product_type: any;
  yearsArray: any = [];
  selected_date: any;
  month_days_master: any = [];
  dayswisecheckinReportData: any = [];
  selectAll: boolean = false;
  showSelectionCheckboxes: boolean = true;

  showGermanTime: any = 'IST';


  constructor(
    private _reportService: ReportService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _attendanceService: AttendanceService,
    private _businesessSettingsService: BusinesSettingsService,
    public istToGermanTimeService: IstToGermanTimeService,

  ) {

  }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

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
    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];
    this.days_count = new Date(this.year, this.month, 0).getDate();


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

    this.get_month_dates_days();
    this.daywisecheckcheckinReport();


    if (localStorage.getItem('showGermanTime')) {
      this.showGermanTime = localStorage.getItem('showGermanTime');
    } else {
      localStorage.setItem('showGermanTime', 'IST');
      this.showGermanTime = 'IST';
    }
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  onTimezoneChange() {
    localStorage.setItem('showGermanTime', this.showGermanTime);
  }
  getGermanTime(time: string, date: string): string {
    return this.istToGermanTimeService.convertIstToGermanTime(time, date);
  }

  daywisecheckcheckinReport() {
    this.dayswisecheckinReportData = [];

    this._reportService.daywisecheckcheckinReport({
      'action': 'DaywisecheckcheckinReport',
      'empcode': '-9999',
      'month': this.month,
      'year': this.year,
      'customeraccountid': this.tp_account_id,
      'post_offered': this.desgName,
      'posting_department': this.deptName,
      'unitparametername': this.orgName,
      'search_keyword': this.searchKey,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.closeSidebar();
          this.dayswisecheckinReportData = resData.commonData;
          this.dayswisecheckinReportData = this.dayswisecheckinReportData.map(item => ({ ...item, selected: false }));
          // console.log("LOGIC ---API DATA---", this.dayswisecheckinReportData)

        } else {
          this.toastr.error(resData.message, "Oops!");
        }
      }
    })
  }

  get_month_dates_days() {
    this._attendanceService.get_month_dates_days({
      'employer_id': this.decoded_token.id, 'month': this.month,
      'year': this.year
    }).subscribe((resData: any) => {
      console.log(resData);
      if (resData.status) {
        this.month_days_master = resData.commonData;
        // this.employer_details();

      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }

  getShortMonthName(monthId: string): string {
    const month = this.monthsArray.find((m: any) => m.id === monthId);
    if (month) {
      return month.month.slice(0, 3);
    }
    return '';
  }


  //Sidebar Filter
  openSidebar() {
    this.search_key_copy = this.searchKey;
    this.month_copy = this.month;
    this.year_copy = this.year;

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

  }

  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;
    this.searchKey = this.search_key_copy;
    this.month = this.month_copy;
    this.year = this.year_copy;

    this.days_count = new Date(this.year_copy, this.month, 0).getDate();
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.desgName = this.desgName_copy;
    this.deptName = this.deptName_copy;
    this.orgName = this.orgName_copy;

    // console.log(this.desgName);
    // console.log(this.deptName);

    this.daywisecheckcheckinReport();

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

  changeMonth(e: any) {
    this.month = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.get_month_dates_days();
    this.daywisecheckcheckinReport();

  }

  changeYear(e: any) {
    this.year = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.get_month_dates_days();
    this.daywisecheckcheckinReport();
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


  //=================================================================================================//

  // checkbox selection logic - sidharth kaul dated. 13.05.2025
  getAttExcel() {
    const days = this.month_days_master;
    let exportData = [];

    // Get selected rows
    const selectedRows = this.dayswisecheckinReportData.filter(row => row.selected);

    // Use selected rows if any, otherwise export all
    const dataToExport = selectedRows.length > 0 ? selectedRows : this.dayswisecheckinReportData;

    for (let idx = 0; idx < dataToExport.length; idx++) {
      const row = dataToExport[idx];
      let obj = {};

      if ((idx) % 3 === 0) {
        obj = {
          'Employee': row.emp_name,
          'OrgEmpCode': !row.orgempcode ? row.tpcode : row.orgempcode,
          'Designation': row.designation,
          'Type': row.tblrowtype,
        };
      } else {
        obj = {
          'Employee': '',
          'OrgEmpCode': '',
          'Designation': '',
          'Type': row.tblrowtype,
        };
      }

      for (let i = 0; i < days.length; i++) {
        const dateColumn = days[i].w_date;
        const dayCount = days[i].day_cnt;
        const dayKey = `day${dayCount}`;
        // const attendanceType = row[dayKey] || "";
        const attendanceType = row[dayKey] && this.showGermanTime == 'CET' ? this.istToGermanTimeService.convertIstToGermanTime(row[dayKey], days[i].w_date) : row[dayKey];
        obj[dateColumn] = attendanceType;
      }

      exportData.push(obj);
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: HTMLAnchorElement = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);

    const timestamp = new Date().toISOString().slice(0, 10);
    const formattedDate = moment(timestamp, 'YYYY-MM-DD').format('DD-MM-YYYY');
    downloadLink.download = `InOut_Time_Details_Report_${formattedDate}.xlsx`;
    downloadLink.click();

    this.dayswisecheckinReportData.forEach(report => {
      if (report.emp_name != 'Grand Total') {
        report.selected = false;
      }
    });

    this.selectAll = false;
  }


  onEmployeeCheckboxChange(empCode: string) {
    const selected = this.dayswisecheckinReportData.find(row => row.emp_code === empCode && row.tblrowtype === 'Check In')?.selected;

    this.dayswisecheckinReportData.forEach(row => {
      if (row.emp_code === empCode) {
        row.selected = selected;
      }
    });
  }

  toggleSelectAll() {
    this.dayswisecheckinReportData.forEach(report => {
      if (report.emp_name != 'Grand Total') {
        report.selected = this.selectAll;
      }
    });
  }

  get selectedEmployees() {
    return this.dayswisecheckinReportData.filter(emp => emp.selected);
  }

  cancelForm() {
    this.selectAll = false;
  }


}
