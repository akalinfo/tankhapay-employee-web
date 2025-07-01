import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceUnitComponent } from './attendance-unit.component';

describe('AttendanceUnitComponent', () => {
  let component: AttendanceUnitComponent;
  let fixture: ComponentFixture<AttendanceUnitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttendanceUnitComponent]
    });
    fixture = TestBed.createComponent(AttendanceUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
