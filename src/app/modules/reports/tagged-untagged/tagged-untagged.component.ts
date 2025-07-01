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
import moment from 'moment';

@Component({
  selector: 'app-tagged-untagged',
  templateUrl: './tagged-untagged.component.html',
  styleUrls: ['./tagged-untagged.component.css']
})
export class TaggedUntaggedComponent {
  showSidebar: boolean = true;
  product_type: any;
  id: any;
  designation: any;
  data: any = [];
  employee_data: any = [];
  filtered_employee_data: any = []; // Filtered data
  selectedStatusFilter: string = "0";
  tp_account_id: any = '';
  token: any = '';
  currentDate: any;
  currentDateString: any;
  from_date: any;
  to_date: any;
  employer_name: any;
  year: any;
  loading: boolean = false;
  markStatus = '';
  uniqueGeofenceNames: string[] = [];
  selectedGeofenceLocation: string = "1";
  searchKey: string = "";
  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _alertservice: AlertService,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
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
    // console.log(this.employer_name);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    let currDate = new Date();
    this.to_date = this.formatDate(currDate);
    // console.log(this.to_date);
    this.TpCheckInOutSummary();

  }

  ngAfterViewInit() {
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

  filterEmployees() {
    this.filtered_employee_data = this.employee_data.filter(emp => {
      let matchesSearch = true;
      let matchesStatus = true;
      let matchesGeofence = true;

      // Apply search filter (if input is not empty)
      if (this.searchKey.trim() !== "") {
        const lowerSearch = this.searchKey.toLowerCase();
        matchesSearch = (
          (emp.tpcode && emp.tpcode.toLowerCase().includes(lowerSearch)) ||
          (emp.emp_name && emp.emp_name.toLowerCase().includes(lowerSearch)) ||
          (emp.designation && emp.designation.toLowerCase().includes(lowerSearch)) ||
          (emp.assigned_geofence_ids_names && emp.assigned_geofence_ids_names.toLowerCase().includes(lowerSearch))
        );
      }

      // Apply tagged/untagged filter
      if (this.selectedStatusFilter === "1") {
        matchesStatus = emp.assigned_geofence_ids_names && emp.assigned_geofence_ids_names.toString().trim() !== "";
      } else if (this.selectedStatusFilter === "2") {
        matchesStatus = !emp.assigned_geofence_ids_names || emp.assigned_geofence_ids_names.toString().trim() === "";
      }

      // Apply geofence location filter
      if (this.selectedGeofenceLocation !== "1") {
        matchesGeofence = emp.assigned_geofence_ids_names === this.selectedGeofenceLocation;
      }

      return matchesSearch && matchesStatus && matchesGeofence;
    });
  }

  // Trigger filtering when any filter changes
  search(event: any) {
    this.searchKey = event.target.value;
    this.filterEmployees();
  }

  filterTaggedUntaggedEmployees() {
    this.filterEmployees();
  }

  filterGeofenceLocation() {
    this.filterEmployees();
  }

  truncateText(text: string, limit: number): string {
    if (text.length > limit) {
      return text.substring(0, limit) + "..."; // Truncate and add "..."
    }
    return text; // Return as is if not too long
  }

  extractUniqueGeofenceNames() {
    const geofenceSet = new Set<string>();
    this.employee_data.forEach(emp => {
      if (emp.assigned_geofence_ids_names && emp.assigned_geofence_ids_names.trim() !== "") {
        geofenceSet.add(emp.assigned_geofence_ids_names);
      }
    });
    this.uniqueGeofenceNames = Array.from(geofenceSet);
  }

  TpCheckInOutSummary() {
    // this.from_date = $('#FromDate').val();
    this.loading = true;
    if ($('#ToDate').val() != '' && $('#ToDate').val() != null && $('#ToDate').val() != undefined) {
      this.to_date = $('#ToDate').val();
    }
    this._ReportService.GetTpCheckInOutSummary({
      "fromDate": this.to_date,
      "toDate": this.to_date,
      "customerAccountId": this.tp_account_id.toString(),
      "productTypeId": this.product_type,
      "flag": "normal_report",
      "GeoFenceId": this.token.geo_location_id,
      "checkInOutMarkedType": 'All'
    }).subscribe((resData: any) => {
      this.loading = false;
      if (resData.statusCode) {
        this.employee_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.filtered_employee_data = [...this.employee_data];
        this.extractUniqueGeofenceNames();
      } else {
        this.employee_data = [];
        this.filtered_employee_data = [...this.employee_data];
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  exportToExcel() {
    let exportData = [];
    let index = 1;
    for (let idx = 0; idx < this.filtered_employee_data.length; idx++) {
      let obj = {
        '#': index++,
        'TPCode': this.filtered_employee_data[idx].tpcode,
        'Employee Name': this.filtered_employee_data[idx].emp_name,
        'Designation': this.filtered_employee_data[idx].designation,
        'Organisation Unit': this.filtered_employee_data[idx].assigned_ou_ids_names,
        'Geofence Location': this.filtered_employee_data[idx].assigned_geofence_ids_names,
      }
      exportData.push(obj);
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    
    const timestamp = new Date().toISOString().slice(0, 10);
    const formattedDate = moment(timestamp, 'YYYY-MM-DD').format('DD-MM-YYYY');
    downloadLink.download = 'Tagged_Untagged_Report_' + this.employer_name.replaceAll(' ', '_').trim() + "_" + `${formattedDate}` + '.xlsx';
    downloadLink.click();

  }

  synced_punches() {
    this.TpCheckInOutSummary();

    this.from_date = $('#ToDate').val();
    this.to_date = $('#ToDate').val();
    this._ReportService.process_att_punches_hub({
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "account_id": this.tp_account_id,
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        console.log(resData.message);
      }
    });
  }

  exportToPdf() {
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
    tableHtml += `<p style="text-align:center;">Tagged/Untagged Report (${this.markStatus}-${this.to_date})</p>`;
    tableHtml += `<table class="table">`;
    tableHtml += `<tr>
                  <th>#</th>
                  <th>TPCode</th>
                  <th>Employee Name</th>
                  <th>Designation</th>
                  <th>Geo Fence Location</th>
                </tr>`;
    let index = 1;
    for (let emp of this.filtered_employee_data) {
      tableHtml += `<tr>
                      <td>${index++}</td>
                      <td>${emp.tpcode || ''}</td>
                      <td>${emp.emp_name || ''}</td>
                      <td>${emp.designation || ''}</td>
                      <td>${emp.assigned_geofence_ids_names || ''}</td>
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
        a.download = 'tagged-untagged-report.pdf';
        a.click();
        URL.revokeObjectURL(fileURL);
      }
    })
  }

  // Function to count tagged (non-empty) geofences
  getTaggedGeofenceCount(emp: any[]): number {
    if (!Array.isArray(emp)) {
      return 0;
    }
    return emp.filter(item => item.assigned_geofence_ids_names && item.assigned_geofence_ids_names.toString().trim() !== '').length;
  }

  // Function to count untagged (empty) geofences
  getUntaggedGeofenceCount(emp: any[]): number {
    if (!Array.isArray(emp)) {
      return 0;
    }
    return emp.length - this.getTaggedGeofenceCount(emp);
  }



}
