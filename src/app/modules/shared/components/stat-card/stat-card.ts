// import { CommonModule } from '@angular/common';
// import { Component, Input } from '@angular/core';

// export type CardColor = 'transparent' | 'indigo' | 'green' | 'amber' | 'rose' | 'sky' | 'purple';

// const COLOR_ICONS: Record<CardColor, string> = {
//   indigo: 'pi-inbox',
//   green: 'pi-check-circle',
//   amber: 'pi-clock',
//   rose: 'pi-times-circle',
//   sky: 'pi-send',
//   purple: 'pi-calendar',
//   transparent: 'pi-chart-bar',
// };

// @Component({
//   selector: 'app-stat-card',
//   imports: [CommonModule],
//   templateUrl: './stat-card.html',
//   styleUrl: './stat-card.scss',
// })
// export class StatCard {
//   @Input() title: string = '';
//   @Input() value: string | number = '';
//   @Input() subtitle: string = '';
//   @Input() color: CardColor = 'indigo';
//   @Input() total: number = 0;
//   @Input() lastUpdated: string = '—';
//   @Input() badge: string = '';

//   get percentage(): number {
//     if (!this.total) return 0;
//     return Math.min(Math.round((+this.value / this.total) * 100), 100);
//   }

//   get fraction(): string {
//     return `${this.value} / ${this.total}`;
//   }

//   getCardClasses(): string {
//     return [
//       'relative bg-white rounded-xl border border-slate-200/80 px-3.5 py-3 flex flex-col h-full cursor-pointer overflow-hidden',
//       'shadow-[0_1px_3px_rgba(0,0,0,0.05)]',
//       'transition-all duration-200 ease-out',
//       'hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-0.5',
//     ].join(' ');
//   }

//   getGradientClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'bg-gradient-to-br from-indigo-50 via-transparent to-transparent',
//       green: 'bg-gradient-to-br from-emerald-50 via-transparent to-transparent',
//       amber: 'bg-gradient-to-br from-amber-50 via-transparent to-transparent',
//       rose: 'bg-gradient-to-br from-rose-50 via-transparent to-transparent',
//       sky: 'bg-gradient-to-br from-sky-50 via-transparent to-transparent',
//       purple: 'bg-gradient-to-br from-violet-50 via-transparent to-transparent',
//       transparent: 'bg-gradient-to-br from-slate-50 via-transparent to-transparent',
//     };
//     return map[this.color];
//   }

//   getAccentBarClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'bg-indigo-500',
//       green: 'bg-emerald-500',
//       amber: 'bg-amber-500',
//       rose: 'bg-rose-500',
//       sky: 'bg-sky-500',
//       purple: 'bg-violet-500',
//       transparent: 'bg-slate-300',
//     };
//     return map[this.color];
//   }

//   getIconBgClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'bg-indigo-100',
//       green: 'bg-emerald-100',
//       amber: 'bg-amber-100',
//       rose: 'bg-rose-100',
//       sky: 'bg-sky-100',
//       purple: 'bg-violet-100',
//       transparent: 'bg-slate-100',
//     };
//     return map[this.color];
//   }

//   getIconClass(): string {
//     const map: Record<string, string> = {
//       indigo: 'pi-file-edit', // All Invoices
//       amber: 'pi-clock', // Pending
//       green: 'pi-check-circle', // Approved
//       rose: 'pi-times-circle', // Rejected
//       purple: 'pi-calendar', // Scheduled
//       sky: 'pi-verified', // Paid
//     };
//     return map[this.color] ?? 'pi-circle';
//   }

//   getTrendBgClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'bg-indigo-50',
//       green: 'bg-emerald-50',
//       amber: 'bg-amber-50',
//       rose: 'bg-rose-50',
//       sky: 'bg-sky-50',
//       purple: 'bg-violet-50',
//       transparent: 'bg-slate-50',
//     };
//     return map[this.color];
//   }

//   getTrendColor(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'text-indigo-500',
//       green: 'text-emerald-500',
//       amber: 'text-amber-500',
//       rose: 'text-rose-500',
//       sky: 'text-sky-500',
//       purple: 'text-violet-500',
//       transparent: 'text-slate-400',
//     };
//     return map[this.color];
//   }

//   getValueClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'text-indigo-600',
//       green: 'text-emerald-600',
//       amber: 'text-amber-600',
//       rose: 'text-rose-600',
//       sky: 'text-sky-600',
//       purple: 'text-violet-600',
//       transparent: 'text-slate-800',
//     };
//     return map[this.color];
//   }

//   getDividerClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'border-indigo-100',
//       green: 'border-emerald-100',
//       amber: 'border-amber-100',
//       rose: 'border-rose-100',
//       sky: 'border-sky-100',
//       purple: 'border-violet-100',
//       transparent: 'border-slate-100',
//     };
//     return map[this.color];
//   }

//   getDotClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'bg-indigo-400',
//       green: 'bg-emerald-400',
//       amber: 'bg-amber-400',
//       rose: 'bg-rose-400',
//       sky: 'bg-sky-400',
//       purple: 'bg-violet-400',
//       transparent: 'bg-slate-300',
//     };
//     return map[this.color];
//   }

//   getAmountClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'text-indigo-600',
//       green: 'text-emerald-600',
//       amber: 'text-amber-600',
//       rose: 'text-rose-600',
//       sky: 'text-sky-600',
//       purple: 'text-violet-600',
//       transparent: 'text-slate-600',
//     };
//     return map[this.color];
//   }

//   // New methods needed for enriched design
//   getWatermarkClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: `pi-inbox text-indigo-600`,
//       green: `pi-check-circle text-emerald-600`,
//       amber: `pi-clock text-amber-600`,
//       rose: `pi-times-circle text-rose-600`,
//       sky: `pi-send text-sky-600`,
//       purple: `pi-calendar text-violet-600`,
//       transparent: `pi-chart-bar text-slate-600`,
//     };
//     return map[this.color];
//   }

//   getBarClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'bg-indigo-500',
//       green: 'bg-emerald-500',
//       amber: 'bg-amber-500',
//       rose: 'bg-rose-500',
//       sky: 'bg-sky-500',
//       purple: 'bg-violet-500',
//       transparent: 'bg-slate-400',
//     };
//     return map[this.color];
//   }

//   getChangeBgClass(): string {
//     const map: Record<CardColor, string> = {
//       indigo: 'bg-indigo-50',
//       green: 'bg-emerald-50',
//       amber: 'bg-amber-50',
//       rose: 'bg-rose-50',
//       sky: 'bg-sky-50',
//       purple: 'bg-violet-50',
//       transparent: 'bg-slate-50',
//     };
//     return map[this.color];
//   }

//   getAccentHex(): string {
//     const map: Record<CardColor, string> = {
//       indigo: '#6366f1',
//       green: '#10b981',
//       amber: '#f59e0b',
//       rose: '#f43f5e',
//       sky: '#0ea5e9',
//       purple: '#8b5cf6',
//       transparent: '#94a3b8',
//     };
//     return map[this.color];
//   }

//   getBarHeights(): number[] {
//     const v = +this.value || 0;
//     return [
//       8 + (v % 3) * 4, // 8–16px
//       10 + (v % 5) * 3, // 10–22px
//       6 + (v % 4) * 5, // 6–21px
//       12 + (v % 2) * 6, // 12–18px
//       8 + (v % 7) * 2, // 8–20px
//     ];
//   }
// }

import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html',
})
export class StatCard {
  @Input() title: string = '';
  @Input() value: string = '0';
  @Input() subtitle: string = '';
  @Input() color: 'indigo' | 'amber' | 'green' | 'rose' | 'purple' | 'sky' = 'indigo';
  @Input() lastUpdated: string = '—';
  @Input() badge: string = '';
  @Input() total: number = 0;

  theme = inject(ThemeService);

  private get dark(): boolean {
    return this.theme.isDarkMode();
  }

  // ── Card wrapper ─────────────────────────────────────────────────────────

  getCardClasses(): string {
    const base =
      'relative overflow-hidden rounded-xl p-3 cursor-pointer border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md';

    const light: Record<string, string> = {
      indigo: 'bg-indigo-50/60  border-indigo-100',
      amber: 'bg-amber-50/60   border-amber-100',
      green: 'bg-emerald-50/60 border-emerald-100',
      rose: 'bg-rose-50/60    border-rose-100',
      purple: 'bg-violet-50/60  border-violet-100',
      sky: 'bg-sky-50/60     border-sky-100',
    };

    const dark: Record<string, string> = {
      indigo: 'bg-indigo-950/30  border-indigo-500/10',
      amber: 'bg-amber-950/30   border-amber-500/10',
      green: 'bg-emerald-950/30 border-emerald-500/10',
      rose: 'bg-rose-950/30    border-rose-500/10',
      purple: 'bg-violet-950/30  border-violet-500/10',
      sky: 'bg-sky-950/30     border-sky-500/10',
    };

    const map = this.dark ? dark : light;
    return `${base} ${map[this.color] ?? map['indigo']}`;
  }

  // ── Gradient wash ─────────────────────────────────────────────────────────

  getGradientClass(): string {
    const light: Record<string, string> = {
      indigo: 'bg-gradient-to-br from-indigo-100  to-transparent',
      amber: 'bg-gradient-to-br from-amber-100   to-transparent',
      green: 'bg-gradient-to-br from-emerald-100 to-transparent',
      rose: 'bg-gradient-to-br from-rose-100    to-transparent',
      purple: 'bg-gradient-to-br from-violet-100  to-transparent',
      sky: 'bg-gradient-to-br from-sky-100     to-transparent',
    };
    const dark: Record<string, string> = {
      indigo: 'bg-gradient-to-br from-indigo-900/20 to-transparent',
      amber: 'bg-gradient-to-br from-amber-900/20  to-transparent',
      green: 'bg-gradient-to-br from-emerald-900/20 to-transparent',
      rose: 'bg-gradient-to-br from-rose-900/20   to-transparent',
      purple: 'bg-gradient-to-br from-violet-900/20 to-transparent',
      sky: 'bg-gradient-to-br from-sky-900/20    to-transparent',
    };
    const map = this.dark ? dark : light;
    return map[this.color] ?? map['indigo'];
  }

  // ── Watermark icon ────────────────────────────────────────────────────────

  getWatermarkClass(): string {
    const map: Record<string, string> = {
      indigo: 'pi-file-edit',
      amber: 'pi-clock',
      green: 'pi-check-circle',
      rose: 'pi-times-circle',
      purple: 'pi-calendar',
      sky: 'pi-verified',
    };
    return map[this.color] ?? 'pi-circle';
  }

  // ── Icon background ───────────────────────────────────────────────────────

  getIconBgClass(): string {
    const light: Record<string, string> = {
      indigo: 'bg-indigo-100  text-indigo-600',
      amber: 'bg-amber-100   text-amber-600',
      green: 'bg-emerald-100 text-emerald-600',
      rose: 'bg-rose-100    text-rose-600',
      purple: 'bg-violet-100  text-violet-600',
      sky: 'bg-sky-100     text-sky-600',
    };
    const dark: Record<string, string> = {
      indigo: 'bg-indigo-500/15  text-indigo-400',
      amber: 'bg-amber-500/15   text-amber-400',
      green: 'bg-emerald-500/15 text-emerald-400',
      rose: 'bg-rose-500/15    text-rose-400',
      purple: 'bg-violet-500/15  text-violet-400',
      sky: 'bg-sky-500/15     text-sky-400',
    };
    const map = this.dark ? dark : light;
    return map[this.color] ?? map['indigo'];
  }

  // ── Icon ──────────────────────────────────────────────────────────────────

  getIconClass(): string {
    const map: Record<string, string> = {
      indigo: 'pi-file-edit',
      amber: 'pi-clock',
      green: 'pi-check-circle',
      rose: 'pi-times-circle',
      purple: 'pi-calendar',
      sky: 'pi-verified',
    };
    return map[this.color] ?? 'pi-circle';
  }

  // ── Big number ────────────────────────────────────────────────────────────

  getValueClass(): string {
    const light: Record<string, string> = {
      indigo: 'text-indigo-700',
      amber: 'text-amber-700',
      green: 'text-emerald-700',
      rose: 'text-rose-700',
      purple: 'text-violet-700',
      sky: 'text-sky-700',
    };
    const dark: Record<string, string> = {
      indigo: 'text-indigo-300',
      amber: 'text-amber-300',
      green: 'text-emerald-300',
      rose: 'text-rose-300',
      purple: 'text-violet-300',
      sky: 'text-sky-300',
    };
    const map = this.dark ? dark : light;
    return map[this.color] ?? map['indigo'];
  }

  // ── Subtitle / amount ─────────────────────────────────────────────────────

  getAmountClass(): string {
    const light: Record<string, string> = {
      indigo: 'text-indigo-600',
      amber: 'text-amber-600',
      green: 'text-emerald-600',
      rose: 'text-rose-600',
      purple: 'text-violet-600',
      sky: 'text-sky-600',
    };
    const dark: Record<string, string> = {
      indigo: 'text-indigo-400',
      amber: 'text-amber-400',
      green: 'text-emerald-400',
      rose: 'text-rose-400',
      purple: 'text-violet-400',
      sky: 'text-sky-400',
    };
    const map = this.dark ? dark : light;
    return map[this.color] ?? map['indigo'];
  }

  // ── Pill text color ───────────────────────────────────────────────────────

  getTrendColor(): string {
    const light: Record<string, string> = {
      indigo: 'text-indigo-600',
      amber: 'text-amber-600',
      green: 'text-emerald-600',
      rose: 'text-rose-600',
      purple: 'text-violet-600',
      sky: 'text-sky-600',
    };
    const dark: Record<string, string> = {
      indigo: 'text-indigo-400',
      amber: 'text-amber-400',
      green: 'text-emerald-400',
      rose: 'text-rose-400',
      purple: 'text-violet-400',
      sky: 'text-sky-400',
    };
    const map = this.dark ? dark : light;
    return map[this.color] ?? map['indigo'];
  }

  // ── Pill background ───────────────────────────────────────────────────────

  getTrendBgClass(): string {
    const light: Record<string, string> = {
      indigo: 'bg-indigo-100/80',
      amber: 'bg-amber-100/80',
      green: 'bg-emerald-100/80',
      rose: 'bg-rose-100/80',
      purple: 'bg-violet-100/80',
      sky: 'bg-sky-100/80',
    };
    const dark: Record<string, string> = {
      indigo: 'bg-indigo-500/15',
      amber: 'bg-amber-500/15',
      green: 'bg-emerald-500/15',
      rose: 'bg-rose-500/15',
      purple: 'bg-violet-500/15',
      sky: 'bg-sky-500/15',
    };
    const map = this.dark ? dark : light;
    return map[this.color] ?? map['indigo'];
  }

  // ── Dot ───────────────────────────────────────────────────────────────────

  getDotClass(): string {
    const light: Record<string, string> = {
      indigo: 'bg-indigo-500',
      amber: 'bg-amber-500',
      green: 'bg-emerald-500',
      rose: 'bg-rose-500',
      purple: 'bg-violet-500',
      sky: 'bg-sky-500',
    };
    const dark: Record<string, string> = {
      indigo: 'bg-indigo-400',
      amber: 'bg-amber-400',
      green: 'bg-emerald-400',
      rose: 'bg-rose-400',
      purple: 'bg-violet-400',
      sky: 'bg-sky-400',
    };
    const map = this.dark ? dark : light;
    return map[this.color] ?? map['indigo'];
  }

  // ── Divider ───────────────────────────────────────────────────────────────

  getDividerClass(): string {
    const light: Record<string, string> = {
      indigo: 'border-indigo-100',
      amber: 'border-amber-100',
      green: 'border-emerald-100',
      rose: 'border-rose-100',
      purple: 'border-violet-100',
      sky: 'border-sky-100',
    };
    const dark: Record<string, string> = {
      indigo: 'border-indigo-500/10',
      amber: 'border-amber-500/10',
      green: 'border-emerald-500/10',
      rose: 'border-rose-500/10',
      purple: 'border-violet-500/10',
      sky: 'border-sky-500/10',
    };
    const map = this.dark ? dark : light;
    return map[this.color] ?? map['indigo'];
  }

  // ── Hex accent ────────────────────────────────────────────────────────────

  getAccentHex(): string {
    const map: Record<string, string> = {
      indigo: '#6366f1',
      amber: '#f59e0b',
      green: '#10b981',
      rose: '#f43f5e',
      purple: '#8b5cf6',
      sky: '#0ea5e9',
    };
    return map[this.color] ?? '#6366f1';
  }
}
