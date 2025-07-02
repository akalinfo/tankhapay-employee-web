import { Component } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../attendance.service';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { ReportService } from '../../reports/report.service';

@Component({
  selector: 'app-attendance-dsr-da',
  templateUrl: './attendance-dsr-da.component.html',
  styleUrls: ['./attendance-dsr-da.component.css']
})
export class AttendanceDsrDaComponent {



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
  decoded_token: any;
  tp_account_id: any;
  product_type: any;
  yearsArray: any = [];
  showSidebar: boolean = false;
  excelToTableData: any = [];
  emp_json_data: any = [];
  filteredEmployees: any = [];
  LedgerMasterHeads_head: any = [];
  days_count: any = 0;
  selected_date: any;
  month: any;
  year: any;
  excelBulkAttUploadArray: any = [];
  fileUpload_binarystr: any;
  fileUpload_name: any;
  show_bulk_upload_btn = true;
  DSRFormat: any = 'excel';
  jivo_DSRDA_data: any = [];
  searchKey: any = '';
  jivo_DSRDA_data_original: any = [];

  constructor(
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _attendanceService: AttendanceService,
    private _reportService: ReportService,
    private router: Router,
  ) {

  }


  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();
    //
    if (currentMonth == 11) {
      currentYear = currentYear + 1;
    }
    this.yearsArray = [];
    for (let i = 2023; i <= currentYear; i++) {
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

    this.employer_details();
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    if (this.DSRFormat == 'excel') {
      this.clear_file();
      this.employer_details();
    } else if (this.DSRFormat == 'list') {
      this.getJivoDSRDA_data();
    }
  }

  changeYear(e: any) {
    this.year = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    if (this.DSRFormat == 'excel') {
      this.clear_file();
      this.employer_details();
    } else if (this.DSRFormat == 'list') {
      this.getJivoDSRDA_data();
    }
  }

  change_format(val: any) {
    if (val == 'list') {
      this.getJivoDSRDA_data();
    }
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  employer_details() {

    this._attendanceService
      .get_employer_today_attendance({
        customeraccountid: (this.tp_account_id),
        productTypeId: this.product_type,
        att_date: this.selected_date,
        emp_name: '',
        approval_status: '',
        status: '',
        GeoFenceId: this.decoded_token.geo_location_id,
        pageNo: "1",
        pageLimit: "5000"
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          let decrypted_emp_json_data = resData.commonData;
          this.LedgerMasterHeads_head = (decrypted_emp_json_data).data.LedgerMasterHeads;

          this.emp_json_data = (decrypted_emp_json_data).data.attendancedetail.filter((el: any) => {
            return el.time_criteria === 'Full Time'
          })

          //setting att_details property
          // this.emp_json_data.map((el: any, i: any) => {
          //   el['photopath'] = ((el['photopath'] != null && el['photopath']
          //     != 'https://api.contract-jobs.com/crm_api/') ? el['photopath'] : '');
          //   // (el.photopath == '' ? '' : el.photopath);

          //   el['template_txt'] = el['template_txt'] != null ? JSON.parse(el['template_txt']) : '';
          //   // el['balance_txt'] = JSON.parse(el['balance_txt']);
          //   el['balance_txt'] = el['balance_txt'] != null ? JSON.parse(el['balance_txt']) : '';
          // })
          this.filteredEmployees = this.deepCopyArray(this.emp_json_data);

          // console.log(this.filteredEmployees)
          // return;


        } else {
          this.emp_json_data = [];
          this.filteredEmployees = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      });
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

  getAttExcel() {
    let exportData = [];
    let data_type = 'dsr-days';
    // console.log(this.filteredEmployees);
    for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
      // if (this.filteredEmployees[idx]?.lockstatus == 'Not Locked') {

      let obj = {
        'Employee': this.filteredEmployees[idx].emp_name,
        'tpayrefno': this.filteredEmployees[idx].emp_code,
        'OrgEmpCode': this.filteredEmployees[idx]?.orgempcode,
        'Mobile': this.filteredEmployees[idx].mobile,
        'Month': this.month,
        'Year': this.year,
        'per_month_unit': '',
        'unit_type': (idx % 2 == 0 ? 'dsr-days' : 'km-distance'),

      }
      // console.log(this.filteredEmployees[idx]);

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
    downloadLink.download = `dsr-days-kilometers-list-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
    downloadLink.click();
  }

  onFileChange(event: any) {
    // console.log(this.month);
    this.excelBulkAttUploadArray = [];
    this.excelToTableData = [];
    this.fileUpload_binarystr = ''; // Initialize the binary string variable
    this.fileUpload_name = '';
    this.show_bulk_upload_btn = true;
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    this.fileUpload_name = target.files[0].name;
    if (this.fileUpload_name.split('.')[1] != 'xlsx') {
      this.toastr.error('Please upload a valid xlsx file', 'Oops!');
      return;
    }
    reader.onload = (e: any) => {
      /* create workbook */
      // const binarystr: string = e.target.result;
      const binaryContent = e.target.result; // This will be a binary string
      // Encode the binary content as base64 and
      // Assign the binary string to the variable
      this.fileUpload_binarystr = btoa(binaryContent);
      const wb: XLSX.WorkBook = XLSX.read(binaryContent, { type: 'binary' });

      /* selected the first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      const data: any = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // console.log(data);

      this.excelBulkAttUploadArray = data
        .filter((_, rowIndex) => rowIndex > 0) // Exclude the first row (header row)
        .filter((row) => row[data[0].indexOf('Employee')]) // Filter rows with non-empty EmpCode
        .map((row) => {
          const rowObj = {};

          data[0].forEach((key, index) => {
            const cellValue = row[index] ? row[index].toString() : '';
            rowObj[key] = cellValue;
          });

          return rowObj;
        });
      // this.excelBulkAttUploadArray = data;
      // console.log(this.excelBulkAttUploadArray, 'harsh11');
      // console.log(this.filteredEmployees);

      // Check if the key is a number (Excel serial number)
      this.excelBulkAttUploadArray.forEach((obj, index) => {
        const newObj = {};
        for (let key in obj) {
          if (!isNaN(Number(key))) {
            // Convert Excel serial number to date string
            const dateString = this.excelSerialToJSDate(Number(key));
            // Assign the value to the new key (date string)
            newObj[dateString] = obj[key];
          } else {
            // If the key is not a number, keep it as is
            newObj[key] = obj[key];
          }
        }
        // Replace the original object with the new object in the array
        this.excelBulkAttUploadArray[index] = newObj;
      });

      const dateRegex = /\d{2}-\d{2}-\d{4}/g;


      for (let i = 0; i < this.excelBulkAttUploadArray.length; i++) {
        let employee;
        let tpayrefno;
        let mobile;
        let orgempcode;
        let loc_month;
        let loc_year;
        let per_month_unit;
        let unit_type;
        let rowColorStatus = true;

        for (const key in this.excelBulkAttUploadArray[i]) {
          // console.log(key);

          if (key === 'tpayrefno') {
            tpayrefno = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'Mobile') {
            mobile = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'Employee') {
            employee = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'OrgEmpCode') {
            orgempcode = this.excelBulkAttUploadArray[i][key];
          }
          else if (key === 'Month') {
            loc_month = this.excelBulkAttUploadArray[i][key];
            if (loc_month != '' && isNaN(loc_month) || loc_month != this.month) {
              rowColorStatus = false;
              this.show_bulk_upload_btn = false;
            }
          }
          else if (key === 'Year') {
            loc_year = this.excelBulkAttUploadArray[i][key];
            if (loc_year != '' && isNaN(loc_year) || loc_year != this.year) {
              rowColorStatus = false;
              this.show_bulk_upload_btn = false;
            }

          } else if (key === 'per_month_unit') {
            per_month_unit = this.excelBulkAttUploadArray[i][key];
            if (!per_month_unit || isNaN(per_month_unit)) {
              rowColorStatus = false;
              this.show_bulk_upload_btn = false;
            }

          } else if (key === 'unit_type') {
            unit_type = this.excelBulkAttUploadArray[i][key];
            if (!unit_type || (unit_type != 'km-distance' && unit_type != 'dsr-days')) {
              rowColorStatus = false;
              this.show_bulk_upload_btn = false;
            }
          }

        }




        this.excelToTableData.push({
          employee: employee,
          tpayrefno: tpayrefno,
          personid: orgempcode,
          mobile: mobile,
          month: loc_month,
          year: loc_year,
          per_month_unit: per_month_unit,
          unit_type: unit_type,
          rowColor: rowColorStatus,
        });
      }

      // console.log(this.excelToTableData, 'harsh22');
    };
  }

  excelSerialToJSDate(serial: any) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);

    var day: any = date_info.getDate();
    var month: any = date_info.getMonth() + 1;
    var year = date_info.getFullYear();

    if (day < 10) {
      day = '0' + day;
    }
    if (month < 10) {
      month = '0' + month;
    }

    return day + '-' + month + '-' + year;
  }

  clear_file() {
    const fileInput = document.getElementById("deduction_excel") as HTMLInputElement;
    fileInput.value = '';
    this.excelBulkAttUploadArray = [];
    this.excelToTableData = [];
  }

  uploadExcelBulkAtt() {
    // console.log(this.excelToTableData);
    // console.log(this.excelBulkAttUploadArray);
    // console.log(this.filteredEmployees);
    // return;
    if (this.excelToTableData.length == 0) {
      this.toastr.error('No Data found to upload', 'Oops!');
      return;
    }
    let current_date = new Date();
    let current_mm = current_date.getMonth() + 1;
    let current_yy = current_date.getFullYear();

    let temp_excelToTableData = [];

    for (let i = 0; i < this.excelToTableData.length; i++) {
      if (this.excelToTableData[i].month > current_mm && this.excelToTableData[i].year >= current_yy) {
        this.toastr.error('Cannot upload future month', 'Oops!');
        return;
      }
      if (this.excelToTableData[i].rowColor == false) {
        this.toastr.error('Excel data is not in correct format', 'Oops!');
        return;
      }
      delete this.excelToTableData[i].rowColor;
      delete this.excelToTableData[i].mobile;
      delete this.excelToTableData[i].employee;

      temp_excelToTableData.push(this.excelToTableData[i]);
    }

    if (temp_excelToTableData.length == 0) {
      this.toastr.error('No Data found to upload', 'Oops!');
      return;
    }
    // console.log(temp_excelToTableData);
    //console.log(this.excelBulkAttUploadArray);
    // return;

    this._reportService.SaveDearnessAllowanceData({
      'account_id': this.tp_account_id.toString(),
      'month': this.month,
      'year': this.year,
      'dsr_da_json': temp_excelToTableData,
      'product_type': this.product_type.toString(),
      'mobile': this.decoded_token.mobile,
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          // this.att_file_upload();
          // this.employer_details();
          const fileInput = document.getElementById("deduction_excel") as HTMLInputElement;
          fileInput.value = '';
          this.excelToTableData = [];
          this.excelBulkAttUploadArray = [];
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      });
    this.DSRFormat = 'list';
    this.change_format('list');

  }

  getJivoDSRDA_data() {
    this.jivo_DSRDA_data_original = [];
    this._reportService.getJivoDSRDA_data({
      account_id: this.tp_account_id.toString(),
      month: this.month,
      year: this.year,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.jivo_DSRDA_data = [];
          this.jivo_DSRDA_data = resData.commonData;
          this.jivo_DSRDA_data_original = this.deepCopyArray(this.jivo_DSRDA_data);
          this.search();
        } else {
          this.jivo_DSRDA_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.jivo_DSRDA_data = [];
        console.log(e);
      }
    })
  }
  SearchMonthYear() {
    this.getJivoDSRDA_data();
  }
  download_excel() {
    let exportData = [];

    this.jivo_DSRDA_data.map((el: any, i: any) => {
      let obj = {};
      obj = {
        'Month-Year': this.convert_Num_to_Month(el.month, el.year) + '-' + el.year,
        'EmployeeName': !el.emp_name ? 'Not Found' : el.emp_name,
        'OrgEmpCode': el.personid,
        'per_month_unit': el.days_per_month,
        'TPayRefno': el.tpayrefno,
        'unit_type': el.data_type,
        'IsSalaryProcessed': el.is_processed,
        'SalaryProcessedDate': el.processed_dt,
        'UploadedDate': el.created_date,
      }
      exportData.push(obj);
    })

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    let date = new Date()
    downloadLink.download = `download-dsr-days-kilometer-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
    downloadLink.click();
  }

  convert_Num_to_Month(num: any, year: any) {
    let date = new Date(year, num - 1, 1);
    let month = date.toLocaleDateString('en-US', { month: 'long' });
    return month;
  }

  search() {
    let key = !this.searchKey ? '' : this.searchKey.toLowerCase();
    this.jivo_DSRDA_data = [];

    if (!key) {
      this.jivo_DSRDA_data = this.deepCopyArray(this.jivo_DSRDA_data_original);
      return;
    }

    this.jivo_DSRDA_data = this.jivo_DSRDA_data_original.filter((el: any) => {
      if (el?.tpayrefno?.toLowerCase().includes(key) || el?.personid?.toLowerCase().includes(key)
        || el?.emp_name?.toLowerCase().includes(key) || el?.data_type?.toLowerCase().includes(key)) {
        return el;
      }
    })

  }

  // att_file_upload() {
  //   this._attendanceService.att_file_upload({
  //     'data': this.fileUpload_binarystr,
  //     'name': this.fileUpload_name,
  //   })
  //     .subscribe((resData: any) => {
  //       if (resData.statusCode) {

  //       } else {
  //         this.toastr.error(resData.message, 'Oops!');
  //       }
  //     })
  // }


}
