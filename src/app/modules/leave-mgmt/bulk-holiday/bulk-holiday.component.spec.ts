import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkHolidayComponent } from './bulk-holiday.component';

describe('BulkHolidayComponent', () => {
  let component: BulkHolidayComponent;
  let fixture: ComponentFixture<BulkHolidayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkHolidayComponent]
    });
    fixture = TestBed.createComponent(BulkHolidayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
