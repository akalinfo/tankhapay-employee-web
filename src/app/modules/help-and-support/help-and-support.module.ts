import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpAndSupportRoutingModule } from './help-and-support-routing.module';
import { TicketsComponent } from './tickets/tickets.component';
// import { SupportCategoryComponent } from './support-category/support-category.component';
// import { NotificationsComponent } from './notifications/notifications.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from 'src/app/components/core/core.module';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationsArchiveComponent } from './notifications-archive/notifications-archive.component';


@NgModule({
  declarations: [
    TicketsComponent,
    NotificationsComponent,
    NotificationsArchiveComponent
    // ,
    // SupportCategoryComponent,
    // NotificationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,
    HelpAndSupportRoutingModule,
  ]
})
export class HelpAndSupportModule { }
