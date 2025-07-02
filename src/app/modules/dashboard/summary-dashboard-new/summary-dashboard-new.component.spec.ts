import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryDashboardNewComponent } from './summary-dashboard-new.component';

describe('SummaryDashboardNewComponent', () => {
  let component: SummaryDashboardNewComponent;
  let fixture: ComponentFixture<SummaryDashboardNewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SummaryDashboardNewComponent]
    });
    fixture = TestBed.createComponent(SummaryDashboardNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
