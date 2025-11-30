import { Component, computed } from '@angular/core';
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
  statusOptions = [
    { label: 'Received', value: 'Received' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
    { label: 'Scheduled', value: 'Scheduled' },
    { label: 'Paid', value: 'Paid' },
  ];

  constructor(
    public utilityService: UtilityService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    const queryParams = this.activatedRoute.snapshot.queryParams;
    console.log(queryParams);
    const status = this.getStatus(queryParams['statusId']);
    this.invoices = InvoiceListData.filter((invoice) => invoice.status === status);
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
}
