// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-global-search',
//   imports: [],
//   templateUrl: './global-search.html',
//   styleUrl: './global-search.scss',
// })
// export class GlobalSearch {

// }

import {
  Component,
  signal,
  computed,
  ViewChild,
  ElementRef,
  HostListener,
  inject,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { SearchItem, SearchService } from './service/search-service';
import { ThemeService } from '../core/services/theme';

export interface ResultGroup {
  section: string;
  items: (SearchItem & { globalIndex: number })[];
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-search.html',
  styleUrl: './global-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchComponent implements OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('resultsList') resultsList!: ElementRef<HTMLElement>;

  readonly searchService = inject(SearchService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  activeIndex = signal(0);
  inputValue = '';

  private querySignal = signal('');
  private querySubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private cachedRecents: SearchItem[] = [];

  groups = computed<ResultGroup[]>(() => {
    const q = this.querySignal();
    if (!q.trim()) return this.buildGroups(this.cachedRecents, true);
    return this.buildGroups(this.searchService.search(q), false);
  });

  isRecentMode = computed(() => !this.querySignal().trim());
  flatResults = computed(() => this.groups().flatMap((g) => g.items));

  readonly sectionMeta: Record<string, { label: string; dot: string }> = {
    invoices: { label: 'Invoices', dot: '#38bdf8' },
    reports: { label: 'Reports', dot: '#a78bfa' },
    journal: { label: 'Journal', dot: '#fbbf24' },
    forex: { label: 'Forex', dot: '#34d399' },
    entities: { label: 'Entities', dot: '#818cf8' },
    settings: { label: 'Settings', dot: '#94a3b8' },
    actions: { label: 'Actions', dot: '#f87171' },
    recent: { label: 'Recent', dot: '#94a3b8' },
  };

  constructor() {
    this.querySubject
      .pipe(debounceTime(80), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.querySignal.set(q);
        this.activeIndex.set(0);
      });
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKey(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      this.searchService.isOpen() ? this.close() : this.open();
      return;
    }
    if (!this.searchService.isOpen()) return;

    switch (e.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.activeIndex.update((i) => Math.min(i + 1, this.flatResults().length - 1));
        this.scrollActiveIntoView();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.activeIndex.update((i) => Math.max(i - 1, 0));
        this.scrollActiveIntoView();
        break;
      case 'Enter':
        e.preventDefault();
        const item = this.flatResults()[this.activeIndex()];
        if (item) this.navigate(item);
        break;
    }
  }

  open() {
    this.cachedRecents = this.searchService.getRecents();
    this.inputValue = '';
    this.querySignal.set('');
    this.activeIndex.set(0);
    this.searchService.open();
    requestAnimationFrame(() => this.searchInput?.nativeElement?.focus());
  }

  close() {
    this.searchService.close();
    this.inputValue = '';
    this.querySignal.set('');
    this.activeIndex.set(0);
  }

  onInput(value: string) {
    this.inputValue = value;
    this.querySubject.next(value);
  }

  navigate(item: SearchItem) {
    this.searchService.pushRecent(item);
    this.close(); // close first so dialog opens cleanly on top

    if (item.path.startsWith('__dialog:')) {
      this.searchService.openDialog(item);
    } else if (item.path.startsWith('__action:')) {
      this.handleAction(item.path.replace('__action:', ''));
    } else {
      this.router.navigateByUrl('/' + item.path);
    }
  }

  handleAction(action: string) {
    if (action === 'toggleTheme') this.themeService.toggleTheme();
    if (action === 'logout') this.router.navigate(['/login']);
  }

  clearRecents(e: Event) {
    e.stopPropagation();
    this.searchService.clearRecents();
    this.cachedRecents = [];
    this.querySignal.set('');
  }

  getSectionMeta(section: string) {
    return this.sectionMeta[section] ?? this.sectionMeta['settings'];
  }

  onBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('search-backdrop')) this.close();
  }

  private buildGroups(items: SearchItem[], isRecent: boolean): ResultGroup[] {
    if (isRecent) {
      if (!items.length) return [];
      return [
        {
          section: 'recent',
          items: items.map((item, i) => Object.assign(Object.create(item), { globalIndex: i })),
        },
      ];
    }

    const sectionOrder = [
      'invoices',
      'reports',
      'journal',
      'forex',
      'entities',
      'settings',
      'actions',
    ];
    const groups: ResultGroup[] = [];
    let gi = 0;

    for (const section of sectionOrder) {
      const sectionItems: (SearchItem & { globalIndex: number })[] = [];
      for (const item of items) {
        if (item.section === section) {
          (item as any).globalIndex = gi++;
          sectionItems.push(item as SearchItem & { globalIndex: number });
        }
      }
      if (sectionItems.length) groups.push({ section, items: sectionItems });
    }
    return groups;
  }

  private scrollActiveIntoView() {
    requestAnimationFrame(() => {
      this.resultsList?.nativeElement
        ?.querySelector('.result-item--active')
        ?.scrollIntoView({ block: 'nearest' });
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
