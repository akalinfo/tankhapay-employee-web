import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRoutingModule } from './login-routing.module';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { CoreModule } from 'src/app/components/core/core.module';
import { HideDigitsPipe } from '../../shared/pipes/hide-digits.pipe';
import { QRCodeModule } from 'angularx-qrcode';
import { AlertModule } from '../../shared/_alert/alert.module';
@NgModule({
  declarations: [
    LoginComponent,
    HideDigitsPipe,
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
