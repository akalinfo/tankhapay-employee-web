import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyCheckInOutReportComponent } from './monthly-check-in-out-report.component';

describe('EmployeeAttStatusComponent', () => {
  let component: MonthlyCheckInOutReportComponent;
  let fixture: ComponentFixture<MonthlyCheckInOutReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlyCheckInOutReportComponent]
    });
    fixture = TestBed.createComponent(MonthlyCheckInOutReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
