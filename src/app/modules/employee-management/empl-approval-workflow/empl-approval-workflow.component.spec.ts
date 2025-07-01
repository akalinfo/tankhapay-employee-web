import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplApprovalWorkflowComponent } from './empl-approval-workflow.component';

describe('ApprovalWorkflowComponent', () => {
  let component: EmplApprovalWorkflowComponent;
  let fixture: ComponentFixture<EmplApprovalWorkflowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplApprovalWorkflowComponent]
    });
    fixture = TestBed.createComponent(EmplApprovalWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
