import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { BusinesSettingsService } from '../business-settings.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { EmployeeService } from '../../employee/employee.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-holiday-master',
  templateUrl: './holiday-master.component.html',
  styleUrls: ['./holiday-master.component.css'],
  animations: [grooveState, dongleState]
})
export class HolidayMasterComponent {

  showSidebar: boolean = true;
  newHolidayForm: FormGroup;
  showNewholidayPopup: boolean = false;
  tp_account_id: any;
  decoded_token: any;
  yearsArray: any = [];
  selected_year: any;
  title_holiday_popup: any;
  add_update_holiday_submitted: boolean = false;
  holiday_master_data: any = [];
  holiday_master_data_filterCopy: any = [];
  @ViewChild('hd') hdate: ElementRef;
  state_master_data: any = [];

  sel_status = '';
  sel_state = '';

  stateDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'state',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
  };
  state_array_model: any = [];


  constructor(
    private _formBuilder: FormBuilder,
    private _businesessSettingsService: BusinesSettingsService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _alertservice: AlertService,
    private _employeeService: EmployeeService,
    private route: Router
  ) { }

  ngOnInit() {

    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    const date = new Date();
    let currentYear = date.getFullYear();
    this.selected_year = currentYear;

    for (let i = 2023; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);
    };

    this.newHolidayForm = this._formBuilder.group({
      account_id: [this.tp_account_id.toString()],
      holiday_date: ['01-01-' + this.selected_year, [Validators.required]],
      holiday_name: ['', [Validators.required]],
      holiday_type: [''],
      remark: [''],
      holiday_id: [''],
      state_name: [''],

    });


    this.get_holiday_list();
    this.getStateMaster();

    setTimeout(() => {
      $(function () {
        $('#holiday_date').datepicker({
          dateFormat: 'dd-mm-yy',
          changeMonth: true,
          changeYear: true,
        });
        $('body').on('change', '#holiday_date', function () {
          $('#recdate').trigger('click');
        })
      });
    }, 0);

  }

  ngAfterViewInit() {

    setTimeout(() => {
      $(function () {
        $('#holiday_date').datepicker({
          dateFormat: 'dd-mm-yy',
          changeMonth: true,
          changeYear: true,
        });

      });

      $('body').on('change', '#holiday_date', function () {
        $('#recdate').trigger('click');
      })
    }, 0);
  }

  get hf() {
    return this.newHolidayForm.controls;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_holiday_list() {
    this._businesessSettingsService.manage_holidays_master({
      'action': 'get_holiday_list',
      'account_id': this.tp_account_id.toString(),
      'calender_year': this.selected_year.toString(),

    }).subscribe((resData: any) => {
      this.holiday_master_data_filterCopy = [];
      this.holiday_master_data = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          // this.toastr.info('No data found', 'Info');
          this._alertservice.info('No data found', GlobalConstants.alert_options_autoClose);
          return;
        }
        this.holiday_master_data = resData.commonData;
        this.holiday_master_data.map((el: any) => {
          let x = el.holiday_date.split('-')
          el.holiday_date = x[2] + '-' + x[1] + '-' + x[0]
        })
        //this.holiday_master_data_filterCopy = this.deepCopyArray(this.holiday_master_data);

        this.holiday_master_data_filterCopy = [];

        if (this.sel_status == '') {
          this.holiday_master_data_filterCopy = this.deepCopyArray(this.holiday_master_data);
        }

        if (this.sel_status == '0' || this.sel_status == '1') {
          this.holiday_master_data.map((el: any) => {
            if (el.status == this.sel_status) {
              this.holiday_master_data_filterCopy.push(el);
            }
          });
        } else if (this.sel_status == 'Y' || this.sel_status == 'N') {
          this.holiday_master_data.map((el: any) => {
            if (el.is_verified == this.sel_status) {
              this.holiday_master_data_filterCopy.push(el);
            }
          });
        }


        // console.log(this.holiday_master_data);
      } else {
        // this.toastr.error(resData.message, 'Oops!');
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    })
  }

  add_update_new_holiday(action: any) {

    let data = this.newHolidayForm.value;
    data['action'] = action;
    this.add_update_holiday_submitted = true;

    if (this.newHolidayForm.valid) {
      this._businesessSettingsService.manage_holidays_master(data)
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            this.get_holiday_list();
            this.closeNewHolidayPopup();
            this.toastr.success(resData.commonData.msg, 'Success');

          } else {
            this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          }

        })

    } else {
      // this.toastr.error('Please fill all the required fields', 'Oops!');
      this._alertservice.error('Please fill all the required fields', GlobalConstants.alert_options_autoClose);
    }

  }

  bulk_insert_holiday_master(action: any) {
    let data = this.newHolidayForm.value;
    data['action'] = action;
    this.add_update_holiday_submitted = true;
    console.log(this.state_array_model);

    let state_name = [];
    this.state_array_model.forEach((el: any) => {
      state_name.push(el.state);
    })

    data['state_name'] = state_name;
    // return;

    if (this.newHolidayForm.valid) {
      this._businesessSettingsService.bulk_insert_holiday_master(data)
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            this.get_holiday_list();
            this.closeNewHolidayPopup();
            this.toastr.success(resData.commonData.msg, 'Success');

          } else {
            this.toastr.error(resData.message, 'Oops!');
            this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          }

        })

    } else {
      // this.toastr.error('Please fill all the required fields', 'Oops!');
      this._alertservice.error('Please fill all the required fields', GlobalConstants.alert_options_autoClose);
    }
  }

  changeHolidayDate() {
    // console.log(this.hdate.nativeElement.value);
    this.newHolidayForm.patchValue({
      'holiday_date': this.hdate.nativeElement.value
    })
  }

  changeYear(e: any) {
    this.selected_year = e.target.value;
    this.get_holiday_list();



  }

  changeStatus(e: any) {
    // let val = e.target.value;
    this.sel_status = e.target.value;
    this.holiday_master_data_filterCopy = [];

    if (this.sel_status == '') {
      this.holiday_master_data_filterCopy = this.deepCopyArray(this.holiday_master_data);
    }

    if (this.sel_status == '0' || this.sel_status == '1') {
      this.holiday_master_data.map((el: any) => {
        if (el.status == this.sel_status) {
          this.holiday_master_data_filterCopy.push(el);
        }
      });
    } else if (this.sel_status == 'Y' || this.sel_status == 'N') {
      this.holiday_master_data.map((el: any) => {
        if (el.is_verified == this.sel_status) {
          this.holiday_master_data_filterCopy.push(el);
        }
      });
    }
  }
  changeState(e: any) {
    // let val = e.target.value;
    this.sel_state = e.target.value;
    this.holiday_master_data_filterCopy = [];

    if (this.sel_state == '') {
      this.holiday_master_data_filterCopy = this.deepCopyArray(this.holiday_master_data);
    }

    if (this.sel_state != '' && this.sel_state != null) {
      this.holiday_master_data.map((el: any) => {
        if (el.state_name == this.sel_state) {
          this.holiday_master_data_filterCopy.push(el);
        }
      });
    }
  }

  searchHoliday(e: any) {
    let key = e.target.value.toLowerCase();

    this.holiday_master_data_filterCopy = [];

    this.holiday_master_data.map((el: any) => {
      if (el.holiday_name.toString().toLowerCase().includes(key) ||
        el.holiday_date.toLowerCase().includes(key)) {
        this.holiday_master_data_filterCopy.push(el);
      }
    })
    // console.log(key);

    if (key == '') {
      this.holiday_master_data_filterCopy = this.deepCopyArray(this.holiday_master_data);
    }

  }

  open_add_new_holiday_popup() {
    this.showNewholidayPopup = true;
    this.state_array_model = [];
    this.title_holiday_popup = 'Add New Holiday';

  }

  employee_holiday_mapping() {
    this.route.navigate(['/leave-mgmt/bulk-holiday']);

  }
  open_update_holiday_popup(data: any) {
    this.showNewholidayPopup = true;
    this.title_holiday_popup = 'Update Holiday';

    this.newHolidayForm.patchValue({
      holiday_id: data.holiday_id,
      holiday_date: data.holiday_date,
      holiday_name: data.holiday_name,
      holiday_type: !data.holiday_type ? '' : data.holiday_type,
      remark: data.remark,
      state_name: data.state_name,
    });
  }
  open_verify_holiday_popup(data: any) {
    this.showNewholidayPopup = true;
    this.title_holiday_popup = 'Are you sure you want to verify this holiday?';
    let ele = document.getElementById("remarktext") as HTMLTextAreaElement
    ele.readOnly = true;

    this.newHolidayForm.patchValue({
      holiday_id: data.holiday_id,
      holiday_date: data.holiday_date,
      holiday_name: data.holiday_name,
      holiday_type: !data.holiday_type ? '' : data.holiday_type,
      remark: data.remark,
      state_name: data.state_name,
    });
  }
  open_inactive_holiday_popup(data: any) {
    this.showNewholidayPopup = true;
    this.title_holiday_popup = 'Are you sure you want to Remove this holiday?';
    let ele = document.getElementById("remarktext") as HTMLTextAreaElement
    ele.readOnly = true;

    this.newHolidayForm.patchValue({
      holiday_id: data.holiday_id,
      holiday_date: data.holiday_date,
      holiday_name: data.holiday_name,
      holiday_type: !data.holiday_type ? '' : data.holiday_type,
      remark: data.remark,
      state_name: data.state_name,
    });
  }

  closeNewHolidayPopup() {
    this.showNewholidayPopup = false;
    this.add_update_holiday_submitted = false;
    let ele = document.getElementById("remarktext") as HTMLTextAreaElement
    ele.readOnly = false;

    this.newHolidayForm.patchValue({
      holiday_id: '',
      holiday_date: '01-01-' + this.selected_year,
      holiday_name: '',
      holiday_type: '',
      remark: '',
      state_name: '',
    })
    this.state_array_model = [];
  }

  getStateMaster() {
    this._employeeService.getAll_Holiday_state({
      'action': 'get_holiday_state_unit',
      'account_id': this.tp_account_id
    })
      .subscribe({
        next: (resData: any) => {
          console.log(resData);
          if (resData.statusCode) {
            // Filter out records where the state contains "Zone"
            this.state_master_data = resData.commonData.filter(
              (state: any) => !state.state.toLowerCase().includes("zone")
            );
          } else {
            this.state_master_data = [];
          }
        },
        error: (e) => {
          this.state_master_data = [];
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

  public accountClass(hmd: any): string {

    // 'verified-holiday': (hmd.is_verified=='Y' && hmd.holiday_type=='Public'),'verified-holiday-rh':
    //                    (hmd.is_verified=='Y' && hmd.holiday_type=='Restricted'), 'inactive-holiday': hmd.status=='0'
    if (this.tp_account_id == '653' || this.tp_account_id == '6927') {
      if (hmd.is_verified == 'Y' && hmd.holiday_type == 'Public') {
        return 'verified-holiday';
      }
      else if (hmd.is_verified == 'Y' && hmd.holiday_type == 'Restricted') {
        return 'verified-holiday-rh';
      }

      else if (hmd.status == '0') {
        return 'inactive-holiday';
      }
      else {
        return '';
      }

    } else {     
        if (hmd.is_verified == 'Y' && hmd.holiday_type == 'Public') {
          return 'verified-holiday-spl';
        }
        else if (hmd.is_verified == 'Y' && hmd.holiday_type == 'Restricted') {
          return 'verified-holiday-rh-spl';
        }
  
        else if (hmd.status == '0') {
          return 'inactive-holiday';
        }
        else {
          return '';
        }
      }
    

  }
  /**Deep Copy**/

}
//this.tp_account_id == '6927'