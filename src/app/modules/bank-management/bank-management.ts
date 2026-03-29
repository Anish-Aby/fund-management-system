import { Component, OnInit, signal, computed, DestroyRef, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';

import { ApiService } from '../shared/services/api.service';
import { API_URLS } from '../shared/constants/const';
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
    TabsModule,
  ],
})
export class BankManagementComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private el = inject(ElementRef);

  bankForm!: FormGroup;
  private mode = signal<FormMode>('add');
  private editingId: string | null = null;

  isAddMode = computed(() => this.mode() === 'add');
  isEditMode = computed(() => this.mode() === 'edit');
  isViewMode = computed(() => this.mode() === 'view');

  bankData = signal<Bank[]>([]);
  selectedBanks: Bank[] = [];

  // ── Dropdown option lists ─────────────────────────────────────────────────
  regionOptions = signal<any[]>([]);
  countryOptions = signal<any[]>([]);
  currencyOptions = signal<any[]>([]);
  stateOptions = signal<any[]>([]);
  cityOptions = signal<any[]>([]);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getBankListData();
    this.getFundRegionLookup();
    this.watchCascade();
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  private buildForm(): void {
    this.bankForm = this.fb.group({
      bankCode: ['', Validators.required],
      bankName: ['', Validators.required],
      bankAccountNo: ['', Validators.required],
      bankRegionID: ['', Validators.required],
      bankCountryID: [{ value: '', disabled: true }, Validators.required],
      accountCurrencyID: [{ value: '', disabled: true }, Validators.required],
      stateId: [{ value: '', disabled: true }, Validators.required],
      cityId: [{ value: '', disabled: true }, Validators.required],
      achno: [''],
      swiftNo: ['', Validators.required],
      iban: [''],
      routingNo: [''],
      accountTypeId: ['', Validators.required],
      zipCode: ['', Validators.required],
      paymentMethodId: ['', Validators.required],
      contactPersonName: ['', Validators.required],
      contactPhoneNo: ['', Validators.required],
      branchAddress: ['', Validators.required],
      contactEmailId: ['', [Validators.required, Validators.email]],
      secondaryContactEmailId: ['', [Validators.email]],
    });
  }

  private watchCascade(): void {
    this.bankForm
      .get('bankRegionID')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((regionId: string | null) => {
        this.resetDownstreamOf('region');
        if (!regionId) return;

        this.apiService
          .get(`api/Common/countries/${regionId}`)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response: any) => {
              this.countryOptions.set(response.data);
              if (!this.isViewMode()) {
                this.bankForm.get('bankCountryID')!.enable();
              }
            },
          });
      });

    // ── 2. Country → States + Currency ───────────────────────────────────
    this.bankForm
      .get('bankCountryID')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((countryId: string | null) => {
        this.resetDownstreamOf('country');
        if (!countryId) return;

        // States
        this.apiService
          .get(`api/Common/states/${countryId}`)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response: any) => {
              this.stateOptions.set(response.data);
              if (!this.isViewMode()) {
                this.bankForm.get('stateId')!.enable();
              }
            },
          });

        // Currency (per country)
        this.apiService
          .get(`${API_URLS.CURRENCY_LOOKUP}/${countryId}`)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response: any) => {
              this.currencyOptions.set(response.data);
              if (!this.isViewMode()) {
                this.bankForm.get('accountCurrencyID')!.enable();
              }
            },
          });
      });

    // ── 3. State → Cities ────────────────────────────────────────────────
    this.bankForm
      .get('stateId')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stateId: string | null) => {
        this.resetDownstreamOf('state');
        if (!stateId) return;

        this.apiService
          .get(`api/Common/cities/${stateId}`)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response: any) => {
              this.cityOptions.set(response.data);
              if (!this.isViewMode()) {
                this.bankForm.get('cityId')!.enable();
              }
            },
          });
      });
  }

  // ── Cascade reset helper ──────────────────────────────────────────────────
  // Resets and disables all controls that live downstream of the given level.
  private resetDownstreamOf(level: 'region' | 'country' | 'state'): void {
    const o = { emitEvent: false };

    if (level === 'region') {
      this.bankForm.get('bankCountryID')!.reset('', o);
      this.bankForm.get('bankCountryID')!.disable(o);
      this.countryOptions.set([]);
    }

    if (level === 'region' || level === 'country') {
      this.bankForm.get('accountCurrencyID')!.reset('', o);
      this.bankForm.get('accountCurrencyID')!.disable(o);
      this.bankForm.get('stateId')!.reset('', o);
      this.bankForm.get('stateId')!.disable(o);
      this.currencyOptions.set([]);
      this.stateOptions.set([]);
    }

    // City is always reset whenever anything above it changes
    this.bankForm.get('cityId')!.reset('', o);
    this.bankForm.get('cityId')!.disable(o);
    this.cityOptions.set([]);
  }

  // ── Scroll helper ─────────────────────────────────────────────────────────
  scrollToFormTop(): void {
    let node: HTMLElement | null = this.el.nativeElement as HTMLElement;
    while (node) {
      if (node.classList?.contains('p-dialog-content')) {
        node.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (node.scrollHeight > node.clientHeight && getComputedStyle(node).overflowY !== 'visible') {
        node.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      node = node.parentElement;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── API calls ─────────────────────────────────────────────────────────────
  getFundRegionLookup(): void {
    this.apiService
      .get(API_URLS.FUND_REGION_LOOKUP)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (response: any) => this.regionOptions.set(response.data) });
  }

  getBankListData(): void {
    this.apiService
      .get(API_URLS.BANK_LIST_DATA)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (response: any) => this.bankData.set(response.data) });
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  private resetForm(): void {
    const o = { emitEvent: false };

    this.bankForm.reset(
      {
        bankCode: '',
        bankName: '',
        bankAccountNo: '',
        bankRegionID: '',
        bankCountryID: '',
        accountCurrencyID: '',
        stateId: '',
        cityId: '',
        achno: '',
        swiftNo: '',
        iban: '',
        routingNo: '',
        accountTypeId: '',
        zipCode: '',
        paymentMethodId: '',
        contactPersonName: '',
        contactPhoneNo: '',
        branchAddress: '',
        contactEmailId: '',
        secondaryContactEmailId: '',
      },
      o,
    );

    this.countryOptions.set([]);
    this.currencyOptions.set([]);
    this.stateOptions.set([]);
    this.cityOptions.set([]);

    this.editingId = null;
    this.mode.set('add');

    // Re-enable everything for add mode …
    this.bankForm.enable(o);
    // … then lock all four cascaded fields
    this.bankForm.get('bankCountryID')!.disable(o);
    this.bankForm.get('accountCurrencyID')!.disable(o);
    this.bankForm.get('stateId')!.disable(o);
    this.bankForm.get('cityId')!.disable(o);
  }

  // ── View ──────────────────────────────────────────────────────────────────
  viewBank(bank: Bank): void {
    this.mode.set('view');
    this.editingId = bank.bankMasterId;
    this.scrollToFormTop();

    const o = { emitEvent: false };
    const regionId = (bank as any).bankRegionID;
    const countryId = (bank as any).bankCountryID;
    const currencyId = (bank as any).accountCurrencyID;
    const stateId = (bank as any).stateId;
    const cityId = (bank as any).cityId;
    this.bankForm.enable(o);
    this.bankForm.patchValue(bank, o);
    if (!regionId) {
      this.bankForm.disable(o);
      return;
    }
    this.apiService
      .get(`api/Common/countries/${regionId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.countryOptions.set(response.data);
          this.bankForm.get('bankCountryID')!.setValue(countryId ?? '', o);
          if (!countryId) {
            this.bankForm.disable(o);
            return;
          }
          this.apiService
            .get(`${API_URLS.CURRENCY_LOOKUP}/${countryId}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (response: any) => {
                this.currencyOptions.set(response.data);
                this.bankForm.get('accountCurrencyID')!.setValue(currencyId ?? '', o);
              },
            });
          this.apiService
            .get(`api/Common/states/${countryId}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (response: any) => {
                this.stateOptions.set(response.data);
                this.bankForm.get('stateId')!.setValue(stateId ?? '', o);
                if (!stateId) {
                  this.bankForm.disable(o);
                  return;
                }
                this.apiService
                  .get(`api/Common/cities/${stateId}`)
                  .pipe(takeUntilDestroyed(this.destroyRef))
                  .subscribe({
                    next: (response: any) => {
                      this.cityOptions.set(response.data);
                      this.bankForm.get('cityId')!.setValue(cityId ?? '', o);
                      this.bankForm.disable(o);
                    },
                  });
              },
            });
        },
      });
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  editBank(bank: Bank): void {
    this.mode.set('edit');
    this.editingId = bank.bankMasterId;
    this.scrollToFormTop();

    const o = { emitEvent: false };
    const regionId = (bank as any).bankRegionID;
    const countryId = (bank as any).bankCountryID;
    const currencyId = (bank as any).accountCurrencyID;
    const stateId = (bank as any).stateId;
    const cityId = (bank as any).cityId;

    // Enable all, patch silently, then lock the four cascaded fields
    this.bankForm.enable(o);
    this.bankForm.patchValue(bank, o);
    this.bankForm.get('bankCountryID')!.disable(o);
    this.bankForm.get('accountCurrencyID')!.disable(o);
    this.bankForm.get('stateId')!.disable(o);
    this.bankForm.get('cityId')!.disable(o);

    this.countryOptions.set([]);
    this.currencyOptions.set([]);
    this.stateOptions.set([]);
    this.cityOptions.set([]);

    if (!regionId) return;

    // Step 1: countries
    this.apiService
      .get(`api/Common/countries/${regionId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.countryOptions.set(response.data);
          this.bankForm.get('bankCountryID')!.setValue(countryId ?? '', o);
          this.bankForm.get('bankCountryID')!.enable(o);

          if (!countryId) return;

          // Step 2a: currencies
          this.apiService
            .get(`${API_URLS.CURRENCY_LOOKUP}/${countryId}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (response: any) => {
                this.currencyOptions.set(response.data);
                this.bankForm.get('accountCurrencyID')!.setValue(currencyId ?? '', o);
                this.bankForm.get('accountCurrencyID')!.enable(o);
              },
            });

          // Step 2b: states
          this.apiService
            .get(`api/Common/states/${countryId}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (response: any) => {
                this.stateOptions.set(response.data);
                console.log('Setting stateId control value to:', stateId ?? '');
                this.bankForm.get('stateId')!.setValue(stateId ?? '', o);
                this.bankForm.get('stateId')!.enable(o);

                if (!stateId) return;

                // Step 3: cities
                this.apiService
                  .get(`api/Common/cities/${stateId}`)
                  .pipe(takeUntilDestroyed(this.destroyRef))
                  .subscribe({
                    next: (response: any) => {
                      this.cityOptions.set(response.data);
                      this.bankForm.get('cityId')!.setValue(cityId ?? '', o);
                      this.bankForm.get('cityId')!.enable(o);
                    },
                  });
              },
            });
        },
      });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  saveBank(): void {
    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched();
      this.toastService.showWarn('Please fill all required fields');
      return;
    }
    this.apiService
      .post(API_URLS.BANK_ADD, this.getBankPayload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Bank added successfully');
          this.getBankListData();
          this.resetForm();
        },
      });
  }

  getBankPayload(): any {
    const v = this.bankForm.getRawValue(); // getRawValue includes disabled controls
    const payload: any = {
      bankCode: v.bankCode,
      bankName: v.bankName,
      bankAccountNo: v.bankAccountNo,
      bankRegionID: v.bankRegionID,
      bankCountryID: v.bankCountryID,
      accountCurrencyID: v.accountCurrencyID,
      stateId: v.stateId,
      cityId: v.cityId,
      achNo: v.achno,
      swiftNo: v.swiftNo,
      iban: v.iban,
      routingNo: v.routingNo,
      accountTypeId: v.accountTypeId,
      zipCode: v.zipCode,
      paymentMethodId: v.paymentMethodId,
      contactPersonName: v.contactPersonName,
      contactPhoneNo: v.contactPhoneNo,
      branchAddress: v.branchAddress,
      contactEmailID: v.contactEmailId,
      secondaryContactEmailId: v.secondaryContactEmailId,
    };
    if (this.isEditMode() && this.editingId) {
      payload.bankMasterID = this.editingId;
    }
    return payload;
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async showDeleteDialog(bank: Bank): Promise<void> {
    const result = await this.confirmService.delete(`Bank: ${bank.bankName}`, {
      details: {
        title: 'Bank Details',
        items: [
          { label: 'Name', value: bank.bankName },
          { label: 'Code', value: bank.bankCode, badge: { text: bank.bankCode, color: 'amber' } },
          { label: 'Account Number', value: bank.bankAccountNo, mono: true },
          { label: 'Region', value: bank.bankRegion },
          { label: 'ACH Number', value: bank.achno },
        ],
        layout: 'list',
      },
    });
    if (result.confirmed) this.deleteBank(bank);
  }

  deleteBank(bank: any): void {
    this.apiService
      .delete(`${API_URLS.BANK_LIST_DATA}/${bank.bankMasterId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.toastService.showSuccess(`Bank: ${bank.bankName} Deleted Successfully`);
          if (this.editingId === bank.bankMasterId) this.resetForm();
          this.getBankListData();
        },
      });
  }

  clearBankSelection(): void {
    this.resetForm();
  }
}
