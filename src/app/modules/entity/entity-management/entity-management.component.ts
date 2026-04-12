import { Component, OnInit, signal, computed, DestroyRef, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { ApiService } from '../../shared/services/api.service';
import { ConfirmDialogResult, ConfirmService } from '../../shared/services/confirm.service';
import { ToastService } from '../../core/services/toast';
import { UtilityService } from '../../shared/services/utility.service';
import { API_URLS, VALIDATOR_REGEX_PATTERNS } from '../../shared/constants/const';
import { MultiSelectModule } from 'primeng/multiselect';

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
    MultiSelectModule,
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

  readonly Math = Math;

  entityData = signal<any[]>([]);
  selectedEntities: any[] = [];

  regionOptions = signal<any[]>([]);
  countryOptions = signal<any[]>([]);
  currencyOptions = signal<any[]>([]);
  stateOptions = signal<any[]>([]);
  cityOptions = signal<any[]>([]);
  bankListOptions = signal<any[]>([]);
  taxTypeOptions = signal<any[]>([]);
  bankListData = signal<any[]>([]);

  first = 0;
  pageSize = 25;
  activeTabIndex = '0';
  totalRecords = signal(0);
  readonly pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private utilityService: UtilityService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getFundRegionLookup();
    this.getBankListData();
    this.getTaxTypeOptions();
    this.watchCascade();
  }

  private buildForm(): void {
    this.entityForm = this.fb.group({
      entityCode: ['', [Validators.required]],
      entityName: ['', [Validators.required]],
      entityDisplayName: [''],
      entityTaxId: ['', [Validators.required]],
      entityTaxType: ['', [Validators.required]],
      taxPercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      entityBankAccno: ['', [Validators.required]],
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

  private watchCascade(): void {
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
    if (level === 'region' || level === 'country') {
      this.entityForm.get('baseCurrencyId')!.reset('', o);
      this.entityForm.get('baseCurrencyId')!.disable(o);
      this.currencyOptions.set([]);
    }
  }

  private loadCascadeAndPatch(detail: any, finalise: () => void): void {
    const o = { emitEvent: false };
    if (!detail.entityRegionId) {
      finalise();
      return;
    }

    // 1. Countries for the region
    this.apiService
      .get(`api/Common/countries/${detail.entityRegionId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          this.countryOptions.set(r.data);
          this.entityForm.get('countryId')!.setValue(detail.countryId ?? '', o);
          this.entityForm.get('countryId')!.enable(o);
          if (!detail.countryId) {
            finalise();
            return;
          }

          // 2a. Currency for the country
          this.apiService
            .get(`${API_URLS.CURRENCY_LOOKUP}/${detail.countryId}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (r2: any) => {
                this.currencyOptions.set(r2.data);
                this.entityForm.get('baseCurrencyId')!.setValue(detail.baseCurrencyId ?? '', o);
                this.entityForm.get('baseCurrencyId')!.enable(o);
              },
            });

          // 2b. States for the country — always enable after load
          this.apiService
            .get(`api/Common/states/${detail.countryId}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (r3: any) => {
                this.stateOptions.set(r3.data);
                const stateId = detail.countryStateMasterId ?? null;
                this.entityForm.get('state')!.setValue(stateId ?? '', o);
                this.entityForm.get('state')!.enable(o); // ← always enable, even if no value

                if (!stateId) {
                  // No state to chain from — enable city as empty and finish
                  this.entityForm.get('city')!.setValue('', o);
                  this.entityForm.get('city')!.enable(o);
                  finalise();
                  return;
                }

                // 3. Cities for the state
                this.apiService
                  .get(`api/Common/cities/${stateId}`)
                  .pipe(takeUntilDestroyed(this.destroyRef))
                  .subscribe({
                    next: (r4: any) => {
                      this.cityOptions.set(r4.data);
                      this.entityForm.get('city')!.setValue(detail.stateCityMasterId ?? '', o);
                      this.entityForm.get('city')!.enable(o);
                      finalise();
                    },
                  });
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

  getTaxTypeOptions(): void {
    this.apiService
      .get(API_URLS.TAX_TYPE_LOOKUP)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r: any) => this.taxTypeOptions.set(r.data) });
  }

  getEntityListData(pageNo = 1, pageSize = this.pageSize): void {
    this.apiService
      .get(`${API_URLS.ENTITY_LIST_DATA}?pageNo=${pageNo}&pageSize=${pageSize}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          const entities = Array.isArray(r.data?.entities) ? r.data.entities : [];
          this.entityData.set(
            entities.map((e: any) => ({ ...e, banks: Array.isArray(e.banks) ? e.banks : [] })),
          );
          this.totalRecords.set(r.data?.totalRows ?? 0);
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
            value: b.bankAccountNo,
            items: [{ label: b.bankAccountNo, value: b.bankMasterId }],
          }));
          this.bankListData.set(r.data);
          this.bankListOptions.set(bankData);
          console.log('Bank list loaded:', bankData);
        },
      });
  }

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
        entityBankAccno: [], // ← was '' — multiselect requires an array
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
    this.stateOptions.set([]);
    this.cityOptions.set([]);
    this.editingId = null;
    this.mode.set('add');
    this.entityForm.enable(o);
    this.entityForm.get('countryId')!.disable(o);
    this.entityForm.get('baseCurrencyId')!.disable(o);
    this.entityForm.get('state')!.disable(o);
    this.entityForm.get('city')!.disable(o);
  }

  viewEntity(entity: any): void {
    this.mode.set('view');
    this.editingId = entity.entityId;
    this.scrollToFormTop();
    const o = { emitEvent: false };
    this.entityForm.enable(o);
    this.entityForm.get('countryId')!.disable(o);
    this.entityForm.get('baseCurrencyId')!.disable(o);
    this.countryOptions.set([]);
    this.currencyOptions.set([]);
    this.entityForm.get('entityRegionId')!.setValue(entity.entityRegionId ?? '', o);
    this.loadCascadeAndPatch(entity, () => {
      this.entityForm.disable(o);
    });
  }

  editEntity(entity: any): void {
    this.mode.set('edit');
    this.editingId = entity.entityId;
    this.scrollToFormTop();
    this.activeTabIndex = '0';
    this.apiService
      .get(`${API_URLS.ENTITY_LIST_DATA}/${entity.entityId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          const detail = r.data ?? r; // handle both { data: {...} } and direct object
          const o = { emitEvent: false };
          this.entityForm.enable(o);
          this.entityForm.get('countryId')!.disable(o);
          this.entityForm.get('baseCurrencyId')!.disable(o);
          this.entityForm.get('state')!.disable(o);
          this.entityForm.get('city')!.disable(o);
          this.countryOptions.set([]);
          this.currencyOptions.set([]);
          this.stateOptions.set([]);
          this.cityOptions.set([]);
          this.entityForm.get('entityRegionId')!.setValue(detail.entityRegionId ?? '', o);
          this.patchDetailFields(detail);
          this.loadCascadeAndPatch(detail, () => {
            if (detail.countryId) this.entityForm.get('countryId')!.enable(o);
            if (detail.baseCurrencyId) this.entityForm.get('baseCurrencyId')!.enable(o);
          });
        },
      });
  }

  private patchDetailFields(detail: any): void {
    const o = { emitEvent: false };

    // Detail response has banks[] array — extract bankId from each entry
    // bankListOptions uses bankMasterId as the value, which matches bankId from detail
    const bankIds = Array.isArray(detail.banks) ? detail.banks.map((b: any) => b.bankId) : [];

    this.entityForm.patchValue(
      {
        entityCode: detail.entityCode ?? '',
        entityName: detail.entityName ?? '',
        entityDisplayName: detail.entityDisplayName ?? '',
        entityTaxId: detail.entityTaxId ?? '',
        entityTaxType: detail.taxTypeId ?? '',
        taxPercentage: detail.taxPercentage ?? '',
        entityBankAccno: bankIds, // ← was looking at flat string
        street: detail.street ?? '',
        zip: detail.zip ?? '',
        contactPersonName: detail.contactPersonName ?? '',
        contactPersonPhoneNo: detail.contactPersonPhoneNo ?? '',
        contactEmailId: detail.contactEmailId ?? '',
        emailId2: detail.emailId2 ?? '',
      },
      o,
    );
  }

  saveEntity(): void {
    if (this.entityForm.invalid) {
      this.entityForm.markAllAsTouched();
      this.toastService.showWarn('Please fill all required fields correctly');
      return;
    }
    console.log('Payload ready to be sent to API:', this.getEntityPayload());
    this.apiService
      .post(API_URLS.ENTITY_ADD, this.getEntityPayload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.showSuccess(
            this.isEditMode() ? 'Entity updated successfully' : 'Entity saved successfully',
          );
          this.refreshList();
          this.resetForm();
          this.activeTabIndex = '0';
        },
      });
  }

  getEntityPayload(): any {
    const v = this.entityForm.getRawValue();
    const payload: any = {
      entityCode: v.entityCode,
      entityName: v.entityName,
      entityDisplayName: v.entityDisplayName,
      bankIds: v.entityBankAccno,
      entityTaxId: v.entityTaxId,
      taxTypeId: v.entityTaxType,
      taxPercentage: Number(v.taxPercentage),
      street: v.street,
      countryId: v.countryId,
      zip: v.zip,
      contactPersonName: v.contactPersonName,
      contactPersonPhoneNo: v.contactPersonPhoneNo,
      contactEmailId: v.contactEmailId,
      contactEmailId2: v.emailId2,
      baseCurrencyId: v.baseCurrencyId,
      entityRegionId: v.entityRegionId,
      countryStateMasterId: v.state,
      stateCityMasterId: v.city,
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
          this.refreshList();
        },
      });
  }

  clearEntitySelection(): void {
    this.resetForm();
  }

  getSelectedBankNames(): { id: any; name: string; accNo: string }[] {
    const selected: any[] = this.entityForm.get('entityBankAccno')?.value ?? [];
    if (!selected.length) return [];
    return selected
      .map((id) => {
        const bank = this.bankListData().find((b: any) => b.bankMasterId === id);
        return bank ? { id, name: bank.bankName, accNo: bank.bankAccountNo } : null;
      })
      .filter(Boolean) as { id: any; name: string; accNo: string }[];
  }

  getOverflowTooltip(): string {
    return this.getSelectedBankNames()
      .slice(2)
      .map((b) => `${b.name} • ${b.accNo}`)
      .join('\n');
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.first = event.first ?? 0;
    this.pageSize = event.rows ?? 25;
    const pageNo = Math.floor(this.first / this.pageSize) + 1;
    this.getEntityListData(pageNo, this.pageSize);
  }

  get currentPage(): number {
    return Math.floor(this.first / this.pageSize) + 1;
  }

  get totalPages(): number {
    return this.totalRecords() === 0 ? 1 : Math.ceil(this.totalRecords() / this.pageSize);
  }

  get paginationStart(): number {
    return this.totalRecords() === 0 ? 0 : this.first + 1;
  }

  get paginationEnd(): number {
    return Math.min(this.first + this.pageSize, this.totalRecords());
  }

  getBankOverflowTooltip(banks: any[] | null | undefined): string {
    if (!banks || !Array.isArray(banks)) return '';
    return banks
      .slice(2)
      .map((b: any) => `${b.entityBankName}  •  ${b.entityBankAccno}`)
      .join('\n');
  }

  refreshList(): void {
    this.first = 0;
    this.getEntityListData(1, this.pageSize);
  }

  viewEntityDetails(entity: any): void {
    this.apiService
      .get(`${API_URLS.ENTITY_LIST_DATA}/${entity.entityId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          this.getStateDataFromCountryId(r.data?.countryId ?? r.countryId, r.data ?? r);
        },
      });
  }

  private getStateDataFromCountryId(countryId: string, entityData: any): void {
    this.apiService
      .get(`api/Common/states/${countryId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          this.stateOptions.set(r.data);
          this.getCityFromStateId(entityData.countryStateMasterId, entityData);
        },
      });
  }

  getCityFromStateId(stateId: string, entityData: any): void {
    this.apiService
      .get(`api/Common/cities/${stateId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          this.cityOptions.set(r.data);
          this.openEntityDetailsDialog(entityData);
        },
      });
  }

  async openEntityDetailsDialog(entity: any): Promise<ConfirmDialogResult> {
    const bankNames = entity.banks.map((b: any) => `${b.entityBankName}  •  ${b.entityBankAccno}`);
    console.log('state options:', this.stateOptions());
    console.log('city options:', this.cityOptions());
    const entityState =
      this.stateOptions().find((s) => s.countryStateMasterId === entity.countryStateMasterId)
        ?.stateName ?? '';
    const entityCity =
      this.cityOptions().find((c) => c.stateCityMasterId === entity.stateCityMasterId)?.cityName ??
      '';
    return await this.confirmService.open({
      title: entity.entityName,
      severity: 'info',
      viewDetails: {
        avatarText: entity.entityName
          .split(' ')
          .map((w: string) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        avatarColor: 'indigo',
        subtitle: entity.entityCode,
        tags: [
          { text: 'Active', color: 'green' },
          { text: entity.entityTaxType ?? '', color: 'amber' },
          { text: entity.entityRegion ?? '', color: 'sky' },
        ],
        idStrip: [
          { label: 'Entity Code', value: entity.entityCode },
          { label: 'Tax ID', value: entity.entityTaxId },
          ...(entity.banks?.length
            ? [{ label: 'Primary Bank', value: entity.banks[0].entityBankName }]
            : []),
        ],
        sections: [
          {
            title: 'General',
            icon: 'building',
            iconColor: 'blue',
            fields: [
              { label: 'Entity Code', value: entity.entityCode, mono: true },
              { label: 'Entity Name', value: entity.entityName },
              { label: 'Display Name', value: entity.entityDisplayName ?? '-' },
              { label: 'Tax ID', value: entity.entityTaxId, mono: true },
              {
                label: 'Tax Type',
                value: entity.entityTaxType ?? '-',
                badge: { text: entity.entityTaxType ?? '-', color: 'amber' },
              },
              {
                label: 'Tax %',
                value: entity.taxPercentage ?? '-',
                badge: { text: `${entity.taxPercentage ?? '-'}%`, color: 'violet' },
              },
              {
                label: 'Mapped Banks',
                value: entity.banks?.length ? bankNames : 'No banks mapped',
              },
            ],
          },
          {
            title: 'Address',
            icon: 'location',
            iconColor: 'purple',
            fields: [
              { label: 'Address', value: entity.street ?? '-', fullWidth: true },
              {
                label: 'Region',
                value: entity.entityRegion ?? '-',
                badge: { text: entity.entityRegion ?? '-', color: 'violet' },
              },
              {
                label: 'Base Currency',
                value: entity.baseCurrency ?? '',
                badge: { text: entity.baseCurrency ?? '-', color: 'green' },
                icon: 'currency',
              },
              {
                label: 'Country',
                value: entity.countryName ?? '',
                badge: { text: entity.countryName ?? '-', color: 'amber' },
              },
              {
                label: 'State',
                value: entityState ?? '',
                badge: { text: entityState ?? '-', color: 'rose' },
              },
              {
                label: 'City',
                value: entityCity ?? '',
                badge: { text: entityCity ?? '-', color: 'emerald' },
              },
              { label: 'Zip Code', value: entity.zip ?? '-', mono: true },
              {
                label: 'Contact Person',
                value: entity.contactPersonName ?? '-',
                personAvatar: true,
              },
              { label: 'Phone', value: entity.contactPersonPhoneNo ?? '-' },
              {
                label: 'Primary Email',
                value: entity.contactEmailId ?? '-',
                mono: true,
                copyable: true,
              },
              {
                label: 'Secondary Email',
                value: entity.contactEmailId2 ?? '-',
                mono: true,
                copyable: true,
              },
            ],
          },
        ],
        showEdit: false,
      },
    });
  }
}
