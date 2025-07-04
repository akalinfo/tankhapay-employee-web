import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report/report.component';
import { ProofOfInvestmentComponent } from './proof-of-investment/proof-of-investment.component';
import { InvestmentDeclarationComponent } from './investment-declaration/investment-declaration.component';
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
