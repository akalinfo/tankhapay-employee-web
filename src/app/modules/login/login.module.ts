import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoginComponent } from './login.component';
import { RegistrationApprovedComponent } from './signup/registration-approved/registration-approved.component';
// import { BusinessSetupComponent } from './signup/business-setup/business-setup.component';
import { OnboardingComponent } from './signup/onboarding/onboarding.component';
import { SignupComponent } from './signup/signup.component';
import { CoreModule } from 'src/app/components/core/core.module';
import { HideDigitsPipe } from '../../shared/pipes/hide-digits.pipe';
import { QRCodeModule } from 'angularx-qrcode';
import { StartingBalanceComponent } from './signup/starting-balance/starting-balance.component';
import { ThankUComponent } from './signup/thank-u/thank-u.component';
import { AlertModule } from '../../shared/_alert/alert.module';
import { GeneratePasswordComponent } from './generate-password/generate-password.component';
@NgModule({
  declarations: [
    ForgotPasswordComponent,
    ResetPasswordComponent,
    LoginComponent,
    RegistrationApprovedComponent,
    // BusinessSetupComponent,
    OnboardingComponent,
    StartingBalanceComponent,
    SignupComponent,
    HideDigitsPipe,
    ThankUComponent,
    GeneratePasswordComponent
  ],
  imports: [
    CommonModule,
    AlertModule,
    LoginRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    QRCodeModule,
  ]
})
export class LoginModule { }
