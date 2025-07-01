import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplPayrollingComponent } from './empl-payrolling.component';

describe('EmplPayrollingComponent', () => {
  let component: EmplPayrollingComponent;
  let fixture: ComponentFixture<EmplPayrollingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplPayrollingComponent]
    });
    fixture = TestBed.createComponent(EmplPayrollingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
