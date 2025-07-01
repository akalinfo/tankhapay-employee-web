import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsArchiveComponent } from './notifications-archive.component';

describe('NotificationsArchiveComponent', () => {
  let component: NotificationsArchiveComponent;
  let fixture: ComponentFixture<NotificationsArchiveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationsArchiveComponent]
    });
    fixture = TestBed.createComponent(NotificationsArchiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
