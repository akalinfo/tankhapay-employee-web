import { Component, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { EmployeeService } from '../employee.service';
import decode from 'jwt-decode';
declare var $: any;
@Component({
  selector: 'app-bulk-suspend',
  templateUrl: './bulk-suspend.component.html',
  styleUrls: ['./bulk-suspend.component.css']
})
export class BulkSuspendComponent {
  showSidebar: boolean = true;
  payout_method: any;
  accessRights: any = {};
  status_filter: any = '';
  js_id: any = '';
  product_type_array: any[];
  token: any = ''
  employer_id: string = '';
  exit_employee_form: FormGroup;
  Remove_Employee_form: FormGroup;
  product_type: any;
  product_type_text: any;
  employee_data: any = [];
  emp_json_data: any = [];
  searchKeyword = '';
  Employees: any = [];
  tp_account_id: any = '';
  show_product_type_dropdown: boolean = false;
  header_checkbox: boolean = false;
  message:any;
  constructor(
    private _SessionService: SessionService,
    private _EmployeeService: EmployeeService,
    private router: Router,
    public toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private _BusinesSettingsService: BusinesSettingsService,
    private _masterService: MasterServiceService
  ) {
  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.employer_id = this.token.id;
    this.payout_method = this.token.payout_mode_type;

    this.accessRights = this._masterService.checkAccessRights(window.location.pathname)

    this.product_type_text = this.product_type == '1' ? 'Social Security' : this.product_type == '2' ? 'Payrolling' : '';
    this.product_type_array = [];
    if (this.token['product_type'] == '1,2') {
      this.show_product_type_dropdown = true;
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }
    if (this.token['product_type'] == '1') {
      this.product_type_array.push({ 'product_type_id': '1', 'product_type': 'Social Security' });

    }
    if (this.token['product_type'] == '2') {
      this.product_type_array.push({ 'product_type_id': '2', 'product_type': 'Payrolling' });
    }

    $('#dateofrelieveing').datepicker({
      dateFormat: 'dd-mm-yy',
      changeMonth: true,
      changeYear: true,
    });

    this.exit_employee_form = this._formBuilder.group({
      exit_remark: [''],
      exit_date: ['']
    });

    this.employer_details();
    
  }
  
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  selectAll(event: any) {
    this.header_checkbox = event.target.checked;
    if (this.header_checkbox) {
      // Select all rows based on a condition (e.g., status === 'pending')
      this.emp_json_data.forEach(row => row.isSelected = true);
    } else {
      // Deselect all rows
      this.emp_json_data.forEach(row => row.isSelected = false);
    }

  }
  onCheckbox_Change(event: any, row: any, index: any) {
    row.isSelected = event.target.checked;
    // Check if all rows are selected or not
    this.header_checkbox = this.emp_json_data.every(row => row.isSelected);
  }

  employer_details() {
    this._EmployeeService
      .employer_details({
        customeraccountid: this.tp_account_id.toString(),
        productTypeId: this.product_type,
        GeoFenceId: this.token.geo_location_id
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.employee_data = resData.commonData;
          
          // Filter employees to exclude those with joiningstatus "Relieved"
          this.emp_json_data = this.employee_data.filter((employee: any) => 
            employee.joiningstatus=="Active"
          );
  
          console.log(this.emp_json_data);
        
        }
      });
  }


  confirmation(){
    this.message = window.confirm('Are you sure, you want to suspend these employees?.');
    
    if(this.message){
      this.Bulk_Suspend_Emp();
    }
    else{
      window.close();
    }
  }

  Bulk_Suspend_Emp() {
    // if (this.token.isEmployer != '1' && !this.accessRights.Add && !this.accessRights.Edit) {
    //   return this.toastr.error("You do not have the permission for this.");
    // }

    this.emp_json_data.forEach((employee, index) => {
      if (employee.isSelected) {
    
        let ts = Date.now();

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
    
        let a = (date + "/" + month + "/" + year);

        this._EmployeeService.updateEmployeeStatus({
          "customeraccountid": (this.token.tp_account_id)?.toString(),
          "empcode": employee.emp_code,
          "status": "Paused",
          "exit_date": a,
          "remarks": "", // Assuming exit_remark is bound to each employee in the template
          "productTypeId": this.product_type
        }).subscribe((resData: any) => {
          if (resData.statusCode) {
            this.toastr.success(resData.message, 'Success');
            employee.isSelected = false;
            this.header_checkbox=false;

            this.employer_details(); // Assuming a method to refresh employee details
          } else {
            this.toastr.error(resData.message, 'Error');
          }
        });
      }
    });
    
  }

}
