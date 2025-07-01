import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelExpenseComponent } from './travel-expense.component';

describe('TravelExpenseComponent', () => {
  let component: TravelExpenseComponent;
  let fixture: ComponentFixture<TravelExpenseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TravelExpenseComponent]
    });
    fixture = TestBed.createComponent(TravelExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
