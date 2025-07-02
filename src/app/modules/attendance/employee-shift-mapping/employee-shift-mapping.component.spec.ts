import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeShiftMappingComponent } from './employee-shift-mapping.component';


describe('EmployeeShiftMappingComponent', () => {
  let component: EmployeeShiftMappingComponent;
  let fixture: ComponentFixture<EmployeeShiftMappingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeShiftMappingComponent]
    });
    fixture = TestBed.createComponent(EmployeeShiftMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
