import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanBulkUploadComponent } from './pan-bulk-upload.component';

describe('PanBulkUploadComponent', () => {
  let component: PanBulkUploadComponent;
  let fixture: ComponentFixture<PanBulkUploadComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PanBulkUploadComponent]
    });
    fixture = TestBed.createComponent(PanBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
