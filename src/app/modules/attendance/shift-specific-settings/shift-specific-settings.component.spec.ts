import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShiftSpecificSettingsComponent } from './shift-specific-settings.component';


describe('Shi', () => {
  let component: ShiftSpecificSettingsComponent;
  let fixture: ComponentFixture<ShiftSpecificSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShiftSpecificSettingsComponent]
    });
    fixture = TestBed.createComponent(ShiftSpecificSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
