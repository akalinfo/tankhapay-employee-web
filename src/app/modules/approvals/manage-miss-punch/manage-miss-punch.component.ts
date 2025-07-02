import { Component } from '@angular/core';
import { AttendanceService } from '../../attendance/attendance.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import jwtDecode from 'jwt-decode';
import * as XLSX from 'xlsx';
import { ReportService } from '../../reports/report.service';
import { dongleState, grooveState } from 'src/app/app.animation';
import { FilterField } from '../../reports/common-filter/filter.model';

@Component({
  selector: 'app-manage-miss-punch',
  templateUrl: './manage-miss-punch.component.html',
  styleUrls: ['./manage-miss-punch.component.css']
})
export class ManageMissPunchComponent {
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
  attendanceCategory: any = 'MP';
  addOnFilters : FilterField[] = [];
  isSideBar : boolean = false;

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

  confirmationModal:any = false;
  product_type:any='';

  empCode:any = '';  
  attDate:any = '';
  markStatus:any = '';
  modifiedBy:any = '';
  approveStatus:any = '';

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

    let currentDate = localStorage.getItem('selected_date') || null;
    if (currentDate) {
      this.month = currentDate.split('-')[1];
      this.year = currentDate.split('-')[2];
      // console.log("A",this.month,this.year);
    }

   

    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type =  this.decoded_token.product_type;
    this.modifiedBy = this.decoded_token.name+"-"+this.decoded_token.mobile;
    
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

          this.missed_punch_data.map((el: any) => {
            el['template_txt'] = !el['template_txt'] ? '' : JSON.parse(el['template_txt'])
            el['balance_txt'] = !el['balance_txt'] ? '' : JSON.parse(el['balance_txt'])
          })
          // console.log("Missed Punch api data----",this.missed_punch_data);
        } else {
          this.toastr.error(resData.message, 'Oops!');
          this.missed_punch_data = [];
        }
      }, error: (e) => {
        console.log(e);
        this.missed_punch_data = [];
      }
    })
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

   

    console.log(this.selected_missed_punches);
  }

  exportToExcel() {
    let exportData = [];

    console.log(this.missed_punch_data);

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
        'Status': this.missed_punch_data[idx]?.att_catagory_txt,
      }
      // console.log(this.missed_punch_data[idx]);

      exportData.push(obj);
      // }

    }
    // console.log(exportData);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    let date = new Date()
    downloadLink.download = `Attendance-Missed_Punch-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
    downloadLink.click();

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

 
  changeAttType(att_type: any) {
    this.mark_att_type = att_type;
    this.mark_leave_type = '';
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

  manage_biometric_att_single(emp_org_code: any, date: any) {
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
      next: (resData: any) => {
        if (resData.statusCode) {
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

  searchOnFilters(filters: any) {
    this.month = filters.month;
    this.year = filters.year;
  
    this.get_missed_punch_att();
  }

  approveMissPunchStatus(data){
    this.empCode = data.emp_code;
    this.attDate = data.att_date
    this.approveStatus = 'A';
    this.confirmationModal = true;
}
rejectMissPunchStatus(data){
  this.empCode = data.emp_code;
  this.attDate = data.att_date
  this.approveStatus = 'R';
  this.confirmationModal = true;
}


closeConfirmModal(){
  this.confirmationModal = false;
}

approveOrRejectStatus(){
  let request = {
    "productTypeId":this._encrypterService.aesEncrypt((this.product_type).toString()),
    "customeraccountid":this._encrypterService.aesEncrypt((this.tp_account_id).toString()),
    "empCode":this._encrypterService.aesEncrypt((this.empCode).toString()),
    "attDate":(this.attDate).toString(),
    "attendanceStatus":this._encrypterService.aesEncrypt((this.approveStatus).toString()),
    "modifiedByUser":(this.modifiedBy).toString()
  }
  this._ReportService.approveRejectMissedPunchAttendance(
    request
  ).subscribe({
    next: (resData: any) => {
      if (resData.statusCode) {
        this.confirmationModal = false;
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


}
