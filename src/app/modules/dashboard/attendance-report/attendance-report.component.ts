import { Component } from '@angular/core';
import { AttendanceService } from '../../attendance/attendance.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { Router } from '@angular/router';
declare var $: any;

import {  FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';

@Component({
  selector: 'app-attendance-report',
  templateUrl: './attendance-report.component.html',
  styleUrls: ['./attendance-report.component.css']
})
export class AttendanceReportComponent {

  ouUnits: any = [];
  selectedUnitId: any = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'unitid',
    textField: 'unitname',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    allowSearchFilter: true,
    enableCheckAll: true,
    itemsShowLimit: 5,
  };

  isSideActive = false;
  searchForm: FormGroup;
  ouNames:any = '';


  showSidebar: boolean = true;
  tp_account_id: any;
  product_type: any;
  search_key: any = '';
  filter_emp_val: any = '';
  decoded_token: any;
  p: any = 1;
  limit: any = 2000;
  attendanceDetails_data: any = [];
  LedgerMasterHeads_head: any = [];
  attendanceSummaryData: any = {};
  product_type_array: any = [];
  product_type_text: string = '';
  today_date: any;
  filter_status: any = '';
  attendanceDetails_data_original: any = [];
  ouIds: any;
  timeoutId: any;
  attendanceDetails_cnt: any = 0;

  constructor(
    private _attendanceService: AttendanceService,
    private _sessionService: SessionService,
    private router: Router,
    private _formBuilder: FormBuilder,
    private _BusinesSettingsService: BusinesSettingsService,
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

    if (!this.today_date) {
      let date = new Date();
      let dd = date.getDate();
      let mm = date.getMonth() + 1
      let yy = date.getFullYear();
      this.today_date = dd + '-' + mm + '-' + yy;
    }
    this.employer_details();

    this.searchForm = this._formBuilder.group({
          ouIds: ['']
      })
      this.get_geo_fencing_list();

  }

  ngAfterViewInit() {
    setTimeout(() => {
      $(function () {
        $('#today_date').datepicker({
          dateFormat: 'dd-mm-yy',
          changeMonth: true,
          changeYear: true,
        });

      });

      $('body').on('change', '#today_date', function () {
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
        action: 'get_today_attendence_reports',
        accountId: (this.tp_account_id),
        geo_location_id: this.decoded_token.geo_location_id,
        productTypeId: this.product_type,
        att_date: this.today_date,
        ou_id: this.ouIds,
        keyword: this.search_key,
        status: this.filter_emp_val,
        pageindex: this.p - 1,
        pagesize: this.limit
        //,
        // searchKeyword: this.search_key,
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.attendanceDetails_data = resData.commonData;


          // this.attendanceDetails_data = (decrypted_emp_json_data).data.attendancedetail;
          // this.LedgerMasterHeads_head = (decrypted_emp_json_data).data.LedgerMasterHeads;
          // this.attendanceSummaryData = (decrypted_emp_json_data).data.attendancesummary;
          this.attendanceDetails_data_original = this.deepCopyArray(this.attendanceDetails_data);
          this.attendanceDetails_cnt = this.attendanceDetails_data[0].tot_records;

          this.changeFilterStatus();
          //console.log(this.attendanceDetails_data);

        } else {
          this.attendanceDetails_data = [];
          // this.LedgerMasterHeads_head = [];
          // this.attendanceSummaryData = {};
          this.attendanceDetails_data_original = [];
        }
      });
  }

  changeTodayDate() {
    this.today_date = $('#today_date').val();
    // console.log(this.today_date);
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

  changeFilterStatus() {
    // this.p = 1;
    // this.employer_details();
    
    if (this.filter_status == '') {
      this.attendanceDetails_data = this.deepCopyArray(this.attendanceDetails_data_original);
    } else {
      this.attendanceDetails_data = [];
      if (this.filter_status == 'LateComers') {
        this.attendanceDetails_data = this.attendanceDetails_data_original.filter((el: any) => {
          if (el.islatecomers == 'Yes') {
            return el;
          }
        });
      } else {
        if (this.filter_status == 'Absent') {
          this.attendanceDetails_data = this.attendanceDetails_data_original.filter((el: any) => {
            if (el.today_status == this.filter_status || el.today_status == 'Leave'  || el.attendance_type == 'RH') {
              return el;
            }
          });

        } else {
          this.attendanceDetails_data = this.attendanceDetails_data_original.filter((el: any) => {
            if (el.today_status == this.filter_status) {
              return el;
            }
          });
        }
      }

    }
    this.filterReport();
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

  toggleSidebar() {
    this.isSideActive = !this.isSideActive;
  }

  get_geo_fencing_list() {
    this._BusinesSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllOUsForCustomer",
      "searchKeyword": ''
    }).subscribe((resData: any) => {
      if (resData.statusCode == true) {
        this.ouUnits = resData.commonData;
        this.ouUnits = this.ouUnits.map(item => ({
          unitname: item.org_unit_name,
          unitid: item.id
        }));
      }
    }, (error: any) => {
      this.ouUnits = [];
    });
  }

  filterReport() {
    let postData = this.searchForm.value;
    this.ouNames = postData.ouIds
    let unitName = '';
    if (this.ouNames && this.ouNames.length > 0) {
      unitName = this.ouNames.map(unit => unit.unitname).join(",");
    }
    this.ouNames = unitName;
    this.ouNames = this.ouNames.split(',');
   

    //   const filteredData = this.attendanceDetails_data.filter(item => {
    //   const assignedousStr = item.assignedous || ''; // Fallback to empty string if null/undefined
    //   const assignedList = assignedousStr
    //     .toLowerCase()
    //     .split(',')
    //     .map(e => e.trim());

    //   return (this.ouNames || []).some(filter => {
    //     const normalizedFilter = (filter || '').toLowerCase(); // Fallback for null filter
    //     return assignedList.some(ou => ou.includes(normalizedFilter));
    //   });
    // });
      if(this.ouNames != '' && this.ouNames != null){
        this.attendanceDetails_data = this.attendanceDetails_data.map(item => {
          const assignedousList = (item.assignedous || '')
            .split(',')
            .map(e => e.trim());

            const matchedAssignedous = assignedousList.filter(ou =>
              this.ouNames.includes(ou)
            );
            // If there is at least one exact match, include it
            if (matchedAssignedous.length > 0) {
              return {
                ...item,
                assignedous: matchedAssignedous.join(', ') // Keep only matched values
            };
            }

        return null;
        }).filter(Boolean);
      }
  }
  reloadPage() {
    window.location.reload();
  }
}
