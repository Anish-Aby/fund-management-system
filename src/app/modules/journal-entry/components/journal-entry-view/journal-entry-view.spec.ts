import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalEntryView } from './journal-entry-view';

describe('JournalEntryView', () => {
  let component: JournalEntryView;
  let fixture: ComponentFixture<JournalEntryView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalEntryView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalEntryView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
