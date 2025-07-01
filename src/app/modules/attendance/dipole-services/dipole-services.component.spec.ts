import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DipoleServicesComponent } from './dipole-services.component';

describe('DipoleServicesComponent', () => {
  let component: DipoleServicesComponent;
  let fixture: ComponentFixture<DipoleServicesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DipoleServicesComponent]
    });
    fixture = TestBed.createComponent(DipoleServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
