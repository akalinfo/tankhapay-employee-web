import { Component } from '@angular/core';
import { EmployeeManagementService } from '../employee-management.service';
import { Store } from '@ngrx/store';
import { MenuState } from '../state-mgmt/employee.reducer';
import { setActiveMenu } from '../state-mgmt/employee.actions';
import decode from 'jwt-decode';
import { SessionService } from 'src/app/shared/services/session.service';
import { MasterServiceService } from 'src/app/shared/services/master-service.service';
import { EmployeeService } from '../../employee/employee.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { combineLatest } from 'rxjs';
import { LoginService } from '../../login/login.service';

@Component({
  selector: 'app-empl-header',
  templateUrl: './empl-header.component.html',
  styleUrls: ['./empl-header.component.css']
})
export class EmplHeaderComponent {
  showSidebar: boolean = true;
  subMenuList: { module_name: string, isActive: number }[] = [];
  activeMenu$ = this.store.select(state => state.menu ? state.menu.activeMenu : null);
  token: any;
  product_type: any;
  tp_account_id: any;
  accessRights: any;
  view_emp_data: any = '';
  ecStatus: any;
  jsId: any;
  empId: any;
  basicdetailsupdated_status: any;
  aadharverfication_status: any;
  accountverification_status: any;
  pan_verification_status: any;
  basic_detail_form: FormGroup;
  bankDetailsForm: FormGroup;
  kycForm: FormGroup;
  empData: any;
  isPopupVisible: boolean = false;
  selectedImage: string | ArrayBuffer | null = null;
  emp_code_upload: any | null = null;
  login_type: any = '';
  currentUrl: any = '';
  pageTitle: any = 'Employee Profile';
  final_rating: any = [];
  CompletedCycle: any;
  rating: number;
  emplfeedbackcount: any = [];
  allCount: any = [];

  constructor(private _empMgmtService: EmployeeManagementService,
    private store: Store<{ menu: MenuState }>,
    private _SessionService: SessionService,
    private _masterService: MasterServiceService,
    private _EmployeeService: EmployeeService,
    private _EncrypterService: EncrypterService,
    private toastr: ToastrService,
    private router: ActivatedRoute,
    private _location: Location, private _LoginService: LoginService
  ) {
    combineLatest([this.router.queryParams, this.router.params]).subscribe(([queryParams, params]) => {
      // Handling queryParams
      if (queryParams['data']) {

        const stateData = JSON.parse(this._EncrypterService.aesDecrypt(queryParams['data']));
        this.empId = stateData.emp_id;
        this.jsId = stateData.js_id;
        this.ecStatus = stateData.ecStatus;
        localStorage.setItem('emp_basic', this._EncrypterService.aesEncrypt(JSON.stringify(stateData)));
      }

      // Handling route params
      if (!window.location.pathname.startsWith('/profile')) {
        if (params['empid']) {
          let decryptedId = this._EncrypterService.aesDecrypt(params['empid']);
          let ids = decryptedId.split(',');
          this.empId = ids[0];
          this.jsId = ids[1];
          this.ecStatus = ids[2];
        }
      } else {
        if (!queryParams['data']) {
          const stateData = localStorage.getItem('emp_basic') ? JSON.parse(this._EncrypterService.aesDecrypt(localStorage.getItem('emp_basic'))) : '';
          if (stateData) {
            this.empId = stateData.emp_id;
            this.jsId = stateData.js_id;
            this.ecStatus = stateData.ecStatus;
          }
        }
      }
      // console.log(this.empId,this.jsId)
    });

    this.login_type = localStorage.getItem('login_type');
  }

  goBack() {
    this._location.back();
  }
  ngOnInit() {
    // this.subMenuList = this._empMgmtService.getList().filter(menu => menu.isActive == 1);
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.currentUrl = window.location.pathname;
    if (window.location.pathname.startsWith('/profile')) {
      if (this.token.employee_flag) {
        this.empId = this.token.employee_flag.emp_id;
        this.jsId = this.token.employee_flag.js_id;
      }
      this.ecStatus = 'EC';

      this.updateHeader();
    }
    this.product_type = this.token.product_type;
    if (this.currentUrl.includes('/pms') || this.currentUrl.includes('/feedback')) {
      let body = document.querySelector('body');
      body.style.overflow = 'hidden';
    }
    // this.accessRights = this._masterService.checkAccessRights('/employees');
    this.getEmployeeDetail();
    this.getMgmtHeader();

  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  setActiveMenu(menu: string): void {
    localStorage.setItem('empmgmt', menu);
    this.store.dispatch(setActiveMenu({ activeMenu: menu }));
  }

  getMgmtHeader() {
    this._empMgmtService.manage_tp_master({ 'action': 'get_employee_mgmt_menu', 'account_id': this.tp_account_id }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.subMenuList = resData.message.filter(menu => menu.isactive == 1);
      } else {
        this.toastr.error(resData.message);
      }
    })
  }
  // {"action":"GET_LATEST_FINAL_RATING","customeraccountid":"653","emp_code":"6327"}

  fullStars: number[] = [];
  hasHalfStar: boolean = false;
  emptyStars: number[] = [];

  getEmpSummary() {
    const obj = {
      action: 'GET_LATEST_FINAL_RATING',
      customeraccountid: this.view_emp_data?.basicDetails?.customeraccountid,
      emp_code: this.view_emp_data?.basicDetails?.emp_code
    };

    this._LoginService.getEmpSummary_url_fun(obj).subscribe((resData: any) => {
      if (resData.statusCode) {
        // console.log('hellooooo');

        this.final_rating = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        // console.log(this.final_rating);


        // const score = parseFloat(this.final_rating?.final_score || '0');
        // // console.log('Final score:', score);


        // const full = Math.floor(score);
        // const half = score % 1 >= 0.5;
        // const empty = 5 - full - (half ? 1 : 0);

        // // console.log({ full, half, empty });

        // this.fullStars = Array(full).fill(0);
        // this.hasHalfStar = half;
        // this.emptyStars = Array(empty).fill(0);
      } else {
        this.final_rating = '';


      }
    });
  }

  // "{""action"":""GET_LATEST_FEEDBACK"",""customeraccountid"":""653"",""emp_code"":""6327""}
  // {""action"":""GET_LATEST_APPRAISAL_CYCLE"",""customeraccountid"":""653"",""emp_code"":""6327""}
  // {""action"":""GET_ON_GOING_TRAININGS"",""customeraccountid"":""653"",""emp_code"":""6388""}
  // {""action"":""GET_ALL_FEEDBACK_COUNT_BY_EMP_CODE"",""customeraccountid"":""653"",""emp_code"":""6327""}"
  getEmpfeedbackcount() {
    const payload = {
      action: 'GET_ALL_FEEDBACK_COUNT_BY_EMP_CODE',
      customeraccountid: this.tp_account_id.toString(),
      emp_code: this.view_emp_data?.basicDetails?.emp_code
    };

    this._LoginService.getEmpSummary_url_fun(payload).subscribe((resData: any) => {
      if (resData.statusCode) {
        const decryptedData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        const categories = decryptedData?.feedback_categories || {};

        // Set total count (from "all")
        this.allCount = categories.all || 0;

        // Flatten category data excluding "all"
        this.emplfeedbackcount = Object.entries(categories)
          .filter(([key]) => key !== 'all')
          .map(([key, value]: any) => ({
            category: key,
            icon: value.icon,
            count: value.count,
            color: value.color_code
          }));
          
        // console.log('Feedback Count List:', this.emplfeedbackcount);
      } else {
        this.emplfeedbackcount = [];
        this.allCount = 0;
      }
    });
  }



  getEmployeeDetail() {

    this._EmployeeService.getTpCandidateDetails({ 'empId': this._EncrypterService.aesEncrypt(this.empId.toString()), 'productTypeId': this._EncrypterService.aesEncrypt(this.product_type) }).subscribe((resData: any): any => {
      if (resData.statusCode) {
        // this.employeeDetails = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData.commonData));
        this.view_emp_data = resData.commonData;
        //console.log(this.view_emp_data.basicDetails.emp_code);
        if (Object.keys(this.view_emp_data.basicDetails).length == 0 && Object.keys(this.view_emp_data.kycDetails).length == 0 && Object.keys(this.view_emp_data.bankDetails).length == 0) {
          return this.toastr.warning('No data found for this employee', 'Oops');
        }
        let basic_details = this.view_emp_data.basicDetails;
        this.empData = {
          'emp_code': basic_details.emp_code,
          'emp_id': basic_details.emp_id,
          'js_id': basic_details.js_id,
          'mobile': basic_details.mobile,
          'dob': basic_details.dateofbirth,
          'joiningStatus': basic_details.joiningStatus,
          'emp_name': basic_details.emp_name,
          'basicdetailsupdated_status': basic_details.basicdetailsupdated_status,
          'aadharverfication_status': basic_details.aadharverfication_status,
          'pan_verification_status': basic_details.pan_verification_status,
          'accountverification_status': basic_details.accountverification_status,
          'dateofjoining': basic_details.dateofjoining,
          'esi_opted': basic_details.esi_opted,
          'esi_number': basic_details.esi_number,
          'esic_card_doc_path': basic_details.esic_card_doc_path,
        }

        localStorage.setItem('empDataFromParent', JSON.stringify(this.empData));

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
        this.view_emp_data.basicDetails.emp_address = perm_add?.replaceAll('<br>', '');
        this.getEmpSummary();
        this.getEmpfeedbackcount();
      }
    })
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    fileInput.click(); // Programmatically trigger the hidden input click event
  }

  onFileSelected(event: any) {

    this.emp_code_upload = this.view_emp_data.basicDetails.mobile + 'CJHUB' + this.view_emp_data.basicDetails.emp_code + 'CJHUB' +
      this.view_emp_data.basicDetails.dateofbirth;
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
        this.isPopupVisible = true; // Show the popup after selecting an image
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfile_photo() {
    this.isPopupVisible = false;
    const imageData: string = this.selectedImage.toString();
    const emp_profile_photo: string = imageData
    let postData = {

      emp_code: this._EncrypterService.aesEncrypt(this.emp_code_upload.toString()),
      emp_profile_photo: emp_profile_photo,
      created_by: this.token.id,
      productTypeId: this._EncrypterService.aesEncrypt(this.product_type),
      customerAccountId: this._EncrypterService.aesEncrypt(this.tp_account_id.toString())
    }
    this._EmployeeService.save_profile_photo(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message);
        this.getEmployeeDetail();
      } else {
        this.toastr.error(resData.message);
      }
      this.isPopupVisible = false;
    })
  }

  updateHeader() {
    //console.log(this.currentUrl.includes('investments'));

    if (this.currentUrl.includes('employee-detail')) {
      this.pageTitle = 'Employee Details';
    } else if (this.currentUrl.includes('payrolling')) {
      this.pageTitle = 'Payroll Information';
    } else if (this.currentUrl.includes('investments')) {
      this.pageTitle = 'Investment Details';
    } else if (this.currentUrl.includes('leave')) {
      this.pageTitle = 'Leave Information';
    } else if (this.currentUrl.includes('attendance')) {
      this.pageTitle = 'Attendance Record';
    } else if (this.currentUrl.includes('approval-workflow')) {
      this.pageTitle = 'Approval Workflow';
    } else if (this.currentUrl.includes('documents')) {
      this.pageTitle = 'Employee Documents';
    } else if (this.currentUrl.includes('asset-details')) {
      this.pageTitle = 'Asset Details';
    } else if (this.currentUrl.includes('service-book')) {
      this.pageTitle = 'Service Book';
    } else if (this.currentUrl.includes('pms')) {
      this.pageTitle = 'Performance Management System (PMS)';
    }
    else if (this.currentUrl.includes('feedback')) {
      this.pageTitle = 'Feedback';
    } else if (this.currentUrl.includes('check-in')) {
      this.pageTitle = 'Employee Check-In/Check-Out';
    } else if (this.currentUrl.includes('reimbursement')) {
      this.pageTitle = 'Employee Reimbursment';
    } else if (this.currentUrl.includes('travel')) {
      this.pageTitle = 'Travel';
    } else if (this.currentUrl.includes('training')) {
      this.pageTitle = 'Training';
    } else if (this.currentUrl.includes('empl-help-and-support/empl-tickets')) {
      this.pageTitle = 'Help & Support';
    } else if (this.currentUrl.includes('esi-dependent')) {
      this.pageTitle = 'ESI Dependent Form';
    } else if (this.currentUrl.includes('faqs')) {
      this.pageTitle = 'FAQs';
    } else if (this.currentUrl.includes('hr-policy')) {
      this.pageTitle = 'HR Policy';
    } else if (this.currentUrl.includes('compoff')) {
      this.pageTitle = 'Comp-Off Eligibility';
    }
    else {
      this.pageTitle = 'Employee Profile'; // Default header
    }
  }

  onChildNotify(message: string) {
    if (message == '1') {
      this.getEmployeeDetail();
    }
  }
}
