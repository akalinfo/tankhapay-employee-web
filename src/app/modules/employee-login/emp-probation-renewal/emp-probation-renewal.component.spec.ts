import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpProbationRenewalComponent } from './emp-probation-renewal.component';

describe('EmpProbationRenewalComponent', () => {
  let component: EmpProbationRenewalComponent;
  let fixture: ComponentFixture<EmpProbationRenewalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpProbationRenewalComponent]
    });
    fixture = TestBed.createComponent(EmpProbationRenewalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
