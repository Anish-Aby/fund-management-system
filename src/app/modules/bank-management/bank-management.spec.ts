import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BankManagement } from './bank-management';

describe('BankManagement', () => {
  let component: BankManagement;
  let fixture: ComponentFixture<BankManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BankManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BankManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
