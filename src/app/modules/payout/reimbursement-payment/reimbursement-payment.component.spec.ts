import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReimbursementPaymentComponent } from './reimbursement-payment.component';

describe('ReimbursementPaymentComponent', () => {
  let component: ReimbursementPaymentComponent;
  let fixture: ComponentFixture<ReimbursementPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReimbursementPaymentComponent]
    });
    fixture = TestBed.createComponent(ReimbursementPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
