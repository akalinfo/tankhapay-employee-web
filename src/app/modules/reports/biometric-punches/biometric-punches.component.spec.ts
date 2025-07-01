import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiometricPunchesComponent } from './biometric-punches.component';

describe('BiometricPunchesComponent', () => {
  let component: BiometricPunchesComponent;
  let fixture: ComponentFixture<BiometricPunchesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BiometricPunchesComponent]
    });
    fixture = TestBed.createComponent(BiometricPunchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
