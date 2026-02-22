import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule, FormsModule, ButtonModule, DialogModule, TextareaModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  note = '';

  constructor(
    public dialogService: ConfirmDialogService,
    public utilityService: UtilityService,
  ) {}

  get action() {
    return this.dialogService.config()?.severity === 'success' ? 'approve' : 'reject';
  }

  get invoice() {
    return this.dialogService.config()?.data?.invoice;
  }

  onConfirm() {
    this.dialogService.confirm(this.note);
    this.note = '';
  }

  onCancel() {
    this.dialogService.cancel();
    this.note = '';
  }
}
