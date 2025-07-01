import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleSalarySlipComponent } from './multiple-salary-slip.component';

describe('MultipleSalarySlipComponent', () => {
  let component: MultipleSalarySlipComponent;
  let fixture: ComponentFixture<MultipleSalarySlipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MultipleSalarySlipComponent]
    });
    fixture = TestBed.createComponent(MultipleSalarySlipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
