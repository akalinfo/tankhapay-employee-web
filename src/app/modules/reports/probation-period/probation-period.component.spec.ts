import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbationPeriodComponent } from './probation-period.component';

describe('ProbationPeriodComponent', () => {
  let component: ProbationPeriodComponent;
  let fixture: ComponentFixture<ProbationPeriodComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProbationPeriodComponent]
    });
    fixture = TestBed.createComponent(ProbationPeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
