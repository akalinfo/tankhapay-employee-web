import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './products.component';
import { CoreModule } from "../../components/core/core.module";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from '../../shared/_alert/alert.module';

import {ToastModule} from 'primeng/toast';
import {PanelModule} from 'primeng/panel';
@NgModule({
    declarations: [
        ProductsComponent
    ],
    imports: [
        CommonModule,
        ProductsRoutingModule,
        CoreModule,
        FormsModule,
        ReactiveFormsModule,
        AlertModule,
    ToastModule,
    PanelModule
    ]
})
export class ProductsModule { }
