import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { PrimeNG } from 'primeng/config';
import { LoaderService } from './modules/core/services/loader-service';
import { MainLoaderComponent } from './modules/shared/components/main-loader';
import { DialogWindowService } from './modules/core/services/dialog-window-service';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmDialog } from './modules/shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  imports: [
    ButtonModule,
    RouterOutlet,
    ToastModule,
    MainLoaderComponent,
    CommonModule,
    ConfirmDialogModule,
    ConfirmDialog,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('fund-management-sys');

  constructor(
    private primeng: PrimeNG,
    private dialogWindowService: DialogWindowService,
    public loaderService: LoaderService,
  ) {}

  ngOnInit() {
    this.primeng.ripple.set(true);
    this.dialogWindowService.restoreFromStorage();
  }
}
