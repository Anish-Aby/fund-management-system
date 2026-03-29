import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ROUTER_PATHS, SESSION_STORAGE_KEYS, TOAST_MESSAGES } from '../../shared/constants/const';
import { environment } from '../../../../environments/environment';
import { ToastService } from './toast';
import { DialogWindowService } from './dialog-window-service';

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private authSecretKey = signal(SESSION_STORAGE_KEYS.BEARER_TOKEN);
  private refreshSecretKey = signal(SESSION_STORAGE_KEYS.REFRESH_TOKEN);
  private isAuth = signal(false);

  public readonly refreshTokenUrl = `${environment.apiUrl}/api/v1/auth/refresh-token`;

  constructor(
    private toastService: ToastService,
    private router: Router,
    private dialogWindowService: DialogWindowService,
  ) {
    const token = sessionStorage.getItem(this.authSecretKey());
    this.isAuth.set(!!token);
  }

  public isAuthenticated(): boolean {
    return this.isAuth();
  }

  public refreshAccessToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<any>(this.refreshTokenUrl, { refreshToken }).pipe(
      tap(({ data }) => {
        this.setTokens(data.token, data.refreshToken);
      }),
      map(({ data }) => data.token), // ← token is nested under data
      catchError((err) => {
        this.removeTokens();
        return throwError(() => err);
      }),
    );
  }

  public logout(): void {
    this.removeTokens();
    this.closeAllDialogs();
    this.redirectToLogin();
    this.toastService.showInfo(TOAST_MESSAGES.LOGGED_OUT_SUCCESSFULLY);
  }

  public setTokens(authToken: string, refreshToken: string): void {
    sessionStorage.setItem(this.authSecretKey(), authToken);
    sessionStorage.setItem(this.refreshSecretKey(), refreshToken);
    this.isAuth.set(true);
  }

  public getToken(): string | null {
    return sessionStorage.getItem(this.authSecretKey());
  }

  public getRefreshToken(): string | null {
    return sessionStorage.getItem(this.refreshSecretKey());
  }

  private removeTokens(): void {
    sessionStorage.clear();
    this.isAuth.set(false);
  }

  private closeAllDialogs(): void {
    this.dialogWindowService.closeAll();
  }

  private redirectToLogin(): void {
    this.router.navigate([ROUTER_PATHS.LOGIN]);
  }
}
