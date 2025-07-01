import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncrementReportComponent } from './increment-report.component';

describe('IncrementReportComponent', () => {
  let component: IncrementReportComponent;
  let fixture: ComponentFixture<IncrementReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IncrementReportComponent]
    });
    fixture = TestBed.createComponent(IncrementReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
