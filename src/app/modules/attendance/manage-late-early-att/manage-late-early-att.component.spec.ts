import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLateEarlyAttComponent } from './manage-late-early-att.component';

describe('ManageLateEarlyAttComponent', () => {
  let component: ManageLateEarlyAttComponent;
  let fixture: ComponentFixture<ManageLateEarlyAttComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageLateEarlyAttComponent]
    });
    fixture = TestBed.createComponent(ManageLateEarlyAttComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
