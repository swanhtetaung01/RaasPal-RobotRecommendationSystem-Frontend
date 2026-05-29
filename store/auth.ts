/**
 * store/auth.ts
 * Zustand store for authentication state.
 *
 * - Persists JWT token in localStorage under 'raaspal_token'
 * - Exposes login(), logout(), and initFromStorage() actions
 * - Components call useAuthStore() to read user/token state
 */

'use client';

import { create } from 'zustand';
import type { UserResponse } from '@/types/api';

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;

  /** Called after successful login — stores token and user in state + localStorage */
  login: (token: string, user: UserResponse) => void;

  /** Clears all auth state and removes token from localStorage */
  logout: () => void;

  /** Reads persisted token from localStorage on app boot */
  initFromStorage: () => void;

  /** Update user after /me refresh */
  setUser: (user: UserResponse) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('raaspal_token', token);
    }
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('raaspal_token');
    }
    set({ token: null, user: null, isAuthenticated: false });
  },

  initFromStorage: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('raaspal_token');
    if (token) {
      set({ token, isAuthenticated: true });
    }
  },

  setUser: (user) => set({ user }),
}));
