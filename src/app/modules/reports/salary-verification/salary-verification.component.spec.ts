import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryVerificationComponent } from './salary-verification.component';

describe('SalaryVerificationComponent', () => {
  let component: SalaryVerificationComponent;
  let fixture: ComponentFixture<SalaryVerificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalaryVerificationComponent]
    });
    fixture = TestBed.createComponent(SalaryVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
