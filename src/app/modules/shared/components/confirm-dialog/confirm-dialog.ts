import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmService, ConfirmDialogState } from './../../services/confirm.service';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES — import these wherever you call confirmService.open()
// ─────────────────────────────────────────────────────────────────────────────

/** A single key/value row inside an EntityCardConfig */
export interface EntityRow {
  key: string;
  value: string;
  color?: 'red' | 'green' | 'amber' | 'blue';
  pill?: { text: string; color: 'red' | 'green' | 'amber' | 'indigo' | 'blue' | 'slate' };
}

/** Monospace key/value card shown between the dialog header and form fields */
export interface EntityCardConfig {
  label?: string;
  name: string;
  id?: string;
  rows: EntityRow[];
}

/** Colored horizontal alert strip */
export interface AlertConfig {
  type: 'danger' | 'warn' | 'info' | 'success';
  message: string;
  icon?: string;
}

/** Checkbox the user must tick before the confirm button enables */
export interface CheckboxConfirmConfig {
  label: string;
}

/** A single item inside a DetailsConfig */
export interface DetailItem {
  label: string;
  value: string | number;
  /** Render the value larger and bolder */
  highlight?: boolean;
  /** Render value in monospace font */
  mono?: boolean;
  /** Show a copy-to-clipboard button on hover */
  copyable?: boolean;
  /** PrimeNG icon class prefix, e.g. "pi-calendar" */
  icon?: string;
  /** Render value as a colored badge pill instead of plain text */
  badge?: {
    text: string;
    color: 'rose' | 'emerald' | 'amber' | 'sky' | 'violet' | 'indigo' | 'slate';
  };
}

/**
 * Read-only summary section shown between the dialog header and form fields.
 * Supports two layouts:
 *   - 'grid'  — 2-column card grid (default)
 *   - 'list'  — full-width label/value rows
 *
 * @example
 * details: {
 *   title: 'Invoice Summary',
 *   layout: 'list',
 *   items: [
 *     { label: 'Vendor',         value: 'Acme Corp' },
 *     { label: 'Amount',         value: '$12,450.00', highlight: true },
 *     { label: 'Status',         value: 'Pending',    badge: { text: 'Pending', color: 'amber' } },
 *   ],
 * }
 */
export interface DetailsConfig {
  title?: string;
  layout?: 'grid' | 'list';
  items: DetailItem[];
}

/** Recipient token displayed inside the To / CC / BCC fields */
export interface EmailRecipient {
  email: string;
  initials: string;
  color: 'red' | 'blue' | 'green' | 'slate';
}

/**
 * Pass as `config.email` to switch the dialog into email-compose mode.
 * All generic confirm fields (entityCard, fields, confirmText, etc.) are ignored.
 *
 * Add `email?: EmailDialogConfig` to ConfirmDialogConfig in confirm.service.ts.
 */
export interface EmailDialogConfig {
  invoiceRef?: {
    id: string;
    vendor: string;
    amount: string;
    fund?: string;
    due?: string;
  };
  reasons?: string[];
  attachments?: string[];
  defaultTo?: EmailRecipient[];
  defaultCc?: EmailRecipient[];
  defaultSubject?: string;
  defaultBody?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    MultiSelectModule,
    PasswordModule,
    CheckboxModule,
  ],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog implements OnInit, OnDestroy {
  private readonly confirmService = inject(ConfirmService);
  private readonly fb = inject(FormBuilder);
  private sub!: Subscription;

  constructor(private cdr: ChangeDetectorRef) {}

  // ── Generic confirm state ─────────────────────────────────────────────────
  state: ConfirmDialogState | null = null;
  form!: FormGroup;
  loading = false;
  confirmTextInput = '';
  checkboxConfirmed = false;

  // ── Email mode state ──────────────────────────────────────────────────────
  emailTo: EmailRecipient[] = [];
  emailCc: EmailRecipient[] = [];
  emailBcc: EmailRecipient[] = [];
  toInput = '';
  ccInput = '';
  bccInput = '';
  emailSubject = '';
  emailBody = '';
  selectedReason = '';

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.sub = this.confirmService.state$.subscribe((s) => {
      // setTimeout(0) defers to a new macrotask — fully outside any active
      // Angular CD cycle, which prevents NG0100 when the BehaviorSubject
      // emits synchronously inside a click handler that triggered CD.
      // queueMicrotask is not enough because Angular can run another CD
      // pass before the microtask queue is flushed.
      setTimeout(() => {
        this.state = s;
        this.confirmTextInput = '';
        this.checkboxConfirmed = false;
        this.loading = false;
        if (s) {
          this.buildForm(s);
          this.initEmailState(s);
        }
        this.cdr.detectChanges();
      }, 0);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // ── Email helpers ─────────────────────────────────────────────────────────

  get isEmailMode(): boolean {
    return !!(this.state?.config as any)?.email;
  }
  get emailConfig(): EmailDialogConfig | null {
    return (this.state?.config as any)?.email ?? null;
  }

  private initEmailState(state: ConfirmDialogState): void {
    const ec: EmailDialogConfig | undefined = (state.config as any)?.email;
    if (!ec) return;
    this.emailTo = [...(ec.defaultTo ?? [])];
    this.emailCc = [...(ec.defaultCc ?? [])];
    this.emailBcc = [];
    this.toInput = '';
    this.ccInput = '';
    this.bccInput = '';
    this.emailSubject = ec.defaultSubject ?? '';
    this.emailBody = ec.defaultBody ?? '';
    this.selectedReason = ec.reasons?.[0] ?? '';
  }

  private parseEmail(raw: string): EmailRecipient {
    const email = raw.trim();
    const initials = email.split('@')[0].slice(0, 2).toUpperCase();
    const palette: EmailRecipient['color'][] = ['red', 'blue', 'green', 'slate'];
    const color = palette[email.charCodeAt(0) % palette.length];
    return { email, initials, color };
  }

  addRecipient(field: 'to' | 'cc' | 'bcc'): void {
    const raw = field === 'to' ? this.toInput : field === 'cc' ? this.ccInput : this.bccInput;
    if (!raw.trim()) return;
    const r = this.parseEmail(raw);
    if (field === 'to') {
      this.emailTo = [...this.emailTo, r];
      this.toInput = '';
    }
    if (field === 'cc') {
      this.emailCc = [...this.emailCc, r];
      this.ccInput = '';
    }
    if (field === 'bcc') {
      this.emailBcc = [...this.emailBcc, r];
      this.bccInput = '';
    }
  }

  removeRecipient(field: 'to' | 'cc' | 'bcc', email: string): void {
    if (field === 'to') this.emailTo = this.emailTo.filter((r) => r.email !== email);
    if (field === 'cc') this.emailCc = this.emailCc.filter((r) => r.email !== email);
    if (field === 'bcc') this.emailBcc = this.emailBcc.filter((r) => r.email !== email);
  }

  /** Recipient avatar color → Tailwind bg + text classes */
  getAvatarClass(color: string): string {
    switch (color) {
      case 'red':
        return 'bg-rose-100 text-rose-600';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-emerald-100 text-emerald-600';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  }

  canConfirmEmail(): boolean {
    return this.emailTo.length > 0 && !!this.emailSubject.trim() && !!this.selectedReason;
  }

  onConfirmEmail(): void {
    if (!this.canConfirmEmail()) return;
    this.state?.resolve({
      confirmed: true,
      values: {
        to: this.emailTo.map((r) => r.email),
        cc: this.emailCc.map((r) => r.email),
        bcc: this.emailBcc.map((r) => r.email),
        subject: this.emailSubject,
        body: this.emailBody,
        reason: this.selectedReason,
      },
    });
    this.confirmService.clear();
  }

  // ── Generic confirm helpers ───────────────────────────────────────────────

  get entityCard(): EntityCardConfig | undefined {
    return (this.state?.config as any)?.entityCard;
  }
  get details(): DetailsConfig | undefined {
    return (this.state?.config as any)?.details;
  }

  /** Badge pill color → Tailwind classes */
  detailBadgeClass(color?: string): string {
    switch (color) {
      case 'rose':
        return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'emerald':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'amber':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'sky':
        return 'bg-sky-50 border-sky-200 text-sky-700';
      case 'violet':
        return 'bg-violet-50 border-violet-200 text-violet-700';
      case 'indigo':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      default:
        return 'bg-slate-100 border-slate-200 text-slate-600';
    }
  }
  get alerts(): AlertConfig[] | undefined {
    return (this.state?.config as any)?.alerts;
  }
  get confirmCheckbox(): CheckboxConfirmConfig | undefined {
    return (this.state?.config as any)?.confirmCheckbox;
  }

  private buildForm(state: ConfirmDialogState): void {
    if (!state.config.fields?.length) {
      this.form = this.fb.group({});
      return;
    }
    const controls: Record<string, any> = {};
    for (const field of state.config.fields) {
      const v: any[] = [];
      if (field.required) v.push(Validators.required);
      if (field.type === 'email') v.push(Validators.email);
      if (field.validators) v.push(...field.validators);
      controls[field.key] = [field.defaultValue ?? (field.type === 'checkbox' ? false : null), v];
    }
    this.form = this.fb.group(controls);
  }

  // ── Severity → Tailwind ───────────────────────────────────────────────────
  get accentBarClass(): string {
    switch (this.state?.config.severity) {
      case 'danger':
        return 'bg-rose-500';
      case 'warn':
        return 'bg-amber-500';
      case 'info':
        return 'bg-blue-500';
      case 'success':
        return 'bg-emerald-500';
      default:
        return 'bg-neutral-900';
    }
  }

  get badgePillClass(): string {
    switch (this.state?.config.severity) {
      case 'danger':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'warn':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'info':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'success':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  }

  get iconBadgeClass(): string {
    switch (this.state?.config.severity) {
      case 'danger':
        return 'bg-rose-50 border-rose-100 text-rose-500';
      case 'warn':
        return 'bg-amber-50 border-amber-100 text-amber-600';
      case 'info':
        return 'bg-blue-50 border-blue-100 text-blue-600';
      case 'success':
        return 'bg-emerald-50 border-emerald-100 text-emerald-600';
      default:
        return 'bg-neutral-100 border-neutral-200 text-neutral-500';
    }
  }

  get badgeLabel(): string {
    switch (this.state?.config.severity) {
      case 'danger':
        return 'Destructive action';
      case 'warn':
        return 'Warning';
      case 'info':
        return 'Information';
      case 'success':
        return 'Confirmation';
      default:
        return 'Action required';
    }
  }

  get resolvedIcon(): string {
    if (this.state?.config.icon) return this.state.config.icon;
    switch (this.state?.config.severity) {
      case 'danger':
        return 'pi-trash';
      case 'warn':
        return 'pi-exclamation-triangle';
      case 'info':
        return 'pi-info-circle';
      case 'success':
        return 'pi-check-circle';
      default:
        return 'pi-question-circle';
    }
  }

  get resolvedConfirmIcon(): string {
    if (this.state?.config.confirmIcon) return this.state.config.confirmIcon;
    switch (this.state?.config.severity) {
      case 'danger':
        return 'pi pi-trash';
      case 'warn':
        return 'pi pi-exclamation-triangle';
      case 'info':
        return 'pi pi-arrow-right';
      case 'success':
        return 'pi pi-check';
      default:
        return 'pi pi-arrow-right';
    }
  }

  get confirmSeverity(): 'danger' | 'warn' | 'success' | 'contrast' {
    switch (this.state?.config.severity) {
      case 'danger':
        return 'danger';
      case 'warn':
        return 'warn';
      case 'success':
        return 'success';
      default:
        return 'contrast';
    }
  }

  // ── Entity card helpers ───────────────────────────────────────────────────
  entityValueClass(color?: string): string {
    switch (color) {
      case 'red':
        return 'text-rose-600';
      case 'green':
        return 'text-emerald-600';
      case 'amber':
        return 'text-amber-600';
      case 'blue':
        return 'text-blue-600';
      default:
        return 'text-slate-700';
    }
  }

  entityPillClass(color?: string): string {
    switch (color) {
      case 'red':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'green':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'amber':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'blue':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200';
    }
  }

  // ── Alert helpers ─────────────────────────────────────────────────────────
  alertBgClass(type: string): string {
    switch (type) {
      case 'danger':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'warn':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-700';
    }
  }

  alertIconClass(type: string): string {
    switch (type) {
      case 'danger':
        return 'text-rose-500';
      case 'warn':
        return 'text-amber-500';
      case 'info':
        return 'text-blue-500';
      case 'success':
        return 'text-emerald-500';
      default:
        return 'text-neutral-500';
    }
  }

  alertIcon(type: string, custom?: string): string {
    if (custom) return `pi-${custom}`;
    switch (type) {
      case 'danger':
        return 'pi-exclamation-triangle';
      case 'warn':
        return 'pi-exclamation-triangle';
      case 'info':
        return 'pi-info-circle';
      case 'success':
        return 'pi-check-circle';
      default:
        return 'pi-info-circle';
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────
  canConfirm(): boolean {
    if (this.state?.config.confirmText && this.confirmTextInput !== this.state.config.confirmText)
      return false;
    if (this.confirmCheckbox && !this.checkboxConfirmed) return false;
    if (this.state?.config.fields?.length && this.form?.invalid) return false;
    return true;
  }

  isInvalid(key: string): boolean {
    const c = this.form?.get(key);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getError(key: string): string {
    const field = this.state?.config.fields?.find((f) => f.key === key);
    const ctrl = this.form?.get(key);
    if (!ctrl?.errors) return '';
    if (field?.errors) {
      for (const k of Object.keys(ctrl.errors)) {
        if (field.errors[k]) return field.errors[k];
      }
    }
    if (ctrl.errors['required']) return `${field?.label ?? key} is required`;
    if (ctrl.errors['email']) return 'Please enter a valid email address';
    if (ctrl.errors['minlength'])
      return `Minimum ${ctrl.errors['minlength'].requiredLength} characters`;
    if (ctrl.errors['maxlength'])
      return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters`;
    return 'Invalid value';
  }

  copyValue(value: string | number): void {
    navigator.clipboard?.writeText(String(value)).catch(() => {});
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  onConfirm(): void {
    if (this.state?.config.fields?.length) {
      this.form.markAllAsTouched();
      if (this.form.invalid) return;
    }
    this.state?.resolve({ confirmed: true, values: this.form.getRawValue() });
    this.confirmService.clear();
  }

  dismiss(): void {
    this.state?.resolve({ confirmed: false, values: this.form?.getRawValue() ?? {} });
    this.confirmService.clear();
  }

  onBackdropClick(): void {
    if (!this.state?.config.confirmText && !this.confirmCheckbox && !this.isEmailMode)
      this.dismiss();
  }
}
