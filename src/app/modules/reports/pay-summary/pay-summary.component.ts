import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import decode from 'jwt-decode';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { ReportService } from '../report.service';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { AlertService } from 'src/app/shared/_alert';
import { dongleState, grooveState } from 'src/app/app.animation';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FilterField } from '../common-filter/filter.model';

declare var $: any;
@Component({
  selector: 'app-pay-summary',
  templateUrl: './pay-summary.component.html',
  styleUrls: ['./pay-summary.component.css'],
  animations: [grooveState, dongleState]
})
export class PaySummaryComponent {
  showSidebar: boolean = true;
  showPaymentStatusColumn: boolean = false;
  month: any;
  fromdate: any = '';
  isButtonEnabled: boolean = false;
  selectedCount: number = 0;
  todate: any = '';
  salary_data: any = [];
  payout_date: any;
  p: number = 0;
  // total: number = 0;
  // limit: any = 50;
  variable_data: any = [];
  deduction_data: any = [];
  days_count: any;
  includeEmployeeDetails: boolean = false;
  year: any;
  bankDetailsForm: FormGroup;
  isSelected: boolean = false;
  selected_date: any;
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

  yearsArray: any = [];
  product_type: any;
  tp_account_id: any = '';
  token: any = '';
  invKey: any = '';
  filteredEmployees: any = [];
  data: any = [];
  json_data: any = [];
  emp_code: any = '';
  salmonth: any = '';
  salyear: any = '';
  show_label: boolean = true;
  from_date: any = '';
  to_date: any = '';
  isShowSalary: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  filters: FilterField[] = [];
  isSideBar: boolean = true;
  isConsultantEmployee: boolean = false;

  selectedUnitId: any = [];
  selectedDepartmentId: any = [];
  selectedDesignationId: any = [];
  unit_master_list_data: any = [];
  department_master_list_data: any = [];
  role_master_list_data: any = [];

  constructor(
    public toastr: ToastrService,
    private _sessionService: SessionService,
    private _formBuilder: FormBuilder,
    private _alertservice: AlertService,
    private router: Router,
    private _EncrypterService: EncrypterService,
    private _ReportService: ReportService,
    private sanitizer: DomSanitizer) {
    // this.router.params.subscribe((params: any) => {
    //   let id = this._EncrypterService.aesDecrypt(params['emp_code']);
    //   this.salmonth = id.split(',')[0];
    //   this.salyear = id.split(',')[1];
    // });
  }
  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    // this.product_type = token.product_type;
    this.product_type = localStorage.getItem('product_type');
    let currDate = new Date();
    currDate.setMonth(currDate.getMonth() + 1);
    currDate.setDate(currDate.getDate() - currDate.getDate())

    $('#FromDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: currDate
    })

    $('#ToDate').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      maxDate: currDate
    })

    var checkboxes = document.querySelectorAll(
      '.dropdown-item input[type="checkbox"]'
    );
    checkboxes.forEach(function (checkbox) {
      checkbox.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    });
    this.bankDetailsForm = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]]
    });

    this.bankDetailsForm.patchValue({
      FromDate: $('#FromDate').val(),
      ToDate: $('#ToDate').val()
    })


    const date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    for (let i = 2023; i <= currentYear + 1; i++) {
      this.yearsArray.push(i);

    };

    if (localStorage.getItem('selected_date') == null) {
      let prev_month;
      let prev_year;

      if (currentMonth === 0) {
        prev_month = 12;
        prev_year = currentYear - 1;
      } else {
        prev_month = currentMonth;
        prev_year = currentYear;
      }

      let prev_monthdate = new Date(prev_year, prev_month, 0).getDate() + '-' + prev_month + '-' + prev_year;
      localStorage.setItem('selected_date', prev_monthdate);

    }
    this.selected_date = localStorage.getItem('selected_date');

    this.month = this.selected_date.split('-')[1];
    this.year = this.selected_date.split('-')[2];
    this.days_count = new Date(this.year, this.month, 0).getDate()

    // this.paySummary();

    setTimeout(() => {
      this.paySummary();
    }, 1000);

  }

  checkAll(event: any) {
    const isChecked = event.target.checked;
    this.data.forEach(row => {
      if (row.jobtype !== 'Independent Contractors') {
        row.isSelected = isChecked;
      }
    });
    this.updateButtonState(); // Update button state when header checkbox is toggled
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  // get_page(event: any) {
  //   // console.log(event);
  //   this.p = event;
  // }
  updateButtonState() {
    const selectedSlips = this.data.filter(report => report.isSelected);
    this.isButtonEnabled = selectedSlips.length > 1
  }

  isHeaderCheckboxChecked(): boolean {
    return this.data.some(report => report.isSelected);
  }


  changeMonth(e: any) {
    this.month = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

  }

  changeYear(e: any) {
    this.year = e.target.value;
    let date = new Date(this.year, this.month, 0).getDate() + '-' + this.month + '-' + this.year;
    this.selected_date = date;
    localStorage.setItem('selected_date', date);

  }

  // add by akchhaya 17-02-2025 start
  applyFilters(filters: any) {
    this.month = filters.month;
    this.year = filters.year;
    this.invKey = filters.invKey,
    this.selectedUnitId = filters.unitId,
    this.selectedDepartmentId = filters.departmentId,
    this.selectedDesignationId = filters.designationId,
    this.paySummary();
  }
  // add by akchhaya 17-02-2025 end
  search(key: any) {
    console.log(key, 'keyyyyyyyyyyyyyy')
    this.invKey = key;
    this.p = 0;
    this.filteredEmployees = this.data.filter(function (element: any) {
      console.log(element);
      return (element.emp_name.toLowerCase().includes(key.toLowerCase())
        || element?.tpcode.toString().toLowerCase().includes(key.toLowerCase())
        || element?.orgempcode.toString().toLowerCase().includes(key.toLowerCase())
      )
    });
  }

 
  parseDateTime(dateTimeString: string): Date {
    // Split the date and time parts
    const [datePart, timePart] = dateTimeString?.split(' ');
    // Split the date into day, month, and year
    const [day, month, year] = datePart?.split('/');
    // Create a new Date object
    return new Date(+year, +month - 1, +day);
  }

  paySummary() {
    // this.from_date = $('#FromDate').val();
    // this.to_date = $('#ToDate').val();
    // add by ak 17-02-2025 start 
    const unitIds = this.selectedUnitId.length === this.unit_master_list_data.length
      ? this.unit_master_list_data.map(unit => unit.unitid).join(',')
      : this.selectedUnitId.map(unit => unit.unitid).join(',');

    // Handle postingDepartment
    const postingDepartment = this.selectedDepartmentId.length === this.department_master_list_data.length
      ? this.department_master_list_data.map(dept => dept.posting_department).join(',')
      : this.selectedDepartmentId.map(dept => dept.posting_department).join(',');

    const postOffered = this.selectedDesignationId.length === this.role_master_list_data.length
      ? this.role_master_list_data.map(dept => dept.post_offered).join(',')
      : this.selectedDesignationId.map(dept => dept.post_offered).join(',');
    // add by ak 17-02-2025 end 
    this.from_date = "01/" + (this.month.toString().length == 1 ? ("0" + this.month.toString()) : this.month.toString()) + "/" + this.year.toString();
    this.to_date = (new Date(this.year, this.month, 0).getDate().toString()) + "/" + (this.month.toString().length == 1 ? ("0" + this.month.toString()) : this.month.toString()) + "/" + this.year.toString();

    localStorage.setItem('from_date', this.from_date);
    localStorage.setItem('to_date', this.to_date);
    //console.log(this.from_date, this.to_date);
    // EmployeesPaySummary
    this._ReportService.EmployeesPaySummary({
      "customerAccountId": this.tp_account_id.toString(),
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "GeoFenceId": this.token.geo_location_id,
      "unitParameterName": unitIds,
      "postOffered": postOffered,
      "postingDepartment": postingDepartment
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {
        this.data = resData.commonData;
        this.filteredEmployees = this.data;
        this.search(this.invKey);
        let consultantEmployees = this.filteredEmployees.filter(emp => emp.jobtype == 'Independent Contractors');
        if (consultantEmployees.length > 0) this.isConsultantEmployee = true;
        // Assuming payout_mode_type is available in the data
        this.showPaymentStatusColumn = this.filteredEmployees.some(employee => employee.payout_mode_type === 'standard');
      } else {
        this.filteredEmployees = [];
        this.show_label = false;
        this.showPaymentStatusColumn = false;
        this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
      }
    });
  }

  // getSalaryDetail(data: any) {

  //   let id = data.emp_code + ',' + data.salmonth+ ',' + data.salyear;
  //   if (id != '' && id != undefined) {

  //     this.router.navigate(['/reports/pay-summary/salary-slip', this._EncrypterService.aesEncrypt(id.toString())]);
  //   } else {

  //     this.toastr.info('Somthing went Wrong. Please try later.', 'Success');
  //   }

  // }
  // getSalaryDetail(data: any) {
  //   // let selectedEmployees = this.data.filter(employee => employee.isSelected);
  //   console.log(data)
  //   // return;
  //   let id =data.salary_slip_input;
  //   if (id != '' && id != undefined) {
  //     this.router.navigate(['/reports/pay-summary/salary-slip', this._EncrypterService.aesEncrypt(id.toString())]);
  //   } else {
  //     this.toastr.info('Something went wrong. Please try later.', 'Success');

  //   }
  // }
  get_advance_SalaryDetail(data: any, isAdvance: string) {
    // let selectedEmployees = this.data.filter(employee => employee.isSelected);
    this.isShowSalary = true;
    let body = document.querySelector('body');
    if (body) {
      body.classList.add('modal-open');
    }
    this._ReportService.getSalarySlip({
      'productTypeId': this.product_type,
      'empCodeString': data.salary_slip_input,
      'isPayslipAdvance': isAdvance
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(resData.pdfPath);
        // this.toastr.showToastr('success','Salary slip fetched successfully');
      } else {
        // this.toastr.showToastr('error','Something wrong');
      }
    })
  }

  Salary_Slip() {
    this._ReportService.SalarySlip({
      "customerAccountId": this.tp_account_id.toString(),
      "month": this.salmonth,
      "year": this.salyear,
      "empCode": this.emp_code,
      "GeoFenceId": this.token.geo_location_id

    }).subscribe((resData: any) => {

      if (resData.statusCode) {
        this.salary_data = resData.commonData.salaryStructureDetails;
        this.variable_data = resData.commonData.variablesDetails;
        this.deduction_data = resData.commonData.deductionDetails;
      } else {
        this.salary_data = [];
        this.variable_data = [];
        this.deduction_data = [];
        this.show_label = false;
      }
    });

  }

  // downloadSelectedSlips() {
  //   const selectedSlips = this.data.filter(report => report.isSelected);

  //   if (selectedSlips.length === 0) {
  //     // Show a message or handle the case where no slips are selected
  //     return;
  //   } else if (selectedSlips.length > 1) {
  //     // Multiple employees selected, navigate to 'multiple-salary-slip' component
  //     let empCodes = selectedSlips.map(employee => employee.emp_code);

  //     let salmonth = selectedSlips.map(month => month.sal_month_year);
  //     console.log(salmonth);

  //     // let salyear = selectedSlips[0].salyear;
  //     this.router.navigate(['/reports/pay-summary/multiple-salary-slip', {
  //       empCodes: this._EncrypterService.aesEncrypt(empCodes.toString()),
  //       salmonth: this._EncrypterService.aesEncrypt(salmonth.toString()),
  //       // salyear: this._EncrypterService.aesEncrypt(salyear.toString())
  //     }]);
  //   }
  // }

  downloadSelectedSlips(payslipFlag: string) {
    const selectedSlips = this.data.filter(report => report.isSelected);

    if (selectedSlips.length === 0) {
      // Show a message or handle the case where no slips are selected
      return;
    } else if (selectedSlips.length > 1) {
      // Multiple employees selected, navigate to 'multiple-salary-slip' component
      let empCodes = selectedSlips.map(employee => ({
        empCode: employee.salary_slip_input,
        salMonthYear: employee.sal_month_year,
        paySlipFlag: payslipFlag
      }));

      const encryptedEmpCodes = this._EncrypterService.aesEncrypt(JSON.stringify(empCodes));

      // Construct the URL with parameters
      const url = this.router.createUrlTree(['/reports/pay-summary/multiple-salary-slip'], {
        queryParams: { empCodes: encryptedEmpCodes }
      }).toString();

      // Open the URL in a new tab
      window.open(url, '_blank');
    }
  }

  Reset() {
    this.bankDetailsForm.reset();
  }

  exportToExcel() {

    this._ReportService.EmployeesPaySummary({
      "customerAccountId": this.tp_account_id.toString(),
      "fromDate": this.from_date,
      "toDate": this.to_date,
      "GeoFenceId": this.token.geo_location_id
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.data = resData.commonData;
        // console.log(this.data);
        let exportData = [];
        let days = {};
        for (let i = 0; i < resData.commonData.length; i++) {
          let head = resData.commonData[i].w_date_d
          // + resData.commonData[i].dayname;
          days = {
            ...days, [head]: ''
          }
        }

        for (let idx = 0; idx < this.data.length; idx++) {
          let obj = {
            'Employee Name': this.data[idx].emp_name,
            'Employee Code': this.data[idx].emp_code,
            'Salary Month': this.data[idx].salmonth,


          }

          exportData.push(obj);
        }

        // console.log(exportData);
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const downloadLink: any = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(data);
        let date = new Date()
        downloadLink.download = `Pay-Summary.xlsx`;
        downloadLink.click();
      }
    })
  }


  getSalaryDetail(report: any) {
    this.isShowSalary = true;
    let body = document.querySelector('body');
    if (body) {
      body.classList.add('modal-open');
    }
    this._ReportService.getSalarySlip({
      'productTypeId': this.product_type,
      'empCodeString': report.salary_slip_input,
      'isPayslipAdvance': 'N'
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(resData.pdfPath);
        // this.toastr.showToastr('success','Salary slip fetched successfully');
      } else {
        // this.toastr.showToastr('error','Something wrong');
      }
    })
  }
  hideSalarySlip() {
    this.isShowSalary = false;
    this.pdfUrl = null;
    let body = document.querySelector('body');
    if (body) {
      body.classList.remove('modal-open');
    }
  }

  get_consultant_invoice(data: any) {
    let id = data?.emp_code + ',' + data?.salmonth + ',' + data?.salyear;
    if (id != '' && id != undefined) {
      this.router.navigate(['/reports/pay-summary/consultant-invoice', this._EncrypterService.aesEncrypt(id.toString())]);
    } else {
      this.toastr.info('Something went wrong. Please try later.', 'Success');

    }
  }

  sendMail(empData: any): any {
    if (!empData.email) {
      return this.toastr.error("Please update the email id for this employee");
    }
    this._ReportService.getSalarySlip({
      'productTypeId': this.product_type,
      'empCodeString': empData.salary_slip_input,
      'isPayslipAdvance': 'N'
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let pdfPath = resData.pdfPath;
        // console.log(empData)
        // return
        this._ReportService.sendSalaryPdf({
          email: empData.email, salary_month_year: empData.sal_month_year,
          payslip: pdfPath, emp_name: empData.emp_name
        }).subscribe((resData: any) => {
          if (resData.statusCode) {
            this.toastr.success(resData.message);
          } else {
            this.toastr.error(resData.message);
          }
        })
      } else {
        this.toastr.error(resData.message);
      }
    })
  }
}
