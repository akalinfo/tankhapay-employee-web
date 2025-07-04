import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessSettingComponent } from './business-setting/business-setting.component';
// import { BusinessInfoComponent } from './business-info/business-info.component';
import { BillingComponent } from './billing/billing.component';
//import { PayoutComponent } from './payout/payout.component';
import { KycDetailsComponent } from './kyc-details/kyc-details.component';
import { EpfComponent } from './epf/epf.component';
import { EsiComponent } from './esi/esi.component';
// import { LeaveSettingsComponent } from '../leave-mgmt/leave-settings/leave-settings.component';
// import { AddNewTemplateComponent } from '../leave-mgmt/add-new-template/add-new-template.component';
// import { DeviceSettingsComponent } from './device-settings/device-settings.component';
// import { HolidayMasterComponent } from './holiday-master/holiday-master.component';
import { GeofencesComponent } from './geofences/geofences.component';
import { OrganizationUnitComponent } from './organization-unit/organization-unit.component';
import { SetupSalaryComponent } from '../employee/setup-salary/setup-salary.component';
import { ManageCardComponent } from './manage-card/manage-card.component';
import { UnitParameterSettingsComponent } from './unit-parameter-settings/unit-parameter-settings.component';
import { UnitParameterListComponent } from './unit-parameter-list/unit-parameter-list.component';
//import { BulkLeaveComponent } from '../leave-mgmt/bulk-leave/bulk-leave.component';
import { NotificationsSettingsComponent } from './notifications-settings/notifications-settings.component';
import { UnitParameterListDetailsComponent } from './unit-parameter-list-details/unit-parameter-list-details.component';
// import { PayoutSettingComponent } from './payout-setting/payout-setting.component';
import { ApprovalWorkflowComponent } from './approval-workflow/approval-workflow.component';
// import { GroupEmployerComponent } from './group-employer/group-employer.component';

const routes: Routes = [
  {
    path: '', component: BusinessSettingComponent
  },
  // {
  //   path: 'business-info', component: BusinessInfoComponent
  // },
  {
    path: 'billing', component: BillingComponent
  },
  // {
  //   path: 'payout', component: PayoutComponent
  // },
  {
    path: 'kyc-details', component: KycDetailsComponent
  },
  {
    path: 'EPF', component: EpfComponent
  },
  {
    path: 'ESI', component: EsiComponent
  },
  // {
  //   path: 'leave-settings', component: LeaveSettingsComponent
  // },
  // {
  //   path: 'bulk-leave', component: BulkLeaveComponent
  // },
  // {
  //   path: 'device-settings', component: DeviceSettingsComponent
  // },
  // {
  //   path: 'add-new-template', component: AddNewTemplateComponent
  // },
  // {
  //   path: 'holiday-settings', component: HolidayMasterComponent
  // },
  {
    path: 'organization-unit', component: OrganizationUnitComponent
  },
  {
    path: 'geofences/:geofencingid', component: GeofencesComponent
  },
  {
    path: 'geofences/:geofencingid/:actiontype', component: GeofencesComponent
  },
  {
    path: 'setup-salary', component: SetupSalaryComponent
  },
  {
    path: 'manage-card', component: ManageCardComponent
  },
  {
    path:'unit-parameter-settings/:orgid',component: UnitParameterSettingsComponent
  },
  {
    path:'unit-parameter-settings',component: UnitParameterSettingsComponent
  },
  {
    path:'unit-parameter-listing',component: UnitParameterListComponent
  },
  {
     path :'notification-settings', component: NotificationsSettingsComponent

  },
  {
    path:'unit-parameter-listing/:id',component: UnitParameterListDetailsComponent
  },
  // {
  //   path: 'payout', component: PayoutSettingComponent
  // },
  {
    path: 'approval-workflow', component: ApprovalWorkflowComponent
  },
  // {
  //   path: 'group-employer', component: GroupEmployerComponent
  // }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessSettingsRoutingModule { }
