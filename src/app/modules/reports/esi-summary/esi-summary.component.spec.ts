import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsiSummaryComponent } from './esi-summary.component';

describe('EsiSummaryComponent', () => {
  let component: EsiSummaryComponent;
  let fixture: ComponentFixture<EsiSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EsiSummaryComponent]
    });
    fixture = TestBed.createComponent(EsiSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
