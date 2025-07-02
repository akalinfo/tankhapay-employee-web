import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GroupEmployerComponent } from './group-employer.component';

describe('GroupEmployerComponent', () => {
  let component: GroupEmployerComponent;
  let fixture: ComponentFixture<GroupEmployerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupEmployerComponent]
    });
    fixture = TestBed.createComponent(GroupEmployerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
