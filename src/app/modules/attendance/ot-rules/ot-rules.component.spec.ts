import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtRulesComponent } from './ot-rules.component';

describe('OtRulesComponent', () => {
  let component: OtRulesComponent;
  let fixture: ComponentFixture<OtRulesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OtRulesComponent]
    });
    fixture = TestBed.createComponent(OtRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
