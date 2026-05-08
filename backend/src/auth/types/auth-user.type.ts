export interface AuthUser {
  sub: string;
  email: string;
  role: string;
}

export interface GoogleUser {
  email?: string;
  name?: string;
  googleId: string;
}
