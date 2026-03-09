import apiClient from './client';
import type { AuthUser } from '@/store/authStore';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  schoolName: string;
  phone: string;
  schoolLevel: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

export async function login(dto: LoginDto): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/login', dto);
  return data;
}

export async function register(dto: RegisterDto): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/register', dto);
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post('/api/v1/auth/logout', { refreshToken });
}

export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post('/api/v1/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post('/api/v1/auth/reset-password', { token, password });
  return data;
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  const { data } = await apiClient.post<RefreshResponse>('/api/v1/auth/refresh-token', { refreshToken });
  return data;
}
