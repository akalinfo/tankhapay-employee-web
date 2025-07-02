import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofOfInvestmentComponent } from './proof-of-investment.component';

describe('ProofOfInvestmentComponent', () => {
  let component: ProofOfInvestmentComponent;
  let fixture: ComponentFixture<ProofOfInvestmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProofOfInvestmentComponent]
    });
    fixture = TestBed.createComponent(ProofOfInvestmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
