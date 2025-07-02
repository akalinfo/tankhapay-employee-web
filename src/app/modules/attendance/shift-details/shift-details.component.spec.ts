import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShiftDetailsComponent } from './shift-details.component';


describe('ShiftDetailsComponent', () => {
  let component: ShiftDetailsComponent;
  let fixture: ComponentFixture<ShiftDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShiftDetailsComponent]
    });
    fixture = TestBed.createComponent(ShiftDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
