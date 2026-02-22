export interface AuthState {
  bearerToken: string | null;
  refreshToken: string | null;
  user: any | null;
}
