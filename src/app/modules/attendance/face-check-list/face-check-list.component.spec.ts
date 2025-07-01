import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceCheckListComponent } from './face-check-list.component';

describe('FaceCheckListComponent', () => {
  let component: FaceCheckListComponent;
  let fixture: ComponentFixture<FaceCheckListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FaceCheckListComponent]
    });
    fixture = TestBed.createComponent(FaceCheckListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
