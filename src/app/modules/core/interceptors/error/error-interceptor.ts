import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../services/toast';
import { ERROR_MESSAGES } from '../../../shared/constants/const';

const extractErrorMessage = (error: HttpErrorResponse): string => {
  const body = error.error;

  if (!body) return ERROR_MESSAGES.UNKOWN_ERROR;

  // Validation error shape: { errors: { field: string[] } }
  if (body.errors && typeof body.errors === 'object') {
    const messages = Object.entries(body.errors as Record<string, string[]>).flatMap(
      ([field, msgs]) => msgs.map((msg) => `${formatFieldName(field)}: ${msg}`),
    );

    if (messages.length) return messages.join('\n');
  }

  // Standard message field
  if (body.message) return body.message;

  // RFC 9110 / ProblemDetails title fallback
  if (body.title) return body.title;

  return ERROR_MESSAGES.UNKOWN_ERROR;
};

const formatFieldName = (field: string): string =>
  field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!(error instanceof HttpErrorResponse)) {
        toastService.showError(ERROR_MESSAGES.UNKOWN_ERROR);
        return throwError(() => error);
      }

      const errorMessage = extractErrorMessage(error);

      switch (error.status) {
        case HttpStatusCode.Unauthorized:
          // authService.logout();
          return throwError(() => error);
        case HttpStatusCode.Forbidden:
        case HttpStatusCode.NotFound:
        case HttpStatusCode.BadRequest:
        case HttpStatusCode.InternalServerError:
        case HttpStatusCode.ServiceUnavailable:
        default:
          break;
      }

      toastService.showError(errorMessage);
      return throwError(() => error);
    }),
  );
};
