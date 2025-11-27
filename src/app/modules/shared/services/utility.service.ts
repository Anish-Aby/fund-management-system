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
}
