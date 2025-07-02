import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeaAllowanceComponent } from './tea-allowance.component';

describe('TeaAllowanceComponent', () => {
  let component: TeaAllowanceComponent;
  let fixture: ComponentFixture<TeaAllowanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeaAllowanceComponent]
    });
    fixture = TestBed.createComponent(TeaAllowanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
