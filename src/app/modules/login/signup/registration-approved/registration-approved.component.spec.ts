import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationApprovedComponent } from './registration-approved.component';

describe('RegistrationApprovedComponent', () => {
  let component: RegistrationApprovedComponent;
  let fixture: ComponentFixture<RegistrationApprovedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegistrationApprovedComponent]
    });
    fixture = TestBed.createComponent(RegistrationApprovedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
