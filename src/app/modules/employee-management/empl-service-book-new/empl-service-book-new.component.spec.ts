import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplServiceBookNewComponent } from './empl-service-book-new.component';

describe('EmplServiceBookNewComponent', () => {
  let component: EmplServiceBookNewComponent;
  let fixture: ComponentFixture<EmplServiceBookNewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmplServiceBookNewComponent]
    });
    fixture = TestBed.createComponent(EmplServiceBookNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
