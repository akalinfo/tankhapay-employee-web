import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceReprocessComponent } from './attendance-reprocess.component';

describe('AttendanceReprocessComponent', () => {
  let component: AttendanceReprocessComponent;
  let fixture: ComponentFixture<AttendanceReprocessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttendanceReprocessComponent]
    });
    fixture = TestBed.createComponent(AttendanceReprocessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
