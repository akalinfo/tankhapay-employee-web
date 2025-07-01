import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SsoLoginComponent } from './sso-login.component';

const routes: Routes = [
  {path: '',   component: SsoLoginComponent } ,
  {  path: ':ssono',   component: SsoLoginComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MobileLoginRoutingModule { }
