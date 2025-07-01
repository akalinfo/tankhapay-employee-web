import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveBookedBalanceComponent } from './leave-booked-balance.component';

describe('LeaveBookedBalanceComponent', () => {
  let component: LeaveBookedBalanceComponent;
  let fixture: ComponentFixture<LeaveBookedBalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaveBookedBalanceComponent]
    });
    fixture = TestBed.createComponent(LeaveBookedBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
