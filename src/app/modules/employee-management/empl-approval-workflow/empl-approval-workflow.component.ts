import { Component, Input } from '@angular/core';
import { dongleState, grooveState } from 'src/app/app.animation';

@Component({
  selector: 'app-empl-approval-workflow',
  templateUrl: './empl-approval-workflow.component.html',
  styleUrls: ['./empl-approval-workflow.component.css'],
  animations: [dongleState, grooveState],
})
export class EmplApprovalWorkflowComponent {

  @Input() empDataFromParent: any;
  showAddApprovalModal: boolean = false;

  constructor() {}

  ngOnInit() {

  }

  openAddApprovalModal() {
    this.showAddApprovalModal = true;
  }
  closeAddApprovalModal() {
    this.showAddApprovalModal = false;
  }

}
