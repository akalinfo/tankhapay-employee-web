import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RegistrationApprovedComponent } from './signup/registration-approved/registration-approved.component';
// import { BusinessSetupComponent } from './signup/business-setup/business-setup.component';
import { OnboardingComponent } from './signup/onboarding/onboarding.component';
import { SignupComponent } from './signup/signup.component';
import { StartingBalanceComponent } from './signup/starting-balance/starting-balance.component';
import { ThankUComponent } from './signup/thank-u/thank-u.component';
import { GeneratePasswordComponent } from './generate-password/generate-password.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  }, {
    path: 'reset-password/:id/:non',
    component: ResetPasswordComponent
  },
  , {
    path: 'signup',
    component: SignupComponent

  }, {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },

  {
    path: 'onboarding',
    component: OnboardingComponent

  },
  // {
  //   path:'business',
  //   component: BusinessSetupComponent
  // },
  {
    path: 'registration-approved',
    component: RegistrationApprovedComponent

  },
  {
    path: 'starting-balance',
    component: StartingBalanceComponent
  },
  {
    path: 'thank-u',
    component: ThankUComponent
  },
  {
    path: 'generate-password/:id/:non',
    component: GeneratePasswordComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
