// compoff-eligibility.component.ts
import { DatePipe } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { EmployeeLoginService } from '../employee-login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as moment from 'moment';
import { log } from '@tensorflow/tfjs';

declare var $: any;

@Component({
  selector: 'app-wfh-request',
  templateUrl: './wfh-request.component.html',
  styleUrls: ['./wfh-request.component.css'],
  providers: [DatePipe]
})
export class WfhRequestComponent {
  addWFHForm!: FormGroup;
  public appraisalCycleForm:FormGroup;
  compOffRequests: any[] = []; // Sample data, replace with your actual data
  wfhRequests: any[] = []; // Sample data, replace with your actual data
  isViewWFH: boolean = false;

  @ViewChild('popoverStart') popoverStart!: PopoverDirective;  // Correct type
  @ViewChild('popoverEnd') popoverEnd!: PopoverDirective;  // Correct type

  startTime: any;
  endTime: any;
  wfh_title: any = '';
  emp_id: any;
  decoded_token: any;
  tp_account_id: any;
  product_type: any;
  @Input() empDataFromParent: any;
  statusFilter: any = 'All';
  showSidebar: boolean;
  isDataLoaded: any = true;
  wfh_applid: any;
  isWfhFormValid: boolean;

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private _employeeLoginService: EmployeeLoginService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _encrypterService: EncrypterService,
  ) { }

  ngOnInit(): void {

    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.emp_id = this.decoded_token?.id;
    this.empDataFromParent = JSON.parse(localStorage.getItem('empDataFromParent'));
   
    this.addWFHForm = this.fb.group({
      wfh_fromDate: ['',Validators.required],
      wfh_toDate: ['',Validators.required],
      reason: ['', Validators.required],
      status: ['Pending'], // Initial status
      data: [''],
      name: [''],
      attachment_url: ['']
    });    

  }

  ngAfterViewInit() {

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date());

      $('#ToDate').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', new Date());

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });

      this.getWFHRequest();

    }, 100);

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  filterFromToDateRequests(fromDateId: string, toDateId: string) {
    this.isWfhFormValid = true;
    let fromDate = $(`#${fromDateId}`).val();
    let toDate = $(`#${toDateId}`).val();

    // Check if both dates have values
    if (!fromDate || !toDate) {
      console.log('One of the dates is missing, skipping validation');
      return;
    }

    let formatted_fromDate = moment(fromDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
    let formatted_toDate = moment(toDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
 
    // Get the current month's start and end dates
    const currentMonthStart = moment().startOf('month').format('YYYY-MM-DD'); 
    const currentMonthEnd = moment().endOf('month').format('YYYY-MM-DD'); 
    const errMsgStart = moment().startOf('month').format('DD-MM-YYYY'); 
    const errMsgEnd = moment().endOf('month').format('DD-MM-YYYY'); 
     
    // Validate that the dates are within the current month's range
    if (new Date(formatted_fromDate) < new Date(currentMonthStart) || new Date(formatted_fromDate) > new Date(currentMonthEnd)) {
      this.toastr.error(`From date must be between ${errMsgStart} and ${errMsgEnd}`, 'Oops!');
      this.isWfhFormValid = false;
      return;
    }

    if (new Date(formatted_toDate) < new Date(currentMonthStart) || new Date(formatted_toDate) > new Date(currentMonthEnd)) {
      this.toastr.error(`To date must be between ${errMsgStart} and ${errMsgEnd}`, 'Oops!');
      this.isWfhFormValid = false;
      return;
    }

   if (new Date(formatted_toDate) >= new Date(formatted_fromDate)) {
      this.getWFHRequest();
    } else {
      this.toastr.error("From date should be less than or equal to the To date", 'Oops!');
      this.isWfhFormValid = false;
      return;
    }

  }

  getCurrentTime(): Date {
    const now = new Date();
    return new Date(0, 0, 0, now.getHours(), now.getMinutes());
  }

  // Add WFH Request
  openAddWFHRequestModal() {
    this.isViewWFH = false; // Ensure it's in add mode
    this.addWFHForm.reset(); // Clear the form
    this.wfh_title = 'Add';

    this.intialize_date_worked('');

    // ... (Show the modal - implementation depends on your modal library) ...
    const modal = document.getElementById('addWFHModal')!;
    modal.classList.add("show"); // Add these two lines.
    modal.style.display = "block";

  }


  // Update WFH Request
  openUpdateWFHRequestModal(data:any) {
    
    this.isViewWFH = false;
    this.wfh_title = 'Update';

    this.intialize_date_worked(data.wfh_applied_date);

    let attachment_url = !data.attachemnt_url ? '' : data.attachemnt_url;
   
    this.addWFHForm.patchValue({
      wfh_applid: data.comp_applid,
      attachment_url: attachment_url,
      reason: data.compoff_description,
      status: data.approval_status,
    })

    const modal = document.getElementById('addWFHModal')!;
    modal.classList.add("show");
    modal.style.display = "block";
  }

  // Remove WFH Modal
  openRemoveWFHRequestModal(data:any) {
    this.isViewWFH = true;
    this.wfh_title = 'Remove';
    this.wfh_applid = data?.wfh_applid;
    this.intialize_date_worked(data?.fromdate,data?.todate);
    this.addWFHForm.get('wfh_fromDate')?.setValue(data?.fromdate);
    this.addWFHForm.get('wfh_toDate')?.setValue(data?.todate);

    if (this.isViewWFH) {
    } else {
    }

    let attachment_url = !data.attachemnt_url ? '' : data.attachemnt_url;

    this.addWFHForm.patchValue({
      attachment_url: attachment_url,
      reason: data.wfh_description,
      status: data.approval_status,
      data: '',
      name: '',
    })

    const modal = document.getElementById('addWFHModal')!;
    modal.classList.add("show");
    modal.style.display = "block";

  }

  // Hide WFH Modal
  hideAddWFHRequestModal() {
    const modal = document.getElementById('addWFHModal')!;
    modal.classList.remove("show"); // Add these two lines.
    modal.style.display = "none";
    this.addWFHForm.patchValue({
      attachment_url: '',
    })
    this.addWFHForm.reset();
    

  }

  // View WFH Request
  viewWFHRequest(data: any) {
    this.isViewWFH = true;
    this.wfh_title = 'View';

    this.intialize_date_worked(data?.fromdate,data?.todate);
    this.addWFHForm.get('wfh_fromDate')?.setValue(data?.fromdate);
    this.addWFHForm.get('wfh_toDate')?.setValue(data?.todate);

    if (this.isViewWFH) {
    } else {
    }

    let attachment_url = !data.attachemnt_url ? '' : data.attachemnt_url;

    this.addWFHForm.patchValue({ 
      attachment_url: attachment_url,
      reason: data.wfh_description,
      status: data.approval_status,
      data: '',
      name: '',
    })

    const modal = document.getElementById('addWFHModal')!;
    modal.classList.add("show");
    modal.style.display = "block";
  }


  togglePopover(popover: any) {
     if (popover.isOpen) {
       popover.hide();
     } else {
       popover.show();
     }
   }

  // On File Change
  readFile(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      let fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.addWFHForm.patchValue({
          name: fileName,
          data: reader.result.toString().split(',')[1]
        })
      };

      reader.readAsDataURL(file);
    }
  }

  // Upload Document
  uploadWFHDocument() {
    let formData = this.addWFHForm.value;
    // console.log("formData",formData);

    if (!formData.data) {
      this.saveWFHRequest();
      return;
    }

    this._employeeLoginService.uploadWFHDocument({
      'data': formData.data,
      'name': formData.name,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.addWFHForm.patchValue({
            attachment_url: resData.filePath
          })
          this.saveWFHRequest();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  // Create WFH Application
  saveWFHRequest() {

    if (this.addWFHForm.invalid){
        this.addWFHForm.markAllAsTouched();
        // const invalidControls = this.getInvalidControls();
        // console.log('Invalid Controls:', invalidControls);
        this.toastr.error("Please fill all the mandatory fields!");
        return;
    }

    if(this.isWfhFormValid == false){
      this.filterFromToDateRequests('wfh_fromDate','wfh_toDate');
      return;
    }
    
    let action = '';

    if (this.wfh_title == 'Add') {
      action = 'apply_wfh_application';
    } else if (this.wfh_title == 'Remove') {
      action ='remove_wfh_appl';
    }


    let createdby = '';
    if (this.decoded_token.isEmployer == '0') {
      createdby = this.empDataFromParent?.emp_code?.toString()
    } else {
      createdby = this.tp_account_id?.toString();
    }


    let wfh_fromDate = $('#wfh_fromDate').val();
    let wfh_toDate = $('#wfh_toDate').val();

    // Using moment to generate dates in between
    const start = moment(wfh_fromDate, "DD-MM-YYYY");
    const end = moment(wfh_toDate, "DD-MM-YYYY");

    const wfh_data = [];

    while (start <= end) {
      wfh_data.push({ wfh_applied_date: start.format("DD-MM-YYYY") });
      start.add(1, 'days');
    }
   

    let obj = {

      action: action,
      accountid: this.tp_account_id?.toString(),
      emp_id: this.emp_id,
      wfhAppliedId:(action == 'remove_wfh_appl')? this.wfh_applid?.toString(): '',
      fromdate: wfh_fromDate,
      todate: wfh_toDate,
      wfh_description: this.addWFHForm?.value?.reason?.trim(),
      wfh_detail_data: JSON.stringify(wfh_data),
      attachment_url: this.addWFHForm?.value?.attachment_url,
      createdby: createdby || this.tp_account_id?.toString()
    }

    this._employeeLoginService.manageWFHRequest(obj).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.addWFHForm.reset();
          this.hideAddWFHRequestModal();
          this.getWFHRequest();
          this.addWFHForm.patchValue({
            attachment_url: ''
          })
          this.clear_file();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Error');
        }
      }
    })
  }

  // Read WFH Requests
  getWFHRequest() {

    let obj = {
      action: "get_wfh_appl_filter",
      accountid: this.tp_account_id.toString(),
      emp_id: this.emp_id,
      fromdate: $('#FromDate').val(),
      todate: $('#ToDate').val(),
      approval_status: this.statusFilter
    }
    
    this._employeeLoginService.manageWFHRequest(obj).subscribe({
      next: (resData: any) => {
        this.wfhRequests = [];
        if (resData.statusCode) {          
          this.wfhRequests = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          console.log(this.wfhRequests);
        } else {
          console.log(resData.message);
          // this.toastr.error(resData.message, 'Error');
        }
      }
    })
  }


  // Utility Functions
  intialize_date_worked(fromdate:any, todate?:any) {
     
      let setFromDate:any = '';
      let setToDate:any = '';

      if (fromdate && todate) {

      let f_split_dt = fromdate.split('-');
      let f_split_dt_final = f_split_dt[2] + '-' + f_split_dt[1] + '-' + f_split_dt[0];
      setFromDate = new Date(f_split_dt_final);

      let t_split_dt = fromdate.split('-');
      let t_split_dt_final = t_split_dt[2] + '-' + t_split_dt[1] + '-' + t_split_dt[0];
      setToDate = new Date(t_split_dt_final);

      }

      setTimeout(() => {
        const component = this;

        $('#wfh_fromDate').datepicker({
          dateFormat: 'dd-mm-yy',
          changeMonth: true,
          changeYear: true,
          // maxDate: 0,
          onSelect: function(dateText) {
            component.addWFHForm.get('wfh_fromDate')?.setValue(dateText);
            $('#wfhdates').trigger('click'); // Trigger manually within `onSelect`
          }
        }).datepicker('setDate', setFromDate);
  
        $('#wfh_toDate').datepicker({
          dateFormat: 'dd-mm-yy',
          changeMonth: true,
          changeYear: true,
          // maxDate: 0,
          onSelect: function(dateText) {
            component.addWFHForm.get('wfh_toDate')?.setValue(dateText);
            $('#wfhdates').trigger('click'); // Trigger manually within `onSelect`
          }
        }).datepicker('setDate', setToDate);

        // $('body').on('change', '#wfh_fromDate', function () {
        //   console.log('wfh_fromDate changed');
        //   $('#wfhdates').trigger('click');
        // });
      
        // $('body').on('change', '#wfh_toDate', function () {
        //   console.log('wfh_toDate changed');
        //   $('#wfhdates').trigger('click');
        // });

      }, 100)

  }

  clear_file() {
    const fileInput = document.getElementById("compoff_doc") as HTMLInputElement;
    fileInput.value = '';
  }

  changeStatusFilter() {
    this.getWFHRequest();
  }

  getInvalidControls() {
    const invalidControls = [];
    const controls = this.addWFHForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalidControls.push(name);
      }
    }
    return invalidControls;
  }


}
