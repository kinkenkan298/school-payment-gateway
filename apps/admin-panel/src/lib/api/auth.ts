import apiClient from './client';
import type { AdminUser } from '@/store/authStore';

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  success: boolean;
  data: {
    user: AdminUser;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
}

export async function adminLogin(dto: AdminLoginDto): Promise<AdminAuthResponse> {
  const { data } = await apiClient.post<AdminAuthResponse>('/api/v1/admin/auth/login', dto);
  return data;
}

export async function adminLogout(refreshToken: string): Promise<void> {
  await apiClient.post('/api/v1/admin/auth/logout', { refreshToken });
}

export async function refreshAdminToken(refreshToken: string) {
  const { data } = await apiClient.post('/api/v1/admin/auth/refresh-token', { refreshToken });
  return data;
}
