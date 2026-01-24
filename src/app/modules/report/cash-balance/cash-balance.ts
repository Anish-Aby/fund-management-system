import { Component, computed, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import cashBalanceMockData from '../../core/mocks/cash-balance-mock.json';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoDataPlaceholder } from '../../shared/components/no-data-placeholder/no-data-placeholder';

@Component({
  selector: 'app-cash-balance',
  imports: [
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
    CommonModule,
    FormsModule,
    NoDataPlaceholder,
  ],
  templateUrl: './cash-balance.html',
  styleUrl: './cash-balance.scss',
})
export class CashBalance {
  cashBalanceData = signal(cashBalanceMockData);
  filteredData = signal<any[]>([]);
  selectedBanks = signal<any[]>([]);
  dateFrom = signal<Date | null>(null);
  dateTo = signal<Date | null>(null);
  baseCurrency = signal('USD');

  categoryOptions = signal([
    {
      id: 1,
      label: 'Bank',
    },
    {
      id: 2,
      label: 'Account',
    },
  ]);

  currencyOptions = signal([
    {
      id: 1,
      label: 'USD',
    },
    {
      id: 2,
      label: 'EUR',
    },
    {
      id: 3,
      label: 'GBP',
    },
    {
      id: 4,
      label: 'SGD',
    },
  ]);

  bankOptions = signal([
    { label: 'Bank of America', value: 'Bank of America' },
    { label: 'Chase Bank UK', value: 'Chase Bank UK' },
    { label: 'Deutsche Bank', value: 'Deutsche Bank' },
    { label: 'HSBC Singapore', value: 'HSBC Singapore' },
    { label: 'Wells Fargo', value: 'Wells Fargo' },
    { label: 'Barclays Bank', value: 'Barclays Bank' },
    { label: 'JPMorgan Chase', value: 'JPMorgan Chase' },
    { label: 'Citibank', value: 'Citibank' },
  ]);

  totals = computed(() => {
    const data = this.filteredData();
    return {
      beginningBalance: data.reduce(
        (sum, item) => sum + (item.usdBalance * (item.beginningBalance / item.endingBalance) || 0),
        0,
      ),
      forThePeriod: data.reduce(
        (sum, item) => sum + (item.usdBalance * (item.forThePeriod / item.endingBalance) || 0),
        0,
      ),
      endingBalance: data.reduce((sum, item) => sum + (item.usdBalance || 0), 0),
      usdBalance: data.reduce((sum, item) => sum + (item.usdBalance || 0), 0),
    };
  });

  formatCurrency(amount: number, currency: string): string {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      SGD: 'S$',
    };

    const symbol = symbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
  }

  onSearch() {
    let filtered = [...this.cashBalanceData()];

    // Filter by selected banks
    if (this.selectedBanks().length > 0) {
      const selectedBankNames = this.selectedBanks().map((bank) => bank.value || bank);
      filtered = filtered.filter((item) => selectedBankNames.includes(item.bankName));
    }

    // Note: Date filtering would require additional logic based on transaction dates
    // For now, we're just filtering by bank selection

    this.filteredData.set(filtered);
  }
}
