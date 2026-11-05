export interface User {
  username: string;
  authenticated: boolean;
}

export interface LoginResponse {
  username?: string;
  detail?: string;
}
