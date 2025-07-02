import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkOpenBalanceComponent } from './bulk-open-balance.component';

describe('BulkOpenBalanceComponent', () => {
  let component: BulkOpenBalanceComponent;
  let fixture: ComponentFixture<BulkOpenBalanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkOpenBalanceComponent]
    });
    fixture = TestBed.createComponent(BulkOpenBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
