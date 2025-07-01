import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetterheadComponent } from './letterhead.component';

describe('BrandingComponent', () => {
  let component: LetterheadComponent;
  let fixture: ComponentFixture<LetterheadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LetterheadComponent]
    });
    fixture = TestBed.createComponent(LetterheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
