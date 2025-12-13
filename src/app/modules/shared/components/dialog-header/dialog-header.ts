import { Component, ElementRef, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DialogWindowService } from '../../services/dialog-window';
import { VendorList } from '../../../vendor/vendor-list/vendor-list';

@Component({
  selector: 'app-dialog',
  imports: [ButtonModule, ButtonGroupModule],
  templateUrl: './dialog-header.html',
  styleUrl: './dialog-header.scss',
})
export class DialogHeader {
  @ViewChild('headerTemplate') headerTemplate!: TemplateRef<any>;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private renderer: Renderer2,
    private host: ElementRef,
    private dialogWindowService: DialogWindowService
  ) {}

  closeDialog(): void {
    this.ref.close();
  }

  maximizeDialog(): void {
    const dialog = this.host.nativeElement.closest('.p-dialog');
    if (!dialog) return;

    const btn = dialog.querySelector('.p-dialog-maximize-button');
    if (!btn) return;

    this.renderer.listen(btn, 'click', () => {})(); // cleanup
    (btn as HTMLElement).click(); // trigger
  }

  minimizeDialog(): void {
    const title = this.config.data?.title || 'Dialog';
    const componentName = this.config.data?.componentName || 'Unknown';
    const component = this.config.data?.component;
    const config = {
      data: { title, componentName, component },
      draggable: true,
      resizable: true,
      modal: false,
      maximizable: true,
      position: 'center',
      templates: {
        header: DialogHeader,
      },
    };
    const state = this.config.data?.componentInstance || null;
    this.dialogWindowService.minimize(title, componentName, component, config, this.ref, state);
  }
}
