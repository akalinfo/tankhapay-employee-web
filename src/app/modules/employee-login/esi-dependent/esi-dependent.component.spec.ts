import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsiDependentComponent } from './esi-dependent.component';

describe('EsiDependentComponent', () => {
  let component: EsiDependentComponent;
  let fixture: ComponentFixture<EsiDependentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EsiDependentComponent]
    });
    fixture = TestBed.createComponent(EsiDependentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
