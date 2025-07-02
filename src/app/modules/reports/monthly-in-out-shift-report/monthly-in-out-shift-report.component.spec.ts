import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyInOutShiftReportComponent } from './monthly-in-out-shift-report.component';

describe('EmployeeAttStatusComponent', () => {
  let component: MonthlyInOutShiftReportComponent;
  let fixture: ComponentFixture<MonthlyInOutShiftReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MonthlyInOutShiftReportComponent]
    });
    fixture = TestBed.createComponent(MonthlyInOutShiftReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
