// src/app/modules/core/theme.service.ts
import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  isDarkMode = signal(false);

  constructor() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode.set(savedTheme === 'dark');

    // Apply theme on initialization
    this.applyTheme();

    // Watch for theme changes
    effect(() => {
      this.applyTheme();
    });
  }

  toggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
    localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
  }

  private applyTheme() {
    const element = document.documentElement;
    if (this.isDarkMode()) {
      element.classList.add('app-dark', 'tailwind-dark');
      element.classList.remove('app-light');
    } else {
      element.classList.add('app-light');
      element.classList.remove('app-dark', 'tailwind-dark');
    }
  }
}
