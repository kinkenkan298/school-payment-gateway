'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  LayoutDashboard,
  ExternalLink,
  FlaskConical,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminLogin } from '@/lib/api/auth';
import { IS_MOCK, mockAdminLoginResponse } from '@/lib/mockAuth';

const MERCHANT_URL = process.env.NEXT_PUBLIC_MERCHANT_URL ?? 'http://localhost:4000';

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email dan password wajib diisi.'); return; }

    setLoading(true);
    try {
      if (IS_MOCK) {
        await new Promise((r) => setTimeout(r, 600));
        const res = mockAdminLoginResponse(email);
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        router.replace('/dashboard');
        return;
      }

      const res = await adminLogin({ email, password });
      if (res.success) {
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        router.replace('/dashboard');
      } else {
        setError(res.message ?? 'Login gagal.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 401) setError('Email atau password salah.');
      else if (msg) setError(msg);
      else setError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Panel Switcher */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5 bg-white/5 backdrop-blur-sm p-1 gap-1">
          {/* Admin Panel — active */}
          <div className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-white py-2.5 px-3">
            <ShieldCheck className="h-4 w-4 text-slate-700 flex-shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">Admin Panel</p>
              <p className="text-xs text-gray-500 leading-none">port 5000</p>
            </div>
          </div>
          {/* Merchant Dashboard — link */}
          <a
            href={`${MERCHANT_URL}/login`}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-white/70 hover:bg-white/10 hover:text-white transition-colors group"
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold truncate flex items-center gap-1">
                Merchant Dashboard
                <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="text-xs opacity-60 leading-none">port 4000</p>
            </div>
          </a>
        </div>

        {/* Mock mode notice */}
        {IS_MOCK && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-amber-300 text-xs mb-4">
            <FlaskConical className="h-3.5 w-3.5 flex-shrink-0" />
            <span><strong>Mode Demo</strong> — masuk dengan email & password apa saja tanpa koneksi backend.</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-none">School Pay</p>
                <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Masuk ke Admin Panel</h1>
            <p className="text-slate-300 text-sm mt-1">Manajemen merchant, KYC, dan sistem pembayaran</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Alamat Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@schoolpay.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-gray-50 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:bg-gray-50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Memverifikasi...</>
                ) : (
                  'Masuk ke Admin Panel'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 School Pay · Akses terbatas untuk administrator
        </p>
      </div>
    </div>
  );
}
