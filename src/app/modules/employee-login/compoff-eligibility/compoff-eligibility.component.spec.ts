import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompoffEligibilityComponent } from './CompoffEligibilityComponent';

describe('CompoffEligibilityComponent', () => {
  let component: CompoffEligibilityComponent;
  let fixture: ComponentFixture<CompoffEligibilityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CompoffEligibilityComponent]
    });
    fixture = TestBed.createComponent(CompoffEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
