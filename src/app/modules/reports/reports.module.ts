import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportComponent } from './report/report.component';
import { CoreModule } from "../../components/core/core.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { InvestmentDeclarationComponent } from './investment-declaration/investment-declaration.component';
import { ProofOfInvestmentComponent } from './proof-of-investment/proof-of-investment.component';

// import { TaxReportComponent } from './investment-declaration/tax-report/tax-report.component';
// import { AllReportComponent } from './investment-declaration/all-report/all-report.component';

import { AlertModule } from '../../shared/_alert/alert.module';

import { NgxPaginationModule } from 'ngx-pagination';
import { DailyLeaveReportComponent } from './leave-report/daily-leave/daily-leave-report.component';
import { EmployeeLeaveBalanceComponent } from './leave-report/employee-leave-balance/employee-leave-balance.component';
import { LeaveBookedBalanceComponent } from './leave-report/leave-booked-balance/leave-booked-balance.component';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

import { CommonFilterComponent } from './common-filter/common-filter.component';
import { DeclarationSubmittedReportComponent } from './declaration-submitted-report/declaration-submitted-report.component';
import { ContractRenewalComponent } from './contract-renewal/contract-renewal.component'
import { ProbationPeriodComponent } from './probation-period/probation-period.component';
// import { IstToGermanTimePipe } from 'src/app/shared/pipes/ist-to-germant-timezone.pipe';

@NgModule({
    declarations: [
        ReportComponent,
        // LiabilityReportComponent,
        // SalaryVerificationComponent,
        // FetchBankReportComponent,
        // EPFECRComponent,
        // ESIECRComponent,
        // LwfReportComponent,
        InvestmentDeclarationComponent,
        ProofOfInvestmentComponent,
        // DisbursementReportComponent,
        // PreAttendanceComponent,
        // EpfSummaryComponent,
        // EsiSummaryComponent,
        // PaySummaryComponent,
        // SalarySlipComponent,
        // TaxReportComponent,
        // AllReportComponent,
        // CheckInComponent,
        // CheckInByEmpCodeComponent,
        // BiometricPunchesComponent,
        // MultipleSalarySlipComponent,
        // EmployeeAttStatusComponent,
        DailyLeaveReportComponent,
        EmployeeLeaveBalanceComponent,
        LeaveBookedBalanceComponent,
        // DailyAttStatusComponent,
        // AttDataPayrollComponent,
        // DsrDaReportComponent,
        // AllVisitorReportComponent,
        // CardWiseVisitorComponent,
        // VisitorSummaryComponent,
        // UanReportComponent,
        // EsicReportComponent,
        // ReportAttMissedPunchComponent,
        // AttDeviationReportComponent,
        // ReportPaymentComponent,
        // LoanOutstandingReportComponent,
        // MeetingReportComponent,
        // MeetingByEmpCodeComponent,
        // MonthlyCheckInOutReportComponent,
        // AssetInventoryComponent,
        // AssetAssignmentComponent,
        // AssetStatusComponent,
        // AdvanceSalaryComponent,
        // InOutTimeReportComponent,
        CommonFilterComponent,
        // IncrementReportComponent,
        // ConsultantInvoiceComponent,
        // RemoveHtmlPipe,
        // ExpensesReportComponent,
        // AccountTwentyOneComponent,
        // MonthlyInOutShiftReportComponent,
        // AuditLogReportComponent,
        // AnnualReportComponent,
        // TaggedUntaggedComponent,
        // BillingReportComponent,
        DeclarationSubmittedReportComponent,
        // VariablePayEarningReportComponent,
        ContractRenewalComponent,
        ProbationPeriodComponent,
        // EmpDailyHourwiseReportComponent,
        // MonthlyHourSummaryReportComponent,
        // TdsReportComponent,
        // ArrearReportComponent,
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
