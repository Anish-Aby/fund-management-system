import { Component, signal, computed, OnInit, ViewChild, HostListener } from '@angular/core';
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
import TaxType from '../../core/mocks/tax-type-mock.json';
import { DialogWindowService } from '../../core/services/dialog-window-service';
import { DIALOG_COMPONENT_TITLES } from '../../shared/constants/const';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { InvoiceTimelineComponent } from '../../invoice-timeline/invoice-timeline';

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
    InvoiceTimelineComponent,
  ],
  templateUrl: './invoice-review.html',
  styleUrl: './invoice-review.scss',
})
export class InvoiceReview implements OnInit {
  @ViewChild(ConfirmDialog) confirmDialog?: ConfirmDialog;

  invoiceData = signal<any[]>(InvoiceDataMock as any[]);
  editMode = signal(false);
  selectedInvoiceId = signal<string | null>(null);
  selectedTabValue = signal<string>(InvoiceDataMock[0]?.basicInformation.invoiceNo || '');
  invoiceToApprove = signal<any | null>(null);
  reviewConfirmType = signal<string>('');
  feeTypeOptions = signal<any>(FeeTypeDataMock);
  serviceDescriptionOptions = signal<any>(ServiceDescriptionDataMock);
  fundOptions = signal<any>(FundDataMock);
  paidByOptions = signal<any>(PaidByDataMock);
  taxTypeOptions = signal<any>(TaxType);
  rightTab = signal<'pdf' | 'activity'>('pdf');
  viewMode = signal<'tabs' | 'queue'>('tabs');
  queueIndex = signal(0);

  queueInvoice = computed(() => this.invoiceData()[this.queueIndex()]);
  queueTotal = computed(() => this.invoiceData().length);
  queuePercent = computed(() => Math.round((this.queueIndex() / this.invoiceData().length) * 100));
  isFirstInQueue = computed(() => this.queueIndex() === 0);
  isLastInQueue = computed(() => this.queueIndex() === this.invoiceData().length - 1);

  constructor(
    private dialogService: DialogService,
    private dialogWindowService: DialogWindowService,
    private confirmDialogService: ConfirmDialogService,
    public utilityService: UtilityService,
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  invoiceOptions = computed(() =>
    this.invoiceData().map((invoice) => ({
      label: invoice.basicInformation.vendorName,
      value: invoice.basicInformation.invoiceNo,
    })),
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

  viewEmail(invoice: any): void {
    const data = {
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
    };
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.OTHERS.EMAIL_DETAILS, data);
  }

  splitInvoice(invoice: any): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_SPLIT);
  }

  async showApproveDialog(invoice: any, reviewType: string): Promise<void> {
    await this.confirmDialogService.open({
      title: 'Approve Invoice',
      message: 'Confirm approval of INV-2024-001',
      severity: 'success',
      confirmLabel: 'Confirm Approval',
      data: { subMessage: 'This invoice will be approved and routed for payment processing.' },
    });
  }

  enterQueue(): void {
    this.queueIndex.set(0);
    this.viewMode.set('queue');
    this.editMode.set(false);
  }

  /** Exit queue mode — syncs tab view to wherever you left off */
  exitQueue(): void {
    this.viewMode.set('tabs');
    const current = this.queueInvoice();
    if (current) {
      this.selectedTabValue.set(current.basicInformation.invoiceNo);
    }
  }

  /** Move to previous invoice in queue */
  prevInvoice(): void {
    if (this.isFirstInQueue()) return;
    this.queueIndex.update((i) => i - 1);
    this.editMode.set(false);
  }

  /** Move to next invoice in queue */
  nextInvoice(): void {
    if (this.isLastInQueue()) return;
    this.queueIndex.update((i) => i + 1);
    this.editMode.set(false);
  }

  /** Jump directly to a specific invoice by index (clicking a segment) */
  jumpToInvoice(index: number): void {
    this.queueIndex.set(index);
    this.editMode.set(false);
  }

  /**
   * Returns the CSS class(es) for a progress bar segment.
   * Used in the queue command bar's track.
   */
  getSegmentClass(index: number): string {
    if (index === this.queueIndex()) {
      return 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.7)] scale-y-[1.5]';
    }
    if (index < this.queueIndex()) {
      return 'bg-white/[0.18]';
    }
    const status = (this.invoiceData()[index]?.invoiceStatus ?? '').toLowerCase();
    if (status === 'approved') return 'bg-emerald-500/50';
    if (status === 'rejected') return 'bg-rose-500/45';
    return 'bg-amber-400/45';
  }

  /**
   * Returns the dot color class for the status indicator in the command bar.
   */
  getStatusDotClass(status: string = ''): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-emerald-400';
      case 'rejected':
        return 'bg-rose-400';
      case 'paid':
        return 'bg-sky-400';
      default:
        return 'bg-amber-400';
    }
  }

  /**
   * Returns the text color class for the status label in the command bar.
   */
  getStatusTextClass(status: string = ''): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'text-emerald-400';
      case 'rejected':
        return 'text-rose-400';
      case 'paid':
        return 'text-sky-400';
      default:
        return 'text-amber-400';
    }
  }

  // ── 4. Add keyboard listener ──────────────────────────────────────
  // (place inside the class body — this is a decorator-based listener)

  @HostListener('document:keydown', ['$event'])
  onQueueKeydown(event: KeyboardEvent): void {
    // Only active in queue mode
    if (this.viewMode() !== 'queue') return;

    // Don't hijack when user is typing in an input
    const tag = (event.target as HTMLElement)?.tagName;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.nextInvoice();
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.prevInvoice();
    }
    if (event.key === 'Escape') {
      this.exitQueue();
    }
  }
}
