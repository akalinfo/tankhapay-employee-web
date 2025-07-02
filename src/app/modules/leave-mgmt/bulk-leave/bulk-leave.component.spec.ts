import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkLeaveComponent } from './bulk-leave.component';

describe('BulkLeaveComponent', () => {
  let component: BulkLeaveComponent;
  let fixture: ComponentFixture<BulkLeaveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkLeaveComponent]
    });
    fixture = TestBed.createComponent(BulkLeaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
