import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveNotificationComponent } from './archive-notification.component';

describe('ArchiveNotificationComponent', () => {
  let component: ArchiveNotificationComponent;
  let fixture: ComponentFixture<ArchiveNotificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchiveNotificationComponent]
    });
    fixture = TestBed.createComponent(ArchiveNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
