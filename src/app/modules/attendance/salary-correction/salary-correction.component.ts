import { Component } from '@angular/core';
import { AttendanceService } from '../attendance.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';
// import { Validators } from 'ngx-editor';
import { Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { Router } from '@angular/router';
// import { ShiftSpecificService } from '../shift-specific-service';

@Component({
  selector: 'app-salary-correction',
  templateUrl: './salary-correction.component.html',
  styleUrls: ['./salary-correction.component.css'],
  animations: [grooveState, dongleState]
})
export class SalaryCorrectionComponent {

  showSidebar: boolean = false;
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
  filteredYearsArray: any = [];
  filteredMonthsArray: any = [];
  selected_date: any;
  month: any = '';
  year: any;
  decoded_token: any;
  searchKeyword: any = '';
  attendanceDetails: any = [];
  employeeDetails: any = [];
  employeeDetailsForm: FormGroup;
  showRejectRemarksPopup: boolean = false;

  rejectForm: FormGroup;
  userList_original: any = [];
  userList_modified: any = [];
  selectedEmployee: any;
  showManualTDS: boolean = false;

  constructor(
    private _attendanceService: AttendanceService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private confirmationDialogService: ConfirmationDialogService,
  ) {

  }



  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);

    this.employeeDetailsForm = this.formBuilder.group({
      emp_name: [''],
      post_offered: [''],
      email: [''],
      mobile: [''],
      dateofjoining: [''],
      pancard: [''],
      gender: [''],
      dateofbirth: [''],
      jobtype: [''],
      fathername: [''],
      agencyname: [''],
      clientname: [''],
      posting_location: [''],
      emp_code: [''],

      posting_department: [''],
      tp_code: [''],
      orgempcode: [''],
      date_of_relieving: [''],
      assigned_ou_ids: [''],
      assigned_ou_names: [''],
      remark: [''],
      manualTDS: [''],
      manualTDSValue: [''],
      paidDays: [''],
      manualModeReason: [''],
      salaryPayMonth: ['Current']
    });

    this.employeeDetailsForm.get('salaryPayMonth').setValue('Current');

    this.rejectForm = this.formBuilder.group({
      remarks: ['', [Validators.required]],
      att_row_id: ['', [Validators.required]]
    })

    // Start - Logic for conditional validation
    this.employeeDetailsForm.get('manualTDS')?.valueChanges.subscribe((checked: boolean) => {
      const tdsControl = this.employeeDetailsForm.get('manualTDSValue');

      if (checked) {
        tdsControl?.setValidators(Validators.required);
      } else {
        tdsControl?.clearValidators();
        tdsControl?.setValue('');
      }
      tdsControl?.updateValueAndValidity();
    });
    // End - Logic for conditional validation


    this.reset_btn_click();
    this.getUserList();

    // this.getManualSalaryInfo();
    // console.log(this.month, this.year);
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get ed() {
    return this.employeeDetailsForm.controls;
  }

  search() {
    if (this.searchKeyword.length > 0) {
      this.getManualSalaryInfo();
    } else {
      this.toastr.info('Please enter the Employee Code or TP Code to search');
    }

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
    this.resetEmployeeDetailsForm();
    this.attendanceDetails = [];
    this.searchKeyword = '';
    // console.log('filteredYearsArray',this.filteredYearsArray);
    // console.log('filteredMonthsArray',this.filteredMonthsArray);

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


  changeYear() {
    this.month = '';
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

    // console.log("Year Changed:", this.year, "Filtered Months:", this.filteredMonthsArray);
  }



  getManualSalaryInfo() {
    this.resetEmployeeDetailsForm();
    this.attendanceDetails = [];

    this._attendanceService.getManualSalaryInfo({
      'customerAccountId': this.decoded_token.tp_account_id.toString(),
      'month': this.month,
      'year': this.year,
      'searchKeyword': this.searchKeyword,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.attendanceDetails = resData.commonData.attendanceDetails;
          let employeeDetails = resData.commonData.employeeDetails[0];

          if (this.attendanceDetails[0]?.tdsmode != 'Auto') {
            this.showManualTDS = true;
          } else {
            this.showManualTDS = false;
          }

          if (this.attendanceDetails[0]?.manual_tds_value) {
            this.employeeDetailsForm.patchValue({
              manualTDS: true
              // manualTDSValue: this.attendanceDetails[0]?.manual_tds_value
            })
          }

          this.employeeDetailsForm.get('salaryPayMonth').setValue('Current');

          this.employeeDetailsForm.patchValue({
            emp_name: employeeDetails.emp_name,
            post_offered: employeeDetails.post_offered,
            email: employeeDetails.email,
            mobile: employeeDetails.mobile,
            dateofjoining: employeeDetails.dateofjoining,
            pancard: employeeDetails.pancard,
            gender: employeeDetails.gender,
            dateofbirth: employeeDetails.dateofbirth,
            jobtype: employeeDetails.jobtype,
            fathername: employeeDetails.fathername,
            agencyname: employeeDetails.agencyname,
            clientname: employeeDetails.clientname,
            posting_location: employeeDetails.posting_location,
            emp_code: employeeDetails.emp_code,

            posting_department: employeeDetails.posting_department,
            tp_code: employeeDetails.tp_code,
            orgempcode: employeeDetails.orgempcode,
            date_of_relieving: employeeDetails.date_of_relieving,
            assigned_ou_ids: employeeDetails.assigned_ou_ids,
            assigned_ou_names: employeeDetails.assigned_ou_names
          });

          

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }

      }, error: (e) => {
        console.log(e);
      }
    })
  }

  saveSalaryInfo() {
    let data = this.employeeDetailsForm.value;

    // console.log(data);
    // // return;

    // if (!this.month || !this.year || !data.emp_code || !data.pancard || !data.paidDays || !data.remark || !data.manualModeReason) {
    //   this.toastr.error('Please fill all the fields', 'Oops!');
    //   return;
    // }

    if (this.employeeDetailsForm.invalid) {
      this.employeeDetailsForm.markAllAsTouched();
      return;
    }

    // if (this.showManualTDS && this.employeeDetailsForm.get('manualTDS').value == true) {
    //   this.updateTDS();
    // }

    this._attendanceService.saveManualSalaryInfo({
      customerAccountId: this.decoded_token.tp_account_id.toString(),
      month: this.month,
      year: this.year,
      empCode: data.emp_code,
      empName: data.emp_name,
      empPancard: data.pancard,
      paidDays: data.paidDays,
      remark: data.remark,
      manualModeReason: data.manualModeReason,
      salaryPayMonth: data.salaryPayMonth,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.getManualSalaryInfo();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })


  }

  resetEmployeeDetailsForm() {
    this.employeeDetailsForm.patchValue({
      emp_name: '',
      post_offered: '',
      email: '',
      mobile: '',
      dateofjoining: '',
      pancard: '',
      gender: '',
      dateofbirth: '',
      jobtype: '',
      fathername: '',
      agencyname: '',
      clientname: '',
      posting_location: '',
      emp_code: '',

      posting_department: '',
      tp_code: '',
      orgempcode: '',
      date_of_relieving: '',
      assigned_ou_ids: '',
      assigned_ou_names: '',
      remark: '',
      paidDays: '',
      manualModeReason: '',
      salaryPayMonth: ''
    });
  }


  rejectSalaryInfo() {

    let data = this.rejectForm.value;
    if (this.rejectForm.valid) {
      this.confirmationDialogService.confirm('Are you sure you want to reject?', 'Confirm').subscribe(result => {
        if (result) {
          this._attendanceService.rejectManualSalary({
            'attendanceId': data.att_row_id.toString(),
            'rejectRemarks': data.remarks,
          }).subscribe((resData: any) => {
            if (resData.statusCode) {
              this.toastr.success(resData.message, 'Success');
              this.closeRejectRemarksPopup();
              this.getManualSalaryInfo();

            } else {
              this.toastr.error(resData.message, 'Oops!');
            }
          })
        } else {

        }
      });

    } else {
      this.toastr.error('Please enter reject remarks', 'Oops!');
    }

  }

  openRejectRemarksPopup(att_row_id: any) {
    this.showRejectRemarksPopup = true;
    this.rejectForm.patchValue({
      att_row_id: att_row_id
    })
  }

  closeRejectRemarksPopup() {
    this.showRejectRemarksPopup = false;
    this.rejectForm.patchValue({
      att_row_id: '',
      remarks: '',
    })
  }

  check_digits(event: any) {
    const input = event.target as HTMLInputElement;
    const regex = /^\d{0,2}(\.\d{0,2})?$/;

    if (!regex.test(input.value)) {
      this.employeeDetailsForm.patchValue({
        paidDays: '',
      });
    } else {
      this.employeeDetailsForm.patchValue({
        paidDays: input.value,
      });
    }
  }


  async getUserList() {
    let obj =
    {
      customerAccountId: this.decoded_token.tp_account_id.toString(),
      productTypeId: this.decoded_token.product_type.toString(),
      searchKeyword: ''
    }

    await this._attendanceService.getCandidateDetails(obj)
      .subscribe((res: any) => {
        if (res.statusCode) {
          this.userList_original = [];
          this.userList_modified = [];

          let userList_original = res.commonData;
          userList_original.map((item) => {
            if (item.isactive) {
              this.userList_original.push({ ...item }); // shallow copy
              item.emp_name = item.emp_name + ` (${item.orgempcode != '' ? item.orgempcode : (item.tpcode ? item.tpcode : item.emp_code)})`
              this.userList_modified.push({ ...item }); // shallow copy
            }
          })

          // console.log('employees', this.userList_modified);
        } else {

        }
      })
  }


  customSearch(term: string, item: any): boolean {
    term = term.toLowerCase();
    return item.orgempcode.toLowerCase().includes(term) || item.tpcode.toLowerCase().includes(term) || item.emp_name.toLowerCase().includes(term);
  }

  updateSearchKeyword(selectedItem: any) {
    if (selectedItem) {
      // Set searchKeyword to orgempcode or tpcode based on preference
      this.searchKeyword = selectedItem.orgempcode || selectedItem.tpcode;
    } else {
      this.searchKeyword = '';
    }
  }
  routeToBulkSalaryCorrection() {
    this.router.navigate(['/attendance/bulk-salary-correction'], { state: { 'month': this.month, 'year': this.year } });
  }

  // Manual TDS - dated. 08.05.2025 by sidharth kaul ------------------

  validateManualTds() {
    const control = this.employeeDetailsForm.get('manualTDSValue');
    let value = parseFloat(control?.value);

    if (isNaN(value) || value < 0) {
      control?.setValue('');
      return;
    }

    // Round to 2 decimal places and set back
    control?.setValue(parseFloat(value.toFixed(2)).toString());
  }

  updateTDS() {

    if (this.showManualTDS && this.employeeDetailsForm.get('manualTDS').value == true) {
      let postData = {
        action: 'updateManualTDS',
        customerAccountId: this.decoded_token.tp_account_id.toString(),
        userby: this.decoded_token.tp_account_id.toString(),
        empCode: this.selectedEmployee?.emp_code,
        manualTDS: this.employeeDetailsForm.value.manualTDSValue,
      }

      this._attendanceService.updateManualTDS(postData).subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message);
          // this.employer_details();
          this.saveSalaryInfo();
        } else {
          this.toastr.error(resData.message);
        }
      })

    } else {
      this.saveSalaryInfo();

    }

  }


}
