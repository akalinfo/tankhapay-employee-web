import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileViewLoginComponent } from './mobile-view-login.component';

describe('MobileViewLoginComponent', () => {
  let component: MobileViewLoginComponent;
  let fixture: ComponentFixture<MobileViewLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MobileViewLoginComponent]
    });
    fixture = TestBed.createComponent(MobileViewLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
