import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmployeesComponent } from './employees/employees.component';
import { SingleEmployeeComponent } from './single-employee/single-employee.component';
// import { BulkEmployeeComponent } from './bulk-employee/bulk-employee.component';
import { ViewEmployeeDetailComponent } from './view-employee-detail/view-employee-detail.component';
import { ReviseSalaryComponent } from './revise-salary/revise-salary.component';
// import { EditEmployeeDetailComponent } from './edit-employee-detail/edit-employee-detail.component';
import { SetupSalaryComponent } from './setup-salary/setup-salary.component';
import { EmployeeLogComponent } from './employee-log/employee-log.component';
// import { BulkExitComponent } from './bulk-exit/bulk-exit.component';
// import { BulkSuspendComponent } from './bulk-suspend/bulk-suspend.component';
// import { BulkSalaryComponent } from './bulk-salary/bulk-salary.component';
// import { BulkCustomSalaryComponent } from './bulk-custom-salary/bulk-custom-salary.component';

const routes: Routes = [
  {
    path: '', component: EmployeesComponent
  },
  {
    path: 'single-employee',
    component: SingleEmployeeComponent
  },
  // {
  //   path: 'bulk-employee',
  //   component: BulkEmployeeComponent
  // }
  // ,
  // {
  //   path: 'view-employee-detail',
  //   component: ViewEmployeeDetailComponent
  // },
  {
    path: 'view-employee-detail/:empid', // Define the route with a parameter
    component: ViewEmployeeDetailComponent,
  },
  {
    path:'revise-salary/:id',
    component: ReviseSalaryComponent
  },
  // {
  //   path: 'edit-employee',
  //   component: EditEmployeeDetailComponent
  // },
  {
    path: 'setup-salary',
    component : SetupSalaryComponent
  },
  {
    path: 'employee-log',
    component: EmployeeLogComponent
  },
  // {
  //   path: 'bulk-exit',
  //   component: BulkExitComponent
  // },
  // {
  //   path: 'bulk-suspend',
  //   component: BulkSuspendComponent
  // },
  // {
  //   path: 'bulk-salary',
  //   component: BulkSalaryComponent
  // },
  // {
  //   path: 'bulk-salary-custom',
  //   component : BulkCustomSalaryComponent
  // } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
