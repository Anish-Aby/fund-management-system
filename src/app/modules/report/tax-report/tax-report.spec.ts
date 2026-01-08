import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxReport } from './tax-report';

describe('TaxReport', () => {
  let component: TaxReport;
  let fixture: ComponentFixture<TaxReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaxReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
