import { Component } from '@angular/core';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent {

  showSidebar: boolean = true;

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

}
