// import {
//   AfterViewChecked,
//   AfterViewInit,
//   Component,
//   ElementRef,
//   OnDestroy,
//   ViewChild,
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { DialogWindowService } from '../services/dialog-window-service';

// @Component({
//   selector: 'app-taskbar',
//   imports: [CommonModule],
//   templateUrl: './taskbar.html',
//   styleUrl: './taskbar.scss',
// })
// export class Taskbar implements AfterViewInit, OnDestroy {
//   @ViewChild('taskbarTrack') taskbarTrack!: ElementRef<HTMLDivElement>;
//   isOverflowing = false;
//   scrollPos = 0;
//   private resizeObserver!: ResizeObserver;
//   constructor(public dialogWindowService: DialogWindowService) {}

//   ngAfterViewInit(): void {
//     const el = this.taskbarTrack?.nativeElement;
//     if (!el) return;

//     this.resizeObserver = new ResizeObserver(() => {
//       this.isOverflowing = el.scrollWidth > el.clientWidth;
//     });
//     this.resizeObserver.observe(el);
//   }

//   ngOnDestroy(): void {
//     this.resizeObserver?.disconnect();
//   }

//   onTrackScroll(): void {
//     this.scrollPos = this.taskbarTrack.nativeElement.scrollLeft;
//   }

//   scrollLeft(): void {
//     this.taskbarTrack.nativeElement.scrollBy({ left: -160, behavior: 'smooth' });
//   }

//   scrollRight(): void {
//     this.taskbarTrack.nativeElement.scrollBy({ left: 160, behavior: 'smooth' });
//   }
// }
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DialogWindowService } from '../services/dialog-window-service';

@Component({
  selector: 'app-taskbar',
  imports: [CommonModule],
  templateUrl: './taskbar.html',
  styleUrl: './taskbar.scss',
})
export class Taskbar implements AfterViewInit, OnDestroy {
  @ViewChild('taskbarTrack') taskbarTrack!: ElementRef<HTMLDivElement>;

  isOverflowing = false;
  scrollPos = 0;

  private resizeObserver!: ResizeObserver;
  private windowsSub!: Subscription;

  constructor(
    public dialogWindowService: DialogWindowService,
    private zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    const el = this.taskbarTrack?.nativeElement;
    if (!el) return;

    // Watch element resize (window resize, sidebar collapse etc.)
    this.resizeObserver = new ResizeObserver(() => {
      // Run inside Angular zone so change detection picks it up
      this.zone.run(() => this.checkOverflow());
    });
    this.resizeObserver.observe(el);

    // Also re-check whenever the windows list changes
    // (adding/removing tabs changes scrollWidth but not clientWidth)
    this.windowsSub = this.dialogWindowService.windowsObservable$.subscribe(() => {
      // Wait one tick for the DOM to render the new tab first
      setTimeout(() => this.zone.run(() => this.checkOverflow()), 0);
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.windowsSub?.unsubscribe();
  }

  private checkOverflow(): void {
    const el = this.taskbarTrack?.nativeElement;
    if (!el) return;
    this.isOverflowing = el.scrollWidth > el.clientWidth;
  }

  onTrackScroll(): void {
    this.scrollPos = this.taskbarTrack.nativeElement.scrollLeft;
  }

  scrollLeft(): void {
    this.taskbarTrack.nativeElement.scrollBy({ left: -160, behavior: 'smooth' });
  }

  scrollRight(): void {
    this.taskbarTrack.nativeElement.scrollBy({ left: 160, behavior: 'smooth' });
  }
}
