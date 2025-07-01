import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttDataPayrollComponent } from './att-data-payroll.component';

describe('AttDataPayrollComponent', () => {
  let component: AttDataPayrollComponent;
  let fixture: ComponentFixture<AttDataPayrollComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttDataPayrollComponent]
    });
    fixture = TestBed.createComponent(AttDataPayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
