import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullAndFinalProcessComponent } from './full-and-final-process.component';

describe('FullAndFinalProcessComponent', () => {
  let component: FullAndFinalProcessComponent;
  let fixture: ComponentFixture<FullAndFinalProcessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FullAndFinalProcessComponent]
    });
    fixture = TestBed.createComponent(FullAndFinalProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
