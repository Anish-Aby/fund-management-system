import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { VendorList } from '../../vendor/vendor-list/vendor-list';
import { LedgerReport } from '../../report/ledger-report/ledger-report';
import { ExpensesReport } from '../../report/expenses-report/expenses-report';
import { DialogHeader } from '../components/dialog-header/dialog-header';

interface MinimizedDialog {
  title: string;
  componentName: string;
  component: any;
  config: any;
  state?: any;
}

interface StoredDialog {
  title: string;
  componentName: string;
  config: any;
  state?: any;
}

@Injectable({
  providedIn: 'root',
})
export class DialogWindowService {
  private minimizedSubject = new BehaviorSubject<MinimizedDialog[]>([]);
  minimized$: Observable<MinimizedDialog[]> = this.minimizedSubject.asObservable();
  private componentMap: { [key: string]: any } = { VendorList, LedgerReport, ExpensesReport };

  constructor(private dialogService: DialogService) {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const stored = sessionStorage.getItem('minimizedDialogs');
    if (stored) {
      const storedDialogs: StoredDialog[] = JSON.parse(stored);
      const dialogs: MinimizedDialog[] = storedDialogs.map(d => ({
        ...d,
        component: this.componentMap[d.componentName]
      })).filter(d => d.component); // Only keep dialogs with valid components
      this.minimizedSubject.next(dialogs);
    }
  }

  private saveToStorage(dialogs: StoredDialog[]) {
    sessionStorage.setItem('minimizedDialogs', JSON.stringify(dialogs));
  }

  isMinimized(componentName: string): boolean {
    return this.minimizedSubject.value.some((dialog) => dialog.componentName === componentName);
  }

  restoreByComponent(componentName: string): boolean {
    const current = this.minimizedSubject.value;
    const index = current.findIndex((dialog) => dialog.componentName === componentName);
    if (index !== -1) {
      this.restore(index);
      return true;
    }
    return false;
  }

  minimize(title: string, componentName: string, component: any, config: any, ref: any, state?: any) {
    const current = this.minimizedSubject.value;
    const updated = [...current, { title, componentName, component, config, state }];
    this.minimizedSubject.next(updated);
    this.saveToStorage(updated.map(d => ({ title: d.title, componentName: d.componentName, config: d.config, state: d.state })));
    ref.close();
  }

  restore(index: number) {
    const current = this.minimizedSubject.value;
    const dialog = current[index];
    if (dialog) {
      const component = dialog.component || this.componentMap[dialog.componentName];
      if (component) {
        const config = { ...dialog.config };
        config.templates = { ...config.templates, header: DialogHeader };
        if (dialog.state) {
          config.data = { ...config.data, savedState: dialog.state };
        }
        this.dialogService.open(component, config);
      }
      current.splice(index, 1);
      this.minimizedSubject.next([...current]);
      this.saveToStorage(current.map(d => ({ title: d.title, componentName: d.componentName, config: d.config, state: d.state })));
    }
  }
}
