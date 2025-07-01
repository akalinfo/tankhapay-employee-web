import { Component } from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { EmployeeService } from '../../employee/employee.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';


declare var $: any;


@Component({
  selector: 'app-bulk-open-balance',
  templateUrl: './bulk-open-balance.component.html',
  styleUrls: ['./bulk-open-balance.component.css'],
  animations: [grooveState, dongleState]
})
export class BulkOpenBalanceComponent {

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
  product_type_array: any = [];
  showSidebar: boolean = true;
  decoded_token: any;
  tp_account_id: any;
  product_type: any;
  leaveTemplateMaster: any = [];
  selected_template: any = '';
  showOpenBalancePopup: boolean = false;
  // markLeaveForm: FormGroup;
  // openLeaveBalanceForm: FormGroup;
  month: any
  year: any;
  status_filter: any = 'Approved';

  selected_emp_arr: any = [];
  originalEmployees: any = [];
  filteredEmployees: any = [];
  searchKey: any = '';

  excelBulkOpenBalUploadArray: any = [];
  excelToTableData: any = [];
  fileUpload_binarystr: any = '';
  fileUpload_name: any = '';
  show_bulk_upload_btn: boolean = false;
  bulkLeaveBalanceFormat: any = 'excel';

  constructor(
    private _attendanceService: AttendanceService,
    private _sessionService: SessionService,
    private _EmployeeService: EmployeeService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
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

    this.month = currentMonth;
    this.year = currentYear;

    for (let i = 2023; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);

    };
    // this.openLeaveBalanceForm = this._formBuilder.group({
    //   rowid: [''],
    //   emp_id: [''],
    //   intial_leave_bal_txt: ([]),
    //   emp_name: [''],
    //   mobile: [''],
    //   orgempcode: [''],
    //   leave_bank_id: [''],
    // })

    // this.get_employee_list_for_generate_leave();
    this.get_tp_leave_temeplate();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  change_status() {
    this.get_employee_list_for_generate_leave();

  }
  changeMonth() {
    this.get_employee_list_for_generate_leave();

  }

  changeYear() {
    this.get_employee_list_for_generate_leave();
  }

  changeProductType(e: any) {

  }

  search() {
    let search_key = this.searchKey.toLowerCase();

    this.filteredEmployees = this.originalEmployees.filter(el => {
      return el?.emp_name?.toLowerCase()?.includes(search_key) ||
        el?.cjcode?.toLowerCase()?.includes(search_key) ||
        el?.mobile?.toLowerCase()?.includes(search_key) ||
        el?.orgempcode?.toLowerCase()?.includes(search_key)

    })

  }


  get_tp_leave_temeplate() {
    this._EmployeeService.get_tp_leave_temeplate({
      "customeraccountid": this.tp_account_id.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.leaveTemplateMaster = resData.commonData.data;

        if (this.leaveTemplateMaster.length > 0) {
          this.selected_template = this.leaveTemplateMaster[0].templateid;
          this.get_employee_list_for_generate_leave();
        }
      } else {

        this.leaveTemplateMaster = [];
      }
    })
  }

  get_employee_list_for_generate_leave() {
    let month = this.month <= 9 ? '0' + this.month : this.month;
    let effective_dt = '01' + '-' + month + '-' + this.year;

    $('input[name="checkempAll"').prop('checked', false);
    $('input[name="checkemp"').prop('checked', false);
    this.selected_emp_arr = [];
    this.originalEmployees = [];
    this.filteredEmployees = [];

    this._attendanceService.get_employee_list_for_generate_leave({
      'accountId': this.tp_account_id,
      'template_id': this.selected_template.toString(),
      'effective_dt': effective_dt,
      'generated_status': this.status_filter,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.originalEmployees = JSON.parse(JSON.stringify(resData.commonData));
          this.filteredEmployees = JSON.parse(JSON.stringify(this.originalEmployees));

          this.search();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  changeTemplate() {
    this.get_employee_list_for_generate_leave();
    this.clear_file();
    // console.log(this.selected_template);
  }


  // openBalancePopup() {
  //   this.showOpenBalancePopup = true;
  // }

  // closeOpenBalancePopup() {
  //   this.showOpenBalancePopup = false;
  //   this.openLeaveBalanceForm.patchValue({
  //     rowid: '',
  //     emp_id: '',
  //     emp_name: '',
  //     mobile: '',
  //     orgempcode: '',
  //     leave_bank_id: '',
  //     intial_leave_bal_txt: [],
  //   })
  // }

  // updateOpenBalance() {

  // }


  updateBulkLeaveBalance() {
    const checkedBoxes = document.querySelectorAll<HTMLInputElement>('.checkemp:checked');
    const checkedBoxesEmpCodes = Array.from(checkedBoxes).map(checkbox =>
      checkbox.getAttribute('data-emp-code')
    );
    // console.log(this.selected_emp_arr);
    // console.log(checkedBoxesEmpCodes);
    this.selected_emp_arr = this.selected_emp_arr.filter(el => checkedBoxesEmpCodes.includes(el.toString()));

    if (this.selected_emp_arr.length == 0) {
      this.toastr.error('No Employee Selected', 'Oops!');
      return;
    }

    let leavebankid_arr = [];
    let leavetemplate_text_arr = [];

    // for (let i = 0; i < this.filteredEmployees.length; i++) {
    //   if (this.selected_emp_arr.findIndex(el => el == this.filteredEmployees[i].emp_id) != -1) {
    //     leavebankid_arr.push(this.filteredEmployees[i].rowid);
    //     leavetemplate_text_arr.push(this.filteredEmployees[i].intial_leave_bal_txt);
    //   }
    // }

    for (let empId of this.selected_emp_arr) {
      const employee = this.filteredEmployees.find(el => el.emp_id == empId);
      if (employee) {
        leavebankid_arr.push(employee.rowid);
        leavetemplate_text_arr.push(employee.intial_leave_bal_txt);
      }
    }

    if (
      leavebankid_arr.length !== this.selected_emp_arr.length ||
      leavetemplate_text_arr.length !== this.selected_emp_arr.length
    ) {
      this.toastr.error('Data mismatch. Please try again.', 'Oops!');
      return;
    }


    this._attendanceService.updateBulkLeaveBalance({
      'accountId': this.tp_account_id.toString(),
      'leavebankid': leavebankid_arr,
      'empid': this.selected_emp_arr,
      'leavetemplate_text': leavetemplate_text_arr,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.get_employee_list_for_generate_leave();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }
  generateBulkOpeningBalance() {
    let month = this.month <= 9 ? '0' + this.month : this.month;
    let effective_dt = '01' + '-' + month + '-' + this.year;

    const checkedBoxes = document.querySelectorAll<HTMLInputElement>('.checkemp:checked');
    const checkedBoxesEmpCodes = Array.from(checkedBoxes).map(checkbox =>
      checkbox.getAttribute('data-emp-code')
    );
    // console.log(checkedBoxesEmpCodes);
    this.selected_emp_arr = this.selected_emp_arr.filter(el => checkedBoxesEmpCodes.includes(el.toString()));

    if (this.selected_emp_arr.length == 0) {
      this.toastr.error('No Employee Selected', 'Oops!');
      return;
    }

    this._attendanceService.generateBulkOpeningBalance({
      'accountId': this.tp_account_id.toString(),
      'empid': this.selected_emp_arr,
      'effective_dt': effective_dt,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.get_employee_list_for_generate_leave();
          this.toastr.success(resData.message, 'Success');

        } else {
          this.toastr.error(resData.message, 'Oops!');

        }
      }
    })
  }

  updateOpeningBalance(empId: number, typecode: string, newBalance: number) {
    // console.log(`Updating empId: ${empId}, Type: ${typecode}, New Balance: ${newBalance}`);
    // Handle the update logic here (API call or state update)
    // console.log(this.filteredEmployees)
  }

  validateOpeningBal(item: any) {
    let value = parseFloat(item.opening_bal);

    if (isNaN(value)) {
      item.opening_bal = 0;
    } else {
      value = Math.max(-999, Math.min(999, value));
      // Round to 2 decimal places
      item.opening_bal = parseFloat(value.toFixed(2));
    }
  }

  checkEmp(e: any, emp_id: any) {
    // console.log(e.target.checked, this.selected_emp_arr.find((el:any) => el == emp_id));
    if (e.target.checked) {
      if (this.selected_emp_arr.find((el: any) => el == emp_id) == undefined) {
        this.selected_emp_arr.push(emp_id);
      }
    } else {
      const index = this.selected_emp_arr.findIndex((el: any) => el == emp_id);
      if (index != -1) this.selected_emp_arr.splice(index, 1);

    }


    if (this.filteredEmployees.length == this.selected_emp_arr.length) {
      $('input[name="checkempAll"').prop('checked', true);

    } else {
      $('input[name="checkempAll"').prop('checked', false);

    }
    // console.log(this.selected_emp_arr);

  }

  check_emp_all(e: any) {
    this.selected_emp_arr = [];
    if (e.target.checked) {
      this.filteredEmployees.forEach((el: any) => {
        this.selected_emp_arr.push(el.emp_id);
        // if (el.approval_status == 'P') {
        // }
      })
      $('input[name="checkempAll"').prop('checked', true);
      $('input[name="checkemp"').prop('checked', true);

    } else {
      this.selected_emp_arr = [];
      $('input[name="checkempAll"').prop('checked', false);
      $('input[name="checkemp"').prop('checked', false);

    }
    // console.log(this.selected_emp_arr);
  }

  find_emp_id(emp_id: any) {
    let idx = this.selected_emp_arr.findIndex(el => el == emp_id);

    if (idx != -1) {
      return true;
    } else {
      return false;
    }
  }

  find_emp_id_all() {
    if (this.filteredEmployees.length == 0) {
      return false;

    } else {
      for (let i = 0; i < this.filteredEmployees.length; i++) {
        let idx = this.selected_emp_arr.findIndex(el => el == this.filteredEmployees[i].emp_id);
        if (idx == -1) {
          return false;
        }
      }
      return true;

    }
  }


  selected_emp_cnt() {
    const checkedBoxes = document.querySelectorAll<HTMLInputElement>('.checkemp:checked');
    const checkedBoxesEmpCodes = Array.from(checkedBoxes).map(checkbox =>
      checkbox.getAttribute('data-emp-code')
    );

    return checkedBoxesEmpCodes.length || 0;
  }


  clear_file() {
    const fileInput = document.getElementById("attendnace_excel") as HTMLInputElement;
    fileInput.value = '';
    this.excelBulkOpenBalUploadArray = [];
    this.excelToTableData = [];
  }


  onFileChange(event: any) {
    // console.log(this.month);
    this.excelBulkOpenBalUploadArray = [];
    this.excelToTableData = [];
    this.fileUpload_binarystr = '';
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
      const binaryContent = e.target.result;
      this.fileUpload_binarystr = btoa(binaryContent);
      const wb: XLSX.WorkBook = XLSX.read(binaryContent, { type: 'binary' });

      /* selected the first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      const data: any = XLSX.utils.sheet_to_json(ws, { header: 1 });
      // console.log(data);


      const headers = data[0];
      const templateNameIndex = headers.indexOf("TemplateName");
      const leaveHeaders = headers.slice(templateNameIndex + 1);

      // Transform data
      const transformedData = data.slice(1) // Skip headers
        .filter(row => row[0]) // Ensure EmpID exists (assuming it's the first column)
        .map(row => {
          const rowEntries = row.slice(0, templateNameIndex + 1)
            .map((value, index) => [headers[index], value ?? ""])
            .filter(([key]) => key !== undefined);

          const obj = Object.fromEntries(rowEntries);

          obj.LeaveDetails = leaveHeaders.map((type, index) => ({
            typecode: type,
            opening_bal: row[templateNameIndex + 1 + index] || "0"
          }));

          return obj;
        });




      // console.log(transformedData);
      // return;


      this.excelToTableData = transformedData;
      // console.log(this.excelToTableData, 'harsh22');
    };

  }


  getBulkLeaveExcel() {

    if (this.status_filter == 'Pending') {
      this.toastr.error('Please generate the opening balance', 'Oops!');
      return;
    }
    let exportData = [];
    let template_name = this.leaveTemplateMaster.find(el => el.templateid == this.selected_template).templatedesc;

    for (let idx = 0; idx < this.originalEmployees.length; idx++) {

      let obj = {
        'EmpID': !this.originalEmployees[idx].emp_id ? '' : this.originalEmployees[idx].emp_id,
        'Employee': !this.originalEmployees[idx].emp_name ? '' : this.originalEmployees[idx].emp_name,
        'OrgEmpCode': !this.originalEmployees[idx]?.orgempcode ? this.originalEmployees[idx].cjcode : this.originalEmployees[idx]?.orgempcode,
        'Mobile': !this.originalEmployees[idx].mobile ? '' : this.originalEmployees[idx].mobile,
        'Department': !this.originalEmployees[idx].posting_department ? '' : this.originalEmployees[idx].posting_department,
        'Designation': !this.originalEmployees[idx].post_offered ? '' : this.originalEmployees[idx].post_offered,
        'DOJ': !this.originalEmployees[idx]?.dateofjoining ? '' : this.originalEmployees[idx]?.dateofjoining,
        'DOR': !this.originalEmployees[idx]?.dateofrelieveing ? '' : this.originalEmployees[idx]?.dateofrelieveing,
        'TemplateName': template_name,
      }

      for (let j = 0; j < this.originalEmployees[idx].intial_leave_bal_txt.length; j++) {
        obj[this.originalEmployees[idx].intial_leave_bal_txt[j].typecode] = this.originalEmployees[idx].intial_leave_bal_txt[j].opening_bal;
      }

      exportData.push(obj);

    }
    console.log(exportData);
    // return;
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink: any = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    let date = new Date()
    downloadLink.download = `LeaveBalance-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;
    downloadLink.click();
  }



  patchOpeningBalance() {
    this.searchKey = '';
    this.selected_emp_arr = [];

    for (let i = 0; i < this.excelToTableData.length; i++) {
      let idx = this.originalEmployees.findIndex(el => el.emp_id == this.excelToTableData[i].EmpID);

      if (idx != -1) {
        this.originalEmployees[idx].intial_leave_bal_txt.forEach((el) => {
          let inner_idx = this.excelToTableData[i].LeaveDetails.findIndex(e => e.typecode == el.typecode);

          if (inner_idx != -1) {
            el.opening_bal = this.excelToTableData[i].LeaveDetails[inner_idx].opening_bal;
          }
        });
      }

      this.selected_emp_arr.push(this.excelToTableData[i].EmpID);
    }

    this.bulkLeaveBalanceFormat = 'manual';
    this.search();
  }



}
