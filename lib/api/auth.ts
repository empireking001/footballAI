import { apiClient } from './client';
import { User } from '@/types/api';

interface AuthResponse {
  success: boolean;
  data: { user: User; accessToken: string };
  message?: string;
}

export async function login(email: string, password: string): Promise<AuthResponse['data']> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return data.data;
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}): Promise<AuthResponse['data']> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', input);
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
  return data.data.user;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, password });
}

export async function verifyEmail(token: string): Promise<User> {
  const { data } = await apiClient.post<{ success: boolean; data: { user: User } }>(
    '/auth/verify-email',
    { token },
  );
  return data.data.user;
}

export async function resendVerification(email: string): Promise<void> {
  await apiClient.post('/auth/resend-verification', { email });
}
