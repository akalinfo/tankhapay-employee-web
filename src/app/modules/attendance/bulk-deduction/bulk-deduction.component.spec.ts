import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkDeductionComponent } from './bulk-deduction.component';

describe('BulkDeductionComponent', () => {
  let component: BulkDeductionComponent;
  let fixture: ComponentFixture<BulkDeductionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkDeductionComponent]
    });
    fixture = TestBed.createComponent(BulkDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
