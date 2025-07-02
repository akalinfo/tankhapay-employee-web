import { Component } from '@angular/core';

@Component({
  selector: 'app-setup-salary',
  templateUrl: './setup-salary.component.html',
  styleUrls: ['./setup-salary.component.css']
})
export class SetupSalaryComponent {

  showSidebar: boolean = true;

  ngOnInit() {


  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

}
