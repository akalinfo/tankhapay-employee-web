import { Component, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { EmployeeManagementService } from '../employee-management.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-empl-service-book-new',
  templateUrl: './empl-service-book-new.component.html',
  styleUrls: ['./empl-service-book-new.component.css']
})
export class EmplServiceBookNewComponent {

  @Input() empDataFromParent: any;
  working_years_data: any = [];
  product_type: any;
  tp_account_id: any;
  token: any = '';
  employer_name: any;
  employer_mobile: any;
  all_years_service_book_data: any = [];

  constructor(
    private toastr: ToastrService,
    private _EmployeeManagementService: EmployeeManagementService,
    private _sessionService: SessionService,
    private sanitizer: DomSanitizer
  ) { }


  ngOnInit() {
    let session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    this.token = decode(session_obj_d?.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.employer_name = this.token.name;
    this.employer_mobile = this.token.mobile;

    if (this.empDataFromParent?.emp_code) {
      // this.GetServiceBook_Details();
      this.GetServiceBook_Details_Years();
    }
  }


  GetServiceBook_Details_Years() {
    this.working_years_data = [];
    this.all_years_service_book_data = [];

    this._EmployeeManagementService.GetServiceBookDetails({
      "action": "ServiceYears",
      "year": "",
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.working_years_data = resData?.commonData?.working_years;

        this.working_years_data.map((el: any) => {
          this.GetServiceBook_Details(el.workingyear)
        })

      } else {
        this.working_years_data = [];
        this.toastr.error(resData.message, 'Oops!');
      }
    });

  }

  GetServiceBook_Details(year: any) {
    this._EmployeeManagementService.GetServiceBookDetails({
      "action": "YearwiseServiceBook",
      "year": year,
      "empCode": this.empDataFromParent?.emp_code?.toString(),
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id?.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        let data = resData.commonData;
        if (data.Disciplinary_Actions_Details.length > 0 || data.Increment_Details.length > 0
          || data.Joining_Details.length > 0 || data.Leave_Summary.length > 0
          || data.Promotion_Details.length > 0 || data.Reward_Details.length > 0
          || data.Separation_Resignation.length > 0 || data.Training_Details.length > 0) {

          data['year'] = year;
          this.all_years_service_book_data.push(data);
          this.all_years_service_book_data.sort((a, b) => a.year - b.year);

        }

        // console.log(this.all_years_service_book_data);

      } else {

        this.toastr.error(resData.message, 'Oops!');
      }
    });

  }

  formatLeaveSummary(leave: any) {
    if (!leave) {
      return '';
    } else {
      return `Availed <b>Leave</b> from <b>${leave.leave_start_from}</b> to <b>${leave.leave_end_to}</b>. Total days: <b>${leave.tot_leave}</b>. Leave balance updated accordingly.`;
    }
  }


  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
