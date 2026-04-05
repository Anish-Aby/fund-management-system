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
import { ApiService } from '../../shared/services/api.service';
import { ConfirmService } from '../../shared/services/confirm.service';
import { ToastService } from '../../core/services/toast';
import { UtilityService } from '../../shared/services/utility.service';
import { API_URLS, VALIDATOR_REGEX_PATTERNS } from '../../shared/constants/const';

export type FormMode = 'add' | 'edit' | 'view';

@Component({
  selector: 'app-entity-management',
  standalone: true,
  templateUrl: './entity-management.component.html',
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
export class EntityManagementComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private el = inject(ElementRef);
  private mode = signal<FormMode>('add');
  private editingId: number | null = null;

  entityForm!: FormGroup;

  isAddMode = computed(() => this.mode() === 'add');
  isEditMode = computed(() => this.mode() === 'edit');
  isViewMode = computed(() => this.mode() === 'view');

  entityData = signal<any[]>([]);
  selectedEntities: any[] = [];

  regionOptions = signal<any[]>([]);
  countryOptions = signal<any[]>([]);
  currencyOptions = signal<any[]>([]);
  stateOptions = signal<any[]>([]);
  cityOptions = signal<any[]>([]);
  bankListOptions = signal<any[]>([]);

  // Static tax type options — swap for an API call if a lookup endpoint exists
  taxTypeOptions = [
    { label: 'VAT', value: 'VAT' },
    { label: 'GST', value: 'GST' },
    { label: 'Sales Tax', value: 'SalesTax' },
    { label: 'Income Tax', value: 'IncomeTax' },
    { label: 'Withholding Tax', value: 'WithholdingTax' },
  ];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private utilityService: UtilityService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getEntityListData();
    this.getFundRegionLookup();
    this.getBankListData();
    this.watchCascade();
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.entityForm = this.fb.group({
      // General Info
      entityCode: ['', [Validators.required]],
      entityName: ['', [Validators.required]],
      entityDisplayName: [''],
      entityTaxId: ['', [Validators.required]],
      entityTaxType: ['', [Validators.required]],
      taxPercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      entityBankAccno: ['', [Validators.required]],
      // Address Info
      street: ['', [Validators.required]],
      entityRegionId: ['', [Validators.required]],
      countryId: [{ value: '', disabled: true }, [Validators.required]],
      baseCurrencyId: [{ value: '', disabled: true }, [Validators.required]],
      state: [{ value: '', disabled: true }, [Validators.required]],
      city: [{ value: '', disabled: true }, [Validators.required]],
      zip: ['', [Validators.required, Validators.pattern(VALIDATOR_REGEX_PATTERNS.ZIP_PATTERN)]],
      contactPersonName: ['', [Validators.required, Validators.maxLength(100)]],
      contactPersonPhoneNo: [
        '',
        [Validators.required, Validators.pattern(VALIDATOR_REGEX_PATTERNS.PHONE_PATTERN)],
      ],
      contactEmailId: ['', [Validators.required, Validators.email]],
      emailId2: ['', [Validators.email]],
    });
  }

  isFieldInvalid(field: string): boolean {
    return this.utilityService.isFieldInvalid(this.entityForm, field);
  }

  getFieldError(field: string): string {
    return this.utilityService.getFieldError(this.entityForm, field);
  }

  // ── Cascade watchers ──────────────────────────────────────────────────────

  private watchCascade(): void {
    // Region → Country
    this.entityForm
      .get('entityRegionId')!
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
              if (!this.isViewMode()) {
                this.entityForm.get('countryId')!.enable();
              }
            },
          });
      });

    // Country → State + Currency
    this.entityForm
      .get('countryId')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((countryId: string | null) => {
        this.resetDownstreamOf('country');
        if (!countryId) return;

        // States
        this.apiService
          .get(`api/Common/states/${countryId}`)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (r: any) => {
              this.stateOptions.set(r.data);
              if (!this.isViewMode()) {
                this.entityForm.get('state')!.enable();
              }
            },
          });

        // Currency
        this.apiService
          .get(`${API_URLS.CURRENCY_LOOKUP}/${countryId}`)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (r: any) => {
              this.currencyOptions.set(r.data);
              if (!this.isViewMode()) {
                this.entityForm.get('baseCurrencyId')!.enable();
              }
            },
          });
      });

    // State → City
    this.entityForm
      .get('state')!
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
              if (!this.isViewMode()) {
                this.entityForm.get('city')!.enable();
              }
            },
          });
      });
  }

  private resetDownstreamOf(level: 'region' | 'country' | 'state'): void {
    const o = { emitEvent: false };

    if (level === 'region') {
      this.entityForm.get('countryId')!.reset('', o);
      this.entityForm.get('countryId')!.disable(o);
      this.countryOptions.set([]);
    }

    if (level === 'region' || level === 'country') {
      this.entityForm.get('state')!.reset('', o);
      this.entityForm.get('state')!.disable(o);
      this.stateOptions.set([]);
    }

    if (level === 'region' || level === 'country' || level === 'state') {
      this.entityForm.get('city')!.reset('', o);
      this.entityForm.get('city')!.disable(o);
      this.cityOptions.set([]);
    }

    // Currency reset (for region & country)
    if (level === 'region' || level === 'country') {
      this.entityForm.get('baseCurrencyId')!.reset('', o);
      this.entityForm.get('baseCurrencyId')!.disable(o);
      this.currencyOptions.set([]);
    }
  }

  // ── Cascade patch (used by view/edit) ─────────────────────────────────────

  /**
   * Fetches country + currency lists silently (emitEvent: false),
   * patches the cascade controls, then calls `finalise`.
   */
  private loadCascadeAndPatch(entity: any, finalise: () => void): void {
    const o = { emitEvent: false };
    const regionId = entity.entityRegionId;

    if (!regionId) {
      finalise();
      return;
    }

    this.apiService
      .get(`api/Common/countries/${regionId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          this.countryOptions.set(r.data);
          this.entityForm.get('countryId')!.setValue(entity.countryId ?? '', o);

          if (!entity.countryId) {
            finalise();
            return;
          }

          this.apiService
            .get(`${API_URLS.CURRENCY_LOOKUP}/${entity.countryId}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (r2: any) => {
                this.currencyOptions.set(r2.data);
                this.entityForm.get('baseCurrencyId')!.setValue(entity.baseCurrencyId ?? '', o);
                finalise();
              },
            });
        },
      });
  }

  private patchBaseFields(entity: any): void {
    const o = { emitEvent: false };
    this.entityForm.patchValue(
      {
        entityCode: entity.entityCode ?? '',
        entityName: entity.entityName ?? '',
        entityDisplayName: entity.entityDisplayName ?? '',
        entityTaxId: entity.entityTaxId ?? '',
        entityTaxType: entity.entityTaxType ?? '',
        taxPercentage: entity.taxPercentage ?? '',
        entityBankName: entity.entityBankName ?? '',
        entityBankAccno: entity.entityBankAccno ?? '',
        street: entity.street ?? '',
        state: entity.state ?? '',
        city: entity.city ?? '',
        zip: entity.zip ?? '',
        contactPersonName: entity.contactPersonName ?? '',
        contactPersonPhoneNo: entity.contactPersonPhoneNo ?? '',
        contactEmailId: entity.contactEmailId ?? '',
        emailId2: entity.emailId2 ?? '',
      },
      o,
    );
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

  // ── Data loaders ──────────────────────────────────────────────────────────

  getFundRegionLookup(): void {
    this.apiService
      .get(API_URLS.FUND_REGION_LOOKUP)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r: any) => this.regionOptions.set(r.data) });
  }

  getEntityListData(): void {
    this.apiService
      .get(API_URLS.ENTITY_LIST_DATA)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          if (typeof r.data === 'object' && Array.isArray(r.data.items)) {
            this.entityData.set(r.data.items);
          } else {
            this.entityData.set([]);
          }
        },
      });
  }

  getBankListData(): void {
    this.apiService
      .get(API_URLS.BANK_LIST_DATA)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          const bankData = r.data.map((b: any) => ({
            label: b.bankName,
            value: b.bankId,
            items: [{ label: b.bankAccountNo, value: b.bankId }],
          }));
          this.bankListOptions.set(bankData);
        },
      });
  }

  // ── Form reset ────────────────────────────────────────────────────────────

  private resetForm(): void {
    const o = { emitEvent: false };
    this.entityForm.reset(
      {
        entityCode: '',
        entityName: '',
        entityDisplayName: '',
        entityTaxId: '',
        entityTaxType: '',
        taxPercentage: '',
        entityBankName: '',
        entityBankAccno: '',
        street: '',
        entityRegionId: '',
        countryId: '',
        baseCurrencyId: '',
        state: '',
        city: '',
        zip: '',
        contactPersonName: '',
        contactPersonPhoneNo: '',
        contactEmailId: '',
        emailId2: '',
      },
      o,
    );
    this.countryOptions.set([]);
    this.currencyOptions.set([]);
    this.editingId = null;
    this.mode.set('add');
    this.entityForm.enable(o);
    // Re-disable cascade dependents
    this.entityForm.get('countryId')!.disable(o);
    this.entityForm.get('baseCurrencyId')!.disable(o);
  }

  // ── CRUD actions ──────────────────────────────────────────────────────────

  viewEntity(entity: any): void {
    this.mode.set('view');
    this.editingId = entity.entityId;
    this.scrollToFormTop();
    const o = { emitEvent: false };
    // Enable everything first so patchValue works, then disable at the end
    this.entityForm.enable(o);
    this.entityForm.get('countryId')!.disable(o);
    this.entityForm.get('baseCurrencyId')!.disable(o);
    this.countryOptions.set([]);
    this.currencyOptions.set([]);
    this.entityForm.get('entityRegionId')!.setValue(entity.entityRegionId ?? '', o);
    this.patchBaseFields(entity);
    this.loadCascadeAndPatch(entity, () => {
      this.entityForm.disable(o);
    });
  }

  editEntity(entity: any): void {
    this.mode.set('edit');
    this.editingId = entity.entityId;
    this.scrollToFormTop();
    const o = { emitEvent: false };
    this.entityForm.enable(o);
    this.entityForm.get('countryId')!.disable(o);
    this.entityForm.get('baseCurrencyId')!.disable(o);
    this.countryOptions.set([]);
    this.currencyOptions.set([]);
    this.entityForm.get('entityRegionId')!.setValue(entity.entityRegionId ?? '', o);
    this.patchBaseFields(entity);
    this.loadCascadeAndPatch(entity, () => {
      if (entity.countryId) this.entityForm.get('countryId')!.enable(o);
      if (entity.baseCurrencyId) this.entityForm.get('baseCurrencyId')!.enable(o);
    });
  }

  saveEntity(): void {
    if (this.entityForm.invalid) {
      this.entityForm.markAllAsTouched();
      this.toastService.showWarn('Please fill all required fields correctly');
      return;
    }
    console.log('Payload ready to be sent to API:', this.getEntityPayload());
    // this.apiService
    //   .post(API_URLS.ENTITY_ADD, this.getEntityPayload())
    //   .pipe(takeUntilDestroyed(this.destroyRef))
    //   .subscribe({
    //     next: () => {
    //       this.toastService.showSuccess(
    //         this.isEditMode() ? 'Entity updated successfully' : 'Entity saved successfully',
    //       );
    //       this.getEntityListData();
    //       this.resetForm();
    //     },
    //   });
  }

  getEntityPayload(): any {
    const v = this.entityForm.getRawValue();
    const payload: any = {
      entityCode: v.entityCode,
      entityName: v.entityName,
      entityDisplayName: v.entityDisplayName,
      entityBankName: v.entityBankName,
      entityBankAccno: v.entityBankAccno,
      street: v.street,
      city: v.city,
      state: v.state,
      zip: v.zip,
      countryId: v.countryId,
      entityTaxId: v.entityTaxId,
      entityTaxType: v.entityTaxType,
      taxPercentage: Number(v.taxPercentage),
      baseCurrencyId: v.baseCurrencyId,
      entityRegionId: v.entityRegionId,
      contactPersonName: v.contactPersonName,
      contactPersonPhoneNo: v.contactPersonPhoneNo,
      contactEmailId: v.contactEmailId,
    };
    if (this.isEditMode() && this.editingId) {
      payload.entityId = this.editingId;
    }
    return payload;
  }

  async showDeleteDialog(entity: any): Promise<void> {
    const result = await this.confirmService.delete(`Entity: ${entity.entityName}`, {
      details: {
        title: 'Entity Details',
        layout: 'list',
        items: [
          { label: 'Name', value: entity.entityName },
          {
            label: 'Code',
            value: entity.entityCode,
            badge: { text: entity.entityCode, color: 'amber' },
          },
          { label: 'Tax ID', value: entity.entityTaxId, mono: true },
          { label: 'Tax Type', value: entity.entityTaxType },
        ],
      },
    });
    if (result.confirmed) this.deleteEntity(entity);
  }

  deleteEntity(entity: any): void {
    this.apiService
      .delete(`${API_URLS.ENTITY_LIST_DATA}/${entity.entityId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.toastService.showSuccess(`Entity "${entity.entityName}" deleted successfully`);
          if (this.editingId === entity.entityId) this.resetForm();
          this.getEntityListData();
        },
      });
  }

  clearEntitySelection(): void {
    this.resetForm();
  }
}
