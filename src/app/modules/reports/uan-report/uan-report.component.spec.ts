import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UanReportComponent } from './uan-report.component';

describe('UanReportComponent', () => {
  let component: UanReportComponent;
  let fixture: ComponentFixture<UanReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UanReportComponent]
    });
    fixture = TestBed.createComponent(UanReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
