import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditLogReportComponent } from './audit-log-report.component';

describe('AttDeviationReportComponent', () => {
  let component: AuditLogReportComponent;
  let fixture: ComponentFixture<AuditLogReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditLogReportComponent]
    });
    fixture = TestBed.createComponent(AuditLogReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
