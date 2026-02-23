import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
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
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    CheckboxModule,
    TableModule,
    DatePickerModule,
  ],
  templateUrl: './entity-add.html',
  styleUrl: './entity-add.scss',
})
export class EntityAdd {
  entityForm = new FormGroup({
    entityId: new FormControl(''),
    entityCode: new FormControl(''),
    entityName: new FormControl(''),
    shortName: new FormControl(''),
    entityType: new FormControl(''),
    industry: new FormControl(''),
    registrationNo: new FormControl(''),
    taxId: new FormControl(''),
    incorporationDate: new FormControl(''),
    status: new FormControl(''),
    addressLine1: new FormControl(''),
    addressLine2: new FormControl(''),
    city: new FormControl(''),
    postalCode: new FormControl(''),
    state: new FormControl(''),
    country: new FormControl(''),
    primaryEmail: new FormControl(''),
    phoneNumber: new FormControl(''),
    website: new FormControl(''),
    baseCurrency: new FormControl(''),
    reportingCurrency: new FormControl(''),
    fiscalYearStart: new FormControl(''),
    fiscalYearEnd: new FormControl(''),
    bankName: new FormControl(''),
    accountNumber: new FormControl(''),
    swiftCode: new FormControl(''),
    iban: new FormControl(''),
    timezone: new FormControl(''),
    dateFormat: new FormControl(''),
    numberFormat: new FormControl(''),
    language: new FormControl(''),
    multiCurrency: new FormControl(false),
    autoForex: new FormControl(false),
    approvalWorkflow: new FormControl(false),
    auditTrail: new FormControl(false),
    taxReporting: new FormControl(false),
    consolidation: new FormControl(false),
  });

  entityTypeOptions = [
    { label: 'Subsidiary', value: 'subsidiary' },
    { label: 'Branch', value: 'branch' },
    { label: 'Division', value: 'division' },
  ];

  industryOptions = [
    { label: 'Technology', value: 'technology' },
    { label: 'Finance', value: 'finance' },
    { label: 'Healthcare', value: 'healthcare' },
  ];

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  countryOptions = [
    { label: 'United States', value: 'US' },
    { label: 'United Kingdom', value: 'UK' },
    { label: 'Canada', value: 'CA' },
  ];

  monthOptions = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'December', value: '12' },
  ];

  timezoneOptions = [
    { label: 'UTC', value: 'UTC' },
    { label: 'EST', value: 'EST' },
    { label: 'PST', value: 'PST' },
  ];

  dateFormatOptions = [
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  ];

  numberFormatOptions = [
    { label: '1,234.56', value: 'en-US' },
    { label: '1.234,56', value: 'de-DE' },
  ];

  languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
  ];

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
    this.entityForm.reset();
  }

  saveEntity(): void {
    if (this.entityForm.valid) {
    }
  }
}
