import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LeaveMgmtService } from '../../leave-mgmt/leave-mgmt.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ToastrService } from 'ngx-toastr';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../employee/employee.service';
import { DomSanitizer } from '@angular/platform-browser';
import jwtDecode from 'jwt-decode';
import { dongleState, grooveState } from 'src/app/app.animation';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { EmployeeLoginService } from '../employee-login.service';

declare var $: any;
@Component({
  selector: 'app-leave',
  templateUrl: './leave.component.html',
  styleUrls: ['./leave.component.css', '../../employee-management/empl-leave-mgmt/empl-leave-mgmt.component.css'],
  animations: [grooveState, dongleState],
})
export class LeaveComponent {
  showSidebar: boolean = false;
  emp_id: any;
  tp_account_id: any;
  statusFilter: any = 'All';
  // leave_appl_empid_list_data: any = [];
  leave_balance_data: any = [];
  showApproveRejectPopup: boolean = false;
  approve_reject_title: any = '';
  mark_approval_status: any = '';
  product_type: any = '';
  decoded_token: any;
  employee_data: any = [];
  settings: any = {};
  showDocumentPopup: boolean = false;
  document_url: any = '';
  innerPanelData: any = [];
  showGatePassModal = false;
  gatePassModalData: any = [];
  @Input() empDataFromParent: any;

  view_emp_data: any = [];
  leaveTemplateData: any = [];
  editLeave: boolean = false;
  @ViewChild('ed') effective_dt_val: ElementRef;
  accessRights: any;
  leaveHistoryBalanceData: any = [];
  leaveRequests: any = [];
  addLeaveRequstForm: FormGroup;
  selectedLeaveType = 'Full Day';
  leaveErrors: string[] = [];
  isViewLeave: boolean = false;
  approvalStatus: any = '';
  selectedSubject: any = {};
  constructor(
    private router: Router,
    private _leaveMgmtService: LeaveMgmtService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private _EmployeeService: EmployeeService,
    private sanitizer: DomSanitizer,
    private _EncrypterService: EncrypterService,
    private _masterService: MasterServiceService,
    private _employeeLoginService: EmployeeLoginService
  ) {
    // if (this.router.getCurrentNavigation().extras.state != undefined && this.router.getCurrentNavigation().extras?.state?.emp_id) {
    //  this.emp_id = this.router.getCurrentNavigation()?.extras?.state?.emp_id;
    // }
    //this.emp_id = '948'
  }

  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);

    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // console.log("TOKEN:",this.decoded_token);
    // console.log("PARENT - EmpData:",this.empDataFromParent);

    this.emp_id = this.empDataFromParent.emp_id;
    this.accessRights = this._masterService.checkAccessRights('/employees');

    // this.settings = {
    //   singleSelection: true,
    //   primaryKey: "id",
    //   labelKey: "account_contact_name",
    //   text: "Select Name",
    //   selectAllText: 'Select All',
    //   unSelectAllText: 'UnSelect All',
    //   enableSearchFilter: true,
    //   classes: "myclass custom-class",
    //   lazyLoading: true,
    //   // disabled:this.date_of_relieving_flag,
    //   position: 'bottom',
    //   autoPosition: true
    // }

    this.addLeaveRequstForm = this._formBuilder.group({
      leavetypecode: [''],
      leave_subject: ['', [Validators.required]],
      fromdate: ['', [Validators.required]],
      todate: ['', [Validators.required]],
      leave_description: [''],
      leavetemplateid: [''],
      data: [''],
      name: [''],
      leave_applid: [''],
      leave_detail_data: this._formBuilder.array([])
    })

    // this.get_Leave_appl_all_by_empid();
    this.get_employee_leave_balance();
    this.get_tp_leave_temeplate();

    this.getEmployeeDetail();
    // this.get_Leave_appl_filter()
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get al() {
    return this.addLeaveRequstForm.controls;
  }

  get leaveDetailData(): FormArray {
    return this.addLeaveRequstForm.get('leave_detail_data') as FormArray;
  }

  changeStatusFilter(val: any) {
    this.statusFilter = val;
    // this.get_Leave_appl_all_by_empid();
    this.get_Leave_appl_filter();
  }

  // get_Leave_appl_all_by_empid() {
  //   this._leaveMgmtService.get_Leave_appl_by_account_empid({
  //     'action': 'get_Leave_appl_all_by_empid',
  //     'productId': this.product_type.toString(),
  //     'accountId': this.tp_account_id.toString(),
  //     'empid': this.emp_id.toString(),
  //     'approval_status': this.statusFilter,

  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         this.leave_appl_empid_list_data = resData.commonData;

  //       } else {
  //         this.leave_appl_empid_list_data = [];
  //         // this.toastr.error(resData.message, 'Oops!');
  //       }
  //     }, error: (e) => {
  //       this.leave_appl_empid_list_data = [];
  //       console.log(e);
  //     }
  //   })
  // }

  get_employee_leave_balance() {
    this._leaveMgmtService.get_employee_leave_balance({
      'accountId': this.tp_account_id.toString(),
      'empid': this.emp_id.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leave_balance_data = resData.commonData[0];
          console.log(this.leave_balance_data)
        } else {
          this.leave_balance_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }


  // getDate(dt: any) {
  //   let dt_array = dt.split('-');
  //   const date = new Date(dt_array[0], dt_array[1], dt_array[2]);
  //   let month = date.toLocaleString('default', { month: 'short' });

  //   return dt_array[0] + '-' + month + '-' + dt_array[2];
  // }

  employer_details() {

    this._EmployeeService
      .employer_details({
        customeraccountid: this.tp_account_id.toString(),
        productTypeId: this.product_type,
        GeoFenceId: this.decoded_token.geo_location_id
      })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            if (resData.statusCode) {
              this.employee_data = resData.commonData;
            } else {
              this.employee_data = [];
            }
          } else {
            this.toastr.error(resData.message, 'Oops!');
          }
        }
      });
  }

  changeEmp(val: any) {
    console.log(val);
    this.emp_id = val;
    // this.get_Leave_appl_all_by_empid();
    this.get_Leave_appl_filter();
    this.get_employee_leave_balance();
  }

  openDocumentPopup(url: any) {
    this.showDocumentPopup = true;
    this.document_url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closeDocumentPopup() {
    this.showDocumentPopup = false;
    this.document_url = '';
  }

  openPanel(i: number, emp_data: any) {
    this.innerPanelData = emp_data;

    const targetElement = document.getElementById(`collapseOne${i}`);

    // Check if the clicked panel is already open
    const isOpen = targetElement.classList.contains('in');

    // Close all previously opened panels (if needed)
    const previouslyOpened = document.querySelectorAll('.in.panel-collapse.collapse');

    previouslyOpened.forEach(panel => {
      if (panel !== targetElement) {
        panel.classList.remove('in');
      }
    });

    // Toggle visibility of the clicked panel (considering its state)
    if (!isOpen) {
      targetElement.classList.add('in'); // Open if not already open
    } else {
      targetElement.classList.remove('in'); // Close if already open
    }
  }

  openGatePassModal(applied_dt: any) {
    this.showGatePassModal = false;
    this.gatePassModalData = [];

    this._leaveMgmtService.get_gatepass_data({
      action: 'get_gatepass_data',
      accountId: this.innerPanelData.accountid.toString(),
      emp_id: this.innerPanelData.emp_id.toString(),
      fromdate: applied_dt,
      productId: this.product_type.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.showGatePassModal = true;
          this.gatePassModalData = resData.commonData[0];
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  closeGatePassModal() {
    this.showGatePassModal = false;
    this.gatePassModalData = [];
  }

  // onPrint(divName) {
  //   var w = window.open();
  //   const printContents = document.getElementById(divName).innerHTML;
  //   const originalContents = document.body.innerHTML;
  //   w.document.body.innerHTML = printContents;
  //   w.window.print();
  //   w.document.body.innerHTML = originalContents;
  //   w.window.close();

  // }

  onPrint(divName) {
    // Open a new window
    const w = window.open('', '_blank');

    // Get the contents to print
    const printContents = document.getElementById(divName).innerHTML;

    // Copy the styles from the parent document to the new window
    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map(style => style.outerHTML)
      .join('');

    // Write the contents and styles to the new window's document
    w.document.open();
    w.document.write(`
        <html>
          <head>
            <title>Print</title>
            ${styles}
          </head>
          <body>
            ${printContents}
            <script>
              function printAndClose() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }

              // Print after 2 seconds regardless of image load status
              setTimeout(printAndClose, 2000);
            </script>
          </body>
        </html>
      `);
    w.document.close();
  }



  getEmployeeDetail() {

    this._EmployeeService.getTpCandidateDetails({ 'empId': this._EncrypterService.aesEncrypt(this.emp_id.toString()), 'productTypeId': this._EncrypterService.aesEncrypt(this.product_type) }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        // this.employeeDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData.commonData));
        this.view_emp_data = resData.commonData;
        // console.log(this.view_emp_data.basicDetails.emp_address);
        if (Object.keys(this.view_emp_data.basicDetails).length == 0 && Object.keys(this.view_emp_data.kycDetails).length == 0 && Object.keys(this.view_emp_data.bankDetails).length == 0) {
          return this.toastr.warning('No data found for this employee', 'Oops');
        }
        let basic_details = this.view_emp_data.basicDetails;
        let perm_add = '';
        try {
          let jsonData = basic_details.emp_address ? JSON.parse(basic_details.emp_address) : {};
          if (typeof jsonData === 'object' && jsonData !== null) {
            let nonemptyVal = Object.values(jsonData).filter(value => value !== "");
            perm_add = nonemptyVal.join(', ');
          } else {
            perm_add = basic_details.emp_address; // In case it's already a string
          }
        } catch (e) {
          // If parsing fails, assume it's a plain string
          perm_add = basic_details.emp_address;
        }


        // this.view_emp_data.basicDetails.emp_address = perm_add;
        this.view_emp_data.basicDetails.emp_address = perm_add?.replaceAll('<br>', '');

        this.getEmployeeleave_history();
      }
    })

    //   }
    // })
  }

  get_tp_leave_temeplate() {
    this._EmployeeService.get_tp_leave_temeplate({ "customeraccountid": this.tp_account_id.toString() }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.leaveTemplateData = resData.commonData.data;
      }
    })
  }
  open_leave_temp_tab() {
    setTimeout(() => {
      $(function () {
        $('#effective_dt').datepicker({
          dateFormat: 'dd/mm/yy',
          changeMonth: true,
          changeYear: true,
        })
        $('body').on('change', '#effective_dt', function () {
          $('#recdate2').trigger('click');
        })
      })
    }, 0)
  }


  editLeaveTemplate(): any {
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    this.open_leave_temp_tab();
    this.editLeave = !this.editLeave;
  }

  getEmployeeleave_history() {
    this._EmployeeService.getEmployeeleave_history({
      'action': 'get_leave_taken_history_by_emp_id',
      'productId': this.product_type.toString(),
      'accountId': this.view_emp_data.basicDetails.customeraccountid.toString(),
      'empid': this.view_emp_data.basicDetails.emp_id.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leaveHistoryBalanceData = resData.commonData;
        }
        else {
          this.leaveHistoryBalanceData = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.leaveHistoryBalanceData = [];
      }
    })
  }

  get_Leave_appl_filter() {
    // const currentDate = new Date();
    // const formattedDate = currentDate.toLocaleDateString('en-GB');
    let fromdate = $('#FromDate').val().split('-').join('/');
    let todate = $('#ToDate').val().split('-').join('/');
    this._employeeLoginService.get_Leave_appl_filter({
      accountId: this.tp_account_id.toString(),
      empid: this.empDataFromParent.emp_id,
      fromdate: fromdate,
      todate: todate,
      approval_status: this.statusFilter,
      productTypeId: this.product_type
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.leaveRequests = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
      } else {
        this.leaveRequests = [];
      }
    })
  }

  openAddLeaveRequestModal(): any {

    if (!this.leave_balance_data.balance_txt) {
      return this.toastr.error('No leave balance');
    }
    $('#SendMessage198').modal('show');
  }

  hideAddLeaveRequestModal() {
    $('#SendMessage198').modal('hide');
    while (this.leaveDetailData.length != 0) {
      this.leaveDetailData.removeAt(0);
    }
    this.addLeaveRequstForm.reset();
    this.approvalStatus = '';
    this.isViewLeave = false;

  }

  viewLeaveRequest(leave: any) {
    this.isViewLeave = true;
    this.selectedSubject = this.leave_balance_data.balance_txt.filter(subj => leave.leavetypecode == subj.type_code)[0];
    //console.log(this.selectedSubject);

    this.approvalStatus = leave.approval_status;
    this.addLeaveRequstForm.patchValue({
      leave_subject: leave.leave_subject,
      leavetypecode: leave.leavetypecode,
      leavetemplateid: leave.leavetemplateid,
      fromdate: leave.fromdate.split('-').reverse().join('-'),
      todate: leave.todate.split('-').reverse().join('-'),
      leave_description: leave.leave_description,
      data: '',
      name: '',
      leave_applid: leave.leave_applid
    })
    for (let i = 0; i < leave.leave_detail_data.length; i++) {
      this.leaveDetailData.push(this._formBuilder.group(leave.leave_detail_data[i]))
    }
    $('#SendMessage198').modal('show');
  }

  onDateChange() {
    const fromDate = new Date(this.addLeaveRequstForm.value.fromdate);
    const toDate = new Date(this.addLeaveRequstForm.value.todate);

    if (fromDate && toDate && fromDate <= toDate) {
      this.populateLeaveDays(fromDate, toDate);
    } else if (fromDate && toDate && fromDate > toDate) {
      this.addLeaveRequstForm.patchValue({
        toDate: ''
      })
      this.toastr.error("Start date cannot be greater than End date")
    }
  }

  populateLeaveDays(fromDate: Date, toDate: Date) {
    this.leaveDetailData.clear(); // Clear previous values

    const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < days; i++) {
      let leaveDate = new Date(fromDate);
      leaveDate.setDate(fromDate.getDate() + i);

      this.leaveDetailData.push(
        this._formBuilder.group({
          leave_applied_date: [this.formatDate(leaveDate)],
          leave_day_type: ['Full Day'],
          leave_day_half_type: [''],
          leave_starttime: [''],
          leave_endtime: ['']
        })
      );
    }
  }

  readFile(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // this.fileName = file.name;
      let fileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.addLeaveRequstForm.patchValue({
          name: fileName,
          data: reader.result.toString().split(',')[1]
        })
        // this.fileBase64 = reader.result; // Base64 result
        // console.log('Base64:', reader.result.toString().split(',')[1]);
      };

      reader.readAsDataURL(file);
    }
  }


  formatDate(date: Date): string {
    if (!date) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  // setLeavetypeCode(leave: any): any {
  //   let leaveData = JSON.parse(leave);
  //   this.selectedSubject = leaveData;
  //   // console.log(this.leave_balance_data)
  //   if (leaveData.cur_bal == 0) {
  //     this.addLeaveRequstForm.patchValue({
  //       leave_subject: ''
  //     })
  //     return this.toastr.warning(`Zero ${leave.type_name} left.`);
  //   }
  //   this.addLeaveRequstForm.patchValue({
  //     leave_subject: leaveData.type_name,
  //     leavetypecode: leaveData.type_code,
  //     leavetemplateid: this.leave_balance_data.template_id
  //   })
  // }

  setLeavetypeCode(leave: any): any {
    let leaveData = JSON.parse(leave);
    this.selectedSubject = leaveData;
    const leaveApplications = this.leaveRequests.filter(app => app.leavetypecode === leaveData.type_code);

    let totalLeaveDaysAll = 0;

    leaveApplications.forEach(application => {
      const totalLeaveDays = application.leave_detail_data.length;
      application.totalLeaveDays = totalLeaveDays;

      totalLeaveDaysAll += totalLeaveDays;
    });


    if (leaveData.cur_bal < totalLeaveDaysAll) {
      this.toastr.warning(`Your ${leaveData.type_name} leave is already pending.`);
      return;
    }

    if (leaveData.cur_bal === 0) {
      this.addLeaveRequstForm.patchValue({
        leave_subject: ''
      });
      return this.toastr.warning(`Zero ${leave.type_name} left.`);
    }

    this.addLeaveRequstForm.patchValue({
      leave_subject: leaveData.type_name,
      leavetypecode: leaveData.type_code,
      leavetemplateid: this.leave_balance_data.template_id
    });

  }


  setLeaveDayType(event: any, index: number) {
    const leaveSubject = this.addLeaveRequstForm.get('leave_subject')?.value;
    const parsedLeave = leaveSubject ? (leaveSubject) : null;
    const selectedType = event.target.value;

    if (!parsedLeave) {
      this.leaveErrors[index] = 'Please select a valid leave type';
      return;
    }

    const curBal = parsedLeave.cur_bal;

    if (curBal === 0) {
      this.leaveErrors[index] = 'You cannot apply for this leave as the balance is 0';
      return;
    }

    if (selectedType === 'Full Day' && curBal < 1) {
      this.leaveErrors[index] = 'You cannot apply for a full day leave with balance less than 1';
      return;
    }

    if (selectedType === 'Half Day' && curBal < 0.5) {
      this.leaveErrors[index] = 'You cannot apply for a half-day leave with balance less than 0.5';
      return;
    }

    this.leaveErrors[index] = '';

    const leaveDetail = this.leaveDetailData.at(index);

    if (selectedType === 'Full Day') {
      leaveDetail.patchValue({ leave_day_half_type: '', leave_starttime: '', leave_endtime: '' });
    } else if (selectedType === 'Half Day') {
      leaveDetail.patchValue({ leave_starttime: '', leave_endtime: '' });
    } else if (selectedType === 'Short Leave') {
      leaveDetail.patchValue({ leave_day_half_type: '' });
      leaveDetail.get('leave_starttime')?.valueChanges.subscribe((time) => {
        if (time) {
          leaveDetail.patchValue({ leave_starttime: this.convertTo12Hour(time) }, { emitEvent: false });
        }
      });

      leaveDetail.get('leave_endtime')?.valueChanges.subscribe((time) => {
        if (time) {
          leaveDetail.patchValue({ leave_endtime: this.convertTo12Hour(time) }, { emitEvent: false });
        }
      });
    }
  }


  convertTo12Hour(time: string): string {
    if (!time) return '';

    // Ensure we always get a valid HH:mm format
    if (!/^\d{1,2}:\d{2}$/.test(time)) return '';

    const [hourStr, minuteStr] = time.split(':');
    let hours = parseInt(hourStr, 10);
    const minutes = parseInt(minuteStr, 10);
    console.log(hours, minutes, isNaN(hours) || isNaN(minutes))
    if (isNaN(hours) || isNaN(minutes)) return '';

    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = ((hours % 12) || 12).toString().padStart(2, '0'); // Ensures 12-hour format
    const minFormatted = minutes.toString().padStart(2, '0'); // Ensures 2-digit minutes

    return `${hour12}:${minFormatted} ${suffix}`;
  }



  validateShortLeaveTime(index: number) {
    const leaveDetail = this.leaveDetailData.controls[index];
    const startTime = leaveDetail.get('leave_starttime')?.value;
    const endTime = leaveDetail.get('leave_endtime')?.value;

    if (!startTime || !endTime) {
      this.leaveErrors[index] = '';
      return; // Don't show error if times are not selected yet
    }

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    if (start >= end) {
      this.leaveErrors[index] = 'End Time must be greater than Start Time';
    } else {
      this.leaveErrors[index] = ''; // Clear the error if valid
    }
  }

  convertTimeInput(index: number, field: string) {
    const leaveDetail = $(`#${field}${index}`).val();
    console.log(leaveDetail);
    const leaveForm = this.leaveDetailData.at(index);
    const time = leaveDetail;
    if (time) {
      leaveForm.patchValue({ [field]: this.convertTo12Hour(time) });
    }
  }


  saveLeaveRequest(): any {
    console.log(this.addLeaveRequstForm.value);
    if (!this.al.leave_subject.value) {
      return this.toastr.error("Please select leave type/subject");
    }

    if (!this.al.fromdate.value) {
      return this.toastr.error("Please select start date.");
    }

    if (!this.al.todate.value) {
      return this.toastr.error("Please select end date");
    }

    let fromdate = this.addLeaveRequstForm.value.fromdate.split('-').reverse().join('-');
    let todate = this.addLeaveRequstForm.value.todate.split('-').reverse().join('-');

    this._employeeLoginService.apply_leave_appl({
      ...this.addLeaveRequstForm.value,
      fromdate: fromdate,
      todate: todate,
      productTypeId: (this.product_type),
      accountId: this.tp_account_id.toString(),
      empid: this.emp_id.toString(),
      // createdby: this.tp_account_id.toString()
      createdby: this.empDataFromParent?.emp_code?.toString()
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.hideAddLeaveRequestModal();
        this.get_Leave_appl_filter();
        // this.get_Leave_appl_all_by_empid();

      } else {
        this.toastr.error(resData.message);
      }
    })
  }

  cancelLeaveRequest() {
    // return console.log(this.addLeaveRequstForm.value)
    this._employeeLoginService.remove_applied_leave({
      "accountId": this.tp_account_id.toString(),
      "empid": this.emp_id,
      "leave_applid": this.addLeaveRequstForm.value.leave_applid,
      "remarks": "remarks",
      "productTypeId": this.product_type
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.get_Leave_appl_filter();
        // this.get_Leave_appl_all_by_empid();
        this.hideAddLeaveRequestModal();
      } else {
        this.toastr.error(resData.message);
      }
    })
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

      this.get_Leave_appl_filter();

    }, 100);
  }

  filterFromToDateLeads() {
    if ($('#FromDate').val() && $('#ToDate').val()) {
      let splitted_f = $('#FromDate').val().split("-");
      let splitted_t = $('#ToDate').val().split("-");

      let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
      let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
      if (todt >= fromdt) {
        // this.startDate_copy = $('#FromDate').val();
        // this.endDate_copy = $('#ToDate').val();
        // $('#FromDate').datepicker('setDate', splitted_f[2] + '-' + splitted_f[1] + '-' + splitted_f[0]);
        // $('#ToDate').datepicker('setDate', splitted_t[2] + '-' + splitted_t[1] + '-' + splitted_t[0]);

        this.get_Leave_appl_filter();
      }
      else {
        $('#FromDate').datepicker('setDate', '');
        $('#ToDate').datepicker('setDate', '');
        // $('#FromDate').val(this.startDate_copy);
        // $('#ToDate').val(this.endDate_copy);
        this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
      }
    }
  }
}