import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsrDaReportComponent } from './dsr-da-report.component';

describe('DsrDaReportComponent', () => {
  let component: DsrDaReportComponent;
  let fixture: ComponentFixture<DsrDaReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DsrDaReportComponent]
    });
    fixture = TestBed.createComponent(DsrDaReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
