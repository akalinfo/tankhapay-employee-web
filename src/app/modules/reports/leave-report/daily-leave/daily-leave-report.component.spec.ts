import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyLeaveReportComponent } from './daily-leave-report.component';

describe('DailyLeaveReportComponent', () => {
  let component: DailyLeaveReportComponent;
  let fixture: ComponentFixture<DailyLeaveReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DailyLeaveReportComponent]
    });
    fixture = TestBed.createComponent(DailyLeaveReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
