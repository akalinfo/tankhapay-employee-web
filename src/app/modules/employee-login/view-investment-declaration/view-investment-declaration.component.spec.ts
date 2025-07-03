import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewInvestmentDeclarationComponent } from './view-investment-declaration.component';

describe('ViewInvestmentDeclarationComponent', () => {
  let component: ViewInvestmentDeclarationComponent;
  let fixture: ComponentFixture<ViewInvestmentDeclarationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewInvestmentDeclarationComponent]
    });
    fixture = TestBed.createComponent(ViewInvestmentDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
