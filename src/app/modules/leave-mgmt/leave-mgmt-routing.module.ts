import { NgModule } from '@angular/core';
import { LeaveTypeComponent } from './leave-type/leave-type.component';
import { RouterModule, Routes } from '@angular/router';
import { LeaveApplicationsComponent } from './leave-applications/leave-applications.component';
import { AddNewTemplateComponent } from './add-new-template/add-new-template.component';
import { LeaveSettingsComponent } from './leave-settings/leave-settings.component';
import { BulkLeaveComponent } from './bulk-leave/bulk-leave.component';
import { LeaveDetailsComponent } from './leave-details/leave-details.component';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { BulkHolidayComponent } from './bulk-holiday/bulk-holiday.component';

const routes: Routes = [
  {
    path: 'leave-type',
    component: LeaveTypeComponent
  },
  {
    path: 'leave-application',
    component: LeaveApplicationsComponent
  },
  {
    path: 'add-new-template', component: AddNewTemplateComponent
  },
  {
    path: 'leave-settings', component: LeaveSettingsComponent
  },
  {
    path: 'bulk-leave', component: BulkLeaveComponent
  },
  {
    path: 'bulk-holiday', component: BulkHolidayComponent
  },
  {
     path :'leave-details', component: LeaveDetailsComponent

  },
  {
     path :'leave-general-settings', component: GeneralSettingsComponent

  },

]


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveMgmtRoutingModule { }
