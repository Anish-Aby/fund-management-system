import { Component, signal } from '@angular/core';
import { StatCard } from '../../shared/components/stat-card/stat-card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SplitButtonModule } from 'primeng/splitbutton';
import { InputTextModule } from 'primeng/inputtext';
import vendorMockData from '../../core/mocks/vendor-list-mock.json';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';

interface Vendor {
  id: string;
  displayName: string;
  vendorName: string;
  vendorCode: string;
}

@Component({
  selector: 'app-vendor-list',
  imports: [StatCard, ButtonModule, TableModule, SplitButtonModule, InputTextModule],
  templateUrl: './vendor-list.html',
  styleUrl: './vendor-list.scss',
})
export class VendorList {
  vendors = signal<Vendor[]>(vendorMockData);
  selectedVendors = signal<Vendor[]>([]);

  constructor(public ref: DynamicDialogRef) {}

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }
}
