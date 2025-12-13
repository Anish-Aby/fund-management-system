import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogWindowService } from '../../shared/services/dialog-window';

@Component({
  selector: 'app-taskbar',
  imports: [CommonModule],
  templateUrl: './taskbar.html',
  styleUrl: './taskbar.scss',
})
export class Taskbar {
  constructor(public dialogWindowService: DialogWindowService) {}
}
