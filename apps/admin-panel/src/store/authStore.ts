import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'support';
}

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: AdminUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

function setCookie(name: string, value: string, days = 1) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => {
        setCookie('access_token', accessToken, 1);
        set({ user, accessToken, refreshToken });
      },
      setAccessToken: (token) => {
        setCookie('access_token', token, 1);
        set({ accessToken: token });
      },
      logout: () => {
        removeCookie('access_token');
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    { name: 'school-pay-admin-auth' }
  )
);
