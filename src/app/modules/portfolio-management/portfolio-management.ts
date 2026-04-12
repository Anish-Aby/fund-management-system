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
import { MultiSelectModule } from 'primeng/multiselect';
import { ApiService } from '../shared/services/api.service';
import { ConfirmDialogResult, ConfirmService } from '../shared/services/confirm.service';
import { ToastService } from '../core/services/toast';
import { UtilityService } from '../shared/services/utility.service';
import { AddressCascadeService, CascadeContext } from '../shared/services/address-cascade';
import { API_URLS, VALIDATOR_REGEX_PATTERNS } from '../shared/constants/const';

export type FormMode = 'add' | 'edit' | 'view';

@Component({
  selector: 'app-portfolio-management',
  standalone: true,
  templateUrl: './portfolio-management.html',
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
export class PortfolioManagementComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private el = inject(ElementRef);
  private mode = signal<FormMode>('add');
  private editingId: number | null = null;

  portfolioForm!: FormGroup;

  isAddMode = computed(() => this.mode() === 'add');
  isEditMode = computed(() => this.mode() === 'edit');
  isViewMode = computed(() => this.mode() === 'view');

  // ── Table data ────────────────────────────────────────────────────────────
  portfolioData = signal<any[]>([]);
  selectedPortfolios: any[] = [];

  // ── Dropdown options ──────────────────────────────────────────────────────
  regionOptions = signal<any[]>([]);
  countryOptions = signal<any[]>([]);
  currencyOptions = signal<any[]>([]);
  stateOptions = signal<any[]>([]);
  cityOptions = signal<any[]>([]);
  taxTypeOptions = signal<any[]>([]);
  entityLookupOptions = signal<any[]>([]);
  bankListOptions = signal<any[]>([]); // grouped for select
  bankListData = signal<any[]>([]); // raw, for acc-no auto-populate

  // ── Pagination ────────────────────────────────────────────────────────────
  first = 0;
  pageSize = 25;
  activeTabIndex = '0';
  totalRecords = signal(0);
  readonly pageSizeOptions = [5, 10, 25, 50];

  // ── Cascade context (built lazily in getter) ──────────────────────────────
  private get cascadeCtx(): CascadeContext {
    return {
      form: this.portfolioForm,
      signals: {
        countryOptions: this.countryOptions,
        currencyOptions: this.currencyOptions,
        stateOptions: this.stateOptions,
        cityOptions: this.cityOptions,
      },
      fields: {
        region: 'regionId',
        country: 'countryId',
        currency: 'baseCurrencyId',
        state: 'state',
        city: 'city',
      },
      // ↓ Adjust these keys to match your actual API detail response payload
      detailKeys: {
        regionId: 'regionId',
        countryId: 'countryId',
        currencyId: 'baseCurrencyId',
        stateId: 'countryStateMasterId',
        cityId: 'stateCityMasterId',
      },
      isViewMode: () => this.isViewMode(),
      destroyRef: this.destroyRef,
    };
  }

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private confirmService: ConfirmService,
    private toastService: ToastService,
    private utilityService: UtilityService,
    private cascadeService: AddressCascadeService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getFundRegionLookup();
    this.getTaxTypeOptions();
    this.getEntityLookup();
    this.getBankListData();
    // Hand off cascade wiring to the shared service
    this.cascadeService.setupWatchers(this.cascadeCtx);
    // Auto-populate bank acc no when bank is selected
    this.watchBankSelection();
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.portfolioForm = this.fb.group({
      // ── General Info ──────────────────────────────────────────────────────
      portfolioCode: ['', [Validators.required]],
      portfolioName: ['', [Validators.required]],
      portfolioDisplayName: [''],
      taxId: ['', [Validators.required]],
      taxTypeId: ['', [Validators.required]],
      taxPercentage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      mappedEntityIds: ['', [Validators.required]],
      bankId: ['', [Validators.required]],
      bankAccNo: [{ value: '', disabled: true }], // auto-populated
      // ── Address Info ──────────────────────────────────────────────────────
      street: ['', [Validators.required]],
      regionId: ['', [Validators.required]],
      countryId: [{ value: '', disabled: true }, [Validators.required]],
      baseCurrencyId: [{ value: '', disabled: true }, [Validators.required]],
      state: [{ value: '', disabled: true }, [Validators.required]],
      city: [{ value: '', disabled: true }, [Validators.required]],
      zip: ['', [Validators.required, Validators.pattern(VALIDATOR_REGEX_PATTERNS.ZIP_PATTERN)]],
      // handledBy: ['', [Validators.required, Validators.maxLength(100)]],
      // contactNo: [
      //   '',
      //   [Validators.required, Validators.pattern(VALIDATOR_REGEX_PATTERNS.PHONE_PATTERN)],
      // ],
      // emailId: ['', [Validators.required, Validators.email]],
    });
  }

  private watchBankSelection(): void {
    this.portfolioForm
      .get('bankId')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bankId: any) => {
        const bank = this.bankListData().find((b: any) => b.bankMasterId === bankId);
        const o = { emitEvent: false };
        this.portfolioForm.get('bankAccNo')!.setValue(bank?.bankAccountNo ?? '', o);
      });
  }

  isFieldInvalid(field: string): boolean {
    return this.utilityService.isFieldInvalid(this.portfolioForm, field);
  }

  getFieldError(field: string): string {
    return this.utilityService.getFieldError(this.portfolioForm, field);
  }

  // ── Data loaders ──────────────────────────────────────────────────────────

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

  getEntityLookup(): void {
    this.apiService
      .get(API_URLS.ENTITY_LOOKUP) // add to API_URLS
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r: any) => this.entityLookupOptions.set(r.data) });
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
        },
      });
  }

  getPortfolioListData(pageNo = 1, pageSize = this.pageSize): void {
    this.apiService
      .get(`${API_URLS.PORTFOLIO_LIST_DATA}?pageNo=${pageNo}&pageSize=${pageSize}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          this.portfolioData.set(Array.isArray(r.data?.funds) ? r.data.funds : []);
          this.totalRecords.set(r.data?.totalRecords ?? 0);
        },
      });
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  savePortfolio(): void {
    if (this.portfolioForm.invalid) {
      this.portfolioForm.markAllAsTouched();
      this.toastService.showWarn('Please fill all required fields correctly');
      return;
    }
    console.log('Payload to save:', this.getPortfolioPayload()); // Debug log
    this.apiService
      .post(API_URLS.PORTFOLIO_ADD, this.getPortfolioPayload())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toastService.showSuccess(
            this.isEditMode() ? 'Portfolio updated successfully' : 'Portfolio saved successfully',
          );
          this.refreshList();
          this.resetForm();
          this.activeTabIndex = '0';
        },
      });
  }

  getPortfolioPayload(): any {
    const v = this.portfolioForm.getRawValue();
    const payload: any = {
      fundId: this.isEditMode() && this.editingId ? this.editingId : 0,
      fundCode: v.portfolioCode,
      fundName: v.portfolioName,
      displayName: v.portfolioDisplayName,
      fundRegionId: v.regionId,
      fundCcyId: v.baseCurrencyId,
      fundTaxId: v.taxId,
      portfolioAddress: v.street,
      countryMasterId: v.countryId,
      countryStateMasterId: v.state,
      stateCityMasterId: v.city,
      entityBankMappings:
        v.mappedEntityIds && v.bankId
          ? [
              {
                entityId: v.mappedEntityIds,
                bankMasterId: v.bankId,
              },
            ]
          : [],
    };
    return payload;
  }

  async showDeleteDialog(portfolio: any): Promise<void> {
    const result = await this.confirmService.delete(`Portfolio: ${portfolio.portfolioName}`, {
      details: {
        title: 'Portfolio Details',
        layout: 'list',
        items: [
          { label: 'Name', value: portfolio.portfolioName },
          {
            label: 'Code',
            value: portfolio.portfolioCode,
            badge: { text: portfolio.portfolioCode, color: 'amber' },
          },
          { label: 'Tax ID', value: portfolio.taxId, mono: true },
          { label: 'Tax Type', value: portfolio.taxType },
        ],
      },
    });
    if (result.confirmed) this.deletePortfolio(portfolio);
  }

  deletePortfolio(portfolio: any): void {
    this.apiService
      .delete(`${API_URLS.PORTFOLIO_LIST_DATA}/${portfolio.fundID}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.toastService.showSuccess(`Portfolio "${portfolio.fundName}" deleted successfully`);
          if (this.editingId === portfolio.fundID) this.resetForm();
          this.refreshList();
        },
      });
  }

  clearPortfolioSelection(): void {
    this.resetForm();
  }

  // ── Selection helpers ────────────────────────────────────────────────────

  getSelectedEntityNames(): { id: any; name: string }[] {
    const selected: any[] = this.portfolioForm.get('mappedEntityIds')?.value ?? [];
    if (!selected.length) return [];
    return selected
      .map((id) => {
        const entity = this.entityLookupOptions().find((e: any) => e.entityId === id);
        return entity ? { id, name: entity.entityName } : null;
      })
      .filter(Boolean) as { id: any; name: string }[];
  }

  getEntityOverflowTooltip(): string {
    return this.getSelectedEntityNames()
      .slice(2)
      .map((e) => e.name)
      .join('\n');
  }

  getSelectedBankLabel(): string {
    const bankId = this.portfolioForm.get('bankId')?.value;
    if (!bankId) return '';
    return this.bankListData().find((b: any) => b.bankMasterId === bankId)?.bankName ?? '';
  }

  // ── Pagination / lazy load ───────────────────────────────────────────────

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.first = event.first ?? 0;
    this.pageSize = event.rows ?? 25;
    const pageNo = Math.floor(this.first / this.pageSize) + 1;
    this.getPortfolioListData(pageNo, this.pageSize);
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

  refreshList(): void {
    this.first = 0;
    this.getPortfolioListData(1, this.pageSize);
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  private resetForm(): void {
    const o = { emitEvent: false };
    this.portfolioForm.reset(
      {
        portfolioCode: '',
        portfolioName: '',
        portfolioDisplayName: '',
        taxId: '',
        taxTypeId: '',
        taxPercentage: '',
        mappedEntityIds: [],
        bankId: '',
        bankAccNo: '',
        street: '',
        regionId: '',
        countryId: '',
        baseCurrencyId: '',
        state: '',
        city: '',
        zip: '',
        // handledBy: '',
        // contactNo: '',
        // emailId: '',
      },
      o,
    );
    this.editingId = null;
    this.mode.set('add');
    this.portfolioForm.enable(o);
    this.portfolioForm.get('bankAccNo')!.disable(o);
    this.cascadeService.resetAll(this.cascadeCtx);
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

  getSelectedBankNames(): { id: any; name: string; accNo: string }[] {
    const selected = this.portfolioForm.get('bankId')?.value;
    if (!selected) return [];
    const bank = this.bankListData().find((b: any) => b.bankMasterId === selected);
    return bank ? [{ id: selected, name: bank.bankName, accNo: bank.bankAccountNo }] : [];
  }

  getOverflowTooltip(): string {
    return this.getSelectedBankNames()
      .slice(2)
      .map((b) => `${b.name} • ${b.accNo}`)
      .join('\n');
  }

  // ── Row click → detail dialog ─────────────────────────────────────────────

  viewPortfolioDetails(portfolio: any): void {
    this.apiService
      .get(`${API_URLS.PORTFOLIO_LIST_DATA}/${portfolio.fundID}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          const raw = r.data ?? r;
          // Normalise API keys → internal keys used everywhere else
          const detail = this.normaliseDetailKeys(raw);
          this.loadCascadeAndOpenDialog(detail);
        },
      });
  }

  /** Maps raw fund API field names to the internal field names used by the form / cascade. */
  private normaliseDetailKeys(raw: any): any {
    return {
      ...raw,
      // form / cascade expect these names
      regionId: raw.fundRegionID ?? null,
      countryId: raw.countryMasterID ?? null,
      baseCurrencyId: raw.fundCcyID ?? null,
      countryStateMasterId: raw.countryStateMasterID ?? null,
      stateCityMasterId: raw.stateCityMasterID ?? null,
      // keep display-friendly fields from the list response if present
      portfolioCode: raw.fundCode ?? raw.portfolioCode,
      portfolioName: raw.fundName ?? raw.portfolioName,
      portfolioDisplayName: raw.displayName ?? raw.portfolioDisplayName,
      taxId: raw.fundTaxId ?? raw.taxId,
      bankName: raw.fundBankName ?? raw.bankName,
      bankAccNo: raw.fundBankAccNo ?? raw.bankAccNo,
      street: raw.portfolioAddress ?? raw.street,
      // entities array from detail endpoint
      mappedEntities: Array.isArray(raw.entities) ? raw.entities : (raw.mappedEntities ?? []),
    };
  }

  /**
   * Chains region → country → currency → state → city lookups sequentially,
   * then opens the view dialog once all names are resolved.
   * Does NOT touch the form or shared option signals.
   */
  private loadCascadeAndOpenDialog(detail: any): void {
    // Step 0 – resolve region name from already-loaded regionOptions signal
    const regionName =
      this.regionOptions().find((r) => r.fundRegionId === detail.regionId)?.fundRegionName ?? '';

    if (!detail.regionId) {
      this.openPortfolioDetailsDialog(detail, {
        regionName,
        countryName: '',
        currencyCode: '',
        stateName: '',
        cityName: '',
      });
      return;
    }

    // Step 1 – countries (keyed by region)
    this.apiService
      .get(`${API_URLS.COUNTRY_LOOKUP}/${detail.regionId}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          const countries: any[] = r.data ?? [];
          const foundCountry = countries.find((c) => c.countryMasterId === detail.countryId);
          const countryName = foundCountry?.countryName ?? '';

          if (!detail.countryId) {
            this.openPortfolioDetailsDialog(detail, {
              regionName,
              countryName,
              currencyCode: '',
              stateName: '',
              cityName: '',
            });
            return;
          }

          // Step 2 – currencies (keyed by country)
          this.apiService
            .get(`${API_URLS.CURRENCY_LOOKUP}/${detail.countryId}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: (rc: any) => {
                const currencies: any[] = rc.data ?? [];
                const currencyCode =
                  currencies.find((c) => c.currencyMasterId === detail.baseCurrencyId)
                    ?.currencyCode ?? '';

                // Step 3 – states (keyed by country)
                this.apiService
                  .get(`api/Common/states/${detail.countryId}`)
                  .pipe(takeUntilDestroyed(this.destroyRef))
                  .subscribe({
                    next: (rs: any) => {
                      const states: any[] = rs.data ?? [];
                      const stateName =
                        states.find((s) => s.countryStateMasterId === detail.countryStateMasterId)
                          ?.stateName ?? '';

                      if (!detail.countryStateMasterId) {
                        this.openPortfolioDetailsDialog(detail, {
                          regionName,
                          countryName,
                          currencyCode,
                          stateName,
                          cityName: '',
                        });
                        return;
                      }

                      // Step 4 – cities (keyed by state)
                      this.apiService
                        .get(`api/Common/cities/${detail.countryStateMasterId}`)
                        .pipe(takeUntilDestroyed(this.destroyRef))
                        .subscribe({
                          next: (rci: any) => {
                            const cities: any[] = rci.data ?? [];
                            const cityName =
                              cities.find((c) => c.stateCityMasterId === detail.stateCityMasterId)
                                ?.cityName ?? '';

                            this.openPortfolioDetailsDialog(detail, {
                              regionName,
                              countryName,
                              currencyCode,
                              stateName,
                              cityName,
                            });
                          },
                        });
                    },
                  });
              },
            });
        },
      });
  }

  async openPortfolioDetailsDialog(
    detail: any,
    resolved: {
      regionName: string;
      countryName: string;
      currencyCode: string;
      stateName: string;
      cityName: string;
    },
  ): Promise<ConfirmDialogResult> {
    console.log(this.entityLookupOptions());
    console.log(detail.mappedEntities);
    const entityName =
      this.entityLookupOptions().find((e: any) => e.entityId === detail.mappedEntities[0]?.entityID)
        ?.entityName ?? '—';

    const bankName = this.bankListData().find(
      (b: any) => b.bankMasterId === detail.mappedEntities[0]?.bankMasterID,
    )?.bankName;

    const bankAccNo = this.bankListData().find(
      (b: any) => b.bankMasterId === detail.mappedEntities[0]?.bankMasterID,
    )?.bankAccountNo;

    const avatarText = (detail.portfolioName ?? '')
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return await this.confirmService.open({
      title: detail.portfolioName,
      severity: 'info',
      viewDetails: {
        avatarText,
        avatarColor: 'indigo',
        subtitle: detail.portfolioCode,
        tags: [
          { text: 'Active', color: 'green' },
          { text: detail.taxType ?? '', color: 'amber' },
          { text: resolved.regionName, color: 'sky' },
        ],
        idStrip: [
          { label: 'Portfolio Code', value: detail.portfolioCode },
          { label: 'Tax ID', value: detail.taxId ?? '—' },
          { label: 'Bank', value: detail.bankName ?? '—' },
        ],
        sections: [
          {
            title: 'General',
            icon: 'building',
            iconColor: 'blue',
            fields: [
              { label: 'Portfolio Code', value: detail.portfolioCode ?? '—', mono: true },
              { label: 'Portfolio Name', value: detail.portfolioName ?? '—' },
              { label: 'Display Name', value: detail.portfolioDisplayName || '—' },
              { label: 'Tax ID', value: detail.taxId ?? '—', mono: true },
              {
                label: 'Tax Type',
                value: detail.taxType ?? '—',
                badge: { text: detail.taxType ?? '—', color: 'amber' },
              },
              {
                label: 'Tax %',
                value: `${detail.taxPercentage ?? '—'}%`,
                badge: { text: `${detail.taxPercentage ?? '—'}%`, color: 'violet' },
              },
              { label: 'Mapped Entities', value: entityName },
              { label: 'Bank', value: bankName ?? '—' },
              { label: 'Bank A/c No', value: bankAccNo ?? '—', mono: true },
            ],
          },
          {
            title: 'Address',
            icon: 'location',
            iconColor: 'purple',
            fields: [
              { label: 'Address', value: detail.street ?? '—', fullWidth: true },
              {
                label: 'Region',
                value: resolved.regionName || '—',
                badge: { text: resolved.regionName || '—', color: 'violet' },
              },
              {
                label: 'Base Currency',
                value: resolved.currencyCode || '—',
                badge: { text: resolved.currencyCode || '—', color: 'green' },
              },
              {
                label: 'Country',
                value: resolved.countryName || '—',
                badge: { text: resolved.countryName || '—', color: 'amber' },
              },
              {
                label: 'State',
                value: resolved.stateName || '—',
                badge: { text: resolved.stateName || '—', color: 'rose' },
              },
              {
                label: 'City',
                value: resolved.cityName || '—',
                badge: { text: resolved.cityName || '—', color: 'emerald' },
              },
              { label: 'Zip Code', value: detail.zip ?? '—', mono: true },
            ],
          },
        ],
        showEdit: false,
      },
    });
  }

  editPortfolio(portfolio: any): void {
    this.mode.set('edit');
    this.editingId = portfolio.fundID;
    this.scrollToFormTop();
    this.activeTabIndex = '0';

    this.apiService
      .get(`${API_URLS.PORTFOLIO_LIST_DATA}/${portfolio.fundID}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          const detail = this.normaliseDetailKeys(r.data ?? r);
          const o = { emitEvent: false };

          // Enable everything, then disable cascade-dependents (they unlock after load)
          this.portfolioForm.enable(o);
          this.portfolioForm.get('bankAccNo')!.disable(o);
          this.portfolioForm.get('countryId')!.disable(o);
          this.portfolioForm.get('baseCurrencyId')!.disable(o);
          this.portfolioForm.get('state')!.disable(o);
          this.portfolioForm.get('city')!.disable(o);
          this.cascadeService.resetAll(this.cascadeCtx);

          // Patch all non-cascade fields (code, name, tax, bank, street, zip…)
          this.patchNonCascadeFields(detail);

          // Set region without triggering cascade watchers
          this.portfolioForm.get('regionId')!.setValue(detail.regionId ?? '', o);

          // Let cascade service load country→currency→state→city, then enable each
          this.cascadeService.loadAndPatch(detail, this.cascadeCtx, () => {
            if (detail.countryId) this.portfolioForm.get('countryId')!.enable(o);
            if (detail.baseCurrencyId) this.portfolioForm.get('baseCurrencyId')!.enable(o);
            if (detail.countryStateMasterId) this.portfolioForm.get('state')!.enable(o);
            if (detail.stateCityMasterId) this.portfolioForm.get('city')!.enable(o);
          });
        },
      });
  }

  viewPortfolio(portfolio: any): void {
    this.mode.set('view');
    this.editingId = portfolio.fundID;
    this.scrollToFormTop();

    this.apiService
      .get(`${API_URLS.PORTFOLIO_LIST_DATA}/${portfolio.fundID}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r: any) => {
          const detail = this.normaliseDetailKeys(r.data ?? r);
          const o = { emitEvent: false };

          this.portfolioForm.enable(o);
          this.portfolioForm.get('bankAccNo')!.disable(o);
          this.portfolioForm.get('countryId')!.disable(o);
          this.portfolioForm.get('baseCurrencyId')!.disable(o);
          this.portfolioForm.get('state')!.disable(o);
          this.portfolioForm.get('city')!.disable(o);
          this.cascadeService.resetAll(this.cascadeCtx);

          this.patchNonCascadeFields(detail);
          this.portfolioForm.get('regionId')!.setValue(detail.regionId ?? '', o);

          this.cascadeService.loadAndPatch(detail, this.cascadeCtx, () => {
            this.portfolioForm.disable(o); // lock entire form in view mode
          });
        },
      });
  }

  private patchNonCascadeFields(detail: any): void {
    const o = { emitEvent: false };

    // The detail endpoint returns entities[] with entityID + bankMasterID —
    // extract the first mapping for the single-select fields.
    const entities: any[] = detail.mappedEntities ?? [];
    const firstEntity = entities[0] ?? null;
    const entityId = firstEntity?.entityID ?? firstEntity?.entityId ?? null;
    const bankMasterId = firstEntity?.bankMasterID ?? firstEntity?.bankMasterId ?? null;

    this.portfolioForm.patchValue(
      {
        portfolioCode: detail.portfolioCode ?? '',
        portfolioName: detail.portfolioName ?? '',
        portfolioDisplayName: detail.portfolioDisplayName ?? '',
        taxId: detail.taxId ?? '',
        taxTypeId: detail.taxTypeId ?? '',
        taxPercentage: detail.taxPercentage ?? '',
        mappedEntityIds: entityId,
        bankId: bankMasterId,
        street: detail.street ?? '',
        zip: detail.zip ?? '',
      },
      o,
    );
  }
}
