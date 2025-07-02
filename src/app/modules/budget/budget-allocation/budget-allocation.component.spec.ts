import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetAllocationComponent } from './budget-allocation.component';

describe('BudgetAllocationComponent', () => {
  let component: BudgetAllocationComponent;
  let fixture: ComponentFixture<BudgetAllocationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BudgetAllocationComponent]
    });
    fixture = TestBed.createComponent(BudgetAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
