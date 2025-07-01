import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferLetterStatusComponent } from './offer-letter-status.component';

describe('OfferLetterStatusComponent', () => {
  let component: OfferLetterStatusComponent;
  let fixture: ComponentFixture<OfferLetterStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OfferLetterStatusComponent]
    });
    fixture = TestBed.createComponent(OfferLetterStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
