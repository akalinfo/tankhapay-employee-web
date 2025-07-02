import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterVoucherTypeComponent } from './master-voucher-type.component';

describe('MasterVoucherTypeComponent', () => {
  let component: MasterVoucherTypeComponent;
  let fixture: ComponentFixture<MasterVoucherTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MasterVoucherTypeComponent]
    });
    fixture = TestBed.createComponent(MasterVoucherTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
