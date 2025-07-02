import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveNotificationsComponent } from './notifications-settings.component';

describe('LeaveNotificationsComponent', () => {
  let component: LeaveNotificationsComponent;
  let fixture: ComponentFixture<LeaveNotificationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaveNotificationsComponent]
    });
    fixture = TestBed.createComponent(LeaveNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
