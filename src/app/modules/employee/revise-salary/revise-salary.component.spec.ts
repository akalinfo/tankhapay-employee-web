import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviseSalaryComponent } from './revise-salary.component';

describe('ReviseSalaryComponent', () => {
  let component: ReviseSalaryComponent;
  let fixture: ComponentFixture<ReviseSalaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReviseSalaryComponent]
    });
    fixture = TestBed.createComponent(ReviseSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
