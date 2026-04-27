import { useAuthStore } from '@/stores/authStore';

/** Convenience hook — exposes auth state and actions. */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loginSuccess = useAuthStore((s) => s.loginSuccess);
  const logout = useAuthStore((s) => s.logout);

  return { user, isAuthenticated, loginSuccess, logout };
}
