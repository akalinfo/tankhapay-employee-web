import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllVisitorReportComponent } from './all-visitor-report.component';

describe('AllVisitorReportComponent', () => {
  let component: AllVisitorReportComponent;
  let fixture: ComponentFixture<AllVisitorReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AllVisitorReportComponent]
    });
    fixture = TestBed.createComponent(AllVisitorReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
