import { createReducer, on } from '@ngrx/store';
import { AuthState } from './auth.state';
import { loginSuccessful } from './auth.action';

export const initialState: AuthState = {
  bearerToken: null,
  refreshToken: null,
  user: null,
};

export const authReducer = createReducer(
  initialState,
  on(loginSuccessful, (state, { bearerToken, refreshToken, user }) => ({
    ...state,
    bearerToken,
    refreshToken,
    user,
  })),
);
