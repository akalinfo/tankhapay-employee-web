import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferLetterComponent } from './offer-letter/offer-letter.component';
import { OfferLetterStatusComponent } from './offer-letter-status/offer-letter-status.component';
import { AuthguardService } from 'src/app/shared/services/authguard.service';
import { FlagCheckService } from 'src/app/shared/services/flag-check.service';
import { SsoRedirectComponent } from '../sso-redirect/sso-redirect.component';

const routes: Routes = [
  {
    path: '',
    component: OfferLetterComponent,
    canActivate: [AuthguardService, FlagCheckService]
  },
  {
    path: 'offer-letter-accept',
    component: OfferLetterStatusComponent
  }, {
    path: 'ats',
    component: SsoRedirectComponent
  }, {
    path: 'job-postings',
    component: SsoRedirectComponent
  }
  , {
    path: 'branding',
    component: SsoRedirectComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecruitRoutingModule { }
