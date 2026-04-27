import { create } from 'zustand';
import { setToken, clearToken } from '@/lib/auth/tokenStore';
import type { LoginResponse, MeResponse } from '@/lib/api/types';

interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;

  setUser: (user: AuthUser) => void;
  loginSuccess: (response: LoginResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  loginSuccess: (response: LoginResponse) => {
    setToken(response.token);
    set({
      user: { id: response.id, name: response.name, email: response.email },
      isAuthenticated: true,
    });
  },

  logout: () => {
    clearToken();
    set({ user: null, isAuthenticated: false });
  },
}));

/** Hydrate auth state from a /auth/me response after token recovery on boot. */
export function hydrateAuthUser(me: MeResponse): void {
  useAuthStore.getState().setUser({ id: me.id, name: me.name, email: me.email });
}
