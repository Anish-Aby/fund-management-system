import { Component, OnInit, signal, computed, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import mockBanks from '../core/mocks/bank-list-mock.json';
import { ApiService } from '../shared/services/api.service';
import { API_URLS } from '../shared/constants/const';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmService } from '../shared/services/confirm.service';
import { ToastService } from '../core/services/toast';

export type FormMode = 'add' | 'edit' | 'view';

export interface Bank {
  bankMasterId: string;
  bankCode: string;
  bankName: string;
  bankAccountNo: string;
  bankRegion: string;
  accountCcy: string;
  achno: string;
  swiftNo: string;
  contactPerson: string;
  contactNo: string;
  emailId: string;
}

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
  private destroyRef = inject(DestroyRef);

  bankForm!: FormGroup;
  private mode = signal<FormMode>('add');
  private editingId: string | null = null;

  isAddMode = computed(() => this.mode() === 'add');
  isEditMode = computed(() => this.mode() === 'edit');
  isViewMode = computed(() => this.mode() === 'view');

  bankData = signal<Bank[]>([]);
  selectedBanks: Bank[] = [];

  regionOptions = signal([]);
  currencyOptions = signal([]);
  countryOptions = signal([]);

  // ── Constructor ──────────────────────────────────────────────────────────

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private confirmService: ConfirmService,
    private messageService: MessageService,
    private toastService: ToastService,
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.buildForm();
    this.getBankListData();
    this.getBankLookupData();
  }

  private buildForm(): void {
    this.bankForm = this.fb.group({
      bankCode: ['', Validators.required],
      bankName: ['', Validators.required],
      bankAccountNo: ['', Validators.required],
      bankRegionID: ['', Validators.required],
      bankCountryID: ['', Validators.required],
      accountCurrencyID: ['', Validators.required],
      achno: ['', Validators.required],
      swiftNo: ['', Validators.required],
      contactPersonName: ['', Validators.required],
      contactPhoneNo: ['', Validators.required],
      contactEmailId: ['', [Validators.required, Validators.email]],
    });
  }

  getBankLookupData(): void {
    this.getCountryLookup();
    this.getCurrencyLookup();
    this.getFundRegionLookup();
  }

  getFundRegionLookup(): void {
    this.apiService
      .get(API_URLS.FUND_REGION_LOOKUP)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          console.log('region', response);
          this.regionOptions.set(response);
        },
      });
  }

  getCountryLookup(): void {
    this.apiService
      .get(API_URLS.COUNTRY_LOOKUP)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.countryOptions.set(response);
          console.log(response);
        },
      });
  }

  getCurrencyLookup(): void {
    this.apiService
      .get(API_URLS.CURRENCY_LOOKUP)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.currencyOptions.set(response);
        },
      });
  }

  getBankListData(): void {
    this.apiService
      .get(API_URLS.BANK_LIST_DATA)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (reponse: any) => {
          console.log(reponse);
          this.bankData.set(reponse);
        },
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
      this.toastService.showWarn('Please fill all required fields');
      return;
    }
    const payload = this.getBankPayload();
    this.apiService
      .post(API_URLS.BANK_ADD, payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          console.log('add bank response', response);
          this.toastService.showSuccess('Bank added successfully');
          this.getBankListData();
        },
      });
    this.resetForm();
  }

  getBankPayload(): any {
    const value = this.bankForm.value;
    let payload: any = {
      bankCode: value.bankCode,
      bankName: value.bankName,
      bankAccountNo: value.bankAccountNo,
      bankRegionID: value.bankRegionID,
      bankCountryID: value.bankCountryID,
      accountCurrencyID: value.accountCurrencyID,
      achNo: value.achno,
      swiftNo: value.swiftNo,
      contactPersonName: value.contactPersonName,
      contactPhoneNo: value.contactPhoneNo,
      contactEmailID: value.contactEmailId,
    };
    if (this.isEditMode() && this.editingId) {
      payload = {
        ...payload,
        bankMasterID: this.editingId,
      };
    }
    return payload;
  }

  viewBank(bank: Bank): void {
    this.mode.set('view');
    this.editingId = bank.bankMasterId;
    this.bankForm.patchValue(bank);
    this.bankForm.disable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editBank(bank: Bank): void {
    this.mode.set('edit');
    this.editingId = bank.bankMasterId;
    this.bankForm.patchValue(bank);
    this.bankForm.enable();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async showDeleteDialog(bank: Bank): Promise<void> {
    const result = await this.confirmService.delete(`Bank: ${bank.bankName}`, {
      details: {
        title: 'Bank Details',
        items: [
          {
            label: 'Name',
            value: bank.bankName,
          },
          {
            label: 'Code',
            value: bank.bankCode,
            badge: { text: bank.bankCode, color: 'amber' },
          },
          {
            label: 'Account Number',
            value: bank.bankAccountNo,
            mono: true,
          },
          {
            label: 'Region',
            value: bank.bankRegion,
          },
          {
            label: 'ACH Number',
            value: bank.achno,
          },
        ],
        layout: 'list',
      },
    });
    console.log('result from delete', result);
    if (result.confirmed) {
      this.deleteBank(bank);
    }
  }

  deleteBank(bank: any): void {
    this.apiService
      .delete(`${API_URLS.BANK_LIST_DATA}/${bank.bankMasterId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.toastService.showSuccess(`Bank: ${bank.bankName} Deleted Successfully`);
          if (this.editingId === bank.bankMasterId) {
            this.resetForm();
          }
          this.getBankListData();
        },
      });
  }

  clearBankSelection(): void {
    this.resetForm();
  }
}
