import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplAppSettingComponent } from './empl-app-setting.component';

describe('EmplAppSettingComponent', () => {
  let component: EmplAppSettingComponent;
  let fixture: ComponentFixture<EmplAppSettingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplAppSettingComponent]
    });
    fixture = TestBed.createComponent(EmplAppSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
