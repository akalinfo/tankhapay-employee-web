import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { CoreModule } from "../../components/core/core.module";
import { WelcomeComponent } from './welcome/welcome.component';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SummaryDashboardComponent } from './summary-dashboard/summary-dashboard.component';
// import { PayrollComponent } from './payroll/payroll.component';
import { SalaryStructureComponent } from './salary-structure/salary-structure.component';
import { ComplianceComponent } from './compliance/compliance.component';
import { faqComponent } from './Faq/faq.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { AlertModule } from '../../shared/_alert/alert.module';
import { AttendanceReportComponent } from './attendance-report/attendance-report.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { OrganizationChartComponent } from './organization-chart/organization-chart.component';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { ToastModule } from 'primeng/toast';
import { PanelModule } from 'primeng/panel';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SummaryDashboardNewComponent } from './summary-dashboard-new/summary-dashboard-new.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
// import { TpayDashboardComponent } from './tpay-dashboard/tpay-dashboard.component';
@NgModule({
    declarations: [
        DashboardComponent,
        WelcomeComponent,
        CompanyDetailsComponent,
        SummaryDashboardComponent,
        // PayrollComponent,
        SalaryStructureComponent,
        ComplianceComponent,
        faqComponent,
        AttendanceReportComponent,
        EmployeeDetailsComponent,
        // TpayDashboardComponent
        OrganizationChartComponent,
        SummaryDashboardNewComponent,

    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        CoreModule,
        FormsModule,
        ReactiveFormsModule,
        AlertModule,
        NgxPaginationModule,
        OrganizationChartModule,
        ToastModule,
        PanelModule,
        NgMultiSelectDropDownModule,
        NgxChartsModule

    ]
})
export class DashboardModule { }
