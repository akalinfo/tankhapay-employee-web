import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfCheckinComponent } from './self-checkin.component';

describe('SelfCheckinComponent', () => {
  let component: SelfCheckinComponent;
  let fixture: ComponentFixture<SelfCheckinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SelfCheckinComponent]
    });
    fixture = TestBed.createComponent(SelfCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
