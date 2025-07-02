import { Component } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../attendance.service';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';

@Component({
  selector: 'app-bulk-salary-correction',
  templateUrl: './bulk-salary-correction.component.html',
  styleUrls: ['./bulk-salary-correction.component.css']
})
export class BulkSalaryCorrectionComponent {

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
  // yearsArray: any = [];
  showSidebar: boolean = false;
  excelToTableData: any = [];
  emp_json_data: any = [];
  filteredEmployees: any = [];
  LedgerMasterHeads_head: any = [];
  // days_count: any = 0;
  selected_date: any;
  month: any;
  year: any;
  excelBulkAttUploadArray: any = [];
  fileUpload_binarystr: any;
  fileUpload_name: any;
  show_bulk_upload_btn = false;
  filteredYearsArray: any = [];
  filteredMonthsArray: any = [];
  days_count: any = 0;
  bulk_salary_flag: boolean = false;

  constructor(
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _attendanceService: AttendanceService,
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService
  ) {

    if (this.router.getCurrentNavigation().extras.state != null || this.router.getCurrentNavigation().extras.state != undefined) {
      this.month = this.router.getCurrentNavigation().extras.state.month;
      this.year = this.router.getCurrentNavigation().extras.state.year;
      console.log(this.router.getCurrentNavigation().extras.state.month);
      console.log(this.router.getCurrentNavigation().extras.state.year);
    }

  }


  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.reset_btn_click();
    this.employer_details();
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  employer_details() {

    if (!this.month) {
      this.toastr.info('Please select a month');

      return;
    }
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

    // console.log(this.filteredEmployees);
    for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
      // if (this.filteredEmployees[idx]?.lockstatus == 'Not Locked') {

      let obj = {
        'Employee': this.filteredEmployees[idx].emp_name,
        // 'EmpCode': this.filteredEmployees[idx].emp_code,
        'OrgEmpCode': !this.filteredEmployees[idx]?.orgempcode ? this.filteredEmployees[idx]?.tp_code : this.filteredEmployees[idx]?.orgempcode,
        // 'Mobile': this.filteredEmployees[idx].mobile,
        'Month': this.month,
        'Year': this.year,
        'DOB': this.filteredEmployees[idx].dateofbirth,
        'DOJ': this.filteredEmployees[idx].dateofjoining,
        'DOR': this.filteredEmployees[idx].dateofrelieveing,
        'PaidDays': '',
        'ManualModeReason': 'Additional Days',
        'Remarks': '',

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
    downloadLink.download = `Salary-Correction-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
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
        // .filter((row) => row[data[0].indexOf('EmpCode')]) // Filter rows with non-empty EmpCode
        .filter((row) => row[data[0].indexOf('OrgEmpCode')]) // Filter rows with non-empty EmpCode
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

      this.excelBulkAttUploadArray.splice(50);

      const dateRegex = /\d{2}-\d{2}-\d{4}/g;

      for (let i = 0; i < this.excelBulkAttUploadArray.length; i++) {
        let dob;
        let employee;
        let doj;
        let dor;
        let orgempcode;
        let rowColorStatus = true;
        let loc_month;
        let loc_year;
        let paidDays;
        let manualModeReason;
        let remarks;

        for (const key in this.excelBulkAttUploadArray[i]) {
          // console.log(key);

          if (key === 'DOB') {
            dob = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'Employee') {
            employee = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'DOJ') {
            doj = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'DOR') {
            dor = this.excelBulkAttUploadArray[i][key];
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
          }

          // }

          else if (key === 'PaidDays') {
            paidDays = this.excelBulkAttUploadArray[i][key];

            if ((paidDays != '' && isNaN(paidDays))) {
              rowColorStatus = false;
              this.show_bulk_upload_btn = false;
            }

          } else if (key == 'Remarks') {
            remarks = this.excelBulkAttUploadArray[i][key];

          } else if (key == 'ManualModeReason') {
            manualModeReason = this.excelBulkAttUploadArray[i][key];

            if (manualModeReason != 'Attendance Not Recieved' && manualModeReason != 'Additional Days') {
              rowColorStatus = false;
              this.show_bulk_upload_btn = false;
            }
          }
        }

        if (!paidDays || !manualModeReason || !remarks) {
          rowColorStatus = false;
          this.show_bulk_upload_btn = false;

        }

        let empcode_idx = this.filteredEmployees.findIndex((el) => el.orgempcode == orgempcode || el.tp_code == orgempcode);
        let empcode = '';
        if (empcode_idx != -1) {
          empcode = this.filteredEmployees[empcode_idx].emp_code;
        }

        this.excelToTableData.push({
          orgempcode: orgempcode,
          month: loc_month,
          year: loc_year,
          dob: dob,
          doj: doj,
          dor: dor,
          employee: employee,
          rowColor: rowColorStatus,
          paidDays: paidDays,
          remarks: remarks,
          manualModeReason: manualModeReason,
          empcode: empcode,
        });
      }

      // "allowance_dedution":[
      //   {
      //     "empcode": 5948,
      //     "orgempcode": "",
      //     "mobile": "6748065941",
      //     "dob": "19/03/2006",
      //     "doj": "01/03/2024",
      //     "overtime": 1000,
      //     "allowance": "532",
      //     "deduction": -200,
      //     "travel_allowance": "99",
      //     "daily_allowance": 200
      //   },
      //     ]

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
    const fileInput = document.getElementById("salary_correction_excel") as HTMLInputElement;
    fileInput.value = '';
    this.excelBulkAttUploadArray = [];
    this.excelToTableData = [];
    this.bulk_salary_flag = false;
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
      temp_excelToTableData.push(this.excelToTableData[i]);

      if (this.excelToTableData[i].month > this.month && this.excelToTableData[i].year >= this.year) {
        this.toastr.error('Month and Year of excel mismatch with system', 'Oops!');
        return;
      }

      if (this.excelToTableData[i].month > current_mm && this.excelToTableData[i].year >= current_yy) {
        this.toastr.error('Cannot upload future date deduction', 'Oops!');
        return;
      }
      if (this.excelToTableData[i].rowColor == false) {
        this.toastr.error('Excel data is not in correct format', 'Oops!');
        return;
      }
    }

    if (temp_excelToTableData.length == 0) {
      this.toastr.error('No Data found to upload', 'Oops!');
      return;
    }
    // console.log(temp_excelToTableData);
    //console.log(this.excelBulkAttUploadArray);
    // return;

    this.confirmationDialogService.confirm('Are you sure you want to save', 'Confirm').subscribe(result => {
      if (result) {
        this._attendanceService.saveBulkManualSalaryInfo({
          'customerAccountId': this.tp_account_id.toString(),
          'salaryCorrectionBulk': temp_excelToTableData,
          'month': this.month,
          'year': this.year,
        })
          .subscribe((resData: any) => {
            this.bulk_salary_flag = true;
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              this.att_file_upload();
              // this.employer_details();
              // this.router.navigate(['/attendance']);
              // this.clear_file();
            } else {
              if (resData.success_emp_codes.length > 0) {
                this.att_file_upload();
              }
              this.toastr.error(resData.message, 'Oops!');
            }

            this.excelToTableData.map((el: any) => {
              let index1 = resData.failed_emp_codes.findIndex(x => x.empcode == el.empcode)
              let index2 = resData.success_emp_codes.findIndex(x => x.empcode == el.empcode)
              if (index1 != -1) {
                el['status_txt'] = 'Failed';
                el['message'] = resData.failed_emp_codes[index1].message
              } else if (index2 != -1) {
                el['status_txt'] = 'Success';
                el['message'] = resData.failed_emp_codes[index2].message;
              } else {
                el['status_txt'] = ''
                el['message'] = '';
              }

            })
          })
      }
    })

  }


  reset_btn_click() {
    const currentDate = new Date();
    let currentMonth: any = currentDate.getMonth() + 1; // (1 = January, 12 = December)
    let currentYear: any = currentDate.getFullYear();

    this.filteredYearsArray = [];
    this.filteredMonthsArray = [];

    for (let i = 2023; i <= currentYear; i++) {
      this.filteredYearsArray.push(i);
    };

    if (currentMonth >= 3) { // March to Dec
      this.month = currentMonth - 1;
      this.year = currentYear;

    } else if (currentMonth == 2) { // Feb
      this.month = 1;
      this.year = currentYear;

    } else if (currentMonth == 1) { // Jan
      this.month = 12;
      this.year = currentYear - 1;
    }

    for (let i = 0; i < this.month; i++) {
      this.filteredMonthsArray.push(this.monthsArray[i]);
    }

    this.days_count = new Date(this.year, this.month, 0).getDate()
    this.selected_date = this.days_count + '-' + this.month + '-' + this.year

  }


  changeMonth() {
    this.clear_file();
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    this.employer_details();
  }

  onYearChange() {
    let selectedYear = this.year;
    this.month = '';
    this.filteredMonthsArray = [];

    const currentDate = new Date();
    let currentMonth = currentDate.getMonth() + 1; // (1 = January, 12 = December)
    let currentYear = currentDate.getFullYear();

    if (selectedYear == currentYear) {
      const oneMonthsBack = currentMonth - 1;
      if (oneMonthsBack > 0) {
        for (let i = 0; i < oneMonthsBack; i++) {
          this.filteredMonthsArray.push(this.monthsArray[i]);
        }
      }

    } else if (selectedYear == currentYear - 1) {
      if (currentMonth == 1) {
        for (let i = 0; i < 12; i++) {
          this.filteredMonthsArray.push(this.monthsArray[i]);
        }

      } else if (currentMonth >= 2) {
        for (let i = 0; i < 12; i++) {
          this.filteredMonthsArray.push(this.monthsArray[i]);
        }

      }
    } else if (selectedYear < currentYear - 1) {
      this.filteredMonthsArray = this.monthsArray.slice();
    }

    this.clear_file();


    // console.log("Year Changed:", this.year, "Filtered Months:", this.filteredMonthsArray);
  }

  att_file_upload() {
    this._attendanceService.att_file_upload({
      'data': this.fileUpload_binarystr,
      'name': this.fileUpload_name,
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      })
  }

}
