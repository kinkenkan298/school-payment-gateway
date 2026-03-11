'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  ArrowLeftRight,
  Ban,
  RotateCcw,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';
import { mockMerchants, mockAdminTransactions } from '@/lib/mockData';

function formatCurrency(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

const kycBadge = {
  verified:     { label: 'Terverifikasi', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  pending:      { label: 'Menunggu',      color: 'text-amber-700 bg-amber-50 border-amber-200',       icon: <Clock className="h-3.5 w-3.5" /> },
  under_review: { label: 'Direview',      color: 'text-blue-700 bg-blue-50 border-blue-200',          icon: <Clock className="h-3.5 w-3.5" /> },
  rejected:     { label: 'Ditolak',       color: 'text-red-700 bg-red-50 border-red-200',             icon: <XCircle className="h-3.5 w-3.5" /> },
  unverified:   { label: 'Belum KYC',     color: 'text-gray-600 bg-gray-50 border-gray-200',          icon: <AlertCircle className="h-3.5 w-3.5" /> },
} as const;

const statusBadge = {
  active:    { label: 'Aktif',     color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  suspended: { label: 'Suspended', color: 'text-red-700 bg-red-50 border-red-200' },
  pending:   { label: 'Pending',   color: 'text-amber-700 bg-amber-50 border-amber-200' },
} as const;

const txStatusColor = {
  success: 'text-emerald-700 bg-emerald-50',
  failed:  'text-red-700 bg-red-50',
  pending: 'text-amber-700 bg-amber-50',
  expired: 'text-gray-500 bg-gray-100',
} as const;

export default function MerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const merchant = mockMerchants.find((m) => m.id === id);
  if (!merchant) notFound();

  const [status, setStatus] = useState(merchant.status);
  const [showConfirm, setShowConfirm] = useState<'suspend' | 'activate' | null>(null);

  const recentTx = mockAdminTransactions.filter((t) => t.merchantName === merchant.schoolName);
  const kyc = kycBadge[merchant.kycStatus];
  const stat = statusBadge[status];

  function doSuspend() { setStatus('suspended'); setShowConfirm(null); }
  function doActivate() { setStatus('active'); setShowConfirm(null); }

  return (
    <div className="p-6 space-y-6">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/dashboard/merchants"
          className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{merchant.schoolName}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{merchant.schoolLevel} · ID: {merchant.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold', stat.color)}>
                {stat.label}
              </span>
              {status === 'active' && (
                <button
                  onClick={() => setShowConfirm('suspend')}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Ban className="h-3.5 w-3.5" /> Suspend
                </button>
              )}
              {status === 'suspended' && (
                <button
                  onClick={() => setShowConfirm('activate')}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Aktifkan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800 font-medium">
            {showConfirm === 'suspend'
              ? `Apakah Anda yakin ingin men-suspend ${merchant.schoolName}? Merchant tidak dapat melakukan transaksi.`
              : `Aktifkan kembali akun ${merchant.schoolName}?`}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={showConfirm === 'suspend' ? doSuspend : doActivate}
              className={clsx('rounded-lg px-4 py-2 text-xs font-semibold text-white transition-colors',
                showConfirm === 'suspend' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700')}
            >
              {showConfirm === 'suspend' ? 'Ya, Suspend' : 'Ya, Aktifkan'}
            </button>
            <button
              onClick={() => setShowConfirm(null)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-white transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Merchant Info */}
        <div className="space-y-5">
          {/* Contact info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Informasi Kontak</h2>
            {[
              { icon: <Mail className="h-4 w-4 text-gray-400" />, label: 'Email', value: merchant.email },
              { icon: <Phone className="h-4 w-4 text-gray-400" />, label: 'Telepon', value: merchant.phone },
              { icon: <Calendar className="h-4 w-4 text-gray-400" />, label: 'Bergabung', value: formatDate(merchant.createdAt) },
            ].map((r) => (
              <div key={r.label} className="flex items-start gap-3">
                <div className="mt-0.5">{r.icon}</div>
                <div>
                  <p className="text-xs text-gray-400">{r.label}</p>
                  <p className="text-sm text-gray-800 font-medium">{r.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* KYC status */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Status KYC</h2>
              <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', kyc.color)}>
                {kyc.icon} {kyc.label}
              </span>
            </div>
            {merchant.kycStatus === 'under_review' && (
              <Link
                href="/dashboard/kyc-review"
                className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Buka Antrian Review KYC
              </Link>
            )}
            {merchant.kycStatus === 'rejected' && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                KYC ditolak. Merchant perlu mengajukan ulang dokumen.
              </div>
            )}
            {merchant.kycStatus === 'verified' && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
                Dokumen telah terverifikasi. Merchant dapat bertransaksi.
              </div>
            )}
          </div>
        </div>

        {/* Right: Stats + Transactions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Transaksi',  value: merchant.totalTransactions.toLocaleString('id-ID'), icon: <ArrowLeftRight className="h-5 w-5 text-blue-600" />, bg: 'bg-blue-50' },
              { label: 'Total Revenue',    value: formatCurrency(merchant.totalRevenue),               icon: <TrendingUp className="h-5 w-5 text-emerald-600" />, bg: 'bg-emerald-50' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center gap-4">
                <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl shrink-0', s.bg)}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent transactions */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Transaksi Terbaru</h2>
            </div>
            {recentTx.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">Belum ada transaksi</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Siswa</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Metode</th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Nominal</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTx.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{t.studentName}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{t.method}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(t.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize', txStatusColor[t.status])}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {recentTx.length === 0 && merchant.totalTransactions > 0 && (
              <p className="text-center text-xs text-gray-400 py-3">
                Menampilkan {recentTx.length} dari {merchant.totalTransactions} transaksi
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
