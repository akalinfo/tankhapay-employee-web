import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessSettingComponent } from './business-setting.component';

describe('BusinessSettingComponent', () => {
  let component: BusinessSettingComponent;
  let fixture: ComponentFixture<BusinessSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessSettingComponent]
    });
    fixture = TestBed.createComponent(BusinessSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
