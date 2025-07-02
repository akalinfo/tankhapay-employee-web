import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancePayoutComponent } from './advance-payout.component';

describe('AdvancePayoutComponent', () => {
  let component: AdvancePayoutComponent;
  let fixture: ComponentFixture<AdvancePayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvancePayoutComponent]
    });
    fixture = TestBed.createComponent(AdvancePayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
