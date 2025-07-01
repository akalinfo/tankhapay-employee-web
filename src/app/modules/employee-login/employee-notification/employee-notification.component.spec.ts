import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeNotificationComponent } from './employee-notification.component';

describe('EmployeeNotificationComponent', () => {
  let component: EmployeeNotificationComponent;
  let fixture: ComponentFixture<EmployeeNotificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeNotificationComponent]
    });
    fixture = TestBed.createComponent(EmployeeNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
