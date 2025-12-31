import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundCashBalance } from './fund-cash-balance';

describe('FundCashBalance', () => {
  let component: FundCashBalance;
  let fixture: ComponentFixture<FundCashBalance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FundCashBalance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundCashBalance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
