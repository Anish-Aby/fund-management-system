import { Injectable, inject, signal } from '@angular/core';
import Fuse from 'fuse.js';
import { DIALOG_COMPONENT_TITLES } from '../../shared/constants/const';
import { DialogWindowService } from '../../core/services/dialog-window-service';

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  /** __dialog:ComponentName  |  __action:actionName  |  a real route path */
  path: string;
  section: 'invoices' | 'reports' | 'settings' | 'journal' | 'forex' | 'entities' | 'actions';
  keywords?: string[];
  icon: string;
  badge: string;
  /** optional data forwarded to showComponent() */
  dialogData?: Record<string, any>;
}

// ── Metadata map: componentName → search item shape ───────────
// Add a row here whenever you add a new dialog to DialogWindowService.
// Keys must exactly match the values in DIALOG_COMPONENT_TITLES.
const DIALOG_META: Record<string, Omit<SearchItem, 'id' | 'path'>> = {
  // ── Invoices ──────────────────────────────────────────────────
  [DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_ALL]: {
    title: 'All Invoices',
    subtitle: 'View all invoices',
    section: 'invoices',
    icon: 'pi-file',
    badge: 'Invoice',
    keywords: ['all', 'invoices', 'list'],
  },
  [DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_PENDING]: {
    title: 'Pending Invoices',
    subtitle: 'Awaiting review',
    section: 'invoices',
    icon: 'pi-clock',
    badge: 'Invoice',
    keywords: ['pending', 'waiting', 'review'],
  },
  [DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_APPROVED]: {
    title: 'Approved Invoices',
    subtitle: 'Ready for payment',
    section: 'invoices',
    icon: 'pi-check-circle',
    badge: 'Invoice',
    keywords: ['approved', 'cleared', 'payment'],
  },
  [DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_REJECTED]: {
    title: 'Rejected Invoices',
    subtitle: 'Requires attention',
    section: 'invoices',
    icon: 'pi-times-circle',
    badge: 'Invoice',
    keywords: ['rejected', 'denied', 'disputed'],
  },
  [DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_SCHEDULED]: {
    title: 'Scheduled Invoices',
    subtitle: 'Upcoming payments',
    section: 'invoices',
    icon: 'pi-send',
    badge: 'Invoice',
    keywords: ['scheduled', 'upcoming', 'future'],
  },
  [DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_PAID]: {
    title: 'Paid Invoices',
    subtitle: 'Settled & cleared',
    section: 'invoices',
    icon: 'pi-verified',
    badge: 'Invoice',
    keywords: ['paid', 'settled', 'done'],
  },
  [DIALOG_COMPONENT_TITLES.FILE.ADD_INVOICE]: {
    title: 'Add Invoice',
    subtitle: 'Create a new invoice',
    section: 'invoices',
    icon: 'pi-file-plus',
    badge: 'Invoice',
    keywords: ['add', 'new', 'create', 'invoice'],
  },
  // [DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_REVIEW]: {
  //   title: 'Invoice Review',
  //   subtitle: 'Review & approve invoices',
  //   section: 'invoices',
  //   icon: 'pi-file-check',
  //   badge: 'Invoice',
  //   keywords: ['review', 'approve'],
  // },
  // [DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_SPLIT]: {
  //   title: 'Invoice Split',
  //   subtitle: 'Split invoice by fund',
  //   section: 'invoices',
  //   icon: 'pi-clone',
  //   badge: 'Invoice',
  //   keywords: ['split', 'divide', 'fund'],
  // },

  // ── Reports ───────────────────────────────────────────────────
  [DIALOG_COMPONENT_TITLES.REPORTS.LEDGER_REPORT]: {
    title: 'Ledger Report',
    subtitle: 'Debits and credits',
    section: 'reports',
    icon: 'pi-book',
    badge: 'Report',
    keywords: ['ledger', 'entries', 'debit', 'credit'],
  },
  [DIALOG_COMPONENT_TITLES.REPORTS.CASH_BALANCE]: {
    title: 'Cash Balance Report',
    subtitle: 'Bank account balances',
    section: 'reports',
    icon: 'pi-building-columns',
    badge: 'Report',
    keywords: ['cash', 'balance', 'bank'],
  },
  [DIALOG_COMPONENT_TITLES.REPORTS.FUND_CASH_BALANCE]: {
    title: 'Fund Cash Balance',
    subtitle: 'Balance by fund',
    section: 'reports',
    icon: 'pi-chart-bar',
    badge: 'Report',
    keywords: ['fund', 'cash', 'balance'],
  },
  [DIALOG_COMPONENT_TITLES.REPORTS.TAX_REPORT]: {
    title: 'Tax Report',
    subtitle: 'Tax summary & breakdown',
    section: 'reports',
    icon: 'pi-percentage',
    badge: 'Report',
    keywords: ['tax', 'vat', 'gst'],
  },
  [DIALOG_COMPONENT_TITLES.REPORTS.EXPENSES_REPORT]: {
    title: 'Expenses Report',
    subtitle: 'Expense breakdown',
    section: 'reports',
    icon: 'pi-receipt',
    badge: 'Report',
    keywords: ['expenses', 'spend', 'cost'],
  },

  // ── Journal ───────────────────────────────────────────────────
  [DIALOG_COMPONENT_TITLES.FILE.JOURNAL_ENTRY]: {
    title: 'Journal Entry',
    subtitle: 'Record debits & credits',
    section: 'journal',
    icon: 'pi-book',
    badge: 'Journal',
    keywords: ['journal', 'entry', 'debit', 'credit'],
  },
  [DIALOG_COMPONENT_TITLES.FILE.RECONCILIATION]: {
    title: 'Reconciliation',
    subtitle: 'Reconcile accounts',
    section: 'journal',
    icon: 'pi-arrow-right-arrow-left',
    badge: 'Journal',
    keywords: ['reconcile', 'match', 'accounts'],
  },

  // ── Forex ─────────────────────────────────────────────────────
  [DIALOG_COMPONENT_TITLES.TOOLS.FOREX_PRICING]: {
    title: 'Forex Pricing',
    subtitle: 'Manage FX rates',
    section: 'forex',
    icon: 'pi-arrow-right-arrow-left',
    badge: 'Forex',
    keywords: ['forex', 'fx', 'exchange', 'rate', 'currency'],
  },

  // ── Entities / Masters ────────────────────────────────────────
  [DIALOG_COMPONENT_TITLES.MASTERS.ENTITY_MANAGEMENT]: {
    title: 'Entity Management',
    subtitle: 'Manage legal entities',
    section: 'entities',
    icon: 'pi-building',
    badge: 'Entity',
    keywords: ['entity', 'company', 'legal'],
  },
  [DIALOG_COMPONENT_TITLES.MASTERS.USER_MANAGEMENT]: {
    title: 'User Management',
    subtitle: 'Manage users & roles',
    section: 'entities',
    icon: 'pi-users',
    badge: 'Admin',
    keywords: ['user', 'admin', 'role', 'manage'],
  },
  [DIALOG_COMPONENT_TITLES.MASTERS.ROLES_MANAGEMENT]: {
    title: 'Role Management',
    subtitle: 'Configure permissions',
    section: 'entities',
    icon: 'pi-shield',
    badge: 'Admin',
    keywords: ['role', 'permission', 'access'],
  },
  [DIALOG_COMPONENT_TITLES.MASTERS.VENDOR_MANAGEMENT]: {
    title: 'Vendor Management',
    subtitle: 'Manage vendors & suppliers',
    section: 'entities',
    icon: 'pi-truck',
    badge: 'Entity',
    keywords: ['vendor', 'supplier', 'partner'],
  },
  [DIALOG_COMPONENT_TITLES.MASTERS.PORTFOLIO_MANAGEMENT]: {
    title: 'Portfolio Management',
    subtitle: 'Manage portfolios',
    section: 'entities',
    icon: 'pi-briefcase',
    badge: 'Entity',
    keywords: ['portfolio', 'fund', 'investment'],
  },
  [DIALOG_COMPONENT_TITLES.MASTERS.BANK_MANAGEMENT]: {
    title: 'Bank Management',
    subtitle: 'Manage bank accounts',
    section: 'entities',
    icon: 'pi-building-columns',
    badge: 'Entity',
    keywords: ['bank', 'account', 'payment'],
  },

  // ── Settings ──────────────────────────────────────────────────
  [DIALOG_COMPONENT_TITLES.SETTINGS.AUDIT_TRAIL]: {
    title: 'Audit Trail',
    subtitle: 'View system activity log',
    section: 'settings',
    icon: 'pi-list-check',
    badge: 'Settings',
    keywords: ['audit', 'log', 'history', 'activity'],
  },

  // ── File ──────────────────────────────────────────────────
  [DIALOG_COMPONENT_TITLES.FILE.IMPORT_FILE]: {
    title: 'Import File',
    subtitle: 'Bulk upload invoices or bank balances',
    section: 'invoices',
    icon: 'pi-upload',
    badge: 'Import',
    keywords: [
      'bulk',
      'import',
      'excel',
      'xlsx',
      'csv',
      'upload',
      'file',
      'bank',
      'balance',
      'invoice',
    ],
  },
};

// ── Manual extras — add anything here that isn't a dialog ─────
// Actions, external routes, shortcuts, etc.
const MANUAL_ITEMS: SearchItem[] = [
  // {
  //   id: 'act-theme',
  //   title: 'Toggle Dark Mode',
  //   subtitle: 'Switch light / dark',
  //   path: '__action:toggleTheme',
  //   section: 'actions',
  //   icon: 'pi-moon',
  //   badge: 'Action',
  //   keywords: ['dark', 'light', 'theme', 'mode'],
  // },
  // {
  //   id: 'act-logout',
  //   title: 'Sign Out',
  //   subtitle: 'End your session',
  //   path: '__action:logout',
  //   section: 'actions',
  //   icon: 'pi-sign-out',
  //   badge: 'Action',
  //   keywords: ['logout', 'signout', 'exit'],
  // },
];

// ─────────────────────────────────────────────────────────────────
const RECENTS_KEY = 'finlab_search_recents';
const MAX_RECENTS = 5;

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly dialogWindowService = inject(DialogWindowService);

  isOpen = signal(false);

  // ── Build index once: dialogs + manual extras ────────────────
  readonly index: SearchItem[] = [
    ...Object.entries(DIALOG_META).map(([componentName, meta], i) => ({
      id: `dialog-${i}-${componentName}`,
      path: `__dialog:${componentName}`,
      ...meta,
    })),
    ...MANUAL_ITEMS,
  ];

  // ── Fuse built once ──────────────────────────────────────────
  private fuse = new Fuse(this.index, {
    keys: [
      { name: 'title', weight: 0.5 },
      { name: 'keywords', weight: 0.3 },
      { name: 'subtitle', weight: 0.1 },
      { name: 'badge', weight: 0.1 },
    ],
    threshold: 0.35,
    minMatchCharLength: 1,
    includeScore: true,
  });

  open() {
    this.isOpen.set(true);
  }
  close() {
    this.isOpen.set(false);
  }
  toggle() {
    this.isOpen.update((v) => !v);
  }

  search(query: string): SearchItem[] {
    if (!query.trim()) return [];
    return this.fuse.search(query, { limit: 9 }).map((r) => r.item);
  }

  /** Open a dialog from a search item — called by GlobalSearchComponent */
  openDialog(item: SearchItem): void {
    const componentName = item.path.replace('__dialog:', '');
    this.dialogWindowService.showComponent(componentName, item.dialogData);
  }

  // ── Recents ──────────────────────────────────────────────────
  getRecents(): SearchItem[] {
    try {
      const ids: string[] = JSON.parse(sessionStorage.getItem(RECENTS_KEY) ?? '[]');
      return ids
        .map((id) => this.index.find((item) => item.id === id))
        .filter((item): item is SearchItem => !!item);
    } catch {
      return [];
    }
  }

  pushRecent(item: SearchItem): void {
    try {
      const ids: string[] = JSON.parse(sessionStorage.getItem(RECENTS_KEY) ?? '[]');
      const updated = [item.id, ...ids.filter((id) => id !== item.id)].slice(0, MAX_RECENTS);
      sessionStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  }

  clearRecents(): void {
    sessionStorage.removeItem(RECENTS_KEY);
  }
}
