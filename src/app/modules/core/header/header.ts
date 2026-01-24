import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ThemeService } from '../services/theme';
import { DialogService } from 'primeng/dynamicdialog';
import { VendorList } from '../../vendor/vendor-list/vendor-list';
import { DialogHeader } from '../../shared/components/dialog-header/dialog-header';
import { DialogWindowService } from '../../shared/services/dialog-window';
import { LedgerReport } from '../../report/ledger-report/ledger-report';
import { ExpensesReport } from '../../report/expenses-report/expenses-report';
import { VendorAdd } from '../../vendor/vendor-add/vendor-add';
import { InvoiceAdd } from '../../invoice/invoice-add/invoice-add';
import { CashBalance } from '../../report/cash-balance/cash-balance';
import { FundCashBalance } from '../../report/fund-cash-balance/fund-cash-balance';
import { EntityAdd } from '../../entity/entity-add/entity-add';
import { RoleAdd } from '../../role/role-add/role-add';
import { UserAdd } from '../../user/user-add/user-add';
import { ForexPricing } from '../../forex-pricing/forex-pricing';
import { TaxReport } from '../../report/tax-report/tax-report';
import { JournalEntry } from '../../journal-entry/journal-entry';
import { Reconciliation } from '../../reconciliation/reconciliation';

@Component({
  selector: 'app-header',
  imports: [
    MenubarModule,
    BadgeModule,
    AvatarModule,
    InputTextModule,
    CommonModule,
    ButtonModule,
    MenuModule,
  ],
  providers: [DialogService],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  items: any[] | undefined;
  userMenuItems: MenuItem[] = [];
  notificationItems: MenuItem[] = [];
  notificationCount: number = 3;

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef,
    private dialogWindowService: DialogWindowService,
  ) {}

  ngOnInit() {
    this.userMenuItems = [
      {
        label: 'User Profile',
        icon: 'pi pi-user',
        command: () => this.onUserProfile(),
      },
      {
        label: 'User Settings',
        icon: 'pi pi-cog',
        command: () => this.onUserSettings(),
      },
      {
        separator: true,
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.onLogout(),
      },
    ];

    this.notificationItems = [
      {
        label: 'New invoice received',
        icon: 'pi pi-file',
        command: () => this.onNotificationClick('invoice'),
      },
      {
        label: 'Reconciliation completed',
        icon: 'pi pi-check-circle',
        command: () => this.onNotificationClick('reconciliation'),
      },
      {
        label: 'System backup scheduled',
        icon: 'pi pi-calendar',
        command: () => this.onNotificationClick('backup'),
      },
      {
        separator: true,
      },
      {
        label: 'View All',
        icon: 'pi pi-list',
        command: () => this.onViewAllNotifications(),
      },
    ];

    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        command: () => {
          this.navigateToDashboard();
        },
      },
      {
        label: 'File',
        icon: 'pi pi-folder',
        items: [
          {
            label: 'Add invoice',
            icon: 'pi pi-file-plus',
            command: () => {
              this.showAddInvoice();
            },
          },
          {
            label: 'Journal Entry',
            icon: 'pi pi-book',
            command: () => {
              this.showJournalEntry();
            },
          },
          {
            label: 'Reconciliation',
            icon: 'pi pi-sync',
            command: () => {
              this.showReconciliation();
            },
          },
          {
            label: 'Import File',
            icon: 'pi pi-file-import',
          },
          {
            label: 'Export File',
            icon: 'pi pi-file-export',
          },
        ],
      },
      {
        label: 'Masters',
        icon: 'pi pi-star',
        items: [
          {
            label: 'Entity Management',
            icon: 'pi pi-building',
            command: () => {
              this.showAddEntity();
            },
          },
          {
            label: 'User Management',
            icon: 'pi pi-users',
            command: () => {
              this.showAddUsers();
            },
          },
          {
            label: 'Vendor Management',
            icon: 'pi pi-shop',
            command: () => {
              this.showAddVendor();
            },
          },
          {
            label: 'Expense Management',
            icon: 'pi pi-money-bill',
          },
          {
            label: 'Portfolio Management',
            icon: 'pi pi-briefcase',
          },
          {
            label: 'Bank Management',
            icon: 'pi pi-building-columns',
            command: () => {
              // this.showAddEntity();
            },
          },
          {
            label: 'Role Management',
            icon: 'pi pi-shield',
            command: () => {
              this.showAddRoles();
            },
          },
        ],
      },
      {
        label: 'Reports',
        icon: 'pi pi-search',
        items: [
          {
            label: 'Ledger Report',
            icon: 'pi pi-book',
            command: () => {
              // this.router.navigate(['app/report/ledger-report']);
              this.showLedgerReport();
            },
          },
          {
            label: 'Expenses Report',
            icon: 'pi pi-money-bill',
            command: () => {
              // this.router.navigate(['app/report/expenses-report']);
              this.showExpensesReport();
            },
          },
          {
            label: 'Cash Balance',
            icon: 'pi pi-wallet',
            command: () => {
              this.showCashBalance();
            },
          },
          {
            label: 'Fund Cash Balance',
            icon: 'pi pi-chart-line',
            command: () => {
              this.showFundCashBalance();
            },
          },
          {
            label: 'Tax Report',
            icon: 'pi pi-percentage',
            command: () => {
              this.showTaxReport();
            },
          },
        ],
      },
      {
        label: 'Tools',
        icon: 'pi pi-wrench',
        items: [
          {
            label: 'Lock Period',
            icon: 'pi pi-lock',
          },
          {
            label: 'Forex Pricing',
            icon: 'pi pi-dollar',
            command: () => {
              this.showForexPricing();
            },
          },

          {
            label: 'Invoice Error',
            icon: 'pi pi-exclamation-triangle',
          },
        ],
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'Backup Schedule',
            icon: 'pi pi-calendar',
          },
          {
            label: 'Audit Trail',
            icon: 'pi pi-history',
          },
        ],
      },
      {
        label: 'Help',
        icon: 'pi pi-question-circle',
      },
    ];
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onUserProfile() {
    console.log('User Profile clicked');
  }

  onUserSettings() {
    console.log('User Settings clicked');
  }

  onLogout() {
    this.router.navigate(['app/login']);
  }

  onNotificationClick(type: string) {
    console.log(`Notification clicked: ${type}`);
    this.notificationCount = Math.max(0, this.notificationCount - 1);
  }

  onViewAllNotifications() {
    console.log('View all notifications');
  }

  showVendor(): void {
    if (!this.dialogWindowService.restoreByComponent('VendorList')) {
      this.dialogService.open(VendorList, {
        data: { title: 'Vendor List', componentName: 'VendorList', component: VendorList },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showLedgerReport(): void {
    if (!this.dialogWindowService.restoreByComponent('LedgerReport')) {
      this.dialogService.open(LedgerReport, {
        data: {
          title: 'Ledger Report',
          componentName: 'LedgerReport',
          component: LedgerReport,
          autoMaximize: true,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showExpensesReport(): void {
    if (!this.dialogWindowService.restoreByComponent('ExpensesReport')) {
      const dialogRef = this.dialogService.open(ExpensesReport, {
        data: {
          title: 'Expenses Report',
          componentName: 'ExpensesReport',
          component: ExpensesReport,
          autoMaximize: true,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showAddVendor(): void {
    if (!this.dialogWindowService.restoreByComponent('VendorAdd')) {
      this.dialogService.open(VendorAdd, {
        data: {
          title: 'Vendor Add',
          componentName: 'VendorAdd',
          component: VendorAdd,
          autoMaximize: true,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showAddInvoice(): void {
    if (!this.dialogWindowService.restoreByComponent('InvoiceAdd')) {
      this.dialogService.open(InvoiceAdd, {
        data: {
          title: 'Invoice Add',
          componentName: 'InvoiceAdd',
          component: InvoiceAdd,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showCashBalance(): void {
    if (!this.dialogWindowService.restoreByComponent('CashBalance')) {
      this.dialogService.open(CashBalance, {
        data: {
          title: 'Cash Balance',
          componentName: 'CashBalance',
          component: CashBalance,
          autoMaximize: true,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showFundCashBalance(): void {
    if (!this.dialogWindowService.restoreByComponent('FundCashBalance')) {
      this.dialogService.open(FundCashBalance, {
        data: {
          title: 'Fund Cash Balance',
          componentName: 'FundCashBalance',
          component: FundCashBalance,
          autoMaximize: true,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showAddEntity(): void {
    if (!this.dialogWindowService.restoreByComponent('EntityAdd')) {
      this.dialogService.open(EntityAdd, {
        data: {
          title: 'Entity Add',
          componentName: 'EntityAdd',
          component: EntityAdd,
          autoMaximize: true,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showAddRoles(): void {
    if (!this.dialogWindowService.restoreByComponent('RoleAdd')) {
      this.dialogService.open(RoleAdd, {
        data: {
          title: 'Role Add',
          componentName: 'RoleAdd',
          component: RoleAdd,
          autoMaximize: true,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showAddUsers(): void {
    if (!this.dialogWindowService.restoreByComponent('UserAdd')) {
      this.dialogService.open(UserAdd, {
        data: {
          title: 'User Add',
          componentName: 'UserAdd',
          component: UserAdd,
          autoMaximize: true,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showForexPricing(): void {
    if (!this.dialogWindowService.restoreByComponent('ForexPricing')) {
      this.dialogService.open(ForexPricing, {
        data: {
          title: 'Forex Pricing',
          componentName: 'ForexPricing',
          component: ForexPricing,
        },
        draggable: true,
        resizable: true,
        width: '80%',
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showTaxReport(): void {
    if (!this.dialogWindowService.restoreByComponent('TaxReport')) {
      this.dialogService.open(TaxReport, {
        data: {
          title: 'Tax Report',
          componentName: 'TaxReport',
          component: TaxReport,
          autoMaximize: true,
        },
        draggable: true,
        resizable: true,
        width: '100%',
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showJournalEntry(): void {
    if (!this.dialogWindowService.restoreByComponent('JournalEntry')) {
      this.dialogService.open(JournalEntry, {
        data: {
          title: 'Journal Entry',
          componentName: 'JournalEntry',
          component: JournalEntry,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  showReconciliation(): void {
    if (!this.dialogWindowService.restoreByComponent('Reconciliation')) {
      this.dialogService.open(Reconciliation, {
        data: {
          title: 'Reconciliation',
          componentName: 'Reconciliation',
          component: Reconciliation,
          autoMaximize: true,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }

  navigateToDashboard() {
    this.router.navigate(['app/dashboard']);
    // this.dialogWindowService.minimizeAll();
  }
}
