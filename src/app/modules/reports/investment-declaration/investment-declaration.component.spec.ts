import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestmentDeclarationComponent } from './investment-declaration.component';

describe('InvestmentDeclarationComponent', () => {
  let component: InvestmentDeclarationComponent;
  let fixture: ComponentFixture<InvestmentDeclarationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvestmentDeclarationComponent]
    });
    fixture = TestBed.createComponent(InvestmentDeclarationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
