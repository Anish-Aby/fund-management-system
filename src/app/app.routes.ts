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
      {
        path: 'invoice',
        children: [
          {
            path: 'review',
            loadComponent: () =>
              import('./modules/invoice/review/invoice-review').then((m) => m.InvoiceReview),
          },
          {
            path: 'list',
            loadComponent: () =>
              import('./modules/invoice/list/invoice-list').then((m) => m.InvoiceList),
          },
        ],
      },
      {
        path: 'report',
        children: [
          {
            path: 'ledger-report',
            loadComponent: () =>
              import('./modules/report/ledger-report/ledger-report').then((m) => m.LedgerReport),
          },
          {
            path: 'expenses-report',
            loadComponent: () =>
              import('./modules/report/expenses-report/expenses-report').then(
                (m) => m.ExpensesReport
              ),
          },
        ],
      },
      {
        path: 'vendor',
        children: [
          {
            path: 'list',
            loadComponent: () =>
              import('./modules/vendor/vendor-list/vendor-list').then((m) => m.VendorList),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./modules/not-found/not-found').then((m) => m.NotFound),
  },
];
