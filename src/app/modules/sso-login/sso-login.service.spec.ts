import { TestBed } from '@angular/core/testing';

import { SsoLoginService } from './sso-login.service';

describe('MobileLoginService', () => {
  let service: SsoLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SsoLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
