import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-overlay">
      <div class="loader-container">
        <div class="main-animation">
          <div class="invoice-stack">
            <div class="invoice-sheet sheet-1"></div>
            <div class="invoice-sheet sheet-2"></div>
            <div class="invoice-sheet sheet-3"></div>
          </div>
          <div class="coins-container">
            <div class="coin coin-1"></div>
            <div class="coin coin-2"></div>
            <div class="coin coin-3"></div>
          </div>
        </div>
        <div class="loading-text">
          <span>Loading</span>
          <div class="dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./main-loader.component.scss']
})
export class MainLoaderComponent {}