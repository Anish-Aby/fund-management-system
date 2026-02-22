// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-audit-trail',
//   imports: [],
//   templateUrl: './audit-trail.html',
//   styleUrl: './audit-trail.scss',
// })
// export class AuditTrail {

// }

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

// ── Types ──────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  date: string;
  time: string;
  user: string;
  role: string;
  operation:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'VIEW'
    | 'LOGIN'
    | 'LOGOUT'
    | 'EXPORT'
    | 'APPROVE'
    | 'REJECT';
  module: string;
  description: string;
  recordId: string;
  ipAddress: string;
  status: 'Success' | 'Failed' | 'Warning';
}

export interface AuditFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  users: string[];
  operations: string[];
  modules: string[];
  ipAddress: string;
  status: string | null;
}

export interface SelectOption {
  label: string;
  value: string;
}

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'a001',
    date: '2026-02-22',
    time: '09:14:32',
    user: 'Sarah Mitchell',
    role: 'Finance Manager',
    operation: 'APPROVE',
    module: 'Invoice',
    description: 'Approved invoice INV-2024-0881 for Acme Capital Management',
    recordId: 'INV-0881',
    ipAddress: '192.168.1.45',
    status: 'Success',
  },
  {
    id: 'a002',
    date: '2026-02-22',
    time: '09:02:11',
    user: 'James Okafor',
    role: 'Administrator',
    operation: 'CREATE',
    module: 'Vendor',
    description: 'Created new vendor: BlackRock Advisory with 3 fund associations',
    recordId: 'VND-0041',
    ipAddress: '10.0.0.12',
    status: 'Success',
  },
  {
    id: 'a003',
    date: '2026-02-22',
    time: '08:55:47',
    user: 'Priya Sharma',
    role: 'Analyst',
    operation: 'EXPORT',
    module: 'Tax Report',
    description: 'Exported tax report for period Jan 2026 – Feb 2026 (Excel)',
    recordId: 'RPT-TAX-6',
    ipAddress: '192.168.1.88',
    status: 'Success',
  },
  {
    id: 'a004',
    date: '2026-02-22',
    time: '08:41:03',
    user: 'Thomas Brennan',
    role: 'Finance Manager',
    operation: 'REJECT',
    module: 'Invoice',
    description: 'Rejected invoice INV-2024-0879 — insufficient supporting documents',
    recordId: 'INV-0879',
    ipAddress: '192.168.1.22',
    status: 'Success',
  },
  {
    id: 'a005',
    date: '2026-02-22',
    time: '08:30:59',
    user: 'Sarah Mitchell',
    role: 'Finance Manager',
    operation: 'LOGIN',
    module: 'Auth',
    description: 'User login successful from Chrome / Windows',
    recordId: 'SES-9812',
    ipAddress: '192.168.1.45',
    status: 'Success',
  },
  {
    id: 'a006',
    date: '2026-02-22',
    time: '08:29:12',
    user: 'Unknown',
    role: '—',
    operation: 'LOGIN',
    module: 'Auth',
    description: 'Failed login attempt for user admin@finlab.com (3rd attempt)',
    recordId: 'SES-9811',
    ipAddress: '85.214.132.117',
    status: 'Failed',
  },
  {
    id: 'a007',
    date: '2026-02-21',
    time: '17:52:04',
    user: 'James Okafor',
    role: 'Administrator',
    operation: 'UPDATE',
    module: 'Entity',
    description: 'Updated base currency for Global Investments Inc. from EUR to USD',
    recordId: 'ENT-0003',
    ipAddress: '10.0.0.12',
    status: 'Success',
  },
  {
    id: 'a008',
    date: '2026-02-21',
    time: '17:33:28',
    user: 'Lena Fischer',
    role: 'Auditor',
    operation: 'VIEW',
    module: 'Reconciliation',
    description: 'Viewed reconciliation records for DBS Bank, account SGD-102384',
    recordId: 'REC-0071',
    ipAddress: '192.168.2.14',
    status: 'Success',
  },
  {
    id: 'a009',
    date: '2026-02-21',
    time: '16:44:55',
    user: 'Priya Sharma',
    role: 'Analyst',
    operation: 'CREATE',
    module: 'Journal Entry',
    description: 'Created journal entry JNL-0215: debit USD 45,000 / credit USD 45,000',
    recordId: 'JNL-0215',
    ipAddress: '192.168.1.88',
    status: 'Success',
  },
  {
    id: 'a010',
    date: '2026-02-21',
    time: '16:12:37',
    user: 'Thomas Brennan',
    role: 'Finance Manager',
    operation: 'UPDATE',
    module: 'Invoice',
    description: 'Updated invoice INV-2024-0877 — corrected tax amount from 5% to 7%',
    recordId: 'INV-0877',
    ipAddress: '192.168.1.22',
    status: 'Warning',
  },
  {
    id: 'a011',
    date: '2026-02-21',
    time: '15:58:01',
    user: 'James Okafor',
    role: 'Administrator',
    operation: 'CREATE',
    module: 'Fund',
    description: 'Registered new fund: Horizon Growth Fund II (FND-009, USD)',
    recordId: 'FND-009',
    ipAddress: '10.0.0.12',
    status: 'Success',
  },
  {
    id: 'a012',
    date: '2026-02-21',
    time: '15:23:48',
    user: 'Lena Fischer',
    role: 'Auditor',
    operation: 'EXPORT',
    module: 'Audit Trail',
    description: 'Exported audit trail for period 01 Feb – 21 Feb 2026 (PDF)',
    recordId: 'AUD-EXP-3',
    ipAddress: '192.168.2.14',
    status: 'Success',
  },
  {
    id: 'a013',
    date: '2026-02-21',
    time: '14:50:22',
    user: 'Carlos Mendez',
    role: 'Analyst',
    operation: 'CREATE',
    module: 'Invoice',
    description: 'Submitted 4 new invoices for review — total gross USD 128,500',
    recordId: 'BATCH-041',
    ipAddress: '192.168.1.67',
    status: 'Success',
  },
  {
    id: 'a014',
    date: '2026-02-21',
    time: '14:02:16',
    user: 'Sarah Mitchell',
    role: 'Finance Manager',
    operation: 'APPROVE',
    module: 'Invoice',
    description: 'Bulk approved 6 invoices from Fidelity Investments (total USD 92K)',
    recordId: 'BATCH-038',
    ipAddress: '192.168.1.45',
    status: 'Success',
  },
  {
    id: 'a015',
    date: '2026-02-21',
    time: '13:38:09',
    user: 'Priya Sharma',
    role: 'Analyst',
    operation: 'UPDATE',
    module: 'Bank',
    description: 'Updated contact details for BNK-003 Deutsche Bank — new email/phone',
    recordId: 'BNK-003',
    ipAddress: '192.168.1.88',
    status: 'Success',
  },
  {
    id: 'a016',
    date: '2026-02-21',
    time: '12:55:44',
    user: 'James Okafor',
    role: 'Administrator',
    operation: 'DELETE',
    module: 'Vendor',
    description: 'Deleted vendor VND-0039 (Inactive): Trident Advisory LLC',
    recordId: 'VND-0039',
    ipAddress: '10.0.0.12',
    status: 'Warning',
  },
  {
    id: 'a017',
    date: '2026-02-21',
    time: '12:11:30',
    user: 'Carlos Mendez',
    role: 'Analyst',
    operation: 'VIEW',
    module: 'Fund Cash Balance',
    description: 'Generated fund cash balance report for 5 portfolios (Q1 2026)',
    recordId: 'RPT-FCB-4',
    ipAddress: '192.168.1.67',
    status: 'Success',
  },
  {
    id: 'a018',
    date: '2026-02-21',
    time: '11:48:57',
    user: 'Thomas Brennan',
    role: 'Finance Manager',
    operation: 'UPDATE',
    module: 'Fund',
    description: 'Associated 2 new vendors (JPMorgan AM, Fidelity) with FND-007',
    recordId: 'FND-007',
    ipAddress: '192.168.1.22',
    status: 'Success',
  },
  {
    id: 'a019',
    date: '2026-02-21',
    time: '11:05:18',
    user: 'Lena Fischer',
    role: 'Auditor',
    operation: 'VIEW',
    module: 'Journal Entry',
    description: 'Reviewed journal entries JNL-0210 through JNL-0214 for compliance',
    recordId: 'JNL-0210',
    ipAddress: '192.168.2.14',
    status: 'Success',
  },
  {
    id: 'a020',
    date: '2026-02-21',
    time: '10:30:02',
    user: 'Unknown',
    role: '—',
    operation: 'LOGIN',
    module: 'Auth',
    description: 'Repeated login failure — account temporarily locked (5 attempts)',
    recordId: 'SES-9801',
    ipAddress: '41.203.75.22',
    status: 'Failed',
  },
  {
    id: 'a021',
    date: '2026-02-20',
    time: '17:45:33',
    user: 'Sarah Mitchell',
    role: 'Finance Manager',
    operation: 'LOGOUT',
    module: 'Auth',
    description: 'User session ended after 8h 15m — normal logout',
    recordId: 'SES-9790',
    ipAddress: '192.168.1.45',
    status: 'Success',
  },
  {
    id: 'a022',
    date: '2026-02-20',
    time: '16:22:10',
    user: 'Carlos Mendez',
    role: 'Analyst',
    operation: 'CREATE',
    module: 'Reconciliation',
    description: 'Initiated reconciliation for HSBC account GBP-581920, 12 records',
    recordId: 'REC-0070',
    ipAddress: '192.168.1.67',
    status: 'Success',
  },
  {
    id: 'a023',
    date: '2026-02-20',
    time: '15:11:44',
    user: 'James Okafor',
    role: 'Administrator',
    operation: 'UPDATE',
    module: 'Role',
    description: 'Modified "Finance Manager" role — granted Invoice Approve permission',
    recordId: 'ROL-0002',
    ipAddress: '10.0.0.12',
    status: 'Success',
  },
  {
    id: 'a024',
    date: '2026-02-20',
    time: '14:37:29',
    user: 'Priya Sharma',
    role: 'Analyst',
    operation: 'EXPORT',
    module: 'Fund Cash Balance',
    description: 'Exported fund cash balance report — 8 portfolios, Excel format',
    recordId: 'RPT-FCB-3',
    ipAddress: '192.168.1.88',
    status: 'Success',
  },
  {
    id: 'a025',
    date: '2026-02-20',
    time: '13:52:06',
    user: 'Thomas Brennan',
    role: 'Finance Manager',
    operation: 'UPDATE',
    module: 'Entity',
    description: 'Updated tax ID for Apex Capital LLC — regulatory change 2026',
    recordId: 'ENT-0007',
    ipAddress: '192.168.1.22',
    status: 'Warning',
  },
];

// ── Component ──────────────────────────────────────────────────────────────

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  templateUrl: './audit-trail.html',
  styleUrl: './audit-trail.scss',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    TableModule,
    TooltipModule,
    TagModule,
  ],
})
export class AuditTrailComponent implements OnInit {
  // ── Data ────────────────────────────────────────────────────────────────

  private allData = signal<AuditLog[]>(MOCK_AUDIT_LOGS);
  auditData = signal<AuditLog[]>(MOCK_AUDIT_LOGS);

  // ── Computed stats ───────────────────────────────────────────────────────

  successCount = computed(() => this.auditData().filter((l) => l.status === 'Success').length);
  failedCount = computed(() => this.auditData().filter((l) => l.status === 'Failed').length);
  warningCount = computed(() => this.auditData().filter((l) => l.status === 'Warning').length);
  uniqueUsers = computed(() => new Set(this.auditData().map((l) => l.user)).size);

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filters.dateFrom) count++;
    if (this.filters.dateTo) count++;
    if (this.filters.users.length) count++;
    if (this.filters.operations.length) count++;
    if (this.filters.modules.length) count++;
    if (this.filters.ipAddress.trim()) count++;
    if (this.filters.status) count++;
    return count;
  });

  // ── Filters ──────────────────────────────────────────────────────────────

  filters: AuditFilters = {
    dateFrom: null,
    dateTo: null,
    users: [],
    operations: [],
    modules: [],
    ipAddress: '',
    status: null,
  };

  // ── Dropdown options ─────────────────────────────────────────────────────

  userOptions: SelectOption[] = [
    { label: 'Sarah Mitchell', value: 'Sarah Mitchell' },
    { label: 'James Okafor', value: 'James Okafor' },
    { label: 'Priya Sharma', value: 'Priya Sharma' },
    { label: 'Thomas Brennan', value: 'Thomas Brennan' },
    { label: 'Lena Fischer', value: 'Lena Fischer' },
    { label: 'Carlos Mendez', value: 'Carlos Mendez' },
  ];

  operationOptions: SelectOption[] = [
    { label: 'CREATE', value: 'CREATE' },
    { label: 'UPDATE', value: 'UPDATE' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'VIEW', value: 'VIEW' },
    { label: 'LOGIN', value: 'LOGIN' },
    { label: 'LOGOUT', value: 'LOGOUT' },
    { label: 'EXPORT', value: 'EXPORT' },
    { label: 'APPROVE', value: 'APPROVE' },
    { label: 'REJECT', value: 'REJECT' },
  ];

  moduleOptions: SelectOption[] = [
    { label: 'Invoice', value: 'Invoice' },
    { label: 'Vendor', value: 'Vendor' },
    { label: 'Fund', value: 'Fund' },
    { label: 'Entity', value: 'Entity' },
    { label: 'Bank', value: 'Bank' },
    { label: 'Tax Report', value: 'Tax Report' },
    { label: 'Fund Cash Balance', value: 'Fund Cash Balance' },
    { label: 'Reconciliation', value: 'Reconciliation' },
    { label: 'Journal Entry', value: 'Journal Entry' },
    { label: 'Role', value: 'Role' },
    { label: 'Audit Trail', value: 'Audit Trail' },
    { label: 'Auth', value: 'Auth' },
  ];

  statusOptions: SelectOption[] = [
    { label: 'All Statuses', value: '' },
    { label: 'Success', value: 'Success' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Warning', value: 'Warning' },
  ];

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {}

  // ── Search / filter ──────────────────────────────────────────────────────

  onSearch(): void {
    let result = [...this.allData()];

    if (this.filters.dateFrom) {
      const from = new Date(this.filters.dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter((l) => new Date(l.date) >= from);
    }
    if (this.filters.dateTo) {
      const to = new Date(this.filters.dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((l) => new Date(l.date) <= to);
    }
    if (this.filters.users.length) {
      result = result.filter((l) => this.filters.users.includes(l.user));
    }
    if (this.filters.operations.length) {
      result = result.filter((l) => this.filters.operations.includes(l.operation));
    }
    if (this.filters.modules.length) {
      result = result.filter((l) => this.filters.modules.includes(l.module));
    }
    if (this.filters.ipAddress.trim()) {
      result = result.filter((l) => l.ipAddress.includes(this.filters.ipAddress.trim()));
    }
    if (this.filters.status) {
      result = result.filter((l) => l.status === this.filters.status);
    }

    this.auditData.set(result);
  }

  resetFilters(): void {
    this.filters = {
      dateFrom: null,
      dateTo: null,
      users: [],
      operations: [],
      modules: [],
      ipAddress: '',
      status: null,
    };
    this.auditData.set(this.allData());
  }

  // ── Display helpers ───────────────────────────────────────────────────────

  getInitials(name: string): string {
    if (name === 'Unknown') return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  // Deterministic color from name string
  getAvatarColor(name: string): string {
    const colors = [
      '#6366f1',
      '#8b5cf6',
      '#ec4899',
      '#f59e0b',
      '#10b981',
      '#3b82f6',
      '#ef4444',
      '#14b8a6',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  getOperationClass(op: string): string {
    const map: Record<string, string> = {
      CREATE: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
      UPDATE: 'bg-amber-50 border border-amber-200 text-amber-700',
      DELETE: 'bg-rose-50 border border-rose-200 text-rose-700',
      VIEW: 'bg-slate-100 border border-slate-200 text-slate-600',
      LOGIN: 'bg-sky-50 border border-sky-200 text-sky-700',
      LOGOUT: 'bg-slate-100 border border-slate-200 text-slate-500',
      EXPORT: 'bg-violet-50 border border-violet-200 text-violet-700',
      APPROVE: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
      REJECT: 'bg-rose-50 border border-rose-200 text-rose-700',
    };
    return map[op] ?? 'bg-slate-100 border border-slate-200 text-slate-600';
  }

  getOperationIcon(op: string): string {
    const map: Record<string, string> = {
      CREATE: 'pi-plus',
      UPDATE: 'pi-pencil',
      DELETE: 'pi-trash',
      VIEW: 'pi-eye',
      LOGIN: 'pi-sign-in',
      LOGOUT: 'pi-sign-out',
      EXPORT: 'pi-upload',
      APPROVE: 'pi-check',
      REJECT: 'pi-times',
    };
    return map[op] ?? 'pi-circle';
  }

  getModuleIcon(module: string): string {
    const map: Record<string, string> = {
      Invoice: 'pi-file-edit',
      Vendor: 'pi-building',
      Fund: 'pi-briefcase',
      Entity: 'pi-sitemap',
      Bank: 'pi-building-columns',
      'Tax Report': 'pi-percentage',
      'Fund Cash Balance': 'pi-wallet',
      Reconciliation: 'pi-arrows-h',
      'Journal Entry': 'pi-book',
      Role: 'pi-shield',
      'Audit Trail': 'pi-shield',
      Auth: 'pi-lock',
    };
    return map[module] ?? 'pi-circle';
  }
}
