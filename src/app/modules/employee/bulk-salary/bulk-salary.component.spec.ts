import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkSalaryComponent } from './bulk-salary.component';

describe('BulkSalaryComponent', () => {
  let component: BulkSalaryComponent;
  let fixture: ComponentFixture<BulkSalaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkSalaryComponent]
    });
    fixture = TestBed.createComponent(BulkSalaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
