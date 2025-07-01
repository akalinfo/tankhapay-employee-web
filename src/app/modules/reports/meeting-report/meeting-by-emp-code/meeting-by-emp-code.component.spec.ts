import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingByEmpCodeComponent } from './meeting-by-emp-code.component';

describe('MeetingByEmpCodeComponent', () => {
  let component: MeetingByEmpCodeComponent;
  let fixture: ComponentFixture<MeetingByEmpCodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MeetingByEmpCodeComponent]
    });
    fixture = TestBed.createComponent(MeetingByEmpCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
