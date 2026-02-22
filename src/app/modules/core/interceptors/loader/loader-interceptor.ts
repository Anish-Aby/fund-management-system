import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../../services/loader-service';

const SKIP_LOADER_URLS = ['/assets', '/health', '/metrics'];

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  if (SKIP_LOADER_URLS.some((url) => req.url.includes(url))) {
    return next(req);
  }
  loaderService.show();
  return next(req).pipe(
    finalize(() => {
      loaderService.hide();
    }),
  );
};
