import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report/report.component';
import { ProofOfInvestmentComponent } from './proof-of-investment/proof-of-investment.component';
import { InvestmentDeclarationComponent } from './investment-declaration/investment-declaration.component';
import { DailyLeaveReportComponent } from './leave-report/daily-leave/daily-leave-report.component';
import { EmployeeLeaveBalanceComponent } from './leave-report/employee-leave-balance/employee-leave-balance.component';
import { LeaveBookedBalanceComponent } from './leave-report/leave-booked-balance/leave-booked-balance.component';
import { DeclarationSubmittedReportComponent } from './declaration-submitted-report/declaration-submitted-report.component';
import { ContractRenewalComponent } from './contract-renewal/contract-renewal.component';
import { ProbationPeriodComponent } from './probation-period/probation-period.component';

const routes: Routes = [

  {
    path: '', component: ReportComponent
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
    path: 'declaration-submitted-report',
    component: DeclarationSubmittedReportComponent
  },

  {
    path: 'contract-renewal',
    component: ContractRenewalComponent
  },
  {
    path: 'probation-period',
    component: ProbationPeriodComponent
  }
 


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
