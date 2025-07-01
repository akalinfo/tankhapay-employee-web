import { Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import decode from 'jwt-decode';
declare var $: any;
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { EmployeeService } from '../employee.service';
declare var $: any;

@Component({
  selector: 'app-bulk-exit',
  templateUrl: './bulk-exit.component.html',
  styleUrls: ['./bulk-exit.component.css']
})
export class BulkExitComponent {
  showSidebar: boolean = true;
  bulk_Confirm_popup:boolean=false;
  checkbox_Confirm_popup:boolean=false;
  p: number = 0;
  invKey:any;
  filteredEmployees: any=[];
  // isPopupVisible:boolean=false;
  open_exit_popup:boolean=false;
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
  selectedExitDateOption: string = '';
  show_product_type_dropdown: boolean = false;
  header_checkbox: boolean = false;
  message:any;
  isRelievingDateSelected: boolean = false;
  selectedCount: number = 0;
  @ViewChild('rd') rdate: ElementRef;
  @ViewChildren('dateInput') dateInputs: QueryList<ElementRef>; 
  constructor(
    private _SessionService: SessionService,
    private _EmployeeService: EmployeeService,
    private router: Router,
    public toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private renderer: Renderer2,
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

    $('#date_of_relieveing').datepicker({
      dateFormat: 'dd-mm-yy',
      changeMonth: true,
      changeYear: true,
      maxDate: new Date(),
      onSelect: (dateText: string) => {
        this.onDateChange({ target: { value: dateText } });
      }
    });
    this.isRelievingDateSelected = false;
    this.exit_employee_form = this._formBuilder.group({
      exit_remark:  ['', Validators.required],
      exit_date: ['', Validators.required]
    });

    this.employer_details();
    
  }

  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.dateInputs.forEach((input, index) => {
        if ($(input.nativeElement).hasClass('datepicker-input')) {
          $(input.nativeElement).datepicker({
            dateFormat: 'dd-mm-yy',
            changeMonth: true,
            changeYear: true,
            defaultDate: new Date(),
            maxDate: new Date(),
            beforeShow: function(input, inst) {
              setTimeout(function() {
                const container = $(input).closest('.datepicker-container');
                inst.dpDiv.css({
                  top: container.offset()?.top + container.outerHeight(),
                  left: container.offset()?.left
                });
              }, 0);
            }
          });
        }
      });
    });
  }
  
  open_bulk_Confirm_popup(){
    this.bulk_Confirm_popup=true;
    this.isRelievingDateSelected = false;
  }

  close_bulk_Confirm_popup(){
    this.bulk_Confirm_popup=false;
    this.isRelievingDateSelected = false;
    this.exit_employee_form.reset();
  }
  open_checkbox_Confirm_popup() {
    let isValid = true;
  
    this.emp_json_data.forEach((employee, index) => {
      if (employee.isSelected) {
        let selectedDateStr = this.dateInputs.toArray()[index]?.nativeElement.value;
        if (!selectedDateStr) {
          this.toastr.error(`Please enter exit date for selected employee`, 'Validation Error');
          isValid = false;
        } else {
          employee.exit_date = selectedDateStr;
        }
      }
    });
  
    if (isValid) {
      this.checkbox_Confirm_popup = true; // Open the confirmation popup
    }
  }

close_checkbox_Confirm_popup(){
  this.checkbox_Confirm_popup=false;
}
  get c() {
    return this.exit_employee_form.controls;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  // onExitDateOptionChange(option: string) {
  //   this.selectedExitDateOption = option;

  //   if (option === 'same') {
  //     this.isPopupVisible = false;
  //     this.employer_details();
  //     this.open_exit_popup=true;
  //   } else if (option === 'different') {
  //     this.isPopupVisible = true;
  //     this.open_exit_popup = false;
  //   }
  // }
  open_bulk_exit_popup(){
    this.open_exit_popup=true;
  }
  close_popup(){
    this.open_exit_popup=false;
    this.exit_employee_form.patchValue({
      exit_remark: '',
      exit_date: ''
    });
    this.selectedExitDateOption='';
    this.close_bulk_Confirm_popup();
  }
  onDateChange(event: any) {
    const selectedDate = event.target.value;
    this.isRelievingDateSelected = !!selectedDate; // Set to true if date is selected, otherwise false
  }
  submitExitForm() {
    const relievingDate = $('#date_of_relieveing').val();
    const remarks = this.exit_employee_form.get('exit_remark')?.value || '';
  
    if (!relievingDate) {
      this.toastr.error('Please select a relieving date.', 'Validation Error');
      return;
    }
  
    const selectedEmployees = this.emp_json_data.filter(employee => employee.isSelected);
    const totalSelectedEmployees = selectedEmployees.length;
    let processedCount = 0;
  
    selectedEmployees.forEach(employee => {
      this._EmployeeService.updateEmployeeStatus({
        customeraccountid: this.tp_account_id.toString(),
        empcode: employee.emp_code,
        status: 'Inactive',
        exit_date: relievingDate,
        remarks: remarks,
        productTypeId: this.product_type
      }).subscribe((resData: any) => {
        processedCount++;
  
        if (resData.statusCode) {
          if (processedCount === totalSelectedEmployees) {
            this.close_popup();
            this.close_bulk_Confirm_popup();
            this.toastr.success(resData.message, 'Success');
          }
        } else {
          if (processedCount === totalSelectedEmployees) {
            this.toastr.error(resData.message, 'Error');
          }
        }
  
        if (processedCount === totalSelectedEmployees) {
          this.employer_details();
        }
      });
    });
  }
  

  selectAll(event: any) {
    this.header_checkbox = event.target.checked;

    if (this.header_checkbox) {
      // Select all rows and update the selected count
      this.emp_json_data.forEach(row => row.isSelected = true);
      this.selectedCount = this.emp_json_data.length;
    } else {
      // Deselect all rows and reset the selected count
      this.emp_json_data.forEach(row => row.isSelected = false);
      this.selectedCount = 0;
    }
  }
  
  onCheckbox_Change(event: any, row: any, index: any) {
    row.isSelected = event.target.checked;
    
    // Update the selected count
    if (row.isSelected) {
      this.selectedCount++;
    } else {
      this.selectedCount--;
    }
  
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
          this.emp_json_data = this.employee_data.filter((employee: any) => employee.joiningstatus=="Active" );
          this.filteredEmployees=this.emp_json_data;

          if (this.emp_json_data.length == 0) {
            setTimeout(() => {
              this.toastr.error('No Active Employee for this Employer', 'Oops!');
            }, 1000);
          }
        }

      });
  }
  search(key: any) {
    this.invKey = key.target.value;
    this.p = 0;
    this.filteredEmployees = this.emp_json_data.filter(function (element: any) {
      return (element.emp_name.toLowerCase().includes(key.target.value.toLowerCase())  || element.tpcode.toString().toLowerCase().includes(key.target.value.toLowerCase())
        || element.orgempcode.toString().toLowerCase().includes(key.target.value.toLowerCase()) || element.mobile.toString().toLowerCase().includes(key.target.value.toLowerCase())
      )
    });
  }
  // confirmation(){

  //   this.message = window.confirm('Are you sure, you want to exit these employees?.');
    
  //   if(this.message){
  //     this.Bulk_Exit_Emp();
  //   }
  //   else{
  //     window.close();
  //   }
  // }

  Bulk_Exit_Emp() {
    let isValid = true;

    this.emp_json_data.forEach((employee, index) => {
      if (employee.isSelected) {
        let selectedDateStr = this.dateInputs.toArray()[index]?.nativeElement.value;
        if (!selectedDateStr) {
          this.toastr.error(`Please enter exit date for seleceted employee`, 'Validation Error');
          isValid = false;
        } else {
          employee.exit_date = selectedDateStr;
        }
      }
    });

    if (!isValid) {
      return;
    }

    this.emp_json_data.forEach((employee, index) => {
      if (employee.isSelected) {
        this._EmployeeService.updateEmployeeStatus({
          "customeraccountid": (this.tp_account_id)?.toString(),
          "empcode": employee.emp_code,
          "status": "Inactive",
          "exit_date": employee.exit_date,
          "remarks": employee.exit_remark,
          "productTypeId": this.product_type
        }).subscribe((resData: any) => {
          if (resData.statusCode) {
            this.toastr.success(resData.message, 'Success');
            employee.isSelected = false;
            this.header_checkbox = false;
            this.exit_employee_form.patchValue({
              exit_remark: '',
              exit_date: ''
            });
           this.close_checkbox_Confirm_popup();
            this.employer_details(); // Assuming a method to refresh employee details
          } else {
            this.toastr.error(resData.message, 'Error');
          }
        });
      }
    });
  }

}
