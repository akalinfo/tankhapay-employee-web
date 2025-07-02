import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMissPunchComponent } from './manage-miss-punch.component';

describe('ManageMissPunchComponent', () => {
  let component: ManageMissPunchComponent;
  let fixture: ComponentFixture<ManageMissPunchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManageMissPunchComponent]
    });
    fixture = TestBed.createComponent(ManageMissPunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
