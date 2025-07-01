import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplAttendanceComponent } from './empl-attendance.component';

describe('EmplAttendanceComponent', () => {
  let component: EmplAttendanceComponent;
  let fixture: ComponentFixture<EmplAttendanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplAttendanceComponent]
    });
    fixture = TestBed.createComponent(EmplAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
