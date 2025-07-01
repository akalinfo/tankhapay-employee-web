import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpDailyHourwiseReportComponent } from './emp-daily-hourwise-report.component';

describe('EmpDailyHourwiseReportComponent', () => {
  let component: EmpDailyHourwiseReportComponent;
  let fixture: ComponentFixture<EmpDailyHourwiseReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpDailyHourwiseReportComponent]
    });
    fixture = TestBed.createComponent(EmpDailyHourwiseReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
