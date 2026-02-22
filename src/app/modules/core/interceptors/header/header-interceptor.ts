import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';

import * as moment from 'moment-timezone';
import { selectBearerToken, selectRefreshToken } from '../../../../store';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const browserLocale = navigator.language;
  const store: Store<any> = inject(Store);
  const bearerToken = store.selectSignal(selectBearerToken)();
  const refreshToken = store.selectSignal(selectRefreshToken)();
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${bearerToken}`,
      'X-TimeZone': moment.tz.guess(),
      'X-Locale': browserLocale,
    },
  });
  return next(authReq);
};
