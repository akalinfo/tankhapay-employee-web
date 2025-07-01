import { ComponentFixture, TestBed } from '@angular/core/testing';

import { faqComponent } from './faq.component';

describe('faq', () => {
  let component: faqComponent;
  let fixture: ComponentFixture<faqComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [faqComponent]
    });
    fixture = TestBed.createComponent(faqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
