import { Component, ElementRef, ViewChild } from '@angular/core';
import { ApprovalsService } from '../approvals.service';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AttendanceService } from '../../attendance/attendance.service';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';

declare var $: any;
@Component({
  selector: 'app-travel-request',
  templateUrl: './travel-request.component.html',
  styleUrls: ['./travel-request.component.css'],
  animations: [dongleState, grooveState]
})
export class TravelRequestComponent {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  showSidebar: boolean = false;
  filter_fromdate: any = '';
  filter_todate: any = '';

  statusFilter: any = '';
  tp_account_id: any;
  travel_request_list_data: any = [];
  filter_travel_request_list_data: any = [];
  tot_approved: any = 0;
  tot_rejected: any = 0;
  tot_pending: any = 0;
  dateFilterForm: FormGroup;
  decoded_token: any;
  searchKey: any = '';
  fromDate!: Date | null;
  toDate!: Date | null;
  product_type: any;
  requestStatusModal: boolean = false;
  UpdateRequestStatus_Form!: FormGroup;
  isRejected: boolean = false;
  isApproved: boolean = false;
  approve_reject_title: any = '';
  mark_approval_status: any = '';
  showCommentsPopup: boolean = false;
  commentsData: any = [];

  change_sidebar_filter_flag: boolean = false;
  startDate: any;
  endDate: any;
  invKey: any;

  invKey_copy: any = '';
  startDate_copy: any;
  endDate_copy: any;
  statusFilter_copy: any = 'All';
  dropdownSettings: any = {};
  deptDropdownSettings: {};
  desgDropdownSettings: {};
  deptList: any = [];
  desgList: any = [];
  orgList: any = [];
  orgName: any = [];
  deptName: any = [];
  desgName: any = [];
  orgName_copy: any = [];
  deptName_copy: any = [];
  desgName_copy: any = [];
  uploadDoc: any = [];

  constructor(private fb: FormBuilder,
    private _approvalsService: ApprovalsService,
    private _EncrypterService: EncrypterService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _alertservice: AlertService,
    private _attendanceService: AttendanceService,
    private _businesessSettingsService: BusinesSettingsService
  ) { }

  ngOnInit() {
    let session_obj: any = JSON.parse(this._sessionService.get_user_session());
    this.decoded_token = jwtDecode(session_obj.token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.UpdateRequestStatus_Form = this.fb.group({
      travelRemark: ['', [Validators.required]],
      travelId: ['', [Validators.required]],
      empCode: ['', [Validators.required]],
      travelStatus: ['', [Validators.required]],
    });
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    this.startDate = this.formatDate(firstDayOfMonth);
    this.endDate = this.formatDate(lastDayOfMonth);

    // console.log(this.filter_todate);
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'org_unit_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
    };
    this.deptDropdownSettings = {
      singleSelection: false,
      idField: 'posting_department',
      textField: 'posting_department',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };
    this.desgDropdownSettings = {
      singleSelection: false,
      idField: 'post_offered',
      textField: 'post_offered',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      // allowRemoteDataSearch: true,
      // searchFilter: (term: string, item: any)=> this.customSearchFilter(term, item)
    };
    this.get_geo_fencing_list();
    this.getDepartmentData();
    this.getDesignationData();
    this.getTravelRequestDetails();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  search(key: any) {
    const searchValue = key.target.value.toLowerCase();
    this.filter_travel_request_list_data = this.travel_request_list_data.filter(function (element: any) {
      // return element.purpose.toLowerCase().includes(key.target.value.toLowerCase())
      return (
        element.purpose.toLowerCase().includes(searchValue) ||
        element.emp_name?.toLowerCase().includes(searchValue) ||
        element.department?.toLowerCase().includes(searchValue)
      );
    });
  }

  formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}/${mm}/${yy}`;
  }

  filterByDate(): void {
    this.filter_fromdate = this.fromDate ? new Date(this.fromDate).toISOString().split('T')[0] : '';
    this.filter_todate = this.toDate ? new Date(this.toDate).toISOString().split('T')[0] : '';

    if (this.filter_fromdate && this.filter_todate && this.filter_todate < this.filter_fromdate) {
      this.toastr.error('To Date cannot be earlier than From Date.', 'Invalid Date Range');
      return;
    }

    if (this.filter_fromdate && this.filter_todate) {
      this.getTravelRequestDetails()
    }
  }


  changeStatusFilter(val: any) {
    this.statusFilter = val;
    this.getTravelRequestDetails();
  }

  getTravelRequestDetails() {
    this.tot_pending = 0;
    this.tot_approved = 0;
    this.tot_pending = 0;
    this.tot_rejected = 0;
    this._approvalsService.getAllTravelRequestSummary({
      'travelId': "",
      'customerAccountId': this.tp_account_id.toString(),
      'fromDt': this.filter_fromdate,
      'toDt': this.filter_todate,
      'statusFilter': this.statusFilter,
      'productTypeId': "2",
      'postOffered': this.desgName,
      'postingDepartment': this.deptName,
      'unitParameterName': this.orgName,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.travel_request_list_data = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          this.filter_travel_request_list_data = this.travel_request_list_data;
          //console.log(this.travel_request_list_data, 'testtt')
          this.travel_request_list_data.map((el: any) => {
            if (el.travel_request_status == 'P') {
              this.tot_pending += 1;
            } else if (el.travel_request_status == 'A') {
              this.tot_approved += 1;
            } else if (el.travel_request_status == 'R') {
              this.tot_rejected += 1;
            }
          })

        } else {
          this.filter_travel_request_list_data = [];
          this.travel_request_list_data = [];
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        this.filter_travel_request_list_data = [];
        this.travel_request_list_data = [];
        console.log(e);
      }
    })
  }

  openRequestStatusModal(data: any, statusType: any) {
    // console.log(data)
    this.approve_reject_title = statusType;
    if (statusType == 'Approve') {
      this.mark_approval_status = 'A';
    } else if (statusType == 'Reject') {
      this.mark_approval_status = 'R';
    }
    this.UpdateRequestStatus_Form.patchValue({
      'travelId': data.travel_id,
      'empCode': data.emp_code,
      'travelRemark': data.travel_comment,
      'travelStatus': this.mark_approval_status
    })
    this.requestStatusModal = true;
  }

  closeStatusModal() {
    this.requestStatusModal = false;
    this.mark_approval_status = '';
    this.approve_reject_title = '';
    this.UpdateRequestStatus_Form.reset();
  }
  updateRequestStatus() {
    let data = this.UpdateRequestStatus_Form.value;
    let travelId = data.travelId.toString();
    let empCode = data.empCode.toString();
    let travelStatus = data.travelStatus.toString();
    let travelRemark = data.travelRemark.toString();

    let obj = {
      "actionType": "update_request_status",
      "travelId": travelId,
      "customerAccountId": this.tp_account_id.toString(),
      "empCode": empCode,
      "travelAdvAmount": '',
      "travelStatus": travelStatus,
      "travelRemark": travelRemark,
      "submittedBy": this.tp_account_id.toString(),
      "productTypeId": this.product_type.toString(),
      "uploadDoc": this.uploadDoc
    }
    // console.log(obj);
    // return;

    this._approvalsService.updateTravelReqExpStatus(obj).subscribe((resData: any) => {
      if (resData.statusCode) {
        // if (resData.commonData == null) {
        //   // this.toastr.info('No data found', 'Info');
        //   this._alertservice.info('No data found.', GlobalConstants.alert_options_autoClose);
        //   return;
        // }
        this.toastr.success(resData.message);
        this.UpdateRequestStatus_Form.reset();
        this.requestStatusModal = false;
        this.uploadDoc = [];
        this.fileInput.nativeElement.value = '';

        // this.getTravelRequestDetails();
        setTimeout(() => {
          this.getTravelRequestDetails();
        }, 200);
      } else {
        this.toastr.error(resData.message);
        // this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
        this.UpdateRequestStatus_Form.reset();
        this.requestStatusModal = false;
      }
    })

  }

  convertDateFormat(dateString: string): string {
    // Parse the input date string
    const [year, month, day] = dateString.split('-');
    // Return the formatted date
    return `${day}-${month}-${year}`;
  }

  check_level_cdn(data: any) {
    // console.log(data)
    let application_level = data.wf_approval_cur_level_req;
    let user_approval_level = data.user_approval_level;
    if (data.is_workflow_applied_req == 'Y') {
      if (data.template_mode == 'strict') {
        if (application_level == user_approval_level) {
          return true;
        } else {
          return false;
        }
      } else if (data.template_mode == 'flexible') {
        // if (user_approval_level >= application_level) {
        return true;
        // } else {
        //   return false;
        // }
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  openCommentsPopup(data: any) {
    // console.log(data)
    this.showCommentsPopup = true;
    this.commentsData = !data ? [] : data.split('<br><br>')
      .map(line => `&#9679; ${line.trim()}`) // Prepend black circle
      .filter(line => line);

    // console.log(this.commentsData)

  }

  closeCommentsPopup() {
    this.showCommentsPopup = false;
    this.commentsData = [];
  }

  resetDateFilter(): void {
    let today = new Date();

    // Formatted string for 'dd-MM-yyyy'
    let formattedDateStr = today.toLocaleDateString('en-GB').split('/').join('-');

    // Date object for this.fromDate and this.toDate
    this.fromDate = today;
    this.toDate = today;

    // String values for API payload
    this.filter_fromdate = formattedDateStr;
    this.filter_todate = formattedDateStr;

    this.getTravelRequestDetails();
  }

  change_sidebar_filter() {
    this.change_sidebar_filter_flag = true;

    this.startDate = this.startDate_copy;
    this.endDate = this.endDate_copy;
    this.invKey = this.invKey_copy;
    this.statusFilter = this.statusFilter_copy;

    this.desgName = this.desgName_copy;
    this.orgName = this.orgName_copy;
    this.deptName = this.deptName_copy;

    this.startDate = $('#FromDate').val();
    this.endDate = $('#ToDate').val();

    this.getTravelRequestDetails();
  }
  filterFromToDateLeads() {

    let splitted_f = $('#FromDate').val().split("-", 3);
    let splitted_t = $('#ToDate').val().split("-", 3);

    let fromdt: number = splitted_f[2] + splitted_f[1] + splitted_f[0];
    let todt: number = splitted_t[2] + splitted_t[1] + splitted_t[0];
    if (todt >= fromdt) {
      this.startDate_copy = $('#FromDate').val();
      this.endDate_copy = $('#ToDate').val();
    }
    else {
      $('#FromDate').val(this.startDate_copy);
      $('#ToDate').val(this.endDate_copy);
      this.toastr.error("Start date should be less than or equal to the end date", 'Oops!');
    }
  }
  closeSidebar() {
    this.change_sidebar_filter_flag = false;
    document.getElementById("sidebar").style.width = "0";
  }

  /**Sidebar Filter**/
  resetFilter() {
    this.invKey_copy = '';
    this.statusFilter_copy = 'All';
    this.deptName_copy = [];
    this.desgName_copy = [];
    this.orgName_copy = [];

    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    this.startDate_copy = this.formatDate(firstDayOfMonth);
    this.endDate_copy = this.formatDate(lastDayOfMonth);

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.startDate_copy); // Set current date as default

      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.endDate_copy); // Set current date as default

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });


    }, 100);

  }
  openSidebar() {
    this.change_sidebar_filter_flag = true;

    this.invKey_copy = this.invKey;
    this.statusFilter_copy = this.statusFilter;

    this.orgName_copy = this.deepCopyArray(this.orgName);
    this.desgName_copy = this.deepCopyArray(this.desgName);
    this.deptName_copy = this.deepCopyArray(this.deptName);
    // console.log(this.deptName_copy);

    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.startDate); // Set current date as default

      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', this.endDate); // Set current date as default

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });


      this.startDate_copy = this.startDate;
      this.endDate_copy = this.endDate;
    }, 1500);

    document.getElementById("sidebar").style.width = "380px";

  }
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
  get_geo_fencing_list() {
    this._businesessSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllOUsForCustomer"
    }).subscribe((resData: any) => {
      this.orgList = [];
      if (resData.statusCode) {
        if (resData.commonData == null) {
          this.toastr.info('No data found', 'Oops!');
          return;
        }

        this.orgList = resData.commonData;

      } else {
        this.toastr.error(resData.message, 'Oops!');
      }
    })
  }
  getDepartmentData() {
    this.deptList = [];

    this._attendanceService.getMaster({
      'actionType': 'GetPostingDepartments',
      'customerAccountId': this.tp_account_id,
      'productTypeId': this.product_type,
    }).subscribe({
      next: (resData: any) => {
        // console.log(resData);

        if (resData.statusCode) {
          this.deptList = (resData.commonData);
          // console.log(this.deptList);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  getDesignationData() {
    this.desgList = [];

    this._attendanceService.getMaster({
      'actionType': 'GetMasterPostOffered',
      'customerAccountId': this.tp_account_id,
      'productTypeId': this.product_type,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.desgList = (resData.commonData);
          // console.log(this.desgList);

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }
  readFile(event: Event, doc: any) {
    const input = event.target as HTMLInputElement;
    // console.log(input);

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // this.fileName = file.name;
      let fileName = file.name;
      // console.log(fileName);

      const reader = new FileReader();
      reader.onload = () => {
        this.uploadDoc.push({
          docExtension: fileName.split('.')[1],
          docName: fileName.split('.')[0],
          docBase64: reader.result.toString().split(',')[1],
          docTypeId: '6'
        })
        // console.log(this.uploadDoc);


      };

      reader.readAsDataURL(file);
    }
  }

  get files(): FormArray {
    return this.UpdateRequestStatus_Form.get('files') as FormArray;
  }

}
