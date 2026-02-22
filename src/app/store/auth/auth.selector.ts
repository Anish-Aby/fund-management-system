import { createSelector } from '@ngrx/store';
import { selectAuthState } from '../app.selectors';

export const selectBearerToken = createSelector(selectAuthState, (auth) => auth.bearerToken);
export const selectRefreshToken = createSelector(selectAuthState, (auth) => auth.refreshToken);
export const selectUser = createSelector(selectAuthState, (auth) => auth.user);
