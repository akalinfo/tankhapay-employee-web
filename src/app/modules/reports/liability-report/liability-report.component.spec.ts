import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiabilityReportComponent } from './liability-report.component';

describe('LiabilityReportComponent', () => {
  let component: LiabilityReportComponent;
  let fixture: ComponentFixture<LiabilityReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LiabilityReportComponent]
    });
    fixture = TestBed.createComponent(LiabilityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
