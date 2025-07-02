import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSalaryCorrectionComponent } from './bulk-salary-correction.component';

describe('BulkSalaryCorrectionComponent', () => {
  let component: BulkSalaryCorrectionComponent;
  let fixture: ComponentFixture<BulkSalaryCorrectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkSalaryCorrectionComponent]
    });
    fixture = TestBed.createComponent(BulkSalaryCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
