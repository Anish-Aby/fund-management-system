import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import fundsData from '../../core/mocks/funds-mock.json';

interface Fund {
  id: string;
  name: string;
}

interface FeeType {
  label: string;
  value: string;
}

interface FundEntry {
  fund: Fund | null;
  feeTypes: FeeType[];
}

@Component({
  selector: 'app-vendor-add',
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    MultiSelectModule,
  ],
  templateUrl: './vendor-add.html',
  styleUrl: './vendor-add.scss',
})
export class VendorAdd {
  funds: Fund[] = fundsData;
  feeTypeOptions: FeeType[] = [
    { label: 'Fund Admin Fee', value: 'fund_admin_fee' },
    { label: 'Legal Fee', value: 'legal_fee' },
    { label: 'Audit Fee', value: 'audit_fee' },
    { label: 'Custody Service Fee', value: 'custody_service_fee' },
  ];
  bankChargesOptions = signal<any>([
    { label: 'Client', value: 1 },
    { label: 'Fund', value: 2 },
    { label: 'Shared', value: 3 },
    { label: 'Nil', value: 4 },
  ]);
  taxTypeOptions = [
    { label: 'VAT', value: 'vat' },
    { label: 'GST', value: 'gst' },
  ];

  fundEntries = signal<FundEntry[]>([]);
  selectedTaxType: string | null = null;
  taxPercentage: number | null = null;

  addFund() {
    this.fundEntries.update((entries) => [...entries, { fund: null, feeTypes: [] }]);
  }

  removeFund(index: number) {
    this.fundEntries.update((entries) => entries.filter((_, i) => i !== index));
  }

  updateFund(index: number, fund: Fund) {
    this.fundEntries.update((entries) =>
      entries.map((entry, i) => (i === index ? { ...entry, fund } : entry))
    );
  }

  updateFeeTypes(index: number, feeTypes: FeeType[]) {
    this.fundEntries.update((entries) =>
      entries.map((entry, i) => (i === index ? { ...entry, feeTypes } : entry))
    );
  }
}
