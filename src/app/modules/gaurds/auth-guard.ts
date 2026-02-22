import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

import { AuthService } from '../core/services/auth-service';
import { ROUTER_PATHS } from '../shared/constants/const';

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ? true : router.createUrlTree([ROUTER_PATHS.LOGIN]);
};
