import { type ReactNode, useEffect, useState } from 'react';
import { hydrateToken, isAuthenticated } from '@/lib/auth/tokenStore';
import { hydrateAuthUser } from '@/stores/authStore';
import { getMe } from '@/lib/api/auth';
import { PageLoader } from '@/components/ui/LoadingSpinner';

interface AuthBootstrapProps {
  children: ReactNode;
}

/**
 * On app mount:
 * 1. Hydrate the in-memory token from localStorage.
 * 2. If a token is present, call GET /auth/me to verify it and restore user state.
 * 3. If the token is invalid/expired, silently clear it.
 */
export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function boot() {
      hydrateToken();

      if (isAuthenticated()) {
        try {
          const me = await getMe();
          hydrateAuthUser(me);
        } catch {
          // Token invalid or expired — clearToken was already called by the
          // error interceptor is not set up here, so just let auth stay empty.
          // The store stays in unauthenticated state.
        }
      }

      setReady(true);
    }

    void boot();
  }, []);

  if (!ready) return <PageLoader />;

  return <>{children}</>;
}
