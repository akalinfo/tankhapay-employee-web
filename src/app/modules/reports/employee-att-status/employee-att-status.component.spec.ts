import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAttStatusComponent } from './employee-att-status.component';

describe('EmployeeAttStatusComponent', () => {
  let component: EmployeeAttStatusComponent;
  let fixture: ComponentFixture<EmployeeAttStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeAttStatusComponent]
    });
    fixture = TestBed.createComponent(EmployeeAttStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
