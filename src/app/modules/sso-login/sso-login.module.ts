import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SsoLoginComponent } from './sso-login.component';
import { CoreModule } from '../../components/core/core.module';
import { NgxCaptchaModule } from 'ngx-captcha';

import { MobileLoginRoutingModule } from './sso-login-routing.module';
import { EmployeeSsoComponent } from './employee-sso/employee-sso.component';


@NgModule({
  declarations: [SsoLoginComponent, EmployeeSsoComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    NgxCaptchaModule,
    MobileLoginRoutingModule
  ]
})
export class SsoLoginModule { }
