import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtRulesListingComponent } from './ot-rules-listing.component';

describe('OtRulesListingComponent', () => {
  let component: OtRulesListingComponent;
  let fixture: ComponentFixture<OtRulesListingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OtRulesListingComponent]
    });
    fixture = TestBed.createComponent(OtRulesListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
