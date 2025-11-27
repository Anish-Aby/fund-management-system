import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../services/theme';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, BadgeModule, AvatarModule, InputTextModule, CommonModule, ButtonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  items: any[] | undefined;

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: 'dashboard',
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
        ],
      },
      {
        label: 'Reports',
        icon: 'pi pi-search',
        items: [],
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
      },
    ];
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
