import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsicReportComponent } from './esic-report.component';

describe('EsicReportComponent', () => {
  let component: EsicReportComponent;
  let fixture: ComponentFixture<EsicReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EsicReportComponent]
    });
    fixture = TestBed.createComponent(EsicReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
