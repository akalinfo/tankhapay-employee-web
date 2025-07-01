import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { PayoutService } from '../../payout/payout.service';
import { BusinesSettingsService } from '../business-settings.service';
declare var $: any;
@Component({
  selector: 'app-payout-setting',
  templateUrl: './payout-setting.component.html',
  styleUrls: ['./payout-setting.component.css']
})
export class PayoutSettingComponent {
  first_payroll_status:any;
  orgworkingdays:any;
  salarycalcbasis:any;
  first_payroll_execute_day:any;
  master_data:any=[];
  showSidebar: boolean = true;
  decoded_token: any;
  employer_profile: any = [];
  business_detail: FormGroup;
  payout_date_form: FormGroup;
  tp_account_id: any;
  product_type: any = '';
  payout_days_arr: any = [];
  cur_payout_day: string = '';
  showAssistantBtn = false;
  months: { value: number, label: string }[] = [];
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  current_Month: number;
  payout_period:any;
  first_payroll_day:any;
  firstPayrollMonthIndex:any;
  payPeriodLabel: string = '';
  constructor(private _BusinesSettingsService: BusinesSettingsService,
    private toastr: ToastrService,
    private _sessionService: SessionService,
    private _alertservice: AlertService,
    private _formBuilder: FormBuilder,
    private _EncrypterService: EncrypterService,
    private router: Router,
  private _PayoutService: PayoutService) {

    // let assistant_status = localStorage.getItem('assistant_status');
    // if (assistant_status != null && assistant_status == 'Y') {
    //   this.showAssistantBtn = true;
    //   // this.showSidebar = false;
    // }

    if (this.router.getCurrentNavigation().extras.state != undefined && this.router.getCurrentNavigation().extras.state.page != undefined) {
      this.showAssistantBtn = true;
    }
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    // localStorage.setItem('activeTab', 'id_Business-settings');

    for (let i = 1; i <= 31; i++) {
      this.payout_days_arr.push(i);

    };
    this.current_Month = new Date().getMonth();

    this.business_detail = this._formBuilder.group({
      employer_name: [''],
      user_type: [''],
      employer_mobile: [''],
      employer_email: [''],
      registered_address: [''],
      billing_address: [''],
      payout_date: ['']
    });
    this.payout_date_form = this._formBuilder.group({
      payout_date: [''],
      firstPayrollDate:[''],
      payoutPeriod: [''],
      Payout_Date:[''],
      salaryCalculationBasis:[''],
      orgWorkingDays:[''],
      firstPayrollExecuteDate:['']

    });
    this.CheckPayroll_RunStatus();
    this.getMasterData();
    // this.initializeMonths();
    this.setDefaultMonthSelection();
    this.get_employer_profile()
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeDatepicker(true);
    }, 500);
  }
  initializeMonths(): void {
    let currentYear = new Date().getFullYear();

    if (this.employer_profile && this.employer_profile.first_payroll_execute_day) {
      currentYear = this.employer_profile.first_payroll_execute_day.split('/')[2]
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // console.log(currentYear);

    this.months = monthNames.map((month, index) => ({
      value: index,
      label: `${month}-${currentYear}`
    }));

  }
  setDefaultMonthSelection(): void {
        // console.log('ff',this.first_payroll_day);

    if (this.first_payroll_day) {
      const dateParts = this.first_payroll_day.split('/');
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Months are 0-based
      const year = parseInt(dateParts[2], 10);
      this.currentYear = year;
      this.payout_date_form.controls['firstPayrollDate'].setValue(month);
      this.updatePayPeriodLabel(month);
    } else {
      // Default to the current month if `first_payroll_day` is not available
      this.payout_date_form.controls['firstPayrollDate'].setValue(this.currentMonth);
      this.updatePayPeriodLabel(this.currentMonth);
    }
  }
  onMonthChange(event: any) {
    const selectedValue = (event.target.value);
    const selectedDate = new Date(new Date().getFullYear(), selectedValue, 1);
    const formattedDate = this.formatDate(selectedDate);
    this.payout_date_form.controls['firstPayrollDate'].setValue(selectedValue);
    this.payout_date_form.patchValue({
      firstPayrollExecuteDate: '', // Empty the firstPayrollExecuteDate
    });
    this.initializeDatepicker();
    this.updatePayPeriodLabel(selectedValue);
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  initializeDatepicker(isInitialLoad = false) {
    const currentYear = new Date().getFullYear();

    // Get the selected month from the form control or default to the current month
    const selectedMonthIndex = isInitialLoad
      ? (this.firstPayrollMonthIndex !== undefined ? this.firstPayrollMonthIndex : new Date().getMonth())
      : +this.payout_date_form.controls['firstPayrollDate'].value;

    // Set the start and end dates for the date picker
    const startMonth = new Date(currentYear, selectedMonthIndex, 1);
    const endMonth = new Date(currentYear, selectedMonthIndex + 2, 0);

    // Adjust for year transition
    if (selectedMonthIndex === 11) {
      endMonth.setFullYear(currentYear + 1);
      endMonth.setMonth(0); // January
    }

    $('#ToDate').datepicker('destroy').datepicker({
      dateFormat: 'dd/mm/yy',
      changeMonth: true,
      changeYear: true,
      minDate: startMonth,
      maxDate: endMonth
    });
  }

  get_employer_profile() {
    this.employer_profile = [];

    this._BusinesSettingsService
        .getEmployerProfile({
            customeraccountid: (this.tp_account_id),
            productTypeId: this.product_type,
        })
        .subscribe((resData: any) => {
            if (resData.statusCode) {
                this.employer_profile = resData.commonData;
                this.cur_payout_day = this.employer_profile.payout_frequency_dt;
                this.payout_period = this.employer_profile.payout_period;
                this.first_payroll_day = this.employer_profile.first_payroll_day;
                const firstPayrollDate = new Date(this.first_payroll_day?.split('/').reverse().join('-'));
                this.firstPayrollMonthIndex = firstPayrollDate.getMonth();
                this.orgworkingdays = this.employer_profile.orgworkingdays;
                this.first_payroll_execute_day = this.employer_profile.first_payroll_execute_day;
                this.salarycalcbasis = this.employer_profile.salarycalcbasis;

                let subtext = 'th';
                if (this.cur_payout_day == '2' || this.cur_payout_day == '22') {
                    subtext = 'nd';
                }
                if (this.cur_payout_day == '1' || this.cur_payout_day == '21' || this.cur_payout_day == '31') {
                    subtext = 'st';
                }
                if (this.cur_payout_day == '3' || this.cur_payout_day == '23') {
                    subtext = 'rd';
                }

                this.payout_date_form.patchValue({
                  payoutPeriod: this.payout_period,
                  Payout_Date: this.cur_payout_day,
                  salaryCalculationBasis: this.salarycalcbasis,
                  orgWorkingDays: this.orgworkingdays,
                  firstPayrollDate: this.firstPayrollMonthIndex,
              });

              if (this.first_payroll_status === 'Y') {
                  this.payout_date_form.patchValue({
                      // firstPayrollDate: this.first_payroll_day,
                      firstPayrollDate: this.firstPayrollMonthIndex,
                      firstPayrollExecuteDate: this.first_payroll_execute_day,
                  });
                   this.disablePayoutFields();  // Disable input fields
              }
                this.updatePayPeriodLabel(this.firstPayrollMonthIndex);
                this.business_detail.patchValue({
                    employer_name: this.employer_profile.full_name,
                    user_type: this.employer_profile.user_type,
                    employer_mobile: this.employer_profile.employer_mobile,
                    employer_email: this.employer_profile.employer_email,
                    registered_address: (this.employer_profile.company_address + ' ' + this.employer_profile.company_town_city
                        + ' ' + this.employer_profile.company_pincode + '  ' + this.employer_profile.company_state
                    ).trim(),
                    billing_address: this.employer_profile.bill_address + '  ' + this.employer_profile.bill_city + '  ' + this.employer_profile.bill_pincode + '  ' + this.employer_profile.bill_state,
                    payout_date: this.employer_profile.payout_frequency_dt + subtext + ' of every month',
                });

                this.payout_date_form.patchValue({ payout_date: this.employer_profile.payout_frequency_dt });
                this.initializeDatepicker(true);
            } else {
                this.employer_profile = [];
                this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
                this.toastr.error(resData.message, 'Oops!');
            }

            this.initializeMonths();
        });
}

 getMasterData(){
    this._PayoutService.GetMaster({
      "actionType": "GetOrganisationWorkingDays",
      "productTypeId": this.product_type,
    }).subscribe((resData: any) => {
      // console.log(resData);
      if (resData.statusCode) {

        this.master_data = resData.commonData;
        // console.log(this.master_data);

      } else {
        this.master_data = [];
        this.toastr.error(resData.message);
      }
    });
  }

  handleUpdate() {
    // console.log(this.payout_date_form.value);
    const payoutPeriod = this.payout_date_form.controls['payoutPeriod']?.value;
    // console.log(payoutPeriod);
    // return;
    if (!payoutPeriod) {
      this.toastr.error('Please select a payout period before updating.', 'Validation Error');
      return;
    }
    if (payoutPeriod === 'Advance') {
      this.SetPayoutForm_for_advance();
    } else if (payoutPeriod === 'Current') {
      this.SetPayoutForm_for_current();
    }
  }

  onSalaryCalculationBasisChange() {
    const selectedBasis = this.payout_date_form.controls['salaryCalculationBasis']?.value;

    if (selectedBasis === 'ActualMonthDays') {
      this.payout_date_form.controls['orgWorkingDays']?.setValue(30);
    }
  }
  updatePayPeriodLabel(monthIndex: number): void {
    const selectedMonth = this.months.find(month => month.value === Number(monthIndex));
    this.payPeriodLabel = selectedMonth ? selectedMonth.label : '';
  }
  SetPayoutForm_for_current() {
    const salaryCalculationBasis = this.payout_date_form.controls['salaryCalculationBasis']?.value;
    const orgWorkingDays = salaryCalculationBasis === 'ActualMonthDays' ? '30' : this.payout_date_form.controls['orgWorkingDays']?.value;
    let formattedDate: string;
    let firstPayrollExecuteDate: string;

    if (this.first_payroll_status === 'Y') {
      // Use the values from the API response if the status is 'Y'
      formattedDate = this.first_payroll_day && this.first_payroll_day !== '' ? this.first_payroll_day : this.getPreviousMonthFirstDate();
      firstPayrollExecuteDate = this.first_payroll_execute_day && this.first_payroll_execute_day !== '' ? this.first_payroll_execute_day : this.getCurrentMonthFirstDate();
    } else {
      // Calculate the date based on user input
      const firstPayrollMonthIndex = this.payout_date_form.controls['firstPayrollDate']?.value;
      const selectedDate = new Date(this.currentYear, firstPayrollMonthIndex, 1);
      formattedDate = this.formatDate(selectedDate);
      firstPayrollExecuteDate = $('#ToDate').val();
    }

    this._BusinesSettingsService
      .updateEmployerProfile({
        action: 'PayoutDateSet',
        customeraccountid: JSON.stringify(this.tp_account_id),
        productTypeId: this.product_type,
        payout_frequency_dt: this.payout_date_form.controls['payout_date']?.value,
        payoutPeriod: 'Current',
        firstPayrollDate: formattedDate,
        orgWorkingDays: orgWorkingDays?.toString(),
        salaryCalculationBasis: this.payout_date_form.controls['salaryCalculationBasis']?.value,
        firstPayrollExecuteDate: firstPayrollExecuteDate
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.get_employer_profile();
          this.CheckPayroll_RunStatus();
          this.refreshMaterializedViewByApi('tpay-business-account');
          if (this.showAssistantBtn) {
            this.router.navigate(['/dashboard/salary-stucture'], { state: { 'page': 'welcome' } });
          }
        } else {
          this.employer_profile = [];
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          this.toastr.error(resData.message, 'Oops!');
        }
      });
  }


  SetPayoutForm_for_advance() {
    const salaryCalculationBasis = this.payout_date_form.controls['salaryCalculationBasis']?.value;
    const orgWorkingDays = salaryCalculationBasis === 'ActualMonthDays' ? '30' : this.payout_date_form.controls['orgWorkingDays']?.value;
    let formattedDate: string;
    let firstPayrollExecuteDate: string;

    if (this.first_payroll_status === 'Y') {
      // Use the values from the API response if the status is 'Y'
      formattedDate = this.first_payroll_day && this.first_payroll_day !== '' ? this.first_payroll_day : this.getPreviousMonthFirstDate();
      firstPayrollExecuteDate = this.first_payroll_execute_day && this.first_payroll_execute_day !== '' ? this.first_payroll_execute_day : this.getCurrentMonthFirstDate();
    } else {
      // Calculate the date based on user input
      const firstPayrollMonthIndex = this.payout_date_form.controls['firstPayrollDate']?.value;
      const selectedDate = new Date(this.currentYear, firstPayrollMonthIndex, 1);
      formattedDate = this.formatDate(selectedDate);
      firstPayrollExecuteDate = $('#ToDate').val();
    }

    this._BusinesSettingsService
      .updateEmployerProfile({
        action: 'PayoutDateSet',
        customeraccountid: JSON.stringify(this.tp_account_id),
        productTypeId: this.product_type,
        payout_frequency_dt: "31",
        payoutPeriod: 'Advance',
        firstPayrollDate: formattedDate,
        orgWorkingDays: orgWorkingDays?.toString(),
        salaryCalculationBasis: this.payout_date_form.controls['salaryCalculationBasis']?.value,
        firstPayrollExecuteDate: firstPayrollExecuteDate
      })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.get_employer_profile();
          this.CheckPayroll_RunStatus();
          this.refreshMaterializedViewByApi('tpay-business-account');
          if (this.showAssistantBtn) {
            this.router.navigate(['/dashboard/salary-stucture'], { state: { 'page': 'welcome' } });
          }
        } else {
          this.employer_profile = [];
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          this.toastr.error(resData.message, 'Oops!');
        }
      });
  }
  getPreviousMonthFirstDate(): string {
    const date = new Date(this.currentYear, this.currentMonth - 1, 1);
    return this.formatDate(date);
  }

  getCurrentMonthFirstDate(): string {
    const date = new Date(this.currentYear, this.currentMonth, 1);
    return this.formatDate(date);
  }
    CheckPayroll_RunStatus() {
      this._BusinesSettingsService
          .CheckPayrollRunStatus({
              customerAccountId: this.tp_account_id?.toString(),
              productTypeId: this.product_type,
          })
          .subscribe((resData: any) => {
              if (resData.statusCode) {
                  // this.toastr.success(resData.message, 'Success');
                  this.first_payroll_status = this._EncrypterService.aesDecrypt(resData.commonData);
              // console.log(this.first_payroll_status);

                  if (this.first_payroll_status === 'Y') {
                      this.get_employer_profile(); // Fetch values from API
                      this.disablePayoutFields();  // Disable user input fields
                  }

              } else {
                  this.first_payroll_status = '';
                  this.toastr.error(resData.message, 'Oops!');
              }
          });
  }
  disablePayoutFields() {
    this.payout_date_form.controls['firstPayrollDate'].disable();
    this.payout_date_form.controls['firstPayrollExecuteDate'].disable();
}

  refreshMaterializedViewByApi(action: any) {

    this._BusinesSettingsService.RefreshMaterializedViewByApi({
      'action': action
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          // this.toastr.success(resData.message, 'Success');
          console.log('Refresh Success');

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }, error: (e) => {
        console.log(e)
      }
    })
  }
  

}
