import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { TableModule } from 'primeng/table';
import UserMockData from '../../core/mocks/users-list-mock.json';

interface Role {
  label: string;
  value: string;
}

interface Entity {
  label: string;
  value: string;
}

interface Fund {
  label: string;
  value: string;
}

@Component({
  selector: 'app-user-add',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TabsModule,
    InputTextModule,
    ButtonModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    PasswordModule,
    TableModule,
  ],
  templateUrl: './user-add.html',
  styleUrl: './user-add.scss',
})
export class UserAdd {
  userForm: FormGroup;

  userData = signal(UserMockData);

  selectedUser = signal<any | null>(null);
  selectedUsers = signal<any | null>(null);

  isViewMode = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isAddMode = signal<boolean>(true);

  titleOptions = [
    { label: 'Mr', value: 'mr' },
    { label: 'Ms', value: 'ms' },
    { label: 'Dr', value: 'dr' },
    { label: 'Mrs', value: 'mrs' },
  ];

  roleOptions: Role[] = [
    { label: 'Admin', value: 'admin' },
    { label: 'Manager', value: 'manager' },
    { label: 'Analyst', value: 'analyst' },
    { label: 'Viewer', value: 'viewer' },
  ];

  entityOptions: Entity[] = [
    { label: 'Entity 1', value: 'entity1' },
    { label: 'Entity 2', value: 'entity2' },
    { label: 'Entity 3', value: 'entity3' },
  ];

  fundOptions: Fund[] = [
    { label: 'Fund A', value: 'fundA' },
    { label: 'Fund B', value: 'fundB' },
    { label: 'Fund C', value: 'fundC' },
  ];

  departmentOptions = [
    { label: 'Finance', value: 'finance' },
    { label: 'Fund Accounting', value: 'fund_accounting' },
    { label: 'Operations', value: 'operations' },
    { label: 'Compliance', value: 'compliance' },
  ];

  timezoneOptions = [
    { label: 'GMT', value: 'gmt' },
    { label: 'EST', value: 'est' },
    { label: 'PST', value: 'pst' },
    { label: 'CET', value: 'cet' },
  ];

  loginMethodOptions = [
    { label: 'Password', value: 'password' },
    { label: 'SSO', value: 'sso' },
    { label: 'OTP', value: 'otp' },
  ];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      userId: [{ value: '', disabled: true }],
      title: [''],
      firstName: [''],
      middleName: [''],
      lastName: [''],
      displayName: [''],
      organizationName: [''],
      employeeId: [''],
      emailAddress: [''],
      mobileNumber: [''],
      alternateContact: [''],
      role: [''],
      legalEntities: [[]],
      funds: [[]],
      department: [''],
      officeLocation: [''],
      timezone: [''],
      username: [''],
      password: [''],
      loginMethod: [''],
      ipRestriction: [''],
      deviceRestriction: [''],
      passwordExpiry: [''],
      twoFactorEnabled: [true],
      isMaker: [false],
      isChecker: [false],
      isApprover: [false],
      emailNotifications: [true],
      invoiceUploaded: [false],
      invoiceReviewed: [false],
      paymentApproved: [false],
      paymentReleased: [false],
      invoiceOverdue: [false],
    });
  }

  onSaveUser(): void {
    console.log('User Form Value:', this.userForm.value);
  }

  clearVendorSelection(): void {
    this.selectedUser.set(null);
    this.isViewMode.set(false);
    this.isEditMode.set(false);
    this.isAddMode.set(true);
  }

  viewEntity(entity: any): void {
    this.selectedUser.set(entity);
    this.isViewMode.set(true);
    this.isEditMode.set(false);
    this.isAddMode.set(false);
  }

  editEntity(entity: any): void {
    this.selectedUser.set(entity);
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
    this.selectedUser.set(null);
    this.isViewMode.set(false);
    this.isEditMode.set(false);
    this.isAddMode.set(true);
  }
}
