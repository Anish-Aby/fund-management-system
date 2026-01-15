import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoDataPlaceholder } from './no-data-placeholder';

describe('NoDataPlaceholder', () => {
  let component: NoDataPlaceholder;
  let fixture: ComponentFixture<NoDataPlaceholder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoDataPlaceholder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoDataPlaceholder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
