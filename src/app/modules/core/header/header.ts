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
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  items: any[] | undefined;
  userMenuItems: MenuItem[] = [];
  notificationItems: MenuItem[] = [];
  notificationCount: number = 3;

  constructor(public themeService: ThemeService, private router: Router) {}

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
            icon: 'pi pi-bolt',
          },
          {
            label: 'Users',
            icon: 'pi pi-users',
          },
          {
            label: 'Vendors',
            icon: 'pi pi-shop',
          },
          {
            label: 'Expenses',
            icon: 'pi pi-money-bill',
          },
          {
            label: 'Portfolio',
            icon: 'pi pi-briefcase',
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
          },
          {
            label: 'Expenses Report',
            icon: 'pi pi-money-bill',
          },
          {
            label: 'Bank Report',
            icon: 'pi pi-building',
          },
          {
            label: 'Tax Report',
            icon: 'pi pi-percentage',
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
}
