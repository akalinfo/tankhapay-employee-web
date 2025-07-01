import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferLetterComponent } from './offer-letter.component';

describe('OfferLetterComponent', () => {
  let component: OfferLetterComponent;
  let fixture: ComponentFixture<OfferLetterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OfferLetterComponent]
    });
    fixture = TestBed.createComponent(OfferLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
