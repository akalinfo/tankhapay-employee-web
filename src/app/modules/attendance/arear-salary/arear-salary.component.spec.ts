import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArearSalaryComponent } from './arear-salary.component';

describe('ArearSalaryComponent', () => {
  let component: ArearSalaryComponent;
  let fixture: ComponentFixture<ArearSalaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArearSalaryComponent]
    });
    fixture = TestBed.createComponent(ArearSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
