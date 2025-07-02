import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayConsultantComponent } from './pay-consultant.component';

describe('PayConsultantComponent', () => {
  let component: PayConsultantComponent;
  let fixture: ComponentFixture<PayConsultantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayConsultantComponent]
    });
    fixture = TestBed.createComponent(PayConsultantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
