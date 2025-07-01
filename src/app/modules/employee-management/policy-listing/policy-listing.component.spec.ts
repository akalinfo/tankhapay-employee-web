import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyListingComponent } from './policy-listing.component';

describe('PolicyListingComponent', () => {
  let component: PolicyListingComponent;
  let fixture: ComponentFixture<PolicyListingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyListingComponent]
    });
    fixture = TestBed.createComponent(PolicyListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
