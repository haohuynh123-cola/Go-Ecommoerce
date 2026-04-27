/**
 * Single source of truth for the JWT.
 * - Stored in localStorage under AUTH_KEY.
 * - An in-memory copy avoids repeated localStorage reads.
 */

const AUTH_KEY = 'ecommce_auth_token';

let _token: string | null = null;

/** Hydrate in-memory copy from localStorage (call once on app boot). */
export function hydrateToken(): void {
  _token = localStorage.getItem(AUTH_KEY);
}

export function getToken(): string | null {
  return _token;
}

export function setToken(token: string): void {
  _token = token;
  localStorage.setItem(AUTH_KEY, token);
}

export function clearToken(): void {
  _token = null;
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return _token !== null && _token.length > 0;
}
