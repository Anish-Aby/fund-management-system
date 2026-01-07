import { Component, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { SplitterModule } from 'primeng/splitter';
import { TooltipModule } from 'primeng/tooltip';

// import { InvoiceData, FieldGroup } from '../core/interfaces/invoice.interface';
import { INVOICE_FIELD_CONFIG } from '../../core/config/invoice-fields.config';
import InvoiceDataMock from '../../core/mocks/invoice-review-mock.json';
import FeeTypeDataMock from '../../core/mocks/fee-types-mock.json';
import ServiceDescriptionDataMock from '../../core/mocks/service-description-options-mock.json';
import FundDataMock from '../../core/mocks/funds-mock.json';
import PaidByDataMock from '../../core/mocks/paid-by-mock.json';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../shared/services/utility.service';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { DialogWindowService } from '../../shared/services/dialog-window';
import { InvoiceSplit } from '../invoice-split/invoice-split';
import { DialogHeader } from '../../shared/components/dialog-header/dialog-header';
import { EmailDialog } from '../../shared/components/email-dialog/email-dialog';
import TaxType from '../../core/mocks/tax-type-mock.json';

@Component({
  selector: 'app-invoice-review',
  imports: [
    TabsModule,
    SelectModule,
    MultiSelectModule,
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
    TooltipModule,
  ],
  templateUrl: './invoice-review.html',
  styleUrl: './invoice-review.scss',
})
export class InvoiceReview implements OnInit {
  invoiceData = signal<any[]>(InvoiceDataMock as any[]);
  editMode = signal(false);
  selectedInvoiceId = signal<string | null>(null);
  selectedTabValue = signal<string>(InvoiceDataMock[0]?.basicInformation.invoiceNo || '');
  invoiceToApprove = signal<any | null>(null);
  confirmDialogVisible = signal<boolean>(false);
  reviewConfirmType = signal<string>('');
  feeTypeOptions = signal<any>(FeeTypeDataMock);
  serviceDescriptionOptions = signal<any>(ServiceDescriptionDataMock);
  fundOptions = signal<any>(FundDataMock);
  paidByOptions = signal<any>(PaidByDataMock);
  taxTypeOptions = signal<any>(TaxType);

  constructor(
    private dialogService: DialogService,
    private dialogWindowService: DialogWindowService,
    public utilityService: UtilityService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  invoiceOptions = computed(() =>
    this.invoiceData().map((invoice) => ({
      label: invoice.basicInformation.vendorName,
      value: invoice.basicInformation.invoiceNo,
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

  viewEmail(invoice: any): void {
    this.dialogService.open(EmailDialog, {
      data: {
        title: 'Email Details',
        emailData: {
          from: 'vendor@example.com',
          to: 'finance@company.com',
          subject: `Invoice ${invoice.basicInformation.invoiceNo} - ${invoice.basicInformation.vendorName}`,
          date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          body: `Dear Finance Team,

Please find attached the invoice for services rendered.

Invoice Details:
- Invoice Number: ${invoice.basicInformation.invoiceNo}
- Vendor: ${invoice.basicInformation.vendorName}
- Amount: ${invoice.basicInformation.payableAmount}
- Due Date: ${invoice.basicInformation.invoiceDueDate}

Please process payment at your earliest convenience.

Best regards,
${invoice.basicInformation.vendorName}`,
          attachments: [`Invoice_${invoice.basicInformation.invoiceNo}.pdf`],
        },
      },
      templates: {
        header: DialogHeader,
      },
      draggable: true,
      resizable: true,
      width: '50%',
      modal: false,
      maximizable: true,
      focusOnShow: false,
      position: 'center',
    });
  }

  splitInvoice(invoice: any): void {
    if (!this.dialogWindowService.restoreByComponent('InvoiceSplit')) {
      this.dialogService.open(InvoiceSplit, {
        data: {
          title: 'Invoice Split',
          componentName: 'InvoiceSplit',
          component: InvoiceSplit,
        },
        draggable: true,
        resizable: true,
        modal: false,
        maximizable: true,
        focusOnShow: false,
        position: 'center',
        templates: {
          header: DialogHeader,
        },
      });
    }
  }
}
