import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelExpenseListComponent } from './travel-expense-list.component';

describe('TravelExpenseListComponent', () => {
  let component: TravelExpenseListComponent;
  let fixture: ComponentFixture<TravelExpenseListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TravelExpenseListComponent]
    });
    fixture = TestBed.createComponent(TravelExpenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
