import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  imports: [ButtonModule, CommonModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {
  stars = Array(100).fill(0).map((_, i) => ({ id: i }));

  constructor(private router: Router) {}

  trackByStar(index: number) {
    return index;
  }

  goToDashboard() {
    this.router.navigate(['/app/dashboard']);
  }

  goToLogin() {
    this.router.navigate(['/app/login']);
  }
}