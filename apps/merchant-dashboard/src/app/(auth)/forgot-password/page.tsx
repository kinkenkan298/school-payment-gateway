'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, AlertCircle, CheckCircle2, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { forgotPassword } from '@/lib/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Masukkan alamat email Anda.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setSent(true);
      } else {
        setError(res.message ?? 'Gagal mengirim email reset.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 404) {
        setError('Email tidak ditemukan dalam sistem kami.');
      } else if (msg) {
        setError(msg);
      } else {
        setError('Tidak dapat terhubung ke server.');
      }
    } finally {
      setLoading(false);
    }
  }

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
            <h1 className="text-xl font-bold text-white">Lupa Password</h1>
            <p className="text-blue-200 text-sm mt-1">
              Masukkan email Anda dan kami akan mengirimkan tautan reset
            </p>
          </div>

          <div className="px-8 py-8">
            {sent ? (
              /* Success state */
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <Mail className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Email Terkirim!</h2>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    Kami telah mengirimkan tautan reset password ke{' '}
                    <span className="font-medium text-gray-800">{email}</span>.
                    Periksa inbox atau folder spam Anda.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-700">
                    Tautan reset hanya berlaku selama <span className="font-medium">1 jam</span>.
                    Jika tidak menerima email, coba kirim ulang.
                  </p>
                </div>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Kirim ulang email
                </button>
              </div>
            ) : (
              /* Form state */
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Alamat Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@sekolah.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 transition-colors"
                  />
                  <p className="text-xs text-gray-400">
                    Masukkan email yang terdaftar pada akun School Pay sekolah Anda.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim...</>
                  ) : (
                    'Kirim Tautan Reset'
                  )}
                </button>
              </form>
            )}

            {/* Back to login */}
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
