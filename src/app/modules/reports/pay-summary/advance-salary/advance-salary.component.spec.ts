import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceSalaryComponent } from './advance-salary.component';

describe('AdvanceSalaryComponent', () => {
  let component: AdvanceSalaryComponent;
  let fixture: ComponentFixture<AdvanceSalaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvanceSalaryComponent]
    });
    fixture = TestBed.createComponent(AdvanceSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
