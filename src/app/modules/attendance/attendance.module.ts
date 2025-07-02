import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { AttendanceRoutingModule } from './attendance-routing.module';
import { AttendancesComponent } from './attendances/attendances.component';
import { CoreModule } from "../../components/core/core.module";
import { BulkAttendanceComponent } from './bulk-attendance/bulk-attendance.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelfCheckinComponent } from './self-checkin/self-checkin.component';
import { AlertModule } from '../../shared/_alert/alert.module';
import { ShiftDetailsComponent } from './shift-details/shift-details.component';
import { ShiftSpecificSettingsComponent } from './shift-specific-settings/shift-specific-settings.component';
import { EmployeeShiftMappingComponent } from './employee-shift-mapping/employee-shift-mapping.component';
import { ShiftRotationComponent } from './shift-rotation/shift-rotation.component';
import { BreakComponent } from './break/break.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TimepickerModule } from 'ngx-bootstrap/timepicker'; // Import the TimepickerModule
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BulkDeductionComponent } from './bulk-deduction/bulk-deduction.component';
import { GeneralSettingComponent } from './general-setting/general-setting.component';
import { GeofenceSettingComponent } from './geofence-setting/geofence-setting.component';
import { FaceCheckinComponent } from './face-checkin/face-checkin.component';
import { WebcamModule } from 'ngx-webcam';
import { FaceCheckListComponent } from './face-check-list/face-check-list.component';

import { AttendanceUnitComponent } from './attendance-unit/attendance-unit.component';
import { MissedPunchAttComponent } from './missed-punch-att/missed-punch-att.component';
import { OtRulesComponent } from './ot-rules/ot-rules.component';
import { OtRulesListingComponent } from './ot-rules-listing/ot-rules-listing.component';
import { DecimalLimitDirective } from './decimal-limit.directive';
import { AttendanceDsrDaComponent } from './attendance-dsr-da/attendance-dsr-da.component';
import { TeaAllowanceComponent } from './tea-allowance/tea-allowance.component';
import { SyncAttendanceComponent } from './sync-attendance/sync-attendance.component';
import { SalaryCorrectionComponent } from './salary-correction/salary-correction.component';
import { ArearSalaryComponent } from './arear-salary/arear-salary.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ManageLateEarlyAttComponent } from './manage-late-early-att/manage-late-early-att.component';
import { BulkLockAttendanceComponent } from './bulk-lock-attendance/bulk-lock-attendance.component';
// import { BulkOpenBalanceComponent } from './bulk-open-balance/bulk-open-balance.component';
import { BulkSalaryCorrectionComponent } from './bulk-salary-correction/bulk-salary-correction.component';
import { BulkOpenBalanceComponent } from './bulk-open-balance/bulk-open-balance.component';
import { DipoleServicesComponent } from './dipole-services/dipole-services.component';
import {AttendanceReprocessComponent} from './attendance-reprocess/attendance-reprocess.component'
import { BulkAttendanceNewComponent } from './bulk-attendance-new/bulk-attendance-new.component';
import { GenerateAdviceComponent } from './generate-advice/generate-advice.component'
// import { IstToGermanTimePipe } from 'src/app/shared/pipes/ist-to-germant-timezone.pipe';
@NgModule({
    declarations: [
        AttendancesComponent,
        BulkAttendanceComponent,
        SelfCheckinComponent,
        ShiftDetailsComponent,
        ShiftSpecificSettingsComponent,
        EmployeeShiftMappingComponent,
        ShiftRotationComponent,
        BreakComponent,
        BulkDeductionComponent,
        GeneralSettingComponent,
        FaceCheckinComponent,
        FaceCheckListComponent,
        GeofenceSettingComponent,
        AttendanceUnitComponent,
        MissedPunchAttComponent,
        OtRulesListingComponent,
        DecimalLimitDirective,
        OtRulesComponent,
        TeaAllowanceComponent,
        AttendanceDsrDaComponent,
        SyncAttendanceComponent,
        SalaryCorrectionComponent,
        ArearSalaryComponent,
        ManageLateEarlyAttComponent,
        BulkLockAttendanceComponent,
        BulkSalaryCorrectionComponent,
        BulkOpenBalanceComponent,
        DipoleServicesComponent,
        AttendanceReprocessComponent,
        BulkAttendanceNewComponent,
        GenerateAdviceComponent,
        // IstToGermanTimePipe,
        
    ],
    imports: [
        CommonModule,
        AttendanceRoutingModule,
        CoreModule,
        NgxPaginationModule,
        FormsModule,
        ReactiveFormsModule,
        AlertModule,
        NgMultiSelectDropDownModule,
        TimepickerModule,
        PopoverModule,
        TooltipModule,
        WebcamModule,
        NgSelectModule


    ],
    providers: [DatePipe],

})
export class AttendanceModule { }
