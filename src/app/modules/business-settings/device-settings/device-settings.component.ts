import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { BusinesSettingsService } from '../business-settings.service';
import { ToastrService } from 'ngx-toastr';
import jwtDecode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';

@Component({
  selector: 'app-device-settings',
  templateUrl: './device-settings.component.html',
  styleUrls: ['./device-settings.component.css'],
  animations: [grooveState, dongleState]
})
export class DeviceSettingsComponent {

  showSidebar: boolean = true;
  deviceForm: FormGroup;
  showNewDevicePopup: boolean = false;
  decoded_token: any;
  tp_account_id: any;
  device_master_data: any = [];
  device_master_data_filterCopy: any = [];
  device_popup_title:any = '';
  add_update_device_submitted: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private _businessSettingsService: BusinesSettingsService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _alertservice: AlertService
  ) {

  }

  ngOnInit() {

    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;

    this.deviceForm = this._formBuilder.group({
      machine_serial_no: ['', [Validators.required]],
      machine_ip: ['', [Validators.required]],
      machine_location: ['', [Validators.required]],
      remark: [''],
      raw_id: [''],
      punch_type:['both', [Validators.required]]

    });


    this.get_business_device();
    // console.log(this.df);
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get df() {
    return this.deviceForm.controls;
  }

  changePage(e: any) {

  }

  searchDevice(e: any) {
    let key = e.target.value.toLowerCase();

    this.device_master_data_filterCopy = [];

    this.device_master_data.map((el: any) => {
      if (el.machine_serial_no.toString().toLowerCase().includes(key) ||
        el.machine_location.toLowerCase().includes(key) ||
        (el.modify_by != null ? el.modify_by.toLowerCase() : '').includes(key)
        ) {
        this.device_master_data_filterCopy.push(el);
      }
    })
    // console.log(key);

    if (key == '') {
      this.device_master_data_filterCopy = this.deepCopyArray(this.device_master_data);
    }

  }

  /**Update Device**/
  open_update_device_popup(data:any) {
    this.showNewDevicePopup = true;
    this.device_popup_title = 'Update Device';

    this.deviceForm.patchValue({
      'machine_serial_no': data.machine_serial_no,
      'machine_location': data.machine_location,
      'machine_ip': data.machine_ip,
      'punch_type': data.punch_type,
      'remark': data.remark != null ? data.remark : '',
      'raw_id': data.raw_id,
    })

  }

  update_business_device_by_id() {
    let data = this.deviceForm.value;
    data['account_id'] = this.tp_account_id.toString();
    this.add_update_device_submitted = true;

    if (this.deviceForm.valid) {
      this._businessSettingsService.update_business_device_by_id(data)
      .subscribe((resData:any) => {
        if (resData.statusCode) {
          this.closeNewDevicePopup();
          this.get_business_device();

          this.toastr.success(resData.message, 'Success');
        } else {
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      })
    } else {
      // this.toastr.error('Please fill all the required fields', 'Oops!');
      this._alertservice.error('Please fill all the required fields', GlobalConstants.alert_options_autoClose);
    }
  }
  /**Update Device**/

  /**Add Device**/
  open_add_new_device_popup() {
    this.showNewDevicePopup = true;
    this.device_popup_title = 'Add New Device';

    this.deviceForm.patchValue({
      'machine_serial_no': '',
      'machine_location': '',
      'machine_ip': '',
      'remark': '',
      'punch_type':'both',
      'raw_id': '',
    })
  }

  insert_business_device() {
    let data = this.deviceForm.value;
    data['account_id'] = this.tp_account_id.toString();
    this.add_update_device_submitted = true;

    if (this.deviceForm.valid) {
      this._businessSettingsService.insert_business_device(data)
      .subscribe((resData:any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeNewDevicePopup();
          this.get_business_device();

        } else {
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      })

    } else {
      // this.toastr.error('Please fill all the required fields', 'Oops!');
      this._alertservice.error('Please fill all the required fields', GlobalConstants.alert_options_autoClose);
    }
  }

  closeNewDevicePopup() {
    this.showNewDevicePopup = false;
    this.add_update_device_submitted = false;
    let ele = document.getElementById("remarktext") as HTMLTextAreaElement
    ele.readOnly = false;

    this.deviceForm.patchValue({
      'machine_serial_no': '',
      'machine_location': '',
      'machine_ip': '',
      'remark': '', 
      'punch_type':'both',
      'raw_id': '',
    })
  }
  /**Add Device**/


  /**Verify Device**/
  open_verify_device_popup(data:any) {
    this.showNewDevicePopup = true;
    this.device_popup_title = 'Are you sure you want to verify this device?';
    let ele = document.getElementById("remarktext") as HTMLTextAreaElement
    ele.readOnly = true;

    this.deviceForm.patchValue({
      'machine_serial_no': data.machine_serial_no,
      'machine_location': data.machine_location,
      'machine_ip': data.machine_ip,
      'remark': data.remark != null ? data.remark : '',
      'punch_type':data.punch_type,
      'raw_id': data.raw_id,
    })
  }
  open_inactive_device_popup(data:any) {
    this.showNewDevicePopup = true;
    this.device_popup_title = 'Are you sure you want to Inactive this device?';
    let ele = document.getElementById("remarktext") as HTMLTextAreaElement
    ele.readOnly = true;

    this.deviceForm.patchValue({
      'machine_serial_no': data.machine_serial_no,
      'machine_location': data.machine_location,
      'machine_ip': data.machine_ip,
      'remark': data.remark != null ? data.remark : '',
      'punch_type':data.punch_type,
      'raw_id': data.raw_id,
    })
  }
  /**Verify Device**/


  get_business_device() {
    this._businessSettingsService.get_business_device({
      'action': 'get_business_device',
      'account_id': this.tp_account_id.toString(),
    })
      .subscribe((resData: any) => {
        this.device_master_data = [];
        this.device_master_data_filterCopy = [];

        if (resData.statusCode) {

          this.device_master_data = resData.commonData;
          this.device_master_data_filterCopy = this.deepCopyArray(this.device_master_data);

        } else {
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      })
  }

  changeStatus(e:any) {
    let val = e.target.value;
    this.device_master_data_filterCopy = [];

    if (val == '') {
      this.device_master_data_filterCopy = this.deepCopyArray(this.device_master_data);
    }

    if (val == 0 || val == 1) {
      this.device_master_data.map((el:any) => {
        if (el.status == val) {
          this.device_master_data_filterCopy.push(el);
        }
      });
    } else if (val == 'Y' || val == 'N') {
      this.device_master_data.map((el:any) => {
        if (el.is_verified == val) {
          this.device_master_data_filterCopy.push(el);
        }
      });
    }
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

  manage_business_device(action:any) {
    let data = this.deviceForm.value;
    data['action'] = action;
    data['account_id'] = this.tp_account_id.toString();
    this.add_update_device_submitted = true;

    if (this.deviceForm.valid) {
      this._businessSettingsService.manage_business_device(data)
      .subscribe((resData:any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeNewDevicePopup();
          this.get_business_device();
        } else {
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        }
      })

    } else {
      // this.toastr.error('Please fill all the required fields', 'Oops!');
      this._alertservice.error('Please fill all the required fields', GlobalConstants.alert_options_autoClose);
    }
  }

}
