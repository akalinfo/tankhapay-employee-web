import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
declare var $: any;
import * as XLSX from 'xlsx';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ApprovalsService } from '../../approvals/approvals.service';
import { ReportService } from '../report.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-biometric-punches',
  templateUrl: './biometric-punches.component.html',
  styleUrls: ['./biometric-punches.component.css']
})
export class BiometricPunchesComponent {
  currentDate: any;
  currentDateString: any;
  employer_name: any = '';
  showSidebar: boolean = true;
  attendance_data: any = [];
  token: any = '';
  from_date: any;
  invKey: any = '';
  p: number = 0;
  filteredEmployees: any = [];
  data: any = [];
  machinesSerial_id: any;
  tp_account_id: any;
  includeEmployeeDetails: boolean = false;
  to_date: any;
  addRemoveHide: boolean = false;
  product_type: any = '';
  sso_admin_id: any;
  show_process_buttion = true;
  filter_LinkStatus_val: any = '';
  filter_SyncStatus_val: any = '';
  last_synced_msg: string = '';
  page_size: number = 20;
  tot_count: number = 0;

  invKey_copy: any = '';
  filter_SyncStatus_val_copy: any = '';
  from_date_copy: any;
  to_date_copy: any;
  filter_LinkStatus_val_copy: any = '';
  change_sidebar_filter_flag: boolean = false;
  is_show_gallops_btn: boolean = false;
  show_gallops_accout_id: any = '';

  constructor(
    private _approvalsService: ApprovalsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _ReportService: ReportService,
    private _alertservice: AlertService,
    private _formBuilder: FormBuilder,
    private router: Router
  ) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.employer_name = this.token.name;
    this.sso_admin_id = this.token.sso_admin_id

    // if (this.sso_admin_id != '' && this.sso_admin_id != null
    //   && this.sso_admin_id != undefined || environment.production == false) {
    //   this.show_process_buttion = true;
    // } else {
    //   this.show_process_buttion = false;
    // }
      // added on gallops dated. 04.01.2025
      // 6256	"GALLOPS HOSPITALITY PRIVATE LIMITED#24AALCG1332P1ZF-20241212 12:12:05"
    if (environment.production) {
      // get the production account id 
      this.show_gallops_accout_id = '6256';
    } else {
      this.show_gallops_accout_id = '633';
    }
    if (this.tp_account_id == this.show_gallops_accout_id) {
      this.is_show_gallops_btn = true;
    } else {
      this.is_show_gallops_btn = false;
    }
   // end 
    this.show_process_buttion = true;

    this.from_date = this.formatDate(new Date());
    this.to_date = this.formatDate(new Date());

    this.get_Last_sync_stataus_hub();
    this.get_business_device();

    // if (this.product_type == '1' && this.tp_account_id == "993") {
    //   {
    //     this.sync_office_punches();
    //   }
    //  }

  }

  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     $('#FromDate').datepicker({
  //       dateFormat: 'dd/mm/yy',
  //       changeMonth: true,
  //       changeYear: true,
  //     }).datepicker('setDate', new Date()); // Set current date as default
  //   }, 500);

  //   setTimeout(() => {
  //     $('#ToDate').datepicker({
  //       dateFormat: 'dd/mm/yy',
  //       changeMonth: true,
  //       changeYear: true,
  //     }).datepicker('setDate', new Date()); // Set current date as default
  //   }, 500);
  // }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }


  search(key: any) {
    this.p = 0;
    this.invKey = key.target.value;
    this.getPunching_Attendance(0);

    // this.filteredEmployees = this.attendance_data.filter(function (element: any) {
    //   return (element.emp_code_org.toLowerCase().includes(key.target.value.toLowerCase())
    //     || element.machine_serial_no.toLowerCase().includes(key.target.value.toLowerCase())
    //     || element?.emp_name?.toLowerCase().includes(key.target.value.toLowerCase())
    //   )
    // });

  }
  sync_office_punches() {
    this._ReportService.akal_syncattpunch({
      'account_id': this.tp_account_id.toString(),
      "product_type": this.product_type.toString(),
    }).subscribe((resData: any) => {
      console.log(resData);
    });
  }
  get_business_device() {
    this._ReportService.get_business_device({
      'action': 'get_verified_machine_serial_no_by_id',
      'account_id': this.tp_account_id.toString(),
    })
      .subscribe((resData: any) => {

        if (resData.statusCode) {

          this.data = resData.commonData;
          console.log(this.data[0].serial_no);

          this.machinesSerial_id = this.data[0].serial_no;

        } else {
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      })
  }
  get_Last_sync_stataus_hub() {
    this._ReportService.get_Last_sync_stataus_hub({
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "account_id": this.tp_account_id,
      "GeoFenceId": this.token.geo_location_id,
      "product_type": this.product_type,
      "ou_ids": this.token.ouIds
    }).subscribe((resData_n: any) => {
      // console.log(resData_n);
      if (resData_n.statusCode) {
        this.last_synced_msg = resData_n.message;
        // this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });


  }

  getPunching_Attendance(page_index: number) {

    // this.from_date = $('#FromDate').val();
    // this.to_date = $('#ToDate').val();

    // console.log({
    //   "action": "Punching_Details",
    //   "fromdate": this.from_date,
    //   "todate": this.to_date,
    //   "accountId": this.tp_account_id,
    //   "geofenceid": this.token.geo_location_id,
    //   "sync_status": this.filter_SyncStatus_val,
    //   "link_status": this.filter_LinkStatus_val,
    //   "keyword": this.invKey,
    //   "pageindex": page_index.toString(),
    //   "pagesize": this.page_size.toString()
    // });

    this._ReportService.getPunchingAttendance({
      "action": "Punching_Details",
      "fromdate": this.from_date,
      "todate": this.to_date,
      "product_type": this.product_type,
      "accountId": this.tp_account_id,
      "geofenceid": this.token.geo_location_id,
      "sync_status": this.filter_SyncStatus_val,
      "link_status": this.filter_LinkStatus_val,
      "keyword": this.invKey,
      "pageindex": page_index.toString(),
      "pagesize": this.page_size.toString(),
      "ou_ids": this.token.ouIds
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.attendance_data = resData.commonData;
        this.filteredEmployees = this.attendance_data


        this.tot_count = this.attendance_data[0].tot_records;
        // console.log(this.attendance_data);
        // this.toastr.success(resData.message, 'Success');
        // console.log(resData.commonData[0].msgcd);
        if (resData.commonData[0].msgcd == '0') {
          this.tot_count = 0;
          this.attendance_data = [];
          this.filteredEmployees = [];
          this._alertservice.error(resData.commonData[0].msg, GlobalConstants.alert_options_autoClose);
        }
      } else {
        this.attendance_data = [];
        this.filteredEmployees = [];
        this.tot_count = 0;
        // console.log(resData.commonData[0].msg);
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
      if (this.change_sidebar_filter_flag) {
        this.closeSidebar();
      }
    });

    // for staging akal office

    if (this.product_type == '1' && (
      // (environment.production == false && this.tp_account_id == "993")
      // ||
      (this.tp_account_id == "1574" && environment.production == true))
    ) {
      {
        console.log("testshdgfd=>>>>>>>>>>>>>>>>>", this.product_type);
        this.sync_office_punches();
      }
    }
  }

  filter_LinkStatus(val: any) {
    this.filter_LinkStatus_val = val;
    this.getPunching_Attendance(0);
    // if (this.filter_LinkStatus_val == 'Y') {
    //   this.filteredEmployees = this.attendance_data.filter((el: any) => {

    //     if (el.org_emp_code_exists == 'Y') {
    //       return el;
    //     }
    //   });
    // } else if (this.filter_LinkStatus_val == 'N') {
    //   this.filteredEmployees = this.attendance_data.filter((el: any) => {

    //     if (el.org_emp_code_exists == 'N') {
    //       return el;
    //     }
    //   })
    // }
    // else {
    //   this.filteredEmployees = this.attendance_data;
    // }

  }
  filter_SyncStatus(val: any) {
    this.filter_SyncStatus_val = val;
    this.getPunching_Attendance(0);
    // if (this.filter_SyncStatus_val == 'Y') {
    //   this.filteredEmployees = this.attendance_data.filter((el: any) => {
    //     if (el.is_processed == 'Y') {
    //       return el;
    //     }
    //   });
    // } else if (this.filter_SyncStatus_val == 'N') {
    //   this.filteredEmployees = this.attendance_data.filter((el: any) => {
    //     if (el.is_processed == 'N') {
    //       return el;
    //     }
    //   })
    // }
    // else {
    //   this.filteredEmployees = this.attendance_data;
    // }

  }
  synced_punches() {

    // this.from_date = $('#FromDate').val();
    // this.to_date = $('#ToDate').val();
    //FOR staging akal office Kafka process
    let validateArray = ['653','7416'];
    if(validateArray.includes((this.tp_account_id).toString())){
      this._ReportService.kafkaProcessAttPunchesHub({
          "fromDate": this.from_date,
          "toDate": this.to_date,
          "account_id": this.tp_account_id,
          "product_type": this.product_type,
          "GeoFenceId": this.token.geo_location_id,
          "ou_ids": this.token.ouIds
        }).subscribe((resData: any) => {
          if (resData.statusCode) {
            this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
          } else {
            this.attendance_data = [];
            this.filteredEmployees = [];
            this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          }
        });
    }
    else{
        this._ReportService.process_att_punches_hub({
          "fromDate": this.from_date,
          "toDate": this.to_date,
          "account_id": this.tp_account_id,
          "product_type": this.product_type,
          "GeoFenceId": this.token.geo_location_id,
          "ou_ids": this.token.ouIds
        }).subscribe((resData: any) => {
          if (resData.statusCode) {
            // this.attendance_data = resData.commonData;
            // this.filteredEmployees = this.attendance_data
            console.log(this.attendance_data);
            this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
          } else {
            this.attendance_data = [];
            this.filteredEmployees = [];
            this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          }
        });
    }
  }

  getPage(pageNo: number) {
    this.p = pageNo - 1;
    this.getPunching_Attendance(this.p);
  }
  exportToExcel() {
    this._ReportService.getPunchingAttendance({
      "action": "Punching_Details",
      "fromdate": this.from_date,
      "todate": this.to_date,
      "product_type": this.product_type,
      "accountId": this.tp_account_id,
      "geofenceid": this.token.geo_location_id,
      "sync_status": this.filter_SyncStatus_val,
      "link_status": this.filter_LinkStatus_val,
      "keyword": this.invKey,
      "pageindex": "0",
      "pagesize": "0",
      "ou_ids": this.token.ouIds
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = resData.commonData;
        // console.log(this.data);
        let exportData = [];
        let days = {};
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          // + resData.commonData[i].dayname;
          days = {
            ...days, [head]: ''
          }
        }

        for (let idx = 0; idx < this.data.length; idx++) {
          let obj = {

            'Att txn Id': this.data[idx].att_txn_id,
            'Employee Code': this.data[idx].emp_code_org,
            'Employee Name': this.data[idx].emp_name,
            'Punch Date': this.data[idx].punch_date,
            'Punch Time': this.data[idx].punch_time,
            'Device IP Address': this.data[idx].machine_ip,
            'Device Serial No': this.data[idx].machine_serial_no,
            'Sync Status': this.data[idx].is_processed,
            'TP Link Status': this.data[idx].org_emp_code_exists,
            'dateofjoining': this.data[idx].dateofjoining,
            'InOutPunch': this.data[idx].txn_punch_type
          }
          exportData.push(obj);
        }

        // console.log(exportData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = 'Biometric_Punches_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + this.currentDateString.trim().replaceAll(' ', '_').trim() + '.xlsx';
        downloadLink.click();
      }
    })
  }

  manage_biometric_att(emp_org_code: any) {
    // this.from_date = $('#FromDate').val();
    // this.to_date = $('#ToDate').val();

    this._ReportService.manage_biometric_att({
      action: 'enable_resync_biometric_att_from_to_dt',
      customeraccountid: this.tp_account_id.toString(),
      emp_org_code: emp_org_code.toString(),
      product_type: this.product_type,
      from_dt: this.from_date,
      to_dt: this.to_date,
      ou_ids: this.token.ouIds
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          // this.get_Last_sync_stataus_hub();
          this.invKey = emp_org_code.toString();
          this.getPunching_Attendance(0);
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  /*Sidebar Filter*/
  resetFilter() {
    this.from_date_copy = this.formatDate(new Date());
    this.to_date_copy = this.formatDate(new Date());

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.from_date_copy); // Set current date as default

      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.to_date_copy); // Set current date as default

    }, 100);

    this.invKey_copy = '';
    this.filter_SyncStatus_val_copy = '';
    this.filter_LinkStatus_val_copy = '';

  }
  openSidebar() {
    this.filter_SyncStatus_val_copy = this.filter_SyncStatus_val;
    this.filter_LinkStatus_val_copy = this.filter_LinkStatus_val;
    this.invKey_copy = this.invKey;

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.from_date); // Set current date as default

      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.to_date); // Set current date as default


      // this.from_date = $('#FromDate').val();
      // this.to_date = $('#ToDate').val();
      this.from_date_copy = this.from_date;
      this.to_date_copy = this.to_date;
    }, 1500);


    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "380px";
  }

  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }
  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;

    this.from_date = this.from_date_copy;
    this.to_date = this.to_date_copy;
    this.filter_SyncStatus_val = this.filter_SyncStatus_val_copy;
    this.filter_LinkStatus_val = this.filter_LinkStatus_val_copy;
    this.invKey = this.invKey_copy;


    this.from_date = $('#FromDate').val();
    this.to_date = $('#ToDate').val();

    this.getPunching_Attendance(0);
  }

  formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}/${mm}/${yy}`;
  }
  redirect_to_sync_attendace() {
    this.router.navigate(['/attendance/sync-att']);
  }

}
