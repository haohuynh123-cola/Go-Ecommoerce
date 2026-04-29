import apiClient from './client';
import type {
  ApiSuccess,
  LoginResponse,
  RegisterResponse,
  MeResponse,
  VerifyOtpResponse,
} from './types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiClient.post<ApiSuccess<LoginResponse>>('/auth/login', { email, password });
  return res.data.data;
}

/**
 * POST /auth/register — creates the user (unverified) and emails a 6-digit OTP.
 * The client must follow up with `verifyOtp(email, code)` before the account is usable.
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

/** POST /auth/verify-otp — confirms the registration OTP for the given email. */
export async function verifyOtp(email: string, code: string): Promise<VerifyOtpResponse> {
  const res = await apiClient.post<ApiSuccess<VerifyOtpResponse>>('/auth/verify-otp', {
    email,
    otp: code,
  });
  return res.data.data;
}

/** POST /auth/resend-otp — re-sends the registration OTP to the given email. */
export async function resendOtp(email: string): Promise<void> {
  await apiClient.post<ApiSuccess<null>>('/auth/resend-otp', { email });
}

export async function getMe(): Promise<MeResponse> {
  const res = await apiClient.get<ApiSuccess<MeResponse>>('/auth/me');
  return res.data.data;
}
