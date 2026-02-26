import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { StatCard } from '../shared/components/stat-card/stat-card';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { UtilityService } from '../shared/services/utility.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import EntityMockData from './../core/mocks/entity-mock.json';
import { DialogWindowService } from '../core/services/dialog-window-service';
import { DIALOG_COMPONENT_TITLES } from '../shared/constants/const';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../shared/services/api.service';
import { Tooltip } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [
    BreadcrumbModule,
    CardModule,
    FieldsetModule,
    TableModule,
    TagModule,
    ButtonModule,
    ButtonGroupModule,
    StatCard,
    InputTextModule,
    FormsModule,
    SelectModule,
    ReactiveFormsModule,
    Tooltip,
    CommonModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  portfolio!: any[];
  invoices!: any[];
  selectedInvoices: any[] = [];
  filteredTotal: number = 0;

  destroyRef = inject(DestroyRef);

  readonly totalInvoices = 128;

  isShowDashboardContent = signal(true);

  entityForm: FormGroup;

  items: any[] = [{ label: 'Dashboard' }];

  entityOptions = signal<any[]>(EntityMockData);

  home: any = { icon: 'pi pi-home', routerLink: '/' };

  constructor(
    private dialogWindowService: DialogWindowService,
    private fb: FormBuilder,
    private apiService: ApiService,
    public utilityService: UtilityService,
  ) {
    this.entityForm = this.fb.group({
      entityId: [null],
    });
  }

  ngOnInit() {
    this.portfolio = [
      { code: 'GEF001', name: 'Growth Equity Fund', region: 'USA', amount: 45000 },
      { code: 'TIF002', name: 'Tech Innovation Fund', region: 'USA', amount: 62000 },
      { code: 'EMF003', name: 'Emerging Markets Fund', region: 'EU', amount: 28500 },
      { code: 'BSF004', name: 'Bond Stability Fund', region: 'UAE', amount: 75000 },
      { code: 'REF005', name: 'Real Estate Fund', region: 'JP', amount: 22500 },
      { code: 'HIF006', name: 'Healthcare Innovation Fund', region: 'USA', amount: 38000 },
      { code: 'ESG007', name: 'ESG Sustainable Fund', region: 'EU', amount: 52000 },
      { code: 'CRF008', name: 'Crypto Research Fund', region: 'USA', amount: 19500 },
      { code: 'AIF009', name: 'AI Technology Fund', region: 'USA', amount: 67000 },
      { code: 'GIF010', name: 'Green Infrastructure Fund', region: 'EU', amount: 41000 },
      { code: 'BIF011', name: 'Biotech Innovation Fund', region: 'USA', amount: 33500 },
      { code: 'EEF012', name: 'Energy Efficiency Fund', region: 'UAE', amount: 29000 },
      { code: 'FTF013', name: 'Fintech Ventures Fund', region: 'USA', amount: 58000 },
      { code: 'SMF014', name: 'Small Cap Markets Fund', region: 'JP', amount: 24500 },
      { code: 'DIF015', name: 'Digital Infrastructure Fund', region: 'EU', amount: 46000 },
      { code: 'RIF016', name: 'Renewable Infrastructure Fund', region: 'UAE', amount: 71000 },
      { code: 'VCF017', name: 'Venture Capital Fund', region: 'USA', amount: 85000 },
      { code: 'PEF018', name: 'Private Equity Fund', region: 'EU', amount: 92000 },
      { code: 'HDF019', name: 'Hedge Diversified Fund', region: 'USA', amount: 78000 },
      { code: 'CIF020', name: 'Consumer Innovation Fund', region: 'JP', amount: 36000 },
    ];

    // this.invoices = [
    //   {
    //     invoiceNumber: 'INV-2024-001',
    //     fundName: 'Growth Equity Fund',
    //     vendorName: 'Tech Solutions Inc',
    //     invoiceDate: '2024-01-15',
    //     dueDate: '2024-02-15',
    //     expenseType: 'Software License',
    //     currency: 'USD',
    //     status: 'Paid',
    //     grossAmount: 15000,
    //     aging: 45,
    //   },
    //   {
    //     invoiceNumber: 'INV-2024-002',
    //     fundName: 'Tech Innovation Fund',
    //     vendorName: 'Cloud Services Ltd',
    //     invoiceDate: '2024-01-20',
    //     dueDate: '2024-02-20',
    //     expenseType: 'Infrastructure',
    //     currency: 'USD',
    //     status: 'Pending',
    //     grossAmount: 8500,
    //     aging: 40,
    //   },
    //   {
    //     invoiceNumber: 'INV-2024-003',
    //     fundName: 'Emerging Markets Fund',
    //     vendorName: 'Legal Advisors LLC',
    //     invoiceDate: '2024-01-25',
    //     dueDate: '2024-02-25',
    //     expenseType: 'Legal Services',
    //     currency: 'EUR',
    //     status: 'Approved',
    //     grossAmount: 12000,
    //     aging: 35,
    //   },
    //   {
    //     invoiceNumber: 'INV-2024-004',
    //     fundName: 'Bond Stability Fund',
    //     vendorName: 'Audit Partners',
    //     invoiceDate: '2024-01-30',
    //     dueDate: '2024-03-01',
    //     expenseType: 'Audit Fees',
    //     currency: 'USD',
    //     status: 'Rejected',
    //     grossAmount: 25000,
    //     aging: 30,
    //   },
    //   {
    //     invoiceNumber: 'INV-2024-005',
    //     fundName: 'Real Estate Fund',
    //     vendorName: 'Property Management Co',
    //     invoiceDate: '2024-02-05',
    //     dueDate: '2024-03-05',
    //     expenseType: 'Management Fees',
    //     currency: 'GBP',
    //     status: 'Received',
    //     grossAmount: 18500,
    //     aging: 24,
    //   },
    //   {
    //     invoiceNumber: 'INV-2024-006',
    //     fundName: 'Growth Equity Fund',
    //     vendorName: 'Marketing Agency Pro',
    //     invoiceDate: '2024-02-10',
    //     dueDate: '2024-03-10',
    //     expenseType: 'Marketing',
    //     currency: 'USD',
    //     status: 'Paid',
    //     grossAmount: 9200,
    //     aging: 19,
    //   },
    //   {
    //     invoiceNumber: 'INV-2024-007',
    //     fundName: 'Tech Innovation Fund',
    //     vendorName: 'Data Analytics Corp',
    //     invoiceDate: '2024-02-12',
    //     dueDate: '2024-03-12',
    //     expenseType: 'Consulting',
    //     currency: 'USD',
    //     status: 'Approved',
    //     grossAmount: 22000,
    //     aging: 17,
    //   },
    //   {
    //     invoiceNumber: 'INV-2024-008',
    //     fundName: 'Real Estate Fund',
    //     vendorName: 'Construction Services',
    //     invoiceDate: '2024-02-15',
    //     dueDate: '2024-03-15',
    //     expenseType: 'Maintenance',
    //     currency: 'GBP',
    //     status: 'Pending',
    //     grossAmount: 31500,
    //     aging: 14,
    //   },
    //   {
    //     invoiceNumber: 'INV-2024-009',
    //     fundName: 'Bond Stability Fund',
    //     vendorName: 'Financial Advisors Inc',
    //     invoiceDate: '2024-02-18',
    //     dueDate: '2024-03-18',
    //     expenseType: 'Advisory Fees',
    //     currency: 'USD',
    //     status: 'Received',
    //     grossAmount: 14800,
    //     aging: 11,
    //   },
    //   {
    //     invoiceNumber: 'INV-2024-010',
    //     fundName: 'Emerging Markets Fund',
    //     vendorName: 'Research Institute',
    //     invoiceDate: '2024-02-20',
    //     dueDate: '2024-03-20',
    //     expenseType: 'Research',
    //     currency: 'EUR',
    //     status: 'Rejected',
    //     grossAmount: 7500,
    //     aging: 9,
    //   },
    //   {
    //     invoiceNumber: 'INV-2024-011',
    //     fundName: 'Growth Equity Fund',
    //     vendorName: 'Office Supplies Ltd',
    //     invoiceDate: '2024-02-22',
    //     dueDate: '2024-03-22',
    //     expenseType: 'Office Expenses',
    //     currency: 'USD',
    //     status: 'Paid',
    //     grossAmount: 3200,
    //     aging: 7,
    //   },
    // ];

    this.calculateTotal();
    this.getInvoiceData();
  }

  getInvoiceData() {
    this.apiService
      .get('api/v1/Auth/getInvoice')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: any) => {
          this.invoices = res.data;
        },
      });
  }

  getPct(val: number): number {
    return Math.round((val / this.totalInvoices) * 100);
  }

  onTableFilter(event: any) {
    this.calculateTotal(event.filteredValue);
  }

  calculateTotal(filteredData?: any[]) {
    const data = filteredData || this.invoices;
    if (!data) {
      return;
    }
    this.filteredTotal = data.reduce((sum, invoice) => sum + invoice.grossAmount, 0);
  }

  onReviewInvoice() {
    if (this.selectedInvoices.length === 0) {
      return;
    }
    const invoiceIds = this.selectedInvoices.map((invoice) => invoice.invoiceNumber);
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_REVIEW, {
      invoiceIds: invoiceIds,
    });
  }

  onInvoiceRowSelect(event: any): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_REVIEW, {
      invoiceId: event.invoiceNumber,
    });
  }

  onCardClick(statusId: number): void {
    if (!statusId) {
      return;
    }
    let componentTitle = '';
    switch (statusId) {
      case 1:
        componentTitle = DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_ALL;
        break;
      case 2:
        componentTitle = DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_PENDING;
        break;
      case 3:
        componentTitle = DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_APPROVED;
        break;
      case 4:
        componentTitle = DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_REJECTED;
        break;
      case 5:
        componentTitle = DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_PAID;
        break;
      case 6:
        componentTitle = DIALOG_COMPONENT_TITLES.OTHERS.INVOICE_LIST_SCHEDULED;
        break;
      default:
        return;
    }
    this.dialogWindowService.showComponent(componentTitle, {
      statusId,
    });
    // this.router.navigate(['app/invoice/list'], { queryParams: { statusId } });
  }

  onPortfolioSelect(portfolio: any): void {
    this.dialogWindowService.showComponent(DIALOG_COMPONENT_TITLES.REPORTS.EXPENSES_REPORT, {
      showData: true,
    });
  }
}
