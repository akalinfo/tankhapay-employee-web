import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrackEmployeeComponent } from './track-employee/track-employee.component';
import { LiveTrackingListComponent } from './live-tracking-list/live-tracking-list.component';

const routes: Routes = [
  {
    path: '', component: LiveTrackingListComponent
  },
  {
    path: 'view/:EmpCode', component: TrackEmployeeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LiveTrackingRoutingModule { }
