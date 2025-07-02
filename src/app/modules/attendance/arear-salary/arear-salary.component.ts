import { Component, ViewChild, ElementRef } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { AttendanceService } from '../attendance.service';
import { ToastrService } from 'ngx-toastr';
import { grooveState, dongleState } from 'src/app/app.animation';
import { ConfirmationDialogService } from 'src/app/shared/services/confirmation-dialog.service';
import { ReportService } from '../../reports/report.service';
// import { ShiftSpecificService } from '../shift-specific-service';


@Component({
  selector: 'app-arear-salary',
  templateUrl: './arear-salary.component.html',
  styleUrls: ['./arear-salary.component.css'],
  animations: [grooveState, dongleState],
})
export class ArearSalaryComponent {

  showSidebar: boolean = false;
  monthsArray: any = [
    {
      'id': '1',
      'month': 'January',
    },
    {
      'id': '2',
      'month': 'February',
    },
    {
      'id': '3',
      'month': 'March',
    },
    {
      'id': '4',
      'month': 'April',
    },
    {
      'id': '5',
      'month': 'May',
    },
    {
      'id': '6',
      'month': 'June',
    },
    {
      'id': '7',
      'month': 'July',
    },
    {
      'id': '8',
      'month': 'August',
    },
    {
      'id': '9',
      'month': 'September',
    },
    {
      'id': '10',
      'month': 'October',
    },
    {
      'id': '11',
      'month': 'November',
    },
    {
      'id': '12',
      'month': 'December',
    }
  ];
  filteredYearsArray: any = [];
  filteredMonthsArray: any = [];
  attendanceDetails: any = [];
  searchKeyword: any = '';
  month: any;
  year: any;
  decoded_token: any;
  show_level: any = '1';
  employeesForLedgerData: any = [];
  showCreateLedgerPopup: boolean = false;
  createLedgerData: any = '';
  createLedgerRemark: any = '';
  arearByMonthYearEmpCodeData: any = [];
  viewArrearDetailsData: any = [];
  actioninfo: any = '';
  fetcedArearByMonthYearEmpCodeData: any = [];

  userList_original: any = [];
  userList_modified: any = [];
  selectedEmployee: any;
  dynamic_column_data: { reportcolumnname: string, reportcomponentname: string }[] = [];
  product_type: string;
  rate_cols: any[];
  arrear_earnings_allowances_cols: any[];
  showVeriyArrearPopup: boolean = false;
  verifyArrearData: any = {};
  pay_month: any = 'Current';

  constructor(
    private _sessionService: SessionService,
    private _attendanceService: AttendanceService,
    private toastr: ToastrService,
    private _ReportService: ReportService,
    private confirmationDialogService: ConfirmationDialogService,

  ) {

  }

  ngOnInit() {

    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.product_type = localStorage.getItem('product_type');

    this.reset_btn_click();
    this.getUserList();
    this.GetDynamicFields();


  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  onYearChange() {
    let selectedYear = this.year;
    this.month = '';
    this.filteredMonthsArray = [];

    const currentDate = new Date();
    let currentMonth = currentDate.getMonth() + 1; // (1 = January, 12 = December)
    let currentYear = currentDate.getFullYear();

    if (selectedYear == currentYear) {
      const twoMonthsBack = currentMonth - 2;
      if (twoMonthsBack > 0) {
        for (let i = 0; i < twoMonthsBack; i++) {
          this.filteredMonthsArray.push(this.monthsArray[i]);
        }
      }

    } else if (selectedYear == currentYear - 1) {
      if (currentMonth == 1) {
        for (let i = 0; i < 11; i++) {
          this.filteredMonthsArray.push(this.monthsArray[i]);
        }

      } else if (currentMonth >= 2) {
        for (let i = 0; i < 12; i++) {
          this.filteredMonthsArray.push(this.monthsArray[i]);
        }

      }
    } else if (selectedYear < currentYear - 1) {
      this.filteredMonthsArray = this.monthsArray.slice();
    }
  }

  search() {
    // call the api
    this.getEmployeesForLedger();
  }

  reset_btn_click() {
    const currentDate = new Date();
    let currentMonth: any = currentDate.getMonth() + 1; // (1 = January, 12 = December)
    let currentYear: any = currentDate.getFullYear();

    this.filteredYearsArray = [];
    this.filteredMonthsArray = [];

    for (let i = 2023; i <= currentYear; i++) {
      this.filteredYearsArray.push(i);
    };

    if (currentMonth >= 3) { // March to Dec
      this.month = currentMonth - 2;
      this.year = currentYear;

    } else if (currentMonth == 2) { // Feb
      this.month = 12;
      this.year = currentYear - 1;

    } else if (currentMonth == 1) { // Jan
      this.month = 11;
      this.year = currentYear - 1;
    }

    for (let i = 0; i < this.month; i++) {
      this.filteredMonthsArray.push(this.monthsArray[i]);
    }

    this.searchKeyword = '';
  }



  getEmployeesForLedger() {
    this.employeesForLedgerData = [];

    if (!this.searchKeyword) {
      this.toastr.error('Please enter valid TPCode or OrgEmpCode', 'Oops!');
      return;
    }

    this._attendanceService.getEmployeesForLedger({
      'customerAccountId': this.decoded_token.tp_account_id.toString(),
      'searchKeyword': this.searchKeyword,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.employeesForLedgerData = resData.commonData;
          // console.log("employeesForLedgerData", this.employeesForLedgerData)
          this.show_level = '1';
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }
  fetchArearByMonthYearEmpCode(data: any) {
    this.arearByMonthYearEmpCodeData = [];
    this.fetcedArearByMonthYearEmpCodeData = data;

    // console.log(data);

    this._attendanceService.fetchArearByMonthYearEmpCode({
      'customerAccountId': this.decoded_token.tp_account_id.toString(),
      'month': data.mprmonth,
      'year': data.mpryear,
      'empCode': data.emp_code,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.arearByMonthYearEmpCodeData = resData.commonData;
          this.show_level = '2';
          this.viewArrearDetailsData = [];

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }
  bulkLedgerEntry() {
    let data = (this.createLedgerData);

    let formattedData = [{
      empcode: data.emp_code,
      employeename: data.emp_name,
      pancardno: data.pancard
    }];

    // let formattedData = data.map(item => ({
    //   empcode: item.emp_code,
    //   employeename: item.emp_name,
    //   pancardno: item.pancard
    // }));
    // console.log(data, formattedData);
    // return;

    this._attendanceService.bulkLedgerEntry({
      'customerAccountId': this.decoded_token.tp_account_id.toString(),
      'empDetailsArray': formattedData,
      'month': data.mprmonth,
      'year': data.mpryear,
      'remark': this.createLedgerRemark,
      'payMonth': this.pay_month,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.getEmployeesForLedger();
          this.closeCreateLedgerPopup();
          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  openCreateLedgerPopup(data: any) {
    this.createLedgerData = data;
    this.showCreateLedgerPopup = true;
    this.createLedgerRemark = '';
  }

  closeCreateLedgerPopup() {
    this.showCreateLedgerPopup = false;
    this.createLedgerData = '';
    this.createLedgerRemark = '';
    this.pay_month = 'Current';
  }


  viewArrearDetails(action: any, data: any) {
    this.viewArrearDetailsData = [];
    this.actioninfo = action;

    this._attendanceService.viewArrearDetails({
      'action': action,
      'customerAccountId': this.decoded_token.tp_account_id.toString(),
      'month': data.mprmonth,
      'year': data.mpryear,
      'empCode': data.empcode,
      'batchId': data.batchid,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.viewArrearDetailsData = resData.commonData;
          // console.log("viewArrearDetailsData", this.viewArrearDetailsData);
          // this.show_level = '2';
          // this.scrollToTable();
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })
  }

  @ViewChild('arrearDetailsId') table!: ElementRef;

  scrollToTable(): void {
    // console.log('okk')
    const element = document.getElementById('arrearDetailsId');
    if (element) {
      // console.log('okklllll')
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openVerifyArrearPopup(data: any) {
    this.verifyArrearData = data;
    this.showVeriyArrearPopup = true;
  }
  closeVerifyArrearPopup() {
    this.showVeriyArrearPopup = false;
    this.verifyArrearData = {};
    this.pay_month = 'Current';

  }

  verifyArrear() {
    let data = this.verifyArrearData;
    // this.confirmationDialogService.confirm('Are you sure you want to verify', 'Confirm').subscribe(result => {
    //   if (result) {

    this._attendanceService.verifyArrear({
      'customerAccountId': this.decoded_token.tp_account_id.toString(),
      'month': data.mprmonth,
      'year': data.mpryear,
      'empCode': data.emp_code,
      'batchId': data.batch_no,
      'payMonth': this.pay_month,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.viewArrearDetailsData = [];
          this.fetchArearByMonthYearEmpCode(this.fetcedArearByMonthYearEmpCodeData);
          this.closeVerifyArrearPopup();
          // this.show_level = '2';
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e);
      }
    })

    //   } else {

    //   }
    // });

  }


  async getUserList() {
    let obj =
    {
      customerAccountId: this.decoded_token.tp_account_id.toString(),
      productTypeId: this.decoded_token.product_type.toString(),
      searchKeyword: ''
    }

    await this._attendanceService.getCandidateDetails(obj)
      .subscribe((res: any) => {
        if (res.statusCode) {
          this.userList_original = [];
          this.userList_modified = [];

          let userList_original = res.commonData;
          userList_original.map((item) => {
            if (item.isactive) {
              this.userList_original.push({ ...item }); // shallow copy
              item.emp_name = item.emp_name + ` (${item.orgempcode != '' ? item.orgempcode : (item.tpcode ? item.tpcode : item.emp_code)})`
              this.userList_modified.push({ ...item }); // shallow copy
            }
          })

          // console.log('employees', this.userList_modified);
        } else {

        }
      })
  }


  customSearch(term: string, item: any): boolean {
    term = term.toLowerCase();
    return item.orgempcode.toLowerCase().includes(term) || item.tpcode.toLowerCase().includes(term) || item.emp_name.toLowerCase().includes(term);
  }

  updateSearchKeyword(selectedItem: any) {
    if (selectedItem) {
      // Set searchKeyword to orgempcode or tpcode based on preference
      this.searchKeyword = selectedItem.orgempcode || selectedItem.tpcode;
    } else {
      this.searchKeyword = '';
    }
  }

  // Dynamic columns code changes - sidharth kaul dated. 04.06.2025
  GetDynamicFields() {
    this._ReportService.GetReportFields({
      "reportName": "Payment Advice",
      "productTypeId": this.product_type,
      "customerAccountId": this.decoded_token?.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.dynamic_column_data = resData.commonData;
        // console.log("Original - dynamic_column_data", this.dynamic_column_data);

        const rateItems = [];
        const arrearItems = [];
        const earningItems = [];
        const allowanceItems = [];

        this.dynamic_column_data.forEach(item => {
          const column = item.reportcolumnname?.toLowerCase() || '';
          const component = item.reportcomponentname?.toLowerCase() || '';

          if (column.includes('arear')) {
            arrearItems.push(item);
          } else if (column.includes('rate')) {
            rateItems.push(item);
          } else if (component.includes('allowance')) {
            allowanceItems.push(item);
          } else {
            earningItems.push(item); // default is earning
          }
        });

        this.rate_cols = [
          ...rateItems
        ];

        this.arrear_earnings_allowances_cols = [
          ...arrearItems,
          ...earningItems,
          ...allowanceItems
        ]

        // Now use orderedData wherever needed
        // console.log("Updated - rate_cols",this.rate_cols);
        // console.log("Updated - arrear_earnings_allowances_cols",this.arrear_earnings_allowances_cols);

      } else {
        this.dynamic_column_data = [];
        //console.log(resData.message);
      }
    });
  }

  isValueGreaterThanZero(key: string): boolean {
    return this.viewArrearDetailsData.some(report => report[key] > 0);
  }

}
