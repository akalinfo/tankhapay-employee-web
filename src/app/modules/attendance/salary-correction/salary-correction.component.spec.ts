import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryCorrectionComponent } from './salary-correction.component';

describe('SalaryCorrectionComponent', () => {
  let component: SalaryCorrectionComponent;
  let fixture: ComponentFixture<SalaryCorrectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalaryCorrectionComponent]
    });
    fixture = TestBed.createComponent(SalaryCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
