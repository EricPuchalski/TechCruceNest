import type {
  AuthResponse,
  SignInPayload,
  SignUpPayload,
} from "../../types/auth/auth";
import type { MessageResponse } from "../../types/api/api";
import { API_BASE_URL, request, type RequestOptions } from "../api/api-client";

export const GOOGLE_AUTH_URL = `${API_BASE_URL}/auth/google`;

export function signIn(payload: SignInPayload) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signUp(payload: SignUpPayload) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCurrentUser(options?: RequestOptions) {
  return request<AuthResponse>("/auth/me", {
    method: "GET",
    signal: options?.signal,
  });
}

export function signOut() {
  return request<MessageResponse>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
