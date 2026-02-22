import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export type CardColor = 'transparent' | 'indigo' | 'green' | 'amber' | 'rose' | 'sky' | 'purple';

const COLOR_ICONS: Record<CardColor, string> = {
  indigo: 'pi-inbox',
  green: 'pi-check-circle',
  amber: 'pi-clock',
  rose: 'pi-times-circle',
  sky: 'pi-send',
  purple: 'pi-calendar',
  transparent: 'pi-chart-bar',
};

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle: string = '';
  @Input() color: CardColor = 'indigo';
  @Input() percentage = 0;

  getCardClasses(): string {
    return [
      'relative bg-white rounded-xl border border-slate-200/80 px-3.5 py-3 flex flex-col h-full cursor-pointer overflow-hidden',
      'shadow-[0_1px_3px_rgba(0,0,0,0.05)]',
      'transition-all duration-200 ease-out',
      'hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.12)] hover:-translate-y-0.5',
    ].join(' ');
  }

  getGradientClass(): string {
    const map: Record<CardColor, string> = {
      indigo: 'bg-gradient-to-br from-indigo-50 via-transparent to-transparent',
      green: 'bg-gradient-to-br from-emerald-50 via-transparent to-transparent',
      amber: 'bg-gradient-to-br from-amber-50 via-transparent to-transparent',
      rose: 'bg-gradient-to-br from-rose-50 via-transparent to-transparent',
      sky: 'bg-gradient-to-br from-sky-50 via-transparent to-transparent',
      purple: 'bg-gradient-to-br from-violet-50 via-transparent to-transparent',
      transparent: 'bg-gradient-to-br from-slate-50 via-transparent to-transparent',
    };
    return map[this.color];
  }

  getAccentBarClass(): string {
    const map: Record<CardColor, string> = {
      indigo: 'bg-indigo-500',
      green: 'bg-emerald-500',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
      sky: 'bg-sky-500',
      purple: 'bg-violet-500',
      transparent: 'bg-slate-300',
    };
    return map[this.color];
  }

  getIconBgClass(): string {
    const map: Record<CardColor, string> = {
      indigo: 'bg-indigo-100',
      green: 'bg-emerald-100',
      amber: 'bg-amber-100',
      rose: 'bg-rose-100',
      sky: 'bg-sky-100',
      purple: 'bg-violet-100',
      transparent: 'bg-slate-100',
    };
    return map[this.color];
  }

  getIconClass(): string {
    const iconColors: Record<CardColor, string> = {
      indigo: 'text-indigo-600',
      green: 'text-emerald-600',
      amber: 'text-amber-600',
      rose: 'text-rose-600',
      sky: 'text-sky-600',
      purple: 'text-violet-600',
      transparent: 'text-slate-500',
    };
    return `${COLOR_ICONS[this.color]} ${iconColors[this.color]}`;
  }

  getTrendBgClass(): string {
    const map: Record<CardColor, string> = {
      indigo: 'bg-indigo-50',
      green: 'bg-emerald-50',
      amber: 'bg-amber-50',
      rose: 'bg-rose-50',
      sky: 'bg-sky-50',
      purple: 'bg-violet-50',
      transparent: 'bg-slate-50',
    };
    return map[this.color];
  }

  getTrendColor(): string {
    const map: Record<CardColor, string> = {
      indigo: 'text-indigo-500',
      green: 'text-emerald-500',
      amber: 'text-amber-500',
      rose: 'text-rose-500',
      sky: 'text-sky-500',
      purple: 'text-violet-500',
      transparent: 'text-slate-400',
    };
    return map[this.color];
  }

  getValueClass(): string {
    const map: Record<CardColor, string> = {
      indigo: 'text-indigo-600',
      green: 'text-emerald-600',
      amber: 'text-amber-600',
      rose: 'text-rose-600',
      sky: 'text-sky-600',
      purple: 'text-violet-600',
      transparent: 'text-slate-800',
    };
    return map[this.color];
  }

  getDividerClass(): string {
    const map: Record<CardColor, string> = {
      indigo: 'border-indigo-100',
      green: 'border-emerald-100',
      amber: 'border-amber-100',
      rose: 'border-rose-100',
      sky: 'border-sky-100',
      purple: 'border-violet-100',
      transparent: 'border-slate-100',
    };
    return map[this.color];
  }

  getDotClass(): string {
    const map: Record<CardColor, string> = {
      indigo: 'bg-indigo-400',
      green: 'bg-emerald-400',
      amber: 'bg-amber-400',
      rose: 'bg-rose-400',
      sky: 'bg-sky-400',
      purple: 'bg-violet-400',
      transparent: 'bg-slate-300',
    };
    return map[this.color];
  }

  getAmountClass(): string {
    const map: Record<CardColor, string> = {
      indigo: 'text-indigo-600',
      green: 'text-emerald-600',
      amber: 'text-amber-600',
      rose: 'text-rose-600',
      sky: 'text-sky-600',
      purple: 'text-violet-600',
      transparent: 'text-slate-600',
    };
    return map[this.color];
  }

  // New methods needed for enriched design
  getWatermarkClass(): string {
    const map: Record<CardColor, string> = {
      indigo: `pi-inbox text-indigo-600`,
      green: `pi-check-circle text-emerald-600`,
      amber: `pi-clock text-amber-600`,
      rose: `pi-times-circle text-rose-600`,
      sky: `pi-send text-sky-600`,
      purple: `pi-calendar text-violet-600`,
      transparent: `pi-chart-bar text-slate-600`,
    };
    return map[this.color];
  }

  getBarClass(): string {
    const map: Record<CardColor, string> = {
      indigo: 'bg-indigo-500',
      green: 'bg-emerald-500',
      amber: 'bg-amber-500',
      rose: 'bg-rose-500',
      sky: 'bg-sky-500',
      purple: 'bg-violet-500',
      transparent: 'bg-slate-400',
    };
    return map[this.color];
  }

  getChangeBgClass(): string {
    const map: Record<CardColor, string> = {
      indigo: 'bg-indigo-50',
      green: 'bg-emerald-50',
      amber: 'bg-amber-50',
      rose: 'bg-rose-50',
      sky: 'bg-sky-50',
      purple: 'bg-violet-50',
      transparent: 'bg-slate-50',
    };
    return map[this.color];
  }

  getAccentHex(): string {
    const map: Record<CardColor, string> = {
      indigo: '#6366f1',
      green: '#10b981',
      amber: '#f59e0b',
      rose: '#f43f5e',
      sky: '#0ea5e9',
      purple: '#8b5cf6',
      transparent: '#94a3b8',
    };
    return map[this.color];
  }

  getBarHeights(): number[] {
    const v = +this.value || 0;
    return [
      8 + (v % 3) * 4, // 8–16px
      10 + (v % 5) * 3, // 10–22px
      6 + (v % 4) * 5, // 6–21px
      12 + (v % 2) * 6, // 12–18px
      8 + (v % 7) * 2, // 8–20px
    ];
  }
}
