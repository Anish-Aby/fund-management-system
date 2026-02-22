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

  vendorOptions = signal([
    { label: 'Tech Solutions Inc', value: 'tech-solutions' },
    { label: 'Cloud Services Ltd', value: 'cloud-services' },
    { label: 'Legal Advisors LLC', value: 'legal-advisors' },
    { label: 'Audit Partners', value: 'audit-partners' },
    { label: 'Property Management Co', value: 'property-mgmt' },
    { label: 'Marketing Agency Pro', value: 'marketing-agency' },
    { label: 'Data Analytics Corp', value: 'data-analytics' },
    { label: 'Construction Services', value: 'construction' },
    { label: 'Financial Advisors Inc', value: 'financial-advisors' },
    { label: 'Research Institute', value: 'research-institute' },
    { label: 'Office Supplies Ltd', value: 'office-supplies' },
    { label: 'MedTech Solutions', value: 'medtech' },
    { label: 'Green Power Corp', value: 'green-power' },
    { label: 'AI Research Lab', value: 'ai-research' },
    { label: 'Urban Development LLC', value: 'urban-dev' },
    { label: 'Risk Management Partners', value: 'risk-mgmt' },
    { label: 'Global Trade Services', value: 'global-trade' },
    { label: 'Biotech Research Inc', value: 'biotech' },
    { label: 'Solar Panel Manufacturers', value: 'solar-panels' },
    { label: 'Cybersecurity Solutions', value: 'cybersecurity' },
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
