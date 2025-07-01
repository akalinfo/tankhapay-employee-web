import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeLoginRoutingModule } from './employee-login-routing.module';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { PayrollingComponent } from './payrolling/payrolling.component';
import { InvestmentsComponent } from './investments/investments.component';
import { LeaveComponent } from './leave/leave.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from 'src/app/shared/_alert';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { NgxSummernoteModule } from 'ngx-summernote';
import { TagInputModule } from 'ngx-chips';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApprovalWorkflowComponent } from './approval-workflow/approval-workflow.component';
import { PmsComponent } from './pms/pms.component';
import { CoreModule } from 'src/app/components/core/core.module';
import { EmployeeReimbursementComponent } from './employee-reimbursement/employee-reimbursement.component';
import { EmployeeCheckinCheckoutComponent } from './employee-checkin-checkout/employee-checkin-checkout.component';
import { SafeUrlPipe } from 'src/app/shared/pipes/safe-url.pipe';
import { MobileViewLoginComponent } from './mobile-view-login/mobile-view-login.component';
import { TravelComponent } from './travel/travel.component';
import { TravelRequestListComponent } from './travel-request-list/travel-request-list.component';
import { TravelExpenseListComponent } from './travel-expense-list/travel-expense-list.component';
import { EmployeeDocumentsComponent } from './employee-documents/employee-documents.component';
import { EmplHelpSupportComponent } from './empl-help-support/empl-help-support.component';
import { EsiDependentComponent } from './esi-dependent/esi-dependent.component';
import { TrainingComponent } from './training/training.component';
import { TrainingDetailsComponent } from './training-details/training-details.component';
import { FaqsComponent } from './faqs/faqs.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { EmployeeNotificationComponent } from './employee-notification/employee-notification.component';
import { ArchiveNotificationComponent } from './archive-notification/archive-notification.component';
import { HrPolicyComponent } from './hr-policy/hr-policy.component';
import { NumberonlyDirective } from '../employee-management/numberonly.directive';
import { CompoffEligibilityComponent } from './compoff-eligibility/compoff-eligibility.component';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { PmsTeamSpecificComponent } from './pms-team-specific/pms-team-specific.component';
import { ReportComponent } from './report/report.component';
import { CheckInComponent } from './check-in/check-in.component';
import { DailyLeaveReportComponent } from './daily-leave-report/daily-leave-report.component';
import { EmployeeLeaveBalanceComponent } from './employee-leave-balance/employee-leave-balance.component';
import { WfhRequestComponent } from './wfh-request/wfh-request.component';
import { EmpContractRenewalComponent } from './emp-contract-renewal/emp-contract-renewal.component';
import { ReportingContractRenewalComponent } from './reporting-contract-renewal/reporting-contract-renewal.component';
import { ReportingProbationRenewalComponent } from './reporting-probation-renewal/reporting-probation-renewal.component';
import { EmpProbationRenewalComponent } from './emp-probation-renewal/emp-probation-renewal.component';
import { FeedbackComponent  } from './feedback/feedback.component';
import { ImprestRequestComponent } from './imprest-request/imprest-request.component';
// rekha
import { ExitInterviewQuestionnaireComponent } from './exit-interview-questionnaire/exit-interview-questionnaire.component';
import { ExitClearanceFormComponent } from './exit-clearance-form/exit-clearance-form.component';
// rekha
@NgModule({
  declarations: [
    EmployeeDetailComponent,
    PayrollingComponent,
    InvestmentsComponent,
    LeaveComponent,
    AttendanceComponent,
    ApprovalWorkflowComponent,
    PmsComponent,
    EmployeeCheckinCheckoutComponent,
    EmployeeReimbursementComponent,
    SafeUrlPipe,
    MobileViewLoginComponent,
    EmplHelpSupportComponent,
    TravelComponent,
    TravelRequestListComponent,
    TravelExpenseListComponent,
    EmployeeDocumentsComponent,
    EsiDependentComponent,
    TrainingComponent,
    TrainingDetailsComponent,
    FaqsComponent,
    TermsOfUseComponent,
    PrivacyPolicyComponent,
    EmployeeNotificationComponent,
    ArchiveNotificationComponent,
    HrPolicyComponent,
    CompoffEligibilityComponent,
    WfhRequestComponent,
    ImprestRequestComponent,
    PmsTeamSpecificComponent,
    ReportComponent,
    CheckInComponent,
    DailyLeaveReportComponent,
    EmployeeLeaveBalanceComponent,
    EmpContractRenewalComponent,
    ReportingContractRenewalComponent,
    ReportingProbationRenewalComponent,
    EmpProbationRenewalComponent,
    FeedbackComponent,
    ExitInterviewQuestionnaireComponent,
    ExitClearanceFormComponent
  ],
  imports: [
    CommonModule,
    EmployeeLoginRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule,
    NgxPaginationModule,
    NgMultiSelectDropDownModule,
    AngularMultiSelectModule,
    NgxSummernoteModule,
    TagInputModule,
    AngularEditorModule,
    NgSelectModule,
    CoreModule,
    NumberonlyDirective,
    TimepickerModule.forRoot(),
    PopoverModule,
  ],
  exports : [
    EmployeeDetailComponent,
    PayrollingComponent,
    InvestmentsComponent,
    LeaveComponent,
    AttendanceComponent,
    ApprovalWorkflowComponent,
    PmsComponent,
    EmployeeCheckinCheckoutComponent,
    EmployeeReimbursementComponent,
    MobileViewLoginComponent,
    EmplHelpSupportComponent,
    EsiDependentComponent,
    TravelComponent,
    EmployeeDocumentsComponent,
    TrainingComponent,
    FaqsComponent,
    HrPolicyComponent,
    PmsTeamSpecificComponent,
    CompoffEligibilityComponent,
    WfhRequestComponent,
    FeedbackComponent,
    ImprestRequestComponent,    
    ExitInterviewQuestionnaireComponent,
    ExitClearanceFormComponent

  ]
})
export class EmployeeLoginModule { }
