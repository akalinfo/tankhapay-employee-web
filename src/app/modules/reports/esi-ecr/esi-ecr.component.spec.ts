import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ESIECRComponent } from './esi-ecr.component';

describe('ESIECRComponent', () => {
  let component: ESIECRComponent;
  let fixture: ComponentFixture<ESIECRComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ESIECRComponent]
    });
    fixture = TestBed.createComponent(ESIECRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
