import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LwfReportComponent } from './lwf-report.component';

describe('LwfReportComponent', () => {
  let component: LwfReportComponent;
  let fixture: ComponentFixture<LwfReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LwfReportComponent]
    });
    fixture = TestBed.createComponent(LwfReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
