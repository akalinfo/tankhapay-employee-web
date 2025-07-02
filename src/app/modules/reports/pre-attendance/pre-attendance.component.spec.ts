import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAttendanceComponent } from './pre-attendance.component';

describe('PreAttendanceComponent', () => {
  let component: PreAttendanceComponent;
  let fixture: ComponentFixture<PreAttendanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreAttendanceComponent]
    });
    fixture = TestBed.createComponent(PreAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
