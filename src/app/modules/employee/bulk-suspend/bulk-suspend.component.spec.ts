import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSuspendComponent } from './bulk-suspend.component';

describe('BulkSuspendComponent', () => {
  let component: BulkSuspendComponent;
  let fixture: ComponentFixture<BulkSuspendComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkSuspendComponent]
    });
    fixture = TestBed.createComponent(BulkSuspendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
