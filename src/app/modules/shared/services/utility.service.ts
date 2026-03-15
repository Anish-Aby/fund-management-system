import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

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
}
