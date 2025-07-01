import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EPFECRComponent } from './epf-ecr.component';

describe('EPFECRComponent', () => {
  let component: EPFECRComponent;
  let fixture: ComponentFixture<EPFECRComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EPFECRComponent]
    });
    fixture = TestBed.createComponent(EPFECRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
