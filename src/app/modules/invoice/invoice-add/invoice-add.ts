import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import vendorsMock from '../../core/mocks/vendor-list-mock.json';
import fundsMock from '../../core/mocks/funds-mock.json';
import feeTypesMock from '../../core/mocks/fee-types-mock.json';
import invoiceTypesMock from '../../core/mocks/invoice-types-mock.json';

interface Invoice {
  id: string;
  vendorName: string;
  invoiceType: string;
  invoiceDate: Date;
  invoiceNo: string;
  invoiceDueDate: Date;
  invoicedFundName: string;
  vendorCcy: string;
  feeType: string;
  netAmount: number;
  taxAmount: number;
  grossAmount: number;
}

@Component({
  selector: 'app-invoice-add',
  imports: [
    CommonModule,
    FormsModule,
    DatePickerModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    MultiSelectModule,
    SelectModule,
    TextareaModule,
    TagModule,
  ],
  templateUrl: './invoice-add.html',
  styleUrl: './invoice-add.scss',
})
export class InvoiceAdd {
  addedInvoice = signal<Invoice[]>([
    {
      id: '1',
      vendorName: 'Tech Solutions Inc',
      invoiceType: 'Standard Invoice',
      invoiceDate: new Date('2024-01-15'),
      invoiceNo: 'INV-2024-001',
      invoiceDueDate: new Date('2024-02-15'),
      invoicedFundName: 'Growth Equity Fund',
      vendorCcy: 'USD',
      feeType: 'Software License',
      netAmount: 12500,
      taxAmount: 2500,
      grossAmount: 15000
    },
    {
      id: '2',
      vendorName: 'Cloud Services Ltd',
      invoiceType: 'Recurring Invoice',
      invoiceDate: new Date('2024-01-20'),
      invoiceNo: 'INV-2024-002',
      invoiceDueDate: new Date('2024-02-20'),
      invoicedFundName: 'Tech Innovation Fund',
      vendorCcy: 'USD',
      feeType: 'Infrastructure',
      netAmount: 7083,
      taxAmount: 1417,
      grossAmount: 8500
    },
    {
      id: '3',
      vendorName: 'Legal Advisors LLC',
      invoiceType: 'Standard Invoice',
      invoiceDate: new Date('2024-01-25'),
      invoiceNo: 'INV-2024-003',
      invoiceDueDate: new Date('2024-02-25'),
      invoicedFundName: 'Emerging Markets Fund',
      vendorCcy: 'EUR',
      feeType: 'Legal Services',
      netAmount: 10000,
      taxAmount: 2000,
      grossAmount: 12000
    },
    {
      id: '4',
      vendorName: 'Audit Partners',
      invoiceType: 'Proforma Invoice',
      invoiceDate: new Date('2024-01-30'),
      invoiceNo: 'INV-2024-004',
      invoiceDueDate: new Date('2024-03-01'),
      invoicedFundName: 'Bond Stability Fund',
      vendorCcy: 'USD',
      feeType: 'Audit Fees',
      netAmount: 20833,
      taxAmount: 4167,
      grossAmount: 25000
    },
    {
      id: '5',
      vendorName: 'Property Management Co',
      invoiceType: 'Recurring Invoice',
      invoiceDate: new Date('2024-02-05'),
      invoiceNo: 'INV-2024-005',
      invoiceDueDate: new Date('2024-03-05'),
      invoicedFundName: 'Real Estate Fund',
      vendorCcy: 'GBP',
      feeType: 'Management Fees',
      netAmount: 15417,
      taxAmount: 3083,
      grossAmount: 18500
    },
    {
      id: '6',
      vendorName: 'Marketing Agency Pro',
      invoiceType: 'Standard Invoice',
      invoiceDate: new Date('2024-02-10'),
      invoiceNo: 'INV-2024-006',
      invoiceDueDate: new Date('2024-03-10'),
      invoicedFundName: 'Growth Equity Fund',
      vendorCcy: 'USD',
      feeType: 'Marketing',
      netAmount: 7667,
      taxAmount: 1533,
      grossAmount: 9200
    },
    {
      id: '7',
      vendorName: 'Data Analytics Corp',
      invoiceType: 'Standard Invoice',
      invoiceDate: new Date('2024-02-12'),
      invoiceNo: 'INV-2024-007',
      invoiceDueDate: new Date('2024-03-12'),
      invoicedFundName: 'Tech Innovation Fund',
      vendorCcy: 'USD',
      feeType: 'Consulting',
      netAmount: 18333,
      taxAmount: 3667,
      grossAmount: 22000
    },
    {
      id: '8',
      vendorName: 'Construction Services',
      invoiceType: 'Credit Note',
      invoiceDate: new Date('2024-02-15'),
      invoiceNo: 'INV-2024-008',
      invoiceDueDate: new Date('2024-03-15'),
      invoicedFundName: 'Real Estate Fund',
      vendorCcy: 'GBP',
      feeType: 'Maintenance',
      netAmount: 26250,
      taxAmount: 5250,
      grossAmount: 31500
    },
    {
      id: '9',
      vendorName: 'Financial Advisors Inc',
      invoiceType: 'Standard Invoice',
      invoiceDate: new Date('2024-02-18'),
      invoiceNo: 'INV-2024-009',
      invoiceDueDate: new Date('2024-03-18'),
      invoicedFundName: 'Bond Stability Fund',
      vendorCcy: 'USD',
      feeType: 'Advisory Fees',
      netAmount: 12333,
      taxAmount: 2467,
      grossAmount: 14800
    },
    {
      id: '10',
      vendorName: 'Research Institute',
      invoiceType: 'Debit Note',
      invoiceDate: new Date('2024-02-20'),
      invoiceNo: 'INV-2024-010',
      invoiceDueDate: new Date('2024-03-20'),
      invoicedFundName: 'Emerging Markets Fund',
      vendorCcy: 'EUR',
      feeType: 'Research',
      netAmount: 6250,
      taxAmount: 1250,
      grossAmount: 7500
    }
  ]);

  vendors = vendorsMock;
  funds = fundsMock;
  feeTypes = feeTypesMock;
  invoiceTypes = invoiceTypesMock;
  editingInvoice = signal<string | null>(null);

  newInvoice = signal<Partial<Invoice>>({
    vendorName: '',
    invoiceType: '',
    invoiceDate: new Date(),
    invoiceNo: '',
    invoiceDueDate: new Date(),
    invoicedFundName: '',
    vendorCcy: 'USD',
    feeType: '',
    netAmount: 0,
    taxAmount: 0,
    grossAmount: 0
  });

  editInvoice(id: string) {
    this.editingInvoice.set(id);
  }

  saveInvoice(id: string) {
    this.editingInvoice.set(null);
  }

  cancelEdit() {
    this.editingInvoice.set(null);
  }

  deleteInvoice(id: string) {
    this.addedInvoice.update(invoices => invoices.filter(inv => inv.id !== id));
  }

  addInvoice() {
    const invoice = this.newInvoice();
    if (invoice.vendorName && invoice.invoiceType && invoice.invoiceNo && invoice.invoicedFundName && invoice.feeType) {
      const newId = (this.addedInvoice().length + 1).toString();
      this.addedInvoice.update(invoices => [...invoices, { ...invoice, id: newId } as Invoice]);
      this.resetForm();
    }
  }

  updateInvoiceField(field: keyof Partial<Invoice>, value: any) {
    this.newInvoice.update(inv => ({ ...inv, [field]: value }));
  }

  resetForm() {
    this.newInvoice.set({
      vendorName: '',
      invoiceType: '',
      invoiceDate: new Date(),
      invoiceNo: '',
      invoiceDueDate: new Date(),
      invoicedFundName: '',
      vendorCcy: 'USD',
      feeType: '',
      netAmount: 0,
      taxAmount: 0,
      grossAmount: 0
    });
  }
}
