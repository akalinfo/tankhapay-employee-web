import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusinessSettingsRoutingModule } from './business-settings-routing.module';
import { BusinessSettingComponent } from './business-setting/business-setting.component';
import { CoreModule } from "../../components/core/core.module";
// import { SetupSalaryComponent } from './setup-salary/setup-salary.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BusinessInfoComponent } from './business-info/business-info.component';
import { BillingComponent } from './billing/billing.component';
//import { PayoutComponent } from './payout/payout.component';
import { KycDetailsComponent } from './kyc-details/kyc-details.component';
import { EpfComponent } from './epf/epf.component';
import { EsiComponent } from './esi/esi.component';
// import { LeaveSettingsComponent } from '../leave-mgmt/leave-settings/leave-settings.component';
// import { AddNewTemplateComponent } from '../leave-mgmt/add-new-template/add-new-template.component';
import { DeviceSettingsComponent } from './device-settings/device-settings.component';
import { HolidayMasterComponent } from './holiday-master/holiday-master.component';
import { GeofencesComponent } from './geofences/geofences.component';
import { OrganizationUnitComponent } from './organization-unit/organization-unit.component';
import { AlertModule } from 'src/app/shared/_alert';
import { ManageCardComponent } from './manage-card/manage-card.component';
import { UnitParameterSettingsComponent } from './unit-parameter-settings/unit-parameter-settings.component';
import { UnitParameterListComponent } from './unit-parameter-list/unit-parameter-list.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
// import { BulkLeaveComponent } from '../leave-mgmt/bulk-leave/bulk-leave.component';
declare var google: any;
import { NotificationsSettingsComponent } from './notifications-settings/notifications-settings.component';
import { UnitParameterListDetailsComponent } from './unit-parameter-list-details/unit-parameter-list-details.component';
import { PayoutSettingComponent } from './payout-setting/payout-setting.component';
import { ApprovalWorkflowComponent } from './approval-workflow/approval-workflow.component';
import { NgSelectModule } from '@ng-select/ng-select';
// import { GroupEmployerComponent } from './group-employer/group-employer.component';


@NgModule({
  declarations: [
    BusinessSettingComponent,
    // BusinessInfoComponent,
    BillingComponent,
    // PayoutComponent,
    KycDetailsComponent,
    EpfComponent,
    EsiComponent,
    // LeaveSettingsComponent,
    // AddNewTemplateComponent,
    DeviceSettingsComponent,
    HolidayMasterComponent,
    GeofencesComponent,
    OrganizationUnitComponent,
    GeofencesComponent,
    ManageCardComponent,
    UnitParameterSettingsComponent,
    UnitParameterListComponent,
    // BulkLeaveComponent
    // SetupSalaryComponent
    NotificationsSettingsComponent,
    UnitParameterListDetailsComponent,
    PayoutSettingComponent,
    ApprovalWorkflowComponent,
    // GroupEmployerComponent
  ],
  imports: [
    CommonModule,
    BusinessSettingsRoutingModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    AlertModule,
    NgMultiSelectDropDownModule,
    NgxPaginationModule,
    NgSelectModule
  ],
})
export class BusinessSettingsModule { }
