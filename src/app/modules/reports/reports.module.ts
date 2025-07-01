import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportComponent } from './report/report.component';
import { CoreModule } from "../../components/core/core.module";
import { LiabilityReportComponent } from './liability-report/liability-report.component';
import { SalaryVerificationComponent } from './salary-verification/salary-verification.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FetchBankReportComponent } from './fetch-bank-report/fetch-bank-report.component';
import { EPFECRComponent } from './epf-ecr/epf-ecr.component';
import { ESIECRComponent } from './esi-ecr/esi-ecr.component';
import { LwfReportComponent } from './lwf-report/lwf-report.component';
import { InvestmentDeclarationComponent } from './investment-declaration/investment-declaration.component';
import { ProofOfInvestmentComponent } from './proof-of-investment/proof-of-investment.component';
import { DisbursementReportComponent } from './disbursement-report/disbursement-report.component';
import { PreAttendanceComponent } from './pre-attendance/pre-attendance.component';
import { EpfSummaryComponent } from './epf-summary/epf-summary.component';
import { EsiSummaryComponent } from './esi-summary/esi-summary.component';
import { SalarySlipComponent } from './pay-summary/salary-slip/salary-slip.component';
import { PaySummaryComponent } from './pay-summary/pay-summary.component';
// import { TaxReportComponent } from './investment-declaration/tax-report/tax-report.component';
// import { AllReportComponent } from './investment-declaration/all-report/all-report.component';
import { CheckInComponent } from './check-in/check-in.component';
import { CheckInByEmpCodeComponent } from './check-in/check-in-by-emp-code/check-in-by-emp-code.component';
import { BiometricPunchesComponent } from './biometric-punches/biometric-punches.component';
import { AlertModule } from '../../shared/_alert/alert.module';
import { MultipleSalarySlipComponent } from './pay-summary/multiple-salary-slip/multiple-salary-slip.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { EmployeeAttStatusComponent } from './employee-att-status/employee-att-status.component';
import { DailyLeaveReportComponent } from './leave-report/daily-leave/daily-leave-report.component';
import { EmployeeLeaveBalanceComponent } from './leave-report/employee-leave-balance/employee-leave-balance.component';
import { LeaveBookedBalanceComponent } from './leave-report/leave-booked-balance/leave-booked-balance.component';
import { DailyAttStatusComponent } from './attendance-report/daily-att-status/daily-att-status.component';
import { AttDataPayrollComponent } from './attendance-report/att-data-payroll/att-data-payroll.component';
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
import {MonthlyCheckInOutReportComponent} from './monthly-check-in-out-report/monthly-check-in-out-report.component'
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AssetInventoryComponent } from './asset-inventory/asset-inventory.component';
import { AssetAssignmentComponent } from './asset-assignment/asset-assignment.component';
import { AssetStatusComponent } from './asset-status/asset-status.component';

import { AdvanceSalaryComponent } from './pay-summary/advance-salary/advance-salary.component';
import { InOutTimeReportComponent } from './in-out-time-report/in-out-time-report.component';
import { CommonFilterComponent } from './common-filter/common-filter.component';
import { IncrementReportComponent } from './increment-report/increment-report.component';
import { ConsultantInvoiceComponent } from './pay-summary/consultant-invoice/consultant-invoice.component';
import { RemoveHtmlPipe } from './remove-html.pipe';
import { ExpensesReportComponent } from './expenses-report/expenses-report.component';
import { AccountTwentyOneComponent } from './account-twenty-one/account-twenty-one.component';
import { MonthlyInOutShiftReportComponent } from './monthly-in-out-shift-report/monthly-in-out-shift-report.component';
import { AuditLogReportComponent } from './audit-log-report/audit-log-report.component';
import { AnnualReportComponent } from './annual-report/annual-report.component';
import { TaggedUntaggedComponent } from './tagged-untagged/tagged-untagged.component';
import { BillingReportComponent } from './billing-report/billing-report.component';
import { DeclarationSubmittedReportComponent } from './declaration-submitted-report/declaration-submitted-report.component';
import { VariablePayEarningReportComponent } from './variable-pay-earning-report/variable-pay-earning-report.component';
import { ContractRenewalComponent } from './contract-renewal/contract-renewal.component'
import { ProbationPeriodComponent } from './probation-period/probation-period.component';
import { EmpDailyHourwiseReportComponent } from './emp-daily-hourwise-report/emp-daily-hourwise-report.component';
import { MonthlyHourSummaryReportComponent } from './monthly-hour-summary-report/monthly-hour-summary-report.component';
import { TdsReportComponent } from './tds-report/tds-report.component';
import { ArrearReportComponent } from './arrear-report/arrear-report.component';
// import { IstToGermanTimePipe } from 'src/app/shared/pipes/ist-to-germant-timezone.pipe';

@NgModule({
    declarations: [
        ReportComponent,
        LiabilityReportComponent,
        SalaryVerificationComponent,
        FetchBankReportComponent,
        EPFECRComponent,
        ESIECRComponent,
        LwfReportComponent,
        InvestmentDeclarationComponent,
        ProofOfInvestmentComponent,
        DisbursementReportComponent,
        PreAttendanceComponent,
        EpfSummaryComponent,
        EsiSummaryComponent,
        PaySummaryComponent,
        SalarySlipComponent,
        // TaxReportComponent,
        // AllReportComponent,
        CheckInComponent,
        CheckInByEmpCodeComponent,
        BiometricPunchesComponent,
        MultipleSalarySlipComponent,
        EmployeeAttStatusComponent,
        DailyLeaveReportComponent,
        EmployeeLeaveBalanceComponent,
        LeaveBookedBalanceComponent,
        DailyAttStatusComponent,
        AttDataPayrollComponent,
        DsrDaReportComponent,
        AllVisitorReportComponent,
        CardWiseVisitorComponent,
        VisitorSummaryComponent,
        UanReportComponent,
        EsicReportComponent,
        ReportAttMissedPunchComponent,
        AttDeviationReportComponent,
        ReportPaymentComponent,
        LoanOutstandingReportComponent,
        MeetingReportComponent,
        MeetingByEmpCodeComponent,
        MonthlyCheckInOutReportComponent,
        AssetInventoryComponent,
        AssetAssignmentComponent,
        AssetStatusComponent,
        AdvanceSalaryComponent,
        InOutTimeReportComponent,
        CommonFilterComponent,
        IncrementReportComponent,
        ConsultantInvoiceComponent,
        RemoveHtmlPipe,
        ExpensesReportComponent,
        AccountTwentyOneComponent,
        MonthlyInOutShiftReportComponent,
        AuditLogReportComponent,
        AnnualReportComponent,
        TaggedUntaggedComponent,
        BillingReportComponent,
        DeclarationSubmittedReportComponent,
        VariablePayEarningReportComponent,
        ContractRenewalComponent,
        ProbationPeriodComponent,
        EmpDailyHourwiseReportComponent,
        MonthlyHourSummaryReportComponent,
        TdsReportComponent,
        ArrearReportComponent,
        // IstToGermanTimePipe
    ],
    imports: [
        CommonModule,
        ReportsRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        CoreModule,
        AlertModule,
        NgxPaginationModule,
        NgMultiSelectDropDownModule,
    ],
    
    exports: [
        CommonFilterComponent
    ]
})
export class ReportsModule { }
