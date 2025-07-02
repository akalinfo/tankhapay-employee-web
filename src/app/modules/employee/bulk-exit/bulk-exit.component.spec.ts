import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkExitComponent } from './bulk-exit.component';

describe('BulkExitComponent', () => {
  let component: BulkExitComponent;
  let fixture: ComponentFixture<BulkExitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BulkExitComponent]
    });
    fixture = TestBed.createComponent(BulkExitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
