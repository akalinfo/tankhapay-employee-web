import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MakePaymentsComponent } from './make-payments.component';

describe('MakePaymentsComponent', () => {
  let component: MakePaymentsComponent;
  let fixture: ComponentFixture<MakePaymentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MakePaymentsComponent]
    });
    fixture = TestBed.createComponent(MakePaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
