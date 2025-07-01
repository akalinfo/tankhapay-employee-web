import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WfhRequestApprovalComponent } from './wfh-request-approval.component';

describe('WfhRequestApprovalComponent', () => {
  let component: WfhRequestApprovalComponent;
  let fixture: ComponentFixture<WfhRequestApprovalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WfhRequestApprovalComponent]
    });
    fixture = TestBed.createComponent(WfhRequestApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
