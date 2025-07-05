import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmplHeaderComponent } from '../employee-management/empl-header/empl-header.component';
import { TravelRequestListComponent } from './travel-request-list/travel-request-list.component';
import { TravelExpenseListComponent } from './travel-expense-list/travel-expense-list.component';
import { TrainingComponent } from './training/training.component';
import { TrainingDetailsComponent } from './training-details/training-details.component';
import { MobileViewLoginComponent } from './mobile-view-login/mobile-view-login.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { EmployeeNotificationComponent } from './employee-notification/employee-notification.component';
import { ArchiveNotificationComponent } from './archive-notification/archive-notification.component';
import { ReportComponent } from './report/report.component';
import { CheckInComponent } from './check-in/check-in.component';
import { DailyLeaveReportComponent } from './daily-leave-report/daily-leave-report.component';
import { EmployeeLeaveBalanceComponent } from './employee-leave-balance/employee-leave-balance.component';
import { WfhRequestComponent } from './wfh-request/wfh-request.component';
import { EmpContractRenewalComponent } from './emp-contract-renewal/emp-contract-renewal.component';
import { ReportingContractRenewalComponent } from './reporting-contract-renewal/reporting-contract-renewal.component';
import { EmpProbationRenewalComponent } from './emp-probation-renewal/emp-probation-renewal.component';
import { ReportingProbationRenewalComponent } from './reporting-probation-renewal/reporting-probation-renewal.component';
import { ImprestRequestComponent } from './imprest-request/imprest-request.component';
import { ExitInterviewQuestionnaireComponent } from './exit-interview-questionnaire/exit-interview-questionnaire.component';
import { ExitClearanceFormComponent } from './exit-clearance-form/exit-clearance-form.component';


  
const routes: Routes = [
  // {
  //   path : '',
  //   redirectTo: 'employee-detail/:empid',
  //   pathMatch : 'full'
  // },
  {
    path: 'employee-detail',
    component: EmplHeaderComponent,
  },
  {
    path: 'payrolling',
    component: EmplHeaderComponent
  },
  {
    path: 'investments',
    component: EmplHeaderComponent
  },
  {
    path: 'leave',
    component: EmplHeaderComponent
  },
  {
    path: 'attendance',
    component: EmplHeaderComponent
  },
  {
    path: 'documents',
    component: EmplHeaderComponent
  },
  {
    path: 'approval-workflow',
    component: EmplHeaderComponent
  },
  {
    path: 'service-book',
    component: EmplHeaderComponent
  },
  {
    path: 'asset-details',
    component: EmplHeaderComponent
  },
  {
    path: 'pms',
    component: EmplHeaderComponent
  },
  {
    path: 'pms-team-specific',
    component: EmplHeaderComponent
  },
  {
    path: 'feedback',
    component: EmplHeaderComponent
  },
  {
    path: 'check-in',
    component: EmplHeaderComponent
  },
  {
    path: 'mobile',
    component: MobileViewLoginComponent
  },
  {
    path: 'reimbursement',
    component: EmplHeaderComponent
  },
  {
    path: 'travel',
    component: EmplHeaderComponent
  },
  {
    path: 'travel-request/:emp_code',
    component: TravelRequestListComponent
  },
  {
    path: 'travel-expense/:emp_code',
    component: TravelExpenseListComponent
  },
  {
    path: 'empl-help-and-support/empl-tickets',
    component: EmplHeaderComponent
  },
  {
    path: 'esi-dependent',
    component: EmplHeaderComponent
  },
  {
    path: 'training',
    component: EmplHeaderComponent
  },
  {
    path: 'training-details/:trainingid',
    component: TrainingDetailsComponent
  },
  {
    path: 'faqs',
    component: EmplHeaderComponent
  },
  {
    path: 'terms-of-use',
    component: TermsOfUseComponent
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent
  },
  {
    path: 'notifications',
    component: EmployeeNotificationComponent
  },
  {
    path: 'notificationsArchive',
    component: ArchiveNotificationComponent
  },
  {
    path: 'hr-policy',
    component: EmplHeaderComponent
  },
  {
    path: 'report',
    component: ReportComponent
  },
  {
    path: 'check-in-checkout',
    component: CheckInComponent
  },
  {
    path: 'daily-leave-report',
    component: DailyLeaveReportComponent
  },
  {
    path: 'employee-leave-balance',
    component: EmployeeLeaveBalanceComponent
  },
  {
    path: 'compoff',
    component: EmplHeaderComponent
  },
  {
    path: 'wfh-request',
    component: WfhRequestComponent
  },
  {
    path: 'imprest-request',
    component: ImprestRequestComponent
  },
  {
    path: 'empcontract',
    component: EmpContractRenewalComponent
  },
  {
    path: 'reportingcontract',
    component: ReportingContractRenewalComponent
  },
  {
    path: 'empprobation',
    component: EmpProbationRenewalComponent
  },
  {
    path: 'reportingprobation',
    component: ReportingProbationRenewalComponent
  }, {
    path: 'exit-interview-ques',
    component: ExitInterviewQuestionnaireComponent
  },
   {
    path: 'exit-clearance-form',
    component: ExitClearanceFormComponent
  },
{
    path: 'view-declaration',
    component: EmplHeaderComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeLoginRoutingModule {

}
