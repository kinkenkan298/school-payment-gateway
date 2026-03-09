'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { register } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

const schoolLevels = [
  { value: '', label: 'Pilih jenjang sekolah' },
  { value: 'sd', label: 'SD / MI' },
  { value: 'smp', label: 'SMP / MTs' },
  { value: 'sma', label: 'SMA / MA' },
  { value: 'smk', label: 'SMK' },
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    phone: '',
    schoolLevel: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validatePassword(pwd: string) {
    if (pwd.length < 8) return 'Minimal 8 karakter';
    if (!/[A-Z]/.test(pwd)) return 'Harus mengandung huruf kapital';
    if (!/[0-9]/.test(pwd)) return 'Harus mengandung angka';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const { name, email, password, confirmPassword, schoolName, phone, schoolLevel } = form;

    if (!name || !email || !password || !schoolName || !phone || !schoolLevel) {
      setError('Semua kolom wajib diisi.');
      return;
    }
    const pwdError = validatePassword(password);
    if (pwdError) { setError(pwdError); return; }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ name, email, password, schoolName, phone });
      if (res.success) {
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        setSuccess('Pendaftaran berhasil! Mengalihkan ke dashboard...');
        setTimeout(() => router.replace('/dashboard'), 1500);
      } else {
        setError(res.message ?? 'Pendaftaran gagal.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        setError('Email sudah terdaftar. Silakan login.');
      } else if (msg) {
        setError(msg);
      } else {
        setError('Tidak dapat terhubung ke server.');
      }
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = (() => {
    const pwd = form.password;
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Lemah', color: 'bg-red-400', width: 'w-1/4' };
    if (score === 2) return { label: 'Sedang', color: 'bg-amber-400', width: 'w-2/4' };
    if (score === 3) return { label: 'Kuat', color: 'bg-emerald-400', width: 'w-3/4' };
    return { label: 'Sangat Kuat', color: 'bg-emerald-500', width: 'w-full' };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <p className="text-base font-bold text-white">School Pay</p>
            </div>
            <h1 className="text-xl font-bold text-white">Daftarkan Sekolah Anda</h1>
            <p className="text-blue-200 text-sm mt-1">Mulai terima pembayaran digital dalam menit</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-700">{success}</p>
                </div>
              )}

              {/* Grid 2 kolom */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  label="Nama Lengkap"
                  name="name"
                  type="text"
                  placeholder="Nama kepala sekolah/admin"
                  value={form.name}
                  onChange={handleChange}
                  disabled={loading}
                />
                <FormField
                  label="No. Telepon"
                  name="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <FormField
                label="Nama Sekolah"
                name="schoolName"
                type="text"
                placeholder="SDN Contoh 01"
                value={form.schoolName}
                onChange={handleChange}
                disabled={loading}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Jenjang Sekolah</label>
                <select
                  name="schoolLevel"
                  value={form.schoolLevel}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                >
                  {schoolLevels.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <FormField
                label="Alamat Email"
                name="email"
                type="email"
                placeholder="admin@sekolah.sch.id"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
              />

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 karakter, huruf kapital, angka"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {passwordStrength && (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div className={`h-1.5 rounded-full transition-all ${passwordStrength.color} ${passwordStrength.width}`} />
                    </div>
                    <p className="text-xs text-gray-500">Kekuatan: <span className="font-medium">{passwordStrength.label}</span></p>
                  </div>
                )}
              </div>

              <FormField
                label="Konfirmasi Password"
                name="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                autoComplete="new-password"
                error={form.confirmPassword && form.password !== form.confirmPassword ? 'Password tidak cocok' : undefined}
              />

              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Mendaftarkan...</>
                ) : (
                  'Daftar Sekarang'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Masuk di sini
              </Link>
            </p>

            <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
              Dengan mendaftar, Anda menyetujui{' '}
              <span className="underline cursor-pointer">Syarat & Ketentuan</span> dan{' '}
              <span className="underline cursor-pointer">Kebijakan Privasi</span> School Pay.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-blue-300 mt-6">
          © 2026 School Pay · Payment Gateway untuk Sekolah Indonesia
        </p>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoComplete?: string;
  error?: string;
}

function FormField({ label, name, type, placeholder, value, onChange, disabled, autoComplete, error }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:bg-gray-50 transition-colors ${
          error
            ? 'border-red-400 focus:ring-red-500'
            : 'border-gray-300 focus:ring-blue-500'
        }`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
