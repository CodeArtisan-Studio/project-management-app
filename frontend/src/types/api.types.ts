// ─── Mirrors backend src/types/index.ts ──────────────────

export interface ApiSuccessResponse<T = unknown> {
  status: 'success';
  message?: string;
  data: T;
}

export interface ApiErrorResponse {
  status: 'fail' | 'error';
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  meta: PaginationMeta;
}

// ─── Type Guard ───────────────────────────────────────────
// Narrows unknown response.data to the typed error shape before reading .message.
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'status' in value &&
    (value.status === 'fail' || value.status === 'error') &&
    'message' in value &&
    typeof (value as Record<string, unknown>).message === 'string'
  );
}
