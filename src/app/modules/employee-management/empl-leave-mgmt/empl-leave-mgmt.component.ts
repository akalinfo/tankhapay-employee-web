import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LeaveMgmtService } from '../../leave-mgmt/leave-mgmt.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmployeeService } from '../../employee/employee.service';
import { DomSanitizer } from '@angular/platform-browser';
import jwtDecode from 'jwt-decode';
import { dongleState, grooveState } from 'src/app/app.animation';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';

declare var $:any;

@Component({
  selector: 'app-empl-leave-mgmt',
  templateUrl: './empl-leave-mgmt.component.html',
  styleUrls: ['./empl-leave-mgmt.component.css'],
  animations: [grooveState, dongleState],
})
export class EmplLeaveMgmtComponent {
  showSidebar: boolean = false;
  emp_id: any;
  tp_account_id: any;
  statusFilter: any = 'All';
  leave_appl_empid_list_data: any = [];
  leave_balance_data: any = [];
  showApproveRejectPopup: boolean = false;
  approveRejectForm: FormGroup;
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
  gatePassModalData:any = [];
  @Input() empDataFromParent: any;

  view_emp_data: any = [];
  leaveTemplateData: any = [];
  leaveTemplateForm: FormGroup;
  editLeave: boolean = false;
  @ViewChild('ed') effective_dt_val: ElementRef;
  accessRights: any;
  leaveHistoryBalanceData: any = [];

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
    // console.log(decoded_token);
    // console.log(this.empDataFromParent);

    this.emp_id = this.empDataFromParent.emp_id;
    this.accessRights = this._masterService.checkAccessRights('/employees');


    this.approveRejectForm = this._formBuilder.group({
      accountid: [''],
      approval_remarks: [''],
      approval_status: [''],
      approvedon: [''],
      attachemnt_url: [''],
      createdby: [''],
      createdon: [''],
      emp_id: [''],
      fromdate: [''],
      leave_applid: [''],
      leave_description: [''],
      leave_subject: [''],
      leavetemplateid: [''],
      leavetypecode: [''],
      leavetypename: [''],
      rejected_on: [''],
      rejected_remarks: [''],
      todate: [''],
      remark: [''],
      leave_days:['']
    })

    this.leaveTemplateForm = this._formBuilder.group({
      leavetemplate_text: ['', [Validators.required]],
      effective_dt: ['', [Validators.required]]
    })

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

    this.get_Leave_appl_all_by_empid();
    this.get_employee_leave_balance();
    this.get_tp_leave_temeplate();

    this.getEmployeeDetail();
  }

  get ar() {
    return this.approveRejectForm.controls;
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  changeStatusFilter(val: any) {
    this.statusFilter = val;
    this.get_Leave_appl_all_by_empid();
  }

  get_Leave_appl_all_by_empid() {
    this._leaveMgmtService.get_Leave_appl_by_account_empid({
      'action': 'get_Leave_appl_all_by_empid',
      'accountId': this.tp_account_id.toString(),
      'empid': this.emp_id.toString(),
      'approval_status': this.statusFilter,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leave_appl_empid_list_data = resData.commonData;

        } else {
          this.leave_appl_empid_list_data = [];
          // this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.leave_appl_empid_list_data = [];
        console.log(e);
      }
    })
  }

  get_employee_leave_balance() {
    this._leaveMgmtService.get_employee_leave_balance({
      'accountId': this.tp_account_id.toString(),
      'empid': this.emp_id.toString(),
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.leave_balance_data = resData.commonData[0];
        } else {
          this.leave_balance_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  closeApproveRejectPopup() {
    this.showApproveRejectPopup = false;
    this.approve_reject_title = '';
    this.mark_approval_status = '';

    this.approveRejectForm.patchValue({
      accountid: '',
      approval_remarks: '',
      approval_status: '',
      approvedon: '',
      attachemnt_url: '',
      createdby: '',
      createdon: '',
      emp_id: '',
      fromdate: '',
      leave_applid: '',
      leave_description: '',
      leave_subject: '',
      leavetemplateid: '',
      leavetypecode: '',
      leavetypename: '',
      rejected_on: '',
      rejected_remarks: '',
      todate: '',
      remark: '',
      leave_days:''
    })
  }

  openApproveRejectPopup(status: any, data: any) {
    // console.log(data);
    this.showApproveRejectPopup = true;
    this.approve_reject_title = status;
    let remark = '';

    if (status == 'Approve') {
      this.mark_approval_status = 'Approved';

    } else if (status == 'Reject') {
      this.mark_approval_status = 'Rejected';

    } else {
      if (data.approval_status == 'Approved') {
        remark = data.approval_remarks;
        // console.log('h111',remark);
      } else if (data.approval_status == 'Rejected') {
        remark = data.rejected_remarks;
      }
    }

    console.log(data);

    this.approveRejectForm.patchValue({
      accountid: data.accountid,
      approval_remarks: data.approval_remarks,
      approval_status: data.approval_status,
      approvedon: data.approvedon,
      attachemnt_url: data.attachemnt_url,
      createdby: data.createdby,
      createdon: data.createdon,
      emp_id: data.emp_id,
      fromdate: data.fromdate,
      leave_applid: data.leave_applid,
      leave_description: data.leave_description,
      leave_subject: data.leave_subject,
      leavetemplateid: data.leave_templateid,
      leavetypecode: data.leavetypecode,
      leavetypename: data.leavetypename,
      rejected_on: data.rejected_on,
      rejected_remarks: data.rejected_remarks,
      todate: data.todate,
      leave_days:data.leave_days,
      remark: remark
    })

    // console.log(this.approveRejectForm.value);
  }

  approved_leave_appl_by_applid() {
    let data = this.approveRejectForm.value;
    // console.log(data)
    // return;

    this._leaveMgmtService.approved_leave_appl_by_applid({
      action: 'approved_leave_appl_by_applid',
      accountId: data.accountid.toString(),
      empid: data.emp_id.toString(),
      approval_status: this.mark_approval_status,
      row_id: data.leave_applid.toString(),
      remark: data.remark,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeApproveRejectPopup();
          this.get_Leave_appl_all_by_empid();
          this.get_employee_leave_balance();

        } else {
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
        next: (resData:any) => {
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

  changeEmp(val:any) {
    console.log(val);
    this.emp_id = val;
    this.get_Leave_appl_all_by_empid();
    this.get_employee_leave_balance();
  }

  openDocumentPopup(url:any) {
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

  openGatePassModal(applied_dt:any) {
    this.showGatePassModal = false;
    this.gatePassModalData = [];

    this._leaveMgmtService.get_gatepass_data({
      action: 'get_gatepass_data',
      accountId: this.innerPanelData.accountid.toString(),
      emp_id: this.innerPanelData.emp_id.toString(),
      fromdate: applied_dt,
    }).subscribe({
      next: (resData:any) => {
        if (resData.statusCode) {
          this.showGatePassModal = true;
          this.gatePassModalData = resData.commonData[0];
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error : (e) => {
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

        this.leaveTemplateForm.patchValue({
          effective_dt: this.view_emp_data?.basicDetails?.leave_effective_from != null && this.view_emp_data?.basicDetails?.leave_effective_from != undefined ? this.view_emp_data?.basicDetails?.leave_effective_from : '',
          leavetemplate_text: this.view_emp_data.basicDetails.leave_template_json != '' ? (JSON.parse(this.view_emp_data.basicDetails.leave_template_json)[0]) : ''
        });

        console.log( this.leaveTemplateForm);

        let gender = (basic_details.gender.trim().toUpperCase() == 'M' ? 'Male' : basic_details.gender.trim().toUpperCase() == 'F' ? 'Female' : basic_details.gender.trim());

        let salutation = (basic_details.gender.trim().toUpperCase() == 'M' ? 'Mr.' : basic_details.gender.trim().toUpperCase() == 'F' ? 'Ms.' : basic_details.salutation.trim());


        this.getEmployeeleave_history();




      }
    })

    //   }
    // })
  }

  updateLeaveTemplate() {
    let data = this.leaveTemplateForm.value;
    if (this.leaveTemplateForm.valid) {
      this._EmployeeService.manageEmployeeLeaveTemplate_hub({
        'leaveTemplate': new Array(data.leavetemplate_text),
        'customerAccountId': this.tp_account_id.toString(),
        'productTypeId': this.product_type.toString(),
        'empId': this.emp_id.toString(),
        'templateId': data.leavetemplate_text.templateid,
        'effectiveDate': data.effective_dt
      })
        .subscribe((resData: any) => {
          if (resData.statusCode) {
            this.toastr.success(resData.message, 'Success');
            this.editLeave = false;
            this.leaveTemplateForm.patchValue({
              effective_dt: '',
              leavetemplate_text: '',
            })
            this.getEmployeeDetail();

          } else {
            this.toastr.error(resData.message, 'Oops!');
          }
        })
    } else {
      this.toastr.error('Please fill the required details', 'Oops!');
    }
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

  editLeaveTemplate() :any{
    if (this.decoded_token.isEmployer != '1' && !this.accessRights.Edit) {
      return this.toastr.error("You do not have the permission for this.");
    }
    this.open_leave_temp_tab();
    this.editLeave = !this.editLeave;
  }

  getEmployeeleave_history() {
    this._EmployeeService.getEmployeeleave_history({
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

}
