export interface MessageResponse {
  message: string
}

export interface ApiErrorShape {
  success?: false
  message?: string | string[]
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}
