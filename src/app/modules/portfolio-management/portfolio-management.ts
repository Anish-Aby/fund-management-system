// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-portfolio-management',
//   imports: [],
//   templateUrl: './portfolio-management.html',
//   styleUrl: './portfolio-management.scss',
// })
// export class PortfolioManagement {

// }

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToastService } from '../core/services/toast';
import mockFundData from '../core/mocks/portfolio-list-mock.json';

// ── Types ──────────────────────────────────────────────────────────────────

export type FormMode = 'add' | 'edit' | 'view';

export interface Fund {
  id: string;
  fundCode: string;
  fundName: string;
  fundRegion: string;
  fundCcy: string;
  fundTaxId: string;
  bankName: string;
  bankAccountNumber: string;
  bankCcy: string;
  vendors: string[]; // array of vendor IDs
  attachedEntities: string[]; // array of entity IDs
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface NamedOption {
  id: string;
  name: string;
}

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-portfolio-management',
  standalone: true,
  templateUrl: './portfolio-management.html',
  styleUrl: './portfolio-management.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    TableModule,
    TooltipModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class PortfolioManagement implements OnInit {
  // ── Form ────────────────────────────────────────────────────────────────

  fundForm!: FormGroup;
  private mode = signal<FormMode>('add');
  private editingId: string | null = null;

  isAddMode = computed(() => this.mode() === 'add');
  isEditMode = computed(() => this.mode() === 'edit');
  isViewMode = computed(() => this.mode() === 'view');

  // ── Table data ──────────────────────────────────────────────────────────

  fundData = signal<Fund[]>([]);
  selectedFunds: Fund[] = [];

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

  // Replace with real data from your service
  vendorOptions: NamedOption[] = [
    { id: 'v1', name: 'Acme Capital Management' },
    { id: 'v2', name: 'BlackRock Advisory' },
    { id: 'v3', name: 'Goldman Sachs AM' },
    { id: 'v4', name: 'JPMorgan Asset Management' },
    { id: 'v5', name: 'Fidelity Investments' },
  ];

  // Replace with real data from your service
  entityOptions: NamedOption[] = [
    { id: 'e1', name: 'Global Investments Inc.' },
    { id: 'e2', name: 'Horizon Ventures Ltd.' },
    { id: 'e3', name: 'Apex Capital LLC' },
    { id: 'e4', name: 'Summit Financial Group' },
    { id: 'e5', name: 'Meridian Trust Corp.' },
  ];

  // ── Constructor ──────────────────────────────────────────────────────────

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private toastSerivce: ToastService,
  ) {
    this.fundData.set(mockFundData as Fund[]);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForm();
  }

  // ── Form helpers ─────────────────────────────────────────────────────────

  private buildForm(): void {
    this.fundForm = this.fb.group({
      fundCode: ['', Validators.required],
      fundName: ['', Validators.required],
      fundRegion: ['', Validators.required],
      fundCcy: ['', Validators.required],
      fundTaxId: ['', Validators.required],
      bankName: ['', Validators.required],
      bankAccountNumber: ['', Validators.required],
      bankCcy: ['', Validators.required],
      vendors: [[]],
      attachedEntities: [[]],
    });
  }

  private resetForm(): void {
    this.fundForm.reset({
      fundCode: '',
      fundName: '',
      fundRegion: '',
      fundCcy: '',
      fundTaxId: '',
      bankName: '',
      bankAccountNumber: '',
      bankCcy: '',
      vendors: [],
      attachedEntities: [],
    });
    this.editingId = null;
    this.mode.set('add');
    this.fundForm.enable();
  }

  // ── CRUD actions ─────────────────────────────────────────────────────────

  saveFund(): void {
    if (this.fundForm.invalid) {
      this.fundForm.markAllAsTouched();
      // this.toastSerivce.add({
      //   severity: 'warn',
      //   summary: 'Validation',
      //   detail: 'Please fill in all required fields.',
      // });
      this.toastSerivce.showWarn('Please fill in all required fields.');
      return;
    }

    const value = this.fundForm.getRawValue();

    if (this.isEditMode() && this.editingId) {
      // Update existing
      this.fundData.update((funds) =>
        funds.map((f) => (f.id === this.editingId ? { ...f, ...value } : f)),
      );
      // this.messageService.add({
      //   severity: 'success',
      //   summary: 'Updated',
      //   detail: `${value.fundName} has been updated.`,
      // });
      this.toastSerivce.showSuccess(`${value.fundName} has been updated.`);
    } else {
      // Create new
      const newFund: Fund = {
        id: crypto.randomUUID(),
        ...value,
      };
      this.fundData.update((funds) => [...funds, newFund]);
      // this.messageService.add({
      //   severity: 'success',
      //   summary: 'Added',
      //   detail: `${value.fundName} has been added.`,
      // });
      this.toastSerivce.showSuccess(`${value.fundName} has been added.`);
    }

    this.resetForm();
  }

  viewFund(fund: Fund): void {
    this.mode.set('view');
    this.editingId = fund.id;
    this.fundForm.patchValue(fund);
    this.fundForm.disable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editFund(fund: Fund): void {
    this.mode.set('edit');
    this.editingId = fund.id;
    this.fundForm.patchValue(fund);
    this.fundForm.enable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  deleteFund(fund: Fund): void {
    this.fundData.update((funds) => funds.filter((f) => f.id !== fund.id));
    // this.messageService.add({
    //   severity: 'info',
    //   summary: 'Deleted',
    //   detail: `${fund.fundName} has been removed.`,
    // });
    this.toastSerivce.showInfo(`${fund.fundName} has been removed.`);

    // If we were viewing/editing that fund, reset
    if (this.editingId === fund.id) {
      this.resetForm();
    }
  }

  clearFundSelection(): void {
    this.resetForm();
  }

  // ── Display helpers ───────────────────────────────────────────────────────

  /**
   * Returns the display names of selected vendors for a given fund row.
   * Useful if you want to show a tooltip of vendor names on hover.
   */
  getVendorNames(vendorIds: string[]): string {
    return vendorIds
      .map((id) => this.vendorOptions.find((v) => v.id === id)?.name ?? id)
      .join(', ');
  }

  /**
   * Returns the display names of attached entities for a given fund row.
   */
  getEntityNames(entityIds: string[]): string {
    return entityIds
      .map((id) => this.entityOptions.find((e) => e.id === id)?.name ?? id)
      .join(', ');
  }
}
