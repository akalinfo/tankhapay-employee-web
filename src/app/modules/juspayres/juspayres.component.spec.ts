import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuspayresComponent } from './juspayres.component';

describe('JuspayresComponent', () => {
  let component: JuspayresComponent;
  let fixture: ComponentFixture<JuspayresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JuspayresComponent]
    });
    fixture = TestBed.createComponent(JuspayresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
