import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantPaymentComponent } from './consultant-payment.component';

describe('ConsultantPaymentComponent', () => {
  let component: ConsultantPaymentComponent;
  let fixture: ComponentFixture<ConsultantPaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantPaymentComponent]
    });
    fixture = TestBed.createComponent(ConsultantPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
