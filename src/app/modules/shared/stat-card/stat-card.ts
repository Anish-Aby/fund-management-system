import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

export type CardColor = 'indigo' | 'green' | 'amber' | 'rose' | 'sky' | 'purple';

@Component({
  selector: 'app-stat-card',
  imports: [CommonModule, SkeletonModule],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle: string = '';
  @Input() iconClass: string = 'pi pi-window-maximize';
  @Input() color: CardColor = 'indigo';
  @Input() colSpan: string = 'col-span-6 lg:col-span-4';
  @Input() loading: boolean = false; // Add this

  onCardClick() {
    // Handle card click
  }

  getCardClasses(): string {
    const baseClasses =
      'border h-full rounded-2xl px-4 py-3 flex flex-col justify-between cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 ease-in-out';

    const colorClasses = {
      indigo:
        'border-indigo-200 bg-indigo-100 hover:border-indigo-300 dark:border-indigo-600 dark:bg-indigo-800/60 dark:hover:border-indigo-500 dark:text-indigo-100',
      green:
        'border-green-200 bg-green-100 hover:border-green-300 dark:border-green-600 dark:bg-green-800/60 dark:hover:border-green-500 dark:text-green-100',
      amber:
        'border-amber-200 bg-amber-100 hover:border-amber-300 dark:border-amber-600 dark:bg-amber-800/60 dark:hover:border-amber-500 dark:text-amber-100',
      rose: 'border-rose-200 bg-rose-100 hover:border-rose-300 dark:border-rose-600 dark:bg-rose-800/60 dark:hover:border-rose-500 dark:text-rose-100',
      sky: 'border-sky-200 bg-sky-100 hover:border-sky-300 dark:border-sky-600 dark:bg-sky-800/60 dark:hover:border-sky-500 dark:text-sky-100',
      purple:
        'border-purple-200 bg-purple-100 hover:border-purple-300 dark:border-purple-600 dark:bg-purple-800/60 dark:hover:border-purple-500 dark:text-purple-100',
    };

    return `${this.colSpan} ${baseClasses} ${colorClasses[this.color]}`;
  }
}
