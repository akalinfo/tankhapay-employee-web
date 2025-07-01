import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingProbationRenewalComponent } from './reporting-probation-renewal.component';

describe('ReportingProbationRenewalComponent', () => {
  let component: ReportingProbationRenewalComponent;
  let fixture: ComponentFixture<ReportingProbationRenewalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportingProbationRenewalComponent]
    });
    fixture = TestBed.createComponent(ReportingProbationRenewalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
