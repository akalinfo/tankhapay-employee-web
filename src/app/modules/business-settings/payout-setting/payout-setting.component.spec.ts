import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayoutSettingComponent } from './payout-setting.component';

describe('PayoutSettingComponent', () => {
  let component: PayoutSettingComponent;
  let fixture: ComponentFixture<PayoutSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayoutSettingComponent]
    });
    fixture = TestBed.createComponent(PayoutSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
