import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupSalaryComponent } from './setup-salary.component';

describe('SetupSalaryComponent', () => {
  let component: SetupSalaryComponent;
  let fixture: ComponentFixture<SetupSalaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SetupSalaryComponent]
    });
    fixture = TestBed.createComponent(SetupSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
