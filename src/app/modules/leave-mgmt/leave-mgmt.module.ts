import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveTypeComponent } from './leave-type/leave-type.component';
import { LeaveApplicationsComponent } from './leave-applications/leave-applications.component';
import { LeaveMgmtRoutingModule } from './leave-mgmt-routing.module';
import { CoreModule } from 'src/app/components/core/core.module';
import { LeaveSettingsComponent } from './leave-settings/leave-settings.component';
import { AddNewTemplateComponent } from './add-new-template/add-new-template.component';
import { BulkLeaveComponent } from './bulk-leave/bulk-leave.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LeaveDetailsComponent } from './leave-details/leave-details.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AlertModule } from "../../shared/_alert/alert.module";
import { BulkHolidayComponent } from './bulk-holiday/bulk-holiday.component';



@NgModule({
  declarations: [
    LeaveTypeComponent,
    LeaveApplicationsComponent,
    LeaveSettingsComponent,
    AddNewTemplateComponent,
    BulkLeaveComponent,
    LeaveDetailsComponent,
    GeneralSettingsComponent,
    BulkHolidayComponent
  ],
  imports: [
    CommonModule,
    LeaveMgmtRoutingModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    AlertModule
]
})
export class LeaveMgmtModule { }
