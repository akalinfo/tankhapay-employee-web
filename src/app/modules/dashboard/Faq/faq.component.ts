import { Component } from '@angular/core';

@Component({
  selector: 'app-compliance',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class faqComponent {

  showSidebar: boolean = false;
  // showAssistantBtn: boolean = false;

  constructor() {
    // let assistant_status = localStorage.getItem('assistant_status');
    // if (assistant_status != null && assistant_status == 'Y') {
    //   this.showAssistantBtn = true;
    //   // this.showSidebar = true;
    // }
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }
}
