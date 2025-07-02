import { Component } from '@angular/core';
import { BusinesSettingsService } from '../business-settings.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { EmployeeService } from '../../employee/employee.service';
import { dongleState, grooveState } from 'src/app/app.animation';

declare var $:any;

@Component({
  selector: 'app-settings-notifications',
  templateUrl: './notifications-settings.component.html',
  styleUrls: ['./notifications-settings.component.css'],
  animations: [grooveState, dongleState],
})
export class NotificationsSettingsComponent {

  showSidebar: boolean = false;
  decoded_token: any;
  tp_account_id: any;
  product_type: any;
  alertListData: any = [];
  employee_data: any = [];
  showAssignEmployeePopup: boolean = false;
  selectedAlertList_assignlist: any = [];
  selectedAlertList_index: any;
  alertMasterData: any = [];
  selected_category: any = '';
  showEnableDisablePopup: boolean = false;

  constructor(
    private _BusinesSettingsService: BusinesSettingsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    // private _EmployeeService: EmployeeService,
  ) {}

  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');

    this.get_alert_type_master();
    this.get_alerts_list();
    this.employee_for_alert();
    // this.employer_details();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  // employer_details() {

  //   this._EmployeeService
  //     .employer_details({
  //       customeraccountid: this.tp_account_id.toString(),
  //       productTypeId: this.product_type,
  //       GeoFenceId: this.decoded_token.geo_location_id
  //     })
  //     .subscribe((resData: any) => {
  //       if (resData.statusCode) {
  //         this.employee_data = resData.commonData;
  //       } else {
  //         this.employee_data = [];
  //       }
  //     });
  // }

  employee_for_alert() {
    this._BusinesSettingsService.get_alerts_list({
      action: 'get_all_employee_for_alert',
      accountId: this.tp_account_id.toString(),
      ouIds: this.decoded_token.ouIds
    }).subscribe({
      next: (resData:any) => {
        if (resData.statusCode) {
          this.employee_data = resData.commonData;

        } else {
          this.employee_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.employee_data = [];
        console.log(e);
      }
    })
  }

  get_alert_type_master() {
    this._BusinesSettingsService.get_alert_type_master({
      action: 'get_alert_type',
      accountId: this.tp_account_id.toString(),
      ouIds: this.decoded_token.ouIds
    }).subscribe({
      next: (resData:any) => {
        if (resData.statusCode) {
          this.alertMasterData = resData.commonData;
        } else {
          this.alertMasterData = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.alertMasterData = [];
        console.log(e);
      }
    })
  }

  enable_desable_alert() {
    let data = this.alertListData[this.selectedAlertList_index];
    let assign_emplist = this.selectedAlertList_assignlist.length > 0 ? this.selectedAlertList_assignlist : '';
    // console.log(data);
    // return;

    this._BusinesSettingsService.enable_desable_alert({
      action : 'enable_desable_alert',
      accountId: this.tp_account_id.toString(),
      alerttypeid: data.id,
      assign_employee_type: data.assign_employee_type,
      assign_emplist: assign_emplist,
      alert_category: data.alert_category,
      enable_status: data.enable_status,
      ouIds: this.decoded_token.ouIds
    }).subscribe({
      next: (resData:any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeAssignEmployeePopup();
          this.closeEnableDisablePopup();
          this.get_alerts_list();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  get_alerts_list() {
    this._BusinesSettingsService.get_alerts_list({
      action: 'get_alerts_list',
      accountId: this.tp_account_id.toString(),
      alert_category: this.selected_category,
      ouIds: this.decoded_token.ouIds
    }).subscribe({
      next: (resData:any) => {
        if (resData.statusCode) {
          this.alertListData = resData.commonData;
          this.alertListData.map((el:any) => {
            el['assign_emplist'] = !el['assign_emplist'] ? '' : JSON.parse(el['assign_emplist']);
          })

        } else {
          this.alertListData = [];
          this.toastr.error(resData.message, 'Oops!');
        }
        // console.log(this.alertListData);
      }, error: (e) => {
        this.alertListData = [];
        console.log(e);
      }
    })
  }

  change_assign_emp_type(val:any, idx: any) {
    this.selectedAlertList_index = idx;
    this.alertListData[idx].assign_employee_type = val;
    if (val == 'All') {
      this.enable_desable_alert();
    }
  }

  change_status(e:any, idx:any) {
    this.selectedAlertList_index = idx;
    // let val = e.target.checked ? 'Y' : 'N';
    // this.alertListData[idx].enable_status = val;
    // this.enable_desable_alert();
    this.openEnableDisablePopup();
  }

  ///////////Enable-Disable Popup/////////////
  openEnableDisablePopup() {
    this.showEnableDisablePopup = true;
  }
  saveEnableDisable() {
    let val = this.alertListData[this.selectedAlertList_index].enable_status;
    if (!val) {
      val = 'N'
    }
    let final = val == 'N' ? 'Y' : 'N';
    this.alertListData[this.selectedAlertList_index].enable_status = final;
    this.enable_desable_alert();
    this.showEnableDisablePopup = false;
  }
  closeEnableDisablePopup() {
    this.showEnableDisablePopup = false;
    this.selectedAlertList_index = '';
  }
  closeEnableDisablePopup2() {
    const toggle = document.getElementById(`switch${this.selectedAlertList_index}`) as HTMLInputElement;
    toggle.checked = !toggle.checked;
    // console.log(toggle.checked);
    this.showEnableDisablePopup = false;
    this.selectedAlertList_index = '';
  }

  getEnableDisableTitle() {
    let val = this.alertListData[this.selectedAlertList_index].enable_status;
    if (!val || val == 'N') {
      return 'Enable';
    } else {
      return 'Disable';
    }
  }
  //////////Enable-Disable Popup/////////////


  changeCategory() {
    // console.log(this.selected_category);
    this.get_alerts_list();
  }


  ////////////Assign Employee Popup/////////////////////
  openAssignEmployeePopup(index:any) {
    // console.log(this.alertListData[index].assign_emplist);
    this.selectedAlertList_index = index;
    this.selectedAlertList_assignlist = [];
    this.showAssignEmployeePopup = true;
    const employee_assignlist = !this.alertListData[index].assign_emplist ? [] : this.alertListData[index].assign_emplist;
    this.selectedAlertList_assignlist = employee_assignlist;

  }
  saveAssignEmployeePopup() {
    // console.log(this.selectedAlertList_assignlist);
    this.enable_desable_alert();

  }
  closeAssignEmployeePopup() {
    this.showAssignEmployeePopup = false;
    this.selectedAlertList_assignlist = [];
    this.selectedAlertList_index = '';
  }

  check_emp_all(event: any) {
    if (event.target.checked) {
      this.selectedAlertList_assignlist = this.employee_data.map(employee => ({
        emp_id: employee.emp_id,
        emp_code: employee.emp_code,
        orgempcode: employee.orgempcode,
        emp_name: employee.emp_name
      }));
    } else {
      this.selectedAlertList_assignlist = [];
    }

    $('input[name="check_emp"]').prop('checked', event.target.checked);
    // console.log(this.selectedAlertList_assignlist);
  }

  check_emp(event:any, employee:any){
    const selectedEmployee = {
      emp_id: employee.emp_id,
      emp_code: employee.emp_code,
      orgempcode: employee.orgempcode,
      emp_name: employee.emp_name
    };

    if (event.target.checked) {
      this.selectedAlertList_assignlist.push(selectedEmployee);
    } else {
      this.selectedAlertList_assignlist = this.selectedAlertList_assignlist.filter(emp => emp.emp_id !== employee.emp_id);
    }

    if (this.selectedAlertList_assignlist.length == this.employee_data.length) {
      $('input[name="check_emp_all"]').prop('checked', true);
    }
    // console.log(this.selectedAlertList_assignlist);
  }

  isSelected(employee: any): boolean {
    return this.selectedAlertList_assignlist.some(emp => emp.emp_id === employee.emp_id);
  }
  ////////////Assign Employee Popup/////////////////////

}
