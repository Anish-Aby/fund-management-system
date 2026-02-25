// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-import-file',
//   imports: [],
//   templateUrl: './import-file.html',
//   styleUrl: './import-file.scss',
// })
// export class ImportFile {

// }
import {
  Component,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';

import {
  IMPORT_CONFIGS,
  IMPORT_TYPE_LIST,
  ImportTypeConfig,
  ImportColumn,
} from './config/inport-file-config';

// ── Row model ────────────────────────────────────────────────────
export interface ImportRow {
  _id: string;
  _status: 'valid' | 'warning' | 'error' | 'edited';
  _errors: Record<string, string>; // columnKey → error message
  _editing: boolean;
  [key: string]: any;
}

// ── Upload state ─────────────────────────────────────────────────
type UploadPhase = 'idle' | 'dropping' | 'parsing' | 'staged' | 'importing' | 'done';

@Component({
  selector: 'app-import-file',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectModule,
    TagModule,
    TooltipModule,
    DatePickerModule,
    InputTextModule,
    InputNumberModule,
    MessageModule,
    ProgressBarModule,
  ],
  templateUrl: './import-file.html',
  styleUrl: './import-file.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImportFileComponent implements OnInit {
  // ── Config ───────────────────────────────────────────────────
  readonly importTypes = IMPORT_TYPE_LIST;
  readonly today = new Date();
  readonly todayStr = this.today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // ── State signals ────────────────────────────────────────────
  selectedTypeKey = signal<string>('new_invoice');
  phase = signal<UploadPhase>('idle');
  isDragging = signal(false);
  fileName = signal<string>('');
  fileSize = signal<string>('');
  parseProgress = signal(0);
  importProgress = signal(0);
  rows = signal<ImportRow[]>([]);
  selectedRowIds = signal<Set<string>>(new Set());
  showErrors = signal(false);

  // ── Computed ─────────────────────────────────────────────────
  activeConfig = computed<ImportTypeConfig>(() => IMPORT_CONFIGS[this.selectedTypeKey()]);

  columns = computed<ImportColumn[]>(() => this.activeConfig().columns);

  stats = computed(() => {
    const r = this.rows();
    return {
      total: r.length,
      valid: r.filter((x) => x._status === 'valid' || x._status === 'edited').length,
      warnings: r.filter((x) => x._status === 'warning').length,
      errors: r.filter((x) => x._status === 'error').length,
      selected: this.selectedRowIds().size,
    };
  });

  canImport = computed(
    () => this.phase() === 'staged' && this.rows().length > 0 && this.stats().errors === 0,
  );

  allSelected = computed(
    () => this.rows().length > 0 && this.selectedRowIds().size === this.rows().length,
  );

  ngOnInit() {
    /* could restore from sessionStorage */
  }

  // ── Type switch ───────────────────────────────────────────────
  selectType(key: string) {
    if (this.phase() === 'staged' || this.phase() === 'done') {
      if (!confirm('Switching import type will clear the current staging data. Continue?')) return;
    }
    this.selectedTypeKey.set(key);
    this.reset();
  }

  // ── Drag & Drop ───────────────────────────────────────────────
  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  onFileInput(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  triggerFileInput() {
    document.getElementById('file-input')?.click();
  }

  // ── File processing (simulated — replace with SheetJS) ───────
  processFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const accepted = this.activeConfig().acceptedFormats.map((f) => f.replace('.', ''));
    if (!accepted.includes(ext ?? '')) {
      alert(`Invalid file type. Accepted: ${this.activeConfig().acceptedFormats.join(', ')}`);
      return;
    }

    this.fileName.set(file.name);
    this.fileSize.set(this.formatBytes(file.size));
    this.phase.set('parsing');
    this.parseProgress.set(0);

    // Simulate parse progress then load mock data
    const interval = setInterval(() => {
      this.parseProgress.update((p) => {
        if (p >= 100) {
          clearInterval(interval);
          this.loadMockRows();
          return 100;
        }
        return p + 20;
      });
    }, 120);
  }

  // ── Mock row generation (replace with actual SheetJS parse) ──
  private loadMockRows() {
    const config = this.activeConfig();
    const mockRows: ImportRow[] = [];

    const templates: Record<string, any[]> = {
      new_invoice: [
        {
          vendorName: 'Blackrock Advisory',
          invoiceType: 'Advisory Fee',
          portfolioCcy: 'USD',
          invoiceNo: 'INV-2024-1042',
          invoiceDate: '2024-11-15',
          invoiceDueDate: '2024-11-30',
          feeType: 'Advisory Fee',
          description: 'Q4 advisory services',
          netAmount: 38393,
          taxAmount: 4107,
          grossAmount: 42500,
        },
        {
          vendorName: 'Vanguard Group',
          invoiceType: 'Admin Fee',
          portfolioCcy: 'EUR',
          invoiceNo: 'INV-2024-1043',
          invoiceDate: '2024-11-16',
          invoiceDueDate: '2024-12-01',
          feeType: 'Admin Fee',
          description: 'Monthly admin',
          netAmount: 12000,
          taxAmount: 1284,
          grossAmount: 13284,
        },
        {
          vendorName: '',
          invoiceType: 'Legal Fee',
          portfolioCcy: 'GBP',
          invoiceNo: 'INV-2024-1044',
          invoiceDate: '2024-11-17',
          invoiceDueDate: '2024-12-02',
          feeType: 'Legal Fee',
          description: 'Legal review',
          netAmount: 5500,
          taxAmount: 0,
          grossAmount: 5500,
        },
        {
          vendorName: 'Goldman Sachs AM',
          invoiceType: 'Audit Fee',
          portfolioCcy: 'USD',
          invoiceNo: '',
          invoiceDate: '2024-11-18',
          invoiceDueDate: '2024-12-03',
          feeType: 'Audit Fee',
          description: 'Annual audit',
          netAmount: 28000,
          taxAmount: 2996,
          grossAmount: 30996,
        },
        {
          vendorName: 'JP Morgan AM',
          invoiceType: 'Admin Fee',
          portfolioCcy: 'USD',
          invoiceNo: 'INV-2024-1046',
          invoiceDate: '2024-11-19',
          invoiceDueDate: '2024-12-04',
          feeType: 'Admin Fee',
          description: '',
          netAmount: 9200,
          taxAmount: 984,
          grossAmount: 10184,
        },
      ],
      bank_balance: [
        {
          bankName: 'Barclays PLC',
          accountNo: 'GB29NWBK60161331926819',
          accountName: 'Main Operating',
          currency: 'GBP',
          openingBalance: 4200000,
          closingBalance: 4185000,
          valueDate: '2024-11-20',
          fundName: 'Global Equity Fund',
          notes: '',
        },
        {
          bankName: 'Deutsche Bank',
          accountNo: 'DE89370400440532013000',
          accountName: 'EUR Reserve',
          currency: 'EUR',
          openingBalance: 1800000,
          closingBalance: 1820000,
          valueDate: '2024-11-20',
          fundName: 'Bond Fund',
          notes: 'Month-end rebalance',
        },
        {
          bankName: 'JP Morgan',
          accountNo: 'US12345678901234',
          accountName: 'USD Settlement',
          currency: 'USD',
          openingBalance: 0,
          closingBalance: 0,
          valueDate: '2024-11-20',
          fundName: '',
          notes: 'Zero balance — verify',
        },
        {
          bankName: 'BNP Paribas',
          accountNo: 'FR7630006000011234567890189',
          accountName: 'FX Reserve',
          currency: 'EUR',
          openingBalance: 950000,
          closingBalance: 942500,
          valueDate: '2024-11-20',
          fundName: 'Multi-Asset',
          notes: '',
        },
      ],
    };

    const template = templates[config.key] ?? [];
    template.forEach((data, i) => {
      const row: ImportRow = {
        _id: crypto.randomUUID(),
        _status: 'valid',
        _errors: {},
        _editing: false,
        ...data,
      };
      this.validateRow(row);
      mockRows.push(row);
    });

    this.rows.set(mockRows);
    this.phase.set('staged');
  }

  // ── Validation ────────────────────────────────────────────────
  validateRow(row: ImportRow) {
    const errors: Record<string, string> = {};
    for (const col of this.activeConfig().columns) {
      if (col.required && !row[col.key] && row[col.key] !== 0) {
        errors[col.key] = `${col.label} is required`;
      }
    }
    row._errors = errors;
    row._status =
      Object.keys(errors).length > 0 ? 'error' : row._status === 'edited' ? 'edited' : 'valid';
  }

  // ── Row editing ───────────────────────────────────────────────
  startEdit(row: ImportRow) {
    // Exit any other editing row first
    this.rows.update((rows) => rows.map((r) => ({ ...r, _editing: r._id === row._id })));
  }

  saveEdit(row: ImportRow) {
    this.rows.update((rows) =>
      rows.map((r) => {
        if (r._id !== row._id) return r;
        r._editing = false;
        if (r._status !== 'error') r._status = 'edited';
        this.validateRow(r);
        return { ...r };
      }),
    );
  }

  cancelEdit(row: ImportRow) {
    this.rows.update((rows) =>
      rows.map((r) => (r._id === row._id ? { ...r, _editing: false } : r)),
    );
  }

  deleteRow(row: ImportRow) {
    this.rows.update((rows) => rows.filter((r) => r._id !== row._id));
    this.selectedRowIds.update((s) => {
      s.delete(row._id);
      return new Set(s);
    });
  }

  duplicateRow(row: ImportRow) {
    const newRow: ImportRow = {
      ...JSON.parse(JSON.stringify(row)),
      _id: crypto.randomUUID(),
      _editing: true,
    };
    this.rows.update((rows) => {
      const idx = rows.findIndex((r) => r._id === row._id);
      const copy = [...rows];
      copy.splice(idx + 1, 0, newRow);
      return copy;
    });
  }

  addBlankRow() {
    const blank: ImportRow = {
      _id: crypto.randomUUID(),
      _status: 'error',
      _errors: {},
      _editing: true,
    };
    this.activeConfig().columns.forEach((col) => {
      blank[col.key] = '';
    });
    this.validateRow(blank);
    this.rows.update((rows) => [...rows, blank]);
  }

  // ── Bulk selection ────────────────────────────────────────────
  toggleSelectAll() {
    if (this.allSelected()) {
      this.selectedRowIds.set(new Set());
    } else {
      this.selectedRowIds.set(new Set(this.rows().map((r) => r._id)));
    }
  }

  toggleSelectRow(id: string) {
    this.selectedRowIds.update((s) => {
      const copy = new Set(s);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  }

  deleteSelected() {
    const ids = this.selectedRowIds();
    this.rows.update((rows) => rows.filter((r) => !ids.has(r._id)));
    this.selectedRowIds.set(new Set());
  }

  // ── Import ────────────────────────────────────────────────────
  importAll() {
    if (!this.canImport()) return;
    this.phase.set('importing');
    this.importProgress.set(0);
    const interval = setInterval(() => {
      this.importProgress.update((p) => {
        if (p >= 100) {
          clearInterval(interval);
          this.phase.set('done');
          return 100;
        }
        return p + 10;
      });
    }, 150);
  }

  reset() {
    this.phase.set('idle');
    this.rows.set([]);
    this.selectedRowIds.set(new Set());
    this.fileName.set('');
    this.fileSize.set('');
    this.parseProgress.set(0);
    this.importProgress.set(0);
  }

  // ── Helpers ───────────────────────────────────────────────────
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  formatCurrency(val: any): string {
    if (val === '' || val === null || val === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(val));
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'valid':
        return 'pi-check-circle';
      case 'edited':
        return 'pi-pencil';
      case 'warning':
        return 'pi-exclamation-triangle';
      case 'error':
        return 'pi-times-circle';
      default:
        return 'pi-circle';
    }
  }

  clearSelection(): void {
    this.selectedRowIds.set(new Set());
  }

  isSelected(id: string): boolean {
    return this.selectedRowIds().has(id);
  }

  trackRow = (_: number, r: ImportRow) => r._id;
  trackCol = (_: number, c: ImportColumn) => c.key;

  // ══════════════════════════════════════════════════════════════════
  // ADDITIONS needed in import-file.component.ts
  // for Design B (wizard) and the clearSelection() fix
  // ══════════════════════════════════════════════════════════════════

  // ── 1. Add these signals/properties ───────────────────────────────

  /** Wizard step state — used by Design B only. Ignored by A and C. */
  currentWizardStep = signal(1);

  /** Step metadata for the stepper bar */
  readonly wizardSteps = [
    { num: 1, label: 'Select Type', sub: 'Choose import format' },
    { num: 2, label: 'Upload File', sub: 'Drop your spreadsheet' },
    { num: 3, label: 'Review & Edit', sub: 'Validate staging data' },
  ];

  // ── 2. Add these methods ──────────────────────────────────────────

  /** Navigate to a wizard step */
  goWizardStep(step: number): void {
    this.currentWizardStep.set(step);
  }
}
