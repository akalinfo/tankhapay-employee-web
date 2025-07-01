import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewTemplateComponent } from './add-new-template.component';

describe('AddNewTemplateComponent', () => {
  let component: AddNewTemplateComponent;
  let fixture: ComponentFixture<AddNewTemplateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddNewTemplateComponent]
    });
    fixture = TestBed.createComponent(AddNewTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
