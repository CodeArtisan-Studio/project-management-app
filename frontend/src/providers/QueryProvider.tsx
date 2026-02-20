'use client';

import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';
import { ApiError } from '@/services/api';

// ─── Retry Predicate ──────────────────────────────────────
// Never retry client errors (4xx). They are deterministic — repeating
// the same request will produce the same response.
// Exception: 408 (Request Timeout) and 429 (Too Many Requests) are
// transient and benefit from a retry.
// Server errors (5xx) and network failures are transient; allow up to 2 retries.
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    const { status } = error;
    if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
      return false;
    }
  }
  return failureCount < 2;
}

// ─── QueryClient Factory ──────────────────────────────────
// Extracted so it can be called inside useState initializer without
// capturing stale closure values.
function createQueryClient(): QueryClient {
  return new QueryClient({
    // ── Global error handlers ─────────────────────────────
    // In TanStack Query v5, per-cache callbacks are the correct place
    // for global error side-effects. defaultOptions.queries no longer
    // exposes an onError callback.
    queryCache: new QueryCache({
      onError(error, query) {
        // Surface unexpected server errors to the console.
        // 4xx errors are expected business errors handled per-component.
        // 401 is already handled by the Axios response interceptor.
        if (error instanceof ApiError && error.status >= 500) {
          console.error(
            `[QueryCache] ${String(query.queryHash)} failed with ${error.status}:`,
            error.message,
          );
        }
      },
    }),

    mutationCache: new MutationCache({
      onError(error) {
        if (error instanceof ApiError && error.status >= 500) {
          console.error(
            `[MutationCache] server error ${error.status}:`,
            error.message,
          );
        }
      },
    }),

    defaultOptions: {
      queries: {
        // Data is considered fresh for 1 minute; no background refetch in that window.
        staleTime: 60_000,
        // Inactive queries are garbage-collected after 5 minutes (TanStack v5 default
        // matches this, but being explicit documents the intent).
        gcTime: 300_000,
        // Smart retry: skip deterministic 4xx failures, allow up to 2 retries otherwise.
        retry: shouldRetry,
        // Exponential back-off capped at 30 s.
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 30_000),
        // Avoid surprise background refetches when the user switches tabs.
        refetchOnWindowFocus: false,
        // Reconnect refetch is useful — pick up changes after a network drop.
        refetchOnReconnect: true,
        // Errors are returned to components via isError / error, not thrown to
        // React error boundaries. Components own their error UI.
        throwOnError: false,
      },
      mutations: {
        // Mutations are not idempotent. Never auto-retry.
        retry: 0,
      },
    },
  });
}

// ─── Provider ─────────────────────────────────────────────
interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps): JSX.Element {
  // useState with an initializer function creates the client once per mount,
  // preventing shared QueryClient state across SSR requests / users.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
