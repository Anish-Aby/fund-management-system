import { Injectable } from '@angular/core';

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
}
