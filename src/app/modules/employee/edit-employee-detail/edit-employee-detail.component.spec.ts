import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEmployeeDetailComponent } from './edit-employee-detail.component';

describe('EditEmployeeDetailComponent', () => {
  let component: EditEmployeeDetailComponent;
  let fixture: ComponentFixture<EditEmployeeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditEmployeeDetailComponent]
    });
    fixture = TestBed.createComponent(EditEmployeeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
