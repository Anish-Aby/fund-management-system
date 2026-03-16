import { Injectable } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { UserAdd } from '../../user/user-add/user-add';
import { DialogHeader } from '../../shared/components/dialog-header/dialog-header';
import { DIALOG_COMPONENT_TITLES } from '../../shared/constants/const';
import { BehaviorSubject, take } from 'rxjs';
import { RoleAdd } from '../../role/role-add/role-add';
import { EntityAdd } from '../../entity/entity-add/entity-add';
import { VendorAdd } from '../../vendor/vendor-add/vendor-add';
import { InvoiceAdd } from '../../invoice/invoice-add/invoice-add';
import { ForexPricing } from '../../forex-pricing/forex-pricing';
import { TaxReport } from '../../report/tax-report/tax-report';
import { FundCashBalance } from '../../report/fund-cash-balance/fund-cash-balance';
import { CashBalance } from '../../report/cash-balance/cash-balance';
import { ExpensesReport } from '../../report/expenses-report/expenses-report';
import { LedgerReport } from '../../report/ledger-report/ledger-report';
import { Reconciliation } from '../../reconciliation/reconciliation';
import { JournalEntry } from '../../journal-entry/journal-entry';
import { InvoiceReview } from '../../invoice/invoice-review/invoice-review';
import { InvoiceList } from '../../invoice/invoice-list/invoice-list';
import { InvoiceSplit } from '../../invoice/invoice-split/invoice-split';
import { EmailDialog } from '../../shared/components/email-dialog/email-dialog';
import { PortfolioManagement } from '../../portfolio-management/portfolio-management';
import { BankManagementComponent } from '../../bank-management/bank-management';
import { AuditTrailComponent } from '../../audit-trail/audit-trail';
import { ImportFileComponent } from '../../import-file/import-file';

type WindowClosingReason = 'minimize' | 'close';

export interface AppWindow {
  id: string;
  title: string;
  componentName: string;
  component: any;
  ref: DynamicDialogRef;
  minimized: boolean;
  closing?: WindowClosingReason;
  element?: HTMLElement;
  dialogElement?: HTMLElement;
  zIndex?: number;
  active?: boolean;
  snap?: string | null;
  data?: Record<string, any>;
  ready?: Promise<void>;
  resolveReady?: () => void;
}

export interface PersistedWindow {
  id: string;
  componentName: string;
  title: string;
  data?: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class DialogWindowService {
  private windows$ = new BehaviorSubject<AppWindow[]>([]);
  public windowsObservable$ = this.windows$.asObservable();

  private readonly STORAGE_KEY = 'app.windows.state';

  private readonly configData: DynamicDialogConfig = {
    draggable: false,
    resizable: false,
    modal: false,
    maximizable: true,
    focusOnShow: false,
    position: 'center',
    baseZIndex: 0,
    autoZIndex: false,
    templates: { header: DialogHeader },
    data: { autoMaximize: true },
  };

  private zIndexCounter = 1000;
  private persistTimer?: any;
  private restoring = false; // 🔥 VERY IMPORTANT

  constructor(private dialogService: DialogService) {}

  // =============================
  // 🚀 PUBLIC API
  // =============================

  public restoreFromStorage(): void {
    const raw = sessionStorage.getItem(this.STORAGE_KEY);
    if (!raw) return;
    const saved: PersistedWindow[] = JSON.parse(raw);
    if (!saved.length) return;
    this.restoring = true;

    saved.forEach((win, index) => {
      setTimeout(() => this.reopenWindow(win), index * 60);
    });
    setTimeout(() => (this.restoring = false), 400);
  }

  public showComponent(
    componentName: string,
    data?: Record<string, any>,
  ): DynamicDialogRef<UserAdd> | null {
    switch (componentName) {
      case DIALOG_COMPONENT_TITLES.MASTERS.USER_MANAGEMENT:
        return this.openSingleInstanceWindow(UserAdd, componentName, data);
      case DIALOG_COMPONENT_TITLES.MASTERS.ROLES_MANAGEMENT:
        return this.openSingleInstanceWindow(RoleAdd, componentName, data);
      case DIALOG_COMPONENT_TITLES.MASTERS.ENTITY_MANAGEMENT:
        return this.openSingleInstanceWindow(EntityAdd, componentName, data);
      case DIALOG_COMPONENT_TITLES.MASTERS.VENDOR_MANAGEMENT:
        return this.openSingleInstanceWindow(VendorAdd, componentName, data);
      case DIALOG_COMPONENT_TITLES.FILE.ADD_INVOICE:
        return this.openSingleInstanceWindow(InvoiceAdd, componentName, data);
      case DIALOG_COMPONENT_TITLES.FILE.JOURNAL_ENTRY:
        return this.openSingleInstanceWindow(JournalEntry, componentName, data);
      case DIALOG_COMPONENT_TITLES.FILE.RECONCILIATION:
        return this.openSingleInstanceWindow(Reconciliation, componentName, data);
      case DIALOG_COMPONENT_TITLES.REPORTS.LEDGER_REPORT:
        return this.openSingleInstanceWindow(LedgerReport, componentName, data);
      case DIALOG_COMPONENT_TITLES.REPORTS.EXPENSES_REPORT:
        return this.openSingleInstanceWindow(ExpensesReport, componentName, data);
      case DIALOG_COMPONENT_TITLES.REPORTS.CASH_BALANCE:
        return this.openSingleInstanceWindow(CashBalance, componentName, data);
      case DIALOG_COMPONENT_TITLES.REPORTS.FUND_CASH_BALANCE:
        return this.openSingleInstanceWindow(FundCashBalance, componentName, data);
      case DIALOG_COMPONENT_TITLES.REPORTS.TAX_REPORT:
        return this.openSingleInstanceWindow(TaxReport, componentName, data);
      case DIALOG_COMPONENT_TITLES.TOOLS.FOREX_PRICING:
        return this.openSingleInstanceWindow(ForexPricing, componentName, data);
      case DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_REVIEW:
        return this.openSingleInstanceWindow(InvoiceReview, componentName, data);
      case DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_ALL:
        return this.openSingleInstanceWindow(InvoiceList, componentName, data);
      case DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_PENDING:
        return this.openSingleInstanceWindow(InvoiceList, componentName, data);
      case DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_APPROVED:
        return this.openSingleInstanceWindow(InvoiceList, componentName, data);
      case DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_REJECTED:
        return this.openSingleInstanceWindow(InvoiceList, componentName, data);
      case DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_SCHEDULED:
        return this.openSingleInstanceWindow(InvoiceList, componentName, data);
      case DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_PAID:
        return this.openSingleInstanceWindow(InvoiceList, componentName, data);
      case DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_SPLIT:
        return this.openSingleInstanceWindow(InvoiceSplit, componentName, data);
      case DIALOG_COMPONENT_TITLES.OTHERS.EMAIL_DETAILS:
        return this.openSingleInstanceWindow(EmailDialog, componentName, data);
      case DIALOG_COMPONENT_TITLES.MASTERS.PORTFOLIO_MANAGEMENT:
        return this.openSingleInstanceWindow(PortfolioManagement, componentName, data);
      case DIALOG_COMPONENT_TITLES.MASTERS.BANK_MANAGEMENT:
        return this.openSingleInstanceWindow(BankManagementComponent, componentName, data);
      case DIALOG_COMPONENT_TITLES.SETTINGS.AUDIT_TRAIL:
        return this.openSingleInstanceWindow(AuditTrailComponent, componentName, data);
      case DIALOG_COMPONENT_TITLES.FILE.IMPORT_FILE:
        return this.openSingleInstanceWindow(ImportFileComponent, componentName, data);
      default:
        console.error(`No component found for ${componentName}`);
        return null;
    }
  }

  public closeAll(): void {
    this.windows$.value.forEach((win) => win.ref.close());
  }

  private openSingleInstanceWindow<T>(
    component: any,
    componentNameTitle: string,
    extraData?: Record<string, any>,
  ): DynamicDialogRef<T> | null {
    if (!this.restoring && this.ensureSingleInstance(componentNameTitle)) {
      return null;
    }
    const windowId = extraData?.['windowId'] ?? this.generateId();
    let config = this.constructConfigData(componentNameTitle, {
      componentName: componentNameTitle,
      windowId,
      ...extraData,
    });
    if (component === InvoiceList) {
      config = {
        ...config,
        duplicate: true,
      };
    }
    const ref = this.dialogService.open(component, config) as DynamicDialogRef<T> | null;
    if (ref) {
      this.registerWindow({
        id: windowId,
        title: config.data.title,
        componentName: componentNameTitle,
        component,
        ref,
        minimized: false,
        data: config.data,
      });
    }
    return ref;
  }

  public close(id: string): void {
    const win = this.windows$.value.find((w) => w.id === id);
    if (!win) return;
    win.ref.close();
  }

  private async reopenWindow(saved: PersistedWindow): Promise<void> {
    const restoreData = {
      ...(saved.data ?? {}),
      autoMaximize: false,
      windowId: saved.id,
    };

    const ref = this.showComponent(saved.componentName, restoreData);
    if (!ref) return;

    const win = this.windows$.value.find((w) => w.id === saved.id);
    if (!win?.ready) return;

    await win.ready;

    // ✅ ALWAYS start minimized (your requirement)
    this.minimize(win.id);
  }

  // =============================
  // 🚀 WINDOW ACTIONS
  // =============================

  public minimize(id: string): void {
    const win = this.windows$.value.find((w) => w.id === id);
    if (!win || !win.element) return;
    if (win.element) {
      win.element.style.visibility = 'hidden';
      win.element.style.pointerEvents = 'none';
      win.element.style.opacity = '0';
      win.element.style.zIndex = '0';
    }
    if (win.dialogElement) {
      win.dialogElement.style.pointerEvents = 'none';
    }
    this.updateWindow(id, { minimized: true, active: false });
  }

  public restore(id: string): void {
    const win = this.windows$.value.find((w) => w.id === id);
    if (!win) return;
    if (win.element) {
      win.element.style.visibility = 'visible';
      win.element.style.pointerEvents = 'auto';
      win.element.style.opacity = '1';
      win.element.style.zIndex = '';
    }
    if (win.dialogElement) {
      win.dialogElement.style.pointerEvents = 'auto';
    }
    this.updateWindow(id, { minimized: false });
    queueMicrotask(() => {
      this.focusWindow(id);
      this.centerDialog(win.dialogElement!);
    });
  }

  private centerDialog(dialog: HTMLElement) {
    const rect = dialog.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const left = Math.max(16, (viewportWidth - rect.width) / 2);
    const top = Math.max(114, (viewportHeight - rect.height) / 2);
    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;
  }

  public focusWindow(id: string): void {
    const win = this.windows$.value.find((w) => w.id === id);
    if (!win || win.minimized) return;

    const nextZ = (this.zIndexCounter += 2);

    if (win.element) win.element.style.zIndex = String(nextZ);
    if (win.dialogElement) win.dialogElement.style.zIndex = String(nextZ + 1);

    const updated = this.windows$.value.map((w) => ({
      ...w,
      active: w.id === id,
      zIndex: w.id === id ? nextZ : w.zIndex,
    }));

    this.windows$.next(updated);
    this.persistWindowsDebounced();
  }

  public attachElement(
    id: string,
    elements: { mask: HTMLElement | null; dialog: HTMLElement | null },
  ): void {
    const win = this.windows$.value.find((w) => w.id === id);
    this.updateWindow(id, {
      element: elements.mask ?? undefined,
      dialogElement: elements.dialog ?? undefined,
    });
    if (this.restoring && elements.mask) {
      elements.mask.style.visibility = 'hidden';
    }
    elements.dialog?.addEventListener('mousedown', () => this.focusWindow(id));
    if (win?.resolveReady) {
      win.resolveReady();
      win.resolveReady = undefined;
    }
    if (!this.restoring) {
      queueMicrotask(() => this.focusWindow(id));
    }
  }

  public minimizeAll(): void {
    const current = this.windows$.value;

    current.forEach((win) => {
      if (!win.minimized && win.element) {
        win.element.style.visibility = 'hidden';
        win.element.style.pointerEvents = 'none';
        win.element.style.opacity = '0';
        win.element.style.zIndex = '0';
      }

      if (win.dialogElement) {
        win.dialogElement.style.pointerEvents = 'none';
      }
    });

    const updated = current.map((win) => ({
      ...win,
      minimized: true,
      active: false,
    }));

    this.windows$.next(updated);
    this.persistWindowsDebounced(); // 🔥 important
  }

  // =============================
  // 🚀 PERSISTENCE (DEBOUNCED)
  // =============================

  private persistWindowsDebounced(): void {
    clearTimeout(this.persistTimer);
    this.persistTimer = setTimeout(() => this.persistWindows(), 120);
  }

  private persistWindows(): void {
    const serializable: PersistedWindow[] = this.windows$.value.map((w) => ({
      id: w.id,
      componentName: w.componentName,
      title: w.title,
      data: w.data ?? {},
    }));
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializable));
  }

  // =============================
  // 🚀 INTERNALS
  // =============================

  private ensureSingleInstance(componentName: string): boolean {
    const existing = this.windows$.value.find((w) => w.componentName === componentName);
    if (!existing) return false;

    if (existing.minimized) this.restore(existing.id);
    else this.focusWindow(existing.id);
    return true;
  }

  private registerWindow(win: AppWindow): void {
    // 🔥 create readiness promise
    let resolveReady!: () => void;

    win.ready = new Promise<void>((res) => {
      resolveReady = res;
    });

    win.resolveReady = resolveReady;

    const current = this.windows$.value;
    this.windows$.next([...current, win]);
    this.persistWindowsDebounced();

    win.ref.onClose.pipe(take(1)).subscribe(() => {
      this.removeWindow(win.id);
    });
  }

  private updateWindow(id: string, patch: Partial<AppWindow>): void {
    const updated = this.windows$.value.map((w) => (w.id === id ? { ...w, ...patch } : w));
    this.windows$.next(updated);
    this.persistWindowsDebounced();
  }

  private removeWindow(id: string): void {
    const filtered = this.windows$.value.filter((w) => w.id !== id);
    this.windows$.next(filtered);
    this.persistWindowsDebounced();
  }

  private constructConfigData(title: string, data: Record<string, any>): DynamicDialogConfig {
    return {
      ...this.configData,
      data: {
        ...this.configData.data,
        ...data,
        title,
      },
    };
  }

  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
