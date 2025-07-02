import { Component, ElementRef, ViewChild } from '@angular/core';
import { AttendanceService } from '../../attendance/attendance.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../../employee/employee.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

declare var $: any;

@Component({
  selector: 'app-bulk-leave',
  templateUrl: './bulk-leave.component.html',
  styleUrls: ['./bulk-leave.component.css'],
  animations: [dongleState, grooveState],
})
export class BulkLeaveComponent {

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
  showSidebar: boolean = false;
  yearsArray: any = [];
  filteredEmployees: any = [];
  emp_json_data: any = [];
  product_type_array: any = [];
  selected_date: any;
  month: any;
  year: any;
  days_count: any;
  product_type: any;
  tp_account_id: any;
  decoded_token: any;
  show_product_type_dropdown: boolean = false;
  keyword: any = '';
  leaveTemplateMaster: any = [];
  leaveTemplateForm: FormGroup;
  @ViewChild('ed') effective_dt_val: ElementRef;
  showChangeTempPopup: boolean = false;
  selcted_Status: any = '';
  IS_DIC_ACCOUNT :boolean = false;
  selectedEmpStatus: any = 'Active';

  constructor(
    private _attendanceService: AttendanceService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _EmployeeService: EmployeeService,
    private _formBuilder: FormBuilder,
    private router: Router
  ) {

  }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);

    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    if (this.decoded_token['product_type'] == '1,2') {
      this.show_product_type_dropdown = true;
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }
    if (this.decoded_token['product_type'] == '1') {
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
    }
    if (this.decoded_token['product_type'] == '2') {
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }
    //6927    Digital India Corporation    vinaya.v@digitalindia.gov.in    9811860070
       if ((environment.production == false)
          || (environment.production == true && 
          (this.tp_account_id == '6927' || this.tp_account_id == '3088' ))) {
          this.IS_DIC_ACCOUNT = true;
        } else {
          this.IS_DIC_ACCOUNT = false;
        }
        
    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    for (let i = 2023; i <= currentYear + 1; i++) {
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
    this.days_count = new Date(this.year, this.month, 0).getDate();

    this.leaveTemplateForm = this._formBuilder.group({
      leavetemplate_text: ['', [Validators.required]],
      effective_dt: ['', [Validators.required]],
      empIdArray: [[], [Validators.required]],
    })

    this.employer_details();
    // this.get_employer_today_attendance();
    this.get_tp_leave_temeplate();

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  search(key: any) {
    if (key != null && key != undefined && key != '') {
      this.keyword = key;
      let searchkey = this.keyword.toString().toLowerCase();

      this.filteredEmployees = this.emp_json_data.filter(function (element: any) {
        return element.emp_name.toLowerCase().includes(searchkey)
          || element.mobile.toLowerCase().includes(searchkey)
          || element.leave_template_name.toLowerCase().includes(searchkey)
      });

    }
    else if (key == '') {
      this.filteredEmployees = this.deepCopyArray(this.emp_json_data);
    }
  }

  changeProductType(e: any) {
    this.product_type = e.target.value;
    localStorage.setItem('product_type', this.product_type);
    // this.get_employer_today_attendance();
    this.employer_details();
  }

  changeMonth(e: any) {
    this.month = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    // this.get_employer_today_attendance();
    this.employer_details();
  }
  chnageFilter(val: any) {
    // this.month = val;
    // this.days_count = new Date(this.year, this.month, 0).getDate()
    // let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    // this.selected_date = date;
    // localStorage.setItem('selected_date', date);
    this.selcted_Status = val;
    // this.get_employer_today_attendance();
    this.employer_details();
  }

  changeYear(e: any) {
    this.year = e.target.value;
    this.days_count = new Date(this.year, this.month, 0).getDate()
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

    // this.get_employer_today_attendance();
    this.employer_details();
  }

  //Not used
  // get_employer_today_attendance() {

  //   this._attendanceService
  //     .get_employer_today_attendance({

  //       customeraccountid: (this.tp_account_id),
  //       productTypeId: this.product_type,
  //       att_date: this.selected_date,
  //       emp_name: '',
  //       approval_status: '',

  //     })
  //     .subscribe((resData: any) => {
  //       if (resData.statusCode) {

  //         let decrypted_emp_json_data = resData.commonData;
  //         this.emp_json_data = (decrypted_emp_json_data).data.attendancedetail;

  //         this.emp_json_data.map((el: any) => {
  //           el['photopath'] = ((el['photopath'] != null && el['photopath']
  //             != 'https://api.contract-jobs.com/crm_api/') ? el['photopath'] : '');

  //           // el['template_txt'] = el['template_txt'] != '' ? JSON.parse(el['template_txt']) : '';
  //           // el['balance_txt'] = el['balance_txt'] != '' ? JSON.parse(el['balance_txt']) : '';
  //           el['template_txt'] = (el['template_txt'] != '' && el['template_txt'] != null) ? JSON.parse(el['template_txt']) : '';
  //           el['prev_bal'] = (el['prev_bal'] != '' && el['prev_bal'] != null) ? JSON.parse(el['balance_txt']) : '';
  //           el['balance_txt'] = (el['balance_txt'] != '' && el['balance_txt'] != null) ? JSON.parse(el['balance_txt']) : '';
  //         })

  //         this.filteredEmployees = this.deepCopyArray(this.emp_json_data);

  //       } else {
  //         this.emp_json_data = [];
  //         this.filteredEmployees = [];
  //         this.toastr.error(resData.message, 'Oops!');
  //       }
  //     });
  // }

  employer_details() {

    this.selcted_Status;

    this._EmployeeService.employer_details({
        customeraccountid: this.tp_account_id.toString(),
        productTypeId: this.product_type,
        GeoFenceId:"",
        employeesStatus: this.selectedEmpStatus
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.emp_json_data = resData.commonData;

          this.emp_json_data = this.emp_json_data.filter((el: any) => {

            if (!el['leave_template_json']) {
              el['leave_details'] = []
            } else {
              let json = JSON.parse(el['leave_template_json'])[0].leave_details.leave_type;
              el['leave_details'] = json;
            }
            //&& el['dateofrelieveing'] == ''
            if (el['emp_code'] != '-9999' &&
              (this.selcted_Status == '' ? (true) : this.selcted_Status == 'Y' ? (el['leave_effective_from'] != '') :
                (el['leave_effective_from'] == '' || el['leave_effective_from'] == null || el['leave_template_name'] == '' ||
                  el['leave_effective_from'] == undefined))) {
              return el;
            }


          })

          // this.emp_json_data.map((el:any) => {
          //   if (!el['leave_template_json']) {
          //     el['leave_details'] = []
          //   } else {
          //     let json = JSON.parse(el['leave_template_json'])[0].leave_details.leave_type;
          //     // console.log(json);
          //     el['leave_details'] = json;
          //   }
          // })
          this.filteredEmployees = this.deepCopyArray(this.emp_json_data);
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


  get_tp_leave_temeplate() {
    this._EmployeeService.get_tp_leave_temeplate({ "customeraccountid": this.tp_account_id.toString() }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.leaveTemplateMaster = resData.commonData.data;
      }
    })
  }

  get myDate() {
    let currDate = new Date();

    let day = currDate.getDate();
    let dd = (day < 10) ? '0' + day : day;

    let month = currDate.getMonth() + 1;
    let mm = (month < 10) ? '0' + month : month;

    let yy = currDate.getFullYear();

    return dd + '/' + mm + '/' + yy;
  }

  openChangeTempPopup() {
    if (this.leaveTemplateForm.value.empIdArray.length > 0) {
      this.showChangeTempPopup = true;
      setTimeout(() => {
        $(function () {
          $('#effective_dt').datepicker({
            dateFormat: 'dd/mm/yy',
            changeMonth: true,
            changeYear: true,
          })
          $('body').on('change', '#effective_dt', function () {
            $('#recdate').trigger('click');
          })
        })
      }, 0)

      this.leaveTemplateForm.patchValue({
        effective_dt: this.myDate
      })
    } else {

      this.toastr.error('Please select an Employee');
    }
  }
  openOpeningBalance()
  {
    this.router.navigate(['/attendance/bulk-open-balance']);
  }
  closeChangeTempPopup() {
    this.showChangeTempPopup = false;
    $('input[name="emp"]').prop('checked', false);
    $('#empAll').prop('checked', false);

    this.leaveTemplateForm.patchValue({
      leavetemplate_text: '',
      effective_dt: '',
      empIdArray: [],
    })
  }

  changeLeaveTemplate(e: any) {
    this.leaveTemplateForm.patchValue({
      leavetemplate_text: JSON.parse(e.target.value),
    })
  }
  change_effectivedt() {
    this.leaveTemplateForm.patchValue({
      effective_dt: this.effective_dt_val.nativeElement.value,
    })
  }

  checkEmpAll(e: any) {
    let val = e.target.checked;
    let data = [];

    if (val) {
      this.filteredEmployees.map((el: any) => {
        // if (el.dateofrelieveing == '') {
          data.push(el.emp_id);
        // }
      })

      $('input[name="emp"]').prop('checked', true);

    } else {
      data = [];
      $('input[name="emp"]').prop('checked', false);


    }

    // console.log('sbdnbaskjdjks', data);

    this.leaveTemplateForm.patchValue({
      empIdArray: data
    })

    console.log(this.leaveTemplateForm.value.empIdArray);
  }

  checkEmp(empId: any) {
    let data = this.leaveTemplateForm.value.empIdArray;

    let index = data.findIndex((ob1: any) => ob1 == empId);

    if (index == -1) {
      data.push(empId);
    } else {
      data.splice(index, 1);
    }

    this.leaveTemplateForm.patchValue({
      empIdArray: data
    })

    console.log(this.leaveTemplateForm.value.empIdArray);

  }


  updateLeaveTemplate() {
    let data = this.leaveTemplateForm.value;
    if (this.leaveTemplateForm.valid) {

      // console.log({
      //   'leaveTemplate': new Array(data.leavetemplate_text),
      //   'customerAccountId': this.tp_account_id.toString(),
      //   'productTypeId': this.product_type.toString(),
      //   'empIdArray': data.empIdArray,
      //   'templateId': data.leavetemplate_text.templateid,
      //   'effectiveDate': data.effective_dt
      // });
      this._EmployeeService.bulkEmployeeLeaveTemplate_hub({
        'leaveTemplate': new Array(data.leavetemplate_text),
        'customerAccountId': this.tp_account_id.toString(),
        'productTypeId': this.product_type.toString(),
        'empIdArray': data.empIdArray,
        'templateId': data.leavetemplate_text.templateid,
        'effectiveDate': data.effective_dt
      })
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            this.toastr.success(resData.message, 'Success');
            this.closeChangeTempPopup();

            setTimeout(() => {
              // this.get_employer_today_attendance();
              this.employer_details();

            }, 5000)
          } else {
            this.toastr.error(resData.message, 'Oops!');
            setTimeout(() => {
              // this.get_employer_today_attendance();
              this.employer_details();

            }, 5000)
          }
        })
    } else {
      this.toastr.error('Please fill the required details', 'Oops!');
    }
  }

  // new code below -
  changeEmpFilter(val: any) {
    this.selectedEmpStatus = val;
    this.employer_details();
  }

}
