import { Component,ElementRef,ViewChild } from '@angular/core';
import { AttendanceService } from '../../attendance/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import jwtDecode from 'jwt-decode';
import * as XLSX from 'xlsx';
import { ReportService } from '../report.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { FilterField } from '../common-filter/filter.model';
import moment from 'moment';

declare var $:any;

@Component({
  selector: 'app-att-deviation-report',
  templateUrl: './att-deviation-report.component.html',
  styleUrls: ['./att-deviation-report.component.css'],
  animations: [grooveState, dongleState,],

})
export class AttDeviationReportComponent {
  @ViewChild('reportTable', { static: false }) reportTable!: ElementRef;
  showSidebar: boolean = true;
  missed_punch_data: any = [];
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
  decoded_token: any;
  tp_account_id: any;
  keyword: any = '';
  timeoutId: any;
  selected_missed_punches: any = [];
  showAttCalendarPopup: boolean = false;
  showSingleAttCalendarPopup: boolean = false;
  mark_att_type: any = '';
  mark_remarks: any = '';
  mark_leave_type: any = '';
  single_selected_index: any = '';
  attendanceCategory: any = 'DE';
  addOnFilters : FilterField[] = [];
  isSideBar : boolean = false;
  selectAll: boolean = false;
  showSelectionCheckboxes: boolean = true;

  // leave_sub_type_arr: any = [
  //   {
  //     'typename': 'Earned Leave',
  //     'typecode': 'EL'
  //   },
  //   {
  //     'typename': 'Casual Leave',
  //     'typecode': 'CL'
  //   },
  // ]

  constructor(
    private _attendanceService: AttendanceService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private _ReportService: ReportService,
  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    for (let i = 2023; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);
    };

    this.month = currentMonth + 1;
    this.year = currentYear;

    this.get_missed_punch_att();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    // this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    // this.selected_date = date;
    this.get_missed_punch_att();
  }

  changeYear(e: any) {
    this.year = e.target.value;
    // this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.get_missed_punch_att();
  }

  search(key: any) {
    this.keyword = key;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.get_missed_punch_att();
    }, 500)
  }

  change_att_category() {
    this.get_missed_punch_att();
  }

  get_missed_punch_att() {
    this._attendanceService.get_missed_punch_att({
      'customeraccountid': this.tp_account_id,
      'year': this.year,
      'month': this.month,
      'keyword': this.keyword,
      'geoFenceId': this.decoded_token.geo_location_id,
      'attendanceCategory': this.attendanceCategory,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.missed_punch_data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));

          this.missed_punch_data = this.missed_punch_data.map((el: any) => ({
            ...el,
            template_txt: el.template_txt ? JSON.parse(el.template_txt) : '',
            balance_txt: el.balance_txt ? JSON.parse(el.balance_txt) : '',
            selected: false
          }));

          // this.missed_punch_data = this.missed_punch_data.map(item => ({ ...item, selected: false }));
          console.log(this.missed_punch_data);

        } else {
          this.toastr.error(resData.message, 'Oops!');
          this.missed_punch_data = [];
        }
      }, error: (e) => {
        console.log(e);
        this.missed_punch_data = [];
      }
    });

  }

  change_check_punch_all(e: any) {
    this.selected_missed_punches = [];
    if (e.target.checked) {
      this.missed_punch_data.map((el: any) => {
        if (el.is_salary_processed!='Y') {
          this.selected_missed_punches.push(el.row_id);
        }
      })
    } else {
      this.selected_missed_punches = [];
    }

    $('input[name="check_punch"]').prop('checked', e.target.checked);
    console.log(this.selected_missed_punches);

  }

  change_check_punch(e: any, idx: any) {
    if (e.target.checked) {
      let index_rowid = this.missed_punch_data[idx].row_id;
      let add_idx = this.selected_missed_punches.findIndex((el: any) => el == index_rowid);
      if (add_idx == -1) {
        this.selected_missed_punches.push(index_rowid);
      }

    } else {
      let index_rowid = this.missed_punch_data[idx].row_id;
      let remove_idx = this.selected_missed_punches.findIndex((el: any) => el == index_rowid);
      if (remove_idx != -1) {
        this.selected_missed_punches.splice(remove_idx, 1);
      }
    }

    if (this.selected_missed_punches.length == this.missed_punch_data.length) {
      $('input[name="check_punch_all"').prop('checked', true);
    } else {
      $('input[name="check_punch_all"').prop('checked', false);
    }

    console.log(this.selected_missed_punches);
  }

  exportToExcel() {
    let exportData = [];

    if(this.selectedEmployees.length == 0){
      for (let idx = 0; idx < this.missed_punch_data.length; idx++) {
        // if (this.filteredEmployees_forBulk[idx]?.lockstatus == 'Not Locked') {
        let obj = {
          'Employee': this.missed_punch_data[idx]?.emp_name,
          'EmpCode': this.missed_punch_data[idx]?.emp_code,
          'OrgEmpCode': this.missed_punch_data[idx]?.orgempcode,
          'TPCode': this.missed_punch_data[idx]?.tp_code,
          'AttDate': this.missed_punch_data[idx]?.att_date,
          // 'AttType': this.missed_punch_data[idx]?.attendance_type,
          'Assign_Shift': this.missed_punch_data[idx]?.shift_name_and_timing,
          'Working_Hours': this.missed_punch_data[idx]?.no_of_hours_worked,
          'Status': this.missed_punch_data[idx]?.att_catagory_txt
        }
        exportData.push(obj);

      }
    } else if(this.selectedEmployees.length > 0){
       for (let idx = 0; idx < this.selectedEmployees.length; idx++) {
        // if (this.filteredEmployees_forBulk[idx]?.lockstatus == 'Not Locked') {
        let obj = {
          'Employee': this.selectedEmployees[idx]?.emp_name,
          'EmpCode': this.selectedEmployees[idx]?.emp_code,
          'OrgEmpCode': this.selectedEmployees[idx]?.orgempcode,
          'TPCode': this.selectedEmployees[idx]?.tp_code,
          'AttDate': this.selectedEmployees[idx]?.att_date,
          // 'AttType': this.selectedEmployees[idx]?.attendance_type,
          'Assign_Shift': this.selectedEmployees[idx]?.shift_name_and_timing,
          'Working_Hours': this.selectedEmployees[idx]?.no_of_hours_worked,
          'Status': this.selectedEmployees[idx]?.att_catagory_txt
        }
        exportData.push(obj);

      }
    } else {
      return;
    }
    
    // console.log(exportData);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);

    const timestamp = new Date().toISOString().slice(0, 10);
    const formattedDate = moment(timestamp, 'YYYY-MM-DD').format('DD-MM-YYYY');
    downloadLink.download = `Attendance_Deviation_Report_${formattedDate}.xlsx`;
    downloadLink.click();

    this.missed_punch_data.forEach(report => {
      if (report.emp_name != 'Grand Total') { 
        report.selected = false;
      }
    });

    this.selectAll = false;

  }

  openAttCalendar() {
    this.showAttCalendarPopup = true;
    this.showSingleAttCalendarPopup = false;
    this.mark_att_type = '';
    this.mark_remarks = '';
    this.mark_leave_type = '';
  }
  openAttCalendar2(index: any) {
    this.showSingleAttCalendarPopup = true;
    this.showAttCalendarPopup = false;
    this.mark_att_type = '';
    this.mark_remarks = '';
    this.mark_leave_type = '';
    this.selected_missed_punches = [];
    this.selected_missed_punches.push(this.missed_punch_data[index].row_id);
    this.single_selected_index = index;
  }

  closeAttCalendar() {
    this.showAttCalendarPopup = false;
    this.showSingleAttCalendarPopup = false;
    this.selected_missed_punches = [];
    this.single_selected_index = '';
    this.mark_remarks = '';
    this.mark_att_type = '';
    this.mark_leave_type = '';
    $('input[name="check_punch_all"').prop('checked', false);
    $('input[name="check_punch"').prop('checked', false);
  }
  changeAttType(att_type: any) {
    this.mark_att_type = att_type;
    this.mark_leave_type = '';
  }

  changeLeaveType(e: any, prev_bal: any) {
    // To check the leave balance when applying for leave
    if (e.target.value != 'AA' && e.target.value != 'CO' && prev_bal == 0) {
      this.toastr.error('Insufficient Leave Balance', 'Oops!');
      $('input[name="leave_options"]').prop("checked", false);
      this.mark_att_type = '';
      this.mark_leave_type = '';
      return;

    } else if (e.target.value == 'AA') {
      this.mark_leave_type = '';

    } else if (e.target.value == 'CO') {
      if (prev_bal == 0) {
        this.toastr.error('Insufficient Compensatory Off Balance', 'Oops!');
        $('input[name="leave_options"]').prop("checked", false);
        this.mark_leave_type = '';
        return;
      }
      // console.log(this.attCalendarForm.value);
      // return;

      let emp_index = this.missed_punch_data[this.single_selected_index].emp_index;

      if (this.missed_punch_data[this.single_selected_index].comp_off_txt?.comp_off_applicable_type == 'All') {
        this.mark_leave_type = e.target.value;
        return;
      }
      let comp_off_applicable_dayname = JSON.parse(this.missed_punch_data[this.single_selected_index].comp_off_txt)?.comp_off_applicable_dayname;
      let comp_off_days_split = comp_off_applicable_dayname.split(',')
      console.log(comp_off_days_split);

      let split_dt = this.missed_punch_data[this.single_selected_index].att_date.split('/').reverse().join('-');
      let temp_dt = new Date(split_dt);
      let dayname = temp_dt.toLocaleDateString('en-US', { weekday: 'long' });

      let idx = comp_off_days_split.findIndex((e2: any) => e2 == dayname);

      if (idx == -1) {
        this.toastr.error('Compensatory Off applicable days are ' + comp_off_applicable_dayname, 'Oops!');
        $('input[name="leave_options"]').prop("checked", false);
        this.mark_leave_type = '';
        return;
      }

      this.mark_leave_type = e.target.value;
      // console.log(prev_bal);
    }
    else {
      this.mark_leave_type = e.target.value;
    }
  }

  manage_missed_punch_att() {
    if (this.selected_missed_punches.length == 0) {
      this.toastr.error('Please select atleast one record to continue', 'Oops!');
      return;
    }
    if (this.mark_att_type == '') {
      this.toastr.error('Please select attendance type', 'Oops!');
      return
    }
    if (this.mark_remarks == '') {
      this.toastr.error('Please enter remarks', 'Oops!');
      return
    }
    if (this.mark_att_type == 'LL' && (!this.mark_leave_type)) {
      this.toastr.error('Please select Leave Type', 'Oops!');
      return
    }

    let leave_bank_id = '';
    if (this.mark_leave_type) {
      leave_bank_id = this.missed_punch_data[this.single_selected_index].leave_bank_id;
    }


    // console.log(leave_bank_id);
    // return;
    this._attendanceService.manage_missed_punch_att({
      'customeraccountid': this.tp_account_id.toString(),
      'attendanceIds': this.selected_missed_punches,
      'attendanceType': this.mark_att_type,
      'leaveType': this.mark_leave_type,
      'leaveBankId': leave_bank_id,
      'remarks': this.mark_remarks,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.closeAttCalendar();
          this.selected_missed_punches = [];
          this.get_missed_punch_att();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  is_comp_off_applicable(comp_off_txt: any) {
    let comp_off_applicable = !comp_off_txt ? '' : JSON.parse(comp_off_txt)?.is_comp_off_applicable;

    if (comp_off_applicable && comp_off_applicable == 'Y') {
      return true;
    } else {
      return false;
    }
  }

  get_tot_co_bal(comp_off_txt) {
    let tot_co_bal = !comp_off_txt ? '' : JSON.parse(comp_off_txt)?.tot_co_bal;

    if (tot_co_bal) {
      return tot_co_bal;
    } else {
      return '';
    }
  }

  manage_biometric_att_single(emp_org_code:any, date:any) {
    let from_date = date
    let to_date = date;
    // console.log(from_date, to_date);
    // return;

    if (!date) {
      this.toastr.error('Date parameter is missing', 'Oops!');
      return;
    }

    this._ReportService.manage_biometric_att({
      action: 'enable_resync_biometric_att_from_to_dt',
      customeraccountid: this.tp_account_id.toString(),
      emp_org_code: emp_org_code.toString(),
      from_dt: from_date,
      to_dt: to_date,
    }).subscribe({
      next: (resData:any) => {
        if (resData.statusCode) {
          this.get_missed_punch_att();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error : (e) => {
        console.log(e);
      }
    })
  }

  searchOnFilters(filters: any) {
    this.month = filters.month;
    this.year = filters.year;
  
    this.get_missed_punch_att();
  }


  exportToPdf(pdfName: string, title: string) {
  let exportData = [];

  if (this.selectedEmployees.length === 0) {
    exportData = this.missed_punch_data.filter(emp => emp.emp_name !== 'Grand Total');
  } else {
    exportData = this.selectedEmployees;
  }

  if (exportData.length === 0) {
    alert('No data to export');
    return;
  }

  // Create HTML table dynamically
  let tableHtml = `<style>
    .table { border: 1px solid black; border-collapse: collapse; width: 100%; }
    .table th, .table td { border: 1px solid black; padding: 8px; text-align: left; }
  </style>`;

  tableHtml += `<p style="text-align:center;"><b>${title}</b></p>`;
  tableHtml += '<table class="table"><thead><tr>';

  // Table headers
  const headers = ['Employee', 'EmpCode', 'OrgEmpCode', 'TPCode', 'AttDate', 'Assign_Shift', 'Working_Hours', 'Status'];
  headers.forEach(header => {
    tableHtml += `<th>${header}</th>`;
  });
  tableHtml += '</tr></thead><tbody>';

  // Table rows
  exportData.forEach(row => {
    tableHtml += '<tr>';
    tableHtml += `<td>${row.emp_name}</td>`;
    tableHtml += `<td>${row.emp_code}</td>`;
    tableHtml += `<td>${row.orgempcode}</td>`;
    tableHtml += `<td>${row.tp_code}</td>`;
    tableHtml += `<td>${row.att_date}</td>`;
    tableHtml += `<td>${row.shift_name_and_timing}</td>`;
    tableHtml += `<td>${row.no_of_hours_worked}</td>`;
    tableHtml += `<td>${row.att_catagory_txt}</td>`;
    tableHtml += '</tr>';
  });

  tableHtml += '</tbody></table>';

  this._ReportService.generatePdfByCode({
    htmlBody: tableHtml
  }).subscribe((resData: any) => {
    if (resData.statusCode === true) {
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
      a.download = pdfName;
      a.click();
      URL.revokeObjectURL(fileURL);
    }
  });

  this.missed_punch_data.forEach(report => {
    if (report.emp_name != 'Grand Total') { 
      report.selected = false;
    }
  });

  this.selectAll = false;
  }

  
  private removeComments(element: HTMLElement) {
    const iterator = document.createNodeIterator(element, NodeFilter.SHOW_COMMENT, null);
    let commentNode;
    while ((commentNode = iterator.nextNode())) {
      commentNode.parentNode?.removeChild(commentNode);
    }
  }

  
    // checkbox selection logic - sidharth kaul dated. 13.05.2025
    onEmployeeCheckboxChange() {
      const selectableEmployees = this.missed_punch_data.filter(emp => !(this.missed_punch_data.length - 1 && emp.emp_name === 'Grand Total'));
      this.selectAll = selectableEmployees.length > 0 && selectableEmployees.every(emp => emp.selected); // Updated logic
      // console.log("UPDATED LOGIC ---", this.selectedEmployees)
    }

    toggleSelectAll() {
      // console.log(this.missed_punch_data);
      this.missed_punch_data.forEach(report => {
        if (report.emp_name != 'Grand Total') { // Prevent selecting the Grand Total row
          report.selected = this.selectAll;
        }
      });
    }

    get selectedEmployees() {
      return this.missed_punch_data.filter(emp => emp.selected);
    }

    cancelForm() {
    // this.deleteLiabilityForm.reset();
    this.selectAll = false;
  }


}
