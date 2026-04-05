// confirm.service.ts
// ─────────────────────────────────────────────────────────────────
// Drives the root <app-confirm-dialog> singleton via a BehaviorSubject.
// No PrimeNG DialogService — component lives in app.component.html
// at root DOM level, so z-index always wins over any DynamicDialog.
//
// ONE-TIME SETUP:
//   app.component.html → <app-confirm-dialog /> as FIRST child
//
// FULL USAGE EXAMPLE:
//   const r = await this.confirm.open({
//     title:    'Approve Payment',
//     severity: 'warn',
//     alerts: [
//       { type: 'warn', message: 'Payment of $12,500 will be sent immediately.' },
//       { type: 'info', title: 'FX Notice', message: 'Amount converted at today\'s rate.' },
//     ],
//     details: {
//       title: 'Invoice Summary',
//       items: [
//         { label: 'Invoice',  value: 'INV-2025-0042', mono: true, copyable: true },
//         { label: 'Vendor',   value: 'JP Chase Bank', icon: 'pi pi-building' },
//         { label: 'Amount',   value: '$12,500.00',    mono: true, highlight: true },
//         { label: 'Status',   value: 'Pending',       badge: { text: 'Pending', color: 'amber' } },
//       ],
//     },
//     fields: [
//       { key: 'notes', label: 'Approval Notes', type: 'textarea', placeholder: 'Optional…' },
//     ],
//   });
//   if (r.confirmed) { ... }
// ─────────────────────────────────────────────────────────────────

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ViewDetailsConfig } from '../components/confirm-dialog/confirm-dialog';

// ── Types ─────────────────────────────────────────────────────────

export type ConfirmSeverity = 'danger' | 'warn' | 'info' | 'success' | 'default';
export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'password'
  | 'checkbox';
export type BadgeColor = 'rose' | 'emerald' | 'amber' | 'sky' | 'violet' | 'indigo' | 'slate';
export type AlertType = 'info' | 'warn' | 'error' | 'success';

/** Inline alert banner shown between the header and details/form */
export interface AlertBanner {
  type: AlertType;
  title?: string;
  message: string;
  /** Override default icon — pi class suffix only, e.g. 'pi-clock' */
  icon?: string;
}

/** A single row in the details card */
export interface DetailItem {
  label: string;
  value: string | number;
  /** pi icon shown left of value, e.g. 'pi pi-calendar' */
  icon?: string;
  /** Coloured badge pill rendered next to the value */
  badge?: { text: string; color: BadgeColor };
  /** Renders value in a monospace font — good for IDs, amounts, codes */
  mono?: boolean;
  /** Makes the value larger + bolder — use for the primary field */
  highlight?: boolean;
  /** Shows a copy-to-clipboard button on hover */
  copyable?: boolean;
}

/** Read-only key-value card rendered between header and form fields */
export interface ConfirmDetails {
  /** Optional heading shown at the top of the card */
  title?: string;
  items: DetailItem[];
  /** 'grid' = 2-col (default) | 'list' = full-width rows */
  layout?: 'grid' | 'list';
}

export interface ConfirmField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  defaultValue?: any;
  rows?: number;
  numberMode?: 'decimal' | 'currency';
  currency?: string;
  options?: any[];
  optionLabel?: string;
  optionValue?: string;
  passwordFeedback?: boolean;
  checkboxLabel?: string;
  validators?: any[];
  errors?: Record<string, string>;
}

export interface ConfirmDialogConfig {
  // ── Header ─────────────────────────────────────────────────────
  title: string;
  description?: string;
  severity?: ConfirmSeverity;
  icon?: string;
  width?: string;

  // ── Buttons ────────────────────────────────────────────────────
  confirmLabel?: string;
  cancelLabel?: string;
  confirmIcon?: string;

  // ── Alert banners ──────────────────────────────────────────────
  /** Shown below the header, above the details card */
  alerts?: AlertBanner[];

  // ── Details card ───────────────────────────────────────────────
  /** Read-only summary shown above form fields */
  details?: ConfirmDetails;

  // ── Form fields ────────────────────────────────────────────────
  fields?: ConfirmField[];

  // ── Type-to-confirm ────────────────────────────────────────────
  confirmText?: string;

  // ── Footer ─────────────────────────────────────────────────────
  footerNote?: string;

  // ── View Details mode ──────────────────────────────────────────
  /** Pass this to switch the dialog into read-only view-details mode */
  viewDetails?: ViewDetailsConfig;
}

export interface ConfirmDialogResult {
  confirmed: boolean;
  values: Record<string, any>;
}

export interface ConfirmDialogState {
  config: ConfirmDialogConfig;
  resolve: (result: ConfirmDialogResult) => void;
}

// ── Service ───────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state$ = new BehaviorSubject<ConfirmDialogState | null>(null);

  clear(): void {
    this.state$.next(null);
  }

  open(config: ConfirmDialogConfig): Promise<ConfirmDialogResult> {
    return new Promise((resolve) => this.state$.next({ config, resolve }));
  }

  delete(itemLabel: string, opts?: Partial<ConfirmDialogConfig>): Promise<ConfirmDialogResult> {
    return this.open({
      title: `Delete ${itemLabel}`,
      description: `This will permanently remove "${itemLabel}". This action cannot be undone.`,
      severity: 'danger',
      confirmLabel: 'Delete',
      confirmIcon: 'pi pi-trash',
      cancelLabel: 'Cancel',
      ...opts,
    });
  }

  warn(
    title: string,
    description?: string,
    opts?: Partial<ConfirmDialogConfig>,
  ): Promise<ConfirmDialogResult> {
    return this.open({ title, description, severity: 'warn', confirmLabel: 'Continue', ...opts });
  }

  ask(
    title: string,
    description?: string,
    opts?: Partial<ConfirmDialogConfig>,
  ): Promise<ConfirmDialogResult> {
    return this.open({
      title,
      description,
      severity: 'default',
      confirmLabel: 'Yes, continue',
      ...opts,
    });
  }

  async prompt(opts: {
    title: string;
    label: string;
    description?: string;
    placeholder?: string;
    required?: boolean;
    severity?: ConfirmSeverity;
    confirmLabel?: string;
  }): Promise<string | null> {
    const r = await this.open({
      title: opts.title,
      description: opts.description,
      severity: opts.severity ?? 'default',
      confirmLabel: opts.confirmLabel ?? 'Confirm',
      fields: [
        {
          key: 'value',
          label: opts.label,
          type: 'text',
          placeholder: opts.placeholder,
          required: opts.required ?? true,
        },
      ],
    });
    return r.confirmed ? (r.values['value'] ?? null) : null;
  }
}
