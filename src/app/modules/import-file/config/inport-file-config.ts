// ══════════════════════════════════════════════════════════════════
// IMPORT FILE — Configuration
// Single source of truth for all import types.
// Add a new import type by adding a new entry to IMPORT_CONFIGS.
// ══════════════════════════════════════════════════════════════════

export type ColumnType = 'text' | 'date' | 'number' | 'currency' | 'select' | 'badge';

export interface ImportColumn {
  key: string; // matches JSON key in row data
  label: string; // display header
  type: ColumnType;
  required?: boolean;
  width?: string; // tailwind w- class e.g. 'w-36'
  minWidth?: string; // min-w- class
  options?: string[]; // for select type
  prefix?: string; // e.g. '$' for currency display
  placeholder?: string;
  align?: 'left' | 'right' | 'center';
}

export interface ImportTypeConfig {
  key: string; // unique identifier
  label: string; // display name
  icon: string; // pi icon class
  color: string; // tailwind color token e.g. 'emerald'
  description: string;
  acceptedFormats: string[]; // e.g. ['.xlsx', '.csv']
  templateUrl?: string; // download link for blank template
  columns: ImportColumn[];
}

// ── Fee type options (shared) ────────────────────────────────────
const FEE_TYPES = [
  'Admin Fee',
  'Legal Fee',
  'Management Fee',
  'Advisory Fee',
  'Audit Fee',
  'Custody Fee',
  'Tax Fee',
  'Other',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD', 'SGD'];

// ══════════════════════════════════════════════════════════════════
// ALL IMPORT TYPE CONFIGS
// ══════════════════════════════════════════════════════════════════
export const IMPORT_CONFIGS: Record<string, ImportTypeConfig> = {
  // ── New Invoice Import ─────────────────────────────────────────
  new_invoice: {
    key: 'new_invoice',
    label: 'New Invoice Import',
    icon: 'pi-file-plus',
    color: 'blue',
    description: 'Bulk import invoices from a spreadsheet. Each row becomes a new invoice record.',
    acceptedFormats: ['.xlsx', '.xls', '.csv'],
    templateUrl: '/assets/templates/invoice-import-template.xlsx',
    columns: [
      {
        key: 'vendorName',
        label: 'Vendor Name',
        type: 'text',
        required: true,
        minWidth: 'min-w-[140px]',
        placeholder: 'e.g. Blackrock Advisory',
      },
      {
        key: 'invoiceType',
        label: 'Invoice Type',
        type: 'select',
        required: true,
        minWidth: 'min-w-[130px]',
        options: FEE_TYPES,
      },
      {
        key: 'portfolioCcy',
        label: 'Portfolio CCY',
        type: 'select',
        required: true,
        minWidth: 'min-w-[110px]',
        options: CURRENCIES,
      },
      {
        key: 'invoiceNo',
        label: 'Invoice No',
        type: 'text',
        required: true,
        minWidth: 'min-w-[120px]',
        placeholder: 'INV-2024-XXXX',
      },
      {
        key: 'invoiceDate',
        label: 'Invoice Date',
        type: 'date',
        required: true,
        minWidth: 'min-w-[120px]',
      },
      {
        key: 'invoiceDueDate',
        label: 'Due Date',
        type: 'date',
        required: true,
        minWidth: 'min-w-[120px]',
      },
      {
        key: 'feeType',
        label: 'Fee Type',
        type: 'select',
        required: true,
        minWidth: 'min-w-[120px]',
        options: FEE_TYPES,
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        required: false,
        minWidth: 'min-w-[160px]',
        placeholder: 'e.g. Q4 advisory services',
      },
      {
        key: 'netAmount',
        label: 'Net Amount',
        type: 'currency',
        required: true,
        minWidth: 'min-w-[110px]',
        align: 'right',
      },
      {
        key: 'taxAmount',
        label: 'Tax Amount',
        type: 'currency',
        required: false,
        minWidth: 'min-w-[110px]',
        align: 'right',
      },
      {
        key: 'grossAmount',
        label: 'Gross Amount',
        type: 'currency',
        required: true,
        minWidth: 'min-w-[120px]',
        align: 'right',
      },
    ],
  },

  // ── Bank Balance Import ────────────────────────────────────────
  bank_balance: {
    key: 'bank_balance',
    label: 'Bank Balance Import',
    icon: 'pi-building-columns',
    color: 'emerald',
    description:
      'Import end-of-day bank balances. Each row represents one account balance snapshot.',
    acceptedFormats: ['.xlsx', '.xls', '.csv'],
    templateUrl: '/assets/templates/bank-balance-import-template.xlsx',
    columns: [
      {
        key: 'bankName',
        label: 'Bank Name',
        type: 'text',
        required: true,
        minWidth: 'min-w-[140px]',
        placeholder: 'e.g. Barclays PLC',
      },
      {
        key: 'accountNo',
        label: 'Account No',
        type: 'text',
        required: true,
        minWidth: 'min-w-[140px]',
        placeholder: 'e.g. GB29NWBK...',
      },
      {
        key: 'accountName',
        label: 'Account Name',
        type: 'text',
        required: true,
        minWidth: 'min-w-[140px]',
      },
      {
        key: 'currency',
        label: 'Currency',
        type: 'select',
        required: true,
        minWidth: 'min-w-[100px]',
        options: CURRENCIES,
      },
      {
        key: 'openingBalance',
        label: 'Opening Balance',
        type: 'currency',
        required: true,
        minWidth: 'min-w-[130px]',
        align: 'right',
      },
      {
        key: 'closingBalance',
        label: 'Closing Balance',
        type: 'currency',
        required: true,
        minWidth: 'min-w-[130px]',
        align: 'right',
      },
      {
        key: 'valueDate',
        label: 'Value Date',
        type: 'date',
        required: true,
        minWidth: 'min-w-[120px]',
      },
      {
        key: 'fundName',
        label: 'Fund / Portfolio',
        type: 'text',
        required: false,
        minWidth: 'min-w-[140px]',
      },
      {
        key: 'notes',
        label: 'Notes',
        type: 'text',
        required: false,
        minWidth: 'min-w-[160px]',
        placeholder: 'Optional notes',
      },
    ],
  },
};

// Ordered list for the type selector (add new types here)
export const IMPORT_TYPE_LIST = [IMPORT_CONFIGS['new_invoice'], IMPORT_CONFIGS['bank_balance']];
