import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VisitorRoutingModule } from './visitor-routing.module';
import { AllVisitorComponent } from './all-visitor/all-visitor.component';
import { NewVisitorComponent } from './new-visitor/new-visitor.component';
import { CoreModule } from 'src/app/components/core/core.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from 'src/app/shared/_alert';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { UpdateVisitorComponent } from './update-visitor/update-visitor.component';
import { NewCardComponent } from './new-card/new-card.component';


@NgModule({
  declarations: [
    AllVisitorComponent,
    NewVisitorComponent,
    UpdateVisitorComponent,
    NewCardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    ReactiveFormsModule,
    AlertModule,
    VisitorRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
  ]
})
export class VisitorModule { }
