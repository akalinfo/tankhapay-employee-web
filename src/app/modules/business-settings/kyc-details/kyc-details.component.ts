import { Component } from '@angular/core';

@Component({
  selector: 'app-kyc-details',
  templateUrl: './kyc-details.component.html',
  styleUrls: ['./kyc-details.component.css']
})
export class KycDetailsComponent {

  showSidebar: boolean = true;


  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  
}
