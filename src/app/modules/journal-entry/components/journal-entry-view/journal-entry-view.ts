// journal-entry-view.component.ts
// ─────────────────────────────────────────────────────────────────
// Standalone view component opened by DialogService.open().
// Receives the entry via DynamicDialogConfig.data.
// Emits 'edit' signal via DynamicDialogRef so the parent can act.
// ─────────────────────────────────────────────────────────────────

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { JournalEntryData } from './../../journal-entry'; // re-use the interface

@Component({
  selector: 'app-journal-entry-view',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ButtonModule],
  templateUrl: './journal-entry-view.html',
})
export class JournalEntryView implements OnInit {
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  entry!: JournalEntryData;
  isBalanced = false;

  ngOnInit(): void {
    this.entry = this.config.data?.entry;
    this.isBalanced = (this.entry?.debitAmount || 0) === (this.entry?.creditAmount || 0);
  }

  /** Tell the parent to switch to edit mode for this entry */
  editEntry(): void {
    this.ref.close({ action: 'edit' });
  }

  close(): void {
    this.ref.close();
  }
}
