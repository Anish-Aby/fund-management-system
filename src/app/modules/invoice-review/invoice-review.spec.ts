import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceReview } from './invoice-review';

describe('InvoiceReview', () => {
  let component: InvoiceReview;
  let fixture: ComponentFixture<InvoiceReview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceReview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceReview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
