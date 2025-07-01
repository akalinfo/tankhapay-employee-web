import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalarySlipComponent } from './salary-slip.component';

describe('SalarySlipComponent', () => {
  let component: SalarySlipComponent;
  let fixture: ComponentFixture<SalarySlipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalarySlipComponent]
    });
    fixture = TestBed.createComponent(SalarySlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
