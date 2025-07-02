import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from "../../components/core/core.module";
import { LiveTrackingRoutingModule } from './live-tracking-routing.module';
import { TrackEmployeeComponent } from './track-employee/track-employee.component';
import { LiveTrackingListComponent } from './live-tracking-list/live-tracking-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    TrackEmployeeComponent,
    LiveTrackingListComponent
  ],
  imports: [
    CommonModule,
    LiveTrackingRoutingModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class LiveTrackingModule { }
