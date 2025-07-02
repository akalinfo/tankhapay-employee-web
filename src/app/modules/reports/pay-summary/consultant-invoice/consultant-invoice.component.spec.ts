import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantInvoiceComponent } from './consultant-invoice.component';

describe('ConsultantInvoiceComponent', () => {
  let component: ConsultantInvoiceComponent;
  let fixture: ComponentFixture<ConsultantInvoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantInvoiceComponent]
    });
    fixture = TestBed.createComponent(ConsultantInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
