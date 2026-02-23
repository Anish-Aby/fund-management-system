import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';

import fundsData from '../core/mocks/funds-mock.json';
import transactionTypesData from '../core/mocks/transaction-types-mock.json';
import internalRecordsData from '../core/mocks/internal-records-mock.json';
import externalRecordsData from '../core/mocks/external-records-mock.json';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { NoDataPlaceholder } from '../shared/components/no-data-placeholder/no-data-placeholder';

interface Fund {
  id: string;
  name: string;
}

interface TransactionType {
  label: string;
  value: string;
}

interface TransactionRecord {
  id: number;
  date: string;
  description: string;
  amount: number;
  selected?: boolean;
}

@Component({
  selector: 'app-reconciliation',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    TableModule,
    CheckboxModule,
    TextareaModule,
    CardModule,
    MultiSelectModule,
    InputTextModule,
  ],
  templateUrl: './reconciliation.html',
  styleUrl: './reconciliation.scss',
})
export class Reconciliation {
  reconciliationForm: FormGroup;
  funds: Fund[] = [...fundsData];
  transactionTypes: TransactionType[] = transactionTypesData;
  selectedInternalRecords = signal<TransactionRecord[]>([]);
  selectedExternalRecords = signal<TransactionRecord[]>([]);
  isRecordsLoaded = signal(false);

  internalRecords = signal<TransactionRecord[]>([]);
  externalRecords = signal<TransactionRecord[]>([]);

  internalSelectedTotal = signal(0);
  externalSelectedTotal = signal(0);

  isSaveEnabled = computed(() => {
    const internalTotal = this.internalSelectedTotal();
    const externalTotal = this.externalSelectedTotal();
    return internalTotal > 0 && externalTotal > 0 && internalTotal === externalTotal;
  });

  constructor(private fb: FormBuilder) {
    this.reconciliationForm = this.fb.group({
      asOnDate: [new Date(), Validators.required],
      selectedFund: [null, Validators.required],
      internalTransactionType: ['credit'],
      externalTransactionType: ['debit'],
      remarks: [''],
    });

    // Auto-sync transaction types
    this.reconciliationForm.get('internalTransactionType')?.valueChanges.subscribe((value) => {
      const oppositeType = value === 'credit' ? 'debit' : 'credit';
      this.reconciliationForm
        .get('externalTransactionType')
        ?.setValue(oppositeType, { emitEvent: false });
    });

    this.reconciliationForm.get('externalTransactionType')?.valueChanges.subscribe((value) => {
      const oppositeType = value === 'credit' ? 'debit' : 'credit';
      this.reconciliationForm
        .get('internalTransactionType')
        ?.setValue(oppositeType, { emitEvent: false });
    });
  }

  onInternalRecordSelect() {
    this.internalSelectedTotal.set(
      this.selectedInternalRecords().reduce((sum, record) => sum + record.amount, 0),
    );
  }

  onExternalRecordSelect() {
    this.externalSelectedTotal.set(
      this.selectedExternalRecords().reduce((sum, record) => sum + record.amount, 0),
    );
  }

  onRefresh() {
    this.isRecordsLoaded.set(true);
    this.selectedInternalRecords.set([]);
    this.selectedExternalRecords.set([]);
    this.internalSelectedTotal.set(0);
    this.externalSelectedTotal.set(0);
    this.internalRecords.set(internalRecordsData);
    this.externalRecords.set(externalRecordsData);
  }

  onSave() {
    if (this.isSaveEnabled()) {
      const formData = this.reconciliationForm.value;
      const selectedInternal = this.internalRecords().filter((r) => r.selected);
      const selectedExternal = this.externalRecords().filter((r) => r.selected);
    }
  }

  onCancel() {
    this.reconciliationForm.reset({
      asOnDate: new Date('2026-01-01'),
      internalTransactionType: 'credit',
      externalTransactionType: 'debit',
      remarks: '',
    });
    this.reconciliationForm.get('selectedFund')?.reset();
    this.onRefresh();
  }
}
