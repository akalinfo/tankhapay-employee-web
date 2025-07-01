import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserMgmtRoutingModule } from './user-mgmt-routing.module';
import { UserComponent } from './user/user.component';
import { RolesComponent } from './roles/roles.component';
import { CoreModule } from 'src/app/components/core/core.module';
import { NewRoleComponent } from './new-role/new-role.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { AlertModule } from 'src/app/shared/_alert';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { DepartmentComponent } from './department/department.component';
import { ProjectMasterComponent } from './project-master/project-master.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { VendorMasterComponent } from './vendor-master/vendor-master.component';
import { DesignationComponent } from './designation/designation.component';
@NgModule({
  declarations: [
    UserComponent,
    RolesComponent,
    NewRoleComponent,
    DepartmentComponent,
    ProjectMasterComponent,
    VendorMasterComponent,
    DesignationComponent
  ],
  imports: [
    CommonModule,
    UserMgmtRoutingModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule,
    AlertModule,
    NgMultiSelectDropDownModule,
    NgxPaginationModule,
    NgSelectModule
  ]
})
export class UserMgmtModule { }
