import { TestBed } from '@angular/core/testing';

import { FaceCheckinService } from './face-checkin.service';

describe('FaceCheckinService', () => {
  let service: FaceCheckinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaceCheckinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
