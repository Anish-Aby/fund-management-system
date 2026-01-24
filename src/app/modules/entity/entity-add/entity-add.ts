import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import EntityMockData from '../../core/mocks/entity-list-mock.json';

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
    TableModule,
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

  entityData = signal(EntityMockData);
  selectedEntities = signal<any[] | null>([]);

  isEditMode = signal<boolean>(false);
  selectedEntity = signal<any | null>(null);
  isViewMode = signal<boolean>(false);
  isAddMode = signal<boolean>(true);

  selectedTaxType: string | null = null;
  taxPercentage: number | null = null;
  allowedVendor: boolean = false;
  selectedBaseCurrency: string | null = null;

  viewEntity(entity: any): void {
    this.selectedEntity.set(entity);
    this.isViewMode.set(true);
    this.isEditMode.set(false);
    this.isAddMode.set(false);
  }

  editEntity(entity: any): void {
    this.selectedEntity.set(entity);
    this.isViewMode.set(false);
    this.isEditMode.set(true);
    this.isAddMode.set(false);
  }

  deleteEntity(entity: any): void {
    // this.selectedEntities.set(vendor);
    // this.isViewMode.set(false);
    // this.isEditMode.set(true);
    // this.isAddMode.set(false);
  }

  clearEntitySelection(): void {
    this.selectedEntity.set(null);
    this.isViewMode.set(false);
    this.isEditMode.set(false);
    this.isAddMode.set(true);
  }
}
