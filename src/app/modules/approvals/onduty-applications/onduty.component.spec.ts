import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OndutyComponent } from './onduty.component';

describe('OndutyComponent', () => {
  let component: OndutyComponent;
  let fixture: ComponentFixture<OndutyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OndutyComponent]
    });
    fixture = TestBed.createComponent(OndutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
