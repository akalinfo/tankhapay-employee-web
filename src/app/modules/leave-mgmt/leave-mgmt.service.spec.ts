import { TestBed } from '@angular/core/testing';

import { LeaveMgmtService } from './leave-mgmt.service';

describe('LeaveMgmtService', () => {
  let service: LeaveMgmtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaveMgmtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
