import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BroadcasterRoutingModule } from './broadcaster-routing.module';
import { NotificationComponent } from './notification/notification.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from 'src/app/components/core/core.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxSummernoteModule } from 'ngx-summernote';

@NgModule({
  declarations: [
    NotificationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    ReactiveFormsModule,
    BroadcasterRoutingModule,
    NgMultiSelectDropDownModule,
    NgxSummernoteModule
  ]
})
export class BroadcasterModule { }
