import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollingComponent } from './payrolling.component';

describe('PayrollingComponent', () => {
  let component: PayrollingComponent;
  let fixture: ComponentFixture<PayrollingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PayrollingComponent]
    });
    fixture = TestBed.createComponent(PayrollingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
