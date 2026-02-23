// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-invoice-timeline',
//   imports: [],
//   templateUrl: './invoice-timeline.html',
//   styleUrl: './invoice-timeline.scss',
// })
// export class InvoiceTimeline {

// }

import { Component, Input, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TimelineEventType =
  | 'created'
  | 'submitted'
  | 'reviewed'
  | 'approved'
  | 'rejected'
  | 'released'
  | 'paid'
  | 'edited'
  | 'comment'
  | 'split'
  | 'email_viewed'
  | 'document_attached';

export interface FieldChange {
  field: string;
  from: string;
  to: string;
}

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  user: string;
  userInitials: string;
  userRole?: string;
  timestamp: Date;
  title: string;
  description?: string;
  comment?: string;
  changes?: FieldChange[];
  metadata?: Record<string, string>;
}

// ── Per-event visual config ───────────────────────────────────
export interface EventVisual {
  icon: string;
  color: string; // icon + text color
  bg: string; // tinted background
  border: string; // subtle border
  label: string;
  ring: string; // focus ring / connector accent
}

export const EVENT_CONFIG: Record<TimelineEventType, EventVisual> = {
  created: {
    icon: 'pi-file-plus',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.2)',
    label: 'Created',
    ring: '#6366f1',
  },
  submitted: {
    icon: 'pi-send',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
    border: 'rgba(14,165,233,0.22)',
    label: 'Submitted',
    ring: '#0ea5e9',
  },
  reviewed: {
    icon: 'pi-eye',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.08)',
    border: 'rgba(139,92,246,0.22)',
    label: 'Reviewed',
    ring: '#8b5cf6',
  },
  approved: {
    icon: 'pi-check-circle',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.22)',
    label: 'Approved',
    ring: '#10b981',
  },
  rejected: {
    icon: 'pi-times-circle',
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.22)',
    label: 'Rejected',
    ring: '#f43f5e',
  },
  released: {
    icon: 'pi-verified',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.22)',
    label: 'Released',
    ring: '#06b6d4',
  },
  paid: {
    icon: 'pi-wallet',
    color: '#059669',
    bg: 'rgba(5,150,105,0.08)',
    border: 'rgba(5,150,105,0.22)',
    label: 'Paid',
    ring: '#059669',
  },
  edited: {
    icon: 'pi-pencil',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.22)',
    label: 'Edited',
    ring: '#f59e0b',
  },
  comment: {
    icon: 'pi-comment',
    color: '#64748b',
    bg: 'rgba(100,116,139,0.07)',
    border: 'rgba(100,116,139,0.18)',
    label: 'Comment',
    ring: '#94a3b8',
  },
  split: {
    icon: 'pi-clone',
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.22)',
    label: 'Split',
    ring: '#a855f7',
  },
  email_viewed: {
    icon: 'pi-envelope-open',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.07)',
    border: 'rgba(148,163,184,0.18)',
    label: 'Email',
    ring: '#94a3b8',
  },
  document_attached: {
    icon: 'pi-paperclip',
    color: '#0284c7',
    bg: 'rgba(2,132,199,0.08)',
    border: 'rgba(2,132,199,0.22)',
    label: 'Document',
    ring: '#0284c7',
  },
};

// ── Sample data — replace with real API ───────────────────────
function makeSample(invoiceNo: string): TimelineEvent[] {
  const now = new Date();
  const ago = (days: number, hours = 0, mins = 0): Date => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    d.setHours(d.getHours() - hours, d.getMinutes() - mins);
    return d;
  };

  return [
    {
      id: '9',
      type: 'released',
      user: 'James Liu',
      userInitials: 'JL',
      userRole: 'Treasury',
      timestamp: ago(1, 2),
      title: 'Released for payment',
      description: 'Payment instruction sent to clearing bank.',
      metadata: { Bank: 'Barclays PLC', Reference: 'PAY-2024-0891', Amount: 'USD 42,500.00' },
    },
    {
      id: '8',
      type: 'approved',
      user: 'Sarah Okonkwo',
      userInitials: 'SO',
      userRole: 'CFO',
      timestamp: ago(2, 4),
      title: 'Invoice approved',
      description: 'Signed off at L2 authority level.',
      metadata: { 'Auth level': 'L2 — CFO', 'Approved amount': 'USD 42,500.00' },
    },
    {
      id: '7',
      type: 'comment',
      user: 'Sarah Okonkwo',
      userInitials: 'SO',
      userRole: 'CFO',
      timestamp: ago(3, 1),
      title: 'Comment added',
      comment:
        'Approved in principle — confirming fund balance covers this before releasing. Checked with treasury and we are good.',
    },
    {
      id: '6',
      type: 'reviewed',
      user: 'Arjun Mehta',
      userInitials: 'AM',
      userRole: 'Reviewer',
      timestamp: ago(5),
      title: 'Marked as reviewed',
      description: 'All details verified against vendor master. Forwarded to CFO.',
      metadata: { 'Tax verified': 'Yes', 'Vendor status': 'Active' },
    },
    {
      id: '5',
      type: 'comment',
      user: 'Arjun Mehta',
      userInitials: 'AM',
      userRole: 'Reviewer',
      timestamp: ago(6, 3),
      title: 'Comment added',
      comment:
        'Vendor bank details need to be verified against the master record before this is approved. Please confirm with the vendor management team.',
    },
    {
      id: '4',
      type: 'edited',
      user: 'Priya Nair',
      userInitials: 'PN',
      userRole: 'AP Clerk',
      timestamp: ago(8, 2),
      title: 'Invoice details edited',
      changes: [
        { field: 'Fee Type', from: 'Management Fee', to: 'Advisory Fee' },
        { field: 'Paid From', from: 'Fund A', to: 'Fund B' },
        { field: 'Description', from: '', to: 'Q4 advisory services' },
      ],
    },
    {
      id: '3',
      type: 'submitted',
      user: 'Priya Nair',
      userInitials: 'PN',
      userRole: 'AP Clerk',
      timestamp: ago(9, 5),
      title: 'Submitted for review',
      description: 'Forwarded to the review queue after initial check.',
    },
    {
      id: '2',
      type: 'document_attached',
      user: 'Priya Nair',
      userInitials: 'PN',
      userRole: 'AP Clerk',
      timestamp: ago(9, 6),
      title: 'Supporting document attached',
      metadata: { File: 'vendor-agreement-2024.pdf', Size: '284 KB' },
    },
    {
      id: '1',
      type: 'created',
      user: 'System Import',
      userInitials: 'SI',
      userRole: 'System',
      timestamp: ago(10),
      title: 'Invoice created',
      description: `Invoice ${invoiceNo} ingested via email forwarding pipeline.`,
      metadata: { Source: 'Email ingestion', 'Raw ref': invoiceNo },
    },
  ];
}

type FilterKey = 'all' | 'approvals' | 'edits' | 'comments';

@Component({
  selector: 'app-invoice-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-timeline.html',
  styleUrl: './invoice-timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceTimelineComponent implements OnInit {
  @Input() invoiceNo = '';
  @Input() events: TimelineEvent[] = [];

  readonly config = EVENT_CONFIG;
  readonly filterOptions: Array<{ key: FilterKey; label: string }> = [
    { key: 'all', label: 'All activity' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'edits', label: 'Edits' },
    { key: 'comments', label: 'Comments' },
  ];

  activeFilter = signal<FilterKey>('all');

  filteredEvents = computed(() => {
    const f = this.activeFilter();
    if (f === 'all') return this.events;
    if (f === 'approvals')
      return this.events.filter((e) =>
        ['reviewed', 'approved', 'released', 'paid', 'rejected'].includes(e.type),
      );
    if (f === 'edits') return this.events.filter((e) => e.type === 'edited');
    if (f === 'comments') return this.events.filter((e) => e.type === 'comment');
    return this.events;
  });

  groupedEvents = computed(() => {
    const groups: Array<{ dateLabel: string; events: TimelineEvent[] }> = [];
    let last = '';
    for (const e of this.filteredEvents()) {
      const label = this.dateLabel(e.timestamp);
      if (label !== last) {
        groups.push({ dateLabel: label, events: [] });
        last = label;
      }
      groups[groups.length - 1].events.push(e);
    }
    return groups;
  });

  ngOnInit() {
    if (!this.events.length) this.events = makeSample(this.invoiceNo);
  }

  cfg(type: TimelineEventType) {
    return this.config[type];
  }

  dateLabel(d: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  timeStr(d: Date): string {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  entries = Object.entries;
  trackByEvent = (_: number, e: TimelineEvent) => e.id;
  trackByGroup = (_: number, g: { dateLabel: string }) => g.dateLabel;
}
