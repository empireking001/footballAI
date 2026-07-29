import { create } from 'zustand';
import { User } from '@/types/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setHydrated: (value: boolean) => void;
}

/**
 * Deliberately NOT persisted to localStorage — the access token is
 * short-lived and kept in memory only. On page load, a silent call to
 * /auth/refresh (using the httpOnly refresh cookie) rehydrates this store.
 * This keeps the token out of reach of any XSS payload that can read
 * localStorage.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  setHydrated: (value) => set({ isHydrated: value }),
}));
