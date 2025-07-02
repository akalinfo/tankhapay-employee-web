import { Component } from '@angular/core';

@Component({
  selector: 'app-daily-att-status',
  templateUrl: './daily-att-status.component.html',
  styleUrls: ['./daily-att-status.component.css']
})
export class DailyAttStatusComponent {

  showSidebar: boolean = true;

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

}
