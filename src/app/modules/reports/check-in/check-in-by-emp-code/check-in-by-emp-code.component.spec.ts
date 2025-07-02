import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckInByEmpCodeComponent } from './check-in-by-emp-code.component';

describe('CheckInByEmpCodeComponent', () => {
  let component: CheckInByEmpCodeComponent;
  let fixture: ComponentFixture<CheckInByEmpCodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CheckInByEmpCodeComponent]
    });
    fixture = TestBed.createComponent(CheckInByEmpCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
