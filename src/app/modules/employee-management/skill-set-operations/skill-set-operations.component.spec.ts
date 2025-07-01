import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkillSetOperationsComponent } from './skill-set-operations.component';


describe('SkillSetOperationsComponent', () => {
  let component: SkillSetOperationsComponent;
  let fixture: ComponentFixture<SkillSetOperationsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkillSetOperationsComponent]
    });
    fixture = TestBed.createComponent(SkillSetOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
