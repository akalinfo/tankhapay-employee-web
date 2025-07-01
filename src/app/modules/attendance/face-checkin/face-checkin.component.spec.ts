import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceCheckinComponent } from './face-checkin.component';

describe('FaceCheckinComponent', () => {
  let component: FaceCheckinComponent;
  let fixture: ComponentFixture<FaceCheckinComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FaceCheckinComponent]
    });
    fixture = TestBed.createComponent(FaceCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
