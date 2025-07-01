import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplAssetDetailComponent } from './empl-asset-detail.component';

describe('EmplAssetDetailComponent', () => {
  let component: EmplAssetDetailComponent;
  let fixture: ComponentFixture<EmplAssetDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplAssetDetailComponent]
    });
    fixture = TestBed.createComponent(EmplAssetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
