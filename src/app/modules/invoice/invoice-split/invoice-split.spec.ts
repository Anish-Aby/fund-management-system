import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceSplit } from './invoice-split';

describe('InvoiceSplit', () => {
  let component: InvoiceSplit;
  let fixture: ComponentFixture<InvoiceSplit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceSplit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceSplit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
