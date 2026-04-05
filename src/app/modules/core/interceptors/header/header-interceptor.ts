import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { AuthService } from '../../services/auth-service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { ROUTER_PATHS } from '../../../shared/constants/const';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const authReq = attachHeaders(req, authService);

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401(req, next, authService, router);
      }
      return throwError(() => error);
    }),
  );
};

function attachHeaders(req: HttpRequest<unknown>, authService: AuthService): HttpRequest<unknown> {
  const bearerToken = authService.getToken();

  return req.clone({
    setHeaders: {
      ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }),
      'X-TimeZone': moment.tz.guess(),
      'X-Locale': navigator.language,
    },
  });
}

function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
): Observable<HttpEvent<unknown>> {
  // ← explicit return type
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null), // ← type guard narrows to string
      take(1),
      switchMap((token) => next(attachHeadersWithToken(req, token))),
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshAccessToken().pipe(
    switchMap((newToken: string) => {
      // ← explicit param type
      isRefreshing = false;
      refreshTokenSubject.next(newToken);
      return next(attachHeadersWithToken(req, newToken));
    }),
    catchError((err) => {
      isRefreshing = false;
      if (err instanceof HttpErrorResponse && err.status === 401) {
        // Token refresh failed, logout user
        authService.logout();
        router.navigate([ROUTER_PATHS.LOGIN]);
      }
      return throwError(() => err);
    }),
  );
}

function attachHeadersWithToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
      'X-TimeZone': moment.tz.guess(),
      'X-Locale': navigator.language,
    },
  });
}
