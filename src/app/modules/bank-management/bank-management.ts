// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-bank-management',
//   imports: [],
//   templateUrl: './bank-management.html',
//   styleUrl: './bank-management.scss',
// })
// export class BankManagement {

// }
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Mock data
import mockBanks from '../core/mocks/bank-list-mock.json';
// ── Types ──────────────────────────────────────────────────────────────────

export type FormMode = 'add' | 'edit' | 'view';

export interface Bank {
  id: string;
  bankCode: string;
  bankName: string;
  bankAccountNo: string;
  bankRegion: string;
  accountCcy: string;
  achNo: string;
  swiftNo: string;
  contactPerson: string;
  contactNo: string;
  emailId: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-bank-management',
  standalone: true,
  templateUrl: './bank-management.html',
  styleUrl: './bank-management.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TableModule,
    TooltipModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class BankManagementComponent implements OnInit {
  // ── Form ────────────────────────────────────────────────────────────────

  bankForm!: FormGroup;
  private mode = signal<FormMode>('add');
  private editingId: string | null = null;

  isAddMode = computed(() => this.mode() === 'add');
  isEditMode = computed(() => this.mode() === 'edit');
  isViewMode = computed(() => this.mode() === 'view');

  // ── Table data (seeded from mock JSON) ──────────────────────────────────

  bankData = signal<Bank[]>(mockBanks as Bank[]);
  selectedBanks: Bank[] = [];

  // ── Dropdown options ─────────────────────────────────────────────────────

  regionOptions: SelectOption[] = [
    { label: 'North America', value: 'North America' },
    { label: 'Europe', value: 'Europe' },
    { label: 'Asia Pacific', value: 'Asia Pacific' },
    { label: 'Middle East', value: 'Middle East' },
    { label: 'Latin America', value: 'Latin America' },
    { label: 'Africa', value: 'Africa' },
  ];

  currencyOptions: SelectOption[] = [
    { label: 'USD – US Dollar', value: 'USD' },
    { label: 'EUR – Euro', value: 'EUR' },
    { label: 'GBP – British Pound', value: 'GBP' },
    { label: 'JPY – Japanese Yen', value: 'JPY' },
    { label: 'CHF – Swiss Franc', value: 'CHF' },
    { label: 'AUD – Australian Dollar', value: 'AUD' },
    { label: 'CAD – Canadian Dollar', value: 'CAD' },
    { label: 'SGD – Singapore Dollar', value: 'SGD' },
    { label: 'HKD – Hong Kong Dollar', value: 'HKD' },
    { label: 'AED – UAE Dirham', value: 'AED' },
  ];

  // ── Constructor ──────────────────────────────────────────────────────────

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForm();
  }

  // ── Form helpers ─────────────────────────────────────────────────────────

  private buildForm(): void {
    this.bankForm = this.fb.group({
      bankCode: ['', Validators.required],
      bankName: ['', Validators.required],
      bankAccountNo: ['', Validators.required],
      bankRegion: ['', Validators.required],
      accountCcy: ['', Validators.required],
      achNo: ['', Validators.required],
      swiftNo: ['', Validators.required],
      contactPerson: ['', Validators.required],
      contactNo: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email]],
    });
  }

  private resetForm(): void {
    this.bankForm.reset({
      bankCode: '',
      bankName: '',
      bankAccountNo: '',
      bankRegion: '',
      accountCcy: '',
      achNo: '',
      swiftNo: '',
      contactPerson: '',
      contactNo: '',
      emailId: '',
    });
    this.editingId = null;
    this.mode.set('add');
    this.bankForm.enable();
  }

  // ── CRUD actions ─────────────────────────────────────────────────────────

  saveBank(): void {
    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Please fill in all required fields.',
      });
      return;
    }

    const value = this.bankForm.getRawValue();

    if (this.isEditMode() && this.editingId) {
      this.bankData.update((banks) =>
        banks.map((b) => (b.id === this.editingId ? { ...b, ...value } : b)),
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Updated',
        detail: `${value.bankName} has been updated.`,
      });
    } else {
      const newBank: Bank = { id: crypto.randomUUID(), ...value };
      this.bankData.update((banks) => [...banks, newBank]);
      this.messageService.add({
        severity: 'success',
        summary: 'Added',
        detail: `${value.bankName} has been added.`,
      });
    }

    this.resetForm();
  }

  viewBank(bank: Bank): void {
    this.mode.set('view');
    this.editingId = bank.id;
    this.bankForm.patchValue(bank);
    this.bankForm.disable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editBank(bank: Bank): void {
    this.mode.set('edit');
    this.editingId = bank.id;
    this.bankForm.patchValue(bank);
    this.bankForm.enable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteBank(bank: Bank): void {
    this.bankData.update((banks) => banks.filter((b) => b.id !== bank.id));
    this.messageService.add({
      severity: 'info',
      summary: 'Deleted',
      detail: `${bank.bankName} has been removed.`,
    });
    if (this.editingId === bank.id) {
      this.resetForm();
    }
  }

  clearBankSelection(): void {
    this.resetForm();
  }
}
