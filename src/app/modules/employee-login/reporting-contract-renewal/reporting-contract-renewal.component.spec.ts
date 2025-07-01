import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingContractRenewalComponent } from './reporting-contract-renewal.component';

describe('ReportingContractRenewalComponent', () => {
  let component: ReportingContractRenewalComponent;
  let fixture: ComponentFixture<ReportingContractRenewalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportingContractRenewalComponent]
    });
    fixture = TestBed.createComponent(ReportingContractRenewalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
