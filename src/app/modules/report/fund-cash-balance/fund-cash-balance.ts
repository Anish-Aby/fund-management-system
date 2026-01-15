import { Component, computed, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import fundCashBalanceMockData from '../../core/mocks/fund-cash-balance-mock.json';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { NoDataPlaceholder } from '../../shared/components/no-data-placeholder/no-data-placeholder';

@Component({
  selector: 'app-fund-cash-balance',
  imports: [
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    FormsModule,
    NoDataPlaceholder,
  ],
  templateUrl: './fund-cash-balance.html',
  styleUrl: './fund-cash-balance.scss',
})
export class FundCashBalance {
  fundCashBalanceData = signal(fundCashBalanceMockData);
  filteredData = signal<any[]>([]);
  selectedEntity = signal<any>(null);
  baseCurrency = signal('USD');

  entityOptions = signal([
    { label: 'FinLab Holdings Ltd', value: 'finlab-holdings' },
    { label: 'FinLab Tech Solutions', value: 'finlab-tech' },
    { label: 'FinLab International', value: 'finlab-international' },
    { label: 'FinLab Real Estate', value: 'finlab-realestate' },
    { label: 'FinLab Healthcare', value: 'finlab-healthcare' },
    { label: 'FinLab Energy', value: 'finlab-energy' },
  ]);

  totals = computed(() => {
    const data = this.filteredData();
    return {
      paidInvoices: data.reduce((sum, item) => {
        // Convert to USD equivalent for totals
        const rate = this.getUSDRate(item.currency);
        return sum + item.paidInvoices * rate;
      }, 0),
      unpaidInvoices: data.reduce((sum, item) => {
        const rate = this.getUSDRate(item.currency);
        return sum + item.unpaidInvoices * rate;
      }, 0),
      bankBalance: data.reduce((sum, item) => {
        const rate = this.getUSDRate(item.currency);
        return sum + item.bankBalance * rate;
      }, 0),
      usdBalance: data.reduce((sum, item) => sum + (item.usdBalance || 0), 0),
    };
  });

  private getUSDRate(currency: string): number {
    // Simplified conversion rates for totals calculation
    const rates: { [key: string]: number } = {
      USD: 1.0,
      EUR: 1.09,
      GBP: 1.27,
      SGD: 0.74,
      CHF: 1.12,
      CAD: 0.74,
      AUD: 0.66,
      JPY: 0.0067,
    };
    return rates[currency] || 1.0;
  }

  formatCurrency(amount: number, currency: string): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      SGD: 'S$',
      CHF: 'CHF',
      CAD: 'C$',
      AUD: 'A$',
      JPY: '¥',
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
  }

  onSearch() {
    this.filteredData.set(fundCashBalanceMockData);
  }
}
