import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BudgetAllocationComponent } from './budget-allocation/budget-allocation.component';
import { BudgetDashboardComponent } from './budget-dashboard/budget-dashboard.component';

const routes: Routes = [
  {
    path:'',
    component: BudgetAllocationComponent
  },
  {
    path:'dashboard',
    component: BudgetDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BudgetRoutingModule { }
