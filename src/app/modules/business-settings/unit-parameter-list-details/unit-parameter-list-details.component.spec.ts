import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitParameterListDetailsComponent } from './unit-parameter-list-details.component';

describe('UnitParameterListDetailsComponent', () => {
  let component: UnitParameterListDetailsComponent;
  let fixture: ComponentFixture<UnitParameterListDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnitParameterListDetailsComponent]
    });
    fixture = TestBed.createComponent(UnitParameterListDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
