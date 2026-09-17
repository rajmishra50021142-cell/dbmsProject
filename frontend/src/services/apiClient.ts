/**
 * Centralized API client for Normalization Lab.
 * All HTTP communication with the FastAPI backend flows through this abstraction.
 */

function getBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (!envUrl) {
    return 'http://localhost:8000/api/v1';
  }
  let clean = envUrl.replace(/\/+$/, '');
  if (!clean.endsWith('/api/v1')) {
    if (clean.endsWith('/api')) {
      clean = `${clean}/v1`;
    } else {
      clean = `${clean}/api/v1`;
    }
  }
  return clean;
}

export const API_BASE_URL = getBaseUrl();

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 35000, ...fetchOptions } = options;
  
  // Normalize path
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(fetchOptions.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(
        `API request failed with status ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out after ' + timeoutMs + 'ms', 408);
    }
    const message = error instanceof Error ? error.message : 'Network error';
    throw new ApiError(`Unable to connect to backend server at ${API_BASE_URL}: ${message}`, 0);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
};
