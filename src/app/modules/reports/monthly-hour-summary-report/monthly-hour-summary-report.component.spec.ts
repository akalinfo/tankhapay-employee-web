import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MonthlyHourSummaryReportComponent } from './monthly-hour-summary-report.component';

describe('MonthlyHourSummaryReportComponent', () => {
  let component: MonthlyHourSummaryReportComponent;
  let fixture: ComponentFixture<MonthlyHourSummaryReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlyHourSummaryReportComponent]
    });
    fixture = TestBed.createComponent(MonthlyHourSummaryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
