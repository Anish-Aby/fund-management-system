// import { Component, signal } from '@angular/core';
// import { SelectModule } from 'primeng/select';
// import EntityMockData from './../core/mocks/entity-mock.json';
// import { DatePickerModule } from 'primeng/datepicker';
// import { InputTextModule } from 'primeng/inputtext';
// import { FormsModule } from '@angular/forms';
// import { ButtonModule } from 'primeng/button';
// import { TableModule } from 'primeng/table';
// import { TextareaModule } from 'primeng/textarea';
// import { CommonModule } from '@angular/common';

// interface JournalEntryData {
//   accountType: string;
//   debitEntity: string;
//   debitAmount: number;
//   creditEntity: string;
//   creditAmount: number;
// }

// @Component({
//   selector: 'app-journal-entry',
//   imports: [
//     SelectModule,
//     DatePickerModule,
//     InputTextModule,
//     CommonModule,
//     FormsModule,
//     ButtonModule,
//     TableModule,
//     TextareaModule,
//   ],
//   templateUrl: './journal-entry.html',
//   styleUrl: './journal-entry.scss',
// })
// export class JournalEntry {
//   entityOptions = signal(EntityMockData);
//   today = new Date();

//   accountTypes = [
//     { label: 'Bank Charges fee', value: 'Bank Charges fee' },
//     { label: 'Office Expenses', value: 'Office Expenses' },
//     { label: 'Travel Expenses', value: 'Travel Expenses' },
//   ];

//   entities = [
//     { label: 'PBS Credit Fund', value: 'PBS Credit Fund' },
//     { label: 'JP Chase Bank', value: 'JP Chase Bank' },
//     { label: 'Global Investments Inc', value: 'Global Investments Inc' },
//   ];

//   journalEntries: any[] = [
//     {
//       accountType: '',
//       debitEntity: '',
//       debitAmount: 0,
//       creditEntity: '',
//       creditAmount: 0,
//     },
//   ];

//   narration = 'Bank charges for the month of December 2025';

//   addRow() {
//     this.journalEntries.push({
//       accountType: '',
//       debitEntity: '',
//       debitAmount: 0,
//       creditEntity: '',
//       creditAmount: 0,
//     });
//   }

//   removeRow(index: number) {
//     if (this.journalEntries.length > 1) {
//       this.journalEntries.splice(index, 1);
//     }
//   }

//   getTotalDebit(): number {
//     return this.journalEntries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0);
//   }

//   getTotalCredit(): number {
//     return this.journalEntries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0);
//   }
// }
// journal-entry.component.ts
// ─────────────────────────────────────────────────────────────────
// DIALOG STRATEGY:
//   • Delete confirms  → ConfirmService (wraps PrimeNG ConfirmationService)
//                        <p-confirmDialog> lives in app.component.html at root
//   • View detail      → DialogService.open(JournalEntryViewComponent)
//                        renders at the root overlay layer, not inside this
//                        dynamic dialog, so z-index is always correct
// ─────────────────────────────────────────────────────────────────

import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmService } from '../shared/services/confirm.service';
import { JournalEntryView } from './components/journal-entry-view/journal-entry-view';

export interface JournalEntryData {
  accountType: string;
  debitEntity: string;
  debitAmount: number;
  creditEntity: string;
  creditAmount: number;
  narration: string;
}

const emptyForm = (): JournalEntryData => ({
  accountType: '',
  debitEntity: '',
  debitAmount: 0,
  creditEntity: '',
  creditAmount: 0,
  narration: '',
});

@Component({
  selector: 'app-journal-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    SelectModule,
    DatePickerModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    TableModule,
    TextareaModule,
    TooltipModule,
  ],
  providers: [DialogService],
  templateUrl: './journal-entry.html',
  styleUrl: './journal-entry.scss',
})
export class JournalEntry {
  private readonly confirm = inject(ConfirmService);
  private readonly dialogs = inject(DialogService);

  today = new Date();
  entryDate = new Date();
  searchQuery = '';

  accountTypes = [
    { label: 'Bank Charges Fee', value: 'Bank Charges Fee' },
    { label: 'Office Expenses', value: 'Office Expenses' },
    { label: 'Travel Expenses', value: 'Travel Expenses' },
    { label: 'Management Fees', value: 'Management Fees' },
    { label: 'Audit Fees', value: 'Audit Fees' },
  ];

  entities = [
    { label: 'PBS Credit Fund', value: 'PBS Credit Fund' },
    { label: 'JP Chase Bank', value: 'JP Chase Bank' },
    { label: 'Global Investments Inc', value: 'Global Investments Inc' },
    { label: 'Summit Capital', value: 'Summit Capital' },
    { label: 'Vertex Holdings', value: 'Vertex Holdings' },
  ];

  form: JournalEntryData = emptyForm();
  editingIndex: number | null = null;

  journalEntries: JournalEntryData[] = [
    {
      accountType: 'Bank Charges Fee',
      debitEntity: 'PBS Credit Fund',
      debitAmount: 2500,
      creditEntity: 'JP Chase Bank',
      creditAmount: 2500,
      narration: 'Bank charges for the month of December 2025',
    },
    {
      accountType: 'Management Fees',
      debitEntity: 'Global Investments Inc',
      debitAmount: 15000,
      creditEntity: 'Summit Capital',
      creditAmount: 15000,
      narration: 'Q4 management fees',
    },
    {
      accountType: 'Audit Fees',
      debitEntity: 'Vertex Holdings',
      debitAmount: 8200,
      creditEntity: 'PBS Credit Fund',
      creditAmount: 8000,
      narration: 'Annual audit fees — pending review',
    },
  ];

  filteredEntries(): JournalEntryData[] {
    if (!this.searchQuery.trim()) return this.journalEntries;
    const q = this.searchQuery.toLowerCase();
    return this.journalEntries.filter(
      (e) =>
        e.accountType.toLowerCase().includes(q) ||
        e.debitEntity.toLowerCase().includes(q) ||
        e.creditEntity.toLowerCase().includes(q) ||
        e.narration.toLowerCase().includes(q),
    );
  }

  getOriginalIndex(entry: JournalEntryData): number {
    return this.journalEntries.indexOf(entry);
  }
  getTotalDebit(): number {
    return this.journalEntries.reduce((s, e) => s + (+e.debitAmount || 0), 0);
  }
  getTotalCredit(): number {
    return this.journalEntries.reduce((s, e) => s + (+e.creditAmount || 0), 0);
  }
  getDifference(): number {
    return Math.abs(this.getTotalDebit() - this.getTotalCredit());
  }

  isBalanced(): boolean {
    return this.journalEntries.length > 0 && this.getTotalDebit() === this.getTotalCredit();
  }
  formBalanced(): boolean {
    return (
      (+this.form.debitAmount || 0) === (+this.form.creditAmount || 0) &&
      (+this.form.debitAmount || 0) > 0
    );
  }
  formValid(): boolean {
    return !!(
      this.form.accountType &&
      this.form.debitEntity &&
      this.form.creditEntity &&
      (+this.form.debitAmount || 0) > 0 &&
      (+this.form.creditAmount || 0) > 0
    );
  }

  submitForm(): void {
    if (!this.formValid()) return;
    const entry = { ...this.form };
    if (this.editingIndex !== null) {
      this.journalEntries[this.editingIndex] = entry;
      this.editingIndex = null;
    } else {
      this.journalEntries.push(entry);
    }
    this.form = emptyForm();
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.form = emptyForm();
  }

  editEntry(index: number): void {
    this.editingIndex = index;
    this.form = { ...this.journalEntries[index] };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Opens as a root DynamicDialog — correct z-index regardless of parent dialog
  async viewEntry(index: number): Promise<void> {
    // const ref = this.dialogs.open(JournalEntryView, {
    //   header: `Entry #${index + 1}`,
    //   width: '500px',
    //   modal: true,
    //   closable: true,
    //   draggable: false,
    //   resizable: false,
    //   data: { entry: this.journalEntries[index] },
    // });
    // if (ref) {
    //   ref.onClose.subscribe((result?: { action: string }) => {
    //     if (result?.action === 'edit') this.editEntry(index);
    //   });
    // }
    const journalEntry = this.journalEntries[index];
    const result = await this.confirm.open({
      title: journalEntry.accountType,
      description: `Reviewing entry for ${journalEntry.accountType}`,
      severity: 'info',
      details: {
        title: `Journal Entry details - ${journalEntry.accountType}`,
        items: [
          {
            label: 'Account type',
            value: journalEntry.accountType,
          },
          {
            label: 'Narration',
            value: journalEntry.narration,
          },
          {
            label: 'Debit amount',
            value: journalEntry.debitAmount,
            highlight: true,
            mono: true,
          },
          {
            label: 'Credit amount',
            value: journalEntry.creditAmount,
            highlight: true,
            mono: true,
          },
          {
            label: 'Debit entity',
            value: journalEntry.debitEntity,
          },
          {
            label: 'Credit entity',
            value: journalEntry.creditEntity,
          },
        ],
        layout: 'list',
      },
    });
  }

  // Uses global ConfirmationService via ConfirmService — no nested <p-dialog>
  async confirmDelete(index: number): Promise<void> {
    // const label = this.journalEntries[index].accountType || `Entry #${index + 1}`;
    // const confirmed = await this.confirm.delete(label);
    // if (!confirmed) return;
    // if (this.editingIndex === index) this.cancelEdit();
    // this.journalEntries.splice(index, 1);
    const journalEntry = this.journalEntries[index];
    const label = this.journalEntries[index].accountType || `Entry #${index + 1}`;
    const result = await this.confirm.delete(label, {
      alerts: [
        {
          type: 'warn',
          message: 'This action cannot be undone.',
        },
      ],
      details: {
        title: 'Journal Entry Summary',
        items: [
          {
            label: 'Account type',
            value: journalEntry.accountType,
          },
          {
            label: 'Credit to',
            value: journalEntry.creditEntity,
          },
          {
            label: 'Debit to',
            value: journalEntry.debitEntity,
          },
        ],
        layout: 'list',
      },
    });
    if (result.confirmed) {
      console.log('delete');
    }
  }

  saveJournal(): void {
    console.log('Saving journal:', this.journalEntries);
  }
}
