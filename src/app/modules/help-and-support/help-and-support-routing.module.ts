import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { NotificationsComponent } from './notifications/notifications.component';
import { TicketsComponent } from './tickets/tickets.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationsArchiveComponent } from './notifications-archive/notifications-archive.component';

// import { SupportCategoryComponent } from './support-category/support-category.component';

const routes: Routes = [
  // {
  //   path: 'notifications',
  //   component: NotificationsComponent
  // },
  {
    path: 'tickets',
    component: TicketsComponent
  },
  // {
  //   path: 'support_category',
  //   component: SupportCategoryComponent
  // }
  ,
  {
    path: 'notifications',
    component: NotificationsComponent
  },
  {
    path: 'notificationsArchive',
    component: NotificationsArchiveComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpAndSupportRoutingModule { }
