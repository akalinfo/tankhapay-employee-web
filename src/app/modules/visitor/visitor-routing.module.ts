import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolesComponent } from '../user-mgmt/roles/roles.component';
import { NewVisitorComponent } from './new-visitor/new-visitor.component';
import { AllVisitorComponent } from './all-visitor/all-visitor.component';
import { UpdateVisitorComponent } from './update-visitor/update-visitor.component';
import { NewCardComponent } from './new-card/new-card.component';

const routes: Routes = [
  {
    path: '', component: NewVisitorComponent
  },
  {
    path: 'new_visitor',
    component: NewVisitorComponent
  },
  {
    path: 'all_visitor',
    component: AllVisitorComponent
  },
  {
    path: 'update_visitor',
    component: UpdateVisitorComponent
  },
  {
    path: 'new-card',
    component: NewCardComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisitorRoutingModule { }
