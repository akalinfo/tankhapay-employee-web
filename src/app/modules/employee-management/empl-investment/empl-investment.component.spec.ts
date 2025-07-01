import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplInvestmentComponent } from './empl-investment.component';

describe('EmplInvestmentComponent', () => {
  let component: EmplInvestmentComponent;
  let fixture: ComponentFixture<EmplInvestmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplInvestmentComponent]
    });
    fixture = TestBed.createComponent(EmplInvestmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
