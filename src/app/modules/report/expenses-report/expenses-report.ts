import { Component, computed, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import expensesMockData from '../../core/mocks/expenses-report-mock.json';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { AltLoaderComponent, MainLoaderComponent } from '../../../shared/components/main-loader';

@Component({
  selector: 'app-expenses-report',
  imports: [
    ButtonModule,
    TableModule,
    InputTextModule,
    TagModule,
    SelectModule,
    MultiSelectModule,
    DatePickerModule,
  ],
  templateUrl: './expenses-report.html',
  styleUrl: './expenses-report.scss',
})
export class ExpensesReport {
  expensesData = signal(expensesMockData);
  filteredData = signal<any[]>(expensesMockData);

  entityOptions = signal([
    { label: 'FinLab Holdings Ltd', value: 'finlab-holdings' },
    { label: 'FinLab Tech Solutions', value: 'finlab-tech' },
    { label: 'FinLab International', value: 'finlab-international' },
    { label: 'FinLab Real Estate', value: 'finlab-realestate' },
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

  expenseTypeOptions = signal([
    { label: 'Administration Fee', value: 'administration-fee' },
    { label: 'Legal Fee', value: 'legal-fee' },
    { label: 'Management Fee', value: 'management-fee' },
    { label: 'Rendered Service Fee', value: 'rendered-service-fee' },
    { label: 'Consultation Fee', value: 'consultation-fee' },
    { label: 'Investor Report', value: 'investor-report' },
    { label: 'Professional Fee', value: 'professional-fee' },
  ]);

  totals = computed(() => {
    const data = this.filteredData();
    return {
      beginningAmount: data.reduce((sum, item) => sum + (item.beginningAmount || 0), 0),
      forThePeriod: data.reduce((sum, item) => sum + (item.forThePeriod || 0), 0),
      endingAmount: data.reduce((sum, item) => sum + (item.endingAmount || 0), 0),
    };
  });

  onTableFilter(event: any) {
    this.filteredData.set(event.filteredValue || this.expensesData());
  }
}
