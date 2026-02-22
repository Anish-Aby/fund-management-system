import { Component, ElementRef, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
// import { DialogWindowService } from '../../services/dialog-window';
import { VendorList } from '../../../vendor/vendor-list/vendor-list';
import { DialogWindowService } from '../../../core/services/dialog-window-service';
import { WindowResizeService } from '../../../core/services/window-resize-service';
import { WindowDragSnapService } from '../../../core/services/window-drag-snap-service';

@Component({
  selector: 'app-dialog',
  imports: [ButtonModule, ButtonGroupModule],
  templateUrl: './dialog-header.html',
  styleUrl: './dialog-header.scss',
})
export class DialogHeader {
  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private renderer: Renderer2,
    private host: ElementRef,
    private dialogWindowService: DialogWindowService,
    private resizeService: WindowResizeService,
    private dragSnapService: WindowDragSnapService,
  ) {}

  get data() {
    return this.config.data;
  }

  ngAfterViewInit(): void {
    const dialogEl = this.host.nativeElement.closest('.p-dialog');
    const maskEl = this.host.nativeElement.closest('.p-dialog-mask');
    if (dialogEl && !dialogEl.classList.contains('p-dialog-maximized')) {
      this.resizeService.init(dialogEl);
    }
    if (this.data?.windowId) {
      this.dialogWindowService.attachElement(this.data.windowId, {
        mask: maskEl as HTMLElement | null,
        dialog: dialogEl as HTMLElement | null,
      });
    }
    const headerEl = this.host.nativeElement.closest('.p-dialog-header');
    if (dialogEl && headerEl) {
      this.dragSnapService.init(dialogEl, headerEl);
    }
    headerEl?.addEventListener('mousedown', (e: MouseEvent) => {
      const dlg = dialogEl as HTMLElement | null;
      if (dlg?.classList.contains('p-dialog-maximized')) {
        e.stopImmediatePropagation();
      }
    });
    if (this.data?.autoMaximize) {
      Promise.resolve().then(() => this.maximizeDialog());
    }
  }

  closeDialog(): void {
    this.ref.close();
  }

  maximizeDialog(): void {
    const dialog = this.host.nativeElement.closest('.p-dialog') as HTMLElement | null;
    if (!dialog) return;
    const btn = dialog.querySelector('.p-dialog-maximize-button') as HTMLElement | null;
    if (!btn) return;
    btn.click();
    requestAnimationFrame(() => {
      const isMaximized = dialog.classList.contains('p-dialog-maximized');
      if (!isMaximized) {
        this.centerDialog(dialog);
        this.resizeService.init(dialog);
      }
    });
  }

  private centerDialog(dialog: HTMLElement) {
    const rect = dialog.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const left = Math.max(16, (viewportWidth - rect.width) / 2);
    const top = Math.max(114, (viewportHeight - rect.height) / 2);
    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;
  }

  minimizeDialog(): void {
    this.dialogWindowService.minimize(this.config.data?.windowId);
  }
}
