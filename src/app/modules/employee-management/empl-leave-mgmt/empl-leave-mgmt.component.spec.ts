import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplLeaveMgmtComponent } from './empl-leave-mgmt.component';

describe('EmplLeaveMgmtComponent', () => {
  let component: EmplLeaveMgmtComponent;
  let fixture: ComponentFixture<EmplLeaveMgmtComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplLeaveMgmtComponent]
    });
    fixture = TestBed.createComponent(EmplLeaveMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
