import { Component, signal } from '@angular/core';
import { SelectModule } from 'primeng/select';
import EntityMockData from './../core/mocks/entity-mock.json';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';

interface JournalEntryData {
  accountType: string;
  debitEntity: string;
  debitAmount: number;
  creditEntity: string;
  creditAmount: number;
}

@Component({
  selector: 'app-journal-entry',
  imports: [
    SelectModule,
    DatePickerModule,
    InputTextModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TextareaModule,
  ],
  templateUrl: './journal-entry.html',
  styleUrl: './journal-entry.scss',
})
export class JournalEntry {
  entityOptions = signal(EntityMockData);
  today = new Date();

  accountTypes = [
    { label: 'Bank Charges fee', value: 'Bank Charges fee' },
    { label: 'Office Expenses', value: 'Office Expenses' },
    { label: 'Travel Expenses', value: 'Travel Expenses' },
  ];

  entities = [
    { label: 'PBS Credit Fund', value: 'PBS Credit Fund' },
    { label: 'JP Chase Bank', value: 'JP Chase Bank' },
    { label: 'Global Investments Inc', value: 'Global Investments Inc' },
  ];

  journalEntries: any[] = [
    {
      accountType: '',
      debitEntity: '',
      debitAmount: 0,
      creditEntity: '',
      creditAmount: 0,
    },
  ];

  narration = 'Bank charges for the month of December 2025';

  addRow() {
    this.journalEntries.push({
      accountType: '',
      debitEntity: '',
      debitAmount: 0,
      creditEntity: '',
      creditAmount: 0,
    });
  }

  removeRow(index: number) {
    if (this.journalEntries.length > 1) {
      this.journalEntries.splice(index, 1);
    }
  }

  getTotalDebit(): number {
    return this.journalEntries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0);
  }

  getTotalCredit(): number {
    return this.journalEntries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0);
  }
}
