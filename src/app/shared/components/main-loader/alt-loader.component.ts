import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alt-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alt-loader-overlay">
      <div class="spinner-container">
        <svg class="chart-icon" viewBox="0 0 60 60">
          <rect class="chart-bg" x="3" y="3" width="54" height="54" rx="4" />
          <line class="axis-x" x1="15" y1="45" x2="45" y2="45" />
          <line class="axis-y" x1="15" y1="15" x2="15" y2="45" />
          <polyline class="graph-line" points="15,40 25,35 35,30 40,32 45,28" />
        </svg>
        <div class="pulse-text">Loading...</div>
      </div>
    </div>
  `,
  styleUrls: ['./alt-loader.component.scss']
})
export class AltLoaderComponent {}