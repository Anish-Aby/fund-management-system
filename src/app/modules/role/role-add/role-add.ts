import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { InputText } from 'primeng/inputtext';
import { FieldsetModule } from 'primeng/fieldset';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import RoleMockData from '../../core/mocks/role-list-mock.json';

@Component({
  selector: 'app-role-add',
  imports: [
    TableModule,
    ButtonModule,
    CheckboxModule,
    ReactiveFormsModule,
    FieldsetModule,
    FormsModule,
    CommonModule,
    TabsModule,
    InputText,
  ],
  templateUrl: './role-add.html',
  styleUrl: './role-add.scss',
})
export class RoleAdd {
  roleForm: FormGroup;

  isViewMode = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  isAddMode = signal<boolean>(true);

  selectedRole = signal<any>(null);

  rolesData = signal<any[]>(RoleMockData);
  selectedRoles = signal<any[]>([]);

  menuCategories = [
    {
      name: 'File',
      icon: 'pi pi-folder',
      permissions: [
        { name: 'Add Invoice', key: 'addInvoice' },
        { name: 'Journal Entry', key: 'journalEntry' },
        { name: 'Reconciliation', key: 'reconciliation' },
        { name: 'Import File', key: 'importFile' },
        { name: 'Export File', key: 'exportFile' },
      ],
    },
    {
      name: 'Masters',
      icon: 'pi pi-star',
      permissions: [
        { name: 'Entities', key: 'entities' },
        { name: 'Users', key: 'users' },
        { name: 'Vendors', key: 'vendors' },
        { name: 'Expenses', key: 'expenses' },
        { name: 'Portfolio', key: 'portfolio' },
        { name: 'Roles', key: 'roles' },
      ],
    },
    {
      name: 'Reports',
      icon: 'pi pi-search',
      permissions: [
        { name: 'Ledger Report', key: 'ledgerReport' },
        { name: 'Expenses Report', key: 'expensesReport' },
        { name: 'Cash Balance', key: 'cashBalance' },
        { name: 'Fund Cash Balance', key: 'fundCashBalance' },
        { name: 'Tax Report', key: 'taxReport' },
      ],
    },
    {
      name: 'Tools',
      icon: 'pi pi-wrench',
      permissions: [
        { name: 'Lock Period', key: 'lockPeriod' },
        { name: 'Forex Pricing', key: 'forexPricing' },
        { name: 'Split Invoice', key: 'splitInvoice' },
        { name: 'Invoice Error', key: 'invoiceError' },
      ],
    },
    {
      name: 'Settings',
      icon: 'pi pi-cog',
      permissions: [
        { name: 'Backup Schedule', key: 'backupSchedule' },
        { name: 'Audit Trail', key: 'auditTrail' },
      ],
    },
  ];

  constructor(private fb: FormBuilder) {
    this.roleForm = this.createForm();
  }

  private createForm(): FormGroup {
    const formControls: any = {
      roleName: [''],
    };

    this.menuCategories.forEach((category) => {
      formControls[`${category.name.toLowerCase()}SelectAll`] = [false];
      formControls[`${category.name.toLowerCase()}CreateAll`] = [false];
      formControls[`${category.name.toLowerCase()}ReadAll`] = [false];
      formControls[`${category.name.toLowerCase()}UpdateAll`] = [false];
      formControls[`${category.name.toLowerCase()}DeleteAll`] = [false];
      category.permissions.forEach((permission) => {
        ['create', 'read', 'update', 'delete'].forEach((action) => {
          formControls[`${permission.key}_${action}`] = [false];
        });
      });
    });

    return this.fb.group(formControls);
  }

  onSelectAll(categoryName: string): void {
    const category = this.menuCategories.find((c) => c.name === categoryName);
    if (!category) return;

    const selectAllValue = this.roleForm.get(`${categoryName.toLowerCase()}SelectAll`)?.value;

    category.permissions.forEach((permission) => {
      ['create', 'read', 'update', 'delete'].forEach((action) => {
        this.roleForm.get(`${permission.key}_${action}`)?.setValue(selectAllValue);
      });
    });
  }

  togglePermission(permissionKey: string, action: string): void {
    const controlName = `${permissionKey}_${action}`;
    const control = this.roleForm.get(controlName);
    if (control) {
      control.setValue(!control.value);
    }
  }

  onSelectColumn(categoryName: string, action: string): void {
    const category = this.menuCategories.find((c) => c.name === categoryName);
    if (!category) return;

    const columnSelectValue = this.roleForm.get(
      `${categoryName.toLowerCase()}${action.charAt(0).toUpperCase() + action.slice(1)}All`,
    )?.value;

    category.permissions.forEach((permission) => {
      this.roleForm.get(`${permission.key}_${action}`)?.setValue(columnSelectValue);
    });
  }

  onSaveRole(): void {
    console.log('Role Form Value:', this.roleForm.value);
  }

  clearRoleSelection(): void {
    this.selectedRole.set(null);
    this.isViewMode.set(false);
    this.isEditMode.set(false);
    this.isAddMode.set(true);
  }

  viewRole(entity: any): void {
    this.selectedRole.set(entity);
    this.isViewMode.set(true);
    this.isEditMode.set(false);
    this.isAddMode.set(false);
  }

  editRole(entity: any): void {
    this.selectedRole.set(entity);
    this.isViewMode.set(false);
    this.isEditMode.set(true);
    this.isAddMode.set(false);
  }

  deleteRole(entity: any): void {
    // this.selectedEntities.set(vendor);
    // this.isViewMode.set(false);
    // this.isEditMode.set(true);
    // this.isAddMode.set(false);
  }
}
