import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { SummaryDashboardComponent } from './summary-dashboard/summary-dashboard.component';
// import { PayrollComponent } from './payroll/payroll.component';
import { SalaryStructureComponent } from './salary-structure/salary-structure.component';
import { ComplianceComponent } from './compliance/compliance.component';
import { faqComponent } from './Faq/faq.component';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';

import { OrganizationChartComponent } from './organization-chart/organization-chart.component';
import { SummaryDashboardNewComponent } from './summary-dashboard-new/summary-dashboard-new.component';
const routes: Routes = [
  {
    path:'',
    component:DashboardComponent
  },
  {
    path:'welcome',
    component:WelcomeComponent
  },
  {
    path:'company-details',
    component:CompanyDetailsComponent
  },
  {
    path:'summary-dashboard',
    component:SummaryDashboardComponent
  },
  // {
  //   path:'payroll',
  //   component:PayrollComponent
  // },
  {
    path:'salary-stucture',
    component:SalaryStructureComponent
  },
  {
    path:'compliance',
    component:ComplianceComponent
  },
  {
    path:'att-report',
    component:AttendanceReportComponent
  },
  {path:'faq', component:faqComponent},
  {path:'employee-details', component:EmployeeDetailsComponent},
  {
    path: 'org-chart',
    component: OrganizationChartComponent
   },
   {
    path: 'summary-dashboard-new',
    component: SummaryDashboardNewComponent
   }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
