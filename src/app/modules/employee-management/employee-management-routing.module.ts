import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmplHeaderComponent } from './empl-header/empl-header.component';
import { AssetMasterComponent } from './asset-master/asset-master.component';
import { HrLetterComponent } from './hr-letter/hr-letter.component';
import { CreateLetterComponent } from './create-letter/create-letter.component';
import { EmployeesComponent } from '../employee/employees/employees.component';
import { DocumentMasterComponent } from './document-master/document-master.component';
import { PreviewPdfComponent } from './preview-pdf/preview-pdf.component';
import { LetterheadComponent } from './letterhead/letterhead.component';
import { PoliciesComponent } from './policies/policies.component';
import { PolicyListingComponent } from './policy-listing/policy-listing.component';
import { EmplAppSettingComponent } from './empl-app-setting/empl-app-setting.component';
  import { PanBulkUploadComponent } from '../employee-management/pan-bulk-upload/pan-bulk-upload.component';
import { FullAndFinalProcessComponent } from './full-and-final-process/full-and-final-process.component';


const routes: Routes = [
  {
    path:'',
    redirectTo: '/employees',
    pathMatch: 'full'

   },
   {
    path: 'asset_master',
    component: AssetMasterComponent
   },
   {
    path:'employee/:empid',
    component:EmplHeaderComponent
   },
   {
    path:'hr-letter',
    component: HrLetterComponent
   },
   {
    path: 'letter-listing/:id',
    component : CreateLetterComponent
   },
   {
    path : 'employees',
    component : EmployeesComponent
   },
   {
    path:'document-master',
   component: DocumentMasterComponent
  },
  {
    path : 'preview-pdf/:id',
    component : PreviewPdfComponent
  },
  {
    path : 'letterhead',
    component : LetterheadComponent
  },
  {
    path : 'policies',
    component : PoliciesComponent
  },
  {
    path : 'policy/:id',
    component: PolicyListingComponent
  },
  {
    path : 'employee-app-setting',
    component: EmplAppSettingComponent
  },
  {
    path: 'esi-dependent',
    component : EmplHeaderComponent
  },{
    path: 'bulk-upload-pan',
    component: PanBulkUploadComponent
} , {
    path: 'full-and-final',
    component: FullAndFinalProcessComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeManagementRoutingModule { }
