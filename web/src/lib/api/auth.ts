import apiClient from './client';
import type { ApiSuccess, LoginResponse, RegisterResponse, MeResponse } from './types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<ApiSuccess<LoginResponse>>('/auth/login', { email, password });
  return res.data.data;
}

/**
 * POST /auth/register — returns user info only, NO token.
 * After successful registration, redirect to /login (do NOT auto-login).
 */
export async function register(
  email: string,
  password: string,
  name: string,
): Promise<RegisterResponse> {
  const res = await apiClient.post<ApiSuccess<RegisterResponse>>('/auth/register', {
    email,
    password,
    name,
  });
  return res.data.data;
}

export async function getMe(): Promise<MeResponse> {
  const res = await apiClient.get<ApiSuccess<MeResponse>>('/auth/me');
  return res.data.data;
}
