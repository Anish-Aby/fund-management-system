import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import fundsData from '../../core/mocks/funds-mock.json';
import vendorMockData from '../../core/mocks/vendor-list-mock.json';
import { TableModule } from 'primeng/table';
import { SplitButtonModule } from 'primeng/splitbutton';

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

interface Vendor {
  id: string;
  displayName: string;
  vendorName: string;
  vendorCode: string;
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
    TableModule,
    SplitButtonModule,
  ],
  templateUrl: './vendor-add.html',
  styleUrl: './vendor-add.scss',
})
export class VendorAdd {
  vendors = signal<Vendor[]>(vendorMockData);
  selectedVendors = signal<Vendor[]>([]);
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

  isEditMode = signal<boolean>(false);
  selectedVendor = signal<Vendor | null>(null);
  isViewMode = signal<boolean>(false);
  isAddMode = signal<boolean>(true);

  addFund() {
    this.fundEntries.update((entries) => [...entries, { fund: null, feeTypes: [] }]);
  }

  removeFund(index: number) {
    this.fundEntries.update((entries) => entries.filter((_, i) => i !== index));
  }

  updateFund(index: number, fund: Fund) {
    this.fundEntries.update((entries) =>
      entries.map((entry, i) => (i === index ? { ...entry, fund } : entry)),
    );
  }

  updateFeeTypes(index: number, feeTypes: FeeType[]) {
    this.fundEntries.update((entries) =>
      entries.map((entry, i) => (i === index ? { ...entry, feeTypes } : entry)),
    );
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  viewVendor(vendor: Vendor): void {
    this.selectedVendor.set(vendor);
    this.isViewMode.set(true);
    this.isEditMode.set(false);
    this.isAddMode.set(false);
  }

  editVendor(vendor: Vendor): void {
    this.selectedVendor.set(vendor);
    this.isViewMode.set(false);
    this.isEditMode.set(true);
    this.isAddMode.set(false);
  }

  deleteVendor(vendor: Vendor): void {
    // this.selectedVendor.set(vendor);
    // this.isViewMode.set(false);
    // this.isEditMode.set(true);
    // this.isAddMode.set(false);
  }

  clearVendorSelection(): void {
    this.selectedVendor.set(null);
    this.isViewMode.set(false);
    this.isEditMode.set(false);
    this.isAddMode.set(true);
  }
}
