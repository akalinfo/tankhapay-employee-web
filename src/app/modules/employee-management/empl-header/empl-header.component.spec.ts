import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplHeaderComponent } from './empl-header.component';

describe('EmplHeaderComponent', () => {
  let component: EmplHeaderComponent;
  let fixture: ComponentFixture<EmplHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplHeaderComponent]
    });
    fixture = TestBed.createComponent(EmplHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
