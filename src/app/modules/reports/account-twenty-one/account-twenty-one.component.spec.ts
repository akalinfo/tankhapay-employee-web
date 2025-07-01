import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTwentyOneComponent } from './account-twenty-one.component';

describe('AccountTwentyOneComponent', () => {
  let component: AccountTwentyOneComponent;
  let fixture: ComponentFixture<AccountTwentyOneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountTwentyOneComponent]
    });
    fixture = TestBed.createComponent(AccountTwentyOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
