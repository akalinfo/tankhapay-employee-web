import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImprestRequestComponent } from './imprest-request.component';

describe('ImprestRequestComponent', () => {
  let component: ImprestRequestComponent;
  let fixture: ComponentFixture<ImprestRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImprestRequestComponent]
    });
    fixture = TestBed.createComponent(ImprestRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
