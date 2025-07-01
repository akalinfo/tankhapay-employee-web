import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewVoucherComponent } from './add-new-voucher.component';

describe('AddNewVoucherComponent', () => {
  let component: AddNewVoucherComponent;
  let fixture: ComponentFixture<AddNewVoucherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddNewVoucherComponent]
    });
    fixture = TestBed.createComponent(AddNewVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
