import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeofenceSettingComponent } from './geofence-setting.component';

describe('GeofenceSettingComponent', () => {
  let component: GeofenceSettingComponent;
  let fixture: ComponentFixture<GeofenceSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeofenceSettingComponent]
    });
    fixture = TestBed.createComponent(GeofenceSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
