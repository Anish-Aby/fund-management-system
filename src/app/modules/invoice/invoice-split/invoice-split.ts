import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

interface SplitRow {
  invoiceNo: string;
  invoiceType: string;
  fundName: string;
  description: string;
  feeType: string;
  netAmount: number | null;
  taxPercent: number;
  taxAmount: number | null;
  grossAmount: number | null;
}

@Component({
  selector: 'app-invoice-split',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DividerModule,
    TableModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
  ],
  templateUrl: './invoice-split.html',
  styleUrl: './invoice-split.scss',
})
export class InvoiceSplit implements OnInit {
  splitRows: SplitRow[] = [];
  
  // Invoice details from mock data
  invoiceDetails = {
    vendorName: 'Tech Solutions Inc',
    invoiceNo: 'INV-2024-001',
    invoiceDate: '2024-01-15',
    fundName: 'Growth Equity Fund',
    feeType: 'Software License',
    description: 'Software licensing and support services',
    vendorCcy: 'USD',
    dueDate: '2024-02-15',
    netAmount: 13636.36,
    taxAmount: 1363.64,
    grossAmount: 15000
  };

  funds = [
    { id: 'FUND-001', name: 'Growth Equity Fund' },
    { id: 'FUND-002', name: 'Tech Innovation Fund' },
    { id: 'FUND-003', name: 'Emerging Markets Fund' },
    { id: 'FUND-004', name: 'Bond Stability Fund' },
    { id: 'FUND-005', name: 'Real Estate Fund' },
    { id: 'FUND-006', name: 'Healthcare Innovation Fund' },
    { id: 'FUND-007', name: 'Sustainable Energy Fund' },
    { id: 'FUND-008', name: 'Fintech Innovation Fund' },
    { id: 'FUND-009', name: 'Agriculture Innovation Fund' },
    { id: 'FUND-010', name: 'Space Technology Fund' },
    { id: 'FUND-011', name: 'Biotechnology Fund' },
    { id: 'FUND-012', name: 'Automotive Innovation Fund' },
    { id: 'FUND-013', name: 'Retail Technology Fund' },
    { id: 'FUND-014', name: 'Education Technology Fund' },
    { id: 'FUND-015', name: 'Gaming Innovation Fund' },
    { id: 'FUND-016', name: 'Logistics Innovation Fund' },
    { id: 'FUND-017', name: 'Cybersecurity Fund' },
    { id: 'FUND-018', name: 'Clean Water Fund' },
    { id: 'FUND-019', name: 'Quantum Computing Fund' },
    { id: 'FUND-020', name: 'Social Impact Fund' },
    { id: 'FUND-021', name: 'Maritime Technology Fund' },
    { id: 'FUND-022', name: 'AI Research Fund' },
    { id: 'FUND-023', name: 'Renewable Materials Fund' },
    { id: 'FUND-024', name: 'Digital Health Fund' },
    { id: 'FUND-025', name: 'Smart City Fund' },
    { id: 'FUND-026', name: 'Aerospace Defense Fund' },
    { id: 'FUND-027', name: 'Food Technology Fund' },
    { id: 'FUND-028', name: 'Robotics Innovation Fund' },
    { id: 'FUND-029', name: 'Climate Technology Fund' },
    { id: 'FUND-030', name: 'Pharmaceutical Fund' }
  ];

  feeTypes = [
    { id: 'FEE-001', name: 'Management Fees' },
    { id: 'FEE-002', name: 'Advisory Fees' },
    { id: 'FEE-003', name: 'Audit Fees' },
    { id: 'FEE-004', name: 'Legal Services' },
    { id: 'FEE-005', name: 'Software License' },
    { id: 'FEE-006', name: 'Infrastructure' },
    { id: 'FEE-007', name: 'Consulting' },
    { id: 'FEE-008', name: 'Marketing' },
    { id: 'FEE-009', name: 'Research' },
    { id: 'FEE-010', name: 'Equipment' },
    { id: 'FEE-011', name: 'Maintenance' },
    { id: 'FEE-012', name: 'Office Expenses' },
  ];

  ngOnInit() {}

  addSplitRow() {
    const newRow: SplitRow = {
      invoiceNo: this.invoiceDetails.invoiceNo,
      invoiceType: 'Split',
      fundName: '',
      description: '',
      feeType: '',
      netAmount: null,
      taxPercent: 10,
      taxAmount: null,
      grossAmount: null,
    };
    this.splitRows.push(newRow);
  }

  deleteSplitRow(index: number) {
    this.splitRows.splice(index, 1);
  }

  calculateTaxAndGross(index: number) {
    const row = this.splitRows[index];
    if (row.netAmount) {
      row.taxAmount = (row.netAmount * row.taxPercent) / 100;
      row.grossAmount = row.netAmount + row.taxAmount;
    }
  }

  calculateGross(index: number) {
    const row = this.splitRows[index];
    if (row.netAmount && row.taxAmount !== null) {
      row.grossAmount = row.netAmount + row.taxAmount;
    }
  }

  getTotalSplitAmount(): number {
    return this.splitRows.reduce((total, row) => total + (row.grossAmount || 0), 0);
  }

  getRemainingAmount(): number {
    return this.invoiceDetails.grossAmount - this.getTotalSplitAmount();
  }
}
