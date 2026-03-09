import type { AuthUser } from '@/store/authStore';

export const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true';

export interface MockAuthResponse {
  success: true;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  };
}

export function mockLoginResponse(email: string): MockAuthResponse {
  return {
    success: true,
    data: {
      user: {
        id: 'mock_merchant_001',
        email,
        name: 'Demo Admin',
        schoolName: 'SDN Demo 01',
        role: 'merchant',
        kycStatus: 'unverified',
      },
      accessToken: 'mock_access_token_dev',
      refreshToken: 'mock_refresh_token_dev',
    },
  };
}

export function mockRegisterResponse(
  email: string,
  name: string,
  schoolName: string
): MockAuthResponse {
  return {
    success: true,
    data: {
      user: {
        id: 'mock_merchant_001',
        email,
        name,
        schoolName,
        role: 'merchant',
        kycStatus: 'unverified',
      },
      accessToken: 'mock_access_token_dev',
      refreshToken: 'mock_refresh_token_dev',
    },
  };
}
