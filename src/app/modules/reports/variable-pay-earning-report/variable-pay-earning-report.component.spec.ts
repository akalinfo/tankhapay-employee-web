import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VariablePayEarningReportComponent } from './variable-pay-earning-report.component';

describe('VariablePayEarningReportComponent', () => {
  let component: VariablePayEarningReportComponent;
  let fixture: ComponentFixture<VariablePayEarningReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VariablePayEarningReportComponent]
    });
    fixture = TestBed.createComponent(VariablePayEarningReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
