import { Component } from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { dongleState, grooveState } from 'src/app/app.animation';
declare var $: any;

@Component({
  selector: 'app-dipole-services',
  templateUrl: './dipole-services.component.html',
  styleUrls: ['./dipole-services.component.css'],
  animations: [grooveState, dongleState]
})
export class DipoleServicesComponent {

  showSidebar: boolean = true;
  csvData: any[] = [];
  headers: string[] = [];
  decoded_token: any;
  tp_account_id: any;
  selectedOption: any = 'upload';
  fromDate: any;
  toDate: any;
  time_sheet_data: any = {};
  showUpdateStatusModal: boolean = false;
  selected_record: any;
  page_size: any = 50;
  page_index: any = 1;
  selected_emp_arr: any = [];
  is_timesheet_data_imported_flag: boolean = false;
  filter_LinkStatus_val: any = '';
  filter_TimesheetStatus_val: any = '';
  filter_att_status_val: any = '';
  invKey: any = '';
  constructor(
    private _attendanceService: AttendanceService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    // console.log(this.convertToISODateFormat("25 February 25")); // 2025-02-25
    // console.log(this.convertToISODateFormat("25-February-2025")); // 2025-02-25
    // console.log(this.convertToISODateFormat("25-Feb-2025"));      // 2025-02-25
    // console.log(this.convertToISODateFormat("25/3/2025"));        // 2025-03-25
    // console.log(this.convertToISODateFormat("25.03.2025"));       // 2025-03-25
    // console.log(this.convertToISODateFormat("25 Mar 2025"));      // 2025-03-25
    // console.log(this.convertToISODateFormat("25-12-2025"));       // 2025-12-25

  }

  ngAfterViewInit() {

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date());

      $('#ToDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date());

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });

      this.get_timesheet_data();

    }, 100);
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const csv = reader.result as string;
        this.parseCSV(csv);
      };

      reader.readAsText(file);
    }
  }

  parseCSV(csv: string) {
    const lines = csv.split('\n').map(line => line.trim()).filter(line => line); // Trim spaces & remove empty lines

    if (lines.length === 0) return;

    // Extract headers properly
    this.headers = this.parseCSVLine(lines[0]);

    let tempData = lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      let row: any = {};
      this.headers.forEach((header, index) => {
        row[header] = values[index] || ''; // Handle missing values
      });
      return row;
    });

    this.csvData = tempData.filter(el => el.Hours > 0)
    // console.log(this.csvData); // Debugging

  }

  parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"' && line[i + 1] !== '"') {
        insideQuotes = !insideQuotes; // Toggle insideQuotes state
      } else if (char === '"' && line[i + 1] === '"') {
        current += '"'; // Handle escaped double quotes
        i++; // Skip next quote
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim()); // Add last value
    return result;
  }


  clearFile() {
    const fileInput = document.getElementById("dipole_csv") as HTMLInputElement;
    fileInput.value = '';
    this.csvData = [];
  }


  import_timesheet_data() {

    let convertedData = this.csvData.map(item => {
      return {
        entry_date: this.convertToISODateFormat(item["Entry Date"]) || '',
        employee_id: item["Employee ID"],
        user_name: item["User Name"],
        project_name: item["Project Name"],
        task_name: item["Task Name"],
        hours: item["Hours"],
        time_off_type: item["Time Off Type"],
        timesheet_approval_status: item["Timesheet Approval Status"]
      };
    });

    // console.log(convertedData)

    if (convertedData.length == 0) {
      this.toastr.error('No file data found', 'Oops!');
      return;
    }

    this._attendanceService.manage_timesheet_data({
      'action': 'import_timesheet_data',
      'accountid': this.tp_account_id.toString(),
      'timesheet_data': convertedData,

    }).subscribe({
      next: (resData: any) => {
        if (resData.status) {
          if (resData.commonData[0].msgcd == '1') {
            this.toastr.success(resData.commonData[0].message, 'Success');
            this.is_timesheet_data_imported_flag = true;

            const processedRecords = JSON.parse(resData.commonData[0].processed_records);

            // Update csvData with the status from processedRecords
            this.csvData = this.csvData.map(row => {
              const key = `${this.convertToISODateFormat(row["Entry Date"])}_${row["Employee ID"]}`;
              const record = processedRecords.find(pr => pr.key === key);
              return {
                ...row,
                status: record ? record.status : 'N/A' // Add status or 'N/A' if not found
              };
            });

            // this.get_timesheet_data();
            // this.selectedOption = 'view';
            // this.csvData = [];
          } else {
            this.toastr.error(resData.commonData[0].message, 'Oops!');
          }

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  get_timesheet_data() {

    // console.log(this.filter_TimesheetStatus_val);
    // console.log(this.filter_LinkStatus_val);
    // return;
    this.time_sheet_data = {};
    // this.cdr.detectChanges();
    this._attendanceService.get_timesheet_data({
      'action': 'get_timesheet_data',
      'accountid': this.tp_account_id.toString(),
      'fromdate': $('#FromDate').val(),
      'todate': $('#ToDate').val(),
      'pagesize': this.page_size,
      'pageindex': this.page_index,
      'keyword_search': this.invKey,
      'approval_status': this.filter_TimesheetStatus_val,
      'tpay_status': this.filter_LinkStatus_val,
      'att_status': this.filter_att_status_val,
    }).subscribe({
      next: (resData: any) => {
       // this.time_sheet_data = {};
        this.selectedOption = 'view';
        $('input[name="checkempAll"').prop('checked', false);
        $('input[name="checkemp"').prop('checked', false);

        if (resData.status) {
          if (resData.commonData.length > 0 && resData.commonData[0].msgcd == '0') {
            this.toastr.error(resData.commonData[0].message, 'Oops!');
          } else {
            this.time_sheet_data = resData.commonData;
          }

        } else {
          this.toastr.error(resData.message, 'Oops');
        }
      }
    })
  }


  convertToISODateFormat(input: string): string | null {
    const monthMap: { [key: string]: string } = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', sept: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12'
    };

    // Normalize input (replace various separators with '-')
    let normalized = input.trim().toLowerCase().replace(/[\s\/.,]+/g, '-');
    const parts = normalized.split('-');

    if (parts.length !== 3) return null;

    let [day, month, year] = parts;

    // Handle month names
    if (isNaN(Number(month))) {
      month = monthMap[month.toLowerCase()];
      if (!month) return null;
    } else {
      month = month.padStart(2, '0');
    }

    // Convert 2-digit year to 4-digit (assume 2000+)
    if (year.length === 2) {
      year = '20' + year;
    }

    if (year.length !== 4) return null;

    day = day.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  filterFromToDateLeads() {
    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    // console.log(todt-fromdt);

    if (todt >= fromdt) {
      // this.startDate = $('#FromDate').val();
      // this.endDate = $('#ToDate').val();

      this.get_timesheet_data();
    }
    else {
      // $('#FromDate').val(this.startDate);
      // $('#ToDate').val(this.endDate);
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }

    // console.log(this.startDate, this.endDate);
  }


  openUpdateStatusModal(data: any) {
    this.selected_record = data;
    this.showUpdateStatusModal = true;
  }

  closeUpdateStatusModal() {
    this.selected_record = '';
    this.showUpdateStatusModal = false;
  }

  update_timesheet_approval_status() {

    this._attendanceService.manage_timesheet_data({
      'action': 'update_timesheet_approval_status',
      'accountid': this.tp_account_id.toString(),
      'record_id': this.selected_record.record_id,
      'approval_status': 'Approved',

    }).subscribe({
      next: (resData: any) => {
        if (resData.status) {
          if (resData.commonData[0].msgcd == '1') {
            this.toastr.success(resData.commonData[0].message, 'Success');
            this.closeUpdateStatusModal();
            this.get_timesheet_data();
            // this.selectedOption = 'view';
            // this.csvData = [];
          } else {
            this.toastr.error(resData.commonData[0].message, 'Oops!');
          }

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  get_page(e: any) {
    this.page_index = e;
    this.get_timesheet_data();
  }




  check_emp(e: any, record_id: any) {
    // console.log(e.target.checked, this.selected_emp_arr.find((el:any) => el == emp_code));
    if (e.target.checked) {
      if (this.selected_emp_arr.find((el: any) => el == record_id) == undefined) {
        this.selected_emp_arr.push(record_id);
      }
    } else {
      const index = this.selected_emp_arr.findIndex((el: any) => el == record_id);
      if (index != -1) this.selected_emp_arr.splice(index, 1);

    }


    if (this.time_sheet_data?.data && this.time_sheet_data?.data?.length == this.selected_emp_arr.length) {
      $('input[name="checkempAll"').prop('checked', true);

    } else {
      $('input[name="checkempAll"').prop('checked', false);

    }
    // console.log(this.selected_emp_arr);

  }

  check_emp_all(e: any) {
    this.selected_emp_arr = [];
    if (e.target.checked) {
      this.time_sheet_data?.data?.forEach((el: any) => {
        // if (el.approval_status == 'P') {
        this.selected_emp_arr.push(el.record_id);
        // }
      })
      $('input[name="checkempAll"').prop('checked', true);
      $('input[name="checkemp"').prop('checked', true);

    } else {
      this.selected_emp_arr = [];
      $('input[name="checkempAll"').prop('checked', false);
      $('input[name="checkemp"').prop('checked', false);

    }
    console.log(this.selected_emp_arr);
  }


  find_emp_code(record_id: any) {
    let idx = this.selected_emp_arr.findIndex(el => el == record_id);

    if (idx != -1) {
      return true;
    } else {
      return false;
    }
  }

  find_emp_code_all() {
    if (!this.time_sheet_data?.data || this.time_sheet_data?.data?.length == 0) {
      return false;

    } else {
      for (let i = 0; i < this.time_sheet_data?.data?.length; i++) {
        let idx = this.selected_emp_arr.findIndex(el => el == this.time_sheet_data?.data[i]?.record_id);
        if (idx == -1) {
          return false;
        }
      }
      return true;

    }
  }

  process_timesheet_attendance() {

    const checkedBoxes = document.querySelectorAll<HTMLInputElement>('.checkemp:checked');
    const checkedBoxesEmpCodes = Array.from(checkedBoxes).map(checkbox =>
      checkbox.getAttribute('data-emp-code')
    );
    // console.log(checkedBoxesEmpCodes);

    this.selected_emp_arr = this.selected_emp_arr.filter(el => checkedBoxesEmpCodes.includes(el.toString()));
    // console.log(this.selected_emp_arr.join(','));

    if (this.selected_emp_arr.length == 0) {
      this.toastr.error('No record selected', 'Oops!');
      return;
    }

    // return;
    this._attendanceService.manage_timesheet_data({
      'action': 'process_timesheet_attendance',
      'accountid': this.tp_account_id.toString(),
      'record_id': this.selected_emp_arr.join(','),
      // 'approval_status': 'Approved',

    }).subscribe({
      next: (resData: any) => {
        if (resData.status) {
          if (resData.commonData[0].msgcd == '1') {
            this.toastr.success(resData.commonData[0].message, 'Success');
            this.selected_emp_arr = [];
            this.get_timesheet_data();

          } else {
            this.toastr.error(resData.commonData[0].message, 'Oops!');
          }

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  check_is_data_imported() {
    if (this.is_timesheet_data_imported_flag) {
      this.clearFile();
      this.get_timesheet_data();
    }

    this.is_timesheet_data_imported_flag = false;
  }
  filter_LinkStatus() {
    // this.filter_LinkStatus_val = val;
    this.get_timesheet_data();


  }
  filter_TimesheetStatus() {
    // this.filter_TimesheetStatus_val = val;
    this.get_timesheet_data();


  }

  filter_att_status() {
    this.get_timesheet_data();

  }

  search() {
    // this.invKey = key.target.value;
    this.get_timesheet_data();

  }

  // Download Dipole Template
  downloadFile() {
    const link = document.createElement('a');
    link.href = 'assets/attendance-timesheet.csv'; 
    link.download = 'attendance-timesheet.csv'; 
    link.click();
  }
}
