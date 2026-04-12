import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WindowResizeService {
  private active = false;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;
  private startLeft = 0;
  private startTop = 0;
  private direction: string = '';

  private rafPending = false;

  private readonly SNAP_THRESHOLD = 24;
  private readonly MIN_WIDTH = 400;
  private readonly MIN_HEIGHT = 250;

  init(dialog: HTMLElement) {
    this.addHandles(dialog);
  }

  private addHandles(dialog: HTMLElement) {
    const directions = ['right', 'left', 'top', 'bottom', 'br', 'bl', 'tr', 'tl'];

    directions.forEach((dir) => {
      const handle = document.createElement('div');
      handle.className = `app-window-resize-handle app-resize-${dir}`;
      handle.addEventListener('mousedown', (e) => this.startResize(e, dialog, dir));
      dialog.appendChild(handle);
    });
  }

  private startResize(e: MouseEvent, dialog: HTMLElement, dir: string) {
    e.preventDefault();
    e.stopPropagation();

    const rect = dialog.getBoundingClientRect();

    this.active = true;
    this.direction = dir;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth = rect.width;
    this.startHeight = rect.height;
    this.startLeft = rect.left;
    this.startTop = rect.top;

    dialog.style.willChange = 'width, height, left, top';

    const move = (ev: MouseEvent) => this.onResize(ev, dialog);
    const up = () => {
      this.active = false;
      this.rafPending = false;

      dialog.style.willChange = 'auto';

      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  private onResize(e: MouseEvent, dialog: HTMLElement) {
    if (!this.active) return;
    if (this.rafPending) return;

    this.rafPending = true;

    requestAnimationFrame(() => {
      this.rafPending = false;

      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      const flags = this.getDirectionFlags(this.direction);

      let width = this.startWidth;
      let height = this.startHeight;
      let left = this.startLeft;
      let top = this.startTop;

      // horizontal
      if (flags.right) width += dx;

      if (flags.left) {
        width -= dx;
        left += dx;
      }

      // vertical
      if (flags.bottom) height += dy;

      if (flags.top) {
        height -= dy;
        top += dy;
      }
      width = Math.max(width, this.MIN_WIDTH);
      height = Math.max(height, this.MIN_HEIGHT);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (Math.abs(left) < this.SNAP_THRESHOLD) left = 0;
      if (Math.abs(top) < this.SNAP_THRESHOLD) top = 0;
      if (Math.abs(vw - (left + width)) < this.SNAP_THRESHOLD) {
        left = vw - width;
      }
      if (Math.abs(vh - (top + height)) < this.SNAP_THRESHOLD) {
        top = vh - height;
      }
      dialog.style.width = `${width}px`;
      dialog.style.height = `${height}px`;
      dialog.style.left = `${left}px`;
      dialog.style.top = `${top}px`;
    });
  }

  private getDirectionFlags(dir: string) {
    return {
      right: dir === 'right' || dir === 'br' || dir === 'tr',
      left: dir === 'left' || dir === 'bl' || dir === 'tl',
      top: dir === 'top' || dir === 'tr' || dir === 'tl',
      bottom: dir === 'bottom' || dir === 'br' || dir === 'bl',
    };
  }
}
