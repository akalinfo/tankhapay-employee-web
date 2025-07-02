import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AccountComponent } from './account/account.component';
import { CoreModule } from "../../components/core/core.module";
import { QRCodeModule } from 'angularx-qrcode';
import { AlertModule } from 'src/app/shared/_alert';


@NgModule({
    declarations: [
        AccountComponent
    ],
    imports: [
        CommonModule,
        AccountsRoutingModule,
        CoreModule,
        QRCodeModule,
        AlertModule
    ]
})
export class AccountsModule { }
