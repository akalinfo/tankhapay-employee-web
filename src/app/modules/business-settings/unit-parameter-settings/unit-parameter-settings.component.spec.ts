import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitParameterSettingsComponent } from './unit-parameter-settings.component';

describe('UnitParameterSettingsComponent', () => {
  let component: UnitParameterSettingsComponent;
  let fixture: ComponentFixture<UnitParameterSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnitParameterSettingsComponent]
    });
    fixture = TestBed.createComponent(UnitParameterSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
