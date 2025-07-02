import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendancesComponent } from './attendances/attendances.component';
import { BulkAttendanceComponent } from './bulk-attendance/bulk-attendance.component';
import { SelfCheckinComponent } from './self-checkin/self-checkin.component';
import { ShiftDetailsComponent } from './shift-details/shift-details.component';
import { ShiftSpecificSettingsComponent } from './shift-specific-settings/shift-specific-settings.component';
import { EmployeeShiftMappingComponent } from './employee-shift-mapping/employee-shift-mapping.component';
import { ShiftRotationComponent } from './shift-rotation/shift-rotation.component';
import { BreakComponent } from './break/break.component';
import { GeneralSettingComponent } from './general-setting/general-setting.component';
import { BulkDeductionComponent } from './bulk-deduction/bulk-deduction.component';
import { FaceCheckinComponent } from './face-checkin/face-checkin.component';
import { FaceCheckListComponent } from './face-check-list/face-check-list.component';
import { GeofenceSettingComponent } from './geofence-setting/geofence-setting.component';
import { AttendanceUnitComponent } from './attendance-unit/attendance-unit.component';
import { MissedPunchAttComponent } from './missed-punch-att/missed-punch-att.component';
import { OtRulesComponent } from './ot-rules/ot-rules.component';
import { OtRulesListingComponent } from './ot-rules-listing/ot-rules-listing.component';
import { AttendanceDsrDaComponent } from './attendance-dsr-da/attendance-dsr-da.component';
import { TeaAllowanceComponent } from './tea-allowance/tea-allowance.component';
import { SyncAttendanceComponent } from './sync-attendance/sync-attendance.component';
import { SalaryCorrectionComponent } from './salary-correction/salary-correction.component';
import { ArearSalaryComponent } from './arear-salary/arear-salary.component';
import { ManageLateEarlyAttComponent } from './manage-late-early-att/manage-late-early-att.component';
import { BulkLockAttendanceComponent } from './bulk-lock-attendance/bulk-lock-attendance.component';
// import { BulkOpenBalanceComponent } from './bulk-open-balance/bulk-open-balance.component';
import { BulkSalaryCorrectionComponent } from './bulk-salary-correction/bulk-salary-correction.component';
import { BulkOpenBalanceComponent } from './bulk-open-balance/bulk-open-balance.component';
import { DipoleServicesComponent } from './dipole-services/dipole-services.component';
import { AttendanceReprocessComponent } from './attendance-reprocess/attendance-reprocess.component';
import { BulkAttendanceNewComponent } from './bulk-attendance-new/bulk-attendance-new.component';
import { GenerateAdviceComponent } from './generate-advice/generate-advice.component';


const routes: Routes = [

  {
    path: '', component: AttendancesComponent
  },

  {
    path: 'attendance',
    component: AttendancesComponent
  },
  {
    path: 'bulk-attendance',
    component: BulkAttendanceComponent
  },
  {
    path: 'shift-details',
    component: ShiftDetailsComponent
  },
  {
    path: 'break-details',
    component: BreakComponent
  },
  {
    path: 'shift-specific-settings',
    component: ShiftSpecificSettingsComponent
  },
  {
    path: 'shift-rotation',
    component: ShiftRotationComponent
  },
  {
    path: 'self-checkin',
    component: SelfCheckinComponent
  },
  {
    path: 'general-settings',
    component: GeneralSettingComponent
  },
  {
    path: 'employee-shift-mapping',
    component: EmployeeShiftMappingComponent
  },
  {
    path: 'bulk-deduction',
    component: BulkDeductionComponent
  },
  {
    path: 'face-checkin-list',
    component: FaceCheckListComponent
  },
  {
    path: 'face-checkin',
    component: FaceCheckinComponent
  },
  {
    path: 'geofence-setting',
    component: GeofenceSettingComponent
  },
  {
    path: 'attendance-unit',
    component: AttendanceUnitComponent
  },
  {
    path: 'missed-punch',
    component: MissedPunchAttComponent
  },
  {
    path: 'ot_rules_listing',
    component: OtRulesComponent
  },
  {
    path: 'ot_rules/:id',
    component: OtRulesListingComponent
  },
  {
    path: 'tea-allowance',
    component: TeaAllowanceComponent
  },
  {
    path: 'dsr-da',
    component: AttendanceDsrDaComponent
  },
  {
    path: 'sync-att',
    component: SyncAttendanceComponent
  },
  {
    path: 'salary-correction',
    component: SalaryCorrectionComponent
  },
  {
    path: 'arrear-salary',
    component: ArearSalaryComponent
  }, {
    path: 'manage-early-late-att',
    component: ManageLateEarlyAttComponent
  }, {
    path: 'bulk-lock-attendance',
    component: BulkLockAttendanceComponent
  },

  {
    path: 'bulk-open-balance',
    component: BulkOpenBalanceComponent
  },

  {
    path: 'bulk-salary-correction',
    component: BulkSalaryCorrectionComponent
  }, {
    path: 'dipole-timesheet',
    component: DipoleServicesComponent,
  },
  {
    path: 'att-reprocess',
    component: AttendanceReprocessComponent,
  },
  {
    path: 'bulk-attendance-new',
    component: BulkAttendanceNewComponent
  },
  {
    path: 'generate-advice',
    component: GenerateAdviceComponent
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule { }
