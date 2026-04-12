import { Injectable } from '@angular/core';

interface DragState {
  dragging: boolean;
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  prevRect?: DOMRect;
}

@Injectable({ providedIn: 'root' })
export class WindowDragSnapService {
  private state: DragState = {
    dragging: false,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
  };

  private previewEl?: HTMLElement;
  private readonly WORKSPACE_TOP = 100; // header + toolbar height
  private readonly WORKSPACE_BOTTOM_OFFSET = 40; // optional footer/taskbar if any

  private readonly SNAP_THRESHOLD = 32;

  init(dialog: HTMLElement, header: HTMLElement) {
    header.addEventListener('mousedown', (e) => this.startDrag(e, dialog));
  }

  private startDrag(e: MouseEvent, dialog: HTMLElement) {
    if ((e.target as HTMLElement).closest('.p-dialog-header-icon')) return;
    e.preventDefault();
    document.body.classList.add('app-dragging');
    dialog.style.position = 'fixed';
    dialog.style.margin = '0';
    dialog.style.transform = 'none';
    const rect = dialog.getBoundingClientRect();
    this.state.dragging = true;
    this.state.startX = e.clientX;
    this.state.startY = e.clientY;
    this.state.startLeft = rect.left;
    this.state.startTop = rect.top;
    this.state.prevRect = rect;
    dialog.style.transition = 'none';
    dialog.style.willChange = 'left, top, width, height';
    const move = (ev: MouseEvent) => this.onDrag(ev, dialog);
    const up = () => this.endDrag(dialog, move, up);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  private onDrag(e: MouseEvent, dialog: HTMLElement) {
    if (!this.state.dragging) return;
    this.showPreview();
    const dx = e.clientX - this.state.startX;
    const dy = e.clientY - this.state.startY;
    const left = this.state.startLeft + dx;
    let top = this.state.startTop + dy;
    if (top < this.WORKSPACE_TOP) {
      top = this.WORKSPACE_TOP;
    }
    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;
    this.checkSnapPreview(e.clientX, e.clientY, dialog);
  }

  private endDrag(dialog: HTMLElement, move: (e: MouseEvent) => void, up: () => void) {
    this.state.dragging = false;
    document.body.classList.remove('app-dragging');
    this.hidePreview();
    dialog.style.willChange = 'auto';
    dialog.style.transition = '';

    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);

    this.applySnap(dialog);
  }

  private snapType: 'left' | 'right' | 'top' | 'tl' | 'tr' | 'bl' | 'br' | null = null;

  private checkSnapPreview(x: number, y: number, dialog: HTMLElement) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const nearLeft = x <= this.SNAP_THRESHOLD;
    const nearRight = x >= vw - this.SNAP_THRESHOLD;
    const nearTop = y <= this.WORKSPACE_TOP + this.SNAP_THRESHOLD;
    const nearBottom = y >= vh - this.SNAP_THRESHOLD;

    if (nearLeft && nearTop) {
      this.snapType = 'tl';
    } else if (nearRight && nearTop) {
      this.snapType = 'tr';
    } else if (nearLeft && nearBottom) {
      this.snapType = 'bl';
    } else if (nearRight && nearBottom) {
      this.snapType = 'br';
    } else if (nearLeft) {
      this.snapType = 'left';
    } else if (nearRight) {
      this.snapType = 'right';
    } else if (nearTop) {
      this.snapType = 'top';
    } else {
      this.snapType = null;
    }
  }

  private applySnap(dialog: HTMLElement) {
    if (!this.snapType) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const workTop = this.WORKSPACE_TOP;
    const workHeight = vh - this.WORKSPACE_TOP - this.WORKSPACE_BOTTOM_OFFSET;

    dialog.style.transition = 'all 160ms ease';

    if (this.snapType === 'left') {
      dialog.style.left = '0px';
      dialog.style.top = `${workTop}px`;
      dialog.style.width = `${vw / 2}px`;
      dialog.style.height = `${workHeight}px`;
    }

    if (this.snapType === 'right') {
      dialog.style.left = `${vw / 2}px`;
      dialog.style.top = `${workTop}px`;
      dialog.style.width = `${vw / 2}px`;
      dialog.style.height = `${workHeight}px`;
    }

    if (this.snapType === 'top') {
      dialog.style.left = '0px';
      dialog.style.top = `${workTop}px`;
      dialog.style.width = `${vw}px`;
      dialog.style.height = `${workHeight}px`;
    }

    // top-left
    if (this.snapType === 'tl') {
      dialog.style.left = '0px';
      dialog.style.top = `${workTop}px`;
      dialog.style.width = `${vw / 2}px`;
      dialog.style.height = `${workHeight / 2}px`;
    }

    // top-right
    if (this.snapType === 'tr') {
      dialog.style.left = `${vw / 2}px`;
      dialog.style.top = `${workTop}px`;
      dialog.style.width = `${vw / 2}px`;
      dialog.style.height = `${workHeight / 2}px`;
    }

    // bottom-left
    if (this.snapType === 'bl') {
      dialog.style.left = '0px';
      dialog.style.top = `${workTop + workHeight / 2}px`;
      dialog.style.width = `${vw / 2}px`;
      dialog.style.height = `${workHeight / 2}px`;
    }

    // bottom-right
    if (this.snapType === 'br') {
      dialog.style.left = `${vw / 2}px`;
      dialog.style.top = `${workTop + workHeight / 2}px`;
      dialog.style.width = `${vw / 2}px`;
      dialog.style.height = `${workHeight / 2}px`;
    }

    this.snapType = null;
  }

  private ensurePreview() {
    if (this.previewEl) return;

    const el = document.createElement('div');
    el.className = 'app-snap-preview';

    Object.assign(el.style, {
      position: 'fixed',
      pointerEvents: 'none',
      background: '#2525254f',
      border: '2px dashed #000',
      borderRadius: '16px',
      zIndex: '9998',
      opacity: '0',
      transition: 'all 140ms ease',
    });

    document.body.appendChild(el);
    this.previewEl = el;
  }

  private showPreview() {
    this.ensurePreview();
    if (!this.previewEl) return;

    if (!this.snapType) {
      this.previewEl.style.opacity = '0';
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const top = this.WORKSPACE_TOP;
    const workHeight = vh - this.WORKSPACE_TOP - this.WORKSPACE_BOTTOM_OFFSET;

    let left = 0;
    let width = vw;
    let height = workHeight;
    let topPos = top;

    // halves
    if (this.snapType === 'left') {
      width = vw / 2;
    }

    if (this.snapType === 'right') {
      left = vw / 2;
      width = vw / 2;
    }

    if (this.snapType === 'top') {
      width = vw;
      height = workHeight;
    }

    if (this.snapType === 'tl') {
      width = vw / 2;
      height = workHeight / 2;
    }

    if (this.snapType === 'tr') {
      left = vw / 2;
      width = vw / 2;
      height = workHeight / 2;
    }

    if (this.snapType === 'bl') {
      width = vw / 2;
      height = workHeight / 2;
      topPos = top + workHeight / 2;
    }

    if (this.snapType === 'br') {
      left = vw / 2;
      width = vw / 2;
      height = workHeight / 2;
      topPos = top + workHeight / 2;
    }

    Object.assign(this.previewEl.style, {
      left: `${left}px`,
      top: `${topPos}px`,
      width: `${width}px`,
      height: `${height}px`,
      opacity: '1',
    });
  }

  private hidePreview() {
    if (!this.previewEl) return;
    this.previewEl.style.opacity = '0';
  }
}
