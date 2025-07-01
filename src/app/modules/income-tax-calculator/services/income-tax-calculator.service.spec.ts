import { TestBed } from '@angular/core/testing';

import { IncomeTaxCalculatorService } from './income-tax-calculator.service';

describe('IncomeTaxCalculatorService', () => {
  let service: IncomeTaxCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncomeTaxCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
