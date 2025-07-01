import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyAttStatusComponent } from './daily-att-status.component';

describe('DailyAttStatusComponent', () => {
  let component: DailyAttStatusComponent;
  let fixture: ComponentFixture<DailyAttStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DailyAttStatusComponent]
    });
    fixture = TestBed.createComponent(DailyAttStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
