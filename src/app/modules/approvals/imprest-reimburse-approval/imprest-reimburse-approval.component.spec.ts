import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImprestReimburseApprovalComponent } from './imprest-reimburse-approval.component';

describe('ImprestReimburseApprovalComponent', () => {
  let component: ImprestReimburseApprovalComponent;
  let fixture: ComponentFixture<ImprestReimburseApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImprestReimburseApprovalComponent]
    });
    fixture = TestBed.createComponent(ImprestReimburseApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
