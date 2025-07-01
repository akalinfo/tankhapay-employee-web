import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeclarationSubmittedReportComponent } from './declaration-submitted-report.component';

describe('DeclarationSubmittedReportComponent', () => {
  let component: DeclarationSubmittedReportComponent;
  let fixture: ComponentFixture<DeclarationSubmittedReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeclarationSubmittedReportComponent]
    });
    fixture = TestBed.createComponent(DeclarationSubmittedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
