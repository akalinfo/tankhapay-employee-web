import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceDsrDaComponent } from './attendance-dsr-da.component';

describe('AttendanceDsrDaComponent', () => {
  let component: AttendanceDsrDaComponent;
  let fixture: ComponentFixture<AttendanceDsrDaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttendanceDsrDaComponent]
    });
    fixture = TestBed.createComponent(AttendanceDsrDaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
