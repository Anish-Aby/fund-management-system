import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { NoDataPlaceholder } from '../shared/components/no-data-placeholder/no-data-placeholder';

interface Entity {
  label: string;
  value: string;
  baseCurrency: string;
}

interface ForexPricingRecord {
  date: Date;
  regionName: string;
  symbol: string;
  value: number;
}

@Component({
  selector: 'app-forex-pricing',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    TableModule,
    InputNumberModule,
    MultiSelectModule,
    NoDataPlaceholder,
  ],
  templateUrl: './forex-pricing.html',
  styleUrl: './forex-pricing.scss',
})
export class ForexPricing implements OnInit {
  addForm: FormGroup;
  viewForm: FormGroup;
  historicalRecords: ForexPricingRecord[] = [];

  entities: Entity[] = [
    { label: 'ABC Fund & Co', value: 'abc_fund', baseCurrency: 'USD' },
    { label: 'XYZ Investment Ltd', value: 'xyz_investment', baseCurrency: 'EUR' },
    { label: 'Global Assets Inc', value: 'global_assets', baseCurrency: 'GBP' },
  ];

  symbols = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'AUD', value: 'AUD' },
    { label: 'SGD', value: 'SGD' },
  ];

  defaultRates = [
    { regionName: 'American', symbol: 'USD', value: null },
    { regionName: 'Euro', symbol: 'EUR', value: null },
    { regionName: 'UK', symbol: 'GBP', value: null },
    { regionName: 'Australia', symbol: 'AUD', value: null },
    { regionName: 'Singapore', symbol: 'SGD', value: null },
  ];

  constructor(private fb: FormBuilder) {
    this.addForm = this.fb.group({
      entity: [null],
      baseCurrency: [''],
      pricingDate: [new Date()],
      rates: this.fb.array([]),
    });

    this.viewForm = this.fb.group({
      entity: [null],
      dateFrom: [null],
      dateTo: [null],
      symbol: [null],
    });
  }

  ngOnInit() {
    this.loadHistoricalData();
  }

  get ratesArray() {
    return this.addForm.get('rates') as FormArray;
  }

  getEntityForex() {
    const entity = this.addForm.get('entity')?.value;
    if (entity) {
      this.addForm.patchValue({ baseCurrency: entity.baseCurrency });
      this.setupRatesArray(entity.baseCurrency);
    }
  }

  setupRatesArray(baseCurrency: string) {
    this.ratesArray.clear();
    this.defaultRates.forEach((rate) => {
      const rateGroup = this.fb.group({
        regionName: [rate.regionName],
        symbol: [rate.symbol],
        value: [rate.symbol === baseCurrency ? 1 : null],
      });
      this.ratesArray.push(rateGroup);
    });
  }

  onViewFormChange() {
    this.filterHistoricalRecords();
  }

  filterHistoricalRecords() {
    this.loadHistoricalData();
  }

  loadHistoricalData() {
    this.historicalRecords = [
      { date: new Date('2025-01-12'), regionName: 'American', symbol: 'USD', value: 1 },
      { date: new Date('2025-02-12'), regionName: 'American', symbol: 'USD', value: 1 },
      { date: new Date('2025-01-12'), regionName: 'Euro', symbol: 'EUR', value: 0.85 },
      { date: new Date('2025-02-12'), regionName: 'Euro', symbol: 'EUR', value: 0.86 },
    ];
  }

  onSave() {
    if (this.addForm.valid) {
      console.log('Saving:', this.addForm.value);
      this.addForm.reset();
      this.addForm.patchValue({ pricingDate: new Date() });
      this.ratesArray.clear();
    }
  }
}
