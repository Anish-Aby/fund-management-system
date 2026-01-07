import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-email-dialog',
  imports: [CommonModule, ButtonModule, DividerModule, TagModule],
  templateUrl: './email-dialog.html',
  styleUrl: './email-dialog.scss'
})
export class EmailDialog {
  emailData = signal<any>(null);

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    // Mock email data - replace with actual data from config
    this.emailData.set(this.config.data?.emailData || {
      from: 'vendor@example.com',
      to: 'finance@company.com',
      subject: 'Invoice #INV-2024-001 - Payment Request',
      date: '2024-01-15 10:30 AM',
      body: `Dear Finance Team,

Please find attached the invoice for services rendered in December 2024.

Invoice Details:
- Invoice Number: INV-2024-001
- Amount: $5,250.00
- Due Date: January 30, 2024

Please process payment at your earliest convenience.

Best regards,
John Smith
Accounts Receivable
ABC Services Ltd.`,
      attachments: ['Invoice_INV-2024-001.pdf']
    });
  }

  closeDialog(): void {
    this.ref.close();
  }

  downloadAttachment(filename: string): void {
    // Implement attachment download logic
    console.log('Downloading:', filename);
  }
}