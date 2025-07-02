import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchBankReportComponent } from './fetch-bank-report.component';

describe('FetchBankReportComponent', () => {
  let component: FetchBankReportComponent;
  let fixture: ComponentFixture<FetchBankReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FetchBankReportComponent]
    });
    fixture = TestBed.createComponent(FetchBankReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
