import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveTrackingListComponent } from './live-tracking-list.component';

describe('LiveTrackingListComponent', () => {
  let component: LiveTrackingListComponent;
  let fixture: ComponentFixture<LiveTrackingListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LiveTrackingListComponent]
    });
    fixture = TestBed.createComponent(LiveTrackingListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
