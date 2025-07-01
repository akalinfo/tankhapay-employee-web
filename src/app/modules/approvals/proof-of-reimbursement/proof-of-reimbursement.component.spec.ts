import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofOfReimbursementComponent } from './proof-of-reimbursement.component';

describe('ProofOfReimbursementComponent', () => {
  let component: ProofOfReimbursementComponent;
  let fixture: ComponentFixture<ProofOfReimbursementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProofOfReimbursementComponent]
    });
    fixture = TestBed.createComponent(ProofOfReimbursementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
