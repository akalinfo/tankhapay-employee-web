import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SsoRedirectComponent } from './sso-redirect.component';

const routes: Routes = [
  {
    'path': '',
    component: SsoRedirectComponent
  },
  {
    path : '**',
    component : SsoRedirectComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SsoRedirectRoutingModule { }
