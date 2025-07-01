import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BudgetRoutingModule } from './budget-routing.module';
import { BudgetAllocationComponent } from './budget-allocation/budget-allocation.component';
import { CoreModule } from 'src/app/components/core/core.module';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { NumberonlyDirective } from '../employee-management/numberonly.directive';
import { BudgetDashboardComponent } from './budget-dashboard/budget-dashboard.component';
import { NgxGaugeModule } from 'ngx-gauge';
import { NgxChartsModule } from '@swimlane/ngx-charts';


@NgModule({
  declarations: [
    BudgetAllocationComponent,
    BudgetDashboardComponent
  ],
  imports: [
    CommonModule,
    BudgetRoutingModule,
    CoreModule,
    ReactiveFormsModule,
    FormsModule,
    NumberonlyDirective,
    NgxGaugeModule,
    NgxChartsModule,
  ]
})
export class BudgetModule { }
