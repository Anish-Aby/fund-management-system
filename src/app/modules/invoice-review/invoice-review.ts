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

// import { InvoiceData, FieldGroup } from '../core/interfaces/invoice.interface';
import { INVOICE_FIELD_CONFIG } from '../core/config/invoice-fields.config';
import InvoiceDataMock from '../core/mocks/invoice-review-mock.json';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../shared/services/utility.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

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
  ],
  templateUrl: './invoice-review.html',
  styleUrl: './invoice-review.scss',
})
export class InvoiceReview {
  invoiceData = signal<any[]>(InvoiceDataMock as any[]);
  editMode = signal(false);
  selectedInvoiceId = signal<string | null>(null);
  selectedTabValue = signal<string>(InvoiceDataMock[0]?.invoiceNumber || '');
  pdfSrc = signal<string>('');

  constructor(public utilityService: UtilityService) {}

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

  getGroupColor(groupName: string): string {
    const colorMap: { [key: string]: string } = {
      'Basic Information': 'bg-slate-100',
      'Financial Details': 'bg-slate-100',
      'Service Details': 'bg-slate-100',
      'Payment Information': 'bg-slate-100',
      'VAT Information': 'bg-slate-100',
      'Approval & Comments': 'bg-slate-100',
    };
    return colorMap[groupName] || 'bg-slate-100';
  }
}
