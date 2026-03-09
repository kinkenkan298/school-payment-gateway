import type { AdminUser } from '@/store/authStore';

export const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

export interface MockAdminAuthResponse {
  success: true;
  data: {
    user: AdminUser;
    accessToken: string;
    refreshToken: string;
  };
}

export function mockAdminLoginResponse(email: string): MockAdminAuthResponse {
  return {
    success: true,
    data: {
      user: {
        id: 'mock_admin_001',
        email,
        name: 'Super Admin',
        role: 'superadmin',
      },
      accessToken: 'mock_admin_access_token_dev',
      refreshToken: 'mock_admin_refresh_token_dev',
    },
  };
}
