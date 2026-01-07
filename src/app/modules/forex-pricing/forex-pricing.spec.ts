import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForexPricing } from './forex-pricing';

describe('ForexPricing', () => {
  let component: ForexPricing;
  let fixture: ComponentFixture<ForexPricing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForexPricing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForexPricing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
