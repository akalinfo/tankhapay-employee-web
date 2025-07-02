import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetAssignmentComponent } from './asset-assignment.component';

describe('AssetAssignmentComponent', () => {
  let component: AssetAssignmentComponent;
  let fixture: ComponentFixture<AssetAssignmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetAssignmentComponent]
    });
    fixture = TestBed.createComponent(AssetAssignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
