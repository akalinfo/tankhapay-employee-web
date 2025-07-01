import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanOutstandingReportComponent } from './loan-outstanding-report.component';

describe('LoanOutstandingReportComponent', () => {
  let component: LoanOutstandingReportComponent;
  let fixture: ComponentFixture<LoanOutstandingReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoanOutstandingReportComponent]
    });
    fixture = TestBed.createComponent(LoanOutstandingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
