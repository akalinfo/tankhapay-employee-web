import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAttMissedPunchComponent } from './report-att-missed-punch.component';

describe('ReportAttMissedPunchComponent', () => {
  let component: ReportAttMissedPunchComponent;
  let fixture: ComponentFixture<ReportAttMissedPunchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportAttMissedPunchComponent]
    });
    fixture = TestBed.createComponent(ReportAttMissedPunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
