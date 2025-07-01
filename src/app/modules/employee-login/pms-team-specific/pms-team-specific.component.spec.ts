import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmsTeamSpecificComponent } from './pms-team-specific.component';

describe('PmsTeamSpecificComponent', () => {
  let component: PmsTeamSpecificComponent;
  let fixture: ComponentFixture<PmsTeamSpecificComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PmsTeamSpecificComponent]
    });
    fixture = TestBed.createComponent(PmsTeamSpecificComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
