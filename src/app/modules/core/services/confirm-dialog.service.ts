import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  severity: 'success' | 'danger' | 'warning' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  showComments?: boolean;
  data?: any;
}

export interface ConfirmDialogResult {
  confirmed: boolean;
  comments?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  visible = signal(false);
  config = signal<ConfirmDialogConfig | null>(null);
  private resolveCallback?: (result: ConfirmDialogResult) => void;

  open(config: ConfirmDialogConfig): Promise<ConfirmDialogResult> {
    this.config.set({
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      showComments: true,
      ...config,
    });
    this.visible.set(true);

    return new Promise((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  confirm(comments?: string) {
    const result: ConfirmDialogResult = {
      confirmed: true,
      comments,
      data: this.config()?.data,
    };
    this.close(result);
  }

  cancel() {
    const result: ConfirmDialogResult = {
      confirmed: false,
      data: this.config()?.data,
    };
    this.close(result);
  }

  private close(result: ConfirmDialogResult) {
    this.visible.set(false);
    if (this.resolveCallback) {
      this.resolveCallback(result);
      this.resolveCallback = undefined;
    }
    this.config.set(null);
  }
}
