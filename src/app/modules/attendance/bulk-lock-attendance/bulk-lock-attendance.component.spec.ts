import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkLockAttendanceComponent } from './bulk-lock-attendance.component';

describe('MissedPunchAttComponent', () => {
  let component: BulkLockAttendanceComponent;
  let fixture: ComponentFixture<BulkLockAttendanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkLockAttendanceComponent]
    });
    fixture = TestBed.createComponent(BulkLockAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
