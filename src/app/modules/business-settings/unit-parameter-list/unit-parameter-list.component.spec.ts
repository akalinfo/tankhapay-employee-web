import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitParameterListComponent } from './unit-parameter-list.component';

describe('UnitParameterListComponent', () => {
  let component: UnitParameterListComponent;
  let fixture: ComponentFixture<UnitParameterListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnitParameterListComponent]
    });
    fixture = TestBed.createComponent(UnitParameterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
