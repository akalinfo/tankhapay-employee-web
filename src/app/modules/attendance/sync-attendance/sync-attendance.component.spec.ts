import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncAttendanceComponent } from './sync-attendance.component';

describe('SyncAttendanceComponent', () => {
  let component: SyncAttendanceComponent;
  let fixture: ComponentFixture<SyncAttendanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SyncAttendanceComponent]
    });
    fixture = TestBed.createComponent(SyncAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
