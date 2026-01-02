import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';

interface TaxType {
  label: string;
  value: string;
}

interface Currency {
  label: string;
  value: string;
}

@Component({
  selector: 'app-entity-add',
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    CheckboxModule,
  ],
  templateUrl: './entity-add.html',
  styleUrl: './entity-add.scss',
})
export class EntityAdd {
  taxTypeOptions: TaxType[] = [
    { label: 'VAT', value: 'vat' },
    { label: 'GST', value: 'gst' },
  ];

  currencyOptions: Currency[] = [
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' },
    { label: 'GBP', value: 'GBP' },
    { label: 'JPY', value: 'JPY' },
  ];

  selectedTaxType: string | null = null;
  taxPercentage: number | null = null;
  allowedVendor: boolean = false;
  selectedBaseCurrency: string | null = null;
}
