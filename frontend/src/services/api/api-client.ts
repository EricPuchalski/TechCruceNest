import type { ApiErrorShape } from "../../types/api/api";

interface NestErrorShape {
  message?: string | string[];
}

function normalizeApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const fallbackBaseUrl = "http://localhost:3000/api/v1";
  const baseUrl = configuredBaseUrl || fallbackBaseUrl;
  const sanitizedBaseUrl = baseUrl.replace(/\/+$/, "");

  return sanitizedBaseUrl.endsWith("/api/v1")
    ? sanitizedBaseUrl
    : `${sanitizedBaseUrl}/api/v1`;
}

export const API_BASE_URL = normalizeApiBaseUrl();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const fallbackMessage = "No se pudo completar la solicitud.";

    try {
      const errorPayload = (await response.json()) as ApiErrorShape &
        NestErrorShape;
      const message =
        errorPayload.error?.message ??
        (Array.isArray(errorPayload.message)
          ? errorPayload.message.join(", ")
          : errorPayload.message) ??
        fallbackMessage;

      throw new ApiError(
        message,
        response.status,
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(fallbackMessage, response.status);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
