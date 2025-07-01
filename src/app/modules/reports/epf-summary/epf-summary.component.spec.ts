import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpfSummaryComponent } from './epf-summary.component';

describe('EpfSummaryComponent', () => {
  let component: EpfSummaryComponent;
  let fixture: ComponentFixture<EpfSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EpfSummaryComponent]
    });
    fixture = TestBed.createComponent(EpfSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
