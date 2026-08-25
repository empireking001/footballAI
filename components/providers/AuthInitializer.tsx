'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getMe } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';

/**
 * Runs once on app load to silently restore a session from the httpOnly
 * refresh cookie — the access token itself is never persisted client-side.
 * Renders nothing; it only populates `useAuthStore` before the rest of the
 * app reads from it.
 */
export function AuthInitializer() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const { data } = await apiClient.post(
          "/auth/refresh",
          {},
          { withCredentials: true },
        );
        const accessToken = data?.data?.accessToken;
        if (!accessToken || cancelled) return;

        // Temporarily set just the token so `getMe()` (which reads it via
        // the axios interceptor) can authenticate immediately.
        useAuthStore.getState().setAccessToken(accessToken);
        const user = await getMe();
        if (!cancelled) setAuth(user, accessToken);
      } catch {
        // No valid session — that's a normal logged-out state, not an error.
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [setAuth, setHydrated]);

  return null;
}
