import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissedPunchAttComponent } from './missed-punch-att.component';

describe('MissedPunchAttComponent', () => {
  let component: MissedPunchAttComponent;
  let fixture: ComponentFixture<MissedPunchAttComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MissedPunchAttComponent]
    });
    fixture = TestBed.createComponent(MissedPunchAttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
