import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeofencesComponent } from './geofences.component';

describe('GeofencesComponent', () => {
  let component: GeofencesComponent;
  let fixture: ComponentFixture<GeofencesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeofencesComponent]
    });
    fixture = TestBed.createComponent(GeofencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
