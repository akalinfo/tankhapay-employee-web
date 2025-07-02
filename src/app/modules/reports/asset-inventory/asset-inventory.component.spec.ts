import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetInventoryComponent } from './asset-inventory.component';

describe('AssetInventoryComponent', () => {
  let component: AssetInventoryComponent;
  let fixture: ComponentFixture<AssetInventoryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AssetInventoryComponent]
    });
    fixture = TestBed.createComponent(AssetInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
