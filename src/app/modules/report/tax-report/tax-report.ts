import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import TaxReportMockData from './../../core/mocks/tax-report-mock.json';
import VendorMockData from './../../core/mocks/vendor-list-mock.json';
import { NoDataPlaceholder } from '../../shared/components/no-data-placeholder/no-data-placeholder';

interface TaxData {
  invoiceDate: Date;
  fundVendorName: string;
  taxType: string;
  invoiceNo: string;
  grossAmount: number;
  taxRegion: string;
  taxAmount: number;
  paidDate: Date;
  paidAmountDr: number;
  taxReturnToFirmCr: number;
  status: string;
}

@Component({
  selector: 'app-tax-report',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    FormsModule,
  ],
  templateUrl: './tax-report.html',
  styleUrl: './tax-report.scss',
})
export class TaxReport {
  taxForm: FormGroup;
  showTable = signal(false);
  selectedStatuses: string[] = [];
  allTaxData: any[] = TaxReportMockData;

  value = signal('');

  taxData = signal<TaxData[]>([]);
  filteredTaxData = signal<TaxData[]>([]);

  entityOptions = signal([
    { label: 'XYZ Fund LLC', value: 'xyz-fund', currency: 'USD' },
    { label: 'ABC Investment Fund', value: 'abc-fund', currency: 'EUR' },
    { label: 'Global Equity Fund', value: 'global-fund', currency: 'GBP' },
  ]);

  vendorOptions = signal(VendorMockData);

  statusOptions = signal([
    { label: 'Received', value: 'Received' },
    { label: 'Pending', value: 'Pending' },
  ]);

  baseCurrency = signal('');

  totals = computed(() => {
    const data = this.filteredTaxData();
    return {
      grossAmount: data.reduce((sum, item) => sum + item.grossAmount, 0),
      taxAmount: data.reduce((sum, item) => sum + item.taxAmount, 0),
      paidAmountDr: data.reduce((sum, item) => sum + item.paidAmountDr, 0),
      taxReturnToFirmCr: data.reduce((sum, item) => sum + item.taxReturnToFirmCr, 0),
    };
  });

  constructor(private fb: FormBuilder) {
    this.taxForm = this.fb.group({
      entity: [''],
      vendors: [[]],
      dateFrom: [new Date('2025-01-01')],
      dateTo: [new Date('2025-01-30')],
    });
  }

  onEntityChange(event: any) {
    const selectedEntity = this.entityOptions().find((entity) => entity.value === event.value);
    if (selectedEntity) {
      this.baseCurrency.set(selectedEntity.currency);
    }
  }

  onSearch() {
    this.taxData.set(this.allTaxData);
    this.filteredTaxData.set(this.allTaxData);
    this.showTable.set(true);
  }

  onStatusFilter() {
    if (this.selectedStatuses.length === 0) {
      this.filteredTaxData.set(this.taxData());
    } else {
      const filtered = this.taxData().filter((item) => this.selectedStatuses.includes(item.status));
      this.filteredTaxData.set(filtered);
    }
  }
}
