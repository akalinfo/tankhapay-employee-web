import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PayoutRoutingModule } from './payout-routing.module';
import { PayoutsComponent } from './payouts/payouts.component';
import { MakePaymentsComponent } from './make-payments/make-payments.component';
import { CoreModule } from "../../components/core/core.module";
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { AdvancePayoutComponent } from './advance-payout/advance-payout.component';
import { PayoutDetailsComponent } from './payout-details/payout-details.component';
import { PaymentComponent } from './payment/payment.component';
import { QRCodeModule } from 'angularx-qrcode';
import { AdvanceComponent } from './advance/advance.component';
import { AdvancePaymentComponent } from './advance-payment/advance-payment.component';
import { AlertModule } from '../../shared/_alert/alert.module';
import { ReimbursementComponent } from './reimbursement/reimbursement.component';
import { ReimbursementPaymentComponent } from './reimbursement-payment/reimbursement-payment.component';
import { PayConsultantComponent } from './pay-consultant/pay-consultant.component';
import { ConsultantPaymentComponent } from './consultant-payment/consultant-payment.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
@NgModule({
    declarations: [
        PayoutsComponent,
        MakePaymentsComponent,
        AdvancePayoutComponent,
        PayoutDetailsComponent,
        PaymentComponent,
        AdvanceComponent,
        AdvancePaymentComponent,
        ReimbursementComponent,
        ReimbursementPaymentComponent,
        PayConsultantComponent,
        ConsultantPaymentComponent
    ],
    imports: [
        CommonModule,
        PayoutRoutingModule,
        FormsModule,
        CoreModule,
        ReactiveFormsModule,
        QRCodeModule,
        AlertModule,
        NgMultiSelectDropDownModule
       
    ]
})
export class PayoutModule { }
