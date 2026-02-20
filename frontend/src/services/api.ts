import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { tokenStorage } from '@/lib/token';
import { ROUTES } from '@/constants/routes';
import {
  isApiErrorResponse,
  type ApiErrorResponse,
  type ApiSuccessResponse,
} from '@/types/api.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

// ─── Typed API Error ──────────────────────────────────────
// Wraps every AxiosError with the backend's message and HTTP status.
// All promise rejections from this module are instances of this class,
// giving call-sites a single, typed error shape to handle.
export class ApiError extends Error {
  readonly status: number;
  readonly code: 'fail' | 'error';

  constructor(cause: AxiosError<ApiErrorResponse>) {
    const serverData = cause.response?.data;
    const message = isApiErrorResponse(serverData)
      ? serverData.message
      : cause.message;

    super(message);
    this.name = 'ApiError';
    this.status = cause.response?.status ?? 0;
    this.code = isApiErrorResponse(serverData) ? serverData.status : 'error';
  }
}

// ─── Axios Instance ───────────────────────────────────────
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor ──────────────────────────────────
// Attach JWT token to every outgoing request when present.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────
// • 401 → clear auth state and hard-redirect to login.
// • All errors are converted to ApiError before rejection,
//   so every catch block in the service layer works with a
//   single typed class instead of raw AxiosError.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();
      if (typeof window !== 'undefined') {
        window.location.href = ROUTES.LOGIN;
      }
    }
    return Promise.reject(new ApiError(error));
  },
);

// ─── Typed Request Wrappers ───────────────────────────────
// Unwrap the backend response envelope `{ status, data }` automatically.
// Service methods call these instead of apiClient directly, returning the
// inner domain type with no boilerplate .data.data access.

export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.get<ApiSuccessResponse<T>>(url, config);
  return data.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.post<ApiSuccessResponse<T>>(url, body, config);
  return data.data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await apiClient.patch<ApiSuccessResponse<T>>(url, body, config);
  return data.data;
}

export async function apiDelete(
  url: string,
  config?: AxiosRequestConfig,
): Promise<void> {
  await apiClient.delete(url, config);
}
