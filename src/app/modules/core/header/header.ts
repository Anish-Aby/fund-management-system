import { ChangeDetectorRef, Component } from '@angular/core';
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
import { DialogWindowZ } from '../../shared/services/dialog-window';
import { AuthService } from '../services/auth-service';
import { DialogWindowService } from '../services/dialog-window-service';
import { DIALOG_COMPONENT_TITLES } from '../../shared/constants/const';

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
    private dialogWindowService: DialogWindowService,
    private authService: AuthService,
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
          // {
          //   label: 'Expense Management',
          //   icon: 'pi pi-money-bill',
          // },
          {
            label: 'Portfolio Management',
            icon: 'pi pi-briefcase',
            command: () => {
              this.showPortfolioManagement();
            },
          },
          {
            label: 'Bank Management',
            icon: 'pi pi-building-columns',
            command: () => {
              this.showBankManagement();
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

  onUserProfile() {
    console.log('User Profile clicked');
  }

  onUserSettings() {
    console.log('User Settings clicked');
  }

  onLogout() {
    this.authService.logout();
  }

  onNotificationClick(type: string) {
    console.log(`Notification clicked: ${type}`);
    this.notificationCount = Math.max(0, this.notificationCount - 1);
  }

  onViewAllNotifications() {
    console.log('View all notifications');
  }

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

  navigateToDashboard() {
    this.router.navigate(['app/dashboard']);
    this.dialogWindowService.minimizeAll();
  }
}
