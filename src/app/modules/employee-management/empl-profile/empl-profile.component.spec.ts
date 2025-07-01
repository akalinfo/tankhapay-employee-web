import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplProfileComponent } from './empl-profile.component';

describe('EmplProfileComponent', () => {
  let component: EmplProfileComponent;
  let fixture: ComponentFixture<EmplProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplProfileComponent]
    });
    fixture = TestBed.createComponent(EmplProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
