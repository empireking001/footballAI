import { apiClient } from "./client";
import { User } from "@/types/api";

// Standardized API response structure from Express backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

// Request Payload Types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
}

// ==========================================
// AUTHENTICATION API METHODS
// ==========================================

export async function login(input: LoginInput): Promise<AuthData> {
  const { data } = await apiClient.post<ApiResponse<AuthData>>(
    "/auth/login",
    input,
  );
  return data.data;
}

export async function register(input: RegisterInput): Promise<AuthData> {
  const { data } = await apiClient.post<ApiResponse<AuthData>>(
    "/auth/register",
    input,
  );
  return data.data;
}

export async function logout(): Promise<{ message?: string }> {
  const { data } = await apiClient.post<ApiResponse<null>>("/auth/logout");
  return { message: data.message };
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
  return data.data.user;
}

export async function forgotPassword(
  email: string,
): Promise<{ message?: string }> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    "/auth/forgot-password",
    { email },
  );
  return { message: data.message };
}

export async function resetPassword(
  input: ResetPasswordInput,
): Promise<{ message?: string }> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    "/auth/reset-password",
    input,
  );
  return { message: data.message };
}

export async function verifyEmail(token: string): Promise<User> {
  const { data } = await apiClient.post<ApiResponse<{ user: User }>>(
    "/auth/verify-email",
    { token },
  );
  return data.data.user;
}

export async function resendVerification(
  email: string,
): Promise<{ message?: string }> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    "/auth/resend-verification",
    { email },
  );
  return { message: data.message };
}
