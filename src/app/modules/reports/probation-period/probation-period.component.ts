import { Component, ElementRef, ViewChild } from '@angular/core';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import { AlertService } from 'src/app/shared/_alert';
import { FilterField } from '../common-filter/filter.model';
import { LoginService } from '../../login/login.service';
import { UserMgmtService } from '../../user-mgmt/user-mgmt.service';
@Component({
  selector: 'app-probation-period',
  templateUrl: './probation-period.component.html',
  styleUrls: ['./probation-period.component.css']
})
export class ProbationPeriodComponent {
  viewtrack: boolean = false;
  confirmationModal: boolean = false;
  showSidebar: boolean = true;
  month: any;
  includeEmployeeDetails: boolean = false;
  days_count: any;
  radio_button_value: any;
  action: any;
  year: any;
  p: number = 0;
  invKey: any = '';
  filteredEmployees: any = [];
  selected_date: any;
  yearsArray: any = [];
  data_summary: any = [];
  product_type: any;
  employer_name: any = '';
  tp_account_id: any = '';
  currentDate: any;
  currentDateString: any;
  payout_date: any;
  cur_payout_day: string = '';
  employer_profile: any = [];
  token: any = '';
  selectedReport: string = 'summary';
  data: any = [];




  selectedOption: string = 'summary';
  summary: boolean = false;
  showDetail: boolean = false;

  show_label: boolean = true;
  isSideBar: boolean = true;
  addOnFilters: FilterField[] = [];

  selectedUnitId: any = [];
  selectedDepartmentId: any = [];
  selectedDesignationId: any = [];
  unit_master_list_data: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];

  selectedDynmicColumnValues: any[] = [];
  get_employee_list_data: any;
  get_desc: any;

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _ReportService: ReportService,
    private _alertservice: AlertService, private _loginService: LoginService, private _userMgmtService: UserMgmtService) {
    this.currentDate = new Date();
    this.currentDateString = this.currentDate.toString().slice(0, -30);


  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    this.employer_name = this.token.name;

    this.get_employee_list();
  }

  get_employee_list() {
    this._loginService.get_tpay_dashboard_data({
      "action": "get_probation_renewal_emplist",
      "accountId": this.tp_account_id,
      "geo_location_id": this.token.geo_location_id,
      "ouIds": this.token.ouIds
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            // console.log(resData.commonData);

            this.get_employee_list_data = resData.commonData;
          } else {
            this.get_employee_list_data = [];
          }
        }, error: (e) => {
          this.get_employee_list_data = [];
          console.log(e);
        }
      })
  }


  isValueGreaterThanZero(key: string): boolean {
    return this.filteredEmployees.some(report => report[key] > 0);
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  closeConfirmModal() {
    this.confirmationModal = false;
  }
  selectedEmployee: any = null;
  alertsendforrenewal(employee: any) {
    this.selectedEmployee = employee;
    this.confirmationModal = true;
  }

  sendforrenewal() {
    if (this.selectedEmployee) {
      console.log("Sending to:", this.selectedEmployee);
      const randomFiveDigit = Math.floor(10000 + Math.random() * 90000);
      let postData = {
        p_action_for_contract: 'save_contractrenewal_transaction',
        customeraccountid: this.tp_account_id.toString(),
        userby: this.token.emp_code || this.token.id,
        emp_id: this.selectedEmployee.emp_id.toString(),
        renewal_of_emp_code: this.selectedEmployee.emp_code.toString(),
        status: 'senttouser',
        p_category: 'P-' + randomFiveDigit
      }

      this._userMgmtService.contractrenewal(postData).subscribe((resData: any): any => {
        if (resData.statusCode) {
          this.get_employee_list();
          this.toastr.success('Sent');
          this.confirmationModal = false;
        } else {
          return this.toastr.error('Something went wrong')
        }
      })


    }
  }

  viewt(employee: any) {
    this.viewtrack = true;
    console.log(employee);

    if (employee.category != null) {
      this._loginService.get_tpay_dashboard_data({
        "action": "get_probation_renewal_desc",
        "accountId": this.tp_account_id,
        "geo_location_id": this.token.geo_location_id,
        "ouIds": this.token.ouIds,
        "p_category": employee.category,
      })
        .subscribe({
          next: (resData: any) => {
            if (resData.statusCode) {
              console.log(resData.commonData);

              this.get_desc = resData.commonData;
            } else {
              this.get_desc = [];
            }
          }, error: (e) => {
            this.get_desc = [];
            console.log(e);
          }
        })
    }
  }
  closetrackModal() {
    this.viewtrack = false;
    this.get_desc = [];
  }

}