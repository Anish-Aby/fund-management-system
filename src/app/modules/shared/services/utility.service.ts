import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { BankCascadeIds } from '../../bank-management/models/bank-management.model';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  public getSeverity(status: string) {
    switch (status.toLowerCase()) {
      case 'rejected':
        return 'danger';
      case 'approved':
      case 'done':
        return 'success';
      case 'received':
        return 'info';
      case 'pending':
        return 'warn';
      case 'paid':
        return 'secondary';
      default:
        return null;
    }
  }

  public getStatusPillClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'received':
        return 'status-pill status-pill--received';
      case 'pending':
        return 'status-pill status-pill--pending';
      case 'approved':
      case 'done':
        return 'status-pill status-pill--approved';
      case 'rejected':
        return 'status-pill status-pill--rejected';
      case 'scheduled':
        return 'status-pill status-pill--scheduled';
      case 'paid':
        return 'status-pill status-pill--paid';
      default:
        return 'status-pill status-pill--default';
    }
  }

  public getStatusDotClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'received':
        return 'status-dot status-dot--received';
      case 'pending':
        return 'status-dot status-dot--pending';
      case 'approved':
      case 'done':
        return 'status-dot status-dot--approved';
      case 'rejected':
        return 'status-dot status-dot--rejected';
      case 'scheduled':
        return 'status-dot status-dot--scheduled';
      case 'paid':
        return 'status-dot status-dot--paid';
      default:
        return 'status-dot status-dot--default';
    }
  }

  public formatDate(date: Date | string, format: string = 'MM/dd/yyyy'): string {
    if (!date) {
      return '';
    }
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    switch (format) {
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'MM/dd/yyyy':
      default:
        return `${month}/${day}/${year}`;
    }
  }

  public getCurrencySymbol(currencyCode: string | null, locale: string = 'en'): string {
    if (!currencyCode) return '';
    try {
      const parts = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay: 'symbol',
      }).formatToParts(0);
      return parts.find((p) => p.type === 'currency')?.value || currencyCode;
    } catch {
      return currencyCode;
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pw = control.get('password')?.value;
    const cp = control.get('confirmPassword')?.value;
    if (!cp) return null;
    return pw === cp ? null : { mismatch: true };
  }

  isFieldInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getFieldError(form: FormGroup, field: string): string {
    const c = form.get(field);
    if (!c?.errors) return '';
    if (c.errors['required']) return 'This field is required';
    if (c.errors['email']) return 'Please enter a valid email address';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} characters`;
    if (c.errors['maxlength']) return `Maximum ${c.errors['maxlength'].requiredLength} characters`;
    if (c.errors['pattern']) {
      switch (field) {
        case 'contactPhoneNo':
          return 'Must be exactly 10 digits (numbers only)';
        case 'swiftNo':
          return 'Invalid SWIFT/BIC format (e.g. CHASUS33 or CHASUS33XXX)';
        case 'achNo':
          return 'ACH number must be exactly 9 digits';
        case 'routingNumber':
          return 'Routing number must be exactly 9 digits';
        case 'zipCode':
          return 'Enter a valid zip/postal code (4–10 characters)';
        default:
          return 'Invalid format';
      }
    }
    return 'Invalid value';
  }

  extractBankCascadeIds(bank: any): BankCascadeIds {
    return {
      regionId: bank.bankRegionId ?? null,
      countryId: bank.bankCountryId ?? null,
      currencyId: bank.accountCurrencyId ?? null,
      countryStateMasterId: bank.countryStateMasterId ?? null,
      stateCityMasterId: bank.stateCityMasterId ?? null,
    };
  }
}
