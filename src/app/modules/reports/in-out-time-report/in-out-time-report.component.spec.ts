import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutTimeReportComponent } from './in-out-time-report.component';

describe('InOutTimeReportComponent', () => {
  let component: InOutTimeReportComponent;
  let fixture: ComponentFixture<InOutTimeReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InOutTimeReportComponent]
    });
    fixture = TestBed.createComponent(InOutTimeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
