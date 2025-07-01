import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRenewalComponent } from './contract-renewal.component';

describe('ContractRenewalComponent', () => {
  let component: ContractRenewalComponent;
  let fixture: ComponentFixture<ContractRenewalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContractRenewalComponent]
    });
    fixture = TestBed.createComponent(ContractRenewalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
