import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MakePaymentsComponent } from './make-payments/make-payments.component';
import { PayoutsComponent } from './payouts/payouts.component';
import { AdvancePayoutComponent } from './advance-payout/advance-payout.component';
import { PayoutDetailsComponent } from './payout-details/payout-details.component';
import { PaymentComponent } from './payment/payment.component';
import { AdvanceComponent } from './advance/advance.component';
import { AdvancePaymentComponent } from './advance-payment/advance-payment.component';
import { ReimbursementComponent } from './reimbursement/reimbursement.component';
import { ReimbursementPaymentComponent } from './reimbursement-payment/reimbursement-payment.component';
import { PayConsultantComponent } from './pay-consultant/pay-consultant.component';
import { ConsultantPaymentComponent } from './consultant-payment/consultant-payment.component';

const routes: Routes = [

  {
    path: '', component: PayoutsComponent } 
  ,
  
  {
    path:'make-payments',
    component: MakePaymentsComponent
  },
  {
    path:'advance-payout',
    component:AdvancePayoutComponent
  },
  {
    path: 'payout-details/:id',
    component: PayoutDetailsComponent
  },
  {
    path: 'payment',
    component: PaymentComponent
  },{
    path: 'Advance',
    component: AdvanceComponent
  },
  {
    path: 'Advance-Payment',
    component: AdvancePaymentComponent
  },{
    path: 'Reimbursement',
    component: ReimbursementComponent
  },
  {
    path: 'Reimbursement-Payment',
    component: ReimbursementPaymentComponent
  },
  {
    path: 'pay_consultant',
    component: PayConsultantComponent
  },
  {
    path: 'consultant_payment',
    component: ConsultantPaymentComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayoutRoutingModule { }
