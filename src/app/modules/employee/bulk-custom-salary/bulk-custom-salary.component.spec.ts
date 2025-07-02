import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkCustomSalaryComponent } from './bulk-custom-salary.component';

describe('BulkCustomSalaryComponent', () => {
  let component: BulkCustomSalaryComponent;
  let fixture: ComponentFixture<BulkCustomSalaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkCustomSalaryComponent]
    });
    fixture = TestBed.createComponent(BulkCustomSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
