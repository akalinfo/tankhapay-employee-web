import { Component } from '@angular/core';
import { AttendanceService } from '../../attendance/attendance.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-attendance-reprocess',
  templateUrl: './attendance-reprocess.component.html',
  styleUrls: ['./attendance-reprocess.component.css']
})
export class AttendanceReprocessComponent {

  showSidebar: boolean = true;
  tp_account_id: any;
  product_type: any;
  search_key: any = '';
  filter_emp_val: any = '';
  decoded_token: any;
  p: any = 1;
  limit: any = 1000;
  attendanceDetails_data: any = [];
  LedgerMasterHeads_head: any = [];
  attendanceSummaryData: any = {};
  product_type_array: any = [];
  product_type_text: string = '';
  today_date: any;
  filter_status: any = '';
  ouIds: any;
  timeoutId: any;
  attendanceDetails_cnt: any = 0;
  from_date: any;
  to_date: any;
  selectAll: boolean = false;
  showSelectionCheckboxes: boolean = true;

  constructor(
    public toastr: ToastrService,
    private _attendanceService: AttendanceService,
    private _sessionService: SessionService,
    private router: Router,
  ) {

    if (this.router.getCurrentNavigation().extras.state != undefined) {
      // this.today_date = this.router.getCurrentNavigation().extras.state.year;
      this.filter_status = this.router.getCurrentNavigation().extras.state.status;
      console.log(this.filter_status);
    }
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

    if (!this.from_date || !this.to_date) {
      let date = new Date();
      let dd = String(date.getDate()).padStart(2, '0');
      let mm = String(date.getMonth() + 1).padStart(2, '0');
      let yy = date.getFullYear();
      this.from_date = `${dd}/${mm}/${yy}`;
      this.to_date = `${dd}/${mm}/${yy}`;
      // console.log("this.from_date", this.from_date);
    }    
    this.employer_details();

  }

  ngAfterViewInit() {

    setTimeout(() => {

      $(function () {
        $('#from_date').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
        }); 
      });

      $(function () {
        $('#to_date').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
        });
      });

      $('body').on('change', '#from_date', function () {
        $('#recdate').trigger('click');
      })
      $('body').on('change', '#to_date', function () {
        $('#recdate').trigger('click');
      })

    }, 0);

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  employer_details() {
    this.attendanceDetails_cnt = 0;
    // this.p = 1;
    this._attendanceService
      .get_today_attendence_reports({
        action: 'get_today_attendence_reports_reprocess',
        accountId: (this.tp_account_id),
        geo_location_id: this.decoded_token.geo_location_id,
        productTypeId: this.product_type,
        att_date: this.from_date,
        ou_id: this.ouIds,
        keyword: this.search_key,
        status: this.filter_emp_val,
        pageindex: this.p - 1,
        pagesize: this.limit
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.attendanceDetails_data = resData.commonData.map(item => ({ ...item, selected: false }));
          this.attendanceDetails_cnt = this.attendanceDetails_data[0].tot_records;
          // console.log(this.attendanceDetails_data);
        } else {
          this.attendanceDetails_data = [];
        }
      });
  }

  changeFromToDate() {
    this.from_date = $('#from_date').val();
    this.to_date = $('#to_date').val();
    this.employer_details();
  }

  changePage(e: any) {
    this.limit = e.target.value;
    this.p = 1;
    this.employer_details();
  }

  search() {
    if (this.timeoutId) {
      clearInterval(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.p = 1;
      this.employer_details();
    }, 500)
  }

  get_page(event: any) {
    this.p = parseInt(event);
    // console.log(this.p);
    this.employer_details();
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
  ViewAttednace(OrgEmpcode: any) {
    // to do rtedirect for attednace or multiple checkin out

  }

 // --------------------- Reprocess Attendance ------------------------------

 onEmployeeCheckboxChange() {
  const selectableEmployees = this.attendanceDetails_data.filter(emp => !(this.attendanceDetails_data.length - 1 && emp.emp_name === 'Grand Total'));
  this.selectAll = selectableEmployees.length > 0 && selectableEmployees.every(emp => emp.selected); // Updated logic
  console.log("Selected Employees --", this.selectedEmployees);
}

toggleSelectAll() {
  // console.log(this.attendanceDetails_data);
  this.attendanceDetails_data.forEach(emp => {
    if (emp.emp_name != 'Grand Total') { // Prevent selecting the Grand Total row
      emp.selected = this.selectAll;
    }
  });
}

get selectedEmployees() {
  return this.attendanceDetails_data.filter(emp => emp.selected);
}

reprocess_punches() {

  let selectedEmp = this.selectedEmployees;
  const empCodesString = selectedEmp
  .map(emp => emp.emp_code)
  .join(',');

  this.from_date = $('#from_date').val();
  this.to_date = $('#to_date').val();

  let obj = {
    productTypeId: this.product_type,
    customerAccountId: this.tp_account_id.toString(),
    empcodes: empCodesString,
    fromdate: this.from_date,
    todate: this.to_date    
  };

  this._attendanceService.attendanceProcessEmployeeAttendance(obj).subscribe({
    next: (resData: any) => {
     console.log(resData, 'Success');
      if (resData.statusCode) {
        // this.get_Last_sync_stataus_hub();        
        this.toastr.success(resData.message, 'Success');

      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
      $('#reprocessAttendance').modal('hide');
      this.selectAll = false;
      this.toggleSelectAll();

    }, error: (e) => {
      console.log(e);
    }
  })
}

cancelForm() {
  // this.deleteLiabilityForm.reset();
  this.selectAll = false;
  this.toggleSelectAll();
}


}
