import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-core',
  imports: [RouterOutlet, Header, TooltipModule, ButtonModule],
  templateUrl: './core.html',
  styleUrl: './core.scss',
})
export class Core {
  collapsed = true;
  isHovered = false;

  menuItems = [
    {
      title: 'Portfolio',
      children: [
        {
          label: 'Dashboard',
          icon: 'pi pi-fw pi-chart-line',
          routerLink: '/dashboard',
          children: [],
        },
        {
          label: 'Holdings',
          icon: 'pi pi-fw pi-briefcase',
          routerLink: '/holdings',
          children: [],
        },
      ],
    },
    {
      title: 'Funds',
      children: [
        {
          label: 'Fund List',
          icon: 'pi pi-fw pi-list',
          routerLink: '/funds',
          children: [],
        },
        {
          label: 'Performance',
          icon: 'pi pi-fw pi-chart-bar',
          routerLink: '/performance',
          children: [],
        },
      ],
    },
    {
      title: 'Transactions',
      children: [
        {
          label: 'Buy/Sell',
          icon: 'pi pi-fw pi-shopping-cart',
          routerLink: '/transactions',
          children: [],
        },
        {
          label: 'History',
          icon: 'pi pi-fw pi-history',
          routerLink: '/history',
          children: [],
        },
      ],
    },
    {
      title: 'Reports',
      children: [
        {
          label: 'Analytics',
          icon: 'pi pi-fw pi-chart-pie',
          routerLink: '/analytics',
          children: [],
        },
      ],
    },
  ];

  toggleSidebar() {
    this.collapsed = !this.collapsed;
  }

  onSidebarHover() {
    if (this.collapsed) {
      this.isHovered = true;
      this.collapsed = false;
    }
  }

  onSidebarLeave() {
    if (this.isHovered) {
      this.collapsed = true;
      this.isHovered = false;
    }
  }
}
