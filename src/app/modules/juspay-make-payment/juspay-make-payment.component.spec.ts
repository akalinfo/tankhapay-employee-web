import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuspyMakePaymentComponent } from './juspay-make-payment.component';

describe('MakePaymentComponent', () => {
  let component: JuspyMakePaymentComponent;
  let fixture: ComponentFixture<JuspyMakePaymentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JuspyMakePaymentComponent]
    });
    fixture = TestBed.createComponent(JuspyMakePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
