import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeCheckinCheckoutComponent } from './employee-checkin-checkout.component';

describe('EmployeeCheckinCheckoutComponent', () => {
  let component: EmployeeCheckinCheckoutComponent;
  let fixture: ComponentFixture<EmployeeCheckinCheckoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeCheckinCheckoutComponent]
    });
    fixture = TestBed.createComponent(EmployeeCheckinCheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
