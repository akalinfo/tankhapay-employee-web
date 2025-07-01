import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackEmployeeComponent } from './track-employee.component';

describe('TrackEmployeeComponent', () => {
  let component: TrackEmployeeComponent;
  let fixture: ComponentFixture<TrackEmployeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrackEmployeeComponent]
    });
    fixture = TestBed.createComponent(TrackEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
