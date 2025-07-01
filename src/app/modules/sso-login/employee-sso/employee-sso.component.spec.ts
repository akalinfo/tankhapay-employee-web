import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSsoComponent } from './employee-sso.component';

describe('EmployeeSsoComponent', () => {
  let component: EmployeeSsoComponent;
  let fixture: ComponentFixture<EmployeeSsoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeSsoComponent]
    });
    fixture = TestBed.createComponent(EmployeeSsoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
