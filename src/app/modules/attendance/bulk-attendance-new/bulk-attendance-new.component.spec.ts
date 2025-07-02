import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkAttendanceNewComponent } from './bulk-attendance-new.component';

describe('BulkAttendanceNewComponent', () => {
  let component: BulkAttendanceNewComponent;
  let fixture: ComponentFixture<BulkAttendanceNewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkAttendanceNewComponent]
    });
    fixture = TestBed.createComponent(BulkAttendanceNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
