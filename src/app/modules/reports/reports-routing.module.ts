import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report/report.component';
import { LiabilityReportComponent } from './liability-report/liability-report.component';
import { SalaryVerificationComponent } from './salary-verification/salary-verification.component';
import { FetchBankReportComponent } from './fetch-bank-report/fetch-bank-report.component';
import { EPFECRComponent } from './epf-ecr/epf-ecr.component';
import { ESIECRComponent } from './esi-ecr/esi-ecr.component';
import { LwfReportComponent } from './lwf-report/lwf-report.component';
import { ProofOfInvestmentComponent } from './proof-of-investment/proof-of-investment.component';
import { InvestmentDeclarationComponent } from './investment-declaration/investment-declaration.component';
import { DisbursementReportComponent } from './disbursement-report/disbursement-report.component';
import { PreAttendanceComponent } from './pre-attendance/pre-attendance.component';
import { EpfSummaryComponent } from './epf-summary/epf-summary.component';
import { EsiSummaryComponent } from './esi-summary/esi-summary.component';
import { PaySummaryComponent } from './pay-summary/pay-summary.component';
import { SalarySlipComponent } from './pay-summary/salary-slip/salary-slip.component';
// import { TaxReportComponent } from './investment-declaration/tax-report/tax-report.component';
// import { AllReportComponent } from './investment-declaration/all-report/all-report.component';
import { CheckInComponent } from './check-in/check-in.component';
import { CheckInByEmpCodeComponent } from './check-in/check-in-by-emp-code/check-in-by-emp-code.component';
import { BiometricPunchesComponent } from './biometric-punches/biometric-punches.component';
import { MultipleSalarySlipComponent } from './pay-summary/multiple-salary-slip/multiple-salary-slip.component';
import { EmployeeAttStatusComponent } from './employee-att-status/employee-att-status.component';
import { DailyLeaveReportComponent } from './leave-report/daily-leave/daily-leave-report.component';
import { EmployeeLeaveBalanceComponent } from './leave-report/employee-leave-balance/employee-leave-balance.component';
import { LeaveBookedBalanceComponent } from './leave-report/leave-booked-balance/leave-booked-balance.component';
import { AttDataPayrollComponent } from './attendance-report/att-data-payroll/att-data-payroll.component';
import { DailyAttStatusComponent } from './attendance-report/daily-att-status/daily-att-status.component';
import { DsrDaReportComponent } from './dsr-da-report/dsr-da-report.component';
import { AllVisitorReportComponent } from './all-visitor-report/all-visitor-report.component';
import { CardWiseVisitorComponent } from './card-wise-visitor/card-wise-visitor.component';
import { VisitorSummaryComponent } from './visitor-summary/visitor-summary.component';
import { UanReportComponent } from './uan-report/uan-report.component';
import { EsicReportComponent } from './esic-report/esic-report.component';
import { ReportAttMissedPunchComponent } from './report-att-missed-punch/report-att-missed-punch.component';
import { AttDeviationReportComponent } from './att-deviation-report/att-deviation-report.component';
import { ReportPaymentComponent } from './report-payment/report-payment.component';
import { LoanOutstandingReportComponent } from './loan-outstanding-report/loan-outstanding-report.component';
import { MeetingReportComponent } from './meeting-report/meeting-report.component';
import { MeetingByEmpCodeComponent } from './meeting-report/meeting-by-emp-code/meeting-by-emp-code.component';
import { MonthlyCheckInOutReportComponent } from './monthly-check-in-out-report/monthly-check-in-out-report.component';
import { AssetInventoryComponent } from './asset-inventory/asset-inventory.component';
import { AssetStatusComponent } from './asset-status/asset-status.component';
import { AssetAssignmentComponent } from './asset-assignment/asset-assignment.component';
import { AdvanceSalaryComponent } from './pay-summary/advance-salary/advance-salary.component';
import { IncrementReportComponent } from './increment-report/increment-report.component';
import { ConsultantInvoiceComponent } from './pay-summary/consultant-invoice/consultant-invoice.component';
import { InOutTimeReportComponent } from './in-out-time-report/in-out-time-report.component';
import { ExpensesReportComponent } from './expenses-report/expenses-report.component';
import { AccountTwentyOneComponent } from './account-twenty-one/account-twenty-one.component';
import { MonthlyInOutShiftReportComponent } from './monthly-in-out-shift-report/monthly-in-out-shift-report.component';
import { AuditLogReportComponent } from './audit-log-report/audit-log-report.component';
import { BillingReportComponent } from './billing-report/billing-report.component';
import { AnnualReportComponent } from './annual-report/annual-report.component';
import { TaggedUntaggedComponent } from './tagged-untagged/tagged-untagged.component';
import { DeclarationSubmittedReportComponent } from './declaration-submitted-report/declaration-submitted-report.component';
import { VariablePayEarningReportComponent } from './variable-pay-earning-report/variable-pay-earning-report.component';
import { ContractRenewalComponent } from './contract-renewal/contract-renewal.component';
import { ProbationPeriodComponent } from './probation-period/probation-period.component';
import { EmpDailyHourwiseReportComponent } from './emp-daily-hourwise-report/emp-daily-hourwise-report.component';
import { MonthlyHourSummaryReportComponent } from './monthly-hour-summary-report/monthly-hour-summary-report.component';
import { TdsReportComponent } from './tds-report/tds-report.component';
import { ArrearReportComponent } from './arrear-report/arrear-report.component';

const routes: Routes = [

  {
    path: '', component: ReportComponent
  },
  {
    path: 'liability-report',
    component: LiabilityReportComponent
  },
  {
    path: 'salary-verification',
    component: SalaryVerificationComponent
  },
  {
    path: 'fetch-bank-report',
    component: FetchBankReportComponent
  },
  {
    path: 'epf-ecr',
    component: EPFECRComponent
  },
  {
    path: 'esi-ecr',
    component: ESIECRComponent
  },
  {
    path: 'lwf-report',
    component: LwfReportComponent
  },

  {
    path: 'Proof-of-Investment',
    component: ProofOfInvestmentComponent
  },
  {
    path: 'Investment-Declaration',
    component: InvestmentDeclarationComponent
  },
  {
    path: 'disbursement-report',
    component: DisbursementReportComponent
  }, {
    path: 'pre-attendance',
    component: PreAttendanceComponent
  },
  {
    path: 'epf-summary',
    component: EpfSummaryComponent
  },
  {
    path: 'esi-summary',
    component: EsiSummaryComponent
  }, {
    path: 'pay-summary',
    component: PaySummaryComponent
  },
  {
    path: 'pay-summary/salary-slip/:id',
    component: SalarySlipComponent
  },
  {
    path: 'report_payment',
    component: ReportPaymentComponent
  },
  {
    path: 'loan_outstanding_report',
    component: LoanOutstandingReportComponent
  },
  // {
  //   path: 'tax-report',
  //   component: TaxReportComponent
  // },
  // {
  //   path: 'all-report',
  //   component: AllReportComponent
  // },

  {
    path: 'check-in',
    component: CheckInComponent
  }, {
    path: 'biometric_punches',
    component: BiometricPunchesComponent
  }, {
    path: 'check-in/check-in-by-emp-code',
    component: CheckInByEmpCodeComponent
  },
  {
    path: 'pay-summary/multiple-salary-slip',
    component: MultipleSalarySlipComponent
  },
  {
    path: 'employee-att-status',
    component: EmployeeAttStatusComponent
  },
  {
    path: 'monthly_check_inout_report',
    component: MonthlyCheckInOutReportComponent
  },
  {
    path: 'leave/daily-leave-report',
    component: DailyLeaveReportComponent
  },
  {
    path: 'leave/employee-leave-balance',
    component: EmployeeLeaveBalanceComponent
  },
  {
    path: 'leave/leave-booked-balance',
    component: LeaveBookedBalanceComponent
  },
  {
    path: 'att-data-payroll',
    component: AttDataPayrollComponent
  },
  {
    path: 'daily-att-status',
    component: DailyAttStatusComponent
  },
  {
    path: 'dsr-da-report',
    component: DsrDaReportComponent
  }, {
    path: 'card_wise_visitor',
    component: CardWiseVisitorComponent
  },
  {
    path: 'all_visitor_report',
    component: AllVisitorReportComponent
  },
  {
    path: 'vistors_summary',
    component: VisitorSummaryComponent
  },
  {
    path: 'uan_report',
    component: UanReportComponent
  },
  {
    path: 'esic_report',
    component: EsicReportComponent
  },
  {
    path: 'missed-punch-report',
    component: ReportAttMissedPunchComponent
  },
  {
    path: 'deviation-report',
    component: AttDeviationReportComponent
  }, {
    path: 'meeting_report',
    component: MeetingReportComponent
  },
  {
    path: 'meeting_report/meeting_by_emp-code',
    component: MeetingByEmpCodeComponent
  },
  {
    path: 'asset-inventory',
    component: AssetInventoryComponent
  },
  {
    path: 'asset-status',
    component: AssetStatusComponent
  },
  {
    path: 'asset-assignment',
    component: AssetAssignmentComponent
  },
  {
    path: 'pay-summary/advance-slip/:id',
    component: AdvanceSalaryComponent
  },
  {
    path: 'in-out-time-report',
    component: InOutTimeReportComponent
  }, {
    path: 'pay-summary/consultant-invoice/:id',
    component: ConsultantInvoiceComponent
  },
  {
    path: 'increment-report',
    component: IncrementReportComponent
  },
  {
    path: 'expenses-report',
    component: ExpensesReportComponent
  },
  {
    path: 'account-twenty-one',
    component: AccountTwentyOneComponent
  },
  {
    path: 'monthly-in-out-shift-report',
    component: MonthlyInOutShiftReportComponent
  },
  {
    path: 'audit-log-report',
    component: AuditLogReportComponent
  },
  {
    path: 'billing-report',
    component: BillingReportComponent
  },

  {
    path: 'annual-report',
    component: AnnualReportComponent
  },
  {
    path: 'tagged-untagged',
    component: TaggedUntaggedComponent
  },
  {
    path: 'declaration-submitted-report',
    component: DeclarationSubmittedReportComponent
  },
  {
    path: 'var-pay-earning-report',
    component: VariablePayEarningReportComponent
  },
  {
    path: 'contract-renewal',
    component: ContractRenewalComponent
  },
  {
    path: 'probation-period',
    component: ProbationPeriodComponent
  },
  {
    path: 'employee-daily-hour-wise',
    component: EmpDailyHourwiseReportComponent
  },
  {
    path: 'monthly-hour-summary',
    component: MonthlyHourSummaryReportComponent
  }, {
    path: 'tds-report',
    component: TdsReportComponent
  },{
  path: 'arrear-report',
  component: ArrearReportComponent
}


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
