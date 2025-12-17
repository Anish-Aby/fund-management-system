import { Component, OnInit } from '@angular/core';
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
    private dialogWindowService: DialogWindowService
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
        routerLink: 'dashboard',
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
            label: 'General Ledger',
            icon: 'pi pi-book',
          },
          {
            label: 'Reconciliation',
            icon: 'pi pi-sync',
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
            label: 'Entities',
            icon: 'pi pi-building',
            items: [
              {
                label: 'Add Entities',
                icon: 'pi pi-plus-circle',
              },
              {
                label: 'Edit Entities',
                icon: 'pi pi-pencil',
              },
              {
                label: 'Delete Entities',
                icon: 'pi pi-trash',
              },
            ],
          },
          {
            label: 'Users',
            icon: 'pi pi-users',
            items: [
              {
                label: 'Add Users',
                icon: 'pi pi-plus-circle',
              },
              {
                label: 'Edit Users',
                icon: 'pi pi-pencil',
              },
              {
                label: 'Delete Users',
                icon: 'pi pi-trash',
              },
            ],
          },
          {
            label: 'Vendors',
            icon: 'pi pi-shop',
            items: [
              {
                label: 'Add Vendors',
                icon: 'pi pi-plus-circle',
                command: () => {
                  // this.router.navigate(['app/vendor/list']);
                  this.showAddVendor();
                },
              },
              {
                label: 'Edit Vendors',
                icon: 'pi pi-pencil',
                command: () => {
                  // this.router.navigate(['app/vendor/list']);
                  this.showVendor();
                },
              },
              {
                label: 'Delete Vendors',
                icon: 'pi pi-trash',
                command: () => {
                  // this.router.navigate(['app/vendor/list']);
                  this.showVendor();
                },
              },
            ],
          },
          {
            label: 'Expenses',
            icon: 'pi pi-money-bill',
            items: [
              {
                label: 'Add Expenses',
                icon: 'pi pi-plus-circle',
              },
              {
                label: 'Edit Expenses',
                icon: 'pi pi-pencil',
              },
              {
                label: 'Delete Expenses',
                icon: 'pi pi-trash',
              },
            ],
          },
          {
            label: 'Portfolio',
            icon: 'pi pi-briefcase',
            items: [
              {
                label: 'Add Portfolio',
                icon: 'pi pi-plus-circle',
              },
              {
                label: 'Edit Portfolio',
                icon: 'pi pi-pencil',
              },
              {
                label: 'Delete Portfolio',
                icon: 'pi pi-trash',
              },
            ],
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
          },
          {
            label: 'Fund Cash Report',
            icon: 'pi pi-chart-line',
          },
          {
            label: 'Tax Report',
            icon: 'pi pi-percentage',
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
          },
          {
            label: 'Split Invoice',
            icon: 'pi pi-clone',
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
        data: { title: 'Ledger Report', componentName: 'LedgerReport', component: LedgerReport },
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
      this.dialogService.open(ExpensesReport, {
        data: {
          title: 'Expenses Report',
          componentName: 'ExpensesReport',
          component: ExpensesReport,
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
        },
        draggable: true,
        resizable: true,
        width: '50%',
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
}
