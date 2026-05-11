export interface AuthUser {
  id: string
  name?: string
  email: string
  provider: 'local' | 'google'
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: AuthUser
}

export interface SignInPayload {
  email: string
  password: string
}

export interface SignUpPayload {
  name: string
  email: string
  password: string
}
