import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApprovalsRoutingModule } from './approvals-routing.module';
// import { ReimbursementsComponent } from './reimbursements/reimbursements.component';
// import { ProofOfInvestmentsComponent } from './proof-of-investments/proof-of-investments.component';
// import { AdvanceSalaryComponent } from './advance-salary/advance-salary.component';
// import { OvertimeComponent } from './overtime/overtime.component';
// import { AllowanceComponent } from './allowance/allowance.component';
// import { DeductionComponent } from './deduction/deduction.component';
import { CoreModule } from "../../components/core/core.module";
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VoucherComponent } from './voucher/voucher.component';
import { AddNewVoucherComponent } from './voucher/add-new-voucher/add-new-voucher.component';
import { VoucherReportComponent } from './voucher_report/voucher-report.component';
import { AlertModule } from 'src/app/shared/_alert';
import { ProofOfReimbursementComponent } from './proof-of-reimbursement/proof-of-reimbursement.component';
import { OndutyComponent } from './onduty-applications/onduty.component';
import { MasterVoucherTypeComponent } from './master-voucher-type/master-voucher-type.component';
import { TravelRequestComponent } from './travel-request/travel-request.component';
import { TravelExpenseComponent } from './travel-expense/travel-expense.component';
import { ManageMissPunchComponent } from './manage-miss-punch/manage-miss-punch.component';
import { ReportsModule } from '../reports/reports.module';
import { FaceRegisterComponent } from './face-register/face-register.component';
import { CompOffRequestApprovalComponent } from './comp-off-request-approval/comp-off-request-approval.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { WfhRequestApprovalComponent } from './wfh-request-approval/wfh-request-approval.component';
import { ImprestReimburseApprovalComponent } from './imprest-reimburse-approval/imprest-reimburse-approval.component';
// import { IstToGermanTimePipe } from 'src/app/shared/pipes/ist-to-germant-timezone.pipe';
@NgModule({
    declarations: [
        // ReimbursementsComponent,
        // ProofOfInvestmentsComponent,
        // AdvanceSalaryComponent,
        // OvertimeComponent,
        // AllowanceComponent,
        // DeductionComponent,
        ProofOfReimbursementComponent,
        VoucherComponent,
        AddNewVoucherComponent,
        VoucherReportComponent,
        OndutyComponent,
        MasterVoucherTypeComponent,
        TravelRequestComponent,
        TravelExpenseComponent,
        ManageMissPunchComponent,
        FaceRegisterComponent,
        CompOffRequestApprovalComponent,
        WfhRequestApprovalComponent,
        ImprestReimburseApprovalComponent,
        // IstToGermanTimePipe
        

    ],
    imports: [
        CommonModule,
        ApprovalsRoutingModule,
        CoreModule,
        NgxPaginationModule,
        FormsModule,
        ReactiveFormsModule,
        AlertModule,
        ReactiveFormsModule,
        ReportsModule,
        NgMultiSelectDropDownModule
    ]
})
export class ApprovalsModule { }
