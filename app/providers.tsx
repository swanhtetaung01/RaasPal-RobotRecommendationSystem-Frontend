/**
 * app/providers.tsx
 * Client-side provider tree: TanStack Query + auth hydration.
 *
 * Wrapped around the app in [locale]/layout.tsx so that both Server and
 * Client Components can consume query state and auth state.
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';

function AuthHydrator() {
  const { initFromStorage, setUser, token } = useAuthStore();
  const didHydrate = useRef(false);

  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;

    // 1. Load token from localStorage into Zustand state
    initFromStorage();
  }, [initFromStorage]);

  // 2. Once token is available, fetch the current user profile
  useEffect(() => {
    if (!token) return;

    authApi.me()
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.data);
        }
      })
      .catch(() => {
        // Token may be expired — the 401 interceptor in lib/api.ts will
        // remove it from localStorage; proxy.ts will redirect on next nav.
      });
  }, [token, setUser]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000,
          retry: 1,
        },
      },
    });
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <AuthHydrator />
      {children}
    </QueryClientProvider>
  );
}
