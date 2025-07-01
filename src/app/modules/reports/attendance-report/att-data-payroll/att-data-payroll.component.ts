import { Component } from '@angular/core';

@Component({
  selector: 'app-att-data-payroll',
  templateUrl: './att-data-payroll.component.html',
  styleUrls: ['./att-data-payroll.component.css']
})
export class AttDataPayrollComponent {

  showSidebar: boolean = true;

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

}
