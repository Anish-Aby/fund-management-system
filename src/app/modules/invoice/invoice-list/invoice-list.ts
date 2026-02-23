import { Component, computed, OnDestroy, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { UtilityService } from '../../shared/services/utility.service';
import InvoiceListData from './../../core/mocks/invoice-list-mock.json';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DialogWindowService } from '../../core/services/dialog-window-service';
import { DIALOG_COMPONENT_TITLES } from '../../shared/constants/const';

interface TableColumn {
  field: string;
  header: string;
  sortable?: boolean;
}

interface SearchField {
  field: string;
  label: string;
  placeholder: string;
  type: 'text' | 'date' | 'multiselect';
  options?: any[];
}

@Component({
  selector: 'app-invoice-list',
  imports: [
    ButtonModule,
    TableModule,
    TagModule,
    CommonModule,
    InputTextModule,
    DatePickerModule,
    MultiSelectModule,
  ],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.scss',
})
export class InvoiceList implements OnDestroy {
  ref: DynamicDialogRef | undefined;
  selectedInvoices: any[] = [];
  invoices: any[] = [];
  filteredTotal: number = 0;
  status = signal<string | null>('Received');
  Math = Math;
  statusOptions = [
    { label: 'Received', value: 'Received' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Scheduled', value: 'Scheduled' },
    { label: 'Paid', value: 'Paid' },
  ];

  columns = computed(() => this.getColumnsForStatus(this.status()));
  searchFields = computed(() => this.getSearchFieldsForStatus(this.status()));

  constructor(
    public utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,
    private dialogWindowService: DialogWindowService,
    private dialogConfigData: DynamicDialogConfig,
  ) {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    this.status.set(this.getStatus(this.dialogConfigData.data?.statusId));
    this.invoices = InvoiceListData.filter((invoice) => invoice.status === this.status());
    this.calculateTotal();
  }

  ngOnDestroy(): void {
    this.ref?.close();
  }

  getStatus(statusId: number) {
    switch (statusId) {
      case 1:
        return 'Received';
      case 2:
        return 'Pending';
      case 3:
        return 'Approved';
      case 4:
        return 'Rejected';
      case 5:
        return 'Scheduled';
      case 6:
        return 'Paid';
      default:
        return 'Received';
    }
  }

  getSeverity(status: string) {
    return this.utilityService.getSeverity(status);
  }

  onTableFilter(event: any) {
    this.calculateTotal(event.filteredValue);
  }

  calculateTotal(filteredData?: any[]) {
    const data = filteredData || this.invoices;
    this.filteredTotal = data.reduce((sum, invoice) => sum + invoice.grossAmount, 0);
  }

  onInvoiceRowSelect(invoice: any) {
    // this.router.navigate(['app/invoice/review']);
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_REVIEW);
  }

  onReviewInvoice() {
    if (this.selectedInvoices.length === 0) {
      return;
    }
    const invoiceIds = this.selectedInvoices.map((invoice) => invoice.invoiceNumber);
    // this.router.navigate(['app/invoice/review']);
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_REVIEW);
  }

  getColumnsForStatus(status: string | null): TableColumn[] {
    switch (status) {
      case 'Received':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'invoiceDate', header: 'Invoice Date', sortable: true },
          { field: 'portfolio', header: 'Portfolio', sortable: true },
          { field: 'aging', header: 'Aging', sortable: true },
          { field: 'expenseType', header: 'Fee Category', sortable: true },
          { field: 'status', header: 'Status', sortable: true },
          { field: 'netAmount', header: 'Net Amount', sortable: true },
          { field: 'taxAmount', header: 'Tax Amount', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
      case 'Pending':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'invoiceDate', header: 'Invoice Date', sortable: true },
          { field: 'portfolio', header: 'Portfolio', sortable: true },
          { field: 'aging', header: 'Aging', sortable: true },
          { field: 'expenseType', header: 'Fee Category', sortable: true },
          { field: 'status', header: 'Status', sortable: true },
          { field: 'netAmount', header: 'Net Amount', sortable: true },
          { field: 'taxAmount', header: 'Tax Amount', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
      case 'Approved':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'invoiceDate', header: 'Invoice Date', sortable: true },
          { field: 'portfolio', header: 'Portfolio', sortable: true },
          { field: 'aging', header: 'Aging', sortable: true },
          { field: 'expenseType', header: 'Fee Category', sortable: true },
          { field: 'status', header: 'Status', sortable: true },
          { field: 'netAmount', header: 'Net Amount', sortable: true },
          { field: 'fxPrice', header: 'FX Price', sortable: true },
          { field: 'taxAmount', header: 'Tax Amount', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
      case 'Rejected':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'invoiceDate', header: 'Invoice Date', sortable: true },
          { field: 'portfolio', header: 'Portfolio', sortable: true },
          { field: 'aging', header: 'Aging', sortable: true },
          { field: 'expenseType', header: 'Fee Category', sortable: true },
          { field: 'status', header: 'Status', sortable: true },
          { field: 'netAmount', header: 'Net Amount', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
          { field: 'rejectedReason', header: 'Rejected Reason', sortable: true },
        ];
      case 'Scheduled':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'dueDate', header: 'Invoice Due Date', sortable: true },
          { field: 'portfolio', header: 'Portfolio', sortable: true },
          { field: 'aging', header: 'Aging', sortable: true },
          { field: 'expenseType', header: 'Fee Category', sortable: true },
          { field: 'status', header: 'Status', sortable: true },
          { field: 'paidBy', header: 'Paid By', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
      case 'Paid':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'portfolio', header: 'Portfolio', sortable: true },
          { field: 'releasedEntity', header: 'Released Entity', sortable: true },
          { field: 'expenseType', header: 'Fee Category', sortable: true },
          { field: 'status', header: 'Status', sortable: true },
          { field: 'localCcy', header: 'Local Ccy', sortable: true },
          { field: 'netAmount', header: 'Net Amount', sortable: true },
          { field: 'fxPrice', header: 'FX Price', sortable: true },
          { field: 'paidAmount', header: 'Paid Amount', sortable: true },
          { field: 'paidDate', header: 'Paid Date', sortable: true },
          { field: 'recoStatus', header: 'Reco Status', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
      default:
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'invoiceDate', header: 'Invoice Date', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
    }
  }

  getSearchFieldsForStatus(status: string | null): SearchField[] {
    switch (status) {
      case 'Received':
      case 'Pending':
        return [
          {
            field: 'vendorName',
            label: 'Vendor Name',
            placeholder: 'Search by vendor...',
            type: 'text',
          },
          {
            field: 'invoiceNumber',
            label: 'Invoice Number',
            placeholder: 'e.g. INV-2024-001',
            type: 'text',
          },
          {
            field: 'portfolio',
            label: 'Portfolio',
            placeholder: 'Technology, Healthcare...',
            type: 'text',
          },
          { field: 'location', label: 'Location', placeholder: 'City, Country', type: 'text' },
          {
            field: 'expenseType',
            label: 'Fee Category',
            placeholder: 'Software, Legal...',
            type: 'text',
          },
        ];
      case 'Approved':
        return [
          {
            field: 'vendorName',
            label: 'Vendor Name',
            placeholder: 'Search by vendor...',
            type: 'text',
          },
          {
            field: 'invoiceNumber',
            label: 'Invoice Number',
            placeholder: 'e.g. INV-2024-001',
            type: 'text',
          },
          {
            field: 'portfolio',
            label: 'Portfolio',
            placeholder: 'Technology, Healthcare...',
            type: 'text',
          },
          {
            field: 'expenseType',
            label: 'Fee Category',
            placeholder: 'Software, Legal...',
            type: 'text',
          },
          {
            field: 'approvedBy',
            label: 'Approved By',
            placeholder: 'Approver name...',
            type: 'text',
          },
        ];
      case 'Rejected':
        return [
          {
            field: 'vendorName',
            label: 'Vendor Name',
            placeholder: 'Search by vendor...',
            type: 'text',
          },
          {
            field: 'invoiceNumber',
            label: 'Invoice Number',
            placeholder: 'e.g. INV-2024-001',
            type: 'text',
          },
          {
            field: 'portfolio',
            label: 'Portfolio',
            placeholder: 'Technology, Healthcare...',
            type: 'text',
          },
        ];
      case 'Scheduled':
        return [
          {
            field: 'vendorName',
            label: 'Vendor Name',
            placeholder: 'Search by vendor...',
            type: 'text',
          },
          {
            field: 'invoiceNumber',
            label: 'Invoice Number',
            placeholder: 'e.g. INV-2024-001',
            type: 'text',
          },
          { field: 'fundName', label: 'Fund Name', placeholder: 'Fund name...', type: 'text' },
          { field: 'fundBank', label: 'Fund Bank', placeholder: 'Bank name...', type: 'text' },
        ];
      case 'Paid':
        return [
          {
            field: 'vendorName',
            label: 'Vendor Name',
            placeholder: 'Search by vendor...',
            type: 'text',
          },
          {
            field: 'invoiceNumber',
            label: 'Invoice Number',
            placeholder: 'e.g. INV-2024-001',
            type: 'text',
          },
          { field: 'paidDate', label: 'Paid Date', placeholder: 'Select paid date', type: 'date' },
          {
            field: 'releasedEntity',
            label: 'Released Entity',
            placeholder: 'Entity name...',
            type: 'text',
          },
          {
            field: 'expenseType',
            label: 'Fee Category',
            placeholder: 'Software, Legal...',
            type: 'text',
          },
        ];
      default:
        return [
          {
            field: 'vendorName',
            label: 'Vendor Name',
            placeholder: 'Search by vendor...',
            type: 'text',
          },
          {
            field: 'invoiceNumber',
            label: 'Invoice Number',
            placeholder: 'e.g. INV-2024-001',
            type: 'text',
          },
          { field: 'invoiceDate', label: 'Invoice Date', placeholder: 'Select date', type: 'date' },
          { field: 'grossAmount', label: 'Gross Amount', placeholder: 'Amount', type: 'text' },
        ];
    }
  }

  getStatusIconClass(status: string | null): string {
    switch (status) {
      case 'Received':
        return 'status-icon-received';
      case 'Pending':
        return 'status-icon-pending';
      case 'Approved':
        return 'status-icon-approved';
      case 'Rejected':
        return 'status-icon-rejected';
      case 'Scheduled':
        return 'status-icon-scheduled';
      case 'Paid':
        return 'status-icon-paid';
      default:
        return 'status-icon-received';
    }
  }

  get normalizedStatus(): string | undefined {
    return this.status()?.trim();
  }

  get statusClass(): string {
    const map: Record<string, string> = {
      Rejected: 'bg-gradient-to-r from-rose-50 to-white',
      Received: 'bg-gradient-to-r from-sky-50 to-white',
      Pending: 'bg-gradient-to-r from-amber-50 to-white',
      Approved: 'bg-gradient-to-r from-emerald-50 to-white',
      Scheduled: 'bg-gradient-to-r from-violet-50 to-white',
      Paid: 'bg-gradient-to-r from-indigo-50 to-white',
    };
    return map[this.normalizedStatus ?? ''] ?? '';
  }
}
