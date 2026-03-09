import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token from localStorage
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('school-pay-admin-auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

// On 401, redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('school-pay-admin-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default apiClient;
