import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TdsReportComponent } from './tds-report.component';

describe('TdsReportComponent', () => {
  let component: TdsReportComponent;
  let fixture: ComponentFixture<TdsReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TdsReportComponent]
    });
    fixture = TestBed.createComponent(TdsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
