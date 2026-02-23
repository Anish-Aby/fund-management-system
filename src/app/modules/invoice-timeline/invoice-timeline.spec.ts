import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceTimeline } from './invoice-timeline';

describe('InvoiceTimeline', () => {
  let component: InvoiceTimeline;
  let fixture: ComponentFixture<InvoiceTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceTimeline]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceTimeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
