import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttDeviationReportComponent } from './att-deviation-report.component';

describe('AttDeviationReportComponent', () => {
  let component: AttDeviationReportComponent;
  let fixture: ComponentFixture<AttDeviationReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttDeviationReportComponent]
    });
    fixture = TestBed.createComponent(AttDeviationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
