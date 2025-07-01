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
import { setTime } from 'ngx-bootstrap/chronos/utils/date-setters';

declare var $: any;

@Component({
  selector: 'app-compoff-eligibility',
  templateUrl: './compoff-eligibility.component.html',
  styleUrls: ['./compoff-eligibility.component.css'],
  providers: [DatePipe]
})
export class CompoffEligibilityComponent {
  addCompOffForm!: FormGroup;
  compOffRequests: any[] = []; // Sample data, replace with your actual data
  isViewCompOff: boolean = false;

  @ViewChild('popoverStart') popoverStart!: PopoverDirective;  // Correct type
  @ViewChild('popoverEnd') popoverEnd!: PopoverDirective;  // Correct type

  startTime: any;
  endTime: any;
  comp_off_title: any = '';
  emp_id: any;
  decoded_token: any;
  tp_account_id: any;
  product_type: any;
  @Input() empDataFromParent: any;
  statusFilter: any = 'All';

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
    // console.log(this.decoded_token);
    // console.log(this.empDataFromParent);

    this.emp_id = this.empDataFromParent.emp_id;

    this.addCompOffForm = this.fb.group({
      comp_applid: [''],
      date_worked: [''],
      reason: ['', Validators.required],
      status: ['Pending'], // Initial status

      timeOption: ['specificTime', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      working_hours: ['', [Validators.required, Validators.pattern(/^[0-9]+:[0-5][0-9]$/)]],
      remarks: [''],

      data: [''],
      name: [''],
      attachment_url: [''],

    });


    // console.log(this._encrypterService.aesEncrypt('{"action": "get_compoff_appl_by_account","accountid": "653","fromdate": "23-03-2025","todate": "31-03-2025","approval_status": "All"}'))
    // console.log(this._encrypterService.aesEncrypt('{"action": "remove_compoff_appl","accountid": "653","emp_id": "1470","comp_applid": "2",}'));
    // console.log(this._encrypterService.aesEncrypt('{"action": "edit_compoff_appl","accountid": "653","emp_id": "1470","comp_applid": "2","comp_off_applied_date": "23-03-2023","working_hours": "08:30","working_start_time": "","working_end_time": "","compoff_description": "testing","data": "","name": "","attachment_url": "","createdby": "xyz"}'));
    // console.log(this._encrypterService.aesEncrypt('{"action": "apply_compoff_appl","accountid": "653","emp_id": "1470","comp_off_applied_date": "23-03-2023","working_hours": "08:30","working_start_time": "","working_end_time": "","compoff_description": "testing","data": "","name": "abc.pdf","createdby": "xyz"}'));
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

      this.getCompOffRequest();

    }, 100);
  }

  filterFromToDateLeads() {
    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    // console.log(todt-fromdt);

   if (todt >= fromdt) {
      // this.startDate = $('#FromDate').val();
      // this.endDate = $('#ToDate').val();

      this.getCompOffRequest();
    }
    else {
      // $('#FromDate').val(this.startDate);
      // $('#ToDate').val(this.endDate);
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }

    // console.log(this.startDate, this.endDate);
  }

  getCurrentTime(): Date {
    const now = new Date();
    return new Date(0, 0, 0, now.getHours(), now.getMinutes());
  }


  /*****add*****/
  openAddCompOffRequestModal() {
    this.isViewCompOff = false; // Ensure it's in add mode
    this.addCompOffForm.reset(); // Clear the form
    this.comp_off_title = 'Add';

    this.intialize_date_worked('');


    if (this.isViewCompOff) {
      this.addCompOffForm.get('timeOption')?.disable();
    } else {
      this.addCompOffForm.get('timeOption')?.enable();
    }

    this.startTime = this.getCurrentTime();
    this.endTime = this.getCurrentTime();

    // ... (Show the modal - implementation depends on your modal library) ...
    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.add("show"); // Add these two lines.
    modal.style.display = "block";


  }


  /*****update*****/
  openUpdateCompOffRequestModal(data:any) {
    this.isViewCompOff = false;
    // this.addCompOffForm.reset();
    this.comp_off_title = 'Update';

    this.intialize_date_worked(data.comp_off_applied_date);

    if (this.isViewCompOff) {
      this.addCompOffForm.get('timeOption')?.disable();
    } else {
      this.addCompOffForm.get('timeOption')?.enable();
    }

    // console.log(data);

    let attachment_url = !data.attachemnt_url ? '' : data.attachemnt_url;
    let working_hours = !data.working_hours ? '' : data.working_hours;
    let timeOption;

    if (!data.working_start_time) {
      timeOption = 'workingHours';
    } else {
      timeOption = 'specificTime';

    }

    // let split_dt = data.comp_off_applied_date.split('-');

    this.addCompOffForm.patchValue({
      comp_applid: data.comp_applid,
      attachment_url: attachment_url,
      // date_worked: split_dt[2] + '-' + split_dt[1] + '-' + split_dt[0],
      reason: data.compoff_description,
      status: data.approval_status,
      timeOption: timeOption,
      start_time: data?.working_start_time,
      end_time: data.working_end_time,
      working_hours: working_hours,
      remarks: !data.remarks ? '' : data.remarks,

      data: '',
      name: '',
    })

    // console.log(this.addCompOffForm.value);

    // this.startTime = this.getCurrentTime();
    // this.endTime = this.getCurrentTime();

    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.add("show");
    modal.style.display = "block";
  }

  openRejectCompOffRequestModal(data:any) {
    this.isViewCompOff = true;
    this.comp_off_title = 'Remove';

    this.intialize_date_worked(data.comp_off_applied_date);

    if (this.isViewCompOff) {
      this.addCompOffForm.get('timeOption')?.disable();
    } else {
      this.addCompOffForm.get('timeOption')?.enable();
    }

    let attachment_url = !data.attachemnt_url ? '' : data.attachemnt_url;
    let working_hours = !data.working_hours ? '' : data.working_hours;
    let timeOption;

    if (!data.working_start_time) {
      timeOption = 'workingHours';
    } else {
      timeOption = 'specificTime';

    }

    // let split_dt = data.comp_off_applied_date.split('-');

    this.addCompOffForm.patchValue({
      comp_applid: data.comp_applid,
      attachment_url: attachment_url,
      // date_worked: split_dt[2] + '-' + split_dt[1] + '-' + split_dt[0],
      reason: data.compoff_description,
      status: data.approval_status,
      timeOption: timeOption,
      start_time: data?.working_start_time,
      end_time: data.working_end_time,
      working_hours: working_hours,
      remarks: !data.remarks ? '' : data.remarks,

      data: '',
      name: '',
    })

    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.add("show");
    modal.style.display = "block";

  }

  hideAddCompOffRequestModal() {
    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.remove("show"); // Add these two lines.
    modal.style.display = "none";
    this.addCompOffForm.patchValue({
      attachment_url: '',
    })
    this.addCompOffForm.reset();

  }

  /***View****/
  viewCompOffRequest(data: any) {
    this.isViewCompOff = true;
    this.comp_off_title = 'View';

    this.intialize_date_worked(data.comp_off_applied_date);

    if (this.isViewCompOff) {
      this.addCompOffForm.get('timeOption')?.disable();
    } else {
      this.addCompOffForm.get('timeOption')?.enable();
    }

    let attachment_url = !data.attachemnt_url ? '' : data.attachemnt_url;
    let working_hours = !data.working_hours ? '' : data.working_hours;
    let timeOption;

    if (!data.working_start_time) {
      timeOption = 'workingHours';
    } else {
      timeOption = 'specificTime';

    }

    // let split_dt = data.comp_off_applied_date.split('-');

    this.addCompOffForm.patchValue({
      comp_applid: data.comp_applid,
      attachment_url: attachment_url,
      // date_worked: split_dt[2] + '-' + split_dt[1] + '-' + split_dt[0],
      reason: data.compoff_description,
      status: data.approval_status,
      timeOption: timeOption,
      start_time: data?.working_start_time,
      end_time: data.working_end_time,
      working_hours: working_hours,
      remarks: !data.remarks ? '' : data.remarks,

      data: '',
      name: '',
    })

    const modal = document.getElementById('addCompOffModal')!;
    modal.classList.add("show");
    modal.style.display = "block";
  }


  // saveCompOffRequest() {
  //   // if (this.addCompOffForm.invalid) {
  //   //   return; // Handle form validation errors
  //   // }

  //   const newCompOffRequest = this.addCompOffForm.value;
  //   console.log(this.addCompOffForm.value);

  //   this.compOffRequests.push(newCompOffRequest); // Add to your data array
  //   this.hideAddCompOffRequestModal();
  //   // this.addCompOffForm.reset(); // Reset after submit
  // }

  togglePopover(popover: any) {
     if (popover.isOpen) {
       popover.hide();
     } else {
       popover.show();
     }
   }

   onStartTimeChange(newTime: Date) {
     this.startTime = newTime;  // Update startTime
     const formatted = this.datePipe.transform(newTime, 'HH:mm');
     this.addCompOffForm.get('start_time')?.setValue(formatted);
     // this.popoverStart.hide(); //Added this to hide popover on selecting time
   }

   onEndTimeChange(newTime: Date) {
     this.endTime = newTime;  // Update endTime
     const formatted = this.datePipe.transform(newTime, 'HH:mm');
     this.addCompOffForm.get('end_time')?.setValue(formatted);
     // this.popoverEnd.hide();//Added this to hide popover on selecting time

   }

   onTimeOptionChange() {
     const timeOption = this.addCompOffForm.get('timeOption')?.value;

     if (timeOption === 'specificTime') {
       this.addCompOffForm.get('start_time')?.setValidators([Validators.required]);
       this.addCompOffForm.get('end_time')?.setValidators([Validators.required]);
       this.addCompOffForm.get('working_hours')?.clearValidators();
     } else { // timeOption === 'workingHours'
       this.addCompOffForm.get('working_hours')?.setValidators([Validators.required, Validators.pattern(/^[0-9]+:[0-5][0-9]$/)]);
       this.addCompOffForm.get('start_time')?.clearValidators();
       this.addCompOffForm.get('end_time')?.clearValidators();
     }


     this.addCompOffForm.get('start_time')?.updateValueAndValidity();
     this.addCompOffForm.get('end_time')?.updateValueAndValidity();
     this.addCompOffForm.get('working_hours')?.updateValueAndValidity();
   }


  readFile(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // this.fileName = file.name;
      let fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.addCompOffForm.patchValue({
          name: fileName,
          data: reader.result.toString().split(',')[1]
        })
      };

      reader.readAsDataURL(file);
    }
  }

  saveCompOffRequest() {
    this.onTimeOptionChange();

    if (this.addCompOffForm.invalid) {
      for (const controlName in this.addCompOffForm.controls) {
        const control = this.addCompOffForm.get(controlName);
        if (control?.invalid) {
          // console.log(`First invalid control: '${controlName}'. Errors:`, control.errors);

          // if (controlName == 'date_worked') {
          //   this.toastr.error('Please select date worked', 'Oops!');
          // } else
          if (controlName == 'reason') {
            this.toastr.error('Please enter description/remarks', 'Oops');
          } else if (controlName == 'timeOption' || controlName == 'start_time' || controlName == 'end_time' || controlName == 'working_hours') {
            this.toastr.error('Please enter valid working hours', 'Oops!');
          }

          return;
        }
      }
    }

    // console.log(this.addCompOffForm.value);
    let data = this.addCompOffForm.value;


    // if (isNaN(data.working_hours)) {
    //   this.toastr.error('Please enter valid working hours', 'Oops!');
    //   return;
    // }

    // let split_dt_worked = data.date_worked.split('-');
    // let date_worked = split_dt_worked[2] + '-' + split_dt_worked[1] + '-' + split_dt_worked[0];
    let date_worked = $('#date_worked').val();
    if (!date_worked) {
      this.toastr.error('Please select date worked', 'Oops!');
      return;
    }

    // return;

    let action = '';

    if (this.comp_off_title == 'Add') {
      action = 'apply_compoff_appl';
    } else if (this.comp_off_title == 'Update') {
      action = 'edit_compoff_appl';
    } else if (this.comp_off_title == 'Remove') {
      action ='remove_compoff_appl';
    }

    let working_hours = '';
    let start_time = '';
    let end_time = '';

    if (data.timeOption == 'workingHours') {
      working_hours = data.working_hours;
      const timeRegex = /^(2[0-3]|[01]?[0-9]):([0-5][0-9])$/;
      if (!timeRegex.test(working_hours)) {
        this.toastr.error("Invalid time format", "Oops!");
        return;
      }
    } else if (data.timeOption == 'specificTime') {
      start_time = data.start_time;
      end_time = data.end_time;
      
    }

    let createdby = '';
    if (this.decoded_token.isEmployer == '0') {
      createdby = this.empDataFromParent.emp_code;
    } else {
      createdby = this.tp_account_id;
    }

    this._employeeLoginService.manageCompOffRequest({
      'action': action,
      'accountid': this.tp_account_id.toString(),
      'comp_applid': data.comp_applid,
      'emp_id': this.emp_id,
      'comp_off_applied_date': date_worked,
      'working_start_time': start_time,
      'working_end_time': end_time,
      'working_hours': working_hours,
      'compoff_description': data.reason,
      'remarks': data.remarks,
      'attachment_url': data.attachment_url,
      'createdby': createdby,

    }).subscribe({
      next: (resData: any) => {
        if (resData.msgcd == '1') {
          this.addCompOffForm.reset();
          this.hideAddCompOffRequestModal();
          this.getCompOffRequest();
          this.addCompOffForm.patchValue({
            attachment_url: '',
          })
          this.clear_file();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Error');
        }
      }
    })
  }
  uploadCompOffDocument() {
    let formData = this.addCompOffForm.value;
    // console.log(formData);

    if (!formData.data) {
      this.saveCompOffRequest();
      return;
    }

    this._employeeLoginService.uploadCompOffDocument({
      'data': formData.data,
      'name': formData.name,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.addCompOffForm.patchValue({
            attachment_url: resData.filePath
          })
          this.saveCompOffRequest();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  getCompOffRequest() {


    this._employeeLoginService.getCompOffRequest({
      'action': 'get_compoff_appl_filter',
      'accountid': this.tp_account_id.toString(),
      'emp_id': this.emp_id,
      'fromdate': $('#FromDate').val(),
      'todate': $('#ToDate').val(),
      'approval_status': this.statusFilter,

    }).subscribe({
      next: (resData: any) => {
        this.compOffRequests = [];
        if (resData.statusCode) {          
          this.compOffRequests = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
          // console.log(this.compOffRequests);
        } else {
          console.log(resData.message);
          // this.toastr.error(resData.message, 'Error');
        }
      }
    })
  }


  intialize_date_worked(date:any) {
    let setDate = new Date();
    if (date) {
      let split_dt = date.split('-');
      let split_dt_final = split_dt[2] + '-' + split_dt[1] + '-' + split_dt[0];
      setDate = new Date(split_dt_final);
    }

    setTimeout(() => {
      $('#date_worked').datepicker({
        dateFormat: 'dd-mm-yy',
        changeMonth: true,
        changeYear: true,
        maxDate: 0,
      }).datepicker('setDate', setDate);
    }, 100)

  }

  clear_file() {
    const fileInput = document.getElementById("compoff_doc") as HTMLInputElement;
    fileInput.value = '';
  }

  changeStatusFilter() {
    this.getCompOffRequest();
  }
}
