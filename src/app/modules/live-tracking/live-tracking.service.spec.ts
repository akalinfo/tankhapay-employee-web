import { TestBed } from '@angular/core/testing';

import { LiveTrackingService } from './live-tracking.service';

describe('LiveTrackingService', () => {
  let service: LiveTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiveTrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
