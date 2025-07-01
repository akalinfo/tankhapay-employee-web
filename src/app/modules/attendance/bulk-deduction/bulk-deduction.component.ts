import { Component } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { AttendanceService } from '../attendance.service';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bulk-deduction',
  templateUrl: './bulk-deduction.component.html',
  styleUrls: ['./bulk-deduction.component.css']
})
export class BulkDeductionComponent {

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

  IS_JIVO_ACCOUNT: boolean = false;
  constructor(
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _attendanceService: AttendanceService,
    private router: Router,
  ) {

  }


  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    if ((environment.production == false && this.tp_account_id == '653')
      || (environment.production == true && this.tp_account_id == '2719')) {
      this.IS_JIVO_ACCOUNT = true;
    } else {
      this.IS_JIVO_ACCOUNT = false;
    }


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
    this.clear_file();
    this.month = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.employer_details();
  }
  changeYear(e: any) {
    this.clear_file();
    this.year = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = this.days_count + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    this.employer_details();
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

    // console.log(this.filteredEmployees);
    for (let idx = 0; idx < this.filteredEmployees.length; idx++) {
      // if (this.filteredEmployees[idx]?.lockstatus == 'Not Locked') {

      let obj = {
        'Employee': this.filteredEmployees[idx].emp_name,
        'EmpCode': this.filteredEmployees[idx].emp_code,
        'OrgEmpCode': this.filteredEmployees[idx]?.orgempcode,
        'Mobile': this.filteredEmployees[idx].mobile,
        'Month': this.month,
        'Year': this.year,
        'DOB': this.filteredEmployees[idx].dateofbirth,
        'DOJ': this.filteredEmployees[idx].dateofjoining,
        'DOR': this.filteredEmployees[idx].dateofrelieveing,
        'Overtime': '',
      }

      if (this.IS_JIVO_ACCOUNT) {
        obj['OT'] = '';
        obj['Incentive'] = '';
        obj['DA Amount'] = '';
        obj['TA'] = '';
        obj['Phone'] = '';
        obj['Arrear'] = '';
        obj['Advance'] = '';
        obj['Retainership'] = '';
        obj['OT Advance'] = '';
        obj['Arrear Advance'] = '';
        obj['Travel Allowance'] = '';
        obj['Daily Allowance'] = '';
        obj['remark'] = '';
      } else {
        obj['Allowance'] = '';
        obj['Deduction'] = '';
        obj['Travel Allowance'] = '';
        obj['Daily Allowance'] = '';
        obj['remark'] = '';

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
    downloadLink.download = `Deduction-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
    downloadLink.click();
  }

  onFileChange(event: any) {
    console.log(this.month);
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
        .filter((row) => row[data[0].indexOf('EmpCode')]) // Filter rows with non-empty EmpCode
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
        let empcode;
        let mobile;
        let dob;
        let employee;
        let doj;
        let dor;
        let rowColorStatus = true;
        let orgempcode;
        let status;
        let travel_allowance;
        let overtime;
        let daily_allowance;
        let allowance;
        let deduction;
        let loc_month;
        let loc_year;
        let remark;

        let OT
        let Incentive
        let DAAmount
        let TA
        let Phone
        let Arrear
        let Advance
        let Retainership
        let OTAdvance
        let ArrearAdvance


        for (const key in this.excelBulkAttUploadArray[i]) {
          // console.log(key);

          if (key === 'EmpCode') {
            empcode = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'Mobile') {
            mobile = this.excelBulkAttUploadArray[i][key];
          } else if (key === 'DOB') {
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
          // else if (key === 'Status') {
          //   status = this.excelBulkAttUploadArray[i][key];
          //   // if (status == 'Locked') {
          //   //   const fileInput = document.getElementById("attendnace_excel") as HTMLInputElement;
          //   //   fileInput.value = '';
          //   //   this.toastr.error('Attendance status already Locked', 'Oops!');
          //   //   return;
          //   // }
          // }

          else if (key === 'Overtime') {
            overtime = this.excelBulkAttUploadArray[i][key];

            if (overtime != '' && isNaN(overtime)) {
              rowColorStatus = false;
              this.show_bulk_upload_btn = false;
            }

          } else if (key === 'Travel Allowance') {
            travel_allowance = this.excelBulkAttUploadArray[i][key];

            if (travel_allowance != '' && isNaN(travel_allowance)) {
              rowColorStatus = false;
              this.show_bulk_upload_btn = false;
            }

          } else if (key === 'Daily Allowance') {
            daily_allowance = this.excelBulkAttUploadArray[i][key];

            if (daily_allowance != '' && isNaN(daily_allowance)) {
              rowColorStatus = false;
              this.show_bulk_upload_btn = false;
            }

          } else if (key == 'remark') {
            remark = this.excelBulkAttUploadArray[i][key];
          }

          if (this.IS_JIVO_ACCOUNT == false) {
            if (key === 'Allowance') {
              allowance = this.excelBulkAttUploadArray[i][key];

              if (allowance != '' && isNaN(allowance)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            } else if (key === 'Deduction') {
              deduction = this.excelBulkAttUploadArray[i][key];

              if (deduction != '' && isNaN(deduction)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            }


          } else if (this.IS_JIVO_ACCOUNT == true) {
            if (key == 'OT') {
              OT = this.excelBulkAttUploadArray[i][key];

              if (!OT && isNaN(OT)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            } else if (key == 'Incentive') {
              Incentive = this.excelBulkAttUploadArray[i][key];

              if (!Incentive && isNaN(Incentive)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            } else if (key == 'DA Amount') {
              DAAmount = this.excelBulkAttUploadArray[i][key];

              if (!DAAmount && isNaN(DAAmount)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            } else if (key == 'TA') {
              TA = this.excelBulkAttUploadArray[i][key];

              if (!TA && isNaN(TA)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            } else if (key == 'Phone') {
              Phone = this.excelBulkAttUploadArray[i][key];

              if (!Phone && isNaN(Phone)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            } else if (key == 'Arrear') {
              Arrear = this.excelBulkAttUploadArray[i][key];

              if (!Arrear && isNaN(Arrear)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            } else if (key == 'Advance') {
              Advance = this.excelBulkAttUploadArray[i][key];

              if (!Advance && isNaN(Advance)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            } else if (key == 'Retainership') {
              Retainership = this.excelBulkAttUploadArray[i][key];

              if (!Retainership && isNaN(Retainership)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            } else if (key == 'OT Advance') {
              OTAdvance = this.excelBulkAttUploadArray[i][key];

              if (!OTAdvance && isNaN(OTAdvance)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            } else if (key == 'Arrear Advance') {
              ArrearAdvance = this.excelBulkAttUploadArray[i][key];

              if (!ArrearAdvance && isNaN(ArrearAdvance)) {
                rowColorStatus = false;
                this.show_bulk_upload_btn = false;
              }

            }
          }

        }

        if (this.IS_JIVO_ACCOUNT == false) {
          if (!overtime && !allowance && !deduction && !travel_allowance && !daily_allowance) {
            rowColorStatus = false;
          }

        } else if (this.IS_JIVO_ACCOUNT == true) {
          if (!overtime && !travel_allowance && !daily_allowance && !OT && !Incentive && !DAAmount && !TA && !Phone && !Arrear && !Advance && !Retainership && !OTAdvance && !ArrearAdvance) {
            rowColorStatus = false;
          }
        }


        let temp_obj = {
          // attendanceDates: attendanceDates,
          empcode: empcode,
          orgempcode: orgempcode,
          mobile: mobile,
          month: loc_month,
          year: loc_year,
          dob: dob,
          doj: doj,
          dor: dor,
          employee: employee,
          rowColor: rowColorStatus,
          status: status,
          overtime: overtime,
          travel_allowance: travel_allowance,
          daily_allowance: daily_allowance,
          remark: remark,
        }

        if (this.IS_JIVO_ACCOUNT == false) {
          temp_obj['allowance'] = allowance;
          temp_obj['deduction'] = deduction;

        } else if (this.IS_JIVO_ACCOUNT == true) {


          temp_obj['OT'] = OT;
          temp_obj['Incentive'] = Incentive;
          temp_obj['DAAmount'] = DAAmount;
          temp_obj['TA'] = TA;
          temp_obj['Phone'] = Phone;
          temp_obj['Arrear'] = Arrear;
          temp_obj['Advance'] = Advance;
          temp_obj['Retainership'] = Retainership;
          temp_obj['OTAdvance'] = OTAdvance;
          temp_obj['ArrearAdvance'] = ArrearAdvance;

        }

        this.excelToTableData.push(temp_obj);
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

    if (this.IS_JIVO_ACCOUNT == false) {
      for (let i = 0; i < this.excelToTableData.length; i++) {
        if (!this.excelToTableData[i].overtime && !this.excelToTableData[i].allowance &&
          !this.excelToTableData[i].deduction && !this.excelToTableData[i].travel_allowance &&
          !this.excelToTableData[i].daily_allowance) {
          continue;
        }
        temp_excelToTableData.push(this.excelToTableData[i]);

        if (this.excelToTableData[i].month > current_mm && this.excelToTableData[i].year >= current_yy) {
          this.toastr.error('Cannot upload future date deduction', 'Oops!');
          return;
        }
        if (this.excelToTableData[i].rowColor == false) {
          this.toastr.error('Excel data is not in correct format', 'Oops!');
          return;
        }
      }
    } else if (this.IS_JIVO_ACCOUNT == true) {
      for (let i = 0; i < this.excelToTableData.length; i++) {
        if (!this.excelToTableData[i].overtime && !this.excelToTableData[i].Incentive &&
          !this.excelToTableData[i].OT && !this.excelToTableData[i].travel_allowance &&
          !this.excelToTableData[i].daily_allowance &&
          !this.excelToTableData[i].DAAmount && !this.excelToTableData[i].TA &&
          !this.excelToTableData[i].Phone && !this.excelToTableData[i].Arrear &&
          !this.excelToTableData[i].Advance && !this.excelToTableData[i].Retainership &&
          !this.excelToTableData[i].OTAdvance && !this.excelToTableData[i].ArrearAdvance
        ) {
          continue;
        }
        temp_excelToTableData.push(this.excelToTableData[i]);

        if (this.excelToTableData[i].month > current_mm && this.excelToTableData[i].year >= current_yy) {
          this.toastr.error('Cannot upload future date deduction', 'Oops!');
          return;
        }
        if (this.excelToTableData[i].rowColor == false) {
          this.toastr.error('Excel data is not in correct format', 'Oops!');
          return;
        }
      }
    }


    if (temp_excelToTableData.length == 0) {
      this.toastr.error('No Data found to upload', 'Oops!');
      return;
    }
    // console.log(temp_excelToTableData);
    //console.log(this.excelBulkAttUploadArray);
    // return;

    this._attendanceService.bulk_deduction_upload({
      'customer_accountid': this.tp_account_id.toString(),
      'product_type': this.product_type.toString(),
      'allowance_dedution': temp_excelToTableData,
      'mprMonth': this.month,
      'mprYear': this.year,
      'mobile': this.decoded_token.mobile,
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.att_file_upload();
          // this.employer_details();
          this.router.navigate(['/attendance']);
          this.excelToTableData = [];
          this.excelBulkAttUploadArray = [];
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      })

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
