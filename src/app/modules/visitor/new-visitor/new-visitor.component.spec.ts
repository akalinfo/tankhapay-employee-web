import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewVisitorComponent } from './new-visitor.component';

describe('NewVisitorComponent', () => {
  let component: NewVisitorComponent;
  let fixture: ComponentFixture<NewVisitorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewVisitorComponent]
    });
    fixture = TestBed.createComponent(NewVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
