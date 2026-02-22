import { inject, Injectable, signal } from '@angular/core';
import { ROUTER_PATHS, SESSION_STORAGE_KEYS, TOAST_MESSAGES } from '../../shared/constants/const';
import { environment } from '../../../../environments/environment';
import { Store } from '@ngrx/store';
import { ToastService } from './toast';
import { Router } from '@angular/router';
import { selectBearerToken } from '../../../store';
import { DialogWindowService } from './dialog-window-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authSecretKey = signal(SESSION_STORAGE_KEYS.BEARER_TOKEN);
  private refreshSecretKey = signal(SESSION_STORAGE_KEYS.REFRESH_TOKEN);
  private isAuth = signal(false);

  constructor(
    private toastService: ToastService,
    private router: Router,
    private dialogWindowService: DialogWindowService,
  ) {
    const token = sessionStorage.getItem(this.authSecretKey());
    token ? this.isAuth.set(true) : this.isAuth.set(false);
  }

  public isAuthenticated(): boolean {
    return this.isAuth();
  }

  public logout(): void {
    this.removeTokens();
    this.closeAllDialogs();
    this.redirectToLogin();
    this.toastService.showInfo(TOAST_MESSAGES.LOGGED_OUT_SUCCESSFULLY);
  }

  private closeAllDialogs(): void {
    this.dialogWindowService.closeAll();
  }

  public setTokens(authToken: string, refreshToken: string): void {
    sessionStorage.setItem(this.authSecretKey(), authToken);
    sessionStorage.setItem(this.refreshSecretKey(), refreshToken);
    this.isAuth.set(true);
  }

  private removeTokens(): void {
    sessionStorage.removeItem(this.authSecretKey());
    sessionStorage.removeItem(this.refreshSecretKey());
    sessionStorage.clear();
    this.isAuth.set(false);
  }

  private redirectToLogin(): void {
    this.router.navigate([ROUTER_PATHS.LOGIN]);
  }
}
