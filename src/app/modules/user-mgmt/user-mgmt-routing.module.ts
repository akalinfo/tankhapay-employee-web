import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user/user.component';
import { RolesComponent } from './roles/roles.component';
import { NewRoleComponent } from './new-role/new-role.component';
import { DepartmentComponent } from './department/department.component';
import { ProjectMasterComponent } from './project-master/project-master.component';
import { VendorMasterComponent } from './vendor-master/vendor-master.component';
import { DesignationComponent } from './designation/designation.component';

const routes: Routes = [
  {
    path: '', component: UserComponent
  },
  {
    path: 'user',
    component: UserComponent
  },
  {
    path: 'roles',
    component: RolesComponent
  },
  {
    path: 'new-role/:id',
    component: NewRoleComponent
  }, {
    path: 'department',
    component: DepartmentComponent
  },
  {
    path: 'project-master',
    component: ProjectMasterComponent
  },
  {
    path: 'vendor-master',
    component: VendorMasterComponent
  },{
    path: 'designation',
    component: DesignationComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserMgmtRoutingModule { }
