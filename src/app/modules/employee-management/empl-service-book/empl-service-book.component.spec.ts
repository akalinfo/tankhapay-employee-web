import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplServiceBookComponent } from './empl-service-book.component';

describe('EmplServiceBookComponent', () => {
  let component: EmplServiceBookComponent;
  let fixture: ComponentFixture<EmplServiceBookComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplServiceBookComponent]
    });
    fixture = TestBed.createComponent(EmplServiceBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
