import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { WritableSignal } from '@angular/core';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from './api.service'; // adjust path as needed
import { API_URLS } from '../constants/const'; // adjust path as needed

// ─────────────────────────────────────────────────────────────────────────────
// Public interfaces – import these in every component that uses the cascade
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps logical cascade roles to the actual FormControl names used in a form.
 *
 * Example – entity management:
 *   { region: 'entityRegionId', country: 'countryId', currency: 'baseCurrencyId',
 *     state: 'state', city: 'city' }
 *
 * Example – portfolio management:
 *   { region: 'regionId', country: 'countryId', currency: 'baseCurrencyId',
 *     state: 'state', city: 'city' }
 */
export interface CascadeFieldNames {
  region: string;
  country: string;
  currency: string;
  state: string;
  city: string;
}

/**
 * Maps logical cascade roles to property keys in the **API detail response**.
 * These are used when patching a form for view / edit mode.
 *
 * Example – entity management:
 *   { regionId: 'entityRegionId', countryId: 'countryId', currencyId: 'baseCurrencyId',
 *     stateId: 'countryStateMasterId', cityId: 'stateCityMasterId' }
 */
export interface CascadeDetailKeys {
  regionId: string;
  countryId: string;
  currencyId: string;
  stateId: string;
  cityId: string;
}

export interface CascadeSignals {
  countryOptions: WritableSignal<any[]>;
  currencyOptions: WritableSignal<any[]>;
  stateOptions: WritableSignal<any[]>;
  cityOptions: WritableSignal<any[]>;
}

export interface CascadeContext {
  form: FormGroup;
  signals: CascadeSignals;
  /** FormControl name → cascade role mapping */
  fields: CascadeFieldNames;
  /** API response property → cascade role mapping (used by loadAndPatch) */
  detailKeys: CascadeDetailKeys;
  /** Return true when the form should remain read-only (view mode). */
  isViewMode: () => boolean;
  destroyRef: DestroyRef;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AddressCascadeService {
  constructor(private apiService: ApiService) {}

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * Wires up live cascade watchers:
   *   region ──▶ country
   *   country ──▶ state + currency
   *   state ──▶ city
   *
   * Call **once** from `ngOnInit`, after building the form.
   */
  setupWatchers(ctx: CascadeContext): void {
    // Region → Country
    ctx.form
      .get(ctx.fields.region)!
      .valueChanges.pipe(takeUntilDestroyed(ctx.destroyRef))
      .subscribe((regionId: string | null) => {
        this.resetDownstreamOf('region', ctx);
        if (!regionId) return;

        this.apiService
          .get(`api/Common/countries/${regionId}`)
          .pipe(takeUntilDestroyed(ctx.destroyRef))
          .subscribe({
            next: (r: any) => {
              ctx.signals.countryOptions.set(r.data);
              if (!ctx.isViewMode()) ctx.form.get(ctx.fields.country)!.enable();
            },
          });
      });

    // Country → State + Currency (parallel)
    ctx.form
      .get(ctx.fields.country)!
      .valueChanges.pipe(takeUntilDestroyed(ctx.destroyRef))
      .subscribe((countryId: string | null) => {
        this.resetDownstreamOf('country', ctx);
        if (!countryId) return;

        this.apiService
          .get(`api/Common/states/${countryId}`)
          .pipe(takeUntilDestroyed(ctx.destroyRef))
          .subscribe({
            next: (r: any) => {
              ctx.signals.stateOptions.set(r.data);
              if (!ctx.isViewMode()) ctx.form.get(ctx.fields.state)!.enable();
            },
          });

        this.apiService
          .get(`${API_URLS.CURRENCY_LOOKUP}/${countryId}`)
          .pipe(takeUntilDestroyed(ctx.destroyRef))
          .subscribe({
            next: (r: any) => {
              ctx.signals.currencyOptions.set(r.data);
              if (!ctx.isViewMode()) ctx.form.get(ctx.fields.currency)!.enable();
            },
          });
      });

    // State → City
    ctx.form
      .get(ctx.fields.state)!
      .valueChanges.pipe(takeUntilDestroyed(ctx.destroyRef))
      .subscribe((stateId: string | null) => {
        this.resetDownstreamOf('state', ctx);
        if (!stateId) return;

        this.apiService
          .get(`api/Common/cities/${stateId}`)
          .pipe(takeUntilDestroyed(ctx.destroyRef))
          .subscribe({
            next: (r: any) => {
              ctx.signals.cityOptions.set(r.data);
              if (!ctx.isViewMode()) ctx.form.get(ctx.fields.city)!.enable();
            },
          });
      });
  }

  /**
   * Clears and disables all form controls **downstream** of `level`,
   * and empties the corresponding option signals.
   *
   * 'region'  ─▶ clears country, state, currency, city
   * 'country' ─▶ clears state, currency, city
   * 'state'   ─▶ clears city
   */
  resetDownstreamOf(level: 'region' | 'country' | 'state', ctx: CascadeContext): void {
    const o = { emitEvent: false };

    if (level === 'region') {
      ctx.form.get(ctx.fields.country)!.reset('', o);
      ctx.form.get(ctx.fields.country)!.disable(o);
      ctx.signals.countryOptions.set([]);
    }

    if (level === 'region' || level === 'country') {
      ctx.form.get(ctx.fields.state)!.reset('', o);
      ctx.form.get(ctx.fields.state)!.disable(o);
      ctx.signals.stateOptions.set([]);

      ctx.form.get(ctx.fields.currency)!.reset('', o);
      ctx.form.get(ctx.fields.currency)!.disable(o);
      ctx.signals.currencyOptions.set([]);
    }

    if (level === 'region' || level === 'country' || level === 'state') {
      ctx.form.get(ctx.fields.city)!.reset('', o);
      ctx.form.get(ctx.fields.city)!.disable(o);
      ctx.signals.cityOptions.set([]);
    }
  }

  /**
   * Fetches all cascade lookup data for an existing record and patches the
   * form **silently** (no valueChanges emissions).
   *
   * Intended for edit / view mode: call this after patching the rest of the
   * form, passing the raw API detail payload as `detail`.
   *
   * @param detail      Raw API detail response object
   * @param ctx         Cascade context
   * @param onComplete  Callback invoked once all async fetches have resolved
   */
  loadAndPatch(detail: any, ctx: CascadeContext, onComplete: () => void): void {
    const o = { emitEvent: false };
    const regionId = detail[ctx.detailKeys.regionId];

    if (!regionId) {
      onComplete();
      return;
    }

    // 1. Countries for the region
    this.apiService
      .get(`api/Common/countries/${regionId}`)
      .pipe(takeUntilDestroyed(ctx.destroyRef))
      .subscribe({
        next: (r: any) => {
          ctx.signals.countryOptions.set(r.data);
          const countryId = detail[ctx.detailKeys.countryId];
          ctx.form.get(ctx.fields.country)!.setValue(countryId ?? '', o);
          ctx.form.get(ctx.fields.country)!.enable(o);

          if (!countryId) {
            onComplete();
            return;
          }

          // 2a. Currency for the country
          this.apiService
            .get(`${API_URLS.CURRENCY_LOOKUP}/${countryId}`)
            .pipe(takeUntilDestroyed(ctx.destroyRef))
            .subscribe({
              next: (r2: any) => {
                ctx.signals.currencyOptions.set(r2.data);
                ctx.form
                  .get(ctx.fields.currency)!
                  .setValue(detail[ctx.detailKeys.currencyId] ?? '', o);
                ctx.form.get(ctx.fields.currency)!.enable(o);
              },
            });

          // 2b. States for the country
          this.apiService
            .get(`api/Common/states/${countryId}`)
            .pipe(takeUntilDestroyed(ctx.destroyRef))
            .subscribe({
              next: (r3: any) => {
                ctx.signals.stateOptions.set(r3.data);
                const stateId = detail[ctx.detailKeys.stateId] ?? null;
                ctx.form.get(ctx.fields.state)!.setValue(stateId ?? '', o);
                ctx.form.get(ctx.fields.state)!.enable(o);

                if (!stateId) {
                  ctx.form.get(ctx.fields.city)!.setValue('', o);
                  ctx.form.get(ctx.fields.city)!.enable(o);
                  onComplete();
                  return;
                }

                // 3. Cities for the state
                this.apiService
                  .get(`api/Common/cities/${stateId}`)
                  .pipe(takeUntilDestroyed(ctx.destroyRef))
                  .subscribe({
                    next: (r4: any) => {
                      ctx.signals.cityOptions.set(r4.data);
                      ctx.form
                        .get(ctx.fields.city)!
                        .setValue(detail[ctx.detailKeys.cityId] ?? '', o);
                      ctx.form.get(ctx.fields.city)!.enable(o);
                      onComplete();
                    },
                  });
              },
            });
        },
      });
  }

  /**
   * Resets **all** cascade options and disables the dependent fields
   * (country, currency, state, city). Call this as part of a full form reset.
   */
  resetAll(ctx: CascadeContext): void {
    this.resetDownstreamOf('region', ctx);
  }
}
