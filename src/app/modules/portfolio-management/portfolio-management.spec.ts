import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioManagement } from './portfolio-management';

describe('PortfolioManagement', () => {
  let component: PortfolioManagement;
  let fixture: ComponentFixture<PortfolioManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
