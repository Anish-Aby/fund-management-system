export interface PanelSlide {
  id: number;
  iconId: string;
  title: string;
  sub: string;
}

export interface PanelFeature {
  icon: string;
  label: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}
