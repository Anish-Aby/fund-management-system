import { createAction, props } from '@ngrx/store';

export const loginSuccessful = createAction(
  '[Auth] Login Successful',
  props<{ bearerToken: string; refreshToken: string; user: any }>(),
);
