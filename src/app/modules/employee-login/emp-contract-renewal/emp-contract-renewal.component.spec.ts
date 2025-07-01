import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpContractRenewalComponent } from './emp-contract-renewal.component';

describe('EmpContractRenewalComponent', () => {
  let component: EmpContractRenewalComponent;
  let fixture: ComponentFixture<EmpContractRenewalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpContractRenewalComponent]
    });
    fixture = TestBed.createComponent(EmpContractRenewalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
