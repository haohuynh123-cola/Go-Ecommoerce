/**
 * Axios instance wired to the Go/Gin backend.
 *
 * IMPORTANT: The backend reads a raw JWT from the Authorization header —
 * it does NOT use the standard "Bearer <token>" scheme. The interceptor below
 * sets the header as:
 *
 *   Authorization: <jwt-token>
 *
 * Do NOT add "Bearer " prefix.
 */
import axios from 'axios';
import { getToken } from '@/lib/auth/tokenStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

// Attach raw JWT on every request when available
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = token;
  }
  return config;
});

// Normalise error shape so callers always get a string message
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const message =
      data?.message ?? data?.error ?? error.message ?? 'An unexpected error occurred.';
    const code = data?.code ?? 'unknown_error';
    const errors = data?.errors ?? {};

    const normalised = new Error(message) as Error & {
      code: string;
      fieldErrors: Record<string, string>;
      status: number;
    };
    normalised.code = code;
    normalised.fieldErrors = errors;
    normalised.status = error.response?.status ?? 0;

    return Promise.reject(normalised);
  },
);

export default apiClient;
