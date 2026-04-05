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
import { API_URLS, VALIDATOR_REGEX_PATTERNS } from '../shared/constants/const';
import { ConfirmService } from '../shared/services/confirm.service';
import { ToastService } from '../core/services/toast';
import { Bank, BankCascadeIds } from './models/bank-management.model';
import { UtilityService } from '../shared/services/utility.service';

export type FormMode = 'add' | 'edit' | 'view';

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
  private mode = signal<FormMode>('add');
  private editingId: string | null = null;

  bankForm!: FormGroup;

  isAddMode = computed(() => this.mode() === 'add');
  isEditMode = computed(() => this.mode() === 'edit');
  isViewMode = computed(() => this.mode() === 'view');

  bankData = signal<Bank[]>([]);
  selectedBanks: Bank[] = [];

  regionOptions = signal<any[]>([]);
  countryOptions = signal<any[]>([]);
  currencyOptions = signal<any[]>([]);
  stateOptions = signal<any[]>([]);
  cityOptions = signal<any[]>([]);
  accountTypeOptions = signal<any[]>([]);
  paymentMethodOptions = signal<any[]>([]);

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private utilityService: UtilityService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getBankListData();
    this.getFundRegionLookup();
    this.getBankLookups();
    this.watchCascade();
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  private buildForm(): void {
    this.bankForm = this.fb.group({
      bankCode: ['', [Validators.required, Validators.maxLength(20)]],
      bankName: ['', [Validators.required, Validators.maxLength(100)]],
      bankAccountNo: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(34)]],
      achNo: ['', [Validators.pattern(VALIDATOR_REGEX_PATTERNS.ACH_PATTERN)]],
      swiftNo: [
        '',
        [Validators.required, Validators.pattern(VALIDATOR_REGEX_PATTERNS.SWIFT_PATTERN)],
      ],
      iban: [''],
      routingNumber: ['', [Validators.pattern(VALIDATOR_REGEX_PATTERNS.ROUTING_PATTERN)]],
      accountTypeID: ['', Validators.required],
      paymentMethodID: ['', Validators.required],
      address: ['', Validators.required],
      bankRegionID: ['', Validators.required],
      bankCountryID: [{ value: '', disabled: true }, Validators.required],
      accountCurrencyID: [{ value: '', disabled: true }, Validators.required],
      countryStateMasterId: [{ value: '', disabled: true }, Validators.required],
      stateCityMasterId: [{ value: '', disabled: true }, Validators.required],
      zipCode: [
        '',
        [Validators.required, Validators.pattern(VALIDATOR_REGEX_PATTERNS.ZIP_PATTERN)],
      ],
      contactPersonName: ['', [Validators.required, Validators.maxLength(100)]],
      contactPhoneNo: [
        '',
        [Validators.required, Validators.pattern(VALIDATOR_REGEX_PATTERNS.PHONE_PATTERN)],
      ],
      contactEmailID: ['', [Validators.required, Validators.email]],
      emailId2: ['', [Validators.email]],
    });
  }

  isFieldInvalid(field: string): boolean {
    return this.utilityService.isFieldInvalid(this.bankForm, field);
  }

  getFieldError(field: string): string {
    return this.utilityService.getFieldError(this.bankForm, field);
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
            next: (r: any) => {
              this.countryOptions.set(r.data);
              if (!this.isViewMode()) this.bankForm.get('bankCountryID')!.enable();
            },
          });
      });

    this.bankForm
      .get('bankCountryID')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((countryId: string | null) => {
        this.resetDownstreamOf('country');
        if (!countryId) return;

        this.apiService
          .get(`api/Common/states/${countryId}`)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (r: any) => {
              this.stateOptions.set(r.data);
              if (!this.isViewMode()) this.bankForm.get('countryStateMasterId')!.enable();
            },
          });

        this.apiService
          .get(`${API_URLS.CURRENCY_LOOKUP}/${countryId}`)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (r: any) => {
              this.currencyOptions.set(r.data);
              if (!this.isViewMode()) this.bankForm.get('accountCurrencyID')!.enable();
            },
          });
      });

    this.bankForm
      .get('countryStateMasterId')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((stateId: string | null) => {
        this.resetDownstreamOf('state');
        if (!stateId) return;
        this.apiService
          .get(`api/Common/cities/${stateId}`)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (r: any) => {
              this.cityOptions.set(r.data);
              if (!this.isViewMode()) this.bankForm.get('stateCityMasterId')!.enable();
            },
          });
      });
  }

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
      this.bankForm.get('countryStateMasterId')!.reset('', o);
      this.bankForm.get('countryStateMasterId')!.disable(o);
      this.currencyOptions.set([]);
      this.stateOptions.set([]);
    }
    this.bankForm.get('stateCityMasterId')!.reset('', o);
    this.bankForm.get('stateCityMasterId')!.disable(o);
    this.cityOptions.set([]);
  }

  private patchBaseFields(bank: Bank): void {
    const o = { emitEvent: false };
    const b = bank as any;
    this.bankForm.patchValue(
      {
        bankCode: b.bankCode ?? '',
        bankName: b.bankName ?? '',
        bankAccountNo: b.bankAccountNo ?? '',
        achNo: b.achNo ?? '',
        swiftNo: b.swiftNo ?? '',
        iban: b.iban ?? '',
        routingNumber: b.routingNumber ?? '',
        accountTypeID: b.accountTypeId ?? '',
        paymentMethodID: b.paymentMethodId ?? '',
        address: b.address ?? '',
        zipCode: b.zipCode ?? '',
        contactPersonName: b.contactPersonName ?? b.contactPerson ?? '',
        contactPhoneNo: b.contactPhoneNo ?? b.contactNo ?? '',
        contactEmailID: b.contactEmailId ?? b.contactEmailID ?? b.emailId ?? '',
        emailId2: b.emailId2 ?? '',
      },
      o,
    );
  }

  private loadCascadeAndPatch(ids: BankCascadeIds, finalise: (allLoaded: boolean) => void): void {
    const o = { emitEvent: false };
    if (!ids.regionId) {
      finalise(false);
      return;
    }
    this.apiService
      .get(`api/Common/countries/${ids.regionId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          this.countryOptions.set(r.data);
          this.bankForm.get('bankCountryID')!.setValue(ids.countryId ?? '', o);
          if (!ids.countryId) {
            finalise(false);
            return;
          }
          let statesLoaded = false;
          let currenciesLoaded = false;
          const tryFinaliseCascade = () => {
            if (!statesLoaded || !currenciesLoaded) return;
            if (!ids.countryStateMasterId) {
              finalise(true);
              return;
            }
            this.apiService
              .get(`api/Common/cities/${ids.countryStateMasterId}`)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (r2: any) => {
                  this.cityOptions.set(r2.data);
                  this.bankForm.get('stateCityMasterId')!.setValue(ids.stateCityMasterId ?? '', o);
                  finalise(true);
                },
              });
          };

          this.apiService
            .get(`api/Common/states/${ids.countryId}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (r2: any) => {
                this.stateOptions.set(r2.data);
                this.bankForm
                  .get('countryStateMasterId')!
                  .setValue(ids.countryStateMasterId ?? '', o);
                statesLoaded = true;
                tryFinaliseCascade();
              },
            });

          this.apiService
            .get(`${API_URLS.CURRENCY_LOOKUP}/${ids.countryId}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (r2: any) => {
                this.currencyOptions.set(r2.data);
                this.bankForm.get('accountCurrencyID')!.setValue(ids.currencyId ?? '', o);
                currenciesLoaded = true;
                tryFinaliseCascade();
              },
            });
        },
      });
  }

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

  getFundRegionLookup(): void {
    this.apiService
      .get(API_URLS.FUND_REGION_LOOKUP)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r: any) => this.regionOptions.set(r.data) });
  }

  getBankListData(): void {
    this.apiService
      .get(API_URLS.BANK_LIST_DATA)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r: any) => this.bankData.set(r.data) });
  }

  getBankLookups(): void {
    this.apiService
      .get('api/v1/Bank/lookups')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          this.accountTypeOptions.set(r.data.accountTypes);
          this.paymentMethodOptions.set(r.data.paymentMethods);
        },
      });
  }

  private resetForm(): void {
    const o = { emitEvent: false };
    this.bankForm.reset(
      {
        bankCode: '',
        bankName: '',
        bankAccountNo: '',
        achNo: '',
        swiftNo: '',
        iban: '',
        routingNumber: '',
        accountTypeID: '',
        paymentMethodID: '',
        address: '',
        bankRegionID: '',
        bankCountryID: '',
        accountCurrencyID: '',
        countryStateMasterId: '',
        stateCityMasterId: '',
        zipCode: '',
        contactPersonName: '',
        contactPhoneNo: '',
        contactEmailID: '',
        emailId2: '',
      },
      o,
    );
    this.countryOptions.set([]);
    this.currencyOptions.set([]);
    this.stateOptions.set([]);
    this.cityOptions.set([]);
    this.editingId = null;
    this.mode.set('add');
    this.bankForm.enable(o);
    this.bankForm.get('bankCountryID')!.disable(o);
    this.bankForm.get('accountCurrencyID')!.disable(o);
    this.bankForm.get('countryStateMasterId')!.disable(o);
    this.bankForm.get('stateCityMasterId')!.disable(o);
  }

  private prepareForm(bank: Bank): BankCascadeIds {
    const o = { emitEvent: false };
    const ids = this.utilityService.extractBankCascadeIds(bank as any);
    this.bankForm.enable(o);
    this.patchBaseFields(bank);
    this.bankForm.get('bankRegionID')!.setValue(ids.regionId ?? '', o);
    this.bankForm.get('bankCountryID')!.disable(o);
    this.bankForm.get('accountCurrencyID')!.disable(o);
    this.bankForm.get('countryStateMasterId')!.disable(o);
    this.bankForm.get('stateCityMasterId')!.disable(o);
    this.countryOptions.set([]);
    this.currencyOptions.set([]);
    this.stateOptions.set([]);
    this.cityOptions.set([]);
    return ids;
  }

  viewBank(bank: Bank): void {
    this.mode.set('view');
    this.editingId = bank.bankMasterId;
    this.scrollToFormTop();
    const o = { emitEvent: false };
    const ids = this.prepareForm(bank);
    this.loadCascadeAndPatch(ids, (_allLoaded) => {
      this.bankForm.disable(o);
    });
  }

  editBank(bank: Bank): void {
    this.mode.set('edit');
    this.editingId = bank.bankMasterId;
    this.scrollToFormTop();
    const o = { emitEvent: false };
    const ids = this.prepareForm(bank);
    this.loadCascadeAndPatch(ids, (_allLoaded) => {
      if (ids.countryId) this.bankForm.get('bankCountryID')!.enable(o);
      if (ids.countryId) this.bankForm.get('accountCurrencyID')!.enable(o);
      if (ids.countryStateMasterId) this.bankForm.get('countryStateMasterId')!.enable(o);
      if (ids.stateCityMasterId) this.bankForm.get('stateCityMasterId')!.enable(o);
    });
  }

  saveBank(): void {
    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched();
      this.toastService.showWarn('Please fill all required fields correctly');
      return;
    }
    this.apiService
      .post(API_URLS.BANK_ADD, this.getBankPayload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.showSuccess('Bank saved successfully');
          this.getBankListData();
          this.resetForm();
        },
      });
  }

  getBankPayload(): any {
    const v = this.bankForm.getRawValue();
    const payload: any = {
      bankCode: v.bankCode,
      bankName: v.bankName,
      bankAccountNo: v.bankAccountNo,
      achNo: v.achNo,
      swiftNo: v.swiftNo,
      iban: v.iban,
      routingNumber: v.routingNumber,
      accountTypeID: v.accountTypeID,
      paymentMethodID: v.paymentMethodID,
      address: v.address,
      bankRegionID: v.bankRegionID,
      bankCountryID: v.bankCountryID,
      accountCurrencyID: v.accountCurrencyID,
      countryStateMasterId: v.countryStateMasterId,
      stateCityMasterId: v.stateCityMasterId,
      zipCode: v.zipCode,
      contactPersonName: v.contactPersonName,
      contactPhoneNo: v.contactPhoneNo,
      contactEmailID: v.contactEmailID,
      emailId2: v.emailId2,
    };
    if (this.isEditMode() && this.editingId) {
      payload.bankMasterID = this.editingId;
    }
    return payload;
  }

  async showDeleteDialog(bank: Bank): Promise<void> {
    const b = bank as any;
    const result = await this.confirmService.delete(`Bank: ${bank.bankName}`, {
      details: {
        title: 'Bank Details',
        layout: 'list',
        items: [
          { label: 'Name', value: bank.bankName },
          { label: 'Code', value: bank.bankCode, badge: { text: bank.bankCode, color: 'amber' } },
          { label: 'Account No', value: bank.bankAccountNo, mono: true },
          { label: 'SWIFT / BIC', value: bank.swiftNo, mono: true },
          { label: 'Region', value: bank.bankRegion },
          ...(bank.achNo ? [{ label: 'ACH No', value: bank.achNo, mono: true }] : []),
        ],
      },
    });
    if (result.confirmed) this.deleteBank(bank);
  }

  // async viewBankDetails(bank: Bank): Promise<void> {
  //   await this.confirmService.open({
  //     title: `Bank: ${bank.bankName}`,
  //     description: 'View bank details of the selected bank.',
  //     severity: 'info',
  //     details: {
  //       title: 'Bank Details',
  //       layout: 'list',
  //       items: [
  //         { label: 'Name', value: bank.bankName },
  //         { label: 'Code', value: bank.bankCode, badge: { text: bank.bankCode, color: 'amber' } },
  //         { label: 'Account No', value: bank.bankAccountNo, mono: true },
  //         { label: 'SWIFT / BIC', value: bank.swiftNo, mono: true },
  //         { label: 'Region', value: bank.bankRegion },
  //         ...(bank.achNo ? [{ label: 'ACH No', value: bank.achNo, mono: true }] : []),
  //       ],
  //     },
  //   });
  // }
  async viewBankDetails(bank: Bank): Promise<void> {
    const b = bank as any;
    const paymentMethod = this.paymentMethodOptions().find(
      (pm) => pm.paymentMethodId === b.paymentMethodId,
    )?.paymentMethodName;
    const accountType = this.accountTypeOptions().find(
      (at) => at.accountTypeId === b.accountTypeId,
    )?.accountTypeName;
    const result = await this.confirmService.open({
      title: bank.bankName,
      severity: 'info',
      viewDetails: {
        avatarText: bank.bankName
          .split(' ')
          .map((w: string) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        avatarColor: 'sky',
        subtitle: bank.bankCode,
        tags: [
          { text: 'Active', color: 'green' },
          { text: b.currency ?? 'USD', color: 'violet' },
          { text: bank.bankRegion ?? '', color: 'sky' },
          { text: paymentMethod ?? '', color: 'amber' },
        ],
        idStrip: [
          { label: 'SWIFT', value: bank.swiftNo },
          { label: 'Account No', value: bank.bankAccountNo },
          ...(bank.achNo ? [{ label: 'ACH No', value: bank.achNo }] : []),
          ...(b.iban ? [{ label: 'IBAN', value: b.iban }] : []),
        ],
        sections: [
          {
            title: 'General',
            icon: 'building',
            iconColor: 'blue',
            fields: [
              { label: 'Bank Code', value: bank.bankCode, mono: true },
              { label: 'Bank Name', value: bank.bankName },
              { label: 'Account No', value: bank.bankAccountNo, mono: true },
              { label: 'ACH No', value: bank.achNo, mono: true },
              {
                label: 'SWIFT / BIC',
                value: bank.swiftNo,
                badge: { text: bank.swiftNo, color: 'green' },
              },
              {
                label: 'IBAN',
                value: bank.iban ?? '',
                badge: { text: bank.iban ?? '', color: 'indigo' },
              },
              {
                label: 'Routing No',
                value: bank.swiftNo,
                badge: { text: bank.swiftNo, color: 'rose' },
              },
              {
                label: 'Account Type',
                value: accountType ?? '',
                badge: { text: accountType ?? '', color: 'sky' },
              },
              {
                label: 'Payment Method',
                value: paymentMethod ?? '',
                badge: { text: paymentMethod ?? '', color: 'amber' },
              },
            ],
          },
          {
            title: 'Address',
            icon: 'location',
            iconColor: 'purple',
            fields: [
              { label: 'Branch Address', value: b.address ?? '', fullWidth: true },
              {
                label: 'Region',
                value: bank.bankRegion ?? '',
                badge: { text: bank.bankRegion ?? '', color: 'violet' },
              },
              { label: 'Country', value: b.bankCountry ?? '' },
              { label: 'State', value: b.stateName ?? '' },
              { label: 'City', value: b.cityName ?? '' },
              { label: 'Zip Code', value: b.zipCode ?? '', mono: true },
              { label: 'Contact Person', value: bank.contactPersonName ?? '', personAvatar: true },
              { label: 'Contact Person', value: bank.contactPersonName ?? '', personAvatar: true },
              { label: 'Phone', value: bank.contactPhoneNo ?? '' },
              {
                label: 'Primary Email',
                value: bank.contactEmailId ?? '',
                mono: true,
                copyable: true,
              },
              ...(b.emailId2
                ? [{ label: 'Alt Email', value: b.emailId2, mono: true, copyable: true }]
                : []),
            ],
          },
        ],
        showEdit: false,
      },
    });

    // If the user clicked "Edit Bank" inside the view dialog
    if (result.confirmed && result.values?.['action'] === 'edit') {
      this.editBank(bank);
    }
  }

  deleteBank(bank: any): void {
    this.apiService
      .delete(`${API_URLS.BANK_LIST_DATA}/${bank.bankMasterId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.toastService.showSuccess(`Bank "${bank.bankName}" deleted successfully`);
          if (this.editingId === bank.bankMasterId) this.resetForm();
          this.getBankListData();
        },
      });
  }

  clearBankSelection(): void {
    this.resetForm();
  }
}
