import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { EmployeeManagementRoutingModule } from './employee-management-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CoreModule } from 'src/app/components/core/core.module';
import { AlertModule } from 'src/app/shared/_alert';
import { menuReducer } from './state-mgmt/employee.reducer';
import { StoreModule } from '@ngrx/store';
import { EmplAttendanceComponent } from './empl-attendance/empl-attendance.component';
import { EmplDocumentsComponent } from './empl-documents/empl-documents.component';
import { EmplHeaderComponent } from './empl-header/empl-header.component';
import { EmplPayrollingComponent } from './empl-payrolling/empl-payrolling.component';
import { EmplProfileComponent } from './empl-profile/empl-profile.component';
import { EmplInvestmentComponent } from './empl-investment/empl-investment.component';
import { EmplLeaveMgmtComponent } from './empl-leave-mgmt/empl-leave-mgmt.component';
import { EmplApprovalWorkflowComponent } from './empl-approval-workflow/empl-approval-workflow.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AssetMasterComponent } from './asset-master/asset-master.component';
import { HrLetterComponent } from './hr-letter/hr-letter.component';
import { CreateLetterComponent } from './create-letter/create-letter.component';
import { NgxSummernoteModule } from 'ngx-summernote';
import { TagInputModule } from 'ngx-chips';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { DocumentMasterComponent } from './document-master/document-master.component';
import { PreviewPdfComponent } from './preview-pdf/preview-pdf.component';
import { AssetDetailsComponent } from './asset-details/asset-details.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { LetterheadComponent } from './letterhead/letterhead.component'; 
import { EmplServiceBookComponent } from './empl-service-book/empl-service-book.component';
import { PoliciesComponent } from './policies/policies.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PolicyListingComponent } from './policy-listing/policy-listing.component';
import { EmplAppSettingComponent } from './empl-app-setting/empl-app-setting.component';
import { NumberonlyDirective } from './numberonly.directive';
import { EmployeeLoginModule } from '../employee-login/employee-login.module';
import { EmplServiceBookNewComponent } from './empl-service-book-new/empl-service-book-new.component';
import { PanBulkUploadComponent } from '../employee-management/pan-bulk-upload/pan-bulk-upload.component';
import { FullAndFinalProcessComponent } from './full-and-final-process/full-and-final-process.component';
import { SkillSetOperationsComponent } from './skill-set-operations/skill-set-operations.component';

@NgModule({
  declarations: [
    EmplAttendanceComponent,
    EmplDocumentsComponent,
    EmplHeaderComponent,
    EmplPayrollingComponent,
    EmplProfileComponent,
    EmplInvestmentComponent,
    EmplLeaveMgmtComponent,
    EmplApprovalWorkflowComponent,
    AssetMasterComponent,
    HrLetterComponent,
    CreateLetterComponent,
    DocumentMasterComponent,
    PreviewPdfComponent,
    AssetDetailsComponent,
    LetterheadComponent,
    EmplServiceBookComponent,
    PoliciesComponent,
    PolicyListingComponent,
    EmplAppSettingComponent,
    //NumberonlyDirective,
    EmplServiceBookNewComponent,
    PanBulkUploadComponent,
    FullAndFinalProcessComponent,
    SkillSetOperationsComponent
  ],
  imports: [
    CommonModule,
    EmployeeManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    AlertModule,
    NgxPaginationModule,
    NgMultiSelectDropDownModule,
    AngularMultiSelectModule,
    NgxSummernoteModule,
    TagInputModule,
    AngularEditorModule,
    NgSelectModule,
    EmployeeLoginModule,
    
    StoreModule.forFeature('menu', menuReducer)
  ],
  providers: [DatePipe],
})
export class EmployeeManagementModule { }
