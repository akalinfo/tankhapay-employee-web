import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLogComponent } from './employee-log.component';

describe('EmployeeLogComponent', () => {
  let component: EmployeeLogComponent;
  let fixture: ComponentFixture<EmployeeLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeLogComponent]
    });
    fixture = TestBed.createComponent(EmployeeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
