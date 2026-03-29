import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { DialogService } from 'primeng/dynamicdialog';

import { ThemeService } from '../services/theme';
import { DialogWindowService } from '../services/dialog-window-service';
import { API_URLS, DIALOG_COMPONENT_TITLES } from '../../shared/constants/const';
import { AuthService } from '../services/auth-service';
import { SearchService } from '../../global-search/service/search-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../shared/services/api.service';

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

  private destroyRef = inject(DestroyRef);

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private dialogWindowService: DialogWindowService,
    private router: Router,
    public themeService: ThemeService,
    public searchService: SearchService,
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
            command: () => {
              this.showImportFile();
            },
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
            label: 'Bank Management',
            icon: 'pi pi-building-columns',
            command: () => {
              this.showBankManagement();
            },
          },
          {
            label: 'Entity Management',
            icon: 'pi pi-building',
            command: () => {
              this.showAddEntity();
            },
          },
          {
            label: 'Portfolio Management',
            icon: 'pi pi-briefcase',
            command: () => {
              this.showPortfolioManagement();
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
            label: 'Role Management',
            icon: 'pi pi-shield',
            command: () => {
              this.showAddRoles();
            },
          },
          {
            label: 'User Management',
            icon: 'pi pi-users',
            command: () => {
              this.showAddUsers();
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
              this.showLedgerReport();
            },
          },
          {
            label: 'Expenses Report',
            icon: 'pi pi-money-bill',
            command: () => {
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
            command: () => {
              this.showAuditTrail();
            },
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

  onUserProfile() {}

  onUserSettings() {}

  onLogout() {
    const refreshToken = this.authService.getRefreshToken;
    if (!refreshToken) {
      return;
    }
    this.apiService
      .post(API_URLS.LOGOUT, {
        refreshToken,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        complete: () => {
          this.authService.logout();
        },
      });
  }

  onNotificationClick(type: string) {
    this.notificationCount = Math.max(0, this.notificationCount - 1);
  }

  onViewAllNotifications() {}

  showLedgerReport(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.REPORTS.LEDGER_REPORT);
  }

  showExpensesReport(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.REPORTS.EXPENSES_REPORT);
  }

  showAddVendor(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.MASTERS.VENDOR_MANAGEMENT);
  }

  showAddInvoice(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.FILE.ADD_INVOICE);
  }

  showCashBalance(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.REPORTS.CASH_BALANCE);
  }

  showFundCashBalance(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.REPORTS.FUND_CASH_BALANCE);
  }

  showAddEntity(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.MASTERS.ENTITY_MANAGEMENT);
  }

  showAddRoles(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.MASTERS.ROLES_MANAGEMENT);
  }

  showAddUsers(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.MASTERS.USER_MANAGEMENT);
  }

  showForexPricing(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.TOOLS.FOREX_PRICING);
  }

  showTaxReport(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.REPORTS.TAX_REPORT);
  }

  showJournalEntry(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.FILE.JOURNAL_ENTRY);
  }

  showReconciliation(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.FILE.RECONCILIATION);
  }

  showPortfolioManagement(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.MASTERS.PORTFOLIO_MANAGEMENT);
  }

  showBankManagement(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.MASTERS.BANK_MANAGEMENT);
  }

  showAuditTrail(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.SETTINGS.AUDIT_TRAIL);
  }

  showImportFile(): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.FILE.IMPORT_FILE);
  }

  navigateToDashboard() {
    this.router.navigate(['app/dashboard']);
    this.dialogWindowService.minimizeAll();
  }
}
