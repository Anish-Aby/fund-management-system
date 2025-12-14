import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorAdd } from './vendor-add';

describe('VendorAdd', () => {
  let component: VendorAdd;
  let fixture: ComponentFixture<VendorAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendorAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendorAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
