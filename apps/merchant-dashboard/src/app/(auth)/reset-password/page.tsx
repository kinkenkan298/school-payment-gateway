'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { GraduationCap, AlertCircle, CheckCircle2, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tautan Tidak Valid</h2>
          <p className="text-sm text-gray-500 mt-2">
            Tautan reset password tidak valid atau sudah kadaluarsa.
            Silakan minta tautan baru.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Minta Tautan Baru
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      // Mock: simulate API call
      await new Promise((r) => setTimeout(r, 1200));
      setDone(true);
      setTimeout(() => router.replace('/login'), 3000);
    } catch {
      setError('Gagal mereset password. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Password Berhasil Direset!</h2>
          <p className="text-sm text-gray-500 mt-2">
            Password Anda telah diperbarui. Anda akan diarahkan ke halaman login dalam beberapa detik...
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Login sekarang →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password Baru
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
          Konfirmasi Password
        </label>
        <div className="relative">
          <input
            id="confirm"
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Ulangi password baru"
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirm && password !== confirm && (
          <p className="text-xs text-red-500">Password tidak cocok</p>
        )}
        {confirm && password === confirm && confirm.length >= 8 && (
          <p className="text-xs text-emerald-600">Password cocok ✓</p>
        )}
      </div>

      {/* Password strength */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => {
            const strength = password.length >= 12 ? 4 : password.length >= 10 ? 3 : password.length >= 8 ? 2 : password.length >= 4 ? 1 : 0;
            return (
              <div
                key={level}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  level <= strength
                    ? strength >= 4 ? 'bg-emerald-500' : strength >= 3 ? 'bg-blue-500' : strength >= 2 ? 'bg-amber-500' : 'bg-red-400'
                    : 'bg-gray-200'
                }`}
              />
            );
          })}
        </div>
        <p className="text-xs text-gray-400">
          {password.length === 0 ? 'Masukkan password baru' :
           password.length < 8 ? 'Terlalu pendek' :
           password.length < 10 ? 'Cukup — tambahkan karakter untuk lebih kuat' :
           password.length < 12 ? 'Kuat' : 'Sangat kuat'}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || password.length < 8 || password !== confirm}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
        ) : (
          'Reset Password'
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <p className="text-base font-bold text-white">School Pay</p>
            </div>
            <h1 className="text-xl font-bold text-white">Reset Password</h1>
            <p className="text-blue-200 text-sm mt-1">
              Buat password baru untuk akun Anda
            </p>
          </div>

          <div className="px-8 py-8">
            <Suspense fallback={<div className="text-center text-sm text-gray-400">Memuat...</div>}>
              <ResetPasswordForm />
            </Suspense>

            <div className="mt-6 flex justify-center">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali ke halaman login
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-blue-300 mt-6">
          © 2026 School Pay · Payment Gateway untuk Sekolah Indonesia
        </p>
      </div>
    </div>
  );
}
