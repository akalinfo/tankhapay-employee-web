
import { RouterModule, Routes } from '@angular/router';
// import { TrackcomponentComponent } from './trackcomponent/trackcomponent.component';
import { ListEmployeesComponent } from './list-employees/list-employees.component';
import { LiveTrackingComponent } from './live-tracking/live-tracking.component';
import { TimeLineComponent } from './time-line/time-line.component';
import { NgModule } from '@angular/core';



export const routes: Routes = [
    {
    path: '', component: ListEmployeesComponent   

  },
  {
    path: 'list-employees', component: ListEmployeesComponent   

  },
  {
   path: 'live-tracking', component: LiveTrackingComponent ,
     
  },
  {
    path: 'time-line', component: TimeLineComponent ,
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LiveTrackingRoutingModule { }
