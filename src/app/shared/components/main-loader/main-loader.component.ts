import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-dvh w-full flex justify-center items-center box-border">
      <div class="loader-container">
        <div class="box1"></div>
        <div class="box2"></div>
        <div class="box3"></div>
      </div>
    </div>
  `,
  styleUrls: ['./main-loader.component.scss'],
})
export class MainLoaderComponent {}
