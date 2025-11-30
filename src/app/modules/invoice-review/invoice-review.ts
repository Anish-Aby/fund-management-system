import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { SplitterModule } from 'primeng/splitter';

// import { InvoiceData, FieldGroup } from '../core/interfaces/invoice.interface';
import { INVOICE_FIELD_CONFIG } from '../core/config/invoice-fields.config';
import InvoiceDataMock from '../core/mocks/invoice-review-mock.json';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../shared/services/utility.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-invoice-review',
  imports: [
    TabsModule,
    SelectModule,
    DividerModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    DatePickerModule,
    FormsModule,
    CommonModule,
    TagModule,
    NgxExtendedPdfViewerModule,
    DialogModule,
    MessageModule,
    SplitterModule,
  ],
  templateUrl: './invoice-review.html',
  styleUrl: './invoice-review.scss',
})
export class InvoiceReview implements OnInit {
  invoiceData = signal<any[]>(InvoiceDataMock as any[]);
  editMode = signal(false);
  selectedInvoiceId = signal<string | null>(null);
  selectedTabValue = signal<string>(InvoiceDataMock[0]?.invoiceNumber || '');
  invoiceToApprove = signal<any | null>(null);
  confirmDialogVisible = signal<boolean>(false);
  reviewConfirmType = signal<string>('');

  constructor(public utilityService: UtilityService) {}

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  invoiceOptions = computed(() =>
    this.invoiceData().map((invoice) => ({
      label: invoice.invoiceNumber,
      value: invoice.invoiceNumber,
    }))
  );

  fieldGroups = computed(() => this.organizeFieldsByGroup());

  private organizeFieldsByGroup(): any[] {
    const groups = new Map<string, any>();

    INVOICE_FIELD_CONFIG.forEach((field) => {
      if (!groups.has(field.group)) {
        groups.set(field.group, { name: field.group, fields: [] });
      }
      groups.get(field.group)!.fields.push(field);
    });

    return Array.from(groups.values());
  }

  toggleEditMode() {
    this.editMode.update((mode) => !mode);
  }

  getFieldValue(invoice: any, fieldKey: keyof any): any {
    return invoice[fieldKey];
  }

  formatCurrency(value: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(value);
  }

  onInvoiceSelect(invoiceNumber: string) {
    this.selectedInvoiceId.set(invoiceNumber);
    this.selectedTabValue.set(invoiceNumber);
  }

  saveChanges() {
    this.editMode.set(false);
  }

  cancelEdit() {
    this.editMode.set(false);
  }

  showApproveDialog(invoice: any, reviewType: string): void {
    if (reviewType === 'approve') {
      this.reviewConfirmType.set('approve');
    } else {
      this.reviewConfirmType.set('reject');
    }
    this.invoiceToApprove.set(invoice);
    this.confirmDialogVisible.set(true);
  }

  cancelApproveDialog(): void {
    this.confirmDialogVisible.set(false);
    this.invoiceToApprove.set(null);
  }

  approveInvoice(): void {
    this.confirmDialogVisible.set(false);
  }

  rejectInvoice(): void {
    this.confirmDialogVisible.set(false);
  }
}
