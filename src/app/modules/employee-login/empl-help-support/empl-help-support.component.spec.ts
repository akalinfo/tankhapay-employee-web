import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplHelpSupportComponent } from './empl-help-support.component';

describe('EmplHelpSupportComponent', () => {
  let component: EmplHelpSupportComponent;
  let fixture: ComponentFixture<EmplHelpSupportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplHelpSupportComponent]
    });
    fixture = TestBed.createComponent(EmplHelpSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
