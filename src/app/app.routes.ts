import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/app/login',
    pathMatch: 'full',
  },
  {
    path: 'app/login',
    loadComponent: () => import('./modules/login/login').then((m) => m.Login),
  },
  {
    path: 'app',
    loadComponent: () => import('./modules/core/core').then((m) => m.Core),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./modules/dashboard/dashboard').then((m) => m.Dashboard),
      },
    ],
  },
];
