import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaggedUntaggedComponent } from './tagged-untagged.component';

describe('TaggedUntaggedComponent', () => {
  let component: TaggedUntaggedComponent;
  let fixture: ComponentFixture<TaggedUntaggedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaggedUntaggedComponent]
    });
    fixture = TestBed.createComponent(TaggedUntaggedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
