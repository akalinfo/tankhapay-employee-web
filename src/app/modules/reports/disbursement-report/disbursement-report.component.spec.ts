import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisbursementReportComponent } from './disbursement-report.component';

describe('DisbursementReportComponent', () => {
  let component: DisbursementReportComponent;
  let fixture: ComponentFixture<DisbursementReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisbursementReportComponent]
    });
    fixture = TestBed.createComponent(DisbursementReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
