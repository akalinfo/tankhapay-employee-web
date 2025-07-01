import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetMasterComponent } from './asset-master.component';

describe('AssetMasterComponent', () => {
  let component: AssetMasterComponent;
  let fixture: ComponentFixture<AssetMasterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetMasterComponent]
    });
    fixture = TestBed.createComponent(AssetMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
