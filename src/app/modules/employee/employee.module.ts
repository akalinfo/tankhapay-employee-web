import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeRoutingModule } from './employee-routing.module';
import { EmployeesComponent } from './employees/employees.component';
import { CoreModule } from "../../components/core/core.module";
import { SingleEmployeeComponent } from './single-employee/single-employee.component';
// import { BulkEmployeeComponent } from './bulk-employee/bulk-employee.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ViewEmployeeDetailComponent } from './view-employee-detail/view-employee-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReviseSalaryComponent } from './revise-salary/revise-salary.component';
// import { EditEmployeeDetailComponent } from './edit-employee-detail/edit-employee-detail.component';
import { SetupSalaryComponent } from './setup-salary/setup-salary.component';
import { EmployeeLogComponent } from './employee-log/employee-log.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
// import { BulkExitComponent } from './bulk-exit/bulk-exit.component';
// import { BulkSuspendComponent } from './bulk-suspend/bulk-suspend.component';
// import { BulkSalaryComponent } from './bulk-salary/bulk-salary.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NumberonlyDirective } from '../employee-management/numberonly.directive';
// import { BulkCustomSalaryComponent } from './bulk-custom-salary/bulk-custom-salary.component';


@NgModule({
    declarations: [
        EmployeesComponent,
        SingleEmployeeComponent,
        // BulkEmployeeComponent,
        ViewEmployeeDetailComponent,
        ReviseSalaryComponent,
        // EditEmployeeDetailComponent,
        SetupSalaryComponent,
        EmployeeLogComponent,
        // BulkExitComponent,
        // BulkSuspendComponent,
        // BulkSalaryComponent,
        // BulkCustomSalaryComponent
        
    ],
    imports: [
        CommonModule,
        EmployeeRoutingModule,
        CoreModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        FormsModule,
        NgMultiSelectDropDownModule,
        NgSelectModule,
        NumberonlyDirective
    ]
})
export class EmployeeModule { }
