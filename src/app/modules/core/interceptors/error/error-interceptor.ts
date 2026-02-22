import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../services/toast';
import { ERROR_MESSAGES } from '../../../shared/constants/const';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = ERROR_MESSAGES.UNKOWN_ERROR;
      if (!(error instanceof HttpErrorResponse)) {
        toastService.showError(errorMessage);
      }
      switch (error.status) {
        case HttpStatusCode.Unauthorized:
          const message = error.error.message;
          errorMessage = message ?? ERROR_MESSAGES.UNAUTHORIZED;
          console.log(error);
          // authService.logout();
          break;

        case HttpStatusCode.InternalServerError:
          error.error.message
            ? (errorMessage = error.error.message)
            : (errorMessage = ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
          break;

        case HttpStatusCode.NotFound:
        case HttpStatusCode.ServiceUnavailable:
        case HttpStatusCode.Forbidden:
        case HttpStatusCode.BadRequest:
        case HttpStatusCode.NotFound:
          errorMessage = error.error.message;
          break;

        default:
          errorMessage = error.error?.message ?? ERROR_MESSAGES.UNKOWN_ERROR;
      }
      toastService.showError(errorMessage);
      return throwError(() => error);
    }),
  );
};
