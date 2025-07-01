import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelRequestListComponent } from './travel-request-list.component';

describe('TravelRequestListComponent', () => {
  let component: TravelRequestListComponent;
  let fixture: ComponentFixture<TravelRequestListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TravelRequestListComponent]
    });
    fixture = TestBed.createComponent(TravelRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
