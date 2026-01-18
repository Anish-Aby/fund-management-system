import { Component, computed, signal } from '@angular/core';
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
export class InvoiceList {
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
    private router: Router,
  ) {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    console.log(queryParams);
    this.status.set(this.getStatus(queryParams['statusId']));
    this.invoices = InvoiceListData.filter((invoice) => invoice.status === this.status());
    this.calculateTotal();
  }

  getStatus(statusId: string) {
    switch (statusId) {
      case '1':
        return 'Received';
      case '2':
        return 'Pending';
      case '3':
        return 'Approved';
      case '4':
        return 'Rejected';
      case '5':
        return 'Scheduled';
      case '6':
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
    this.router.navigate(['app/invoice/review']);
  }

  onReviewInvoice() {
    if (this.selectedInvoices.length === 0) {
      return;
    }
    const invoiceIds = this.selectedInvoices.map((invoice) => invoice.invoiceNumber);
    this.router.navigate(['app/invoice/review']);
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
          { field: 'location', header: 'Location', sortable: true },
          { field: 'currency', header: 'Currency', sortable: true },
          { field: 'expenseType', header: 'Fee Category', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
      case 'Pending':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'invoiceDate', header: 'Invoice Date', sortable: true },
          { field: 'portfolio', header: 'Portfolio', sortable: true },
          { field: 'aging', header: 'Aging', sortable: true },
          { field: 'location', header: 'Location', sortable: true },
          { field: 'currency', header: 'Currency', sortable: true },
          { field: 'expenseType', header: 'Fee Category', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
      case 'Approved':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'invoiceDate', header: 'Invoice Date', sortable: true },
          { field: 'portfolio', header: 'Portfolio', sortable: true },
          { field: 'aging', header: 'Aging', sortable: true },
          { field: 'currency', header: 'Currency', sortable: true },
          { field: 'expenseType', header: 'Fee Category', sortable: true },
          { field: 'approvedBy', header: 'Approved By', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
      case 'Rejected':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'invoiceDate', header: 'Invoice Date', sortable: true },
          { field: 'portfolio', header: 'Portfolio', sortable: true },
          { field: 'aging', header: 'Aging', sortable: true },
          { field: 'currency', header: 'Currency', sortable: true },
          { field: 'rejectedBy', header: 'Rejected By', sortable: true },
          { field: 'rejectedReason', header: 'Rejected Reason', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
      case 'Scheduled':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'invoiceDate', header: 'Invoice Date', sortable: true },
          { field: 'dueDate', header: 'Invoice Due Date', sortable: true },
          { field: 'fundName', header: 'Fund Name', sortable: true },
          { field: 'fundBank', header: 'Fund Bank', sortable: true },
          { field: 'paidFrom', header: 'Paid From', sortable: true },
          { field: 'bankBalance', header: 'Bank Balance', sortable: true },
          { field: 'grossAmount', header: 'Gross Amount', sortable: true },
        ];
      case 'Paid':
        return [
          { field: 'vendorName', header: 'Vendor Name', sortable: true },
          { field: 'invoiceNumber', header: 'Invoice No', sortable: true },
          { field: 'paidDate', header: 'Paid Date', sortable: true },
          { field: 'releasedEntity', header: 'Released Entity', sortable: true },
          { field: 'entityBank', header: 'Entity Bank', sortable: true },
          { field: 'paidBy', header: 'Paid By', sortable: true },
          { field: 'currency', header: 'Base Currency', sortable: true },
          { field: 'expenseType', header: 'Fee Category', sortable: true },
          { field: 'grossAmount', header: 'Paid Amount', sortable: true },
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
}
