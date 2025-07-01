import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { SupportCategoryComponent } from './support-category/support-category.component';
// import { NotificationsComponent } from './notifications/notifications.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from 'src/app/components/core/core.module';
// import { TrackcomponentComponent } from './trackcomponent/trackcomponent.component';
import { LiveTrackingRoutingModule } from './livetracking-routing';
import { ListEmployeesComponent } from './list-employees/list-employees.component';
import { LiveTrackingComponent } from './live-tracking/live-tracking.component';
import { TimeLineComponent } from './time-line/time-line.component';
import { GoogleMapsModule } from '@angular/google-maps';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';





@NgModule({
  
  declarations: [
    ListEmployeesComponent,
    LiveTrackingComponent,
    TimeLineComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    CoreModule,
    LiveTrackingRoutingModule,
  ]
})
export class LiveTrackingModules { }
