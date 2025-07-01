import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardWiseVisitorComponent } from './card-wise-visitor.component';

describe('CardWiseVisitorComponent', () => {
  let component: CardWiseVisitorComponent;
  let fixture: ComponentFixture<CardWiseVisitorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CardWiseVisitorComponent]
    });
    fixture = TestBed.createComponent(CardWiseVisitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
