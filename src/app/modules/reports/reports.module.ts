import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportComponent } from './report/report.component';
import { CoreModule } from "../../components/core/core.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InvestmentDeclarationComponent } from './investment-declaration/investment-declaration.component';
import { ProofOfInvestmentComponent } from './proof-of-investment/proof-of-investment.component';
import { AlertModule } from '../../shared/_alert/alert.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CommonFilterComponent } from './common-filter/common-filter.component';
import { DeclarationSubmittedReportComponent } from './declaration-submitted-report/declaration-submitted-report.component';
import { ContractRenewalComponent } from './contract-renewal/contract-renewal.component'
import { ProbationPeriodComponent } from './probation-period/probation-period.component';
@NgModule({
    declarations: [
        ReportComponent,     
        InvestmentDeclarationComponent,
        ProofOfInvestmentComponent,       
        CommonFilterComponent,       
        DeclarationSubmittedReportComponent,
        ContractRenewalComponent,
        ProbationPeriodComponent,       
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
