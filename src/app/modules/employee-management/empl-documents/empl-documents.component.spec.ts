import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplDocumentsComponent } from './empl-documents.component';

describe('EmplDocumentsComponent', () => {
  let component: EmplDocumentsComponent;
  let fixture: ComponentFixture<EmplDocumentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplDocumentsComponent]
    });
    fixture = TestBed.createComponent(EmplDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
